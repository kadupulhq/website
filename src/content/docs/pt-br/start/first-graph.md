---
title: Interpretar o primeiro gráfico
description: O que as linhas realmente significam, e os três erros que levam as pessoas a interpretá-las mal.
sidebar:
  order: 4
banner:
  content: O Kadupul está em pré-alfa. Valide estes procedimentos em uma instalação de teste isolada. Tradução em rascunho, pendente de revisão por uma pessoa fluente no idioma.
---

Um gráfico aqui não é uma imagem dos seus dados. É uma imagem de um resumo dos seus dados, e importa saber de qual resumo se trata.

## O que você está vendo

Cada gráfico é gerado a partir de um arquivo circular (round-robin archive). O arquivo armazena amostras recentes com resolução total e amostras mais antigas consolidadas em intervalos mais amplos. Quando você afasta o zoom para um ano, não está vendo cada amostra de cinco minutos. Você está vendo um único valor por intervalo, escolhido por uma função de consolidação.

Essa função geralmente é a média. Também pode ser o máximo ou o mínimo. Isso importa mais do que qualquer outra coisa nesta página.

Para uma solicitação comum de gráfico sob demanda, o Kadupul monta um comando do RRDtool a partir da configuração do gráfico e o executa sobre os arquivos em disco. Três tipos de linhas compõem esse comando e é útil saber distinguir cada uma.

| Parte | O que faz |
|---|---|
| Uma definição | Identifica um arquivo, uma fonte de dados no seu interior e uma função de consolidação |
| Um item de desenho | Transforma uma série em uma linha, em uma área ou em uma faixa empilhada |
| Um item de legenda | Imprime um número, calculado sobre a janela de tempo visualizada |

Todo o mecanismo é descrito em [Como os gráficos são desenhados](/pt-br/concepts/how-graphs-are-drawn/). Você não precisa dele hoje. Precisa apenas saber que a definição do gráfico e o intervalo de tempo solicitado determinam a imagem. O processamento em cache e as rotas de gráficos em tempo real podem se comportar de maneira diferente.

## Comece pelas últimas quatro horas

Comece com uma janela recente curta. O arquivo selecionado depende da retenção, do intervalo de passo e da resolução do gráfico; quatro horas não garantem dados brutos ou não consolidados. Mesmo o arquivo mais detalhado contém valores normalizados no tempo. Use o comando de depuração do gráfico e `rrdtool info` para verificar a função solicitada e os passos de arquivo disponíveis antes de comparar valores.

Duas características de um gráfico recente são normais e costumam alarmar os usuários.

**A linha pode terminar antes do momento atual.** O intervalo atual pode estar incompleto. O momento da coleta, o buffer e a normalização também podem atrasar o ponto final visível. Verifique o avanço dos carimbos de data/hora de atualização em vez de assumir um atraso fixo como prova de bom funcionamento.

**O primeiro trecho pode estar ausente.** Uma fonte de dados criada há uma hora tem uma hora de dados e onze meses de nada. O arquivo é totalmente alocado na sua criação, portanto a parte vazia é armazenamento real aguardando para ser utilizado.

## Em seguida, amplie o intervalo e observe a mudança do pico

Amplie o intervalo para uma semana. Os picos podem diminuir quando o gráfico seleciona médias mais amplas. Por exemplo, se a utilização for de 100% durante cinco minutos e zero nos 55 minutos restantes, a média por hora é de cerca de 8,3%. Um pico de quatro minutos em uma hora sem outra atividade atinge uma média de cerca de 6,7%. Picos curtos já podem ter sido suavizados dentro do intervalo original de amostragem.

A consolidação descarta detalhes. Se o histórico de alta resolução já expirou, aproximar o zoom novamente não conseguirá reconstruí-lo a partir de um arquivo de médias.

Este é o primeiro dos três erros, e o que gera mais discussões.

**Interpretar uma média como um pico.** Se a saturação é o seu foco, consulte um gráfico construído com base no máximo, e não na média. Isso só funciona se os arquivos guardarem máximos. Se restarem apenas médias amplas, os picos originais não poderão ser reconstruídos. Um arquivo MAX preserva os máximos dos seus pontos de entrada normalizados no tempo, e não um pico instantâneo não observado entre coletas.

Existe aqui uma falha silenciosa que vale a pena conhecer. Se um item de gráfico solicitar máximos e o arquivo não os tiver, o assistente de seleção do Kadupul pode recorrer à primeira função disponível, ou a AVERAGE quando não conseguir determinar as funções disponíveis. A imagem parece correta, mas está respondendo a uma pergunta diferente.

**Interpretar uma lacuna como zero.** Uma lacuna representa um valor plotado desconhecido. Entre as causas estão atualizações ausentes, entradas explicitamente desconhecidas, valores rejeitados e expressões do gráfico. Isso não identifica exclusivamente um dispositivo indisponível.

