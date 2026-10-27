---
title: Adicionar o primeiro dispositivo
description: Coloque um dispositivo para ser monitorado e confirme se os dados estão chegando antes de construir qualquer coisa em cima.
sidebar:
  order: 3
banner:
  content: O Kadupul está em pré-alfa. Valide estes procedimentos em uma instalação de teste isolada. Tradução em rascunho, pendente de revisão por uma pessoa fluente no idioma.
---

Adicione um dispositivo, confirme que ele está respondendo e só então prossiga. A maioria dos problemas em um sistema de monitoramento tem origem em um dispositivo que, na verdade, nunca respondeu desde o início.

Escolha um dispositivo com o qual você possa se dar ao luxo de errar. Um switch seu, em uma rede sob seu controle, com SNMP já habilitado. Não comece pelo dispositivo sobre o qual alguém está cobrando você.

## Antes de começar

Para este exemplo com SNMP, o dispositivo precisa responder às consultas do seu coletor atribuído. Execute as verificações nesse coletor, preferencialmente como o usuário do poller; uma requisição feita a partir do seu notebook pode seguir um caminho de firewall diferente. Substitua o endereço e a comunidade do exemplo pelas credenciais somente leitura configuradas no seu dispositivo. Os OIDs numéricos abaixo também funcionam quando os arquivos locais de nomes MIB não estão instalados.

```bash
snmpget -v2c -c 'your-read-only-community' switch.example.net .1.3.6.1.2.1.1.1.0
```

Se o comando retornar uma string descritiva, continue. Se esgotar o tempo limite, resolva isso primeiro. Nenhuma quantidade de configuração na interface web fará um dispositivo inacessível responder.

Em seguida, verifique a tabela que você realmente deseja exibir em gráfico, pois um dispositivo pode responder a `sysDescr` e mesmo assim recusar a tabela de interfaces.

```bash
snmpwalk -v2c -c 'your-read-only-community' switch.example.net .1.3.6.1.2.1.2.2.1.2
```

O segundo OID corresponde à coluna `ifDescr`. Você deve obter uma linha por interface exposta. Um resultado vazio pode indicar uma visão SNMP restrita ou uma tabela sem suporte; um erro de autorização aponta para credenciais ou para a política de acesso. Inspecione o erro retornado antes de alterar a configuração do dispositivo ou do Kadupul.

Dois fatos sobre as versões do SNMP definem decisões futuras, portanto resolva-os agora.

| Versão | O que isso significa para você |
|---|---|
| v1 | Sem suporte a Counter64. Links rápidos podem estourar contadores de octetos de 32 bits várias vezes entre coletas, tornando a taxa ambígua |
| v2c | Suporta Counter64 quando o agente o expõe; as strings de comunidade são enviadas em texto não criptografado |
| v3 | Suporta autenticação e criptografia com `authPriv`; escolher apenas v3 não ativa ambos automaticamente |

Prefira v3 com `authPriv` onde houver suporte, ou v2c em uma rede de gerenciamento restrita. Selecione o tipo de gráfico de interface de 64 bits bem como a versão do SNMP. Se o dispositivo suportar apenas v1, leve em consideração o intervalo de coleta e a taxa de tráfego na tabela de falhas ao final desta página. [SNMP](/pt-br/reference/snmp/) detalha todos os campos de credenciais.

## Decidir três coisas antes de abrir o formulário

**As credenciais.** Exatamente as que você testou acima, incluindo a porta se não for a padrão.

**O método de disponibilidade.** É assim que o Kadupul decide se o dispositivo está ativo, e isso independe do sucesso da coleta. As opções disponíveis são none, ping, SNMP uptime, SNMP description, SNMP getNext e duas combinações de ping com SNMP uptime: uma exigindo ambos e outra aceitando qualquer um dos dois.

Prefira um método SNMP para um dispositivo que você está monitorando via SNMP. Ele testa exatamente aquilo de que você depende. O ping ICMP requer um raw socket, o que exige privilégios que as contas da web e do poller normalmente não têm; portanto, um dispositivo que responde ao `ping` no seu terminal ainda pode ser reportado como inativo. Um ping TCP contra uma porta que você sabe estar aberta evita esse problema.

**O template de dispositivo.** Escolha um compatível com o hardware.

## Adicioná-lo

