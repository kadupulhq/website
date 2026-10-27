---
title: A cache do sondador
description: Porque é que o recolhedor lê uma lista de trabalho pré-calculada em vez da sua configuração, e porque é essa a razão habitual para uma alteração parecer não fazer nada.
banner:
  content: O Kadupul está em fase pré-alfa. Valide estes procedimentos numa instalação de teste isolada.
sidebar:
  order: 6
---

[Arquitetura](/pt-pt/concepts/architecture/) apresenta a cache do sondador numa frase:
a lista de trabalho é pré-calculada e o recolhedor lê essa lista em vez de avaliar a
sua configuração a cada ciclo. Esta página aborda o que essa decisão implica realmente
na prática.

## O que o recolhedor teria de fazer de outro modo

Determinar o que recolher para um único valor exige resolver uma cadeia completa de
dependências. A fonte de dados aponta para um dispositivo e para um modelo de dados. O
modelo aponta para uma entrada de dados. A entrada de dados possui campos, alguns dos
quais substituídos por dispositivo e outros herdados do modelo. Se a fonte de dados tiver
origem numa consulta de dados, o índice atual deve ser resolvido através da cache de
consultas. De seguida, as credenciais SNMP têm de ser obtidas do dispositivo, a menos
que um campo as substitua.

Isto representa várias junções (joins) para um único valor. Uma instalação modesta
possui dezenas de milhares de valores e executa um ciclo a cada cinco minutos. Realizar
esta resolução no momento da recolha significaria que a base de dados, e não a rede,
decidiria quantos dispositivos conseguiria monitorizar.

Assim, a resolução ocorre apenas uma vez, quando algo muda, e o resultado é gravado
de forma linear.

## O que a cache armazena

A cache pré-calcula as instruções de recolha. Reduz a resolução repetida da configuração,
mas não elimina junções nem a leitura do estado em tempo real dos dispositivos.

| Presente na linha | Razão da sua presença |
|---|---|
| Qual o recolhedor proprietário | Cada recolhedor seleciona unicamente as suas próprias linhas |
| A ação: SNMP, script ou servidor de scripts | Decide qual o caminho de código executado |
| Nome do anfitrião, versão SNMP, porta, tempo limite, comunidade ou credenciais | Campos de ligação em cache; o estado real do anfitrião também é lido |
| O OID ou a linha de comandos completa do script | Já substituídos, prontos para execução |
| O caminho para o ficheiro RRD | Já resolvido |
| O nome do campo nesse ficheiro e quantos campos compõem uma leitura completa | Permite comparar e validar a saída |
| O passo (step) e uma contagem decrescente para a próxima execução deste item | Consulte [Tempo e intervalos](/pt-pt/concepts/time-and-intervals/) |

`cmd.php` junta `poller_item` a `host`, filtra dispositivos desativados e utiliza
os campos do dispositivo em tempo real para verificações de disponibilidade e
reindexação. Os OIDs, comandos e metadados RRD em cache ainda precisam de corresponder
à fonte de dados pretendida.

As credenciais em cache são um instantâneo, mas guardar credenciais alteradas através
da API do dispositivo normalmente atualiza a cache afetada. Edições diretas na base
de dados contornam esse caminho e podem deixar um instantâneo desatualizado. Verifique
a cache real em vez de presumir que cada alteração de credenciais exige uma reconstrução
manual.

O caminho RRD também é um instantâneo. Mover ficheiros ou alterar a localização dos
ficheiros faz com que cada linha em cache continue a apontar para a localização antiga.

## O que a escreve

A cache é mantida de forma incremental pelas operações que sabem que alteraram algo.

| Operação | Linhas reescritas |
|---|---|
| Guardar um dispositivo | Alterações aos campos de ligação, ao recolhedor ou ao estado desativado acionam uma propagação; campos de recolha inalterados podem usar o caminho de gravação rápida |
| Guardar uma fonte de dados | As linhas dessa fonte de dados |
| Criar gráficos e fontes de dados a partir de um modelo | As linhas recém-criadas |
| Uma execução de consulta de dados que moveu ou resolveu um índice | Apenas as fontes de dados que mudaram |
| Reconstrução via CLI | Dispositivos ativados processados pelos workers; o defeito atual no reencaminhamento de `--host-id` impede depender do isolamento do dispositivo |

Reescrever não é uma inserção cega. As linhas das fontes de dados que estão a ser
reconstruídas são primeiro marcadas como ausentes, depois é gravado o novo conjunto
e tudo o que ainda estiver marcado como ausente é eliminado. É isso que remove linhas
para um campo que já não existe. A limpeza do buffer é delimitada pelos identificadores
do recolhedor e da fonte de dados. Isso protege fontes não relacionadas no caminho
direcionado habitual; não constitui uma garantia em caso de reconstruções simultâneas
ou gravações com falha na base de dados. Verifique as linhas resultantes após uma
reconstrução, incluindo um dispositivo próximo não afetado ao investigar o âmbito.

## Linhas que nunca são escritas

Algumas configurações não produzem nenhuma linha nova na cache. Verifique os registos
assim como o gráfico.

