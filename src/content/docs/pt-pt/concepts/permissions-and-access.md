---
title: Permissões e acesso
description: Por que razão o acesso está dividido em dois sistemas independentes, por que razão uma permissão é guardada como predefinição mais exceções e por que razão uma árvore parece diferente para cada conta.
banner:
  content: O Kadupul está em pré-alfa. Valide estes procedimentos numa instalação de teste isolada. Tradução em rascunho, pendente de revisão por uma pessoa fluente no idioma.
sidebar:
  order: 8
---

O acesso inclui verificações independentes de realms e de políticas de objetos. Os realms controlam
quais as funções de interface que uma conta pode utilizar; as políticas de objetos determinam os gráficos,
dispositivos, modelos e árvores permitidos. Um pedido pode depender de ambos os fatores. As concessões
de realm não concedem, por si só, acesso a gráficos, e as concessões de gráficos não concedem funções da
consola. O estado da conta, o modo de autenticação e as definições de visualização também são determinantes.

Esta página explica por que razão o modelo possui esta estrutura. Para a gestão prática de uma conta,
consulte [Gerir utilizadores e permissões](/pt-pt/guides/manage-users-and-permissions/).

## Por que razão existem dois sistemas

As duas questões pertencem a âmbitos distintos.

O acesso a uma página diz respeito ao código. Ou a conta pode executar o editor de dispositivos ou não pode,
e existe uma única resposta para toda a instalação. Ver um dispositivo diz respeito a dados. Existem
milhares de dispositivos e a resposta varia para cada um deles.

Juntá-los significaria gerir uma permissão por página e por objeto, ou seja, o produto de duas listas
em crescimento contínuo. Separá-los resulta numa lista fixa e pequena de secções de interface e num conjunto
de regras por objeto. O custo da separação é a necessidade de configurar ambas as vertentes; uma conta
com configuração incorreta em qualquer uma delas aparenta a mesma falha de acesso.

## Os realms são uma lista numerada fixa

Um realm identifica uma permissão de interface através de um número. As associações do núcleo ligam páginas
a realms, enquanto os plugins podem registar realms adicionais. Verifique os realms e a identidade exigidos
para a rota real, em vez de assumir o acesso a uma página como uma decisão completa de autorização sobre objetos.

Utilizam-se números e não nomes de ficheiros porque um realm abrange várias páginas e as páginas mudam
de nome. O número subsiste; a lista de ficheiros associada é uma correspondência que pode alterar-se sem
modificar qualquer conta de utilizador.

Os realms de uma conta provêm de si própria e dos grupos ativos aos quais pertence, combinados por união.
As funções (roles) são conjuntos de números de realm aplicados numa única ação. Uma função transfere os
seus números para a conta e conclui a sua ação: é um ponto de partida e não uma ligação ativa, pelo que
uma conta criada a partir de uma função não se altera se a função for modificada.

Os plugins adicionam realms próprios, guardados separadamente e detidos pelas contas exatamente como os
realms do núcleo. Um plugin introduz, portanto, uma nova superfície sob controlo de acesso que as suas
políticas existentes devem analisar explicitamente. Consulte [Plugins](/pt-pt/concepts/plugins/).

## Os objetos são guardados como predefinição mais exceções

Quatro categorias de objetos gerem permissões: gráficos, dispositivos, modelos de gráficos e árvores.

Para cada categoria, uma conta (ou um grupo) detém uma política predefinida e uma lista de exceções.
Uma exceção é uma linha elementar: quem, qual objeto, qual categoria. A linha é rigorosamente idêntica
em ambos os modos de política. A política é que determina o significado da linha.

Esta é a decisão estruturante em todo o modelo. Nas tabelas de exceções só é guardada a divergência em
relação à regra predefinida. Regras de Permitir por predefinição sem exceções podem conceder acesso amplo
sem gerar linhas de exceção; as linhas de conta, predefinição e realm continuam a existir. Cinco dispositivos
explicitamente permitidos sob uma predefinição de Recusa exigem cinco exceções de dispositivo, embora outras
concessões de gráficos e métodos possam influenciar a visibilidade. Qualquer que seja a orientação do
ambiente, os dados guardados mantêm o tamanho da parte relevante em vez do volume de todo o parque.

## Por que razão existem ambos os modos de política

