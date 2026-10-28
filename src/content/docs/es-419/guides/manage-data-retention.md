---
title: Gestionar la retención de datos
description: Elegir retención y resolución, estimar almacenamiento y planificar cambios en archivos RRD existentes.
banner:
  content: Kadupul está en pre-alfa. Valide estos procedimientos en una instalación de prueba aislada.
sidebar:
  order: 24
---

:::caution[Validar antes del uso]
El código fuente está disponible, pero no existe una versión ni una ruta de
migración con soporte oficial para Kadupul. Pruebe estos procedimientos en una copia aislada
con copias de seguridad antes de depender de ellos. Consulte el [estado del proyecto](/es-419/project/status/).
:::

La retención se configura al momento de crear el archivo y permanece inalterada durante las actualizaciones normales. Modificar el
perfil más adelante cambia la forma del próximo archivo y deja cada archivo existente
exactamente como estaba. Defina esto correctamente antes de crear diez mil fuentes
de datos, ya que los cambios posteriores requieren mantenimiento explícito o migración de archivos.

Lea primero [Fuentes de datos y archivos](/es-419/concepts/data-sources-and-rras/) si los
términos paso (step), heartbeat, archivo y consolidación no le resultan familiares.

## Qué contiene un perfil

Un perfil de fuente de datos es la directiva de retención. Un perfil, una estructura de almacenamiento.

| Campo | Significado |
|---|---|
| Intervalo de sondeo (step) | Con qué frecuencia se espera un valor, en segundos |
| Heartbeat | Intervalo máximo permitido entre actualizaciones antes de que la entrada se trate como desconocida |
| Factor X-Files | Qué proporción de una ventana de consolidación puede ser desconocida antes de que el valor consolidado sea desconocido |
| Funciones de consolidación | Cuáles entre `AVERAGE`, `MIN`, `MAX`, `LAST` se conservan |
| Archivos | Una fila por resolución, cada una con un nivel de agregación y un recuento de filas |
| Predeterminado | Indica si las nuevas fuentes de datos adoptan este perfil |

El paso toma por defecto el intervalo del poller. Un perfil cuyo paso sea más fino que el
intervalo de sondeo no puede recuperar detalles que nunca se muestrearon. El hecho de que sus filas
sean desconocidas depende del heartbeat y de la normalización de RRDtool.

## Qué se incluye de fábrica

Se incluyen tres perfiles listos para usar. Los tres conservan las cuatro funciones de consolidación.

| Perfil | Step | Heartbeat |
|---|---|---|
| 5 Minute Collection | 300s | 600s |
| 1 Minute Collection | 60s | 600s |
| 30 Second Collection | 30s | 1200s |

El perfil de 5 minutos es el predeterminado.

Cada uno cuenta con cuatro archivos. El nivel de agregación se expresa como un multiplicador del paso,
de modo que la resolución real es el multiplicador por el paso del perfil, y el período cubierto es
dicha resolución multiplicada por el recuento de filas.

### 5 Minute Collection

| Archivo | Multiplicador | Filas | Resolución | Período cubierto |
|---|---|---|---|---|
| Daily | 1 | 600 | 5 minutos | aprox. 2 días |
| Weekly | 6 | 700 | 30 minutos | aprox. 14 días |
| Monthly | 24 | 775 | 2 horas | aprox. 64 días |
| Yearly | 288 | 797 | 1 día | aprox. 2 años 2 meses |

### 1 Minute Collection

| Archivo | Multiplicador | Filas | Resolución | Período cubierto |
|---|---|---|---|---|
| Daily | 1 | 2900 | 1 minuto | aprox. 2 días |
| Weekly | 15 | 1440 | 15 minutos | 15 días |
| Monthly | 60 | 8784 | 1 hora | aprox. 366 días |
| Yearly | 720 | 7305 | 12 horas | aprox. 10 años |

### 30 Second Collection

