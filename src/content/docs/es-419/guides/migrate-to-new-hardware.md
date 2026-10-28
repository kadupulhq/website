---
title: Migrar a nuevo hardware
description: Trasladar una instalación en funcionamiento a otro servidor sin perder el historial, en el orden que permite verificar cada paso.
banner:
  content: Kadupul está en fase prealfa. Valide estos procedimientos en una instalación de prueba aislada. Traducción en borrador, pendiente de revisión por una persona con dominio del idioma.
sidebar:
  order: 20
---

:::caution[Comportamiento heredado del proxy RRDtool]
El despliegue del proxy RRDtool no está soportado en Kadupul. Utilice almacenamiento
RRDtool local (`storage_location = 0`). Los ajustes de proxy, descripciones de protocolos
y flujos de trabajo en esta página documentan un comportamiento heredado, no un despliegue
ni una vía de migración con soporte. Consulte [el proxy RRDtool](/es-419/reference/rrdproxy/).
:::

:::caution[Validar antes del uso]
El código fuente está disponible, pero no existe una versión publicada ni una ruta
de migración con soporte para Kadupul. Pruebe estos procedimientos en una copia
aislada con copias de seguridad antes de confiar en ellos. Consulte el [estado del proyecto](/es-419/project/status/).
:::

Una migración consiste en una restauración sobre una máquina distinta de aquella de donde provino
la copia de seguridad. Todo lo expuesto en [Copia de seguridad y restauración](/es-419/guides/back-up-and-restore/)
es de aplicación aquí; esta página aborda únicamente las diferencias motivadas porque el destino
no es la fuente.

Tres aspectos difieren y cada uno conlleva su propio modo de fallo.

| Diferencia | Qué descompone |
|---|---|
| Rutas distintas | Rutas de ficheros almacenadas en la base de datos y en la caché del sondeador |
| Identificadores de usuario y grupo distintos | El acceso a ficheros y las comprobaciones de confianza de almacenamiento pueden fallar |
| Versiones de entorno de ejecución distintas | Las extensiones, el comportamiento de la base de datos y la compatibilidad RRD pueden diferir |

## Antes de tocar nada

Configure primero la máquina de destino y llévela al estado en el que una instalación nueva
funcionaría: servidor de base de datos en ejecución, extensiones PHP preceptivas instaladas,
RRDtool instalado, el recolector seleccionado disponible y el servidor web configurado. Mantenga
desactivados su sondeador, tareas programadas, replicación remota y notificaciones salientes.
No ejecute el instalador. Va a sustituir la base de datos, y un esquema a medio instalar resulta
más arduo de depurar que uno completamente vacío.

Haga coincidir con exactitud la revisión de la aplicación y las dependencias, incluidos ajustes
locales y plugins. La tabla `version` de la base de datos refleja la versión del esquema, no
cada cambio en el código fuente; limitarse a igualar dicho valor resulta insuficiente. Una
redirección hacia el instalador puede delatar una discrepancia de esquema o una restauración
incompleta. Instale el mismo código de partida, migre, certifique que funciona y acometa luego
la actualización como una fase independiente con arreglo a [Actualizar con seguridad](/es-419/guides/upgrade-safely/).

Decida la ruta de instalación en este momento. Mantenerla idéntica en ambos servidores evita la
mayor parte de las intervenciones descritas más adelante. Si no le es posible, lea la sección sobre
rutas antes de dar comienzo.

## Orden de las operaciones

Cada fase valida la anterior, por lo que no debe alterar su secuencia.

1. **Detenga todos los productores en el origen y en el destino.** Detenga la recolección programada, remota, iniciada por web y manual, así como el mantenimiento; permita que las rondas en curso concluyan. Vuelque las escrituras diferidas únicamente tras haber detenido los productores. Conserve las filas pendientes de confirmación en la cola junto a la copia de seguridad emparejada de la base de datos y de RRD; no las trunque.
2. **Obtenga la copia de seguridad.** Base de datos, árbol RRD y configuración, capturados conjuntamente. Las pautas de coherencia de [Copia de seguridad y restauración](/es-419/guides/back-up-and-restore/) constituyen la razón de ser de este proceso.
3. **Traslade el árbol RRD.** Consulte más abajo el procedimiento adecuado.
4. **Traslade la base de datos.**
5. **Traslade el código, la configuración y todo aquello a lo que esta última apunte.** Ello incluye `plugins/`, `scripts/`, `resource/` y cualquier fichero local invocado por un método de entrada de datos.
6. **Vuelva a aplicar la configuración del destino tras la restauración definitiva.** Corrija rutas, puntos de enlace de base de datos, propiedad de servicios y directivas numéricas de confianza de almacenamiento.
7. **Reconstruya la caché del sondeador.**
8. **Ejecute las comprobaciones de almacenamiento bajo cada cuenta de servicio y dé inicio a la recolección exclusivamente en el destino.** Supervise ficheros representativos y la profundidad de colas retenidas.

