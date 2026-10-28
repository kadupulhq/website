---
title: Recolha remota de dados
description: Por que a recolha se distribui e o armazenamento não, o que um coletor remoto detém e o que custa ter uma segunda cópia da configuração.
banner:
  content: O Kadupul está em pré-alfa. Valide estes procedimentos em uma instalação de teste isolada.
sidebar:
  order: 9
---

:::caution[Comportamento herdado do proxy RRDtool]
A implementação do proxy RRDtool não é suportada no Kadupul. Utilize armazenamento local de
RRDtool (`storage_location = 0`). As definições de proxy, descrições de protocolo e fluxos de
trabalho nesta página documentam o comportamento herdado, não um caminho suportado de implementação
ou migração. Consulte [Proxy RRDtool](/pt-br/reference/rrdproxy/).
:::

A recolha é a parte que não cabe numa única máquina. A maior parte de uma execução de polling é
gasta à espera que os dispositivos respondam, e a espera não se comprime. Pode sobrepor mais dessa
espera com mais processos e threads, até ao ponto em que o anfitrião coletor esgota o CPU ou o tempo
de ida e volta para um local distante domina tudo.

Um coletor remoto é o mesmo código com um identificador de coletor diferente, sondando um
subconjunto de dispositivos. Cada dispositivo nomeia o coletor responsável por ele. Essa atribuição
é a partição normal de agendamento. Mantenha a atribuição de dispositivos e a cache replicada do
poller consistentes; esta escolha de agendamento não é prova de que cada escrita de resultados
imponha a posse do coletor.

Para a questão de *quando* recorrer a um, consulte
[Dimensionar o poller](/pt-br/guides/scale-the-poller/). Esta página aborda o que um coletor é.

## Por que um coletor transporta a sua própria base de dados

Um coletor que lê a sua lista de trabalho da base de dados central através da rede para de recolher
quando a rede falha. Isso é o oposto do motivo pelo qual pretendia um coletor remoto.

Portanto, transporta uma base de dados local contendo a sua própria cópia da configuração:
definições, modelos, métodos de introdução de dados, consultas de dados, a sua fração da cache do
poller, os seus dispositivos, a configuração de plugins e as tabelas de usuárioes e permissões.
Essa cópia é enviada a partir da instalação principal. Trate a instalação principal como a autoridade
de configuração, enquanto o coletor mantém o estado operacional local e as definições da máquina.

As definições de caminhos estão excluídas da cópia, juntamente com as estatísticas por ciclo que a
instalação principal guarda para si mesma. Os caminhos são propriedades de uma máquina, não da
instalação.

## A replicação é periódica, pelo que a configuração sofre atrasos

O poller principal verifica coletores remotos ativados com um anfitrião de base de dados não local
e um intervalo de sincronização diferente de zero. Um coletor é devido se nunca sincronizou, se o
seu intervalo decorreu ou se está marcado como necessitando de sincronização. Um intervalo zero
exclui-o desta verificação periódica, mesmo quando marcado como necessitando de sincronização.

O padrão global é de duas horas; um coletor pode ter o seu próprio intervalo. Isto não é uma
garantia de que cada alteração aguarde duas horas: as operações de dispositivos e plugins também têm
caminhos de replicação direcionados. A propagação bem-sucedida depende dessa operação, da conectividade
e das tabelas selecionadas. Verifique a configuração e a cache reais do coletor em vez de presumir
uma consistência imediata ou um atraso fixo.

A replicação completa pode ser solicitada a partir do coletor principal com
`php cli/poller_replicate.php`, quando estão configurados coletores remotos ativados. Replica todos
os coletores remotos ativados, a menos que `--poller=N` selecione um.
Consulte [Dimensionar o poller](/pt-br/guides/scale-the-poller/) e
[Migrar para novo hardware](/pt-br/guides/migrate-to-new-hardware/) para obter contexto operacional.

## Três modos de ligação

Um coletor decide no arranque como se vai comportar, com base no facto de a base de dados central
responder e de estar a reter amostras que ainda não foram entregues.

| Modo | Condição | Comportamento |
|---|---|---|
| Online | A base de dados central liga-se e nenhum acúmulo Boost local é detetado | As escritas de resultados têm como destino a base de dados central |
| Offline | A ligação central falha ou é forçada offline | A recolha utiliza memória intermédia local, se os serviços locais permanecerem saudáveis |
| Recuperação | A base de dados central liga-se e permanecem linhas Boost locais | As novas amostras permanecem locais enquanto um processo em segundo plano tenta transferir o acúmulo |

Offline não é um estado de erro. É o comportamento concebido de um coletor cuja ligação caiu, e é a
razão pela qual um coletor possui uma base de dados local. A recolha continua com base na configuração
disponível localmente. A capacidade da base de dados local, o acesso aos dispositivos, a saúde do
agendador e credenciais utilizáveis continuam a ser necessários; o modo offline não garante recolha
ininterrupta nem entrega final.

## Como os resultados chegam à instalação principal

Os resultados não viajam como escritas RRD. Viajam como linhas.

A escrita diferida em RRD é obrigatória quando existe mais do que um coletor, e adicionar um
coletor remoto ativado faz com que o poller principal ative a atualização diferida. O caminho de
arranque também ativa o Boost do sistema e o redirecionamento quando existem múltiplos registos de
coletores. Estas definições não validam por si só uma implementação funcional.
Consulte [Escritas de elevado volume](/pt-br/concepts/high-volume-writes/) para saber o que esse modo faz.

