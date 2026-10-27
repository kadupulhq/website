---
title: "Backup e restauração"
description: "Três componentes precisam ser capturados juntos para que o backup seja válido, e a ordem de restauração faz diferença."
banner:
  content: "O Kadupul está em pré-alfa. Valide estes procedimentos em uma instalação de teste isolada. Tradução em rascunho, pendente de revisão por uma pessoa fluente no idioma."
sidebar:
  order: 7
---

:::caution[Validar antes de usar]
O código-fonte está disponível, mas não existe um release com suporte nem um caminho de migração para o Kadupul. Teste estes procedimentos em uma cópia isolada com backups antes de depender deles. Consulte o [status do projeto](/pt-br/project/status/).
:::

Um conjunto completo de recuperação do Kadupul possui três partes. Backups parciais conseguem recuperar a configuração ou as medições, mas não conseguem reproduzir a instalação inteira.

| Parte | O que contém | Onde reside |
|---|---|---|
| Banco de dados | Dispositivos, templates, usuários, permissões, o cache do poller e o caminho de cada arquivo RRD | MySQL ou MariaDB |
| Arquivos RRD | Medições retidas e arquivos consolidados | O diretório RRA, por padrão `rra/` sob a instalação |
| Configuração | Credenciais do banco de dados, caminhos, configuração do coletor, código de plugins e scripts | `include/config.php`, o arquivo de configuração do spine, `plugins/`, `scripts/`, `resource/` |

## O que um backup apenas do banco de dados pode recuperar

O banco de dados mantém definições de gráficos e a configuração de monitoramento, enquanto os arquivos RRD armazenam os dados históricos de gráficos. Com o Boost habilitado, as leituras recentes também podem permanecer em filas no banco de dados até serem descarregadas nos arquivos. Preserve essas filas como parte do backup do banco de dados. Consulte a [Arquitetura](/pt-br/concepts/architecture/).

Restaure apenas o banco de dados e você terá um sistema que reconhece quatrocentos dispositivos, possui todos os gráficos definidos e desenha cada um deles vazio. Ele começará a coletar novamente a partir do momento em que você iniciar o poller, e o histórico terá sido perdido.

## O que falta em um backup apenas de RRD

Um arquivo RRD contém fontes de dados nomeadas, definições de arquivo e valores, mas não os metadados completos de dispositivos, consultas, gráficos e permissões do Kadupul necessários para reconectar esses valores à aplicação.

O mapeamento de "bytes de entrada na porta 3 do switch 12" para um caminho no disco reside no banco de dados, em uma coluna na fonte de dados. Restaure apenas a árvore de arquivos e você terá vários milhares de arquivos cheios de números, sem nenhuma maneira de descobrir qual é qual a não ser por engenharia reversa manual.

Os dois formam um único backup. Trate-os dessa maneira.

## Consistência entre eles

É aqui que a maioria dos procedimentos de backup erra silenciosamente.

O poller grava continuamente nos arquivos RRD. Um arquivo copiado enquanto uma atualização está em andamento pode ser capturado no meio da gravação. O banco de dados está sendo gravado ao mesmo tempo. Se você gerar um dump do banco de dados às 02:00 e começar a copiar os arquivos às 02:20, as duas metades descrevem momentos diferentes, e qualquer fonte de dados criada ou excluída nesse intervalo causa uma divergência.

Gravações adiadas de RRD tornam o cenário pior e mais interessante. Nesse modo, o poller não grava nos arquivos RRD a cada ciclo. Os resultados se acumulam em uma tabela persistente do banco de dados e são descarregados em lote mais tarde. Portanto, o banco de dados pode legitimamente estar à frente dos arquivos RRD em até o intervalo de flush, contendo medições reais que não existem em nenhum outro lugar no disco.

Escolha uma destas opções, em ordem decrescente de preferência:

**Snapshot coordenado.** Utilize o procedimento de backup ou quiesce suportado pelo mecanismo do banco de dados e coordene-o com snapshots de todo o armazenamento RRD e da configuração da aplicação. Um snapshot do sistema de arquivos por si só não garante consistência entre volumes separados, coletores remotos, filas pendentes ou um banco de dados ativo.

**Backup lógico em quiesce.** Desative os inicializadores agendados e outros produtores, aguarde os coletores em execução terminarem, descarregue as gravações adiadas e aguarde os workers de flush. Mantenha alterações de configuração, manutenção e outros gravadores RRD interrompidos durante toda a captura. Pausas na coleta podem deixar amostras ausentes; o impacto depende do heartbeat e da consolidação.

