---
title: Gerir a retenção de dados
description: Escolher retenção e resolução, estimar armazenamento e planear alterações em ficheiros RRD existentes.
banner:
  content: O Kadupul está em fase pré-alfa. Valide estes procedimentos numa instalação de testes isolada.
sidebar:
  order: 24
---

:::caution[Validar antes de utilizar]
O código-fonte está disponível, mas não existe uma versão ou caminho de
migração suportado para o Kadupul. Teste estes procedimentos numa cópia isolada
com cópias de segurança antes de depender deles. Consulte o [estado do projeto](/pt-pt/project/status/).
:::

A retenção é configurada no momento da criação do ficheiro e permanece inalterada durante as atualizações normais. Editar o
perfil posteriormente altera o formato do próximo ficheiro e deixa cada ficheiro existente
exatamente como estava. Defina isto corretamente antes de criar dez mil fontes
de dados, porque alterações posteriores exigem manutenção explícita de ficheiros ou migração.

Leia primeiro [Fontes de dados e históricos consolidados](/pt-pt/concepts/data-sources-and-rras/) se os
termos passo (step), heartbeat, consolidação e arquivo não lhe forem familiares.

## O que um perfil contém

Um perfil de fonte de dados é a política de retenção. Um perfil, uma estrutura de armazenamento.

| Campo | Significado |
|---|---|
| Intervalo de consulta (step) | Com que frequência um valor é esperado, em segundos |
| Heartbeat | Intervalo máximo permitido entre atualizações antes de a entrada ser tratada como desconhecida |
| Fator X-Files | Que fração de uma janela de consolidação pode ser desconhecida antes de o valor consolidado ser desconhecido |
| Funções de consolidação | Quais de `AVERAGE`, `MIN`, `MAX`, `LAST` são mantidas |
| Consolidações | Uma linha por resolução, cada uma com um nível de agregação e um número de linhas |
| Predefinição | Se as novas fontes de dados escolhem este perfil |

O passo assume por predefinição o intervalo do poller. Um perfil cujo passo seja mais fino do que o
intervalo de consulta não consegue recuperar detalhes que nunca foram amostrados. Se as suas linhas
são desconhecidas depende do heartbeat e da normalização do RRDtool.

## O que é fornecido de origem

Três perfis são fornecidos de origem. Todos os três mantêm as quatro funções de consolidação.

| Perfil | Step | Heartbeat |
|---|---|---|
| 5 Minute Collection | 300s | 600s |
| 1 Minute Collection | 60s | 600s |
| 30 Second Collection | 30s | 1200s |

O perfil 5 Minute é a predefinição.

Cada um tem quatro consolidações. O nível de agregação é expresso como um multiplicador de passo,
pelo que a resolução real é o multiplicador vezes o passo do perfil, e o período abrangido é
essa resolução vezes a contagem de linhas.

### 5 Minute Collection

| Consolidação | Multiplicador | Linhas | Resolução | Período abrangido |
|---|---|---|---|---|
| Daily | 1 | 600 | 5 minutos | cerca de 2 dias |
| Weekly | 6 | 700 | 30 minutos | cerca de 14 dias |
| Monthly | 24 | 775 | 2 horas | cerca de 64 dias |
| Yearly | 288 | 797 | 1 dia | cerca de 2 anos e 2 meses |

### 1 Minute Collection

| Consolidação | Multiplicador | Linhas | Resolução | Período abrangido |
|---|---|---|---|---|
| Daily | 1 | 2900 | 1 minuto | cerca de 2 dias |
| Weekly | 15 | 1440 | 15 minutos | 15 dias |
| Monthly | 60 | 8784 | 1 hora | cerca de 366 dias |
| Yearly | 720 | 7305 | 12 horas | cerca de 10 anos |

### 30 Second Collection

