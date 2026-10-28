---
title: Recolección remota de datos
description: Por qué la recolección se distribuye y el almacenamiento no, qué posee un recolector remoto y cuánto cuesta tener una segunda copia de la configuración.
banner:
  content: Kadupul está en pre-alfa. Valide estos procedimientos en una instalación de prueba aislada.
sidebar:
  order: 9
---

:::caution[Comportamiento heredado del proxy RRDtool]
La implementación del proxy RRDtool no es compatible con Kadupul. Utilice almacenamiento local
de RRDtool (`storage_location = 0`). La configuración del proxy, las descripciones de protocolos y
los flujos de trabajo de esta página documentan el comportamiento heredado, no una ruta admitida
de implementación o migración. Consulte [Proxy RRDtool](/es-419/reference/rrdproxy/).
:::

La recolección es la parte que no cabe en una sola máquina. La mayor parte de una ejecución de
sondeo se pasa esperando a que los dispositivos respondan, y la espera no se comprime. Puede
superponer más de ella con más procesos y subprocesos, hasta el punto en que el host recolector se
quede sin CPU o el tiempo de ida y vuelta a un sitio lejano domine todo.

Un recolector remoto es el mismo código con un identificador de recolector diferente, sondeando un
subconjunto de dispositivos. Cada dispositivo nombra al recolector responsable de él. Esa asignación
es la partición de programación normal. Mantenga coherentes la asignación de dispositivos y la caché
replicada del sondeador; esta opción de programación no es prueba de que cada escritura de resultados
imponga la propiedad del recolector.

Para la cuestión de *cuándo* recurrir a uno, consulte
[Escalar el sondeador](/es-419/guides/scale-the-poller/). Esta página trata sobre qué es uno.

## Por qué un recolector lleva su propia base de datos

Un recolector que lee su lista de trabajo de la base de datos central a través de la red deja de
recolectar cuando la red se detiene. Eso es lo contrario de para lo que quería un recolector remoto.

Por lo tanto, lleva una base de datos local que contiene su propia copia de la configuración:
ajustes, plantillas, métodos de entrada de datos, consultas de datos, su porción de la caché del
sondeador, sus dispositivos, la configuración de complementos y las tablas de usuarios y permisos.
Esa copia se envía desde la instalación principal. Trate la instalación principal como la autoridad
de configuración, mientras que el recolector mantiene el estado operativo local y la configuración
de la máquina.

La configuración de rutas está excluida de la copia, junto con las estadísticas por ejecución que la
instalación principal conserva para sí misma. Las rutas son propiedades de una máquina, no de la
instalación.

## La replicación es periódica, por lo que la configuración se retrasa

El sondeador principal comprueba los recolectores remotos habilitados con un host de base de datos no
local y un intervalo de sincronización distinto de cero. Un recolector vence si nunca se ha
sincronizado, si ha transcurrido su intervalo o si está marcado como que requiere sincronización. Un
intervalo de cero lo excluye de esta comprobación periódica, incluso cuando está marcado como que
requiere sincronización.

El valor predeterminado global es de dos horas; un recolector puede tener su propio intervalo. Esto
no garantiza que cada cambio espere dos horas: las operaciones de dispositivos y complementos
también tienen rutas de replicación dirigidas. La propagación exitosa depende de esa operación, la
conectividad y las tablas seleccionadas. Compruebe la configuración y la caché reales del recolector
en lugar de asumir una consistencia inmediata o un retraso fijo.

Se puede solicitar la replicación completa desde el recolector principal con
`php cli/poller_replicate.php`, cuando hay recolectores remotos habilitados configurados.
Replica todos los recolectores remotos habilitados a menos que `--poller=N` seleccione uno.
Consulte [Escalar el sondeador](/es-419/guides/scale-the-poller/) y
[Migrar a nuevo hardware](/es-419/guides/migrate-to-new-hardware/) para obtener contexto operativo.

## Tres modos de conexión

Un recolector decide al inicio cómo se va a comportar, basándose en si la base de datos central
responde y si contiene muestras que no se han entregado.

| Modo | Condición | Comportamiento |
|---|---|---|
| En línea | La base de datos central conecta y no se detecta acumulación local de Boost | Las escrituras de resultados tienen como destino la base de datos central |
| Fuera de línea | La conexión central falla o se fuerza fuera de línea | La recolección utiliza almacenamiento en búfer local, si los servicios locales siguen en buen estado |
| Recuperación | La base de datos central conecta y quedan filas locales de Boost | Las nuevas muestras permanecen locales mientras un proceso en segundo plano intenta transferir la acumulación |

Fuera de línea no es un estado de error. Es el comportamiento diseñado de un recolector cuyo enlace
está caído, y es la razón por la que un recolector tiene una base de datos local en absoluto. La
recolección continúa contra la configuración disponible localmente. La capacidad de la base de datos
local, el acceso a los dispositivos, la salud del programador y las credenciales utilizables siguen
siendo necesarios; el modo fuera de línea no garantiza una recolección ininterrumpida ni una entrega
final.

## Cómo llegan los resultados a la instalación principal

Los resultados no viajan como escrituras en RRD. Viajan como filas.

La escritura diferida en RRD es obligatoria cuando hay más de un recolector, y añadir un recolector
remoto habilitado hace que el sondeador principal habilite la actualización diferida. La ruta de
inicio también habilita Boost del sistema y redireccionamiento cuando existen múltiples registros
de recolectores. Estas configuraciones no validan por sí mismas una implementación funcional.
Consulte [Escrituras de gran volumen](/es-419/concepts/high-volume-writes/) para conocer qué hace ese modo.

