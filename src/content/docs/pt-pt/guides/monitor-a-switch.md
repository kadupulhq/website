---
title: Monitorizar um switch
description: Detete as portas de um switch, trace os contadores corretos e escolha um índice para que o histórico de uma porta permaneça associado à porta após a substituição de uma placa.
banner:
  content: O Kadupul está em pré-alfa. Valide estes procedimentos numa instalação de teste isolada. Este é um rascunho de tradução a aguardar revisão por um falante fluente.
sidebar:
  order: 2
---

:::caution[Validar antes da utilização]
O código-fonte está disponível, mas não existe nenhuma versão suportada do Kadupul nem caminho de migração. Teste estes procedimentos numa cópia isolada com cópias de segurança antes de confiar neles. Consulte o [estado do projeto](/pt-pt/project/status/).
:::

Um switch é o caso de utilização clássico para consultas de dados. Não sabe antecipadamente quantas portas estão presentes, a contagem pode variar e cada porta necessita da sua própria fonte de dados. Consulte [Modelos](/pt-pt/concepts/templates/) para saber como as consultas de dados funcionam; esta página aborda a configuração correta.

## Antes de começar

Certifique-se de que o dispositivo responde a partir do coletor atribuído, de preferência sob o utilizador do poller. Utilize as suas credenciais só de leitura configuradas. Os OIDs numéricos evitam a dependência de nomes de MIB instalados localmente.

```bash
snmpwalk -v2c -c 'your-read-only-community' switch.example.net .1.3.6.1.2.1.31.1.1.1.1
```

Utilize SNMP v2c ou v3. Os contadores de interface de 64 bits são objetos SMIv2 e não podem ser consultados via v1. Um dispositivo v1 fornecer-lhe-á apenas os contadores de 32 bits e nada mais.

## Escolher um modelo de dispositivo

O modelo de dispositivo determina quais as consultas de dados e os modelos de gráficos disponibilizados quando adiciona o dispositivo. O Kadupul herda o conjunto de modelos fornecido pelo Cacti, que inclui um modelo genérico de dispositivo SNMP e um conjunto de modelos específicos de fabricantes.

A deteção de portas provém da mesma fonte independentemente da sua escolha: a consulta de dados de interface definida em `resource/snmp_queries/interface.xml`. Se nenhum modelo corresponder ao seu hardware, escolha o modelo genérico e associe a ele a consulta de interface.

## Executar a consulta de dados

A consulta percorre `ifIndex` para encontrar as portas e lê `ifNumber` para saber quantas esperar. Em seguida, recolhe um conjunto de campos por porta.

| Campo | OID | Utilizado para |
|---|---|---|
| `ifIndex` | `.1.3.6.1.2.1.2.2.1.1` | A posição na tabela SNMP |
| `ifName` | `.1.3.6.1.2.1.31.1.1.1.1` | Nome curto da porta, `Gi1/0/3` |
| `ifDescr` | `.1.3.6.1.2.1.2.2.1.2` | Descrição mais longa |
| `ifAlias` | `.1.3.6.1.2.1.31.1.1.1.18` | A descrição da interface que configurar |
| `ifHwAddr` | `.1.3.6.1.2.1.2.2.1.6` | Endereço MAC da porta |
| `ifSpeed` | `.1.3.6.1.2.1.2.2.1.5` | Velocidade em bits/s, 32 bits |
| `ifHighSpeed` | `.1.3.6.1.2.1.31.1.1.1.15` | Velocidade em Mbits/s |
| `ifOperStatus` | `.1.3.6.1.2.1.2.2.1.8` | Up ou Down |
| `ifInOctets` / `ifOutOctets` | `.1.3.6.1.2.1.2.2.1.10` / `.16` | Contadores de bytes de 32 bits |
| `ifHCInOctets` / `ifHCOutOctets` | `.1.3.6.1.2.1.31.1.1.1.6` / `.10` | Contadores de bytes de 64 bits |

Execute a consulta uma vez no dispositivo. Devolverá uma tabela das portas detetadas. Leia essa tabela antes de criar gráficos, pois constitui a base para cada decisão subsequente.

## Escolher os contadores de 64 bits

A consulta de interface oferece vários modelos de gráficos de tráfego. Os principais:

| Modelo de gráfico | Lê |
|---|---|
| In/Out Bits | `ifInOctets`, `ifOutOctets` |
| In/Out Bits (64-bit) | `ifHCInOctets`, `ifHCOutOctets` |
| In/Out Bits (64-bit, 95th) | O mesmo, com uma linha de 95º percentil |
| In/Out Bits (64-bit, BW) | O mesmo, em relação à velocidade da interface |
| Status (Up/Down) | `ifOperStatus` |
| In/Out (Errors/Discards) | `ifInErrors`, `ifInDiscards`, `ifOutDiscards`, `ifOutErrors` |

Utilize um modelo de 64 bits, a menos que tenha um motivo específico para não o fazer. Um contador de octetos de 32 bits atinge o limite em 4294967295. Uma porta gigabit sob carga máxima preenche-o em cerca de 34 segundos. Com um intervalo de 300 segundos, o poller não consegue distinguir um transbordo de sete transbordos, e `COUNTER` corrige apenas um transbordo entre duas amostras. O gráfico não parecerá visualmente danificado; simplesmente apresentará valores permanentemente baixos demais.

