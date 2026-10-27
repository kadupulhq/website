---
title: "Cópia de segurança e restauro"
description: "Três elementos têm de ser capturados em conjunto para que a cópia seja válida, e a ordem de restauro é crucial."
banner:
  content: "O Kadupul está em pré-alfa. Valide estes procedimentos numa instalação de teste isolada. Tradução em rascunho, pendente de revisão por uma pessoa fluente no idioma."
sidebar:
  order: 7
---

:::caution[Validar antes de utilizar]
O código-fonte está disponível, mas não existe uma versão com suporte nem um caminho de migração para o Kadupul. Teste estes procedimentos numa cópia isolada com cópias de segurança antes de depender deles. Consulte o [estado do projeto](/pt-pt/project/status/).
:::

Um conjunto completo de recuperação do Kadupul tem três partes. Cópias de segurança parciais podem recuperar a configuração ou as medições, mas não conseguem reproduzir a instalação completa.

| Parte | O que contém | Onde reside |
|---|---|---|
| Base de dados | Dispositivos, modelos, utilizadores, permissões, a cache do sondador e o caminho de cada ficheiro RRD | MySQL ou MariaDB |
| Ficheiros RRD | Medições retidas e históricos consolidados | O diretório RRA, por predefinição `rra/` sob a instalação |
| Configuração | Credenciais da base de dados, caminhos, configuração do recolhedor, código de plugins e scripts | `include/config.php`, o ficheiro de configuração do spine, `plugins/`, `scripts/`, `resource/` |

## O que uma cópia de segurança apenas da base de dados pode recuperar

A base de dados guarda definições de gráficos e a configuração de monitorização, enquanto os ficheiros RRD guardam os históricos consolidados de gráficos. Com o Boost ativado, as leituras recentes também podem permanecer em filas na base de dados até serem descarregadas para ficheiros. Preserve essas filas como parte da cópia de segurança da base de dados. Consulte a [Arquitetura](/pt-pt/concepts/architecture/).

Restaure apenas a base de dados e obterá um sistema que conhece quatrocentos dispositivos, tem todos os gráficos definidos e desenha cada um deles vazio. Começará a recolher novamente a partir do momento em que iniciar o sondador, e o histórico ter-se-á perdido.

## O que falta a uma cópia de segurança apenas de RRD

Um ficheiro RRD contém fontes de dados nomeadas, definições de consolidação e valores, mas não os metadados completos de dispositivos, consultas, gráficos e permissões do Kadupul necessários para religar esses valores à aplicação.

O mapeamento de "bytes de entrada na porta 3 do comutador 12" para um caminho no disco reside na base de dados, numa coluna na fonte de dados. Restaure apenas a árvore de ficheiros e terá vários milhares de ficheiros cheios de números, sem forma de descobrir qual é qual a não ser por engenharia inversa manual.

Os dois formam uma única cópia de segurança. Trate-os dessa forma.

## Consistência entre eles

É aqui que a maioria dos procedimentos de cópia de segurança erra silenciosamente.

O sondador escreve continuamente nos ficheiros RRD. Um ficheiro copiado enquanto decorre uma atualização pode ser capturado a meio da escrita. A base de dados está a ser escrita ao mesmo tempo. Se descarregar a base de dados às 02:00 e começar a copiar os ficheiros às 02:20, as duas metades descrevem momentos diferentes, e qualquer fonte de dados criada ou eliminada nesse intervalo gera uma discrepância.

Escritas diferidas de RRD tornam o cenário pior e mais interessante. Nesse modo, o sondador não escreve nos ficheiros RRD a cada passagem. Os resultados acumulam-se numa tabela duradoura da base de dados e são descarregados em lote mais tarde. Portanto, a base de dados pode legitimamente estar adiantada em relação aos ficheiros RRD até ao limite do intervalo de descarga, contendo medições reais que não existem em mais nenhum sítio no disco.

Escolha uma destas opções, por ordem decrescente de preferência:

**Instantâneo coordenado.** Utilize o procedimento suportado pelo motor de base de dados para cópia de segurança ou colocação em pausa (quiescing) e coordene-o com instantâneos de todo o armazenamento RRD e configuração da aplicação. Um instantâneo do sistema de ficheiros por si só não estabelece consistência entre volumes separados, recolhedores remotos, filas pendentes ou uma base de dados ativa.

