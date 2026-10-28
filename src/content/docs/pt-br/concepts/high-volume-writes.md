---
title: Gravações de alto volume
description: Por que as atualizações do RRD são limitadas pela contagem de gravações e não pelo tamanho, o que o loteamento oferece e quanto custa em termos de atualização dos dados.
banner:
  content: O Kadupul está em pré-alfa. Valide estes procedimentos em uma instalação de teste isolada. Tradução em rascunho, pendente de revisão por uma pessoa fluente no idioma.
sidebar:
  order: 10
---

As atualizações do RRD acessam muitos arquivos e podem ser limitadas pela latência do armazenamento
e pelas operações de E/S, não apenas pela largura de banda de transferência. As gravações adiadas,
também chamadas de Boost, acumulam amostras no banco de dados e agrupam atualizações para cada
arquivo. Avalie o processo de gravação e o banco de dados antes de escolhê-lo: lacunas nos
gráficos não apontam sozinhas para um gargalo de armazenamento.

## O caminho padrão

Os coletores inserem resultados na fila em trânsito `poller_output`. O processo de gravação agrupa
amostras por arquivo e carimbo de data/hora, atualiza o arquivo RRD e monitora a confirmação antes
de descartar amostras qualificadas. Gravações com falha podem deixar linhas para novas tentativas,
de modo que a fila não se restringe apenas ao ciclo de coleta atual.

Na versão analisada, essa fila usa InnoDB. A verificação prévia da coleta rejeita uma fila MEMORY;
uma reinicialização do banco de dados não descarta inerentemente linhas confirmadas como faria com
uma tabela em memória. A durabilidade continua dependendo da configuração do banco de dados, da saúde
do armazenamento e dos backups. Consulte [Atualizar com segurança](/pt-br/guides/upgrade-safely/)
para verificações de migração de filas e armazenamento.

Como estimativa aproximada de carga, 10.000 arquivos distintos atualizados a cada 300 segundos implicam
uma média de cerca de 33 atualizações de arquivos por segundo. As gravações reais chegam em rajadas;
múltiplos campos de fontes de dados podem compartilhar o mesmo arquivo, os intervalos podem diferir e
a contagem de comandos não é igual ao número físico de operações de E/S no disco. Compare a latência
medida de gravação e a idade da fila com a janela de coleta disponível.

## O que o processamento em lote altera

Com as gravações adiadas ativadas, a coleta armazena amostras em `poller_output_boost` para
processamento posterior. O gravador em lote agrupa amostras por fonte de dados em ordem cronológica
e pode enviar vários carimbos de data/hora em um único comando de atualização RRDtool. Doze amostras
podem caber em um único comando, mas isso não garante uma única gravação física no disco.

O comprimento máximo de argumento configurado limita as strings de atualização; o padrão é 2.000.
Isso afeta a formação de lotes. Não deduza um limite específico do sistema operacional a partir
dessa configuração: gravações locais confirmadas usam um fluxo de comandos RRDtool, e o transporte
real e o tamanho de comando suportado são os fatores determinantes.

O agendador normalmente se torna qualificado quando seu temporizador vence (60 minutos por padrão) ou
quando a estimativa de linhas no buffer excede o limite configurado (1.000.000 por padrão). Essa
estimativa inclui tabelas ativas e de arquivo. Uma invocação do agendador ainda precisa ocorrer, e
verificações de processos, preparação ou falhas no processo de gravação podem atrasar o trabalho.
Execuções forçadas, esvaziamento após desativação e atualizações sob demanda ao visualizar gráficos
são caminhos adicionais; os padrões não representam uma garantia de atualização de uma hora.

Qualquer intervalo que seja zero ou não seja um inteiro positivo é substituído por 120 minutos;
o padrão comum é de 60 minutos.

## A rotação e por que ela existe

A configuração em lote cria uma tabela vazia idêntica ao buffer ativo e, em seguida, troca os nomes
com uma única instrução `RENAME TABLE`. A antiga tabela ativa torna-se um arquivo com carimbo de
data/hora e os produtores passam a direcionar as gravações para a nova tabela. Isso separa o lote
de novas inserções, embora bloqueios no banco de dados e contenção de recursos ainda possam atrasar a coleta.

