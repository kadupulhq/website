---
title: Dimensionar o sondador
description: O que alterar quando a recolha deixa de terminar dentro do seu intervalo e como identificar qual o limite efetivamente atingido.
banner:
  content: O Kadupul está em pré-alfa. Valide estes procedimentos numa instalação de teste isolada. Tradução em rascunho, pendente de revisão por uma pessoa fluente no idioma.
sidebar:
  order: 6
---

:::caution[Validar antes de utilizar]
O código-fonte está disponível, mas não existe uma versão com suporte nem um caminho
de migração para o Kadupul. Teste estes procedimentos numa cópia isolada com
cópias de segurança antes de depender deles. Consulte o [estado do projeto](/pt-pt/project/status/).
:::

Dimensionar o sondador resume-se a uma questão: uma ronda de recolha termina antes
de a seguinte começar? Tudo o que se segue destina-se a responder a isso e a recolocar
a resposta no sim.

Consulte primeiro a [Arquitetura](/pt-pt/concepts/architecture/) se não tiver a certeza
sobre qual o componente responsável pela recolha.

## Os dois relógios

Existem dois intervalos distintos e não representam a mesma definição.

| | O que é | Valores permitidos |
|---|---|---|
| Intervalo do iniciador | Com que frequência o sistema operativo inicia o recolhedor, via cron ou pelo serviço `cactid` | 60 ou 300 segundos |
| Intervalo do sondador | Cadência base de recolha; os passos individuais das fontes de dados podem ser mais longos | 10, 15, 20, 30, 60 ou 300 segundos |

Quando o intervalo do sondador é mais curto que o intervalo do iniciador, um único arranque
executa várias passagens de recolha num ciclo. O número de passagens é o intervalo do iniciador
dividido pelo intervalo do sondador.

O orçamento para todo o arranque é derivado desses dois números: passagens multiplicadas
pelo intervalo do sondador, menos dois segundos. Esse é o relógio de tempo real contra o
qual a execução é avaliada.

## O que acontece quando uma ronda ultrapassa o tempo

Três acontecimentos distintos que geram três linhas de registo distintas.

**A execução é interrompida.** Quando o tempo decorrido ultrapassa o orçamento, o sondador
regista que o tempo máximo de execução foi excedido, grava as suas estatísticas e termina.
O trabalho que não tenha produzido uma amostra pode deixar uma falha. As amostras já aceites
na fila persistente podem permanecer pendentes para uma escrita RRD bem-sucedida posterior;
um excesso de tempo não significa que todas as medições por descarregar tenham sido descartadas.
Inspecione a profundidade da fila e os registos a par do gráfico, e não limpe as linhas retidas
apenas para que a próxima execução pareça limpa.

**A ronda seguinte deteta os danos.** No arranque, o sondador conta as linhas de processos
que nunca foram concluídas e avisa que foram detetados processos a ultrapassar um ciclo de
sondagem. Investigue registos de processos inacabados ou obsoletos e os processos-filhos reais
em execução; o aviso isolado não identifica o estrangulamento.

**Os relógios desviam-se.** Se decorreu mais tempo desde a última execução do que o orçamento
permite, o sondador alerta para o facto de o iniciador estar dessincronizado com o intervalo
do sondador. Isto deve-se normalmente ao iniciador e não ao sondador: uma entrada no cron com
a frequência errada, um serviço parado ou um anfitrião que esteve em suspensão.

Estes fluxos invocam o utilitário de notificação do administrador. A entrega depende dos
destinatários configurados, dos controlos de notificação e do funcionamento do transporte
de correio; um aviso no registo não prova que um e-mail tenha chegado. Consulte as
[notificações por e-mail](/pt-pt/guides/send-email-notifications/).

Existe um quarto caso que não constitui uma ultrapassagem. Se o sondador for iniciado mais
cedo do que o previsto, regista que está configurado para executar com demasiada frequência
e termina sem recolher dados. `--force` ignora essa verificação temporal; utilize-o apenas
durante um diagnóstico controlado com os arranques agendados e outros manuais desativados.
Não adiciona capacidade nem torna segura uma recolha sobreposta.

## A linha de estatísticas

Cada execução concluída escreve uma linha de estatísticas no registo. Transporta o tempo
decorrido, o método de recolha, as contagens de processos e tarefas, o número de dispositivos,
dispositivos por processo, fontes de dados e ficheiros RRD processados.

Analise as tendências do tempo decorrido, da latência de cauda, da profundidade da fila e das
atualizações falhadas. Investigue mesmo uma execução isolada perto do limite orçamental quando
esta provocar falhas; um crescimento sustentado ajuda a identificar quando a capacidade ou o
comportamento de recolha têm de mudar.

## Processos e tarefas

Dois controlos que realizam tarefas diferentes.