O construtor ignora dispositivos desativados, mas a ação em massa **Desativar** preserva
as linhas existentes da cache e a recolha filtra e exclui o dispositivo. Uma reconstrução
enquanto desativado pode remover linhas. A ação em massa **Ativar** reutiliza uma cache
preenchida ou inicializa-a quando vazia; normalmente não é necessária uma gravação
adicional do dispositivo. Uma cache parcial ou desatualizada existente ainda exige
investigação.

Um item SNMP cujo dispositivo não possui uma configuração SNMP utilizável não produz
nenhuma linha. A ausência de versão, uma versão fora do intervalo ou uma comunidade
vazia na versão 1 ou 2 faz com que a linha seja ignorada em vez de ser gravada como
uma linha que falharia em cada ciclo.

Quando uma lista branca de entrada está configurada, um ficheiro em falta ou uma entrada
rejeitada impede novas linhas para essa entrada. Uma reconstrução confirmada continua a
limpar as suas linhas obsoletas. Sem uma configuração de `input_whitelist`, esta verificação
permite entradas; não é uma proteção ativada permanentemente. Reveja o comando rejeitado
e a política configurada antes de alterar a lista branca.

A interface ainda pode mostrar uma fonte de dados cuja cache esteja vazia. O seu gráfico
pode reter o histórico antigo ou mostrar lacunas; uma linha plana em zero não é um
indicador fiável. Credenciais em falta e entradas rejeitadas são condições de configuração
a resolver.

## Porque é que uma alteração pode parecer não fazer nada

Três mecanismos distintos produzem o mesmo sintoma.

**A linha não foi reconstruída.** Alterou algo que a interface não considera que afete
a recolha, ou alterou-o fora da interface. A cache continua a guardar a resposta antiga.
Uma reconstrução pode atualizar os campos em cache após a verificação da configuração
pretendida.

**A linha nunca foi construída.** Abordado acima. Uma reconstrução também resolve isto,
mas apenas depois de corrigida a condição subjacente; os diagnósticos surgem frequentemente
nos registos e não no gráfico.

**O valor é recolhido e depois descartado.** As saídas com múltiplos valores são mapeadas
através das definições de campos do modelo, e os campos não referenciados podem ser
ignorados durante a análise. Verifique os nomes de campo esperados, os mapeamentos e as
associações aos gráficos; esta regra não descarta indiscriminadamente todas as amostras
numéricas sem referência a gráficos. Uma reconstrução da cache não consegue reparar um
contrato de saída incorreto.

## O instrumento contundente

Para um único dispositivo, utilize **Repovoar a cache do sondador** na respetiva página
de dispositivo clássica. Essa ação invoca o caminho `push_out_host()` com âmbito no
dispositivo. Verifique depois as linhas resultantes e os diagnósticos.

O script principal atual `rebuild_poller_cache.php` aceita `--host-id`, mas não reencaminha
esse filtro para o comando do worker. Uma suposta reconstrução via CLI para um único
dispositivo pode, portanto, reconstruir outros dispositivos ativados. Não confie nessa
opção para isolamento até que este defeito da aplicação seja corrigido.

Uma reconstrução abrangente via CLI está disponível a partir da raiz da aplicação,
executada com o utilizador do sondador:

```bash
php cli/rebuild_poller_cache.php
```

Processa dispositivos ativados; não é uma reparação para todas as fontes sem anfitrião
ou desativadas. Esta operação escreve em tabelas de recolha e pode demorar algum tempo.
Evite reconstruções sobrepostas e não interrompa o processo. A opção `--force` da CLI
anula a proteção de registo de processos, pelo que não é uma opção de reparação de rotina.

A reconstrução atualiza o estado derivado; não repara a acessibilidade dos dispositivos,
não move ficheiros RRD, não corrige comandos de entrada rejeitados nem recupera histórico
perdido. Inspecione a cache resultante, os registos e a recolha subsequente antes de
considerar a reparação concluída.

O Kadupul regista quando a cache foi alterada pela última vez, o que permite que outras
partes do sistema percebam que precisam de a reler.

## Múltiplos recolhedores

Havendo mais do que um recolhedor, cada linha pertence exatamente a um deles, e as
linhas são enviadas tanto para a base de dados própria desse recolhedor como para a
central.

Se um recolhedor remoto estiver inacessível quando guarda uma alteração, a alteração
é aplicada centralmente e não remotamente, e o Kadupul indica isso mesmo: solicita uma
sincronização completa assim que o recolhedor regressar. Até essa sincronização, o
recolhedor remoto executa uma lista de trabalho mais antiga do que a que a interface
está a mostrar. Uma discrepância específica de um recolhedor é motivo para inspecionar
o estado da replicação, a conectividade e a cache local de cada recolhedor.

A ordem num ciclo completo, incluindo onde a cache é lida e quando os comandos de
reindexação são processados, encontra-se em
[Ciclo de vida do sondador](/pt-pt/reference/poller-lifecycle/). Para o dimensionamento
de recolhedores, consulte [Dimensionar o sondador](/pt-pt/guides/scale-the-poller/).
