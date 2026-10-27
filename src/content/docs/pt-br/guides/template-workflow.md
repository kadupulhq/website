---
title: "Usar e validar modelos"
description: "Escolha identidades, visualize importações e verifique a propagação sem perder o histórico RRD."
banner:
  content: "O Kadupul está em pré-alfa. Valide estes procedimentos em uma instalação de teste isolada. Tradução em rascunho aguardando revisão linguística."
---

## Escolha as definições corretas

Modelos de dispositivo oferecem modelos de gráficos e consultas de dados; modelos de dados definem entradas de medição e armazenamento. Duplique um modelo parecido quando precisar de uma identidade separada e revise as dependências compartilhadas. A duplicação não torna cada entrada ou perfil referenciado independente. Antes de alterar definições em uso, guarde uma exportação e um backup consistente do banco de dados e dos RRDs. Consulte os conceitos de modelos.

## Visualize e aplique com cuidado

Em uma instalação isolada, examine a origem do XML, as identidades de destino e o perfil de armazenamento escolhido. Na raiz da aplicação, visualize o XML de modelo simples:

```sh
php cli/import_template.php --filename=/secure/template.xml --preview
```

A `main` atual retorna status diferente de zero para entrada ilegível, XML malformado e falhas de objetos registradas. Confira também diagnósticos e resultados por objeto; uma importação pode atualizar identidades existentes. Importações de pacotes têm um caminho separado de gravação de arquivos. Consulte importação e exportação.

## Verifique objetos derivados e histórico

Após aplicar, confira dispositivos representativos, mapeamentos locais de itens de gráficos, substituições individuais e valores coletados. Alterações nas associações de modelos de dispositivo exigem sua operação de sincronização separada. Salvar um modelo de dados não muda a estrutura dos RRDs existentes; inspecione o arquivo real antes de mudar passo, heartbeat ou retenção. Pare os processos de gravação antes da recuperação coordenada e restaure o backup consistente se necessário. Consulte modelos personalizados e retenção.

[Conceitos de modelos](/pt-br/concepts/templates/) · [Importação e exportação](/pt-br/guides/import-and-export-templates/) · [Modelos personalizados](/pt-br/guides/create-custom-templates/) · [Retenção](/pt-br/guides/manage-data-retention/)

Base da aplicação verificada em 26 de outubro de 2026: [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
