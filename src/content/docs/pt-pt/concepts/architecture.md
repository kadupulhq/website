---
title: Arquitetura
description: As quatro partes móveis e qual delas geralmente apresenta falhas.
sidebar:
  order: 1
banner:
  content: O Kadupul está em pré-alfa. Valide estes procedimentos numa instalação de teste isolada. Tradução em rascunho, pendente de revisão por uma pessoa fluente no idioma.
---

:::caution[Comportamento herdado do proxy RRDtool]
A implementação do proxy RRDtool não é suportada no Kadupul. Utilize o armazenamento local do RRDtool
(`storage_location = 0`). As configurações de proxy, descrições de protocolo e fluxos de trabalho
nesta página documentam o comportamento herdado, não uma implementação ou caminho de migração
suportado. Consulte [RRDtool proxy](/pt-pt/reference/rrdproxy/).
:::

A aplicação web, a base de dados, a recolha agendada e o armazenamento RRD do Kadupul desempenham
funções distintas, mas os seus fluxos de execução sobrepõem-se. Saber qual a operação que falhou
ajuda a delimitar a investigação; uma interface funcional não prova que a recolha esteja a operar.

**A interface web** é uma aplicação PHP. Gere configurações e renderiza ou
fornece gráficos em cache. Algumas ações na web também disparam recolhas, como pedidos de gráficos
em tempo real, e pedidos normais de gráficos podem disparar atualizações RRD pendentes.

**A base de dados** armazena configurações, permissões, estado operacional, a cache do sondador
e filas de medições. Os valores recolhidos podem permanecer nela enquanto aguardam gravação no RRD
ou nova tentativa; não é apenas um repositório de configurações.

**O sondador** coordena as tarefas agendadas e os processos filhos de recolha. Os resultados passam por
filas na base de dados antes de o gravador padrão ou diferido atualizar os ficheiros RRD.

**Os ficheiros RRD** contêm séries temporais históricas delimitadas. Uma fonte de dados normalmente possui um RRD
contendo os seus campos; a criação de gráficos pode reutilizar fontes, e a criação de metadados não
garante que o ficheiro já exista.

## As fronteiras

| Fronteira | O que a atravessa | Meio de transporte |
|---|---|---|
| Interface para a base de dados | Configuração, sessões, autorização, tarefas em cache e dados operacionais | SQL; a base de dados pode ser remota |
| Interface para os ficheiros | Leituras de gráficos, imagens em cache e criação ou atualizações de RRD a pedido qualificadas | Sistema de ficheiros e RRDtool |
| Sondador para a base de dados | Listas de trabalho, valores recolhidos, filas retidas, estado e contagens decrescentes | SQL |
| Recolha para os dispositivos | SNMP, scripts de recolha e verificações de disponibilidade | Comandos de rede ou locais; recolha acionada via web também é possível |
| Gravador para os ficheiros | Amostras agrupadas, possivelmente vários registos de data/hora por atualização | Comandos RRDtool e canais confirmados |
| Servidor de base de dados para ficheiros RRD | Nenhuma atualização direta de RRD no fluxo normal da aplicação | O código do gravador da aplicação coordena os dois repositórios |

Registos da base de dados associam uma fonte de dados a um dispositivo e ao seu caminho de ficheiro configurado.
Ficheiros do RRDtool descrevem séries e históricos consolidados; não substituem esse mapeamento da
aplicação. O tráfego de rede não se limita à consulta de dispositivos: ligações de base de dados,
recolhedores remotos e outras integrações configuradas também podem atravessar anfitriões.

Faça cópias de segurança do estado da base de dados, das amostras pendentes e dos ficheiros RRD de forma consistente. Um restauro
apenas da base de dados não recupera o conteúdo histórico do RRD, e um restauro apenas dos ficheiros omite
configurações e amostras ainda não descarregadas no disco. Mover ficheiros sem reconciliar os caminhos pode gerar
erros de ficheiro inexistente ou gravações retidas; isso não representa uma falha de recolha silenciosa garantida. Consulte [Cópia de segurança e restauro](/pt-pt/guides/back-up-and-restore/) e
[Migração para novo hardware](/pt-pt/guides/migrate-to-new-hardware/).

