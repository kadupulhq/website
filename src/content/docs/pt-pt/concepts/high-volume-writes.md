---
title: Escritas de grande volume
description: Por que razão as atualizações RRD são limitadas pela quantidade de escritas e não pelo seu tamanho, o que o agrupamento em lotes proporciona e o que custa em frescura.
banner:
  content: O Kadupul está em pré-alfa. Valide estes procedimentos numa instalação de teste isolada. Tradução em rascunho, pendente de revisão por uma pessoa fluente no idioma.
sidebar:
  order: 10
---

As atualizações RRD acedem a muitos ficheiros e podem ser limitadas pela latência do armazenamento
e pelas operações de E/S, não apenas pela largura de banda de transferência. As escritas diferidas,
também conhecidas como Boost, acumulam amostras na base de dados e agrupam atualizações para cada
ficheiro. Avalie o módulo de escrita e a base de dados antes de optar por esta solução: falhas nos
gráficos não apontam necessariamente para um estrangulamento no armazenamento.

## O caminho predefinido

Os coletores inserem resultados na fila em trânsito `poller_output`. O módulo de escrita agrupa
amostras por ficheiro e carimbo de data/hora, atualiza o ficheiro RRD e aguarda confirmação antes
de descartar amostras elegíveis. Escritas falhadas podem deixar linhas pendentes para nova tentativa,
pelo que a fila não se restringe apenas ao ciclo de recolha em curso.

Na versão revista, esta fila utiliza InnoDB. A validação prévia da recolha recusa uma fila MEMORY;
um reinício da base de dados não descarta inerentemente linhas confirmadas como aconteceria com
uma tabela em memória. A durabilidade continua a depender da configuração da base de dados, do estado
do armazenamento e das cópias de segurança. Consulte [Atualizar com segurança](/pt-pt/guides/upgrade-safely/)
para verificações de migração de filas e armazenamento.

Como estimativa aproximada de carga, 10.000 ficheiros distintos atualizados a cada 300 segundos implicam
uma média de cerca de 33 atualizações de ficheiros por segundo. As escritas reais ocorrem em rajadas;
múltiplos campos de fontes de dados podem partilhar o mesmo ficheiro, os intervalos podem diferir e
a quantidade de comandos não equivale ao número físico de operações de E/S em disco. Compare a latência
medida de escrita e a idade da fila com a janela de recolha disponível.

## O que o agrupamento em lotes altera

Com escrituras diferidas ativadas, a recolha armazena amostras em `poller_output_boost` para
processamento posterior. O módulo de escrita em lote agrupa amostras por fonte de dados em ordem
cronológica e pode enviar vários carimbos de data/hora num único comando de atualização RRDtool.
Doze amostras podem caber num único comando, embora tal não garanta uma única operação física de
escrita em disco.

O comprimento máximo de argumentos configurado limita as sequências de atualização; a predefinição
é de 2.000. Este valor condiciona a dimensão do lote. Não deduza um limite específico do sistema
operativo a partir desta definição: escritas locais confirmadas utilizam um fluxo de comandos RRDtool,
sendo o transporte real e o tamanho de comando suportado os elementos determinantes.

O agendador torna-se elegível quando o seu temporizador expira (60 minutos por predefinição) ou
quando a estimativa de linhas no buffer excede o limite configurado (1.000.000 por predefinição).
Esta estimativa contabiliza as tabelas ativas e tabelas de arquivo. Uma invocação do agendador tem de
ocorrer efetivamente, e verificações de processos, preparação ou falhas no módulo de escrita podem
atrasar o trabalho. Execuções forçadas, esvaziamento após desativação e atualizações a pedido durante
a visualização de gráficos são circuitos adicionais; os valores predefinidos não constituem uma
garantia de frescura de uma hora.

Qualquer intervalo que seja zero ou não seja um número inteiro positivo é substituído por 120 minutos;
o valor predefinido comum é de 60 minutos.

## A rotação e a razão da sua existência

A arquitetura em lote cria uma tabela vazia idêntica ao buffer ativo e permuta os nomes com uma
única instrução `RENAME TABLE`. A antiga tabela ativa passa a ser uma tabela de arquivo com carimbo de
data/hora e os produtores passam a visar a nova tabela. Isto isola o lote de novas inserções, embora
bloqueios na base de dados e contenção de recursos ainda possam atrasar a recolha.

