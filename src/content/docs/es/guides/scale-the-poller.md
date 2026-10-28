---
title: Escalar el sondeador
description: Qué modificar cuando la recolección deja de finalizar dentro de su intervalo y cómo determinar qué límite ha alcanzado realmente.
banner:
  content: Kadupul está en fase prealfa. Valide estos procedimientos en una instalación de prueba aislada. Traducción en borrador, pendiente de revisión por una persona con dominio del idioma.
sidebar:
  order: 6
---

:::caution[Validar antes del uso]
El código fuente está disponible, pero no existe una versión publicada ni una ruta
de migración con soporte para Kadupul. Pruebe estos procedimientos en una copia
aislada con copias de seguridad antes de confiar en ellos. Consulte el [estado del proyecto](/es/project/status/).
:::

Escalar el sondeador se reduce a una sola pregunta: ¿termina una ronda de recolección
antes de que comience la siguiente? Todo lo que figura a continuación se enfoca en responder
a esa pregunta y lograr que la respuesta vuelva a ser un sí.

Consulte primero la [arquitectura](/es/concepts/architecture/) si no tiene claro qué
componente lleva a cabo la recolección.

## Los dos relojes

Existen dos intervalos distintos y no corresponden al mismo ajuste.

| | Qué es | Valores permitidos |
|---|---|---|
| Intervalo del lanzador | Frecuencia con la que el sistema operativo inicia el recolector, desde cron o desde el servicio `cactid` | 60 o 300 segundos |
| Intervalo del sondeador | Cadencia base de recolección; los pasos individuales de las fuentes de datos pueden ser más largos | 10, 15, 20, 30, 60 o 300 segundos |

Cuando el intervalo del sondeador es más corto que el del lanzador, un único inicio realiza
varias pasadas de recolección en un bucle. El número de pasadas es el intervalo del lanzador
dividido por el intervalo del sondeador.

El presupuesto de tiempo para todo el lanzamiento se deriva de esos dos números: pasadas
multiplicadas por el intervalo del sondeador, menos dos segundos. Ese es el reloj de tiempo
real contra el que se mide la ejecución.

## Qué ocurre cuando una ronda se desborda

Tres situaciones distintas que generan tres líneas de registro independientes.

**La ronda se interrumpe.** Cuando el tiempo transcurrido supera el presupuesto, el sondeador
registra que se excedió el tiempo máximo de ejecución, escribe sus estadísticas y finaliza.
El trabajo que no ha producido una muestra puede dejar un hueco. Las muestras que ya fueron
admitidas en la cola persistente pueden permanecer pendientes para una posterior escritura RRD
exitosa; un desbordamiento no implica que cada medición no volcada haya sido descartada.
Inspeccione la profundidad de la cola y los registros junto al gráfico, y no purgue filas
retenidas solo para que la siguiente ronda parezca limpia.

**La siguiente ronda advierte los restos.** Al arrancar, el sondeador cuenta las filas de
procesos que nunca se cerraron y advierte de que se detectaron procesos sobrepasando un ciclo
de sondeo. Investigue los registros de procesos incompletos o desactualizados y los procesos
hijos reales en ejecución; la advertencia por sí sola no identifica el cuello de botella.

**Los relojes se desincronizan.** Si ha transcurrido más tiempo desde la última ronda del que
permite el presupuesto, el sondeador advierte de que el lanzador está desincronizado con respecto
al intervalo del sondeador. Esto suele deberse al lanzador, no al sondeador: una entrada de cron
con una frecuencia incorrecta, un servicio detenido o un host que entró en suspensión.

Estas rutas invocan el asistente de notificación para administradores. La entrega depende de
los destinatarios configurados, los controles de notificación y el funcionamiento del transporte
de correo; una advertencia en el registro no demuestra que un mensaje haya llegado. Consulte
[notificaciones por correo electrónico](/es/guides/send-email-notifications/).

Existe un cuarto caso que no es un desbordamiento. Si el sondeador se inicia de nuevo antes de
lo previsto, registra que está configurado para ejecutarse con demasiada frecuencia y finaliza
sin recolectar datos. `--force` elude esa comprobación temporal; utilícelo únicamente durante
un diagnóstico controlado con los inicios programados y otros manuales detenidos. No añade
capacidad ni hace que una recolección solapada sea segura.

## La línea de estadísticas

Cada ronda completada escribe una línea de estadísticas en el registro. Contiene el tiempo
transcurrido, el método de recolección, el número de procesos y subprocesos, la cantidad de
dispositivos, los dispositivos por proceso, las fuentes de datos y los ficheros RRD procesados.

Analice las tendencias del tiempo transcurrido, la latencia de cola, la profundidad de la cola y
las actualizaciones fallidas. Investigue incluso una ronda aislada cercana al límite presupuestario
cuando provoque huecos; un incremento sostenido ayuda a identificar cuándo la capacidad o el
comportamiento de recolección deben cambiar.

## Procesos y subprocesos

Dos selectores que cumplen funciones distintas.

