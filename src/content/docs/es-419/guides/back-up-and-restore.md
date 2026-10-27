---
title: Respaldos y restauración
description: Tres componentes deben guardarse juntos para que el respaldo sea válido, y el orden en que se restauran importa.
banner:
  content: Kadupul está en fase prealfa. Valide estos procedimientos en una instalación de prueba aislada. Traducción en borrador, pendiente de revisión por una persona con dominio del idioma.
sidebar:
  order: 7
---

:::caution[Validar antes del uso]
El código fuente está disponible, pero no existe una versión publicada ni una ruta de migración con soporte para Kadupul. Pruebe estos procedimientos en una copia aislada con respaldos antes de confiar en ellos. Consulte el [estado del proyecto](/es-419/project/status/).
:::

Un conjunto completo de recuperación de Kadupul consta de tres partes. Los respaldos parciales pueden recuperar la configuración o las mediciones, pero no pueden reproducir la instalación completa.

| Parte | Qué contiene | Dónde reside |
|---|---|---|
| Base de datos | Dispositivos, plantillas, usuarios, permisos, la caché del sondeador y la ruta de cada archivo RRD | MySQL o MariaDB |
| Archivos RRD | Mediciones retenidas y archivos consolidados | El directorio RRA, por defecto `rra/` bajo la instalación |
| Configuración | Credenciales de base de datos, rutas, configuración del recolector, código de plugins y scripts | `include/config.php`, el archivo de configuración de spine, `plugins/`, `scripts/`, `resource/` |

## Lo que puede recuperar un respaldo solo de la base de datos

La base de datos contiene las definiciones de gráficos y la configuración de monitoreo, mientras que los archivos RRD albergan los archivos históricos de gráficos. Con Boost activado, las lecturas recientes también pueden residir en colas de la base de datos hasta que se vuelquen a los archivos. Conserve esas colas como parte del respaldo de la base de datos. Consulte la [arquitectura](/es-419/concepts/architecture/).

Si restaura solo la base de datos, obtendrá un sistema que conoce cuatrocientos dispositivos, tiene definidos todos los gráficos y dibuja cada uno de ellos vacío. Volverá a recolectar datos desde el momento en que inicie el sondeador, pero el historial se habrá perdido.

## Lo que le falta a un respaldo solo de RRD

Un archivo RRD contiene fuentes de datos con nombre, definiciones de archivo y valores, pero no los metadatos completos de dispositivos, consultas, gráficos y permisos de Kadupul necesarios para volver a conectar esos valores con la aplicación.

La asignación entre «bytes entrantes en el puerto 3 del switch 12» y una ruta en disco reside en la base de datos, en una columna de la fuente de datos. Si restaura únicamente el árbol de archivos, tendrá varios miles de archivos llenos de números sin forma alguna de averiguar cuál es cuál, salvo mediante ingeniería inversa manual.

Ambas partes forman un único respaldo. Trátelas como tal.

## Coherencia entre ambos

Aquí es donde la mayoría de los procedimientos de respaldo fallan silenciosamente.

El sondeador escribe en los archivos RRD de forma continua. Un archivo copiado mientras se realiza una actualización puede capturarse a medio escribir. La base de datos recibe escrituras al mismo tiempo. Si vuelca la base de datos a las 02:00 y empieza a copiar archivos a las 02:20, las dos mitades describen momentos diferentes, y cada fuente de datos creada o eliminada en ese intervalo supondrá una discrepancia.

Las escrituras diferidas de RRD empeoran la situación y la hacen más interesante. En ese modo, el sondeador no escribe en los archivos RRD en cada pasada. Los resultados se acumulan en una tabla persistente de la base de datos y se vuelcan por lotes más tarde. Por lo tanto, la base de datos puede estar legítimamente adelantada respecto a los archivos RRD hasta el intervalo de volcado, albergando mediciones reales que no existen en ningún otro lugar del disco.

Elija una de estas opciones, en orden descendente de preferencia:

**Instantánea coordinada.** Utilice el procedimiento de respaldo o puesta en reposo compatible con el motor de base de datos y coordínelo con instantáneas de todo el almacenamiento RRD y de la configuración de la aplicación. Una instantánea del sistema de archivos por sí sola no establece coherencia entre volúmenes independientes, recolectores remotos, colas pendientes o una base de datos activa.

**Respaldo lógico en reposo.** Desactive los lanzadores programados y otros productores, espere a que terminen los recolectores que ya están en ejecución, vuelque las escrituras diferidas y espere a los procesos de volcado. Mantenga detenidos los cambios de configuración, el mantenimiento y otros procesos de escritura en RRD durante toda la captura. Las pausas en la recolección pueden dejar muestras ausentes; su visibilidad depende del latido y de la consolidación.

