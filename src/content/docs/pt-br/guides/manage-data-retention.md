---
title: Gerenciar a retenção de dados
description: Escolha retenção e resolução, estime armazenamento e planeje alterações em arquivos RRD existentes.
banner:
  content: O Kadupul está em fase pré-alfa. Valide estes procedimentos em uma instalação de testes isolada.
sidebar:
  order: 24
---

:::caution[Validar antes de usar]
O código-fonte está disponível, mas não existe uma versão ou caminho de
migração suportado para o Kadupul. Teste estes procedimentos em uma cópia isolada
com backups antes de depender deles. Consulte o [status do projeto](/pt-br/project/status/).
:::

A retenção é configurada no momento da criação do arquivo e permanece inalterada durante as atualizações normais. Editar o
perfil posteriormente altera o formato do próximo arquivo e deixa cada arquivo existente
exatamente como estava. Acerte isso antes de criar dez mil fontes
de dados, porque alterações posteriores exigem manutenção explícita de arquivos ou migração.

Leia primeiro [Fontes de dados e arquivos](/pt-br/concepts/data-sources-and-rras/) se os
termos passo (step), heartbeat, arquivo e consolidação ainda não lhe forem familiares.

## O que um perfil contém

Um perfil de fonte de dados é a política de retenção. Um perfil, uma estrutura de armazenamento.

| Campo | Significado |
|---|---|
| Intervalo de coleta (step) | Com que frequência um valor é esperado, em segundos |
| Heartbeat | Intervalo máximo permitido entre atualizações antes que a entrada seja tratada como desconhecida |
| Fator X-Files | Que fração de uma janela de consolidação pode ser desconhecida antes que o valor consolidado seja desconhecido |
| Funções de consolidação | Quais de `AVERAGE`, `MIN`, `MAX`, `LAST` são mantidas |
| Arquivos | Uma linha por resolução, cada uma com um nível de agregação e uma contagem de linhas |
| Padrão | Se novas fontes de dados escolhem este perfil |

O passo assume por padrão o intervalo do poller. Um perfil cujo passo seja mais fino do que o
intervalo de coleta não consegue recuperar detalhes que nunca foram amostrados. Se as suas linhas
são desconhecidas depende do heartbeat e da normalização do RRDtool.

## O que vem pronto para uso

Três perfis são fornecidos prontos para uso. Todos os três mantêm as quatro funções de consolidação.

| Perfil | Step | Heartbeat |
|---|---|---|
| 5 Minute Collection | 300s | 600s |
| 1 Minute Collection | 60s | 600s |
| 30 Second Collection | 30s | 1200s |

O perfil 5 Minute é o padrão.

Cada um possui quatro arquivos. O nível de agregação é expresso como um multiplicador de passo,
de modo que a resolução real é o multiplicador vezes o passo do perfil, e o período coberto é
essa resolução vezes a contagem de linhas.

### 5 Minute Collection

| Arquivo | Multiplicador | Linhas | Resolução | Período coberto |
|---|---|---|---|---|
| Daily | 1 | 600 | 5 minutos | cerca de 2 dias |
| Weekly | 6 | 700 | 30 minutos | cerca de 14 dias |
| Monthly | 24 | 775 | 2 horas | cerca de 64 dias |
| Yearly | 288 | 797 | 1 dia | cerca de 2 anos e 2 meses |

### 1 Minute Collection

| Arquivo | Multiplicador | Linhas | Resolução | Período coberto |
|---|---|---|---|---|
| Daily | 1 | 2900 | 1 minuto | cerca de 2 dias |
| Weekly | 15 | 1440 | 15 minutos | 15 dias |
| Monthly | 60 | 8784 | 1 hora | cerca de 366 dias |
| Yearly | 720 | 7305 | 12 horas | cerca de 10 anos |

### 30 Second Collection

| Arquivo | Multiplicador | Linhas | Resolução | Período coberto |
|---|---|---|---|---|
| Daily | 1 | 2900 | 30 segundos | cerca de 1 dia |
| Weekly | 30 | 1346 | 15 minutos | cerca de 14 dias |
| Monthly | 120 | 1445 | 1 hora | cerca de 60 dias |
| Yearly | 480 | 4380 | 4 horas | 2 anos |

Os nomes são rótulos descritivos, não comportamentos obrigatórios. Nada força que o arquivo chamado
"Yearly" armazene rigorosamente um ano.

## Como o perfil se torna um arquivo

Na criação, os arquivos e as funções de consolidação do perfil são lidos e
transformados em um comando de criação. O passo vem do `rrd_step` armazenado
da fonte de dados, normalmente preenchido a partir do seu perfil. Cada item de fonte de dados incluído contribui com uma linha de definição
com seu nome, tipo, heartbeat, mínimo e máximo. Cada arquivo
contribui com uma linha por função de consolidação, contendo a função, o fator X-Files, o multiplicador e a contagem de linhas.

Quatro arquivos multiplicados por quatro funções de consolidação resultam em dezesseis definições
no arquivo. Essa multiplicação é onde o espaço em disco é consumido.

