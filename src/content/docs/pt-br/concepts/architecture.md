---
title: Arquitetura
description: As quatro partes móveis e qual delas geralmente apresenta falhas.
sidebar:
  order: 1
banner:
  content: O Kadupul está em pré-alfa. Valide estes procedimentos em uma instalação de teste isolada. Tradução em rascunho, pendente de revisão por uma pessoa fluente no idioma.
---

:::caution[Comportamento herdado do proxy RRDtool]
A implantação do proxy RRDtool não é suportada no Kadupul. Use o armazenamento local do RRDtool
(`storage_location = 0`). As configurações de proxy, descrições de protocolo e fluxos de trabalho
nesta página documentam o comportamento herdado, não uma implantação ou caminho de migração
suportado. Consulte [RRDtool proxy](/pt-br/reference/rrdproxy/).
:::

A aplicação web, o banco de dados, a coleta agendada e o armazenamento RRD do Kadupul desempenham
funções distintas, mas seus fluxos de execução se sobrepõem. Saber qual operação falhou
ajuda a delimitar a investigação; uma interface funcional não prova que a coleta está operando.

**A interface web** é uma aplicação PHP. Ela gerencia configurações e renderiza ou
fornece gráficos em cache. Algumas ações na web também disparam coletas, como solicitações de gráficos
em tempo real, e solicitações normais de gráficos podem disparar atualizações RRD pendentes.

**O banco de dados** armazena configurações, permissões, estado operacional, o cache do poller
e filas de medições. Os valores coletados podem permanecer nele enquanto aguardam gravação no RRD
ou nova tentativa; ele não é apenas um repositório de configurações.

**O poller** coordena as tarefas agendadas e os processos filhos de coleta. Os resultados passam por
filas no banco de dados antes que o gravador padrão ou postergado atualize os arquivos RRD.

**Os arquivos RRD** contêm séries temporais históricas delimitadas. Uma fonte de dados normalmente possui um RRD
contendo seus campos; a criação de gráficos pode reutilizar fontes, e a criação de metadados não
garante que o arquivo já exista.

## As fronteiras

| Fronteira | O que a atravessa | Meio de transporte |
|---|---|---|
| Interface para o banco de dados | Configuração, sessões, autorização, tarefas em cache e dados operacionais | SQL; o banco de dados pode ser remoto |
| Interface para os arquivos | Leituras de gráficos, imagens em cache e criação ou atualizações de RRD sob demanda qualificadas | Sistema de arquivos e RRDtool |
| Poller para o banco de dados | Listas de trabalho, valores coletados, filas retidas, status e contagens regressivas | SQL |
| Coleta para os dispositivos | SNMP, scripts de coleta e verificações de disponibilidade | Comandos de rede ou locais; coleta acionada via web também é possível |
| Gravador para os arquivos | Amostras agrupadas, possivelmente vários registros de data/hora por atualização | Comandos RRDtool e pipes confirmados |
| Servidor de banco de dados para arquivos RRD | Nenhuma atualização direta de RRD no fluxo normal da aplicação | O código do gravador da aplicação coordena os dois repositórios |

Registros do banco de dados associam uma fonte de dados a um dispositivo e ao seu caminho de arquivo configurado.
Arquivos do RRDtool descrevem séries e arquivos consolidados; eles não substituem esse mapeamento da
aplicação. O tráfego de rede não se limita à sondagem de dispositivos: conexões de banco de dados,
coletores remotos e outras integrações configuradas também podem atravessar hosts.

Faça backup do estado do banco de dados, das amostras pendentes e dos arquivos RRD de forma consistente. Uma restauração
apenas do banco de dados não recupera o conteúdo histórico do RRD, e uma restauração apenas dos arquivos omite
configurações e amostras ainda não gravadas no disco. Mover arquivos sem reconciliar os caminhos pode gerar
erros de arquivo inexistente ou gravações retidas; isso não representa uma falha de coleta silenciosa garantida. Consulte [Backup e restauração](/pt-br/guides/back-up-and-restore/) e
[Migração para novo hardware](/pt-br/guides/migrate-to-new-hardware/).

