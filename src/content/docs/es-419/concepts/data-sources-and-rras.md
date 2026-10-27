---
title: Fuentes de datos y archivos round-robin
description: Qué se almacena, cómo funciona la retención y por qué editar perfiles no migra los archivos RRD existentes.
sidebar:
  order: 2
banner:
  content: Kadupul está en fase prealfa. Valide estos procedimientos en una instalación de prueba aislada. Traducción en borrador, pendiente de revisión por una persona con dominio del idioma.
---

Una fuente de datos de Kadupul agrupa mediciones a lo largo del tiempo y se asigna normalmente a un único archivo RRD.
Cada campo con nombre dentro de ese archivo también se denomina fuente de datos (DS) en RRDtool.
Distinga el objeto de la aplicación de sus campos individuales al comparar recuentos o parámetros.

Un archivo no siempre equivale a un solo número. Una fuente de datos puede contener varios campos, y una interfaz
de red representa el caso habitual: los bytes entrantes y salientes comparten un mismo archivo, se recolectan
como tareas independientes y se escriben juntos en una sola actualización. Lo que comparten es un intervalo de paso (step),
un conjunto de archivos y un destino común. No es posible conservar uno de ellos durante más tiempo que el otro,
ya que la retención es una propiedad del archivo y no del campo individual.

## Qué contiene el archivo

Un archivo RRD consta de un encabezado y dos listas.

La primera lista detalla los campos: un nombre, un tipo, un latido (heartbeat), así como un mínimo y un máximo para cada uno.
La segunda lista detalla los archivos: una función de consolidación, cuántos pasos de datos brutos se agrupan en una celda (slot),
cuántas celdas existen y qué proporción de una celda puede ser desconocida antes de que la propia celda pase a considerarse desconocida.

La creación registra estas definiciones en el archivo. Los metadatos de la base de datos y las definiciones
reales del archivo pueden diferir con posterioridad; inspeccione el archivo con `rrdtool info` en lugar de asumir
que la plantilla actual lo describe con total fidelidad.

<span id="the-decisions-that-are-permanent"></span>

## Decisiones de creación y mantenimiento posterior

Un archivo RRD se asigna en el momento de su creación. Las modificaciones de perfil no migran los archivos existentes.
RRDtool proporciona operaciones de ajuste y redimensionamiento que pueden preservar los datos almacenados,
pero requieren validación independiente y respaldos. La ruta de creación normal comprueba si el archivo
ya existe y finaliza sin sobrescribirlo. Esa protección no impide ajustes o migraciones explícitas.
Guardar una plantilla por sí solo no actualiza la disposición de los archivos existentes.

Cuatro decisiones quedan fijadas en ese instante:

**El paso (step).** Con qué frecuencia se espera un valor, generalmente 300 segundos. RRDtool normaliza
las actualizaciones en los límites de paso; las lecturas más frecuentes no se descartan sin más. El hecho
de que actualizaciones más lentas generen datos desconocidos (unknown) depende de las reglas de heartbeat y consolidación.
El paso procede normalmente del perfil de la fuente de datos. La creación del archivo lee el paso almacenado
de la fuente de datos y los archivos del perfil referenciado; compruebe ambos al modificar metadatos o planificar una migración.

**El tipo de fuente de datos.** Véase más abajo. Es el ajuste que falla de forma silenciosa.

**Los límites.** Un mínimo y un máximo acotan los valores aceptables; para los tipos DS que producen una tasa,
dichos límites se aplican a la tasa calculada y no al total acumulado en bruto del contador. Los datos fuera de rango
se convierten en desconocidos (unknown) en lugar de truncarse. Los máximos basados en consultas pueden resolver
los marcadores de posición de velocidad de interfaz; no toda fuente de interfaz recibe automáticamente un límite
correcto de velocidad de enlace. Revise las unidades de la plantilla y la definición real del archivo.

