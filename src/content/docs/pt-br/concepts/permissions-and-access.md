---
title: Permissões e acesso
description: Por que o acesso é dividido em dois sistemas independentes, por que uma permissão é armazenada como padrão mais exceções e por que uma árvore parece diferente para cada conta.
banner:
  content: O Kadupul está em pré-alfa. Valide estes procedimentos em uma instalação de teste isolada. Tradução em rascunho, pendente de revisão por uma pessoa fluente no idioma.
sidebar:
  order: 8
---

O acesso conta com verificações separadas de realms e de políticas de objetos. Os realms controlam
quais funções da interface uma conta pode utilizar; as políticas de objetos determinam os gráficos,
dispositivos, modelos e árvores permitidos. Uma solicitação pode depender de ambos. Concessões de
realm não concedem, por si sós, acesso a gráficos, e concessões de gráficos não concedem funções do
Console. O estado da conta, o modo de autenticação e as configurações de visualização também importam.

Esta página explica por que o modelo foi estruturado dessa forma. Para os aspectos práticos da
construção de uma conta, consulte [Gerenciar usuários e permissões](/pt-br/guides/manage-users-and-permissions/).

## Por que dois sistemas

As duas questões não pertencem ao mesmo tipo de problema.

Alcançar uma página diz respeito ao código. Ou a conta pode executar o editor de dispositivos ou não pode,
e existe uma única resposta para toda a instalação. Ver um dispositivo diz respeito a dados. Existem
milhares de dispositivos e a resposta difere para cada um deles.

Unificá-los significaria gerenciar uma permissão por página por objeto, que é o produto de duas listas
que não param de crescer. Dividi-los significa uma lista de seções de interface, fixa e enxuta, e um conjunto
de regras por objeto. O custo dessa divisão é que ambos precisam ser configurados, e uma conta mal configurada
em qualquer um deles parece quebrada da mesma forma.

## Os realms são uma lista numerada fixa

Um realm identifica uma permissão de interface por meio de um número. Mapeamentos do núcleo associam páginas
a realms, enquanto plugins podem registrar realms adicionais. Verifique os realms e a identidade exigidos
para a rota real em vez de tratar o acesso a uma página como uma decisão completa de autorização sobre objetos.

Números, em vez de nomes de arquivos, porque um realm cobre várias páginas e as páginas mudam de nome.
O número sobrevive; a lista de arquivos associada é um mapeamento que pode mudar sem alterar qualquer conta.

Os realms de uma conta provêm de si mesma e dos grupos habilitados aos quais ela pertence, combinados
como uma união. Funções (roles) são conjuntos de números de realm aplicados em uma única ação. Uma função
escreve seus números na conta e encerra sua participação: é um ponto de partida, não um link ativo, de
modo que uma conta criada a partir de uma função não muda quando a função é modificada.

Os plugins adicionam realms próprios, armazenados separadamente e mantidos pelas contas exatamente como
os realms do núcleo. Um plugin traz, portanto, uma nova superfície sob controle de acesso que sua política
existente deve revisar explicitamente. Consulte [Plugins](/pt-br/concepts/plugins/).

## Os objetos são armazenados como um padrão mais exceções

Quatro tipos de objetos possuem permissões: gráficos, dispositivos, modelos de gráficos e árvores.

Para cada tipo, uma conta (ou um grupo) detém uma política padrão e uma lista de exceções. Uma exceção
é uma única linha: quem, qual objeto, qual tipo. A linha é idêntica em ambos os modos de política. A política
é quem decide o que a linha significa.

Esta é a decisão fundamental de todo o modelo. Apenas a divergência em relação ao padrão é armazenada
nas tabelas de exceções. Padrões de Permitir sem exceções podem conceder amplo acesso sem linhas de exceção;
as linhas de conta, padrões e realm ainda existem. Cinco dispositivos explicitamente permitidos sob um padrão
de Negar exigem cinco exceções de dispositivo, embora outras concessões de gráficos e métodos possam influenciar
a visibilidade. Para qualquer lado que a estrutura tenda, os dados armazenados mantêm o tamanho da parte
relevante em vez do tamanho de todo o inventário.

## Por que ambos os modos de política existem

