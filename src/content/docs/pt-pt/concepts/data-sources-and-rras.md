---
title: Fontes de dados e históricos consolidados
description: O que é guardado, como funciona a retenção e por que a edição de perfis não migra ficheiros RRD existentes.
sidebar:
  order: 2
banner:
  content: O Kadupul está em pré-alfa. Valide estes procedimentos numa instalação de teste isolada. Tradução em rascunho, pendente de revisão por uma pessoa fluente no idioma.
---

Uma fonte de dados do Kadupul agrupa medições ao longo do tempo e normalmente mapeia para um único ficheiro RRD.
Cada campo nomeado dentro desse ficheiro também é designado fonte de dados (DS) pelo RRDtool.
Distinga o objeto da aplicação dos seus campos individuais ao comparar contagens ou definições.

Um ficheiro nem sempre representa um único número. Uma fonte de dados pode conter vários campos, e uma interface
de rede é o caso habitual: os bytes de entrada e os bytes de saída partilham o mesmo ficheiro, são recolhidos
como tarefas de trabalho separadas e gravados conjuntamente numa única atualização. O que partilham é um passo (step),
um conjunto de históricos consolidados e um destino comum. Não é possível reter um deles durante mais tempo do que o outro,
pois a retenção é uma propriedade do ficheiro e não do campo individual.

## O que está dentro do ficheiro

Um ficheiro RRD é composto por um cabeçalho e duas listas.

A primeira lista são os campos: um nome, um tipo, um heartbeat e um valor mínimo e máximo para cada um.
A segunda lista são os históricos consolidados: uma função de consolidação, quantos passos de dados em bruto
entram num slot, quantos slots existem e que proporção de um slot pode ser desconhecida antes de o próprio slot
se tornar desconhecido.

A criação regista estas definições no ficheiro. Os metadados da base de dados e as definições reais dos ficheiros
podem divergir posteriormente; inspecione o ficheiro com `rrdtool info` em vez de presumir que o modelo atual
o descreve exatamente.

<span id="the-decisions-that-are-permanent"></span>

## Decisões de criação e manutenção posterior

Um ficheiro RRD é alocado no momento da criação. Edições de perfis não migram ficheiros existentes.
O RRDtool disponibiliza operações de afinação e redimensionamento capazes de preservar dados guardados,
mas que exigem validação e cópias de segurança independentes. O fluxo normal de criação verifica se o ficheiro
já existe e termina sem o substituir. Essa proteção não impede afinações ou migrações explícitas.
Guardar um modelo por si só não atualiza a estrutura dos ficheiros existentes.

Quatro escolhas ficam fixadas nesse instante:

**O passo (step).** A frequência com que um valor é esperado, normalmente 300 segundos. O RRDtool normaliza
as atualizações para os limites do passo; leituras mais frequentes não são simplesmente descartadas. O facto
de atualizações mais lentas gerarem dados desconhecidos (unknown) depende das regras de heartbeat e de consolidação.
O passo provém normalmente do perfil da fonte de dados. A criação do ficheiro lê o passo guardado da fonte
de dados e os históricos do perfil referenciado; confirme ambos ao alterar metadados ou planear uma migração.

**O tipo de fonte de dados.** Ver abaixo. É a definição que falha silenciosamente.

**Os limites.** Um mínimo e um máximo delimitam os valores aceitáveis; para os tipos DS geradores de taxas,
esses limites aplicam-se à taxa calculada e não ao total bruto do contador. Dados fora do intervalo tornam-se
desconhecidos (unknown) em vez de serem truncados. Valores máximos baseados em consultas podem resolver marcadores
de velocidade de interface; nem toda a fonte de interface obtém automaticamente um limite correto de velocidade de ligação.
Verifique as unidades do modelo e a definição real do ficheiro.

