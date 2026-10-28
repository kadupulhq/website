---
title: Descobrir dispositivos automaticamente
description: Analise um intervalo de rede, faça corresponder os dispositivos encontrados a um modelo e deixe que as regras construam os gráficos e ramos da árvore, com a criação de dispositivos desativada numa ronda inicial de descoberta.
banner:
  content: O Kadupul está em pré-alfa. Valide estes procedimentos numa instalação de teste isolada. Este é um rascunho de tradução a aguardar revisão por um falante fluente.
sidebar:
  order: 15
---

:::caution[Validar antes da utilização]
O código-fonte está disponível, mas não existe nenhuma versão suportada do Kadupul nem
caminho de migração. Teste estes procedimentos numa cópia isolada com cópias de segurança antes de
confiar neles. Consulte o [estado do projeto](/pt-pt/project/status/).
:::

A automatização é composta por dois mecanismos distintos fáceis de confundir. A descoberta percorre
um intervalo de endereços e decide o que constitui um dispositivo. As regras decidem o que é construído para um
dispositivo assim que ele existe. Pode executar qualquer um deles sem o outro, e a maior parte dos danos
causados por utilizadores na automatização decorre de ativar ambos ao mesmo tempo e constatar
as consequências tardiamente.

## Definir o intervalo

Um intervalo de rede é uma lista separada por vírgulas. Cada entrada possui um de três formatos.

| Formato | Exemplo | Notas |
|---|---|---|
| CIDR | `192.168.1.0/24` | Também aceita uma máscara decimal com pontos, `192.168.1.0/255.255.255.0` |
| Carácter universal | `192.168.*.*` | Convertido internamente para o CIDR equivalente |
| Endereço individual | `192.168.1.10` | Analisa exatamente esse endereço |

Intervalos de início e fim escritos como `192.168.1.10-192.168.1.50` são rejeitados com
um erro. Não são suportados.