| Consolidação | Multiplicador | Linhas | Resolução | Período abrangido |
|---|---|---|---|---|
| Daily | 1 | 2900 | 30 segundos | cerca de 1 dia |
| Weekly | 30 | 1346 | 15 minutos | cerca de 14 dias |
| Monthly | 120 | 1445 | 1 hora | cerca de 60 dias |
| Yearly | 480 | 4380 | 4 horas | 2 anos |

Os nomes são rótulos descritivos, não comportamento imposto. Nada força que a consolidação denominada
"Yearly" guarde rigorosamente um ano.

## Como o perfil se torna um ficheiro

Na criação, as consolidações e as funções de consolidação do perfil são lidas e
transformadas num comando de criação. O passo provém do `rrd_step` armazenado
da fonte de dados, normalmente preenchido a partir do seu perfil. Cada item de fonte de dados incluído contribui com uma linha de definição
com o seu nome, tipo, heartbeat, mínimo e máximo. Cada consolidação
contribui com uma linha por função de consolidação, contendo a função, o fator X-Files, o multiplicador e a contagem de linhas.

Quatro consolidações multiplicadas por quatro funções de consolidação resultam em dezasseis definições
no ficheiro. Essa multiplicação é onde o espaço em disco é consumido.

Se o ficheiro já existir, o caminho normal de criação é interrompido sem o reescrever.
A edição de perfis não migra ficheiros automaticamente. Ferramentas de manutenção explícita
são uma operação separada, descrita abaixo.

## Escolher uma política

Três perguntas, por esta ordem.

**Qual é a pergunta mais detalhada que alguma vez fará?** Isso define o passo. Um passo de
30 segundos responde a "o que aconteceu durante aquela anomalia de 90 segundos". Um passo de 5 minutos
nunca poderá responder a isso, para qualquer ficheiro criado sob ele. Passos mais finos exigem esforço do poller
em cada ciclo, bem como espaço em disco.

**Até que ponto no passado fará essa pergunta?** Isso define a contagem de linhas da consolidação diária. A maioria
das instalações pretende um par de dias na resolução máxima e fica depois satisfeita
com dados mais gerais.

**Quais perguntas sobrevivem à consolidação?** Isso define as funções de consolidação.
`AVERAGE` responde ao que foi típico. `MAX` responde à gravidade máxima atingida.
`MIN` responde se alguma vez houve quebras. `LAST` responde a qual foi o valor final na
janela, o que importa para leituras que são estados em vez de taxas.

Omitir uma das quatro funções de consolidação reduz o volume de valores armazenados dos
novos ficheiros em um quarto em cada resolução. É também o
arrependimento mais comum que os administradores comunicam mais tarde. Mantenha o `MAX` a menos que tenha a certeza de que ninguém
irá alguma vez perguntar por um pico.

## Dimensionar o disco

O tamanho de um ficheiro decorre dos números que escolher. A partir do dimensionamento utilizado
na interface:

```
file size = 284 + (data sources x (300 + total rows x 8 x consolidation functions))
```

A interface utiliza 284 e 300 bytes como estimativas de sobrecarga fixa. Trate isto
como uma aproximação de dimensionamento, não como uma descrição exata de cada formato de ficheiro RRDtool.
Cada valor armazenado ocupa 8 bytes, e o total de linhas é a soma das contagens de linhas nas
definições de consolidação do perfil antes de multiplicar pelas funções de consolidação.
Meça ficheiros representativos com o RRDtool instalado antes de dimensionar o armazenamento.

Para um ficheiro de fonte de dados única com as quatro funções de consolidação:

| Perfil | Total de linhas | Tamanho aproximado do ficheiro |
|---|---|---|
| 5 Minute Collection | 2872 | 92 KB |
| 30 Second Collection | 10,071 | 323 KB |
| 1 Minute Collection | 20,429 | 654 KB |

Multiplique pelo número de fontes de dados que espera, não pelo número de gráficos. Um
gráfico pode combinar campos de um só ficheiro ou de vários ficheiros. Conte os ficheiros RRD reais
e os itens de fontes de dados dentro de cada um.

