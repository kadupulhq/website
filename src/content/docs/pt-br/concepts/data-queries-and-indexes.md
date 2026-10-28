---
title: Consultas de dados e índices
description: Como uma varredura de um dispositivo se transforma em muitas fontes de dados, o que é realmente um índice e o que acontece quando um dispositivo se renumera.
banner:
  content: O Kadupul está em pré-alfa. Valide estes procedimentos em uma instalação de teste isolada. Tradução em rascunho, pendente de revisão por uma pessoa fluente no idioma.
sidebar:
  order: 5
---

Uma fonte de dados simples exige que você saiba o que está medindo antes de configurá-la.
Isso funciona para a carga média do sistema. Não funciona para portas de switches, discos,
sensores de temperatura ou máquinas virtuais, porque a lista muda e você não a controla.

Uma consulta de dados descobre os objetos disponíveis. A criação de gráficos — manual
ou por meio de automação configurada — seleciona quais objetos recebem fontes de dados;
a execução de uma consulta por si só não cria todos os gráficos possíveis.

## O que contém uma definição de consulta

Uma consulta de dados é uma descrição em XML composta por três partes: onde reside a lista de
elementos, o que ler sobre cada um deles e como decidir qual elemento corresponde a quê.

A consulta de interface fornecida com o Kadupul serve como exemplo prático. Ela percorre
`.1.3.6.1.2.1.2.2.1.1` para enumerar interfaces e, em seguida, lê um conjunto de campos nomeados
em cada posição retornada. Cada campo declara uma direção.

| Direção | Significado | Exemplos na interface |
|---|---|---|
| `input` | Lido para identificação e nomeação. Não é coletado ao longo do tempo | `ifName`, `ifDescr`, `ifAlias`, `ifType`, `ifSpeed` |
| `output` | Um valor que vale a pena coletar a cada ciclo | `ifHCInOctets`, `ifHCOutOctets` |
| `input-output` | Ambos | `ifOperStatus`, `ifAdminStatus` |

Os campos também declaram como o valor deve ser lido. A maioria assume-o literalmente; alguns
aplicam uma expressão regular para extrair um número de uma enumeração SNMP e outros solicitam
que o valor seja decodificado como texto em vez de bytes brutos.

A execução da consulta armazena uma linha por índice e por campo: o dispositivo, a consulta,
o nome do campo, o valor e a posição de onde o valor se originou. Essa tabela é a resposta para
"o que este dispositivo tem?", mantida em cache até a próxima execução. A seleção de gráficos
utiliza esse cache, mas as ferramentas de criação de gráficos também podem vincular ou executar
novamente uma consulta. Inspecione os resultados da descoberta antes de adicionar gráficos.

## O índice é um problema de identidade

A posição em uma tabela SNMP não é um nome. Trata-se de um número de slot atribuído pelo agente,
e os agentes reordenam os slots após uma reinicialização, a reinserção de uma placa, uma atualização de
firmware ou uma alteração de configuração que remova uma interface. Se uma fonte de dados apenas
se lembrar do "slot 3", o dia em que o slot 3 se tornar uma porta diferente será o dia em que três
meses de histórico se associarão silenciosamente ao objeto errado.

O Kadupul armazena o tipo de índice e o valor identificador, juntamente com o índice SNMP resolvido
atualmente. A reindexação recorre a essa identidade para buscar a posição atual na tabela;
os tipos de índice substituídos manualmente têm tratamento separado.

A cada execução da consulta, é buscado o slot atual correspondente ao valor daquele campo.

| Resultado | O que acontece |
|---|---|
| Mesmo slot | Nada a fazer |
| Slot diferente | A fonte de dados é remapeada para o novo slot e seus gráficos a acompanham |
| Valor não mais presente | O tratamento de órfãos depende da consulta e do caminho de código; verifique o sinalizador resultante e os OIDs de coleta em vez de presumir que a coleta parou |

Normalmente, a reindexação preserva a fonte de dados e seu histórico existente. A opção
`index_transient` trata as identidades ausentes como esperadas e pula a marcação comum
de órfãos. `index_orphan_removal` remove as entradas de coleta afetadas e a saída do Boost;
não exclui a fonte de dados nem o próprio arquivo RRD.

O tratamento atual de órfãos apresenta um defeito: quando uma identidade desaparece e nenhuma
outra fonte altera de índice, o branch sem alterações pode limpar novamente o sinalizador de órfão,
mantendo o índice anterior e os OIDs de coleta em vigor. Não confie na ocultação automática de órfãos
para impedir a coleta a partir de um índice de porta reutilizado. Verifique a identidade armazenada
em relação à descoberta e desative a fonte de dados afetada até a resolução.

## Escolher o campo para usar como chave

Nem todo campo funciona como uma chave viável. A definição da consulta fornece uma lista ordenada
de preferências; o Kadupul a percorre e seleciona o primeiro candidato que passar por um conjunto de verificações.