<span id="why-measurements-are-not-in-the-database"></span>

## Por que o histórico de longo prazo usa ficheiros RRD

O histórico de gráficos a longo prazo é armazenado em RRDs, mas as filas de medições residem na base de dados.
A fila normal em trânsito é InnoDB nesta revisão, e as gravações diferidas retêm amostras em tabelas Boost.
Gravações com falha ou entregas remotas atrasadas podem fazer crescer essas filas. Consulte
[Escritas de grande volume](/pt-pt/concepts/high-volume-writes/).

Um RRD aloca um número definido de linhas nas resoluções selecionadas. Atualizações normais
reutilizam esse espaço em vez de anexar histórico indefinidamente. O tamanho do ficheiro é delimitado
para uma estrutura inalterada; adicionar fontes de dados, alterar estruturas, reter cópias de recuperação
ou acumular filas continua a aumentar os requisitos totais de armazenamento.

O compromisso reside numa retenção escolhida antecipadamente. Uma vez que o histórico detalhado tenha expirado ou
tenha sido consolidado, uma alteração posterior de estrutura não consegue recriar os detalhes descartados. Consulte
[Fontes de dados e históricos consolidados](/pt-pt/concepts/data-sources-and-rras/).

A configuração e o estado operacional utilizam a base de dados porque a aplicação necessita de atualizações partilhadas
e consultas relacionais. Isto não significa que cada relação seja imposta por uma chave externa
na base de dados, nem que um armazenamento em linhas tenha necessariamente de crescer para sempre;
descreve a divisão de responsabilidades desta aplicação.

## Dois caminhos que partilham duas partes

Um pedido normal de página ou gráfico segue geralmente este caminho:

1. Um navegador envia um pedido; o PHP carrega a configuração e liga-se à base de dados.
2. O pedido aplica a autenticação e a autorização correspondente ao domínio e aos objetos.
3. Ações da consola leem ou atualizam a configuração e podem desencadear trabalho adicional.
4. Um pedido de gráfico pode verificar amostras Boost pendentes e uma cache de imagens, ou montar
   um comando RRDtool e ler os ficheiros configurados. Consulte
   [Como os gráficos são desenhados](/pt-pt/concepts/how-graphs-are-drawn/).
5. Pedidos de gráficos em tempo real podem iniciar o recolhedor em tempo real e utilizar dados
   temporários separados. Um gráfico plano por si só não prova que o ficheiro esteja vazio ou que a
   recolha e renderização tenham sido bem-sucedidas.

Uma consulta agendada segue habitualmente este caminho:

1. O agendador inicia o sondador, que verifica o estado de ativação, o tempo e o armazenamento.
2. Seleciona tarefas pendentes da cache do sondador e inicia os processos filhos de recolha.
3. Os processos filhos consultam os dispositivos ou executam scripts de recolha e colocam os resultados na base de dados.
4. O gravador correspondente processa as amostras agrupadas, utilizando filas diferidas quando
   configuradas e retendo as falhas que podem ser repetidas.
5. O estado operacional e o estado de agendamento são atualizados na base de dados.

Consulte [Ciclo de vida do sondador](/pt-pt/reference/poller-lifecycle/) para a ordenação e tratamento de falhas.
Estes caminhos partilham recursos de base de dados e de armazenamento e podem competir por eles. Reiniciar
o servidor web não repara um sondador agendado separadamente, mas pedidos web podem participar na recolha
e gravação; diagnostique o processo que realmente está a falhar.

## O que é executado como cada utilizador

| Processo | É executado como | Iniciado por |
|---|---|---|
| Aplicação web PHP | Conta do servidor web ou do pool PHP-FPM | Servidor web |
| Sondador agendado | Conta configurada do agendador | cron, Programador de Tarefas ou serviço configurado |
| RRDtool | Normalmente herda a conta do processo iniciador | Caminho web, do sondador ou de manutenção |
| Scripts de recolha | Normalmente herdam a conta do seu recolhedor | Recolha agendada ou acionada via web |

