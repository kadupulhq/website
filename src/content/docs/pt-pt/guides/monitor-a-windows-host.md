---
title: Monitorizar um anfitrião Windows
description: Gráficos de CPU, discos, interfaces e tempo de atividade no Windows via serviço SNMP, que objetos de recursos do anfitrião transportam os dados e o que fazer quando o SNMP não estiver disponível.
banner:
  content: O Kadupul está em pré-alfa. Valide estes procedimentos numa instalação de teste isolada. Este é um rascunho de tradução a aguardar revisão por um falante fluente.
sidebar:
  order: 14
---

:::caution[Validar antes da utilização]
O código-fonte está disponível, mas não existe nenhuma versão suportada do Kadupul nem caminho de migração. Teste estes procedimentos numa cópia isolada com cópias de segurança antes de confiar neles. Consulte o [estado do projeto](/pt-pt/project/status/).
:::

O Windows via SNMP fornece interfaces, processadores, armazenamento e alguns contadores. O agente integrado da Microsoft não expõe os objetos de carga, memória e disco dos modelos UCD net-snmp. A memória pode ainda assim ser traçada a partir das linhas de armazenamento se o agente as expuser. Os agentes de terceiros podem fornecer outros objetos; inspecione o agente real antes de escolher modelos.

## O que o serviço SNMP fornece

