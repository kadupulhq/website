---
title: "O que é o Kadupul"
description: "Coleta, armazenamento, arquitetura e limites do projeto para planejar 2026–2027."
sidebar:
  order: 1
banner:
  content: "O Kadupul está em pré-alfa. Valide estes procedimentos em uma instalação de teste isolada. Tradução em rascunho, pendente de revisão por uma pessoa fluente no idioma."
---

O Kadupul é uma aplicação de monitoramento de redes e geração de gráficos. Coleta medições por SNMP e scripts, armazena séries temporais em arquivos RRD e gera gráficos com RRDtool. Esta visão geral foi verificada em 26 de outubro de 2026 com a revisão da aplicação indicada abaixo.
[`005d797cc`](https://github.com/kadupulhq/kadupul/tree/005d797cca3884f7f60e7778f631f2fcfedad4cf).

## Situação do projeto para 2026–2027

O Kadupul está em pré-alfa, sem versão com suporte para produção nem caminho de migração para produção validado. Use uma instalação de teste isolada. As datas nesta documentação servem para planejamento, não são compromissos de entrega. Confira a situação do projeto antes de escolher uma revisão para avaliar.

[Situação do projeto](/pt-br/project/status/)

## Coleta e agendamento

Um agendador externo inicia o poller. Ele lê uma lista de coleta preparada, chama o coletor PHP ou uma compilação compatível do Spine e processa os resultados. Os intervalos de coleta são configuráveis; cinco minutos é um exemplo, não uma regra universal. Um mecanismo de inicialização pode executar vários ciclos menores dentro de seu intervalo. Tempos de espera, novas tentativas e latência dos dispositivos consomem esse tempo disponível.

[Ciclo do poller](/pt-br/reference/poller-lifecycle/)

## Retenção e armazenamento

Um arquivo RRD tem uma estrutura de armazenamento escolhida na criação. Medições recentes podem manter mais detalhes que valores antigos consolidados; a retenção é limitada pelos arquivos de consolidação configurados. Ele não guarda todas as amostras para sempre. Valores desconhecidos representam observações ausentes ou inutilizáveis, não zero. Filas, logs e estatísticas do banco de dados podem crescer mesmo quando os arquivos RRD existentes mantêm tamanho fixo.

[Fontes de dados e arquivos de consolidação](/pt-br/concepts/data-sources-and-rras/)

## Gráficos e termos compartilhados

Um dispositivo é um ponto monitorado. Uma consulta de dados descobre itens como interfaces. Uma fonte de dados descreve uma medição e seu armazenamento; um gráfico descreve como representá-la. Modelos reutilizam definições e árvores organizam a navegação. São registros separados: revise as opções de exclusão e dependências antes de removê-los. Os gráficos são gerados sob demanda a partir dos dados retidos; o cache de imagens pode reutilizar um resultado já renderizado.

[Glossário](/pt-br/reference/glossary/)

## Componentes da instalação

Uma instalação funcional combina a aplicação web PHP, MySQL ou MariaDB, armazenamento RRD, RRDtool e um mecanismo de inicialização da coleta. As credenciais dos dispositivos e a configuração ficam no banco de dados ou em arquivos de configuração protegidos. Faça backup do código, configuração, filas do banco de dados e histórico RRD como um conjunto consistente e ensaie a restauração. Um dump do banco de dados sozinho não restaura os gráficos históricos.

[Backup e recuperação](/pt-br/guides/back-up-and-restore/)

## Main e a migração para Symfony

A branch `main` da aplicação exige PHP 8.4 ou mais recente e combina serviços Symfony 7.4 com pontos de entrada legados da web, do poller e da CLI. A linha de manutenção `lts/1.2` tem requisitos próprios. As rotas migradas coexistem com as legadas; um serviço Symfony não comprova que o fluxo antigo foi desativado. Checkouts do código-fonte precisam de dependências PHP bloqueadas e recursos de navegador gerados. Use os ambientes de execução do arquivo `mise.toml` da aplicação.

[Guia de migração](https://github.com/kadupulhq/kadupul/blob/005d797cca3884f7f60e7778f631f2fcfedad4cf/docs/symfony-migration.md)

## Contas, plugins e acesso ao armazenamento

A visibilidade de dispositivos e gráficos depende das permissões de usuários e grupos. Plugins são executados como código confiável da aplicação, com o acesso da conta do processo; não ficam isolados em sandbox. Revise a procedência, os hooks e o comportamento de instalação e desinstalação antes de ativá-los. Processos que gravam RRD locais no Unix exigem verificações de identidade POSIX e configurações explícitas de confiança quando as contas web e do poller são diferentes. O Windows não oferece manutenção destrutiva de RRD locais.

[Avaliação de plugins](/pt-br/guides/install-and-vet-plugins/)

## Usos adequados e limites

Avalie o Kadupul para interfaces de rede, contadores de dispositivos, sensores ambientais e outras medições disponíveis por métodos de coleta que você possa validar. É software auto-hospedado que exige manutenção do banco de dados, da web e do agendador. O monitoramento numérico do núcleo não é um repositório de logs, sistema de rastreamento distribuído nem mecanismo geral de consultas por rótulos de alta cardinalidade. Alertas por limites dependem de plugins adequados; verifique a compatibilidade em vez de presumir que funcionem logo após a instalação.

## Origem, nome e compatibilidade

O Kadupul é um fork independente do Cacti, licenciado sob GPL-3.0-or-later, sem afiliação ou endosso do The Cacti Group. Seu nome em cingalês, කඩුපුල්, refere-se a *Epiphyllum oxypetalum*, um cacto que floresce à noite. Preservar interfaces de plugins, modelos, esquemas e histórico RRD existente é uma meta de lançamento que exige evidências para cada revisão do código e combinação de plugins.

[Compatibilidade](/pt-br/project/compatibility-with-cacti/)

## Comece com um dispositivo verificado

Siga instalação, primeiro dispositivo e primeiro gráfico nessa ordem. Confira logs, horários de coleta e valores utilizáveis antes de confiar na imagem. Meça a duração dos ciclos e o trabalho em fila com seus dispositivos antes de expandir. Consulte os conceitos para entender o projeto e os requisitos para conhecer as condições necessárias.

[Instalação](/pt-br/start/install/) · [Primeiro dispositivo](/pt-br/start/first-device/) · [Primeiro gráfico](/pt-br/start/first-graph/) · [Conceitos](/pt-br/concepts/architecture/) · [Requisitos](/pt-br/reference/requirements/)