1. Na página legada **Devices** (`host.php`), escolha **Add**. A criação de dispositivos e a configuração de gráficos ainda utilizam esta página durante a migração para o Symfony. Insira uma descrição, o hostname ou endereço, o coletor atribuído, a versão do SNMP e as credenciais.
2. Defina o método de disponibilidade escolhido.
3. Escolha o template de dispositivo.
4. Salve, confirme se o dispositivo está ativado e examine o painel de disponibilidade/SNMP. Um registro salvo no banco de dados não é evidência de que a coleta foi bem-sucedida.

## O que o modelo de dispositivo decide

Um template de dispositivo associa templates de gráficos e consultas de dados ao dispositivo. Uma consulta de dados percorre uma tabela no dispositivo, como suas interfaces, e gera um índice por linha. A aplicação do template também executa essas consultas de dados para preencher esses índices. Com a automação de gráficos desativada, essas associações não criam gráficos sozinhas. Quando a automação de gráficos está ativada, ganchos de template/consulta podem criar gráficos sob regras correspondentes; inspecione os gráficos existentes antes de adicionar uma cópia extra.

Alterar um template pode mudar as associações e reexecutar esses ganchos. Isso não redefine gráficos ou fontes de dados existentes. Verifique o template selecionado e os índices consultados antes de aplicá-lo a um dispositivo que já tenha histórico.

Esses índices são a razão pela qual você seleciona interfaces a partir de uma lista em vez de digitar OIDs manualmente. [Modelos](/pt-br/concepts/templates/) e [Consultas de dados e índices](/pt-br/concepts/data-queries-and-indexes/) explicam ambos os conceitos detalhadamente.

## Ler o painel de status

Quando o dispositivo é salvo com um método de disponibilidade SNMP, o Kadupul abre uma sessão e exibe o resultado. Esta é a verificação mais importante, e é a que as pessoas costumam ignorar.

| O que você vê | O que significa |
|---|---|
| Consultas de sistema e uptime são bem-sucedidas | O painel consegue ler metadados básicos de SNMP. Isso ainda não comprova a coleta de interfaces |
| Localização ou Contato está vazio | Esses campos opcionais de metadados podem não estar definidos; estarem vazios não representa falha de coleta |
| SNMP não está em uso | Não há comunidade ou usuário configurado no dispositivo, ou a versão está definida como none |
| Erro de SNMP na sessão | A inicialização da sessão falhou; verifique o erro exibido, as credenciais, o protocolo e as opções de conexão |
| Erro de SNMP no sistema | A leitura de `sysDescr` falhou; confira o erro retornado, a visão do agente, as credenciais e a conectividade |
| Erro de SNMP no host | Nem a descrição nem o tempo de atividade retornaram |
| Uptime exibido como `U` | O tempo de atividade não pôde ser lido. Alguns dispositivos genuinamente não o informam |

Se o método de disponibilidade incluir ping, um resultado de ping separado aparecerá abaixo. Leia ambos. Um dispositivo pode passar em um e falhar no outro, e saber qual falhou aponta para onde procurar.

Uma descrição de sistema em branco não prova que a coleta esteja falhando. O código é preparado para agentes com descrição vazia e uptime aproveitável. Dispositivos desativados ignoram a checagem de disponibilidade, e métodos de disponibilidade que não usam SNMP não exibem este painel SNMP. Em seguida, verifique a consulta real e o cache do poller.

## Criar as fontes de dados e os gráficos

Para um dispositivo novo sem gráficos gerados por automação, o próximo passo consiste em criar o gráfico e sua fonte de dados. Verifique **Data Source List** e **View Poller Cache** na página do dispositivo em vez de assumir que estejam vazios.

Na página do dispositivo, escolha **Create Graphs for this Device**. Para um switch, isso significa executar a consulta de dados de interfaces, selecionar as interfaces de seu interesse e escolher um tipo de gráfico para elas. Escolha duas ou três interfaces, não todas as quarenta e oito. Você está validando se o fluxo funciona, e um primeiro lote reduzido é muito mais fácil de interpretar no próximo passo.

Um gráfico indexado associa fontes de dados à interface escolhida e prepara suas entradas no cache do poller; fontes existentes compatíveis podem ser reutilizadas. A resposta de criação do gráfico não prova que a coleta está ocorrendo. Verifique se o cache contém o dispositivo esperado, os OIDs de interface e o caminho RRD.

## Confirmar que a coleta está funcionando

