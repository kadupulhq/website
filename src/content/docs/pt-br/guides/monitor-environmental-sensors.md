---
title: Monitorar sensores ambientais
description: Construa gráficos de temperatura, umidade, fluxo de ar, potência e estado de nobreak via SNMP, localize as OIDs adequadas em uma MIB de fabricante e aplique configurações gráficas que atendam a uma medição em vez de um contador.
banner:
  content: O Kadupul está em pré-alfa. Valide estes procedimentos em uma instalação de teste isolada. Este é um rascunho de tradução aguardando revisão por um falante fluente.
sidebar:
  order: 23
---

:::caution[Validar antes do uso]
O código-fonte está disponível, mas não há versão suportada do Kadupul nem
caminho de migração. Teste estes procedimentos em uma cópia isolada com backups antes de
confiar neles. Consulte o [status do projeto](/pt-br/project/status/).
:::

Temperatura, umidade e potência instantânea são medições, rotineiramente salvas como
`GAUGE`. Energia acumulada ou contagens de eventos podem exigir um formato de contador.
Confira unidades, identidade e semântica de cada objeto antes de definir um modelo.

Verifique o que já acompanha o sistema antes de escrever algo novo.

## O que é fornecido

Apenas quatro definições de consulta de dados constam na pasta nativa de consultas do código-fonte,
e nenhuma delas diz respeito a condições ambientais.

| Consulta SNMP fornecida | Escopo |
|---|---|
| `interface.xml` | Interfaces de rede |
| `host_disk.xml` | Armazenamento Host Resources |
| `net-snmp_disk.xml` | Partições declaradas UCD |
| `net-snmp_devio.xml` | E/S de dispositivos de bloco UCD |

A cobertura para sensores é incorporada por outros dois caminhos.

**Consultas de script server, empacotadas no pacote de dispositivo Net-SNMP.** Importe
`install/templates/NetSNMP_Device.xml.gz` para implantar seus três arquivos XML de consulta lmSensors
em `resource/script_server/`. O helper
`scripts/ss_netsnmp_lmsensors.php` também se encontra na árvore de código-fonte.

| Consulta | Tabela |
|---|---|
| Net-SNMP - Sensors - Get Thermal Sensors | `.1.3.6.1.4.1.2021.13.16.2.1` |
| Net-SNMP - Sensors - Get Fan Sensors | `.1.3.6.1.4.1.2021.13.16.3.1` |
| Net-SNMP - Sensors - Get Voltage Sensors | `.1.3.6.1.4.1.2021.13.16.4.1` |

O helper utiliza colunas de índice, nome e medição. A consulta indexa sobre o campo numérico
`sensorDevice`; `sensorName` fornece um rótulo de exibição que o helper encurta para
18 caracteres. Nomes não asseguram identidades exclusivas para sensores.

