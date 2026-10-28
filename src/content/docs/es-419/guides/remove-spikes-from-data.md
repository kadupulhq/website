---
title: Eliminar picos de los datos
description: Previsualizar correcciones de picos, conservar copias de recuperación y verificar cambios en muestras de RRD retenidas.
banner:
  content: Kadupul está en pre-alfa. Valide estos procedimientos en una instalación de prueba aislada.
sidebar:
  order: 19
---

:::caution[Validar antes del uso]
El código fuente está disponible, pero no existe una versión ni una ruta de
migración con soporte oficial para Kadupul. Pruebe estos procedimientos en una copia aislada
con copias de seguridad antes de depender de ellos. Consulte el [estado del proyecto](/es-419/project/status/).
:::

:::danger[Esta operación reescribe el historial; la recuperación requiere copia de seguridad]
La eliminación de picos vuelca el archivo, modifica valores, restaura un archivo hermano temporal
y sustituye el original tras la validación. No existe una función de deshacer automático. Conserve
y compruebe una copia de recuperación, ejecute primero `--dryrun` y confirme las muestras de destino
antes de consolidar cualquier cambio.
:::

Un pico se define aquí como una o dos muestras considerablemente mayores que todo su
entorno, provocando que el eje vertical se adapte a ellas y reduzca el resto del gráfico
a una línea plana sobre el nivel cero. La medición es errónea y sumamente evidente.

## De dónde provienen

La gran mayoría de los picos en fuentes de datos basadas en contadores son de origen aritmético, no mediciones reales.
Una fuente de datos de tipo contador almacena una tasa calculada a partir de la diferencia entre dos
lecturas. Cualquier factor que haga que la segunda lectura sea desproporcionadamente mayor que la primera,
en relación con el tiempo transcurrido, puede generar una tasa ficticia. Reinicios de contador,
gestión defectuosa de desbordamientos, una reindexación de interfaces que transfiera lecturas hacia la fuente de
datos incorrecta o discrepancias de marca temporal pueden desencadenar esto. Un desbordamiento normal de contador
no demuestra por sí solo una muestra defectuosa; verifique el tipo de fuente de datos y las lecturas recibidas.

Consulte [Fuentes de datos y RRA](/es-419/concepts/data-sources-and-rras/) para comprender cómo se deriva
la tasa.

Corrija la causa raíz siempre que sea posible. Eliminar el pico es una solución puramente cosmética; no impedirá
que se produzca el siguiente.

## Los cuatro métodos

La herramienta opera sobre la totalidad del archivo: vuelca cada archivo de retención del RRD, determina
qué valores sustituir y restaura el resultado.

| Método | Qué selecciona | Requiere ventana temporal |
|---|---|---|
| `stddev` | Valores situados a más de N desviaciones estándar de la media | No |
| `variance` | Valores que superan en más de N por ciento la media tras descartar valores atípicos | No |
| `float` | Todo valor contenido dentro de una ventana temporal indicada | Sí |
| `fill` | Muestras desconocidas y con valor cero dentro de una ventana temporal indicada | Sí |

`stddev` y `variance` exploran de manera autónoma. `float` y `fill` cumplen estrictamente las instrucciones dentro de
un intervalo establecido, y ambos fallan al instante si no se les proporciona un inicio y un fin.

`fill` no se limita a datos ausentes: puede reemplazar ceros reales por
valores no nulos. No lo emplee en intervalos con lecturas legítimas de inactividad o cero
a menos que dicha modificación sea intencional.

El método de varianza excluye las N muestras más altas y más bajas antes de calcular el
promedio de referencia, donde N corresponde al ajuste de valores atípicos. Esto evita que
el propio pico distorsione al alza el umbral destinado a detectarlo.

Cualquier elemento seleccionado es sustituido, contando con tres alternativas de reemplazo:

| Reemplazo | Resultado |
|---|---|
| `last` | El último valor válido conocido. Opción predeterminada. |
| `avg` | Un promedio calculado para el campo/archivo; el cálculo varía según el método. |
| `nan` | Valor desconocido para métodos estadísticos; revise las limitaciones del método por ventana abajo. |

El valor desconocido registra formalmente que no se dispone de una medición utilizable. `last` y `avg`
insertan valores que podrían aparentar ser mediciones legítimas a quien examine el gráfico más adelante.
Elija el reemplazo con criterio y verifique el resultado final registrado.

**Métodos por ventana con NaN:** con `--avgnan=nan`, `float` reemplaza cada valor conocido
en la ventana por un valor desconocido, y `fill` reemplaza valores iguales a cero o no numéricos en la
ventana por un valor desconocido. Los métodos estadísticos con límites de tiempo opcionales solo reemplazan
los valores atípicos detectados, por lo que no equivalen a vaciar una ventana por completo.

## Previsualizar, luego aplicar

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

Una simulación (dry run) vuelca el RRD y lo analiza sin reescribir el archivo en producción. Requiere,
no obstante, un directorio de trabajo funcional y permisos de mantenimiento. Una previsualización no bloquea
el archivo hasta una aplicación definitiva: nuevas muestras o parámetros ajustados pueden modificar el
resultado. El ejemplo con delimitación temporal sigue utilizando selección estadística; no elimina
indiscriminadamente todos los valores de esa ventana.

