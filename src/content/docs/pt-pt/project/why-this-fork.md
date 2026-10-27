---
title: "Por que este fork existe"
description: "Prioridades independentes e critérios de aceitação da migração para 2026–2027."
sidebar:
  order: 1
banner:
  content: "O Kadupul está em pré-alfa. Valide estes procedimentos numa instalação de teste isolada. Tradução em rascunho aguardando revisão linguística."
---

O Kadupul é um fork independente do Cacti com suas próprias decisões de desenvolvimento, lançamento e suporte. As prioridades a seguir orientam o planeamento de 2026–2027; não são datas de entrega nem evidência de prontidão para produção.

## Prioridades de desenvolvimento

O ramo `main` da aplicação exige PHP 8.4+ e combina serviços Symfony 7.4 com caminhos legados da web, do poller e da CLI. A linha de manutenção `lts/1.2` tem requisitos próprios. A migração busca tornar explícitos os limites dos casos de uso, a autorização, o tratamento de falhas e a verificação, preservando os contratos necessários de recolha e gráficos. Um serviço moderno ou um conjunto de testes aprovado não comprova que todo o fluxo foi migrado. Consulte a arquitetura.

## Compatibilidade e migração

Preservar plugins, modelos, esquemas e histórico RRD é uma meta de lançamento que exige evidências por versão. Cada migração deve identificar o caminho ativo de escrita, preservar as correções de manutenção aplicáveis e considerar trabalho em fila ou em curso. Ensaie instalação, recuperação e alterações de esquema numa cópia isolada com cópias de segurança consistentes. Hoje não há caminho validado de migração para produção. Consulte compatibilidade e situação.

Estas prioridades descrevem o Kadupul, não os planos de outro projeto nem um acordo com seus mantenedores. O Kadupul não tem afiliação nem endosso do The Cacti Group.

[Arquitetura](https://github.com/kadupulhq/kadupul/blob/cbd6117d6e1092ef887c66f9844bef004a65119e/docs/architecture.md) · [Compatibilidade](/pt-pt/project/compatibility-with-cacti/) · [Situação](/pt-pt/project/status/)

Base da aplicação verificada em 26 de outubro de 2026: [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
