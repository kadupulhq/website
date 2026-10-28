---
title: Modelo de segurança
description: Onde os dados não confiáveis entram no Kadupul, qual processo é executado com qual privilégio, o que a conta da base de dados pode fazer e quais limites o código impõe em vez de presumir.
banner:
  content: O Kadupul está em pré-alfa. Valide estes procedimentos numa instalação de teste isolada.
sidebar:
  order: 12
---

Um sistema de monitorização é algo complexo de defender, por três motivos que nada têm a ver com
a qualidade do código.

Detém credenciais para tudo o que vigia. Comunidades SNMP, nomes de utilizador e frases de acesso
v3, e tudo o que um dispositivo necessite são armazenados para que o poller os possa utilizar de
forma não assistida. Não há um ser humano para os digitar a cada cinco minutos.

Executa comandos de acordo com um agendamento. Recolher um valor que o SNMP não expõe significa
executar um script, e a definição desse script é configuração, armazenada na base de dados e editável
através da interface.

Ingere dados produzidos pelas máquinas que vigia. A descrição de uma interface, um ponto de montagem
de disco, o nome de um sensor: tudo provém do dispositivo e tudo acaba na base de dados, em títulos
de gráficos e em argumentos entregues a outros programas. Um comutador comprometido é uma fonte de
entrada, não apenas uma vítima.

Nenhum destes fatores é um defeito. São o que a função exige. O que se segue mostra onde cada um se
situa na arquitetura.

## Onde entram dados não confiáveis

Quatro pontos de entrada, em ordem aproximada de quanto um operador os controla.

| Ponto de entrada | Origem | Para onde vai |
|---|---|---|
| Parâmetros HTTP | Qualquer pessoa que consiga aceder ao servidor web | A base de dados, saída de páginas e SQL |
| Valores SNMP | O dispositivo sondado | `host_snmp_cache`, títulos de gráficos, limites RRD, argumentos de scripts |
| Saída de script | Um script local ou com o que ele comunicou | `poller_output`, depois ficheiros RRD |
| Modelos e pacotes carregados | Quem detiver o âmbito de importação | Linhas de modelos e, para pacotes, ficheiros em disco |

### Parâmetros HTTP

Os auxiliares de pedidos residem em `lib/html_utility.php`. O `get_filter_request_var()` valida
por predefinição inteiros, mas também tem casos especiais para valores vazios, indefinidos e regex.
Um chamador ainda precisa de verificar se um valor é obrigatório e apropriado para a operação. A
filtragem não estabelece autorização.

O `set_request_var()` guarda um valor em cache em `$_CACTI_REQUEST` e reflete-o nas matrizes de
pedidos. O `get_nfilter_request_var()` lê essa cache ou o pedido em bruto e não valida nem escreve
o valor por si só. As leituras posteriores podem, portanto, observar um valor previamente armazenado,
e a ordem de leitura importa.

Com `log_validation` ativado, o `get_request_var()` regista determinadas leituras de pedidos não
guardadas em cache. Leituras diretas de superglobais e `get_nfilter_request_var()` não estão todas
cobertas. Trata-se de assistência de diagnóstico, não de uma auditoria completa de validação ou
imposição estrita.

### Valores SNMP

A descoberta de consultas de dados armazena valores indexados selecionados em `host_snmp_cache`;
os resultados comuns de polling SNMP seguem o caminho de amostras. `data_query_format_record()` em
`lib/data_query.php` aplica duas transformações antes do armazenamento: um mapa opcional
`rewrite_value` da definição de consulta e `bin2hex()` em qualquer valor cuja codificação
`mb_detect_encoding()` não consiga identificar. Essa segunda operação é uma proteção contra
cadeias de octetos binários, não contra conteúdo hostil.

A partir daí, o valor viaja. Nomeia gráficos através de `substitute_snmp_query_data()`. Pode definir
um máximo RRD, porque um modelo de dados pode declarar o seu máximo como `|query_ifSpeed|`. Torna-se
um argumento para uma consulta de script, onde `get_script_query_path()` passa cada parte através
de `cacti_escapeshellarg()` primeiro.

