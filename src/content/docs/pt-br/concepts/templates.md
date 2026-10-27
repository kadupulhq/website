---
title: Modelos
description: Como uma única definição cobre cem dispositivos e o que acontece quando você a altera.
sidebar:
  order: 3
banner:
  content: O Kadupul está em pré-alfa. Valide estes procedimentos em uma instalação de teste isolada. Tradução em rascunho, pendente de revisão por uma pessoa fluente no idioma.
---

Os modelos existem para que adicionar o centésimo switch custe o mesmo esforço de adicionar o segundo. Existem quatro tipos e eles se empilham.

Para uma sequência prática, siga [Usar e validar modelos](/pt-br/guides/template-workflow/).

Os **modelos de dados** definem o que coletar e como armazenar: os campos, seus tipos, seus limites, o perfil de armazenamento e qual método de entrada obtém os números. Campos específicos por objeto e arquivos RRD existentes podem diferir do modelo atual; o modelo não constitui prova da estrutura do arquivo.

Os **modelos de gráfico** definem como desenhar: quais itens, em qual ordem, quais cores, quais linhas de legenda e o que o eixo indica.

Os **modelos de dispositivo** agrupam as consultas de dados e os modelos de gráfico adequados para uma classe de hardware, de modo que escolher o correto ao adicionar um dispositivo realiza a maior parte do trabalho.

As **consultas de dados** tratam os casos em que não se sabe antecipadamente quantos elementos existem. Um switch possui uma quantidade de portas descobertas ao consultar o dispositivo, e uma consulta de dados registra resultados indexados para a criação de gráficos. A descoberta por si só não cria um número fixo de gráficos ou fontes de dados.

## Como eles se empilham

Os quatro tipos não são quatro camadas do mesmo elemento. Cada um aponta para o seguinte na hierarquia.

| Tipo | Aponta para | Produz |
|---|---|---|
| Modelo de dispositivo | Modelos de gráfico e consultas de dados | Nada diretamente. É uma lista do que oferecer para um dispositivo |
| Consulta de dados | Definições de gráficos e mapeamentos para resultados indexados | Linhas descobertas; a criação de gráficos pode criar ou reutilizar fontes de dados |
| Modelo de gráfico | Campos de modelo de dados onde um item requer dados | Um gráfico que pode referenciar múltiplas fontes de dados |
| Modelo de dados | Um método de entrada e um perfil de armazenamento | Metadados da fonte de dados; um RRD é criado quando o caminho de escrita precisa dele |

Itens de modelo associados a dados referem-se a campos de modelo; itens instanciados são mapeados para campos locais. Itens de texto e constantes não precisam de referência a uma fonte de dados. A criação do gráfico resolve esses mapeamentos, e redefinições de modelos ou alterações de itens posteriores também podem alterá-los. A criação de gráficos pode reutilizar fontes de dados compatíveis em vez de criar um novo arquivo para cada gráfico.

## Por modelo ou por objeto

Muitos campos no nível do gráfico e da fonte de dados possuem sinalizadores correspondentes na linha do modelo. Para esses campos, o sinalizador controla a propagação normal para os elementos filhos vinculados. Outros campos, itens de gráfico e mapeamentos de entrada seguem regras de propagação distintas.

| Sinalizador | Significado | Ao salvar |
|---|---|---|
| Desmarcado | O campo é regido pelo modelo | Gravado em cada elemento filho, substituindo o valor anterior |
| Marcado | O campo é por objeto | Mantido inalterado em cada elemento filho |

O sinalizador aplica-se por campo. Um modelo de gráfico pode aplicar seu rótulo de eixo aos gráficos vinculados, deixando o título e o limite vertical a critério de quem o criou. Essa combinação é a situação normal, não uma exceção.

Duas propriedades desse projeto causam erros frequentes.

O sinalizador reside no modelo e decide apenas o que o salvamento seguinte fará. Marcar um campo como por objeto depois que uma propagação já o sobrescreveu não restaura nada. Os valores individuais anteriores foram perdidos; o sinalizador protege somente valores futuros.

