---
title: Arquitectura
description: Las cuatro piezas móviles y cuál suele fallar.
sidebar:
  order: 1
banner:
  content: Kadupul está en fase prealfa. Valide estos procedimientos en una instalación de prueba aislada. Traducción en borrador, pendiente de revisión por una persona con dominio del idioma.
---

:::caution[Comportamiento heredado del proxy RRDtool]
El despliegue con proxy RRDtool no es compatible en Kadupul. Utilice almacenamiento RRDtool local (`storage_location = 0`). Los ajustes de proxy, las descripciones de protocolo y los flujos de trabajo de esta página documentan un comportamiento heredado, no una vía de despliegue o migración compatible. Consulte [Proxy RRDtool](/es-419/reference/rrdproxy/).
:::

La aplicación web, la base de datos, la recolección programada y el almacenamiento RRD de Kadupul desempeñan funciones distintas, pero sus rutas de ejecución se solapan. Saber qué operación ha fallado ayuda a delimitar la investigación; que la interfaz funcione no demuestra que la recolección funcione.

**La interfaz web** es una aplicación PHP. Gestiona la configuración y genera o entrega gráficos en caché. Algunas acciones web también desencadenan la recolección, como las peticiones de gráficos en tiempo real, y las peticiones normales de gráficos pueden activar actualizaciones pendientes de RRD.

**La base de datos** alberga la configuración, los permisos, el estado operativo, la caché del sondeador y las colas de mediciones. Los valores recolectados pueden permanecer allí mientras esperan una escritura en RRD o un reintento; no es solo un almacén de configuración.

**El sondeador** coordina el trabajo programado y los procesos hijos recolectores. Los resultados pasan por colas en la base de datos antes de que el proceso de escritura normal o diferido actualice los archivos RRD.

**Los archivos RRD** albergan series históricas acotadas. Una fuente de datos suele tener un RRD que contiene sus campos; la creación de gráficos puede reutilizar fuentes, y crear metadatos no garantiza que el archivo ya exista.

## Los límites

| Límite | Qué lo cruza | Transportado por |
|---|---|---|
| Interfaz a base de datos | Configuración, sesiones, autorización, trabajo en caché y datos operativos | SQL; la base de datos puede ser remota |
| Interfaz a archivos | Lecturas de gráficos, imágenes en caché y actualizaciones o creación de RRD bajo demanda aptas | Sistema de archivos y RRDtool |
| Sondeador a base de datos | Listas de trabajo, valores recolectados, colas retenidas, estado y cuentas regresivas | SQL |
| Recolección a dispositivos | SNMP, scripts de recolección y comprobaciones de accesibilidad | Red o comandos locales; la recolección activada por la web también es posible |
| Proceso de escritura a archivos | Muestras agrupadas, posiblemente varias marcas de tiempo por actualización | Comandos de RRDtool y tuberías confirmadas |
| Servidor de base de datos a archivos RRD | Sin actualización directa de RRD en la ruta normal de la aplicación | El código de escritura de la aplicación coordina ambos almacenes |

Las filas de la base de datos asocian una fuente de datos con un dispositivo y su ruta de archivo configurada. Los archivos de RRDtool describen series y archivos; no sustituyen a esa correspondencia de la aplicación. El tráfico de red no se limita al sondeo de dispositivos: las conexiones a bases de datos, los recolectores remotos y otras integraciones configuradas también pueden cruzar hosts.

Realice respaldos consistentes del estado de la base de datos, las muestras pendientes y los archivos RRD. Una restauración exclusiva de la base de datos no recupera el contenido histórico de los RRD, y una restauración exclusiva de archivos omite la configuración y las muestras no volcadas. Mover archivos sin conciliar las rutas puede provocar errores de archivos ausentes o escrituras retenidas; no es un fallo silencioso de recolección garantizado. Consulte [Respaldos y restauración](/es-419/guides/back-up-and-restore/) y [Migrar a hardware nuevo](/es-419/guides/migrate-to-new-hardware/).