Vinte mil fontes de dados no perfil predefinido representam cerca de 1,8 GB. As mesmas
vinte mil no perfil 1 Minute representam cerca de 13 GB. Esta proporção reflete
tanto a resolução como os diferentes períodos de retenção dos perfis, e não apenas o passo.
Uma recolha mais fina também aumenta a frequência de escrita. Consulte [Gravações de alto volume](/pt-pt/concepts/high-volume-writes/) antes de escolher
um passo fino em grande escala.

Tanto o editor de perfis como o de consolidações mostram um tamanho calculado à medida que altera os valores.
Utilize-os. É fácil errar nestas contas por um fator de quatro.

## O que alterar um perfil faz e não faz

Esta é a parte que custa o histórico aos utilizadores.

| Alteração | Efeito em ficheiros novos | Efeito em ficheiros existentes |
|---|---|---|
| Adicionar ou remover uma consolidação | Aplicado | Nenhum |
| Alterar uma contagem de linhas | Aplicado | Nenhum |
| Alterar um nível de agregação | Aplicado | Nenhum |
| Adicionar ou remover uma função de consolidação | Aplicado | Nenhum |
| Alterar o passo | Novas fontes de dados herdam-no; a criação utiliza o passo guardado | Nenhuma migração automática de ficheiros |
| Alterar o heartbeat | A criação utiliza metadados guardados do item de fonte de dados; ver abaixo | Nenhum ajuste automático de ficheiros |
| Eliminar o perfil | Recusado enquanto um modelo ou fonte de dados o referenciar, e para o perfil predefinido | Nenhum |

**Alterar o heartbeat de um perfil em utilização apenas atualiza os metadados.** Guardar um novo
heartbeat armazena-o no perfil e nos itens de fonte de dados de modelos e
fontes de dados locais que utilizam o perfil; outros modelos não são alterados.

A gravação não ajusta ficheiros RRD existentes. Faça cópias de segurança de metadados e ficheiros,
e compare o perfil, itens de modelos, itens de fontes de dados locais e o resultado real
de `rrdtool info` após a manutenção do heartbeat.

O utilitário `cli/update_heartbeat.php` do coletor principal pode ajustar ficheiros existentes
e atualizar metadados. Comece com `--help`, `--list-heartbeats`,
`--list-data-templates` e `--list-profiles`. O novo heartbeat deve ser suportado
e ter pelo menos o dobro do intervalo configurado do poller. Utilize `--data-template-id` para
limitar a seleção; o utilitário não tem opção de simulação (dry-run).

Sem `--force`, os perfis selecionados já devem ter o heartbeat
solicitado. Com `--force`, valores de perfis partilhados também são alterados, pelo que deve inventariar
todos os utilizadores antes de avançar. `--prev-heartbeat` filtra valores da base de dados, não
o heartbeat lido de cada RRD: após uma gravação web parcial, selecionar o valor antigo do
ficheiro pode não corresponder a nada. Verifique a seleção e inspecione os ficheiros
resultantes. O teste isolado ajustou com sucesso o seu ficheiro existente de 600 para 900
após os metadados do seu perfil terem sido alinhados.

Existem mais duas armadilhas ao lado dessa.

**O editor restringe alterações estruturais assim que um perfil está em utilização.** Assim que
uma fonte de dados real existe num perfil, o passo, o fator X-Files, as funções de consolidação,
as contagens de linhas e os níveis de agregação tornam-se de leitura exclusiva no editor;
os controlos de adicionar/eliminar consolidações também são ocultados. Duplique o perfil e
edite a cópia. Estas restrições de interface não constituem validação no servidor
dos pedidos submetidos.

**Reatribua referências antes de eliminar um perfil.** A lista desativa a seleção
quando um modelo ou fonte de dados local utiliza um perfil, e o servidor recusa
eliminar um perfil que ainda esteja referenciado.

