---
title: Descobrir dispositivos automaticamente
description: Escaneie um intervalo de rede, associe dispositivos encontrados a um modelo e deixe que as regras criem gráficos e ramos de árvore, com a criação de dispositivos desabilitada em uma rodada inicial de descoberta.
banner:
  content: O Kadupul está em pré-alfa. Valide estes procedimentos em uma instalação de teste isolada. Este é um rascunho de tradução aguardando revisão por um falante fluente.
sidebar:
  order: 15
---

:::caution[Validar antes do uso]
O código-fonte está disponível, mas não há versão suportada do Kadupul nem
caminho de migração. Teste estes procedimentos em uma cópia isolada com backups antes de
confiar neles. Consulte o [status do projeto](/pt-br/project/status/).
:::

A automação é composta por duas máquinas distintas fáceis de confundir. A descoberta percorre
um intervalo de endereços e decide o que é um dispositivo. As regras decidem o que é criado para um
dispositivo assim que ele existe. Você pode executar qualquer uma delas sem a outra, e a maior parte dos danos
causados por usuários na automação decorre de ativar ambas ao mesmo tempo e constatar
as consequências tardiamente.

## Definir o intervalo

Um intervalo de rede é uma lista separada por vírgulas. Cada entrada possui um de três formatos.

| Formato | Exemplo | Observações |
|---|---|---|
| CIDR | `192.168.1.0/24` | Também aceita máscara decimal com pontos, `192.168.1.0/255.255.255.0` |
| Caractere curinga | `192.168.*.*` | Convertido internamente para o CIDR equivalente |
| Endereço único | `192.168.1.10` | Escaneia exatamente esse endereço |

Intervalos de início e fim escritos como `192.168.1.10-192.168.1.50` são rejeitados com
um erro. Não são suportados.