La creación cuenta con ramas específicas de normalización. Para un máximo literal igual o inferior al mínimo,
GAUGE y ABSOLUTE emplean un máximo no definido; los demás tipos utilizan el mínimo más uno. Las sustituciones
de consultas siguen una rama separada. Una comprobación posterior de cero/cero modifica únicamente el máximo,
y una normalización previa podría haberlo alterado ya. No considere esto como un validador general ni asuma
que ambos límites pasarán a ser indefinidos.

**Los archivos.** Cuántas muestras conservar y con qué resoluciones, así como qué función de consolidación
utilizar en cada caso. Esto es lo que determina si podrá responder a una consulta dentro de dos años.

## Tipos de fuentes de datos

| Tipo | Qué almacena | Uso idóneo |
|---|---|---|
| `GAUGE` | Un nivel instantáneo, normalizado al paso del archivo | Temperatura, carga media, memoria en uso, longitud de colas |
| `COUNTER` | Tasa de variación por segundo, con corrección de desbordamiento a 32 o 64 bits | Octetos de interfaz, contadores de paquetes y de errores |
| `DERIVE` | Tasa de variación por segundo, permitiendo valores negativos | Un contador que legítimamente puede decrecer o reiniciarse |
| `ABSOLUTE` | El valor directo recibido, dividido por el tiempo transcurrido desde la última lectura | Un recuento que el dispositivo pone a cero en cada lectura |
| `COMPUTE` | Un valor calculado a partir de otros campos del mismo archivo, no recolectado directamente | Un campo derivado, como un total o una proporción |

