---
title: Tiempo e intervalos
description: Intervalo de sondeo, paso RRD, heartbeat y desviación del reloj, y por qué la marca de tiempo de una muestra decide más de lo previsto.
sidebar:
  order: 7
banner:
  content: Kadupul está en fase prealfa. Valide estos procedimientos en una instalación de prueba aislada. Traducción en borrador, pendiente de revisión por una persona con dominio del idioma.
---

La recopilación involucra tres relojes: la cadencia del iniciador, el intervalo de sondeo dentro de cada invocación y el paso RRD. Precisan ajustes compatibles.

| Número | Pertenece a | Modo de uso |
|---|---|---|
| Intervalo del iniciador | Cron, Programador de tareas o `cactid.php` | Debe coincidir con `cron_interval`, interpretado por `poller.php` como 60 o 300 segundos |
| Intervalo de sondeo | Pases de recopilación | `poller.php` calcula un número entero de pases por intervalo del iniciador |
| Paso | Un archivo RRD | Intervalo base de normalización, fijado desde el perfil de fuente de datos al crearse |
| Heartbeat | Un campo dentro de un RRD | Intervalo máximo permitido entre actualizaciones; la creación lee la definición del campo |

Por ejemplo, un iniciador de 60 segundos y un intervalo de sondeo de 10 segundos producen seis pases por invocación. Un iniciador de 300 segundos y un intervalo de sondeo de 300 segundos producen uno solo. No configure el intervalo del iniciador por debajo del intervalo de sondeo: 60/300 computa cero pases. Utilice un único programador y deténgalo antes de una ejecución manual con `--force`. Consulte [Instalación](/es/start/install/).

La edición de un perfil no migra automáticamente los archivos existentes. El heartbeat puede ajustarse; los cambios de paso requieren una migración planificada mediante las herramientas de RRDtool. Compruebe tanto las definiciones de la base de datos como `rrdtool info` después.

## Cuando coinciden

Una fuente de datos cuyo paso es igual al intervalo de sondeo es apta en cada pase, según el estado del dispositivo, el contenido de la caché y los límites de ejecución. La configuración predeterminada utiliza 300 segundos para ambos. La aptitud no garantiza una lectura satisfactoria.

## Cuando el paso es más largo que el intervalo

El recopilador PHP utiliza `rrd_next_step` en cada fila de la lista de trabajo cuando múltiples planificaciones activas lo requieren. Selecciona filas en cero o por debajo, y luego actualiza las cuentas atrás para su rango de recopilador y host. Las filas cuyo paso equivale al intervalo de sondeo permanecen en cero. Otras filas decrementan según el intervalo de sondeo; en caso de subdesbordamiento, el restablecimiento depende del modo de invocación: un pase normal de subiniciador restablece al paso menos el intervalo, mientras que intervalos coincidentes y la ruta global restablecen al paso completo. No asuma que un paso de diez minutos siempre implica una invocación alterna de cinco minutos; inspeccione las filas pendientes y las marcas de tiempo reales.

Con la opción **Equilibrar carga de procesos** activada, la construcción de la caché asigna desfases a fuentes de datos sucesivas en un dispositivo utilizando el paso y el intervalo de sondeo. Los campos de la misma fuente comparten un desfase. Esto puede distribuir el trabajo entre pases, pero no garantiza tiempos de ejecución idénticos: las latencias de dispositivos, los tiempos de espera y los scripts difieren. El iniciador también alinea cuentas atrás discordantes dentro de una misma fuente de datos.

Antes de deducir que un elemento está dañado porque no produjo nada durante un pase, compruebe su estado de vencimiento y los pases posteriores. Consulte [La caché del poller](/es/concepts/the-poller-cache/) para ver los límites de reconstrucción.

## Cuando el paso es más corto que el intervalo

Un paso más corto no puede crear mediciones que el recopilador nunca llegó a tomar. Kadupul advierte durante la construcción de la caché cuando la recopilación es demasiado lenta para el paso; resuelva los ajustes de sondeo y reconstruya la caché afectada.

