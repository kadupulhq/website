---
title: Adicionar o primeiro dispositivo
description: Coloque um dispositivo a ser sondado e confirme que os dados estão a chegar antes de construir o que quer que seja por cima.
sidebar:
  order: 3
banner:
  content: O Kadupul está em pré-alfa. Valide estes procedimentos numa instalação de teste isolada. Tradução em rascunho, pendente de revisão por uma pessoa fluente no idioma.
---

Adicione um dispositivo, confirme que está a responder e só depois avance. A maioria dos problemas num sistema de monitorização tem origem num dispositivo que, na verdade, nunca esteve a responder desde o início.

Escolha um dispositivo com o qual se possa dar ao luxo de errar. Um comutador seu, numa rede que controla, já com SNMP ativado. Não comece pelo dispositivo sobre o qual alguém lhe está a perguntar.

## Antes de começar

Para este exemplo com SNMP, o dispositivo tem de responder aos pedidos do seu recolhedor atribuído. Execute as verificações nesse recolhedor, preferencialmente com o utilizador do sondador; um pedido a partir do seu computador portátil pode seguir um caminho de firewall diferente. Substitua o endereço e a comunidade do exemplo pelas credenciais de apenas leitura configuradas no seu dispositivo. Os OID numéricos abaixo também funcionam quando os ficheiros locais de nomes MIB não estão instalados.

```bash
snmpget -v2c -c 'your-read-only-community' switch.example.net .1.3.6.1.2.1.1.1.0
```

Se o comando devolver uma cadeia de descrição, continue. Se esgotar o tempo limite, resolva isso primeiro. Nenhuma quantidade de configuração na interface web fará um dispositivo inacessível responder.

De seguida, verifique a tabela que quer efetivamente colocar em gráfico, pois um dispositivo pode responder a `sysDescr` e ainda assim recusar a tabela de interfaces.

```bash
snmpwalk -v2c -c 'your-read-only-community' switch.example.net .1.3.6.1.2.1.2.2.1.2
```

O segundo OID corresponde à coluna `ifDescr`. Pretende-se uma linha por cada interface exposta. Um resultado vazio pode indicar uma vista SNMP restrita ou uma tabela não suportada; um erro de autorização aponta para as credenciais ou para a política de acesso. Inspecione o erro devolvido antes de alterar a configuração do dispositivo ou do Kadupul.

Dois factos sobre as versões de SNMP determinam opções posteriores, pelo que devem ser decididos agora.

| Versão | O que significa para si |
|---|---|
| v1 | Sem suporte para Counter64. Ligações rápidas podem reiniciar contadores de octetos de 32 bits várias vezes entre sondagens, tornando a taxa ambígua |
| v2c | Suporta Counter64 quando o agente o expõe; as cadeias de comunidade são enviadas em texto simples |
| v3 | Suporta autenticação e encriptação com `authPriv`; escolher v3 isoladamente não ativa ambos |

Prefira v3 com `authPriv` onde suportado, ou v2c numa rede de gestão restrita. Selecione o tipo de gráfico de interface de 64 bits bem como a versão de SNMP. Se o dispositivo apenas suportar v1, considere o intervalo de sondagem e a taxa de tráfego na tabela de falhas no fundo desta página. [SNMP](/pt-pt/reference/snmp/) detalha todos os campos de credenciais.

## Decidir três coisas antes de abrir o formulário

**As credenciais.** Exatamente as que testou acima, incluindo a porta se não for a predefinida.

**O método de disponibilidade.** É assim que o Kadupul decide se o dispositivo está ativo, sendo independente do funcionamento da recolha. As opções fornecidas são none, ping, SNMP uptime, SNMP description, SNMP getNext e duas combinações de ping com SNMP uptime, uma exigindo ambos e outra aceitando qualquer um dos dois.

Prefira um método SNMP para um dispositivo que está a sondar via SNMP. Testa aquilo de que depende. O ping ICMP requer um socket não processado (raw socket), o qual necessita de privilégios que as contas do servidor web e do sondador habitualmente não possuem; portanto, um dispositivo que responde a `ping` na sua consola pode continuar a ser reportado como em baixo. Um ping TCP direcionado a uma porta que saiba estar aberta evita esse problema.

**O modelo de dispositivo.** Escolha um que corresponda ao hardware.

## Adicioná-lo