## Mover fontes de dados entre perfis

Existe uma ação em lote nos modelos de dados para alterar o perfil. Esta reescreve
o perfil, o passo e o heartbeat registados no modelo, e restringe-se deliberadamente
a linhas de modelos. Fontes de dados já existentes não são incluídas.

Portanto, a sequência para uma migração real é:

1. Criar o novo perfil e verificar o seu tamanho calculado.
2. Apontar o modelo de dados para ele.
3. Aceitar que tudo o que for criado a partir de agora usará o novo formato.
4. Decidir, em separado, o que fazer com os ficheiros que já possui.

O quarto passo tem várias opções, dependendo da alteração e da versão instalada do RRDtool.

**Mantê-los.** Estruturas de retenção diferentes podem coexistir. Mantenha os metadados de consulta
de cada fonte de dados existente coerentes com o seu ficheiro; alterar apenas uma
referência de perfil na base de dados não migra o seu passo, campos ou consolidações.

**Reconstruir.** Eliminar e recriar a fonte de dados. É rápido, mas o histórico perde-se.

**Empalmar (Splice).** O utilitário de linha de comandos splice funde um ficheiro antigo num novo e
pode alterar a resolução durante o processo, desde que o novo ficheiro já tenha o
passo correto. Tem um modo de simulação (dry run). Utilize-o numa cópia antes de o usar em
dados essenciais.

**Manutenção RRDtool.** Dependendo da versão instalada e da alteração pretendida,
[rrdtool tune](https://oss.oetiker.ch/rrdtool/doc/rrdtune.en.html) ou
[rrdtool resize](https://oss.oetiker.ch/rrdtool/doc/rrdresize.en.html) podem alterar um
ficheiro existente preservando os dados retidos. Interrompa processos de escrita concorrentes, mantenha
uma cópia de segurança e verifique o resultado numa cópia. Estas operações não recriam detalhes
já descartados pela consolidação.

## Perfis externos

Uma fonte de dados pode ser configurada para um perfil externo, que regista um passo de zero.
Isso indica que o ficheiro é gerido fora do fluxo normal, e a lista de fontes de dados
mostra-o como externo em vez de indicar um intervalo. Utilize-o para ficheiros gravados por outro
processo. Não o use para significar "sem política", porque a retenção continua a ser
aquela com que o ficheiro foi construído; simplesmente não está descrita em nenhum local visível.

## Modos de falha

| Sintoma | Causa habitual |
|---|---|
| A edição de um perfil parece não fazer nada | Comportamento esperado. Ficheiros existentes mantêm a estrutura com que foram criados |
| A contagem de linhas e o nível de agregação não podem ser editados | O perfil está em utilização por pelo menos uma fonte de dados. Duplique-o |
| A interface apresenta um heartbeat, o ficheiro comporta-se como outro | O heartbeat do perfil mudou e os ficheiros nunca foram ajustados |
| Novas fontes de dados falham na criação, o registo indica que não há consolidações atribuídas | O perfil foi eliminado enquanto fontes de dados ainda o referenciavam |
| A consolidação mais fina está cheia de incógnitas | Verifique atualizações em falta, heartbeat e regras de consolidação |
| Uma semana de gráficos tem falhas a cada poucas horas | Heartbeat demasiado próximo do passo para um poller que se atrasa |
| Picos visíveis ontem desapareceram na vista mensal | Apenas `AVERAGE` é mantido, ou a consolidação `MAX` foi descartada para poupar espaço |
| O disco aumentou quatro vezes mais depressa do que o estimado | A estimativa contou consolidações mas omitiu as funções de consolidação |
| Uma resolução pretendida está ausente do menu pendente de novas consolidações | O editor oferece uma consolidação mais fina no passo do perfil e depois apenas escolhas mais grosseiras do que as existentes |