O inverso apresenta risco maior. Desmarcar o sinalizador em um campo que permaneceu por objeto durante anos faz com que um único salvamento sobrescreva esse campo em todos os elementos filhos simultaneamente com o valor do modelo, frequentemente um valor padrão nunca verificado.

### Nem todo campo possui um sinalizador

Um campo só participa desse mecanismo se houver um sinalizador para ele. No nível da fonte de dados, quatro possuem sinalizador e dois foram deliberadamente concebidos sem ele.

| Campo | Sinalizador | Comportamento |
|---|---|---|
| Nome | Sim | Por modelo ou por objeto |
| Ativo | Sim | Por modelo ou por objeto |
| Passo | Sim | Por modelo ou por objeto |
| Perfil de armazenamento | Sim | Por modelo ou por objeto |
| Método de entrada | Não, sempre regido pelo modelo | A rotina de salvamento do modelo atualiza explicitamente as linhas vinculadas |
| Caminho para o arquivo RRD | Não, nunca regido pelo modelo | Propagações normais o excluem; reatribuir o modelo preserva o caminho existente |

A preservação do caminho protege a associação existente com o histórico durante alterações normais de modelo. Não significa que os caminhos não possam ser editados ou movidos por meio de outras operações administrativas. Verifique a identidade dos arquivos antes de modificá-los.

Todos os campos de um item de fonte de dados possuem sinalizador: o nome do campo, seu tipo, seu heartbeat, seu mínimo, seu máximo e o campo de entrada que o alimenta.

## As entradas de gráfico funcionam na direção oposta

Um modelo de gráfico pode declarar uma entrada nomeada que conecta vários itens de gráfico a um único campo editável, de modo que editar um valor em um gráfico atualize cada item que o compartilha. É o mecanismo pelo qual uma única configuração de cor ou legenda controla um grupo de itens relacionados.

O valor propagado não provém do modelo. Ele lê o valor atual dos outros itens pertencentes à entrada e o propaga. Uma entrada de gráfico propaga-se, portanto, lateralmente entre os itens do próprio gráfico em vez de descer a partir do modelo, razão pela qual a edição de uma entrada pode alterar um gráfico que o modelo não tocou diretamente.

## O que se propaga e quando

| Alteração | Atinge objetos existentes | Como |
|---|---|---|
| Campo de modelo de gráfico, por modelo | Sim, ao salvar | Gravado em cada gráfico derivado desse modelo |
| Campo de modelo de gráfico, por objeto | Não | O elemento filho mantém seu próprio valor |
| Aparência visual do item de gráfico | Sim, ao salvar | Cor, transparência, tipo de item, espessura de linha, traçado, CDEF, VDEF, deslocamento, função de consolidação, alinhamento, texto e formato de legenda |
| Item adicionado, removido ou reassociado a outro campo | Depende da operação | Correspondência, adição, exclusão e remapeamento usam caminhos distintos; verifique os mapeamentos locais resultantes |
| Campo de modelo de dados, por modelo | Sim, ao salvar | Gravado em cada fonte de dados derivada desse modelo |
| Valores dos campos de entrada de modelo de dados | Se regidos pelo modelo | Sinalizadores de modelo e de filho, campos de índice e regras de host limitam a propagação |
| Perfil de armazenamento, passo, arquivos do modelo de dados | Apenas banco de dados | Arquivos existentes mantêm a estrutura com que foram criados |
| Campos adicionados a um modelo de dados | Apenas banco de dados | Arquivos existentes não possuem espaço para acomodá-los |
| Conteúdo do modelo de dispositivo | Sincronização separada | Editar associações não sincroniza automaticamente todos os dispositivos existentes |

A propagação no banco de dados depende do caminho de salvamento e das regras de substituição. Atualizar os metadados do modelo não migra por si só os arquivos RRD existentes; a manutenção de arquivos é uma operação separada. Alguns controles estruturais são somente leitura no editor de modelos de dados em uso. Consulte [Criar modelos personalizados](/pt-br/guides/create-custom-templates/).