Utilize intervalos sem sobreposição, inclusive entre redes que possam ser executadas em simultâneo.
A tabela de trabalho tem uma chave exclusiva global no endereço IP; um registro duplicado pode
rejeitar um lote inteiro de inserção, omitindo outros endereços desse lote. Consulte o
[problema #207](https://github.com/kadupulhq/kadupul/issues/207).

Tudo opera em IPv4. A matemática do intervalo utiliza conversão de inteiros de 32 bits,
portanto não há caminho IPv6 aqui.

Endereços de rede e broadcast são excluídos. Um `/24` escaneia 254 endereços, de
`.1` a `.254`. Uma entrada de endereço único escaneia um. Endereços cujo último octeto seja 255
também são ignorados durante a varredura.

Antes de uma varredura começar, cada endereço do intervalo é gravado em uma tabela de trabalho, uma
linha por endereço, e as threads reivindicam linhas dela. Um `/16` grava 65534 linhas antes
do primeiro ping. Esse é um custo real, e é a razão pela qual a varredura de um intervalo extenso e esparso
é lenta mesmo quando nada responde.

Associe um conjunto de opções SNMP a cada intervalo. O modo mestre registra um erro e ignora
um intervalo cujo ID de conjunto SNMP seja zero. Uma execução direcionada não aplica essa proteção;
iniciá-la diretamente não torna funcionais as opções SNMP ausentes.

## Ajustar o ritmo da varredura

| Configuração | O que faz | Padrão |
|---|---|---|
| Discovery Threads | Workers paralelos que reivindicam endereços | 1 |
| Run Limit | A descoberta é encerrada após esse tempo | 20 minutes |
| Schedule Type | Manual, diário, semanal, mensal ou mensal em um dia fixo | Manual |
| Ping Method | ICMP, TCP, TCP closed, UDP ou SNMP | Da configuração global |
| Ping Retries, Timeout | Custo de falha por endereço | Das configurações globais |

Threads e limite de execução interagem mal se não forem dimensionados. Cinquenta threads
contra um `/16` configuram um scan de portas para qualquer sistema de detecção de intrusão.
Uma única thread no mesmo intervalo atingirá o limite de execução e será interrompida no meio do caminho,
deixando um resultado parcial que se parece com um completo.

Dimensione o intervalo para que o escaneamento termine dentro do limite com uma contagem de threads
que sua rede tolere. Vários intervalos pequenos superam um grande, pois cada um recebe seu próprio
agendamento e seu próprio limite.

## O que a varredura faz por endereço

1. Resolver um nome. Servidores DNS alternativos podem ser informados como uma lista delimitada por espaços; se
   nenhum for definido, o resolvedor do próprio poller será usado. A busca NetBIOS é uma alternativa
   opcional quando o DNS não retorna nada.
2. Verificar se o endereço ou esse nome já correspondem a um dispositivo. Se corresponderem, o endereço é
   marcado como concluído. Isso suprime um dispositivo existente localizado por esses valores; não se trata,
   contudo, de garantia contra criação simultânea ou aliases divergentes.
3. Fazer ping, usando o método configurado. O método SNMP dispensa o ping separado.
4. Se o ping responder ou o método SNMP for selecionado, tentar SNMP e coletar `sysDescr`, `sysObjectID`, `sysName`,
   `sysLocation`, `sysContact` e uptime.
5. Comparar os dados de sistema coletados com as regras de dispositivo.

Um endereço que responde ao ping mas não ao SNMP é registrado como encontrado e ativo. Um
endereço que responde ao SNMP mas não coincide com nenhuma regra de dispositivo é registrado como encontrado, com seus
dados de sistema, e nada é criado. Ambos vão para a lista de dispositivos descobertos.

A supressão de duplicatas fica ativada por padrão. Se um `sysName` já foi visto em
outro endereço nos registros de descoberta armazenados desta rede, ou existe em um dispositivo com outro
hostname, o endereço é ignorado. Esse é o padrão correto para um roteador com muitas
interfaces endereçadas e o incorreto para equipamentos idênticos atrás de endereços NAT distintos;
é para desativar isso que a opção de mesmo sysName existe.

Dispositivos existentes podem ter suas consultas de dados reexecutadas durante a varredura. Isso vem desativado
por padrão e aplica-se a dispositivos registrados como ativos ou em recuperação. A descoberta utiliza seu
status armazenado para essa decisão; ela não efetua sondagens ativas do zero em um dispositivo existente.

## Regras de dispositivo definem o modelo

Uma regra de dispositivo mapeia dados de sistema para um modelo de dispositivo. Cada regra possui um padrão para
`sysDescr`, `sysObjectID` e `sysName`. O mecanismo de correspondência filtra cada campo de sistema
retornado como não vazio pelo dispositivo; padrões de regra em branco coincidem com qualquer valor. As regras
são avaliadas em ordem sequencial e a primeira correspondência prevalece.

Use substrings literais simples e verifique o modelo selecionado nos resultados da descoberta.
O comparador SQL atual envolve os padrões de regex em caracteres `/` literais,
de modo que um padrão ancorado como `^Linux.*fixture$` falha mesmo quando o operador de regex do banco de dados
coincide diretamente. O fallback de substring não corrige esse cenário. Consulte o
[problema #206](https://github.com/kadupulhq/kadupul/issues/206). O comando SQL `LIKE`
também trata `%` e `_` como caracteres curinga.

Sem correspondência, nada de dispositivo. O endereço é registrado na lista de dispositivos descobertos
com todos os dados de sistema coletados, e essa lista é onde você cria a regra
que estava faltando.

Posicione regras específicas acima das gerais. Uma regra que corresponda à substring `Linux`
posicionada acima de uma regra de fabricante reivindicará qualquer equipamento que mencione Linux em sua
descrição.

## Visualizar a descoberta antes de habilitar a criação

A opção de criação de dispositivos em um novo intervalo vem desativada por padrão. Mantenha-a desativada
na rodada inicial e desabilite a opção de reexecutar as consultas de dados de dispositivos existentes.
Essa rodada ainda atualiza registros de descoberta, estatísticas de varredura e logs, podendo enviar
as notificações configuradas. Ela não pré-visualiza a execução de regras de gráficos ou de árvore.

Execute a varredura e leia a lista de dispositivos descobertos. Ela exibe as descobertas registradas,
os dados SNMP coletados e o modelo correspondente quando houver. Dispositivos
existentes, duplicatas suprimidas e endereços ignorados não precisam aparecer lá.
Revise a saída de depuração por endereço além da própria lista.

Force uma varredura pela linha de comando em vez de aguardar um agendamento:

```bash
php poller_automation.php --network=3 --force --debug
```

O sinalizador de depuração imprime as decisões por endereço à medida que acontecem. O processo mestre,
que inicia intervalos habilitados cujo agendamento venceu, constitui um modo separado:

```bash
php poller_automation.php -M
```

O comando direcionado com `--force` também executa uma rede desabilitada. Adicionar `--force` ao
modo mestre ignora a verificação de agendamento e também pode iniciar redes desabilitadas.
Utilize a forma direcionada ao validar um único intervalo.

Verifique três itens no resultado antes de ativar a criação:

- A contagem de dispositivos corresponde ao esperado. Uma contagem muito superior ao inventário
  costuma indicar que o intervalo é mais amplo do que se supunha.
- Os modelos escolhidos estão corretos. Uma coluna exibindo o mesmo modelo genérico em
  tudo indica que suas regras não estão capturando os dispositivos.
- Nada de importante está ausente. Para um dispositivo ausente, verifique a expansão do intervalo, conclusão dos workers,
  supressão de duplicatas e dispositivos existentes, política de ping e resultados SNMP.
  A simples ausência na lista não prova que o dispositivo esteja inacessível.

## Regras de gráficos e árvores

Assim que um dispositivo existe, regras de gráficos e de árvores determinam o que será construído nele.
A descoberta pode invocar essa automação após criar um dispositivo, e a CLI pode
aplicá-la a dispositivos existentes. As regras individuais de gráficos e árvores devem estar ativadas.
Os interruptores globais de automação de gráficos/árvores regem ganchos específicos de criação;
não constituem uma proibição genérica à automação explícita via CLI.

Uma regra de gráfico tem três partes: a quais dispositivos se aplica, a quais índices descobertos
em uma consulta de dados se aplica e qual tipo de gráfico deve ser criado. Ambas as partes
de correspondência são compostas por itens de regra, onde um item consiste em um campo, um operador e um
padrão, unidos por `AND` ou `OR` com parênteses.

| Grupo de operadores | Membros |
|---|---|
| Substring | contains, does not contain, begins with, does not begin with, ends with, does not end with |
| Igualdade | matches, is not equal to |
| Numérico | is less than, less than or equal, greater than, greater than or equal |
| Presença | is unknown, is not unknown, is empty, is not empty |
| Padrão | matches regular expression, does not match regular expression |

Estes se transformam em uma cláusula SQL `WHERE`. Os operadores de expressões regulares seguem o
dialeto regex do banco de dados, não PCRE; portanto, um padrão que funciona em
`preg_match` não funcionará necessariamente aqui. Comparações numéricas contra padrões
numéricos são repassadas sem aspas; todo o restante é colocado entre aspas e o banco de dados
aplica suas regras de conversão de tipos. Teste filtros numéricos contra os valores reais em
cache; tais valores costumam ser armazenados como texto. Operadores de substring usam SQL `LIKE`,
onde `%` e `_` têm significado de curingas.

Dois comportamentos são importantes de conhecer antes de depurar uma regra inoperante:

**Um filtro de dispositivo/objeto vazio não corresponde a nada, mas um filtro de índice vazio
corresponde a todos os índices em cache.** O filtro de seleção de dispositivos recorre a uma condição falsa
quando não contém itens. Contudo, assim que uma regra de gráfico encontra um dispositivo,
remover todas as condições de índice de gráfico deixa a consulta de dados sem filtragem.
Por exemplo, remover a condição `ifDescr = eth0` também pode criar um gráfico para `lo`.
Desative a regra enquanto edita suas condições de índice.

**Uma regra que referencia um campo não descoberto pelo dispositivo é abandonada.** Se uma
regra filtra por um campo de consulta de dados que não está no cache daquele dispositivo, a execução registra
um aviso com o nome do campo e interrompe o processamento daquela regra para o dispositivo. A causa
comum é uma regra escrita para uma consulta de dados avaliada em um dispositivo cuja
consulta retornou um conjunto de campos diferente.

A página de edição de regras lista objetos e gráficos candidatos. Revise essas listas antes
de habilitar uma regra e depois de editá-la. São pré-visualizações de seleção, não um ensaio
completo de execução: verificações de fontes de dados, detecção de gráficos existentes, ganchos de criação
e inserção na árvore ainda ocorrem durante a execução. A CLI não possui opção de simulação.

As regras de árvore possuem tipos distintos de folhas para dispositivos e gráficos, bem como uma árvore
de destino e nó pai selecionados. As etapas de cabeçalho podem usar strings fixas ou valores
dos campos de dispositivos/gráficos. Cabeçalhos derivados de campos aplicam substituição regex PHP sem distinção de maiúsculas;
sequências literais `\n` no resultado o dividem em sucessivos cabeçalhos aninhados.
Essa sintaxe de substituição difere da regex SQL usada na correspondência de objetos.
Cabeçalhos e folhas existentes são reutilizados na mesma árvore e nó pai; alterar o
caminho pode adicionar uma nova localização sem remover a antiga.

## Aplicar regras a dispositivos que já existem

A descoberta não é o único ponto de entrada. Regras podem ser executadas contra dispositivos já presentes
no sistema, selecionados por ID, hostname ou descrição:

```bash
php cli/apply_automation_rules.php --ids="12 13 14" --debug
php cli/apply_automation_rules.php --hostname="^edge-" --debug
php cli/apply_automation_rules.php --description="branch office"
```

Hostname e descrição são avaliados como expressão regular se o valor for válido,
e sempre também como substring. Ao menos um dos três seletores é obrigatório;
chamar o script sem seletores encerra com erro. Quando seletores são combinados,
são unidos por `AND`. Use IDs numéricos positivos separados por espaços para uma seleção
restrita; IDs separados por vírgulas não são suportados. Os padrões ainda podem ser amplos,
e o mecanismo de fallback SQL `LIKE` trata `%` e `_` como caracteres curinga.

A consulta do seletor não exclui automaticamente dispositivos desabilitados. O sinalizador `--debug`
adiciona diagnósticos, mas continua efetuando as criações. A ausência de dispositivos correspondentes é uma operação
nula bem-sucedida, portanto o código de saída por si só não comprova que algo tenha sido criado.

Para cada dispositivo correspondente, a execução cumpre três ações em ordem:

1. Tenta a criação para modelos de gráficos anexados que ainda não possuam gráfico no
   dispositivo, respeitando a elegibilidade do modelo e as verificações de fontes de dados.
2. Executa regras de gráficos ativadas para as consultas de dados anexadas usando o cache de índices
   armazenado. Esta etapa não executa a descoberta por si só; atualize primeiro a consulta de dados
   se o cache estiver ausente ou desatualizado.
3. Aplica as regras de árvore de folhas de dispositivo ativadas.

A criação de um novo gráfico pode invocar regras de árvore de folhas de gráfico quando a automação global
de árvore estiver habilitada. A CLI não reaplica essas regras a gráficos que já
encontra criados. Portanto, uma regra de folha de gráfico nova ou modificada não preenche retroativamente
gráficos existentes apenas porque a CLI foi reexecutada. Consulte o
[problema #211](https://github.com/kadupulhq/kadupul/issues/211). Verifique a localização
separadamente; não exclua e recrie gráficos históricos apenas para acionar o gancho de criação.

Execuções repetidas suprimem um gráfico não indexado existente por dispositivo e modelo de gráfico.
Gráficos indexados são verificados por dispositivo, consulta de dados, tipo de gráfico e índice. Isso
evita criações duplicadas em execuções sequenciais; não garante concorrência.
Verifique a lista de gráficos e a árvore após a execução, juntamente com as mensagens de log `AUTOM8` sobre
gráficos ignorados, dados inválidos ou falhas de criação.

Um ponto é ignorado silenciosamente a ponto de gerar confusão: um modelo de gráfico com um campo
marcado como substituível que não possui valor padrão não é elegível para automação. A execução
registra que ele não foi adicionado porque um campo substituível não tem padrão e segue
adiante. Se um modelo esperado nunca surgir, essa é a primeira coisa a conferir. Consulte
[Modelos](/pt-br/concepts/templates/) para entender o que é um campo substituível.

## Armadilhas

**Desativar uma regra não desfaz o trabalho realizado.** Não remove gráficos ou entradas de
árvore já criados. A exclusão de dispositivos possui comportamento de limpeza separado para
gráficos e fontes de dados; revise as opções de exclusão antes de remover um dispositivo.

**Uma varredura interrompida parece uma varredura concluída.** O limite de execução encerra
a descoberta onde quer que ela esteja. Os totais registrados são os totais do trabalho que foi
concluído, e nada sinaliza o resultado como parcial. Compare a contagem de endereços escaneados
com o tamanho do intervalo.

**Regras são executadas contra o cache da consulta de dados, não contra o dispositivo.** Uma regra de gráfico
que não corresponde a nada frequentemente significa que a consulta de dados nunca rodou ou rodou sem encontrar índices.
Consulte a tabela de índices descobertos antes de reescrever a regra.

**O e-mail de notificação inclui descobertas existentes e novas.** Um intervalo pode enviar e-mail
ao término, agrupando as descobertas registradas conforme cada IP constava ou não
no instantâneo pré-varredura. Isso não prova que todo endereço solicitado foi de fato escaneado.

## Modos de falha

| Sintoma | Causa comum |
|---|---|
| A varredura não localiza nada em um intervalo ocupado | Ping bloqueado, falha SNMP, exclusões ou supressão de duplicatas |
| O intervalo recusa a varredura, erro no log | Nenhum conjunto de opções SNMP associado |
| Dispositivos encontrados mas nenhum criado | Chave de criação desligada ou nenhuma regra de dispositivo coincidiu |
| Tudo recebe o mesmo modelo genérico | Ordem das regras, com uma regra geral acima das específicas |
| Apenas parte dos endereços é escaneada | Limite de execução atingido, ou intervalos sobrepostos rejeitaram um lote |
| Um dispositivo por roteador em vez de um por interface, ou o inverso | Configuração de supressão de duplicatas para o mesmo sysName |
| A regra não corresponde a nada e o log avisa sobre coluna | A regra filtra por campo não retornado pela consulta de dados |
| Modelo de gráfico nunca criado por uma regra | Falta de padrão obrigatório, saída de fonte de dados inválida ou falha de criação |
| Gráficos inesperados para interfaces adicionais | Filtro de índice de gráfico vazio ou mais amplo que o desejado |
| Nova regra de árvore não posiciona gráficos existentes | A CLI não preenche retroativamente regras de folhas de gráfico para gráficos existentes |
