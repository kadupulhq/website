---
title: Tempo e intervalos
description: Intervalo de coleta, passo RRD, heartbeat e desvio de relógio, e o motivo pelo qual o carimbo de data/hora de uma amostra decide mais do que se espera.
sidebar:
  order: 7
banner:
  content: O Kadupul está em pré-alfa. Valide estes procedimentos em uma instalação de teste isolada. Tradução em rascunho, pendente de revisão por uma pessoa fluente no idioma.
---

A coleta de dados envolve três relógios: a cadência do iniciador, o intervalo de coleta dentro de cada invocação e o passo RRD. Eles necessitam de configurações compatíveis.

| Número | Pertence a | Como é utilizado |
|---|---|---|
| Intervalo do iniciador | Cron, Agendador de Tarefas ou `cactid.php` | Deve corresponder a `cron_interval`, interpretado por `poller.php` como 60 ou 300 segundos |
| Intervalo de coleta | Ciclos de coleta | `poller.php` calcula um número inteiro de ciclos por intervalo do iniciador |
| Passo | Um arquivo RRD | Intervalo base de normalização, definido a partir do perfil da fonte de dados na criação |
| Heartbeat | Um campo dentro de um RRD | Intervalo máximo permitido entre atualizações; a criação lê a definição do campo |

Por exemplo, um iniciador de 60 segundos e um intervalo de coleta de 10 segundos produzem seis ciclos por invocação. Um iniciador de 300 segundos e um intervalo de coleta de 300 segundos produzem um. Não configure o intervalo do iniciador abaixo do intervalo de coleta: 60/300 resulta em zero ciclos. Utilize um único agendador e pare-o antes de uma execução manual com `--force`. Consulte [Instalação](/pt-br/start/install/).

Editar um perfil não migra automaticamente os arquivos existentes. O heartbeat pode ser ajustado; alterações de passo exigem uma migração planejada utilizando as ferramentas do RRDtool. Verifique as definições do banco de dados e a saída de `rrdtool info` em seguida.

## Quando coincidem

Uma fonte de dados cujo passo é igual ao intervalo de coleta está qualificada em cada ciclo, sujeita ao estado do dispositivo, conteúdo do cache e limites de tempo de execução. A configuração padrão utiliza 300 segundos para ambos. A qualificação não garante uma leitura bem-sucedida.

## Quando o passo é mais longo do que o intervalo

O coletor PHP utiliza `rrd_next_step` em cada linha da lista de trabalho quando múltiplos agendamentos ativos o exigem. Seleciona linhas com valor igual ou inferior a zero e atualiza as contagens para seu escopo de coletor e hosts. Linhas cujo passo coincide com o intervalo de coleta permanecem em zero. Outras linhas decrementam de acordo com o intervalo de coleta; em caso de subfluxo, a reinicialização depende do modo de invocação: um ciclo normal de subiniciador reinicia para o passo menos o intervalo, enquanto intervalos iguais e o caminho global reiniciam para o passo completo. Não presuma que um passo de dez minutos represente sempre uma invocação alternada de cinco minutos; inspecione as linhas pendentes e os carimbos de data/hora reais.

Com a opção **Equilibrar a Carga dos Processos** ativada, a construção do cache atribui deslocamentos a fontes de dados sucessivas em um dispositivo por meio do passo e do intervalo de coleta. Campos da mesma fonte compartilham um deslocamento. Isso pode distribuir o trabalho pelos ciclos, mas não garante tempos de execução idênticos: latências de dispositivos, tempos limite e scripts diferem. O iniciador também realinha contagens inconsistentes entre campos da mesma fonte de dados.

Antes de concluir que um item está com defeito por não ter produzido dados durante um ciclo, verifique seu estado de vencimento e os ciclos subsequentes. Consulte [O cache do poller](/pt-br/concepts/the-poller-cache/) para os limites de reconstrução.

## Quando o passo é mais curto do que o intervalo

Um passo mais curto não pode criar medições que o coletor nunca realizou. O Kadupul emite um aviso durante a construção do cache quando a coleta é lenta demais para o passo; retifique as configurações e reconstrua o cache afetado.