**Cópia de segurança lógica em pausa.** Desative os iniciadores agendados e outros produtores, aguarde que os recolhedores em execução terminem, descarregue as escritas diferidas e aguarde pelos processos de descarga. Mantenha as alterações de configuração, tarefas de manutenção e outros processos de escrita RRD parados durante toda a captura. Pausas na recolha podem deixar amostras em falta; o seu aparecimento depende do heartbeat e da consolidação.

Antes de executar o exemplo, conclua esses passos de colocação em pausa e verifique o estado das filas e dos processos. O facto de `poller_boost.php --force` devolver zero por si só não prova que a descarga ficou concluída: um processo Boost já registado pode fazer com que termine sem realizar o trabalho. Coordene qualquer serviço rrdcached ou armazenamento remoto separadamente.

Este exemplo em Bash pressupõe armazenamento local, uma conta de base de dados configurada num ficheiro privado de opções de cliente e um diretório RRA contendo todos os RRD geridos. Substitua todos os caminhos. Faça o inventário de caminhos absolutos personalizados de RRD, destinos de ligações simbólicas, configuração externa e recolhedores remotos, capturando-os também separadamente.

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

O pacote da aplicação inclui a configuração e o código correspondente. Registe a revisão de origem, as versões da base de dados e do RRDtool, os caminhos de armazenamento reais e o estado de encerramento/descarga dos processos de escrita juntamente com o conjunto. O exemplo exclui registos normais, cache e metadados de Git; reveja essas exclusões para a sua instalação.

Apenas um conjunto capturado com sucesso e com somas de verificação validadas recebe o nome de diretório final. Um comando que falhe pode deixar um ficheiro truncado dentro de `.partial-*`; o `set -e` interrompe os comandos seguintes mas não remove o conteúdo já gerado. Não promova esse diretório a uma cópia de segurança concluída. As somas de verificação detetam alterações posteriores, não integridade lógica; um teste de restauro continua a ser obrigatório.