1. Na página clássica **Devices** (`host.php`), escolha **Add**. A criação de dispositivos e a configuração de gráficos continuam a utilizar esta página durante a migração para o Symfony. Introduza uma descrição, o nome de anfitrião ou endereço, o recolhedor atribuído, a versão de SNMP e as credenciais.
2. Defina o método de disponibilidade que escolheu.
3. Escolha o modelo de dispositivo.
4. Guarde, confirme que o dispositivo está ativado e leia o respetivo painel de disponibilidade/SNMP. Um registo gravado na base de dados não constitui prova de que a recolha teve sucesso.

## O que o modelo de dispositivo decide

Um modelo de dispositivo associa modelos de gráficos e consultas de dados ao dispositivo. Uma consulta de dados percorre uma tabela no dispositivo, tal como as suas interfaces, e gera um índice por linha. A aplicação do modelo também executa as respetivas consultas de dados para preencher esses índices. Com a automatização de gráficos desativada, essas associações não criam gráficos por si só. Quando a automatização de gráficos está ativada, os ganchos de modelo/consulta podem gerar gráficos segundo regras de correspondência; inspecione os gráficos existentes antes de adicionar uma cópia suplementar.

Mudar de modelo pode alterar associações e executar esses ganchos novamente. Não se trata de uma reposição dos gráficos ou fontes de dados existentes. Verifique o modelo selecionado e os índices consultados antes de o aplicar a um dispositivo que já tenha histórico.

Esses índices são o motivo pelo qual seleciona interfaces a partir de uma lista em vez de digitar OIDs. [Modelos](/pt-pt/concepts/templates/) e [Consultas de dados e índices](/pt-pt/concepts/data-queries-and-indexes/) abordam ambos os temas em detalhe.

## Ler o painel de estado

Quando o dispositivo é guardado com um método de disponibilidade SNMP, o Kadupul abre uma sessão e apresenta o resultado. Esta é a verificação que realmente importa, e é a que muitos ignoram.

| O que vê | O que significa |
|---|---|
| As consultas de sistema e de tempo de atividade têm sucesso | O painel consegue ler metadados básicos de SNMP. Isto ainda não comprova a recolha de interfaces |
| Localização ou Contacto está vazio | Estes campos opcionais de metadados podem não estar definidos; estarem vazios não representa uma falha de recolha |
| SNMP não está em uso | Não existe comunidade nem utilizador no dispositivo, ou a versão está definida como none |
| Erro de SNMP na sessão | O estabelecimento da sessão falhou; inspecione o erro apresentado, as credenciais, o protocolo e as definições de ligação |
| Erro de SNMP no sistema | A leitura de `sysDescr` falhou; verifique o erro devolvido, a vista do agente, as credenciais e a acessibilidade |
| Erro de SNMP no anfitrião | Nem a descrição nem o tempo de atividade foram devolvidos |
| Tempo de atividade apresentado como `U` | O tempo de atividade não pôde ser lido. Alguns dispositivos genuinamente não o comunicam |

Se o método de disponibilidade incluir ping, surge abaixo um resultado de ping separado. Leia ambos. Um dispositivo pode passar num e falhar no outro, e o que falha indica-lhe para onde olhar.

Uma descrição de sistema em branco não prova que a recolha esteja a falhar. O código acomoda agentes com uma descrição vazia e um tempo de atividade utilizável. Dispositivos desativados ignoram a verificação de disponibilidade, e métodos de disponibilidade não baseados em SNMP não exibem este painel de SNMP. De seguida, confirme a consulta real e a cache do sondador.

## Criar as fontes de dados e os gráficos

Para um dispositivo novo sem gráficos criados por automatização, o passo seguinte consiste em criar o gráfico e a respetiva fonte de dados. Verifique **Data Source List** e **View Poller Cache** na página do dispositivo em vez de assumir que estão vazios.

A partir da página do dispositivo, escolha **Create Graphs for this Device**. Para um comutador, isto significa executar a consulta de dados de interfaces, selecionar as interfaces que lhe interessam e escolher um tipo de gráfico para as mesmas. Escolha duas ou três interfaces, e não todas as quarenta e oito. Está a validar se o caminho funciona, e um primeiro lote reduzido é muito mais fácil de interpretar no passo seguinte.

Um gráfico indexado associa fontes de dados à interface escolhida e prepara as respetivas entradas na cache do sondador; fontes compatíveis existentes podem ser reutilizadas. A resposta de criação de gráficos não prova a ocorrência de sondagem. Verifique se a cache contém o dispositivo esperado, os OID da interface e o caminho RRD.

## Confirmar que a recolha está a funcionar

Aguarde pelos ciclos de recolha planeados e, de seguida, verifique tanto os carimbos de data/hora como os valores. Um gráfico vazio pode dever-se à normalização de arranque, a um valor desconhecido ou a uma recolha com falhas. São necessárias duas leituras de contador para calcular uma taxa, mas duas execuções do sondador não garantem um intervalo de consolidação concluído e válido.