<span id="why-measurements-are-not-in-the-database"></span>

## Por qué el historial a largo plazo utiliza archivos RRD

El historial de gráficos a largo plazo se almacena en RRD, pero las colas de mediciones residen en la base de datos. La cola normal en tránsito es InnoDB en esta revisión, y las escrituras diferidas retienen muestras en tablas de Boost. Las escrituras fallidas o las entregas remotas retrasadas pueden hacer crecer esas colas. Consulte [Escrituras de gran volumen](/es-419/concepts/high-volume-writes/).

Un RRD asigna un número definido de filas en las resoluciones seleccionadas. Las actualizaciones normales reutilizan ese espacio en lugar de anexar historial indefinidamente. El tamaño del archivo está acotado si el diseño no cambia; añadir fuentes de datos, modificar diseños, retener copias de recuperación o acumular colas sigue incrementando las necesidades totales de almacenamiento.

La contrapartida es que la retención se define con antelación. Una vez que el historial detallado ha caducado o se ha consolidado, un cambio de diseño posterior no puede recrear el detalle descartado. Consulte [Fuentes de datos y archivos round-robin](/es-419/concepts/data-sources-and-rras/).

La configuración y el estado operativo utilizan la base de datos porque la aplicación necesita actualizaciones compartidas y consultas relacionales. Esto no significa que cada relación esté respaldada por una clave foránea de base de datos, ni que un almacén de filas deba crecer para siempre; describe la división de responsabilidades de esta aplicación.

## Dos rutas que comparten dos partes

Una petición normal de página o gráfico sigue habitualmente esta ruta:

1. Un navegador envía una petición; PHP carga la configuración y se conecta a la base de datos.
2. La petición aplica la autenticación y la autorización correspondiente de ámbito u objeto.
3. Las acciones de la consola leen o actualizan la configuración y pueden desencadenar trabajo adicional.
4. Una petición de gráfico puede comprobar muestras pendientes de Boost y una caché de imágenes, o ensamblar un comando de RRDtool y leer los archivos configurados. Consulte [Cómo se dibujan los gráficos](/es-419/concepts/how-graphs-are-drawn/).
5. Las peticiones de gráficos en tiempo real pueden iniciar el recolector en tiempo real y utilizar datos temporales independientes. Un gráfico plano por sí solo no demuestra que el archivo esté vacío ni que la recolección y la generación hayan tenido éxito.

Un sondeo programado sigue habitualmente esta ruta:

1. El programador inicia el sondeador, que comprueba el estado de habilitación, los tiempos y el almacenamiento.
2. Selecciona el trabajo pendiente de la caché del sondeador e inicia los procesos hijos recolectores.
3. Los procesos hijos consultan los dispositivos o ejecutan scripts de recolección y depositan los resultados en la base de datos.
4. El proceso de escritura correspondiente procesa las muestras agrupadas, utilizando colas diferidas cuando están configuradas y reteniendo los fallos reintentables.
5. El estado operativo y el estado de programación se actualizan en la base de datos.

Consulte [Ciclo de vida del sondeador](/es-419/reference/poller-lifecycle/) para conocer el orden y la gestión de fallos. Estas rutas comparten recursos de base de datos y de almacenamiento, por lo que pueden competir por ellos. Reiniciar el servidor web no repara un sondeador programado de forma independiente, pero las peticiones web pueden intervenir en la recolección y la escritura; diagnostique el proceso que realmente falla.

## Qué se ejecuta con cada usuario

| Proceso | Se ejecuta como | Iniciado por |
|---|---|---|
| Aplicación web PHP | Cuenta del servidor web o del grupo de PHP-FPM | Servidor web |
| Sondeador programado | Cuenta configurada del programador | cron, Programador de tareas o servicio configurado |
| RRDtool | Normalmente hereda la cuenta del proceso que lo inicia | Ruta web, de sondeo o de mantenimiento |
| Scripts de recolección | Normalmente heredan la cuenta de su recolector | Recolección programada o activada por la web |

