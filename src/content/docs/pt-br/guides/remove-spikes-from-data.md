---
title: Remover picos dos dados
description: Visualize correções de picos, preserve cópias de recuperação e verifique alterações em amostras retidas de RRD.
banner:
  content: O Kadupul está em fase pré-alfa. Valide estes procedimentos em uma instalação de testes isolada.
sidebar:
  order: 19
---

:::caution[Validar antes de usar]
O código-fonte está disponível, mas não existe uma versão ou caminho de
migração suportado para o Kadupul. Teste estes procedimentos em uma cópia isolada
com backups antes de depender deles. Consulte o [status do projeto](/pt-br/project/status/).
:::

:::danger[Esta operação reescreve o histórico; a recuperação requer backup]
A remoção de picos despeja o arquivo, edita valores, restaura um arquivo irmão temporário
e substitui o original após a validação. Não existe cancelamento automático. Preserve
e verifique uma cópia de recuperação, execute primeiro `--dryrun` e confirme as amostras de destino
antes de confirmar uma alteração.
:::

Um pico aqui significa uma ou duas amostras muito maiores do que tudo ao seu
redor, de modo que o eixo vertical se ajusta a elas e o resto do gráfico fica achatado na
linha de base. A medição está incorreta e é excessivamente chamativa na tela.

## De onde eles vêm

A maioria dos picos em uma fonte de dados baseada em contadores é aritmética e não uma medição real.
Uma fonte de dados do tipo contador armazena uma taxa calculada a partir da diferença entre duas
leituras. Qualquer fator que torne a segunda leitura muito maior que a primeira,
em relação ao tempo decorrido, pode gerar uma taxa falsa. Reinicializações de contadores,
tratamento inadequado de limites de contagem, uma reindexação de interface que transfira leituras para a fonte
de dados errada ou erros de timestamp podem causar isso. Um limite normal de contador
não é em si prova de uma amostra defeituosa; verifique o tipo de fonte de dados e as leituras de entrada.

Consulte [Fontes de dados e arquivos](/pt-br/concepts/data-sources-and-rras/) para entender como a taxa é
calculada.

Corrija a causa na medida do possível. Remover o pico é apenas cosmético; não impede
que o próximo ocorra.

## Os quatro métodos

A ferramenta opera sobre todo o arquivo: extrai cada consolidação no arquivo RRD, decide
quais valores substituir e restaura o resultado.

| Método | O que seleciona | Precisa de uma janela |
|---|---|---|
| `stddev` | Valores a mais de N desvios padrão da média | Não |
| `variance` | Valores com mais de N por cento acima da média após descarte de discrepâncias | Não |
| `float` | Tudo dentro de uma janela de tempo informada | Sim |
| `fill` | Amostras desconhecidas e com valor zero dentro de uma janela de tempo informada | Sim |

`stddev` e `variance` buscam autonomamente. `float` e `fill` executam o que você instrui dentro de um
intervalo especificado, e ambos falham imediatamente se você não fornecer um início e um fim.

`fill` não se restringe a dados ausentes: pode substituir zeros medidos por
valores diferentes de zero. Não o use em um intervalo que contenha leituras legítimas de inatividade ou zero,
a menos que essa alteração seja proposital.

O método de variância descarta as N amostras superiores e inferiores antes de calcular a
média com a qual compara, onde N é a configuração de discrepâncias. É isso que impede
que o pico infle o limite projetado para detectá-lo.

Tudo o que for selecionado é substituído, e existem três opções de substituição.

| Substituição | Resultado |
|---|---|
| `last` | O último valor válido conhecido. O padrão. |
| `avg` | Uma média calculada para o campo/arquivo; o cálculo varia conforme o método. |
| `nan` | Desconhecido para métodos estatísticos; veja a limitação do método por janela abaixo. |

Desconhecido registra que uma medição utilizável não está disponível. `last` e `avg`
substituem valores que podem parecer medidos para quem examinar o gráfico mais tarde na tela.
Escolha a substituição criteriosamente e verifique o resultado real registrado.

**Métodos por janela com NaN:** com `--avgnan=nan`, `float` substitui cada valor conhecido
na janela por desconhecido, e `fill` substitui valores nulos ou não numéricos na
janela por desconhecido. Métodos estatísticos com limites de tempo opcionais substituem apenas
discrepâncias detectadas, portanto não equivalem a limpar uma janela inteira.

## Pré-visualizar, depois aplicar

```sh
# preview this exact method and replacement
php cli/removespikes.php --rrdfile=/path/to/file.rrd \
    --method=stddev --avgnan=nan --dryrun

# after reviewing that preview, repeat its exact selection without --dryrun
php cli/removespikes.php --rrdfile=/path/to/file.rrd \
    --method=stddev --avgnan=nan --backup

# narrow it to a known incident
php cli/removespikes.php --rrdfile=/path/to/file.rrd \
    --method=stddev --outlier-start='2026-03-14 02:00' --outlier-end='2026-03-14 03:00' \
    --avgnan=nan --dryrun

```

