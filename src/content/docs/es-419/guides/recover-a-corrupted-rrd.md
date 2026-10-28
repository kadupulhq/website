---
title: Recuperar un RRD dañado
description: Cómo distinguir un archivo round-robin dañado de uno mal configurado, inspeccionar un archivo, cómo dump y restore lo reparan y qué historial se puede conservar si el archivo debe reconstruirse.
banner:
  content: Kadupul está en pre-alfa. Valide estos procedimientos en una instalación de prueba aislada.
sidebar:
  order: 25
---

:::caution[Validar antes del uso]
El código fuente está disponible, pero no existe una versión ni una ruta de
migración con soporte oficial para Kadupul. Pruebe estos procedimientos en una copia aislada
con copias de seguridad antes de depender de ellos. Consulte el [estado del proyecto](/es-419/project/status/).
:::

La corrupción real de un archivo es infrecuente. La mayoría de los archivos reportados como corruptos están intactos y
no concuerdan con la base de datos, o no pueden ser escritos por el poller, o dejaron de recibir
valores por una razón completamente ajena al archivo. Determine cuál es su caso
antes de modificar nada, ya que la reparación adecuada para uno empeora los demás.

:::danger[Conservar el original]
**Copie el archivo antes de cualquier reparación de esta página.** Restaure en un archivo candidato independiente
e inspecciónelo antes de reemplazar el archivo activo. Reducir un archivo o eliminarlo
descarta el historial acumulado. Modificar un máximo afecta la validación de entradas futuras; no
borra retroactivamente las muestras almacenadas. No existe una función de deshacer automático en un RRD.
:::

## 1. Identificar la falla

| Lo que observa | Suele significar | Ir a |
|---|---|---|
| El gráfico muestra un error en lugar de una imagen | El archivo no existe, no se puede leer o el directorio no permite escritura | Paso 2 |
| El gráfico está vacío pero sin error | No hay valores utilizables en el rango seleccionado, o existe un problema en la definición del gráfico | [Solucionar problemas de datos faltantes](/es-419/guides/troubleshoot-missing-data/) |
| El gráfico se detiene en un momento fijo y no se reanuda | Poller, permisos o heartbeat | Paso 3 |
| El gráfico tiene datos pero la forma cambió sin modificar la configuración | El archivo y la base de datos discrepan | Paso 4 |
| Los valores conservados son todos desconocidos | La recolección, sincronización, límites o configuración de la fuente de datos requieren revisión | [Solucionar problemas de datos faltantes](/es-419/guides/troubleshoot-missing-data/) |
| `rrdtool` se niega a leer el archivo | Ruta inexistente, fallo de acceso, formato incompatible o daño físico | Pasos 2 y 3, luego 5 |

Kadupul convierte el primer caso en un mensaje legible en vez de una imagen rota,
distinguiendo entre un directorio inaccesible y un archivo sin permisos de escritura, y señalando un
archivo ausente como un indicio de que el poller posiblemente aún no se ha ejecutado. Dicho mensaje es una pista, no un
diagnóstico: una eliminación, un cambio de ruta o una restauración incompleta también provocan su ausencia.

## 2. Inspeccionar el archivo

Existen dos vistas disponibles en la página de la propia fuente de datos, ambas activables por sesión.
La vista de depuración muestra el comando `rrdtool create` que Kadupul generaría para esta fuente
de datos en la actualidad. La vista informativa es la fundamental aquí: lee el archivo mediante
`rrdtool info`, consulta la definición de la fuente de datos en la base de datos y detalla
las diferencias. Cuando una diferencia puede subsanarse sin necesidad de reconstruir, muestra el
comando `rrdtool tune` o `rrdtool resize` correspondiente, en formato de texto para que lo ejecute
manualmente en lugar de ejecutarlo por cuenta propia.

Desde una terminal, el mismo primer paso:

```bash
rrdtool info /path/to/rra/42/1337.rrd
```

