---
title: O cache do poller
description: Por que o coletor lê uma lista de trabalho pré-computada em vez da sua configuração, e por que essa é a razão habitual para uma alteração parecer não fazer nada.
banner:
  content: O Kadupul está em pré-alfa. Valide estes procedimentos em uma instalação de teste isolada.
sidebar:
  order: 6
---

[Arquitetura](/pt-br/concepts/architecture/) apresenta o cache do poller em uma frase:
a lista de trabalho é pré-computada e o coletor lê essa lista em vez de reavaliar a
sua configuração a cada ciclo. Esta página aborda o que essa decisão realmente custa
na prática.

## O que o coletor teria que fazer de outro modo

Determinar o que coletar para um único valor exige resolver uma cadeia completa de
dependências. A fonte de dados aponta para um dispositivo e um modelo de dados. O
modelo aponta para uma entrada de dados. A entrada de dados tem campos, alguns dos
quais substituídos por dispositivo e outros herdados do modelo. Se a fonte de dados
veio de uma consulta de dados, o índice atual deve ser resolvido através do cache de
consultas. Em seguida, as credenciais SNMP precisam ser obtidas do dispositivo, a
menos que um campo as substitua.

Isso representa várias junções (joins) para um único valor. Uma instalação modesta
tem dezenas de milhares de valores e executa um ciclo a cada cinco minutos. Fazer
essa resolução no momento da coleta significaria que o banco de dados, e não a rede,
decidiria quantos dispositivos você pode monitorar.

Portanto, a resolução acontece apenas uma vez, quando algo muda, e o resultado é
gravado de forma linear.

## O que o cache armazena

O cache pré-computa as instruções de coleta. Ele reduz a resolução repetida da
configuração, mas não elimina junções nem a leitura do estado ao vivo dos dispositivos.

| Presente na linha | Por que está ali |
|---|---|
| Qual coletor é o proprietário | Cada coletor seleciona apenas suas próprias linhas |
| A ação: SNMP, script ou servidor de scripts | Decide qual caminho de código é executado |
| Nome do host, versão SNMP, porta, tempo limite, comunidade ou credenciais | Campos de conexão em cache; o estado real do host também é lido |
| O OID ou a linha de comando completa do script | Já substituídos, prontos para execução |
| O caminho para o arquivo RRD | Já resolvido |
| O nome do campo nesse arquivo e quantos campos compõem uma leitura completa | Permite associar e validar a saída |
| O passo (step) e uma contagem regressiva para a próxima execução deste item | Consulte [Tempo e intervalos](/pt-br/concepts/time-and-intervals/) |

`cmd.php` junta `poller_item` a `host`, filtra dispositivos desativados e usa os
campos do dispositivo ao vivo para verificações de disponibilidade e reindexação.
Os OIDs, comandos e metadados RRD em cache ainda precisam corresponder à fonte de
dados pretendida.

As credenciais em cache são um snapshot, mas salvar credenciais alteradas pela API
do dispositivo normalmente atualiza o cache afetado. Edições diretas no banco de
dados ignoram esse caminho e podem deixar um snapshot desatualizado. Verifique o
cache real em vez de presumir que cada alteração de credenciais exige uma reconstrução
manual.

O caminho RRD também é um snapshot. Mover arquivos ou mudar onde os arquivos ficam
deixa cada linha em cache apontando para o local antigo.

## O que o escreve

O cache é mantido de forma incremental pelas operações que sabem que alteraram algo.

| Operação | Linhas reescritas |
|---|---|
| Salvar um dispositivo | Alterações nos campos de conexão, no coletor ou no estado desativado acionam uma propagação; campos de coleta inalterados podem usar o caminho de salvamento rápido |
| Salvar uma fonte de dados | As linhas dessa fonte de dados |
| Criar gráficos e fontes de dados a partir de um modelo | As linhas recém-criadas |
| Uma execução de consulta de dados que moveu ou resolveu um índice | Apenas as fontes de dados que mudaram |
| Reconstrução via CLI | Dispositivos ativados processados pelos workers; o defeito atual no encaminhamento de `--host-id` impede depender do isolamento do dispositivo |

Reescrever não é uma inserção cega. As linhas das fontes de dados que estão sendo
reconstruídas são primeiro marcadas como ausentes, depois o novo conjunto é gravado
e tudo o que ainda estiver marcado como ausente é excluído. É isso que remove linhas
para um campo que não existe mais. A limpeza do buffer é delimitada pelos IDs do
coletor e da fonte de dados. Isso protege fontes não relacionadas no caminho
direcionado comum; não é uma garantia contra reconstruções simultâneas ou gravações
com falha no banco de dados. Verifique as linhas resultantes após uma reconstrução,
incluindo um dispositivo próximo não afetado ao investigar o escopo.

## Linhas que nunca são escritas

Algumas configurações não produzem nenhuma linha nova no cache. Verifique os logs
assim como o gráfico.