O escape e os validadores de RRDtool descritos em
[Integração com RRDtool](/pt-pt/reference/rrdtool-integration/) constituem a fronteira aqui. Os dados
de dispositivos têm de permanecer não confiáveis. A validação e o escape são propriedades de cada
ponto de chamada; a presença de auxiliares não é prova de que cada consumidor os utilize corretamente.
Verifique tanto a estrutura do comando como o argumento substituído.

### Saída de script

O ramo `popen()` de `exec_poll()` lê com `fgets(..., 8192)`, devolvendo no máximo 8.191 bytes
ou a primeira quebra de linha. O seu recurso `shell_exec()` tem um comportamento de saída diferente,
e a recolha do servidor de scripts segue outro caminho.

`prepare_validate_result()` reconhece valores numéricos e desconhecidos, formas hexadecimais e
alguns formatos de saída com múltiplos campos. Também pode remover texto para obter um valor numérico;
não é um filtro escalar estrito universal. A análise posterior e a validação do RRDtool também
importam. Consulte [Métodos de introdução de dados](/pt-pt/reference/data-input-methods/).

As verificações de saída não isolam um script que já tenha sido executado. Reveja o comando, a lista
de permissões de entrada e os privilégios do sistema operativo antes de ativar a recolha.

### Modelos e pacotes

Dois mecanismos diferentes partilham um único âmbito.

Uma **importação de modelo** é XML simples sem assinatura. Cria modelos, consultas de dados e
métodos de introdução de dados. Um método de introdução de dados é uma linha de comandos, pelo que
este é um caminho a partir de um ficheiro carregado para algo que o poller irá executar.
`lib/import.php` executa `cacti_input_string_is_safe()` em qualquer `input_string` importado e
recusa o método quando este contém metacaracteres de shell, registando:

```
ERROR: Refusing to import data input method '<hash>' - input_string contains shell metacharacters
```

Uma **importação de pacote** é assinada. `import_read_package_data()` lê a chave pública incorporada
no pacote e compara-a com as três chaves compiladas em `lib/import.php`: as duas chaves Cacti e a chave
Kadupul. Qualquer outra chave falha. Um pacote sem elemento `<publickey>` é lido como reivindicando
a chave Cacti mais antiga, e tem então de produzir uma assinatura válida perante ela.
`import_read_package_data()` recusa qualquer chave abaixo de 2048 bits antes de tentar a verificação,
o que a chave mais antiga, com 512 bits, não supera. Cada ficheiro contido possui a sua própria
assinatura, verificada separadamente.

Os pacotes podem então escrever ficheiros selecionados. Os nomes aceites começam com `scripts/` ou
`resource/`, opcionalmente sob um prefixo válido `plugins/<name>/`. O importador rejeita bytes
NUL, travessia de diretórios e caminhos absolutos, e verifica a contenção sob a raiz da instalação;
conter simplesmente um nome de diretório é insuficiente. A capacidade de escrita do destino também
controla se a escrita é bem-sucedida. Um pacote que passa a verificação escreve PHP executável na
árvore de instalação por conceção. A verificação de assinatura estabelece a identidade de assinatura
aceite e a integridade, não que o código seja inofensivo. A autorização do âmbito, contenção de caminhos,
ficheiros selecionados, permissões do sistema de ficheiros e política de comandos permitidos também importam.

Ambos os mecanismos situam-se atrás do âmbito 17. O perfil padrão Editor de Modelos detém o âmbito 17
e o âmbito 2 (Métodos de Introdução de Dados). Uma conta com essas permissões pode definir comandos
de recolha, sujeitos à validação e manuseamento de listas de permissões. É para isso que o perfil
serve, e vale a pena sabê-lo antes de o conceder. Consulte
[Importar e exportar modelos](/pt-pt/guides/import-and-export-templates/) para conhecer o fluxo de
trabalho validado e limitações conhecidas.