El encabezado detalla el paso, la hora de última actualización, cada nombre de fuente de datos con su tipo,
heartbeat, mínimo y máximo, y cada archivo con su función de consolidación, recuento de filas
y resolución. Si este comando falla, guarde el error y verifique la ruta,
permisos y compatibilidad de RRDtool antes de asumir corrupción. Una ejecución exitosa de
`info` examina los metadatos; revise también la salida de `fetch` y pruebe un volcado para comprobar el historial.

## 3. Comprobar primero las causas mecánicas

| Verificación | Por qué antecede a la reparación |
|---|---|
| Propietario y permisos del archivo | Un archivo creado por root durante mantenimiento resulta imposible de escribir por el poller a partir de ese momento |
| Propietario y permisos del directorio | El poller no puede generar un archivo de reemplazo en un directorio en el que no puede escribir |
| Espacio libre e inodos | Un sistema de archivos lleno genera escrituras truncadas que se asemejan a corrupción |
| Existencia de un segundo proceso escritor | Actualizaciones simultáneas o fuera de orden pueden fallar o invalidar una captura de mantenimiento; revise los registros |

Ejecute las tareas de mantenimiento con la cuenta propietaria del RRD y preserve su modo,
propietario y grupo. Detenga todos los procesos escritores antes de copiar o sustituir archivos, incluyendo
recolectores remotos, tareas programadas y mantenimiento manual. Purgue escrituras pendientes solo después de
detener a los generadores. Los comandos básicos de shell no adquieren los bloqueos de almacenamiento de Kadupul.
Consulte los [requisitos de almacenamiento](/es-419/reference/requirements/) y el procedimiento de detención en
[Copia de seguridad y restauración](/es-419/guides/back-up-and-restore/).

## 4. Leer lo que el comprobador ya encontró

Kadupul puede verificar periódicamente las fuentes de datos vinculadas a gráficos en dispositivos habilitados y
registrar los hallazgos; no se trata de un inventario exhaustivo de cada archivo en el disco. Viene desactivado
por defecto. La interfaz indica dónde activarlo: Configuration -> Settings -> Data.

| Ajuste | Valor predeterminado | Efecto |
|---|---|---|
| Enable RRDfile Check | off | Nada se comprueba hasta que se habilite |
| Check Frequency | 4 hours | Permite elegir 1 hour, 24 hours o ejecución tras cada ciclo boost |
| Number of RRDfile Check Processes | 1 process | Distribuye la lista de archivos entre procesos concurrentes |
| RRDChecker Timeout | 1 hour | La ejecución se cancela si supera este límite |

Los hallazgos se acumulan en una lista que especifica dispositivo, fuente de datos, identificador interno,
mensaje y fecha. Puede filtrar por antigüedad, buscar en el texto y
purgar la lista una vez atendidas las anomalías.

Los mensajes que puede registrar y el significado de cada uno:

| Mensaje | Significado |
|---|---|
| RRDfile does not exist | El archivo nunca se creó, fue movido o eliminado, o cambió la ruta configurada |
| RRDfile is not writable | El usuario del poller carece de permisos de escritura sobre el archivo |
| RRDfile modify time older than hour | No se ha escrito nada desde hace al menos una hora |
| Last update value in RRDfile is older than 1 hour | La marca de tiempo interna del archivo está desactualizada, evidencia más sólida que la fecha de modificación |
| The RRDfile step does not match the Data Source Profile step | El archivo fue generado bajo un intervalo diferente |
| There are more, or less, Data Sources in the database than in the RRDfile | La plantilla ganó o perdió campos tras la creación del archivo |
| The Data Source '...' exists in RRDfile, but not in database | Señala el campo, visto desde la perspectiva del archivo |
| Data Source name '...' exists in the Database, but not in RRDfile | Señala el campo que el poller intenta escribir pero que no tiene espacio en el archivo |
| The RRDfile Minimal Heart... is lower than polling interval | Detecta heartbeats menores o iguales al intervalo de sondeo; muestras demoradas pueden volverse desconocidas |
| The RRDfile minimal heartbeat... should be 'N' and is currently 'M' | El heartbeat del archivo es inferior al del perfil; esta verificación no advierte sobre valores mayores |
| Stale values for last 24 hours, or last hour | Todas las muestras leídas en ese período resultaron desconocidas |
| More than 50% (n/m) values are NaN in last 24 hours, or last hour | Fallo parcial en la recolección de datos |
| No data returned, maybe corrupted Data Source | Una consulta fetch contra el archivo no devolvió ningún dato |

