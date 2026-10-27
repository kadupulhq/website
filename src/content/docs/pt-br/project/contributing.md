---
title: Contribuindo
description: Do que o projeto precisa, os padrões de engenharia adotados nas alterações e os critérios de avaliação.
banner:
  content: O Kadupul está em fase pré-alfa. O código está disponível, mas não existe uma versão com suporte para produção nem uma migração validada. Não o utilize em produção.
sidebar:
  order: 6
---

O código-fonte está disponível e o repositório documenta um processo de contribuição. Leia o arquivo [CONTRIBUTING.md](https://github.com/kadupulhq/kadupul/blob/main/CONTRIBUTING.md) antes de começar. Discuta alterações substanciais no rastreador de problemas antes da implementação.

## O padrão

Mantenha cada solicitação de pull request focada em um único objetivo. Reproduza um bug antes de corrigi-lo, verifique o comportamento modificado e inclua os comandos de validação e os resultados obtidos. Preserve interfaces públicas, a menos que a alteração envolva uma migração documentada.

## Padrões de engenharia

Siga as regras estabelecidas para o branch que você está alterando. Consulte o guia de colaboradores e a configuração de CI atuais, em vez de assumir que ambos os branches utilizam as mesmas regras.

### Estilo

No branch `main`, os arquivos PHP editados seguem o padrão PHP-FIG PER-CS 2.0. Reformate cada arquivo afetado em um commit dedicado exclusivamente a espaços em branco e verifique-o com `tests/tools/check_php_style.sh`. O branch `lts/1.2` mantém a formatação original upstream.

### Análise estática

Execute as verificações exigidas pelo branch de destino. Este site não prescreve um nível PHPStan, uma interface de log ou uma migração de carregamento automático que o repositório não tenha expressamente adotado.

### Testes

Valide o comportamento alterado pela correção. Inclua um caso de regressão para a correção de bugs e demonstre os comandos utilizados. A aprovação em testes não relacionados não valida a correção realizada.

### Dependências

Explique por que uma dependência é necessária, verifique sua licença e atualize o manifesto e o arquivo de bloqueio correspondentes. Siga as diretrizes de gerenciamento de dependências e validação do repositório.

### Commits e pull requests

Utilize Conventional Commits e assine cada commit com `git commit -s` sob o [Developer Certificate of Origin](https://developercertificate.org/). Separe a formatação visual das alterações funcionais para que cada aspecto possa ser revisado de modo independente.

## A árvore herdada não atende a esses padrões

A estrutura de arquivos contém padrões de implementação e formatação herdados. A adequação é orientada pelas normas do branch de destino, e não por uma reescrita indiscriminada do projeto como um todo.

### Qual regra deve prevalecer?

Siga o arquivo `CONTRIBUTING.md` do branch pretendido. No branch `main`, aplica-se a regra PER-CS aos arquivos alterados; no `lts/1.2`, preserve o estilo herdado.

## Documentação

Valide afirmações com base na implementação prática e utilize materiais cuja licença autorize sua inclusão. Não copie textos de terceiros sem antes verificar suas licenças. Notifique problemas de segurança por meio do [processo de comunicação confidencial](/pt-br/project/security/).

## Compatibilidade

Interfaces de plugins, templates, compatibilidade do banco de dados e dados RRD constituem metas de lançamento. Documente qualquer mudança de interface e forneça comprovação de migração e compatibilidade. Veja [Compatibilidade com o Cacti](/pt-br/project/compatibility-with-cacti/).
