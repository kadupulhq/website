---
title: Recuperar um RRD corrompido
description: Como distinguir um arquivo round-robin danificado de um mal configurado, como inspecionar um arquivo, como dump e restore o reparam e qual histórico você pode manter quando o arquivo precisa ser reconstruído.
banner:
  content: O Kadupul está em fase pré-alfa. Valide estes procedimentos em uma instalação de testes isolada.
sidebar:
  order: 25
---

:::caution[Validar antes de usar]
O código-fonte está disponível, mas não existe uma versão ou caminho de
migração suportado para o Kadupul. Teste estes procedimentos em uma cópia isolada
com backups antes de depender deles. Consulte o [status do projeto](/pt-br/project/status/).
:::

A corrupção genuína de arquivos é rara. A maioria dos arquivos relatados como corrompidos está intacta e
discorda do banco de dados, ou não pode ser gravada pelo poller, ou parou de receber
valores por um motivo que nada tem a ver com o arquivo. Descubra em qual situação você
se encontra antes de mexer em qualquer coisa, porque o reparo de uma piora as outras.

:::danger[Preservar o original]
**Copie o arquivo antes de cada reparo nesta página.** Restaure em um candidato separado
e inspecione-o antes de substituir o arquivo ativo. Encolher um arquivo ou excluir um
descarta o histórico retido. Alterar um máximo afeta a validação futura de entradas; isso
não apaga retroativamente amostras armazenadas. Não há função de desfazer automático em um RRD.
:::

## 1. Identificar a falha

| O que você vê | Geralmente significa | Ir para |
|---|---|---|
| O gráfico desenha um erro em vez de uma imagem | O arquivo está ausente, ilegível ou o diretório não permite escrita | Passo 2 |
| O gráfico está vazio mas sem erro | Sem valores utilizáveis no intervalo selecionado, ou problema na definição do gráfico | [Solucionar problemas de dados ausentes](/pt-br/guides/troubleshoot-missing-data/) |
| O gráfico para em um momento fixo e nunca retoma | Poller, permissões ou heartbeat | Passo 3 |
| O gráfico possui dados mas o formato mudou sem alteração de configuração | O arquivo e o banco de dados discordam | Passo 4 |
| Os valores retidos são todos desconhecidos | Coleta, sincronização, limites ou configuração da fonte de dados precisam de verificação | [Solucionar problemas de dados ausentes](/pt-br/guides/troubleshoot-missing-data/) |
| O `rrdtool` se recusa a ler o arquivo | Caminho ausente, falha de acesso, formato incompatível ou dano | Passos 2 e 3, depois 5 |

O Kadupul transforma o primeiro caso em uma mensagem legível em vez de uma imagem quebrada,
distinguindo um diretório onde não consegue escrever de um arquivo onde não consegue escrever, e informando um
arquivo ausente como o poller possivelmente ainda não tendo sido executado. Essa mensagem é uma pista, não um
diagnóstico: uma exclusão, um caminho alterado ou uma restauração incompleta também podem deixá-lo ausente.

## 2. Inspecionar o arquivo

Duas visualizações estão disponíveis na página da própria fonte de dados, ambas ativadas por sessão.
A visualização de depuração imprime o comando `rrdtool create` que o Kadupul executaria para esta fonte
de dados hoje. A visualização de informações é a que importa aqui: ela lê o arquivo com
`rrdtool info`, lê a definição da fonte de dados no banco de dados e imprime
as diferenças. Onde uma diferença puder ser reconciliada sem reconstrução, ela imprime o
comando `rrdtool tune` ou `rrdtool resize` correspondente, em formato de texto para você executar
manualmente em vez de executá-lo diretamente.

A partir de um terminal, o mesmo primeiro passo:

```bash
rrdtool info /path/to/rra/42/1337.rrd
```

O cabeçalho fornece o passo, o horário da última atualização, cada nome de fonte de dados com seu tipo,
heartbeat, mínimo e máximo, e cada arquivo com sua função de consolidação, contagem de linhas
e resolução. Se este comando falhar, retenha o erro e verifique o caminho,
permissões e compatibilidade do RRDtool antes de diagnosticar corrupção. Um comando `info`
bem-sucedido lê metadados; inspecione também a saída de `fetch` e teste um dump para checar o histórico.

## 3. Verificar primeiro as causas mecânicas

| Verificação | Por que vem antes do reparo |
|---|---|
| Propriedade e modo do arquivo | Um arquivo criado pelo usuário root durante a manutenção torna-se impossível de gravar pelo poller a partir daquele momento |
| Propriedade e modo do diretório | O poller não consegue criar um arquivo substituto em um diretório no qual não pode escrever |
| Espaço livre e inodes | Um sistema de arquivos cheio produz gravações incompletas que parecem corrupção |
| Se existe um segundo processo de escrita | Atualizações concorrentes ou fora de ordem podem falhar ou invalidar um snapshot de manutenção; inspecione os logs |