<span id="why-measurements-are-not-in-the-database"></span>

## Por que o histórico de longo prazo usa arquivos RRD

O histórico de gráficos de longo prazo fica armazenado em RRDs, mas as filas de medições residem no banco de dados.
Nesta versão, a fila normal em processamento usa InnoDB, e as gravações postergadas retêm
amostras em tabelas Boost. Gravações com falha ou atrasos no envio remoto podem aumentar essas
filas. Consulte [Gravações em alto volume](/pt-br/concepts/high-volume-writes/).

Um RRD aloca um número definido de linhas em resoluções selecionadas. Atualizações comuns
reutilizam esse espaço em vez de anexar o histórico indefinidamente. O tamanho do arquivo é fixo
enquanto a estrutura não mudar; adicionar fontes de dados, alterar esquemas, manter cópias de recuperação
ou acumular filas ainda aumenta o consumo total de armazenamento.

O compromisso assumido é a retenção escolhida antecipadamente. Quando o histórico detalhado expira ou
é consolidado, uma mudança posterior de layout não pode recriar os detalhes descartados. Consulte
[Fontes de dados e arquivos round-robin](/pt-br/concepts/data-sources-and-rras/).

A configuração e o estado operacional usam o banco de dados porque a aplicação necessita de
atualizações compartilhadas e consultas relacionais. Isso não significa que cada relação seja
imposta por uma chave estrangeira no banco de dados, ou que o armazenamento de linhas necessariamente cresça para sempre;
isso reflete a divisão de responsabilidades desta aplicação.

## Dois caminhos, compartilhando duas partes

Uma requisição comum de página ou gráfico normalmente segue este fluxo:

1. O navegador envia uma requisição; o PHP carrega a configuração e conecta-se ao banco de dados.
2. A requisição aplica autenticação e a autorização de realm/objeto apropriada.
3. Ações no console leem ou alteram a configuração e podem disparar trabalhos adicionais.
4. Uma requisição de gráfico pode verificar amostras pendentes do Boost e um cache de imagem, ou compor
   um comando RRDtool e ler os arquivos configurados. Consulte
   [Como os gráficos são gerados](/pt-br/concepts/how-graphs-are-drawn/).
5. Requisições de gráficos em tempo real podem disparar o coletor em tempo real e usar dados
   temporários isolados. Um gráfico sem dados por si só não comprova um arquivo vazio nem o sucesso
   na coleta ou na renderização.

Uma coleta agendada normalmente segue este fluxo:

1. O agendador inicia o poller, que verifica o estado de ativação, temporização e armazenamento.
2. Ele seleciona o trabalho pendente no cache do poller e inicializa os processos filhos de coleta.
3. Os filhos consultam dispositivos ou executam scripts de coleta e armazenam os resultados temporariamente no banco de dados.
4. O gravador correspondente processa as amostras agrupadas, recorrendo a filas postergadas quando
   configuradas e retendo falhas que permitem nova tentativa.
5. O status operacional e o estado de agendamento são atualizados no banco de dados.

Consulte o [Ciclo de vida do poller](/pt-br/reference/poller-lifecycle/) para entender a ordenação e o tratamento de falhas.
Esses caminhos compartilham recursos de banco de dados e armazenamento e podem competir por eles. Reiniciar
o servidor web não corrige um poller agendado separadamente, mas requisições web podem
participar da coleta e gravação; diagnostique o processo real com falha.

## O que roda como qual usuário

| Processo | Roda como | Iniciado por |
|---|---|---|
| Aplicação web PHP | Conta do servidor web ou do pool PHP-FPM | Servidor web |
| Poller agendado | Conta configurada no agendador | cron, Agendador de Tarefas ou serviço configurado |
| RRDtool | Normalmente herda a conta do processo inicializador | Fluxo da web, do poller ou de manutenção |
| Scripts de coleta | Normalmente herdam a conta do seu coletor | Coleta agendada ou disparada pela web |

