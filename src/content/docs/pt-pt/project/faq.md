---
title: Perguntas Frequentes
description: Respostas sintéticas às primeiras dúvidas de novos utilizadores e utilizadores atuais do Cacti, com ligação para a página de referência adequada.
banner:
  content: O Kadupul está em fase pré-alfa. O código está disponível, mas não existe uma versão com suporte para produção nem uma migração validada. Não o utilize em produção.
sidebar:
  order: 7
---

Respostas breves. Cada uma inclui uma ligação para a página que aprofunda o assunto na íntegra.

## O projeto

### Posso instalá-lo hoje?

O código-fonte está disponível para tarefas de desenvolvimento e testes em ambientes isolados. Não existe uma versão com suporte oficial nem um procedimento de instalação validado para produção.

As instruções de instalação e os guias práticos devem ser validados face ao código que utiliza em concreto. Consulte a página de [Estado do projeto](/pt-pt/project/status/).

### Encontra-se pronto para produção?

Não. O repositório classifica o Kadupul como pré-alfa e inapto para ambientes de produção. O estado de lançamento não fornece indicação sobre se terceiros implementaram código em desenvolvimento.

### É um substituto para o Cacti?

O Kadupul é uma bifurcação independente com prioridades de engenharia e canais de apoio próprios. Encontra-se em fase pré-alfa; uma migração exige a validação prévia das versões e extensões utilizadas. Consulte o guia [Vindo do Cacti](/pt-pt/guides/coming-from-cacti/).

### Por que razão criar um projeto autónomo?

O Kadupul proporciona o enquadramento adequado para substituir subsistemas, modernizar o nível de base da linguagem e reformular interfaces internas ao abrigo de uma política de lançamentos própria. Consulte [Razões da existência desta bifurcação](/pt-pt/project/why-this-fork/).

### A partir de que versão do Cacti foi criada a bifurcação?

A aplicação tem origem no Cacti 1.2.31. O repositório mantém os ramos `main` e `lts/1.2` com diferentes metas de lançamento. Consulte a página de [Estado do projeto](/pt-pt/project/status/).

### Quem assegura a sua manutenção?

O projeto Kadupul gere e mantém o repositório. Recorra ao gestor de incidentes e ao [processo de contribuição](/pt-pt/project/contributing/) para participar nas atividades do projeto.

### Existe um roteiro, uma cadência de lançamentos ou uma política de suporte?

O repositório define metas de lançamento, uma política de versionamento e um processo de contribuição. Não existe ainda uma versão de produção com suporte formal. Consulte a página de [Estado do projeto](/pt-pt/project/status/) para distinguir versões planeadas de artefactos já disponibilizados.

### Tem ligação com The Cacti Group?

Não. O Kadupul não tem qualquer filiação nem é apoiado por The Cacti Group. Descreve-se como uma bifurcação do Cacti por ser uma declaração factual respeitante à génese do seu código. Cacti é o projeto e a marca deles.

### Qual o significado do nome?

Kadupul é a designação em cingalês para um cato cuja floração se dá durante a noite. Cacti tem como origem o nome da família botânica global; o Kadupul é uma espécie específica integrada nela. O nome ilustra de onde o projeto procede sem ambicionar fazer-se passar pela totalidade do ecossistema. Encontrará uma explicação mais detalhada em [O que é o Kadupul](/pt-pt/start/what-kadupul-is/).

## Vindo do Cacti

### Os meus módulos adicionais (plugins) vão funcionar?

Essa é a intenção preconizada. A API de módulos é um dos quatro objetivos centrais de compatibilidade. O carregamento e a execução de um plugin do Cacti sem modificações têm de ser demonstrados para as versões utilizadas.

A compatibilidade constitui um objetivo, não uma garantia genérica aplicável a todo e qualquer plugin. Verifique os módulos e as versões de que efetivamente depende antes de delinear uma migração. Consulte [Compatibilidade com o Cacti](/pt-pt/project/compatibility-with-cacti/) e [Vindo do Cacti](/pt-pt/guides/coming-from-cacti/).

### Os meus ficheiros RRD vão funcionar?

Preservar os históricos RRD representa um compromisso de compatibilidade fundamental. Os ficheiros contêm históricos que não é possível recriar. Valide a leitura de ficheiros existentes com recurso a uma cópia de segurança antes de qualquer migração.

Qualquer procedimento de migração que exija descartá-los e recriá-los do zero consiste em algo que deve recusar. Consulte [Vindo do Cacti](/pt-pt/guides/coming-from-cacti/).

### Os meus modelos e a base de dados serão mantidos?