La comprobación sincroniza automáticamente el paso y el heartbeat registrados en la base de datos para que coincidan con el perfil,
lo que resuelve inconsistencias entre el perfil y los registros de la fuente de datos sin alterar
el archivo físico. Las discrepancias en la cantidad de campos entre archivo y base de datos se notifican en lugar de
repararse, ya que cualquiera de las dos partes podría ser la incorrecta.

## 5. Volcar, editar, restaurar

RRDtool permite serializar un archivo legible a XML y reconstruir un candidato a partir de él.
Esto puede solucionar discordancias estructurales conocidas, pero no reconstruye muestras perdidas
ni asegura que un archivo averiado pueda interpretarse. Kadupul también emplea utilidades de volcado y restauración
para modificaciones estructurales. El asistente local de restauración genera un archivo hermano temporal y
lo renombra sobre el destino tras validarlo; esto no sustituye una copia de seguridad.

Con los procesos escritores detenidos, ejecute esto como el propietario del RRD. Sustituya la ruta de ejemplo por la
ruta auténtica de la fuente de datos. El directorio de trabajo privado se ubica junto a la fuente
para asegurar que el candidato resida en el mismo sistema de archivos:

```bash
set -eu
umask 077
rrd=/path/to/rra/42/1337.rrd
work=$(mktemp -d "$(dirname "$rrd")/rrd-recovery.XXXXXX")
cp -p "$rrd" "$work/original.rrd"
rrdtool dump "$work/original.rrd" > "$work/recovery.xml"
# Edit recovery.xml only when the required correction is understood.
rrdtool restore "$work/recovery.xml" "$work/candidate.rrd"
rrdtool info "$work/candidate.rrd"
rrdtool fetch "$work/candidate.rrd" AVERAGE --start end-1h --end now
```

Seleccione un rango de fetch y una función de consolidación que contengan datos válidos conocidos;
la última hora es solo un ejemplo. Compare nombres de fuentes de datos entre origen y candidato,
paso, archivos, marca de última actualización y valores de muestras. Un ciclo dump/restore idéntico
puede alterar la disposición binaria; compare valores en vez de requerir hashes idénticos.

Conserve la copia original. Solo tras la validación, restablezca el modo,
propietario y grupo requeridos para el candidato y renómbrelo sobre la ruta activa mientras los procesos de escritura siguen detenidos. Verifique
que la cuenta del poller pueda leerlo y actualizarlo antes de reanudar el sondeo. Este ejemplo
se detiene antes de la instalación para evitar colocar un candidato legible pero defectuoso.

