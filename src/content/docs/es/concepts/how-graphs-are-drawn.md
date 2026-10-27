---
title: Cómo se dibujan los gráficos
description: El trayecto desde un archivo round-robin hasta una imagen renderizada, y por qué los mismos números almacenados pueden producir imágenes muy distintas.
sidebar:
  order: 4
banner:
  content: Kadupul está en fase prealfa. Valide estos procedimientos en una instalación de prueba aislada. Traducción en borrador, pendiente de revisión por una persona con dominio del idioma.
---

Una solicitud de imagen ordinaria puede componer una orden de RRDtool a partir de la configuración del gráfico y leer los archivos RRD referenciados. Una imagen válida en caché también puede responder a la solicitud, y el procesamiento Boost bajo demanda puede actualizar archivos antes de renderizar. Consulte [Escrituras de gran volumen](/es/concepts/high-volume-writes/) para conocer los límites de frescura de datos.

## El orden de las operaciones

Para una solicitud que pasa a la generación de comandos:

1. Resolver la ventana temporal requerida y la configuración del gráfico.
2. Estimar la resolución a partir de los perfiles de la base de datos y seleccionar las funciones de consolidación.
3. Emitir referencias `DEF` sin duplicados para los campos y funciones requeridos.
4. Emitir las expresiones `CDEF` y `VDEF` referenciadas.
5. Emitir los elementos de dibujo e impresión en la secuencia configurada, con las opciones aplicables y modificaciones de complementos.
6. Dejar que RRDtool lea los archivos reales y renderice el resultado.

## Elección de un archivo

Kadupul consulta las filas de perfil de la base de datos al calcular extensiones de archivos y opciones de gráficos. Su estimación automática contempla paso por pasos por filas, la cobertura solicitada y el recuento de pasos de archivo; la selección explícita de archivos sigue una vía distinta. Estos cálculos de perfil no examinan cada archivo físico en cada soporte y pueden discrepar de archivos existentes tras un cambio de perfil.

