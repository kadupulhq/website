---
title: Plugins
description: Por que a superfície de extensão é uma lista de pontos de chamada nomeados, o que um plugin herda ao ser executado dentro do processo e o que as proteções impedem e não impedem.
banner:
  content: O Kadupul está em pré-alfa. Valide estes procedimentos numa instalação de teste isolada.
sidebar:
  order: 11
---

Um plugin é código que a aplicação inclui no seu próprio processo e chama em pontos
nomeados. Todas as outras propriedades do modelo de plugins decorrem dessa única frase.

Para saber o que ler antes de instalar o plugin de outra pessoa, consulte
[Instalar e avaliar plugins](/pt-pt/guides/install-and-vet-plugins/).

## Por que é executado dentro do processo

Veja para que servem os plugins: adicionar uma coluna a uma lista que a aplicação está a
renderizar, alterar as opções de um gráfico antes de ser desenhado, agir sobre um dispositivo
que está a ser eliminado ou anexar um separador. Cada uma dessas ações é uma edição em algo que a
aplicação retém em memória naquele instante.

Um processo de trabalho isolado necessitaria de uma interface explícita e de validação dos seus
resultados. Isso pode preservar o isolamento de privilégios, mas não é o mecanismo utilizado aqui:
o ficheiro do plugin é incluído e a sua função é chamada dentro do processo da aplicação.

## O que o plugin herda

O código do plugin é executado sob a conta do sistema operativo que o chama, com acesso à
ligação da base de dados e às permissões do sistema de ficheiros do processo. Um chamador web também
pode ter uma sessão; um chamador CLI não tem necessariamente uma. O mecanismo de plugins não fornece
uma identidade separada, ambiente isolado (sandbox) ou verificação de assinatura.

As permissões de utilizadores e grupos regem o acesso à aplicação; não contêm código PHP
arbitrário de plugins. As concessões da base de dados, as permissões do sistema de ficheiros e as
restrições do processo ainda limitam o que esse processo pode fazer. Reveja o plugin antes da
instalação e mantenha os privilégios da conta da aplicação limitados.

## Dois estilos de chamada

| Estilo | A aplicação | Um plugin que não devolve nada |
|---|---|---|
| Notificação | Passa argumentos, ignora o resultado | O valor de retorno não é utilizado; efeitos secundários e exceções ainda importam |
| Transformação | Passa um valor, utiliza o que retorna | Pode substituir o valor por null e quebrar os chamadores seguintes |

O estilo de transformação é o que permite a um plugin adicionar um botão, estender uma lista de
ações ou alterar um gráfico. É também onde os plugins ficam interligados: dois plugins no mesmo
ponto veem cada um a saída do anterior na ordem de plugins configurada.

O despachante só avisa sobre uma matriz que se torna uma não-matriz, ou um valor anteriormente não
vazio que se torna semelhante a null, quando estão presentes várias linhas de ponto de chamada
(hooks) correspondentes. Essa verificação não é uma validação completa do contrato do ponto de
chamada; um único plugin pode corromper um valor sem este aviso.

## O registo é estado, não descoberta

Os pontos de chamada vivem numa tabela: qual plugin, qual nome de ponto, qual ficheiro, qual função,
ativado ou não. As rotinas de instalação, atualização e configuração podem registar pontos de chamada;
o registo não se limita à primeira instalação.

A alternativa seria a descoberta em tempo de pedido, o que significa verificar o diretório de
plugins e incluir o código de cada plugin para perguntar o que deseja. Uma única página atinge
muitos pontos de chamada. Incluir tudo para descobrir que nada está anexado é a resposta dispendiosa,
pelo que a aplicação consulta a tabela, guarda em cache a resposta para o pedido e inclui apenas o
ficheiro nomeado por uma linha correspondente.

Essa escolha tem um custo que vale a pena conhecer. A tabela pode discordar do sistema de ficheiros.
Um diretório de plugins eliminado manualmente deixa as suas linhas para trás. As chamadas de retorno
de notificação em falta podem produzir avisos com controlo de frequência; o despachante de
transformação não possui um aviso equivalente para chamadas em falta. Um registo silencioso não prova
que o registo esteja correto.

A ordem provém da ordem de registo do plugin e é ajustável. Uma cadeia de transformação é,
portanto, ordenada por algo que um administrador controla.

## A que um plugin pode aceder

| Capacidade | Nota |
|---|---|
| Criar as suas próprias tabelas | Registado, para que a desinstalação as possa eliminar |
| Adicionar colunas a tabelas existentes, incluindo as do núcleo | Registado, para que a desinstalação as possa remover |
| Registar âmbitos de permissões | Novas secções da interface controladas por acesso |
| Declarar dependências de outros plugins | Versão verificada antes da instalação |
| Executar em coletores remotos | O despacho depende do ponto de chamada, estilo, capacidades e estado da ligação |

As alterações de esquema registadas são o motivo pelo qual a desinstalação é destrutiva. A aplicação
pode eliminar tabelas e colunas monitorizadas, incluindo dados. Também invoca a chamada de retorno
de desinstalação do plugin antes da limpeza. Essa chamada de retorno pode fazer outras alterações;
as alterações não monitorizadas não são revertidas automaticamente e o diretório de origem do plugin
permanece.

