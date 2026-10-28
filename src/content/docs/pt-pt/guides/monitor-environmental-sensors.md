---
title: Monitorizar sensores ambientais
description: Representar graficamente temperatura, humidade, fluxo de ar, potência e estado da UPS por SNMP, localizar as OID corretas numa MIB de fabricante e atribuir aos dados parâmetros gráficos que sirvam uma medição e não um contador.
banner:
  content: O Kadupul está em pré-alfa. Valide estes procedimentos numa instalação de teste isolada. Este é um rascunho de tradução a aguardar revisão por um falante fluente.
sidebar:
  order: 23
---

:::caution[Validar antes da utilização]
O código-fonte está disponível, mas não existe nenhuma versão suportada do Kadupul nem
caminho de migração. Teste estes procedimentos numa cópia isolada com cópias de segurança antes de
confiar neles. Consulte o [estado do projeto](/pt-pt/project/status/).
:::

Temperatura, humidade e potência instantânea constituem medições, comummente arquivadas como
`GAUGE`. A energia agregada ou os totais de ocorrências podem demandar, em alternativa, um formato de contador.
Examine as grandezas, identidade e semântica de cada objeto antes de estipular um modelo.

Valide o que já acompanha o sistema antes de programar elementos próprios.

## O que é fornecido

Apenas quatro definições de consulta de dados residem no diretório nativo de consultas do repositório,
e nenhuma delas abrange grandezas ambientais.

| Consulta SNMP fornecida | Abrangência |
|---|---|
| `interface.xml` | Interfaces de rede |
| `host_disk.xml` | Armazenamento Host Resources |
| `net-snmp_disk.xml` | Partições declaradas em UCD |
| `net-snmp_devio.xml` | E/S de dispositivos de bloco UCD |

A abrangência de sensores surge através de dois métodos adicionais.

**Consultas através de script server, integradas no pacote de dispositivo Net-SNMP.** Importe
`install/templates/NetSNMP_Device.xml.gz` para instalar os três ficheiros XML de consulta lmSensors
sob `resource/script_server/`. O utilitário auxiliar
`scripts/ss_netsnmp_lmsensors.php` está igualmente patente no código-fonte.

| Consulta | Tabela |
|---|---|
| Net-SNMP - Sensors - Get Thermal Sensors | `.1.3.6.1.4.1.2021.13.16.2.1` |
| Net-SNMP - Sensors - Get Fan Sensors | `.1.3.6.1.4.1.2021.13.16.3.1` |
| Net-SNMP - Sensors - Get Voltage Sensors | `.1.3.6.1.4.1.2021.13.16.4.1` |

O utilitário utiliza colunas de índice, nome e leitura. A consulta indexa sobre a entidade numérica
`sensorDevice`; `sensorName` fornece um descritivo que o utilitário reduz para
18 carateres. Os nomes não asseguram identidades unívocas para sensores.

