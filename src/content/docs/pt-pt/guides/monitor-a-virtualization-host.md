---
title: Monitorizar um anfitrião de virtualização
description: O que um hipervisor disponibiliza por SNMP, o que é fornecido para ESXi e a razão pela qual a contagem de máquinas virtuais convidadas, CPU e memória numa infraestrutura virtualizada é mais complexa do que aparenta.
banner:
  content: O Kadupul está em pré-alfa. Valide estes procedimentos numa instalação de teste isolada. Este é um rascunho de tradução a aguardar revisão por um falante fluente.
sidebar:
  order: 27
---

:::caution[Validar antes da utilização]
O código-fonte está disponível, mas não existe nenhuma versão suportada do Kadupul nem
caminho de migração. Teste estes procedimentos numa cópia isolada com cópias de segurança antes de
confiar neles. Consulte o [estado do projeto](/pt-pt/project/status/).
:::

O pacote ESXi fornecido recolhe medições do anfitrião e dados de inventário de máquinas virtuais convidadas.
Não disponibiliza medições de CPU, memória ou contenção por máquina convidada. Confirme os
objetos expostos pela versão do seu hipervisor antes de selecionar os gráficos.

## O que é fornecido

É fornecido um único modelo de dispositivo de hipervisor: **ESXi Device**. Sendo um pacote de dispositivo,
`install/templates/ESXi_Device.xml.gz` contém os respetivos scripts e ficheiros de consulta de dados.
Siga o guia [Importar e exportar modelos](/pt-pt/guides/import-and-export-templates/) e confirme que
a importação foi concluída, incluindo a instalação dos ficheiros. Selecione o modelo de dispositivo,
inspecione a descoberta e crie expressamente os gráficos pretendidos; a mera importação do pacote
ou associação de um modelo de dispositivo não os cria de forma automática.

| Fornecido | Finalidade |
|---|---|
| `resource/snmp_queries/esxi_cpu.xml` | Deteta processadores e lê a carga por processador |
| `resource/snmp_queries/esxi_hw.xml` | Deteta componentes de hardware e lê o respetivo estado |
| `resource/snmp_queries/interface.xml` | A consulta padrão de estatísticas de interfaces |
| `resource/script_server/host_disk.xml` | Partições montadas, através da tabela de armazenamento Host Resources |
| `scripts/ss_esxi_vhosts.php` | Incluído em `install/templates/ESXi_Device.xml.gz`; contabiliza convidados, convidados ligados e estado das ferramentas de convidados |
| `scripts/ss_multicpu_avg.php` | Calcula a média da carga de todos os processadores num valor agregado |
| `scripts/ss_hstats.php` | Lê estatísticas de consulta que o Kadupul já mantém para o dispositivo |
| `scripts/ss_host_disk.php` | Assegura suporte à consulta de partições |

Não é disponibilizado nenhum pacote dedicado para Hyper-V, KVM/libvirt, Xen ou Proxmox nesta
versão do repositório. Os modelos genéricos de Linux/Windows podem abranger métricas de anfitrião suportadas pelos
respetivos agentes; a recolha especializada de hipervisor carece de modelos e coletores ajustados. Consulte
[Escrever um script de recolha de dados](/pt-pt/guides/write-a-data-collection-script/).

## Ativar primeiro o agente

Examine a configuração existente do agente e siga as instruções adequadas à sua versão do ESXi.
As notas do pacote referem uma reposição dos parâmetros de fábrica; não é um pré-requisito habitual e
apagaria a configuração SNMP preexistente. Para uma configuração alicerçada em comunidades, os comandos
seguintes definem os parâmetros do agente; substitua os exemplos e mantenha as comunidades necessárias
ao estabelecer a listagem.

```bash
esxcli system snmp get
esxcli system snmp set -c YOUR_STRING
esxcli system snmp set -p 161
esxcli system snmp set -L "City, State, Country"
esxcli system snmp set -C noc@example.com
esxcli system snmp set -e yes
```