| Controlo | Unidade de trabalho que divide | Que recolhedor o utiliza |
|---|---|---|
| Processos | Dispositivos, divididos em intervalos contíguos de identificador de dispositivo | Ambos |
| Tarefas | Elementos dentro de um dispositivo | Apenas o Spine |

A consequência é o aspeto em que muitos tropeçam: **um processo recebe dispositivos inteiros.**
Um dispositivo com cinco mil fontes de dados não pode ser distribuído por vários processos.
Fica atribuído a um único processo e esse processo demora o tempo que demorar. Adicionar
processos nada faz para resolver isso.

Ambos os valores são mantidos por recolhedor de dados e não globalmente. Os valores na página
de definições são predefinições aplicadas aquando da criação de um novo recolhedor de dados.
Alterar a predefinição não afeta um recolhedor existente.

Existe igualmente uma contagem de tarefas por dispositivo, que determina a forma como um único
dispositivo volumoso é subdividido. Aplica-se exclusivamente ao recolhedor em C.

Balance Process Load utiliza contagens acumuladas de elementos para selecionar fronteiras entre
dispositivos inteiros por ordem de identificador. Não divide um dispositivo nem garante contagens
iguais de elementos, e a contagem de elementos não é equivalente ao tempo de execução. Compare o
tempo por processo antes e depois de o ativar numa carga de trabalho representativa e isolada.

## O recolhedor PHP face ao recolhedor C

O recolhedor PHP, `cmd.php`, é fornecido com a aplicação. O Kadupul prevê manter uma derivação
do Spine, mas a localização do seu código-fonte e compilações validadas ainda não se encontram
documentadas. Utilize o PHP até que essas evidências estejam disponíveis. As comparações com o
Spine, as definições de tarefas e os comandos apresentados abaixo descrevem o comportamento
herdado, não uma implementação disponível ou suportada do Kadupul.

| | Recolhedor PHP | Spine |
|---|---|---|
| Paralelismo | Apenas processos | Processos e tarefas |
| Definição de tarefas | Forçada a 1 independentemente da configuração | Respeitada |
| Servidor de scripts | Um por processo, não configurável | 1 a 15 por processo, configurável |
| Tempo limite do script | Não aplicado | Aplicado, por predefinição 25 segundos |
| Instalação | Incluído com o código | Derivação prevista; sem compilação validada documentada |

A contagem forçada de tarefas merece ser declarada com clareza: se o recolhedor estiver definido
para o PHP, a variável de tarefas em tempo de execução é fixada em 1; isto não reescreve a definição
de tarefas armazenada para o recolhedor. Dimensionar o recolhedor PHP pode envolver mais processos,
e a orientação no código-fonte sugere permanecer em ou abaixo do dobro do número de núcleos de CPU.

A configuração do Spine e o comportamento dos comandos exigem validação face ao binário exato em
avaliação. O código-fonte da aplicação PHP isoladamente não comprova a ordem de pesquisa da
configuração, o comportamento de tarefas nem os efeitos secundários.

Exemplos herdados para uma avaliação isolada do Spine, não comandos validados do Kadupul:

```sh
spine --first=42 --last=42 --threads=1 --verbosity=HIGH --stdout
spine --hostlist='42,43,51' --readonly
```

`--readonly` tem como objetivo evitar a gravação de resultados. Continua a contactar dispositivos
e a executar scripts de recolha; valide os seus efeitos secundários previamente num teste isolado.

## Ligações à base de dados

As tarefas não são gratuitas. Cada tarefa do spine mantém a sua própria ligação à base de dados,
o mesmo acontecendo com cada servidor de scripts.

```
estimated worker connections = processes * (threads + script_servers)
```

Esta é a estimativa constante da ajuda das definições da aplicação, não um limite superior medido.
Some-a entre recolhedores e adicione margem para processos-mãe do sondador, pedidos web, manutenção
e outros clientes. Meça os picos reais e as ligações rejeitadas antes de estabelecer o limite da
base de dados; aumentá-lo também consome recursos.

O esgotamento de ligações pode provocar falhas de medição, mas lacunas rotativas não são um
diagnóstico inequívoco. Confirme-o com métricas de ligação da base de dados e erros da aplicação.

## Escritas RRD diferidas

Existe um modo que impede o sondador de escrever nos ficheiros RRD a cada passagem. Os resultados
acumulam-se antes numa tabela da base de dados e são descarregados em bloco, quer por temporizador
quer quando um gráfico solicita o ficheiro. Troca um elevado número de pequenas escritas por um
número reduzido de grandes escritas.

Dois factos de grande relevância operacional:

- É obrigatório quando existem recolhedores de dados remotos. Não se trata de uma recomendação,
  mas sim de uma exigência do software.
- A tabela de armazenamento intermédio é persistente e não reside na memória, pelo que as medições
  não descarregadas sobrevivem a um reinício. Significam também que os seus ficheiros RRD estão
  atrasados em relação à sua base de dados. Consulte [Cópia de segurança e restauro](/pt-pt/guides/back-up-and-restore/)
  antes de criar qualquer instantâneo.