Execute a manutenção com a conta que possui e atualiza o RRD, e preserve seu modo,
proprietário e grupo. Pare todos os processos de escrita antes de copiar ou substituir arquivos, incluindo
coletores remotos, tarefas agendadas e manutenção manual. Drene gravações pendentes somente após
a parada dos produtores. Comandos simples de shell não adquirem os bloqueios de armazenamento do Kadupul.
Consulte os [requisitos de armazenamento](/pt-br/reference/requirements/) e o procedimento de desativação em
[Backup e restauração](/pt-br/guides/back-up-and-restore/).

## 4. Ler o que o verificador já encontrou

O Kadupul pode verificar periodicamente fontes de dados vinculadas a gráficos em dispositivos ativados e
registrar o que encontra; isso não é um inventário de cada arquivo no disco. Fica desativado
por padrão. A interface indica onde ativá-lo: Configuration -> Settings -> Data.

| Configuração | Padrão | Efeito |
|---|---|---|
| Enable RRDfile Check | off | Nada é verificado até que seja ativado |
| Check Frequency | 4 hours | Também oferece 1 hour, 24 hours ou execução após cada ciclo boost |
| Number of RRDfile Check Processes | 1 process | Divide a lista de arquivos entre processos paralelos |
| RRDChecker Timeout | 1 hour | O processo é encerrado se ultrapassar este limite |

Os resultados acumulam-se em uma lista com o dispositivo, a fonte de dados, o identificador interno da fonte
de dados, a mensagem e a data. Você pode filtrar por tempo e pesquisar no texto, e
pode limpar a lista depois de agir sobre ela.

As mensagens que ele pode registrar e o significado de cada uma:

| Mensagem | Significado |
|---|---|
| RRDfile does not exist | O arquivo nunca foi criado, foi movido ou excluído, ou o caminho configurado mudou |
| RRDfile is not writable | O usuário do poller não consegue gravar no arquivo |
| RRDfile modify time older than hour | Nada foi gravado há pelo menos uma hora |
| Last update value in RRDfile is older than 1 hour | O carimbo de última atualização do próprio arquivo está desatualizado, o que é evidência mais forte do que a data de modificação |
| The RRDfile step does not match the Data Source Profile step | O arquivo foi criado sob um intervalo diferente |
| There are more, or less, Data Sources in the database than in the RRDfile | O modelo ganhou ou perdeu campos após a criação do arquivo |
| The Data Source '...' exists in RRDfile, but not in database | Nomeia o campo, da perspectiva do arquivo |
| Data Source name '...' exists in the Database, but not in RRDfile | Nomeia o campo que o poller está tentando gravar mas que não tem espaço no arquivo |
| The RRDfile Minimal Heart... is lower than polling interval | O verificador sinaliza heartbeat inferior ou igual ao intervalo de coleta; amostras atrasadas podem se tornar desconhecidas |
| The RRDfile minimal heartbeat... should be 'N' and is currently 'M' | O heartbeat do arquivo está abaixo do heartbeat do perfil; esta verificação não sinaliza um maior |
| Stale values for last 24 hours, or last hour | Todas as amostras lidas nessa janela eram desconhecidas |
| More than 50% (n/m) values are NaN in last 24 hours, or last hour | Falha parcial de coleta |
| No data returned, maybe corrupted Data Source | Uma consulta fetch ao arquivo não retornou absolutamente nada |

A verificação corrige o passo e o heartbeat registrados no banco de dados para corresponderem ao perfil
conforme progride, o que resolve discrepâncias entre o perfil e as linhas da fonte de dados mas não
altera o arquivo. Discrepâncias de contagem entre arquivo e banco de dados são reportadas em vez de
reparadas, porque qualquer um dos lados pode estar incorreto.

## 5. Volcar, editar, restaurar

O RRDtool consegue serializar um arquivo legível para XML e reconstruir um candidato a partir dele.
Isso pode ajudar com uma discrepância estrutural conhecida, mas não reconstrói amostras perdidas
nem garante que um arquivo danificado possa ser processado. O Kadupul também utiliza utilitários dump/restore
para alterações estruturais. O utilitário local de restauração cria um arquivo irmão temporário e
o renomeia sobre o destino após o sucesso; isso não substitui um backup.

Com os processos de escrita parados, execute isto como o proprietário do RRD. Substitua o caminho de exemplo pelo
caminho real da fonte de dados. O diretório de trabalho privado é criado junto da origem para
que o candidato fique no mesmo sistema de arquivos:

