---
title: "Instalar a partir de um host Windows"
description: "Avalie o Kadupul em Linux hospedado no Windows e entenda os bloqueios do Windows nativo."
banner:
  content: "O Kadupul está em pré-alfa. Este procedimento de plataforma não foi validado de ponta a ponta. Tradução em rascunho aguardando revisão linguística."
---

## Escolha o ambiente de execução

A `main` atual exige PHP 8.4+, `pcntl` e `posix`; o PHP nativo do Windows não atende a esses requisitos Unix. Não ignore as verificações de plataforma do Composer. Use uma VM Linux ou avalie o WSL 2 em uma versão do Windows com suporte da Microsoft. São instalações Linux hospedadas no Windows, não implantações IIS nativas validadas. Consulte os limites de plataforma do PHP.

## Prepare o Linux e instale

Para WSL, execute o seguinte no PowerShell como administrador e reinicie se solicitado:

```powershell
wsl --install -d Ubuntu
wsl --list --verbose
```

Confirme a versão 2. Conclua a criação da conta Linux e siga a instalação dentro do Linux para banco de dados, extensões PHP, recursos, servidor web e agendador. Mantenha código e armazenamento RRD no sistema de arquivos Linux, fora de `/mnt/c/`. Consulte os guias da Microsoft sobre WSL e sistemas de arquivos.

## Verifique o ciclo de vida e a recuperação

Use contas dedicadas sem privilégios e um único mecanismo de inicialização da coleta. Verifique a confiança do armazenamento, o polling, os horários dos gráficos e o comportamento após reiniciar o host ou encerrar o WSL. Não presuma que uma sessão de desktop mantém a coleta ativa. Faça backup conjunto de banco de dados, configuração e RRDs. Manutenção destrutiva de RRDs e limpeza ou arquivamento automático local continuam indisponíveis no Windows nativo; o comportamento do Linux não os valida. Consulte requisitos e backup.

[Limites do PHP](https://www.php.net/manual/en/pcntl.installation.php) · [Instalação](/pt-br/start/install/) · [Guia WSL da Microsoft](https://learn.microsoft.com/en-us/windows/wsl/install) · [Sistemas de arquivos](https://learn.microsoft.com/en-us/windows/wsl/filesystems) · [Requisitos](/pt-br/reference/requirements/) · [Backup](/pt-br/guides/back-up-and-restore/)

Base da aplicação verificada em 26 de outubro de 2026: [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
