---
title: Monitorar um host de virtualização
description: O que um hipervisor expõe via SNMP, o que é fornecido para ESXi e por que contar convidados, CPU e memória em um ambiente virtualizado é mais complexo do que parece.
banner:
  content: O Kadupul está em pré-alfa. Valide estes procedimentos em uma instalação de teste isolada. Este é um rascunho de tradução aguardando revisão por um falante fluente.
sidebar:
  order: 27
---

:::caution[Validar antes do uso]
O código-fonte está disponível, mas não há versão suportada do Kadupul nem
caminho de migração. Teste estes procedimentos em uma cópia isolada com backups antes de
confiar neles. Consulte o [status do projeto](/pt-br/project/status/).
:::

O pacote ESXi fornecido coleta medições do host e contagens de inventário de convidados.
Ele não fornece medições de CPU, memória ou contenção por convidado. Verifique os
objetos expostos pela versão do seu hipervisor antes de selecionar os gráficos.

## O que é fornecido

Um modelo de dispositivo de hipervisor é fornecido: **ESXi Device**. Por se tratar de um pacote de dispositivo,
`install/templates/ESXi_Device.xml.gz` contém seus scripts e arquivos de consulta de dados.
Siga [Importar e exportar modelos](/pt-br/guides/import-and-export-templates/) e confirme que
a importação foi concluída, incluindo a implantação de arquivos. Selecione o modelo de dispositivo,
inspecione a descoberta e crie explicitamente os gráficos desejados; importar o pacote
ou apenas associar um modelo de dispositivo não os cria automaticamente.

| Fornecido | Finalidade |
|---|---|
| `resource/snmp_queries/esxi_cpu.xml` | Descobre processadores e lê a carga por processador |
| `resource/snmp_queries/esxi_hw.xml` | Descobre componentes de hardware e lê seu status |
| `resource/snmp_queries/interface.xml` | A consulta padrão de estatísticas de interfaces |
| `resource/script_server/host_disk.xml` | Partições montadas, por meio da tabela de armazenamento Host Resources |
| `scripts/ss_esxi_vhosts.php` | Empacotado em `install/templates/ESXi_Device.xml.gz`; conta convidados, convidados ligados e status de ferramentas de convidado |
| `scripts/ss_multicpu_avg.php` | Calcula a média de carga de todos os processadores em um único valor |
| `scripts/ss_hstats.php` | Lê estatísticas de coleta que o Kadupul já mantém para o dispositivo |
| `scripts/ss_host_disk.php` | Dá suporte à consulta de partições |

Nenhum pacote dedicado de dispositivo é fornecido para Hyper-V, KVM/libvirt, Xen ou Proxmox nesta
versão. Modelos genéricos Linux/Windows podem abranger métricas de host suportadas por seus
agentes; a coleta específica de hipervisores exige modelos e coletores adequados. Consulte
[Escrever um script de coleta de dados](/pt-br/guides/write-a-data-collection-script/).

## Ativar o agente primeiro

Revise a configuração existente do agente e utilize as instruções da sua versão de ESXi.
As notas do pacote incluem uma redefinição para os padrões de fábrica; não é um pré-requisito rotineiro e
apagaria a configuração SNMP existente. Para uma configuração baseada em comunidade, os comandos
abaixo definem os parâmetros do agente; substitua os exemplos e preserve as comunidades necessárias
ao definir a lista.

```bash
esxcli system snmp get
esxcli system snmp set -c YOUR_STRING
esxcli system snmp set -p 161
esxcli system snmp set -L "City, State, Country"
esxcli system snmp set -C noc@example.com
esxcli system snmp set -e yes
```

