---
title: "Compatibilidade com Cacti"
description: "Escopo, evidências de verificação e limites de compatibilidade para planejar 2026–2027."
sidebar:
  order: 2
banner:
  content: "O Kadupul está em pré-alfa. Valide estes procedimentos em uma instalação de teste isolada. Tradução em rascunho aguardando revisão linguística."
---

Compatibilidade é uma meta de lançamento, não a afirmação de que toda versão, plugin ou modelo do Cacti funciona sem alterações. O Kadupul continua em pré-alfa. Avalie a revisão exata do código e os componentes usados antes de confiar no comportamento.

## O que isso abrange

Verifique hooks de plugins, comportamento de argumentos e retornos e permissões; identidades de modelos, mapeamentos de entrada e propagação; semântica de esquema, padrões e referências; e caminhos, campos, arquivos de consolidação e valores retidos de RRD existentes. Um perfil correspondente no banco de dados não comprova a mesma estrutura no arquivo RRD. Plugins executam como código confiável da aplicação, não em sandbox. Consulte modelos e avaliação de plugins.

## O que significa na prática

Registre branch e revisão da aplicação, PHP e dependências bloqueadas, versões de plugins, estado do esquema e configuração de armazenamento. Teste coleta, geração de gráficos, autorização, falhas e recuperação em uma cópia restaurada isolada. Inclua coletores remotos e trabalho em segundo plano quando usados. Documente diferenças intencionais e lacunas restantes; os testes cobrem apenas os caminhos executados. Consulte ensaio de atualização e backup.

## O que não garante

Não há garantia geral de compatibilidade binária, de esquema ou de plugins, nem versão de produção com suporte nem caminho de migração para produção validado. Reverter só o código não desfaz alterações de esquema ou RRD; a recuperação pode exigir o conjunto consistente de backups. Use as fontes mantidas do projeto e registre sua procedência em vez de presumir que arquivos de outro projeto formam um pacote Kadupul testado. O Kadupul não tem afiliação nem endosso do The Cacti Group. Consulte a situação.

[Modelos](/pt-br/concepts/templates/) · [Avaliação de plugins](/pt-br/guides/install-and-vet-plugins/) · [Ensaio de atualização](/pt-br/guides/upgrade-safely/) · [Backup](/pt-br/guides/back-up-and-restore/) · [Situação](/pt-br/project/status/)

Base da aplicação verificada em 26 de outubro de 2026: [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
