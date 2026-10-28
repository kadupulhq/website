---
title: Monitorizar um servidor Linux
description: Gráficos de CPU, memória, disco e carga num anfitrião Linux via net-snmp, o que o snmpd precisa de expor e como utilizar um script quando o SNMP não for suficiente.
banner:
  content: O Kadupul está em pré-alfa. Valide estes procedimentos numa instalação de teste isolada. Este é um rascunho de tradução a aguardar revisão por um falante fluente.
sidebar:
  order: 3
---

:::caution[Validar antes da utilização]
O código-fonte está disponível, mas não existe nenhuma versão suportada do Kadupul nem caminho de migração. Teste estes procedimentos numa cópia isolada com cópias de segurança antes de confiar neles. Consulte o [estado do projeto](/pt-pt/project/status/).
:::

Um anfitrião Linux a executar net-snmp fornece-lhe a maior parte das métricas sem código adicional. O trabalho consiste em fazer com que o `snmpd` exponha as subárvores corretas e saber qual das duas MIBs de disco sobrepostas está a observar.

## O que o snmpd precisa de expor

O Kadupul consulta quatro áreas. Conceda à identidade de monitorização as subárvores necessárias para os gráficos selecionados; nem todas as implementações precisam de todas as subárvores.

| Área | Subárvore | Fornece |
|---|---|---|
| Sistema | `.1.3.6.1.2.1.1` | Descrição, tempo de atividade, contacto, nome, localização |
| Interfaces | `.1.3.6.1.2.1.2` e `.1.3.6.1.2.1.31` | Tráfego, erros, estado |
| Recursos do anfitrião | `.1.3.6.1.2.1.25` | Processos, utilizadores com sessão iniciada, armazenamento, processadores |
| UCD / net-snmp | `.1.3.6.1.4.1.2021` | Médias de carga, memória, tempo de CPU, E/S de disco, partições declaradas |

Várias distribuições fornecem um `snmpd.conf` predefinido que concede uma vista que cobre apenas a subárvore do sistema. O dispositivo responderá, indicará uma descrição do sistema e não recolherá nada. Esta combinação é a falha inicial mais comum num anfitrião Linux e parece-se exatamente com um problema de modelo.

Verifique as áreas necessárias a partir do anfitrião do poller utilizando a mesma identidade SNMP configurada no dispositivo. Estes exemplos utilizam uma comunidade ilustrativa; substitua-a pelo valor configurado. Os OIDs numéricos evitam a necessidade de definições simbólicas locais de MIB.

```bash
snmpget  -v2c -c public server.example.net .1.3.6.1.2.1.1.1.0
snmpwalk -v2c -c public server.example.net .1.3.6.1.4.1.2021.10.1.3
snmpwalk -v2c -c public server.example.net .1.3.6.1.2.1.25.2.3.1.3
```

Se apenas o primeiro comando funcionar, investigue a resposta exata: uma vista restrita, um módulo de agente não disponível, um contexto SNMP diferente ou uma tabela vazia podem explicar o resultado. Verifique a configuração e o acesso do agente antes de alterar o modelo do Kadupul.

## Adicionar o dispositivo

O pacote fornecido `install/templates/NetSNMP_Device.xml.gz` contém o modelo de dispositivo Net-SNMP e as respetivas dependências. Importe-o se o modelo estiver em falta e selecione-o ao adicionar o dispositivo. Confirme os índices de consulta e crie explicitamente os gráficos pretendidos; selecionar um modelo de dispositivo não comprova que a recolha esteja a funcionar. Consulte [Importar modelos](/pt-pt/guides/import-and-export-templates/) e [O seu primeiro gráfico](/pt-pt/start/first-graph/).

## O que obtém sem consulta de dados

Estes modelos de dados de OID fixo estão incluídos no pacote. Um gráfico pode combinar vários deles; a disponibilidade depende do agente de destino. Não requerem qualquer deteção de índice.

