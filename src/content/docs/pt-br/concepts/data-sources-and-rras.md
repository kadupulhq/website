---
title: Fontes de dados e arquivos round-robin
description: O que é armazenado, como funciona a retenção e por que a edição de perfis não migra arquivos RRD existentes.
sidebar:
  order: 2
banner:
  content: O Kadupul está em pré-alfa. Valide estes procedimentos em uma instalação de teste isolada. Tradução em rascunho, pendente de revisão por uma pessoa fluente no idioma.
---

Uma fonte de dados do Kadupul agrupa medições ao longo do tempo e normalmente mapeia para um único arquivo RRD.
Cada campo nomeado dentro desse arquivo também é chamado de fonte de dados (DS) pelo RRDtool.
Distinga o objeto da aplicação de seus campos individuais ao comparar contagens ou configurações.

Um arquivo nem sempre representa um único número. Uma fonte de dados pode carregar vários campos, e uma interface
de rede é o caso comum: os bytes de entrada e os bytes de saída compartilham o mesmo arquivo, são coletados
como itens de trabalho separados e gravados juntos em uma única atualização. O que eles compartilham é um passo (step),
um conjunto de arquivos consolidados e um destino comum. Você não pode manter um deles por mais tempo do que o outro,
pois a retenção é uma propriedade do arquivo e não do campo individual.

## O que está dentro do arquivo

Um arquivo RRD é composto por um cabeçalho e duas listas.

A primeira lista traz os campos: um nome, um tipo, um heartbeat e um mínimo e máximo para cada um.
A segunda lista traz os arquivos consolidados: uma função de consolidação, quantos passos de dados brutos
entram em um slot, quantos slots existem e quanto de um slot pode ser desconhecido antes que o próprio slot
se torne desconhecido.

A criação registra essas definições no arquivo. Os metadados do banco de dados e as definições reais dos arquivos
podem divergir posteriormente; inspecione o arquivo com `rrdtool info` em vez de presumir que o modelo atual
o descreve com exatidão.

<span id="the-decisions-that-are-permanent"></span>

## Decisões de criação e manutenção posterior

Um arquivo RRD é alocado no momento da criação. Edições de perfis não migram arquivos existentes.
O RRDtool fornece operações de ajuste e redimensionamento capazes de preservar dados armazenados,
mas que exigem validação e backups independentes. O fluxo normal de criação verifica se o arquivo
já existe e retorna sem substituí-lo. Essa proteção não impede ajustes ou migrações explícitas.
Salvar um modelo por si só não atualiza a estrutura dos arquivos existentes.

Quatro escolhas são fixadas naquele instante:

**O passo (step).** Com que frequência um valor é esperado, normalmente 300 segundos. O RRDtool normaliza
as atualizações para os limites do passo; leituras mais frequentes não são simplesmente descartadas. O fato
de atualizações mais lentas gerarem dados desconhecidos (unknown) depende das regras de heartbeat e consolidação.
O passo normalmente provém do perfil da fonte de dados. A criação do arquivo lê o passo armazenado da fonte
de dados e os arquivos do perfil referenciado; verifique ambos ao alterar metadados ou planejar uma migração.

**O tipo de fonte de dados.** Veja abaixo. Esta é a configuração que falha silenciosamente.

**Os limites.** Um mínimo e um máximo delimitam os valores aceitáveis; para os tipos DS geradores de taxa,
esses limites se aplicam à taxa calculada e não ao total bruto do contador. Dados fora do intervalo tornam-se
desconhecidos (unknown) em vez de serem truncados. Valores máximos baseados em consultas podem resolver marcadores
de velocidade de interface; nem toda fonte de interface recebe automaticamente um limite correto de velocidade de link.
Verifique as unidades do modelo e a definição real do arquivo.

