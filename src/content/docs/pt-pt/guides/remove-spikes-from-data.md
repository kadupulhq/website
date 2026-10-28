---
title: Remover picos dos dados
description: Pré-visualizar correções de picos, preservar cópias de recuperação e verificar alterações a amostras retidas de RRD.
banner:
  content: O Kadupul está em fase pré-alfa. Valide estes procedimentos numa instalação de testes isolada.
sidebar:
  order: 19
---

:::caution[Validar antes de utilizar]
O código-fonte está disponível, mas não existe uma versão ou caminho de
migração suportado para o Kadupul. Teste estes procedimentos numa cópia isolada
com cópias de segurança antes de depender deles. Consulte o [estado do projeto](/pt-pt/project/status/).
:::

:::danger[Isto reescreve o histórico; a recuperação requer uma cópia de segurança]
A remoção de picos faz o dump do histórico, edita valores, restaura um ficheiro irmão temporário
e substitui o original após a validação. Não existe anulação automática. Preserve
e verifique uma cópia de recuperação, execute primeiro `--dryrun` e confirme as amostras de destino
antes de consolidar uma alteração.
:::

Um pico aqui significa uma ou duas amostras muito maiores do que tudo o que está à sua
volta, de tal forma que o eixo vertical se dimensiona por elas e o resto do gráfico fica achatado junto
à linha de base. A medição está errada e é também demasiado visível no ecrã.

## De onde provêm

A maioria dos picos numa fonte de dados baseada em contadores é aritmética e não medição real.
Uma fonte de dados do tipo contador armazena uma taxa calculada a partir da diferença entre duas
leituras. Tudo o que torne a segunda leitura muito maior do que a primeira,
em relação ao tempo decorrido, pode produzir uma taxa falsa. Reinicializações de contadores,
tratamento incorreto de limites de contagem, uma reindexação de interface que move leituras para a fonte
de dados errada ou erros de carimbo de data/hora podem causar isto. Um limite normal de contador
não é em si prova de uma amostra defeituosa; verifique o tipo de fonte de dados e as leituras de entrada.

Consulte [Fontes de dados e históricos consolidados](/pt-pt/concepts/data-sources-and-rras/) para compreender como a taxa é
calculada.

Corrija a causa onde for possível. Remover o pico é apenas cosmético; não impede
o próximo.

## Os quatro métodos

A ferramenta opera sobre todo o ficheiro: faz o dump de cada consolidação no ficheiro RRD, decide
quais os valores a substituir e restaura o resultado.

| Método | O que seleciona | Necessita de uma janela |
|---|---|---|
| `stddev` | Valores a mais de N desvios-padrão da média | Não |
| `variance` | Valores com mais de N por cento acima da média após descarte de valores atípicos | Não |
| `float` | Tudo dentro de uma janela temporal indicada | Sim |
| `fill` | Amostras desconhecidas e com valor zero dentro de uma janela temporal indicada | Sim |

`stddev` e `variance` procuram autonomamente. `float` e `fill` fazem o que determinar dentro de um
intervalo especificado, e ambos falham imediatamente se não fornecer um início e um fim.

`fill` não está limitado a dados em falta: pode substituir zeros medidos por
valores diferentes de zero. Não o utilize num intervalo que contenha leituras legítimas de inatividade ou zero,
a menos que essa alteração seja intencional.

O método de variância descarta as N amostras superiores e inferiores antes de calcular a
média com que compara, onde N é a definição de valores atípicos. É isso que impede
que o pico inflacione o limiar destinado a capturá-lo.

Tudo o que for selecionado é substituído, e existem três substitutos possíveis.

| Substituição | Resultado |
|---|---|
| `last` | O último valor bom conhecido. A predefinição. |
| `avg` | Uma média calculada para o campo/consolidação; o cálculo depende do método. |
| `nan` | Desconhecido para métodos estatísticos; ver a limitação do método por janela abaixo. |

Desconhecido regista que não está disponível uma medição utilizável. `last` e `avg`
substituem valores que podem parecer medidos a quem ler o gráfico mais tarde no ecrã.
Escolha a substituição de forma deliberada e verifique o resultado real armazenado.

**Métodos por janela com NaN:** com `--avgnan=nan`, `float` substitui cada valor conhecido
na janela por desconhecido, e `fill` substitui valores nulos ou não numéricos na
janela por desconhecido. Métodos estatísticos com limites de tempo opcionais substituem apenas
valores atípicos detetados, pelo que não são equivalentes a esvaziar uma janela completa.

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

Uma execução de teste (dry run) despeja o RRD e analisa-o sem regravar o ficheiro ativo. Continua
a precisar de um diretório de trabalho utilizável e acesso de manutenção. Uma pré-visualização não reserva
o ficheiro até uma aplicação posterior: novas amostras ou opções alteradas podem mudar o
resultado. O exemplo com janela continua a utilizar seleção estatística; não remove
todos os valores nessa janela.

