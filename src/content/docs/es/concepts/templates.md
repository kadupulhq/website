---
title: Plantillas
description: Cómo una única definición cubre cien dispositivos y qué ocurre cuando se modifica.
sidebar:
  order: 3
banner:
  content: Kadupul está en fase prealfa. Valide estos procedimientos en una instalación de prueba aislada. Traducción en borrador, pendiente de revisión por una persona con dominio del idioma.
---

Las plantillas existen para que añadir el conmutador número cien cueste el mismo esfuerzo que añadir el segundo. Hay cuatro tipos y se apilan entre sí.

Para una secuencia práctica, consulte [Uso y validación de plantillas](/es/guides/template-workflow/).

Las **plantillas de datos** definen qué se recopila y cómo se almacena: los campos, sus tipos, sus límites, el perfil de almacenamiento y el método de entrada que obtiene los números. Los campos por objeto y los archivos RRD existentes pueden diferir de la plantilla actual; la plantilla no constituye una prueba de la estructura física del archivo.

Las **plantillas de gráficos** definen cómo dibujarlo: qué elementos, en qué orden, qué colores, qué líneas de leyenda y qué indica el eje.

Las **plantillas de dispositivos** agrupan las consultas de datos y las plantillas de gráficos adecuadas para una clase de hardware, de modo que elegir la correcta al añadir un dispositivo realiza la mayor parte del trabajo.

Las **consultas de datos** gestionan los casos en los que no se conoce de antemano cuántos elementos existen. Un conmutador tiene una cantidad de puertos descubiertos al explorar el dispositivo, y una consulta de datos registra resultados indexados para la creación de gráficos. El descubrimiento por sí solo no crea un número fijo de gráficos o fuentes de datos.

## Cómo se apilan

Los cuatro tipos no son cuatro capas de un mismo objeto. Cada uno señala al siguiente en la jerarquía apuntando hacia él.

| Tipo | Apunta a | Produce |
|---|---|---|
| Plantilla de dispositivo | Plantillas de gráficos y consultas de datos | Nada directamente. Es una lista de lo que se ofrece para un dispositivo |
| Consulta de datos | Definiciones de gráficos y asignaciones para resultados indexados | Filas descubiertas; la creación del gráfico puede crear o reutilizar fuentes de datos |
| Plantilla de gráfico | Campos de plantilla de datos donde un elemento requiere datos | Un gráfico que puede hacer referencia a múltiples fuentes de datos |
| Plantilla de datos | Un método de entrada y un perfil de almacenamiento | Metadatos de la fuente de datos; un RRD se crea cuando la ruta de escritura lo necesita |

Los elementos de plantilla con datos hacen referencia a campos de la plantilla; los elementos instanciados se asignan a campos locales. Los elementos de texto y constantes no necesitan una referencia a una fuente de datos. La creación del gráfico resuelve esas asignaciones, y los cambios posteriores de plantilla o de elementos también pueden alterarlas. La creación de gráficos puede reutilizar fuentes de datos compatibles en lugar de crear un archivo nuevo para cada gráfico.

## De plantilla o por objeto

Muchos campos a nivel de gráfico y de fuente de datos tienen indicadores complementarios en la fila de la plantilla. Para esos campos, el indicador rige la propagación normal a los elementos secundarios vinculados. Otros campos, elementos de gráfico y asignaciones de entrada tienen reglas de propagación independientes.

| Indicador | Significado | Al guardar |
|---|---|---|
| Desactivado | El campo se rige por la plantilla | Se escribe en cada elemento secundario, sobrescribiendo lo que existiera |
| Activado | El campo es por objeto | Se mantiene sin cambios en cada elemento secundario |

El indicador se aplica por campo. Una plantilla de gráfico puede aplicar su etiqueta de eje a los gráficos vinculados, dejando el título y el límite vertical a quien lo haya creado. Esa combinación es el caso normal, no una excepción.

Dos propiedades de este diseño suelen inducir a error.

