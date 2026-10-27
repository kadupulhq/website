---
title: "Atualizar em segurança"
description: "Ensaiar uma atualização, manter cópias de segurança sincronizadas, verificar o armazenamento e o esquema, e planear uma reversão coordenada."
banner:
  content: "O Kadupul está em pré-alfa. Valide estes procedimentos numa instalação de teste isolada. Tradução em rascunho, pendente de revisão por uma pessoa fluente no idioma."
sidebar:
  order: 8
---

:::caution[Validar antes de utilizar]
O código-fonte está disponível, mas não existe uma versão com suporte nem um caminho de migração para o Kadupul. Teste estes procedimentos numa cópia isolada com cópias de segurança antes de depender deles. Consulte o [estado do projeto](/pt-pt/project/status/).
:::

Uma atualização altera três elementos em momentos distintos e com graus de reversibilidade diferentes.

| Alterações | Reversível | Como |
|---|---|---|
| Código, dependências e configuração | A partir de uma cópia guardada | Restaure a revisão e as definições correspondentes |
| Esquema da base de dados e amostras em fila | A partir de uma cópia de segurança correspondente | Restaure a base de dados; não existe migração inversa automática |
| Ficheiros RRD | A partir de uma cópia de segurança correspondente | Restaure o histórico retido; amostras ausentes da cópia de segurança não podem ser recriadas por reversão |

O procedimento existe para manter estes três elementos em sincronia.

## Antes de começar

**Faça a cópia de segurança completa.** Todas as três partes, consistentes entre si. Siga o guia [Cópia de segurança e restauro](/pt-pt/guides/back-up-and-restore/). Pare todos os processos de escrita antes da captura final e guarde a cópia de segurança protegida até à aceitação da atualização.

**Registe a revisão atual e a versão do esquema.** Inclua dependências, alterações locais, plugins e configuração. Múltiplas revisões de código podem indicar a mesma versão de esquema. Ensaie a revisão de destino numa cópia isolada restaurada.

**Verifique todos os plugins.** Inspecione a declaração de compatibilidade, o código e as dependências, e depois teste as funcionalidades necessárias com a revisão de destino. Uma declaração de versão mínima por si só não garante compatibilidade. Consulte a [Validação de plugins](/pt-pt/guides/install-and-vet-plugins/).

**Verifique o ambiente de execução.** Versão do PHP, extensões do PHP e a versão do servidor de base de dados. Verifique os [requisitos](/pt-pt/reference/requirements/) do destino antes da implementação. Não presuma que a CLI de esquema executa todas as verificações do instalador web.

**Verifique se a conta da base de dados pode alterar o esquema.** Em execução normal, a conta necessita de ler e escrever na sua própria base de dados. Durante a atualização, também necessita de criar, alterar e eliminar tabelas e índices. As instalações que restringiram as concessões de privilégios após a configuração inicial descobrem isto nesta fase.

**Pare todos os produtores.** Interrompa a recolha agendada, os recolhedores remotos, a recolha acionada pela web e a manutenção manual; aguarde que o trabalho em curso termine. Drene as escritas diferidas apenas após os produtores estarem parados e preserve quaisquer linhas não confirmadas da fila juntamente com a cópia de segurança correspondente. Mantenha os produtores parados durante a implementação e a validação do esquema.

## Substituir a aplicação

Uma cópia por sobreposição tem limites específicos:

```bash
# Copies the contents of the new tree over the old one.
cp -a /path/to/new-release/. /path/to/kadupul/
```

Sem isso, `cp -a /path/to/new-release /path/to/kadupul` cria `kadupul/new-release/` e deixa todos os ficheiros da aplicação antiga exatamente onde estavam. A atualização parece ter funcionado, a interface continua a executar o código antigo, e o primeiro sinal de problemas é a migração de esquema recusar-se a corresponder a uma versão que pensava ter substituído.

Uma cópia direta sobre a estrutura existente mantém ficheiros ausentes na nova árvore, incluindo ficheiros obsoletos da aplicação. Pode substituir quaisquer caminhos coincidentes, pelo que deve inspecionar o artefacto em vez de presumir que a configuração ou os dados estão excluídos. Dê preferência a uma árvore de teste revista com dependências, configuração e plugins correspondentes. Se alternar versões através de uma ligação simbólica, valide o caminho RRA efetivo e o acesso ao armazenamento antes da mudança; o bootstrap atual deduz esse caminho a partir do diretório da aplicação concatenado com `/rra`. Uma mudança de ligação simbólica por si só não reverte a base de dados.