Os modelos foram desenhados para serem importados sem qualquer alteração. O esquema de dados está concebido para permanecer reconhecível e migrabile sem necessidade de exportação para formatos intermédios. Trata-se de metas que exigem validação prévia, tal como sucede com os módulos e os ficheiros RRD.

### Quando o Kadupul e o Cacti divergirem, como tomarei conhecimento?

Por constar de forma explícita na documentação. A situação desfavorável que o projeto pretende evitar não é a divergência, que constitui a essência de uma bifurcação, mas a divergência que ninguém documentou, transformando qualquer atualização numa investigação minuciosa.

### Funciona com o Spine?

O Kadupul manterá uma bifurcação do Spine em articulação com o módulo de recolha em PHP. A localização do respetivo repositório e as compilações validadas ainda não constam neste documento. O Spine é compilado e instalado de forma independente. A integração herdada inclui a configuração de `poller_type` e os caminhos no sistema, a linha de comandos do poller principal, as configurações lidas pelo Spine e as tabelas em que escreve.

Valide conjuntamente as versões do Kadupul e do Spine antes de qualquer transição definitiva. Comunique incidentes através do [gestor de incidentes do Kadupul](https://github.com/kadupulhq/kadupul/issues). Consulte o documento [Spine, o módulo de recolha em C](/pt-pt/reference/spine/) para diretrizes sobre compilação e afinações.

### É compatível com o proxy do RRDtool?

O Kadupul não utiliza o serviço de proxy mantido pela organização Cacti. Utilize armazenamento RRDtool local. O documento de [Referência do proxy do RRDtool](/pt-pt/reference/rrdproxy/) descreve o protocolo cliente herdado; não se trata de uma opção de implementação oficialmente suportada. Uma solução alternativa gerida pelo Kadupul terá de ser concebida e validada antes de qualquer documentação sobre a implementação de proxies.

### De que elementos necessita para ser executado?

Um servidor web com PHP, base de dados MySQL ou MariaDB, RRDtool e um mecanismo que invoque o poller segundo um agendamento estrito. As versões e os módulos necessários encontram-se descritos na página de [Requisitos](/pt-pt/reference/requirements/).

## Gestão de licenças

### Sob que licença é distribuído o software?

GPL-3.0-or-later.

### O Cacti refere a GPL-2. Como pode uma bifurcação recorrer à GPL-3?

A licença de aplicação herdada autoriza formalmente a utilização da versão 2 da GPL ou qualquer versão posterior. O Kadupul recorre a essa opção de versão mais recente para a sua distribuição. As dependências externas mantêm os seus respetivos termos. Consulte [Licença](/pt-pt/project/license/).

### Qual a licença aplicada a esta documentação?

CC BY-SA 4.0. O código do sítio web mantém-se sob a GPL-3.0-or-later juntamente com o restante projeto. Pode reutilizar o conteúdo escrito desde que atribua o devido crédito ao projeto e licencie as criações derivadas em termos idênticos.

### Qual a proveniência destas páginas?

Estas páginas descrevem o comportamento demonstrado a partir do código-fonte da aplicação. Qualquer texto proveniente de terceiros exige uma avaliação de licença autónoma antes de ser reutilizado.

Esta diretriz aplica-se igualmente às colaborações efetuadas. As alterações documentais fundamentam as suas premissas no código. Consulte [Contribuir](/pt-pt/project/contributing/).

## Participação

### Como comunicar uma vulnerabilidade de segurança?

De forma confidencial, através dos GitHub Security Advisories no repositório afetado. Nunca abrindo um incidente público.

Código em desenvolvimento pode estar em utilização e albergar fragilidades. Efetue a comunicação de forma privada, independentemente de existir uma versão oficial. Consulte a nossa [Política de segurança](/pt-pt/project/security/).

### Uma vulnerabilidade encontrada neste projeto afeta provavelmente o Cacti. O que deve ser feito?

Comunique-a com carácter confidencial ao Kadupul, juntando as informações de que disponha sobre o código partilhado. Os responsáveis pelo Kadupul asseguram a triagem e a resolução para o Kadupul de acordo com a [política de segurança do repositório](https://github.com/kadupulhq/kadupul/blob/main/SECURITY.md).

### Como posso colaborar?

Consulte o documento [Contribuir](/pt-pt/project/contributing/) e o guia de colaboração correspondente ao ramo em causa. Apresente e debata alterações relevantes antes de avançar para a sua concretização.

### Encontrei uma incorreção neste sítio web.

Excelente. Cada página aqui apresentada foi elaborada com base no código-fonte, pelo que qualquer incorreção é incorreta por factos concretos. Cada página dispõe de uma ligação direta para facilitar correções.