| Modo | Significado | Comportamento ao adicionar um dispositivo |
|---|---|---|
| Permitir, com exceções | Objetos daquele tipo, exceto as exclusões listadas | A política de dispositivos autoriza o novo objeto; outras verificações continuam a ser aplicadas |
| Negar, com exceções | Apenas os objetos listados daquele tipo | Esta fonte não concede nenhum dispositivo novo; outras fontes ou permissões de gráficos podem permitir o acesso |

Os padrões diferem na forma como lidam com novos objetos. Escolha o escopo da política e o comportamento
diante de falhas deliberadamente; nenhum deles resume a totalidade das verificações de acesso da solicitação.

"Todos na equipe de redes, exceto os dois racks da contabilidade" são duas linhas sob Permitir e quatro mil
sob Negar. "Este consultor externo e apenas estes cinco dispositivos" são cinco linhas sob Negar e quatro mil
sob Permitir. Forçar um único modo significaria que metade de todas as políticas reais só poderia ser escrita
listando todo o inventário, e uma lista tão longa nunca é mantida.

Um padrão de Permitir inclui objetos recém-adicionados de seu tipo, a menos que sejam excluídos. Um padrão
de Negar exige uma exceção explícita dessa fonte. Essas são regras semânticas de política padrão, não
garantias sobre o tratamento de erros. Avalie outros usuários/grupos e os métodos de permissão de gráficos
antes de concluir que um padrão de Negar em dispositivos oculta seus gráficos associados.

## O acesso é uma união e não há negação

O acesso efetivo é avaliado para a política própria da conta e para cada grupo habilitado ao qual ela
pertença. Para o acesso a gráficos, aplique primeiro o método de gráfico selecionado dentro de cada fonte
isoladamente e depois faça a união desses resultados. Sob o método Restritivo, a concessão de um dispositivo
em um grupo e a de um modelo em outro não formam o par necessário.

Não existe uma negação em nível de grupo que anule uma concessão vinda de outra fonte. Uma exclusão sob
um padrão de Permitir apenas remove a contribuição daquela fonte; não se trata de uma negação global.
Remover tal exclusão expande o acesso, diferentemente de remover uma concessão sob Negar. Essa é uma
limitação deliberada: um modelo com concessões e negações precisa de regras de precedência, e regras de
precedência tornam os sistemas de permissões impossíveis de auditar por simples leitura.

As consequências devem ser expressas com total clareza.

Revogar o acesso significa removê-lo da conta e de cada grupo que o concede. Removê-lo em um lugar não
produz efeito se outro lugar continuar concedendo.

Desativar um grupo remove suas concessões para todos os membros simultaneamente, tornando o grupo um
mecanismo de revogação muito melhor do que uma sequência de edições individuais.

Não é possível responder a "o que esta conta pode ver?" olhando apenas para uma linha. É preciso combinar
as quatro políticas e quatro listas da conta com os dados homólogos de cada grupo.

## Por que a permissão de gráficos possui quatro métodos

Um gráfico tem três identidades. Ele é ele mesmo, pertence a um dispositivo e foi construído a partir
de um modelo de gráfico. Todos os três podem conter permissões, portanto o modelo precisa decidir qual
combinação é válida. A decisão é uma configuração em nível de instalação.

| Método | A pergunta feita | Conjuntos de exceções consultados |
|---|---|---|
| Permissivo | Qualquer um dos três está permitido? | Três |
| Restritivo | O gráfico está permitido, ou tanto o dispositivo quanto o modelo estão permitidos em uma mesma fonte? | Três |
| Baseado em dispositivo | O gráfico ou o dispositivo está permitido? | Dois |
| Baseado em modelo de gráfico | O gráfico ou o modelo está permitido? | Dois |

Essas regras descrevem as verificações de autorização implementadas. Concessões diretas de gráficos
continuam valendo em todos os quatro métodos; escolher Baseado em dispositivo não as suprime. Meça o
desempenho com as políticas e inventários reais em vez de presumir que a contagem de conjuntos de exceções
prevê o custo da consulta.