**Verifique o que está realmente a executar antes de avançar.**

```bash
cat /path/to/kadupul/include/cacti_version
```

Se o comando não indicar a versão que acabou de implementar, pare. Tudo a partir deste ponto pressupõe que o código pretendido está implementado. Compare também a revisão do código-fonte ou a soma de verificação do artefacto com o registo de lançamento; a cadeia de versão por si só não é suficiente.

## A migração do esquema

A base de dados possui a sua própria versão, separada da versão existente no código. Substituir o código não a altera.

Páginas autenticadas legadas reencaminham para o instalador quando as versões do código e da base de dados divergem. Esta não é uma proteção universal para todos os endpoints ou CLI, e cadeias de versão coincidentes não comprovam que todas as migrações foram concluídas. Verifique o estado do esquema diretamente.

O instalador e a CLI executam passos ordenados de migração. Antes da atualização normal do esquema, verifique a fila duradoura e o acesso ao armazenamento da conta de serviço. Se uma fila herdada de `poller_output` não for InnoDB, converta-a explicitamente com os processos de escrita parados e a cópia de segurança guardada:

```sh
php cli/upgrade_database.php --migrate-poller-queue
```

Em seguida, execute este comando sob cada conta real de web e do sondador:

```sh
php cli/upgrade_database.php --check-rrd-storage
```

Os dois parâmetros são operações distintas e não podem ser combinados. A conversão da fila preserva amostras pendentes; não elimine linhas para passar numa verificação. Resolva a propriedade e a configuração de UID/GID numéricos fidedignos utilizando os [requisitos de armazenamento](/pt-pt/reference/requirements/). Os recolhedores remotos online selecionam normalmente a fila principal; utilize `--local` apenas para uma verificação ou conversão intencional da fila local. Assim que estas verificações passarem, execute a atualização do esquema a partir da raiz da aplicação:

```sh
php cli/upgrade_database.php
```

Execute o comando com a conta de serviço configurada, com o acesso necessário ao sistema de ficheiros e os privilégios da base de dados. Uma verificação com sucesso como root não comprova o acesso da conta de serviço. Existe uma opção `--forcever` para definir explicitamente a versão inicial, que existe para reexecutar uma migração durante testes de pré-lançamento. Não faz parte de uma atualização normal e utilizá-la para ignorar um passo que falhou deixará o esquema migrado pela metade.

Capture o estado de saída e o resultado, e depois verifique a versão da base de dados e as alterações de esquema exigidas. A CLI atual pode rejeitar uma versão inicial legada desconhecida ou não suportada e, ainda assim, terminar com o código 0; um estado de sucesso na shell por si só não é suficiente. Se a migração falhar a meio, mantenha os produtores parados e restaure o conjunto de cópia de segurança correspondente em vez de tentar ignorar o passo que falhou.

## O que quebra os plugins

As verificações de plugins do instalador web podem desativar plugins incompatíveis ou em falta. Não presuma que a CLI de esquema executa as mesmas verificações de ciclo de vida dos plugins.

**A versão mínima declarada é superior à nova versão principal.** Desativado. Este é o caso habitual e é aquele que a sua verificação prévia à atualização deveria ter detetado.

**O diretório do plugin, o seu ficheiro de configuração ou o seu ficheiro de declaração está em falta.** Desativado. Um plugin cujos ficheiros foram removidos enquanto ainda estava marcado como ativado na base de dados enquadra-se aqui.

**O plugin não possui nenhum ficheiro de declaração.** Pode falhar na verificação de compatibilidade do instalador. Teste um pacote de plugin mantido e compatível em vez de presumir que pode ser reativado sem alterações.

Existe um quarto caso que não constitui uma avaria. Funcionalidades que outrora foram um plugin e que, entretanto, passaram a fazer parte do núcleo são completamente removidas, e não desativadas: os seus ganchos (hooks) e registos de permissões são retirados e a respetiva linha é eliminada. Se vir um plugin desaparecer em vez de ficar a cinzento, consulte os registos de migração e o destino específico desse plugin antes de concluir que funcionalidades equivalentes estão disponíveis.