| Modo | Significado | Comportamento ao adicionar um dispositivo |
|---|---|---|
| Permitir, com exceções | Objetos dessa categoria, exceto as exclusões listadas | A política de dispositivos autoriza o novo objeto; as outras verificações continuam a aplicar-se |
| Negar, com exceções | Apenas os objetos listados dessa categoria | Esta fonte não concede nenhum dispositivo novo; outras fontes ou permissões de gráficos podem permitir o acesso |

As predefinições diferem na forma como lidam com novos objetos. Escolha o alcance da política e o
comportamento face a falhas de forma ponderada; nenhuma das opções descreve a totalidade das verificações
de acesso do pedido.

«Todos na equipa de redes, exceto os dois bastidores pertencentes à contabilidade» são duas linhas sob
Permitir e quatro mil sob Negar. «Este prestador externo e apenas estes cinco dispositivos» são cinco linhas
sob Negar e quatro mil sob Permitir. Forçar um único modo obrigaria a redigir metade das políticas reais
listando o parque por inteiro, e uma lista tão longa nunca se mantém atualizada.

Uma predefinição de Permitir inclui novos objetos da sua categoria, salvo se forem excluídos. Uma predefinição
de Negar exige uma exceção explícita dessa fonte. Estas são definições semânticas da política predefinida,
não garantias sobre tratamento de erros. Analise outros utilizadores/grupos e os métodos de permissão de
gráficos antes de assumir que uma predefinição de Negar em dispositivos oculta os respetivos gráficos.

## O acesso é uma união e não existe negação

O acesso efetivo é avaliado para a política própria da conta e para cada grupo ativo a que ela pertença.
No acesso a gráficos, aplique primeiro o método de gráfico selecionado em cada fonte individualmente e,
em seguida, agregue esses resultados por união. Sob o método Restritivo, a concessão de um dispositivo
num grupo e a de um modelo noutro não formam o par necessário.

Não existe uma negação ao nível do grupo que sobreponha uma concessão concedida por outra fonte. Uma
exclusão sob uma predefinição de Permitir remove apenas a contribuição dessa fonte; não se trata de uma
negação global. Remover tal exclusão alarga o acesso, ao contrário da remoção de uma concessão sob Negar.
Esta restrição é deliberada: um modelo com concessões e negações necessita de regras de precedência,
e as regras de precedência tornam os sistemas de permissões impossíveis de auditar através de uma simples leitura.

As consequências devem ser expressas com total clareza.

Revogar um acesso implica removê-lo da conta e de cada um dos grupos que o concedem. Removê-lo num local
não tem efeito se outro local continuar a concedê-lo.

Desativar um grupo revoga as respetivas concessões para todos os membros em simultâneo, tornando o grupo
um instrumento de revogação muito mais fiável do que uma sucessão de edições individuais.

Não é possível responder a «o que pode esta conta ver?» consultando apenas uma linha. Tem de combinar as
quatro políticas e listas da conta com os dados homólogos de cada grupo.

## Por que razão a permissão de gráficos tem quatro métodos

Um gráfico tem uma tripla identidade. Existe por si mesmo, pertence a um dispositivo e deriva de um modelo
de gráfico. Os três elementos podem comportar permissões, pelo que o modelo tem de estabelecer qual a
combinação válida. Esta escolha é uma configuração para toda a instalação.

| Método | A questão colocada | Conjuntos de exceções consultados |
|---|---|---|
| Permissivo | Qualquer um dos três está autorizado? | Três |
| Restritivo | O gráfico está autorizado, ou o dispositivo e o modelo estão ambos autorizados numa mesma fonte? | Três |
| Baseado no dispositivo | O gráfico ou o dispositivo está autorizado? | Dois |
| Baseado no modelo de gráfico | O gráfico ou o modelo está autorizado? | Dois |

Estas diretrizes descrevem as verificações de autorização implementadas. As concessões diretas de gráficos
mantêm-se válidas nos quatro métodos; optar pelo método Baseado no dispositivo não as suprime. Meça o
desempenho com as políticas e parques reais em vez de presumir que o número de conjuntos de exceções
prevê o custo da consulta.

