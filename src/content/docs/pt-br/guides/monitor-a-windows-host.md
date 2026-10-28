---
title: Monitorar um host Windows
description: Gráficos de CPU, discos, interfaces e tempo de atividade no Windows via serviço SNMP, quais objetos de recursos do host transportam os dados e o que fazer quando o SNMP não estiver disponível.
banner:
  content: O Kadupul está em pré-alfa. Valide estes procedimentos em uma instalação de teste isolada. Este é um rascunho de tradução aguardando revisão por um falante fluente.
sidebar:
  order: 14
---

:::caution[Validar antes do uso]
O código-fonte está disponível, mas não há versão suportada do Kadupul nem caminho de migração. Teste estes procedimentos em uma cópia isolada com backups antes de confiar neles. Consulte o [status do projeto](/pt-br/project/status/).
:::

O Windows via SNMP fornece interfaces, processadores, armazenamento e alguns contadores. O agente integrado da Microsoft não expõe os objetos de carga, memória e disco dos modelos UCD net-snmp. A memória ainda pode ser traçada a partir das linhas de armazenamento se o agente as expuser. Agentes de terceiros podem fornecer outros objetos; inspecione o agente real antes de escolher modelos.

## O que o serviço SNMP fornece

O serviço SNMP do Windows foi descontinuado e é opcional. Para o Windows 10 e 11, a Microsoft documenta sua instalação por meio de recursos opcionais ou recursos do Windows; um erro anterior de nome de recurso DISM não comprova por si só que ele não esteja disponível. Verifique as instruções correspondentes à sua edição do Windows. Consulte o [guia de instalação SNMP da Microsoft](https://learn.microsoft.com/en-us/troubleshoot/windows-client/networking/cannot-install-snmp-wmisnmpprovider).

Verifique quais destas subárvores seu agente instalado expõe:

| Área | Subárvore | Fornece |
|---|---|---|
| Sistema | `.1.3.6.1.2.1.1` | Descrição, tempo de atividade, contato, nome, localização |
| Interfaces | `.1.3.6.1.2.1.2` e `.1.3.6.1.2.1.31` | Tráfego, erros, status |
| Recursos do host | `.1.3.6.1.2.1.25` | Processadores, armazenamento, contagem de processos, usuários conectados |
| LAN Manager | `.1.3.6.1.4.1.77` | Dados de serviços e compartilhamentos do Windows |

Os modelos Windows fornecidos pelo Kadupul leem as três primeiras áreas. Nada no conjunto integrado lê a subárvore LAN Manager.

Dois itens de configuração no host determinam se você recebe dados: a cadeia da comunidade e a lista de gerentes dos quais o agente aceita pacotes. Um host definido para aceitar SNMP apenas de um único endereço de gerente responderá apenas a esse gerente e descartará todo o restante.

Verifique cada área a partir do host do poller antes de criar gráficos. Substitua o host e a comunidade de exemplo por seus valores configurados; `public` é fornecido apenas para fins ilustrativos.

```bash
snmpget  -v2c -c public win.example.net .1.3.6.1.2.1.1.1.0
snmpwalk -v2c -c public win.example.net .1.3.6.1.2.1.25.3.3.1.2
snmpwalk -v2c -c public win.example.net .1.3.6.1.2.1.25.2.3.1.3
```

O segundo walk lê a carga do processador e o terceiro lê a lista descritiva de armazenamento. Se o primeiro comando funcionar e os outros dois não retornarem nada, verifique as restrições de acesso, o suporte do agente e o erro SNMP retornado.

## Adicionar o dispositivo

Importe `install/templates/Windows_Device.xml.gz` se os modelos estiverem ausentes, de acordo com [Importar e exportar modelos](/pt-br/guides/import-and-export-templates/). Selecione o modelo de dispositivo Windows, verifique a descoberta de consultas e, em seguida, crie explicitamente os gráficos desejados. O pacote contém três consultas de dados e seus modelos de gráficos associados.

| Consulta de dados | Apoiada por | Lê |
|---|---|---|
| SNMP - Estatísticas de interface | `resource/snmp_queries/interface.xml` | `IF-MIB`, percorrida diretamente |
| SNMP - Obter informações do processador | `resource/script_server/host_cpu.xml` | `hrProcessorLoad` via `scripts/ss_host_cpu.php` |
| SNMP - Obter pontos de montagem | `resource/script_server/host_disk.xml` | `hrStorageTable` via `scripts/ss_host_disk.php` |

As consultas de disco e processador são consultas de servidor de script, apesar de seus nomes. Elas rodam em um processo de servidor de script PHP separado e de longa duração e executam chamadas SNMP com as credenciais do registro do dispositivo. A consulta de interface é uma consulta SNMP pura. A consequência prática é que uma falha no servidor de script PHP interrompe a coleta de disco e CPU no Windows enquanto os gráficos de interface continuam em execução.

## O que você obtém sem consulta de dados

Dois modelos de gráficos leem cada um um único OID fixo.

| Gráfico | OID | Armazenado como |
|---|---|---|
| MIB do host - Processos | `.1.3.6.1.2.1.25.1.6.0` | `GAUGE` |
| MIB do host - Usuários conectados | `.1.3.6.1.2.1.25.1.5.0` | `GAUGE` |

Outros dois não leem nada do dispositivo. Os gráficos de tempo de atividade e de tempo de polling chamam `scripts/ss_hstats.php` e retornam uma coluna do próprio registro do dispositivo no Kadupul: `snmp_sysUpTimeInstance` para tempo de atividade, a duração de polling registrada para tempo de coleta. Eles leem medições armazenadas, não uma resposta SNMP recente.

## As tabelas de recursos do host

### Processadores

`hrProcessorLoad` sob `.1.3.6.1.2.1.25.3.3.1.2` retorna uma entrada por processador lógico que o agente expõe. O walk fornece os índices; não assuma que a contagem de linhas corresponde sempre à contagem anunciada de threads de hardware.

O valor já é uma porcentagem. A MIB o define como a média no último minuto. Consulte a [definição da MIB Host Resources](https://www.rfc-editor.org/rfc/rfc2790.html).

### Armazenamento

A consulta de armazenamento fornecida usa `hrStorageTable` sob `.1.3.6.1.2.1.25.2.3.1`. Ela lê seis colunas.

| Coluna | OID | Direção |
|---|---|---|
| `hrStorageIndex` | `.1.3.6.1.2.1.25.2.3.1.1` | Índice |
| `hrStorageDescr` | `.1.3.6.1.2.1.25.2.3.1.3` | Índice e rótulo exibido |
| `hrStorageAllocationUnits` | `.1.3.6.1.2.1.25.2.3.1.4` | Entrada, o multiplicador |
| `hrStorageSize` | `.1.3.6.1.2.1.25.2.3.1.5` | Saída |
| `hrStorageUsed` | `.1.3.6.1.2.1.25.2.3.1.6` | Saída |
| `hrStorageAllocationFailures` | `.1.3.6.1.2.1.25.2.3.1.7` | Saída |

O tamanho e o espaço utilizado são contagens de unidades de alocação, não bytes. O script multiplica cada valor pelo tamanho da unidade de alocação armazenada em cache para esse índice quando ambos os valores são válidos.

Duas situações frequentemente causam problemas no Windows.

**A tabela não é uma lista de discos rígidos.** O agente relata tudo o que considera armazenamento. Dependendo do agente, a memória física e a memória virtual podem aparecer ao lado de unidades fixas. Rótulos como `C:\`, `D:\`, `Physical Memory` e `Virtual Memory` são exemplos, não linhas garantidas. Selecione as linhas que deseja representar graficamente.

**Valores de armazenamento grandes ou inválidos precisam de verificação.** A MIB define o tamanho e o uso como números inteiros de 32 bits não negativos (Integer32). Um agente que retorna um valor negativo está fora desse intervalo. O script atual usa `(abs(value) + 2147483647) * allocation_units`, o que não representa uma reinterpretação sem sinal de 32 bits. Trate os valores afetados como não confiáveis e reindexe após corrigir a descoberta. Consulte o [defeito de conversão de armazenamento](https://github.com/kadupulhq/kadupul/issues/243).

## Onde o Windows difere do Linux

| Característica | Linux com net-snmp | Agente Windows integrado / modelos fornecidos |
|---|---|---|
| Média de carga | `.1.3.6.1.4.1.2021.10.1.3` | Nenhum objeto de média de carga UCD |
| Memória | `.1.3.6.1.4.1.2021.4` | Pode ser traçada a partir das linhas `hrStorage` expostas |
| CPU | Porcentagens UCD ou `hrProcessorLoad` | Apenas `hrProcessorLoad` |
| Lista de discos | `dskTable` declarada por você ou `hrStorage` | Apenas `hrStorage`, sem filtro |
| E/S de disco | `diskIOTable` | Nenhum item integrado lê isso |
| Nomes de interface | Nomes do kernel, curtos | Descrições longas de adaptadores, frequentemente duplicadas |

O agente Microsoft integrado não fornece a subárvore UCD `.1.3.6.1.4.1.2021`. Consulte [Solucionar problemas de dados ausentes](/pt-br/guides/troubleshoot-missing-data/).

### Interfaces

A consulta de interface é idêntica à usada por um switch. Sua ordem de preferência de índice é `ifName`, depois `ifDescr`, depois `ifHwAddr`, depois `ifIndex`. Ela escolhe o primeiro campo presente e exclusivo em cada interface descoberta.

O Windows é a plataforma em que isso falha com mais frequência. Duas placas de rede idênticas podem retornar o mesmo `ifDescr`, e alguns agentes deixam `ifName` em branco. Quando a consulta recorre a `ifIndex`, o histórico de sua interface fica vinculado a um número que o Windows tem a liberdade de reatribuir.

Consulte [Monitorar um switch](/pt-br/guides/monitor-a-switch/) e [Consultas de dados e índices](/pt-br/concepts/data-queries-and-indexes/).

## Quando o SNMP não estiver disponível

Muitas instalações do Windows não possuem o serviço SNMP habilitado. A alternativa é uma entrada de script.

Dois fatos determinam como você escreve o script.

**O script é executado na máquina em que o poller roda.** Alcançar o host Windows é função do seu script: WinRM, um agente, um endpoint HTTP, um compartilhamento ou qualquer mecanismo em vigor.

**Emita as medições na saída padrão.** O caminho de comando externo do poller PHP não usa o status de saída como um valor de medição. Emita um número, ou `U` caso não haja medição neste ciclo. Não emita `0` quando desejar sinalizar que a medição falhou.

Se precisar de um valor por interface, por disco ou por serviço em vez de um único número, o mesmo mecanismo de script oferece uma forma indexada. `resource/script_queries/host_cpu.xml` é um exemplo prático que chama um script PHP em vez do servidor de script.

Consulte [Escrever um script de coleta de dados](/pt-br/guides/write-a-data-collection-script/) para o contrato de saída e restrições de nomenclatura.

## Modos de falha

| Sintoma | Causa comum |
|---|---|
| Descrição do sistema lida, nada mais coletado | Verifique o suporte a objetos, restrições de acesso e o erro SNMP específico |
| Nenhuma resposta de um host que está online | Lista de gerentes aceitos pelo agente ou regra de firewall do host na porta UDP 161 |
| Lista de partições contém memória | Esperado; o agente relata memória como armazenamento |
| Volume grande aparece negativo ou desconhecido | Valores inválidos do agente ou unidades de alocação obsoletas; verificar bug conhecido |
| Disco e CPU param, interfaces continuam | Falha no servidor de script; a consulta de interface não o utiliza |
| Modelos Net-snmp atribuídos, cada medição desconhecida | O agente selecionado não fornece os objetos UCD exigidos para esses modelos |
| Histórico da interface segue o adaptador errado após mudança | O índice recorreu a `ifIndex` porque os nomes estavam vazios ou duplicados |
| O tempo de atividade repete um valor antigo | Verifique se o registro do dispositivo está obsoleto; o assistente não extrapola o uptime |