O percurso habitual `get sensorReading` devolve valores em bruto: miligraus para o objeto
térmico legado, milivolts para tensão e RPM para ventoinhas. O gráfico térmico
associa uma CDEF `Divide by 1000`. O gráfico de tensão carece de CDEF não obstante a respetiva etiqueta Volts,
o que corporiza uma [anomalia de escala confirmada](https://github.com/kadupulhq/kadupul/issues/247).

O caminho independente `query sensorReading` efetua a escala da temperatura e tensão, e ensaia
uma conversão de tensão com sinal aplicando a constante incorreta 4294967294. Pode além disso
[espoletar uma exceção perante medições inacessíveis](https://github.com/kadupulhq/kadupul/issues/248).
Não infira grandezas armazenadas a partir desta emissão da descoberta.

O utilitário continua a socorrer-se da coluna térmica descontinuada `.2.1.3`. A edição de referência atual da
[LM-SENSORS-MIB](https://raw.githubusercontent.com/net-snmp/net-snmp/master/mibs/LM-SENSORS-MIB.txt)
rejeita esse objeto sem sinal em benefício da coluna com sinal `.2.1.4`; valide a compatibilidade
e a conduta com temperaturas negativas no agente operacional antes de ajustar um modelo.

**Pacotes de dispositivo distribuídos como ficheiros compactados.** Diversos integram ficheiros
XML de consulta próprios e inscrevem-nos nos diretórios correspondentes aquando da importação. Os relevantes para este âmbito:

| Pacote | O que faculta |
|---|---|
| SNMP UPS | Consultas de linhas de entrada e saída UPS-MIB, além de modelos de OID fixa para bateria, autonomia, temperatura e alarmes |
| AKCP Device | Consultas por script para sensores de temperatura, humidade, fluxo de ar e 4-20 mA |
| APC InfraStruXure PDU | Consultas para métricas de disjuntores e fases |
| APC InfraStruXure InRow CRAC | Consultas para métricas de unidades e grupos, agregando temperatura, humidade, fluxo de ar e rotação |
| BayTech PDU | Consulta para tomadas e circuitos trifásicos, englobando corrente, tensão, potência e temperatura |

Examine o pacote ajustado antes de estruturar uma consulta manualmente. Observe
[Importar e exportar modelos](/pt-pt/guides/import-and-export-templates/), certifique-se da colocação de ficheiros
e da descoberta, e depois crie intencionalmente os gráficos pretendidos. A mera existência do pacote
não afiança a compatibilidade do hardware nem uma escala correta; os desacertos de UPS e
lmSensors explicitados abaixo justificam atenção meticulosa.

## As duas configurações assumidas por um sensor

Para efeitos de recolha SNMP, distinga objetos escalares de registos de tabelas indexadas.

**Uma OID fixa.** Um único valor escalar situado num dado endereço, uniforme em todos os
dispositivos desse modelo. Temperatura da bateria. Potência total de saída. Aplique uma fonte de dados
de OID fixa: um pedido SNMP get sobre uma OID literal e uma fonte de dados exclusiva por grandeza.

**Uma tabela.** Um volume indeterminado de medições apuradas por dispositivo. Sondas de bastidor,
réguas de tomadas, medições distribuídas por fases. Recorra a uma consulta de dados, que analisa a tabela,
regista o índice e faculta a seleção das linhas que serão transpostas para gráficos.

O pacote de UPS fornecido conjuga as duas vias. Observe a arquitetura de objetos da MIB: um dispositivo
munido de apenas uma sonda de corrente pode, mesmo assim, disponibilizá-la como linha de uma tabela indexada.

| Medição da UPS | Formato | OID |
|---|---|---|
| Temperatura da bateria | Fixo | `.1.3.6.1.2.1.33.1.2.7.0` |
| Autonomia restante estimada | Fixo | `.1.3.6.1.2.1.33.1.2.3.0` |
| Tempo em bateria | Fixo | `.1.3.6.1.2.1.33.1.2.2.0` |
| Tensão da bateria | Fixo | `.1.3.6.1.2.1.33.1.2.5.0` |
| Alarmes presentes | Fixo | `.1.3.6.1.2.1.33.1.6.1.0` |
| Tensão, corrente, potência e frequência de entrada | Consulta | `.1.3.6.1.2.1.33.1.3.3.1` |
| Tensão, corrente, potência e carga de saída | Consulta | `.1.3.6.1.2.1.33.1.4.4.1` |

Cada uma destas fontes de dados opera em `GAUGE`. Nenhuma constitui um contador. O ficheiro
de modelos faculta um passo de 60 segundos e um heartbeat de 600 segundos, limite inferior
de zero e nenhum teto, com ressalva para a temperatura, que não tem mínimo estipulado. Verifique o perfil importado
e as parametrizações reais do ficheiro RRD; estas indicações não fixam por si sós a cadência de interrogação.
Uma medição negativa legítima exige igualmente um eixo de gráfico apto a refleti-la.

## Identificar as OID

Analise o equipamento antes de redigir qualquer instrução. O objetivo centra-se em três aspetos: uma
tabela de medições, uma tabela paralela de identificações e o fator de escala estipulado pelo
fabricante, além de objetos de estado/validade quando patentes.

```bash
snmpwalk -v2c -c public probe.example.net .1.3.6.1.2.1.33
# Replace this example enterprise number with the vendor's actual number.
vendor_oid='.1.3.6.1.4.1.318'
snmpwalk -v2c -c public probe.example.net "$vendor_oid"
```

Substitua o anfitrião e a comunidade exemplificativos pelos parâmetros configurados e despolete os testes a partir do poller.
Carregue a MIB coincidente e as respetivas dependências para inspecionar designações, grandezas e semântica;
a documentação técnica do construtor permite igualmente decifrar OID numéricas. Uma referência limítrofe
ou código de estado não substitui uma medição.

```bash
snmptranslate -m +UPS-MIB -Td -OS .1.3.6.1.2.1.33.1.2.7
```

É na definição da MIB que a escala se encontra fundamentada. Um produtor que forneça
décimas de grau fará essa menção no descritivo ou cláusula de unidades do objeto, bem como nos
manuais conexos. Conjeturar a partir de uma medição isolada pode converter 23,5 graus
num gráfico com a marca de 235.

As MIB convencionais cobrem um universo superior ao presumido. A UPS-MIB em `.1.3.6.1.2.1.33` é
comum a múltiplos fornecedores. A ENTITY-SENSOR-MIB oferece a leitura do sensor a par
dos seus próprios campos de precisão e escala. Procure por estas referências antes de avançar para ramos proprietários.

Afronte a descoberta em reinicializações representativas e trocas de sensores num ambiente de validação.
Duas recolhas sem alterações não atestam estabilidade de índices. Arquive identidades
duradouras de sensores sempre que existirem antes de conceber gráficos perenes.

## Criar uma fonte de dados de OID fixa

Um sensor de OID fixa requer um modelo de dados centrado no método SNMP get, com a
OID estipulada textualmente e um único elemento de fonte de dados. Estabeleça o formato como `GAUGE`,
conceda um valor efetivo ao mínimo unicamente se o sensor estiver física e comprovadamente impossibilitado de descer abaixo dele,
e preserve o máximo em aberto salvo determinação formal do produtor.

Grandezas posicionadas fora dos parâmetros da fonte de dados RRD convertem-se em desconhecidas. Fixe tais balizas
tendo em conta as unidades em bruto armazenadas, e não as grandezas adaptadas do gráfico; caso contrário, dados
válidos arriscam-se a ser perdidos antes da aplicação de uma CDEF de apresentação.

## Conceber uma consulta de dados

Uma consulta carece de uma OID de índice, uma regra para transformar cada OID analisada em índice, e um
campo por cada coluna pretendida.

A consulta de saída da UPS corporiza uma síntese prática clarificadora. Indexa com base na tabela de linhas,
retira o índice do final de cada OID devolvida mediante recurso a uma expressão regular, e
define um campo de entrada para o índice e quatro campos de saída destinados a tensão,
corrente, potência e carga. As descrições de saída contêm método, proveniência, sentido e
OID de coluna. Uma OID de coluna pode consubstanciar uma raiz válida para a análise de índices; a perfeita convergência
entre a interpretação da consulta e as OID efetivamente devolvidas é a questão crucial. Consulte [Consultas de dados e índices](/pt-pt/concepts/data-queries-and-indexes/) para dominar
o modo como o índice é determinado e guardado.

Adote uma metodologia de reindexação criteriosa. As alternativas existentes compreendem: nenhuma, perante regressão
do uptime, perante alteração na contagem de índices e Verificar todos os campos (Verify All Fields). Os quadros de sensores constituem
o palco onde as fórmulas frágeis claudicam: desligue uma sonda de um bastidor e conecte outra;
a contagem pode permanecer intacta ao passo que as leituras afetas àquele índice passam a integrar um
sensor totalmente distinto. Uma fiscalização exaustiva despende transações SNMP em todos os ciclos.
Verifique que campos de identidade a consulta consegue aferir: índices numéricos estáticos
ou descrições abreviadas/duplicadas não certificam a identidade da sonda física.
Revalide a descoberta e analise as pontes dos gráficos após qualquer permuta.

## Efetuar a escala do valor

Defina onde a transposição se materializa e concentre-a num ponto singular.

| Onde | Quando empregar |
|---|---|
| No script de recolha | Siga os acordos formalizados do coletor; presentemente lmSensors get transmite grandezas em bruto |
| Numa CDEF sobre o item de gráfico | Justifica-se conservar a grandeza pura, sendo a apresentação uma decisão de interface |

Uma CDEF traduz a resposta vulgar a um multiplicador de fabricante. Os pacotes disponibilizados agregam
fórmulas como `Divide By 10`, delineadas com base na fonte de dados presente, `10` e
uma operação de divisão. Aplique-as estritamente a elementos que ostentem a grandeza correspondente.

O pacote da UPS apresenta [CDEF incorretas de potência e tempo](https://github.com/kadupulhq/kadupul/issues/249):
a sua série On Battery divide os segundos por 6000 em vez de 60, e séries de Watts de entrada/saída
dividem watts por 10. Para um agente rigoroso, 600 segundos devem refletir 10 minutos e 1000 watts devem
figurar como 1000 watts. A tensão da bateria e a intensidade de linha obrigam a divisão por 10; a autonomia calculada já se exprime em minutos. Consulte
as [unidades de objetos de UPS da RFC 1628](https://www.rfc-editor.org/rfc/rfc1628.html).

Guardar o registo em bruto e efetuar a divisão no gráfico assegura a genuinidade do ficheiro RRD e
habilita a retificação de um fator de escala sem ter de reformular o histórico gravado,
desde que as recolhas tenham transitado incólumes pelas balizas de dados e políticas de retenção. Alterar no coletor
modifica a unidade salvaguardada e arrisca a perda de rigor; documente essa opção. Leituras em bruto desprovidas de justificação
não devem surgir com estatuto de unidades de engenharia validadas.

Evite duplicar a conversão. Uma CDEF num gráfico cujo script já procedeu à adaptação
do valor pode originar uma leitura aparentemente coerente mas absolutamente falaciosa.

## Parametrizações gráficas adequadas a medições

Eleja critérios vocacionados para a medição em vez de decalcar cegamente orientações de tráfego de rede.

| Parâmetro | Tráfego | Sensor |
|---|---|---|
| Tipo de fonte de dados | `COUNTER` | `GAUGE` |
| Valor de referência | 1000, para graduar eixos em k e M | Permanece 1000, mas o prefixo perde a lógica em graus |
| Escala automática | Pretendida, visto que o limiar é desconhecido | Habitualmente desaconselhada, dado que o limiar é conhecido |
| Limite superior e inferior | Condicionados pelo modo de escala automática | Fixe uma amplitude visível proveitosa |

Estabeleça limites inferior e superior inequívocos em conjunto com um descritivo vertical que designe a unidade
efetiva. O gráfico de temperatura da UPS facultado procede desse modo: limite mínimo de 0, limite superior
de 100, e `C` no descritivo vertical.

A faculdade de autoescala espelha um rol de caminhos e não um botão elementar. O método mobilizado
pelo gráfico de temperatura facultado faculta um limite mínimo via `--alt-autoscale-max`;
não remete o patamar superior de 100 fixado. Sem fronteiras estanques, uma medição atípica
pode distorcer e alargar o limite estabelecido. Um limite delineado não fica travado de forma implícita. Eleja o formato
que acautele a fronteira crucial:

| Opção | Consequência |
|---|---|
| Autoescala sem limites | Ambos os vértices oscilam. Útil se desconhecer inteiramente o espectro |
| Autoescala com limite mínimo | Respeita o limite inferior; o patamar superior acompanha os dados |
| Autoescala com limite superior | Respeita o limite superior; o patamar inferior acompanha os dados |
| Autoescala com ambos os limites | Transmite ambos os limites; o alargamento depende da rigidez |

Existe igualmente uma alternativa de balizas estanques (rigid boundaries) que obsta a que o eixo se expanda quando um
valor transgride os limites determinados. Ligue-a se a preservação de um eixo estável sobrelevar
a inspeção de variações externas, e mantenha-a desligada se for o inverso, dado que um traçado rígido
pode ceifar uma oscilação fora do ecrã visível. Tal não erradica o registo
guardado. Consulte o [manual de referências gráficas do RRDtool](https://rrdtool.org/rrdtool/doc/rrdgraph.en.html).

Para valores em graus ou percentagens onde os prefixos SI desorientem a leitura, equacione um expoente de unidades fixo em 0.
A base 1000 administra os escalões de prefixos; não anula os prefixos por si só nem reconfigura unidades de aferição.

### A consolidação reveste-se de maior peso aqui do que no tráfego

Um registo de interface calculado na média de uma hora elucida satisfatoriamente o sucedido.
Uma temperatura sujeita à média de uma hora oculta o pico determinante de dez minutos.
Garanta que a política de retenção agregada a estas fontes de dados resguarda um arquivo `MAX`,
e estruture a linha traçada de modo a colher a consolidação `MAX` devida.
Um valor máximo indicado na legenda sobre uma série `AVERAGE` não restaura o pico verídico.

Mesmo um histórico consolidado MAX só preserva picos plasmados nos registos efetivamente recolhidos;
não consegue compensar uma oscilação havida entre rondas de análise ou grandezas excluídas antes da gravação. Consulte
[Gerir a retenção de dados](/pt-pt/guides/manage-data-retention/) e
[Fontes de dados e históricos consolidados](/pt-pt/concepts/data-sources-and-rras/).

## Quando não existe uma MIB utilizável

Diversos dispositivos de monitorização ambiental operam sob Modbus, barramento série ou endpoints HTTP,
e o serviço SNMP não providencia nada profícuo. Tais quadros obrigam à introdução de dados por script. O
script processa-se na máquina do poller, não no dispositivo, cabendo a este a comunicação
com o equipamento. Consulte [Escrever um script de recolha de dados](/pt-pt/guides/write-a-data-collection-script/) para verificar
o modelo de saída.

Retorne `U` em vez de `0` quando um sensor se encontrar inacessível. Uma sonda que ficou desligada
não consubstancia uma sonda a registar zero graus.

## Modos de falha

| Sintoma | Causa habitual |
|---|---|
| A temperatura surge dez ou cem vezes ampliada no gráfico | O fator de escala do construtor não foi dividido |
| A temperatura surge dez vezes mais reduzida | Divisão em duplicado: uma no script e outra numa CDEF |
| Uma linha de tensão devolve números na ordem dos milhares de milhões | Inteiro SNMP sem sinal congregando valor negativo, sem correção |
| Os gráficos de sensores estabilizam numa linha reta após permuta de sonda | A tabela reindexou e a fonte de dados aponta agora para outro sensor |
| Leituras acima de uma marca provocam falhas nos gráficos | Fixou-se um teto na fonte de dados e os valores reais sobrepõem-se |
| Eixo marcado em k ou M perante medições de temperatura | Valor base e unidades decalvados de um modelo de tráfego |
| Um pico não surge refletido na panorâmica semanal | Analise a consolidação adotada, a resolução mantida, o ritmo e registos recusados |
| A consulta não devolve índices | Verifique as OID, expressões regulares, barreiras de acesso e compatibilidade; a raiz pode ser válida |
| As consultas lmSensors nada detetam num anfitrião Linux | Valide o agente, acessos, linhas de sensores disponíveis e os códigos de erro SNMP |
