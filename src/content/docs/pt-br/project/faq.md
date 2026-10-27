---
title: Perguntas Frequentes
description: Respostas diretas para as primeiras dúvidas de novos usuários e usuários atuais do Cacti, com link para a página que aprofunda cada tema.
banner:
  content: O Kadupul está em fase pré-alfa. O código está disponível, mas não existe uma versão com suporte para produção nem uma migração validada. Não o utilize em produção.
sidebar:
  order: 7
---

Respostas curtas. Cada uma traz um link para a página que trata do assunto detalhadamente.

## O projeto

### Posso instalar hoje mesmo?

O código-fonte está disponível para tarefas de desenvolvimento e testes em ambientes isolados. Não existe uma versão com suporte oficial nem um procedimento de instalação validado para produção.

As instruções de instalação e os tutoriais práticos exigem validação em relação ao código efetivamente utilizado. Consulte [Status do projeto](/pt-br/project/status/).

### Está pronto para uso em produção?

Não. O repositório classifica o Kadupul como pré-alfa e não preparado para produção. O status de lançamento não indica se alguém implementou código em desenvolvimento por conta própria.

### Trata-se de uma substituição para o Cacti?

O Kadupul é uma bifurcação independente com prioridades de desenvolvimento e canais de suporte próprios. Está em fase pré-alfa; uma migração exige validação das versões e extensões utilizadas. Consulte [Migrando a partir do Cacti](/pt-br/guides/coming-from-cacti/).

### Por que criar um projeto separado?

O Kadupul oferece um espaço para substituir subsistemas, modernizar a versão básica da linguagem e ajustar interfaces internas sob uma política de lançamentos própria. Consulte [Por que esta bifurcação existe](/pt-br/project/why-this-fork/).

### A partir de qual versão do Cacti ele foi bifurcado?

A aplicação se origina do Cacti 1.2.31. O repositório mantém as ramificações `main` e `lts/1.2` com diferentes metas de lançamento. Veja [Status do projeto](/pt-br/project/status/).

### Quem gerencia sua manutenção?

O projeto Kadupul é responsável pelo repositório. Utilize o rastreador de problemas e o [processo de contribuição](/pt-br/project/contributing/) para participar dos trabalhos.

### Existe um roteiro, um cronograma de lançamentos ou uma política de suporte?

O repositório possui metas de lançamento, uma política de versionamento e um processo de contribuição estruturado. Não existe ainda uma versão de produção com suporte formal. Consulte [Status do projeto](/pt-br/project/status/) para compreender a diferença entre versões planejadas e artefatos já disponibilizados.

### Tem afiliação com The Cacti Group?

Não. O Kadupul não é afiliado nem endossado por The Cacti Group. O projeto se descreve como uma bifurcação do Cacti por ser uma declaração factual a respeito da origem do código. Cacti é o projeto e a marca deles.

### O que significa esse nome?

Kadupul é o nome em cingalês de um cacto cuja floração ocorre à noite. O Cacti deriva seu nome da família botânica como um todo; o Kadupul é uma espécie específica integrada a ela. O nome destaca as raízes do projeto sem alegar representar a totalidade do ecossistema. Uma explicação mais detalhada está disponível em [O que é o Kadupul](/pt-br/start/what-kadupul-is/).

## Migrando a partir do Cacti

### Meus plugins vão funcionar?

Essa é a intenção planejada. A API de plugins é uma das quatro metas fundamentais de compatibilidade. O carregamento e a execução de um plugin do Cacti sem modificações devem ser comprovados na prática para as versões utilizadas.

Compatibilidade é um objetivo, não uma garantia genérica para qualquer plugin. Avalie os plugins e versões dos quais você realmente depende antes de planejar uma migração. Consulte [Compatibilidade com o Cacti](/pt-br/project/compatibility-with-cacti/) e [Migrando a partir do Cacti](/pt-br/guides/coming-from-cacti/).

### Meus arquivos RRD continuarão funcionando?

A preservação do histórico de dados RRD é um compromisso essencial de compatibilidade. Esses arquivos armazenam dados históricos impossíveis de gerar novamente. Valide a leitura dos arquivos existentes em uma cópia antes de qualquer migração.

Qualquer procedimento que solicite descartá-los para recriá-los do zero é algo que você deve recusar. Consulte [Migrando a partir do Cacti](/pt-br/guides/coming-from-cacti/).

### Meus templates e meu banco de dados serão transferidos?

