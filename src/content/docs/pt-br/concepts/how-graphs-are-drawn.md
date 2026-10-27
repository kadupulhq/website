---
title: Como os gráficos são desenhados
description: O percurso desde um arquivo round-robin até a imagem renderizada e por que os mesmos números armazenados podem produzir imagens muito diferentes.
sidebar:
  order: 4
banner:
  content: O Kadupul está em pré-alfa. Valide estes procedimentos em uma instalação de teste isolada. Tradução em rascunho, pendente de revisão por uma pessoa fluente no idioma.
---

Uma solicitação comum de imagem pode compor um comando do RRDtool a partir da configuração do gráfico e ler os arquivos RRD referenciados. Uma imagem em cache válida também pode atender à solicitação, e o processamento Boost sob demanda pode atualizar arquivos antes da renderização. Consulte [Gravações em alto volume](/pt-br/concepts/high-volume-writes/) para limites de atualização de dados.

## A ordem das operações

Para uma solicitação que avança para a geração de comandos:

1. Resolver a janela de tempo solicitada e a configuração do gráfico.
2. Estimar a resolução a partir dos perfis do banco de dados e selecionar funções de consolidação.
3. Emitir referências `DEF` deduplicadas para os campos e funções necessários.
4. Emitir expressões `CDEF` e `VDEF` referenciadas.
5. Emitir itens de desenho e impressão na sequência configurada, com as opções e alterações de plugins aplicáveis.
6. Permitir que o RRDtool leia os arquivos reais e renderize o resultado.

## Escolha de um arquivo

O Kadupul consulta as linhas de perfil do banco de dados ao calcular as extensões dos arquivos e as opções de gráficos. Sua estimativa automática considera passo vezes passos vezes linhas, a cobertura solicitada e a contagem de passos do arquivo; a seleção explícita de arquivos segue um procedimento separado. Esses cálculos de perfil não inspecionam cada arquivo físico em cada suporte e podem divergir dos arquivos existentes após uma alteração de perfil.