O método Permissivo é a predefinição e a opção que frequentemente surpreende os operadores. Sob este
método, permitir um modelo de gráfico autoriza todos os gráficos criados a partir dele, em qualquer
dispositivo, incluindo dispositivos aos quais a conta nunca teve acesso. O motor comporta-se exatamente
como documentado. Simplesmente, a documentação não corresponde à intuição geral.

## As permissões são compiladas em consultas

A filtragem de permissões na listagem de gráficos é incorporada nas consultas à base de dados. Uma página
que apresente vinte de quatro mil gráficos não pode descarregar quatro mil linhas e descartar as não
autorizadas para a conta: a contagem estaria errada, a paginação falharia e a carga cresceria com o parque
global em vez de se limitar à página.

Por conseguinte, as políticas e listas de exceções são convertidas em cláusulas de junção (join) e filtro
(where) confiadas à base de dados. O modelo de permissões foi desenhado para resistir a essa conversão.
Conjuntos de identificadores e uma marca predefinida compilam perfeitamente para SQL. Uma lógica
arbitrária por objeto não o permite.

O circuito de gráficos beneficia de um atalho para permissões abrangentes, como a predefinição de Permitir
gráficos de um utilizador sem qualquer exceção de gráfico. Não generalize este comportamento para todas
as categorias de objetos ou todos os pontos de acesso. As verificações de realm, estado de conta e
visualização continuam a ser obrigatórias; a otimização de consultas de permissões não substitui testes de acesso.

## As árvores são um eixo separado

A permissão sobre árvores e a permissão sobre gráficos são validadas de forma independente. Ter acesso a
uma árvore não dá acesso ao seu conteúdo. Ter permissão sobre um gráfico não exige acesso a uma árvore.

Uma árvore é uma apresentação de objetos, não um contentor detentor dos mesmos. O mesmo gráfico pode surgir
em cinco árvores diferentes. Se a árvore concedesse o seu conteúdo, editar uma árvore equivaleria a editar
permissões, e quem estivesse autorizado a organizar gráficos estaria autorizado a publicá-los.

O que a árvore faz é ocultar os ramos vazios. Um ramo é exibido se contiver algum elemento visível para a
conta, sendo a verificação recursiva: um ramo cujos sub-ramos estejam todos vazios para essa conta é
igualmente ocultado. Dois utilizadores abrem a mesma árvore e visualizam estruturas distintas, sem
marcadores a indicar o que o outro visualiza.

Esta verificação de vazio tem um custo. Percorre o ramo e formula recursivamente as consultas sobre gráficos
e dispositivos identificados. Uma árvore profunda combinada com um método dispendioso de permissões de
gráficos produz fraco desempenho, razão pela qual existem métodos mais expeditos.

A relevância ao nível de auditoria sobrepõe-se à de desempenho. **A visualização em árvore não é um
relatório daquilo a que uma conta pode aceder.** É um relatório daquilo a que uma conta pode aceder
*e que alguém colocou nessa árvore*. Para auditar acessos, inspecione as políticas e valide pedidos reais
autorizados e recusados. O ecrã de Política Efetiva provém de uma implementação autónoma das verificações
de autorização, pelo que o seu texto e descrição não devem constituir a prova única. Consulte
[Auditar quem pode ver o quê](/pt-pt/guides/audit-who-can-see-what/).

## Colocação em cache e por que razão as alterações entram em vigor em momentos estranhos

As respostas de permissões são mantidas na cache da sessão, evitando repetir a mesma consulta em cada
página. A alteração de um administrador sinaliza como desatualizadas as respostas em cache da conta
afetada, e a página seguinte carregada por essa conta reconstrói-as sem aguardar por um novo início de sessão.

A desativação de uma conta limpa credenciais persistentes, permissões em cache e sessões no servidor.
Os pedidos protegidos confirmam também o estado ativo/bloqueado; uma página já carregada num navegador
não é eliminada de imediato. Rotas abertas a convidados podem atribuir um perfil de convidado independente
quando configuradas, pelo que uma resposta bem-sucedida, por si só, não prova que a conta desativada
mantenha privilégios.

Valide alterações através de sessões existentes e de novas sessões, verificando tanto acessos mantidos
como revogados e registando o conteúdo e a identidade da resposta. Não utilize o código HTTP como prova
única de autorização nem assuma que todos os processos dependentes da cache atualizam de forma síncrona.
