---
title: Tempo e intervalos
description: Intervalo de recolha, passo RRD, heartbeat e desfasamento de relógio, e a razão pela qual o carimbo de data/hora de uma amostra decide mais do que se espera.
sidebar:
  order: 7
banner:
  content: O Kadupul está em pré-alfa. Valide estes procedimentos numa instalação de teste isolada. Tradução em rascunho, pendente de revisão por uma pessoa fluente no idioma.
---

A recolha de dados envolve três relógios: a cadência do iniciador, o intervalo de recolha dentro de cada invocação e o passo RRD. Necessitam de definições compatíveis.

| Número | Pertence a | Como é utilizado |
|---|---|---|
| Intervalo do iniciador | Cron, Programador de Tarefas ou `cactid.php` | Deve corresponder a `cron_interval`, interpretado por `poller.php` como 60 ou 300 segundos |
| Intervalo de recolha | Ciclos de recolha | `poller.php` calcula um número inteiro de ciclos por intervalo do iniciador |
| Passo | Um ficheiro RRD | Intervalo base de normalização, definido a partir do perfil da fonte de dados na criação |
| Heartbeat | Um campo dentro de um RRD | Intervalo máximo permitido entre atualizações; a criação lê a definição do campo |

Por exemplo, um iniciador de 60 segundos e um intervalo de recolha de 10 segundos produzem seis ciclos por invocação. Um iniciador de 300 segundos e um intervalo de recolha de 300 segundos produzem um. Não configure o intervalo do iniciador abaixo do intervalo de recolha: 60/300 resulta em zero ciclos. Utilize um único programador e pare-o antes de uma execução manual com `--force`. Consulte [Instalação](/pt-pt/start/install/).

Editar um perfil não migra automaticamente os ficheiros existentes. O heartbeat pode ser ajustado; as alterações de passo exigem uma migração planeada utilizando as ferramentas do RRDtool. Verifique as definições da base de dados e o resultado de `rrdtool info` em seguida.

## Quando coincidem

Uma fonte de dados cujo passo é igual ao intervalo de recolha está elegível em cada ciclo, sujeita ao estado do dispositivo, conteúdo da cache e limites de tempo de execução. A configuração predefinida utiliza 300 segundos para ambos. A elegibilidade não garante uma leitura bem-sucedida.

## Quando o passo é mais longo do que o intervalo

O recolhedor PHP utiliza `rrd_next_step` em cada linha da lista de trabalho quando múltiplos agendamentos ativos o exigem. Seleciona linhas com valor igual ou inferior a zero e atualiza as contagens para o respetivo âmbito de recolhedor e anfitriões. As linhas cujo passo coincide com o intervalo de recolha mantêm-se a zero. Outras linhas decrementam de acordo com o intervalo de recolha; em caso de subexcesso, o reinício depende do modo de invocação: um ciclo normal de subiniciador reinicia para o passo menos o intervalo, ao passo que intervalos iguais e o caminho global reiniciam para o passo completo. Não assuma que um passo de dez minutos representa sempre uma invocação alternada de cinco minutos; inspecione as linhas pendentes e os carimbos de data/hora reais.

Com a opção **Equilibrar a Carga dos Processos** ativada, a construção da cache atribui desvios a fontes de dados sucessivas num dispositivo através do passo e do intervalo de recolha. Os campos da mesma fonte partilham um desvio. Isto pode distribuir o trabalho pelos ciclos, mas não garante tempos de execução idênticos: as latências dos dispositivos, tempos limite e scripts diferem. O iniciador também realinha contagens inconsistentes entre campos da mesma fonte de dados.

Antes de concluir que um item está danificado por não ter produzido dados durante um ciclo, verifique o seu estado de vencimento e os ciclos subsequentes. Consulte [A cache do recolhedor](/pt-pt/concepts/the-poller-cache/) para os limites de reconstrução.

## Quando o passo é mais curto do que o intervalo

Um passo mais curto não pode criar medições que o recolhedor nunca efetuou. O Kadupul emite um aviso durante a construção da cache quando a recolha é demasiado lenta para o passo; retifique as definições e reconstrua a cache afetada.

Esta discrepância não produz obrigatoriamente um gráfico em forma de pente. O RRDtool consegue normalizar atualizações menos frequentes em passos menores quando o heartbeat o permite, mas isso não restaura os detalhes de medição perdidos.