| Archivo | Multiplicador | Filas | Resolución | Período cubierto |
|---|---|---|---|---|
| Daily | 1 | 2900 | 30 segundos | aprox. 1 día |
| Weekly | 30 | 1346 | 15 minutos | aprox. 14 días |
| Monthly | 120 | 1445 | 1 hora | aprox. 60 días |
| Yearly | 480 | 4380 | 4 horas | 2 años |

Los nombres son etiquetas descriptivas, no comportamientos forzados. Nada obliga a que el archivo denominado
"Yearly" contenga exactamente un año.

## Cómo el perfil se convierte en un archivo

Al crearse, se leen los archivos y las funciones de consolidación del perfil y se
transforman en un comando de creación. El paso proviene del `rrd_step` almacenado de
la fuente de datos, normalmente asignado desde su perfil. Cada elemento de fuente de datos incluido aporta una línea de definición
con su nombre, tipo, heartbeat, mínimo y máximo. Cada archivo
aporta una línea por cada función de consolidación, especificando la función, el factor X-Files, el multiplicador y el recuento de filas.

Cuatro archivos multiplicados por cuatro funciones de consolidación equivalen a dieciséis definiciones de archivos
en el archivo físico. Esa multiplicación es lo que consume el espacio en disco.

Si el archivo ya existe, la ruta de creación habitual se detiene sin sobrescribirlo.
Las modificaciones en el perfil no migran los archivos automáticamente. Las herramientas de mantenimiento explícito
son una operación independiente descrita a continuación.

## Elegir una política

Tres preguntas, en este orden:

**¿Cuál es la pregunta más detallada que llegará a hacer?** Eso determina el paso. Un paso de
30 segundos responde a "¿qué ocurrió durante esa fluctuación de 90 segundos?". Un paso de 5 minutos
jamás podrá responderlo para ningún archivo creado bajo él. Pasos más finos demandan trabajo del poller
en cada ciclo y más espacio en disco.

**¿Con cuánta antigüedad hará esa pregunta?** Eso determina el recuento de filas del archivo diario. La mayoría
de las instalaciones necesitan un par de días a máxima resolución y luego se conforman
con datos más agregados.

**¿Qué preguntas sobreviven a la consolidación?** Eso establece las funciones de consolidación.
`AVERAGE` responde qué fue lo típico. `MAX` responde cuál fue el pico más extremo.
`MIN` responde si hubo caídas en algún momento. `LAST` responde cuál fue el último valor en
la ventana, lo cual importa para lecturas que representan estados en lugar de tasas.

Omitir una de las cuatro funciones de consolidación reduce la carga de valores almacenados en los
archivos nuevos en una cuarta parte en todas las resoluciones. También es el
motivo de arrepentimiento más frecuente de los administradores con el tiempo. Conserve `MAX` a menos que esté seguro de que nadie
preguntará jamás por un pico.

## Dimensionar el disco

El tamaño de un archivo se deriva directamente de las cifras seleccionadas. Según la fórmula utilizada en
la interfaz:

```
file size = 284 + (data sources x (300 + total rows x 8 x consolidation functions))
```

La interfaz emplea 284 y 300 bytes como estimaciones de sobrecarga fija. Considere esto
como una aproximación de dimensionamiento y no como una descripción exacta de cada formato de archivo RRDtool.
Cada valor almacenado ocupa 8 bytes, y el total de filas es la suma de los recuentos de filas en
las definiciones de archivos del perfil antes de multiplicar por las funciones de consolidación.
Mida archivos representativos con el RRDtool instalado antes de dimensionar el almacenamiento.

Para un archivo con una sola fuente de datos y las cuatro funciones de consolidación:

| Perfil | Total de filas | Tamaño aproximado de archivo |
|---|---|---|
| 5 Minute Collection | 2872 | 92 KB |
| 30 Second Collection | 10,071 | 323 KB |
| 1 Minute Collection | 20,429 | 654 KB |

