---
title: "Instalar no FreeBSD"
description: "Prepare serviços, extensões PHP e armazenamento local do FreeBSD para uma avaliação isolada."
banner:
  content: "O Kadupul está em pré-alfa. Este procedimento de plataforma não foi validado de ponta a ponta. Tradução em rascunho aguardando revisão linguística."
---

## Selecione e prepare o host

Use uma versão listada na tabela de versões com suporte do FreeBSD e planeje suas atualizações até 2027. Suporte do sistema operacional não comprova compatibilidade com Kadupul. Instale PHP 8.4+, MySQL ou MariaDB, RRDtool, Net-SNMP e um servidor web usando o manual de pacotes e ports. Os padrões de `php84-extensions` não cobrem toda a lista de extensões da aplicação; instale os módulos ausentes, inclusive `pcntl` para CLI, antes das dependências.

## Verifique o ambiente e configure serviços

Verifique o interpretador CLI e as ferramentas selecionados:

```sh
php -v
php -m
rrdtool --version
snmpget --version
```

Confira o PHP web separadamente. Para PHP-FPM empacotado, configure o pool e a conexão do servidor web antes de ativar o serviço `php_fpm`. O FreeBSD usa serviços rc, não systemd; siga o manual de serviços. Siga a instalação para banco de dados, configuração, esquema e recursos do navegador. Combine as versões das ferramentas com o `mise.toml` da aplicação; esses valores não comprovam que os instaladores de ambientes do mise funcionem no FreeBSD.

## Agende e verifique com as contas de serviço

Use um único inicializador cron com caminhos absolutos e o intervalo configurado; não instale a unidade systemd do Linux. Valide identidade POSIX, bloqueio de diretórios, propriedade e confiança explícita de UID/GID com cada conta web e do poller antes da coleta. Em jails, confira rede, montagens e permissões dentro da jail. Execute um ciclo sem sobreposição, inspecione linhas retidas na fila e horários dos gráficos e ensaie a restauração do backup consistente. Um processo iniciar com sucesso não basta. Consulte requisitos e backup.

[Versões com suporte do FreeBSD](https://www.freebsd.org/security/) · [Pacotes e ports](https://docs.freebsd.org/en/books/handbook/ports/) · [Serviços do FreeBSD](https://docs.freebsd.org/en/books/handbook/config/) · [Instalação](/pt-br/start/install/) · [Requisitos](/pt-br/reference/requirements/) · [Backup](/pt-br/guides/back-up-and-restore/)

Base da aplicação verificada em 26 de outubro de 2026: [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