| Gráfico | OID | Armazenado como |
|---|---|---|
| Média de carga 1 minuto | `.1.3.6.1.4.1.2021.10.1.3.1` | `GAUGE` |
| Média de carga 5 minutos | `.1.3.6.1.4.1.2021.10.1.3.2` | `GAUGE` |
| Média de carga 15 minutos | `.1.3.6.1.4.1.2021.10.1.3.3` | `GAUGE` |
| Memória total | `.1.3.6.1.4.1.2021.4.5.0` | `GAUGE` |
| Memória livre | `.1.3.6.1.4.1.2021.4.6.0` | `GAUGE` |
| Memória de buffer | `.1.3.6.1.4.1.2021.4.14.0` | `GAUGE` |
| Memória de cache | `.1.3.6.1.4.1.2021.4.15.0` | `GAUGE` |
| CPU utilizador | `.1.3.6.1.4.1.2021.11.9.0` | `GAUGE` |
| CPU sistema | `.1.3.6.1.4.1.2021.11.10.0` | `GAUGE` |
| CPU inativo | `.1.3.6.1.4.1.2021.11.11.0` | `GAUGE` |
| Interrupções | `.1.3.6.1.4.1.2021.11.7.0` | `GAUGE` |
| Mudanças de contexto | `.1.3.6.1.4.1.2021.11.8.0` | `GAUGE` |
| Processos | `.1.3.6.1.2.1.25.1.6.0` | `GAUGE` |
| Utilizadores com sessão iniciada | `.1.3.6.1.2.1.25.1.5.0` | `GAUGE` |

Os objetos de memória estão expressos em kilobytes. O gráfico de memória fornecido aplica uma conversão para que o eixo seja apresentado em bytes. Se criar o seu próprio gráfico a partir destes OIDs, essa conversão fica sob a sua responsabilidade.