O construtor pula dispositivos desativados, mas a ação em massa **Desativar** preserva
as linhas existentes do cache e a coleta filtra o dispositivo. Uma reconstrução
enquanto desativado pode remover linhas. A ação em massa **Ativar** reutiliza um
cache preenchido ou o inicializa quando vazio; normalmente um salvamento adicional
do dispositivo não é necessário. Um cache parcial ou desatualizado existente ainda
exige investigação.

Um item SNMP cujo dispositivo não possui uma configuração SNMP utilizável não produz
nenhuma linha. Sem versão, com uma versão fora do intervalo ou com uma comunidade
vazia na versão 1 ou 2, a linha é ignorada em vez de ser gravada como uma linha que
falharia a cada ciclo.

Quando uma lista de permissões de entrada é configurada, um arquivo ausente ou uma
entrada rejeitada impede novas linhas para essa entrada. Uma reconstrução confirmada
continua limpando suas linhas obsoletas. Sem uma configuração de `input_whitelist`,
essa verificação permite entradas; não é uma proteção ativada permanentemente.
Revise o comando rejeitado e a política configurada antes de alterar a lista de permissões.

A interface ainda pode mostrar uma fonte de dados cujo cache esteja vazio. Seu gráfico
pode reter o histórico antigo ou mostrar lacunas; uma linha plana em zero não é um
indicador confiável. Credenciais ausentes e entradas rejeitadas são condições de
configuração a resolver.

## Por que uma alteração pode parecer não fazer nada

Três mecanismos distintos produzem o mesmo sintoma.

**A linha não foi reconstruída.** Você alterou algo que a interface não considera
que afete a coleta, ou alterou fora da interface. O cache continua mantendo a
resposta antiga. Uma reconstrução pode atualizar os campos em cache após a verificação
da configuração pretendida.

**A linha nunca foi construída.** Abordado acima. Uma reconstrução também resolve isso,
mas apenas depois que a condição subjacente for corrigida; diagnósticos costumam
aparecer nos logs e não no gráfico.

**O valor é coletado e depois descartado.** As saídas com múltiplos valores são
mapeadas pelas definições de campos do modelo, e campos não referenciados podem ser
ignorados durante a análise. Verifique os nomes de campo esperados, mapeamentos e
associações aos gráficos; essa regra não descarta indiscriminadamente todas as amostras
numéricas sem referência a gráficos. Uma reconstrução do cache não repara um contrato
de saída incorreto.

## O instrumento brusco

Para um único dispositivo, use **Repovoar o cache do poller** na sua página de
dispositivo clássica. Essa ação invoca o caminho `push_out_host()` delimitado ao
dispositivo. Verifique depois as linhas resultantes e os diagnósticos.

O script pai atual `rebuild_poller_cache.php` aceita `--host-id`, mas não encaminha
esse filtro para o comando do worker. Uma suposta reconstrução via CLI para um único
dispositivo pode, portanto, reconstruir outros dispositivos ativados. Não confie nessa
opção para isolamento até que esse defeito da aplicação seja corrigido.

Uma reconstrução ampla via CLI está disponível a partir da raiz da aplicação,
executada como o usuário do poller:

```bash
php cli/rebuild_poller_cache.php
```

Ela processa dispositivos ativados; não é uma reparação para todas as fontes sem host
ou desativadas. Essa operação grava em tabelas de coleta e pode levar tempo. Evite
reconstruções sobrepostas e não interrompa o processo. A opção `--force` da CLI anula
a proteção de registro de processos, por isso não é uma opção de reparo de rotina.

A reconstrução atualiza o estado derivado; não repara a acessibilidade dos dispositivos,
não move arquivos RRD, não corrige comandos de entrada rejeitados nem recupera o histórico
perdido. Inspecione o cache resultante, os logs e a coleta subsequente antes de
considerar o reparo concluído.

O Kadupul registra quando o cache foi alterado pela última vez, o que permite que outras
partes do sistema percebam que precisam relê-lo.

## Múltiplos coletores

Havendo mais de um coletor, cada linha pertence a exatamente um deles, e as linhas
são enviadas tanto para o banco de dados próprio desse coletor quanto para o central.

Se um coletor remoto estiver inacessível quando você salva uma alteração, a alteração
ocorre centralmente e não remotamente, e o Kadupul indica isso: solicita uma sincronização
completa assim que o coletor retornar. Até essa sincronização, o coletor remoto executa
uma lista de trabalho mais antiga do que a que a interface está mostrando. Uma discrepância
específica de um coletor é motivo para inspecionar o status da replicação, a conectividade
e o cache local de cada coletor.

A ordem em um ciclo completo, incluindo onde o cache é lido e quando os comandos de
reindexação são esgotados, está descrita em
[Ciclo de vida do poller](/pt-br/reference/poller-lifecycle/). Para escalonamento de
coletores, consulte [Escalar o poller](/pt-br/guides/scale-the-poller/).