Os argumentos de tempo aceitam um carimbo de data/hora Unix ou uma cadeia de data. Uma cadeia que
não possa ser interpretada é rejeitada antes da regravação. Utilize carimbos de data/hora Unix quando a
interpretação do fuso horário puder ser ambígua.

## O que acontece realmente ao ficheiro

Importante saber antes de executar sobre dados importantes:

1. O ficheiro é despejado para XML no diretório de cópias de segurança.
2. Os comentários são removidos e cada consolidação é analisada para as estatísticas.
3. Os valores selecionados são substituídos no XML.
4. O ficheiro original é copiado para o diretório de cópias de segurança.
5. O XML editado é restaurado para um ficheiro irmão privado, validado e renomeado sobre
   o original, preservando o proprietário, grupo e modo.

O passo 4 é a rede de segurança e não é opcional: se a cópia falhar, o restauro
não é executado. Essa cópia, e não qualquer opção de linha de comandos, é a partir de onde
restauraria. O seu nome baseia-se no original e pode receber um sufixo exclusivo para evitar
sobrescrever um artefacto existente. `--backup` solicita adicionalmente uma captura de
recuperação persistente. Leia os caminhos comunicados e verifique as cópias antes de depender
delas.

A operação requer diretórios POSIX locais fidedignos e bloqueio de manutenção;
bits de modo de escrita por si só são insuficientes. Recusa armazenamento não suportado e um
ponto final rrdcached configurado. Interrompa processos de escrita externos, que não participam no
protocolo de bloqueio do Kadupul. Execute com a conta de serviço pretendida proprietária do armazenamento.
Consulte os [requisitos de instalação](/pt-pt/reference/requirements/) para acesso ao armazenamento.

## Definições que controlam as predefinições

Os argumentos da linha de comandos prevalecem. Tudo o que omitir provém das
definições do sistema, e as definições por utilizador sobrepõem-se às do sistema quando a ferramenta é
executada a partir da interface.

| Definição | Predefinição | O que faz |
|---|---|---|
| Removal method | Variance with outliers removed | Qual o método a utilizar |
| Replacement method | Last known good | O que substitui um valor removido |
| Number of standard deviations | 10 | Limiar para o método `stddev` |
| Variance percentage | 1000 | Limiar para o método `variance` |
| Variance number of outliers | 5 | Amostras altas e baixas descartadas antes da média |
| Max kills per RRA | 5 | Limite pretendido; atualmente não aplicado de forma fiável |
| RRDfile backup directory | `cache/spikekill/` under the install | Onde ficam o dump e a cópia |
| Backup retention | 3 months | Durante quanto tempo as cópias são mantidas |

Existe também um modo em lote: um agendamento (a cada 6, 12, 24 ou 48 horas), uma hora de
referência e uma lista de modelos de gráficos sobre os quais atuar. O modo em lote está desativado por predefinição.
Ativá-lo significa que o sistema edita registos sem que ninguém examine o
resultado. Restrinja rigorosamente a lista de modelos se o ativar.

## Armadilhas

**Os limiares predefinidos são deliberadamente amplos.** Dez desvios-padrão e uma
variância de 1000 por cento são valores amplos. Uma execução que não reporte picos provavelmente
não falhou; apenas indicou que os valores estão dentro da margem solicitada. Aperte o
limiar em vez de mudar de método ao acaso.

**Max kills per RRA limita apenas os métodos estatísticos.** Para `stddev` e
`variance`, a contagem cobre todas as fontes de dados numa consolidação e reinicia na
seguinte. Os métodos de janela `float` e `fill` substituem cada valor correspondente na
janela. A contagem sumária inclui substituições por NaN. Reveja a pré-visualização completa
e utilize uma janela temporal estreita.

**Um valor consolidado não pode ser recuperado.** Históricos mais antigos mantêm um valor por
período, já com média calculada. Substituir esse valor não restaura a verdadeira
medição para o período; apenas insere um valor plausível. Quanto mais recuar no tempo,
mais a correção se torna uma suposição.

**O diretório de cópias de segurança deve estar configurado e ser fidedigno.** O dump e as
cópias de recuperação vão para lá. Diretórios em falta, inseguros ou não verificáveis são recusados; não
torne um diretório gravável por todos para contornar uma falha.

**Mantenha o seu próprio registo de alterações bem como os registos da aplicação.** Anote o operador,
comando, intervalo de tempo, caminhos de cópias de segurança e verificações antes/depois. Contagens sumárias
não são prova suficiente do que mudou.

**Execute com a conta de serviço pretendida.** Uma substituição bem-sucedida preserva a propriedade
e o modo do ficheiro. Root não é um atalho para contornar as verificações de confiança dos diretórios;
verifique se o poller normal ainda consegue atualizar o resultado.

**Remover o pico não corrige o gráfico se a fonte de dados estiver incorreta.** Se uma
reindexação de interface moveu valores para a fonte de dados errada, o pico é apenas um
sintoma. Consulte [Resolver problemas de dados em falta](/pt-pt/guides/troubleshoot-missing-data/)
antes de começar a editar históricos.