Se o arquivo já existir, o caminho normal de criação para sem reescrevê-lo.
Edições de perfil não migram arquivos automaticamente. Ferramentas de manutenção explícita
são uma operação separada, descrita abaixo.

## Escolhendo uma política

Três perguntas, nesta ordem.

**Qual é a pergunta mais detalhada que você fará?** Isso define o passo. Um passo de
30 segundos responde a "o que aconteceu durante aquela oscilação de 90 segundos". Um passo de 5 minutos
nunca poderá responder a isso, para qualquer arquivo criado sob ele. Passos mais finos custam trabalho do poller
em cada ciclo, além de espaço em disco.

**Até quando no passado você fará essa pergunta?** Isso define a contagem de linhas do arquivo diário. A maioria
das instalações deseja um par de dias em resolução total e fica satisfeita depois
com dados mais agregados.

**Quais perguntas sobrevivem à consolidação?** Isso define as funções de consolidação.
`AVERAGE` responde ao que foi típico. `MAX` responde ao pior pico alcançado.
`MIN` responde se houve alguma queda. `LAST` responde qual foi o valor final na
janela, o que importa para leituras que são estados em vez de taxas.

Omitir uma das quatro funções de consolidação reduz a carga de valores armazenados dos
novos arquivos em um quarto em todas as resoluções. É também o
arrependimento mais comum relatado pelos administradores mais tarde. Mantenha o `MAX` a menos que tenha certeza de que ninguém
jamais perguntará por um pico.

## Dimensionar o disco

O tamanho de um arquivo decorre dos números escolhidos. A partir do dimensionamento utilizado
na interface:

```
file size = 284 + (data sources x (300 + total rows x 8 x consolidation functions))
```

A interface utiliza 284 e 300 bytes como estimativas de sobrecarga fixa. Trate isso
como uma aproximação de dimensionamento, não como uma descrição exata de cada formato de arquivo RRDtool.
Cada valor armazenado ocupa 8 bytes, e o total de linhas é a soma das contagens de linhas nas
definições de arquivo do perfil antes de multiplicar pelas funções de consolidação.
Meça arquivos representativos com o RRDtool instalado antes de dimensionar o armazenamento.

Para um arquivo de fonte de dados única com as quatro funções de consolidação:

| Perfil | Total de linhas | Tamanho aproximado do arquivo |
|---|---|---|
| 5 Minute Collection | 2872 | 92 KB |
| 30 Second Collection | 10,071 | 323 KB |
| 1 Minute Collection | 20,429 | 654 KB |

Multiplique pelo número de fontes de dados esperadas, não pelo número de gráficos. Um
gráfico pode combinar campos de um só arquivo ou de vários arquivos. Conte os arquivos RRD reais
e os itens de fontes de dados dentro de cada um.

Vinte mil fontes de dados no perfil padrão representam cerca de 1,8 GB. As mesmas
vinte mil no perfil 1 Minute representam cerca de 13 GB. Essa proporção reflete
tanto a resolução quanto os diferentes períodos de retenção dos perfis, e não apenas o passo.
Uma coleta mais frequente também aumenta a taxa de escrita. Consulte [Gravações de alto volume](/pt-br/concepts/high-volume-writes/) antes de escolher
um passo fino em grande escala.

Tanto o editor de perfis quanto o de arquivos mostram um tamanho calculado conforme você altera os valores.
Use-os. É fácil errar nessa conta por um fator de quatro.

## O que alterar um perfil faz e não faz

Esta é a parte que custa o histórico aos administradores.

| Alteração | Efeito em arquivos novos | Efeito em arquivos existentes |
|---|---|---|
| Adicionar ou remover um arquivo | Aplicado | Nenhum |
| Alterar uma contagem de linhas | Aplicado | Nenhum |
| Alterar um nível de agregação | Aplicado | Nenhum |
| Adicionar ou remover uma função de consolidação | Aplicado | Nenhum |
| Alterar o passo | Novas fontes de dados o herdam; a criação usa o passo armazenado | Nenhuma migração automática de arquivos |
| Alterar o heartbeat | A criação usa metadados armazenados do item de fonte de dados; ver abaixo | Nenhum ajuste automático de arquivos |
| Excluir o perfil | Recusado enquanto um modelo ou fonte de dados o referenciar, e para o perfil padrão | Nenhum |

**Alterar o heartbeat de um perfil em uso atualiza apenas os metadados.** Salvar um novo
heartbeat o armazena no perfil e nos itens de fonte de dados de modelos e
fontes de dados locais que usam o perfil; outros modelos não são alterados.

Salvar não ajusta arquivos RRD existentes. Faça backup de metadados e arquivos,
e compare o perfil, itens de modelos, itens de fontes de dados locais e a saída real
de `rrdtool info` após a manutenção do heartbeat.

O utilitário `cli/update_heartbeat.php` do coletor principal pode ajustar arquivos existentes
e atualizar metadados. Comece com `--help`, `--list-heartbeats`,
`--list-data-templates` e `--list-profiles`. O novo heartbeat deve ser suportado
e ter pelo menos o dobro do intervalo configurado do poller. Use `--data-template-id` para
limitar a seleção; o utilitário não possui opção de simulação (dry-run).