Essa discrepância não produz obrigatoriamente um gráfico em forma de pente. O RRDtool consegue normalizar atualizações menos frequentes em passos menores quando o heartbeat permite, mas isso não restaura os detalhes de medição perdidos.

## O heartbeat nem sempre é o dobro do passo

O heartbeat é o intervalo máximo permitido entre atualizações antes de uma entrada ser tratada como desconhecida. A criação do RRD lê o heartbeat da definição do campo da fonte de dados, que pode herdar parâmetros do perfil ou do modelo. Não é um período de tolerância adicional somado ao passo; inspecione o campo e o arquivo reais quando divergirem do perfil.

Os perfis fornecidos não seguem uma regra única.

| Perfil | Passo | Heartbeat | Limite do intervalo de atualização |
|---|---|---|---|
| Cinco minutos | 300 | 600 | 10 minutos |
| Um minuto | 60 | 600 | 10 minutos |
| Trinta segundos | 30 | 1200 | 20 minutos |

Esses são valores de perfis de fábrica, não um temporizador de detecção de falhas. Entradas explicitamente desconhecidas podem criar lacunas antes de o heartbeat expirar; a normalização e os limites de arquivo influenciam o que se torna visível. Um heartbeat mais amplo tolera um intervalo maior. Igual ou abaixo do intervalo normal de atualização, não deixa margem para atrasos.