Todas as contas gravadoras participantes precisam do acesso adequado ao armazenamento configurado.
A criação convencional de uma fonte de dados grava metadados; o RRD pode ser criado posteriormente, quando um
gravador precisar dele. Um arquivo ausente pode indicar que a coleta ainda não chegou a este ponto,
além de uma falha de caminho, confiança, permissão ou criação.

Alguns fluxos de criação executados como root tentam aplicar o proprietário e o grupo do diretório RRA.
Essas tentativas podem falhar e registrar erros; elas não substituem a configuração correta das
contas de serviço. A propriedade de contas não root obedece às regras do sistema operacional,
incluindo a herança de grupo de diretórios e ACLs. Valide as permissões de armazenamento e as
definições numéricas confiáveis de UID/GID em todas as contas gravadoras da web e do poller. Consulte
[Atualizar com segurança](/pt-br/guides/upgrade-safely/).

A implementação de ICMP em PHP examinada invoca o utilitário ping do sistema operacional.
Sua capacidade de enviar sondagens depende desse utilitário e das políticas do sistema operacional; a presença de
auxiliares legados com UID efetivo não implica que cada sondagem ICMP eleve o PHP a root.
Não execute a aplicação como root apenas para liberar o ping. Verifique o comando real,
a conta e a saída de erro; checagens TCP ou UDP possuem semânticas de conectividade diferentes.

## A lista de trabalho é pré-computada

O cache do poller armazena o trabalho de coleta já resolvido, de forma que cada ciclo não precise deduzir cada
comando a partir dos relacionamentos de modelos. Operações de configuração podem reconstruir os registros
afetados; ferramentas explícitas de reconstrução estão disponíveis quando necessário.

As alterações representadas nos campos em cache precisam chegar a esses registros antes que a coleta
os utilize. Outras configurações são lidas separadamente, de modo que nem toda alteração exige
uma reconstrução manual do cache. Inspecione o conteúdo do cache, os erros de coleta e o estado
de replicação remota em vez de assumir uma única causa. Consulte
[O cache do poller](/pt-br/concepts/the-poller-cache/) e
[Coleta remota de dados](/pt-br/concepts/remote-data-collection/).

## Onde os problemas costumam ocorrer

| Sintoma | Verificações úteis |
|---|---|
| A interface funciona, os gráficos estão retos | Execução do agendador, erros de coleta, filas, atualização das amostras e janela temporal do gráfico |
| O poller roda, os arquivos não avançam | Confirmação/erros do gravador, confiança e permissões de armazenamento, backlog postergado |
| Uma fonte de dados está reta | Resposta do dispositivo, linha do cache, mapeamento de arquivos, amostras desconhecidas e expressões de desenho |
| Alteração de configuração parece não ter efeito | Resultado do salvamento, substituições em modelos, registros do cache afetados e replicação |
| Lacunas regulares | Temporização, heartbeat, timeouts, disponibilidade do dispositivo e falhas de gravação |
| Formato de gráfico inesperado | Comando gerado, opções de CDEF/CF, dados reais do arquivo, cache de imagem e mapeamento |
| Histórico de porta parece associado a outra interface | Identidade da consulta, renumeração e resultados de reindexação |
| A conta acessa o console, mas não vê gráficos | Realm da página de gráficos, autorização de objetos e identificador do gráfico solicitado |
| Os coletores divergem | Atribuição, configuração replicada, sobreposições locais e estado da conexão |
| Tudo está lento | Esperas no banco de dados, contenção no gravador/armazenamento, tempo de execução do coletor e carga de trabalho web |
| Metadados da fonte de dados existem, mas o arquivo não | Primeira coleta/gravação, caminho configurado, erros de confiança e criação |

Estes são pontos de partida, não diagnósticos definitivos. Siga as evidências através da fronteira
relevante e confirme o resultado após qualquer alteração. Consulte
[Solução de problemas de dados ausentes](/pt-br/guides/troubleshoot-missing-data/).
