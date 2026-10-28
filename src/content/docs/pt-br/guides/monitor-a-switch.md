---
title: Monitorar um switch
description: Descubra as portas de um switch, trace os contadores corretos e escolha um índice para que o histórico de uma porta permaneça associado à porta após a substituição de uma placa.
banner:
  content: O Kadupul está em pré-alfa. Valide estes procedimentos em uma instalação de teste isolada. Este é um rascunho de tradução aguardando revisão por um falante fluente.
sidebar:
  order: 2
---

:::caution[Validar antes do uso]
O código-fonte está disponível, mas não há versão suportada do Kadupul nem caminho de migração. Teste estes procedimentos em uma cópia isolada com backups antes de confiar neles. Consulte o [status do projeto](/pt-br/project/status/).
:::

Um switch é o caso de uso clássico para consultas de dados. Você não sabe com antecedência quantas portas estão presentes, a contagem pode variar e cada porta precisa de sua própria fonte de dados. Consulte [Modelos](/pt-br/concepts/templates/) para saber como as consultas de dados funcionam; esta página aborda a configuração correta.

## Antes de começar

Certifique-se de que o dispositivo responda a partir do coletor atribuído, preferencialmente sob o usuário do poller. Use suas credenciais de somente leitura configuradas. OIDs numéricos evitam a dependência de nomes de MIB instalados localmente.

```bash
snmpwalk -v2c -c 'your-read-only-community' switch.example.net .1.3.6.1.2.1.31.1.1.1.1
```

Use SNMP v2c ou v3. Os contadores de interface de 64 bits são objetos SMIv2 e não podem ser consultados via v1. Um dispositivo v1 fornecerá apenas os contadores de 32 bits e nada mais.

## Escolher um modelo de dispositivo

O modelo de dispositivo determina quais consultas de dados e modelos de gráficos são oferecidos quando você adiciona o dispositivo. O Kadupul herda o conjunto de modelos fornecido pelo Cacti, que inclui um modelo genérico de dispositivo SNMP e um conjunto de modelos específicos de fabricantes.

A descoberta de portas provém da mesma fonte independentemente de sua escolha: a consulta de dados de interface definida em `resource/snmp_queries/interface.xml`. Se nenhum modelo corresponder ao seu hardware, escolha o modelo genérico e associe a ele a consulta de interface.

## Executar a consulta de dados

A consulta percorre `ifIndex` para encontrar as portas e lê `ifNumber` para saber quantas esperar. Em seguida, ela coleta um conjunto de campos por porta.

| Campo | OID | Usado para |
|---|---|---|
| `ifIndex` | `.1.3.6.1.2.1.2.2.1.1` | A posição na tabela SNMP |
| `ifName` | `.1.3.6.1.2.1.31.1.1.1.1` | Nome curto da porta, `Gi1/0/3` |
| `ifDescr` | `.1.3.6.1.2.1.2.2.1.2` | Descrição mais longa |
| `ifAlias` | `.1.3.6.1.2.1.31.1.1.1.18` | A descrição da interface que você configurar |
| `ifHwAddr` | `.1.3.6.1.2.1.2.2.1.6` | Endereço MAC da porta |
| `ifSpeed` | `.1.3.6.1.2.1.2.2.1.5` | Velocidade em bits/s, 32 bits |
| `ifHighSpeed` | `.1.3.6.1.2.1.31.1.1.1.15` | Velocidade em Mbits/s |
| `ifOperStatus` | `.1.3.6.1.2.1.2.2.1.8` | Up ou Down |
| `ifInOctets` / `ifOutOctets` | `.1.3.6.1.2.1.2.2.1.10` / `.16` | Contadores de bytes de 32 bits |
| `ifHCInOctets` / `ifHCOutOctets` | `.1.3.6.1.2.1.31.1.1.1.6` / `.10` | Contadores de bytes de 64 bits |

Execute a consulta uma vez no dispositivo. Ela retornará uma tabela das portas descobertas. Leia essa tabela antes de criar gráficos, pois ela serve de base para cada decisão subsequente.

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

Use um modelo de 64 bits, a menos que tenha um motivo específico para não fazê-lo. Um contador de octetos de 32 bits atinge o limite em 4294967295. Uma porta gigabit sob carga máxima o preenche em cerca de 34 segundos. Com um intervalo de 300 segundos, o poller não consegue distinguir um estouro de sete estouros, e `COUNTER` corrige apenas um estouro entre duas amostras. O gráfico não parecerá visualmente corrompido; ele simplesmente exibirá valores permanentemente baixos demais.

Verifique se os contadores estão realmente sendo preenchidos antes de criar centenas de gráficos.

```bash
snmpwalk -v2c -c 'your-read-only-community' switch.example.net .1.3.6.1.2.1.31.1.1.1.6
```

Um walk vazio ou com falha requer investigação: verifique o erro relatado, a visão de acesso e o suporte do agente.

## Verificar o máximo armazenado após alterações de velocidade