## Trasladar el árbol RRD

Un fichero RRD es un fichero binario cuya disposición interna depende de cómo fue escrito. Una copia
binaria exige una arquitectura y un formato RRDtool plenamente compatibles; la mera coincidencia
en el nombre del sistema operativo o el ancho de palabra no supone garantía suficiente. Las incompatibilidades
desembocan en errores de lectura. Valide los ficheros copiados utilizando el RRDtool del destino.

Si no tiene certeza de que ambos coincidan, convierta los ficheros en lugar de copiarlos en bruto.
Los comandos dump y restore propios de RRDtool generan un formato de texto portable; Kadupul utiliza
internamente esta misma pareja cuando precisa reescribir un archivo histórico.

En el origen, con las escrituras detenidas, utilice un directorio de trabajo privado y exclusivo:

```sh
set -eu
umask 077
rrdtool dump /path/to/source/file.rrd > /private/staging/file.xml.partial
mv /private/staging/file.xml.partial /private/staging/file.xml
```

Transfiera el fichero XML resultante de forma segura. Restáurelo en el destino hacia un nuevo fichero candidato:

```sh
set -eu
umask 077
rrdtool restore /private/staging/file.xml /private/staging/file.candidate.rrd
rrdtool info /private/staging/file.candidate.rrd
```

