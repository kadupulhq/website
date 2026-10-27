---
title: "Requisitos"
description: "Requisitos de execução, armazenamento e implantação para o planejamento de 2026–2027."
sidebar:
  order: 1
banner:
  content: "O Kadupul está em pré-alfa. Valide estes procedimentos em uma instalação de teste isolada. Tradução em rascunho, pendente de revisão por uma pessoa fluente no idioma."
---

Verificado em 26 de outubro de 2026 com a revisão da aplicação indicada abaixo. Esta referência serve para o planejamento de 2026–2027; não representa um compromisso de lançamento ou suporte.
[`d579c33c6`](https://github.com/kadupulhq/kadupul/tree/d579c33c60cca7e4c9d84dbd9e1b2c6ba5492daf).

## Ambiente de execução

A branch `main` exige PHP 8.4 ou mais recente e combina Symfony 7.4 com pontos de entrada legados. A linha `lts/1.2` tem requisitos próprios. Instale MySQL ou MariaDB, RRDtool e um coletor PHP ou uma compilação compatível do Spine. Para compilar a partir do código-fonte, use as versões de `mise.toml` por meio de `mise exec`; instale as dependências do arquivo de lock sem atualizá-las.

## PHP

O manifesto exige estas extensões além do PHP:

`PDO`, `Phar`, `dom`, `gd`, `gmp`, `intl`, `json`, `ldap`, `mbstring`, `mysqlnd`, `openssl`, `pcntl`, `pdo_mysql`, `posix`, `sockets`, `sqlite3`, `xml`.

O instalador verifica separadamente `ctype`, `date`, `filter`, `hash`, `pcre`, `session`, `simplexml`, `spl`, `standard` e `zlib`, entre outras. No Unix, verifica `posix` e `pcntl` para CLI; no Windows, `com_dotnet`. Passar pelo instalador não comprova que os requisitos do Composer foram atendidos. Verifique o PHP da linha de comando e do servidor web separadamente. Configure `date.timezone`; o instalador recomenda `memory_limit=400M` e `max_execution_time=60`, ou valores ilimitados. A extensão opcional `snmp` permite consultas dentro do processo; `gettext` habilita os catálogos de tradução.

## Banco de dados

Use uma versão do MySQL ou MariaDB mantida pelo fornecedor e valide-a com a revisão de destino. Os limites antigos do instalador para MySQL 5.6 e MariaDB 10.0 não comprovam suporte para 2026–2027. Na `main`, `poller_output`, `poller_output_boost` e `poller_output_realtime` usam InnoDB; algumas tabelas de coordenação ainda usam MEMORY. Não converta todas as tabelas para o mesmo mecanismo. Preencha `mysql.time_zone_name` e conceda à conta da aplicação acesso SELECT a essa tabela.

## RRDtool

Configure o caminho absoluto do executável e faça a versão configurada corresponder à instalada. `DCOUNTER` e `DDERIVE` exigem RRDtool 1.5 ou mais recente. O armazenamento local no Unix exige verificações de identidade POSIX e `flock` funcional em diretórios. Pare os processos de gravação externos e os daemons de cache antes da manutenção exclusiva. O caminho de proxy legado existe, mas não garante uma implantação validada.

## net-snmp

Instale as ferramentas Net-SNMP quando PHP `snmp` estiver ausente ou desativado. Configure `path_snmpget`, `path_snmpgetnext`, `path_snmpwalk`, `path_snmpbulkwalk` e `path_snmptrap` com os caminhos dos executáveis correspondentes. Teste o caminho selecionado com a versão SNMP do dispositivo, inclusive SNMPv3 sobre IPv6 quando aplicável; o instalador legado desaconselha PHP `snmp` nessa combinação.

## Servidor web

Execute o PHP pelo ambiente web configurado e use TLS. Preserve as rotas legadas junto com `/app.php/...`; não altere toda a raiz de documentos para `public/` enquanto houver páginas legadas. Configure PATH_INFO para o ponto de entrada de compatibilidade. O Nginx ignora `.htaccess`; aplique regras explícitas que bloqueiem código-fonte, configuração, dependências, ferramentas, testes, segredos e estado de execução antes do processamento PHP. Faça o prefixo da URL corresponder a `$url_path`.

## Agendamento

Use um único mecanismo de inicialização: cron, Agendador de Tarefas ou o serviço do daemon coletor fornecido. Ajuste a frequência ao intervalo de inicialização configurado. A coleta em intervalos inferiores a um minuto ocorre dentro desse intervalo; o cron sozinho não oferece esse agendamento. Execute as verificações com a conta do poller e pare o mecanismo habitual para evitar execuções simultâneas.

## Sistema de arquivos

Conceda acesso aos caminhos RRD efetivos, logs, caches e diretórios de execução do Symfony somente às contas necessárias. O diretório RRD padrão é `rra/`. Contas Unix separadas para web e poller exigem identificadores numéricos explícitos em `rrd_maintenance_trusted_uids` e, para grupos com permissão de gravação, `rrd_maintenance_trusted_gids`, em `include/config.php`. Todos os integrantes desses grupos precisam ser confiáveis. As permissões normais continuam valendo; armazenamento com gravação para todos é rejeitado. Use a mesma configuração de confiança em todos os processos de gravação e verifique ambas as contas antes de atualizar.

## Privilégios

Execute o processo web e o poller com contas dedicadas sem privilégios. ICMP com sockets brutos exige privilégios adicionais do sistema operacional; use verificações TCP, UDP ou SNMP quando eles não estiverem disponíveis. Não execute toda a aplicação como root para habilitar ping. O Windows não tem a validação de ACL necessária para manutenção destrutiva de RRD locais; as atualizações comuns usam confirmações síncronas do RRDtool. Evidências de desempenho no Unix não validam a capacidade do Windows.

## Sobre a versão do PHP

Para planejar 2026–2027, o PHP 8.4 recebe suporte ativo até 31 de dezembro de 2026 e correções de segurança até 31 de dezembro de 2028. O PHP 8.5 recebe suporte ativo até 31 de dezembro de 2027 e correções de segurança até 31 de dezembro de 2029. Essas são datas do projeto PHP, não uma matriz de compatibilidade do Kadupul. Teste novos ambientes com as dependências bloqueadas antes de adotá-los. O requisito mínimo menor do Symfony não reduz o mínimo 8.4 do Kadupul. Confira novamente os calendários oficiais e a revisão de destino antes da implantação.

[Ajuste do banco de dados](/pt-br/guides/tune-database-performance/) · [Integração com RRDtool](/pt-br/reference/rrdtool-integration/) · [SNMP](/pt-br/reference/snmp/) · [Organização dos arquivos](/pt-br/reference/file-layout/) · [Instalação](/pt-br/start/install/) · [Pré-requisitos para atualizar o armazenamento](https://github.com/kadupulhq/kadupul/blob/d579c33c60cca7e4c9d84dbd9e1b2c6ba5492daf/docs/testing/spikekill-safety.md) · [Versões compatíveis do PHP](https://www.php.net/supported-versions.php)
