---
title: "Usar e validar modelos"
description: "Escolha identidades, visualize importações e verifique a propagação sem perder o histórico RRD."
banner:
  content: "O Kadupul está em pré-alfa. Valide estes procedimentos numa instalação de teste isolada. Tradução em rascunho aguardando revisão linguística."
---

## Escolha as definições corretas

Modelos de dispositivo oferecem modelos de gráficos e consultas de dados; modelos de dados definem entradas de medição e armazenamento. Duplique um modelo parecido quando precisar de uma identidade separada e revise as dependências partilhadas. A duplicação não torna cada entrada ou perfil referenciado independente. Antes de alterar definições em uso, guarde uma exportação e um conjunto coerente de cópias de segurança da base de dados e dos RRDs. Consulte os conceitos de modelos.

## Visualize e aplique com cuidado

Numa instalação isolada, examine a origem do XML, as identidades de destino e o perfil de armazenamento escolhido. Na raiz da aplicação, visualize o XML de modelo simples:

```sh
php cli/import_template.php --filename=/secure/template.xml --preview
```

O ramo `main` atual retorna status diferente de zero para entrada ilegível, XML malformado e falhas de objetos registradas. Verifique também diagnósticos e resultados por objeto; uma importação pode atualizar identidades existentes. Importações de pacotes têm um caminho separado de escrita de ficheiros. Consulte importação e exportação.

## Verifique objetos derivados e histórico

Após aplicar, confira dispositivos representativos, mapeamentos locais de itens de gráficos, substituições individuais e valores recolhidos. Alterações nas associações de modelos de dispositivo exigem sua operação de sincronização separada. Guardar um modelo de dados não muda a estrutura dos RRDs existentes; inspecione o ficheiro real antes de mudar passo, heartbeat ou retenção. Pare os processos de escrita antes da recuperação coordenada e restaure o conjunto coerente de cópias de segurança se necessário. Consulte modelos personalizados e retenção.

[Conceitos de modelos](/pt-pt/concepts/templates/) · [Importação e exportação](/pt-pt/guides/import-and-export-templates/) · [Modelos personalizados](/pt-pt/guides/create-custom-templates/) · [Retenção](/pt-pt/guides/manage-data-retention/)

Base da aplicação verificada em 26 de outubro de 2026: [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
