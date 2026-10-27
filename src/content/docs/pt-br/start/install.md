---
title: "Instalação"
description: "O que o Kadupul precisa para funcionar e a ordem de configuração de seus componentes."
sidebar:
  order: 2
banner:
  content: "O Kadupul está em pré-alfa. Valide estes procedimentos em uma instalação de teste isolada. Tradução em rascunho, pendente de revisão por uma pessoa fluente no idioma."
---

:::caution[Validar antes de usar]
O código-fonte está disponível, mas não existe um release com suporte nem um caminho de migração para o Kadupul. Teste estes procedimentos em uma cópia isolada com backups antes de depender deles. Consulte o [status do projeto](/pt-br/project/status/).
:::

Siga este procedimento uma vez, na ordem indicada. Cada passo termina com uma verificação. Faça a verificação antes de prosseguir: qualquer falha listada aqui é barata de identificar agora e cara de solucionar após o poller estar em execução por uma semana.

Para os pré-requisitos específicos da máquina, consulte [Linux hospedado no Windows](/pt-br/guides/install-on-windows/) e [FreeBSD](/pt-br/guides/install-on-freebsd/). Esses procedimentos não comprovam uma validação de ponta a ponta.

## O que você precisa primeiro

O Kadupul é uma aplicação PHP que armazena sua configuração no MySQL ou MariaDB e armazena medições em arquivos RRD no disco. Esta página descreve uma nova instalação de servidor principal a partir do código-fonte atual da branch `main`, e não uma atualização ou a linha LTS arquivada. Quatro componentes precisam existir antes da execução.

| Componente | Por que é necessário |
|---|---|
| PHP 8.4 ou mais recente, em um release com suporte de segurança | Executa a interface web e o poller |
| MySQL ou MariaDB | Armazena dispositivos, templates, usuários e o cache do poller |
| RRDtool | Cria e atualiza os arquivos round-robin e gera gráficos |
| net-snmp | Fornece ferramentas de cliente e bibliotecas usadas para consultar dispositivos |

