---
title: "Requisitos"
description: "Requisitos de execução, armazenamento e implementação para o planeamento de 2026–2027."
sidebar:
  order: 1
banner:
  content: "O Kadupul está em pré-alfa. Valide estes procedimentos numa instalação de teste isolada. Tradução em rascunho, pendente de revisão por uma pessoa fluente no idioma."
---

Verificado em 26 de outubro de 2026 com a revisão da aplicação indicada abaixo. Esta referência destina-se ao planeamento de 2026–2027; não constitui um compromisso de lançamento ou suporte.
[`d579c33c6`](https://github.com/kadupulhq/kadupul/tree/d579c33c60cca7e4c9d84dbd9e1b2c6ba5492daf).

## Ambiente de execução

O ramo `main` exige PHP 8.4 ou posterior e combina Symfony 7.4 com pontos de entrada legados. A linha `lts/1.2` tem requisitos próprios. Instale MySQL ou MariaDB, RRDtool e um coletor PHP ou uma compilação compatível do Spine. Para compilar a partir do código-fonte, utilize as versões de `mise.toml` através de `mise exec`; instale as dependências do ficheiro de bloqueio sem as atualizar.

## PHP

O manifesto exige estas extensões além do PHP:

`PDO`, `Phar`, `dom`, `gd`, `gmp`, `intl`, `json`, `ldap`, `mbstring`, `mysqlnd`, `openssl`, `pcntl`, `pdo_mysql`, `posix`, `sockets`, `sqlite3`, `xml`.

O instalador verifica separadamente `ctype`, `date`, `filter`, `hash`, `pcre`, `session`, `simplexml`, `spl`, `standard` e `zlib`, entre outras. Em Unix, verifica `posix` e `pcntl` para CLI; em Windows, `com_dotnet`. Passar no instalador não comprova que os requisitos do Composer estão satisfeitos. Verifique separadamente o PHP da linha de comandos e do servidor Web. Configure `date.timezone`; o instalador recomenda `memory_limit=400M` e `max_execution_time=60`, ou valores ilimitados. A extensão opcional `snmp` permite consultas dentro do processo; `gettext` ativa os catálogos de tradução.

## Base de dados

Utilize uma versão do MySQL ou MariaDB mantida pelo fornecedor e valide-a com a revisão de destino. Os limites antigos do instalador para MySQL 5.6 e MariaDB 10.0 não comprovam suporte para 2026–2027. Em `main`, `poller_output`, `poller_output_boost` e `poller_output_realtime` utilizam InnoDB; algumas tabelas de coordenação continuam a utilizar MEMORY. Não converta todas as tabelas para o mesmo motor. Preencha `mysql.time_zone_name` e conceda à conta da aplicação acesso SELECT a essa tabela.

## RRDtool

Configure o caminho absoluto do executável e faça corresponder a versão configurada à instalada. `DCOUNTER` e `DDERIVE` exigem RRDtool 1.5 ou posterior. O armazenamento local em Unix exige verificações de identidade POSIX e `flock` funcional em diretórios. Pare os processos de escrita externos e os daemons de cache antes da manutenção exclusiva. O caminho de proxy legado existe, mas não garante uma implementação validada.

## net-snmp

Instale as ferramentas Net-SNMP quando PHP `snmp` estiver ausente ou desativado. Configure `path_snmpget`, `path_snmpgetnext`, `path_snmpwalk`, `path_snmpbulkwalk` e `path_snmptrap` com os caminhos dos executáveis correspondentes. Teste o caminho selecionado com a versão SNMP do dispositivo, incluindo SNMPv3 sobre IPv6 quando aplicável; o instalador legado desaconselha PHP `snmp` nessa combinação.

## Servidor Web

Execute o PHP através do ambiente Web configurado e utilize TLS. Preserve as rotas legadas juntamente com `/app.php/...`; não altere toda a raiz de documentos para `public/` enquanto existirem páginas legadas. Configure PATH_INFO para o ponto de entrada de compatibilidade. O Nginx ignora `.htaccess`; aplique regras explícitas que bloqueiem código-fonte, configuração, dependências, ferramentas, testes, segredos e estado de execução antes do processamento PHP. Faça corresponder o prefixo do URL a `$url_path`.

## Agendamento

Utilize um único mecanismo de arranque: cron, Programador de Tarefas ou o serviço do daemon coletor fornecido. Ajuste a frequência ao intervalo de arranque configurado. A recolha em intervalos inferiores a um minuto ocorre dentro desse intervalo; o cron por si só não oferece esse agendamento. Execute as verificações com a conta do poller e pare o mecanismo habitual para evitar execuções sobrepostas.

## Sistema de ficheiros

Conceda acesso aos caminhos RRD efetivos, registos, caches e diretórios de execução do Symfony apenas às contas necessárias. O diretório RRD predefinido é `rra/`. Contas Unix distintas para Web e poller exigem identificadores numéricos explícitos em `rrd_maintenance_trusted_uids` e, para grupos com permissão de escrita, `rrd_maintenance_trusted_gids`, em `include/config.php`. Todos os membros desses grupos têm de ser de confiança. As permissões normais continuam a aplicar-se; o armazenamento com escrita para todos é rejeitado. Utilize a mesma configuração de confiança em todos os processos de escrita e verifique ambas as contas antes de atualizar.

## Privilégios

Execute o processo Web e o poller com contas dedicadas sem privilégios. ICMP com sockets brutos exige privilégios adicionais do sistema operativo; utilize verificações TCP, UDP ou SNMP quando não estiverem disponíveis. Não execute toda a aplicação como root para ativar ping. O Windows não tem a validação de ACL necessária para manutenção destrutiva de RRD locais; as atualizações normais utilizam confirmações síncronas do RRDtool. As provas de desempenho em Unix não validam a capacidade do Windows.

## Sobre a versão do PHP

Para planear 2026–2027, o PHP 8.4 recebe suporte ativo até 31 de dezembro de 2026 e correções de segurança até 31 de dezembro de 2028. O PHP 8.5 recebe suporte ativo até 31 de dezembro de 2027 e correções de segurança até 31 de dezembro de 2029. Estas são datas do projeto PHP, não uma matriz de compatibilidade do Kadupul. Teste novos ambientes com as dependências bloqueadas antes de os adotar. O requisito mínimo inferior do Symfony não reduz o mínimo 8.4 do Kadupul. Volte a consultar os calendários oficiais e a revisão de destino antes da implementação.

[Ajuste da base de dados](/pt-pt/guides/tune-database-performance/) · [Integração com RRDtool](/pt-pt/reference/rrdtool-integration/) · [SNMP](/pt-pt/reference/snmp/) · [Organização dos ficheiros](/pt-pt/reference/file-layout/) · [Instalação](/pt-pt/start/install/) · [Pré-requisitos para atualizar o armazenamento](https://github.com/kadupulhq/kadupul/blob/d579c33c60cca7e4c9d84dbd9e1b2c6ba5492daf/docs/testing/spikekill-safety.md) · [Versões suportadas do PHP](https://www.php.net/supported-versions.php)