| Verificação | Por que existe |
|---|---|
| O campo é `input` ou `input-output` | Campos identificadores devem estar disponíveis na descoberta |
| Nenhum par de índices compartilha o mesmo valor | Uma chave duplicada não consegue identificar uma linha exclusiva |
| O número de valores distintos é igual ao número de índices | Rejeita uma cobertura incompleta dos candidatos |

Essas verificações possuem exceções: um candidato único declarado é retornado diretamente, e o OID
de índice bruto é aceito separadamente. `index_type=nonunique` pula a rejeição de duplicatas,
mas não dispensa a verificação de contagem de valores distintos. Inspecione o campo selecionado e
os valores em cache; o rótulo de tipo no XML não é, por si só, prova de validação.

A consulta de interface prefere `ifName`, depois `ifDescr`, seguido pelo endereço de hardware
e, por fim, o índice bruto. Essa ordem é deliberada. `ifName` é curto e estável na maioria
das plataformas. `ifDescr` é estável, mas às vezes traz o número do slot no texto, o que
anula o propósito. O índice bruto fica por último porque utilizá-lo como chave é quase o mesmo
que não ter chave alguma.

Aqui está a parte que pega as pessoas de surpresa. A escolha é feita por dispositivo e por execução,
com base nos dados atuais daquele dispositivo. Valores ausentes em cache ou nomes duplicados podem
tornar `ifName` inadequado e forçar o fallback para `ifDescr`. Um campo em branco não comprova,
por si só, qual teste falhou; inspecione as linhas reais de descoberta. Dois switches idênticos
podem acabar indexados por campos diferentes, e um dispositivo pode alternar de campo entre execuções.
O Kadupul registra um aviso quando o campo selecionado muda, pois esse é o momento em que erros de
remapeamento se tornam possíveis.

Geralmente, o campo escolhido também dá nome aos gráficos por meio de um formato de título que
o referencia. Se os títulos dos seus gráficos mudarem de padrão em sua frota, o campo de ordenação
é o lugar onde procurar.

## Detectar que uma reindexação é necessária

Executar novamente uma consulta de dados para cada dispositivo a cada ciclo seria custoso e,
em grande parte, inútil, já que a maioria dos dispositivos passa anos sem qualquer renumeração.
Em vez disso, cada par de dispositivo e consulta carrega um método de reindexação, que é uma asserção
econômica verificada durante a coleta normal. Quando a asserção falha, uma reindexação é enfileirada.

| Método | O que verifica | Limites e custo |
|---|---|---|
| Nenhum | Sem asserção automática | Novas execuções da consulta devem vir de uma ação manual ou explícita |
| Tempo de atividade | O tempo de atividade não regrediu | Exige SNMP utilizável; perde alterações sem reversão de tempo de atividade |
| Contagem de índices | A contagem atual coincide com os índices em cache | Um OID de contagem pode ser econômico; sem ele, a implementação conta o resultado de uma varredura ou script. Alterações mantendo a mesma contagem podem passar despercebidas |
| Verificar tudo | Os valores de chave conhecidos ainda coincidem em seus índices em cache | O trabalho cresce com o conjunto em cache; não garante a detecção de novos índices nem de alterações semânticas que preservem esses valores |

«Verificar tudo» checa asserções durante a coleta; não executa incondicionalmente toda a consulta
de descoberta a cada ciclo. Meça o custo em dispositivos representativos antes de um uso amplo.
O tempo de atividade é um padrão comum, mas não oferece qualquer asserção se o SNMP estiver desativado.
A definição da consulta pode fornecer sua própria fonte de tempo de atividade ou contagem.

## A reindexação é assíncrona

Uma asserção com falha não reindexa no mesmo instante. Ela escreve um comando, e uma passada
separada após o ciclo de coleta seleciona esse comando e executa a consulta novamente. Vale a pena
manter em mente os efeitos práticos.

O ciclo que detecta a alteração ainda pode utilizar o cache antigo, de modo que um valor pode
cair na série errada antes que a reindexação seja concluída. A supressão de picos associada ao
tempo de atividade substitui saídas de valor único por desconhecido quando seu sinalizador está ativo;
não é uma garantia para todas as saídas multivalor ou para qualquer alteração de índice.

Uma reindexação não será executada em um dispositivo inativo ou desativado. Um dispositivo que tenha
sido renumerado enquanto esteve inacessível ainda precisa de uma asserção ou execução explícita depois
que voltar a ficar acessível. A primeira coleta bem-sucedida não prova, por si só, que o remapeamento
foi concluído. A opção `--force` não anula as verificações de inativo/desativado.

Assim que a consulta é executada novamente, as fontes de dados movidas têm suas entradas no cache do
poller reescritas, o que de fato redireciona a coleta. Esse mecanismo é
[O cache do poller](/pt-br/concepts/the-poller-cache/), e a reexecução da consulta é uma das poucas
coisas que o mantém de forma automática.

Para o lado operacional — adicionar uma consulta a um dispositivo e interpretar os resultados —,
consulte [Monitorar um switch](/pt-br/guides/monitor-a-switch/).