Los parámetros de tiempo aceptan tanto marcas de tiempo Unix como cadenas de fecha. Una cadena que
no pueda interpretarse se rechaza antes de cualquier modificación. Use marcas de tiempo Unix cuando
la interpretación de zonas horarias pudiera resultar ambigua.

## Qué ocurre realmente con el archivo

Aspectos fundamentales antes de ejecutar el procedimiento sobre datos esenciales:

1. El archivo se vuelca a formato XML en el directorio de copias de seguridad.
2. Se suprimen comentarios y se examina cada archivo para obtener las estadísticas.
3. Los valores seleccionados se sustituyen en el XML.
4. El archivo original se copia íntegramente en el directorio de respaldos.
5. El XML editado se restaura en un archivo hermano privado, se valida y se renombra sobre
   el original conservando su propietario, grupo y permisos.

El paso 4 actúa como red de seguridad obligatoria: si la copia falla, la restauración
no se ejecuta. Dicha copia, y no un parámetro de terminal, es el elemento desde el cual
podría restaurar los datos. Su denominación parte del original y puede recibir un sufijo único para evitar
la sobrescritura de respaldos existentes. `--backup` solicita de forma explícita una copia de
recuperación permanente. Compruebe las rutas notificadas y valide los duplicados antes de depender de
ellos.

La operación exige directorios POSIX locales confiables y mecanismos de bloqueo de mantenimiento;
contar únicamente con bits de escritura resulta insuficiente. Rechaza almacenamiento no homologado y un
extremo rrdcached configurado. Detenga los procesos escritores externos, que no se integran con el
protocolo de bloqueo de Kadupul. Opere bajo la cuenta de servicio autorizada para el almacenamiento.
Consulte los [requisitos de instalación](/es-419/reference/requirements/) relativos al acceso al almacenamiento.

## Configuraciones que controlan los valores predeterminados

Los argumentos proporcionados en la terminal prevalecen. Cualquier parámetro no especificado se toma de la
configuración global, y las preferencias individuales de usuario prevalecen sobre las globales cuando la utilidad
se ejecuta desde la interfaz web.

| Ajuste | Valor predeterminado | Qué hace |
|---|---|---|
| Removal method | Variance with outliers removed | Método a emplear |
| Replacement method | Last known good | Valor que reemplaza al elemento suprimido |
| Number of standard deviations | 10 | Umbral para el método `stddev` |
| Variance percentage | 1000 | Umbral para el método `variance` |
| Variance number of outliers | 5 | Muestras superiores e inferiores descartadas antes de promediar |
| Max kills per RRA | 5 | Límite previsto; actualmente no aplicado de manera estricta |
| RRDfile backup directory | `cache/spikekill/` under the install | Directorio de destino para volcados y respaldos |
| Backup retention | 3 months | Tiempo de conservación de los duplicados |

Existe además una modalidad por lotes: una periodicidad (cada 6, 12, 24 o 48 horas), una hora de
referencia y una lista de plantillas de gráficos sobre las cuales operar. La modalidad por lotes está desactivada por defecto.
Activarla implica que el sistema modificará archivos sin supervisión directa sobre el
resultado. Limite estrictamente la lista de plantillas en caso de habilitarla.

## Trampas

**Los umbrales predeterminados son intencionalmente amplios.** Diez desviaciones estándar y
una varianza del 1000 por ciento constituyen rangos muy extensos. Una ejecución que no detecte picos habitualmente
no ha fallado; simplemente confirma que las cifras se ubican dentro del rango solicitado. Reduzca el
umbral en lugar de cambiar de método al azar.

**Max kills per RRA solo restringe los métodos estadísticos.** Para `stddev` y
`variance`, el conteo abarca todas las fuentes de datos dentro de un mismo archivo y se reinicia en el
siguiente. Los métodos por ventana `float` y `fill` sustituyen cada valor que coincida dentro de la
ventana. El conteo acumulado incluye reemplazos por NaN. Revise íntegramente la previsualización
y acote la ventana de tiempo.

**Un valor consolidado no puede reconstruirse.** Los archivos de mayor antigüedad almacenan un valor por
intervalo, ya promediado. Reemplazar ese valor no restablece la medición
auténtica del intervalo; únicamente inserta una estimación razonable. Cuanto mayor sea la antigüedad,
más se asemeja la corrección a una conjetura.

**El directorio de respaldos debe estar configurado y ser confiable.** El volcado y las
copias de seguridad se alojan allí. Directorios faltantes, inseguros o no validables se rechazan; no otorgue
permisos globales de escritura a un directorio para eludir un fallo.

**Mantenga un registro propio de modificaciones además de los registros del sistema.** Registre operador,
comando, intervalo de tiempo, rutas de respaldos y revisiones previas y posteriores. Los totales estadísticos
no constituyen prueba concluyente de los cambios ejecutados.

**Ejecute con la cuenta de servicio correspondiente.** Una sustitución exitosa preserva la propiedad
y los permisos del archivo. Root no es un atajo para eludir las validaciones de directorios;
compruebe que el sondeo normal conserve capacidad de actualizar el archivo resultante.

**Eliminar el pico no corrige el gráfico si la fuente de datos es incorrecta.** Si una
reindexación de interfaces asignó lecturas a una fuente de datos errónea, el pico es solo un
síntoma. Consulte [Solucionar problemas de datos faltantes](/es-419/guides/troubleshoot-missing-data/)
antes de modificar archivos de almacenamiento.