| Selector | Unidad de trabajo que divide | Qué recolector lo utiliza |
|---|---|---|
| Procesos | Dispositivos, divididos en rangos contiguos de identificador de dispositivo | Ambos |
| Subprocesos | Elementos dentro de un dispositivo | Solo Spine |

La consecuencia es el punto en el que muchos tropiezan: **a un proceso se le asignan dispositivos
completos.** Un dispositivo con cinco mil fuentes de datos no puede distribuirse entre varios
procesos. Queda asignado a un único proceso y ese proceso tarda todo el tiempo que necesite.
Añadir procesos no aporta nada en ese caso.

Ambos valores se gestionan por recolector de datos, no de forma global. Los valores en la página
de configuración son ajustes preestablecidos aplicados al crear un nuevo recolector de datos.
Modificar el ajuste preestablecido no altera un recolector existente.

También existe un recuento de subprocesos por dispositivo, que es como se divide un único dispositivo
de gran tamaño. Solo se aplica al recolector en C.

Balance Process Load utiliza recuentos de elementos acumulados para seleccionar límites entre
dispositivos completos en orden de identificador. No fragmenta un dispositivo ni garantiza recuentos
idénticos de elementos, y el recuento de elementos no equivale al tiempo de ejecución. Compare los
tiempos por proceso antes y después de activarlo en una carga de trabajo representativa y aislada.

## El recolector PHP frente al recolector C

El recolector PHP, `cmd.php`, se incluye con la aplicación. Kadupul prevé mantener una bifurcación
de Spine, pero la ubicación de su código fuente y las compilaciones validadas aún no están documentadas.
Utilice PHP hasta que dicha evidencia esté disponible. Las comparaciones de Spine, los ajustes de
subprocesos y los comandos a continuación describen un comportamiento heredado, no un despliegue
disponible o soportado en Kadupul.

| | Recolector PHP | Spine |
|---|---|---|
| Paralelismo | Solo procesos | Procesos y subprocesos |
| Ajuste de subprocesos | Forzado a 1 independientemente de la configuración | Respetado |
| Servidor de scripts | Uno por proceso, no configurable | De 1 a 15 por proceso, configurable |
| Tiempo de espera de scripts | No se aplica | Aplicado, por defecto 25 segundos |
| Instalación | Se incluye con el código | Bifurcación prevista; no hay compilación validada documentada |

El recuento forzado de subprocesos conviene enunciarlo con claridad: si el recolector está fijado en
PHP, la variable de subprocesos en tiempo de ejecución se establece en 1; esto no reescribe el ajuste
almacenado de subprocesos del recolector. Escalar el recolector PHP puede requerir más procesos, y
la recomendación en el código fuente es mantenerse en o por debajo del doble del número de núcleos de CPU.

La configuración de Spine y el comportamiento de los comandos requieren validación frente al binario
exacto evaluado. El código fuente de la aplicación PHP por sí solo no establece su orden de búsqueda
de configuración, su comportamiento de subprocesos ni sus efectos secundarios.

Ejemplos heredados para una evaluación aislada de Spine, no comandos validados de Kadupul:

```sh
spine --first=42 --last=42 --threads=1 --verbosity=HIGH --stdout
spine --hostlist='42,43,51' --readonly
```

`--readonly` tiene como propósito evitar la escritura de resultados. Sigue contactando con los
dispositivos y ejecutando scripts de recolección; valide primero sus efectos secundarios en una prueba aislada.

## Conexiones a la base de datos

Los subprocesos no son gratuitos. Cada subproceso de spine mantiene su propia conexión a la base
de datos, al igual que cada servidor de scripts.

```
estimated worker connections = processes * (threads + script_servers)
```

Esta es la estimación proporcionada en la ayuda de configuración de la aplicación, no un límite
superior medido. Súmela entre los recolectores y añada margen para los procesos principales del
sondeador, peticiones web, mantenimiento y otros clientes. Mida los picos reales y las conexiones
rechazadas antes de seleccionar el límite de la base de datos; aumentarlo también consume recursos.

El agotamiento de conexiones puede ocasionar muestras ausentes, pero los huecos rotativos no
representan un diagnóstico exclusivo. Confírmelo mediante métricas de conexión de la base de datos
y errores de la aplicación.

## Escrituras RRD diferidas

Existe un modo que evita que el sondeador escriba en los ficheros RRD en cada pasada. Los resultados
se acumulan en una tabla de base de datos y se vuelcan en bloque, ya sea mediante un temporizador
o cuando un gráfico solicita el fichero. Sustituye un gran número de escrituras pequeñas por un
número reducido de escrituras de gran volumen.

Dos hechos relevantes a nivel operativo:

- Es un requisito indispensable cuando se cuenta con recolectores de datos remotos. No es una
  sugerencia, sino una condición impuesta por el software.
- La tabla de almacenamiento intermedio es persistente y no en memoria, por lo que las muestras
  no volcadas sobreviven a un reinicio. Esto también significa que sus ficheros RRD van por detrás
  de su base de datos. Consulte [Copia de seguridad y restauración](/es/guides/back-up-and-restore/)
  antes de generar cualquier instantánea.

