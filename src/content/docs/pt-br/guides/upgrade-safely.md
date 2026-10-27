---
title: "Atualizar com segurança"
description: "Ensaiar a atualização, manter backups sincronizados, verificar o armazenamento e o esquema, e planejar um rollback coordenado."
banner:
  content: "O Kadupul está em pré-alfa. Valide estes procedimentos em uma instalação de teste isolada. Tradução em rascunho, pendente de revisão por uma pessoa fluente no idioma."
sidebar:
  order: 8
---

:::caution[Validar antes de usar]
O código-fonte está disponível, mas não existe um release com suporte nem um caminho de migração para o Kadupul. Teste estes procedimentos em uma cópia isolada com backups antes de depender deles. Consulte o [status do projeto](/pt-br/project/status/).
:::

Uma atualização altera três componentes em momentos distintos e com diferentes níveis de reversibilidade.

| Alterações | Reversível | Como |
|---|---|---|
| Código, dependências e configuração | A partir de uma cópia mantida | Restaure a revisão e as configurações correspondentes |
| Schema do banco de dados e amostras em fila | A partir de um backup correspondente | Restaure o banco de dados; não existe migração reversa automática |
| Arquivos RRD | A partir de um backup correspondente | Restaure o histórico mantido; amostras ausentes do backup não podem ser recriadas por rollback |

O procedimento existe para manter esses três componentes sincronizados.

## Antes de começar

**Faça o backup completo.** Todas as três partes, consistentes entre si. Siga [Backup e restauração](/pt-br/guides/back-up-and-restore/). Pare todos os gravadores antes da captura final e guarde o backup protegido até a aceitação da atualização.

**Registre a revisão atual e a versão do schema.** Inclua dependências, alterações locais, plugins e configuração. Múltiplas revisões do código-fonte podem relatar a mesma versão de schema. Ensaie a revisão de destino em uma cópia restaurada isolada.

**Verifique todos os plugins.** Inspecione a declaração de compatibilidade, o código e as dependências, e teste as funções necessárias com a revisão de destino. Uma declaração de versão mínima por si só não comprova compatibilidade. Consulte [Validação de plugins](/pt-br/guides/install-and-vet-plugins/).

**Verifique o ambiente de execução.** Versão do PHP, extensões do PHP e versão do servidor de banco de dados. Verifique os [requisitos](/pt-br/reference/requirements/) do destino antes da implantação. Não presuma que a CLI de schema realize todas as verificações do instalador web.

**Verifique se a conta do banco de dados pode alterar o schema.** Em execução normal, a conta precisa de leitura e gravação em seu próprio banco de dados. No momento da atualização, ela também precisa criar, alterar e descartar tabelas e índices. Instalações que restringiram os privilégios após a configuração inicial descobrem isso nesta etapa.

**Pare todos os produtores.** Pare a coleta agendada, coletores remotos, coleta acionada via web e manutenção manual; aguarde o trabalho em andamento terminar. Esvazie as gravações adiadas somente após a parada dos produtores e preserve quaisquer linhas não confirmadas da fila junto com o backup correspondente. Mantenha os produtores parados durante a implantação e validação do schema.

## Substituir a aplicação

Uma cópia por sobreposição possui limites específicos:

```bash
# Copies the contents of the new tree over the old one.
cp -a /path/to/new-release/. /path/to/kadupul/
```

Sem isso, `cp -a /path/to/new-release /path/to/kadupul` cria `kadupul/new-release/` e deixa cada arquivo da aplicação antiga exatamente onde estava. A atualização parece ter funcionado, a interface ainda executa o código antigo, e o primeiro sinal de problema é a migração de schema se recusando a corresponder a uma versão que você achava que tinha substituído.

Uma cópia por cima retém arquivos ausentes na nova árvore, incluindo arquivos obsoletos da aplicação. Ela pode sobrescrever quaisquer caminhos correspondentes, portanto inspecione o artefato em vez de presumir que configuração ou dados estão excluídos. Prefira uma árvore preparada e revisada com dependências, configuração e plugins correspondentes. Se alternar releases através de um link simbólico, valide o caminho RRA efetivo e o acesso ao armazenamento antes da troca; a inicialização atual deriva isso a partir do diretório da aplicação concatenado com `/rra`. A troca de link simbólico por si só não realiza um rollback do banco de dados.