O PHP também precisa das extensões exigidas por [o manifesto da aplicação](https://github.com/kadupulhq/kadupul/blob/main/composer.json), incluindo `pdo_mysql`, `gd`, `sockets`, `gmp`, `intl`, `ldap`, `mbstring`, `pcntl`, `posix` e `sqlite3`. Instale-as tanto para o ambiente de linha de comando quanto para o servidor web. O documento de [Requisitos](/pt-br/reference/requirements/) distingue os requisitos do Composer das verificações independentes do instalador.

## Passo 1: instalar o ambiente de execução

Instale o PHP com suas extensões, o servidor de banco de dados, o RRDtool e o net-snmp a partir dos pacotes da sua distribuição.

**Verifique.**

```bash
php -v
php -m | sort
rrdtool --version
snmpget --version
```

O comando `php -m` deve listar as extensões obrigatórias. A extensão PHP `snmp` é opcional quando as ferramentas de linha de comando do net-snmp estão disponíveis. O Composer verifica suas próprias extensões obrigatórias durante a instalação das dependências; o instalador web possui uma verificação de extensões separada. Uma alternativa em tempo de execução não remove um requisito do Composer.

As configurações do PHP para linha de comando e servidor web podem ser diferentes. Verifique ambas. O instalador recomenda um `memory_limit` de pelo menos 400M e um `max_execution_time` de pelo menos 60 segundos; ele também aceita seus valores ilimitados (`-1` e `0`, respectivamente). Valores abaixo dessas recomendações geram avisos, enquanto a ausência de `date.timezone` é um erro. Defina um fuso horário explícito, como `UTC`, e utilize `php --ini` para identificar a configuração da linha de comando.

## Passo 2: criar o banco de dados e o usuário

Crie um banco de dados vazio e um usuário com permissões para esse banco de dados. Para um banco de dados local, execute este SQL como administrador do banco de dados, substituindo a senha de exemplo antes do uso:

```sql
CREATE DATABASE kadupul CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'kadupul'@'localhost' IDENTIFIED BY 'replace-with-a-unique-password';
GRANT ALL PRIVILEGES ON kadupul.* TO 'kadupul'@'localhost';
```

Use o host de conta de banco de dados correspondente se o PHP for se conectar a partir de outra máquina.

O servidor de banco de dados também precisa que suas tabelas de fuso horário estejam preenchidas, e o usuário do Kadupul precisa de acesso de leitura a elas, no banco de dados `mysql`. Essa é a única permissão concedida fora de seu próprio schema. Nada em um sistema de monitoramento sugere isso, e isso não é opcional; a verificação abaixo falhará sem ela.

```bash
# Populate the tables, then grant the one extra read the installer needs.
mysql_tzinfo_to_sql /usr/share/zoneinfo | mysql -u root -p mysql
mysql -u root -p -e "GRANT SELECT ON mysql.time_zone_name TO 'kadupul'@'localhost';"
```

**Verifique.** Conecte-se como o usuário de banco de dados do Kadupul e execute:

```sql
SELECT COUNT(*) FROM mysql.time_zone_name;
```

Uma contagem diferente de zero retornada sem erro de permissão é o resultado esperado. Zero significa que as tabelas nunca foram carregadas; um erro significa que o usuário não pode lê-las. Ambos impedem o instalador de prosseguir.

Quatro das configurações do próprio servidor são importantes o suficiente para serem corrigidas agora.

| Configuração | Desejado | Motivo |
|---|---|---|
| `max_allowed_packet` | 16M ou mais | Sincronizações grandes entre o servidor principal e coletores remotos |
| `character_set_server`, `collation_server` | `utf8mb4`, `utf8mb4_unicode_ci` | Descrições de dispositivos contêm caracteres multibyte |
| `innodb_file_per_table` | Ativado | Mantém tablespaces separados e gerenciáveis |
| `innodb_buffer_pool_size` | Cerca de um quarto da memória do sistema | Mantém o working set na memória |

O instalador relata sua própria leitura dessas configurações e destaca o que estiver abaixo do recomendado, para que você não precise confiar cegamente na tabela. O guia [Ajustar o desempenho do banco de dados](/pt-br/guides/tune-database-performance/) vai além quando você tiver carga real.

## Passo 3: descompactar, corrigir as permissões de propriedade e servir

Coloque a aplicação em um local que seu servidor web possa servir e decida qual usuário do sistema será o proprietário. Essa decisão importa mais do que a localização. Dois processos realizam gravações aqui: o servidor web e o mecanismo que agenda o poller. Execute ambos com o mesmo usuário. Execute o poller sem privilégios e conceda a ambos os processos o acesso necessário. Permissões de propriedade ou modos incorretos podem impedir atualizações futuras, mesmo quando os gráficos forem gerados.

### Se você clonou o repositório em vez de descompactar um release

Um checkout do Git precisa tanto das dependências PHP quanto dos assets gerados para o navegador. Com os runtimes do `mise.toml` do repositório instalados, execute a partir da raiz do repositório:

```bash
mise exec -- php "$(command -v composer)" install --no-dev --optimize-autoloader
mise exec -- npm ci --ignore-scripts
mise exec -- npm run build
mise exec -- php bin/console asset-map:compile
mise exec -- php bin/console about
```

O Composer preenche `include/vendor/` e restaura os arquivos de compatibilidade fixados. O build do npm cria assets sob `include/js/`, `include/fa/` e `include/vendor/flag-icons/`. O Composer sozinho não é suficiente para uma instalação a partir do código-fonte.

Um pacote offline com dependências completas é um artefato de build separado. Um arquivo genérico de código-fonte do GitHub não é esse pacote. Siga o [procedimento de build e verificação offline](https://github.com/kadupulhq/kadupul/blob/main/docs/symfony-migration.md#offline-installation) quando o host de destino não tiver acesso à internet.

Prepare os caminhos com permissão de gravação após a instalação das dependências:

| Grupo | Diretórios | Permissão de gravação quando |
|---|---|---|
| Durante a instalação | `resource/snmp_queries`, `resource/script_server`, `resource/script_queries`, `scripts` | Apenas durante a instalação ou atualização |
| Durante a instalação | `include/vendor/csrf/` ou o local configurado em `path_csrf_secret` | O instalador precisa criar o segredo específico da instalação; preserve-o depois |
| Sempre | `log`, `cache/boost`, `cache/mibcache`, `cache/purifier`, `cache/realtime`, `cache/spikekill`, o diretório temporário do sistema | Durante toda a vida útil da instalação |
| Runtime do Symfony | `var/cache`, e `var/log` se o log em arquivo estiver configurado | Para o runtime PHP e o usuário de pré-aquecimento de cache |

O diretório RRD também deve ter permissão de gravação durante toda a vida útil da instalação. Ele armazena seu histórico, portanto dispense a ele o mesmo cuidado que teria com um diretório de banco de dados.

A migração atual ainda necessita das rotas legadas de login, instalador e plugins. Para esta instalação combinada, sirva a raiz do repositório com regras explícitas que neguem o acesso a diretórios privados, arquivos de configuração, dependências e estado de execução. Não altere toda a instalação para `public/`: isso removeria rotas legadas ainda em uso. O endpoint separado do Symfony possui roteamento diferente; consulte as [instruções de migração](https://github.com/kadupulhq/kadupul/blob/main/docs/symfony-migration.md).

Para o Nginx, comece a partir das [regras de location do Nginx](https://github.com/kadupulhq/kadupul/blob/main/tests/e2e/nginx.conf) do repositório, adaptando a raiz e o upstream do PHP-FPM. Mantenha as regras de negação antes do processamento PHP genérico e preserve o PATH_INFO para `/app.php/...`. O Nginx não lê arquivos `.htaccess`. Mantenha arquivos RRD, logs e segredos inacessíveis via HTTP; verifique a configuração real do servidor em vez de supor que as permissões de arquivos impedem o acesso.

**Verifique.** Torne-se o usuário do poller, grave um arquivo em cada diretório do grupo permanente e, em seguida, remova-o. Uma permissão que parece correta no `ls -l` ainda pode ser negada pelo SELinux ou AppArmor, e gravar o arquivo é a única verificação que cobre isso. Em seguida, solicite um arquivo sob o diretório de logs via HTTP. O esperado é uma recusa de acesso.

## Passo 4: criar o arquivo de configuração

Para uma nova instalação, copie o arquivo de configuração distribuído:

```bash
cp include/config.php.dist include/config.php
```

Não sobrescreva a configuração de uma instalação existente. Defina o host, nome, usuário e senha do banco de dados a partir do passo 2. Dois outros valores são importantes em uma primeira instalação: `url_path`, o caminho sob o qual a aplicação é servida com barras no início e no final, e `poller_id`, que é `1` em um servidor principal e diferente apenas em um coletor remoto.

Deixe o bloco do coletor remoto comentado. Você ainda não está configurando um; o documento de [Coleta remota de dados](/pt-br/concepts/remote-data-collection/) aborda esse tema quando você estiver. Todas as outras opções possuem um padrão funcional, portanto leia [Configuração](/pt-br/reference/configuration/) antes de alterar qualquer uma delas.

Configure uma chave `APP_SECRET` específica da implantação no ambiente do processo PHP para os recursos do Symfony que a utilizam. O bootstrap define por padrão `APP_ENV=prod` e `APP_DEBUG=0` e não carrega arquivos `.env`. Isso é separado do segredo de CSRF do instalador legado.

**Verifique.** Verifique a sintaxe sem exibir credenciais:

```bash
php -l include/config.php
```

Importe o schema no próximo passo antes de abrir o instalador em um navegador.

## Passo 5: importar o schema

O instalador espera que as tabelas já existam. Carregue o schema fornecido no banco de dados criado:

```bash
mysql -u kadupul -p kadupul < cacti.sql
```

Faça isso uma única vez, em um banco de dados vazio. Este não é um script de atualização; importá-lo em um banco de dados já preenchido pode falhar ou deixar dados parciais e conflitantes.

## Passo 6: executar o instalador

Abra o site em um navegador e percorra o processo. O instalador segue uma sequência fixa, e cada etapa depende da conclusão da anterior:

1. Boas-vindas e licença.
2. Verificação de dependências: versão e extensões do PHP, as configurações do PHP do passo 1 tanto para a linha de comando quanto para o servidor web, as tabelas de fuso horário e as configurações do banco de dados do passo 2. Erros bloqueiam o botão avançar. Avisos não bloqueiam, mas devem ser lidos.
3. Tipo de instalação: um novo servidor principal ou um coletor remoto.
4. Verificação de permissões: os diretórios do passo 3, testados por meio de gravação neles.
5. Localização dos binários: os caminhos para o PHP, RRDtool e as ferramentas do net-snmp.
6. Perfil de fontes de dados e intervalo do launcher.
7. Seleção de templates: quais templates de dispositivos carregar.
8. Conversão de tabelas, confirmação e a instalação em si.

O item 6 dessa lista é o mais difícil de reverter. O perfil escolhido define o passo e o conjunto de arquivos gravados em cada arquivo RRD criado posteriormente, e editar o perfil não migra arquivos existentes. Alterações de retenção necessitam de uma migração separada e testada; elas nem sempre exigem o descarte do histórico. Se picos forem importantes, certifique-se de que o perfil mantenha valores máximos e não apenas médias: leia [Fontes de dados e arquivos round-robin](/pt-br/concepts/data-sources-and-rras/) antes de passar por essa etapa. O intervalo de launcher oferecido é de um minuto ou cinco minutos. O perfil de fonte de dados define o intervalo de coleta; o launcher e o perfil devem ser configurados de forma consistente.

## Passo 7: alterar as credenciais padrão

O schema fornecido cria uma conta de administrador chamada `admin` com a senha `admin`, configurada para exigir alteração no primeiro login. Ele também cria uma conta de convidado desativada. Altere a senha antes que a instância possa ser acessada por qualquer outra pessoa, o que significa antes de conectá-la a uma rede para a qual outros possam rotear tráfego.

## Passo 8: agendar o poller

O poller precisa ser iniciado externamente. Configure seu intervalo de coleta e o intervalo do launcher de forma consistente; o poller suporta intervalos de launcher de um minuto ou cinco minutos e possui uma proteção contra execuções normais iniciadas antes do tempo. Para um launcher de um minuto, adicione esta entrada na crontab do usuário do poller sem privilégios, substituindo `php` e o caminho da aplicação por seus caminhos absolutos:

```
* * * * * php -q /path/to/kadupul/poller.php > /dev/null 2>&1
```

ou execute o daemon `cactid.php` fornecido usando `service/cactid.service`, ajustado para o caminho da sua instalação e seu usuário sem privilégios. Use apenas um launcher: desative a tarefa do cron ou timer ao usar o daemon.

Faça o agendamento real coincidir com o intervalo de launcher configurado. Para perfis de coleta inferiores a um minuto, o poller disparado executa ciclos de coleta dentro desse intervalo; não tente expressar uma cadência subminuto com esta entrada da cron.

**Verifique.** Execute um ciclo manualmente como o usuário do poller:

```bash
php -q /path/to/kadupul/poller.php --force --debug
```

O parâmetro `--force` ignora a proteção de tempo contra execuções antecipadas. Use essa verificação manual com o agendador parado para evitar sobreposição com uma execução agendada. Ela não ignora outras verificações de manutenção ou segurança. O resultado esperado é uma finalização limpa com uma linha de resumo. Em seguida, habilite o agendador e aguarde por dois intervalos; confirme que outra execução ocorreu sem intervenção manual.

## O que pode dar errado

Estas são as falhas que uma primeira instalação realmente costuma enfrentar.

| Sintoma | Causa | Onde verificar |
|---|---|---|
| O instalador bloqueia em configurações do PHP que parecem corretas | O servidor web e a linha de comando leem arquivos `php.ini` diferentes | `php --ini`, e o arquivo indicado pela SAPI web |
| O instalador bloqueia nos fusos horários | As tabelas de fuso horário não foram carregadas, ou o usuário do Kadupul não consegue lê-las | `SELECT COUNT(*) FROM mysql.time_zone_name` |
| A etapa de permissões falha em um diretório que parece gravável | Proprietário incorreto, ou restrições do SELinux e AppArmor | Grave um arquivo como o usuário do poller |
| A instalação é concluída, mas nenhum dado chega | O poller nunca foi agendado | Execute `poller.php --force --debug` manualmente |
| Há dados por alguns ciclos e depois nada | O poller está sendo executado como o usuário incorreto, deixando arquivos que o usuário web não pode atualizar | Proprietário dos arquivos no diretório RRD |
| Gráficos cheios de pequenas lacunas | O intervalo agendado e o intervalo configurado discordam | A crontab, comparada ao intervalo configurado |
| O Composer recusa a instalação | O PHP está abaixo da versão 8.4 ou falta uma extensão exigida pelo manifesto | `php -v`, `php -m` e a saída de erro do Composer |
| O poller não consegue executar mais de um processo | Falta `pcntl` ou `posix` | `php -m` |

O documento de [Logs](/pt-br/reference/logging/) aborda onde cada evento é registrado. O guia [Solucionar problemas de dados ausentes](/pt-br/guides/troubleshoot-missing-data/) cobre o caso em que a instalação está normal, mas um dispositivo específico não.

## Antes de expor o sistema

O poller roda como um usuário do sistema e executa o RRDtool e seus scripts de coleta. Trate a instalação como algo que executa comandos, porque é exatamente isso que ela faz.

- Disponibilize-a via TLS.
- Não mantenha a senha padrão do administrador, nem mesmo temporariamente.
- Restrinja o usuário do banco de dados apenas ao seu próprio banco de dados.
- Mantenha os diretórios RRD e de logs fora do document root.
- Mantenha a conta de convidado desativada, a menos que você decida o contrário.

O guia [Proteger uma instalação exposta à internet](/pt-br/guides/secure-an-internet-facing-install/) aborda os demais detalhes. Próximo passo: [Adicionar o primeiro dispositivo](/pt-br/start/first-device/).