La cola principal activa `poller_output` también utiliza InnoDB en esta revisión. La comprobación
previa de almacenamiento rechaza una cola MEMORY; aumentar el límite de tablas en memoria no
resuelve esa negativa. Con los productores detenidos y una copia de seguridad coherente conservada,
convierta explícitamente una cola inadecuada heredada y, a continuación, compruebe el almacenamiento
bajo cada cuenta de servicio:

```sh
php cli/upgrade_database.php --migrate-poller-queue
php cli/upgrade_database.php --check-rrd-storage
```

Son operaciones independientes. Conserve las filas pendientes y supervise el espacio en disco de
la base de datos y la antigüedad de la cola, además del número de filas. Consulte
[Actualizar con seguridad](/es/guides/upgrade-safely/) para la selección de colas, comprobaciones de
confianza en cuentas de servicio y requisitos previos para el reinicio.

## Cuándo pasar a recolectores remotos

Un recolector de datos remoto es una segunda máquina que ejecuta el mismo código con un identificador
de recolector distinto, sondeando un subconjunto de dispositivos y transmitiendo los resultados a la
base de datos central.

Adopte esta arquitectura cuando el cuello de botella resida en el lado de la recolección y no en el
del almacenamiento:

- La CPU del host del sondeador está saturada durante una ronda y desocupada entre rondas.
- La latencia de ida y vuelta hacia un grupo de dispositivos domina la ronda, y ese grupo se
  encuentra tras un único enlace.
- Una sede está en el extremo lejano de una WAN sobre la que no desea realizar sondeos directos.
- Necesita recolección en una sede aislada y ha validado el almacenamiento intermedio sin conexión y
  la recuperación de ese recolector antes de depender de él.

Los recolectores remotos no eliminan los límites de la base de datos central ni las restricciones
de escritura en ficheros RRD. Mida la capacidad de ingesta central y de volcado antes de incrementar
el rendimiento de recolección; incorporar más productores puede agravar un retraso existente.

Cada recolector dispone de sus propios recuentos de procesos y subprocesos, sus propias credenciales
de base de datos y un intervalo de sincronización, fijado por defecto en dos horas. Se proporciona
una herramienta de línea de comandos para forzar una sincronización completa en lugar de esperar.

La instalación central puede replicar el sitio web y el código de los plugins a los recolectores
remotos para que se actualicen por sí mismos. Dicha replicación puede desactivarse si despliega el
código por otro mecanismo.

## Qué límite ha alcanzado

Utilice esta tabla para formular hipótesis y luego verifíquelas mediante registros y mediciones.
Varios límites pueden manifestarse simultáneamente. Las opciones de Spine permanecen sin validar aquí.

| Observación | Límite | Qué modificar |
|---|---|---|
| Advertencia de desincronización del lanzador, sondeador rápido por lo demás | Retraso de programación, desbordamiento previo o interrupción del host | Inspeccionar historial de lanzamientos y estado de procesos |
| Tiempo de ejecución constante, un dispositivo siempre retrasado | Respuestas lentas, scripts pesados o trabajo concentrado | Medir sus métodos de entrada y revisar tiempos de espera y reintentos |
| Tiempo de ejecución proporcional al número de dispositivos, CPU saturada | Presión de CPU en el recolector | Medir si más procesos ayudan; valorar ubicación del recolector |
| Tiempo de ejecución proporcional al número de dispositivos, CPU inactiva | Esperas en red, scripts o base de datos | Medir causas de espera antes de modificar la concurrencia |
| Muestras ausentes en un conjunto rotativo de dispositivos | Conexiones, tiempos de espera u otros fallos de recolección | Comprobar errores, métricas de conexión y colas retenidas |
| Tiempo de ejecución adecuado, escrituras RRD lentas, disco ocupado | Almacenamiento | Escrituras RRD diferidas, o disco más rápido |
| Todo lento, incluida la interfaz web | Base de datos | Tamaño del búfer de almacenamiento, luego el host de la base de datos |

Dos trampas que merece la pena destacar.

**Cambiar el intervalo base no equivale a cambiar el paso de cada fuente de datos.**
Alinee perfiles, pasos de elementos almacenados en caché y definiciones de latido/paso de RRD.
Reconstruir la caché no reconfigura los ficheros RRD existentes. Consulte
[Retención de datos](/es/guides/manage-data-retention/) y
[Tiempo e intervalos](/es/concepts/time-and-intervals/).

**Un intervalo más rápido lo multiplica todo.** Pasar de 300 segundos a 60 no abarata el trabajo
cinco veces. Las fuentes configuradas para esa cadencia más rápida se recolectan con mayor frecuencia;
las fuentes que conservan pasos más largos no tienen por qué ejecutarse en cada pasada base. Mida la
carga resultante en lugar de suponer que cada pasada demanda el mismo esfuerzo.