Os workers processam arquivos atuais e retidos. O processo principal verifica a conclusão e o status
dos processos secundários; execuções com falha ou não verificáveis mantêm os arquivos para novas
tentativas. Durante uma limpeza qualificada, arquivos vazios podem ser descartados e as amostras restantes
podem ser colocadas novamente no buffer ativo antes de excluir o arquivo. Um arquivo que não esteja
vazio não é simplesmente descartado porque o processo terminou. Inspecione tanto a fila ativa quanto
a de arquivos ao diagnosticar um acúmulo de dados.

Trata-se de um tratamento de repetições, não de uma garantia universal contra falhas de sistema.
Erros de banco de dados, atividade concorrente, falhas de armazenamento e consistência de backups
ainda precisam de validação no ambiente em operação.

## Por que visualizar um gráfico pode atualizar seus arquivos

O caminho normal de gráficos pode tentar atualizações sob demanda para cada fonte de dados referenciada
pelo gráfico antes de renderizá-lo. Ele não descarrega incondicionalmente todas as amostras pendentes:
verificações de coletores, canais de tempo real/origem/erro, limites de coleta ativa, restrições de
consultas e falhas de atualização afetam o que é processado. Amostras recentes ou com falha podem
permanecer na fila.

Portanto, um gráfico com aparência atualizada não prova que toda a árvore de arquivos RRD esteja em
dia, e solicitar um gráfico não garante uma reprodução bem-sucedida. Verifique erros de gravação,
idade da fila e carimbos de data/hora reais nos arquivos RRD. Backups focados apenas em arquivos omitem
amostras pendentes no banco de dados; consulte
[Backup e restauração](/pt-br/guides/back-up-and-restore/).

## O que você abre mão

**Atualização dos arquivos.** As amostras permanecem no banco de dados até serem processadas com sucesso.
Uma instalação saudável orientada por temporizador pode ter uma defasagem de aproximadamente um intervalo
de descarga; um gravador com falhas ou subdimensionado pode acumular uma defasagem muito maior. Faça backup
consistente das filas pendentes e dos arquivos.

**Um segundo agendamento.** Monitore a coleta e o esvaziamento separadamente. Observe as linhas ativas,
arquivos retidos, a idade da amostra mais antiga, workers com falha e a taxa de transferência do gravador.
Uma tabela ativa não precisa ficar vazia enquanto os produtores ainda estiverem inserindo dados, e a
rotação por si só pode fazê-la parecer menor sem ter concluído nenhuma atualização no RRD.

**Ordenação.** Arquivos RRD não aceitam carimbos de data/hora mais antigos após atualizações mais recentes.
O caminho Boost moderno pula atualizações passadas e o caminho legado filtra carimbos em relação à
última gravação do arquivo. Um comando confirmado com sucesso pode, portanto, descartar dados antigos;
uma entrega tardia não garante que a amostra apareça no gráfico.

**Superfície operacional.** Há um buffer no banco de dados, um processo de descarga com limite de memória,
workers paralelos opcionais e arquivos retidos ou amostras recolocadas na fila para monitorar. Falhas locais
de gravação geralmente mantêm as amostras para novas tentativas, mas isso não garante uma integridade sem
perdas de ponta a ponta. Para o caminho de recuperação remota, consulte
[Coleta remota de dados](/pt-br/concepts/remote-data-collection/).

## Quando vale a pena

Considere gravações adiadas quando as medições mostrarem que o gravador RRD é o gargalo e o banco de dados
tiver capacidade para acomodar o buffer e consultas em lote. Isso não remove a latência dos dispositivos
nem repara um banco de dados sobrecarregado. Compare a taxa de transferência, a idade da fila, o frescor
dos arquivos e o uso de recursos antes e depois da ativação.

O poller principal habilita automaticamente a atualização adiada quando um coletor de dados remoto ativo
está configurado. Essa configuração por si só não valida uma implantação remota de armazenamento ou
recuperação; utilize os limites estabelecidos em
[Coleta remota de dados](/pt-br/concepts/remote-data-collection/).

## Um recurso diferente com o mesmo nome

Imagens renderizadas de gráficos também podem ser mantidas em cache. O cache de imagens reduz a
renderização repetida; gravações adiadas agrupam amostras do banco de dados em atualizações RRD.
Suas configurações são distintas, mas seus caminhos de execução interagem: solicitações de gráficos
podem verificar amostras pendentes antes de usar uma imagem em cache, e atualizações bem-sucedidas
podem fazer com que uma nova imagem seja renderizada. Avalie o frescor das imagens separadamente do
frescor da fila e dos arquivos RRD.