Verifique se os contadores estão realmente a ser preenchidos antes de criar centenas de gráficos.

```bash
snmpwalk -v2c -c 'your-read-only-community' switch.example.net .1.3.6.1.2.1.31.1.1.1.6
```

Um walk vazio ou com falha requer investigação: verifique o erro comunicado, a vista de acesso e o suporte do agente.

## Verificar o máximo armazenado após alterações de velocidade

Quando a fonte de dados utiliza um máximo com base na velocidade da consulta, a criação obtém a velocidade a partir dos dados de deteção guardados em cache. `ifHighSpeed` é preferido, `ifSpeed` é utilizado se o primeiro estiver em falta e um padrão configurado é aplicado se ambos forem zero.

Esse valor é gravado no ficheiro. Uma porta detetada a 100 Mbps e negociada mais alto posteriormente pode manter um teto abaixo do seu tráfego real, e o RRDtool registará taxas acima desse teto como desconhecidas. Compare a velocidade em cache, a definição da fonte de dados e o ficheiro real com `rrdtool info`.

## A decisão do índice

É aqui que o histórico se perde caso ocorram erros.

Cada fonte de dados armazena duas coisas sobre a sua porta: que campo a identifica (o tipo de índice) e o valor desse campo. A cada reindexação, reencontra a porta perguntando que índice SNMP tem atualmente esse valor nesse campo. A fonte de dados segue o valor, não a posição na tabela.

A questão é, portanto, qual o campo que contém o valor.

A consulta de interface declara uma ordem de preferência: `ifName`, depois `ifDescr`, depois `ifHwAddr`, depois `ifIndex`. O Kadupul escolhe normalmente entre os candidatos com valores suficientemente distintos e sem duplicados.

| Campo | Sobrevive a | Falha quando |
|---|---|---|
| `ifName` | Reinícios, substituições de placas, renumeração | O agente deixa-o em branco ou repete-o entre membros do empilhamento |
| `ifDescr` | Geralmente estável em hardware de comutação | Em servidores, um nome de kernel sujeito a alterações |
| `ifHwAddr` | Reinícios | Uma placa substituída tem novos endereços MAC, que é exatamente o caso que pretendia proteger |
| `ifIndex` | Nada fiável | Uma troca de placa, reinício ou alteração de firmware renumera a tabela |

Se a consulta recorrer a `ifIndex`, considere isso uma constatação e não um resultado normal. O histórico da sua porta fica vinculado a um número que o switch tem a liberdade de reatribuir.

## Método de reindexação

Definido por dispositivo e por consulta de dados. Determina quando o Kadupul relê os campos de índice.

| Método | Dispara em | Custo |
|---|---|---|
| None | Nada; apenas manual ou script | Nenhum |
| Uptime | Uptime SNMP do dispositivo a andar para trás | Uma comparação por ciclo |
| Index Count | Alteração na contagem de índices detetados | Uma contagem por ciclo |
| Verify All | Falha numa verificação de identidade em cache | Consulta índices conhecidos durante o polling |

Uptime é o padrão e serve para a maioria dos switches, dado que um reinício é o evento que renumera os índices. Index Count captura placas adicionadas ou removidas sem reinício. Verify All pode detetar identidades alteradas em índices conhecidos, mas não garante a deteção de novas portas.

Para executar novamente um dispositivo e uma consulta selecionados, substitua ambos os identificadores pelos identificadores instalados. Omita `--qid` para reexecutar todas as consultas desse dispositivo:

```bash
php cli/poller_reindex_hosts.php --id=42 --qid=16
```

`--id=all` estende a execução a todos os dispositivos ativados. Evite execuções de reindexação sobrepostas. `--force` ignora o registo de processos e atualiza as caches de títulos.

## Quando uma porta desaparece

Não presuma que uma porta em falta pare a recolha automaticamente. O código de reindexação atual pode repor um indicador de órfão e manter os OIDs de consulta antigos quando uma identidade fica sem resolução e nenhuma fonte altera o índice. Compare a identidade armazenada com a nova cache de deteção e desative uma fonte afetada até que a correspondência seja confirmada. Consulte [Consultas de dados e índices](/pt-pt/concepts/data-queries-and-indexes/).

## Chassis grandes

Duas definições por dispositivo tornam-se importantes quando a contagem de portas é elevada: verifique os OIDs configurados por pedido SNMP e a contagem de threads por dispositivo. O suporte a lotes e o paralelismo efetivo dependem do coletor e do agente; o PHP `cmd.php` e o Spine não oferecem um comportamento de multithreading idêntico.

Altere apenas uma definição de cada vez e observe a duração da execução do poller.

## Modos de falha

| Sintoma | Causa |
|---|---|
| Gráficos criados, cada medição desconhecida | Contadores de 64 bits não implementados, ou o dispositivo utiliza SNMP v1 |
| Contadores saltam para valores absurdos | O contador de 32 bits transborda mais de uma vez por intervalo |
| Lacunas apenas sob carga elevada | Máximo RRD fixado numa velocidade detetada obsoleta |
| Histórico da porta associado à porta errada após manutenção | Identidade instável, mapeamento obsoleto ou processamento de órfãos não resolvido |
| Poller regista avisos sobre índices SNMP inválidos | Fontes de dados deixadas sem índice; reindexar, eliminar ou desativar |
| Portas detetadas, nada é recolhido | Fontes de dados com índice vazio não criam entradas na cache do poller |