## O que é executado com qual privilégio

| Processo | Iniciado por | É executado como | O que faz |
|---|---|---|---|
| Interface web | O servidor web | O utilizador do servidor web | Lê e escreve na base de dados, renderiza gráficos através do RRDtool, escreve ficheiros RRD a pedido, escreve ficheiros de pacotes durante a importação |
| `poller.php` | Agendador ou serviço configurado | Conta de serviço/agendador | Lê a cache do poller, inicia coletores, escreve ficheiros RRD |
| `cmd.php` | Poller ou caminho de recolha em tempo real | Conta iniciadora | Executa pedidos SNMP get e comandos de recolha |
| `script_server.php` | Coletor | Conta iniciadora | Inclui um ficheiro PHP e chama uma função no seu próprio processo |
| RRDtool | O processo web ou o poller | Aquele que o chamou | Lê e escreve ficheiros sob `rra/` |

Dois deles merecem uma atenção mais detalhada:

**O servidor de scripts não é um ambiente isolado.** Inclui o ficheiro de destino num processo PHP
de longa duração e chama uma função nele. Essa função partilha o processo, a sua memória e a sua
ligação à base de dados. As verificações em `script_server.php` decidem se a chamada acontece:
o `realpath()` do ficheiro a incluir tem de resolver sob `$config['base_path']` ou
`$config['scripts_path']`, a função tem de existir após a inclusão,
`ReflectionFunction::isInternal()` tem de ser false e o ficheiro que define a função também tem
de estar sob uma raiz permitida. Superadas essas condições, o código é executado com todos os
privilégios do poller. Um método do servidor de scripts é uma forma de executar PHP dentro do
Kadupul, não ao lado dele.

**O processo web pode escrever ficheiros RRD.** Os pedidos de gráficos podem acionar atualizações
Boost a pedido e a criação de ficheiros. Um aviso que delega um caminho de criação de diretórios ao
poller não torna o acesso de escrita web universalmente opcional. A verificação prévia de armazenamento
e a coordenação de manutenção também verificam o acesso à conta e configurações UID/GID numéricas
de confiança. A criação executada como root tenta corresponder à propriedade do armazenamento, mas
podem ser registadas falhas. Consulte [Atualizar em segurança](/pt-pt/guides/upgrade-safely/).

As contas da web e do poller agendado podem diferir. A recolha em tempo real iniciada a partir de
um pedido web pode herdar a conta web, pelo que a execução de comandos não está restrita à identidade
do poller agendado. A integração herdada do Spine exige validação separada contra o binário real;
esta página não estabelece uma compilação suportada.

## O que a conta da base de dados necessita

Processos que utilizam a mesma configuração de base de dados partilham normalmente a sua conta.
Coletores remotos podem ter credenciais locais e centrais separadas; configurações específicas de
implementação podem diferir. Inspecione as concessões reais de cada conta configurada.

| Requisito | Porquê |
|---|---|
| DML completo no esquema Kadupul | Operação normal |
| DDL no esquema Kadupul | Atualizações e operações em tempo de execução como rotação de tabelas Boost, tabelas temporárias e alterações de ciclo de vida de plugins |
| `SELECT` em `mysql.time_zone_name` | As listas de fusos horários do site e dos coletores leem essa tabela diretamente |

Não remova privilégios DDL sob a presunção de que apenas as atualizações precisam deles. A aplicação
não muda universalmente para uma identidade de migração separada; a separação de contas requer
validação específica da implementação de todos os caminhos de execução afetados.

O `include/config.php` contém credenciais de base de dados e os coletores remotos também podem deter
credenciais centrais `$rdatabase_*`. Permissões do sistema de ficheiros, regras de acesso HTTP,
configuração do processador PHP e proteção de cópias de segurança são essenciais. O PHP normalmente
executa o ficheiro em vez de servir o seu código-fonte, mas isso não substitui a sua proteção contra
divulgação direta. Consulte
[Proteger uma instalação exposta à Internet](/pt-pt/guides/secure-an-internet-facing-install/).