Uma simulação (dry run) extrai o RRD e o analisa sem regravar o arquivo em produção. Ainda
exige um diretório de trabalho funcional e acesso de manutenção. Uma pré-visualização não reserva
o arquivo até uma confirmação definitiva: novas amostras ou opções alteradas podem mudar o
resultado. O exemplo com janela continua usando seleção estatística; não remove
todos os valores daquela janela.

Os parâmetros de tempo aceitam tanto timestamp Unix quanto texto de data. Um texto que
não possa ser interpretado é rejeitado antes da regravação. Use timestamps Unix quando a
interpretação de fuso horário puder ser ambígua.

## O que acontece de fato com o arquivo

Importante saber antes de executar sobre dados críticos:

1. O arquivo é extraído para XML no diretório de backups.
2. Comentários são descartados e cada consolidação é examinada para gerar as estatísticas.
3. Valores selecionados são substituídos no XML.
4. O arquivo original é copiado para o diretório de backups.
5. O XML editado é restaurado para um arquivo irmão privado, validado e renomeado sobre
   o original, mantendo proprietário, grupo e permissões.

O passo 4 atua como rede de segurança e não é opcional: se a cópia falhar, a restauração
não é executada. Essa cópia, e não um argumento de linha de comando, é a partir de onde
você restauraria. Seu nome é baseado no original e pode receber um sufixo exclusivo para evitar
sobrescrever um arquivo existente. `--backup` solicita adicionalmente uma cópia de
recuperação persistente. Leia os caminhos informados e valide as cópias antes de depender
delas.

A operação exige diretórios POSIX locais confiáveis e bloqueio de manutenção;
apenas bits de modo de escrita não bastam. Ela recusa armazenamento não homologado e um
endpoint rrdcached configurado. Interrompa processos de escrita externos, que não participam do
protocolo de bloqueio do Kadupul. Execute com a conta de serviço pretendida proprietária do armazenamento.
Consulte os [requisitos de instalação](/pt-br/reference/requirements/) para acesso ao armazenamento.

## Configurações que controlam os padrões

Argumentos de linha de comando têm prioridade. Tudo o que você omitir vem das
configurações do sistema, e preferências por usuário substituem as do sistema quando a ferramenta é
executada pela interface.

| Configuração | Padrão | O que faz |
|---|---|---|
| Removal method | Variance with outliers removed | Qual método usar |
| Replacement method | Last known good | O que substitui um valor removido |
| Number of standard deviations | 10 | Limite para o método `stddev` |
| Variance percentage | 1000 | Limite para o método `variance` |
| Variance number of outliers | 5 | Amostras altas e baixas descartadas antes da média |
| Max kills per RRA | 5 | Limite previsto; atualmente não aplicado rigorosamente |
| RRDfile backup directory | `cache/spikekill/` under the install | Onde o dump e a cópia são salvos |
| Backup retention | 3 months | Por quanto tempo as cópias são mantidas |

Há também um modo em lote: um agendamento (a cada 6, 12, 24 ou 48 horas), um horário de
referência e uma lista de modelos de gráficos para processar. O modo em lote vem desativado por padrão.
Ativá-lo significa que o sistema edita arquivos sem que ninguém examine o
resultado. Restrinja rigorosamente a lista de modelos se decidir ligá-lo.

## Armadilhas

**Os limites padrão são deliberadamente amplos.** Dez desvios padrão e uma
variância de 1000 por cento cobrem uma faixa muito ampla. Uma execução que não aponte picos provavelmente
não falhou; ela apenas indicou que os valores estão dentro da margem solicitada. Aperte o
limite em vez de mudar de método aleatoriamente.

**Max kills per RRA restringe somente os métodos estatísticos.** Para `stddev` e
`variance`, a contagem cobre todas as fontes de dados em uma consolidação e zera na
próxima. Os métodos de janela `float` e `fill` substituem cada valor correspondente na
janela. O total sumário inclui substituições por NaN. Avalie a pré-visualização completa
e use uma janela de tempo restrita.

**Um valor consolidado não pode ser recuperado.** Arquivos mais antigos mantêm um valor por
período, já com média calculada. Substituir esse valor não restitui a medição
genuína daquele período; apenas insere um valor plausível. Quanto mais você recua no tempo,
mais a correção se aproxima de uma suposição.

**O diretório de backups deve estar configurado e ser confiável.** O dump e as
cópias de recuperação vão para lá. Diretórios inexistentes, inseguros ou não verificáveis são rejeitados; não
torne um diretório gravável para todos para contornar uma falha.

**Mantenha seu próprio registro de alterações além dos logs da aplicação.** Anote operador,
comando, intervalo de tempo, caminhos de backup e verificações de antes e depois. Contagens resumidas
não são prova suficiente do que mudou.

**Execute com a conta de serviço apropriada.** Uma substituição bem-sucedida preserva a propriedade
e as permissões do arquivo. Root não é um atalho para ignorar as validações de segurança dos diretórios;
verifique se o poller normal ainda consegue atualizar o arquivo resultante.

**Remover o pico não corrige o gráfico se a fonte de dados estiver errada.** Se uma
reindexação de interface deslocou valores para a fonte de dados incorreta, o pico é apenas um
sintoma. Consulte [Solucionar problemas de dados ausentes](/pt-br/guides/troubleshoot-missing-data/)
antes de começar a alterar arquivos.