Permissivo é o padrão, e é a configuração que frequentemente surpreende os administradores. Sob o modo
permissivo, permitir um modelo de gráfico autoriza todos os gráficos gerados a partir dele, em qualquer
dispositivo, incluindo dispositivos aos quais a conta nunca teve acesso. O modelo comporta-se exatamente
como documentado. A descrição é que não corresponde à intuição geral.

## As permissões são compiladas em consultas

A filtragem de permissões na listagem de gráficos é incorporada nas consultas ao banco de dados. Uma página
que exibe vinte de quatro mil gráficos não pode buscar quatro mil linhas e descartar as que a conta não
pode ver, porque a contagem ficaria errada, a paginação falharia e a carga cresceria com o inventário
em vez de se limitar à página.

Portanto, as políticas e listas de exceções são transformadas em cláusulas de junção (join) e filtro (where)
repassadas ao banco de dados. O modelo de permissões foi estruturado em parte para suportar essa tradução.
Conjuntos de identificadores e um sinalizador padrão compilam perfeitamente para SQL. Uma lógica arbitrária
por objeto não admite essa conversão.

O fluxo de gráficos possui um atalho para permissões amplas, incluindo o padrão de Permitir gráficos de
um usuário sem nenhuma exceção de gráfico. Não generalize isso para todo tipo de objeto ou para qualquer rota.
Verificações de realm, estado de conta e visualização continuam sendo necessárias; a otimização de consultas
de permissões não substitui testes de acesso.

## As árvores são um eixo separado

A permissão sobre árvores e a permissão sobre gráficos são verificadas de forma independente. Ter acesso a
uma árvore não dá acesso ao seu conteúdo. Ter permissão sobre um gráfico não exige ter acesso a uma árvore.

Uma árvore é uma apresentação de objetos, não um contêiner proprietário deles. O mesmo gráfico pode aparecer
em cinco árvores diferentes. Se a árvore concedesse seu conteúdo, editar uma árvore seria editar permissões,
e qualquer pessoa autorizada a organizar gráficos estaria autorizada a publicá-los.

O que a árvore faz é ocultar o que está vazio. Um branch é exibido quando contém algo que a conta pode ver,
e a verificação é recursiva: um branch cujos sub-branches estejam todos vazios para essa conta também é
ocultado. Duas pessoas abrem a mesma árvore e veem estruturas diferentes, e nenhuma delas vê um marcador
indicando o que a outra visualiza.

Essa checagem de vazio tem um custo. Ela percorre o branch e formula recursivamente as consultas sobre gráficos
e dispositivos encontrados. Uma árvore profunda combinada com um método custoso de permissão de gráficos
produz um desempenho ruim, razão pela qual existem métodos mais simplificados.

A consequência para a auditoria supera a de desempenho. **Uma visualização em árvore não é um relatório
do que uma conta pode acessar.** É um relatório do que uma conta pode acessar *e alguém posicionou naquela árvore*.
Para auditar acessos, inspecione políticas e verifique solicitações reais permitidas e negadas. A tela de
Política Efetiva provém de uma implementação separada das verificações de autorização, de modo que seu
rótulo e tooltip não devem constituir a prova exclusiva. Consulte
[Auditar quem pode ver o quê](/pt-br/guides/audit-who-can-see-what/).

## Cache e por que as alterações ocorrem em momentos estranhos

As respostas de permissões são mantidas no cache da sessão, evitando refazer a mesma pergunta em cada
página. A alteração de um administrador marca como obsoletas as respostas em cache da conta afetada, e a
página seguinte carregada por aquela conta as reconstrói em vez de aguardar um novo login.

Desativar uma conta limpa credenciais persistentes, permissões em cache e sessões no servidor. Solicitações
protegidas também verificam o estado ativo/bloqueado; uma página já carregada em um navegador não é apagada
imediatamente. Rotas com suporte a convidados podem resolver uma identidade de convidado separada quando
configuradas, de modo que uma resposta bem-sucedida por si só não prova que a conta desativada mantenha privilégios.

Verifique alterações usando sessões existentes e novas, checando tanto acessos mantidos quanto revogados e
registrando o conteúdo e a identidade da resposta. Não utilize o código HTTP como prova exclusiva de
autorização nem presuma que todos os consumidores do cache se atualizem de forma idêntica.