Aguarde os ciclos de coleta agendados e, em seguida, verifique os carimbos de data/hora e os valores. Um gráfico vazio pode indicar normalização de inicialização, um valor desconhecido ou falha na coleta. São necessárias duas leituras de contador para calcular uma taxa, mas duas execuções do poller não garantem um intervalo de arquivo concluído e válido.

Verifique três itens, nesta ordem.

**O poller rodou.** Procure o resumo de conclusão de execução no log configurado. Se estiver ausente, verifique o agendamento, o destino do log e as permissões, além de conferir se o poller encerrou antes de terminar. Consulte [Logging](/pt-br/reference/logging/).

**O arquivo existe e é recente.** Copie o caminho RRD real da fonte de dados ou do cache do poller; não deduza a partir do hostname. Caminhos e nomes podem ser personalizados. Consulte [Estrutura de arquivos](/pt-br/reference/file-layout/). Pergunte ao RRDtool quando o arquivo foi gravado pela última vez:

```bash
rrdtool last /path/to/rra/the_actual_file.rrd
rrdtool lastupdate /path/to/rra/the_actual_file.rrd
rrdtool fetch /path/to/rra/the_actual_file.rrd AVERAGE --start end-30m --end now
```

O carimbo de data/hora deve avançar a cada gravação bem-sucedida. Um carimbo recente ainda pode acompanhar um valor desconhecido, e gravações em buffer podem atrasar o carimbo em disco. Para o `rrdcached` ou Boost, verifique também o estado de descarga (flush) desse componente.

**O valor não é desconhecido.** `lastupdate` exibe os valores fornecidos mais recentes; para um contador, esses são contadores brutos, não taxas de tráfego calculadas. Inspecione as linhas concluídas de `fetch` para observar taxas finitas. O momento da inicialização, o alinhamento de etapas, o heartbeat, os limites e o limite de dados desconhecidos do arquivo afetam quando uma linha utilizável aparece. Não diagnostique uma falha apenas pelas duas primeiras linhas. Se os valores desconhecidos persistirem, examine os valores coletados, o tipo de fonte de dados, o heartbeat e os erros do poller.

## Primeiras falhas comuns

| Sintoma | Causa habitual |
|---|---|
| Salva, mas a consulta da descrição do sistema relata um erro | Verifique as credenciais, a visão do agente e a conectividade do coletor; uma descrição vazia por si só não é evidência suficiente |
| Erro de SNMP na sessão a partir do Kadupul, mas o `snmpget` funciona no seu notebook | O caminho do firewall difere ou o agente aplica restrição por endereço de origem |
| O dispositivo aparece como inativo, mas chegam dados SNMP | Disponibilidade configurada para ping ICMP, que não consegue abrir um raw socket |
| A descrição aparece, mas sem dados | O poller não está agendado ou roda com um usuário sem permissão de escrita no diretório RRD |
| A consulta de dados não retorna interfaces | A visão do agente exclui a tabela de interfaces ou o dispositivo precisa de uma reindexação |
| Primeiro valor desconhecido, depois normaliza | Normal para um contador. Ele necessita de duas leituras para produzir uma taxa |
| Valores desconhecidos persistem | Falha de coleta, valores inválidos, incompatibilidade de tipo/limites, heartbeat ou normalização de arquivo |
| Há dados por um tempo, depois aparecem lacunas | O poller demora mais do que o seu intervalo ou o dispositivo limita a taxa de SNMP |
| As taxas do contador são implausíveis | Múltiplos reinícios de 32 bits, reset de contador, unidades ou ajustes da fonte de dados; use contadores de 64 bits suportados em links rápidos |
| Interfaces exibem as portas erradas após um reboot | Os índices mudaram. A consulta de dados precisa de um método de reindexação que perceba isso |

Vale a pena compreender este último ponto antes de gerenciar cem switches: os índices de interface SNMP não têm garantia de estabilidade após um reboot ou troca de módulo. O método de reindexação em uma consulta de dados é o que mantém um gráfico apontado para a mesma porta física. [Consultas de dados e índices](/pt-br/concepts/data-queries-and-indexes/) detalha essas alternativas.

Assim que tiver um dispositivo coletando sem problemas, adicione os demais em lote em vez de um por vez. [Descobrir dispositivos automaticamente](/pt-br/guides/discover-devices-automatically/) e as ferramentas de linha de comando em [Ferramentas de linha de comando](/pt-br/reference/command-line-tools/) são opções muito melhores do que repetir este procedimento cinquenta vezes.

Próximo: [Interpretar o primeiro gráfico](/pt-br/start/first-graph/).