Os templates foram projetados para serem importados sem alterações. O esquema do banco de dados deve permanecer reconhecível e passível de migração sem necessidade de exportação para formatos intermediários. São objetivos que requerem validação prática, da mesma forma que os plugins e os arquivos RRD.

### Onde o Kadupul e o Cacti divergirem, como saberei?

Porque isso estará explicitamente documentado. O cenário desfavorável que o projeto busca evitar não é a divergência, que consiste na própria razão de ser de um fork, mas a divergência que ninguém documentou, transformando cada atualização em uma investigação exaustiva.

### Funciona com o Spine?

O Kadupul manterá uma bifurcação do Spine paralelamente ao coletor PHP. A localização do repositório e os pacotes validados ainda não estão documentados neste site. O Spine é compilado e instalado separadamente. A integração herdada inclui a configuração de `poller_type` e os caminhos de sistema, a linha de comando do coletor principal, os parâmetros lidos pelo Spine e as tabelas em que grava dados.

Valide conjuntamente as versões do Kadupul e do Spine antes de uma transição definitiva. Relate problemas no [rastreador de problemas do Kadupul](https://github.com/kadupulhq/kadupul/issues). Veja [Spine, o coletor em C](/pt-br/reference/spine/) para instruções de compilação e ajuste.

### Funciona com o proxy do RRDtool?

O Kadupul não utiliza o daemon de proxy mantido pela organização Cacti. Utilize o armazenamento local do RRDtool. O documento [Referência do proxy do RRDtool](/pt-br/reference/rrdproxy/) registra o protocolo cliente herdado; ele não constitui uma opção de implantação oficialmente suportada. Uma alternativa mantida pelo Kadupul deverá ser desenvolvida e validada antes que o uso do proxy seja formalmente documentado.

### Do que ele precisa para rodar?

Um servidor web com PHP, banco de dados MySQL ou MariaDB, RRDtool e um mecanismo que execute o poller de acordo com um agendamento. As versões e os módulos necessários estão indicados em [Requisitos](/pt-br/reference/requirements/).

## Gestão de licenças

### Sob qual licença o software é distribuído?

GPL-3.0-or-later.

### O Cacti refere a GPL-2. Como uma bifurcação pode adotar a GPL-3?

A licença herdada da aplicação permite expressamente a utilização da versão 2 da GPL ou qualquer versão posterior. O Kadupul faz uso dessa opção de versão mais recente para a sua distribuição. As dependências mantêm seus termos originais de licença. Consulte [Licença](/pt-br/project/license/).

### Qual é a licença desta documentação?

CC BY-SA 4.0. O código do site permanece sob a GPL-3.0-or-later juntamente com o restante do projeto. Você pode reutilizar o texto desde que credite o projeto e licencie as obras derivadas sob termos idênticos.

### De onde vieram essas páginas?

Estas páginas descrevem o comportamento comprovado a partir do código-fonte da aplicação. Textos mantidos por terceiros requerem uma análise de licença própria antes de sua reutilização.

Essa restrição se aplica da mesma forma a colaborações. As alterações na documentação baseiam suas afirmações diretamente no código. Consulte [Contribuindo](/pt-br/project/contributing/).

## Participando

### Como posso relatar uma vulnerabilidade de segurança?

De maneira estritamente confidencial, por meio dos GitHub Security Advisories no repositório afetado. Nunca abrindo um problema público.

Código em desenvolvimento pode estar em execução e conter vulnerabilidades. Encaminhe o relato em sigilo, independentemente do status de lançamento. Veja [Política de segurança](/pt-br/project/security/).

### Uma vulnerabilidade encontrada aqui provavelmente afeta o Cacti também. O que acontece?

Notifique-a confidencialmente ao Kadupul, informando o que você souber sobre o código compartilhado. A equipe de manutenção do Kadupul realiza a triagem e o tratamento das falhas para o Kadupul de acordo com a [política de segurança do repositório](https://github.com/kadupulhq/kadupul/blob/main/SECURITY.md).

### Como posso colaborar?

Consulte [Contribuindo](/pt-br/project/contributing/) e o guia de colaboração correspondente ao branch pretendido. Dialogue sobre alterações expressivas antes de sua implementação prática.

### Encontrei uma falha ou incorreção neste site.

Excelente. Cada página foi escrita com base no código-fonte, e qualquer incorreção reflete fatos objetivos. Cada página contém um link direto para facilitar sua edição.