Desativar um plugin é diferente de o desinstalar. Os ganchos e as migrações dos plugins podem alterar as suas próprias tabelas e permissões; guarde o código e os dados dos plugins correspondentes e verifique o percurso específico de atualização. Não garanta a preservação universal dos dados.

## Planeamento de reversão

Decida a reversão antes de começar, porque a decisão varia consoante o ponto até onde avançou.

| Ponto de falha | Como reverter |
|---|---|
| Código substituído, nenhuma operação de alteração de estado ou escrita executada | Restaure o código, dependências e configuração anteriores após confirmar que o estado não foi alterado |
| Conversão de fila ou migração iniciada, incluindo falha parcial | Pare os processos de escrita e restaure o código, configuração, base de dados e cópias de segurança de RRD correspondentes |
| Migração concluída, comportamento anómalo da aplicação | Pare os processos de escrita e restaure o conjunto de cópia de segurança correspondente; considere as amostras recolhidas após a cópia |
| Apenas um plugin está danificado | Mantenha-o desativado enquanto avalia a reparação face a uma reversão coordenada segundo os critérios de aceitação |

A regra sob a tabela: o código e o esquema revertem em conjunto ou não revertem de todo. Código antigo numa base de dados com esquema novo não é um estado suportado. Não confie na verificação de versão da interface web para impedir todas as operações incompatíveis.

Estabeleça um limite de tempo. Decida com antecedência quanto tempo dedicará à depuração antes de restaurar, e cumpra-o. A cópia de segurança torna-se menos útil quanto mais tempo o sistema funcionar parcialmente atualizado.

## Porque é que os ficheiros RRD são a parte que não pode perder

Não presuma que a implementação, a manutenção ou o reinício da recolha deixam os RRD inalterados. Faça a cópia de segurança dos mesmos juntamente com a base de dados e restaure o conjunto correspondente quando reverter alterações de estado. Amostras retidas em fila podem ainda não existir nesses ficheiros. Uma cópia de segurança verificada de RRD pode recuperar o seu histórico capturado; uma amostra em falta não pode ser reconstruída apenas através do restauro do esquema ou do código. Consulte [Fontes de dados e consolidações round-robin](/pt-pt/concepts/data-sources-and-rras/) para compreender porque é que a resolução interna também não pode ser reconstruída.

Três formas específicas através das quais se perdem estes dados durante uma atualização:

**Implementar através da substituição do diretório de instalação.** O diretório RRA reside por predefinição num subdiretório da instalação. Remover o diretório antigo e descompactar o novo no seu lugar pode eliminar medições retidas. Preserve a árvore RRA através de uma solução de armazenamento testada antes de substituir a aplicação. Valide o `$config['rra_path']` efetivo, os caminhos aninhados e as verificações de fidedignidade da conta de serviço; esta revisão não oferece uma definição geral na base de dados para uma raiz RRA local arbitrária.

**Implementar a partir de um repositório ou pacote que se apropria de toda a árvore.** A mesma falha, de forma automatizada. Confirme o que o seu método de implementação considera eliminável.

**Corrigir permissões com uma alteração recursiva de propriedade.** É inofensivo para os dados, mas pode deixar o sondador incapaz de escrever, o que se manifesta como um sistema que traça gráficos históricos na perfeição mas não recolhe nada de novo.

## Após a atualização

1. Inspecione o resultado da atualização, a versão da base de dados e as alterações de esquema exigidas, e depois confirme que a interface carrega. A simples ausência de um reencaminhamento não é suficiente.
2. Conclua as atualizações planeadas de código/configuração dos recolhedores remotos e valide os seus destinos na base de dados enquanto os respetivos produtores permanecem parados.
3. Repita as verificações de armazenamento da conta de serviço, retome os recolhedores designados e verifique os carimbos de última atualização de RRD representativos e os valores retidos utilizáveis.
4. Verifique o registo à procura da linha de estatísticas de execução e compare o tempo decorrido com o anterior. Uma nova versão pode alterar o custo de recolha.
5. Reative os plugins que foram desativados, um a um, após instalar versões que declarem compatibilidade com o novo núcleo.
6. Verifique o volume da fila retida, a recolha remota e as tarefas dos plugins durante a janela de aceitação acordada. Guarde a cópia de segurança de reversão até que estas verificações sejam aprovadas.