El indicador reside en la plantilla y decide únicamente lo que hace el siguiente guardado. Marcar un campo como por objeto después de que una propagación lo haya sobrescrito no restaura nada. Los valores individuales anteriores se han perdido; el indicador protege solo los valores futuros.

Lo contrario entraña mayor riesgo. Desactivar el indicador en un campo que ha sido por objeto durante años hace que un único guardado sobrescriba ese campo en todos los elementos secundarios simultáneamente con el valor de la plantilla, a menudo un marcador de posición que nadie ha revisado.

### No todos los campos tienen un indicador

Un campo solo participa si existe un indicador para él. En el nivel de la fuente de datos, cuatro lo tienen y dos deliberadamente carecen de él.

| Campo | Indicador | Comportamiento |
|---|---|---|
| Nombre | Sí | De plantilla o por objeto |
| Activo | Sí | De plantilla o por objeto |
| Paso | Sí | De plantilla o por objeto |
| Perfil de almacenamiento | Sí | De plantilla o por objeto |
| Método de entrada | No, siempre de plantilla | El controlador de guardado de la plantilla actualiza explícitamente las filas vinculadas |
| Ruta al archivo RRD | No, nunca de plantilla | Las propagaciones normales lo excluyen; la reasignación de plantilla preserva la ruta existente |

La preservación de la ruta protege la asociación histórica existente durante los cambios normales de plantilla. No significa que las rutas no puedan editarse o reubicarse mediante otras operaciones administrativas. Compruebe la identidad de los archivos antes de modificarlos.

Todos los campos de un elemento de fuente de datos disponen de indicador: el nombre del campo, su tipo, su heartbeat, su mínimo, su máximo y el campo de entrada que lo alimenta.

## Las entradas de gráfico actúan en sentido inverso

Una plantilla de gráfico puede declarar una entrada con nombre que vincula varios elementos de gráfico a un único campo editable, de modo que editar un valor en un gráfico actualiza cada elemento que lo comparte. Es el mecanismo mediante el cual un solo ajuste de color o de leyenda controla un grupo de elementos relacionados.

El valor que propaga no es el de la plantilla. Lee el valor actual de los otros elementos que pertenecen a la entrada y lo transmite. Por tanto, una entrada de gráfico se propaga lateralmente entre los elementos propios del gráfico en lugar de descender desde la plantilla, razón por la cual editar una entrada puede modificar un gráfico que la plantilla no ha tocado directamente.

## Qué se propaga y cuándo

| Modificación | Alcanza a objetos existentes | Cómo |
|---|---|---|
| Campo de plantilla de gráfico, de plantilla | Sí, al guardar | Escrito en cada gráfico derivado de esa plantilla |
| Campo de plantilla de gráfico, por objeto | No | El elemento secundario conserva su propio valor |
| Aspecto del elemento de gráfico | Sí, al guardar | Color, transparencia, tipo de elemento, ancho de línea, trazo discontinuo, CDEF, VDEF, desplazamiento, función de consolidación, alineación, texto y formato de leyenda |
| Elemento añadido, eliminado o reasignado a otro campo | Según la operación | Coincidencia, adición, eliminación y reasignación usan rutas distintas; compruebe las asignaciones locales resultantes |
| Campo de plantilla de datos, de plantilla | Sí, al guardar | Escrito en cada fuente de datos derivada de esa plantilla |
| Valores de campos de entrada de plantilla de datos | Si son de plantilla | Los indicadores de plantilla y secundario, los campos de índice y las reglas de host limitan la propagación |
| Perfil de almacenamiento, paso, archivos de plantilla de datos | Solo base de datos | Los archivos existentes conservan la estructura con la que fueron creados |
| Campos añadidos a una plantilla de datos | Solo base de datos | Los archivos existentes no tienen espacio para almacenarlos |
| Contenido de plantilla de dispositivo | Sincronización independiente | Editar las asociaciones no sincroniza automáticamente cada dispositivo existente |

La propagación en la base de datos depende de la ruta de guardado y de las reglas de sustitución. La actualización de metadatos de plantilla no migra por sí misma los archivos RRD existentes; el mantenimiento de archivos es una operación independiente. Algunos controles estructurales son de solo lectura en el editor de plantillas de datos en uso. Consulte [Creación de plantillas personalizadas](/es/guides/create-custom-templates/).

