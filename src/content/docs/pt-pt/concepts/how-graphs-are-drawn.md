---
title: Como os gráficos são desenhados
description: O percurso desde um ficheiro round-robin até à imagem renderizada e por que motivo os mesmos números armazenados podem produzir imagens muito distintas.
sidebar:
  order: 4
banner:
  content: O Kadupul está em pré-alfa. Valide estes procedimentos numa instalação de teste isolada. Tradução em rascunho, pendente de revisão por uma pessoa fluente no idioma.
---

Um pedido normal de imagem pode compor um comando do RRDtool a partir da configuração do gráfico e ler os ficheiros RRD referenciados. Uma imagem em cache válida também pode satisfazer o pedido, e o processamento Boost a pedido pode atualizar ficheiros antes da renderização. Consulte [Escritas de elevado volume](/pt-pt/concepts/high-volume-writes/) para limites de atualização de dados.

## A ordem das operações

Para um pedido que avança para a geração de comandos:

1. Resolver a janela temporal pedida e a configuração do gráfico.
2. Estimar a resolução a partir dos perfis da base de dados e selecionar funções de consolidação.
3. Emitir referências `DEF` desduplicadas para os campos e funções necessários.
4. Emitir expressões `CDEF` e `VDEF` referenciadas.
5. Emitir itens de desenho e impressão na sequência configurada, com as opções e alterações de extensões aplicáveis.
6. Permitir que o RRDtool leia os ficheiros reais e renderize o resultado.

## Escolha de um histórico consolidado

O Kadupul consulta as linhas de perfil da base de dados ao calcular as durações dos históricos consolidados e as opções de gráficos. A sua estimativa automática considera passo vezes passos vezes linhas, a cobertura pedida e o número de passos do histórico consolidado; a seleção explícita do histórico consolidado segue um procedimento autónomo. Estes cálculos de perfil não inspecionam cada histórico consolidado físico em cada ficheiro e podem divergir dos ficheiros existentes após uma alteração de perfil.