O primeiro comando exibe a configuração; o último ativa o agente. A opção de comunidade
substitui a lista configurada. Verifique os acessos de firewall necessários a partir do poller
e consulte a [referência de comandos SNMP da ESXCLI](https://developer.broadcom.com/xapis/esxcli-command-reference/latest/namespace/esxcli_system.html).
Esses comandos configuram consultas baseadas em comunidade; não configuram SNMPv3.
Valide a partir da máquina onde o poller roda antes de adicionar o dispositivo.

```bash
snmpget  -v2c -c YOUR_STRING esxi.example.net .1.3.6.1.2.1.1.1.0
snmpwalk -v2c -c YOUR_STRING esxi.example.net .1.3.6.1.2.1.25.3.3.1.2
snmpwalk -v2c -c YOUR_STRING esxi.example.net .1.3.6.1.4.1.6876.2.1.1.6
```

Se o primeiro funcionar e o terceiro não retornar nada, inspecione o erro SNMP,
a política de acesso e o suporte do agente; uma varredura vazia por si só não identifica a causa. O
script de convidados embutido utiliza SNMPv1, logo uma validação v2c bem-sucedida não garante seu caminho de
coleta. Varreduras vazias em convidados geram contagens zeradas, não necessariamente lacunas em gráficos;
consulte o [bug do resultado vazio](https://github.com/kadupulhq/kadupul/issues/245).

## O que o host expõe

| Área | Subárvore | O que fornece |
|---|---|---|
| Processadores | `.1.3.6.1.2.1.25.3.3.1` | Carga de cada processador exposto pelo agente |
| Componentes de hardware | `.1.3.6.1.2.1.25.3.2.1` | Índice, descrição e estado do componente |
| Armazenamento | `.1.3.6.1.2.1.25.2.3.1` | Datastores e sistemas de arquivos locais, conforme reportado pelo agente |
| Interfaces | `.1.3.6.1.2.1.2` e `.1.3.6.1.2.1.31` | Tráfego, erros, status |
| Inventário de convidados | `.1.3.6.1.4.1.6876` | Estado de energia e de ferramentas para cada máquina convidada |

Os quatro primeiros são as tabelas padrão Host Resources e de interfaces, as mesmas respondidas
por um host Linux. Consulte [Monitorar um servidor Linux](/pt-br/guides/monitor-a-linux-server/)
para ver como elas se comportam e qual tabela de disco priorizar.

O quinto é a subárvore do fabricante utilizada pelo script de contagem de convidados fornecido.

## Os modelos de gráficos

| Gráfico | Origem | O que lê |
|---|---|---|
| ESXi - CPU | Consulta de dados | Carga de um processador descoberto |
| ESXi - MultiCPU Average | Script | Média da carga de todos os processadores |
| ESXi - Hardware | Consulta de dados | Estado de um componente descoberto |
| ESXi - VHosts | Script | Contagens de convidados e status de ferramentas de convidado |
| Host MIB - Processes | OID fixa | Quantidade de processos no host |
| Host MIB - Logged in Users | OID fixa | Quantidade de sessões no host |
| Device - Uptime | Script | Uptime conforme registrado pela última vez pelo Kadupul |
| Device - Polling Time | Script | Tempo que o Kadupul levou para consultar este dispositivo |
| Gráficos de interfaces | Consulta de dados | Tráfego, erros, pacotes, status por interface |

A consulta de processadores lê a carga por entrada descoberta. Não presuma que sua quantidade de linhas
corresponda às threads de hardware do host: o padrão de índices fornecido aceita apenas índices
de um ou dois dígitos e rejeita valores a partir de 100, mesmo em um host com poucas CPUs.
Compare a descoberta com um walk bruto; consulte o [bug do índice de CPU](https://github.com/kadupulhq/kadupul/issues/246).
O script de média percorre de forma independente as cargas de CPU e calcula a média das linhas retornadas.

Device - Uptime e Device - Polling Time leem o registro armazenado do dispositivo no Kadupul.
O helper de uptime retorna o valor SNMP gravado sem extrapolar o tempo decorrido;
o tempo de polling descreve o trabalho de coleta do Kadupul. Um valor antigo armazenado não comprova
alcançabilidade atual. Se a coleta parar, esses scripts não geram novas amostras.

## Os problemas de contagem

Esta é a parte que diferencia a virtualização de um servidor físico, e nada
disso é resolvido por um modelo de gráfico.

**Convidados se movem.** Um convidado que migra para outro host desaparece do inventário do primeiro
e surge no segundo. Amostras colhidas em horários independentes podem temporariamente
duplicar ou omitir esse convidado. Variações na contagem por si sós não comprovam migração: use
identificadores de inventário do hipervisor e eventos para explicá-las.

**Recursos são compartilhados, portanto a atribuição por convidado é uma estimativa.** O host relata
a carga física do processador. Não relata qual convidado a causou. Dividir a CPU do host
pelo número de convidados produz um valor aritmeticamente correto que não responde a nenhuma pergunta relevante.

**O overcommit faz com que alocação e uso sejam grandezas distintas.** CPUs virtuais atribuídas
podem superar os núcleos físicos, e a memória alocada pode deliberadamente superar a memória física. Um
gráfico de recursos alocados descreve provisão e não demanda medida.
Compare-o com a capacidade física, limites configurados e uso real.

**A contenção não aparece nessas tabelas.** As métricas que revelam se um convidado
está sendo privado de recursos — o tempo que esperou por uma CPU física e a memória que o
host tomou de volta — não estão no escopo deste modelo. Um host a 60% de
CPU com convidados sofrendo severa contenção é idêntico aqui a um host a 60% com
convidados em perfeita execução.

**As medições de convidados e hosts respondem a perguntas diferentes.** A utilização do convidado por si só
pode não justificar atrasos de escalonamento no host. Correlacione as medições de aplicação e de convidados
com as métricas de contenção do hipervisor em vez de deduzir atribuição a partir da carga do host.

### O que fazer em vez disso

| Pergunta | Onde reside a resposta |
|---|---|
| O host está saturado? | Carga de processador do host, obtida do próprio host |
| Um convidado está saturado? | Dentro do convidado, somada a uma métrica de contenção do hipervisor |
| Quantos convidados estão rodando? | Inventário de convidados do host, como contagem |
| A infraestrutura está com excesso de capacidade? | Não nestes gráficos. Exige dados de posicionamento não expostos pelo host |
| Um convidado mudou de host? | Identificadores de inventário e eventos de migração do hipervisor; contagens sozinhas não bastam |

Monitore os convidados como seus próprios dispositivos para tudo que diga respeito a eles, e monitore o host
para o que diga respeito ao host. Resista a construir gráficos por convidado baseados em números do host:
são valores derivados, aparentam autoridade e estão incorretos de formas que ninguém conseguirá detectar mais tarde.

## Armadilhas na contagem de convidados fornecida

É fundamental compreender o script de inventário de convidados antes de confiar em seus dados.

**Ele realiza a varredura exclusivamente com SNMP versão 1 e a string de comunidade.** A versão está fixa
no script e as credenciais v3 do dispositivo não são repassadas. Um dispositivo configurado para
v3 pode coletar por outros canais enquanto a coleta de convidados falha. A coleta de convidados pode
ter sucesso se o agente aceitar de forma autônoma a comunidade gravada sob v1;
selecionar v3 no dispositivo não determina por si só o desfecho. Varreduras de convidados vazias
retornam como zeros. Avalie essa incompatibilidade sem rebaixar a política de segurança
do agente para atender ao script.

**A contagem se origina da tabela de estado de energia.** O número reportado como total de convidados
é a quantidade de entradas retornadas pela varredura da subárvore de energia, não de um
objeto de inventário à parte. Um convidado listado pelo host que não possua entrada de energia
não entra na contagem.

**O status ligado é comparado com base no texto.** Após aparar espaços e converter para minúsculas,
apenas `powered on` e `poweredon` incrementam a contagem de execução. Outras representações
não o fazem; compare a resposta original do agente antes de presumir um zero.

**A classificação de ferramentas de convidado apresenta falha comprovada.** O texto literal `not installed`
é computado como em execução porque a correspondência inicia no índice zero. Textos não reconhecidos
também recaem como em execução. Não considere esse número como prova de integridade das ferramentas;
consulte o [bug do status das ferramentas](https://github.com/kadupulhq/kadupul/issues/244).

**Executa três varreduras por chamada.** Lê a tabela de energia duas vezes, depois a tabela
de ferramentas, de forma que suas próprias contagens não constituem um instantâneo atômico. Em um host
com muitos convidados, meça esse custo de coleta. Se o poller estiver sobrecarregado, este é um candidato a intervalo maior antes
de pensar em mais threads. Consulte [Dimensionar o poller](/pt-br/guides/scale-the-poller/).

O script normalmente emite todos os cinco valores nominais, inclusive zeros para varreduras vazias.
Uma varredura com falha pode produzir uma amostra sintaticamente completa, mas enganosa.
Para saídas incompletas, o processador PHP confere os campos exigidos pela
fonte de dados correspondente e retém grupos de carimbos de data/hora incompletos; não os descarta
necessariamente de imediato. Consulte [O cache do poller](/pt-br/concepts/the-poller-cache/).

## Armadilhas no restante

**A média de processadores esconde assimetrias.** Um host com um núcleo no limite e 63 ociosos
apresenta média baixa. Preserve gráficos validados por processador onde isso for crítico. O helper
de média também retorna `load:0` para varreduras vazias, indistinguível de uma CPU ociosa real;
correlacione isso com o status da coleta e o defeito conhecido de resultado vazio.

**Os índices de processador são posicionais.** São descobertos percorrendo a tabela
de processadores. Se os índices do agente mudarem, verifique os mapeamentos de identidade antes de confiar na continuidade.
A limitação embutida a um ou dois dígitos é uma falha de descoberta isolada.

**Entradas de armazenamento são tudo que o agente classificar como armazenamento.** Espere datastores misturados a
itens indesejados, em unidades de alocação que exigem multiplicação. Esse é o
comportamento padrão de Host Resources, não uma peculiaridade do ESXi. Verifique as unidades de alocação em cache antes
de interpretar os bytes; o script compartilhado possui uma [falha de conversão conhecida](https://github.com/kadupulhq/kadupul/issues/243)
para amostras negativas inválidas ou multiplicadores ausentes.

**Nomes de interfaces em um hipervisor são estáveis até deixarem de ser.** Uma atualização de driver ou
reconfiguração pode renumerá-los. Consulte [Monitorar um switch](/pt-br/guides/monitor-a-switch/) para
ver como o índice é selecionado e por que isso importa.

**Os scripts rodam no host do poller.** Eles conectam ao hipervisor por conta própria, usando o
ID do dispositivo fornecido pelo comando em cache. Os helpers de convidados e de média de CPU consultam a
linha atual do dispositivo a cada execução; alterar a comunidade não demanda recriar
esses argumentos de comando. Outros coletores podem embutir credenciais em suas tarefas.
Consulte [O cache do poller](/pt-br/concepts/the-poller-cache/).

## Modos de falha

| Sintoma | Causa comum |
|---|---|
| Tudo é coletado exceto a contagem de convidados | O dispositivo está configurado com SNMPv3 e o script opera em v1 |
| Contagem de convidados certa, mas ligados fica zerada | Verifique o texto exato de energia e se o segundo walk teve sucesso |
| A contagem de convidados zera e se recupera em seguida | Verifique walks falhos ou vazios; o helper pode emitir uma linha cheia de zeros |
| Gráficos de CPU cessam após mudança de hardware | Verifique índices alterados e a restrição a índices de um ou dois dígitos |
| CPU do host baixa e linear enquanto convidados ficam lentos | Verifique falhas de coleta e contenção; uma média vazia é reportada como zero |
| Gráficos de datastores incluem partições não solicitadas | O agente as classifica como armazenamento |
| O gráfico de uptime parece incorreto após queda do poller | Reporta o último valor registrado pelo Kadupul, não uma leitura em tempo real |
| Total de convidados oscila bruscamente durante manutenção | Convidados migrando são temporariamente contados duas vezes ou omitidos |