O serviço SNMP do Windows foi descontinuado e é opcional. Para o Windows 10 e 11, a Microsoft documenta a respetiva instalação através de funcionalidades opcionais ou funcionalidades do Windows; um erro anterior de nome de funcionalidade DISM não comprova por si só que não esteja disponível. Verifique as instruções correspondentes à sua edição do Windows. Consulte o [guia de instalação SNMP da Microsoft](https://learn.microsoft.com/en-us/troubleshoot/windows-client/networking/cannot-install-snmp-wmisnmpprovider).

Verifique quais destas subárvores o seu agente instalado expõe:

| Área | Subárvore | Fornece |
|---|---|---|
| Sistema | `.1.3.6.1.2.1.1` | Descrição, tempo de atividade, contacto, nome, localização |
| Interfaces | `.1.3.6.1.2.1.2` e `.1.3.6.1.2.1.31` | Tráfego, erros, estado |
| Recursos do anfitrião | `.1.3.6.1.2.1.25` | Processadores, armazenamento, contagem de processos, utilizadores com sessão iniciada |
| LAN Manager | `.1.3.6.1.4.1.77` | Dados de serviços e partilhas do Windows |

Os modelos Windows fornecidos pelo Kadupul leem as três primeiras áreas. Nada no conjunto fornecido lê a subárvore LAN Manager.

Dois itens de configuração no anfitrião determinam se recebe dados: a cadeia da comunidade e a lista de gestores a partir dos quais o agente aceita pacotes. Um anfitrião configurado para aceitar SNMP apenas a partir de um único endereço de gestor responderá apenas a esse gestor e rejeitará tudo o resto.

Verifique cada área a partir do anfitrião do poller antes de criar gráficos. Substitua o anfitrião e a comunidade de exemplo pelos seus valores configurados; `public` serve apenas para fins ilustrativos.

```bash
snmpget  -v2c -c public win.example.net .1.3.6.1.2.1.1.1.0
snmpwalk -v2c -c public win.example.net .1.3.6.1.2.1.25.3.3.1.2
snmpwalk -v2c -c public win.example.net .1.3.6.1.2.1.25.2.3.1.3
```

O segundo walk lê a carga do processador e o terceiro lê a lista descritiva de armazenamento. Se o primeiro comando funcionar e os outros dois não devolverem nada, verifique as restrições de acesso, o suporte do agente e o erro SNMP devolvido.

## Adicionar o dispositivo

Importe `install/templates/Windows_Device.xml.gz` se os modelos estiverem em falta, de acordo com [Importar e exportar modelos](/pt-pt/guides/import-and-export-templates/). Selecione o modelo de dispositivo Windows, verifique a deteção de consultas e, em seguida, crie explicitamente os gráficos pretendidos. O pacote contém três consultas de dados e os respetivos modelos de gráficos associados.

| Consulta de dados | Suportada por | Lê |
|---|---|---|
| SNMP - Estatísticas de interface | `resource/snmp_queries/interface.xml` | `IF-MIB`, percorrida diretamente |
| SNMP - Obter informações do processador | `resource/script_server/host_cpu.xml` | `hrProcessorLoad` via `scripts/ss_host_cpu.php` |
| SNMP - Obter pontos de montagem | `resource/script_server/host_disk.xml` | `hrStorageTable` via `scripts/ss_host_disk.php` |

As consultas de disco e de processador são consultas de servidor de script, apesar dos seus nomes. São executadas num processo de servidor de script PHP separado e de longa duração e efetuam chamadas SNMP com as credenciais do registo do dispositivo. A consulta de interface é uma consulta SNMP pura. A consequência prática é que uma falha no servidor de script PHP interrompe a recolha de disco e de CPU no Windows enquanto os gráficos de interface continuam em execução.

## O que obtém sem consulta de dados

Dois modelos de gráficos leem cada um um único OID fixo.

| Gráfico | OID | Armazenado como |
|---|---|---|
| MIB do anfitrião - Processos | `.1.3.6.1.2.1.25.1.6.0` | `GAUGE` |
| MIB do anfitrião - Utilizadores com sessão iniciada | `.1.3.6.1.2.1.25.1.5.0` | `GAUGE` |

Outros dois não leem nada do dispositivo. Os gráficos de tempo de atividade e de tempo de polling chamam `scripts/ss_hstats.php` e devolvem uma coluna do próprio registo do dispositivo no Kadupul: `snmp_sysUpTimeInstance` para tempo de atividade, a duração de polling registada para tempo de recolha. Leem medições armazenadas, não uma resposta SNMP recente.

## As tabelas de recursos do anfitrião

### Processadores

`hrProcessorLoad` sob `.1.3.6.1.2.1.25.3.3.1.2` devolve uma entrada por processador lógico que o agente expõe. O walk fornece os índices; não assuma que a contagem de linhas corresponde sempre à contagem divulgada de threads de hardware.

O valor já é uma percentagem. A MIB define-o como a média no último minuto. Consulte a [definição da MIB Host Resources](https://www.rfc-editor.org/rfc/rfc2790.html).

### Armazenamento

A consulta de armazenamento fornecida utiliza `hrStorageTable` sob `.1.3.6.1.2.1.25.2.3.1`. Lê seis colunas.

| Coluna | OID | Direção |
|---|---|---|
| `hrStorageIndex` | `.1.3.6.1.2.1.25.2.3.1.1` | Índice |
| `hrStorageDescr` | `.1.3.6.1.2.1.25.2.3.1.3` | Índice e etiqueta apresentada |
| `hrStorageAllocationUnits` | `.1.3.6.1.2.1.25.2.3.1.4` | Entrada, o multiplicador |
| `hrStorageSize` | `.1.3.6.1.2.1.25.2.3.1.5` | Saída |
| `hrStorageUsed` | `.1.3.6.1.2.1.25.2.3.1.6` | Saída |
| `hrStorageAllocationFailures` | `.1.3.6.1.2.1.25.2.3.1.7` | Saída |

O tamanho e o espaço utilizado são contagens de unidades de alocação, não bytes. O script multiplica cada valor pelo tamanho da unidade de alocação guardada em cache para esse índice quando ambos os valores são válidos.

Duas situações causam frequentemente problemas no Windows.

**A tabela não é uma lista de discos rígidos.** O agente indica tudo o que considera armazenamento. Consoante o agente, a memória física e a memória virtual podem surgir ao lado de unidades fixas. Etiquetas como `C:\`, `D:\`, `Physical Memory` e `Virtual Memory` são exemplos, não linhas garantidas. Selecione as linhas que pretende representar graficamente.

**Valores de armazenamento grandes ou inválidos requerem verificação.** A MIB define o tamanho e a utilização como números inteiros de 32 bits não negativos (Integer32). Um agente que devolve um valor negativo está fora desse intervalo. O script atual utiliza `(abs(value) + 2147483647) * allocation_units`, o que não representa uma reinterpretação sem sinal de 32 bits. Trate os valores afetados como não fiáveis e reindexe após corrigir a deteção. Consulte o [defeito de conversão de armazenamento](https://github.com/kadupulhq/kadupul/issues/243).

## Onde o Windows difere do Linux

| Caraterística | Linux com net-snmp | Agente Windows integrado / modelos fornecidos |
|---|---|---|
| Média de carga | `.1.3.6.1.4.1.2021.10.1.3` | Nenhum objeto de média de carga UCD |
| Memória | `.1.3.6.1.4.1.2021.4` | Pode ser traçada a partir das linhas `hrStorage` expostas |
| CPU | Percentagens UCD ou `hrProcessorLoad` | Apenas `hrProcessorLoad` |
| Lista de discos | `dskTable` declarada por si ou `hrStorage` | Apenas `hrStorage`, sem filtro |
| E/S de disco | `diskIOTable` | Nenhum item fornecido lê isto |
| Nomes de interface | Nomes do kernel, curtos | Descrições longas de adaptadores, frequentemente duplicadas |

O agente Microsoft integrado não fornece a subárvore UCD `.1.3.6.1.4.1.2021`. Consulte [Resolver problemas de dados em falta](/pt-pt/guides/troubleshoot-missing-data/).

### Interfaces

A consulta de interface é idêntica à utilizada por um switch. A sua ordem de preferência de índice é `ifName`, depois `ifDescr`, depois `ifHwAddr`, depois `ifIndex`. Escolhe o primeiro campo presente e exclusivo em cada interface detetada.

O Windows é a plataforma em que isto falha com maior frequência. Duas placas de rede idênticas podem devolver o mesmo `ifDescr`, e alguns agentes deixam `ifName` vazio. Quando a consulta recorre a `ifIndex`, o histórico da sua interface fica vinculado a um número que o Windows tem a liberdade de reatribuir.

Consulte [Monitorizar um switch](/pt-pt/guides/monitor-a-switch/) e [Consultas de dados e índices](/pt-pt/concepts/data-queries-and-indexes/).

## Quando o SNMP não estiver disponível

Muitas instalações do Windows não possuem o serviço SNMP ativado. A alternativa é uma entrada de script.

Dois factos determinam a forma como escreve o script.

**O script é executado na máquina em que o poller corre.** Alcançar o anfitrião Windows é função do seu script: WinRM, um agente, um endpoint HTTP, uma partilha ou qualquer mecanismo implementado.

**Emita as medições no standard output.** O caminho de comando externo do poller PHP não utiliza o estado de saída como valor de medição. Emita um número, ou `U` caso não haja medição neste ciclo. Não emita `0` quando pretender sinalizar que a medição falhou.

Se necessitar de um valor por interface, por disco ou por serviço em vez de um único número, o mesmo mecanismo de script oferece uma forma indexada. `resource/script_queries/host_cpu.xml` é um exemplo prático que chama um script PHP em vez do servidor de script.

Consulte [Escrever um script de recolha de dados](/pt-pt/guides/write-a-data-collection-script/) para conhecer o contrato de saída e as restrições de nomenclatura.

## Modos de falha

| Sintoma | Causa comum |
|---|---|
| Descrição do sistema lida, nada mais recolhido | Verifique o suporte a objetos, restrições de acesso e o erro SNMP específico |
| Nenhuma resposta de um anfitrião online | Lista de gestores aceites pelo agente ou regra de firewall do anfitrião na porta UDP 161 |
| Lista de partições contém memória | Esperado; o agente indica a memória como armazenamento |
| Volume grande aparece negativo ou desconhecido | Valores inválidos do agente ou unidades de alocação obsoletas; verificar erro conhecido |
| Disco e CPU param, interfaces continuam | Falha no servidor de script; a consulta de interface não o utiliza |
| Modelos Net-snmp atribuídos, cada medição desconhecida | O agente selecionado não fornece os objetos UCD exigidos para esses modelos |
| Histórico da interface segue o adaptador errado após alteração | O índice recorreu a `ifIndex` porque os nomes estavam vazios ou duplicados |
| O tempo de atividade repete um valor antigo | Verifique se o registo do dispositivo está obsoleto; o assistente não extrapola o uptime |
