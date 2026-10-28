---
title: Descubrir dispositivos automáticamente
description: Escanee un rango de red, asocie los dispositivos encontrados con una plantilla y permita que las reglas creen gráficos y ramas de árbol, con la creación de dispositivos deshabilitada en un pase de descubrimiento inicial.
banner:
  content: Kadupul está en fase pre-alfa. Valide estos procedimientos en una instalación de prueba aislada. Este es un borrador de traducción pendiente de revisión por un hablante fluido.
sidebar:
  order: 15
---

:::caution[Validar antes del uso]
El código fuente está disponible, pero no existe una versión compatible de Kadupul ni
una ruta de migración. Pruebe estos procedimientos en una copia aislada con copias de seguridad antes de
confiar en ellos. Consulte el [estado del proyecto](/es-419/project/status/).
:::

La automatización consta de dos mecanismos independientes que son fáciles de confundir. El descubrimiento recorre
un rango de direcciones y determina qué constituye un dispositivo. Las reglas deciden qué se construye para un
dispositivo una vez que existe. Puede ejecutar cualquiera de los dos sin el otro, y la mayor parte del daño
que los usuarios causan con la automatización proviene de activar ambos a la vez y descubrir
las consecuencias a posteriori.

## Definir el rango

Un rango de red es una lista separada por comas. Cada entrada responde a una de tres formas.

| Forma | Ejemplo | Notas |
|---|---|---|
| CIDR | `192.168.1.0/24` | También acepta una máscara punteada, `192.168.1.0/255.255.255.0` |
| Comodín | `192.168.*.*` | Convertido internamente al CIDR equivalente |
| Dirección única | `192.168.1.10` | Escanea exactamente esa dirección |

Los rangos de inicio a fin formulados como `192.168.1.10-192.168.1.50` se rechazan con un
error. No son compatibles.