A criação possui ramificações específicas de normalização. Para um máximo literal igual ou inferior ao mínimo,
GAUGE e ABSOLUTE utilizam um máximo indefinido; outros tipos utilizam o mínimo mais um. As substituições de consultas
seguem um ramo separado. Uma verificação posterior de zero/zero altera apenas o máximo, e uma normalização anterior
pode já tê-lo alterado. Não considere isto um validador geral nem presuma que ambos os limites se tornarão indefinidos.

**Os históricos consolidados.** Quantas amostras manter em que resoluções e que função de consolidação utilizar
para cada uma. É isto que decide se conseguirá responder a uma questão daqui a dois anos.

## Tipos de fontes de dados

| Tipo | O que guarda | Aplicação adequada |
|---|---|---|
| `GAUGE` | Um nível instantâneo, normalizado para o passo do ficheiro | Temperatura, carga média, memória em uso, comprimento de filas |
| `COUNTER` | Taxa de variação por segundo, com correção de reinício a 32 ou 64 bits | Octetos de interface, contagens de pacotes e de erros |
| `DERIVE` | Taxa de variação por segundo, permitindo valores negativos | Um contador que pode legitimamente descer ou ser reiniciado |
| `ABSOLUTE` | O valor fornecido, dividido pelo tempo decorrido desde a última leitura | Uma contagem que o dispositivo reinicia a cada leitura |
| `COMPUTE` | Um valor calculado a partir de outros campos no mesmo ficheiro em vez de recolhido | Um campo derivado, como um total ou uma proporção |