Quando a fonte de dados usa um máximo com base na velocidade da consulta, a criação obtém a velocidade dos dados de descoberta armazenados em cache. `ifHighSpeed` é preferido, `ifSpeed` é usado se o primeiro estiver ausente e um padrão configurado é aplicado se ambos forem zero.

Esse valor é gravado no arquivo. Uma porta descoberta a 100 Mbps e negociada mais alto posteriormente pode manter um teto abaixo de seu tráfego real, e o RRDtool registrará taxas acima desse teto como desconhecidas. Compare a velocidade em cache, a definição da fonte de dados e o arquivo real com `rrdtool info`.

## A decisão do índice

É aqui que o histórico é perdido caso haja equívocos.

Cada fonte de dados armazena duas coisas sobre sua porta: qual campo a identifica (o tipo de índice) e o valor desse campo. A cada reindexação, ela reencontra a porta perguntando qual índice SNMP possui atualmente esse valor nesse campo. A fonte de dados segue o valor, não a posição na tabela.

A questão é, portanto, qual campo carrega o valor.

A consulta de interface declara uma ordem de preferência: `ifName`, depois `ifDescr`, depois `ifHwAddr`, depois `ifIndex`. O Kadupul normalmente escolhe entre os candidatos que possuem valores suficientemente distintos e sem duplicatas.

| Campo | Sobrevive a | Falha quando |
|---|---|---|
| `ifName` | Reinicializações, substituições de placas, renumeração | O agente o deixa em branco ou o repete entre membros da pilha |
| `ifDescr` | Geralmente estável em hardware de comutação | Em servidores, um nome de kernel sujeito a alterações |
| `ifHwAddr` | Reinicializações | Uma placa substituída possui novos endereços MAC, que é exatamente o caso que você desejava proteger |
| `ifIndex` | Nada confiável | Uma troca de placa, reinicialização ou alteração de firmware renumera a tabela |

Se a consulta recorrer a `ifIndex`, considere isso uma constatação e não um resultado normal. O histórico da sua porta fica atrelado a um número que o switch tem a liberdade de reatribuir.

## Método de reindexação

Definido por dispositivo e por consulta de dados. Determina quando o Kadupul relê os campos de índice.

| Método | Dispara em | Custo |
|---|---|---|
| None | Nada; apenas manual ou script | Nenhum |
| Uptime | Uptime SNMP do dispositivo retrocedendo | Uma comparação por ciclo |
| Index Count | Mudança na contagem de índices descobertos | Uma contagem por ciclo |
| Verify All | Falha em uma verificação de identidade em cache | Consulta índices conhecidos durante o polling |

Uptime é o padrão e atende à maioria dos switches, pois uma reinicialização é o evento que renumera os índices. Index Count captura placas adicionadas ou removidas sem reinicialização. Verify All pode detectar identidades alteradas em índices conhecidos, mas não garante a descoberta de novas portas.

Para executar novamente um dispositivo e uma consulta selecionados, substitua ambos os identificadores pelos identificadores instalados. Omita `--qid` para reexecutar todas as consultas desse dispositivo:

```bash
php cli/poller_reindex_hosts.php --id=42 --qid=16
```

`--id=all` estende a execução a todos os dispositivos habilitados. Evite execuções de reindexação sobrepostas. `--force` ignora o registro de processos e atualiza os caches de títulos.

## Quando uma porta desaparece

Não presuma que uma porta ausente pare a coleta automaticamente. O código de reindexação atual pode redefinir um sinalizador de órfão e manter os OIDs de pesquisa antigos quando uma identidade fica sem resolução e nenhuma fonte altera o índice. Compare a identidade armazenada com o novo cache de descoberta e desative uma fonte afetada até que a correspondência seja confirmada. Consulte [Consultas de dados e índices](/pt-br/concepts/data-queries-and-indexes/).

## Chassis grandes

Duas configurações por dispositivo tornam-se importantes quando a contagem de portas é alta: verifique os OIDs configurados por solicitação SNMP e a contagem de threads por dispositivo. O suporte a lotes e o paralelismo efetivo dependem do coletor e do agente; o PHP `cmd.php` e o Spine não oferecem comportamento de encadeamento idêntico.

Altere apenas uma configuração por vez e monitore a duração da execução do poller.

## Modos de falha

| Sintoma | Causa |
|---|---|
| Gráficos criados, cada medição desconhecida | Contadores de 64 bits não implementados, ou o dispositivo usa SNMP v1 |
| Contadores saltam para valores absurdos | O contador de 32 bits estoura mais de uma vez por intervalo |
| Lacunas apenas sob alta carga | Máximo RRD fixado em uma velocidade descoberta obsoleta |
| Histórico da porta associado à porta errada após manutenção | Identidade instável, mapeamento obsoleto ou tratamento de órfãos não resolvido |
| Poller registra avisos sobre índices SNMP inválidos | Fontes de dados deixadas sem índice; reindexar, excluir ou desabilitar |
| Portas descobertas, nada é coletado | Fontes de dados com índice vazio não criam entradas no cache do poller |