Utilice rangos que no se superpongan, incluso entre redes que puedan ejecutarse simultáneamente.
La tabla de trabajo tiene una clave única global en la dirección IP; un duplicado puede
rechazar un lote completo de inserción, omitiendo otras direcciones de ese lote. Consulte el
[problema #207](https://github.com/kadupulhq/kadupul/issues/207).

Todo se gestiona con IPv4. Los cálculos matemáticos del rango emplean conversión de enteros de 32 bits en todo momento,
por lo que no existe una ruta IPv6 en este contexto.

Las direcciones de red y de difusión quedan excluidas. Un `/24` escanea 254 direcciones, desde
`.1` hasta `.254`. Una entrada de dirección única escanea una sola. Las direcciones cuyo último octeto es 255
también se omiten durante el escaneo.

Antes de que comience un escaneo, cada dirección del rango se escribe en una tabla de trabajo, una
fila por dirección, y los subprocesos reclaman filas de ella. Un `/16` escribe 65534 filas antes
del primer ping. Se trata de un coste tangible, y explica por qué el escaneo de un rango amplio y disperso
resulta lento incluso cuando nadie responde.

Asocie un conjunto de opciones SNMP a cada rango. El modo maestro registra un error y omite
un rango cuyo ID de conjunto SNMP sea cero. Una ejecución orientada no aplica esa misma protección;
iniciarla directamente no hace utilizables las opciones SNMP ausentes.

## Ajustar el ritmo del escaneo

| Parámetro | Función | Valor predeterminado |
|---|---|---|
| Discovery Threads | Trabajadores paralelos que reclaman direcciones | 1 |
| Run Limit | El descubrimiento se interrumpe tras este periodo | 20 minutes |
| Schedule Type | Manual, diario, semanal, mensual o mensual en un día fijo | Manual |
| Ping Method | ICMP, TCP, TCP closed, UDP o SNMP | Desde la configuración global |
| Ping Retries, Timeout | Coste de fallo por dirección | Desde la configuración global |

Los subprocesos y el límite de ejecución interactúan mal si no se planifican con criterio. Cincuenta subprocesos
contra un `/16` constituyen un escaneo de puertos para cualquier sistema de detección de intrusiones.
Un único subproceso contra el mismo rango alcanzará el límite de ejecución y se interrumpirá a mitad de camino,
dejando un resultado parcial con apariencia de completo.

Dimensione el rango para que el escaneo finalice dentro del límite con un número de subprocesos
que su red tolere. Varios rangos reducidos superan a uno grande, ya que cada uno obtiene su propia
programación y su propio límite.

## Qué hace un escaneo por dirección

1. Resolver un nombre. Se pueden especificar servidores DNS alternativos como una lista delimitada por espacios; si
   no se establece ninguno, se utiliza el propio solucionador del poller. La búsqueda NetBIOS es una alternativa
   opcional cuando el DNS no devuelve resultados.
2. Comprobar si la dirección o ese nombre ya corresponden a un dispositivo. Si es así, la dirección se marca
   como completada. Esto suprime un dispositivo existente encontrado mediante esos valores; no obstante,
   no garantiza la prevención de creaciones simultáneas o alias divergentes.
3. Hacer ping, utilizando el método configurado. El método SNMP elude el ping independiente.
4. Si el ping responde, o si se selecciona el método SNMP, probar SNMP y recopilar `sysDescr`, `sysObjectID`, `sysName`,
   `sysLocation`, `sysContact` y el tiempo de actividad.
5. Cotejar los datos del sistema recopilados con las reglas de dispositivos.

Una dirección que responde al ping pero no al SNMP se registra como encontrada y activa. Una
dirección que responde al SNMP pero no coincide con ninguna regla de dispositivo se registra como encontrada, con sus
datos de sistema, y no se crea nada. Ambas terminan en la lista de dispositivos descubiertos.

La supresión de duplicados está activada de forma predeterminada. Si un `sysName` ya se ha observado en
otra dirección en los registros de descubrimiento almacenados de esta red, o existe en un dispositivo con un
nombre de host distinto, la dirección se omite. Es el valor predeterminado correcto para un enrutador con múltiples
interfaces direccionadas y el incorrecto para dispositivos idénticos detrás de direcciones NAT independientes;
precisamente para desactivar este comportamiento existe la opción de mismo sysName.

A los dispositivos existentes se les pueden volver a ejecutar sus consultas de datos durante un escaneo. Esto está desactivado
de forma predeterminada y se aplica a los dispositivos registrados como activos o en recuperación. El descubrimiento utiliza su
estado almacenado para esta decisión; no sondea de nuevo activamente un dispositivo existente.

## Las reglas de dispositivos deciden la plantilla

Una regla de dispositivo asigna datos del sistema a una plantilla de dispositivo. Cada regla contiene un patrón para
`sysDescr`, `sysObjectID` y `sysName`. El cotejador filtra según cada campo del sistema
que el dispositivo devolvió como no vacío; los patrones de regla en blanco coinciden con cualquier valor. Las reglas
se evalúan en orden secuencial y gana la primera coincidencia.

Utilice subcadenas literales sencillas y verifique la plantilla seleccionada en los resultados del descubrimiento.
El cotejador SQL actual envuelve los patrones de expresiones regulares entre caracteres literales `/`,
por lo que un patrón anclado como `^Linux.*fixture$` falla incluso cuando el operador regex de la base de datos
coincide directamente. La alternativa por subcadena no corrige esa situación. Consulte el
[problema #206](https://github.com/kadupulhq/kadupul/issues/206). SQL `LIKE`
también trata `%` y `_` como comodines.

Si no hay coincidencia, no hay dispositivo. La dirección se registra en la lista de dispositivos descubiertos
junto con los datos del sistema recopilados, y esa lista es el punto en el que usted redacta la regla
que faltaba.

Sitúe las reglas específicas por encima de las generales. Una regla que coincida con la subcadena `Linux`
ubicada por encima de una regla de proveedor reclamará cualquier dispositivo que mencione Linux en su
descripción.

## Previsualizar el descubrimiento antes de habilitar la creación

El interruptor de creación de dispositivos en un nuevo rango está desactivado de forma predeterminada. Déjelo apagado
para el pase inicial y deshabilite la opción de volver a ejecutar las consultas de datos de dispositivos existentes.
Este pase sigue actualizando los registros de descubrimiento, las estadísticas de escaneo y los registros, y puede enviar
las notificaciones configuradas. No previsualiza la ejecución de reglas de gráficos o de árbol.

Ejecute el escaneo y consulte luego la lista de dispositivos descubiertos. Muestra los descubrimientos registrados,
sus datos SNMP recopilados y la plantilla coincidente cuando esté disponible. Los dispositivos
existentes, los duplicados suprimidos y las direcciones omitidas no tienen por qué figurar allí.
Revise la salida de depuración por dirección además de la propia lista.

Fuerce un escaneo desde la línea de comandos en lugar de esperar una programación:

```bash
php poller_automation.php --network=3 --force --debug
```

El indicador de depuración imprime las decisiones por dirección en tiempo real. El proceso maestro,
que lanza los rangos habilitados cuya programación ha vencido, constituye un modo independiente:

```bash
php poller_automation.php -M
```

El comando específico con `--force` también ejecuta una red deshabilitada. Añadir `--force` al
modo maestro elude la comprobación de programación y también puede lanzar redes deshabilitadas.
Utilice la variante específica al validar un solo rango.

Verifique tres aspectos en el resultado antes de activar la creación:

- El recuento de dispositivos coincide con lo esperado. Un número muy superior a su inventario
  suele significar que el rango es más amplio de lo previsto.
- Las plantillas seleccionadas son correctas. Una columna con la misma plantilla genérica para
  todo indica que sus reglas no están encajando adecuadamente.
- No falta nada importante. Ante un dispositivo ausente, verifique la expansión del rango, la finalización de los trabajadores,
  la supresión de duplicados y dispositivos existentes, la política de ping y los resultados SNMP.
  La sola ausencia en la lista no demuestra que el equipo sea inaccesible.

## Reglas de gráficos y de árboles

Una vez que un dispositivo existe, las reglas de gráficos y de árboles determinan qué se construye en él.
El descubrimiento puede invocar esta automatización tras crear un dispositivo, y la CLI puede
aplicarla a dispositivos existentes. Las reglas individuales de gráficos y de árboles deben estar habilitadas.
Los interruptores globales de automatización de gráficos/árboles rigen enlaces de creación particulares;
no son una prohibición general de la automatización explícita mediante la CLI.

Una regla de gráfico consta de tres partes: a qué dispositivos se aplica, a qué índices descubiertos
dentro de una consulta de datos se aplica y qué tipo de gráfico debe crearse. Ambas secciones de coincidencia
se componen de elementos de regla, y un elemento de regla es un campo, un operador y un
patrón, unidos mediante `AND` u `OR` con paréntesis.

| Grupo de operadores | Miembros |
|---|---|
| Subcadena | contains, does not contain, begins with, does not begin with, ends with, does not end with |
| Igualdad | matches, is not equal to |
| Numérico | is less than, less than or equal, greater than, greater than or equal |
| Presencia | is unknown, is not unknown, is empty, is not empty |
| Patrón | matches regular expression, does not match regular expression |

Estos se transforman en una cláusula SQL `WHERE`. Los operadores de expresiones regulares siguen el
dialecto regex de la base de datos, no PCRE; por tanto, un patrón que funcione en
`preg_match` no funcionará necesariamente aquí. Las comparaciones numéricas contra patrones numéricos
se pasan sin comillas; todo lo demás se entrecomilla y la base de datos
aplica sus reglas de conversión de tipos. Pruebe los filtros numéricos contra los valores reales almacenados en
caché; dichos valores suelen guardarse como texto. Los operadores de subcadena usan SQL `LIKE`,
donde `%` y `_` funcionan como comodines.

Conviene conocer dos comportamientos antes de depurar una regla inerte:

**Un filtro de dispositivo/objeto vacío no coincide con nada, pero un filtro de índice vacío
coincide con todos los índices en caché.** El filtro de selección de dispositivos recurre a una condición falsa
cuando carece de elementos de coincidencia. No obstante, una vez que una regla de gráfico coincide con un dispositivo,
eliminar todas sus condiciones de índice de gráfico deja la consulta de datos sin filtrar.
Por ejemplo, eliminar una condición `ifDescr = eth0` también puede crear un gráfico para `lo`.
Deshabilite la regla mientras edita sus condiciones de índice.

**Una regla que hace referencia a un campo no descubierto por el dispositivo se abandona.** Si una
regla filtra por un campo de consulta de datos que no está en la caché de ese dispositivo, la ejecución registra
una advertencia indicando el campo y detiene el procesamiento de esa regla para dicho dispositivo. La causa
habitual radica en una regla formulada para una consulta de datos evaluada en un dispositivo cuya
consulta devolvió un conjunto de campos distinto.

La página de edición de reglas enumera los objetos y gráficos candidatos. Revise esas listas antes
de habilitar una regla y después de modificarla. Son vistas previas de selección, no un ensayo
completo de ejecución: las comprobaciones de fuentes de datos, la detección de gráficos existentes, los enlaces de creación
y la inserción en el árbol siguen produciéndose durante la ejecución. La CLI no dispone de opción de simulacro.

Las reglas de árbol presentan tipos independientes de hojas para dispositivos y gráficos, así como un árbol
de destino y un nodo principal seleccionados. Los pasos de encabezado pueden emplear cadenas fijas o valores
de los campos de dispositivos/gráficos. Los encabezados derivados de campos aplican un reemplazo regex PHP insensible a mayúsculas;
las secuencias literales `\n` en el resultado lo dividen en sucesivos encabezados anidados.
Esta sintaxis de reemplazo difiere de la expresión regular SQL empleada para la coincidencia de objetos.
Los encabezados y hojas existentes se reutilizan en el mismo árbol y nodo principal; modificar la
ruta puede añadir una nueva ubicación sin eliminar la anterior.

## Aplicar reglas a dispositivos que ya existen

El descubrimiento no es la única vía de entrada. Las reglas pueden ejecutarse contra dispositivos que ya se encuentran
en el sistema, seleccionados por ID, nombre de host o descripción:

```bash
php cli/apply_automation_rules.php --ids="12 13 14" --debug
php cli/apply_automation_rules.php --hostname="^edge-" --debug
php cli/apply_automation_rules.php --description="branch office"
```

El nombre de host y la descripción se cotejan como expresión regular si el valor es válido,
y siempre también como subcadena. Se requiere al menos uno de los tres selectores;
invocar el script sin selectores finaliza con un error. Cuando se combinan selectores,
se unen mediante `AND`. Utilice ID de dispositivos positivos separados por espacios para una selección
acotada; los ID separados por comas no son válidos. Los patrones aún pueden ser amplios,
y el mecanismo alternativo SQL `LIKE` trata `%` y `_` como comodines.

La consulta del selector no excluye automáticamente los dispositivos deshabilitados. La opción `--debug`
añade diagnósticos pero sigue efectuando creaciones. La ausencia de dispositivos coincidentes es una operación
nula exitosa, por lo que el código de salida por sí solo no acredita que se haya creado nada.

Para cada dispositivo coincidente, la ejecución realiza tres acciones en orden:

1. Intenta la creación para las plantillas de gráficos asociadas que no dispongan de gráfico en el
   dispositivo, sujeto a la idoneidad de la plantilla y a las comprobaciones de fuentes de datos.
2. Ejecuta las reglas de gráficos habilitadas para las consultas de datos asociadas utilizando su caché de índices
   almacenada. Este paso no vuelve a ejecutar el descubrimiento por sí mismo; actualice primero la consulta de datos
   si la caché no existe o está desactualizada.
3. Aplica las reglas de árbol de hojas de dispositivos habilitadas.

La creación de un nuevo gráfico puede invocar reglas de árbol de hojas de gráficos cuando la automatización global
del árbol está habilitada. La CLI no vuelve a aplicar esas reglas a gráficos que ya
encuentra creados. Por lo tanto, una regla de hoja de gráfico nueva o modificada no rellena retroactivamente
los gráficos existentes por el mero hecho de volver a ejecutar la CLI. Consulte el
[problema #211](https://github.com/kadupulhq/kadupul/issues/211). Compruebe su ubicación
por separado; no elimine ni recree gráficos históricos únicamente para desencadenar el enlace de creación.

Las ejecuciones sucesivas suprimen los gráficos no indexados existentes por dispositivo y plantilla de gráfico.
Los gráficos indexados se comprueban por dispositivo, consulta de datos, tipo de gráfico e índice. Esto
evita creaciones duplicadas en ejecuciones secuenciales; no es una garantía frente a concurrencia.
Compruebe la lista de gráficos y el árbol tras la ejecución, junto con los mensajes de registro de `AUTOM8` relativos a
gráficos omitidos, datos no válidos o errores de creación.

Existe un caso que se omite de forma suficientemente silenciosa como para desconcertar: una plantilla de gráfico con un campo
marcado como sustituible que carece de valor predeterminado no es apta para la automatización. La ejecución
registra que no se añadió porque un campo sustituible carece de valor predeterminado y continúa
adelante. Si una plantilla esperada nunca aparece, es lo primero que debe verificar. Consulte
[Plantillas](/es-419/concepts/templates/) para saber en qué consiste un campo sustituible.

## Trampas

**Deshabilitar una regla no deshace su trabajo.** No elimina los gráficos ni las entradas de
árbol ya generados. La eliminación de dispositivos cuenta con un comportamiento de limpieza independiente para
gráficos y fuentes de datos; examine las opciones de borrado antes de retirar un dispositivo.

**Un escaneo interrumpido parece un escaneo limpio.** El límite de ejecución finaliza el
descubrimiento en el punto en el que se encontrara. Los totales registrados corresponden al trabajo
concluido, y nada etiqueta el resultado como parcial. Compare el recuento de direcciones escaneadas
con la dimensión del rango.

**Las reglas se ejecutan contra la caché de la consulta de datos, no contra el dispositivo.** Una regla de gráfico
que no coincide con nada suele significar que la consulta de datos nunca se ejecutó, o se ejecutó sin hallar índices.
Inspeccione la tabla de índices descubiertos antes de reescribir la regla.

**El correo de notificación integra descubrimientos existentes y nuevos.** Un rango puede remitir un correo
al concluir, agrupando los hallazgos según si cada IP figuraba en
la instantánea previa al escaneo. No constituye una prueba de que cada dirección solicitada fuera efectivamente escaneada.

## Modos de fallo

| Síntoma | Causa habitual |
|---|---|
| El escaneo no halla nada en un rango poblado | Ping bloqueado, fallo SNMP, exclusiones o supresión de duplicados |
| El rango rehúsa escanearse, error en el registro | No tiene asociado un conjunto de opciones SNMP |
| Dispositivos encontrados pero ninguno creado | Interruptor de creación apagado o ninguna regla de dispositivo coincidió |
| Todo recibe la misma plantilla genérica | Orden de reglas, con una regla general antes de las específicas |
| Solo se escanean algunas direcciones | Límite de ejecución alcanzado, o rangos superpuestos rechazaron un lote de direcciones |
| Un dispositivo por enrutador en vez de uno por interfaz, o a la inversa | Configuración de supresión de duplicados por mismo sysName |
| La regla no coincide y el registro advierte sobre una columna | La regla filtra por un campo no devuelto por la consulta de datos |
| Plantilla de gráfico nunca creada por una regla | Falta de valor predeterminado obligatorio, salida no válida de fuente de datos o fallo de creación |
| Gráficos inesperados para interfaces adicionales | El filtro de índice de gráfico está vacío o es más amplio de lo previsto |
| Una nueva regla de árbol no ubica los gráficos existentes | La CLI no aplica retroactivamente las reglas de hojas de gráficos a gráficos ya existentes |