Multiplique por la cantidad de fuentes de datos que planea tener, no por la cantidad de gráficos. Un
gráfico puede combinar campos de uno o varios archivos. Cuente los archivos RRD reales
y los elementos de fuente de datos dentro de cada uno.

Veinte mil fuentes de datos con el perfil predeterminado equivalen aproximadamente a 1,8 GB. Esas mismas
veinte mil con el perfil de 1 minuto ocupan cerca de 13 GB. Esta relación refleja
tanto la resolución como los diferentes períodos de retención de los perfiles, no solo el paso.
Una recolección más frecuente también eleva la tasa de escritura. Consulte [Escrituras de alto volumen](/es-419/concepts/high-volume-writes/) antes de elegir
un paso fino a gran escala.

Tanto el editor de perfiles como el de archivos muestran un tamaño calculado conforme modifica las cifras.
Aprovéchelos. Es muy fácil equivocarse en este cálculo por un factor de cuatro.

## Qué hace y qué no hace el cambio de un perfil

Aquí es donde algunos administradores pierden su historial.

| Cambio | Efecto en archivos nuevos | Efecto en archivos existentes |
|---|---|---|
| Agregar o quitar un archivo | Aplicado | Ninguno |
| Modificar un recuento de filas | Aplicado | Ninguno |
| Modificar un nivel de agregación | Aplicado | Ninguno |
| Agregar o quitar una función de consolidación | Aplicado | Ninguno |
| Cambiar el paso | Las nuevas fuentes de datos lo heredan; la creación usa su paso almacenado | Sin migración automática de archivos |
| Cambiar el heartbeat | La creación usa metadatos almacenados del elemento de fuente de datos; ver abajo | Sin ajuste automático de archivos |
| Eliminar el perfil | Rechazado mientras una plantilla o fuente de datos lo referencie, y para el perfil predeterminado | Ninguno |

**Modificar el heartbeat de un perfil en uso solo actualiza los metadatos.** Guardar un nuevo
heartbeat lo actualiza en el perfil y en los elementos de fuentes de datos de plantillas y
fuentes de datos locales que utilizan el perfil; otras plantillas no se modifican.

La acción de guardar no ajusta los archivos RRD existentes. Realice copias de seguridad de metadatos y archivos,
y compare el perfil, los elementos de plantilla, los elementos de fuentes de datos locales y la salida real de
`rrdtool info` tras el mantenimiento del heartbeat.

La utilidad `cli/update_heartbeat.php` del recolector principal puede ajustar archivos existentes
y actualizar metadatos. Comience con `--help`, `--list-heartbeats`,
`--list-data-templates` y `--list-profiles`. El nuevo heartbeat debe ser compatible
y al menos el doble del intervalo de sondeo configurado. Use `--data-template-id` para
acotar la selección; la utilidad no incluye opción de simulación (dry-run).

Sin `--force`, los perfiles seleccionados ya deben tener el heartbeat
solicitado. Con `--force`, los valores de perfiles compartidos también cambian, por lo que debe inventariar
a todos sus usuarios antes de continuar. `--prev-heartbeat` filtra valores de la base de datos, no
el heartbeat leído de cada RRD: tras un guardado web parcial, seleccionar el valor antiguo del archivo
puede no coincidir con nada. Verifique la selección e inspeccione los archivos resultantes.
La prueba aislada ajustó exitosamente su archivo existente de 600 a 900
después de alinear los metadatos de su perfil.

Existen otras dos advertencias importantes:

**El editor restringe cambios estructurales en cuanto un perfil entra en uso.** Tan pronto
como existe una fuente de datos real asociada a un perfil, el paso, factor X-Files, funciones de consolidación,
recuentos de filas de archivos y niveles de agregación pasan a ser de solo lectura en el editor;
los controles para agregar o eliminar archivos también se ocultan. Duplique el perfil y
edite la copia. Estas restricciones de interfaz no constituyen una validación en el servidor
de las solicitudes enviadas.

**Reasigne las referencias antes de eliminar un perfil.** La lista deshabilita la selección
cuando una plantilla o fuente de datos local utiliza un perfil, y el servidor rechaza
eliminar un perfil que aún se encuentra referenciado.