O primeiro comando apresenta a configuração; o último ativa o agente. A opção de comunidade
substitui a lista configurada. Verifique os acessos necessários na firewall a partir do poller
e consulte o [guia de comandos SNMP da ESXCLI](https://developer.broadcom.com/xapis/esxcli-command-reference/latest/namespace/esxcli_system.html).
Estes comandos configuram consultas baseadas em comunidade; não configuram SNMPv3.
Valide o acesso a partir da máquina onde o poller corre antes de associar o dispositivo.

```bash
snmpget  -v2c -c YOUR_STRING esxi.example.net .1.3.6.1.2.1.1.1.0
snmpwalk -v2c -c YOUR_STRING esxi.example.net .1.3.6.1.2.1.25.3.3.1.2
snmpwalk -v2c -c YOUR_STRING esxi.example.net .1.3.6.1.4.1.6876.2.1.1.6
```

Se o primeiro comando funcionar e o terceiro nada devolver, examine o erro SNMP,
a política de acessos e a compatibilidade do agente; uma análise vazia não identifica isoladamente a causa. O
script de convidados integrado adota SNMPv1, de modo que um teste v2c favorável não valida o respetivo fluxo de
recolha. Análises vazias de convidados originam valores nulos, não obrigatoriamente lacunas nos gráficos;
consulte a [anomalia do resultado vazio](https://github.com/kadupulhq/kadupul/issues/245).

## O que o anfitrião expõe

| Domínio | Subárvore | O que disponibiliza |
|---|---|---|
| Processadores | `.1.3.6.1.2.1.25.3.3.1` | Carga de cada processador reportado pelo agente |
| Componentes de hardware | `.1.3.6.1.2.1.25.3.2.1` | Índice, descrição e estado do componente |
| Armazenamento | `.1.3.6.1.2.1.25.2.3.1` | Datastores e sistemas de ficheiros locais, segundo a comunicação do agente |
| Interfaces | `.1.3.6.1.2.1.2` e `.1.3.6.1.2.1.31` | Tráfego, erros, estado |
| Inventário de convidados | `.1.3.6.1.4.1.6876` | Estado de alimentação e das ferramentas de integração por máquina convidada |

Os quatro primeiros dizem respeito às tabelas convencionais de Host Resources e de interfaces, equivalentes às respondidas
por um anfitrião Linux. Consulte [Monitorizar um servidor Linux](/pt-pt/guides/monitor-a-linux-server/)
para conhecer o seu comportamento e a tabela de discos a privilegiar.

O quinto refere-se à subárvore do fabricante utilizada pelo script de contagem de convidados fornecido.

## Os modelos de gráficos

| Gráfico | Origem | Leitura efetuada |
|---|---|---|
| ESXi - CPU | Consulta de dados | Carga de um processador detetado |
| ESXi - MultiCPU Average | Script | Média da carga de todos os processadores |
| ESXi - Hardware | Consulta de dados | Estado de um componente de hardware detetado |
| ESXi - VHosts | Script | Contagens de máquinas convidadas e estado das ferramentas |
| Host MIB - Processes | OID fixa | Quantidade de processos no anfitrião |
| Host MIB - Logged in Users | OID fixa | Sessões com sessão iniciada no anfitrião |
| Device - Uptime | Script | Uptime conforme registado pela última vez pelo Kadupul |
| Device - Polling Time | Script | Tempo despendido pelo Kadupul a consultar este dispositivo |
| Gráficos de interfaces | Consulta de dados | Tráfego, erros, pacotes, estado por interface |

A consulta de processadores recolhe a carga por cada registo identificado. Não presuma que a respetiva
quantidade de linhas corresponda aos threads de hardware do anfitrião: a expressão de índices fornecida admite somente
índices de um ou dois dígitos e recusa valores iguais ou superiores a 100, inclusivamente num anfitrião com poucas CPU.
Confronte a descoberta com uma análise direta; consulte a [anomalia do índice de CPU](https://github.com/kadupulhq/kadupul/issues/246).
O script de média percorre de forma autónoma as cargas de processamento e faz a média das linhas devolvidas.

Device - Uptime e Device - Polling Time consultam o registo de dispositivo guardado no Kadupul.
O módulo de apoio ao uptime devolve o valor SNMP mimetizado sem efetuar extrapolação do tempo decorrido;
o tempo de consulta retrata o trabalho de recolha do Kadupul. Um valor antigo arquivado não comprova
alcance operacional no presente. Se a recolha cessar, estes utilitários não produzem novas amostras.

## Os problemas de contabilização

Este é o elemento que demarca a virtualização face a um servidor físico, e nada
disto é solucionado por um modelo de gráfico.

**As máquinas convidadas movem-se.** Um convidado que transita para outro anfitrião desvanece-se do inventário do primeiro
e manifesta-se no do segundo. Amostras colhidas em desfasamento temporal podem duplicar
temporariamente ou omitir esse convidado. Oscilações numéricas não comprovam por si só uma migração: socorra-se
de identidades de inventário e eventos do hipervisor para as clarificar.

**Os recursos são partilhados, pelo que a atribuição individual é uma estimativa.** O anfitrião reporta
a carga física do processador. Não discrimina qual convidado a despoletou. Fracionar a CPU do anfitrião
pelo volume de convidados gera uma grandeza matematicamente exata que não esclarece qualquer questão com substância.

**A sobreafetação (overcommit) faz da alocação e da utilização grandezas distintas.** CPU virtuais atribuídas
podem ultrapassar os núcleos físicos, e a memória concedida pode suplantar a memória física real, deliberadamente. Um
gráfico de recursos afetados retrata provisão e não procura medida.
Confronte-o com a capacidade física, limites estipulados e o consumo efetivo.

**A contenção não se reflete nestas tabelas.** As métricas reveladoras de que um convidado
está sob carência de recursos — o tempo passado à espera de processamento físico e a memória que o
anfitrião lhe recuperou — não constam do que este modelo congrega. Um anfitrião a 60 por cento de
CPU com convidados em grave contenção assemelha-se rigorosamente a um anfitrião a 60 por cento com
convidados fluídos.

**As medições de convidados e anfitriões respondem a questões divergentes.** A utilização da máquina convidada isolada
pode não esclarecer atrasos de escalonamento do anfitrião. Estabeleça correlações entre métricas de convidados/aplicações
e os indicadores de contenção do hipervisor em vez de extrair conclusões de afetação a partir da carga do anfitrião.

### O que fazer em alternativa

| Pergunta | Onde reside a resposta |
|---|---|
| O anfitrião está saturado? | Carga de processamento do anfitrião, medida a partir do anfitrião |
| Um convidado está saturado? | No interior da máquina convidada, conjugada com a métrica de contenção do hipervisor |
| Quantos convidados estão operacionais? | Inventário de convidados do anfitrião, em formato numérico |
| O parque opera acima da capacidade? | Não a partir destes gráficos. Carece de dados de alocação não expostos pelo anfitrião |
| Uma máquina convidada mudou de sítio? | Identificadores de inventário e eventos de migração do hipervisor; valores isolados são insuficientes |

Monitorize as máquinas convidadas como dispositivos autónomos para tudo o que diga respeito ao convidado, e monitorize o anfitrião
para o que respeita ao anfitrião. Evite conceber gráficos por convidado baseados em dados globais do anfitrião:
são valores derivados, aparentam solidez e transportam incorreções que ninguém conseguirá destrinçar mais tarde.

## Armadilhas na contagem de convidados fornecida

O script de inventário de convidados requer uma compreensão exaustiva antes de se confiar nos seus dados.

**Executa a consulta estritamente em SNMP versão 1 e apenas com a cadeia de comunidade.** A versão está fixa
no script e as credenciais v3 do dispositivo não são transferidas. Um dispositivo configurado para
v3 pode processar recolhas por outros canais enquanto a recolha de convidados colapsa. Esta recolha pode
ainda assim triunfar se o agente acolher de forma autónoma a comunidade armazenada em v1;
selecionar v3 no dispositivo não dita isoladamente o desfecho. Consultas de convidados vazias
são devolvidas com valor zero. Avalie este desacerto protocolar sem degradar as diretrizes de segurança
do agente para satisfazer o utilitário.

**A contagem emana da tabela de estado de energia.** O valor comunicado como total de convidados
é o número de registos devolvido pelo varrimento da subárvore de energia, não de um
objeto de inventário segregado. Um convidado discriminado pelo anfitrião mas sem registo de energia
não entra na contagem.

**A condição de ligado é avaliada a partir do texto.** Após aparar espaços e converter para minúsculas,
apenas `powered on` e `poweredon` incrementam o contador de máquinas ativas. Outras formulações
não o fazem; examine a resposta em bruto do agente antes de presumir um zero.

**A classificação de ferramentas de convidados contém um defeito confirmado.** A sequência literal `not installed`
é contabilizada como em execução porque o emparelhamento arranca na posição zero. Textos desconhecidos
também recaem por omissão como em execução. Não encare esse apuramento como certificado de ferramentas saudáveis;
consulte a [anomalia do estado das ferramentas](https://github.com/kadupulhq/kadupul/issues/244).

**Realiza três consultas por cada invocação.** Lê a tabela de energia por duas vezes e, seguidamente, a tabela
de ferramentas, pelo que as suas próprias contagens não estruturam um instantâneo atómico. Num anfitrião
com elevado número de convidados, calcule este esforço de recolha. Se o poller estiver sobrecarregado, este constitui um cenário para alargar o intervalo antes
de cogitar mais threads. Consulte [Dimensionar o poller](/pt-pt/guides/scale-the-poller/).

O script emite habitualmente os cinco valores discriminados, incluindo zeros para consultas vazias.
Uma recolha falhada pode originar uma amostra sintaticamente impecável mas enganadora.
Perante respostas parciais, o processador PHP afere os campos exigidos pela
respetiva fonte de dados e retém grupos de marcas temporais incompletos; não os descarta
necessariamente de pronto. Consulte [A cache do poller](/pt-pt/concepts/the-poller-cache/).

## Armadilhas no restante

**A média de processadores dissimula assimetrias.** Um anfitrião com um núcleo no limite e 63 desocupados
apresenta uma média diminuta. Guarde gráficos validados por processador sempre que isso seja fulcral. O módulo
de média devolve outrossim `load:0` para uma análise vazia, indistinguível de CPU em repouso genuíno;
estabeleça correlações com o estado da recolha e a falha conhecida de resultados vazios.

**Os índices de processadores são posicionais.** São identificados percorrendo a tabela
de processadores. Caso os índices do agente sofram alterações, confirme as correspondências de identidade antes de confiar na continuidade.
O confinamento facultado a um ou dois dígitos é uma anomalia de descoberta autónoma.

**Os registos de armazenamento abrangem tudo o que o agente classificar como tal.** Conte com datastores misturados com
elementos indesejados, em unidades de alocação que exigem cálculo multiplicativo. É o
procedimento padrão de Host Resources, não uma singularidade do ESXi. Confirme as unidades de alocação em cache antes
de interpretar os bytes; o script partilhado transporta uma [anomalia de conversão conhecida](https://github.com/kadupulhq/kadupul/issues/243)
perante valores negativos inválidos ou multiplicadores ausentes.

**Os nomes de interfaces num hipervisor mantêm-se firmes até deixarem de estar.** Uma atualização de software de controlo ou
reparametrização pode reordená-los. Consulte [Monitorizar um comutador](/pt-pt/guides/monitor-a-switch/) para
compreender de que forma o índice é determinado e a razão pela qual é relevante.

**Os scripts correm no computador do poller.** Estabelecem ligação ao hipervisor pelos seus meios, operando com o
identificador de dispositivo facultado pela instrução em cache. Os módulos de apoio a convidados e média de CPU solicitam o
registo corrente do dispositivo a cada chamada; modificar a comunidade não obriga à reconstrução
desses argumentos de comando. Outros coletores podem incorporar credenciais nos seus processos.
Consulte [A cache do poller](/pt-pt/concepts/the-poller-cache/).

## Modos de falha

| Sintoma | Causa habitual |
|---|---|
| Tudo é recolhido com exceção da contagem de convidados | O dispositivo está parametrizado para SNMPv3 e o script opera em v1 |
| Contagem de convidados correta, mas ligados surge a zero | Verifique a redação exata do estado de energia e se a segunda recolha teve êxito |
| A quantidade de convidados cai para zero e retoma depois | Examine consultas falhadas ou vazias; o utilitário pode debitar uma linha de zeros |
| Os gráficos de CPU interrompem-se após alteração de hardware | Inspecione alterações de índices e a restrição a índices de um ou dois dígitos |
| CPU do anfitrião estagnada e em níveis baixos com convidados lentos | Inspecione anomalias de recolha e contenção; uma média vazia é reportada como zero |
| Gráficos de datastores contêm partições não solicitadas | O agente qualifica-as como armazenamento |
| O gráfico de uptime aparenta incongruências após paragem do poller | Reporta o último valor fixado pelo Kadupul, não uma leitura em tempo real |
| O total de convidados entre anfitriões tem variações súbitas em manutenção | Convidados em transição são momentaneamente contados duas vezes ou ignorados |
