---
title: Consultas de dados e índices
description: Como um varrimento de um dispositivo se torna em muitas fontes de dados, o que é realmente um índice e o que acontece quando um dispositivo se renumera.
banner:
  content: O Kadupul está em pré-alfa. Valide estes procedimentos numa instalação de teste isolada. Tradução em rascunho, pendente de revisão por uma pessoa fluente no idioma.
sidebar:
  order: 5
---

Uma fonte de dados simples exige que saiba o que está a medir antes de a configurar.
Isso funciona para a carga média do sistema. Não funciona para portas de comutadores, discos,
sensores de temperatura ou máquinas virtuais, porque a lista muda e você não a controla.

Uma consulta de dados descobre os objetos disponíveis. A criação de gráficos — manual
ou através de automação configurada — seleciona quais os objetos que recebem fontes de dados;
a execução de uma consulta por si só não cria todos os gráficos possíveis.

## O que contém uma definição de consulta

Uma consulta de dados é uma descrição em XML composta por três partes: onde reside a lista de
elementos, o que ler sobre cada um deles e como decidir qual elemento corresponde a quê.

A consulta de interface incluída no Kadupul serve de exemplo prático. Percorre
`.1.3.6.1.2.1.2.2.1.1` para enumerar interfaces e, em seguida, lê um conjunto de campos nomeados
em cada posição devolvida. Cada campo declara uma direção.

| Direção | Significado | Exemplos na interface |
|---|---|---|
| `input` | Lido para identificação e atribuição de nomes. Não é recolhido ao longo do tempo | `ifName`, `ifDescr`, `ifAlias`, `ifType`, `ifSpeed` |
| `output` | Um valor que vale a pena recolher em cada ciclo | `ifHCInOctets`, `ifHCOutOctets` |
| `input-output` | Ambos | `ifOperStatus`, `ifAdminStatus` |

Os campos também declaram como o valor deve ser lido. A maioria assume-o literalmente; alguns
aplicam uma expressão regular para extrair um número de uma enumeração SNMP e outros solicitam
que o valor seja descodificado como texto em vez de bytes em bruto.

A execução da consulta armazena uma linha por índice e por campo: o dispositivo, a consulta,
o nome do campo, o valor e a posição de onde o valor proveio. Essa tabela é a resposta a
"o que possui este dispositivo?", mantida em cache até à próxima execução. A seleção de gráficos
utiliza essa cache, mas as ferramentas de criação de gráficos também podem associar ou executar
novamente uma consulta. Inspecione os resultados da descoberta antes de adicionar gráficos.

## O índice é um problema de identidade

A posição numa tabela SNMP não é um nome. Trata-se de um número de ranhura atribuído pelo agente,
e os agentes reordenam as ranhuras após um reinício, a reinserção de uma placa, uma atualização de
firmware ou uma alteração de configuração que remova uma interface. Se uma fonte de dados apenas
se lembrar da "ranhura 3", o dia em que a ranhura 3 passar a ser uma porta diferente será o dia
em que três meses de histórico se associam silenciosamente ao objeto errado.

O Kadupul guarda o tipo de índice e o valor identificativo, juntamente com o índice SNMP resolvido
atualmente. A reindexação recorre a essa identidade para procurar a posição atual na tabela;
os tipos de índice substituídos manualmente têm tratamento independente.

Em cada execução da consulta, é procurada a ranhura atual correspondente ao valor desse campo.

| Resultado | O que acontece |
|---|---|
| Mesma ranhura | Nada a fazer |
| Ranhura diferente | A fonte de dados é remapeada para a nova ranhura e os seus gráficos acompanham |
| Valor já não presente | O tratamento de órfãos depende da consulta e do caminho de código; verifique o indicador resultante e os OID de consulta em vez de assumir que a recolha parou |

Normalmente, a reindexação preserva a fonte de dados e o seu histórico existente. A opção
`index_transient` trata as identidades em falta como esperadas e ignora a marcação habitual
de órfãos. `index_orphan_removal` remove as entradas de consulta afetadas e o débito do Boost;
não elimina a fonte de dados nem o próprio ficheiro RRD.

O tratamento atual de órfãos apresenta uma limitação: quando uma identidade desaparece e nenhuma
outra fonte altera de índice, o ramo sem alterações pode repor o indicador de órfão, mantendo
o índice anterior e os OID de consulta no lugar. Não confie na ocultação automática de órfãos
para impedir a recolha a partir de um índice de porta reutilizado. Verifique a identidade guardada
face à descoberta e desative a fonte de dados afetada até resolução.

## Escolher o campo a utilizar como chave

Nem todos os campos constituem uma chave viável. A definição da consulta fornece uma lista ordenada
de preferências; o Kadupul percorre-a e seleciona o primeiro candidato que supere um conjunto de verificações.

| Verificação | Razão da sua existência |
|---|---|
| O campo é `input` ou `input-output` | Os campos identificativos têm de estar disponíveis na descoberta |
| Não existem dois índices a partilhar o mesmo valor | Uma chave duplicada não consegue identificar uma única linha |
| O número de valores distintos é igual ao número de índices | Rejeita uma cobertura incompleta dos candidatos |

