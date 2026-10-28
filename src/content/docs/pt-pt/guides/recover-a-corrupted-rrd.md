---
title: Recuperar um RRD corrompido
description: Como distinguir um registo round-robin danificado de um mal configurado, como inspecionar um ficheiro, como dump e restore o reparam e que histórico pode manter quando o ficheiro tem de ser reconstruído.
banner:
  content: O Kadupul está em fase pré-alfa. Valide estes procedimentos numa instalação de testes isolada.
sidebar:
  order: 25
---

:::caution[Validar antes de utilizar]
O código-fonte está disponível, mas não existe uma versão ou caminho de
migração suportado para o Kadupul. Teste estes procedimentos numa cópia isolada
com cópias de segurança antes de depender deles. Consulte o [estado do projeto](/pt-pt/project/status/).
:::

A verdadeira corrupção de ficheiros é rara. A maioria dos ficheiros reportados como corrompidos está intacta e
discorda da base de dados, ou não pode ser gravada pelo poller, ou deixou de receber
valores por um motivo que nada tem a ver com o ficheiro. Descubra qual destes casos
tem em mãos antes de tocar em algo, porque a reparação de um agrava os outros.

:::danger[Preservar o original]
**Copie o ficheiro antes de cada reparação nesta página.** Restaure para um candidato separado
e inspecione-o antes de substituir o ficheiro ativo. Encolher uma consolidação ou eliminar uma
descarta o histórico retido. Alterar um máximo afeta a validação posterior de entradas; não
apaga retroativamente amostras armazenadas. Não existe uma função de anulação automática num RRD.
:::

## 1. Identificar a falha

| O que vê | Geralmente significa | Ir para |
|---|---|---|
| O gráfico desenha um erro em vez de uma imagem | O ficheiro está em falta, ilegível ou o diretório não permite escrita | Passo 2 |
| O gráfico está vazio mas sem erro | Sem valores utilizáveis no intervalo selecionado, ou problema na definição do gráfico | [Resolver problemas de dados em falta](/pt-pt/guides/troubleshoot-missing-data/) |
| O gráfico para num momento fixo e nunca retoma | Poller, permissões ou heartbeat | Passo 3 |
| O gráfico tem dados mas o aspeto mudou sem alteração de configuração | O ficheiro e a base de dados discordam | Passo 4 |
| Os valores retidos são todos desconhecidos | A recolha, temporização, limites ou configuração da fonte de dados precisam de verificação | [Resolver problemas de dados em falta](/pt-pt/guides/troubleshoot-missing-data/) |
| O `rrdtool` recusa-se a ler o ficheiro | Caminho em falta, falha de acesso, formato incompatível ou danos | Passos 2 e 3, depois 5 |

O Kadupul transforma o primeiro caso numa mensagem legível em vez de uma imagem quebrada,
distinguindo um diretório onde não consegue escrever de um ficheiro onde não consegue escrever, e reportando um
ficheiro ausente como o poller podendo ainda não ter sido executado. Essa mensagem é uma pista, não um
diagnóstico: uma eliminação, um caminho alterado ou um restauro incompleto também podem deixá-lo em falta.

## 2. Inspecionar o ficheiro

Estão disponíveis duas vistas na página da própria fonte de dados, ambas ativadas por sessão.
A vista de depuração imprime o comando `rrdtool create` que o Kadupul executaria para esta fonte
de dados hoje. A vista informativa é a que importa aqui: lê o ficheiro com
`rrdtool info`, lê a definição da fonte de dados a partir da base de dados e imprime
as diferenças. Onde uma diferença puder ser reconciliada sem reconstrução, imprime o
comando `rrdtool tune` ou `rrdtool resize` que o faria, sob a forma de texto para execução
manual em vez de o executar de forma direta.

A partir de uma shell, o mesmo primeiro passo:

```bash
rrdtool info /path/to/rra/42/1337.rrd
```

O cabeçalho fornece o passo, a hora da última atualização, cada nome de fonte de dados com o seu tipo,
heartbeat, mínimo e máximo, e cada consolidação com a sua função, contagem de linhas
e resolução. Se este comando falhar, retenha o erro e verifique o caminho,
permissões e compatibilidade do RRDtool antes de diagnosticar corrupção. Um comando `info`
bem-sucedido lê metadados; inspecione também a saída de `fetch` e teste um dump para verificar o histórico.

## 3. Verificar primeiro as causas mecânicas

