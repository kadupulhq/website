---
title: Monitorar um servidor Linux
description: Gráficos de CPU, memória, disco e carga em um host Linux via net-snmp, o que o snmpd precisa expor e como usar um script quando o SNMP não for suficiente.
banner:
  content: O Kadupul está em pré-alfa. Valide estes procedimentos em uma instalação de teste isolada. Este é um rascunho de tradução aguardando revisão por um falante fluente.
sidebar:
  order: 3
---

:::caution[Validar antes do uso]
O código-fonte está disponível, mas não há versão suportada do Kadupul nem caminho de migração. Teste estes procedimentos em uma cópia isolada com backups antes de confiar neles. Consulte o [status do projeto](/pt-br/project/status/).
:::

Um host Linux executando net-snmp fornece a maior parte das métricas sem nenhum código adicional. O trabalho consiste em fazer com que o `snmpd` exponha as subárvores corretas e saber qual das duas MIBs de disco sobrepostas você está observando.

## O que o snmpd precisa expor

O Kadupul consulta quatro áreas. Conceda à identidade de monitoramento as subárvores necessárias para os gráficos selecionados; nem toda implantação precisa de cada subárvore.

| Área | Subárvore | Fornece |
|---|---|---|
| Sistema | `.1.3.6.1.2.1.1` | Descrição, tempo de atividade, contato, nome, localização |
| Interfaces | `.1.3.6.1.2.1.2` e `.1.3.6.1.2.1.31` | Tráfego, erros, status |
| Recursos do host | `.1.3.6.1.2.1.25` | Processos, usuários conectados, armazenamento, processadores |
| UCD / net-snmp | `.1.3.6.1.4.1.2021` | Médias de carga, memória, tempo de CPU, E/S de disco, partições declaradas |

Várias distribuições fornecem um `snmpd.conf` padrão concedendo uma visão que cobre apenas a subárvore do sistema. O dispositivo responderá, informará uma descrição do sistema e não coletará nada. Essa combinação é a falha inicial mais comum em um host Linux e se parece exatamente com um problema de modelo.

Verifique as áreas necessárias a partir do host do poller usando a mesma identidade SNMP configurada no dispositivo. Estes exemplos usam uma comunidade ilustrativa; substitua-a pelo valor configurado. OIDs numéricos evitam exigir definições simbólicas locais de MIB.

```bash
snmpget  -v2c -c public server.example.net .1.3.6.1.2.1.1.1.0
snmpwalk -v2c -c public server.example.net .1.3.6.1.4.1.2021.10.1.3
snmpwalk -v2c -c public server.example.net .1.3.6.1.2.1.25.2.3.1.3
```

Se apenas o primeiro comando funcionar, investigue a resposta exata: uma visão restrita, um módulo de agente não disponível, um contexto SNMP diferente ou uma tabela vazia podem explicar o resultado. Verifique a configuração e o acesso do agente antes de alterar o modelo do Kadupul.

## Adicionar o dispositivo

O pacote fornecido `install/templates/NetSNMP_Device.xml.gz` contém o modelo de dispositivo Net-SNMP e suas dependências. Importe-o caso o modelo esteja ausente e selecione-o ao adicionar o dispositivo. Confirme os índices de consulta e crie explicitamente os gráficos desejados; selecionar um modelo de dispositivo não comprova que a coleta esteja funcionando. Consulte [Importar modelos](/pt-br/guides/import-and-export-templates/) e [Seu primeiro gráfico](/pt-br/start/first-graph/).

## O que você obtém sem consulta de dados

Esses modelos de dados de OID fixo estão incluídos no pacote. Um gráfico pode combinar vários deles; a disponibilidade depende do agente de destino. Eles não exigem nenhuma descoberta de índice.

