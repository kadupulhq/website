---
title: Interpretar o primeiro gráfico
description: O que as linhas realmente significam, e os três erros que levam as pessoas a interpretá-las mal.
sidebar:
  order: 4
banner:
  content: O Kadupul está em pré-alfa. Valide estes procedimentos numa instalação de teste isolada. Tradução em rascunho, pendente de revisão por uma pessoa fluente no idioma.
---

Um gráfico aqui não é uma imagem dos seus dados. É uma imagem de um resumo dos seus dados, e importa saber de que resumo se trata.

## O que está a ver

Cada gráfico é traçado a partir de um ficheiro circular RRD (round-robin archive). O ficheiro armazena amostras recentes com resolução total e amostras mais antigas consolidadas em intervalos mais amplos. Quando afasta o zoom para um ano, não está a ver cada amostra de cinco minutos. Está a ver um único valor por intervalo, escolhido por uma função de consolidação.

Essa função é habitualmente a média. Também pode ser o máximo ou o mínimo. Isto importa mais do que qualquer outra coisa nesta página.

Para um pedido vulgar de gráfico a pedido, o Kadupul monta um comando do RRDtool a partir da configuração do gráfico e executa-o sobre os ficheiros em disco. Três tipos de linhas compõem esse comando e convém saber distinguir cada uma.

| Parte | O que faz |
|---|---|
| Uma definição | Identifica um ficheiro, uma fonte de dados no seu interior e uma função de consolidação |
| Um item de desenho | Transforma uma série numa linha, numa área ou numa faixa empilhada |
| Um item de legenda | Imprime um número, calculado sobre o intervalo de tempo que está a visualizar |

Todo o mecanismo é descrito em [Como os gráficos são desenhados](/pt-pt/concepts/how-graphs-are-drawn/). Não precisa dele hoje. Precisa de saber que a definição do gráfico e o intervalo de tempo pedido determinam a imagem. O processamento em cache e os fluxos de gráficos em tempo real podem comportar-se de forma diferente.

## Comece pelas últimas quatro horas

Comece com uma janela recente reduzida. A consolidação selecionada depende da retenção, do passo e da resolução do gráfico; quatro horas não garantem dados em bruto ou não consolidados. Mesmo a consolidação mais detalhada contém valores normalizados no tempo. Utilize o comando de depuração do gráfico e `rrdtool info` para verificar a função pedida e os passos de consolidação disponíveis antes de comparar valores.

Duas características de um gráfico recente são normais e costumam alarmar os utilizadores.

**A linha pode terminar antes do momento atual.** O intervalo atual pode estar incompleto. A temporização da recolha, o buffer e a normalização também podem atrasar o ponto final visível. Verifique o avanço dos carimbos de data/hora de atualização em vez de assumir um atraso fixo como prova de bom funcionamento.

**O primeiro segmento pode estar em falta.** Uma fonte de dados criada há uma hora tem uma hora de dados e onze meses de nada. O ficheiro é totalmente alocado na sua criação, pelo que a parte vazia é armazenamento real à espera de ser utilizado.

## Depois alargue o intervalo e observe a mudança do pico

Alargue o intervalo para uma semana. Os picos podem diminuir quando o gráfico seleciona médias mais amplas. Por exemplo, se a utilização for de 100% durante cinco minutos e zero nos restantes 55 minutos, a média horária é de cerca de 8,3%. Um pico de quatro minutos numa hora sem outra atividade atinge uma média de cerca de 6,7%. Picos de curta duração já podem ter sido suavizados dentro do intervalo original de amostragem.

A consolidação descarta detalhes. Se o histórico de alta resolução já expirou, aproximar novamente o zoom não o conseguirá reconstruir a partir de médias consolidadas.

Este é o primeiro de três erros, e aquele que motiva mais discussões.

**Interpretar uma média como um pico.** Se a saturação lhe interessa, consulte um gráfico construído com base no máximo, e não na média. Isso só funciona se as consolidações guardarem máximos. Se apenas restarem médias amplas, os picos originais não podem ser reconstruídos. Uma consolidação MAX preserva os máximos dos seus pontos de entrada normalizados no tempo, e não um pico instantâneo não observado entre sondagens.

Existe aqui uma falha silenciosa que convém conhecer. Se um item de gráfico pedir máximos e o ficheiro não os tiver, o assistente de seleção do Kadupul pode recorrer à primeira função disponível, ou a AVERAGE quando não conseguir determinar as funções disponíveis. A imagem parece correta, mas está a responder a uma pergunta diferente.

**Interpretar uma falha como um zero.** Um intervalo vazio representa um valor traçado desconhecido. Entre as causas contam-se atualizações em falta, entradas explicitamente desconhecidas, valores rejeitados e expressões do gráfico. Não identifica exclusivamente um dispositivo indisponível.