Antes de executar o exemplo, conclua essas etapas de quiesce e verifique o estado das filas e dos workers. O fato de `poller_boost.php --force` retornar zero não é, por si só, prova de um flush concluído: um processo Boost já registrado pode fazer com que ele termine sem realizar o trabalho. Coordene qualquer serviço rrdcached ou armazenamento remoto separadamente.

Este exemplo em Bash pressupõe armazenamento local, uma conta de banco de dados configurada em um arquivo privado de opções de cliente e um diretório RRA contendo todos os RRDs gerenciados. Substitua todos os caminhos. Mapeie caminhos absolutos personalizados de RRDs, destinos de links simbólicos, configuração externa e coletores remotos, capturando-os também separadamente.

```bash
set -euo pipefail
umask 077

APP=/path/to/kadupul
RRA=/path/to/kadupul/rra             # use the actual configured storage path
DEST=/var/backups/kadupul            # outside the served tree
MYSQL_CNF=/secure/path/backup-client.cnf
DB=$(php -r 'require $argv[1]; echo $database_default;' "$APP/include/config.php")
STAMP=$(date -u +%Y%m%dT%H%M%SZ)

install -d -m 0700 "$DEST"
STAGE=$(mktemp -d "$DEST/.partial-XXXXXXXX")
FINAL="$DEST/backup-$STAMP-${STAGE##*partial-}"

# All writers must already be stopped and deferred queues handled.
mysqldump --defaults-extra-file="$MYSQL_CNF" \
  --single-transaction --routines --events --triggers "$DB" > "$STAGE/db.sql"
tar -C "$RRA" -cf "$STAGE/rrd.tar" .
tar --exclude='./rra' --exclude='./log' --exclude='./cache' --exclude='./.git' \
  -C "$APP" -cf "$STAGE/application.tar" .

( cd "$STAGE"
  sha256sum db.sql rrd.tar application.tar > SHA256SUMS
  sha256sum --check SHA256SUMS )
test ! -e "$FINAL"
mv "$STAGE" "$FINAL"
```

O arquivo compactado da aplicação inclui configuração e o código correspondente. Registre a revisão do código-fonte, as versões do banco de dados e do RRDtool, os caminhos reais de armazenamento e o status de encerramento/flush dos gravadores junto com o conjunto. O exemplo exclui logs normais, cache e metadados do Git; revise essas exclusões para a sua instalação.

Apenas um conjunto capturado com sucesso e com checksum verificado recebe o nome final do diretório. Um comando com falha ainda pode deixar um arquivo truncado dentro de `.partial-*`; o `set -e` interrompe comandos subsequentes, mas não remove arquivos já criados. Não promova esse diretório a um backup concluído. Checksums detectam alterações posteriores, não integridade lógica; um teste de restauração ainda é necessário.