Online, um coletor insere as suas amostras diretamente na tabela intermédia central. A instalação
principal envia-as para arquivos RRD de acordo com o seu próprio calendário, exatamente como faria
para amostras recolhidas por ela própria. As amostras do coletor não são especiais assim que chegam.

Offline e durante a recuperação, as amostras acumulam-se na fila Boost local. Quando a base de
dados central fica novamente acessível, o `poller_recovery.php` insere as linhas em memória
intermédia na fila Boost central, atualizando a saída de uma linha que já aí exista.

A recuperação elimina uma linha local apenas após a inserção central para o seu pacote ter sucesso,
e apenas quando a linha local ainda corresponde ao que foi enviado. Uma inserção falhada, uma
amostra sobredimensionada ou uma linha alterada durante a limpeza deixam as amostras locais no lugar
para a tentativa seguinte. Esta página não estabelece um procedimento validado de recuperação para
múltiplos coletores.

As inserções de recuperação transportam identificadores de fontes de dados, nomes, carimbos de data/hora
e valores; não verificam essas linhas contra as atribuições de coletores. Não confie numa rejeição
universal de transferência para se proteger contra atribuições desatualizadas ou produtores sobrepostos.
Valide as atribuições e o estado da cache antes de ativar a recolha.

## O armazenamento não se distribui

O fluxo de trabalho herdado baseado em proxy mantém os arquivos RRD centralizados e espera que os
coletores cheguem a eles através do proxy RRDtool. Esse fluxo não é suportado no Kadupul; não o trate
como orientação de implementação. Um caminho de armazenamento validado para múltiplos coletores
utilizando RRDtool local deve ser documentado antes de se recomendar uma substituição.

Esta é a parte com que as pessoas mais frequentemente se surpreendem, pelo que vale a pena ser
direto: **Os coletores remotos distribuem a espera, não a escrita.** Se o limite que atingiu foi o
disco sob a árvore de RRD, a capacidade de recolha extra não remove esse limite. Mais amostras de
entrada podem aumentar a carga da base de dados central e o atraso dos processos de escrita.

## O que mais flui de volta

Um coletor gere o estado operacional dos seus dispositivos: acessibilidade, o último erro, tempos
de ida e volta, contagens de polling, disponibilidade. Escreve estes dados localmente à medida que
sonda e envia colunas operacionais selecionadas para a instalação principal em lote. Isto atualiza
essas colunas, não a linha inteira de configuração do dispositivo.

Assim, o que a instalação principal mostra para a acessibilidade de um dispositivo é a visão do
coletor aquando do último envio bem-sucedido. Um coletor que está offline tem uma visão atual dos
seus próprios dispositivos que ninguém na instalação principal consegue ver.

A instalação principal monitoriza os coletores da mesma forma que um coletor monitoriza os
dispositivos. Um auxiliar de disponibilidade considera um coletor remoto ativado funcional apenas
quando o seu último carimbo de data/hora de estado tem uma antiguidade inferior ao dobro do intervalo
de polling configurado. Esta verificação não prova a entrega de amostras, a replicação bem-sucedida
ou gráficos atualizados.

## Modos de falha

| O que falha | O que acontece | O que nota |
|---|---|---|
| Ligação à instalação principal | O coletor pode continuar localmente enquanto a sua base de dados e agendador permanecerem saudáveis | Gráficos atrasados e uma fila crescente; a entrega e perdas devem ser verificadas |
| O próprio coletor | Os seus dispositivos atribuídos podem deixar de ser sondados | Amostras em falta; diagnosticar o estado do agendador, dispositivo e coletor |
| Replicação | O coletor executa uma configuração mais antiga | As alterações parecem não surtir efeito |
| A base de dados central | Os processos remotos podem entrar em modo offline se a configuração da ligação falhar | Ingestão central interrompida; a retenção local depende da saúde do nó local |
| Atribuições sobrepostas ou obsoletas | Mais do que um produtor pode submeter amostras relacionadas | Sem rejeição universal; inspecione atribuições, carimbos de data/hora e erros de escrita |

A retenção em memória intermédia pode transformar algumas interrupções em atrasos, mas não torna a
entrega isenta de perdas. Verifique a idade da fila, a capacidade da base de dados, erros de
recuperação e os carimbos de data/hora RRD resultantes. Um gráfico plano por si só não consegue
distinguir uma falha de dispositivo de uma entrega atrasada ou com falha.

## O que custa

Em comparação com um único poller central:

**Ganha** tempos de ida e volta paralelos entre máquinas, polling que acontece perto dos dispositivos
em vez de através de uma WAN, e a capacidade de continuar a recolha local enquanto a instalação
principal estiver inacessível, sujeito aos limites de recuperação e saúde local supramencionados.

**Paga** com a replicação da configuração que pode sofrer atrasos, uma segunda base de dados para
operar, monitorizar e salvaguardar por coletor, um modo de escrita diferida que já não é opcional,
e uma base de dados central que agora recebe escritas concorrentes de cada coletor.

O resumo honesto é que um coletor remoto é uma máquina que agora tem de gerir. Um poller com mais
processos é uma definição. Um coletor é infraestrutura, com a sua própria base de dados, as suas
próprias credenciais, o seu próprio relógio e a sua própria versão da verdade durante o tempo em que
a replicação não tiver sido executada.