La directiva `DEF` generada especifica el archivo, el nombre de la fuente de datos y la función de consolidación. RRDtool elige un archivo disponible con la resolución idónea y puede consolidar más datos según el ancho del gráfico y la ventana temporal. La estimación de la aplicación no garantiza la lectura de un archivo físico concreto. Consulte la [documentación de definición de datos de RRDtool](https://oss.oetiker.ch/rrdtool/doc/rrdgraph_data.en.html).

Ampliar una ventana o alterar el ancho de la imagen puede variar la resolución mostrada. Una serie más aproximada basada en promedios puede ocultar un pico breve aunque un archivo más detallado lo conserve. Compare la disposición física del archivo y el comando, no únicamente el perfil. Consulte [Fuentes de datos y archivos round-robin](/es/concepts/data-sources-and-rras/).

Cuando quien invoca no indica una hora de fin, el renderizador normal emplea inicialmente el desfase de la última ejecución del poller principal respecto a ahora, recurriendo al intervalo de sondeo si ese dato falta o se sitúa en el futuro. El código posterior posee también una alternativa basada en intervalo consolidado, aunque no constituye una pauta universal. Una hora final explícita prevalece sobre esta inicialización; un gráfico finalizado antes de ahora no demuestra por sí solo el archivo elegido ni que las últimas muestras se hayan escrito.

## Los elementos

Un gráfico es una lista ordenada de elementos. La generación de órdenes puede omitir elementos, reutilizar definiciones o desglosar un elemento en varias instrucciones. El orden de trazado repercute en aspectos que van más allá del diseño visual.

| Elemento | Dibuja | Notas |
|---|---|---|
| `AREA` | Región rellena desde el eje hasta el valor | Las áreas posteriores se dibujan sobre las anteriores |
| `STACK` | Región rellena que arranca en la cima del elemento anterior | Emitida como área con indicador de apilamiento |
| `LINE1`, `LINE2`, `LINE3` | Una línea de uno, dos o tres píxeles de ancho | Puede ser discontinua |
| `LINE:STACK` | Una línea dibujada encima del total apilado acumulado | |
| `TICK` | Marcas a lo largo de un borde del gráfico | Útil para estados, no para magnitudes |
| `GPRINT` | Nada. Imprime un número en la leyenda | |
| `COMMENT` | Nada. Imprime texto literal en la leyenda | Comentarios largos se dividen en líneas |
| `HRULE` | Una línea horizontal en un valor fijo | |
| `VRULE` | Una línea vertical en un momento fijo | |
| `TEXTALIGN` | Nada. Establece la alineación para el texto de leyenda posterior | |

La lista exhaustiva, indicando qué columnas de configuración aplican a cada tipo, figura en [Elementos de gráfico](/es/reference/graph-items/).

`AREA` y `STACK` forman el par donde más errores se cometen. Un área arranca en cero, por lo que dos áreas se superponen y la más alta oculta a la más baja. Un apilamiento comienza donde finalizó el elemento previo, de modo que la altura visible de la segunda franja corresponde a su propio valor, pero su borde superior indica el total. Interprete un gráfico apilado como la altura de una franja y no como una posición en el eje Y, o interpretará mal cada serie con excepción de la inferior.

`HRULE` admite un valor que puede contener sustituciones de plantillas. Los caracteres no numéricos se eliminan del resultado final y, si no queda nada numérico, la regla se dibuja en cero en lugar de cancelar el renderizado. Una regla situada en cero puede ser deliberada o reflejar una sustitución fallida. Inspeccione el comando resuelto antes de deducir la causa. El filtro numérico también puede alterar cadenas con unidades o notaciones no admitidas.

`VRULE` acepta una marca de tiempo Unix o un par `hours:minutes`. Un valor de horas negativo se interpreta como un desfase retroactivo respecto a ahora en vez de una hora del reloj.

## Dos cometidos, una sola palabra

La locución función de consolidación se aplica a dos propósitos distintos, y los mismos cuatro nombres, `AVERAGE`, `MIN`, `MAX` y `LAST`, aparecen en ambos.

El primer cometido es la selección de archivo. Un `DEF` designa un archivo, una fuente de datos en su interior y una función de consolidación. Dicha función acota la familia de archivos requerida. Al solicitar `MAX`, RRDtool necesita datos de consolidación almacenados afines, condicionados al mecanismo de reserva descrito abajo y a la resolución.

El segundo cometido es la aritmética de la leyenda. Un `GPRINT` reduce toda la ventana dibujada a una única cifra impresa, y su función determina la operación. Esa reducción opera sobre la serie ya leída; es agregación de presentación, no almacenamiento.

Así, un `GPRINT` que muestre `MAX` sobre un `DEF` leído con `AVERAGE` imprimirá el valor más elevado de esa serie de promedios durante la ventana renderizada, no obligatoriamente la muestra bruta más alta. Cinco minutos es solo un ejemplo; la resolución efectiva varía. Son valores numéricos diferentes, y en un enlace congestionado difieren notablemente. Ambas lecturas son válidas. Probablemente solo una refleje su propósito.

## El recurso silencioso

Para los tipos de elementos que recurren al asistente de mejor función, Kadupul examina las funciones de consolidación del archivo y utiliza la solicitada si existe, o en su defecto la primera detectada. Si no se obtiene ninguna para una fuente de datos local válida, el asistente recurre a AVERAGE. Las variantes fijas de GPRINT siguen una ruta distinta y no emplean este asistente, de modo que esto no supone una promesa universal de que cada función ausente sea subsanada.

Por tanto, un elemento de dibujo que solicite `MAX` puede terminar leyendo promedios si su archivo solo contiene archivos AVERAGE. Revise el `DEF` generado y la salida de `rrdtool info`. Las labores de mantenimiento de archivos pueden variar la estructura existente, pero agregar un archivo no reconstruye picos históricos descartados por cálculos de promedio anteriores. Consulte [Gestión de la retención de datos](/es/guides/manage-data-retention/).

## GPRINT toma prestado el archivo de su vecino

Un `GPRINT` básico carece de archivo propio. Reutiliza la función de consolidación del elemento afín más reciente de tipo `AREA`, `STACK`, línea o `TICK`, vinculado por nombre de fuente de datos e identificador local del campo de plantilla. Si no hay coincidencia previa, recurre al asistente de mejor función con su propia función configurada. Las variantes fijas emplean su propia función configurada de forma directa.

Esto significa que alterar el orden de los elementos en una plantilla de gráfico puede modificar lo que muestra una leyenda sin que nadie la haya tocado. Sitúe una `LINE` con lectura `MAX` por encima del bloque `GPRINT` y las leyendas correspondientes resumirán valores máximos. Desplácela hacia abajo y el elemento previo coincidente, o el recurso por omisión, determinará la serie de entrada. Si una cifra de la leyenda cambia tras una modificación ajena en la plantilla, revise primero el orden de los elementos.

## CDEF y VDEF

Ambos transforman los datos antes de dibujarlos. No son intercambiables.

| | CDEF | VDEF |
|---|---|---|
| Produce | Una serie temporal, un valor por intervalo | Un valor escalar y, para ciertas funciones, una hora asociada |
| Admite dibujo como línea o área | Sí | Un escalar puede aportar un nivel constante |
| Compuesto por | Funciones, operadores aritméticos, otros CDEF, fuentes de datos especiales, constantes | Una sola función aplicada a una única referencia |
| Anidamiento | Un CDEF puede referenciar a otro CDEF | Un VDEF no puede contener operaciones aritméticas |

Un CDEF es una expresión en pila evaluada en notación polaca inversa. El conjunto de operadores es extenso y se detalla al completo en [Elementos de gráfico](/es/reference/graph-items/): aritmética, operadores relacionales y condicionales, trigonometría, agregación entre fuentes, manejo de pila y funciones temporales para ubicar la posición en el eje X. Conviene familiarizarse pronto con `UN` y `UNKN`. Rellenar valores desconocidos con cero previene discontinuidades visuales pero encubre mediciones ausentes; haga explícita esa decisión de presentación.

Los CDEF también leen referencias especiales en lugar de un nombre de fuente fijo. Una apunta a la fuente de datos del elemento actual, lo que permite reutilizar un único CDEF en todos los elementos de una plantilla. Otras apuntan a todas las fuentes del gráfico, o a todas las afines, permitiendo generar una línea total sin enumerar sus componentes.

Un VDEF sintetiza una serie en un único valor escalar: máximo, mínimo, promedio, desviación típica, primer valor, último valor, total, un percentil o la pendiente, intersección y correlación de un ajuste lineal. RRDtool no soporta operaciones aritméticas dentro de un VDEF; si se requiere una entrada calculada, Kadupul la genera sobre el CDEF del elemento en vez de sobre la fuente en bruto. Esa es la vía prevista: realizar los cálculos en un CDEF y reducirlos después en un VDEF.

Un `GPRINT` respaldado por un VDEF no admite argumento de función de consolidación: el VDEF ya aportó la reducción necesaria. Los VDEF también pueden proporcionar valores escalares para el dibujo; RRDtool admite trazar líneas basadas en VDEF. Consulte la [documentación de elementos gráficos](https://oss.oetiker.ch/rrdtool/doc/rrdgraph_graph.en.html).

La exportación CSV selecciona los tipos de dibujo compatibles como columnas de la serie; los elementos de leyenda no se exportan como columnas equivalentes. Al contrario de lo expuesto en redacciones previas, el código actual no omite sistemáticamente elementos de dibujo respaldados por VDEF. Puede llegar a emitir un `XPORT` no válido de un VDEF escalar: una prueba aislada en RRDtool dibuja una línea VDEF con éxito pero rechaza dicha exportación. Véase el [defecto de la aplicación #273](https://github.com/kadupulhq/kadupul/issues/273). Emplee elementos de dibujo basados en series para la exportación y verifique las columnas resultantes.

## Por qué los mismos datos tienen un aspecto diferente

Todo lo expuesto a continuación altera la imagen sin alterar una sola muestra almacenada.

| Elección | Efecto |
|---|---|
| Duración de la ventana y ancho de la imagen | Puede variar la selección de archivo y la consolidación añadida |
| Función de consolidación en el `DEF` | Lee máximos, mínimos, promedios o últimos valores |
| Ausencia de una función de consolidación | Algunas rutas sustituyen otra función; otras pueden fallar |
| `AREA` frente a `STACK` | Alturas absolutas frente a alturas acumuladas |
| Orden de los elementos | Superposición de trazos, orden de apilamiento y archivo que toma prestado `GPRINT` |
| Base 1000 o 1024 | Modifica el etiquetado del eje. Los valores son idénticos |
| Modo de autoescala, límites fijos, escala logarítmica | Modifica el eje Y, cambiando la percepción visual de la magnitud |

Cuando los gráficos discrepen, compare las órdenes renderizadas, las identidades y estructuras de los archivos físicos, el estado de la caché y la frescura de las muestras. Estas comprobaciones sobre la presentación son valiosas, pero no excluyen errores de recolección, almacenamiento o mapeo. Si desea ver un recorrido guiado para esta comprobación, consulte [Resolución de problemas por datos ausentes](/es/guides/troubleshoot-missing-data/).
