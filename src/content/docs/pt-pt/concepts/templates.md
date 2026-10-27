---
title: Modelos
description: Como uma única definição cobre cem dispositivos e o que acontece quando a altera.
sidebar:
  order: 3
banner:
  content: O Kadupul está em pré-alfa. Valide estes procedimentos numa instalação de teste isolada. Tradução em rascunho, pendente de revisão por uma pessoa fluente no idioma.
---

Os modelos existem para que adicionar o centésimo comutador custe o mesmo esforço do que adicionar o segundo. Existem quatro tipos e sobrepõem-se hierarquicamente.

Para uma sequência prática, siga [Utilizar e validar modelos](/pt-pt/guides/template-workflow/).

Os **modelos de dados** definem o que recolher e como armazenar: os campos, os seus tipos, os seus limites, o perfil de armazenamento e qual o método de entrada que obtém os valores. Os campos por objeto e os ficheiros RRD existentes podem diferir do modelo atual; o modelo não constitui prova da estrutura do ficheiro.

Os **modelos de gráfico** definem como desenhar: que itens, em que ordem, que cores, que linhas de legenda e o que indica o eixo.

Os **modelos de dispositivo** agrupam as consultas de dados e os modelos de gráfico adequados a uma classe de hardware, de modo que a escolha do modelo correto ao adicionar um dispositivo realiza a maior parte do trabalho.

As **consultas de dados** tratam os casos em que não se sabe antecipadamente quantos elementos existem. Um comutador tem um número de portas descobertas ao analisar o dispositivo, e uma consulta de dados regista resultados indexados para a criação de gráficos. A descoberta por si só não cria um número fixo de gráficos ou fontes de dados.

## Como se sobrepõem

Os quatro tipos não são quatro camadas do mesmo elemento. Cada um aponta para o seguinte na hierarquia.

| Tipo | Aponta para | Produz |
|---|---|---|
| Modelo de dispositivo | Modelos de gráfico e consultas de dados | Nada diretamente. É uma lista do que disponibilizar para um dispositivo |
| Consulta de dados | Definições de gráficos e mapeamentos para resultados indexados | Linhas descobertas; a criação de gráficos pode criar ou reutilizar fontes de dados |
| Modelo de gráfico | Campos de modelo de dados onde um item necessita de dados | Um gráfico que pode referenciar múltiplas fontes de dados |
| Modelo de dados | Um método de entrada e um perfil de armazenamento | Metadados da fonte de dados; um RRD é criado quando o caminho de escrita precisa dele |

Os itens de modelo que transportam dados referem-se a campos de modelo; os itens instanciados são mapeados para campos locais. Os itens de texto e de constante não necessitam de referência a uma fonte de dados. A criação do gráfico resolve esses mapeamentos, e redefinições de modelos ou alterações de itens posteriores também podem alterá-los. A criação de gráficos pode reutilizar fontes de dados compatíveis em vez de criar um novo ficheiro para cada gráfico.

## Por modelo ou por objeto

Muitos campos ao nível do gráfico e da fonte de dados possuem sinalizadores correspondentes na linha do modelo. Para esses campos, o sinalizador comanda a propagação normal para os elementos subordinados ligados. Outros campos, itens de gráfico e mapeamentos de entrada seguem regras de propagação distintas.

| Sinalizador | Significado | Ao guardar |
|---|---|---|
| Desativado | O campo rege-se pelo modelo | Escrito em cada subordinado, substituindo o valor anterior |
| Ativado | O campo é por objeto | Mantido inalterado em cada subordinado |

O sinalizador aplica-se por campo. Um modelo de gráfico pode aplicar a sua legenda de eixo aos gráficos associados, deixando o título e o limite vertical ao critério de quem o criou. Essa combinação é a situação habitual, não uma exceção.

Duas propriedades desta conceção causam erros frequentes.

O sinalizador reside no modelo e decide apenas o que a operação de guardar seguinte fará. Marcar um campo como por objeto depois de uma propagação já o ter substituído não restaura nada. Os valores individuais anteriores perderam-se; o sinalizador protege apenas valores futuros.

