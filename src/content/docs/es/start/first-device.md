---
title: Añadir el primer dispositivo
description: Habilite el sondeo de un dispositivo y confirme que llegan los datos antes de construir nada más encima.
sidebar:
  order: 3
banner:
  content: Kadupul está en fase prealfa. Valide estos procedimientos en una instalación de prueba aislada. Traducción en borrador, pendiente de revisión por una persona con dominio del idioma.
---

Añada un dispositivo, confirme que responde y solo entonces continúe. La mayoría de los problemas de un sistema de monitorización se deben a un dispositivo que en realidad nunca llegó a responder desde el principio.

Elija un dispositivo con el que pueda permitirse equivocarse. Un switch que le pertenezca, en una red bajo su control y con SNMP ya habilitado. No comience con el dispositivo por el que alguien le esté preguntando.

## Antes de empezar

Para este ejemplo con SNMP, el dispositivo debe responder a las consultas de su recolector asignado. Ejecute las comprobaciones en ese recolector, preferiblemente como el usuario del sondeador; una petición desde su portátil puede seguir una ruta de cortafuegos distinta. Sustituya la dirección y la comunidad del ejemplo por las credenciales de solo lectura configuradas en su dispositivo. Los OID numéricos que se indican a continuación también funcionan cuando los ficheros de nombres MIB locales no están instalados.

```bash
snmpget -v2c -c 'your-read-only-community' switch.example.net .1.3.6.1.2.1.1.1.0
```

Si devuelve una cadena descriptiva, continúe. Si agota el tiempo de espera, solucione eso primero. Ninguna cantidad de configuración en la interfaz web hará que un dispositivo inaccesible responda.

A continuación, compruebe la tabla que realmente desea representar en gráficos, porque un dispositivo puede responder a `sysDescr` y aun así rechazar la tabla de interfaces.

```bash
snmpwalk -v2c -c 'your-read-only-community' switch.example.net .1.3.6.1.2.1.2.2.1.2
```

El segundo OID corresponde a la columna `ifDescr`. Debe obtener una fila por cada interfaz expuesta. Un resultado vacío puede indicar una vista SNMP restringida o una tabla no admitida; un error de autorización apunta a las credenciales o a la directiva de acceso. Inspeccione el error devuelto antes de modificar la configuración del dispositivo o de Kadupul.

Dos aspectos sobre las versiones de SNMP condicionan decisiones posteriores, de modo que conviene definirlos ahora.

| Versión | Qué significa para usted |
|---|---|
| v1 | Sin soporte para Counter64. Los enlaces rápidos pueden desbordar los contadores de octetos de 32 bits varias veces entre sondeos, haciendo que la tasa sea ambigua |
| v2c | Admite Counter64 cuando el agente lo expone; las cadenas de comunidad se transmiten en texto no cifrado |
| v3 | Admite autenticación y cifrado con `authPriv`; elegir v3 por sí solo no habilita ambos |

Prefiera v3 con `authPriv` donde sea compatible, o bien v2c en una red de gestión restringida. Seleccione el tipo de gráfico de interfaz de 64 bits así como la versión de SNMP. Si el dispositivo solo admite v1, tenga en cuenta el intervalo de sondeo y la tasa de tráfico de la tabla de fallos situada al final de esta página. [SNMP](/es/reference/snmp/) describe detalladamente los campos de credenciales.

## Decidir tres cosas antes de abrir el formulario

**Las credenciales.** Exactamente las que ha probado antes, incluido el puerto si no es el predeterminado.

**El método de disponibilidad.** Así es como Kadupul determina si el dispositivo está activo, y es independiente de si la recolección funciona. Las opciones integradas son none, ping, SNMP uptime, SNMP description, SNMP getNext y dos combinaciones de ping con SNMP uptime: una que exige ambos y otra que acepta cualquiera de los dos.

Prefiera un método SNMP para un dispositivo que consulte mediante SNMP. Comprueba aquello de lo que usted depende. ICMP ping requiere un socket sin procesar, lo que exige privilegios que las cuentas de la web y del sondeador no suelen tener, por lo que un dispositivo que responde a `ping` desde su terminal aún puede reportarse como caído. Un ping TCP contra un puerto que sepa que está abierto evita este inconveniente.

**La plantilla del dispositivo.** Elija una que coincida con el hardware.

## Añadirlo