O heartbeat é o tempo máximo permitido entre atualizações, e não tempo extra somado ao passo. Por exemplo, um passo de 300 segundos com um heartbeat de 600 segundos permite no máximo 600 segundos entre atualizações, e não 900. Os limites de dados desconhecidos do arquivo também afetam as lacunas visíveis. Consulte [Definições de fontes de dados do RRDtool](https://oss.oetiker.ch/rrdtool/doc/rrdcreate.en.html) e [Tempo e intervalos](/pt-br/concepts/time-and-intervals/).

Tenha cuidado com gráficos empilhados aqui. Alguns templates substituem valores desconhecidos por zero em suas expressões de gráfico. Nesses gráficos, uma interrupção e um período de inatividade aparentam ser idênticos por design. Verifique uma visão não empilhada antes de concluir que um serviço parou.

**Comparar dois gráficos com escalas verticais diferentes.** Dois gráficos lado a lado ajustam sua escala aos respectivos dados. Uma pequena elevação e uma grande oscilação podem parecer idênticas. Verifique o eixo antes de tirar conclusões.

Enquanto você analisa o eixo, confirme a sua base. Um gráfico pode etiquetar em milhares ou em unidades de 1024. Os números armazenados são idênticos; apenas as etiquetas mudam. A diferença depende do prefixo: 1024 contra 1000 representa 2,4% para uma potência e se amplia em prefixos maiores. Verifique também bits contra bytes, expressões de gráfico e consolidação; uma diferença percentual isolada não identifica a causa.

## Leitura da legenda

A legenda contém os números que importam mais do que a forma. O valor atual geralmente é a redução LAST da série selecionada, que não precisa ser uma medição realizada no instante exato em que você visualiza o gráfico. A média e o máximo são calculados ao longo do intervalo que você está vendo, e não de todo o histórico, portanto mudam conforme você aproxima ou afasta o zoom.

As entradas de legenda fornecidas são mínimo, máximo, média e último, rotulado como atual. Dois aspectos sobre elas costumam surpreender.

**Um número da legenda é uma redução daquilo que foi desenhado, não do que foi armazenado.** Um máximo exibido sobre uma série lida com médias é o máximo dessas médias derivadas na resolução selecionada. Não é a maior amostra já registrada. Em um link congestionado são números muito diferentes, e ambos são respostas legítimas a perguntas distintas.

**Verifique qual série a legenda utiliza.** Entradas simples de GPRINT podem herdar a série de um item desenhado precedente; itens dedicados de mínimo, máximo, média e último têm tratamento separado. Reordenar itens em um template de gráfico pode, portanto, alterar o que a legenda relata sem que ninguém tenha editado a legenda. Se um número mudar após uma edição de template não relacionada, verifique primeiro a ordem dos itens.

## Quando um gráfico parece incorreto

Verifique a cadeia de coleta nesta ordem; mais de uma etapa pode apresentar falha.

1. O dispositivo está respondendo agora?
2. O poller está rodando e concluindo dentro do seu intervalo?
3. O arquivo RRD tem uma data de atualização recente?
4. O gráfico está lendo a fonte de dados que você imagina?

Na prática:

**Passo 1.** Execute o mesmo comando `snmpget` que você executou ao adicionar o dispositivo, a partir do coletor atribuído. Se falhar, resolva essa falha de coleta antes de avaliar o gráfico.

**Passo 2.** Procure o resumo de conclusão de execução. Se estiver ausente, verifique o agendamento, o destino configurado do log e falhas prematuras do poller. Uma execução mais longa do que o intervalo pode atrasar atualizações; compare a lacuna de atualização resultante com o heartbeat.

**Passo 3.** Pergunte diretamente ao RRDtool:

```bash
rrdtool last /path/to/rra/the_file.rrd
rrdtool info /path/to/rra/the_file.rrd
```

`last` indica o carimbo de data/hora da última atualização, incluindo atualizações com valores desconhecidos; a escrita em buffer pode atrasá-lo. Use `lastupdate` e `fetch` para inspecionar os valores conforme descrito no guia do dispositivo. `info` informa o passo, o heartbeat, o tipo de fonte de dados e quais arquivos existem. Se o arquivo não tiver um arquivo de máximos, isso esclarece a dúvida acima sobre os picos.

**Passo 4.** Ative o modo de depuração do gráfico e examine o comando gerado. Ele lista os arquivos, as fontes de dados dentro deles e a função de consolidação de cada uma. É comum um gráfico apontar para uma fonte de dados diferente da esperada após a reaplicação de templates ou reindexação de interfaces.

## Sintomas e o que costumam significar

| O que você vê | Geralmente |
|---|---|
| Linha plana no zero | Pode ser um zero real ou uma expressão substituindo valores desconhecidos por zero |
| A linha para e depois continua | Um valor desconhecido interrompeu a série plotada; verifique a coleta e as expressões do gráfico |
| Pequenas lacunas constantes | O poller termina com atraso ou o heartbeat foi configurado muito próximo do passo |
| Pico visível em quatro horas, ausente em uma semana | Verifique a resolução do arquivo e a consolidação antes de assumir perda de dados ou falha de coleta |
| Máximo na legenda menor que o pico desenhado | A legenda está reduzindo uma série diferente da esperada |
| Gráfico inteiro vazio, sem erro | Nenhuma fonte de dados associada, ou ainda nada foi coletado |
| Valores com ordem de grandeza incorreta | Tipo de fonte de dados errado ou contadores de 32 bits estourando |
| Dois gráficos do mesmo link divergem ligeiramente | Base de eixo diferente ou consolidação distinta |

[Solução de problemas de dados ausentes](/pt-br/guides/troubleshoot-missing-data/) aborda o mesmo processo mais detalhadamente. [Ajustar a aparência dos gráficos](/pt-br/guides/tune-graph-appearance/) explica como alterar o visual de um gráfico assim que você confiar nas informações exibidas.

Este é o tutorial. Você tem uma instalação pronta, um dispositivo que responde e um gráfico legível. A partir daqui, os [Guias práticos](/pt-br/guides/monitor-a-switch/) cobrem tarefas específicas e os [Conceitos](/pt-br/concepts/architecture/) explicam por que o sistema se comporta desta maneira.