```bash
set -eu
umask 077
rrd=/path/to/rra/42/1337.rrd
work=$(mktemp -d "$(dirname "$rrd")/rrd-recovery.XXXXXX")
cp -p "$rrd" "$work/original.rrd"
rrdtool dump "$work/original.rrd" > "$work/recovery.xml"
# Edit recovery.xml only when the required correction is understood.
rrdtool restore "$work/recovery.xml" "$work/candidate.rrd"
rrdtool info "$work/candidate.rrd"
rrdtool fetch "$work/candidate.rrd" AVERAGE --start end-1h --end now
```

Escolha um intervalo de fetch e uma função de consolidação que contenham dados retidos conhecidos;
a última hora é apenas um exemplo. Compare nomes de fontes de dados de origem e candidato,
passo, arquivos, carimbo de última atualização e valores de amostras. Um ciclo dump/restore idêntico
pode alterar o layout binário, portanto compare valores em vez de exigir hashes de arquivo idênticos.

Guarde a cópia original. Apenas após a validação, restaure o modo,
proprietário e grupo necessários do candidato e renomeie-o para o caminho ativo enquanto os processos de escrita continuam parados. Verifique
se a conta do poller consegue ler e atualizar o arquivo antes de retomar a coleta. Este exemplo
para antes da instalação para evitar que um candidato legível mas incorreto seja instalado.

