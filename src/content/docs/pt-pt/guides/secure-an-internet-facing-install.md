---
title: Proteger uma instalação exposta à Internet
description: O que alterar antes de um sistema de monitorização com acesso por consola à sua rede responder a pedidos provenientes da Internet pública.
banner:
  content: O Kadupul está em pré-alfa. Valide estes procedimentos numa instalação de teste isolada. Tradução em rascunho, pendente de revisão por uma pessoa fluente no idioma.
sidebar:
  order: 9
---

:::caution[Validar antes de utilizar]
O código-fonte está disponível, mas não existe uma versão com suporte nem um caminho
de migração para o Kadupul. Teste estes procedimentos numa cópia isolada com
cópias de segurança antes de depender deles. Consulte o [estado do projeto](/pt-pt/project/status/).
:::

Comece com a resposta honesta: coloque-o atrás de uma VPN. O Kadupul guarda as credenciais
SNMP de cada dispositivo monitorizado em texto simples e executa comandos no seu próprio
anfitrião como parte do seu funcionamento normal. Não existe configuração que torne recomendável
a sua exposição na Internet pública.

As verificações apresentadas abaixo ajudam a avaliar uma instalação isolada. Não asseguram
uma implementação pública suportada ou segura; mantenha em mente a advertência sobre o estado
do projeto acima ao interpretar os resultados.

## TLS

Termine o TLS no servidor web ou num proxy intermédio. O Kadupul não escuta num socket próprio.

Ative de seguida a definição que redireciona pedidos HTTP normais para HTTPS. Encontra-se
desativada por predefinição (`off`). Sem esta proteção, o formulário de início de sessão é
servido através de HTTP e uma palavra-passe transita pela rede em claro antes que qualquer outra
medida tenha efeito.

A aplicação define o atributo Secure do cookie de sessão quando o PHP recebe um valor não vazio
em `$_SERVER['HTTPS']` diferente de `off`. Atrás de um proxy de terminação de TLS, configure
o servidor web fidedigno ou a camada FastCGI para representar o tráfego HTTPS corretamente e
verifique o cabeçalho `Set-Cookie` resultante num navegador.

`$proxy_headers` controla a resolução de endereços dos clientes. Não define a variável de
servidor HTTPS nem ativa cookies Secure. Confie unicamente nos cabeçalhos de endereço que o seu
proxy define, elimine cópias facultadas por clientes e impeça o acesso direto à infraestrutura
interna. Force os redirecionamentos de HTTP para HTTPS no proxy público antes do envio de quaisquer credenciais.