En línea, un recolector inserta sus muestras directamente en la tabla de búfer central. La
instalación principal las vuelca en archivos RRD según su propio cronograma, exactamente como lo
haría para las muestras que recopiló ella misma. Las muestras del recolector no son especiales una
vez que llegan.

Fuera de línea y durante la recuperación, las muestras se acumulan en la cola local de Boost. Cuando
la base de datos central vuelve a ser accesible, `poller_recovery.php` inserta las filas en búfer
en la cola central de Boost, actualizando la salida de una fila que ya existe allí.

La recuperación elimina una fila local solo después de que la inserción central de su paquete tenga
éxito, y solo cuando la fila local aún coincide con lo que se envió. Una inserción fallida, una
muestra de gran tamaño o una fila modificada durante la limpieza deja las muestras locales en su
lugar para el siguiente intento. Esta página no establece un procedimiento validado de recuperación
para múltiples recolectores.

Las inserciones de recuperación llevan identificadores de fuentes de datos, nombres, marcas de tiempo
y valores; no comprueban esas filas contra las asignaciones de recolectores. No confíe en un rechazo
universal de traspaso para protegerse contra asignaciones obsoletas o productores superpuestos.
Valide las asignaciones y el estado de la caché antes de habilitar la recolección.

## El almacenamiento no se distribuye

El flujo de trabajo heredado basado en proxy mantiene los archivos RRD centrales y espera que los
recolectores lleguen a ellos a través del proxy RRDtool. Ese flujo de trabajo no es compatible con
Kadupul; no lo trate como una guía de implementación. Se debe documentar una ruta de almacenamiento
validada para múltiples recolectores utilizando RRDtool local antes de recomendar un reemplazo.

Esta es la parte de la que la gente se sorprende más a menudo, por lo que vale la pena ser directo
al respecto. **Los recolectores remotos distribuyen la espera, no la escritura.** Si el límite que
alcanzó fue el disco bajo el árbol de RRD, la capacidad de recolección adicional no elimina ese
límite. Más muestras entrantes pueden aumentar la carga de la base de datos central y el retraso de
los escritores.

## Qué más fluye de vuelta

Un recolector posee el estado operativo de sus dispositivos. Accesibilidad, el último error, tiempos
de ida y vuelta, recuentos de sondeos, disponibilidad. Escribe estos datos localmente a medida que
sondea y envía columnas operativas seleccionadas a la instalación principal en bloque. Esto actualiza
esas columnas, no la fila de configuración completa del dispositivo.

Por lo tanto, lo que muestra la instalación principal para la accesibilidad de un dispositivo es la
visión del recolector a partir del último envío exitoso. Un recolector que está fuera de línea tiene
una vista actual de sus propios dispositivos que nadie en la instalación principal puede ver.

La instalación principal rastrea a los recolectores de la misma manera que un recolector rastrea
dispositivos. Un asistente de actividad considera que un recolector remoto habilitado está activo
solo cuando su marca de tiempo de último estado tiene una antigüedad inferior al doble del intervalo
de sondeo configurado. Esta comprobación no prueba la entrega de muestras, la replicación exitosa ni
gráficos actualizados.

## Modos de fallo

| Qué falla | Qué sucede | Qué nota |
|---|---|---|
| Enlace con la instalación principal | El recolector puede continuar localmente mientras su base de datos y programador sigan sanos | Gráficos retrasados y cola creciente; se debe verificar entrega y pérdida |
| El propio recolector | Los dispositivos asignados pueden dejar de ser sondeados | Muestras faltantes; diagnostique el estado del programador, dispositivo y recolector |
| Replicación | El recolector ejecuta una configuración más antigua | Los cambios parecen no surtir efecto |
| La base de datos central | Los procesos remotos pueden entrar en modo fuera de línea si falla la conexión | La ingesta central se interrumpe; el búfer remoto depende de la salud local |
| Asignaciones superpuestas u obsoletas | Más de un productor puede enviar muestras relacionadas | Sin rechazo universal; inspeccione asignaciones, marcas de tiempo y errores |

El almacenamiento en búfer puede convertir algunas interrupciones en retrasos, pero no hace que la
entrega sea libre de pérdidas. Compruebe la antigüedad de la cola, la capacidad de la base de datos,
los errores de recuperación y las marcas de tiempo resultantes de RRD. Un gráfico plano por sí solo
no puede distinguir una interrupción del dispositivo de una entrega retrasada o fallida.

## Cuánto cuesta

Frente a un solo sondeador central:

**Usted gana** tiempos de ida y vuelta de dispositivos paralelos entre máquinas, sondeos que ocurren
cerca de los dispositivos en lugar de a través de una WAN y la capacidad de continuar la recolección
local mientras la instalación principal es inaccesible, sujeto a los límites de recuperación y salud
local mencionados anteriormente.

**Usted paga** con una replicación de configuración que puede retrasarse, una segunda base de datos
para operar, supervisar y respaldar por recolector, un modo de escritura diferida que ya no es
opcional y una base de datos central que ahora recibe escrituras concurrentes de cada recolector.

El resumen honesto es que un recolector remoto es una máquina que ahora tiene que administrar. Un
sondeador con más procesos es una configuración. Un recolector es infraestructura, con su propia base
de datos, sus propias credenciales, su propio reloj y su propia versión de la verdad durante el tiempo
que la replicación no se haya ejecutado.