El XML y el candidato requieren espacio en disco adicional. Un volcado fallido puede dejar un
XML parcial; no intente restaurarlo. Compruebe permisos, espacio disponible y el error notificado. Si el original
no puede volcarse tras estas verificaciones, restaure una copia de seguridad válida. La opción
[`restore -f`](https://oss.oetiker.ch/rrdtool/doc/rrdrestore.en.html) de RRDtool permite sobrescribir
el destino; el procedimiento por etapas emplea deliberadamente un destino nuevo.

## 6. Qué sobrevive y qué no

| Daño | Historial recuperable |
|---|---|
| Archivo no editable, por lo demás intacto | El historial conservado se mantiene. Las actualizaciones perdidas no se recuperan con solo corregir permisos |
| Heartbeat, mínimo o máximo incorrectos | Sí. `rrdtool tune` modifica la cabecera sin alterar los valores guardados |
| Paso incorrecto | Requiere una conversión explícita y validada; modificar el perfil en la base de datos no convierte el archivo |
| Fuente de datos ausente en el archivo | Los campos existentes conservan su historial. El nuevo campo comienza vacío |
| Archivo eliminado o nunca creado | No. Una resolución que nunca se registró no puede recrearse |
| Filas de archivo reducidas mediante redimensionamiento | No. Las filas descartadas desaparecen en el instante en que se ejecuta la orden |
| Archivo truncado, falla el volcado | No. Restaurar desde copia de seguridad |
| Cabecera intacta, final truncado | No dé por sentado que una cabecera legible garantiza un volcado íntegro; use un respaldo comprobado si el volcado falla |

Modificar el intervalo del poller o transferir una fuente de datos a otro perfil de retención
no reestructura automáticamente los archivos existentes. RRDtool también dispone de operaciones
[`tune` estructurales](https://oss.oetiker.ch/rrdtool/doc/rrdtune.en.html), incluyendo una
opción para el paso; valide el comportamiento de conversión para su versión y esquema de
archivos antes de asumir un cambio de intervalo sin pérdidas. Consulte
[Fuentes de datos y archivos](/es-419/concepts/data-sources-and-rras/) y
[Gestionar la retención de datos](/es-419/guides/manage-data-retention/). Incrementar un valor máximo con `tune`
es seguro; reducirlo marcará como desconocida cualquier muestra futura por encima del nuevo límite.

## 7. Reconstruir conservando lo que se pueda conservar

Kadupul incluye una herramienta de empalme (splice) capaz de poblar un archivo nuevo a partir de uno antiguo
legible. Considere el resultado como un candidato preliminar: puede rellenar huecos y sustituir ceros legítimos,
por lo que no constituye una réplica exacta del historial medido. Ejecútela desde la raíz de la aplicación en
el recolector de datos principal, utilizando copias aisladas en directorios confiables con permisos de escritura.

Genere `new.rrd` con la estructura correspondiente dentro del directorio privado `$work`
del paso 5, y previsualice la fusión:

```bash
php cli/splice_rrd.php --oldrrd="$work/original.rrd" \
                       --newrrd="$work/new.rrd" \
                       --finrrd="$work/merged.rrd" --dryrun
```

Ambos archivos de entrada deben existir previamente y superar las comprobaciones de permisos de la herramienta.
El nuevo archivo proporciona la estructura. Sin `--finrrd`, la salida toma la ruta del nuevo archivo
con la extensión `.new`; utilice una ruta de salida explícita para evitar sobrescribir un
candidato previo. `--dryrun` procesa y fusiona mediante XML temporal y almacenamiento SQLite cuando
está disponible, omitiendo la restauración final en RRD. Esto no garantiza que la restauración
definitiva tenga éxito. Retire `--dryrun` para generar el candidato independiente.
Evite `--owner` durante las simulaciones y ejecute con la cuenta de servicio requerida; revise
la propiedad efectiva del archivo generado antes de la instalación.

:::caution[El empalme interpreta el cero como un hueco]
El proceso recorre el nuevo archivo y, para cada posición con valor desconocido **o cero**, busca
el valor más cercano en el archivo antiguo y lo inserta en su lugar. Por lo tanto, un cero legítimo en
el archivo nuevo es reemplazado por datos antiguos. Para cualquier métrica que marque cero legítimamente durante
períodos extensos (un puerto inactivo, una cola vacía, un contador en reposo), inspeccione el
resultado antes de ponerlo en producción. Los valores desconocidos del archivo antiguo también se rellenan mediante
los valores precedentes, por lo que la salida puede inventar continuidad sobre vacíos de datos reales.
:::

Tras el empalme, ubique el archivo donde la fuente de datos lo espera, con los permisos que el
poller necesita, y confirme que el gráfico dibuja los datos.

## 8. Llenar huecos y por qué pensarlo dos veces

| Utilidad | Lo que escribe |
|---|---|
| `cli/batchgapfix.php` | Rellena un intervalo de fechas en múltiples dispositivos en paralelo, utilizando el último valor conocido o un promedio |
| `cli/float_rrdfiles.php` | Desplaza un intervalo en gráficos seleccionados a través del mismo flujo de dump y restore |

Ambas herramientas inventan mediciones. Nada fue registrado durante esos instantes de tiempo, y posteriormente
nada en el archivo distingue las cifras simuladas de las auténticas. Empléelas únicamente cuando
tenga certeza de que la brecha no fue una caída de servicio: un poller pausado por mantenimiento, una ventana de migración.
Jamás sobre métricas que alimenten cálculos de capacidad o facturación. La misma precaución rige para
[eliminar picos](/es-419/guides/remove-spikes-from-data/).

## 9. Depuración automatizada de una fuente de datos

Ante una fuente de datos con comportamiento anómalo, Kadupul puede ejecutar un diagnóstico durante los siguientes
ciclos de sondeo y emitir un veredicto: si el archivo existe, si este y su
directorio permiten escritura, qué cuenta es propietaria frente a la cuenta con la que opera el poller,
si la fuente de datos está activa, si el archivo concuerda con la definición registrada,
si la última actualización se modificó tras un sondeo y si los valores resultaron válidos. Su
capacidad de reparación es acotada. Aplica las recomendaciones de `rrdtool tune` derivadas de
la comparación y nada más, descartando la operación y registrando el motivo si la lista está vacía o el archivo
no permite escritura. No recrea archivos, no añade fuentes de datos ni modifica archivos de retención.

## 10. La eliminación es un peligro aparte

Kadupul rastrea archivos de almacenamiento cuya fuente de datos ya no existe y ofrece
eliminarlos. También puede configurarse para actuar de manera automática al borrar una fuente de datos, con dos
métodos: eliminar definitivamente o trasladar a un directorio de resguardo.

:::danger[La eliminación es irreversible]
El método de eliminación suprime el archivo del disco. No existe papelera de reciclaje y la información
no se almacena en la base de datos. Si no tiene certeza absoluta de que cada archivo listado es efectivamente huérfano,
establezca el método en archivar, lo cual traslada los archivos a una carpeta definida por usted, permitiéndole
depurar dicho directorio manualmente más adelante.
:::

Un archivo puede aparentar estar huérfano sin estarlo en realidad. Una fuente de datos reubicada en otra ruta, una
restauración parcial o un dispositivo recreado bajo un nuevo identificador dejan archivos a los que
ningún elemento apunta. Compare la lista con su propio registro de modificaciones antes de proceder.

## Modos de falla

| Síntoma | Causa |
|---|---|
| Reparación completada, pero el gráfico sigue vacío | Compruebe permisos de acceso, rango temporal seleccionado, recolección de datos y definición del gráfico |
| `rrdtool dump` devuelve error con el archivo | Compruebe la ruta, permisos, almacenamiento y formato antes de asumir daño |
| Se aplicó Tune pero nada cambió | Las modificaciones de cabecera no rellenan retroactivamente muestras históricas desconocidas; valide las definiciones del archivo y de la base de datos |
| Pequeñas brechas continuas tras cambiar el intervalo | Los archivos aún mantienen el paso y el heartbeat anteriores |
| El archivo empalmado muestra datos viejos donde el nuevo marcaba cero | Esperado. El empalme rellena tanto ceros como valores desconocidos |
| La lista del comprobador crece sin disminuir | Los hallazgos se conservan hasta ser purgados; solucionar el origen no los borra automáticamente |

Genere copias de seguridad conjuntas del directorio de almacenamiento y de la base de datos bajo un mismo cronograma y verifique
la restauración. La recuperación se limita a lo que dicha copia retenía al momento de crearse. Consulte
[Copia de seguridad y restauración](/es-419/guides/back-up-and-restore/).
