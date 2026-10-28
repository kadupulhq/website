---
title: Migrar para novo hardware
description: Transferir uma instalação em execução para outro servidor sem perda de histórico, segundo a sequência que permite validar cada etapa.
banner:
  content: O Kadupul está em pré-alfa. Valide estes procedimentos numa instalação de teste isolada. Tradução em rascunho, pendente de revisão por uma pessoa fluente no idioma.
sidebar:
  order: 20
---

:::caution[Comportamento herdado do proxy RRDtool]
A implementação do proxy RRDtool não é suportada no Kadupul. Utilize armazenamento
RRDtool local (`storage_location = 0`). As definições de proxy, descrições de protocolos
e fluxos de trabalho presentes nesta página documentam um comportamento herdado, não uma
implementação ou caminho de migração com suporte. Consulte [o proxy RRDtool](/pt-br/reference/rrdproxy/).
:::

:::caution[Validar antes de utilizar]
O código-fonte está disponível, mas não existe uma versão com suporte nem um caminho
de migração para o Kadupul. Teste estes procedimentos numa cópia isolada com
cópias de segurança antes de depender deles. Consulte o [estado do projeto](/pt-br/project/status/).
:::

Uma migração consiste num restauro para uma máquina distinta daquela em que a cópia de
segurança teve origem. Tudo o que consta de [Cópia de segurança e restauro](/pt-br/guides/back-up-and-restore/)
aplica-se aqui; esta página aborda apenas o que difere pelo facto de o destino não ser a fonte.

Existem três diferenças fundamentais, cada uma com o seu modo de falha característico.

| Diferença | O que é afetado |
|---|---|
| Caminhos diferentes | Caminhos de arquivos gravados na base de dados e na cache do sondador |
| Identificadores numéricos de usuário e grupo distintos | O acesso a arquivos e os controlos de integridade de armazenamento podem falhar |
| Versões de tempo de execução distintas | O comportamento de extensões, da base de dados e a compatibilidade do RRD podem divergir |

## Antes de alterar o que quer que seja

Prepare primeiro o servidor de destino, deixando-o num ponto em que uma instalação limpa
funcionaria: motor de base de dados ativo, extensões PHP exigidas presentes, RRDtool instalado,
o recolhedor selecionado disponível e o servidor web configurado. Mantenha desativados o sondador,
tarefas agendadas, replicação remota e notificações externas. Não execute o instalador.
Vai substituir a base de dados, e um esquema a meio de instalar é muito mais complexo de depurar
do que um esquema limpo.

Faça corresponder rigorosamente a versão da aplicação e as dependências, incluindo alterações
locais e plugins. A tabela `version` da base de dados regista a versão do esquema e não todas
as alterações de código-fonte; igualar apenas este valor não é suficiente. Um redirecionamento
para o instalador pode sugerir uma divergência de esquema ou um restauro que ficou incompleto.
Instale o mesmo código do sistema de partida, migre, certifique o seu funcionamento e realize
depois a atualização como um processo autónomo, de acordo com
[Atualizar em segurança](/pt-br/guides/upgrade-safely/).

Defina de imediato o caminho de instalação. Ao mantê-lo exatamente igual em ambos os servidores,
evita a maior parte dos procedimentos descritos abaixo. Se tal não for viável, consulte a secção
de caminhos antes de começar.

## Sequência de procedimentos

Cada etapa valida a anterior, pelo que a sua ordem não deve ser alterada.

1. **Interrompa todos os produtores na origem e no destino.** Suspenda a recolha agendada, remota, despoletada via web e manual, bem como manutenções; aguarde que as execuções em curso terminem. Efetue a descarga de escritas diferidas unicamente após a paragem dos produtores. Preserve as linhas pendentes de confirmação na fila com o conjunto correspondente de base de dados e cópia RRD; não as elimine por truncagem.
2. **Obtenha a cópia de segurança.** Base de dados, árvore RRD e arquivos de configuração, capturados em simultâneo. As orientações de integridade de [Cópia de segurança e restauro](/pt-br/guides/back-up-and-restore/) são o princípio basilar.
3. **Transfira a árvore RRD.** Veja mais abaixo como proceder.
4. **Transfira a base de dados.**
5. **Transfira o código, as configurações e todos os elementos por estas referenciados.** Isso inclui `plugins/`, `scripts/`, `resource/` e qualquer arquivo local chamado por um método de entrada de dados.
6. **Reaplique a configuração de destino após o restauro definitivo.** Corrija caminhos, parâmetros de ligação da base de dados, titulares de processos e definições numéricas de integridade de armazenamento.
7. **Reconstrua a cache do sondador.**
8. **Execute verificações de armazenamento sob cada conta de serviço e inicie a recolha apenas no destino.** Observe arquivos de amostragem e a evolução da fila acumulada.