O XML e o candidato demandam espaço em disco adicional. Um dump com falha pode deixar
XML parcial; não o restaure. Verifique o acesso, o espaço livre e o erro relatado. Se o original
não puder ser despejado após essas verificações, restaure um backup válido comprovado. A opção
[`restore -f`](https://oss.oetiker.ch/rrdtool/doc/rrdrestore.en.html) do RRDtool permite sobrescrever
o destino; o exemplo por etapas utiliza deliberadamente um novo destino.

## 6. O que sobrevive e o que não sobrevive

| Dano | Histórico recuperável |
|---|---|
| Arquivo não gravável, mas intacto | O histórico retido sobrevive. Atualizações perdidas não são recuperadas apenas corrigindo as permissões |
| Heartbeat, mínimo ou máximo incorreto | Sim. `rrdtool tune` altera o cabeçalho sem tocar nos valores armazenados |
| Passo incorreto | Exige uma conversão explícita e validada; mudar apenas o perfil no banco de dados não converte o arquivo |
| Fonte de dados ausente no arquivo | Os campos existentes mantêm seu histórico. O novo campo começa vazio |
| Arquivo excluído ou nunca criado | Não. Uma resolução que nunca foi armazenada não pode ser reconstruída |
| Linhas reduzidas por um redimensionamento | Não. As linhas descartadas desaparecem no instante em que o comando é executado |
| Arquivo truncado, o dump falha | Não. Restaurar a partir de backup |
| Cabeçalho intacto, fim de arquivo truncado | Não presuma que um cabeçalho legível garante um dump completo; use um backup verificado se o dump falhar |

Alterar o intervalo do poller ou mover uma fonte de dados para outro perfil de retenção
não remodela automaticamente arquivos existentes. O RRDtool também disponibiliza operações
[`tune` estruturais](https://oss.oetiker.ch/rrdtool/doc/rrdtune.en.html), incluindo uma
opção de passo; valide o comportamento de conversão para sua versão instalada e esquema de
arquivos em vez de presumir uma alteração de intervalo sem perdas. Consulte
[Fontes de dados e arquivos](/pt-br/concepts/data-sources-and-rras/) e
[Gerenciar a retenção de dados](/pt-br/guides/manage-data-retention/). Aumentar um máximo com `tune`
é seguro; diminuí-lo registrará qualquer valor posterior acima do novo teto como desconhecido.

## 7. Reconstruir conservando o que pode ser mantido

O Kadupul fornece um utilitário splice que pode preencher um novo arquivo a partir de um mais antigo
legível. Trate seu resultado como um candidato: ele pode preencher lacunas e substituir zeros legítimos,
portanto não é uma cópia sem perdas do histórico medido. Execute a partir da raiz da aplicação no
coletor principal de dados, usando cópias isoladas em diretórios confiáveis com permissão de escrita.

Crie `new.rrd` com a estrutura pretendida dentro do diretório privado `$work`
do passo 5, e depois visualize a união:

```bash
php cli/splice_rrd.php --oldrrd="$work/original.rrd" \
                       --newrrd="$work/new.rrd" \
                       --finrrd="$work/merged.rrd" --dryrun
```

Ambos os arquivos de entrada já devem existir e passar nas verificações de escrita do utilitário.
O novo arquivo fornece a estrutura. Sem `--finrrd`, a saída é o caminho do novo arquivo
mais `.new`; utilize um novo caminho de saída explícito para evitar sobrescrever um
candidato anterior. `--dryrun` analisa e mescla usando XML temporário e, quando disponível,
armazenamento SQLite, mas ignora a restauração final em RRD. Isso não garante que a restauração
final terá sucesso. Remova `--dryrun` para produzir o candidato separado.
Evite `--owner` durante as pré-visualizações e execute como a conta de serviço necessária; verifique
a propriedade real da saída antes da instalação.

:::caution[A mesclagem trata zero como uma lacuna]
A união percorre o novo arquivo e, para cada posição com valor desconhecido **ou zero**, procura
o valor correspondente mais próximo no arquivo antigo e grava esse valor. Um zero genuíno no
novo arquivo é, portanto, substituído por dados antigos. Em qualquer métrica que leia legitimamente zero
por longos períodos (uma porta inativa, uma fila que esvazia, um contador em repouso), inspecione o
resultado antes de colocá-lo no local definitivo. Os valores desconhecidos do arquivo antigo também são preenchidos
com valores precedentes, de modo que a saída unida pode inventar continuidade sobre dados ausentes.
:::

Após a mesclagem, posicione o arquivo onde a fonte de dados o espera, com as permissões que o
poller precisa, e verifique se o gráfico é gerado.

## 8. Preencher lacunas e por que pensar duas vezes

| Utilitário | O que grava |
|---|---|
| `cli/batchgapfix.php` | Preenche um intervalo de datas em múltiplos dispositivos em paralelo, usando o último valor conhecido ou uma média |
| `cli/float_rrdfiles.php` | Desloca um intervalo em gráficos selecionados através do mesmo fluxo de dump e restore |

Ambos inventam medições. Nada foi coletado naqueles registros de data/hora, e depois
nada no arquivo separa os valores inventados dos reais. Use-os apenas quando
souber que a lacuna não foi uma interrupção: um poller parado para manutenção, uma janela de migração.
Nunca em nada que alimente um cálculo de capacidade ou cobrança. O mesmo cuidado se aplica a
[remover picos](/pt-br/guides/remove-spikes-from-data/).

## 9. Depuração automatizada de uma fonte de dados

Para uma fonte de dados com comportamento anômalo, o Kadupul pode executar uma verificação de depuração ao longo dos
próximos ciclos de coleta e emitir um veredito: se o arquivo existe, se ele e seu
diretório permitem escrita, qual conta o possui em relação à conta sob a qual o poller opera,
se a fonte de dados está ativa, se o arquivo corresponde à definição da fonte de dados,
se a última atualização se moveu após uma consulta e se os valores eram utilizáveis. Sua
ação de reparo é restrita. Executa as recomendações de `rrdtool tune` geradas pela
comparação e nada além disso, recusando e registrando o motivo quando a lista está vazia ou o arquivo
não permite escrita. Não recria arquivos, não adiciona fontes de dados nem altera arquivos de consolidação.

## 10. A exclusão é um perigo à parte

O Kadupul monitora arquivos de dados cuja fonte de dados não existe mais e oferece
a opção de removê-los. Também pode ser configurado para agir automaticamente quando uma fonte de dados é excluída, com dois
métodos: excluir ou mover para um diretório de arquivo.

:::danger[A exclusão é permanente]
O método de exclusão remove o arquivo do disco. Não existe lixeira e os dados
não estão no banco de dados. Se não tiver certeza absoluta de que cada arquivo listado é genuinamente órfão,
defina o método para arquivar, o que move os arquivos para uma pasta indicada por você, e limpe
essa pasta manualmente mais tarde.
:::

Um arquivo pode parecer órfão sem sê-lo. Uma fonte de dados movida para um novo caminho, uma
restauração parcialmente concluída ou um dispositivo reconstruído sob um novo id deixam arquivos para os quais
nada aponta. Compare a lista com seu próprio registro de alterações antes de prosseguir.

## Modos de falha

| Sintoma | Causa |
|---|---|
| O reparo teve êxito, mas o gráfico continua vazio | Verifique o acesso, o intervalo de tempo selecionado, a coleta de dados e a definição do gráfico |
| O `rrdtool dump` emite erro no arquivo | Verifique o caminho, acesso, armazenamento e formato antes de concluir que está danificado |
| Tune aplicado, mas nada mudou | Alterações de cabeçalho não preenchem retroativamente amostras desconhecidas históricas; valide definições de arquivo e banco de dados |
| Pequenas lacunas em toda parte após alteração de intervalo | Os arquivos ainda mantêm o passo e o heartbeat antigos |
| Arquivo mesclado possui dados antigos onde o novo lia zero | Comportamento esperado. O splice preenche zeros bem como valores desconhecidos |
| A lista do verificador cresce e nunca diminui | Os achados são registrados até serem limpos; corrigir a causa não os remove automaticamente |

Faça backup do diretório de arquivos e do banco de dados em conjunto, sob um único cronograma, e teste a
restauração. A recuperação está limitada ao que aquele backup reteve no momento da criação. Consulte
[Backup e restauração](/pt-br/guides/back-up-and-restore/).