O inverso acarreta maior perigo. Desativar o sinalizador num campo que permaneceu por objeto durante anos faz com que uma única gravação substitua esse campo em todos os subordinados em simultâneo com o valor do modelo, frequentemente um valor predefinido nunca verificado.

### Nem todos os campos possuem sinalizador

Um campo apenas participa neste mecanismo se existir um sinalizador para ele. Ao nível da fonte de dados, quatro possuem sinalizador e dois foram deliberadamente concebidos sem ele.

| Campo | Sinalizador | Comportamento |
|---|---|---|
| Nome | Sim | Por modelo ou por objeto |
| Ativo | Sim | Por modelo ou por objeto |
| Passo | Sim | Por modelo ou por objeto |
| Perfil de armazenamento | Sim | Por modelo ou por objeto |
| Método de entrada | Não, sempre regido pelo modelo | A rotina de gravação do modelo atualiza explicitamente as linhas subordinadas |
| Caminho para o ficheiro RRD | Não, nunca regido pelo modelo | As propagações normais excluem-no; a reatribuição preserva o caminho existente |

A preservação do caminho protege a associação existente ao histórico durante as alterações normais do modelo. Não significa que os caminhos não possam ser editados ou deslocados através de outras operações administrativas. Verifique a identidade dos ficheiros antes de os alterar.

Todos os campos de um item de fonte de dados possuem sinalizador: o nome do campo, o seu tipo, o seu heartbeat, o seu mínimo, o seu máximo e o campo de entrada que o alimenta.

## As entradas de gráfico funcionam na direção oposta

Um modelo de gráfico pode declarar uma entrada nomeada que liga vários itens de gráfico a um único campo editável, de modo que editar um valor num gráfico atualiza cada item que o partilha. É o mecanismo pelo qual uma única definição de cor ou legenda controla um grupo de itens associados.

O valor que propaga não provém do modelo. Lê o valor atual dos outros itens que pertencem à entrada e propaga-o. Uma entrada de gráfico propaga-se, portanto, lateralmente entre os itens do próprio gráfico e não de cima para baixo a partir do modelo, razão pela qual a edição de uma entrada pode alterar um gráfico que o modelo não tocou diretamente.

## O que se propaga e quando

| Alteração | Atinge objetos existentes | Como |
|---|---|---|
| Campo de modelo de gráfico, por modelo | Sim, ao guardar | Escrito em cada gráfico derivado desse modelo |
| Campo de modelo de gráfico, por objeto | Não | O subordinado mantém o seu próprio valor |
| Aspeto visual do item de gráfico | Sim, ao guardar | Cor, transparência, tipo de item, largura da linha, tracejado, CDEF, VDEF, deslocamento, função de consolidação, alinhamento, texto e formato de legenda |
| Item adicionado, removido ou reassociado a outro campo | Dependente da operação | Correspondência, adição, eliminação e remapeamento utilizam caminhos distintos; verifique os mapeamentos locais resultantes |
| Campo de modelo de dados, por modelo | Sim, ao guardar | Escrito em cada fonte de dados derivada desse modelo |
| Valores dos campos de entrada de modelo de dados | Se regidos pelo modelo | Os sinalizadores do modelo e do subordinado, os campos de índice e as regras do anfitrião limitam a propagação |
| Perfil de armazenamento, passo, históricos consolidados do modelo de dados | Apenas base de dados | Os ficheiros existentes mantêm a estrutura com que foram criados |
| Campos adicionados a um modelo de dados | Apenas base de dados | Os ficheiros existentes não têm espaço para os acomodar |
| Conteúdo do modelo de dispositivo | Sincronização separada | Editar associações não sincroniza automaticamente todos os dispositivos existentes |

A propagação na base de dados depende do caminho de gravação e das regras de sobreposição. Atualizar os metadados do modelo não migra por si só os ficheiros RRD existentes; a manutenção de ficheiros é uma operação separada. Alguns controlos estruturais são só de leitura no editor de modelos de dados em utilização. Consulte [Criar modelos personalizados](/pt-pt/guides/create-custom-templates/).