## Transferir a árvore RRD

Um arquivo RRD é um arquivo binário cuja estrutura interna espelha o ambiente em que foi gerado.
Uma cópia binária requer arquitetura e versão de formato de RRDtool plenamente compatíveis;
a simples coincidência no nome do sistema operativo ou na dimensão da palavra não serve de prova.
Qualquer incompatibilidade resultará em falhas de leitura. Valide os arquivos transferidos
utilizando o RRDtool instalado no destino.

Se tiver incertezas quanto à equivalência entre ambos, faça uma conversão em vez de copiar em binário.
Os comandos dump e restore nativos do RRDtool produzem uma representação textual portátil;
o Kadupul recorre a essa mesma metodologia internamente sempre que precisa de reconstruir um arquivo.

Na origem, com os processos de escrita suspensos, utilize uma nova diretoria temporária protegida:

```sh
set -eu
umask 077
rrdtool dump /path/to/source/file.rrd > /private/staging/file.xml.partial
mv /private/staging/file.xml.partial /private/staging/file.xml
```

Transfira o arquivo XML resultante de forma segura. Efetue o restauro no destino para um arquivo de teste:

```sh
set -eu
umask 077
rrdtool restore /private/staging/file.xml /private/staging/file.candidate.rrd
rrdtool info /private/staging/file.candidate.rrd
```