| Gráfico | OID | Armazenado como |
|---|---|---|
| Média de carga 1 minuto | `.1.3.6.1.4.1.2021.10.1.3.1` | `GAUGE` |
| Média de carga 5 minutos | `.1.3.6.1.4.1.2021.10.1.3.2` | `GAUGE` |
| Média de carga 15 minutos | `.1.3.6.1.4.1.2021.10.1.3.3` | `GAUGE` |
| Memória total | `.1.3.6.1.4.1.2021.4.5.0` | `GAUGE` |
| Memória livre | `.1.3.6.1.4.1.2021.4.6.0` | `GAUGE` |
| Memória de buffer | `.1.3.6.1.4.1.2021.4.14.0` | `GAUGE` |
| Memória de cache | `.1.3.6.1.4.1.2021.4.15.0` | `GAUGE` |
| CPU usuário | `.1.3.6.1.4.1.2021.11.9.0` | `GAUGE` |
| CPU sistema | `.1.3.6.1.4.1.2021.11.10.0` | `GAUGE` |
| CPU ociosa | `.1.3.6.1.4.1.2021.11.11.0` | `GAUGE` |
| Interrupções | `.1.3.6.1.4.1.2021.11.7.0` | `GAUGE` |
| Mudanças de contexto | `.1.3.6.1.4.1.2021.11.8.0` | `GAUGE` |
| Processos | `.1.3.6.1.2.1.25.1.6.0` | `GAUGE` |
| Usuários conectados | `.1.3.6.1.2.1.25.1.5.0` | `GAUGE` |

Os objetos de memória estão em kilobytes. O gráfico de memória fornecido aplica uma conversão para que o eixo seja exibido em bytes. Caso crie seu próprio gráfico a partir desses OIDs, essa conversão fica sob sua responsabilidade.