Todas las cuentas de escritura que intervienen necesitan el acceso adecuado al almacenamiento configurado. La creación normal de fuentes de datos escribe metadatos; el RRD puede crearse más tarde cuando un proceso de escritura lo necesite. La ausencia de un archivo puede indicar que la recolección no ha alcanzado ese punto, así como un fallo de ruta, confianza, permisos o creación.

Algunas rutas de creación ejecutadas como root intentan aplicar el propietario y el grupo del directorio RRA. Estos intentos pueden fallar y registrar errores; no sustituyen a la configuración correcta de las cuentas de servicio. La propiedad que no es de root sigue las reglas del sistema operativo, incluidas la herencia de grupos de directorios y las ACL. Valide los permisos de almacenamiento y los ajustes numéricos fiables de UID/GID en cada cuenta de escritura de la web y del sondeador. Consulte [Actualizar de forma segura](/es-419/guides/upgrade-safely/).

La implementación de ICMP en PHP analizada invoca la utilidad ping del sistema operativo. Su capacidad para enviar sondeos depende de esa utilidad y de la directiva del sistema operativo; la presencia de asistentes heredados con UID efectivo no implica que cada sondeo ICMP eleve PHP a root. No ejecute la aplicación como root únicamente para habilitar ping. Compruebe el comando real, la cuenta y la salida de errores; las comprobaciones por TCP o UDP tienen semánticas de accesibilidad diferentes.

## La lista de trabajo está precalculada

La caché del sondeador almacena el trabajo de recolección resuelto para que cada ejecución no tenga que derivar cada comando a partir de las relaciones de plantillas. Las operaciones de configuración pueden reconstruir las entradas afectadas; existen herramientas explícitas de reconstrucción cuando se necesitan.

Los cambios representados en campos en caché deben llegar a esas entradas antes de que la recolección los utilice. Otros ajustes se leen por separado, por lo que no todo cambio de configuración exige una reconstrucción manual de la caché. Inspeccione el contenido de la caché, los errores de recolección y el estado de replicación remota en lugar de presuponer una única causa. Consulte [La caché del sondeador](/es-419/concepts/the-poller-cache/) y [Recolección remota de datos](/es-419/concepts/remote-data-collection/).

## Dónde suelen fallar las cosas

| Síntoma | Comprobaciones útiles |
|---|---|
| La interfaz funciona, los gráficos están planos | Ejecución del programador, errores de recolección, colas, frescura de las muestras y ventana del gráfico |
| El sondeador se ejecuta, los archivos no avanzan | Confirmación o errores del proceso de escritura, confianza y permisos de almacenamiento, trabajo diferido acumulado |
| Una fuente de datos está plana | Respuesta del dispositivo, fila de la caché, correspondencia de archivos, muestras desconocidas y expresiones de dibujo |
| Un cambio de configuración parece ineficaz | Resultado del guardado, anulaciones de plantillas, entradas de caché afectadas y replicación |
| Huecos periódicos | Tiempos, latido, tiempos de espera, disponibilidad del dispositivo y fallos de escritura |
| Forma inesperada del gráfico | Comando generado, opciones de CDEF/CF, datos reales del archivo, caché de imágenes y correspondencia |
| El historial de un puerto parece asociado a otra interfaz | Identidad de la consulta, renumeración y resultados de reindexación |
| La cuenta accede a la consola pero no a los gráficos | Ámbito de la página de gráficos, autorización de objetos e identidad del gráfico solicitado |
| Los recolectores difieren | Asignación, configuración replicada, anulaciones locales y estado de conexión |
| Todo va lento | Esperas en base de datos, contienda en almacenamiento o escritura, tiempo de ejecución del recolector y carga web |
| Existen metadatos de la fuente de datos pero el archivo no | Primera recolección o escritura, ruta configurada, errores de confianza y creación |

Estos puntos son comienzos, no diagnósticos. Siga las evidencias a través del límite correspondiente y verifique el resultado tras un cambio. Consulte [Solucionar problemas de datos ausentes](/es-419/guides/troubleshoot-missing-data/).