A criação possui ramos específicos de normalização. Para um máximo literal igual ou inferior ao mínimo,
GAUGE e ABSOLUTE utilizam um máximo indefinido; outros tipos usam o mínimo mais um. As substituições de consultas
seguem um ramo separado. Uma verificação posterior de zero/zero altera apenas o máximo, e uma normalização anterior
pode já tê-lo alterado. Não considere isso um validador geral nem presuma que ambos os limites se tornarão indefinidos.

**Os arquivos consolidados.** Quantas amostras manter em quais resoluções e qual função de consolidação utilizar
para cada uma. É isso que decide se você conseguirá responder a uma pergunta daqui a dois anos.

## Tipos de fontes de dados

| Tipo | O que armazena | Uso adequado |
|---|---|---|
| `GAUGE` | Um nível instantâneo, normalizado para o passo do arquivo | Temperatura, carga média, memória em uso, tamanho de filas |
| `COUNTER` | Taxa de variação por segundo, com correção de reinício a 32 ou 64 bits | Octetos de interface, contagens de pacotes e de erros |
| `DERIVE` | Taxa de variação por segundo, permitindo valores negativos | Um contador que pode legitimamente diminuir ou ser reiniciado |
| `ABSOLUTE` | O valor fornecido, dividido pelo tempo decorrido desde a última leitura | Uma contagem que o dispositivo reinicia a cada leitura |
| `COMPUTE` | Um valor calculado a partir de outros campos no mesmo arquivo em vez de coletado | Um campo derivado, como um total ou uma proporção |