Esta discrepancia no produce obligatoriamente un gráfico en forma de peine. RRDtool puede normalizar actualizaciones menos frecuentes en pasos más pequeños si el heartbeat lo permite, pero eso no restituye el detalle de medición perdido.

## El heartbeat no siempre es el doble del paso

El heartbeat es el intervalo máximo permitido entre actualizaciones antes de que una entrada se considere desconocida. La creación del RRD lee el heartbeat de la definición del campo de fuente de datos, que puede heredar valores del perfil o la plantilla. No es un período de gracia adicional añadido al paso; inspeccione el campo y el archivo reales cuando difieran del perfil.

Los perfiles suministrados no siguen una regla única.

| Perfil | Paso | Heartbeat | Límite del intervalo de actualización |
|---|---|---|---|
| Cinco minutos | 300 | 600 | 10 minutos |
| Un minuto | 60 | 600 | 10 minutos |
| Treinta segundos | 30 | 1200 | 20 minutos |

Estos son valores de perfiles predeterminados, no un temporizador de detección de cortes. Entradas explícitamente desconocidas pueden generar huecos antes de que venza el heartbeat; la normalización y los umbrales de archivo condicionan lo que resulta visible. Un heartbeat más amplio tolera una separación mayor. En el intervalo habitual de actualización o por debajo, no deja margen ante retrasos.