| Verificação | Por que razão antecede a reparação |
|---|---|
| Propriedade e modo do ficheiro | Um ficheiro criado pelo utilizador root durante a manutenção torna-se impossível de gravar pelo poller a partir desse momento |
| Propriedade e modo do diretório | O poller não consegue criar um ficheiro de substituição num diretório onde não consegue escrever |
| Espaço livre e inodes | Um sistema de ficheiros cheio produz escritas incompletas que parecem corrupção |
| Se existe um segundo processo de escrita | Atualizações concorrentes ou fora de ordem podem falhar ou invalidar uma captura de manutenção; inspecione os registos |

Execute a manutenção com a conta que possui e atualiza o RRD, e preserve o seu modo,
proprietário e grupo. Pare todos os processos de escrita antes de copiar ou substituir ficheiros, incluindo
coletores remotos, tarefas agendadas e manutenção manual. Drene escritas pendentes apenas após
a paragem dos produtores. Comandos simples de shell não adquirem os bloqueios de armazenamento do Kadupul.
Consulte os [requisitos de armazenamento](/pt-pt/reference/requirements/) e o procedimento de imobilização em
[Cópia de segurança e restauro](/pt-pt/guides/back-up-and-restore/).

## 4. Ler o que o verificador já encontrou

O Kadupul pode verificar periodicamente fontes de dados ligadas a gráficos em dispositivos ativos e
registar o que encontra; isto não é um inventário de cada ficheiro no disco. Está desativado
por predefinição. A interface indica onde o ativar: Configuration -> Settings -> Data.

| Definição | Predefinição | Efeito |
|---|---|---|
| Enable RRDfile Check | off | Nada é verificado até que seja ativado |
| Check Frequency | 4 hours | Também oferece 1 hour, 24 hours ou execução após cada ciclo boost |
| Number of RRDfile Check Processes | 1 process | Divide a lista de ficheiros por processos paralelos |
| RRDChecker Timeout | 1 hour | O processo é interrompido se ultrapassar este limite |

Os resultados acumulam-se numa lista com o dispositivo, a fonte de dados, o identificador interno da fonte
de dados, a mensagem e a data. Pode filtrar por antiguidade e pesquisar no texto, e
pode limpar a lista depois de atuar sobre ela.

As mensagens que pode registar e o significado de cada uma:

| Mensagem | Significado |
|---|---|
| RRDfile does not exist | O ficheiro nunca foi criado, foi movido ou eliminado, ou o caminho configurado mudou |
| RRDfile is not writable | O utilizador do poller não consegue gravar no ficheiro |
| RRDfile modify time older than hour | Nada foi gravado há pelo menos uma hora |
| Last update value in RRDfile is older than 1 hour | O carimbo da última atualização do próprio ficheiro está desatualizado, o que é prova mais forte do que a data de modificação |
| The RRDfile step does not match the Data Source Profile step | O ficheiro foi criado sob um intervalo diferente |
| There are more, or less, Data Sources in the database than in the RRDfile | O modelo ganhou ou perdeu campos após a criação do ficheiro |
| The Data Source '...' exists in RRDfile, but not in database | Nomeia o campo, da perspetiva do ficheiro |
| Data Source name '...' exists in the Database, but not in RRDfile | Nomeia o campo que o poller está a gravar mas que não tem espaço no ficheiro |
| The RRDfile Minimal Heart... is lower than polling interval | O verificador assinala heartbeat inferior ou igual ao intervalo de consulta; amostras atrasadas podem tornar-se desconhecidas |
| The RRDfile minimal heartbeat... should be 'N' and is currently 'M' | O heartbeat do ficheiro está abaixo do heartbeat do perfil; esta verificação não assinala um maior |
| Stale values for last 24 hours, or last hour | Todas as amostras lidas nessa janela eram desconhecidas |
| More than 50% (n/m) values are NaN in last 24 hours, or last hour | Falha parcial de recolha |
| No data returned, maybe corrupted Data Source | Uma consulta fetch ao ficheiro não devolveu absolutamente nada |

A verificação corrige o passo e o heartbeat registados na base de dados para corresponderem ao perfil
à medida que avança, o que resolve discrepâncias entre o perfil e as linhas da fonte de dados mas não
toca no ficheiro. Discrepâncias de contagem entre ficheiro e base de dados são comunicadas em vez de
reparadas, porque qualquer um dos lados pode estar incorreto.

## 5. Despejar, editar, restaurar

O RRDtool consegue serializar um ficheiro legível para XML e reconstruir um candidato a partir dele.
Isto pode ajudar com uma discrepância estrutural conhecida, mas não reconstrói amostras perdidas
nem garante que um ficheiro danificado possa ser processado. O Kadupul também utiliza utilitários dump/restore
para alterações estruturais. O utilitário local de restauro constrói um ficheiro irmão temporário e
renomeia-o sobre o destino após o sucesso; isto não substitui uma cópia de segurança.