Antes de ejecutar el ejemplo, complete esos pasos de puesta en reposo y verifique el estado de las colas y procesos trabajadores. Que `poller_boost.php --force` devuelva cero no prueba por sí solo un volcado completo: un proceso de Boost ya registrado puede hacer que termine sin realizar el trabajo. Coordine cualquier servicio rrdcached o almacenamiento remoto por separado.

Este ejemplo de Bash presupone almacenamiento local, una cuenta de base de datos configurada en un archivo privado de opciones de cliente y un directorio RRA que contenga todos los RRD gestionados. Sustituya cada ruta. Realice un inventario de las rutas RRD absolutas personalizadas, los destinos de enlaces simbólicos, la configuración externa y los recolectores remotos, y captúrelos también por separado.

```bash
set -euo pipefail
umask 077

APP=/path/to/kadupul
RRA=/path/to/kadupul/rra             # use the actual configured storage path
DEST=/var/backups/kadupul            # outside the served tree
MYSQL_CNF=/secure/path/backup-client.cnf
DB=$(php -r 'require $argv[1]; echo $database_default;' "$APP/include/config.php")
STAMP=$(date -u +%Y%m%dT%H%M%SZ)

install -d -m 0700 "$DEST"
STAGE=$(mktemp -d "$DEST/.partial-XXXXXXXX")
FINAL="$DEST/backup-$STAMP-${STAGE##*partial-}"

# All writers must already be stopped and deferred queues handled.
mysqldump --defaults-extra-file="$MYSQL_CNF" \
  --single-transaction --routines --events --triggers "$DB" > "$STAGE/db.sql"
tar -C "$RRA" -cf "$STAGE/rrd.tar" .
tar --exclude='./rra' --exclude='./log' --exclude='./cache' --exclude='./.git' \
  -C "$APP" -cf "$STAGE/application.tar" .

( cd "$STAGE"
  sha256sum db.sql rrd.tar application.tar > SHA256SUMS
  sha256sum --check SHA256SUMS )
test ! -e "$FINAL"
mv "$STAGE" "$FINAL"
```

El archivo comprimido de la aplicación incluye la configuración y el código correspondiente. Registre la revisión del código fuente, las versiones de la base de datos y de RRDtool, las rutas reales de almacenamiento y el estado de detención/volcado de los procesos de escritura junto con el conjunto. El ejemplo excluye los registros habituales, la caché y los metadatos de Git; revise esas exclusiones para su instalación.

Solo un conjunto capturado con éxito y con sumas de comprobación verificadas recibe el nombre final de directorio. Un comando fallido aún puede dejar un archivo truncado dentro de `.partial-*`; `set -e` detiene los comandos posteriores pero no elimina la salida ya generada. No promueva ese directorio a un respaldo completado. Las sumas de comprobación detectan cambios posteriores, no la integridad lógica; aún se requiere una prueba de restauración.