Inspeccione el archivo físico además de su perfil. Los RRD existentes pueden discrepar de definiciones modificadas en la base de datos; la auditoría de archivos informa de tales divergencias. Revise la [definición de heartbeat de RRDtool](https://oss.oetiker.ch/rrdtool/doc/rrdcreate.en.html) y la [referencia de ajuste](https://oss.oetiker.ch/rrdtool/doc/rrdtune.en.html) antes de planificar cambios.

## Lo almacenado no coincide exactamente con lo emitido por el dispositivo

RRDtool normaliza las actualizaciones en límites de paso fijos. Los valores comprendidos entre límites pueden contribuir a más de un punto de datos primario. El heartbeat, los desconocidos explícitos y los límites afectan a las entradas válidas; la consolidación de archivos aplica su propio umbral de datos desconocidos. Un paso no precisa una muestra en bruto independiente para albergar un valor conocido.

Los valores de contador se transforman en tasas según el tiempo transcurrido, sujetos a reinicios de contador, desbordamientos y límites. Los indicadores directos también se normalizan en el tiempo. Picos breves pueden diluirse u omitirse por completo debido al muestreo; valores continuos o alineados con los límites no sufren necesariamente reducción. Los parámetros de archivo no pueden reconstruir detalles que nunca se recopilaron o se perdieron en la normalización.

## Qué reloj decide

En la recopilación ordinaria con `cmd.php`, la instrucción SQL `CURRENT_TIMESTAMP()` suministra la marca de tiempo de salida al insertar un lote. No es una marca de tiempo provista por el dispositivo ni una medición exacta del instante en que respondió. Otros motores de recopilación y rutas en tiempo real deben verificarse por separado.

El recopilador PHP almacena en búfer sus resultados y los escribe por lotes, vaciándolos ante un cambio de dispositivo o cuando el búfer se llena. La marca de tiempo se evalúa una sola vez por lote, por lo que todos los valores de un lote comparten la misma hora.

Las implicaciones no son obvias, por lo que merece la pena detallarlas.

**El reloj del dispositivo no marca estas muestras SNMP.** El recopilador utiliza la hora de inserción en la base de datos. La hora del dispositivo puede ser relevante para un script o para interpretar una métrica concreta, por lo que no constituye una razón para descuidar la sincronización horaria.

**Un reloj incorrecto en el recopilador o en su base de datos desplaza los datos.** Los valores quedan registrados en ranuras erróneas y, en un archivo parcialmente escrito, se rechaza tajantemente cualquier actualización cuya hora no sea posterior a la última registrada. Si las marcas de tiempo retroceden por detrás de la última actualización del archivo, los nuevos datos no harán avanzar el archivo hasta que sus marcas la sobrepasen. Compruebe el reloj de la base de datos, el del recopilador y la marca del archivo; alterar solo el reloj del recopilador no cambia necesariamente las marcas generadas por la base de datos.

**El tiempo dentro de un ciclo se convierte en fluctuación.** Un dispositivo consultado al final de una tanda larga recibe una marca posterior a la de uno consultado al inicio, aunque ambos correspondan al mismo ciclo. Con un recopilador sobrecargado, esa fluctuación puede representar una fracción considerable del intervalo, siendo una de las razones por las que un heartbeat demasiado ajustado al paso genera discontinuidades.

**La zona horaria de la base de datos interviene a mitad del proceso.** La marca se escribe como marca de tiempo de base de datos y la propia base de datos la reconvierte en hora absoluta al leerla. Un tratamiento incoherente de zonas horarias en las sesiones puede alterar esa interpretación. Verifique los parámetros de sesión de escritura y lectura y la conversión de época; cambiar solo la zona horaria visual no acredita que el historial almacenado se haya desplazado.

## Las lecturas se ensamblan por marca de tiempo

Una fuente de datos con múltiples campos, como una interfaz con bytes entrantes y salientes, puede utilizar elementos de trabajo SNMP independientes o un script que retorne varios valores con nombre. Los campos analizados se agrupan por fuente de datos y marca de tiempo para la actualización RRD.

Un conjunto incompleto se retiene en lugar de escribirse parcialmente, hasta que se alcanza el número previsto de campos. Es una comprobación de ensamblaje, no una garantía de validez numérica; los desconocidos explícitos aún pueden registrarse. Normalmente ambas mitades se hallan en el mismo lote y comparten marca, por lo que pasa desapercibido. Lotes insertados dentro del mismo segundo también pueden coincidir. Si los campos reciben marcas diferentes, los grupos pueden quedar incompletos sin generar actualización. El código actual preserva los grupos incompletos entre ciclos, emitiendo un registro y descartándolos tras `5 * max(60, poller_interval)` segundos. El límite de página de lectura se amplía para abarcar su último grupo de marcas de tiempo.

Las actualizaciones también se ordenan de forma cronológica ascendente antes de escribirse, ya que un archivo no admite un valor más antiguo que su última actualización.

## Las escrituras diferidas conservan sus marcas de tiempo

Cuando las escrituras RRD se difieren y se aplican en bloque más adelante, la marca de tiempo registrada viaja con el valor y el lote se escribe en orden cronológico. Una marca del mediodía se mantiene si se intenta actualizar a la una; no se sustituye por la hora de vaciado del búfer. RRDtool normaliza las actualizaciones aceptadas según sus límites de paso.

Una cola acumulada puede avanzar un archivo mediante marcas de tiempo más recientes que su última actualización. No puede rellenar retroactivamente huecos anteriores a esa marca. El componente Boost filtra muestras en o antes de la última actualización del archivo; una cola vaciada no demuestra que cada muestra haya sido aplicada. Consulte [Escrituras de gran volumen](/es/concepts/high-volume-writes/) y la [referencia de actualización de RRDtool](https://oss.oetiker.ch/rrdtool/doc/rrdupdate.en.html). Las escrituras diferidas dependen de un almacenamiento satisfactorio y del orden temporal correcto; no garantizan la recuperación ante cualquier anomalía. Inspeccione los datos retenidos y rechazados cuando una acumulación no se despeje.

## Cuando el ciclo no concluye

El recopilador PHP revisa el tiempo transcurrido entre tareas y finaliza su bucle de elementos en cuanto supera el intervalo de sondeo, emitiendo una advertencia. No es una interrupción tajante en el límite exacto: una operación en curso puede prolongarse antes de dicha revisión. Los elementos no alcanzados no generan valores en ese ciclo. Una interrupción entre actualizaciones válidas puede subsanarse si el heartbeat y los umbrales de archivo lo admiten. Los excesos reiterados constituyen un motivo para examinar capacidad, tiempos de espera y errores de sondeo, no la prueba de que cada hueco responda a la misma causa.

[Escalar el poller](/es/guides/scale-the-poller/) describe cómo abordar esta situación. El orden de ejecución y los mecanismos de contención figuran en el [Ciclo de vida del poller](/es/reference/poller-lifecycle/).