Inspecione o arquivo real assim como seu perfil. Arquivos RRD existentes podem divergir de definições alteradas no banco de dados; a auditoria de arquivos relata tais desvios. Consulte a [definição de heartbeat do RRDtool](https://oss.oetiker.ch/rrdtool/doc/rrdcreate.en.html) e a [referência de ajuste](https://oss.oetiker.ch/rrdtool/doc/rrdtune.en.html) antes de planejar alterações.

## O que é armazenado difere do que o dispositivo transmitiu

O RRDtool normaliza atualizações em limites de passo fixos. Valores entre limites podem contribuir para mais de um ponto de dados primário. O heartbeat, valores desconhecidos explícitos e limites afetam dados válidos; a consolidação de arquivo aplica seu próprio limite de dados desconhecidos. Um passo não necessita de uma amostra bruta individual para reter um valor conhecido.

Valores de contador convertem-se em taxas com base no tempo decorrido, sujeitos a reinicializações de contadores, estouros e limites. Medidores instantâneos também são normalizados no tempo. Picos curtos podem ser atenuados ou completamente omitidos pela amostragem; valores sustentados ou alinhados com os limites de passo não sofrem necessariamente redução. As configurações de arquivo não conseguem reconstruir detalhes que nunca foram coletados ou que se perderam durante a normalização.

## Qual relógio decide

Para a coleta comum via `cmd.php`, a instrução SQL `CURRENT_TIMESTAMP()` fornece o carimbo de data/hora de saída na inserção de um lote. Não se trata de um carimbo fornecido pelo dispositivo nem de uma medição exata do momento em que o dispositivo respondeu. Outros mecanismos de coleta e caminhos em tempo real devem ser verificados separadamente.

O coletor PHP armazena em buffer seus resultados e os grava em lotes, descarregando perante uma mudança de dispositivo ou quando o buffer se esgota. O carimbo de data/hora é avaliado uma vez por lote, de modo que todos os valores de um lote recebem exatamente a mesma marca temporal.

As consequências não são evidentes, por isso vale a pena detalhá-las.

**O relógio do dispositivo não atribui o carimbo a essas amostras SNMP.** O coletor utiliza a hora de inserção no banco de dados. A hora do dispositivo ainda pode ser relevante para um script ou para a interpretação de uma métrica particular, o que não justifica negligenciar a sincronização horária.

**Um relógio incorreto no coletor ou no banco de dados desloca os dados.** Os valores ficam registrados nos intervalos temporais errados e, em um arquivo já parcialmente escrito, qualquer atualização cuja hora não seja posterior à última é categoricamente recusada. Se os carimbos recuarem para trás da última atualização do arquivo, as novas atualizações não farão avançar o arquivo até que seus carimbos superem esse marco. Verifique o relógio do banco de dados, o relógio do coletor e o carimbo do arquivo; alterar apenas o relógio do coletor não muda necessariamente os carimbos gerados pelo banco de dados.

**O tempo dentro de um ciclo transforma-se em jitter.** Um dispositivo consultado no fim de um processamento longo recebe um carimbo posterior ao de um consultado no início, mesmo pertencendo ambos ao mesmo ciclo. Em um coletor sobrecarregado, esse jitter pode constituir uma fração substancial do intervalo e é uma das razões pelas quais um heartbeat configurado de forma muito restrita gera falhas.

**O fuso horário do banco de dados fica no meio do caminho.** O carimbo é gravado como carimbo do banco de dados e reconvertido em hora absoluta pelo banco de dados durante a leitura. Um tratamento inconsistente de fusos horários de sessão pode alterar essa interpretação. Verifique as configurações de sessão de escrita e leitura e a conversão de época; mudar unicamente o fuso horário de exibição não prova que os dados armazenados se moveram.

## As leituras são agrupadas por carimbo de data/hora

Uma fonte de dados com múltiplos campos, como uma interface com bytes de entrada e bytes de saída, pode utilizar tarefas SNMP separadas ou um script retornando vários valores nomeados. Campos processados são agrupados por fonte de dados e carimbo de data/hora para atualização do RRD.

Um conjunto incompleto é retido em vez de gravado parcialmente, até que o número previsto de campos seja atingido. Trata-se de uma verificação de integridade e não de uma garantia de validade numérica; valores explicitamente desconhecidos ainda podem ser gravados. Normalmente ambas as metades encontram-se no mesmo lote e compartilham o carimbo, tornando o processo imperceptível. Lotes inseridos no mesmo segundo também podem coincidir. Se os campos receberem carimbos distintos, os grupos podem permanecer incompletos e não gerar atualizações. O código atual retém grupos incompletos entre ciclos, registrando um aviso e descartando-os após `5 * max(60, poller_interval)` segundos. O limite de página de leitura é expandido para incluir seu último grupo de carimbos temporais.

As atualizações são também ordenadas em ordem cronológica ascendente antes da escrita, já que um arquivo não aceita valores mais antigos do que sua última atualização.

## Gravações adiadas mantêm seus carimbos de data/hora

Quando as gravações no RRD são adiadas e aplicadas em lote mais tarde, o carimbo de data/hora registrado acompanha o valor e o lote é gravado em ordem cronológica. Um carimbo do meio-dia é mantido quando a atualização é tentada à uma hora; não é substituído pela hora de descarregamento do buffer. O RRDtool normaliza sempre as atualizações aceitas em seus limites de passo.

Uma fila acumulada pode fazer avançar um arquivo por meio de carimbos mais recentes do que sua última atualização. Ela não consegue preencher retroativamente falhas anteriores a esse carimbo. O gravador Boost filtra amostras com data igual ou anterior à última atualização do arquivo; uma fila esvaziada não prova que todas as amostras foram aplicadas. Consulte [Gravações em alto volume](/pt-br/concepts/high-volume-writes/) e a [referência de atualização do RRDtool](https://oss.oetiker.ch/rrdtool/doc/rrdupdate.en.html). Gravações adiadas dependem de um armazenamento bem-sucedido e de ordenação temporal válida; não garantem recuperação perante qualquer anomalia. Inspecione dados retidos e rejeitados quando a fila não diminuir.

## Quando o ciclo não termina

O coletor PHP verifica o tempo de execução decorrido entre tarefas e encerra seu loop de elementos assim que ele excede o intervalo de coleta, registrando um aviso. Não é uma interrupção brusca no prazo estrito: uma operação em andamento pode se prolongar antes dessa verificação. Elementos não alcançados não produzem valores nesse ciclo. Uma falha entre atualizações válidas pode ser atenuada se o heartbeat e os limites de arquivo permitirem. Excedimentos repetidos constituem motivo para investigar capacidade, tempos limite e erros de coleta, não prova de que todas as falhas tenham a mesma causa.

[Dimensionar o poller](/pt-br/guides/scale-the-poller/) aborda as medidas a tomar. A ordenação de uma execução e os mecanismos de contenção constam de [Ciclo de vida do poller](/pt-br/reference/poller-lifecycle/).