O Kadupul disponibiliza `DCOUNTER` e `DDERIVE` quando a versão configurada do RRDtool é 1.5 ou posterior.
Suportam contadores de vírgula flutuante; o DCOUNTER deteta ainda o sentido da contagem e reinícios,
pelo que não é um simples COUNTER com casas decimais. A tabela descreve a semântica do RRDtool, não uma garantia
de que todos os tipos sejam suportados por todos os editores ou fluxos de criação do Kadupul; valide a definição
gerada, especialmente para expressões COMPUTE. Consulte a documentação oficial
[RRDtool creation reference](https://oss.oetiker.ch/rrdtool/doc/rrdcreate.en.html).

### A escolha incorreta do tipo

Estes exemplos ilustram erros de configuração; a sua visibilidade depende dos dados e dos limites definidos.

`GAUGE` num contador incremental apresenta graficamente o seu nível acumulado em vez do débito. Pode subir
até ocorrer um reinício ou transbordo; isso pode ser percetível, mas numa janela temporal curta não aparenta
necessariamente estar errado.

`COUNTER` interpreta descidas recorrendo à correção de transbordo, pelo que um reinício pode transformar-se
numa taxa positiva descomunal ou ser rejeitado pelo valor máximo. `DERIVE` com um mínimo de zero rejeita taxas
negativas, incluindo transbordos genuínos; escolha-o apenas quando esse compromisso for adequado à métrica.
Um valor máximo não distingue todos os reinícios de um transbordo legítimo.

`COUNTER` num nível fixo (gauge) representa o caso mais perigoso. O valor guardado torna-se a variação do nível
dividida pelo tempo decorrido. Um dispositivo estável a 40 graus regista zero. Uma subida de um grau ao longo
de cinco minutos regista 0,0033. O gráfico pode parecer plausível enquanto mede variações em vez da temperatura real.
Essa taxa só tem utilidade se for a grandeza pretendida; não representa de forma alguma o nível térmico original.

`ABSOLUTE` num contador que não se reinicia na leitura produz a mesma classe de falha silenciosa no sentido oposto,
originando valores que aumentam proporcionalmente ao tempo de funcionamento do dispositivo.

A regra fundamental consiste em determinar o tipo a partir da forma como o dispositivo produz o número, e não
a partir do significado conceptual do número. O facto de uma leitura constituir uma taxa é uma propriedade do contador,
não da métrica.

## O heartbeat

O heartbeat representa o intervalo de tempo máximo permitido entre atualizações consecutivas de um campo
antes de o RRDtool tratar o intervalo como desconhecido. É medido estritamente entre atualizações, e não como
tempo adicional adicionado após o passo.

Consulte o perfil configurado e o ficheiro real. O perfil padrão de cinco minutos utiliza um heartbeat de 600 segundos,
o perfil de um minuto utiliza igualmente 600 segundos e o perfil de trinta segundos estabelece 1.200 segundos.
A tolerância a consultas falhadas não pode, por isso, ser descrita por um único multiplicador fixo; a normalização
e a consolidação também influenciam que intervalos do gráfico se tornam desconhecidos.

O heartbeat é fixado por campo e não por ficheiro. Os valores do perfil informam os metadados, mas a criação
do ficheiro lê o heartbeat local do elemento, que pode diferir do perfil. Os perfis fornecidos não adotam
uma proporção uniforme. A justificação de cada um e o impacto de um heartbeat configurado demasiado próximo
do passo são abordados em [Tempo e intervalos](/pt-pt/concepts/time-and-intervals/).

## Consolidação

À medida que as atualizações chegam, o RRDtool consolida-as também em intervalos mais amplos; não espera
que o histórico mais detalhado expire. A função é selecionada para cada histórico consolidado, e cada função responde
a uma questão distinta:

- `AVERAGE` resume os pontos de dados primários participantes.
- `MAX` mantém o valor mais elevado.
- `MIN` mantém o valor mais baixo.
- `LAST` mantém o último valor de acordo com as regras de consolidação do RRDtool.

Estas funções atuam sobre pontos de dados primários normalizados, e não necessariamente sobre as leituras brutas
originais. Um histórico MAX não consegue recuperar um pico instantâneo já sujeito a média dentro de um intervalo
primário; MIN não constitui um detetor fiável para todas as interrupções de serviço.

Um ficheiro guarda um histórico por função e por resolução, pelo que reter as quatro funções em quatro resoluções
implica dezasseis históricos consolidados e quatro vezes o volume útil de dados relativamente a manter apenas
médias com o mesmo número de linhas. O cabeçalho e o estado de preparação também consomem espaço. Todos os três
perfis fornecidos selecionam quatro funções; determine a retenção de acordo com as necessidades analíticas
e a capacidade da sua infraestrutura.

Se guardar apenas médias, não poderá mais tarde inquirir sobre picos: os picos nunca foram registados.
Este é o motivo de insatisfação mais comum em instalações de longa duração e não pode ser corrigido retroativamente.

Certos fluxos de desenho substituem uma função ausente por uma disponível; outros fluxos podem falhar.
Verifique o DEF gerado e os históricos reais conforme descrito em
[Como os gráficos são desenhados](/pt-pt/concepts/how-graphs-are-drawn/).

## O desconhecido é um valor real

Um RRD distingue rigorosamente o zero do valor desconhecido (unknown). Zero pode ser um nível registado ou uma taxa
calculada, como num contador estável. O valor desconhecido pode resultar de atualizações em falta, expiração do heartbeat,
entradas explicitamente desconhecidas, limites rejeitados ou dados de consolidação insuficientes. Substituir o valor
desconhecido por zero pode fazer com que medições ausentes ou inválidas aparentem ser inatividade.

O valor desconhecido propaga-se na consolidação segundo um limiar definido por histórico. Os perfis padrão
fixam-no em metade: um slot agregado composto por entradas parcialmente em falta permanece um número real até que mais
de metade das suas entradas sejam desconhecidas, ponto em que todo o slot se torna desconhecido. A visibilidade
depende do alinhamento dos slots, do heartbeat, da normalização, da consolidação e da apresentação gráfica.
Não existe uma duração de falha universal que garanta que uma lacuna apareça ou desapareça em todos os históricos.

O valor desconhecido é também o resultado da ultrapassagem de limites. Uma leitura acima do máximo configurado
não é truncada para esse máximo. Um reinício de contador pode produzir uma taxa fora do intervalo e criar uma lacuna,
mas os limites não intercetam todos os reinícios. Dados desconhecidos por si só não identificam a causa;
compare erros de recolha e registos de data/hora.

## Dimensionamento

Para uma estrutura inalterada, o volume útil de dados dos históricos corresponde ao total de slots em todos os históricos,
multiplicado pelo número de campos e por oito bytes. O tamanho total do ficheiro e da instalação inclui ainda
cabeçalhos, estado de preparação, alocação do sistema de ficheiros, filas e cópias de segurança. A manutenção explícita
da estrutura pode alterar o tamanho dos ficheiros.

Os três perfis incluídos diferem mais do que as suas designações sugerem:

| Perfil | Passo | Slots por campo | Volume útil por campo | Custo relativo |
|---|---|---|---|---|
| 5 Minute Collection | 300 s | 11.488 | cerca de 90 KiB | 1 |
| 30 Second Collection | 30 s | 40.284 | cerca de 315 KiB | 3,5 |
| 1 Minute Collection | 60 s | 81.716 | cerca de 640 KiB | 7 |

Uma fonte de dados de interface com dois campos duplica cada um desses valores. Dez mil interfaces no perfil
de cinco minutos representam cerca de 1,8 GB de dados nos históricos. As mesmas dez mil interfaces no perfil
de um minuto aproximam-se dos 13 GB, e a justificação não reside apenas no passo: este perfil mantém ainda um histórico
mensal muito mais aprofundado e um histórico anual com amplitude de dez anos.

A cobertura efetiva de cada histórico deve ser confrontada com o respetivo nome. Os históricos do perfil de cinco
minutos denominam-se Daily, Weekly, Monthly e Yearly, e os períodos reais que retêm são de 50 horas, 14,6 dias,
64,6 dias e 2,2 anos. Os nomes descrevem a predefinição gráfica para a qual o histórico foi dimensionado,
e não a retenção efetiva. Se necessitar de analisar o mês de abril passado com resolução de cinco minutos,
a etiqueta promete que é possível, mas o histórico não conterá esses dados.

A carga de gravação também varia com o perfil, e as suas exigências manifestam-se muito antes do esgotamento do disco.
À cadência máxima de recolha, um passo de trinta segundos gera dez vezes mais intervalos de amostragem do que um
de cinco minutos. O processamento em lotes, campos partilhados, seleção de tarefas pendentes e tentativas falhadas
afetam a contagem de comandos e de gravações físicas; não respondem a uma proporção invariável. Consulte
[Escritas de grande volume](/pt-pt/concepts/high-volume-writes/).

## Que campos chegam ao ficheiro

Uma fonte de dados criada a partir de um modelo de dados só obtém um campo no ficheiro para os campos referenciados
por algum elemento de gráfico no fluxo normal de criação. O código de atualização pode excluir campos do modelo
não referenciados; a sua recolha efetiva depende do método de entrada e da cache, e não apenas da visibilidade
de uma linha. Uma fonte de dados sem modelo obtém todos os campos, partindo do princípio de que não há gráfico prévio
para filtrar a seleção.

Uma referência não necessita de desenhar uma linha visível: inspecione as associações de elementos de gráfico,
a cache e a definição do ficheiro. Adicionar um campo a um modelo não comprova por si só que recolha, mapeamento
gráfico e armazenamento estejam operacionais. Reconstruir a cache atualiza os metadados de recolha; não acrescenta
campos a um ficheiro RRD já existente.

Isto significa também que adicionar um campo a um modelo não o adiciona automaticamente a ficheiros preexistentes,
mesmo após um elemento de gráfico o referenciar. A adição de um campo requer manutenção explícita ou migração.
Consoante a versão do RRDtool instalada, a afinação permite adicionar fontes preservando os dados existentes;
apagar e recriar um ficheiro perde irremediavelmente o seu histórico. Consulte
[Gerir a retenção de dados](/pt-pt/guides/manage-data-retention/) para conhecer as verificações e opções de manutenção.