Verifique três aspetos, por esta ordem.

**O sondador foi executado.** Procure o resumo de conclusão no registo configurado. Se estiver ausente, verifique o agendamento, o destino do registo e as permissões, e se o sondador terminou antes da conclusão. Consulte [Registo](/pt-pt/reference/logging/).

**O ficheiro existe e é recente.** Copie o caminho RRD real a partir da fonte de dados ou da cache do sondador; não o deduza a partir do nome de anfitrião. Caminhos e nomes podem ser personalizados. Consulte [Estrutura de ficheiros](/pt-pt/reference/file-layout/). Pergunte ao RRDtool quando o ficheiro foi gravado pela última vez:

```bash
rrdtool last /path/to/rra/the_actual_file.rrd
rrdtool lastupdate /path/to/rra/the_actual_file.rrd
rrdtool fetch /path/to/rra/the_actual_file.rrd AVERAGE --start end-30m --end now
```

O carimbo de data/hora deve avançar a cada gravação bem-sucedida. Um carimbo de data/hora recente ainda pode acompanhar um valor desconhecido, e gravações em memória intermédia (buffer) podem atrasar o carimbo em disco. No caso de `rrdcached` ou Boost, confirme também o estado de esvaziamento desse componente.

**O valor não é desconhecido.** `lastupdate` apresenta os valores fornecidos mais recentes; para um contador, trata-se de contadores brutos, e não de taxas de tráfego calculadas. Inspecione as linhas concluídas de `fetch` para verificar taxas finitas. A temporização de arranque, o alinhamento de passos, o heartbeat, os limites e o limiar de dados desconhecidos da consolidação afetam o momento em que surge uma linha utilizável. Não diagnostique uma anomalia apenas pelas primeiras duas linhas. Se os valores desconhecidos persistirem, examine os valores recolhidos, o tipo de fonte de dados, o heartbeat e os erros do sondador.

## Falhas iniciais comuns

| Sintoma | Causa habitual |
|---|---|
| Grava, mas a consulta da descrição do sistema reporta um erro | Verifique as credenciais, a vista do agente e a acessibilidade do recolhedor; uma descrição vazia por si só não constitui prova suficiente |
| Erro de SNMP na sessão a partir do Kadupul, mas `snmpget` funciona no seu computador portátil | O caminho da firewall difere ou o agente restringe por endereço de origem |
| O dispositivo surge em baixo, mas chegam dados SNMP | A disponibilidade está definida para ping ICMP, que não consegue abrir um socket não processado |
| A descrição surge, mas não há dados | O sondador não está agendado ou corre com um utilizador sem permissão de escrita no diretório RRD |
| A consulta de dados não devolve interfaces | A vista do agente exclui a tabela de interfaces ou o dispositivo necessita de uma reindexação |
| Primeiro valor desconhecido, depois normaliza | Normal para um contador. Necessita de duas leituras para produzir uma taxa |
| Os valores desconhecidos persistem | Falha de recolha, valores inválidos, discrepância de tipos/limites, heartbeat ou normalização da consolidação |
| Há dados durante algum tempo e depois surgem falhas | O sondador demora mais do que o seu intervalo ou o dispositivo limita a taxa de SNMP |
| As taxas do contador são inverosímeis | Múltiplos reinícios de 32 bits, reposição do contador, unidades ou definições da fonte de dados; utilize contadores de 64 bits suportados em ligações rápidas |
| As interfaces desenham as portas erradas após um reinício | Os índices mudaram. A consulta de dados precisa de um método de reindexação que o intercepte |

Vale a pena compreender este último ponto antes de gerir uma centena de comutadores: os índices de interface SNMP não têm garantia de estabilidade após um reinício ou uma troca de módulo. O método de reindexação numa consulta de dados é o que mantém um gráfico apontado para a mesma porta física. [Consultas de dados e índices](/pt-pt/concepts/data-queries-and-indexes/) explica as opções.

Quando tiver um dispositivo a recolher sem falhas, adicione os restantes em massa em vez de um a um. [Descobrir dispositivos automaticamente](/pt-pt/guides/discover-devices-automatically/) e as ferramentas de linha de comandos em [Ferramentas de linha de comandos](/pt-pt/reference/command-line-tools/) são ambos preferíveis a repetir esta página cinquenta vezes.

A seguir: [Interpretar o primeiro gráfico](/pt-pt/start/first-graph/).
