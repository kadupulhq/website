---
title: Escrituras de gran volumen
description: Por qué las actualizaciones de RRD están limitadas por la cantidad de escrituras y no por su tamaño, qué aporta agruparlas y qué cuesta en términos de frescura.
banner:
  content: Kadupul está en fase prealfa. Valide estos procedimientos en una instalación de prueba aislada. Traducción en borrador, pendiente de revisión por una persona con dominio del idioma.
sidebar:
  order: 10
---

Las actualizaciones de RRD tocan muchos archivos y pueden verse limitadas por la latencia de
almacenamiento y las operaciones de E/S, no solo por el ancho de banda de transferencia. Las
escrituras diferidas, también denominadas Boost, acumulan muestras en la base de datos y agrupan
las actualizaciones por cada archivo. Evalúa el rendimiento del proceso de escritura y de la
base de datos antes de adoptarlo: los huecos en los gráficos no señalan por sí mismos un cuello
de botella en el almacenamiento.

## La ruta predeterminada

Los recolectores insertan resultados en la cola en tránsito `poller_output`. El proceso de
escritura agrupa las muestras por archivo y marca de tiempo, actualiza el RRD y comprueba la
confirmación antes de descartar las muestras procesadas. Las escrituras fallidas pueden dejar
filas pendientes de reintento, de modo que la cola no se limita al ciclo de sondeo en curso.

En la versión analizada, esta cola emplea InnoDB. Las comprobaciones previas a la recolección
rechazan una cola MEMORY; reiniciar la base de datos no desecha de forma intrínseca las filas
confirmadas, a diferencia de lo que ocurriría con una tabla en memoria. La durabilidad sigue
dependiendo de la configuración de la base de datos, el estado del almacenamiento y las copias
de seguridad. Consulta [Actualizar con seguridad](/es-419/guides/upgrade-safely/) para migraciones
de colas y verificaciones de almacenamiento.

Como cálculo aproximado de carga, 10.000 archivos individuales actualizados cada 300 segundos
suponen una media de unas 33 actualizaciones de archivos por segundo. Las escrituras reales
llegan en ráfagas; múltiples campos de fuentes de datos pueden compartir un mismo archivo, los
intervalos de paso pueden variar y la cantidad de órdenes no equivale al recuento físico de
E/S en disco. Compara la latencia medida de escritura y la antigüedad de la cola con la ventana
de sondeo disponible.

## Qué cambia el procesamiento por lotes

Con las escrituras diferidas activadas, la recolección almacena las muestras en
`poller_output_boost` para su tratamiento posterior. El módulo de escritura por lotes agrupa
las muestras por fuente de datos en orden cronológico y puede enviar múltiples marcas de tiempo
en una sola orden de actualización de RRDtool. Doce muestras pueden caber en una misma orden,
pero esto no garantiza una única operación física de escritura en disco.

La longitud máxima de argumento configurada limita las cadenas de actualización; el valor
predeterminado es 2.000. Dicho límite influye en la formación de lotes. No deduzcas un límite
específico del sistema operativo a partir de este ajuste: las escrituras locales confirmadas
emplean un flujo de órdenes de RRDtool, y el mecanismo de transporte y el tamaño de orden
admitido son los factores determinantes.

El planificador pasa a estar listo cuando vence su temporizador (60 minutos por defecto) o
cuando la estimación de filas en el búfer supera el umbral configurado (1.000.000 por defecto).
Dicha estimación incluye las tablas activas y las de archivo. La llamada al planificador debe
llegar a producirse, y las comprobaciones de procesos, la preparación o los fallos de escritura
pueden retrasar la labor. Las ejecuciones forzadas, el vaciado tras la desactivación y las
actualizaciones bajo demanda al consultar gráficos son vías adicionales; los valores por
defecto no suponen una garantía de frescura de una hora.

Cualquier intervalo que sea cero o no constituya un entero positivo se sustituye por 120 minutos;
el valor predeterminado estándar es de 60 minutos.

## La rotación y por qué existe

El esquema de procesamiento por lotes genera una tabla vacía idéntica al búfer activo y luego
intercambia sus nombres mediante una única sentencia `RENAME TABLE`. La tabla activa anterior
pasa a ser un archivo con marca de tiempo y los productores dirigen sus inserciones a la nueva tabla.
Esto separa el lote de las nuevas entradas, aunque los bloqueos de base de datos y la contienda
de recursos aún pueden retrasar la recolección.