## Os modelos de dispositivo possuem um caminho de sincronização explícito

Editar as associações de um modelo de dispositivo altera o que é proposto a novos dispositivos. Os dispositivos existentes utilizam uma operação separada de reaplicação ou sincronização. A ferramenta de operações em lote seleciona por predefinição dispositivos no estado Up ou Recovering, exceto se quem a invoca incluir dispositivos inativos; verifique os critérios de seleção antes de assumir a atualização global.

A sincronização adiciona associações de modelos de gráfico em falta, atualiza consultas de dados selecionadas e pode remover associações desnecessárias que já não sejam precisas. Não elimina diretamente gráficos existentes apenas porque o respetivo modelo foi retirado do modelo de dispositivo. Também invoca rotinas de automação e de extensões, podendo desencadear regras configuradas de automatização de gráficos.

Inspecione as associações e os gráficos do dispositivo resultantes após a sincronização. Não representam necessariamente a união permanente de todas as versões de modelos aplicadas ao longo do tempo.

## Índices e causas de deslocação de portas

Uma consulta de dados deve determinar qual o elemento descoberto que corresponde a uma fonte de dados existente específica. Esse elemento é o índice. Os índices numéricos podem mudar após alterações de hardware ou de configuração. Um campo estável apropriado ajuda a preservar a identidade, mas os nomes de interface também podem ser alterados ou reutilizados. Verifique a unicidade, persistência e o comportamento de reindexação no próprio dispositivo; nenhum nome de campo garante isoladamente a continuidade.

Esta decisão parece trivial ao ser tomada e torna-se dispendiosa quando falha. É tomada por dispositivo e por execução em vez de uma única vez para a consulta, pelo que dois comutadores idênticos podem ficar indexados com base em campos distintos. A seleção do campo, o que sucede quando um índice desaparece e o custo de deteção de renumeração estão descritos em [Consultas de dados e índices](/pt-pt/concepts/data-queries-and-indexes/).

## Alterar um modelo posteriormente

As alterações aos gráficos afetam as renderizações seguintes após a conclusão da gravação e da propagação. As sobreposições e a colocação de imagens em cache podem influenciar o que o utilizador visualiza, pelo que não deve assumir que todos os gráficos mudam de imediato. Inspecione um gráfico subordinado representativo e os respetivos mapeamentos de itens; consulte [Ajustar o aspeto dos gráficos](/pt-pt/guides/tune-graph-appearance/).

Guardar um modelo de dados não altera automaticamente a estrutura dos ficheiros RRD existentes. As definições e históricos consolidados reais do ficheiro podem divergir do perfil na base de dados. Inspecione ambos antes da manutenção; recriar um ficheiro é apenas uma opção.

Consoante a alteração, operações suportadas pelo RRDtool como ajuste de parâmetros, redimensionamento de históricos consolidados ou exportação e restauro controlados podem preservar parte ou a totalidade do histórico existente. Esses procedimentos têm limitações e requerem cópias de segurança e verificação; não reconstroem dados que nunca foram registados. Eliminar e recriar um ficheiro apaga irremediavelmente o respetivo histórico. Consulte [Gerir a retenção de dados](/pt-pt/guides/manage-data-retention/) e [Fontes de dados e históricos consolidados](/pt-pt/concepts/data-sources-and-rras/).

## Outros elementos denominados modelos

Mais quatro objetos utilizam este termo sem partilharem o comportamento dos quatro descritos. Os modelos de cor são paletas nomeadas aplicadas a itens de gráfico. Os modelos de agregação descrevem como combinar múltiplos gráficos num só. Os modelos de automatização associam dispositivos descobertos a um modelo de dispositivo. As predefinições de gráfico fornecem formatos de legenda reutilizáveis.

Nenhum deles se integra na pilha aqui descrita. É útil conhecê-los principalmente para que um resultado de pesquisa que mencione um modelo seja interpretado no contexto correto.