A fila ativa principal `poller_output` é também InnoDB nesta revisão. A verificação prévia de
armazenamento rejeita uma fila MEMORY; aumentar o limite de tabelas de memória não resolve essa
recusa. Com os produtores parados e uma cópia de segurança correspondente retida, converta
explicitamente uma fila inadequada herdada e, em seguida, inspecione o armazenamento sob cada conta de serviço:

```sh
php cli/upgrade_database.php --migrate-poller-queue
php cli/upgrade_database.php --check-rrd-storage
```

Estas operações são distintas. Mantenha as linhas pendentes e monitorize o espaço em disco da base
de dados e a idade da fila, bem como a contagem de linhas. Consulte
[Atualizar em segurança](/pt-pt/guides/upgrade-safely/) para a seleção de filas, verificações de
confiança em contas de serviço e requisitos prévios de reinício.

## Quando avançar para recolhedores remotos

Um recolhedor de dados remoto é uma segunda máquina a executar o mesmo código com um identificador
de recolhedor distinto, consultando um subconjunto de dispositivos e gravando os resultados de volta
na base de dados central.

Avance para este modelo quando o estrangulamento estiver do lado da recolha e não do armazenamento:

- O processador do anfitrião do sondador está saturado durante uma execução e inativo entre execuções.
- A latência de ida e volta para um grupo de dispositivos domina a execução, estando esse grupo
  atrás de uma única ligação.
- Um local encontra-se no extremo distante de uma WAN através da qual não pretende efetuar sondagens.
- Necessita de recolha num local isolado e validou o armazenamento intermédio offline e a recuperação
  para esse recolhedor antes de depender dele.

Os recolhedores remotos não eliminam os limites da base de dados central nem as restrições de escrita
em ficheiros RRD. Meça a capacidade central de ingestão e descarga antes de aumentar o débito de
recolha; produtores adicionais podem aumentar uma acumulação existente.

Cada recolhedor tem as suas próprias contagens de processos e tarefas, as suas credenciais de base
de dados e um intervalo de sincronização, por predefinição de duas horas. Existe uma ferramenta de
linha de comandos para forçar uma sincronização completa em vez de aguardar.

A instalação central pode replicar o sítio web e o código de plugins para os recolhedores remotos
para que estes se atualizem de forma autónoma. Essa replicação pode ser desativada se implementar o
código por outro método.

## Qual o limite atingido

Utilize esta tabela para formular hipóteses e valide-as posteriormente com registos e medições.
Vários limites podem manifestar-se em conjunto. As opções do Spine continuam por validar aqui.

| Observação | Limite | O que alterar |
|---|---|---|
| Aviso de iniciador dessincronizado, com sondador rápido nas restantes operações | Atraso de agendamento, ultrapassagem prévia ou interrupção do anfitrião | Inspecionar histórico de arranques e estado dos processos |
| Tempo de execução constante, com um dispositivo sempre atrasado | Respostas lentas, scripts exigentes ou trabalho concentrado | Cronometrar métodos de entrada e rever tempos limite/tentativas |
| Tempo de execução proporcional ao número de dispositivos, CPU saturada | Pressão de processador no recolhedor | Medir se mais processos ajudam; avaliar localização do recolhedor |
| Tempo de execução proporcional ao número de dispositivos, CPU inativa | Esperas de rede, scripts ou base de dados | Medir origens de espera antes de alterar o paralelismo |
| Amostras em falta num conjunto rotativo de dispositivos | Ligações, tempos limite ou outras falhas de recolha | Verificar erros, métricas de ligação e filas retidas |
| Tempo de execução aceitável, escritas RRD lentas, disco ocupado | Armazenamento | Escritas RRD diferidas ou disco mais rápido |
| Lentidão geral, incluindo na interface web | Base de dados | Dimensão do pool de memória intermédia e, depois, o anfitrião da base |

Duas armadilhas a ter em consideração.

**Alterar o intervalo base não é o mesmo que alterar o passo de cada fonte de dados.**
Ajuste perfis, passos de elementos em cache e definições de heartbeat/passo de RRD. A reconstrução
da cache não altera a estrutura dos ficheiros RRD existentes. Consulte
[Retenção de dados](/pt-pt/guides/manage-data-retention/) e
[Tempo e intervalos](/pt-pt/concepts/time-and-intervals/).

**Um intervalo mais rápido multiplica tudo.** Passar de 300 segundos para 60 não torna o trabalho
cinco vezes mais económico. Fontes configuradas para essa cadência mais rápida são recolhidas com
maior frequência; fontes que mantêm passos mais longos não necessitam de correr em cada passagem base.
Meça a carga daí resultante em vez de presumir que cada passagem envolve trabalho igual.