Os objetos de CPU listados são percentagens obsoletas, não contadores cumulativos de tempo de CPU. Não assuma que estes três cobrem sozinhos todos os estados do processador. O Net-SNMP descontinua-os a favor de contadores brutos; contadores brutos exigem cálculos apropriados de taxa e percentagem, e não uma simples inserção num modelo do tipo gauge. Consulte a [MIB UCD-SNMP](https://www.net-snmp.org/docs/mibs/ucdavis.html).

## O que exige uma consulta de dados

| Consulta | Deteta | Suportada por |
|---|---|---|
| SNMP - Obter pontos de montagem | Tudo o que o agente designa como armazenamento | `hrStorageTable`, `.1.3.6.1.2.1.25.2.3.1` |
| Net-SNMP - Obter partições monitorizadas | Apenas as partições declaradas em `snmpd.conf` | `dskTable`, `.1.3.6.1.4.1.2021.9.1` |
| SNMP - Obter informações do processador | Uma entrada por CPU | Carga do processador de recursos do anfitrião |
| Net-SNMP - Obter E/S de dispositivos | Dispositivos de bloco | `diskIOTable`, `.1.3.6.1.4.1.2021.13.15.1.1` |
| SNMP - Estatísticas de interface | Interfaces de rede | `IF-MIB` |

### Qual consulta de disco utilizar

Não são duas vistas dos mesmos dados.

A consulta de recursos do anfitrião percorre tudo o que o agente indica como armazenamento. Na maioria dos anfitriões Linux, isto agrupa memória física, swap, montagens tmpfs e os sistemas de ficheiros reais numa única lista. Os tamanhos são devolvidos em unidades de alocação, e a consulta lê o tamanho da unidade de alocação como um campo separado para que o gráfico possa multiplicar. Obtém tudo sem configurar nada, mas também uma longa lista de entradas que não pretende.

A consulta net-snmp lê a tabela de disco UCD, preenchida por diretivas `disk` ou `includeAllDisks`. Escolha partições explícitas ou uma deteção ampla; são políticas distintas.

```
disk /      10%
disk /var   10%
```

Como alternativa, `includeAllDisks 10%` preenche os discos encontrados no arranque do agente. O valor de 10% configura um limiar de espaço livre; não é um filtro de seleção e não configura alertas do Kadupul por si só. Recarregue ou reinicie o agente e, em seguida, verifique os índices. Uma consulta vazia também pode refletir problemas de acesso ou de disponibilidade do módulo. Consulte a [configuração do snmpd](https://www.net-snmp.org/docs/man/snmpd.conf.html).

Prefira a consulta de recursos do anfitrião quando pretender integridade e estiver disposto a filtrar. Prefira a consulta net-snmp com entradas explícitas de `disk` quando pretender uma lista direcionada. `includeAllDisks` expande essa lista; verifique novamente os índices após os reinícios do agente.

### Interfaces

A consulta de dados de interface num servidor comporta-se exatamente como num switch, com uma ressalva: `ifDescr` no Linux é o nome da interface do kernel, que pode mudar após um reinício ou atualização de controlador. Consulte [Monitorizar um switch](/pt-pt/guides/monitor-a-switch/) para obter detalhes sobre a escolha do índice.

## Quando o SNMP não for suficiente

Algumas métricas não dispõem de uma MIB utilizável. A profundidade de uma fila, um contador de aplicação ou um número num ficheiro exigem uma entrada de script.

Dois factos determinam a forma como escreve o script.

**O script é executado na máquina em que o poller corre, não no anfitrião monitorizado.** Alcançar o destino é função do seu script: SSH, uma chamada HTTP, um agente ou qualquer mecanismo já utilizado.

**O poller lê o standard output e nada mais.** O estado de saída não é avaliado.

O contrato de saída:

| Saída | Significado |
|---|---|
| `42` ou `3.7` | Um único valor para uma única fonte de dados |
| `U` | Nenhum valor neste ciclo, registado como desconhecido |
| `in:1420 out:980` | Vários valores, um por fonte de dados |

Para o formato de múltiplos valores, os pares são separados por espaços simples e o nome é separado do valor por dois pontos. O analisador conta os delimitadores em relação aos espaços em branco, pelo que espaços internos adicionais podem fazer falhar a validação. O poller PHP apara os espaços em branco finais. Emita o formato canónico com espaços simples e reencaminhe os diagnósticos para fora do stdout.

Os nomes internos de fontes de dados RRD aceites pelo editor de modelos correspondem a `[a-zA-Z0-9_]{1,19}`; hífenes não são aceites aí. As etiquetas de saída do script devem coincidir com os nomes dos campos de entrada de dados e estar mapeadas para os itens internos pretendidos. A linha de saída completa é armazenada numa coluna de 512 carateres. Consulte [Scripts de recolha](/pt-pt/guides/write-a-data-collection-script/) para conhecer o contrato auditado do poller PHP.

Devolva `U` em vez de `0` quando não for possível medir algo. Zero é uma medição e será representado como tal. Consulte [Fontes de dados e RRAs](/pt-pt/concepts/data-sources-and-rras/) para compreender por que razão ambos são mantidos separados.

### Servidor de script

Um script simples é executado uma vez por fonte de dados e por intervalo. Para um script escrito em PHP, o formato do servidor de script chama uma função num processo PHP separado e de longa duração, reduzindo a sobrecarga de arranque do interpretador.

### A armadilha da lista de permissões

Quando um ficheiro de lista de permissões de entrada de dados é utilizado, o poller compara a cadeia de comando de cada entrada com a registada. Uma cadeia de comando que tenha sido alterada sem regeneração da lista de permissões deixa de criar entradas na cache do poller, e a fonte de dados silencia-se sem erros no gráfico. O registo relata isso, a interface de utilizador não.

```bash
php cli/input_whitelist.php --audit
php cli/input_whitelist.php --update --id=42
```

Substitua `42` pelo identificador do método de entrada de dados auditado, não por um ID de dispositivo. Uma atualização sem `--id` aceita as cadeias de comandos atuais em todo o inventário de entrada. Audite as alterações previamente. Após a atualização, verifique a ativação da fonte e as entradas efetivas na cache do poller.

## Modos de falha

| Sintoma | Causa comum |
|---|---|
| Descrição do sistema lida, nada mais recolhido | Vista do `snmpd` restrita à subárvore do sistema |
| Consulta de partições net-snmp não encontra índices | Nenhuma linha `disk` ou `includeAllDisks` no `snmpd.conf` |
| Partições de recursos do anfitrião incluem RAM e tmpfs | Esperado; o agente indica-as como armazenamento |
| Gráfico de memória desfasado por um fator de 1024 | Construção com base nos OIDs brutos sem conversão |
| Script devolve valor na linha de comandos, poller regista desconhecido | Discrepância saída/mapeamento, erros de delimitador interno ou nome interno inválido |
| Script funciona manualmente, mas falha via poller | É executado com o utilizador do poller, o seu ambiente e as suas permissões |