1. En la página heredada **Devices** (`host.php`), elija **Add**. La creación de dispositivos y la configuración de gráficos todavía emplean esta página durante la migración a Symfony. Introduzca una descripción, el nombre de host o la dirección, el recolector asignado, la versión de SNMP y las credenciales.
2. Establezca el método de disponibilidad que haya elegido.
3. Seleccione la plantilla del dispositivo.
4. Guarde, confirme que el dispositivo está habilitado y consulte su panel de disponibilidad/SNMP. Un registro guardado en la base de datos no prueba que la recolección haya tenido éxito.

## Qué decide la plantilla del dispositivo

Una plantilla de dispositivo asocia plantillas de gráficos y consultas de datos con el dispositivo. Una consulta de datos recorre una tabla en el dispositivo, como sus interfaces, y genera un índice por cada fila. Al aplicar la plantilla también se ejecutan sus consultas de datos para rellenar esos índices. Con la automatización de gráficos desactivada, esas asociaciones no generan gráficos por sí solas. Cuando la automatización de gráficos está habilitada, los enlaces de plantilla y consulta pueden crear gráficos bajo reglas de coincidencia; inspeccione los gráficos existentes antes de añadir otra copia.

Cambiar una plantilla puede alterar las asociaciones y volver a ejecutar esos enlaces. No supone un restablecimiento de los gráficos o fuentes de datos existentes. Compruebe la plantilla seleccionada y los índices consultados antes de aplicarla a un dispositivo que ya cuente con historial.

Esos índices son la razón por la que se eligen interfaces de una lista en lugar de escribir OID manualmente. [Plantillas](/es/concepts/templates/) y [Consultas de datos e índices](/es/concepts/data-queries-and-indexes/) explican ambos conceptos adecuadamente.

## Leer el panel de estado

Cuando el dispositivo se guarda con un método de disponibilidad SNMP, Kadupul abre una sesión e informa del resultado. Esta es la comprobación que verdaderamente importa, y es la que la gente suele pasar por alto.

| Lo que ve | Qué significa |
|---|---|
| Las consultas de sistema y tiempo de actividad tienen éxito | El panel puede leer metadatos básicos de SNMP. Esto aún no demuestra la recolección de interfaces |
| La ubicación o el contacto están vacíos | Estos campos opcionales de metadatos pueden no estar establecidos; que estén vacíos no significa un fallo de recolección |
| SNMP no está en uso | No hay comunidad ni usuario en el dispositivo, o la versión se ha establecido en none |
| Error de SNMP en la sesión | Falló el establecimiento de la sesión; inspeccione el error mostrado, las credenciales, el protocolo y los ajustes de conexión |
| Error de SNMP en el sistema | Falló la lectura de `sysDescr`; revise el error devuelto, la vista del agente, las credenciales y la accesibilidad |
| Error de SNMP en el host | No se devolvió ni la descripción ni el tiempo de actividad |
| El tiempo de actividad se muestra como `U` | El tiempo de actividad no era legible. Algunos dispositivos realmente no lo notifican |

Si el método de disponibilidad incluye ping, aparecerá abajo un resultado independiente de ping. Lea ambos. Un dispositivo puede superar uno y suspender el otro, y cuál falle le indicará dónde buscar.

Una descripción del sistema en blanco no prueba que la recolección esté fallando. El código admite agentes con una descripción vacía y un tiempo de actividad utilizable. Los dispositivos deshabilitados omiten la comprobación de disponibilidad, y los métodos de disponibilidad que no usan SNMP no muestran este panel de SNMP. A continuación, verifique la consulta real y la caché del sondeador.

## Crear las fuentes de datos y los gráficos

Para un dispositivo nuevo sin gráficos generados automáticamente, el siguiente paso consiste en crear el gráfico y su fuente de datos. Compruebe **Data Source List** y **View Poller Cache** en la página del dispositivo en lugar de asumir que están vacíos.

En la página del dispositivo, seleccione **Create Graphs for this Device**. En el caso de un switch, esto implica ejecutar la consulta de datos de interfaces, escoger las interfaces que le interesen y elegir un tipo de gráfico para ellas. Elija dos o tres interfaces, no las cuarenta y ocho. Está comprobando que la ruta funciona, y un lote inicial pequeño resulta mucho más fácil de interpretar en el siguiente paso.

Un gráfico indexado asocia fuentes de datos con la interfaz seleccionada y prepara sus entradas en la caché del sondeador; se pueden reutilizar fuentes existentes compatibles. La respuesta de creación del gráfico no es prueba de que se esté sondeando. Verifique que la caché contenga el dispositivo esperado, los OID de interfaz y la ruta RRD.

## Confirmar que la recolección funciona