Repita la operación para cada fichero que demande conversión y verifique el código de salida de cada
comando. No instale volcados parciales ni candidatos no comprobados. RRDtool documenta el formato XML
como el [formato de transferencia entre arquitecturas](https://oss.oetiker.ch/rrdtool/doc/rrddump.en.html).

Cerciórese antes de decantarse por la vía más lenta. Copie un único fichero, ejecute `rrdtool info`
sobre él en el destino y coteje paso, archivos históricos, fecha de última actualización y nombres de
fuentes de datos. Compare asimismo los resultados de `fetch` a lo largo de un intervalo poblado
conocido. Repita el cotejo sobre estructuras de archivo representativas antes de transferir la totalidad
del árbol y verifique después el inventario íntegro de ficheros. Consulte
[Recuperación de RRD](/es-419/guides/recover-a-corrupted-rrd/) para conocer los requisitos de validación y propiedad de candidatos.

Independientemente del método elegido para su traslado, mantenga estrictamente la estructura de directorios.
Los subdirectorios anidados bajo el directorio RRA no son decorativos; la ruta de cada fichero queda
asociada a su correspondiente fuente de datos, y aplanar el árbol inutilizaría cada una de ellas.

## La base de datos

Un volcado y una importación. Dos cuestiones a constatar en el nuevo emplazamiento.

Inspeccione juegos de caracteres, ordenaciones (collations) y motores de almacenamiento de las tablas
restauradas, no meramente los valores predeterminados del servidor. Preserve las definiciones del origen
y confirme su compatibilidad con la versión de base de datos del destino antes de la conmutación final.

**Las colas del recolector no son cachés desechables.** La cola actual de `poller_output` debe utilizar
obligatoriamente InnoDB. La comprobación previa de almacenamiento rechaza una cola MEMORY. Conserve sus
filas y las colas de aceleración (boost) y tiempo real hasta que las muestras queden confirmadas; una
copia de seguridad de RRD podría no incluir aún dichas mediciones. No suponga que una tabla MEMORY
restaurada se encuentra vacía: un volcado lógico puede incluir instrucciones de inserción que vuelvan a poblarla.

Con los emisores detenidos y las copias de seguridad a buen recaudo, una cola heredada ajena a InnoDB
puede convertirse explícitamente:

```sh
php cli/upgrade_database.php --migrate-poller-queue
php cli/upgrade_database.php --check-rrd-storage
```

Ejecute la verificación de almacenamiento bajo cada cuenta real de servicio web y de sondeo. Esta
comprueba el acceso al almacenamiento local y la cola seleccionada; tener éxito como root no garantiza
el acceso de las cuentas de servicio. Los recolectores remotos en línea suelen dirigirse a la cola
principal; recurra a `--local` únicamente si verifica de forma deliberada su cola local. Las demás
tablas de tiempo de ejecución o caché demandan una estrategia explícita de preservación o reconstrucción.
Consulte [requisitos de almacenamiento](/es-419/reference/requirements/).

## Rutas en el nuevo emplazamiento

Aquí es donde las migraciones tropiezan con más frecuencia, pues gran parte de estos elementos no
resulta visible hasta la primera ronda de recolección.

**La ruta RRA.** Las rutas de fuentes de datos habituales emplean el token `<path_rra>`. En esta
versión, el arranque deduce `$config['rra_path']` a partir del directorio de la aplicación concatenado
con `/rra`; no constituye un ajuste general de base de datos para escoger una carpeta local discrecional.
Confirme la ruta efectiva antes de trasladar los ficheros. Las rutas absolutas personalizadas han de
revisarse y rectificarse de forma individualizada. Conserve las distribuciones de subdirectorios anidados.

**La caché del sondeador almacena rutas absolutas.** Al generarse la caché, el token se expande y la
ruta completa se inscribe en la fila de caché. Si traslada el directorio RRA, la caché continuará
apuntando a la ubicación antigua. El sondeador continuará ejecutándose sin escribir nada que usted
pueda localizar. Reconstrúyala:

```sh
php cli/rebuild_poller_cache.php
```

**Ajustes que almacenan rutas.** Cada uno de ellos se halla registrado en la base de datos, de modo
que proviene de la máquina previa apuntando a la estructura de directorios de aquella. Verifíquelos
todos con anterioridad a la primera ejecución: el binario de RRDtool, el binario del recolector y su
fichero de configuración, el binario de PHP, las utilidades de SNMP, las rutas de registros, la tipografía
predeterminada y el directorio de copias de seguridad de eliminación de picos. Revise asimismo rutas y
variables de entorno en ficheros de configuración, unidades de servicio, tareas programadas y en el servidor web.

**Los métodos de entrada de datos contienen líneas de comando.** Emplean un token para la raíz de
instalación, con lo que un traslado que conserve la estructura de carpetas no requiere modificación
alguna. Un traslado que la altere exige revisar cada entrada. Idéntica consideración aplica a los ficheros
XML de recursos que respaldan las consultas de datos.

**Los recolectores remotos disponen de su propio fichero de configuración**, que contiene sus credenciales
de base de datos y su identificador de recolector. No forman parte del volcado central. Si la base de
datos central cambió de ubicación, actualice los extremos pertinentes y valide la conexión de cada
recolector. La replicación completa constituye una operación independiente que se ejecuta en el recolector
principal exclusivamente cuando existen recolectores remotos habilitados y configurados:

```sh
php cli/poller_replicate.php
```

En ausencia de un recolector remoto habilitado, esta orden finaliza con un error. No la incorpore a una
migración de recolector único a modo de comprobación de éxito preceptiva. Valide la configuración y la
replicación remotas antes de permitir la reanudación del sondeo remoto.

## Propiedad y permisos

El sondeador escribe los ficheros RRD con la cuenta de usuario que lo ejecuta. La interfaz web los
lee con la cuenta del servidor web. Una copia que haya preservado identificadores numéricos entre
máquinas con entradas discordantes en `/etc/passwd` derivará en ficheros bajo la titularidad de una cuenta errónea.

Los gráficos que se detienen justo tras la migración pueden deberse a permisos, rutas desactualizadas,
ausencia de recolección, marcas temporales o muestras rechazadas. Inspeccione los registros del
sondeador y las colas retenidas antes de decidir una subsanación; el gráfico por sí solo no revela la causa.

Verifique la titularidad del directorio RRA en sí y de los subdirectorios anidados, no únicamente la de
un fichero de muestra. Durante la recolección se crean nuevos ficheros en dichas carpetas, de modo que
un directorio en el que el sondeador no pueda escribir fallará ante fuentes de datos que no existiesen
en el momento de migrar, aun cuando los ficheros preexistentes no presenten inconvenientes. Reasigne
`rrd_maintenance_trusted_uids` y `rrd_maintenance_trusted_gids` en `include/config.php` a las
identidades numéricas reales del destino y compruebe los directorios ascendentes de confianza.
Consulte [requisitos de almacenamiento](/es-419/reference/requirements/).

## Conmutación con pérdida mínima

Un fichero RRD rechaza cualquier actualización cuya marca temporal sea igual o anterior a la de su
última modificación. Esto impone límites al reintento; no demuestra que toda migración deba perder
muestras. La magnitud del hueco depende de los intervalos de muestreo, el tiempo de inactividad y
cuáles mediciones retenidas en cola lograron preservarse. Este procedimiento asigna un único responsable
de recolección y descarta fusionar el historial recabado de forma independiente durante los ensayos
con el conjunto archivado definitivo.

1. Efectúe un simulacro completo con antelación valiéndose de una copia de seguridad del día anterior. Copie todos los elementos, subsane cada ruta y compruebe las actualizaciones contra dispositivos de prueba aislados con las alertas desactivadas. Documente las adaptaciones del destino como un procedimiento reproducible. Detenga los emisores del simulacro al concluir los ensayos.
2. Mantenga el entorno de ensayo estrictamente aislado. Sustituya su base de datos y sus ficheros RRD con la copia de seguridad definitiva y emparejada; no mezcle filas de ensayo ni muestras encoladas en dicha restauración.
3. Para la conmutación definitiva, detenga los productores del origen y vacíe o conserve las muestras pendientes; acto seguido, obtenga y transfiera la copia de seguridad final. Aplique de nuevo las modificaciones del destino: restaurar la base de datos reintroduce las rutas del origen en `settings`, y restaurar ficheros de configuración puede sobrescribir también extremos de ensayo y directivas de confianza.
4. Reconstruya la caché del sondeador, ejecute las comprobaciones de almacenamiento, verifique el inventario de ficheros y reanude la recolección en el destino solo tras haber superado satisfactoriamente dichos análisis.

Mida la duración del ensayo y reserve margen para verificaciones y un hipotético repliegue. Conserve
el origen detenido hasta que la conmutación culmine con éxito o un repliegue controlado lo designe de nuevo
como el titular de la recolección.

## Verificar en este orden

1. La interfaz web carga sin redirigir al instalador. Indague discrepancias entre código y esquema, conectividad con la base de datos o una restauración incompleta si se produce dicha redirección.
2. Un dispositivo de prueba responde satisfactoriamente a un nuevo intento de recolección; un estado "up" recuperado puede estar obsoleto.
3. La marca temporal de última actualización de un fichero RRD avanza tras la primera ronda de recolección. Verifique el fichero en disco, no el gráfico.
4. Un gráfico trazado para la última hora refleja una línea continua y ningún hueco.

Si el paso 3 falla, inspeccione rutas, permisos, comprobación previa de almacenamiento, profundidad de
la cola y posibles errores de RRDtool. Si el paso 4 falla, inspeccione valores retenidos, definiciones
de gráficos, el intervalo de tiempo seleccionado y el acceso correspondiente a la cuenta web. Que un
fichero individual funcione no certifica la validez de cada dispositivo, método de entrada o recolector remoto.

## Trampas habituales

**No ejecute ambas instalaciones contra el mismo árbol RRD.** Dos sondeadores escribiendo sobre los
mismos ficheros provocan rechazos de actualización y huecos, no datos fusionados.

**No restaure un árbol RRD más antiguo sobre una base de datos más reciente.** Los ficheros no se
rellenan con carácter retroactivo. La recolección se reanuda en el instante presente y el lapso entre
ambos se convierte en un vacío irreparable.

**La copia de seguridad alberga credenciales de dispositivos en texto claro.** Trasladar el hardware
conlleva que dichas credenciales transiten por la red y convivan en dos máquinas. Limite el acceso a la
copia y cifre el canal de transferencia. Conserve la copia de repliegue debidamente protegida hasta que
la aceptación formal y la política de retención faculten el desmantelamiento; no la borre durante la conmutación.

**Las tablas de plugins radican en la base de datos; el código de los plugins no.** Restaurar la base
de datos sin el código correspondiente ni sus dependencias puede desestabilizar pantallas, puntos de
enganche (hooks) o tareas de los plugins. Compruebe expresamente cada plugin preceptivo.

**El almacenamiento proxy preexistente queda fuera de este procedimiento de migración.** El despliegue
de proxy carece de soporte. Localice y respalde los ficheros RRD reales y, a continuación, valide una
migración independiente hacia almacenamiento local sobre una copia aislada. Un directorio `rra/` local
podría contener meros residuos.

**Desmantele la máquina antigua al final, nunca el mismo día.** Consérvela apagada o con todos los
productores inhabilitados, y mantenga su copia de seguridad emparejada hasta constatar el buen fin de
las pruebas requeridas de recolección, gráficos, enlaces remotos y plugins en el nuevo sistema.
Determine el plazo de observación atendiendo al volumen de carga y a la política de repliegue; completar
con éxito el ciclo de archivado más breve no garantiza que la totalidad de los subsistemas opere correctamente.