Utilize intervalos sem sobreposição, inclusive entre redes que possam ser executadas em simultâneo.
A tabela de trabalho tem uma chave exclusiva global no endereço IP; um registo duplicado pode
rejeitar um lote inteiro de inserção, omitindo outros endereços desse lote. Consulte o
[problema #207](https://github.com/kadupulhq/kadupul/issues/207).

Tudo opera em IPv4. O cálculo do intervalo utiliza conversão de inteiros de 32 bits em todos os passos,
pelo que não existe um caminho IPv6 neste contexto.

Os endereços de rede e difusão (broadcast) estão excluídos. Um `/24` analisa 254 endereços, de
`.1` a `.254`. Uma entrada de endereço individual analisa um. Os endereços cujo último octeto é 255
também são ignorados durante a análise.

Antes de uma análise ter início, cada endereço do intervalo é escrito numa tabela de trabalho, uma
linha por endereço, e as threads reivindicam linhas a partir dela. Um `/16` escreve 65534 linhas antes
do primeiro ping. Esse é um custo real, e explica o motivo pelo qual a análise de um intervalo extenso e disperso
é lenta mesmo quando nada responde.

Associe um conjunto de opções SNMP a cada intervalo. O modo mestre regista um erro e ignora
um intervalo cujo ID de conjunto SNMP seja zero. Uma execução direcionada não aplica essa proteção;
iniciá-la diretamente não torna utilizáveis as opções SNMP ausentes.

## Ajustar o ritmo da análise

| Definição | O que faz | Predefinição |
|---|---|---|
| Discovery Threads | Processos paralelos que reivindicam endereços | 1 |
| Run Limit | A descoberta é terminada após este período | 20 minutes |
| Schedule Type | Manual, diário, semanal, mensal ou mensal num dia fixo | Manual |
| Ping Method | ICMP, TCP, TCP closed, UDP ou SNMP | A partir da definição global |
| Ping Retries, Timeout | Custo de falha por endereço | A partir das definições globais |

As threads e o limite de execução interagem de forma adversa se não forem planeados com rigor. Cinquenta threads
contra um `/16` constituem uma análise de portas para qualquer sistema de deteção de intrusões.
Uma única thread no mesmo intervalo atingirá o limite de execução e será interrompida a meio do percurso,
deixando um resultado parcial que aparenta estar completo.

Dimensione o intervalo para que a análise termine dentro do limite com uma quantidade de threads
tolerada pela sua rede. Vários intervalos reduzidos superam um grande, pois cada um obtém o seu próprio
agendamento e o seu próprio limite.

## O que a análise faz por endereço

1. Resolver um nome. É possível indicar servidores DNS alternativos numa lista delimitada por espaços; se
   nenhum estiver configurado, é utilizado o resolvedor próprio do poller. A pesquisa NetBIOS é uma alternativa
   opcional caso o DNS não devolva qualquer resultado.
2. Verificar se o endereço ou esse nome já correspondem a um dispositivo. Em caso afirmativo, o endereço é
   marcado como concluído. Isto suprime um dispositivo existente localizado através desses valores; não constitui,
   contudo, uma garantia contra criação simultânea ou aliases divergentes.
3. Efetuar ping, recorrendo ao método configurado. O método SNMP dispensa o ping autónomo.
4. Se o ping responder ou se for selecionado o método SNMP, tentar SNMP e recolher `sysDescr`, `sysObjectID`, `sysName`,
   `sysLocation`, `sysContact` e o tempo de atividade (uptime).
5. Comparar os dados de sistema recolhidos com as regras de dispositivos.

Um endereço que responde ao ping mas não ao SNMP é registado como encontrado e ativo. Um
endereço que responde ao SNMP mas não coincide com nenhuma regra de dispositivo é registado como encontrado, juntamente com os seus
dados de sistema, e nada é criado. Ambos terminam na lista de dispositivos descobertos.

A supressão de duplicados está ativada por predefinição. Se um `sysName` já tiver sido identificado num
outro endereço nos registos de descoberta armazenados desta rede, ou existir num dispositivo com outro
nome de anfitrião, o endereço é ignorado. Essa é a predefinição adequada para um router com muitas
interfaces endereçadas e a incorreta para equipamentos idênticos atrás de endereços NAT distintos;
é para desativar este comportamento que a opção de mesmo sysName existe.

Os dispositivos existentes podem ter as suas consultas de dados reexecutadas durante a análise. Esta funcionalidade está desativada
por predefinição e aplica-se a dispositivos registados como ativos ou em recuperação. A descoberta utiliza o seu
estado armazenado para esta decisão; não efetua sondagens de raiz a um dispositivo existente.

## As regras de dispositivos determinam o modelo

Uma regra de dispositivo mapeia dados de sistema para um modelo de dispositivo. Cada regra possui um padrão para
`sysDescr`, `sysObjectID` e `sysName`. O motor de correspondência filtra com base em cada campo de sistema
devolvido como não vazio pelo dispositivo; padrões de regra em branco coincidem com qualquer valor. As regras
são avaliadas por ordem sequencial e a primeira correspondência prevalece.

Utilize subsequências literais simples e confirme o modelo selecionado nos resultados da descoberta.
O motor SQL atual envolve os padrões de expressões regulares em carateres `/` literais,
pelo que um padrão ancorado como `^Linux.*fixture$` falha mesmo quando o operador de expressões regulares da base de dados
coincide diretamente. O recurso a subsequências não repara esse cenário. Consulte o
[problema #206](https://github.com/kadupulhq/kadupul/issues/206). A cláusula SQL `LIKE`
também processa `%` e `_` como carateres universais.

Sem correspondência, não há dispositivo. O endereço é registado na lista de dispositivos descobertos
com todos os dados de sistema recolhidos, sendo essa lista o local onde deve redigir a regra
que estava em falta.

Coloque as regras específicas acima das gerais. Uma regra que corresponda à subsequência `Linux`
posicionada acima de uma regra de fabricante reivindicará qualquer equipamento que mencione Linux na respetiva
descrição.

## Pré-visualizar a descoberta antes de ativar a criação

O comutador de criação de dispositivos num novo intervalo está desativado por predefinição. Mantenha-o desligado
para a ronda inicial e desative a opção de reexecutar as consultas de dados de dispositivos existentes.
Esta passagem continua a atualizar registos de descoberta, estatísticas de análise e registos de eventos, podendo emitir
as notificações configuradas. Não pré-visualiza a execução de regras de gráficos ou de árvores.

Execute a análise e consulte a lista de dispositivos descobertos. Apresenta as descobertas registadas,
os respetivos dados SNMP recolhidos e o modelo correspondente quando existir. Os dispositivos
existentes, os duplicados suprimidos e os endereços ignorados não necessitam de surgir aí.
Examine a saída de depuração por endereço além da própria lista.

Force uma análise através da linha de comandos em vez de aguardar por um agendamento:

```bash
php poller_automation.php --network=3 --force --debug
```

A flag de depuração apresenta as decisões por endereço à medida que ocorrem. O processo mestre,
que inicia intervalos ativados cujo agendamento expirou, constitui um modo independente:

```bash
php poller_automation.php -M
```

O comando orientado com `--force` executa igualmente uma rede desativada. Acrescentar `--force` ao
modo mestre contorna a verificação de agendamento e pode também iniciar redes desativadas.
Utilize o formato direcionado ao validar um único intervalo.

Verifique três aspetos no resultado antes de ligar a criação:

- A contagem de dispositivos corresponde ao esperado. Um número manifestamente superior ao seu inventário
  indica geralmente que o intervalo é mais amplo do que se supunha.
- Os modelos escolhidos estão corretos. Uma coluna exibindo o mesmo modelo genérico em
  tudo significa que as suas regras não estão a abranger os dispositivos.
- Não existem omissões de equipamentos fundamentais. Para um dispositivo ausente, verifique a expansão do intervalo, conclusão dos processos,
  supressão de duplicados e dispositivos existentes, política de ping e resultados SNMP.
  A mera ausência na lista não prova que o equipamento esteja inacessível.

## Regras de gráficos e árvores

Assim que um dispositivo existe, as regras de gráficos e de árvores determinam o que será construído nele.
A descoberta pode invocar esta automatização após criar um dispositivo, e a CLI pode
aplicá-la a dispositivos existentes. As regras individuais de gráficos e árvores devem estar ativadas.
Os comutadores globais de automatização de gráficos/árvores regem pontos de ligação específicos de criação;
não constituem uma proibição genérica da automatização explícita via CLI.

Uma regra de gráfico integra três partes: a que dispositivos se aplica, a que índices descobertos
numa consulta de dados se aplica e que tipo de gráfico deve ser criado. Ambos os segmentos
de correspondência assentam em itens de regra, onde um item agrega um campo, um operador e um
padrão, associados por `AND` ou `OR` com parênteses.

| Grupo de operadores | Membros |
|---|---|
| Subsequência | contains, does not contain, begins with, does not begin with, ends with, does not end with |
| Igualdade | matches, is not equal to |
| Numérico | is less than, less than or equal, greater than, greater than or equal |
| Presença | is unknown, is not unknown, is empty, is not empty |
| Padrão | matches regular expression, does not match regular expression |

Estes elementos convertem-se numa cláusula SQL `WHERE`. Os operadores de expressões regulares seguem o
dialeto regex da base de dados, não PCRE; deste modo, um padrão que funcione em
`preg_match` não funcionará necessariamente aqui. As comparações numéricas com padrões
numéricos são transmitidas sem aspas; tudo o resto é delimitado por aspas e a base de dados
aplica as suas regras de conversão de tipos. Teste filtros numéricos contra os valores reais em
cache; tais valores são habitualmente armazenados como texto. Os operadores de subsequência utilizam SQL `LIKE`,
onde `%` e `_` atuam como carateres universais.

Importa conhecer dois comportamentos antes de depurar uma regra inativa:

**Um filtro de dispositivo/objeto vazio não corresponde a nada, mas um filtro de índice vazio
corresponde a todos os índices em cache.** O filtro de seleção de dispositivos recorre a uma condição falsa
quando não contém itens. Contudo, assim que uma regra de gráfico encontra um dispositivo,
remover todas as respetivas condições de índice de gráfico deixa a consulta de dados sem filtragem.
Por exemplo, remover a condição `ifDescr = eth0` também pode criar um gráfico para `lo`.
Desative a regra enquanto edita as respetivas condições de índice.

**Uma regra que referencia um campo não descoberto pelo dispositivo é abandonada.** Se uma
regra filtra por um campo de consulta de dados que não reside na cache desse dispositivo, a execução regista
um aviso indicando o campo e cessa o processamento dessa regra para o dispositivo. A causa
frequente é uma regra escrita para uma consulta de dados avaliada num dispositivo cuja
consulta devolveu um conjunto de campos diferente.

A página de edição de regras enumera os objetos e gráficos candidatos. Analise essas listas antes
de ativar uma regra e após a sua alteração. São pré-visualizações de seleção, não um ensaio
completo de execução: validações de fontes de dados, deteção de gráficos existentes, pontos de ligação de criação
e inserção na árvore continuam a decorrer durante a execução. A CLI não disponibiliza uma opção de simulação.

As regras de árvore integram tipos distintos de folhas para dispositivos e gráficos, bem como uma árvore
de destino e nó ascendente selecionados. Os passos de cabeçalho podem recorrer a cadeias fixas ou a valores
dos campos de dispositivos/gráficos. Os cabeçalhos derivados de campos aplicam substituição regex PHP sem sensibilidade a maiúsculas;
sequências literais `\n` no resultado repartem-no em sucessivos cabeçalhos aninhados.
Esta sintaxe de substituição difere da expressão regular SQL utilizada no emparelhamento de objetos.
Cabeçalhos e folhas existentes são reutilizados na mesma árvore e nó ascendente; alterar o
caminho pode adicionar uma nova localização sem retirar a anterior.

## Aplicar regras a dispositivos já existentes

A descoberta não é a única via de entrada. As regras podem ser executadas sobre dispositivos já presentes
no sistema, selecionados por ID, nome de anfitrião ou descrição:

```bash
php cli/apply_automation_rules.php --ids="12 13 14" --debug
php cli/apply_automation_rules.php --hostname="^edge-" --debug
php cli/apply_automation_rules.php --description="branch office"
```

O nome de anfitrião e a descrição são avaliados como expressão regular se o valor for válido,
e sempre também como subsequência. É exigido pelo menos um dos três seletores;
invocar o comando sem seletores termina com erro. Quando se combinam seletores,
são unidos por `AND`. Utilize identificadores positivos separados por espaços para uma seleção
estreita; identificadores separados por vírgulas não são suportados. Os padrões podem continuar abrangentes,
e a solução de recurso SQL `LIKE` processa `%` e `_` como carateres universais.

A consulta do seletor não exclui automaticamente os dispositivos desativados. A flag `--debug`
acrescenta diagnósticos mas continua a realizar as criações. A ausência de dispositivos correspondentes é uma operação
sem efeito bem-sucedida, pelo que o código de saída por si só não demonstra que algo tenha sido criado.

Para cada dispositivo correspondente, a execução cumpre três ações sequenciais:

1. Tenta a criação para modelos de gráficos associados que ainda não possuam gráfico no
   dispositivo, sujeito à elegibilidade do modelo e às verificações de fontes de dados.
2. Executa as regras de gráficos ativadas para as consultas de dados associadas utilizando a respetiva cache de índices
   armazenada. Esta etapa não executa a descoberta por si só; atualize primeiro a consulta de dados
   se a cache estiver em falta ou desatualizada.
3. Aplica as regras de árvore de folhas de dispositivo ativadas.

A criação de um novo gráfico pode invocar regras de árvore de folhas de gráfico quando a automatização global
da árvore estiver ligada. A CLI não reaplica essas regras a gráficos que já
encontra criados. Consequentemente, uma regra de folha de gráfico nova ou revista não preenche retroativamente
gráficos existentes pelo mero facto de se reexecutar a CLI. Consulte o
[problema #211](https://github.com/kadupulhq/kadupul/issues/211). Confirme a respetiva localização
de forma autónoma; não elimine nem recrie gráficos históricos unicamente para acionar o ponto de ligação de criação.

Execuções consecutivas suprimem um gráfico não indexado existente por dispositivo e modelo de gráfico.
Os gráficos indexados são verificados por dispositivo, consulta de dados, tipo de gráfico e índice. Isto
evita a duplicação em execuções sequenciais; não garante proteção face à simultaneidade.
Examine a lista de gráficos e a árvore após a execução, a par das mensagens de registo `AUTOM8` sobre
gráficos ignorados, dados inválidos ou falhas de criação.

Existe uma ocorrência ignorada de forma suficientemente silenciosa para suscitar dúvidas: um modelo de gráfico com um campo
assinalado como substituível que não possua valor predefinido não é elegível para automatização. A execução
regista que não foi adicionado devido à ausência de valor predefinido no campo substituível e prossegue
o fluxo. Se um modelo aguardado nunca surgir, esse é o primeiro aspeto a validar. Consulte
[Modelos](/pt-pt/concepts/templates/) para entender o conceito de campo substituível.

## Armadilhas

**Desativar uma regra não desfaz o trabalho efetuado.** Não retira gráficos nem entradas de
árvore já produzidos. A eliminação de dispositivos contempla um comportamento de limpeza independente para
gráficos e fontes de dados; reveja as opções de eliminação antes de retirar um dispositivo.

**Uma análise interrompida assemelha-se a uma análise concluída com êxito.** O limite de execução encerra
a descoberta na etapa em que esta se encontrava. Os totais contabilizados refletem o trabalho efetivamente
concluído, e nada rotula o resultado como parcial. Compare o volume de endereços analisados
com a amplitude do intervalo.

**As regras atuam sobre a cache da consulta de dados, não diretamente no dispositivo.** Uma regra de gráfico
que não coincide com nada indica habitualmente que a consulta de dados nunca foi executada ou foi executada sem identificar índices.
Consulte a tabela de índices descobertos antes de reescrever a regra.

**O correio eletrónico de notificação agrega descobertas existentes e novas.** Um intervalo pode expedir correio
no seu termo, agrupando os dados descobertos consoante cada IP figurava ou não
no instantâneo pré-análise. Tal não comprova que todos os endereços solicitados tenham sido efetivamente analisados.

## Modos de falha

| Sintoma | Causa habitual |
|---|---|
| A análise não deteta nada num intervalo preenchido | Ping bloqueado, falha SNMP, exclusões ou supressão de duplicados |
| O intervalo recusa a análise, erro no registo | Nenhum conjunto de opções SNMP associado |
| Dispositivos detetados mas nenhum criado | Comutador de criação desligado ou nenhuma regra de dispositivo coincidiu |
| Todos os elementos recebem o mesmo modelo genérico | Ordem das regras, com uma regra geral antes das específicas |
| Apenas parte dos endereços é analisada | Limite de execução atingido, ou sobreposição de intervalos rejeitou um bloco |
| Um dispositivo por router em vez de um por interface, ou o inverso | Definição de supressão de duplicados por sysName idêntico |
| A regra não tem correspondência e o registo avisa sobre uma coluna | A regra filtra por um campo que a consulta de dados não devolveu |
| Modelo de gráfico nunca criado pela regra | Ausência de predefinição obrigatória, saída de fonte de dados inválida ou erro de criação |
| Gráficos inesperados para interfaces adicionais | Filtro de índice de gráfico vazio ou mais abrangente do que pretendido |
| Uma nova regra de árvore não posiciona gráficos existentes | A CLI não aplica retroativamente regras de folhas de gráfico a gráficos existentes |