Os processos de trabalho tratam as tabelas arquivadas atuais e retidas. O processo principal monitoriza a
conclusão e o estado dos processos secundários; execuções falhadas ou não verificáveis mantêm as
tabelas arquivadas para novas tentativas. Durante uma limpeza elegível, tabelas arquivadas vazias podem ser eliminadas
e as amostras remanescentes podem ser recolocadas no buffer ativo antes de eliminar a tabela arquivada. Uma
tabela arquivada não vazia não é descartada apenas porque o processo terminou. Inspecione tanto a fila ativa
como a de histórico ao diagnosticar acumulações de dados.

Trata-se de uma gestão de novas tentativas, não de uma garantia universal contra falhas de sistema.
Erros de base de dados, atividade concorrente, falhas de hardware e consistência de cópias de segurança
têm de ser validados no ambiente em exploração.

## Por que razão a visualização de um gráfico pode atualizar os seus ficheiros

O circuito habitual de apresentação de gráficos pode tentar atualizações a pedido para cada fonte
de dados referenciada pelo gráfico antes de o desenhar. Não descarrega incondicionalmente todas as
amostras pendentes: verificações do coletor, circuitos de tempo real/origem/erro, limites de recolha
ativa, restrições de consultas e falhas de atualização afetam o que é processado. Amostras recentes
ou falhadas podem permanecer na fila.

Um gráfico com aparência atualizada não prova, portanto, que toda a estrutura de ficheiros RRD
esteja em dia, e solicitar um gráfico não garante uma reprodução correta. Verifique erros de escrita,
idade da fila e carimbos de data/hora reais nos ficheiros RRD. Cópias de segurança restritas a ficheiros
omitem amostras pendentes na base de dados; consulte
[Cópia de segurança e restauro](/pt-pt/guides/back-up-and-restore/).

## O que abdica em troca

**Frescura dos ficheiros.** As amostras permanecem na base de dados até serem processadas com sucesso.
Uma instalação saudável orientada por temporizador pode ter um atraso de aproximadamente um intervalo
de descarga; um módulo de escrita com falhas ou subdimensionado pode acumular um atraso muito maior.
Guarde cópias de segurança consistentes tanto das filas pendentes como dos ficheiros.

**Um segundo agendamento.** Monitorize a recolha e a descarga de forma independente. Observe linhas
ativas, tabelas arquivadas retidas, a idade da amostra mais antiga, processos secundários falhados e o débito
do módulo de escrita. Uma tabela ativa não precisa de ficar vazia enquanto os produtores continuarem
a inserir dados, e a rotação por si só pode dar a ilusão de um tamanho menor sem ter concluído
qualquer atualização em ficheiros RRD.

**Ordenação.** Os ficheiros RRD não aceitam carimbos de data/hora anteriores após atualizações mais
recentes. O motor Boost moderno ignora atualizações do passado e o circuito legado filtra os
carimbos relativamente à última atualização do ficheiro. Um comando confirmado com sucesso pode,
por isso, descartar dados antigos; uma entrega tardia não garante que a amostra surja no gráfico.

**Superfície operacional.** Há um buffer na base de dados, um processo de descarga com limite de memória,
processos de trabalho paralelos opcionais e tabelas arquivadas retidas ou amostras recolocadas em fila para
monitorizar. Falhas locais no módulo de escrita mantêm geralmente as amostras para novas tentativas,
mas isto não estabelece uma integridade sem perdas de ponta a ponta. Para o circuito de recuperação
remota, consulte [Recolha remota de dados](/pt-pt/concepts/remote-data-collection/).

## Quando vale a pena

Considere o diferimento de escritas quando as medições demonstrarem que o módulo de escrita RRD é o
fator limitador e a base de dados tem capacidade para acomodar o buffer e consultas em lote. Não remove
a latência dos dispositivos nem resolve uma base de dados sobrecarregada. Compare o débito, a idade da
fila, a frescura dos ficheiros e a utilização de recursos antes e após a ativação.

O poller principal ativa automaticamente a atualização diferida quando está configurado um coletor
remoto ativo. Essa definição, por si só, não valida uma infraestrutura remota de armazenamento ou
recuperação; tenha em conta os limites indicados em
[Recolha remota de dados](/pt-pt/concepts/remote-data-collection/).

## Uma funcionalidade diferente com o mesmo nome

As imagens geradas dos gráficos também podem ser mantidas em cache. A colocação de imagens em cache
reduz o processamento repetido; as escritas diferidas agrupam amostras da base de dados em atualizações
RRD. As suas definições são distintas, mas os respetivos caminhos de execução interagem: pedidos de
gráficos podem verificar amostras pendentes antes de utilizar uma imagem em cache, e atualizações
bem-sucedidas podem motivar a geração de uma nova imagem. Avalie a frescura das imagens em separado
da frescura da fila e dos ficheiros RRD.