Estas verificações têm exceções: um candidato único declarado é devolvido diretamente, e o OID
de índice em bruto é aceite em separado. `index_type=nonunique` ignora a rejeição de duplicados,
mas não dispensa a verificação da contagem de valores distintos. Inspecione o campo selecionado e
os valores em cache; o rótulo de tipo no XML não é, por si só, prova de validação.

A consulta de interface privilegia `ifName`, depois `ifDescr`, seguido do endereço de hardware
e, por fim, o índice em bruto. Esta ordenação é deliberada. `ifName` é curto e estável na maioria
das plataformas. `ifDescr` é estável, mas inclui por vezes o número da ranhura no texto, o que
contraria o objetivo. O índice em bruto fica no fim porque utilizá-lo como chave é quase o mesmo
que não ter qualquer chave.

Eis o ponto que surpreende muitos utilizadores. A escolha é feita por dispositivo e por execução,
com base nos dados atuais desse dispositivo. A ausência de valores em cache ou a duplicação de nomes
podem inviabilizar `ifName` e provocar o recurso a `ifDescr`. Um campo em branco não demonstra,
por si só, qual das verificações falhou; inspecione as linhas reais da descoberta. Dois comutadores
idênticos podem acabar indexados por campos diferentes, e um mesmo dispositivo pode alternar de campo
entre execuções. O Kadupul regista um aviso quando o campo selecionado é alterado, pois esse é o
momento em que erros de remapeamento se tornam possíveis.

Geralmente, o campo selecionado também dá nome aos gráficos através de um formato de título que
o referencia. Se os títulos dos seus gráficos mudarem de padrão no seu parque, o campo de ordenação
é o primeiro ponto a analisar.

## Detetar que uma reindexação é necessária

Executar novamente uma consulta de dados em cada dispositivo e em cada ciclo seria dispendioso e,
na sua maioria, inútil, visto que a maioria dos dispositivos passa anos sem qualquer renumeração.
Em alternativa, cada par de dispositivo e consulta inclui um método de reindexação, que consiste numa
asserção económica verificada durante a recolha normal. Quando a asserção falha, é enfileirada uma reindexação.

| Método | O que verifica | Limites e custo |
|---|---|---|
| Nenhum | Sem asserção automática | Novas execuções da consulta têm de surgir de uma ação manual ou explícita |
| Tempo de atividade | O tempo de atividade não regrediu | Exige SNMP operacional; não deteta alterações sem reversão do tempo de atividade |
| Contagem de índices | A contagem atual coincide com os índices em cache | Um OID de contagem pode ser económico; sem ele, a implementação conta o resultado de um varrimento ou script. Alterações que mantenham a mesma contagem podem passar despercebidas |
| Verificar tudo | Os valores de chave conhecidos continuam a coincidir nos seus índices em cache | O trabalho aumenta com o conjunto em cache; não garante a deteção de novos índices nem de alterações semânticas que preservem esses valores |

«Verificar tudo» avalia asserções durante a consulta; não executa incondicionalmente toda a consulta
de descoberta em cada ciclo. Avalie o respetivo custo em dispositivos representativos antes de uma
adoção alargada. O tempo de atividade é uma predefinição frequente, mas não oferece qualquer asserção
quando o SNMP se encontra desativado. A definição da consulta pode fornecer a sua própria fonte de
tempo de atividade ou contagem.

## A reindexação é assíncrona

Uma asserção com falha não reindexa no imediato. Escreve um comando e uma passagem separada após
o ciclo de recolha recolhe esse comando e volta a executar a consulta. Convém ter presentes os
efeitos práticos.

O ciclo que deteta a alteração pode continuar a utilizar a cache antiga, pelo que um valor pode
assentar na série errada antes de a reindexação terminar. A supressão de picos associada ao tempo de
atividade substitui saídas de valor único por desconhecido quando o respetivo indicador está ativo;
não constitui uma garantia para todas as saídas multivalor ou para qualquer alteração de índice.

A reindexação não é executada num dispositivo inativo ou desativado. Um dispositivo que tenha sido
renumerado enquanto esteve inacessível ainda necessita de uma asserção ou execução explícita assim
que voltar a ficar contactável. O primeiro ciclo de recolha bem-sucedido não comprova, por si só,
que o remapeamento esteja concluído. A opção `--force` não ignora as verificações de estado inativo/desativado.

Após a reexecução da consulta, as fontes de dados deslocadas têm as suas entradas da cache do poller
reescritas, o que redireciona efetivamente a recolha. Esse mecanismo é
[A cache do poller](/pt-pt/concepts/the-poller-cache/), e a reexecução da consulta é uma das poucas
operações que o atualiza de forma automática.

Para a vertente operacional — adicionar uma consulta a um dispositivo e interpretar os resultados —,
consulte [Monitorizar um comutador](/pt-pt/guides/monitor-a-switch/).