Kadupul habilita `DCOUNTER` y `DDERIVE` cuando la versión configurada de RRDtool es 1.5 o superior.
Admiten contadores de punto flotante; DCOUNTER detecta además la dirección de conteo y los reinicios,
por lo que no es un mero COUNTER con decimales. La tabla describe la semántica de RRDtool, no una garantía
de que todos los tipos estén admitidos en cada editor o flujo de creación de Kadupul; valide la definición
generada, especialmente para expresiones COMPUTE. Consulte la referencia oficial
[RRDtool creation reference](https://oss.oetiker.ch/rrdtool/doc/rrdcreate.en.html).

### La elección incorrecta del tipo

Estos ejemplos muestran incoherencias frecuentes; su visibilidad depende de los datos y de los límites fijados.

`GAUGE` sobre un contador incremental grafica su nivel acumulado en lugar del rendimiento. Puede crecer
hasta que se produce un desbordamiento o reinicio; esto puede resultar perceptible, pero en una ventana temporal
corta no aparenta necesariamente ser incorrecto.

`COUNTER` interpreta los descensos aplicando corrección de desbordamiento, por lo que un reinicio puede traducirse
en una tasa positiva desmedida o ser descartado por su límite máximo. `DERIVE` con un mínimo de cero descarta
tasas negativas, incluidos los desbordamientos auténticos; elíjalo solo cuando ese compromiso encaje con la métrica.
Un valor máximo no distingue cada reinicio de un desbordamiento legítimo.

`COUNTER` sobre un indicador de nivel (gauge) constituye el fallo más engañoso. El valor registrado pasa a ser
la variación del nivel dividida por el tiempo transcurrido. Un equipo que se mantenga de forma estable a 40 grados
registrará cero. Una subida de un grado en cinco minutos registrará 0,0033. El gráfico puede parecer plausible
mientras mide variaciones en lugar de la temperatura real. Esa tasa solo resulta útil si era la magnitud deseada;
no representa en absoluto el nivel térmico original.

`ABSOLUTE` sobre un contador que no se reinicia tras la lectura produce el mismo tipo de fallo silencioso
en sentido inverso, generando valores que crecen en proporción al tiempo que el dispositivo lleva encendido.

La regla fundamental consiste en determinar el tipo según cómo genera el número el dispositivo, y no según
lo que dicho número signifique conceptualmente. El hecho de que una lectura sea una tasa es una propiedad del contador,
no de la métrica.

## El latido (heartbeat)

El latido representa el intervalo de tiempo máximo permitido entre actualizaciones consecutivas de un campo
antes de que RRDtool trate el periodo como desconocido. Se mide estrictamente entre actualizaciones, no como
un margen adicional añadido tras el paso.

Examine el perfil configurado y el archivo real. El perfil estándar de cinco minutos emplea un latido de 600 segundos,
el de un minuto utiliza igualmente 600 segundos y el de treinta segundos establece 1.200 segundos. La tolerancia
frente a sondeos omitidos no puede describirse mediante un único multiplicador fijo; la normalización y la consolidación
también condicionan qué intervalos del gráfico resultarán desconocidos.

El latido se define por campo y no por archivo. Los valores del perfil orientan los metadatos, pero la creación
del archivo lee el latido local del elemento, que puede diferir del perfil. Los perfiles integrados no aplican
una proporción uniforme. Las justificaciones de cada uno y los efectos de un latido configurado demasiado próximo
al paso se detallan en [Tiempo e intervalos](/es-419/concepts/time-and-intervals/).

## Consolidación

A medida que se reciben actualizaciones, RRDtool las consolida también en intervalos más amplios; no espera
a que caduque el archivo más preciso. La función se selecciona por cada archivo, y cada función responde
a una necesidad distinta:

- `AVERAGE` promedia los puntos de datos primarios que componen el intervalo.
- `MAX` conserva su valor más alto.
- `MIN` conserva su valor más bajo.
- `LAST` conserva su último valor según las reglas de consolidación de RRDtool.

Estas funciones actúan sobre puntos de datos primarios normalizados, no necesariamente sobre las lecturas brutas
originales. Un archivo MAX no puede recuperar un pico instantáneo ya promediado dentro de un intervalo primario;
MIN no constituye un detector infalible para cada corte de servicio.

Un archivo almacena un archivo por función y por resolución, por lo que retener las cuatro funciones en cuatro
resoluciones supone dieciséis archivos y multiplicar por cuatro el volumen útil de datos respecto a usar solo
promedios con el mismo número de filas. El encabezado y el estado preparatorio también ocupan espacio. Los tres perfiles
predeterminados seleccionan cuatro funciones; dimensione la retención con arreglo a los requisitos analíticos
y a la capacidad de su plataforma.

Si solo conserva promedios, más adelante no podrá consultar los valores máximos: los picos nunca llegaron a guardarse.
Este es el motivo de insatisfacción más habitual en instalaciones duraderas y no admite corrección retroactiva.

Determinadas rutinas de trazado sustituyen una función ausente por una disponible; otros flujos pueden fallar.
Compruebe la directiva DEF generada y los archivos reales tal como se indica en
[Cómo se dibujan los gráficos](/es-419/concepts/how-graphs-are-drawn/).

## El valor desconocido es un dato real

Un RRD distingue con rigor el cero del valor desconocido (unknown). El cero puede ser un nivel reportado o una tasa
calculada, como en un contador que no varía. El valor desconocido puede derivarse de actualizaciones no recibidas,
vencimiento del latido, entradas explícitamente desconocidas, rechazo por límites o insuficiencia de datos de consolidación.
Sustituir el valor desconocido por un cero puede hacer que mediciones ausentes o inválidas parezcan periodos de inactividad normal.

El valor desconocido se propaga durante la consolidación según el umbral configurado por archivo. Los perfiles
estándar lo fijan en la mitad: una celda consolidada formada por datos parcialmente ausentes sigue siendo un número
válido mientras no más de la mitad de sus entradas sean desconocidas, momento a partir del cual la celda completa pasa
a considerarse desconocida. La visibilidad depende de la alineación de las celdas, del latido, de la normalización,
de la consolidación y de la escala del gráfico. No existe un periodo de corte universal que garantice que un hueco
aparezca o desaparezca en todos los archivos.

El valor desconocido es también el resultado de sobrepasar los límites. Una lectura superior al máximo configurado
no queda recortada a ese tope. Un reinicio de contador puede producir una tasa fuera de escala y generar un hueco,
pero los límites no interceptan todos los reinicios. Un dato desconocido por sí solo no identifica la causa;
compare los errores de recolección y las marcas de tiempo.

## Dimensionamiento

Para una disposición sin cambios, el volumen útil de datos de los archivos equivale al total de celdas en todos
los archivos, multiplicado por el número de campos y por ocho bytes. El tamaño total del archivo y del despliegue
incluye además encabezados, estado preparatorio, asignación del sistema de archivos, colas y respaldos.
Cualquier mantenimiento explícito de la estructura puede alterar el tamaño final.

Los tres perfiles incluidos presentan diferencias más acusadas de lo que sus nombres dan a entender:

| Perfil | Paso | Celdas por campo | Volumen útil por campo | Costo relativo |
|---|---|---|---|---|
| 5 Minute Collection | 300 s | 11.488 | aprox. 90 KiB | 1 |
| 30 Second Collection | 30 s | 40.284 | aprox. 315 KiB | 3,5 |
| 1 Minute Collection | 60 s | 81.716 | aprox. 640 KiB | 7 |

Una fuente de datos de interfaz con dos campos duplica cada una de esas cifras. Diez mil interfaces con el perfil
de cinco minutos requieren unos 1,8 GB de datos en los archivos. Esas mismas diez mil interfaces en el perfil de un minuto
rozan los 13 GB, y la explicación no reside únicamente en el paso: este perfil mantiene además un archivo mensual mucho
más profundo y un archivo anual de diez años de extensión.

Conviene cotejar la cobertura efectiva de cada archivo con su denominación. Los archivos del perfil de cinco minutos
se denominan Daily, Weekly, Monthly y Yearly, y los periodos reales que abarcan son de 50 horas, 14,6 días, 64,6 días
y 2,2 años. Las designaciones describen el ajuste predeterminado de gráfico para el que se dimensionó el archivo,
no la retención efectiva. Si necesita consultar datos del pasado mes de abril a resolución de cinco minutos,
la etiqueta le prometerá que es posible, pero el archivo carecerá de esos registros.

La carga de escritura varía asimismo con el perfil y sus exigencias se dejan notar mucho antes de agotar el disco.
A cadencia máxima de recolección, un paso de treinta segundos genera diez veces más intervalos de muestreo que uno de
cinco minutos. La agrupación por lotes, los campos compartidos, la selección de tareas pendientes y los reintentos fallidos
modifican el recuento de comandos y de escrituras físicas; no responden a una proporción inmutable. Consulte
[Escrituras de gran volumen](/es-419/concepts/high-volume-writes/).

## Qué campos llegan al archivo

Una fuente de datos creada a partir de una plantilla solo recibe un campo en el archivo para aquellos campos referenciados
por algún elemento de gráfico en el flujo de creación ordinario. El código de actualización puede omitir los campos
de plantilla no referenciados; el hecho de que se recolecten depende del método de entrada y de la caché, y no solo
de que una curva sea visible. Una fuente de datos sin plantilla recibe la totalidad de los campos, ante la premisa
de que no existe un gráfico previo que limite la selección.

Una referencia no exige dibujar una línea visible de forma obligatoria: inspeccione las asignaciones de elementos de gráfico,
así como la caché y la definición del archivo. Añadir un campo a una plantilla no demuestra por sí solo que la recolección,
la asignación gráfica y el almacenamiento estén plenamente operativos. Reconstruir la caché actualiza los metadatos
de recolección; no añade campos a un archivo RRD ya existente.

Esto implica asimismo que incorporar un campo a una plantilla no lo añade automáticamente a los archivos preexistentes,
ni siquiera cuando un elemento de gráfico hace referencia a él. Añadir un campo exige mantenimiento explícito o migración.
En función de la versión de RRDtool instalada, las tareas de ajuste permiten añadir fuentes preservando los datos existentes;
eliminar y recrear un archivo conlleva la pérdida irreversible de su historial. Consulte
[Gestionar la retención de datos](/es-419/guides/manage-data-retention/) para conocer las comprobaciones y vías de mantenimiento.
