---
title: "Instalação"
description: "O que o Kadupul necessita para funcionar e a ordem em que deve ser configurado."
sidebar:
  order: 2
banner:
  content: "O Kadupul está em pré-alfa. Valide estes procedimentos numa instalação de teste isolada. Tradução em rascunho, pendente de revisão por uma pessoa fluente no idioma."
---

:::caution[Validar antes de utilizar]
O código-fonte está disponível, mas não existe uma versão com suporte nem um caminho de migração para o Kadupul. Teste estes procedimentos numa cópia isolada com cópias de segurança antes de depender deles. Consulte o [estado do projeto](/pt-pt/project/status/).
:::

Percorra este processo uma vez, por ordem. Cada passo termina com uma verificação. Efetue a verificação antes de avançar: todas as falhas listadas aqui são fáceis de identificar agora e dispendiosas de resolver depois de o sondador estar a funcionar durante uma semana.

Para os requisitos específicos do anfitrião, consulte [Linux num anfitrião Windows](/pt-pt/guides/install-on-windows/) e [FreeBSD](/pt-pt/guides/install-on-freebsd/). Estes procedimentos não comprovam uma validação completa de princípio a fim.

## O que necessita primeiro

O Kadupul é uma aplicação PHP que armazena a configuração no MySQL ou MariaDB e guarda medições em ficheiros RRD no disco. Esta página descreve uma nova instalação de servidor principal a partir do código-fonte atual de `main`, e não uma atualização ou a linha LTS antiga. Quatro elementos têm de existir antes da sua execução.

| Componente | Porque é necessário |
|---|---|
| PHP 8.4 ou mais recente, numa versão com suporte de segurança | Executa a interface web e o sondador |
| MySQL ou MariaDB | Contém dispositivos, modelos, utilizadores e a cache do sondador |
| RRDtool | Cria e atualiza as consolidações round-robin e processa gráficos |
| net-snmp | Fornece as ferramentas de cliente e bibliotecas utilizadas para consultar dispositivos |