**Verifique o que você realmente está executando antes de continuar.**

```bash
cat /path/to/kadupul/include/cacti_version
```

Se o comando não informar o release recém-implantado, pare. Tudo após este ponto pressupõe que o código desejado está implantado. Compare também a revisão do código-fonte ou o checksum do artefato com o registro do release; a string de versão por si só não basta.

## A migração do schema

O banco de dados possui sua própria versão, separada da versão presente no código. Substituir o código não altera essa versão.

Páginas legadas autenticadas redirecionam para o instalador quando as versões do código e do banco de dados divergem. Essa não é uma proteção universal para todos os endpoints ou CLI, e strings de versão correspondentes não provam que todas as migrações foram concluídas. Verifique o estado do schema diretamente.

O instalador e a CLI executam etapas ordenadas de migração. Antes da atualização normal do schema, verifique a fila persistente e o acesso ao armazenamento da conta de serviço. Se uma fila herdada de `poller_output` não for InnoDB, converta-a explicitamente com os gravadores parados e o backup mantido:

```sh
php cli/upgrade_database.php --migrate-poller-queue
```

Em seguida, execute este comando sob cada conta real de web e do poller:

```sh
php cli/upgrade_database.php --check-rrd-storage
```

As duas opções são operações separadas e não podem ser combinadas. A conversão de fila preserva amostras pendentes; não descarte linhas para passar em uma verificação. Resolva a propriedade e a configuração de UID/GID numéricos confiáveis usando os [requisitos de armazenamento](/pt-br/reference/requirements/). Coletores remotos online normalmente selecionam a fila principal; use `--local` apenas para uma verificação ou conversão intencional da fila local. Quando essas verificações forem aprovadas, execute a atualização do schema a partir da raiz da aplicação:

```sh
php cli/upgrade_database.php
```

Execute o comando como a conta de serviço configurada, com o acesso necessário ao sistema de arquivos e privilégios de banco de dados. Uma verificação com sucesso como root não comprova o acesso da conta de serviço. Há uma opção `--forcever` para definir a versão inicial explicitamente, que existe para reexecutar uma migração durante testes de pré-lançamento. Ela não faz parte de uma atualização normal e usá-la para pular uma etapa que falhou deixará o schema migrado pela metade.

Capture o status de saída e o resultado exibido, e então verifique a versão do banco de dados e as alterações de schema necessárias. A CLI atual pode rejeitar uma versão inicial legada desconhecida ou não suportada e ainda assim sair com status 0; um código de sucesso no shell por si só é insuficiente. Se a migração falhar no meio do caminho, mantenha os produtores parados e restaure o conjunto de backup correspondente em vez de tentar pular a etapa que falhou.

## O que quebra os plugins

As verificações de plugins do instalador web podem desativar plugins incompatíveis ou ausentes. Não presuma que a CLI de schema execute as mesmas verificações de ciclo de vida de plugins.

**A versão mínima declarada é superior à nova versão do core.** Desativado. Este é o caso comum e é o que sua verificação prévia à atualização deveria ter detectado.

**O diretório do plugin, seu arquivo de configuração ou seu arquivo de declaração está ausente.** Desativado. Um plugin cujos arquivos foram removidos enquanto ele ainda estava marcado como ativado no banco de dados se enquadra aqui.

**O plugin não possui nenhum arquivo de declaração.** Ele pode falhar na verificação de compatibilidade do instalador. Teste um pacote de plugin mantido e compatível em vez de presumir que ele possa ser reativado sem alterações.

Existe um quarto caso que não se trata de uma quebra. Funcionalidades que antes eram um plugin e que foram incorporadas ao core são removidas definitivamente, e não desativadas: seus hooks e entradas de permissão são retirados e seu registro é excluído. Se você vir um plugin desaparecer em vez de ficar desabilitado em cinza, verifique os logs de migração e a disposição específica daquele plugin antes de concluir que recursos equivalentes estão disponíveis.