A instrução `DEF` gerada especifica o ficheiro, o nome da fonte de dados e a função de consolidação. O RRDtool seleciona um histórico consolidado disponível com uma resolução adequada e pode consolidar ainda mais os dados em função da largura do gráfico e da janela temporal. A estimativa da aplicação não garante que um histórico consolidado físico específico seja lido. Consulte a [documentação de definição de dados do RRDtool](https://oss.oetiker.ch/rrdtool/doc/rrdgraph_data.en.html).

Alargar uma janela ou alterar a largura da imagem pode modificar a resolução apresentada. Uma série mais grosseira baseada em médias pode ocultar um pico breve mesmo que um histórico consolidado mais detalhado o preserve. Compare a organização real do ficheiro e o comando, e não apenas o perfil. Consulte [Fontes de dados e históricos consolidados](/pt-pt/concepts/data-sources-and-rras/).

Quando quem invoca não indica uma hora de fim, o gerador habitual utiliza inicialmente o desvio da última execução do recolhedor principal face a agora, recorrendo ao intervalo de recolha se esse valor não estiver disponível ou se encontrar no futuro. O código posterior dispõe igualmente de um recurso baseado em intervalo consolidado, embora não constitua uma regra universal. Uma hora de fim explícita sobrepõe-se a esta inicialização; um gráfico que termina antes de agora não comprova por si só o histórico consolidado selecionado nem que as amostras mais recentes foram escritas.

## Os itens

Um gráfico é uma lista ordenada de itens. A geração de comandos pode omitir itens, reutilizar definições ou expandir um item em várias instruções. A ordem de desenho é relevante para além do mero aspeto visual.

| Item | Desenha | Notas |
|---|---|---|
| `AREA` | Região preenchida desde o eixo até ao valor | Áreas posteriores sobrepõem-se às anteriores |
| `STACK` | Região preenchida a partir do topo do item anterior | Emitida como área com sinalizador de empilhamento |
| `LINE1`, `LINE2`, `LINE3` | Uma linha com um, dois ou três píxeis de largura | Pode ser tracejada |
| `LINE:STACK` | Uma linha desenhada no topo do total empilhado acumulado | |
| `TICK` | Marcas ao longo de um contorno do traçado | Útil para estados, não para grandezas |
| `GPRINT` | Nada. Imprime um número na legenda | |
| `COMMENT` | Nada. Imprime texto literal na legenda | Comentários longos mudam de linha |
| `HRULE` | Uma linha horizontal num valor fixo | |
| `VRULE` | Uma linha vertical num instante fixo | |
| `TEXTALIGN` | Nada. Define o alinhamento para o texto de legenda seguinte | |

A lista integral, incluindo quais as colunas de configuração aplicáveis a cada tipo, encontra-se em [Itens de gráfico](/pt-pt/reference/graph-items/).

`AREA` e `STACK` são a combinação onde ocorrem mais equívocos. Uma área tem início no zero, pelo que duas áreas se sobrepõem e a mais alta oculta a mais baixa. Um empilhamento começa no ponto onde o item anterior terminou, pelo que a altura visível da segunda faixa corresponde ao seu valor, mas o seu topo marca o total. Um gráfico empilhado deve ser lido como a altura de uma faixa e não como uma posição no eixo Y, sob pena de interpretar incorretamente todas as séries exceto a inferior.

`HRULE` aceita um valor que pode conter substituições de modelos. Caracteres não numéricos são removidos do resultado final e, se nada numérico restar, a linha é desenhada no zero em vez de cancelar a renderização. Uma linha no zero pode ser propositada ou resultar de uma substituição com falha. Inspecione o comando resolvido antes de determinar a causa. O filtro numérico também pode modificar cadeias com unidades ou formatos não suportados.

`VRULE` aceita um carimbo Unix ou um par `hours:minutes`. Um valor de horas negativo é interpretado como um desvio retroativo em relação a agora e não como uma hora do relógio.

## Duas funções, uma palavra

A designação função de consolidação é utilizada para duas finalidades distintas, e os mesmos quatro nomes, `AVERAGE`, `MIN`, `MAX` e `LAST`, surgem em ambos os casos.

A primeira função é a seleção de histórico consolidado. Um comando `DEF` indica um ficheiro, uma fonte de dados no seu interior e uma função de consolidação. Essa função delimita a família de históricos consolidados pretendida. Ao pedir `MAX`, o RRDtool necessita de dados consolidados armazenados correspondentes, sujeitos ao recurso de contingência descrito abaixo e à seleção de resolução.

A segunda função é a aritmética da legenda. Uma instrução `GPRINT` sintetiza toda a janela desenhada num único número impresso, e a sua função determina o método de cálculo. Essa redução processa-se sobre a série já obtida; trata-se de agregação de apresentação e não de armazenamento em disco.

Deste modo, um `GPRINT` que apresente `MAX` sobre um `DEF` lido com `AVERAGE` imprimirá o valor mais elevado dessa série de médias na janela renderizada, não necessariamente a amostra em bruto mais elevada. Cinco minutos é apenas um exemplo; a resolução efetiva varia. São valores numéricos distintos e, numa ligação com tráfego intenso, diferem substancialmente. Ambas as leituras são legítimas. É provável que apenas uma traduza o seu objetivo.

## O recurso silencioso

Para os tipos de itens que utilizam o assistente de escolha ótima de função, o Kadupul consulta as funções de consolidação do ficheiro e aplica a solicitada caso exista, ou a primeira identificada em caso contrário. Se nenhuma for obtida para uma fonte de dados local válida, o assistente recorre a AVERAGE. As variantes fixas de GPRINT seguem um caminho autónomo e não utilizam este assistente, pelo que não existe garantia geral de que qualquer função omissa seja suprida.

Um item de desenho que peça `MAX` pode, por conseguinte, acabar a ler médias se o seu ficheiro contiver apenas históricos consolidados AVERAGE. Inspecione o `DEF` gerado e o resultado de `rrdtool info`. A manutenção de históricos consolidados pode alterar uma estrutura existente, mas acrescentar um histórico consolidado não reconstitui picos históricos descartados por apuramentos de média anteriores. Consulte [Gerir a retenção de dados](/pt-pt/guides/manage-data-retention/).

## O GPRINT herda o histórico consolidado do vizinho

Um `GPRINT` comum não dispõe de histórico consolidado próprio. Herda a função de consolidação do item compatível mais recente de tipo `AREA`, `STACK`, linha ou `TICK`, associado por nome de fonte de dados e identificador local do campo de modelo. Se não existir correspondência anterior, recorre ao assistente de escolha de função com a sua própria função configurada. Variantes fixas utilizam a sua função configurada de forma direta.

Isto significa que reordenar itens num modelo de gráfico pode alterar o que uma legenda indica sem que ninguém tenha editado a legenda. Coloque uma `LINE` com leitura `MAX` acima do bloco `GPRINT` e as legendas associadas resumirão valores máximos. Mova-a para baixo e o item coincidente anterior, ou o recurso predefinido, definirá a série de entrada. Se um valor na legenda mudar após uma edição não relacionada no modelo, confirme primeiro a ordem dos itens.

## CDEFs e VDEFs

Ambos transformam dados antes de serem traçados. Não são permutáveis.

| | CDEF | VDEF |
|---|---|---|
| Produz | Uma série temporal, um valor por intervalo | Um valor escalar e, para determinadas funções, uma hora associada |
| Pode ser traçado como linha ou área | Sim | Um escalar pode fornecer um nível constante |
| Composto por | Funções, operadores aritméticos, outros CDEFs, fontes de dados especiais, literais | Uma função aplicada a uma única referência |
| Encadeamento | Um CDEF pode referenciar outro CDEF | Um VDEF não pode incluir operações aritméticas |

Um CDEF é uma expressão em pilha avaliada em notação polaca inversa. O vocabulário de operadores é extenso e detalha-se na íntegra em [Itens de gráfico](/pt-pt/reference/graph-items/): aritmética, operadores condicionais e de comparação, trigonometria, agregação entre fontes de dados, operações sobre a pilha e funções de tempo que indicam a posição no eixo X. `UN` e `UNKN` devem ser aprendidos com brevidade. Substituir valores desconhecidos por zero evita descontinuidades visuais, mas oculta medições em falta; assuma explicitamente essa opção de apresentação.

Os CDEFs também leem referências especiais em vez de um nome fixo de fonte de dados. Uma delas resolve para a fonte de dados do item atual, permitindo reutilizar um único CDEF em todos os itens de um modelo. Outras resolvem para todas as fontes do gráfico, ou para fontes análogas, viabilizando a criação de uma linha de total sem enumerar individualmente as suas parcelas.

Um VDEF reduz uma série a um valor escalar: máximo, mínimo, média, desvio-padrão, primeiro valor, último valor, total, um percentil ou o declive, interseção e correlação de uma regressão linear. O RRDtool não suporta aritmética dentro de um VDEF; se um VDEF necessitar de uma entrada calculada, o Kadupul constrói-a sobre o CDEF do item em vez de o fazer sobre a fonte em bruto. Este é o caminho previsto: realize os cálculos num CDEF e reduza-os subsequentemente num VDEF.

Um `GPRINT` sustentado por um VDEF não necessita de argumento de função de consolidação: o VDEF já forneceu a redução pretendida. Os VDEFs também podem fornecer valores escalares para traçado; o RRDtool suporta linhas baseadas em VDEF. Consulte a [documentação de elementos gráficos](https://oss.oetiker.ch/rrdtool/doc/rrdgraph_graph.en.html).

A exportação para CSV seleciona tipos de desenho suportados sob a forma de colunas de séries; itens de legenda não são exportados como colunas equivalentes. Ao contrário do que constava em descrições anteriores, o código atual não ignora genericamente itens de desenho apoiados em VDEF. Pode chegar a emitir um comando `XPORT` inválido de um VDEF escalar: um teste isolado no RRDtool desenha uma linha VDEF com sucesso, mas rejeita essa exportação. Consulte o [erro da aplicação #273](https://github.com/kadupulhq/kadupul/issues/273). Utilize itens de desenho sustentados por séries para exportação e verifique as colunas geradas.

## Porque os mesmos dados parecem diferentes

Todas as opções abaixo alteram a imagem visualizada sem alterar uma única amostra registada.

| Opção | Efeito |
|---|---|
| Duração da janela e largura da imagem | Pode alterar a seleção do histórico consolidado e a consolidação adicional |
| Função de consolidação no `DEF` | Lê picos, mínimos, médias ou últimos valores |
| Falta de uma função de consolidação | Alguns circuitos substituem outra função; outros podem falhar |
| `AREA` face a `STACK` | Alturas absolutas face a alturas acumuladas |
| Ordem dos itens | Sobreposição, ordem de empilhamento e histórico consolidado que o `GPRINT` herda |
| Base 1000 ou 1024 | Altera a rotulagem do eixo. Os valores são idênticos |
| Modo de escala automática, limites rígidos, escala logarítmica | Altera o eixo Y, modificando a perceção visual da dimensão |

Quando os gráficos divergirem, compare os comandos gerados, as identidades e disposições dos ficheiros físicos, o estado da cache e a atualidade das amostras. Estas verificações de apresentação são úteis, mas não dispensam a análise de eventuais anomalias de recolha, armazenamento ou mapeamento. Para um procedimento estruturado sobre esta verificação, consulte [Resolver problemas de dados em falta](/pt-pt/guides/troubleshoot-missing-data/).