`--single-transaction` cubre tablas transaccionales, no una instantánea coherente de tablas no transaccionales de plugins o cambios simultáneos en el esquema. Mantenga detenidos los procesos de escritura y los cambios de esquema, o use un método de respaldo adecuado para el motor. Reanude la recolección solo tras confirmar que la captura ha finalizado y el almacenamiento es utilizable. Consulte la [documentación de mysqldump](https://dev.mysql.com/doc/refman/8.4/en/mysqldump.html) para conocer los requisitos de transacciones y privilegios. Las omisiones de la receta anterior se siguen en [website #12](https://github.com/kadupulhq/website/issues/12).

**Acepte el desfase y regístrelo.** Cualquiera que sea la parte que capture primero será la más antigua, y ningún orden hace coherente por sí solo un par en vivo. Registre la ventana de tiempo; eso es lo que hace que el resultado sea recuperable.

Si vuelca primero la base de datos y copia los archivos después, los archivos serán más recientes. Una fuente de datos eliminada dentro de la ventana de tiempo seguirá en el volcado pero su archivo habrá desaparecido, dejando una referencia que el sondeador volverá a crear. Una fuente de datos creada dentro de la ventana llegará como un archivo desconocido para la base de datos, que quedará inerte.

Si copia primero los archivos y vuelca la base de datos después, la base de datos será más reciente. Una fuente de datos creada dentro de la ventana estará en el volcado sin ningún archivo detrás, que el sondeador volverá a crear vacío.

Cualquiera de los dos órdenes puede perder historial anterior a la ventana si se elimina un archivo necesario antes de copiarlo. También puede capturar un archivo escrito parcialmente o muestras en cola incoherentes. Registrar el desfase documenta una limitación; no hace completo un par incoherente ni garantiza la recuperabilidad.

## Lo que hay en el respaldo y en lo que no pensó

Las credenciales de los dispositivos se encuentran en texto sin formato en la base de datos. La caché del sondeador transporta cadenas de comunidad SNMP y nombres de usuario, contraseñas y frases de paso de SNMPv3 en columnas sin cifrar, porque el recolector las necesita en cada pasada. El archivo de configuración contiene la contraseña de la base de datos.

Por lo tanto, un respaldo de Kadupul es un almacén de credenciales para cada dispositivo que monitorea. Cífrelo en reposo, restrinja quién puede leerlo y no lo suba a un recurso compartido de archivos de uso general.

## Orden de restauración

El orden importa porque cada paso depende del anterior.

1. **Restaure primero la configuración.** Sin las credenciales de la base de datos y la ruta de RRA, no se puede verificar nada más. Si la restauración se realiza en un hardware diferente, corrija las rutas ahora en lugar de después.

2. **Restaure el árbol RRD.** Colóquelo donde indique la configuración. Verifique el propietario y los permisos: el sondeador escribe estos archivos con el usuario del sondeador, y la interfaz web los lee con el usuario del servidor web. Una restauración que conserve el contenido pero no la propiedad produce un sistema que grafica correctamente pero no recolecta nada.

3. **Restaure la base de datos.** La tabla de versiones en el volcado debe coincidir con el código sobre el que está restaurando. Mantenga deshabilitados todos los lanzadores y procesos de escritura hasta que se hayan verificado conjuntamente los componentes restaurados. Un volcado de una versión anterior restaurado sobre código más reciente dirige la interfaz web al instalador, lo cual es el comportamiento correcto pero no lo que desea en medio de una recuperación. Restaure primero el código coincidente.

4. **Reconstruya la caché del sondeador.** La caché es derivada, y una restauración es exactamente la situación en la que puede quedar obsoleta. La reconstrucción cuesta una sola ejecución y elimina toda una categoría de síntomas confusos.

5. **Inicie el sondeador y verifique un archivo.** Confirme que la hora de última actualización de un archivo RRD avance tras la primera ejecución. Si los gráficos están poblados hasta el punto de restauración y a partir de ahí quedan planos, inspeccione los resultados de recolección, las colas, las marcas de tiempo, las rutas y los permisos. Un gráfico plano por sí solo no identifica la causa.

## Trampas comunes

**Los archivos RRD rechazan actualizaciones en el pasado.** Un archivo RRD no aceptará una muestra con una marca de tiempo igual o anterior a la que ya contiene. Restaurar un conjunto más antiguo de archivos sobre una base de datos más reciente no rellena por sí solo las muestras perdidas. Las colas diferidas conservadas u otras fuentes pueden contener lecturas recuperables, pero la reproducción requiere validación independiente y ordenación cronológica. Sin esas lecturas, la recolección se reanuda con un hueco. Esta es también la razón por la que no se pueden fusionar dos respaldos copiando archivos entre ellos.

**Verifique si sus rutas almacenadas usan fichas antes de reescribir nada.** Las fuentes de datos generadas almacenan la ruta como `<path_rra>/name.rrd`, y la ficha se expande en tiempo de lectura a partir del ajuste de ruta RRD. Para estas, mover la instalación significa cambiar el ajuste y reconstruir la caché del sondeador, no reescribir filas. Las rutas introducidas a mano se almacenan de forma literal y sí requieren reescritura. Verifíquelo antes de ejecutar una actualización en toda la tabla, porque reescribir rutas con fichas para convertirlas en absolutas es el cambio que dificultará el próximo traslado.

**Los recolectores remotos tienen su propio archivo de configuración.** Cada uno contiene sus propias credenciales de base de datos y su identificador de recolector. No están en el respaldo central de la base de datos. Captúrelos por cada servidor.

**Los datos de los plugins residen en la misma base de datos.** Los plugins crean sus propias tablas en el momento de la instalación, por lo que un volcado completo de la base de datos los cubre. El código de los plugins no está en la base de datos. Si restaura la base de datos sin el directorio `plugins/` correspondiente, la instalación deshabilitará lo que no pueda encontrar.

**Un respaldo que no ha restaurado es una hipótesis.** Restaure en una instancia temporal de forma periódica. El modo de fallo que esto detecta con mayor frecuencia no es la corrupción; es un respaldo que solo estuvo capturando una de las tres partes.