Los procesos de trabajo tratan los archivos actuales y retenidos. El proceso principal vigila
la finalización y el estado de los procesos secundarios; las ejecuciones fallidas o no verificables
conservan los archivos para nuevos intentos. Durante una limpieza válida, los archivos vacíos pueden
eliminarse y las muestras residuales pueden devolverse al búfer activo antes de suprimir el archivo.
Un archivo con datos no se descarta simplemente porque el proceso haya concluido. Inspecciona tanto
las colas activas como las de archivo al diagnosticar acumulaciones de datos.

Se trata de un mecanismo de reintento, no de una garantía universal contra caídas del sistema.
Los errores de base de datos, la actividad concurrente, los fallos de hardware y la coherencia
de las copias de seguridad deben evaluarse en el entorno en producción.

## Por qué ver un gráfico puede actualizar sus archivos

La ruta habitual de visualización de gráficos puede intentar actualizaciones bajo demanda para cada
fuente de datos vinculada al gráfico antes de renderizarlo. No vacía incondicionalmente cada muestra
pendiente: las comprobaciones del recolector, los circuitos de tiempo real/origen/error, los límites
de sondeo activo, las restricciones de consultas y los errores de actualización influyen en lo que se
procesa. Las muestras recientes o fallidas pueden permanecer en la cola.

Por tanto, un gráfico de apariencia actualizada no garantiza que todo el árbol de archivos RRD lo
esté, y solicitar un gráfico no asegura una reproducción correcta de los datos. Examina los errores
de escritura, la antigüedad de la cola y las marcas de tiempo reales en los RRD. Las copias de seguridad
que solo abarcan archivos omiten las muestras pendientes en base de datos; consulta
[Copia de seguridad y restauración](/es-419/guides/back-up-and-restore/).

## A qué se renuncia

**Frescura de los archivos.** Las muestras permanecen en la base de datos hasta que se procesan
correctamente. Una instalación saludable gobernada por temporizador puede retrasarse cerca de un
intervalo de vaciado; un proceso de escritura fallido o infradimensionado puede acumular un retraso
mucho mayor. Respalda de forma coherente tanto las colas pendientes como los archivos.

**Una segunda planificación.** Supervisa el sondeo y el vaciado de manera independiente. Observa
las filas activas, los archivos retenidos, la edad de la muestra más antigua, los procesos de trabajo
fallidos y el rendimiento del módulo de escritura. No es necesario que una tabla activa quede a cero
mientras los productores sigan insertando datos, y la mera rotación puede hacerla parecer menor sin
haber completado ninguna actualización en RRD.

**El orden cronológico.** Los archivos RRD no admiten marcas de tiempo antiguas tras actualizaciones
más recientes. El módulo Boost moderno omite actualizaciones pasadas y la ruta heredada filtra las
marcas frente a la última escritura del archivo. Una orden confirmada con éxito puede por tanto
descartar datos desfasados; una entrega tardía no garantiza que la muestra se refleje en el gráfico.

**Superficie operativa.** Hay un búfer en base de datos, un proceso de vaciado con límite de memoria,
procesos de trabajo paralelos opcionales y archivos retenidos o muestras reencoladas que supervisar.
Los fallos locales de escritura suelen retener las muestras para reintentos, pero esto no garantiza
una integridad de extremo a extremo sin pérdidas. Para la recuperación remota, consulta
[Recolección remota de datos](/es-419/concepts/remote-data-collection/).

## Cuándo vale la pena

Plantéate las escrituras diferidas cuando las mediciones demuestren que el módulo de escritura RRD es
el cuello de botella y la base de datos disponga de capacidad para almacenamiento intermedio y consultas
en lote. No suprime la latencia de los dispositivos ni repara una base de datos sobrecargada. Compara
el rendimiento, la antigüedad de la cola, la frescura de los archivos y el uso de recursos antes y
después de activarlo.

El poller principal habilita automáticamente la actualización diferida cuando se configura un recolector
remoto activo. Dicho ajuste no valida por sí solo una infraestructura remota de almacenamiento o
recuperación; aténgase a los límites indicados en
[Recolección remota de datos](/es-419/concepts/remote-data-collection/).

## Una función diferente con el mismo nombre

Las imágenes renderizadas de los gráficos también pueden almacenarse en caché. El almacenamiento en
caché de imágenes reduce el renderizado repetitivo; las escrituras diferidas agrupan muestras de la base
de datos en actualizaciones de RRD. Sus configuraciones son independientes, pero sus rutas de ejecución
interactúan: las solicitudes de gráficos pueden examinar muestras pendientes antes de recurrir a una
imagen en caché, y las actualizaciones exitosas pueden motivar la generación de una nueva imagen.
Valora la frescura de las imágenes de forma separada a la de las colas y los archivos RRD.