Sem `--force`, os perfis selecionados já devem ter o heartbeat
solicitado. Com `--force`, valores de perfis compartilhados também mudam, portanto faça um inventário
de todos os usuários antes de continuar. `--prev-heartbeat` filtra valores do banco de dados, não
o heartbeat lido de cada RRD: após um salvamento web parcial, selecionar o valor antigo do
arquivo pode não corresponder a nada. Verifique a seleção e inspecione os arquivos
resultantes. O teste isolado ajustou com sucesso seu arquivo existente de 600 para 900
após os metadados do seu perfil terem sido alinhados.

Há mais duas armadilhas ao lado dessa.

**O editor restringe alterações estruturais assim que um perfil entra em uso.** Assim que
uma fonte de dados real existe em um perfil, passo, fator X-Files, funções de consolidação,
contagens de linhas e níveis de agregação tornam-se somente leitura no editor;
controles de adicionar/excluir arquivos também são ocultados. Duplique o perfil e
edite a cópia. Essas restrições de interface não constituem validação no servidor
das solicitações enviadas.

**Reatribua referências antes de excluir um perfil.** A lista desativa a seleção
quando um modelo ou fonte de dados local usa um perfil, e o servidor recusa
excluir um perfil que ainda esteja referenciado.

## Mover fontes de dados entre perfis

Existe uma ação em massa nos modelos de dados para alterar o perfil. Ela reescreve
o perfil, o passo e o heartbeat registrados no modelo, e limita-se deliberadamente
a linhas de modelos. Fontes de dados já existentes não são incluídas.

Portanto, a sequência para uma migração real é:

1. Criar o novo perfil e verificar seu tamanho calculado.
2. Apontar o modelo de dados para ele.
3. Aceitar que tudo o que for criado a partir de agora usará o novo formato.
4. Decidir, separadamente, o que fazer com os arquivos que você já possui.

O quarto passo tem várias opções, dependendo da alteração e da versão instalada do RRDtool.

**Mantê-los.** Estruturas de retenção diferentes podem coexistir. Mantenha os metadados de coleta
de cada fonte de dados existente consistentes com seu arquivo; alterar apenas uma
referência de perfil no banco de dados não migra seu passo, campos ou arquivos.

**Reconstruir.** Excluir e recriar a fonte de dados. É rápido, mas o histórico é perdido.

**Mesclar (Splice).** O utilitário de linha de comando splice mescla um arquivo antigo em um novo e
pode alterar a resolução durante o processo, desde que o novo arquivo já tenha o
passo correto. Possui um modo de simulação (dry run). Use-o em uma cópia antes de aplicá-lo a
dados importantes.

**Manutenção com RRDtool.** Dependendo da versão instalada e da alteração desejada,
[rrdtool tune](https://oss.oetiker.ch/rrdtool/doc/rrdtune.en.html) ou
[rrdtool resize](https://oss.oetiker.ch/rrdtool/doc/rrdresize.en.html) podem alterar um
arquivo existente preservando os dados retidos. Interrompa processos de escrita concorrentes, mantenha
um backup e verifique o resultado em uma cópia. Essas operações não recriam detalhes
já descartados pela consolidação.

## Perfis externos

Uma fonte de dados pode ser configurada para um perfil externo, que registra um passo de zero.
Isso indica que o arquivo é gerenciado fora do fluxo normal, e a lista de fontes de dados
o exibe como externo em vez de indicar um intervalo. Use-o para arquivos gravados por outro
processo. Não o use para significar "sem política", porque a retenção continua sendo
aquela com a qual o arquivo foi construído; ela simplesmente não está descrita em nenhum lugar visível.

## Modos de falha

| Sintoma | Causa habitual |
|---|---|
| A edição de um perfil parece não surtir efeito | Comportamento esperado. Arquivos existentes mantêm a estrutura com a qual foram criados |
| A contagem de linhas e o nível de agregação não podem ser editados | O perfil está em uso por pelo menos uma fonte de dados. Duplique-o |
| A interface exibe um heartbeat, o arquivo se comporta como outro | O heartbeat do perfil mudou e os arquivos nunca foram ajustados |
| Novas fontes de dados falham na criação, o log indica que não há arquivos atribuídos | O perfil foi excluído enquanto fontes de dados ainda o referenciavam |
| O arquivo mais detalhado está cheio de incógnitas | Verifique atualizações ausentes, heartbeat e regras de consolidação |
| Uma semana de gráficos apresenta lacunas a cada poucas horas | Heartbeat muito próximo do passo para um poller que se atrasa |
| Picos visíveis ontem sumiram na visualização mensal | Apenas `AVERAGE` é mantido, ou o arquivo `MAX` foi descartado para economizar espaço |
| O disco cresceu quatro vezes mais rápido do que o estimado | A estimativa contou arquivos mas omitiu as funções de consolidação |
| A resolução desejada não aparece no menu suspenso de novos arquivos | O editor oferece um arquivo mais fino no passo do perfil e depois apenas opções mais agregadas que os arquivos existentes |