O caminho tradicional `get sensorReading` devolve grandezas brutas: miligraus para o objeto
histórico de temperatura, milivolts para tensão e RPM para ventoinhas. O gráfico térmico
aplica uma CDEF `Divide by 1000`. O gráfico de tensão não tem CDEF apesar de seu rótulo Volts,
um [defeito de escala comprovado](https://github.com/kadupulhq/kadupul/issues/247).

O caminho em separado `query sensorReading` escala temperatura e tensão, e tenta
uma conversão de tensão com sinal aplicando a constante errônea 4294967294. Ele também pode
[gerar exceção em medições indisponíveis](https://github.com/kadupulhq/kadupul/issues/248).
Não presuma unidades gravadas a partir dessa saída de descoberta.

O helper ainda recorre à coluna de temperatura descontinuada `.2.1.3`. A versão de referência atual da
[LM-SENSORS-MIB](https://raw.githubusercontent.com/net-snmp/net-snmp/master/mibs/LM-SENSORS-MIB.txt)
considera obsoleto esse objeto sem sinal em prol da coluna com sinal `.2.1.4`; avalie o suporte
e o comportamento com temperaturas negativas no agente antes de adaptar um modelo.

**Pacotes de dispositivo disponibilizados como arquivos importáveis.** Diversos trazem seus próprios
arquivos XML de consulta e os copiam para os diretórios apropriados durante a importação. Os principais aqui:

| Pacote | O que traz |
|---|---|
| SNMP UPS | Consultas de linhas de entrada e saída UPS-MIB, além de modelos de OID fixa para bateria, autonomia, temperatura e alarmes |
| AKCP Device | Consultas por script para sensores de temperatura, umidade, fluxo de ar e 4-20 mA |
| APC InfraStruXure PDU | Consultas para métricas de disjuntores e fases |
| APC InfraStruXure InRow CRAC | Consultas para métricas de unidades e grupos, incluindo temperatura, umidade, fluxo de ar e ventilação |
| BayTech PDU | Consulta para tomadas e circuitos trifásicos, abrangendo corrente, tensão, potência e temperatura |

Examine o pacote compatível antes de redigir consultas por conta própria. Siga
[Importar e exportar modelos](/pt-br/guides/import-and-export-templates/), confirme o provisionamento de arquivos
e a descoberta, e em seguida crie explicitamente os gráficos que deseja. Ter o pacote presente
não comprova compatibilidade nem escala correta; as falhas de UPS e
lmSensors abordadas abaixo demandam precaução.

## Os dois formatos que um sensor assume

Para coleta via SNMP, diferencie objetos escalares de instâncias em tabelas indexadas.

**Uma OID fixa.** Um único valor escalar em um endereço específico, o mesmo endereço em qualquer
dispositivo daquele modelo. Temperatura da bateria. Potência total de saída. Use uma fonte de dados
de OID fixa: uma requisição SNMP get em uma OID literal e uma única fonte de dados por leitura.

**Uma tabela.** Uma quantidade variável de medições detectadas em cada equipamento. Sondas de rack,
réguas de tomadas, leituras por fase. Use uma consulta de dados, que percorre a tabela,
aprende o índice e permite escolher quais linhas serão transformadas em gráficos.

O pacote de nobreak (UPS) fornecido adota ambas. Siga a estrutura de objetos da MIB: um dispositivo
com apenas um sensor de corrente ainda assim pode expô-lo como linha de uma tabela indexada.

| Leitura do nobreak (UPS) | Formato | OID |
|---|---|---|
| Temperatura da bateria | Fixo | `.1.3.6.1.2.1.33.1.2.7.0` |
| Autonomia restante estimada | Fixo | `.1.3.6.1.2.1.33.1.2.3.0` |
| Tempo na bateria | Fixo | `.1.3.6.1.2.1.33.1.2.2.0` |
| Tensão da bateria | Fixo | `.1.3.6.1.2.1.33.1.2.5.0` |
| Alarmes presentes | Fixo | `.1.3.6.1.2.1.33.1.6.1.0` |
| Tensão, corrente, potência e frequência de entrada | Consulta | `.1.3.6.1.2.1.33.1.3.3.1` |
| Tensão, corrente, potência e carga de saída | Consulta | `.1.3.6.1.2.1.33.1.4.4.1` |

Cada uma dessas fontes de dados é do tipo `GAUGE`. Nenhuma é um contador. O arquivo
de modelos fornecido estipula um intervalo (step) de 60 segundos e heartbeat de 600 segundos, mínimo
de zero e nenhum limite superior, exceto temperatura, que não possui valor mínimo. Avalie o perfil importado
e as configurações reais do RRD; essas declarações não estipulam por si sós o ritmo de consulta efetivo.
Uma leitura negativa válida também exige um eixo de gráfico que consiga apresentá-la.

## Localizar as OIDs

Faça uma varredura no equipamento antes de elaborar qualquer coisa. Você busca três pontos: uma
tabela de medições, uma tabela paralela de identificações e o fator de escala que o
fabricante implementou, além de indicadores de validade/status quando houver.

```bash
snmpwalk -v2c -c public probe.example.net .1.3.6.1.2.1.33
# Replace this example enterprise number with the vendor's actual number.
vendor_oid='.1.3.6.1.4.1.318'
snmpwalk -v2c -c public probe.example.net "$vendor_oid"
```

Substitua o host e comunidade de exemplo pelos valores configurados e dispare as validações a partir do poller.
Carregue a MIB pertinente e suas dependências para inspecionar nomenclaturas, unidades e semântica;
a documentação do fornecedor também esclarece OIDs numéricas. Um valor limítrofe
ou código de status não é o mesmo que uma medição.

```bash
snmptranslate -m +UPS-MIB -Td -OS .1.3.6.1.2.1.33.1.2.7
```

A definição da MIB é o lugar onde a escala é documentada. Um fabricante que relata
décimos de grau vai expressar isso na descrição ou cláusula de unidades do objeto e na documentação
de apoio. Estimar valores a partir de uma medição isolada pode converter 23,5 graus
em um gráfico marcando 235.

MIBs padrão atendem a muito mais cenários do que comumente se imagina. A UPS-MIB em `.1.3.6.1.2.1.33` é
genérica para diversos fabricantes. A ENTITY-SENSOR-MIB oferece o dado do sensor lado a lado com
seus respectivos campos de escala e precisão. Procure por elas antes de apelar para subárvores proprietárias.

Compare a descoberta em reinicializações representativas e trocas de sondas em ambiente de testes.
Duas varreduras inalteradas não bastam para atestar estabilidade de índices. Mantenha registros de
identidades estáveis de sensores antes de criar gráficos definitivos.

## Criar uma fonte de dados de OID fixa

Um sensor de OID fixa necessita de um modelo de dados baseado no método SNMP get, com a
OID informada literalmente e um único elemento de fonte de dados. Defina o tipo como `GAUGE`,
atribua um valor real ao mínimo apenas quando o sensor comprovadamente não atingir valores abaixo dele,
e deixe o máximo em aberto a menos que o fabricante determine um teto.

Valores situados fora dos limites da fonte de dados RRD convertem-se em desconhecidos. Estabeleça esses limites
com base nas unidades brutas armazenadas, não nas unidades convertidas do gráfico; do contrário, leituras
legítimas podem se perder antes que uma CDEF de exibição seja aplicada.

## Criar uma consulta de dados

Uma consulta depende de uma OID de índice, uma rotina para converter cada OID percorrida em índice, e um
campo por coluna pretendida.

A consulta de saída do nobreak (UPS) é um caso prático enxuto. Ela indexa sobre a tabela de linhas,
extrai o índice da terminação de cada OID retornada por meio de expressão regular, e
declara um campo de entrada para o índice e quatro campos de saída para tensão,
corrente, potência e carga. As definições de saída cobrem método, origem, direção e
OID de coluna. Uma OID de coluna pode servir de raiz válida para o percurso de índices; o fundamental é
a coerência entre o parser da consulta e as OIDs de fato retornadas. Veja [Consultas de dados e índices](/pt-br/concepts/data-queries-and-indexes/) para compreender
a escolha e retenção do índice.

Escolha o método de reindexação conscientemente. As opções são: nenhum, quando o uptime
regredir, quando a quantidade de índices variar e Verificar todos os campos (Verify All Fields). Tabelas de sensores são o
ambiente típico onde métodos simplificados falham: desplugue uma sonda do rack e espete outra;
a contagem total pode permanecer a mesma enquanto as medições vinculadas àquele índice pertencem agora a um
sensor distinto. Uma checagem completa onera o SNMP a cada rodada.
Verifique quais campos identificadores a consulta consegue examinar: índices numéricos estáveis
ou identificadores abreviados/duplicados não comprovam que a sonda física é a mesma.
Renove a descoberta e revise os vínculos dos gráficos após cada substituição.

## Dimensionar o valor

Defina onde ocorre a conversão e limite-a a um só ponto.

| Onde | Quando utilizar |
|---|---|
| No script de coleta | Utilize contratos formais de coleta; atualmente lmSensors get retorna grandezas brutas |
| Em uma CDEF no elemento gráfico | Vale a pena reter o valor original, sendo a unidade visual uma mera opção estética |

Uma CDEF costuma ser a alternativa comum para multiplicadores de fabricante. Os pacotes fornecidos trazem
definições como `Divide By 10`, compostas a partir da fonte de dados corrente, `10` e
uma operação de divisão. Aplique-as estritamente a objetos cuja grandeza bruta coincida.

O pacote de nobreak traz [CDEFs incorretas de potência e tempo](https://github.com/kadupulhq/kadupul/issues/249):
sua série On Battery divide segundos por 6000 em vez de 60, e séries Watts de entrada e saída
dividem watts por 10. Para um agente em conformidade, 600 segundos deveriam figurar como 10 minutos e 1000 watts como
1000 watts. Tensão da bateria e corrente da linha demandam sim divisão por 10; a autonomia estimada já é calculada em minutos. Veja
as [unidades de objetos de nobreak da RFC 1628](https://www.rfc-editor.org/rfc/rfc1628.html).

Guardar o valor original e aplicar a divisão no gráfico resguarda a fidelidade do arquivo RRD e
permite ajustar multiplicadores de exibição sem precisar reescrever a base histórica,
desde que as medições tenham resistido aos limites da fonte de dados e às regras de retenção. Alterações no coletor
modificam a unidade gravada e podem degradar a precisão; documente essa prática. Medições originais sem contexto
não devem ser apresentadas como grandezas de engenharia auditadas.

Não aplique o ajuste em duplicidade. Uma CDEF em um gráfico cujo script já converteu
a grandeza pode gerar um número aparentemente válido, porém inteiramente equivocado.

## Ajustes gráficos condizentes com medições

Defina parâmetros focados na medição em vez de clonar cegamente configurações de tráfego de rede.

| Parâmetro | Tráfego | Sensor |
|---|---|---|
| Tipo de fonte de dados | `COUNTER` | `GAUGE` |
| Valor base | 1000, para graduar eixos em k e M | Continua 1000, mas o prefixo perde o sentido para graus |
| Autoescala | Desejada, dado que a faixa é imprevisível | Em geral dispensável, pois a faixa é delimitada |
| Limite superior e inferior | Atrelados ao modo de autoescala | Estabeleça um intervalo visual consistente |

Defina limites inferior e superior expressos juntamente a um rótulo vertical indicando a grandeza
efetiva. O gráfico de temperatura de nobreak incluído opera assim: limite mínimo em 0, limite superior
em 100, e `C` no rótulo vertical.

O recurso de autoescala oferece uma série de modalidades, não sendo um seletor binário. Aquela usada
pelo gráfico de temperatura do pacote passa o limite inferior com `--alt-autoscale-max`;
não envia o teto gravado de 100. Sem limites rígidos, leituras fora da faixa
podem alargar o limite estabelecido. Um limite definido não fica travado automaticamente. Adote a variante
que resguarde o extremo que lhe interessa:

| Opção | Efeito |
|---|---|
| Autoescala ignorando limites | Ambos os extremos flutuam. Útil quando não se tem ideia da faixa |
| Autoescala aceitando limite inferior | Mantém o piso; o teto acompanha os dados |
| Autoescala aceitando limite superior | Mantém o teto; o piso acompanha os dados |
| Autoescala com ambos os limites | Envia ambos os limites; a expansão continua sujeita ao modo rígido |

Há também uma alternativa de limites rígidos (rigid boundaries) que veda a expansão do eixo caso uma
medição ultrapasse os valores delimitados. Ative-a se um eixo estático for prioritário em relação
à visibilidade de picos pontuais, e desative-a se não for, visto que um gráfico rígido
pode truncar variações fora do intervalo exibido. Isso não destrói a amostra
salva. Consulte a [referência de limites gráficos do RRDtool](https://rrdtool.org/rrdtool/doc/rrdgraph.en.html).

Para leituras em graus ou porcentagens em que prefixos SI causem estranheza, avalie fixar o expoente das unidades em 0.
A base 1000 define as gradações dos prefixos; ela não elimina os prefixos por si só nem converte escalas de medição.

### A consolidação tem mais relevância aqui do que no tráfego

Um contador de interface ponderado na média de uma hora ainda resume razoavelmente os acontecimentos.
A temperatura calculada na média de uma hora camufla o pico crítico de dez minutos.
Certifique-se de que a política de retenção atrelada a essas fontes de dados conserve um arquivo `MAX`,
e configure a série exibida para consultar a devida consolidação `MAX`.
Uma legenda marcando o máximo em cima de uma série `AVERAGE` não reconstitui o pico verdadeiro.

Mesmo um arquivo MAX só preserva extremos refletidos nas medições de fato recebidas;
ele não é capaz de deduzir desvios ocorridos entre intervalos de polling ou amostras descartadas na entrada. Consulte
[Gerenciar retenção de dados](/pt-br/guides/manage-data-retention/) e
[Fontes de dados e arquivos](/pt-br/concepts/data-sources-and-rras/).

## Quando não há MIB aproveitável

Diversos dispositivos de controle ambiental operam em Modbus, conexão serial ou endpoints HTTP,
e o serviço SNMP não expõe grandezas úteis. Nesses casos, recorre-se a entrada de dados por script. O
script roda no host do poller, não no equipamento, e a comunicação com o dispositivo é
tarefa do script. Consulte [Escrever um script de coleta de dados](/pt-br/guides/write-a-data-collection-script/) para checar
o formato de retorno.

Retorne `U` em vez de `0` se um sensor não puder ser lido. Uma sonda sem conexão
não equivale a uma sonda medindo zero grau.

## Modos de falha

| Sintoma | Causa comum |
|---|---|
| A temperatura é plotada dez ou cem vezes maior do que o real | Fator de multiplicação do fornecedor não foi dividido |
| Temperatura plotada dez vezes menor | Dividida duas vezes: uma no script e outra em uma CDEF |
| Uma linha de tensão indica valores na casa dos bilhões | Inteiro SNMP sem sinal armazenando valor negativo, sem tratamento |
| Gráficos de sensores ficam lineares após troca de sonda | A tabela foi reindexada e a fonte de dados referencia um sensor distinto |
| Leituras acima de uma marca geram buracos | Um limite máximo foi configurado na fonte de dados e os valores reais o superam |
| Eixo indicando k ou M em medições de temperatura | Base e configurações de unidades herdadas de modelo de tráfego |
| Um pico não é visível no resumo semanal | Verifique consolidação adotada, resolução mantida, intervalo de coleta e amostras rejeitadas |
| Consulta não retorna índices | Avalie OIDs recebidas, expressão do parser, bloqueios de acesso e suporte; a raiz da coluna pode ser válida |
| Consultas lmSensors não encontram dados no host Linux | Verifique suporte no agente, acessos, linhas ativas de sensores e mensagens de erro SNMP |