`--single-transaction` abrange tabelas transacionais, não um instantâneo consistente de tabelas não transacionais de plugins ou alterações concorrentes de esquema. Mantenha os processos de escrita e as alterações de esquema interrompidos, ou utilize um método de cópia de segurança adequado ao motor. Retome a recolha apenas após confirmar que a captura terminou e o armazenamento está utilizável. Consulte a [documentação do mysqldump](https://dev.mysql.com/doc/refman/8.4/en/mysqldump.html) para conhecer os requisitos de transações e privilégios. As omissões da fórmula anterior são acompanhadas no [website #12](https://github.com/kadupulhq/website/issues/12).

**Aceite o desfasamento e registe-o.** A parte capturada em primeiro lugar será sempre a mais antiga, e nenhuma das ordens torna por si só um par ativo consistente. Registe a janela temporal; é isso que torna o resultado recuperável.

Se descarregar a base de dados primeiro e copiar os ficheiros depois, os ficheiros serão mais recentes. Uma fonte de dados eliminada dentro dessa janela continua presente na descarga da base de dados mas o seu ficheiro desapareceu, deixando uma referência que o sondador tentará recriar. Uma fonte de dados criada dentro dessa janela surge como um ficheiro desconhecido pela base de dados, ficando inerte.

Se copiar os ficheiros primeiro e descarregar a base de dados depois, a base de dados será mais recente. Uma fonte de dados criada dentro dessa janela surge na descarga sem nenhum ficheiro correspondente, sendo recriada vazia pelo sondador.

Qualquer uma das ordens pode perder histórico anterior à janela se um ficheiro necessário for eliminado antes de ser copiado. Também pode capturar um ficheiro parcialmente escrito ou amostras inconsistentes em fila. Registar o desfasamento documenta uma limitação; não torna um par inconsistente completo nem garante a capacidade de recuperação.

## O que está na cópia de segurança em que não pensou

As credenciais dos dispositivos estão na base de dados em texto simples. A cache do sondador guarda community strings de SNMP e nomes de utilizador, palavras-passe e frases de acesso de SNMPv3 como colunas normais de texto, porque o recolhedor necessita delas em cada passagem. O ficheiro de configuração contém a palavra-passe da base de dados.

Uma cópia de segurança do Kadupul é, portanto, um cofre de credenciais para todos os dispositivos que monitoriza. Encripte-a em repouso, restrinja quem pode aceder-lhe e não a coloque numa partilha geral de ficheiros.

## Ordem de restauro

A ordem importa porque cada passo depende do anterior.

1. **Restaure a configuração primeiro.** Sem as credenciais da base de dados e o caminho RRA, nada mais pode ser verificado. Se o restauro for feito para hardware diferente, corrija os caminhos agora e não mais tarde.

2. **Restaure a árvore de RRD.** Coloque-a no local indicado pela configuração. Verifique a propriedade e as permissões: o sondador escreve nestes ficheiros como o utilizador do sondador, e a interface web lê-os como o utilizador do servidor web. Um restauro que preserve o conteúdo mas não a propriedade produz um sistema que desenha gráficos perfeitamente mas não recolhe nada.

3. **Restaure a base de dados.** A tabela de versão na descarga tem de coincidir com o código no qual está a restaurar. Mantenha todos os iniciadores e processos de escrita desativados até que os componentes restaurados tenham sido verificados em conjunto. Uma descarga de uma versão mais antiga restaurada sobre código mais recente reencaminha a interface web para o instalador, o que é o comportamento correto, mas não o que pretende a meio de uma recuperação. Restaure primeiro o código correspondente.

4. **Reconstrua a cache do sondador.** A cache é derivada, e um restauro é exatamente a situação em que esta pode estar desatualizada. A reconstrução custa uma única execução e elimina toda uma categoria de sintomas confusos.

5. **Inicie o sondador e, em seguida, verifique um ficheiro.** Confirme que a data da última atualização de um ficheiro RRD avança após a primeira execução. Se os gráficos forem preenchidos até ao ponto de restauro e ficarem depois planos, inspecione os resultados da recolha, as filas, os carimbos de data/hora, os caminhos e as permissões. Um gráfico plano por si só não identifica a causa.

## Armadilhas

**Os ficheiros RRD rejeitam atualizações no passado.** Um ficheiro RRD não aceita uma amostra com carimbo de data/hora igual ou anterior ao que já possui. Restaurar um conjunto de ficheiros mais antigo em relação a uma base de dados mais recente não preenche por si só as amostras perdidas. Filas diferidas retidas ou outras origens podem conter leituras recuperáveis, mas a reprodução exige validação separada e ordenação cronológica. Sem essas leituras, a recolha é retomada com uma lacuna. É também por isso que não é possível fundir duas cópias de segurança copiando ficheiros entre elas.

**Verifique se os caminhos guardados contêm parâmetros substituíveis antes de reescrever qualquer coisa.** As fontes de dados geradas guardam o caminho como `<path_rra>/name.rrd`, e este elemento é expandido no momento da leitura a partir da definição do caminho RRD. Para essas fontes, mover a instalação implica alterar a definição e reconstruir a cache do sondador, não reescrever linhas. Os caminhos introduzidos manualmente são guardados literalmente e necessitam de ser reescritos. Verifique antes de executar uma atualização na tabela, porque reescrever caminhos parametrizados como absolutos é a alteração que torna a próxima mudança mais difícil.

**Os recolhedores remotos têm o seu próprio ficheiro de configuração.** Cada um contém as suas próprias credenciais de base de dados e o identificador do recolhedor. Não estão presentes na cópia de segurança da base de dados central. Capture-os por anfitrião.

**Os dados dos plugins residem na mesma base de dados.** Os plugins criam as suas próprias tabelas no momento da instalação, pelo que uma descarga completa da base de dados os abrange. O código dos plugins não está na base de dados. Se restaurar a base de dados sem o diretório `plugins/` correspondente, a instalação desativará o que não conseguir encontrar.

**Uma cópia de segurança que não restaurou é uma hipótese.** Restaure regularmente para uma instância de teste. A falha detetada com maior frequência não é a corrupção; é uma cópia de segurança que apenas capturava uma das três partes.