Repita para cada arquivo sujeito a conversão e analise o código de retorno de cada comando.
Não utilize descarregamentos parciais nem candidatos não inspecionados. O RRDtool designa o
formato XML como o [formato de transferência entre arquiteturas](https://oss.oetiker.ch/rrdtool/doc/rrddump.en.html).

Certifique-se do procedimento antes de assumir o processo integral. Copie um único arquivo, execute
`rrdtool info` sobre o mesmo no destino e compare o passo, históricos consolidados, data da última
atualização e designações das fontes de dados. Inspecione também medições via `fetch` relativas a
um período com histórico conhecido. Repita a verificação para estruturas representativas de arquivo
antes de movimentar toda a árvore e faça o inventário final dos arquivos. Consulte
[Recuperação de RRD](/pt-br/guides/recover-a-corrupted-rrd/) para exigências de validação e titularidade de arquivos.

Qualquer que seja o processo de transferência, mantenha a hierarquia de pastas sem alterações.
As subpastas situadas dentro do diretório de RRA não são opcionais; o caminho de cada arquivo
está associado individualmente a cada fonte de dados, pelo que nivelar a árvore inutiliza todas as configurações.

## A base de dados

Uma exportação e uma importação. Dois aspetos essenciais a analisar no novo servidor.

Avalie codificações de carateres, regras de ordenação (collations) e motores de armazenamento das
tabelas repostas, não apenas os parâmetros do servidor. Mantenha as especificações da origem e
comprove a compatibilidade com a versão do motor do destino antes da transição.

**Filas de recolha não são caches descartáveis.** A fila atual `poller_output` tem forçosamente
de utilizar InnoDB. A verificação prévia de armazenamento rejeita filas MEMORY. Guarde as respetivas
linhas bem como as filas de aceleração (boost) e tempo real até que as amostras estejam confirmadas;
uma cópia RRD pode ainda não abranger essas medições. Não presuma que uma tabela MEMORY restaurada
está desprovida de dados: uma exportação lógica pode conter instruções que a preencham de novo.

Com os emissores inativos e as cópias salvaguardadas, uma fila incompatível herdada pode ser
convertida de forma expressa:

```sh
php cli/upgrade_database.php --migrate-poller-queue
php cli/upgrade_database.php --check-rrd-storage
```

Execute a verificação de armazenamento com cada conta de serviço real (web e sondador). Valida o
acesso ao disco local e a fila em utilização; obter sucesso como root não valida o acesso dos
serviços. Recolhedores remotos ativos comunicam geralmente com a fila principal; recorra a
`--local` apenas se pretende testar expressamente a fila local do nó. As outras tabelas de cache
ou de suporte exigem um plano documentado de retenção ou reconstituição. Consulte os
[requisitos de armazenamento](/pt-br/reference/requirements/).

## Caminhos no novo sistema

É neste ponto que ocorrem falhas na maioria das migrações, já que grande parte dos elementos só
se torna percetível na primeira recolha de dados.

**O caminho de RRA.** Os caminhos normais de fontes de dados usam o marcador `<path_rra>`. Nesta
versão, o arranque constrói `$config['rra_path']` a partir do diretório da aplicação com a adição
de `/rra`; não há uma opção geral de base de dados para definir livremente uma pasta local.
Confirme o caminho efetivo antes de movimentar dados. Caminhos absolutos manuais têm de ser analisados
e alterados individualmente. Mantenha a organização hierárquica das pastas.

**A cache do sondador armazena caminhos absolutos.** Ao criar a cache, o marcador é expandido e o
caminho total é gravado no registo da cache. Caso altere a pasta de RRA, a cache continua a referenciar
a localização anterior. O sondador continua a operar sem registar arquivos visíveis. Reconstrua-a:

```sh
php cli/rebuild_poller_cache.php
```

**Definições que guardam caminhos.** Cada uma destas entradas encontra-se na base de dados, surgindo
do servidor de origem a apontar para a estrutura antiga. Avalie todas antes de iniciar a primeira recolha:
o executável do RRDtool, o binário do recolhedor e respetiva configuração, o executável do PHP, as
ferramentas de SNMP, caminhos de registos, tipo de letra predefinido e a pasta de cópias de segurança
de remoção de picos. Confirme ainda caminhos e variáveis de ambiente em arquivos de configuração,
serviços do sistema, agendamentos e no servidor web.

**Métodos de entrada de dados contêm comandos de sistema.** Utilizam um marcador correspondente à raiz
de instalação, pelo que uma migração com caminhos idênticos dispensa intervenções. Uma alteração de
estrutura obriga a verificar cada entrada. O mesmo princípio abrange os arquivos XML de recursos
associados a consultas de dados.

**Recolhedores remotos possuem arquivo de configuração independente**, albergando credenciais próprias
e identificador específico. Não são incluídos na exportação da base central. Se a base de dados central
mudou de endereço, atualize os registos correspondentes e valide o acesso de cada recolhedor. A sincronização
completa é uma operação à parte, efetuada no recolhedor central somente quando existem nós remotos ativos:

```sh
php cli/poller_replicate.php
```

Sem recolhedores remotos ativos, este utilitário encerra com erro. Não o inclua numa migração de
instalação autónoma como critério obrigatório de sucesso. Certifique as configurações e a replicação
antes de permitir o reinício da recolha remota.

## Titularidade e permissões

O sondador cria e atualiza arquivos RRD com a conta de sistema que o executa. O servidor web acede
aos mesmos com a conta do serviço web. Uma cópia que tenha transposto identificadores numéricos entre
servidores com arquivos `/etc/passwd` discordantes resultará em arquivos associados à conta errada.

Gráficos que cessem o registo após a migração podem indiciar permissões incorretas, caminhos obsoletos,
ausência de recolha, problemas de relógio ou medições recusadas. Consulte os registos do sondador e as
filas pendentes antes de aplicar correções; a análise do gráfico isolada não identifica a anomalia.

Inspecione os direitos da diretoria de RRA e das suas subpastas, não apenas os de um arquivo de exemplo.
Novos arquivos são criados nessas pastas durante as recolhas, pelo que uma diretoria onde o sondador não
consiga escrever falhará para novos dispositivos criados após a migração, ainda que os arquivos herdados
estejam acessíveis. Ajuste `rrd_maintenance_trusted_uids` e `rrd_maintenance_trusted_gids` no arquivo
`include/config.php` de acordo com os identificadores do destino e inspecione as diretorias antecedentes.
Consulte os [requisitos de armazenamento](/pt-br/reference/requirements/).

## Transição com perda mínima

Um arquivo RRD rejeita atualizações com marca de tempo igual ou anterior à da sua última alteração.
Isto limita a reposição histórica; não dita que qualquer migração tenha forçosamente de perder dados.
O hiato temporal resulta do intervalo entre recolhas, do tempo de indisponibilidade e de quais dados
em fila foram salvaguardados. Este método utiliza uma entidade única de recolha e não funde dados
obtidos em paralelo durante simulações com o arquivo oficial.

1. Execute previamente uma simulação integral utilizando uma cópia do dia anterior. Duplique todo o ambiente, retifique os caminhos e valide atualizações contra dispositivos de teste isolados com notificações inativas. Registe os ajustes de destino num roteiro reprodutível. Termine os processos da simulação após os ensaios.
2. Preserve a simulação segregada. Substitua a base de dados e arquivos RRD pela cópia final coerente; não integre dados de simulação no restauro definitivo.
3. Para a transição, pare os produtores na origem e proceda à descarga ou guarda de medições pendentes, recolhendo e transferindo a cópia final. Reintroduza as adaptações locais: restaurar a base de dados repõe os caminhos de origem em `settings`, e a reposição de arquivos de configuração pode alterar os parâmetros de confiança e endereços estabelecidos na fase de ensaio.
4. Proceda à reconstrução da cache do sondador, corra as validações de armazenamento, inspecione a integridade dos arquivos e ative a recolha no destino unicamente após a confirmação destes testes.

Avalie o tempo gasto na simulação e preveja margem para validações ou retorno. Mantenha o servidor
original desativado até à validação total do novo ambiente ou até que uma decisão planeada de retorno
o restabeleça como responsável pela recolha.

## Validar por esta ordem

1. A interface web abre sem reencaminhar para o instalador. Caso haja redirecionamento, investigue inconsistências entre código e esquema, falhas na ligação à base ou restauros truncados.
2. Um dispositivo de teste responde a uma nova recolha; um estado "up" recuperado pode estar desatualizado.
3. A data de última atualização de um arquivo RRD avança após a conclusão do ciclo de recolha. Confirme o arquivo no disco, não no gráfico.
4. O gráfico gerado para a última hora apresenta uma linha contínua e sem quebras.

Se o passo 3 falhar, inspecione caminhos, permissões, pré-requisitos de armazenamento, filas e mensagens
do RRDtool. Se o passo 4 falhar, averigue valores retidos, definições do gráfico, o intervalo de tempo
selecionado e permissões do usuário web. Um arquivo bem-sucedido não garante a conformidade de todos
os dispositivos, métodos de entrada ou recolhedores remotos.

## Erros comuns

**Não coloque duas instalações a operar sobre a mesma árvore RRD.** Dois processos de sondagem a
atualizar os mesmos arquivos causam rejeições de escrita e quebras nos registos, não dados agregados.

**Não restaure arquivos RRD mais antigos sobre uma base de dados mais recente.** O sistema não preenche
dados para trás no tempo. As medições serão retomadas na hora corrente e a discrepância temporal
originará uma lacuna permanente.

**A cópia de segurança transporta credenciais em texto simples.** Mudar de servidor faz com que esses
dados circulem na rede e fiquem guardados em duas máquinas. Limite o acesso à cópia e cifre a sua
transmissão. Guarde a cópia de segurança de salvaguarda até à aprovação e ao período limite da política
de retenção; não a remova durante o processo de transição.

**As tabelas de plugins constam na base de dados; o código dos plugins não.** Efetuar o restauro da
base de dados sem o código e dependências equivalentes pode corromper telas, pontos de ligação (hooks)
ou rotinas de plugins. Inspecione cada plugin individualmente.

**Sistemas de proxy de armazenamento preexistentes estão excluídos deste processo.** A utilização de
proxy não é suportada. Localize e salvaguarde os arquivos RRD genuínos e ensaie uma transição separada
para armazenamento local numa cópia de testes. Uma pasta `rra/` local pode albergar apenas dados residuais.

**Desative o servidor antigo em último lugar e nunca no mesmo dia.** Mantenha-o desligado ou com
todos os serviços emissores suspensos e guarde a sua cópia de segurança correspondente até que as
validações de recolha, gráficos, recolhedores remotos e plugins passem com sucesso no novo sistema.
Fixe o período de observação atendendo ao tipo de serviço e política de contingência; a conclusão do
ciclo mais rápido de arquivo não atesta que todos os subsistemas estejam a operar corretamente.