## Os modelos de dispositivo possuem um caminho de sincronização explícito

Editar as associações de um modelo de dispositivo altera o que é oferecido aos novos dispositivos. Dispositivos existentes utilizam uma operação separada de reaplicação ou sincronização. A ferramenta em lote seleciona por padrão dispositivos no estado Up ou Recovering, a menos que o chamador inclua dispositivos inativos; verifique os critérios de seleção antes de assumir a atualização de todos.

A sincronização adiciona associações de modelos de gráfico ausentes, atualiza consultas de dados selecionadas e pode remover associações desnecessárias que não sejam mais precisas. Não exclui diretamente gráficos existentes apenas porque seu modelo foi retirado do modelo de dispositivo. Também invoca rotinas de automação e de plugins, podendo acionar regras configuradas de automação de gráficos.

Inspecione as associações e os gráficos resultantes do dispositivo após a sincronização. Eles não constituem necessariamente a união permanente de todas as versões de modelos aplicadas ao longo do tempo.

## Índices e causas de deslocamento de portas

Uma consulta de dados deve determinar qual elemento descoberto corresponde a uma fonte de dados existente específica. Esse elemento é o índice. Índices numéricos podem mudar após alterações de hardware ou de configuração. Um campo estável apropriado ajuda a preservar a identidade, mas nomes de interface também podem ser renomeados ou reutilizados. Verifique a unicidade, persistência e o comportamento de reindexação no próprio dispositivo; nenhum nome de campo garante isoladamente a continuidade.

Esta decisão parece trivial ao ser tomada e torna-se onerosa quando falha. É tomada por dispositivo e por execução em vez de uma única vez para a consulta, de modo que dois switches idênticos podem ficar indexados com base em campos distintos. A seleção do campo, o que ocorre quando um índice desaparece e o custo de detecção de renumeração estão descritos em [Consultas de dados e índices](/pt-br/concepts/data-queries-and-indexes/).

## Alterar um modelo posteriormente

Alterações nos gráficos afetam as renderizações seguintes após a conclusão do salvamento e da propagação. Substituições e cache de imagens podem influenciar o que o usuário visualiza, portanto não presuma que todos os gráficos mudam de imediato. Inspecione um gráfico filho representativo e seus mapeamentos de itens; consulte [Ajustar a aparência dos gráficos](/pt-br/guides/tune-graph-appearance/).

Salvar um modelo de dados não altera automaticamente a estrutura dos arquivos RRD existentes. As definições e arquivos reais do arquivo podem divergir do perfil no banco de dados. Inspecione ambos antes da manutenção; recriar um arquivo é apenas uma opção.

Conforme a alteração, operações suportadas pelo RRDtool como ajuste de parâmetros, redimensionamento de arquivos ou exportação e restauração controladas podem preservar parte ou a totalidade do histórico existente. Esses procedimentos têm limitações e exigem backups e verificação; não reconstroem dados que nunca foram registrados. Excluir e recriar um arquivo apaga irremediavelmente seu histórico. Consulte [Gerenciar retenção de dados](/pt-br/guides/manage-data-retention/) e [Fontes de dados e arquivos round-robin](/pt-br/concepts/data-sources-and-rras/).

## Outros elementos denominados modelos

Mais quatro objetos utilizam este termo sem compartilhar o comportamento dos quatro descritos. Modelos de cor são paletas nomeadas aplicadas a itens de gráfico. Modelos de agregação descrevem como combinar múltiplos gráficos em um só. Modelos de automação associam dispositivos descobertos a um modelo de dispositivo. Predefinições de gráfico fornecem formatos de legenda reutilizáveis.

Nenhum deles se integra à pilha aqui descrita. É útil conhecê-los principalmente para que um resultado de pesquisa mencionando um modelo seja interpretado no contexto correto.