Com os processos de escrita parados, execute isto como o proprietário do RRD. Substitua o caminho de exemplo pelo
caminho real da fonte de dados. O diretório de trabalho privado é criado junto da origem para
que o candidato fique no mesmo sistema de ficheiros:

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
passo, consolidações, carimbo de última atualização e valores de amostras. Um ciclo dump/restore inalterado
pode alterar a disposição binária, pelo que deve comparar valores em vez de exigir hashes de ficheiro idênticos.

Guarde a cópia original. Apenas após a validação, reponha o modo,
proprietário e grupo necessários do candidato e renomeie-o para o caminho ativo enquanto os processos de escrita permanecem parados. Verifique
se a conta do poller consegue ler e atualizar o ficheiro antes de retomar a recolha. Este exemplo
interrompe antes da instalação para que um candidato legível mas incorreto não seja instalado.

O XML e o candidato necessitam de espaço em disco adicional. Um dump com falha pode deixar
XML parcial; não o restaure. Verifique o acesso, o espaço livre e o erro comunicado. Se o original
não puder ser despejado após essas verificações, restaure uma cópia de segurança funcional comprovada. O parâmetro
[`restore -f`](https://oss.oetiker.ch/rrdtool/doc/rrdrestore.en.html) do RRDtool permite sobrescrever
o destino; o exemplo por etapas utiliza deliberadamente um novo destino.

## 6. O que sobrevive e o que não sobrevive

| Dano | Histórico recuperável |
|---|---|
| Ficheiro não gravável, de resto intacto | O histórico retido sobrevive. Atualizações perdidas não são recuperadas apenas pela correção do acesso |
| Heartbeat, mínimo ou máximo errado | Sim. `rrdtool tune` altera o cabeçalho sem tocar nos valores armazenados |
| Passo errado | Requer uma conversão explícita e validada; alterar apenas o perfil na base de dados não converte o ficheiro |
| Fonte de dados em falta no ficheiro | Os campos existentes mantêm o seu histórico. O novo campo começa vazio |
| Consolidação eliminada ou nunca criada | Não. Uma resolução que nunca foi guardada não pode ser reconstruída |
| Linhas reduzidas por um redimensionamento redutor | Não. As linhas descartadas desaparecem no momento em que o comando é executado |
| Ficheiro truncado, o dump falha | Não. Restaurar a partir de cópia de segurança |
| Cabeçalho intacto, fim de ficheiro truncado | Não presuma que um cabeçalho legível implica um dump completo; use uma cópia de segurança verificada se o dump falhar |

Alterar o intervalo do poller ou mover uma fonte de dados para outro perfil de retenção
não remodela automaticamente ficheiros existentes. O RRDtool também disponibiliza operações
[`tune` estruturais](https://oss.oetiker.ch/rrdtool/doc/rrdtune.en.html), incluindo uma
opção de passo; valide o comportamento de conversão para a sua versão instalada e esquema de
consolidações em vez de assumir uma alteração de intervalo sem perdas. Consulte
[Fontes de dados e históricos consolidados](/pt-pt/concepts/data-sources-and-rras/) e
[Gerir a retenção de dados](/pt-pt/guides/manage-data-retention/). Aumentar um máximo com `tune`
é seguro; diminuí-lo regista qualquer valor posterior acima do novo teto como desconhecido.

## 7. Reconstruir conservando o que se pode conservar

O Kadupul fornece um utilitário splice que pode preencher um novo ficheiro a partir de um mais antigo
legível. Trate o seu resultado como um candidato: pode preencher lacunas e substituir zeros legítimos,
pelo que não é uma cópia sem perdas do histórico medido. Execute a partir da raiz da aplicação no
coletor principal de dados, utilizando cópias isoladas em diretórios fidedignos com permissão de escrita.

Crie `new.rrd` com a estrutura pretendida dentro do diretório privado `$work`
do passo 5, e depois pré-visualize a união:

```bash
php cli/splice_rrd.php --oldrrd="$work/original.rrd" \
                       --newrrd="$work/new.rrd" \
                       --finrrd="$work/merged.rrd" --dryrun
```

Ambos os ficheiros de entrada devem já existir e passar as verificações de escrita do utilitário.
O novo ficheiro fornece a estrutura. Sem `--finrrd`, a saída é o caminho do novo ficheiro
mais `.new`; utilize um caminho de saída explícito novo para evitar substituir um
candidato anterior. `--dryrun` analisa e funde utilizando XML temporário e, quando disponível,
armazenamento SQLite, mas ignora o restauro final em RRD. Não prova que o restauro
final terá sucesso. Remova `--dryrun` para produzir o candidato separado.
Evite `--owner` durante as pré-visualizações e execute como a conta de serviço necessária; verifique
a posse real da saída antes da instalação.

:::caution[O splice trata o zero como uma lacuna]
A união percorre o novo ficheiro e, para cada posição com valor desconhecido **ou zero**, procura
o valor correspondente mais próximo no ficheiro antigo e grava esse valor. Um zero genuíno no
novo ficheiro é, portanto, substituído por dados antigos. Em qualquer métrica que leia legitimamente zero
durante períodos prolongados (uma porta inativa, uma fila que esvazia, um contador em repouso), inspecione o
resultado antes de o colocar no local definitivo. Os valores desconhecidos do ficheiro antigo também são preenchidos
com valores precedentes, pelo que a saída unida pode inventar continuidade sobre dados em falta.
:::

Após a união, coloque o ficheiro onde a fonte de dados o espera, com a propriedade que o
poller necessita, e verifique se o gráfico é desenhado.

## 8. Preencher lacunas e por que pensar duas vezes

| Utilitário | O que grava |
|---|---|
| `cli/batchgapfix.php` | Preenche um intervalo de datas em múltiplos dispositivos em paralelo, utilizando o último valor conhecido ou uma média |
| `cli/float_rrdfiles.php` | Desloca um intervalo em gráficos selecionados através do mesmo caminho de dump e restore |

Ambos inventam medições. Nada foi recolhido nesses carimbos de data/hora, e posteriormente
nada no ficheiro distingue os valores inventados dos reais. Utilize-os quando
souber que a lacuna não foi uma interrupção: um poller parado para manutenção, uma janela de migração.
Nunca em nada que alimente um cálculo de capacidade ou faturação. O mesmo cuidado aplica-se a
[remover picos](/pt-pt/guides/remove-spikes-from-data/).

## 9. Depuração automatizada de uma fonte de dados

Para uma fonte de dados com comportamento anómalo, o Kadupul pode executar uma verificação de depuração ao longo dos
próximos ciclos de consulta e emitir um veredito: se o ficheiro existe, se ele e o seu
diretório permitem escrita, que conta o possui face à conta com que o poller corre,
se a fonte de dados está ativa, se o ficheiro corresponde à definição da fonte de dados,
se a última atualização se moveu após uma consulta e se os valores eram utilizáveis. A sua
ação de reparação é restrita. Executa as recomendações de `rrdtool tune` produzidas pela
comparação e nada mais, recusando e registando o motivo quando a lista está vazia ou o ficheiro
não permite escrita. Não recria ficheiros, não adiciona fontes de dados nem altera consolidações.

## 10. A eliminação é um perigo separado

O Kadupul monitoriza ficheiros de histórico cuja fonte de dados já não existe e propõe a
respetiva remoção. Também pode ser configurado para agir automaticamente quando uma fonte de dados é eliminada, com dois
métodos: eliminar ou mover para um diretório de arquivo.

:::danger[A eliminação é permanente]
O método de eliminação remove o ficheiro do disco. Não existe caixote do lixo e os dados
não estão na base de dados. Se não tiver a certeza de que cada ficheiro listado é genuinamente órfão,
defina o método para arquivar, o que move os ficheiros para um diretório indicado por si, e limpe
esse diretório manualmente mais tarde.
:::

Um ficheiro pode parecer órfão sem o ser. Uma fonte de dados movida para um novo caminho, um
restauro parcialmente concluído ou um dispositivo reconstruído sob um novo identificador deixam ficheiros para os quais
nada aponta. Verifique a lista face ao seu próprio registo de alterações antes de avançar.

## Modos de falha

| Sintoma | Causa |
|---|---|
| A reparação teve sucesso, mas o gráfico continua vazio | Verifique o acesso, o intervalo de tempo selecionado, a recolha de dados e a definição do gráfico |
| O `rrdtool dump` dá erro no ficheiro | Verifique o caminho, acesso, armazenamento e formato antes de concluir que está danificado |
| Tune aplicado, nada mudou | Alterações de cabeçalho não preenchem retroativamente amostras desconhecidas históricas; valide definições de ficheiro e base de dados |
| Pequenas lacunas em todo o lado após alteração de intervalo | Os ficheiros ainda contêm o passo e o heartbeat antigos |
| Ficheiro unido tem dados antigos onde o novo lia zero | Comportamento esperado. O splice preenche zeros bem como incógnitas |
| A lista do verificador cresce e nunca diminui | As constatações são registadas até serem limpas; corrigir a causa não as apaga |

Faça cópias de segurança do diretório de consolidações e da base de dados em conjunto, num único agendamento, e teste o
restauro. A recuperação está limitada ao que essa cópia de segurança reteve no momento da captura. Consulte
[Cópia de segurança e restauro](/pt-pt/guides/back-up-and-restore/).