O PHP também necessita das extensões exigidas por [o manifesto da aplicação](https://github.com/kadupulhq/kadupul/blob/main/composer.json), incluindo `pdo_mysql`, `gd`, `sockets`, `gmp`, `intl`, `ldap`, `mbstring`, `pcntl`, `posix` e `sqlite3`. Instale-as tanto para o ambiente de linha de comandos como para o servidor web. Os [Requisitos](/pt-pt/reference/requirements/) distinguem os requisitos do Composer das verificações independentes do instalador.

## Passo 1: instalar o ambiente de execução

Instale o PHP com as suas extensões, o servidor de base de dados, o RRDtool e o net-snmp a partir dos pacotes da sua distribuição.

**Verifique.**

```bash
php -v
php -m | sort
rrdtool --version
snmpget --version
```

O comando `php -m` tem de listar as extensões obrigatórias. A extensão PHP `snmp` é opcional quando as ferramentas de linha de comandos do net-snmp estão disponíveis. O Composer verifica as suas próprias extensões obrigatórias durante a instalação das dependências; o instalador web possui uma verificação de extensões separada. Uma alternativa em tempo de execução não elimina um requisito do Composer.

As configurações do PHP na linha de comandos e no servidor web podem diferir. Verifique ambas. O instalador recomenda um `memory_limit` de pelo menos 400M e um `max_execution_time` de pelo menos 60 segundos; também aceita os respetivos valores ilimitados (`-1` e `0`, respetivamente). Valores abaixo destas recomendações originam avisos, ao passo que a ausência de `date.timezone` constitui um erro. Defina um fuso horário explícito, como `UTC`, e utilize `php --ini` para identificar a configuração da linha de comandos.

## Passo 2: criar a base de dados e o respetivo utilizador

Crie uma base de dados vazia e um utilizador com permissões para essa base de dados. Numa base de dados local, execute este SQL como administrador da base de dados, substituindo a palavra-passe de exemplo antes de utilizar:

```sql
CREATE DATABASE kadupul CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'kadupul'@'localhost' IDENTIFIED BY 'replace-with-a-unique-password';
GRANT ALL PRIVILEGES ON kadupul.* TO 'kadupul'@'localhost';
```

Utilize o anfitrião correspondente da conta da base de dados se o PHP se ligar a partir de outra máquina.

O servidor de base de dados também necessita das suas tabelas de fusos horários preenchidas, e o utilizador do Kadupul precisa de acesso de leitura às mesmas, na base de dados `mysql`. Esta é a única concessão fora do seu próprio esquema. Nada num sistema de monitorização sugere isto, e não é opcional; a verificação abaixo falha sem ela.

```bash
# Populate the tables, then grant the one extra read the installer needs.
mysql_tzinfo_to_sql /usr/share/zoneinfo | mysql -u root -p mysql
mysql -u root -p -e "GRANT SELECT ON mysql.time_zone_name TO 'kadupul'@'localhost';"
```

**Verifique.** Inicie sessão como o utilizador da base de dados do Kadupul e execute:

```sql
SELECT COUNT(*) FROM mysql.time_zone_name;
```

Uma contagem diferente de zero devolvida sem erro de permissões é o resultado pretendido. Zero significa que as tabelas nunca foram carregadas; um erro significa que o utilizador não consegue lê-las. Ambos impedem o instalador de avançar.

Quatro das definições do próprio servidor são suficientemente importantes para corrigir agora.

| Definição | Pretendido | Motivo |
|---|---|---|
| `max_allowed_packet` | 16M ou superior | Sincronizações volumosas entre o servidor principal e recolhedores remotos |
| `character_set_server`, `collation_server` | `utf8mb4`, `utf8mb4_unicode_ci` | Descrições de dispositivos contêm carateres multibyte |
| `innodb_file_per_table` | Ativado | Mantém os espaços de tabelas separados e geríveis |
| `innodb_buffer_pool_size` | Cerca de um quarto da memória do sistema | Mantém o conjunto ativo de trabalho na memória |

O instalador reporta a sua própria leitura destas definições e assinala o que ficar aquém, pelo que não necessita de confiar cegamente na tabela. O guia de [Ajuste do desempenho da base de dados](/pt-pt/guides/tune-database-performance/) aprofunda este tema quando tiver carga de trabalho.

## Passo 3: descompactar, corrigir a propriedade e disponibilizar

Coloque a aplicação num local onde o seu servidor web a possa disponibilizar e, em seguida, decida qual o utilizador do sistema a quem pertence. Essa decisão importa mais do que a localização. Dois processos escrevem aqui: o servidor web e o que quer que agende o sondador. Execute ambos com o mesmo utilizador. Execute o sondador sem privilégios e conceda a ambos os processos o acesso de que necessitam. Propriedade ou modos incorretos podem impedir atualizações futuras, mesmo quando os gráficos são processados.

### Se clonou o repositório em vez de descompactar uma versão lançada

Uma cópia de trabalho do Git necessita tanto das dependências PHP como dos recursos gerados para o navegador. Com os ambientes de execução de `mise.toml` do repositório instalados, execute a partir da raiz do repositório:

```bash
mise exec -- php "$(command -v composer)" install --no-dev --optimize-autoloader
mise exec -- npm ci --ignore-scripts
mise exec -- npm run build
mise exec -- php bin/console asset-map:compile
mise exec -- php bin/console about
```

O Composer preenche `include/vendor/` e restaura os ficheiros de compatibilidade fixados. A compilação do npm cria recursos sob `include/js/`, `include/fa/` e `include/vendor/flag-icons/`. O Composer isoladamente não é suficiente para uma instalação a partir do código-fonte.

Um pacote offline com dependências completas é um artefacto de compilação separado. Um ficheiro genérico de código-fonte do GitHub não é esse pacote. Siga o [procedimento de compilação e verificação offline](https://github.com/kadupulhq/kadupul/blob/main/docs/symfony-migration.md#offline-installation) quando o anfitrião de destino não tiver acesso à Internet.

Prepare os caminhos com permissão de escrita após a instalação das dependências:

| Grupo | Diretórios | Com permissão de escrita quando |
|---|---|---|
| Durante a instalação | `resource/snmp_queries`, `resource/script_server`, `resource/script_queries`, `scripts` | Apenas durante a instalação ou atualização |
| Durante a instalação | `include/vendor/csrf/` ou o local configurado para `path_csrf_secret` | O instalador tem de criar o segredo específico da instalação; preserve-o depois |
| Sempre | `log`, `cache/boost`, `cache/mibcache`, `cache/purifier`, `cache/realtime`, `cache/spikekill`, o diretório temporário do sistema | Durante toda a vida da instalação |
| Ambiente de execução do Symfony | `var/cache`, e `var/log` se o registo em ficheiro estiver configurado | Para o ambiente de execução PHP e o utilizador de aquecimento de cache |

O diretório RRD também tem de ter permissão de escrita durante toda a vida da instalação. Ele contém o seu histórico, pelo que deve ter o mesmo cuidado que teria com o diretório de uma base de dados.

A migração atual ainda necessita das rotas legadas de início de sessão, do instalador e de extensões. Para esta instalação combinada, sirva a raiz do repositório com regras explícitas que recusem o acesso a diretórios privados, configurações, dependências e estado de execução. Não mude toda a instalação para `public/`: isso removeria rotas legadas que ainda estão em utilização. O ponto de terminação separado do Symfony tem um encaminhamento diferente; consulte as [instruções de migração](https://github.com/kadupulhq/kadupul/blob/main/docs/symfony-migration.md).

Para o Nginx, comece a partir das [regras de localização do Nginx](https://github.com/kadupulhq/kadupul/blob/main/tests/e2e/nginx.conf) do repositório, adaptando a raiz e o upstream PHP-FPM. Mantenha as regras de negação antes do processamento PHP genérico e preserve PATH_INFO para `/app.php/...`. O Nginx não lê ficheiros `.htaccess`. Mantenha ficheiros RRD, registos e segredos inacessíveis por HTTP; valide a configuração real do servidor em vez de assumir que as permissões de ficheiros impedem o acesso.

**Verifique.** Mude para o utilizador do sondador, escreva um ficheiro em cada diretório do grupo permanente e, em seguida, elimine-o. Uma permissão que parece correta no `ls -l` pode continuar a ser recusada pelo SELinux ou AppArmor, e a escrita do ficheiro é a única verificação que cobre essa situação. De seguida, solicite um ficheiro sob o diretório de registos via HTTP. Deve obter uma recusa de acesso.

## Passo 4: escrever o ficheiro de configuração

Para uma nova instalação, copie o ficheiro de configuração distribuído:

```bash
cp include/config.php.dist include/config.php
```

Não substitua a configuração de uma instalação existente. Defina o anfitrião, o nome, o utilizador e a palavra-passe da base de dados do passo 2. Dois outros valores são importantes numa primeira instalação: `url_path`, o caminho sob o qual a aplicação é servida com barras iniciais e finais, e `poller_id`, que é `1` num servidor principal e diferente apenas num recolhedor remoto.

Deixe o bloco do recolhedor remoto comentado. Ainda não está a construir um; a [Recolha remota de dados](/pt-pt/concepts/remote-data-collection/) aborda esse tema quando estiver. Todas as outras definições possuem um valor predefinido funcional, pelo que deve ler a [Configuração](/pt-pt/reference/configuration/) antes de alterar qualquer uma delas.

Configure um `APP_SECRET` específico da implementação no ambiente do processo PHP para as funcionalidades do Symfony que o utilizam. O arranque predefine `APP_ENV=prod` e `APP_DEBUG=0` e não carrega ficheiros `.env`. Isto é independente do segredo CSRF do instalador legado.

**Verifique.** Verifique a sintaxe sem apresentar credenciais:

```bash
php -l include/config.php
```

Importe o esquema no passo seguinte antes de abrir o instalador num navegador.

## Passo 5: importar o esquema

O instalador espera que as tabelas já existam. Carregue o esquema fornecido na base de dados que criou:

```bash
mysql -u kadupul -p kadupul < cacti.sql
```

Faça isto apenas uma vez, numa base de dados vazia. Este não é um script de atualização; importá-lo numa base de dados com dados pode falhar ou deixar dados parciais e conflituosos.

## Passo 6: executar o instalador

Abra o sítio num navegador e percorra o processo. O instalador segue uma sequência fixa e cada passo condiciona o seguinte:

1. Boas-vindas e licença.
2. Verificação de dependências: versão e extensões do PHP, as definições de PHP do passo 1 tanto para a linha de comandos como para o servidor web, as tabelas de fusos horários e as definições da base de dados do passo 2. Erros bloqueiam o botão seguinte. Avisos não bloqueiam, mas devem ser lidos.
3. Tipo de instalação: um novo servidor principal ou um recolhedor remoto.
4. Verificação de permissões: os diretórios do passo 3, testados através de escrita nos mesmos.
5. Localização dos binários: os caminhos para o PHP, RRDtool e ferramentas do net-snmp.
6. Perfil de fontes de dados e intervalo do iniciador.
7. Seleção de modelos: que modelos de dispositivos carregar.
8. Conversão de tabelas, confirmação e a instalação propriamente dita.

O item 6 dessa lista é o mais difícil de reverter. O perfil escolhido determina o passo e o conjunto de consolidações gravado em cada ficheiro RRD criado posteriormente, e editar o perfil não migra ficheiros existentes. Alterações de retenção necessitam de uma migração separada e testada; nem sempre exigem o descarte do histórico. Se os picos forem importantes, certifique-se de que o perfil preserva máximos e não apenas médias: leia [Fontes de dados e consolidações round-robin](/pt-pt/concepts/data-sources-and-rras/) antes de avançar. O intervalo do iniciador oferecido é de um minuto ou cinco minutos. O perfil da fonte de dados define o intervalo de recolha; o iniciador e o perfil têm de ser configurados de forma coerente.

## Passo 7: alterar as credenciais predefinidas

O esquema fornecido cria uma conta de administrador chamada `admin` com a palavra-passe `admin`, marcada para que o primeiro início de sessão force uma alteração. Também cria uma conta de convidado desativada. Altere a palavra-passe antes de a instância ficar acessível a qualquer outra pessoa, o que significa antes de a ligar a uma rede para a qual outros possam encaminhar tráfego.

## Passo 8: agendar o sondador

O sondador tem de ser iniciado externamente. Configure o seu intervalo de recolha e o intervalo do iniciador de forma coerente; o sondador suporta intervalos de arranque de um minuto ou cinco minutos e possui uma proteção contra execuções normais que cheguem demasiado cedo. Para um iniciador de um minuto, instale esta entrada no crontab do utilizador do sondador sem privilégios, substituindo `php` e o caminho da aplicação pelos respetivos caminhos absolutos:

```
* * * * * php -q /path/to/kadupul/poller.php > /dev/null 2>&1
```

ou execute o daemon `cactid.php` fornecido utilizando `service/cactid.service`, ajustado para o seu caminho de instalação e utilizador sem privilégios. Utilize apenas um iniciador: desative a tarefa cron ou o temporizador ao utilizar o daemon.

Faça coincidir o agendamento real com o intervalo de arranque configurado. Para perfis de recolha inferiores a um minuto, o sondador iniciado executa ciclos de recolha dentro desse intervalo; não tente expressar uma cadência subminuto com esta entrada de cron.

**Verifique.** Execute um ciclo manualmente como o utilizador do sondador:

```bash
php -q /path/to/kadupul/poller.php --force --debug
```

O parâmetro `--force` ignora a proteção de tempo de execução antecipada. Utilize esta verificação manual com o agendador parado para que não se sobreponha a uma execução agendada. Não contorna outras verificações de manutenção ou de segurança. O objetivo é uma conclusão limpa com uma linha de resumo. Em seguida, ative o agendador e aguarde durante dois intervalos; confirme que ocorreu outra execução de forma autónoma.

## O que pode correr mal

Estas são as falhas que uma primeira instalação realmente enfrenta.

| Sintoma | Causa | Onde procurar |
|---|---|---|
| O instalador bloqueia em definições de PHP que parecem corretas | O servidor web e a linha de comandos leem ficheiros `php.ini` diferentes | `php --ini`, e o ficheiro reportado pela SAPI web |
| O instalador bloqueia nos fusos horários | As tabelas de fusos horários não foram carregadas, ou o utilizador do Kadupul não consegue lê-las | `SELECT COUNT(*) FROM mysql.time_zone_name` |
| O passo de permissões falha num diretório que parece ter permissão de escrita | Proprietário incorreto, ou restrições de SELinux e AppArmor | Escreva um ficheiro como o utilizador do sondador |
| A instalação é concluída, mas nunca chegam dados | O sondador nunca foi agendado | Execute `poller.php --force --debug` manualmente |
| Dados durante alguns ciclos e depois nada | Sondador em execução como o utilizador incorreto, deixando ficheiros que o utilizador web não pode atualizar | Proprietário dos ficheiros no diretório RRD |
| Gráficos cheios de pequenas falhas | O intervalo agendado e o intervalo configurado divergem | O crontab, face ao intervalo configurado |
| O Composer recusa a instalação | O PHP é inferior a 8.4 ou falta uma extensão exigida pelo manifesto | `php -v`, `php -m` e a mensagem de erro do Composer |
| O sondador não consegue executar mais do que um processo | Falta `pcntl` ou `posix` | `php -m` |

O documento de [Registo](/pt-pt/reference/logging/) explica onde cada componente regista eventos. A [Resolução de problemas de dados em falta](/pt-pt/guides/troubleshoot-missing-data/) abrange a situação em que a instalação está funcional, mas um dispositivo específico não.

## Antes de o expor

O sondador é executado como um utilizador do sistema e executa o RRDtool e os seus scripts de recolha. Trate a instalação como algo que executa comandos, porque é exatamente isso que faz.

- Disponibilize-a através de TLS.
- Não mantenha a palavra-passe predefinida do administrador, nem mesmo temporariamente.
- Restrinja o utilizador da base de dados à sua própria base de dados.
- Mantenha os diretórios RRD e de registos fora da raiz de documentos.
- Deixe a conta de convidado desativada, a menos que decida em contrário.

O guia [Proteger uma instalação exposta à Internet](/pt-pt/guides/secure-an-internet-facing-install/) descreve as restantes medidas. A seguir: [Adicionar o primeiro dispositivo](/pt-pt/start/first-device/).