Os objetos de CPU listados são porcentagens obsoletas, não contadores cumulativos de tempo de CPU. Não assuma que esses três sozinhos cobrem todos os estados do processador. O Net-SNMP os descontinua em favor de contadores brutos; contadores brutos exigem cálculos adequados de taxa e porcentagem, não uma simples inserção em um modelo do tipo gauge. Consulte a [MIB UCD-SNMP](https://www.net-snmp.org/docs/mibs/ucdavis.html).

## O que exige uma consulta de dados

| Consulta | Descobre | Apoiada por |
|---|---|---|
| SNMP - Obter pontos de montagem | Tudo o que o agente chama de armazenamento | `hrStorageTable`, `.1.3.6.1.2.1.25.2.3.1` |
| Net-SNMP - Obter partições monitoradas | Apenas partições declaradas em `snmpd.conf` | `dskTable`, `.1.3.6.1.4.1.2021.9.1` |
| SNMP - Obter informações do processador | Uma entrada por CPU | Carga do processador de recursos do host |
| Net-SNMP - Obter E/S de dispositivos | Dispositivos de bloco | `diskIOTable`, `.1.3.6.1.4.1.2021.13.15.1.1` |
| SNMP - Estatísticas de interface | Interfaces de rede | `IF-MIB` |

### Qual consulta de disco usar

Não são duas visões dos mesmos dados.

A consulta de recursos do host percorre tudo o que o agente relata como armazenamento. Na maioria dos hosts Linux, isso agrupa memória física, swap, montagens tmpfs e sistemas de arquivos reais em uma única lista. Os tamanhos são retornados em unidades de alocação, e a consulta lê o tamanho da unidade de alocação como um campo separado para que o gráfico possa multiplicar. Você obtém tudo sem configurar nada, mas também uma longa lista de entradas que não deseja.

A consulta net-snmp lê a tabela de disco UCD, preenchida por diretivas `disk` ou `includeAllDisks`. Escolha partições explícitas ou uma descoberta ampla; são políticas distintas.

```
disk /      10%
disk /var   10%
```

Alternativamente, `includeAllDisks 10%` preenche os discos encontrados na inicialização do agente. O valor de 10% configura um limite de espaço livre; não é um filtro de seleção e não configura alertas do Kadupul por si só. Recarregue ou reinicie o agente e, em seguida, verifique os índices. Uma consulta vazia também pode refletir problemas de acesso ou de disponibilidade do módulo. Consulte a [configuração do snmpd](https://www.net-snmp.org/docs/man/snmpd.conf.html).

Prefira a consulta de recursos do host quando desejar integridade e estiver disposto a filtrar. Prefira a consulta net-snmp com entradas explícitas de `disk` quando desejar uma lista direcionada. `includeAllDisks` expande essa lista; verifique novamente os índices após reinicializações do agente.

### Interfaces

A consulta de dados de interface em um servidor se comporta exatamente como em um switch, com uma ressalva: `ifDescr` no Linux é o nome da interface do kernel, que pode mudar após uma reinicialização ou atualização de driver. Consulte [Monitorar um switch](/pt-br/guides/monitor-a-switch/) para detalhes sobre a escolha do índice.

## Quando o SNMP não for suficiente

Algumas métricas não contam com uma MIB utilizável. A profundidade de uma fila, um contador de aplicativo ou um número em um arquivo exigem uma entrada de script.

Dois fatos determinam como você escreve o script.

**O script é executado na máquina em que o poller roda, não no host monitorado.** Alcançar o destino é função do seu script: SSH, uma chamada HTTP, um agente ou qualquer mecanismo já adotado.

**O poller lê a saída padrão e nada mais.** O status de saída não é avaliado.

O contrato de saída:

| Saída | Significado |
|---|---|
| `42` ou `3.7` | Um único valor para uma única fonte de dados |
| `U` | Nenhum valor neste ciclo, registrado como desconhecido |
| `in:1420 out:980` | Múltiplos valores, um por fonte de dados |

Para o formato de múltiplos valores, os pares são separados por espaços simples e o nome é separado do valor por dois-pontos. O analisador conta os delimitadores em relação aos espaços em branco, de modo que espaços internos adicionais podem invalidar a análise. O poller PHP apara espaços em branco à direita. Emita o formato canônico com espaços simples e redirecione os diagnósticos para fora do stdout.

Os nomes internos de fontes de dados RRD aceitos pelo editor de modelos correspondem a `[a-zA-Z0-9_]{1,19}`; hifens não são aceitos lá. Os rótulos de saída do script devem corresponder aos nomes dos campos de entrada de dados e ser mapeados para os itens internos pretendidos. A linha de saída completa é armazenada em uma coluna de 512 caracteres. Consulte [Scripts de coleta](/pt-br/guides/write-a-data-collection-script/) para o contrato auditado do poller PHP.

Retorne `U` em vez de `0` quando não for possível medir algo. Zero é uma medição e será representado como tal. Consulte [Fontes de dados e RRAs](/pt-br/concepts/data-sources-and-rras/) para entender por que ambos são mantidos separados.

### Servidor de script

Um script simples é executado uma vez por fonte de dados e por intervalo. Para um script escrito em PHP, o formato do servidor de script chama uma função em um processo PHP separado e de longa duração, reduzindo a sobrecarga de inicialização do interpretador.

### A armadilha da lista de permissões

Quando um arquivo de lista de permissões de entrada de dados é usado, o poller compara a cadeia de comando de cada entrada com a registrada. Uma cadeia de comando que tenha sido alterada sem regeneração da lista de permissões para de criar entradas no cache do poller, e a fonte de dados silencia sem erros no gráfico. O log relata isso, a interface do usuário não.

```bash
php cli/input_whitelist.php --audit
php cli/input_whitelist.php --update --id=42
```

Substitua `42` pelo identificador do método de entrada de dados auditado, não por um ID de dispositivo. Uma atualização sem `--id` aceita as cadeias de comandos atuais em todo o inventário de entrada. Audite as alterações com antecedência. Após a atualização, verifique a habilitação da fonte e as entradas efetivas no cache do poller.

## Modos de falha

| Sintoma | Causa comum |
|---|---|
| Descrição do sistema lida, nada mais coletado | Visão do `snmpd` restrita à subárvore do sistema |
| Consulta de partições net-snmp não encontra índices | Nenhuma linha `disk` ou `includeAllDisks` no `snmpd.conf` |
| Partições de recursos do host incluem RAM e tmpfs | Esperado; o agente as relata como armazenamento |
| Gráfico de memória defasado por um fator de 1024 | Construção sobre OIDs brutos sem conversão |
| Script retorna valor na linha de comando, poller registra desconhecido | Discrepância saída/mapeamento, erros de delimitador interno ou nome interno inválido |
| Script funciona manualmente, mas falha via poller | É executado sob o usuário do poller com seu ambiente e permissões |
