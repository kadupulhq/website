---
title: "O que é o Kadupul"
description: "Recolha, armazenamento, arquitetura e limites do projeto para planear 2026–2027."
sidebar:
  order: 1
banner:
  content: "O Kadupul está em pré-alfa. Valide estes procedimentos numa instalação de teste isolada. Tradução em rascunho, pendente de revisão por uma pessoa fluente no idioma."
---

O Kadupul é uma aplicação de monitorização de redes e geração de gráficos. Recolhe medições por SNMP e scripts, armazena séries temporais em ficheiros RRD e gera gráficos com RRDtool. Esta descrição geral foi verificada em 26 de outubro de 2026 com a revisão da aplicação indicada abaixo.
[`005d797cc`](https://github.com/kadupulhq/kadupul/tree/005d797cca3884f7f60e7778f631f2fcfedad4cf).

## Estado do projeto para 2026–2027

O Kadupul está em pré-alfa, sem versão com suporte para produção nem caminho de migração para produção validado. Use uma instalação de teste isolada. As datas nesta documentação servem para planeamento, não são compromissos de entrega. Confira a situação do projeto antes de escolher uma revisão para avaliar.

[Estado do projeto](/pt-pt/project/status/)

## Recolha e agendamento

Um agendador externo inicia o poller. Este lê uma lista de recolha preparada, chama o coletor PHP ou uma compilação compatível do Spine e processa os resultados. Os intervalos de recolha são configuráveis; cinco minutos é um exemplo, não uma regra universal. Um mecanismo de arranque pode executar vários ciclos mais curtos dentro do respetivo intervalo. Tempos de espera, novas tentativas e latência dos dispositivos consomem esse tempo disponível.

[Ciclo do poller](/pt-pt/reference/poller-lifecycle/)

## Retenção e armazenamento

Um ficheiro RRD tem uma estrutura de armazenamento escolhida na criação. As medições recentes podem manter mais detalhes do que os valores antigos consolidados; a retenção é limitada pelos arquivos de consolidação configurados. Não guarda todas as amostras para sempre. Os valores desconhecidos representam observações ausentes ou inutilizáveis, não zero. Filas, registos e estatísticas da base de dados podem crescer mesmo quando os ficheiros RRD existentes mantêm um tamanho fixo.

[Fontes de dados e arquivos de consolidação](/pt-pt/concepts/data-sources-and-rras/)

## Gráficos e termos partilhados

Um dispositivo é um ponto monitorizado. Uma consulta de dados descobre itens como interfaces. Uma fonte de dados descreve uma medição e seu armazenamento; um gráfico descreve como representá-la. Modelos reutilizam definições e árvores organizam a navegação. São registos separados: revise as opções de eliminação e dependências antes de removê-los. Os gráficos são gerados sob demanda a partir dos dados retidos; o cache de imagens pode reutilizar um resultado já renderizado.

[Glossário](/pt-pt/reference/glossary/)

## Componentes da instalação

Uma instalação funcional combina a aplicação Web PHP, MySQL ou MariaDB, armazenamento RRD, RRDtool e um mecanismo de arranque da recolha. As credenciais dos dispositivos e a configuração ficam na base de dados ou em ficheiros de configuração protegidos. Faça cópias de segurança do código, da configuração, das filas da base de dados e do histórico RRD como um conjunto consistente e ensaie o restauro. Uma exportação da base de dados, por si só, não restaura os gráficos históricos.

[Cópias de segurança e recuperação](/pt-pt/guides/back-up-and-restore/)

## Main e a migração para Symfony

O ramo `main` da aplicação exige PHP 8.4 ou posterior e combina serviços Symfony 7.4 com pontos de entrada legados da Web, do poller e da CLI. A linha de manutenção `lts/1.2` tem requisitos próprios. As rotas migradas coexistem com as legadas; um serviço Symfony não comprova que o fluxo antigo foi desativado. As cópias do código-fonte precisam de dependências PHP bloqueadas e recursos de navegador gerados. Utilize os ambientes de execução do ficheiro `mise.toml` da aplicação.

[Guia de migração](https://github.com/kadupulhq/kadupul/blob/005d797cca3884f7f60e7778f631f2fcfedad4cf/docs/symfony-migration.md)

## Contas, plugins e acesso ao armazenamento

A visibilidade de dispositivos e gráficos depende das permissões de utilizadores e grupos. Plugins são executados como código confiável da aplicação, com o acesso da conta do processo; não ficam isolados em sandbox. Revise a procedência, os hooks e o comportamento de instalação e desinstalação antes de ativá-los. Processos que escrevem RRD locais no Unix exigem verificações de identidade POSIX e configurações explícitas de confiança quando as contas web e do poller são diferentes. O Windows não oferece manutenção destrutiva de RRD locais.

[Avaliação de plugins](/pt-pt/guides/install-and-vet-plugins/)

## Usos adequados e limites

Avalie o Kadupul para interfaces de rede, contadores de dispositivos, sensores ambientais e outras medições disponíveis por métodos de recolha que possa validar. É software autoalojado que exige manutenção da base de dados, da Web e do agendador. A recolha numérica do núcleo não é um repositório de registos, um sistema de rastreio distribuído nem um mecanismo geral de consultas por etiquetas de elevada cardinalidade. Os alertas por limites dependem de plugins adequados; verifique a compatibilidade em vez de presumir que funcionam logo após a instalação.

## Origem, nome e compatibilidade

O Kadupul é um fork independente do Cacti, licenciado sob GPL-3.0-or-later, sem afiliação ou endosso do The Cacti Group. Seu nome em cingalês, කඩුපුල්, refere-se a *Epiphyllum oxypetalum*, um cacto que floresce à noite. Preservar interfaces de plugins, modelos, esquemas e histórico RRD existente é uma meta de lançamento que exige evidências para cada revisão do código e combinação de plugins.

[Compatibilidade](/pt-pt/project/compatibility-with-cacti/)

## Comece com um dispositivo verificado

Siga instalação, primeiro dispositivo e primeiro gráfico nessa ordem. Confira registos, horários de recolha e valores utilizáveis antes de confiar na imagem. Meça a duração dos ciclos e o trabalho em fila com os seus dispositivos antes de expandir. Consulte os conceitos para entender o projeto e os requisitos para conhecer as condições necessárias.

[Instalação](/pt-pt/start/install/) · [Primeiro dispositivo](/pt-pt/start/first-device/) · [Primeiro gráfico](/pt-pt/start/first-graph/) · [Conceitos](/pt-pt/concepts/architecture/) · [Requisitos](/pt-pt/reference/requirements/)