As credenciais de dispositivos são armazenadas da mesma forma. `host.snmp_community`,
`host.snmp_password` e `host.snmp_priv_passphrase` são colunas comuns, escritas por
`api_device_save()` através de `form_input_validate()` sem etapa de encriptação, e copiadas para
linhas `poller_item` para o poller ler. O acesso de leitura às tabelas relevantes pode expor
credenciais armazenadas; não implica acesso a todas as fontes externas. As palavras-passe de
utilizadores são a exceção: `compat_password_hash()` utiliza o `password_hash()` do PHP com
`PASSWORD_DEFAULT`, e uma hash MD5 legada que ainda verifique é recalculada no início de sessão seguinte.

## Imposto e meramente convencional

Esta é a distinção mais importante ao analisar uma alteração.

### Mecanismos de código e o seu âmbito

| Limite | Mecanismo |
|---|---|
| Autenticação | As páginas de interface comuns utilizam `include/auth.php`; pontos de acesso especializados têm o seu próprio tratamento |
| CSRF | A inicialização web partilhada configura o tratamento de tokens; matrizes malformadas são rejeitadas. Verifique cada ponto de acesso em vez de assumir cobertura universal |
| Scripts apenas para CLI | `include/cli_check.php` responde com `404` e termina quando a SAPI não é `cli` |
| Localização XML da consulta de dados | `cacti_path_is_within()` contra `<base_path>/resource`, registado e recusado caso contrário |
| Autenticidade do pacote | Assinatura contra chave compilada, mínimo de 2048 bits, assinaturas por ficheiro |
| Colocação de ficheiros do pacote | Nomes inválidos rejeitados; prefixos permitidos de script/recurso e contenção sob a raiz verificados |
| Destinos do servidor de scripts | Contenção por `realpath()`, além das verificações de função acima |
| Argumentos da shell | Escape, auxiliares de comandos estruturados e validadores onde aplicados; inspecione o ponto de chamada real |
| Argumentos do RRDtool | Validadores de caracteres de controlo e formato em `lib/functions.php` |
| SQL | Auxiliares preparados vinculam valores; SQL dinâmico, identificadores e chamadas não preparadas continuam a exigir revisão |
| Chamadores de agentes remotos | O endereço de origem tem de corresponder a uma linha ativa em `poller`, por IP exato ou pesquisa inversa confirmada |

### Responsabilidades da implementação e dos pontos de chamada

| Limite | Por que não é imposto |
|---|---|
| Filtragem de pedidos | Uma página escolhe `get_filter_request_var()` ou não. O `log_validation` reporta, não bloqueia |
| Escape de saída | `html_escape()` e `html_purify()` são aplicados por ponto de chamada |
| Autorização por página | A verificação de âmbito usa `$user_auth_realm_filenames`, indexada por nome de ficheiro. Uma página não mapeada não recebe verificação positiva apenas dessa tabela. Verificações adicionais podem aplicar-se; páginas de plugins devem registar e aplicar a sua política |
| Negação de diretório | Os ficheiros `.htaccess` sob `cli/`, `log/`, `rra/`, `scripts/`, `contrib/`, `mibs/` e `cache/*` são diretivas Apache. Em nginx, ou Apache com `AllowOverride` desativado, nenhum se aplica |
| Cabeçalhos de segurança em ficheiros estáticos | O `.htaccess.dist` é fornecido sem renomeação. A emissão de cabeçalhos PHP depende do seu caminho e definições; respostas estáticas dependem da configuração do servidor/proxy |
| Separação de utilizadores web e do poller | Uma convenção, não uma exigência |
| Permissões em `include/config.php` | Definidas por quem o instalou |

Os ficheiros de redirecionamento `index.php` em `resource/` e subdiretórios impedem a listagem
de diretórios. Não constituem controlo de acesso e não impedem um pedido direto a um ficheiro nomeado.