O Kadupul disponibiliza `DCOUNTER` e `DDERIVE` quando a versão configurada do RRDtool é 1.5 ou posterior.
Eles aceitam contadores de ponto flutuante; o DCOUNTER detecta também a direção da contagem e reinicializações,
portanto não é um simples COUNTER com casas decimais. A tabela descreve a semântica do RRDtool, não uma garantia
de que todos os tipos sejam suportados por todos os editores ou fluxos de criação do Kadupul; valide a definição
gerada, especialmente para expressões COMPUTE. Consulte a documentação oficial
[RRDtool creation reference](https://oss.oetiker.ch/rrdtool/doc/rrdcreate.en.html).

### A escolha incorreta do tipo

Estes exemplos ilustram erros de configuração comuns; sua visibilidade depende dos dados e dos limites definidos.

`GAUGE` em um contador incremental exibe graficamente seu nível acumulado em vez da taxa de transferência. Ele pode subir
até ocorrer um reinício ou estouro de limite; isso pode ser perceptível, mas em uma janela temporal curta não parece
necessariamente incorreto.

`COUNTER` interpreta reduções utilizando correção de reinício, portanto uma reinicialização pode se transformar
em uma taxa positiva astronômica ou ser rejeitada pelo limite máximo. `DERIVE` com um mínimo de zero rejeita taxas
negativas, incluindo estouros autênticos de contadores; escolha-o somente quando esse compromisso for adequado à métrica.
Um valor máximo não distingue todas as reinicializações de um estouro legítimo.

`COUNTER` em um nível fixo (gauge) representa o caso mais perigoso. O valor armazenado torna-se a variação do nível
dividida pelo tempo decorrido. Um dispositivo estável a 40 graus registra zero. Uma elevação de um grau ao longo
de cinco minutos registra 0,0033. O gráfico pode parecer plausível enquanto mede variações em vez da temperatura real.
Essa taxa só é útil se for a grandeza desejada; ela não representa de forma alguma o nível térmico original.

`ABSOLUTE` em um contador que não se reinicia na leitura produz a mesma classe de falha silenciosa no sentido oposto,
gerando valores que aumentam proporcionalmente ao tempo de atividade do dispositivo.

A regra prática é decidir o tipo a partir de como o dispositivo produz o número, e não a partir do que o número
significa conceitualmente. O fato de uma leitura ser uma taxa é uma propriedade do contador, não da métrica.

## O heartbeat

O heartbeat representa o intervalo de tempo máximo permitido entre atualizações consecutivas de um campo
antes de o RRDtool considerar o intervalo como desconhecido. Ele é medido estritamente entre atualizações, e não como
tempo adicional acrescentado após o passo.

Consulte o perfil configurado e o arquivo real. O perfil padrão de cinco minutos utiliza um heartbeat de 600 segundos,
o perfil de um minuto utiliza igualmente 600 segundos e o perfil de trinta segundos estabelece 1.200 segundos.
A tolerância a coletas perdidas não pode, portanto, ser descrita por um único multiplicador fixo; a normalização
e a consolidação também influenciam quais intervalos do gráfico se tornam desconhecidos.

O heartbeat é fixado por campo e não por arquivo. Os valores do perfil informam os metadados, mas a criação
do arquivo lê o heartbeat local do item, que pode diferir do perfil. Os perfis fornecidos não adotam
uma proporção uniforme. A justificativa de cada um e o impacto de um heartbeat configurado muito próximo
do passo são abordados em [Tempo e intervalos](/pt-br/concepts/time-and-intervals/).

## Consolidação

À medida que as atualizações chegam, o RRDtool as consolida também em intervalos mais amplos; ele não espera
que o arquivo mais detalhado expire. A função é selecionada para cada arquivo, e cada função responde
a uma pergunta diferente:

- `AVERAGE` resume os pontos de dados primários contribuintes.
- `MAX` mantém o valor mais alto.
- `MIN` mantém o valor mais baixo.
- `LAST` mantém o último valor de acordo com as regras de consolidação do RRDtool.

Essas funções atuam sobre pontos de dados primários normalizados, e não necessariamente sobre as leituras brutas
originais. Um arquivo MAX não consegue recuperar um pico instantâneo já sujeito a média dentro de um intervalo
primário; MIN não constitui um detector confiável para todas as interrupções de serviço.

Um arquivo armazena um arquivo por função e por resolução, portanto reter as quatro funções em quatro resoluções
implica dezesseis arquivos consolidados e quatro vezes o volume útil de dados em relação a manter apenas
médias com o mesmo número de linhas. O cabeçalho e o estado de preparação também consomem espaço. Todos os três
perfis fornecidos selecionam quatro funções; determine a retenção de acordo com as necessidades analíticas
e a capacidade da sua infraestrutura.

Se você mantiver apenas médias, não poderá mais tarde consultar os valores de pico: os picos nunca foram gravados.
Este é o motivo de insatisfação mais comum em instalações de longa data e não pode ser corrigido retroativamente.

Certos fluxos de desenho substituem uma função ausente por uma disponível; outros fluxos podem falhar.
Verifique o DEF gerado e os arquivos reais conforme descrito em
[Como os gráficos são desenhados](/pt-br/concepts/how-graphs-are-drawn/).

## O desconhecido é um valor real

Um RRD distingue rigorosamente o zero do valor desconhecido (unknown). Zero pode ser um nível reportado ou uma taxa
calculada, como em um contador estável. O valor desconhecido pode resultar de atualizações ausentes, expiração do heartbeat,
entradas explicitamente desconhecidas, limites rejeitados ou dados de consolidação insuficientes. Substituir o valor
desconhecido por zero pode fazer com que medições ausentes ou inválidas pareçam períodos normais de inatividade.

O valor desconhecido propaga-se na consolidação segundo um limite definido por arquivo. Os perfis padrão
o fixam na metade: um slot agregado composto por entradas parcialmente ausentes permanece um número real até que mais
da metade de suas entradas seja desconhecida, ponto em que todo o slot se torna desconhecido. A visibilidade
depende do alinhamento dos slots, do heartbeat, da normalização, da consolidação e da apresentação gráfica.
Não existe uma duração de falha universal que garanta que uma lacuna apareça ou desapareça em todos os arquivos.

O valor desconhecido é também o resultado da extrapolação de limites. Uma leitura acima do máximo configurado
não é truncada para esse máximo. Uma reinicialização de contador pode produzir uma taxa fora do intervalo e criar uma lacuna,
mas os limites não interceptam todas as reinicializações. Dados desconhecidos por si só não identificam a causa;
compare erros de coleta e registros de data/hora.

## Dimensionamento

Para uma estrutura inalterada, o volume útil de dados dos arquivos corresponde ao total de slots em todos os arquivos,
multiplicado pelo número de campos e por oito bytes. O tamanho total do arquivo e da implantação inclui ainda
cabeçalhos, estado de preparação, alocação do sistema de arquivos, filas e backups. A manutenção explícita
da estrutura pode alterar o tamanho dos arquivos.

Os três perfis incluídos diferem mais do que seus nomes dão a entender:

| Perfil | Passo | Slots por campo | Volume útil por campo | Custo relativo |
|---|---|---|---|---|
| 5 Minute Collection | 300 s | 11.488 | cerca de 90 KiB | 1 |
| 30 Second Collection | 30 s | 40.284 | cerca de 315 KiB | 3,5 |
| 1 Minute Collection | 60 s | 81.716 | cerca de 640 KiB | 7 |

Uma fonte de dados de interface com dois campos dobra cada um desses valores. Dez mil interfaces no perfil
de cinco minutos representam cerca de 1,8 GB de dados nos arquivos. As mesmas dez mil interfaces no perfil
de um minuto aproximam-se dos 13 GB, e a justificativa não reside apenas no passo: este perfil mantém ainda um arquivo
mensal muito mais aprofundado e um arquivo anual com amplitude de dez anos.

A cobertura efetiva de cada arquivo deve ser confrontada com seu respectivo nome. Os arquivos do perfil de cinco
minutos denominam-se Daily, Weekly, Monthly e Yearly, e os períodos reais que retêm são de 50 horas, 14,6 dias,
64,6 dias e 2,2 anos. Os nomes descrevem a predefinição gráfica para a qual o arquivo foi dimensionado,
e não a retenção efetiva. Se você precisar analisar o mês de abril passado com resolução de cinco minutos,
o rótulo promete que é possível, mas o arquivo não conterá esses dados.

A carga de gravação também varia com o perfil, e suas exigências se manifestam muito antes do esgotamento do disco.
Na cadência máxima de coleta, um passo de trinta segundos gera dez vezes mais intervalos de amostragem do que um
de cinco minutos. O processamento em lotes, campos compartilhados, seleção de tarefas pendentes e tentativas falhas
afetam a contagem de comandos e de gravações físicas; eles não respondem a uma proporção invariável. Consulte
[Escritas de grande volume](/pt-br/concepts/high-volume-writes/).

## Quais campos chegam ao arquivo

Uma fonte de dados criada a partir de um modelo de dados só obtém um campo no arquivo para os campos referenciados
por algum item de gráfico no fluxo normal de criação. O código de atualização pode excluir campos do modelo
não referenciados; sua coleta efetiva depende do método de entrada e do cache, e não apenas da visibilidade
de uma linha. Uma fonte de dados sem modelo obtém todos os campos, partindo do princípio de que não há gráfico prévio
para filtrar a seleção.

Uma referência não necessita desenhar uma linha visível: inspecione as associações de itens de gráfico,
o cache e a definição do arquivo. Adicionar um campo a um modelo não comprova por si só que coleta, mapeamento
gráfico e armazenamento estejam operacionais. Reconstruir o cache atualiza os metadados de coleta; não acrescenta
campos a um arquivo RRD já existente.

Isso significa também que adicionar um campo a um modelo não o adiciona automaticamente a arquivos preexistentes,
mesmo após um item de gráfico referenciá-lo. A adição de um campo requer manutenção explícita ou migração.
Dependendo da versão do RRDtool instalada, o ajuste permite adicionar fontes preservando os dados existentes;
excluir e recriar um arquivo perde irremediavelmente seu histórico. Consulte
[Gerenciar a retenção de dados](/pt-br/guides/manage-data-retention/) para conhecer as verificações e opções de manutenção.