Espere a que transcurran los ciclos programados de recolección y, después, compruebe tanto las marcas de tiempo como los valores. Un gráfico vacío puede deberse a la normalización de arranque, a un valor desconocido o a un fallo de recolección. Son necesarias dos lecturas de contador para calcular una tasa, pero dos ejecuciones del sondeador no garantizan un intervalo de archivo completado y válido.

Compruebe tres cosas, en este orden.

**El sondeador se ha ejecutado.** Busque el resumen de finalización en el registro configurado. Si no aparece, revise la programación, el destino del registro y los permisos, y compruebe si el sondeador finalizó antes de terminar. Consulte [Registro](/es/reference/logging/).

**El fichero existe y es reciente.** Copie la ruta RRD real desde la fuente de datos o la caché del sondeador; no la deduzca a partir del nombre de host. Las rutas y los nombres se pueden personalizar. Consulte [Organización de ficheros](/es/reference/file-layout/). Pregunte a RRDtool cuándo se escribió el fichero por última vez:

```bash
rrdtool last /path/to/rra/the_actual_file.rrd
rrdtool lastupdate /path/to/rra/the_actual_file.rrd
rrdtool fetch /path/to/rra/the_actual_file.rrd AVERAGE --start end-30m --end now
```

La marca de tiempo debería avanzar con cada escritura correcta. Una marca de tiempo reciente aún puede acompañar a un valor desconocido, y las escrituras en búfer pueden retrasar la marca de tiempo en disco. En el caso de `rrdcached` o Boost, compruebe también el estado de vaciado de ese componente.

**El valor no es desconocido.** `lastupdate` muestra los últimos valores suministrados; en un contador, estos son contadores brutos, no tasas de tráfico calculadas. Inspeccione las filas completadas de `fetch` para observar tasas finitas. El momento de inicio, la alineación del paso, el latido, los límites y el umbral de datos desconocidos del archivo influyen en cuándo aparece una fila utilizable. No diagnostique un fallo basándose únicamente en las dos primeras filas. Si los valores desconocidos persisten, inspeccione los valores recolectados, el tipo de fuente de datos, el latido y los errores del sondeador.

## Fallos iniciales comunes

| Síntoma | Causa habitual |
|---|---|
| Guarda, pero la consulta de la descripción del sistema informa de un error | Compruebe las credenciales, la vista del agente y la accesibilidad del recolector; una descripción vacía por sí sola no es prueba suficiente |
| Error de SNMP en la sesión desde Kadupul, pero `snmpget` funciona desde su portátil | La ruta del cortafuegos difiere o el agente restringe el acceso por dirección de origen |
| El dispositivo aparece como caído, pero llegan datos SNMP | La disponibilidad está configurada con ping ICMP, que no puede abrir un socket sin procesar |
| Aparece la descripción, pero no hay datos | El sondeador no está programado o se ejecuta con un usuario que no puede escribir en el directorio RRD |
| La consulta de datos no devuelve interfaces | La vista del agente excluye la tabla de interfaces o el dispositivo necesita una reindexación |
| El primer valor es desconocido y luego funciona bien | Es normal en un contador. Necesita dos lecturas para producir una tasa |
| Persisten los valores desconocidos | Fallo de recolección, valores no válidos, discrepancia de tipos/límites, latido o normalización de archivos |
| Hay datos durante un tiempo y luego aparecen huecos | El sondeador tarda más que su intervalo o el dispositivo limita la tasa de SNMP |
| Las tasas del contador son inverosímiles | Múltiples desbordamientos de 32 bits, reinicio del contador, unidades o ajustes de la fuente de datos; use contadores de 64 bits compatibles en enlaces rápidos |
| Las interfaces grafican puertos erróneos tras un reinicio | Los índices cambiaron. La consulta de datos necesita un método de reindexación que lo detecte |

Vale la pena comprender este último punto antes de tener un centenar de switches: no se garantiza que los índices de interfaz SNMP se mantengan estables tras un reinicio o un cambio de módulo. El método de reindexación en una consulta de datos es lo que mantiene un gráfico apuntando al mismo puerto físico. [Consultas de datos e índices](/es/concepts/data-queries-and-indexes/) explica las opciones.

Cuando tenga un dispositivo recolectando limpiamente, añada el resto en lote en lugar de uno a uno. [Descubrir dispositivos automáticamente](/es/guides/discover-devices-automatically/) y las herramientas de línea de órdenes en [Herramientas de línea de órdenes](/es/reference/command-line-tools/) son mucho mejores que repetir esta página cincuenta veces.

Siguiente paso: [Interpretar el primer gráfico](/es/start/first-graph/).