Todas as contas de gravação participantes necessitam de acesso adequado ao armazenamento configurado.
A criação normal de fontes de dados escreve metadados; o RRD pode ser criado mais tarde quando um
gravador necessitar dele. A ausência de um ficheiro pode indicar que a recolha ainda não atingiu esse ponto,
bem como uma falha de caminho, confiança, permissão ou criação.

Alguns caminhos de criação executados como root tentam aplicar o proprietário e o grupo do diretório RRA.
Estas tentativas podem falhar e registar erros; não substituem a configuração correta das contas
de serviço. A posse sem privilégios de root segue as regras do sistema operativo, incluindo herança de
grupos de diretórios e ACLs. Valide permissões de armazenamento e configurações numéricas fiáveis de
UID/GID sob todas as contas de gravação web e do sondador. Consulte [Atualizar com segurança](/pt-pt/guides/upgrade-safely/).

A implementação de ICMP em PHP analisada invoca o utilitário ping do sistema operativo.
A sua capacidade de enviar sondagens depende desse utilitário e da política do sistema operativo; a presença
de rotinas legadas de UID efetivo não significa que cada teste ICMP eleve o PHP a root.
Não execute a aplicação como root apenas para ativar o ping. Verifique o comando real, a conta e as
mensagens de erro; verificações por TCP ou UDP possuem semânticas de acessibilidade distintas.

## A lista de trabalho é pré-calculada

A cache do sondador armazena o trabalho de recolha resolvido para que cada execução não precise de derivar
cada comando a partir das relações dos modelos. Operações de configuração podem reconstruir as entradas
afetadas; ferramentas explícitas de reconstrução estão disponíveis quando necessário.

As alterações representadas nos campos em cache precisam de alcançar essas entradas antes de a recolha
as utilizar. Outras definições são lidas separadamente, pelo que nem toda a alteração de configuração
exige uma reconstrução manual da cache. Inspecione o conteúdo da cache, erros de recolha e o estado
de replicação remota em vez de assumir uma única causa. Consulte [A cache do sondador](/pt-pt/concepts/the-poller-cache/) e
[Recolha remota de dados](/pt-pt/concepts/remote-data-collection/).

## Onde as coisas costumam falhar

| Sintoma | Verificações úteis |
|---|---|
| A interface funciona, os gráficos estão planos | Execução do agendador, erros de recolha, filas, frescura das amostras e janela do gráfico |
| O sondador executa, os ficheiros não avançam | Confirmação ou erros do gravador, confiança e permissões de armazenamento, trabalho diferido acumulado |
| Uma fonte de dados está plana | Resposta do dispositivo, linha da cache, mapeamento do ficheiro, amostras desconhecidas e expressões de desenho |
| A alteração de configuração parece ineficaz | Resultado da gravação, sobreposições de modelos, entradas da cache afetadas e replicação |
| Lacunas regulares | Intervalos, cadência de heartbeat, tempos limite, disponibilidade do dispositivo e falhas de gravação |
| Forma inesperada do gráfico | Comando gerado, escolhas de CDEF/CF, dados reais do ficheiro, cache de imagens e mapeamento |
| O histórico de uma porta parece associado a outra interface | Identidade da consulta, renumeração e resultados de reindexação |
| A conta acede à consola mas a nenhum gráfico | Domínio da página de gráficos, autorização de objetos e identidade do gráfico solicitado |
| Os recolhedores diferem | Atribuição, configuração replicada, sobreposições locais e estado da ligação |
| Tudo está lento | Esperas na base de dados, contenção no gravador/armazenamento, tempo de execução do recolhedor e carga web |
| Existem metadatos da fonte de dados mas o ficheiro não | Primeira recolha/gravação, caminho configurado, erros de confiança e criação |

Estes são pontos de partida, não diagnósticos. Siga as evidências através da fronteira relevante
e verifique o resultado após uma alteração. Consulte [Resolver dados em falta](/pt-pt/guides/troubleshoot-missing-data/).