`--single-transaction` cobre tabelas transacionais, não um snapshot consistente de tabelas não transacionais de plugins ou alterações concorrentes de schema. Mantenha gravadores e alterações de schema parados, ou utilize um método de backup apropriado para o mecanismo. Retome a coleta somente após confirmar que a captura terminou e o armazenamento está utilizável. Consulte a [documentação do mysqldump](https://dev.mysql.com/doc/refman/8.4/en/mysqldump.html) para os requisitos de transação e privilégios. As omissões da receita anterior são acompanhadas na [website #12](https://github.com/kadupulhq/website/issues/12).

**Aceite a defasagem e registre-a.** A parte capturada primeiro será sempre a mais antiga, e nenhuma das ordens torna por si só um par ativo consistente. Registre a janela; é isso que torna o resultado recuperável.

Se você fizer o dump do banco de dados primeiro e copiar os arquivos depois, os arquivos serão mais novos. Uma fonte de dados excluída dentro dessa janela ainda estará no dump, mas seu arquivo terá desaparecido, deixando uma referência que o poller recriará. Uma fonte de dados criada dentro dessa janela chega como um arquivo que o banco de dados não conhece, ficando inerte.

Se você copiar os arquivos primeiro e fizer o dump do banco de dados depois, o banco de dados será mais novo. Uma fonte de dados criada dentro dessa janela estará no dump sem nenhum arquivo por trás dela, o que o poller recria vazio.

Qualquer uma das ordens pode perder histórico anterior à janela se um arquivo necessário for excluído antes de ser copiado. Também pode capturar um arquivo parcialmente gravado ou amostras inconsistentes em fila. Registrar a defasagem documenta uma limitação; isso não torna um par inconsistente completo nem garante a recuperabilidade.

## O que está no backup que você não imaginava

Credenciais de dispositivos estão no banco de dados em texto não criptografado. O cache do poller armazena strings de comunidade SNMP e nomes de usuário, senhas e passphrases de SNMPv3 em colunas simples, porque o coletor precisa delas a cada ciclo. O arquivo de configuração contém a senha do banco de dados.

Um backup do Kadupul é, portanto, um cofre de credenciais para todos os dispositivos monitorados. Criptografe-o em repouso, restrinja quem pode lê-lo e não o envie para um compartilhamento de arquivos de uso geral.

## Ordem de restauração

A ordem importa porque cada etapa depende da anterior.

1. **Restaure a configuração primeiro.** Sem as credenciais do banco de dados e o caminho RRA, nada mais pode ser verificado. Se a restauração for feita em outro hardware, corrija os caminhos agora e não depois.

2. **Restaure a árvore RRD.** Coloque-a onde a configuração indica que ela deve estar. Verifique propriedade e permissões: o poller grava nesses arquivos como o usuário do poller, e a interface web os lê como o usuário do servidor web. Uma restauração que preserve o conteúdo mas não a propriedade produz um sistema que gera gráficos normalmente e não coleta nada.

3. **Restaure o banco de dados.** A tabela de versão no dump deve corresponder ao código sobre o qual você está restaurando. Mantenha todos os launchers e gravadores desativados até que os componentes restaurados tenham sido verificados juntos. Um dump de um release mais antigo restaurado sobre um código mais recente envia a interface web para o instalador, o que é o comportamento correto, mas não o que você deseja no meio de uma recuperação. Restaure o código correspondente primeiro.

4. **Reconstrua o cache do poller.** O cache é derivado, e uma restauração é exatamente a situação em que ele pode estar desatualizado. Reconstruí-lo custa uma única execução e remove toda uma categoria de sintomas confusos.

5. **Inicie o poller e verifique um arquivo.** Confirme que o timestamp de última atualização de um arquivo RRD avança após a primeira execução. Se os gráficos forem preenchidos até o ponto de restauração e depois ficarem estáveis e sem variações, inspecione os resultados da coleta, filas, timestamps, caminhos e permissões. Um gráfico sem novos dados por si só não identifica a causa.

## Armadilhas

**Arquivos RRD rejeitam atualizações no passado.** Um arquivo RRD não aceita uma amostra com timestamp igual ou anterior ao que ele já possui. Restaurar um conjunto de arquivos mais antigo em relação a um banco de dados mais novo não recupera por si só as amostras perdidas. Filas adiadas mantidas ou outras fontes podem conter leituras recuperáveis, mas reproduzi-las requer validação separada e ordenação cronológica. Sem essas leituras, a coleta é retomada com uma lacuna. É também por isso que você não pode mesclar dois backups copiando arquivos entre eles.

**Verifique se os caminhos armazenados contêm tokens antes de reescrever qualquer coisa.** Fontes de dados geradas armazenam o caminho como `<path_rra>/name.rrd`, e o token é expandido no momento da leitura a partir da configuração de caminho RRD. Para essas fontes, mover a instalação significa alterar a configuração e reconstruir o cache do poller, não reescrever linhas. Caminhos inseridos manualmente são armazenados literalmente e precisam ser reescritos. Verifique antes de executar um update na tabela inteira, pois reescrever caminhos com tokens transformando-os em caminhos absolutos é a alteração que torna a próxima migração mais difícil.

**Coletores remotos possuem seu próprio arquivo de configuração.** Cada um armazena suas próprias credenciais de banco de dados e o id do coletor. Eles não estão no backup do banco de dados central. Capture-os por host.

**Dados de plugins estão no mesmo banco de dados.** Plugins criam suas próprias tabelas no momento da instalação, portanto um dump completo do banco de dados os contempla. O código dos plugins não fica no banco de dados. Se você restaurar o banco de dados sem o diretório `plugins/` correspondente, a instalação desativará o que não conseguir encontrar.

**Um backup que você não restaurou é apenas uma hipótese.** Restaure em uma instância de teste periodicamente. A falha que isso mais detecta não é a corrupção; é um backup que estava capturando apenas uma das três partes.