Os âmbitos registados por um plugin são detidos por utilizadores e grupos da mesma forma que os
âmbitos do núcleo. Novos âmbitos também podem conceder acesso ao administrador principal e ao
utilizador da sessão atual quando o registo o solicitar. Reveja as concessões resultantes após a
instalação e atualização; não presuma que a sua política existente cubra a nova superfície.
Consulte [Permissões e acesso](/pt-pt/concepts/permissions-and-access/).

## O que as proteções realmente protegem

Existem proteções, e a sua leitura indica qual é o modelo de ameaças.

O ficheiro que um ponto de chamada nomeia é resolvido dentro do próprio diretório desse plugin. Um
caminho que escape é recusado e registado como um evento de segurança. O nome do diretório de um
plugin está restrito a letras, dígitos, sublinhado e hífen. O registo de pontos de chamada e âmbitos
só é aceite a partir de uma função cujo nome se pareça com uma rotina de instalação, atualização ou
configuração; uma chamada de qualquer outro lugar é recusada e registada.

A proteção de caminho restringe qual ficheiro uma linha de ponto de chamada pode incluir. A
verificação de registo apenas examina o nome de uma função chamadora quanto a instalação, atualização
ou configuração; não autentica uma operação de ciclo de vida. O código de um plugin pode usar tal
nome num carregamento de página comum, pelo que esta convenção não constitui um limite de segurança.

Nada fazem quanto ao que o código do próprio plugin faz quando é executado. Não constituem um
limite de contenção e não foram construídas como tal.

## Desativado não é desligado

Alguns tipos de pontos de chamada são registados num estado ativado aquando da instalação: aqueles
que fornecem páginas de configurações, matrizes de configuração e definições de formulários. Um plugin
tem de ser configurável antes de ser ativado, pelo que estes são executados de qualquer forma.

Um plugin desativado ainda tem, portanto, código a ser incluído e executado em alguns carregamentos
de página. A desativação é uma alternância de funcionalidades, e os URLs diretos do plugin também
precisam de revisão. Se suspeitar de código malicioso, isole a instalação e reveja o procedimento
de remoção antes de invocar a desinstalação, que por sua vez executa código do plugin. Remover apenas
os ficheiros de origem não limpa os registos nem reverte as alterações na base de dados.

## Os coletores remotos obtêm uma superfície mais estreita

Um plugin declara as suas capacidades no seu ficheiro de informações: se funciona quando o coletor
consegue alcançar a instalação principal, se funciona quando não consegue e se participa na recolha.

Num coletor, os pontos de chamada listados são verificados contra os requisitos de capacidade. Os
pontos de transformação não listados ainda são despachados; os pontos de notificação não listados
podem ser despachados quando online ou quando o plugin declara suporte para gestão/visualização
offline. As omissões não são universalmente registadas. Isto é lógica de encaminhamento, não uma
lista global de permissões ou limite de isolamento; inspecione o despachante exato e o estado da
ligação para o ponto de chamada que utiliza.

A razão é que um coletor é um ambiente diferente. A sua configuração é uma réplica que pode ter
horas de antiguidade, e pode não ter qualquer ligação à base de dados central. Um ponto de chamada
escrito sob a presunção de que a base de dados central está a uma consulta de distância falha aí,
pelo que o modelo exige que o plugin declare quais as presunções que faz em vez de as inferir.
Consulte [Recolha remota de dados](/pt-pt/concepts/remote-data-collection/).

## O poller é o local dispendioso para chamadas

Um ponto de chamada no caminho de polling é executado quando o seu ponto de invocação é atingido.
A sua frequência depende do evento, processo e encaminhamento do coletor; nem todo o ponto é
executado em todos os processos em cada ciclo. Código lento num caminho frequente consome o
intervalo de polling e pode contribuir para falhas nos gráficos.

Um ponto de chamada numa página é renderizado uma vez para uma pessoa que já está à espera. Os
dois parecem idênticos na tabela de registo e diferem por ordens de magnitude no custo.

## Por que a superfície parece irregular

A API de pontos de chamada expõe pontos de invocação com diferentes propósitos e formatos de
argumentos.

É por isso que a lista é ampla e irregular, por que alguns pontos entregam um valor para alterar
e outros apenas informam que ocorreu um evento, e por que os argumentos diferem no formato de um
ponto para o outro. Uma versão mínima declarada do núcleo não estabelece compatibilidade com todos
os pontos de chamada: inspecione os argumentos e as expectativas de retorno de cada ponto de chamada
e teste o plugin na versão de destino. As limitações de compatibilidade CLI e de concessão de âmbitos
documentadas em [Instalar e avaliar plugins](/pt-pt/guides/install-and-vet-plugins/) também se
aplicam; a instalação bem-sucedida por si só não é prova de compatibilidade.

A leitura prática: um plugin está acoplado à versão do núcleo contra a qual foi escrito, muito mais
estreitamente do que o seu mínimo declarado sugere. Verifique novamente os plugins antes de uma
atualização do núcleo, em vez de o fazer depois.