## O heartbeat nem sempre é o dobro do passo

O heartbeat é o intervalo máximo permitido entre atualizações antes de uma entrada ser tratada como desconhecida. A criação do RRD lê o heartbeat da definição do campo da fonte de dados, que pode herdar parâmetros do perfil ou do modelo. Não constitui um período de tolerância adicional somado ao passo; inspecione o campo e o ficheiro reais quando divergirem do perfil.

Os perfis fornecidos não seguem uma regra única.

| Perfil | Passo | Heartbeat | Limite do intervalo de atualização |
|---|---|---|---|
| Cinco minutos | 300 | 600 | 10 minutos |
| Um minuto | 60 | 600 | 10 minutos |
| Trinta segundos | 30 | 1200 | 20 minutos |

Estes são valores de perfis de fábrica, não um temporizador de deteção de falhas. Entradas explicitamente desconhecidas podem criar lacunas antes de o heartbeat expirar; a normalização e os limiares de histórico consolidado influenciam o que se torna visível. Um heartbeat mais alargado tolera um intervalo maior. Igual ou abaixo do intervalo normal de atualização, não deixa margem para atrasos.

Inspecione o ficheiro real bem como o seu perfil. Os ficheiros RRD existentes podem divergir de definições alteradas na base de dados; a auditoria de ficheiros reporta tais desvios. Consulte a [definição de heartbeat do RRDtool](https://oss.oetiker.ch/rrdtool/doc/rrdcreate.en.html) e o [guia de afinação](https://oss.oetiker.ch/rrdtool/doc/rrdtune.en.html) antes de planear alterações.

## O que é armazenado difere do que o dispositivo transmitiu

O RRDtool normaliza as atualizações em limites de passo fixos. Os valores entre limites podem contribuir para mais do que um ponto de dados primário. O heartbeat, valores desconhecidos explícitos e limites afetam os dados válidos; a consolidação de histórico aplica o seu próprio limiar de dados desconhecidos. Um passo não necessita de conter uma amostra em bruto individual para deter um valor conhecido.

Os valores de contador convertem-se em taxas com base no tempo decorrido, sujeitos a reinicializações de contadores, rotações de limites e valores máximos. Os medidores instantâneos são igualmente normalizados no tempo. Picos curtos podem ser atenuados ou completamente omitidos pela amostragem; valores sustentados ou alinhados com os limites de passo não sofrem necessariamente redução. As definições de histórico consolidado não conseguem reconstituir detalhes que nunca foram recolhidos ou que se perderam durante a normalização.

## Qual o relógio que decide

Para a recolha comum através de `cmd.php`, a instrução SQL `CURRENT_TIMESTAMP()` fornece o carimbo de data/hora de saída na inserção de um lote. Não se trata de um carimbo fornecido pelo dispositivo nem de uma medição exata do momento em que o dispositivo respondeu. Outros motores de recolha e caminhos em tempo real devem ser verificados separadamente.

O recolhedor PHP coloca os resultados em memória intermédia e grava-os em lotes, descarregando-os perante uma mudança de dispositivo ou quando a memória se esgota. O carimbo de data/hora é avaliado uma vez por lote, pelo que todos os valores de um lote recebem exatamente a mesma marca temporal.

As consequências não são evidentes, pelo que se justifica explicá-las em pormenor.

**O relógio do dispositivo não atribui o carimbo a estas amostras SNMP.** O recolhedor utiliza a hora de inserção na base de dados. A hora do dispositivo pode ainda ter relevância para um script ou para a interpretação de uma métrica particular, o que não justifica negligenciar a sincronização horária.

**Um relógio incorreto no recolhedor ou na sua base de dados desloca os dados.** Os valores ficam registados nos intervalos temporais errados e, num ficheiro já parcialmente escrito, qualquer atualização cuja hora não seja posterior à última é categoricamente recusada. Se os carimbos recuarem para trás da última atualização do ficheiro, as novas atualizações não farão avançar o ficheiro até que os seus carimbos superem esse marco. Verifique o relógio da base de dados, o relógio do recolhedor e o carimbo do ficheiro; alterar apenas o relógio do recolhedor não muda necessariamente os carimbos gerados pela base de dados.

**O tempo dentro de um ciclo transforma-se em flutuação.** Um dispositivo consultado no fim de um processamento longo recebe um carimbo posterior ao de um consultado no início, mesmo pertencendo ambos ao mesmo ciclo. Num recolhedor sobrecarregado, essa flutuação pode constituir uma fração substancial do intervalo e é uma das razões pelas quais um heartbeat configurado de forma demasiado restrita gera falhas.

**O fuso horário da base de dados situa-se a meio do processo.** O carimbo é escrito como carimbo da base de dados e reconvertido em hora absoluta pela base de dados durante a leitura. Um tratamento inconsistente de fusos horários de sessão pode alterar essa interpretação. Verifique os parâmetros de sessão de escrita e leitura e a conversão de época; mudar unicamente o fuso horário de visualização não prova que os dados armazenados se tenham deslocado.

## As leituras são agrupadas por carimbo de data/hora

Uma fonte de dados com múltiplos campos, como uma interface com bytes de entrada e bytes de saída, pode utilizar tarefas SNMP separadas ou um script que devolve vários valores nomeados. Os campos processados são agrupados por fonte de dados e carimbo de data/hora para atualização do RRD.

Um conjunto incompleto é retido em vez de gravado parcialmente, até que o número previsto de campos seja satisfeito. Trata-se de uma verificação de integridade e não de uma garantia de validade numérica; valores explicitamente desconhecidos continuam a poder ser gravados. Normalmente ambas as metades encontram-se no mesmo lote e partilham o carimbo, tornando o processo impercetível. Lotes inseridos no mesmo segundo podem igualmente coincidir. Se os campos receberem carimbos distintos, os grupos podem permanecer incompletos e não gerar atualizações. O código atual retém grupos incompletos entre ciclos, registando um aviso e eliminando-os após `5 * max(60, poller_interval)` segundos. O limite de página de leitura é expandido para incluir o seu último grupo de carimbos temporais.

As atualizações são também ordenadas por ordem cronológica ascendente antes da escrita, dado que um ficheiro não aceita valores mais antigos do que a sua última atualização.

## As escritas diferidas mantêm os seus carimbos de data/hora

Quando as escritas no RRD são diferidas e aplicadas em lote mais tarde, o carimbo de data/hora registado acompanha o valor e o lote é gravado por ordem cronológica. Um carimbo do meio-dia é mantido quando a atualização é tentada à uma hora; não é substituído pela hora de descarregamento da memória. O RRDtool normaliza sempre as atualizações aceites nos seus limites de passo.

Uma fila de espera pode fazer avançar um ficheiro através de carimbos mais recentes do que a sua última atualização. Não consegue, contudo, preencher retroativamente falhas anteriores a esse carimbo. O módulo Boost filtra amostras com data igual ou anterior à última atualização do ficheiro; uma fila esvaziada não prova que todas as amostras foram aplicadas. Consulte [Escritas de elevado volume](/pt-pt/concepts/high-volume-writes/) e o [guia de atualização do RRDtool](https://oss.oetiker.ch/rrdtool/doc/rrdupdate.en.html). As escritas diferidas dependem de um armazenamento bem-sucedido e de uma ordenação temporal válida; não garantem a recuperação perante qualquer anomalia. Inspecione os dados retidos e rejeitados quando a fila de espera não diminuir.

## Quando o ciclo não termina

O recolhedor PHP verifica o tempo de execução decorrido entre tarefas e encerra o ciclo de elementos assim que este excede o intervalo de recolha, registando um aviso. Não se trata de uma interrupção brusca no prazo estrito: uma operação em curso pode prolongar-se antes dessa verificação. Os elementos não alcançados não produzem valores nesse ciclo. Uma falha entre atualizações válidas pode ser atenuada se o heartbeat e os limiares de histórico consolidado o permitirem. Excedimentos repetidos constituem motivo para investigar capacidade, tempos limite e erros de recolha, não prova de que todas as falhas tenham a mesma causa.

[Dimensionar o recolhedor](/pt-pt/guides/scale-the-poller/) aborda as medidas a tomar. A ordenação de uma execução e os mecanismos de proteção constam de [Ciclo de vida do recolhedor](/pt-pt/reference/poller-lifecycle/).