O heartbeat é o tempo máximo permitido entre atualizações, e não tempo adicional somado ao passo. Por exemplo, um passo de 300 segundos com um heartbeat de 600 segundos permite no máximo 600 segundos entre atualizações, e não 900. Os limiares de dados desconhecidos da consolidação também afetam os intervalos visíveis. Consulte [Definições de fontes de dados do RRDtool](https://oss.oetiker.ch/rrdtool/doc/rrdcreate.en.html) e [Tempo e intervalos](/pt-pt/concepts/time-and-intervals/).

Tenha atenção aos gráficos empilhados neste contexto. Alguns modelos substituem valores desconhecidos por zero nas suas expressões de gráfico. Nesses gráficos, uma interrupção e um período de inatividade aparentam ser idênticos por conceção. Verifique uma vista não empilhada antes de concluir que um serviço ficou inativo.

**Comparar dois gráficos com escalas verticais diferentes.** Dois gráficos lado a lado ajustam a sua escala aos respetivos dados. Uma oscilação pequena e uma grande podem parecer idênticas. Verifique a escala do eixo antes de tirar conclusões.

Enquanto analisa o eixo, confirme a sua base. Um gráfico pode etiquetar em milhares ou em unidades de 1024. Os números guardados são idênticos; apenas as etiquetas mudam. A diferença depende do prefixo: 1024 face a 1000 representa 2,4% para uma potência e agrava-se em prefixos maiores. Confirme também bits face a bytes, expressões de gráficos e consolidação; uma diferença percentual por si só não identifica a causa.

## Ler a legenda

A legenda contém os números que importam mais do que a forma. O valor «Current» é habitualmente a redução LAST da série selecionada, que não tem de ser uma medição realizada no instante exato em que visualiza o gráfico. A média e o máximo são calculados ao longo do intervalo que está a ver, e não de todo o histórico, pelo que mudam consoante aproxima ou afasta o zoom.

As entradas de legenda fornecidas são mínimo, máximo, média e último, etiquetado como current. Dois aspetos sobre as mesmas costumam surpreender.

**Um número de legenda é uma redução daquilo que foi desenhado, e não do que foi armazenado.** Um máximo apresentado sobre uma série lida com médias é o máximo dessas médias derivadas à resolução selecionada. Não é a maior amostra alguma vez registada. Numa ligação com muito tráfego são valores muito distintos, e ambos são respostas legítimas a perguntas diferentes.

**Verifique que série a legenda utiliza.** Entradas simples de GPRINT podem herdar a série de um item desenhado precedente; itens dedicados de mínimo, máximo, média e último têm um tratamento em separado. Reordenar itens num modelo de gráfico pode, portanto, alterar o que a legenda reporta sem que ninguém tenha editado a legenda. Se um número mudar após uma edição de modelo não relacionada, verifique primeiro a ordem dos itens.

## Quando um gráfico parece incorreto

Verifique a cadeia de recolha por esta ordem; mais do que uma etapa pode ter uma anomalia.

1. O dispositivo está a responder neste momento?
2. O sondador está a correr e conclui dentro do seu intervalo?
3. O ficheiro RRD tem uma data de atualização recente?
4. O gráfico está a ler a fonte de dados que presume?

Concretamente:

**Passo 1.** Execute o mesmo comando `snmpget` que executou quando adicionou o dispositivo, a partir do recolhedor atribuído. Se falhar, resolva essa falha de recolha antes de avaliar o gráfico.

**Passo 2.** Procure o resumo de conclusão. Se estiver em falta, verifique o agendamento, o destino configurado do registo e falhas prematuras do sondador. Uma execução mais longa do que o intervalo pode atrasar atualizações; compare o intervalo de atualização resultante com o heartbeat.

**Passo 3.** Pergunte diretamente ao RRDtool:

```bash
rrdtool last /path/to/rra/the_file.rrd
rrdtool info /path/to/rra/the_file.rrd
```

`last` indica o carimbo de data/hora da última atualização, incluindo atualizações com valores desconhecidos; a escrita em memória intermédia pode atrasá-lo. Utilize `lastupdate` e `fetch` para inspecionar valores conforme descrito no guia do dispositivo. `info` indica-lhe o passo, o heartbeat, o tipo de fonte de dados e quais as consolidações existentes. Se o ficheiro não possuir uma consolidação de máximos, isso esclarece a questão colocada acima sobre os picos.

**Passo 4.** Ative o modo de depuração do gráfico e examine o comando que o gráfico produz. Este indica os ficheiros, as fontes de dados no seu interior e a função de consolidação para cada uma. É comum um gráfico apontar para uma fonte de dados diferente da que presume após reaplicação de modelos ou reindexação de interfaces.

## Sintomas e o que costumam significar

| O que vê | Habitualmente |
|---|---|
| Linha plana no zero | Pode ser um zero real ou uma expressão que substitui valores desconhecidos por zero |
| A linha interrompe-se e depois continua | Um valor desconhecido interrompeu a série traçada; verifique a recolha e as expressões do gráfico |
| Pequenos intervalos ao longo do gráfico | O sondador termina fora do prazo ou o heartbeat foi definido demasiado perto do passo |
| Pico visível a quatro horas, ausente a uma semana | Verifique a resolução da consolidação e a consolidação antes de assumir perda de dados ou falha de recolha |
| Máximo na legenda inferior ao pico desenhado | A legenda está a reduzir uma série diferente da que pensa |
| Gráfico inteiro vazio, sem erro | Nenhuma fonte de dados associada, ou ainda nada foi recolhido |
| Valores com uma ordem de grandeza desfasada | Tipo de fonte de dados errado ou contadores de 32 bits a reiniciar |
| Dois gráficos da mesma ligação divergem ligeiramente | Base de eixo diferente ou consolidação distinta |

[Diagnosticar dados em falta](/pt-pt/guides/troubleshoot-missing-data/) aborda o mesmo processo mais aprofundadamente. [Ajustar a apresentação dos gráficos](/pt-pt/guides/tune-graph-appearance/) explica como alterar o aspeto de um gráfico assim que confiar no que ele indica.

Conclui-se assim o tutorial. Tem uma instalação, um dispositivo que responde e um gráfico legível. A partir daqui, os [Guias práticos](/pt-pt/guides/monitor-a-switch/) cobrem tarefas específicas e os [Conceitos](/pt-pt/concepts/architecture/) explicam por que razão o sistema funciona deste modo.
