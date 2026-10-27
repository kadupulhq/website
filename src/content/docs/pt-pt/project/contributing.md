---
title: Contribuir
description: O que o projeto necessita, os padrões de engenharia a que uma alteração obedece e o critério pelo qual é avaliada.
banner:
  content: O Kadupul está em fase pré-alfa. O código está disponível, mas não existe uma versão com suporte para produção nem uma migração validada. Não o utilize em produção.
sidebar:
  order: 6
---

O código-fonte está disponível e o repositório documenta um processo de contribuição. Leia o ficheiro [CONTRIBUTING.md](https://github.com/kadupulhq/kadupul/blob/main/CONTRIBUTING.md) antes de iniciar qualquer trabalho. Debata alterações substanciais no gestor de incidentes antes de avançar para a sua concretização.

## O padrão

Mantenha cada pull request focada num único objetivo. Reproduza qualquer anomalia antes de a corrigir, verifique o comportamento modificado e inclua os comandos de validação e os respetivos resultados. Preserve as interfaces públicas, salvo se a alteração contemplar uma migração documentada.

## Padrões de engenharia

Cumpra as regras vigentes no ramo em que está a trabalhar. Consulte o guia de colaboradores e a configuração de integração contínua atuais, em vez de assumir que ambos os ramos recorrem às mesmas regras.

### Estilo

No ramo `main`, os ficheiros PHP editados cumprem a norma PHP-FIG PER-CS 2.0. Reformate cada ficheiro visado num commit dedicado em exclusivo a espaços em branco e valide-o com `tests/tools/check_php_style.sh`. O ramo `lts/1.2` mantém a formatação de origem.

### Análise estática

Execute as verificações obrigatórias no ramo de destino. Este sítio web não estabelece um nível PHPStan, uma interface de registo ou uma migração de carregamento automático que o repositório não tenha expressamente adotado.

### Testes

Valide o comportamento modificado pela correção. Forneça um caso de regressão para a resolução de anomalias e apresente os comandos executados. O êxito em testes não relacionados não valida a correção efetuada.

### Dependências

Justifique o motivo pelo qual uma dependência é necessária, confirme a sua licença e atualize o manifesto e o ficheiro de bloqueio correspondentes. Cumpra as regras de gestão de dependências e validação do repositório.

### Commits e pull requests

Recorra aos Conventional Commits e assine cada commit através de `git commit -s` sob o [Developer Certificate of Origin](https://developercertificate.org/). Separe os ajustes de formatação das alterações de comportamento, para que cada vertente seja revista de forma independente.

## A árvore de ficheiros herdada não cumpre estes padrões

A estrutura de ficheiros contém convenções de formatação e padrões de implementação herdados. A harmonização rege-se pelas diretrizes do ramo de destino, e não por uma reformulação indiscriminada de todo o projeto.

### Qual é a regra preponderante?

Siga o ficheiro `CONTRIBUTING.md` do ramo visado. No ramo `main`, aplica-se a regra PER-CS aos ficheiros editados; no `lts/1.2`, preserve o estilo herdado.

## Documentação

Valide as afirmações face à implementação real e utilize materiais cuja licença autorize a sua incorporação. Não copie prosa de terceiros sem verificar previamente a sua licença. Comunique conclusões de segurança através do [processo de comunicação confidencial](/pt-pt/project/security/).

## Compatibilidade

As interfaces de módulos, os modelos, a compatibilidade de base de dados e os dados RRD constituem objetivos de lançamento. Documente qualquer modificação de interface e apresente dados que comprovem a migração e a compatibilidade. Consulte [Compatibilidade com o Cacti](/pt-pt/project/compatibility-with-cacti/).