Desativar um plugin é diferente de desinstalá-lo. Hooks e migrações de plugins podem alterar suas próprias tabelas e permissões; preserve o código e os dados de plugins correspondentes e verifique o caminho específico de atualização. Não faça promessas de preservação universal de dados.

## Planejamento de rollback

Defina o rollback antes de começar, porque a decisão varia conforme o ponto em que você parou.

| Ponto de falha | Como realizar o rollback |
|---|---|
| Código substituído, nenhuma operação de alteração de estado ou gravação foi executada | Restaure o código anterior, dependências e configuração após confirmar que o estado permanece inalterado |
| Conversão de fila ou migração iniciada, incluindo falha parcial | Pare os gravadores e restaure o código, configuração, banco de dados e backups RRD correspondentes |
| Migração concluída, comportamento anômalo da aplicação | Pare os gravadores e restaure o conjunto de backup correspondente; considere as amostras coletadas após o backup |
| Apenas um plugin apresentou defeito | Mantenha-o desativado enquanto avalia a correção versus um rollback coordenado conforme os critérios de aceitação |

A regra sob a tabela: código e schema sofrem rollback juntos ou não sofrem de forma alguma. Código antigo em um schema novo não é um estado suportado. Não confie na verificação de versão da web para impedir todas as operações incompatíveis.

Estabeleça um limite de tempo. Decida com antecedência quanto tempo gastará depurando antes de restaurar, e cumpra esse prazo. O backup perde utilidade quanto mais tempo o sistema opera parcialmente atualizado.

## Por que os arquivos RRD são a parte que você não pode perder

Não presuma que a implantação, a manutenção ou a retomada da coleta mantenham os RRDs inalterados. Faça o backup deles junto com o banco de dados e restaure o conjunto correspondente ao reverter alterações de estado. Amostras mantidas em fila podem ainda não existir nesses arquivos. Um backup de RRD verificado pode recuperar seu histórico capturado; uma amostra ausente não pode ser reconstruída apenas restaurando o schema ou o código. Consulte [Fontes de dados e arquivos round-robin](/pt-br/concepts/data-sources-and-rras/) para entender por que a resolução interna também não pode ser reconstruída.

Três maneiras específicas pelas quais as pessoas perdem esses arquivos durante uma atualização:

**Implantando pela substituição do diretório de instalação.** O diretório RRA tem como padrão um subdiretório da instalação. Remover o diretório antigo e descompactar o novo em seu lugar pode excluir medições retidas. Preserve a árvore RRA por meio de uma estrutura de armazenamento testada antes de substituir a aplicação. Valide o `$config['rra_path']` efetivo, caminhos aninhados e verificações de confiança da conta de serviço; esta revisão não oferece uma configuração geral de banco de dados para uma raiz RRA local arbitrária.

**Implantando a partir de um checkout ou pacote proprietário de toda a árvore.** A mesma falha, de forma automatizada. Confirme o que seu método de implantação considera descartável.

**Corrigindo permissões com uma alteração recursiva de propriedade.** Isso é inofensivo para os dados, mas pode impedir que o poller grave, resultando em um sistema que gera gráficos históricos perfeitamente e não coleta nada novo.

## Após a atualização

1. Inspecione a saída da atualização, a versão do banco de dados e as alterações de schema necessárias, e confirme que a interface carrega. A ausência de um redirecionamento por si só é insuficiente.
2. Conclua as atualizações planejadas de código/configuração dos coletores remotos e valide seus destinos no banco de dados enquanto os produtores permanecem parados.
3. Repita as verificações de armazenamento da conta de serviço, retome os coletores designados e verifique timestamps de última atualização de RRDs representativos e valores utilizáveis retidos.
4. Verifique no log a linha de estatísticas de execução e compare o tempo decorrido com o anterior. Uma nova versão pode alterar o custo da coleta.
5. Reative os plugins que foram desativados, um a um, após instalar versões que declarem compatibilidade com o novo core.
6. Verifique o volume da fila retida, a coleta remota e as tarefas de plugins durante a janela de aceitação combinada. Mantenha o backup de rollback até que essas verificações sejam aprovadas.
