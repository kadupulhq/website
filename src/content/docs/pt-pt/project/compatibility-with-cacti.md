---
title: "Compatibilidade com Cacti"
description: "Escopo, evidências de verificação e limites de compatibilidade para planear 2026–2027."
sidebar:
  order: 2
banner:
  content: "O Kadupul está em pré-alfa. Valide estes procedimentos numa instalação de teste isolada. Tradução em rascunho aguardando revisão linguística."
---

Compatibilidade é uma meta de lançamento, não a afirmação de que toda versão, plugin ou modelo do Cacti funciona sem alterações. O Kadupul continua em pré-alfa. Avalie a revisão exata do código e os componentes usados antes de confiar no comportamento.

## O que isso abrange

Verifique hooks de plugins, comportamento de argumentos e retornos e permissões; identidades de modelos, mapeamentos de entrada e propagação; semântica de esquema, padrões e referências; e caminhos, campos, arquivos de consolidação e valores retidos de RRD existentes. Um perfil correspondente na base de dados não comprova a mesma estrutura no ficheiro RRD. Plugins executam como código confiável da aplicação, não em sandbox. Consulte modelos e avaliação de plugins.

## O que significa na prática

Registre ramo e revisão da aplicação, PHP e dependências bloqueadas, versões de plugins, estado do esquema e configuração de armazenamento. Teste recolha, geração de gráficos, autorização, falhas e recuperação numa cópia restaurada isolada. Inclua coletores remotos e trabalho em segundo plano quando usados. Documente diferenças intencionais e lacunas restantes; os testes cobrem apenas os caminhos executados. Consulte ensaio de atualização e backup.

## O que não garante

Não há garantia geral de compatibilidade binária, de esquema ou de plugins, nem versão de produção com suporte nem caminho de migração para produção validado. Reverter só o código não desfaz alterações de esquema ou RRD; a recuperação pode exigir o conjunto consistente de cópias de segurança. Use as fontes mantidas do projeto e registre sua procedência em vez de presumir que ficheiros de outro projeto formam um pacote Kadupul testado. O Kadupul não tem afiliação nem endosso do The Cacti Group. Consulte a situação.

[Modelos](/pt-pt/concepts/templates/) · [Avaliação de plugins](/pt-pt/guides/install-and-vet-plugins/) · [Ensaio de atualização](/pt-pt/guides/upgrade-safely/) · [Cópias de segurança](/pt-pt/guides/back-up-and-restore/) · [Situação](/pt-pt/project/status/)

Base da aplicação verificada em 26 de outubro de 2026: [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