## Mover fuentes de datos entre perfiles

Existe una acción masiva en las plantillas de datos para cambiar el perfil. Reescribe
el perfil, el paso y el heartbeat registrados en la plantilla, limitándose
deliberadamente a las filas de plantillas. Las fuentes de datos ya existentes no se incluyen.

Por lo tanto, la secuencia para una migración real es:

1. Crear el nuevo perfil y revisar su tamaño calculado.
2. Apuntar la plantilla de datos hacia él.
3. Asumir que todo lo creado a partir de ese momento adoptará la nueva estructura.
4. Decidir, por separado, qué hacer con los archivos que ya posee.

El cuarto paso ofrece varias opciones, según el cambio y la versión de RRDtool instalada:

**Dejarlos como están.** Diferentes estructuras de retención pueden convivir sin problemas. Mantenga
los metadatos de sondeo de cada fuente de datos existentes consistentes con su archivo; cambiar únicamente una
referencia de perfil en la base de datos no migra su paso, campos ni archivos.

**Reconstruir.** Eliminar y volver a crear la fuente de datos. Es rápido, pero el historial se pierde.

**Empalmar (Splice).** La utilidad de línea de comandos splice fusiona un archivo antiguo en uno nuevo y
puede modificar la resolución durante el proceso, siempre que el nuevo archivo ya posea el
paso adecuado. Posee un modo de prueba (dry run). Pruébela sobre una copia antes de usarla en
datos valiosos.

**Mantenimiento con RRDtool.** Dependiendo de la versión instalada y del cambio requerido,
[rrdtool tune](https://oss.oetiker.ch/rrdtool/doc/rrdtune.en.html) o
[rrdtool resize](https://oss.oetiker.ch/rrdtool/doc/rrdresize.en.html) pueden alterar un
archivo existente conservando los datos registrados. Detenga los procesos de escritura concurrentes, mantenga
una copia de seguridad y valide el resultado en una copia. Estas operaciones no recrean detalles
que ya fueron descartados por la consolidación.

## Perfiles externos

Una fuente de datos puede asociarse a un perfil externo, que registra un paso de cero.
Esto indica que el archivo se administra fuera del flujo habitual, y la lista de fuentes de datos
lo muestra como externo en vez de especificar un intervalo. Utilícelo para archivos generados por otro
proceso. No lo emplee para denotar "sin política", ya que la retención seguirá siendo
aquella con la que se creó el archivo; simplemente no se describe en ninguna parte visible.

## Modos de falla

| Síntoma | Causa común |
|---|---|
| La edición de un perfil parece no surtir efecto | Esperado. Los archivos existentes conservan la estructura con la que fueron creados |
| No se puede editar el recuento de filas ni el nivel de agregación | El perfil está en uso por al menos una fuente de datos. Duplíquelo |
| La interfaz muestra un heartbeat, pero el archivo opera con otro | Se cambió el heartbeat del perfil y los archivos nunca se ajustaron |
| Falla la creación de nuevas fuentes de datos, el registro indica que no hay archivos asignados | El perfil se eliminó mientras aún tenía fuentes de datos asociadas |
| El archivo más detallado está lleno de valores desconocidos | Revise actualizaciones faltantes, heartbeat y reglas de consolidación |
| Una semana de gráficos muestra brechas cada pocas horas | Heartbeat demasiado cercano al paso para un poller que sufre retrasos |
| Picos visibles ayer desaparecieron en la vista mensual | Solo se conserva `AVERAGE`, o se descartó el archivo `MAX` para ahorrar espacio |
| El disco creció cuatro veces más rápido de lo estimado | El cálculo contó los archivos pero omitió las funciones de consolidación |
| La resolución deseada no aparece en el menú de nuevo archivo | El editor ofrece el archivo más fino al paso del perfil, y luego únicamente opciones más gruesas que los archivos existentes |