## Las plantillas de dispositivos tienen una ruta de sincronización explícita

Modificar las asociaciones de una plantilla de dispositivo altera lo que se ofrece a los nuevos dispositivos. Los dispositivos existentes emplean una operación independiente de reaplicación o sincronización. La herramienta masiva selecciona de forma predeterminada dispositivos en estado Up o Recovering, a menos que el llamador incluya explícitamente dispositivos caídos; verifique la selección antes de asumir que se actualizaron todos.

La sincronización añade las asociaciones de plantillas de gráficos que falten, actualiza las consultas de datos seleccionadas y puede eliminar asociaciones en desuso que ya no se necesiten. No elimina directamente gráficos existentes por el simple hecho de que su plantilla haya sido retirada de la plantilla de dispositivo. También activa puntos de enlace de automatización y de complementos, pudiendo ejecutar la automatización de gráficos configurada.

Revise las asociaciones y gráficos resultantes del dispositivo tras la sincronización. No constituyen necesariamente la unión permanente de todas las versiones de plantilla aplicadas a lo largo del tiempo.

## Índices y razones del desplazamiento de puertos

Una consulta de datos debe decidir qué elemento descubierto coincide con una fuente de datos existente concreta. Ese elemento es el índice. Los índices numéricos pueden cambiar tras modificaciones de hardware o de configuración. Un campo estable adecuado ayuda a preservar la identidad, pero los nombres de interfaz también pueden renombrarse o reutilizarse. Compruebe la unicidad, persistencia y el comportamiento de reindexación en el dispositivo real; ningún nombre de campo garantiza por sí solo la continuidad.

Esta decisión parece trivial al adoptarla y resulta costosa si falla. Se toma por dispositivo y por ejecución en lugar de una vez para la consulta, por lo que dos conmutadores idénticos pueden quedar indexados según campos diferentes. La forma de elegir el campo, qué ocurre cuando un índice desaparece y el coste de detectar renumeraciones se explican en [Consultas de datos e índices](/es/concepts/data-queries-and-indexes/).

## Modificación posterior de una plantilla

Los cambios en los gráficos afectan a los renderizados sucesivos una vez completados el guardado y la propagación. Las anulaciones y la caché de imágenes pueden influir en lo que ve el usuario, así que no asuma que cada gráfico cambia de inmediato. Inspeccione un gráfico secundario representativo y sus asignaciones de elementos; consulte [Ajuste del aspecto de gráficos](/es/guides/tune-graph-appearance/).

Guardar una plantilla de datos no remodela automáticamente los archivos RRD existentes. Las definiciones y archivos reales del archivo pueden diferir del perfil de la base de datos. Inspeccione ambos antes del mantenimiento; crear un archivo de sustitución es solo una opción.

Según el cambio, los ajustes admitidos por RRDtool, el redimensionamiento de archivos o las labores controladas de volcado y restauración pueden preservar parte o la totalidad del historial existente. Esas operaciones tienen límites y requieren copias de seguridad y comprobaciones; no reconstruyen datos que nunca se almacenaron. Eliminar y recrear un archivo borra su historial. Consulte [Gestión de la retención de datos](/es/guides/manage-data-retention/) y [Fuentes de datos y archivos round-robin](/es/concepts/data-sources-and-rras/).

## Otros conceptos denominados plantillas

Otros cuatro objetos utilizan esta palabra sin comportarse como los cuatro descritos. Las plantillas de color son paletas con nombre aplicadas a elementos de gráfico. Las plantillas de agregación describen cómo combinar varios gráficos en uno. Las plantillas de automatización asocian dispositivos descubiertos a una plantilla de dispositivo. Las definiciones preestablecidas de gráficos suministran formatos de leyenda reutilizables.

Ninguno de ellos se encuentra en la jerarquía descrita aquí. Conviene conocerlos principalmente para que un resultado de búsqueda que mencione una plantilla se interprete como el tipo correcto.