A aplicação define HttpOnly e SameSite=Strict no seu cookie de sessão. Confirme o comportamento
real dos cookies e dos redirecionamentos na fronteira da implementação; estes parâmetros não
garantem que todos os restantes cookies partilhem a mesma configuração. Consulte a
[referência de configuração de sessões do PHP](https://www.php.net/manual/en/session.configuration.php).

## Credenciais predefinidas

O esquema fornecido contém uma conta administrativa designada `admin` cujo hash da palavra-passe
é o MD5 da cadeia `admin`. Está assinalada para exigir a alteração no primeiro início de sessão.
Confirme que a alteração ocorreu em vez de presumir que sim. O aviso que impõe essa mudança é ignorado
ao utilizar autenticação web básica, onde o servidor web já estabeleceu a identidade do utilizador.

Inspecione seguidamente as credenciais que não constituem contas de utilizadores:

- A conta da base de dados tem por predefinição o valor `cactiuser` com a palavra-passe `cactiuser` no modelo de configuração incluído.
- O subsistema de automação fornece opções SNMP predefinidas contendo as comunidades `public` e `private`, bem como um par de utilizador e palavra-passe SNMPv3. Trata-se de predefinições de deteção e não da configuração dos dispositivos, mas são as cadeias que o processo de descoberta tentará em primeiro lugar.

A política de palavras-passe é configurável. Os valores predefinidos exigem oito carateres e
letras maiúsculas e minúsculas. A expiração e o bloqueio de conta após tentativas falhadas
sucessivas encontram-se disponíveis e ambos estão desativados por predefinição. Numa instalação
exposta à Internet, ative o bloqueio.

## Privilégios da base de dados

O exemplo de instalação recorre a privilégios delimitados à base de dados, complementados pelo
acesso à tabela de fusos horários. Substitua estes nomes ilustrativos de conta e base de dados
e analise as concessões para as tarefas reais de implementação e manutenção:

```sql
GRANT ALL ON kadupul.* TO 'someuser'@'localhost';
GRANT SELECT ON mysql.time_zone_name TO 'someuser'@'localhost';
```

Esta segunda concessão não é opcional. O processamento de fusos horários consulta essa tabela
e o instalador verifica o acesso e a integridade dos dados de fuso horário. Analise concessões
adicionais perante os requisitos reais de manutenção e do recolhedor antes de as retirar; este
exemplo não estabelece que todas as implementações exijam rigorosamente os mesmos privilégios.

Notas essenciais de âmbito:

- Associe a base de dados a localhost ou a uma interface privada, nunca ao endereço em que o servidor web responde.
- Atribua a cada recolhedor de dados remoto a sua própria conta de base de dados. As suas credenciais residem na base de dados central e no seu próprio ficheiro de configuração; ter contas distintas melhora a rastreabilidade e a revogação. Não isolam por si só um recolhedor comprometido se as suas permissões continuarem a permitir escritas centrais.
- A ligação suporta TLS, configurado com chave, certificado e caminho da autoridade de certificação no ficheiro de configuração. Utilize-o sempre que a base de dados não se situar no mesmo anfitrião.
- Assegure que o ficheiro de configuração pode ser lido pelo utilizador do servidor web e que não permite escrita nem ao utilizador web nem ao utilizador do serviço do sondador durante a operação regular. Mantenha a titularidade numa conta administrativa. A configuração de um recolhedor remoto verifica explicitamente se consegue atualizar o ficheiro; não deduza que qualquer instalação de servidor principal necessite das mesmas permissões temporárias de escrita.
- O segredo de CSRF pode ser guardado num ficheiro em vez de constar na base de dados. Se selecionar essa opção, o ficheiro tem impreterivelmente de ficar fora da raiz de documentos. Isto é formulado como uma exigência estrita, não como uma sugestão.

## Manter diretórios de dados fora da raiz de documentos

Numa implementação baseada na raiz do repositório, diretórios de dados privados e de código-fonte
podem ficar situados abaixo da raiz servida. Diversos diretórios integram regras de rejeição
`.htaccess`; efetue o levantamento da árvore de ficheiros real e da configuração do servidor
em vez de assumir que todos os caminhos estão protegidos. A migração parcial atual do framework
implica também que mudar todo o sítio para `public/` sem as respetivas rotas herdadas não é um
procedimento de implementação completo.

Esses ficheiros só funcionam no Apache e apenas quando a configuração autoriza a sobreposição
nesse diretório. No nginx não produzem efeito. Num Apache mal configurado não produzem efeito.
Uma diretiva inerte de rejeição total em frente ao diretório de registos permite que qualquer
pessoa leia o registo da sua aplicação, expondo nomes de dispositivos, nomes de utilizadores,
conteúdo de consultas e detalhes de falhas. O Apache documenta o comportamento exigido para
sobreposições no seu [guia de `.htaccess`](https://httpd.apache.org/docs/2.4/howto/htaccess.html).

Adote ambas as medidas:

**Verificar os caminhos de armazenamento antes de movimentar dados.** Os destinos dos registos
são configuráveis, mas `include/global.php` fixa a base de RRA no diretório `rra` da instalação;
não há uma opção geral de interface para o diretório de RRA. Um esquema de armazenamento montado
separadamente pode manter esse caminho esperado, mas a organização no sistema de ficheiros por si
só não impede o acesso HTTP através de uma pasta disponibilizada ou ligação simbólica. Inspecione
em conjunto os caminhos existentes de fontes de dados, permissões de serviços, cópias de segurança
e regras de bloqueio HTTP. Não mude a localização de árvores de cache sem verificar como os respetivos
consumidores acedem aos ficheiros. Consulte [Migrar para novo hardware](/pt-pt/guides/migrate-to-new-hardware/)
e [Atualizar em segurança](/pt-pt/guides/upgrade-safely/).

**Rejeitar caminhos privados no servidor web.** Adapte o
[exemplo de Nginx para a raiz do repositório](https://github.com/kadupulhq/kadupul/blob/661a57ff43ebf275e6b07211d4284dd727103959/tests/e2e/nginx.conf)
presente no código-fonte ao prefixo de URL real e ao servidor; as regras de rejeição devem
prevalecer sobre o processamento de PHP comum. Esta lista constitui uma referência para inventário,
não uma configuração pronta a aplicar:

| Diretório | Motivo |
|---|---|
| `rra/` | Ficheiros de medições |
| `log/` | Registo da aplicação, incluindo detalhes de consultas e erros |
| `cache/` | Inspecionar acesso pretendido a recursos; bloquear execução de PHP em caminhos de cache |
| `scripts/` | O código de recolha não pode ser diretamente acedido nem invocado através de HTTP |
| `cli/` | Utilitários de linha de comandos que não devem ser acessíveis via HTTP |
| `mibs/`, `contrib/`, `docs/` | Recursos internos e documentação |
| `src/`, `config/`, `templates/`, `var/`, `lib/`, `bin/`, `tests/`, `tools/` | Componentes internos da aplicação, estado e ferramentas |
| Ficheiros começados por ponto, manifestos de dependências, ficheiros PHP internos de include/bootstrap | Metadados do repositório e pontos de entrada internos |

Conserve os recursos públicos necessários como `include/js` e `include/themes`; um bloqueio cego
sobre todos os includes pode danificar a interface gráfica. Verifique a rejeição através de caminhos
de teste inofensivos e confirme que as respostas não revelam código-fonte nem conteúdos de ficheiros.
Não realize testes acedendo a segredos reais para a consola ou para um registo.

Existe também um ficheiro facultativo de cabeçalhos de segurança para recursos estáticos. As respostas
de PHP estabelecem os seus próprios cabeçalhos em código; os ficheiros estáticos não o fazem, a menos
que ative esse ficheiro ou introduza as respetivas diretivas na configuração do servidor.

A política de segurança de conteúdos (CSP) é configurável. A política de scripts predefinida aceita
JavaScript inline sem nonce, pois os plugins dependem disso. O modo estrito com nonce exposto nas
Definições opera exclusivamente em modo de relatório. A implementação de cabeçalhos também aceita
a aplicação de `nonce`, não obstante a [ajuda desatualizada das Definições](https://github.com/kadupulhq/kadupul/issues/265).
A aplicação estrita e o modo de relatório são distintos; inspecione os cabeçalhos e teste todas as
páginas e plugins indispensáveis antes de alternar de modo. A imposição implementada não é garantia
de compatibilidade integral com nonces.

## O sondador executa comandos

Este é o elemento que altera radicalmente o modelo de ameaças.

A recolha não é unicamente SNMP. Um método de entrada de dados pode definir uma linha de comandos
e o sondador executa-a. A linha de comandos é registada na cache do sondador e executada pelo
recolhedor em cada intervalo, com a identidade do utilizador do sistema operativo do recolhedor.
Entradas baseadas no servidor de scripts de PHP recorrem a um processo PHP autónomo e duradouro.
Comandos externos e entradas do servidor de scripts são vias distintas; não assuma que qualquer
script corre dentro desse servidor ou que um recolhedor em C foi validado para esta versão.

Encare as permissões seguintes como superfícies altamente privilegiadas de configuração para
execução de código. Os seus efeitos dependem das funcionalidades ativas e dos controlos de validação:

| Permissão | Motivo |
|---|---|
| Métodos de entrada de dados | Define diretamente a linha de comandos |
| Importar modelos | Um modelo ou pacote importado pode conter um método de entrada de dados |
| Gestão de plugins | O código dos plugins é executado no seio da aplicação |
| Definições / Utilitários | Controla os caminhos para os binários que são executados |

Não as conceda a ninguém que não tenha previamente acesso por consola a esse anfitrião. Um utilizador
de leitura que apenas visualiza gráficos é algo inteiramente diferente, e essa é a função que quase
todas as contas deveriam ter.

Existem dois mecanismos de controlo e vale a pena tirar partido de ambos:

**Restrição de metacarateres.** Os metacarateres de consola em cadeias de comandos de entrada de
dados estão bloqueados por predefinição. Existe uma opção para os autorizar, mantida por causa de
definições antigas baseadas em condutas (pipelines). Deixe-a desativada. Se tiver definições que
dela necessitem, transfira a conduta para um script no diretório de scripts e invoque esse script.

**A lista de permissões de entradas.** Um ficheiro, indicado no ficheiro de configuração, com as
cadeias de comandos aprovadas associadas por método de entrada de dados. Estando definida, não é
possível criar gráficos ou fontes de dados a partir de um método de entrada cuja cadeia não conste
da lista. Alterar um comando aprovado faz falhar a correspondência até que a lista revista seja
atualizada. A regeneração é uma operação de linha de comandos, residindo aí todo o benefício: exige
acesso de consola ao anfitrião e não uma sessão de administração no navegador.

A verificação ocorre novamente aquando da reconstrução da cache do sondador. Uma entrada de dados
que falhe a verificação não gera tarefas de sondagem e quaisquer linhas que tenha deixado são
removidas na reconstrução/descarga confirmada seguinte. Isto regula a criação e o povoamento da
cache; não funciona como cancelamento imediato de tarefas em curso nem garante que cada recolhedor
recarregue uma lista alterada antes de cada execução. Confirme o estado validado da cache e o
comportamento do recolhedor após uma alteração de política.

```sh
php cli/input_whitelist.php --audit
# After reviewing this data input's command; 42 is an example data-input ID.
php cli/input_whitelist.php --update --id=42
```

Um `--update` sem restrições inclui as definições atuais de comandos na lista de permissões; não o
utilize em substituição de uma análise atenta. Salvaguarde a lista e o respetivo diretório contra
escritas de utilizadores de serviços. Permanece desativada a não ser que seja configurada. Consulte
[Escrever um script de recolha de dados](/pt-pt/guides/write-a-data-collection-script/) para pormenores
sobre seleção e saída de dados.
Isto eleva substancialmente a exigência para compromissos administrativos via navegador, visto que
adicionar um novo comando à recolha passa a requerer também direitos de escrita no sistema de ficheiros
do anfitrião do sondador. Não substitui a necessidade de restringir a concessão das permissões da
tabela anterior, já que um atacante com acesso a uma cadeia de comando já aprovada não necessita de adicionar uma nova.

## Autenticação

São fornecidos quatro métodos. A disponibilidade depende das extensões PHP instaladas.

| Método | Onde os utilizadores são validados | Observações |
|---|---|---|
| Integrado | A base de dados local | Palavras-passe, políticas e bloqueios são geridos localmente |
| Web básico | O servidor web | O Kadupul confia na identidade indicada pelo servidor |
| LDAP | Um único diretório | Exige a extensão PHP LDAP |
| Vários domínios LDAP/AD | Vários diretórios | A mesma exigência |

O seletor nas Definições apresenta estes métodos com autenticação, excluindo o modo zero herdado.
O arranque de autenticação tenta migrar configurações herdadas sem autenticação para a via local,
mas utilitários de autorização mais profundos contêm ramificações de suporte ao modo zero. Confirme
o método guardado, as identidades configuradas e as rotas efetivamente protegidas, em vez de tomar
a ausência de escolha na interface como uma garantia global.

Aspetos a analisar:

- **A autenticação web básica delega a validação de identidade.** O Kadupul recolhe variáveis de identidade autenticadas pelo servidor quando este modo se encontra selecionado e continua a aplicar regras de associação de contas, estado de ativação e regras de autorização. Uma identidade em falta não é tratada automaticamente como administrador. Configure o servidor para autenticar todas as rotas previstas e impeça os clientes de injetar variáveis de identidade de confiança; valide rotas de imagens/exportações e o comportamento intencional de convidados de forma independente.
- **O suporte para "manter a sessão iniciada"** encontra-se ativo por predefinição. Um token persistente é criado quando o utilizador assinala essa opção após a autenticação, não acontecendo de forma automática para todas as sessões. Expira ao fim de noventa dias de inatividade. Numa instalação com acesso à Internet, pondere conscientemente se pretende preservá-lo.
- **Defina o utilizador convidado como "ninguém"**, salvo se pretender disponibilizar a consulta anónima de gráficos. A ausência de utilizador é a predefinição adequada; assegure-se de que não foi alterada durante a configuração.
- **Coloque autenticação multifator à frente de tudo.** Não há MFA incorporado na aplicação. O local certo para a sua colocação é num proxy consciente de identidades ou num gateway de autenticação única (SSO).

## Pontos de terminação de recolhedores de dados remotos

Se opera com recolhedores remotos, a instalação central expõe um ponto de comunicação que estes
contactam. Não recorre a uma sessão de utilizador para autenticar. Concede autorização através da
resolução do endereço de origem e da sua comparação com os nomes de anfitrião dos recolhedores registados,
consignando os insucessos numa categoria de segurança.

Seguem-se duas implicações. Em primeiro lugar, esse ponto não deve ser acessível a partir da Internet
pública; restrinja-o no servidor web aos endereços dos recolhedores. Em segundo lugar, o endereço
do cliente examinado é o obtido a partir do pedido, aplicando-se também aqui a confiança nos cabeçalhos
encaminhados configurada anteriormente. Confiar em cabeçalhos fora do seu controlo permite a um interveniente
forjar o endereço de um recolhedor.

Em paralelo, a opção que tolera certificados autoassinados e discrepâncias de nomes de anfitrião na
comunicação entre o servidor central e um recolhedor está ativa por predefinição. Emita certificados
reais para os seus recolhedores e desligue essa permissão.

## Lista de verificação mínima

1. TLS terminado, HTTP redirecionado antes do início de sessão, estado HTTPS do PHP assegurado pelo servidor de confiança e cookies Secure confirmados. Cabeçalhos de endereço de cliente limitados aos que o proxy introduz e remove.
2. Palavra-passe de administrador predefinida substituída e confirmada. Bloqueio de conta ativado.
3. Permissões de base de dados analisadas para tarefas de instalação, manutenção e recolhedor; acesso a fusos horários confirmado e acesso de rede à base restrito a clientes necessários.
4. Caminhos de armazenamento verificados, pastas privadas e metadados rejeitados no servidor web e ficheiros estáticos essenciais totalmente funcionais.
5. Ficheiro de configuração sem direitos de escrita em tempo de execução. Ficheiro do segredo de CSRF, quando utilizado, mantido fora da raiz de documentos.
6. Métodos de entrada de dados, Importar modelos e Gestão de plugins restritos exclusivamente a quem detenha consola no anfitrião do sondador. Restrição de metacarateres ativa. Lista de permissões de entradas configurada.
7. Ponto de contacto de recolhedores remotos limitado por endereço de rede. Verificação de certificados ativa.
8. MFA colocado num proxy à frente de todo o conjunto.