## Pontos de acesso que respondem antes da autenticação

Estes são exemplos de pontos de entrada especializados, não um inventário exaustivo de pontos
públicos. A ausência da inclusão comum não prova a ausência de autenticação ou autorização noutro
ponto do caminho do pedido.

| Ficheiro | Comportamento |
|---|---|
| `auth_login.php`, `auth_changepassword.php` | A superfície de início de sessão em si |
| `csp_report.php` | Recebe relatórios de violação de CSP do navegador |
| `service_check.php` | Responde `success` ou `fail` após uma consulta a `version`. Uma sonda de atividade sem autenticação |
| `link.php` | Carrega uma linha de ligação externa e depois verifica `is_realm_allowed($page['id'] + 10000)` por si só |
| `remote_agent.php` | O RPC do coletor de dados, autorizado por endereço de origem |

O `remote_agent.php` é o ponto crucial a analisar. A sua autorização assenta em
`remote_client_authorized()`, que compara `get_client_addr()` com os nomes de anfitrião e
endereços na tabela `poller`. Não existe segredo partilhado. Um chamador cujo endereço corresponda
a uma linha de coletor de dados ativado pode invocar as ações do agente: recolher dados, executar uma
consulta de dados, enviar ping a um dispositivo, realizar pedidos SNMP get e walk, solicitar dados de
gráficos e executar descoberta de rede. Duas proteções moldam isto: primeiro, a função devolve false
de imediato quando no máximo uma linha de coletor ativado é retornada, rejeitando esse caso. Segundo,
quando a correspondência é por nome de anfitrião em vez de IP exato, a pesquisa inversa é confirmada
por uma pesquisa direta antes de ser aceite.

O `get_client_addr()` lê `REMOTE_ADDR` e nada mais, a menos que `$proxy_headers` esteja definido
em `include/config.php`. A predefinição é `null`. Ativar cabeçalhos de proxy suportados altera as
fontes ordenadas a partir das quais é selecionado um endereço de cliente válido. Utilize apenas
cabeçalhos controlados pelo proxy de entrada fidedigno e impeça os clientes de contornar ou fornecer
esses valores diretamente. Esta é a linha de configuração única que mais altera o significado de cada
decisão baseada em endereços no sistema, incluindo a autorização de agentes remotos e os endereços
registados no log.

## Acesso de convidados

A definição `guest_user` nomeia uma conta cujas permissões são utilizadas para páginas de gráficos
sem início de sessão. Por predefinição não há utilizador configurado, pelo que a visualização de
gráficos requer autenticação como tudo o resto. Ao configurá-la, publica o que essa conta pode ver
para qualquer pessoa que consiga aceder ao servidor web. Esse é o objetivo da funcionalidade. A conta
continua a existir nos registos de utilizadores; a definição de convidado é o que torna as suas
permissões de gráficos utilizáveis sem início de sessão normal. Verifique pedidos reais e permissões
de objetos, não apenas o nome da conta configurada.

## Como refletir sobre uma alteração

Faça três perguntas por ordem:

Qual processo executará isto e como qual utilizador? A resposta para um método de introdução de dados
é normalmente a conta do sistema operativo do coletor iniciador; a recolha acionada pela web pode
diferir da recolha agendada.

O que os dados tocam no seu caminho? Um valor de um dispositivo que apenas aterra num ficheiro RRD
atravessou um limite. O mesmo valor no título de um gráfico atravessou dois, e num argumento de
script, três.

O limite em que confio é imposto ou convencional? Se for convencional, o código que está a escrever
é a imposição efetiva.

Leituras relacionadas: [Permissões e acesso](/pt-pt/concepts/permissions-and-access/) para o modelo
de autorização em si, [Métodos de introdução de dados](/pt-pt/reference/data-input-methods/) para o
contrato de execução e a lista de permissões de entrada, e
[Recolha remota de dados](/pt-pt/concepts/remote-data-collection/) para o que um coletor de dados
faz com a confiança que lhe é concedida.