A instrução `DEF` gerada especifica o arquivo, o nome da fonte de dados e a função de consolidação. O RRDtool seleciona um arquivo disponível em uma resolução adequada e pode consolidar ainda mais os dados em função da largura do gráfico e da janela de tempo. A estimativa da aplicação não garante que um arquivo físico específico seja lido. Consulte a [documentação de definição de dados do RRDtool](https://oss.oetiker.ch/rrdtool/doc/rrdgraph_data.en.html).

Alargar uma janela ou alterar a largura da imagem pode modificar a resolução exibida. Uma série mais genérica baseada em médias pode ocultar um pico breve mesmo que um arquivo mais detalhado o preserve. Compare a organização física do arquivo e o comando, e não apenas o perfil. Consulte [Fontes de dados e arquivos round-robin](/pt-br/concepts/data-sources-and-rras/).

Quando quem invoca não indica uma hora de término, o renderizador habitual utiliza inicialmente o deslocamento da última execução do poller principal em relação a agora, recorrendo ao intervalo de coleta se esse valor não estiver disponível ou estiver no futuro. O código posterior dispõe igualmente de um recurso baseado em intervalo consolidado, embora não constitua uma regra universal. Uma hora de término explícita sobrepõe-se a essa inicialização; um gráfico que termina antes de agora não comprova por si só o arquivo selecionado nem que as amostras mais recentes foram gravadas.

## Os itens

Um gráfico é uma lista ordenada de itens. A geração de comandos pode omitir itens, reutilizar definições ou expandir um item em várias instruções. A ordem de desenho é relevante para além da mera disposição visual.

| Item | Desenha | Notas |
|---|---|---|
| `AREA` | Região preenchida a partir do eixo até o valor | Áreas posteriores sobrepõem-se às anteriores |
| `STACK` | Região preenchida a partir do topo do item anterior | Emitida como área com sinalizador de empilhamento |
| `LINE1`, `LINE2`, `LINE3` | Uma linha com um, dois ou três pixels de largura | Pode ser tracejada |
| `LINE:STACK` | Uma linha desenhada no topo do total empilhado acumulado | |
| `TICK` | Marcas ao longo de uma borda do gráfico | Útil para estados, não para grandezas |
| `GPRINT` | Nada. Imprime um número na legenda | |
| `COMMENT` | Nada. Imprime texto literal na legenda | Comentários longos quebram linhas |
| `HRULE` | Uma linha horizontal em um valor fixo | |
| `VRULE` | Uma linha vertical em um instante fixo | |
| `TEXTALIGN` | Nada. Define o alinhamento para o texto de legenda seguinte | |

A lista integral, incluindo quais colunas de configuração aplicam-se a cada tipo, encontra-se em [Itens de gráfico](/pt-br/reference/graph-items/).

`AREA` e `STACK` são a combinação onde ocorrem mais equívocos. Uma área tem início no zero, de modo que duas áreas se sobrepõem e a mais alta oculta a mais baixa. Um empilhamento começa no ponto onde o item anterior terminou, de modo que a altura visível da segunda faixa corresponde ao seu valor, mas seu topo marca o total. Um gráfico empilhado deve ser interpretado como a altura de uma faixa e não como uma posição no eixo Y, sob pena de interpretar incorretamente todas as séries exceto a inferior.

`HRULE` aceita um valor que pode conter substituições de modelos. Caracteres não numéricos são removidos do resultado final e, se nada numérico restar, a linha é desenhada no zero em vez de cancelar a renderização. Uma linha no zero pode ser intencional ou resultar de uma substituição com falha. Inspecione o comando resolvido antes de determinar a causa. O filtro numérico também pode modificar cadeias com unidades ou formatos não suportados.

`VRULE` aceita um carimbo Unix ou um par `hours:minutes`. Um valor de horas negativo é interpretado como um deslocamento retroativo em relação a agora e não como uma hora do relógio.

## Duas funções, uma palavra

A expressão função de consolidação é utilizada para duas finalidades distintas, e os mesmos quatro nomes, `AVERAGE`, `MIN`, `MAX` e `LAST`, surgem em ambos os casos.

A primeira função é a seleção de arquivo. Um comando `DEF` indica um arquivo, uma fonte de dados em seu interior e uma função de consolidação. Essa função delimita a família de arquivos pretendida. Ao solicitar `MAX`, o RRDtool necessita de dados consolidados armazenados correspondentes, sujeitos ao recurso de contingência descrito abaixo e à seleção de resolução.

A segunda função é a aritmética da legenda. Uma instrução `GPRINT` sintetiza toda a janela desenhada em um único número impresso, e sua função determina o método de cálculo. Essa redução processa-se sobre a série já obtida; trata-se de agregação de apresentação e não de armazenamento em disco.

Deste modo, um `GPRINT` que apresente `MAX` sobre um `DEF` lido com `AVERAGE` imprimirá o valor mais elevado dessa série de médias na janela renderizada, não necessariamente a amostra bruta mais alta. Cinco minutos é apenas um exemplo; a resolução efetiva varia. São valores numéricos distintos e, em uma conexão com tráfego intenso, diferem substancialmente. Ambas as leituras são legítimas. É provável que apenas uma traduza seu objetivo.

## O recurso silencioso

Para os tipos de itens que utilizam o assistente de escolha ótima de função, o Kadupul consulta as funções de consolidação do arquivo e aplica a solicitada caso exista, ou a primeira identificada em caso contrário. Se nenhuma for obtida para uma fonte de dados local válida, o assistente recorre a AVERAGE. As variantes fixas de GPRINT seguem um caminho separado e não utilizam este assistente, de modo que não há garantia geral de que qualquer função ausente seja suprida.

Um item de desenho que solicite `MAX` pode, portanto, acabar lendo médias se seu arquivo contiver apenas arquivos AVERAGE. Inspecione o `DEF` gerado e a saída de `rrdtool info`. A manutenção de arquivos pode alterar uma estrutura existente, mas acrescentar um arquivo não reconstitui picos históricos descartados por apurações de média anteriores. Consulte [Gerenciar retenção de dados](/pt-br/guides/manage-data-retention/).

## O GPRINT herda o arquivo do vizinho

Um `GPRINT` comum não possui arquivo próprio. Ele herda a função de consolidação do item compatível mais recente de tipo `AREA`, `STACK`, linha ou `TICK`, associado por nome de fonte de dados e identificador local do campo de modelo. Se não houver correspondência anterior, recorre ao assistente de escolha de função com sua própria função configurada. Variantes fixas utilizam sua função configurada de forma direta.

Isso significa que reordenar itens em um modelo de gráfico pode alterar o que uma legenda indica sem que ninguém tenha editado a legenda. Coloque uma `LINE` com leitura `MAX` acima do bloco `GPRINT` e as legendas associadas resumirão valores máximos. Mova-a para baixo e o item coincidente anterior, ou o recurso padrão, definirá a série de entrada. Se um valor na legenda mudar após uma edição não relacionada no modelo, confirme primeiro a ordem dos itens.

## CDEFs e VDEFs

Ambos transformam dados antes de serem desenhados. Não são intercambiáveis.

| | CDEF | VDEF |
|---|---|---|
| Produz | Uma série temporal, um valor por intervalo | Um valor escalar e, para certas funções, uma hora associada |
| Pode ser desenhado como linha ou área | Sim | Um escalar pode fornecer um nível constante |
| Composto por | Funções, operadores aritméticos, outros CDEFs, fontes de dados especiais, literais | Uma função aplicada a uma única referência |
| Encadeamento | Um CDEF pode referenciar outro CDEF | Um VDEF não pode incluir operações aritméticas |

Um CDEF é uma expressão em pilha avaliada em notação polonesa reversa. O vocabulário de operadores é extenso e detalha-se na íntegra em [Itens de gráfico](/pt-br/reference/graph-items/): aritmética, operadores condicionais e de comparação, trigonometria, agregação entre fontes de dados, operações sobre a pilha e funções de tempo que indicam a posição no eixo X. `UN` e `UNKN` devem ser aprendidos com brevidade. Substituir valores desconhecidos por zero evita descontinuidades visuais, mas oculta medições ausentes; assuma explicitamente essa opção de apresentação.

Os CDEFs também leem referências especiais em vez de um nome fixo de fonte de dados. Uma delas resolve para a fonte de dados do item atual, permitindo reutilizar um único CDEF em todos os itens de um modelo. Outras resolvem para todas as fontes do gráfico, ou para fontes análogas, viabilizando a criação de uma linha de total sem enumerar individualmente suas parcelas.

Um VDEF reduz uma série a um valor escalar: máximo, mínimo, média, desvio padrão, primeiro valor, último valor, total, um percentil ou a inclinação, intercepto e correlação de uma regressão linear. O RRDtool não suporta aritmética dentro de um VDEF; se um VDEF necessitar de uma entrada calculada, o Kadupul constrói-a sobre o CDEF do item em vez de fazê-lo sobre a fonte bruta. Esse é o caminho previsto: realize os cálculos em um CDEF e reduza-os subsequentemente em um VDEF.

Um `GPRINT` sustentado por um VDEF não necessita de argumento de função de consolidação: o VDEF já forneceu a redução pretendida. Os VDEFs também podem fornecer valores escalares para traçado; o RRDtool suporta linhas baseadas em VDEF. Consulte a [documentação de elementos gráficos](https://oss.oetiker.ch/rrdtool/doc/rrdgraph_graph.en.html).

A exportação para CSV seleciona tipos de desenho suportados sob a forma de colunas de séries; itens de legenda não são exportados como colunas equivalentes. Ao contrário do que constava em descrições anteriores, o código atual não ignora genericamente itens de desenho apoiados em VDEF. Pode chegar a emitir um comando `XPORT` inválido de um VDEF escalar: um teste isolado no RRDtool desenha uma linha VDEF com sucesso, mas rejeita essa exportação. Consulte o [defeito da aplicação #273](https://github.com/kadupulhq/kadupul/issues/273). Utilize itens de desenho sustentados por séries para exportação e verifique as colunas geradas.

## Por que os mesmos dados parecem diferentes

Todas as opções abaixo alteram a imagem visualizada sem alterar uma única amostra registrada.

| Opção | Efeito |
|---|---|
| Duração da janela e largura da imagem | Pode alterar a seleção do arquivo e a consolidação adicional |
| Função de consolidação no `DEF` | Lê picos, mínimos, médias ou últimos valores |
| Falta de uma função de consolidação | Alguns circuitos substituem outra função; outros podem falhar |
| `AREA` versus `STACK` | Alturas absolutas versus alturas acumuladas |
| Ordem dos itens | Sobreposição, ordem de empilhamento e arquivo que o `GPRINT` herda |
| Base 1000 ou 1024 | Altera a rotulagem do eixo. Os valores são idênticos |
| Modo de escala automática, limites rígidos, escala logarítmica | Altera o eixo Y, modificando a percepção visual da dimensão |

Quando os gráficos divergirem, compare os comandos gerados, as identidades e disposições dos arquivos físicos, o estado do cache e a atualidade das amostras. Essas verificações de apresentação são úteis, mas não dispensam a análise de eventuais falhas de coleta, armazenamento ou mapeamento. Para um procedimento estruturado sobre essa verificação, consulte [Solucionar problemas de dados ausentes](/pt-br/guides/troubleshoot-missing-data/).
