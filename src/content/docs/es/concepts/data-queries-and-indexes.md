---
title: Consultas de datos e índices
description: Cómo un recorrido de un dispositivo se convierte en muchas fuentes de datos, qué es en realidad un índice y qué sucede cuando un dispositivo se renumera a sí mismo.
banner:
  content: Kadupul está en fase prealfa. Valide estos procedimientos en una instalación de prueba aislada. Traducción en borrador, pendiente de revisión por una persona con dominio del idioma.
sidebar:
  order: 5
---

Una fuente de datos simple requiere que sepa de antemano qué va a medir antes de
configurarla. Eso funciona para la carga media del sistema. No funciona para puertos de
conmutadores, discos, sensores de temperatura o máquinas virtuales, porque la lista cambia
y usted no tiene el control sobre ella.

Una consulta de datos descubre los objetos disponibles. La creación de gráficos —ya sea
manual o mediante automatización configurada— selecciona qué objetos reciben fuentes de datos;
la ejecución de una consulta por sí sola no genera todos los gráficos posibles.

## Qué contiene una definición de consulta

Una consulta de datos es una descripción en XML con tres partes: dónde reside la lista de
elementos, qué debe leerse sobre cada uno de ellos y cómo decidir qué elemento corresponde a cuál.

La consulta de interfaz incluida con Kadupul es el ejemplo práctico. Recorre
`.1.3.6.1.2.1.2.2.1.1` para enumerar interfaces y luego lee una serie de campos con nombre
en cada posición obtenida. Cada campo declara una dirección.

| Dirección | Significado | Ejemplos en interfaces |
|---|---|---|
| `input` | Leído para identificación y asignación de nombre. No se recopila con el tiempo | `ifName`, `ifDescr`, `ifAlias`, `ifType`, `ifSpeed` |
| `output` | Un valor que merece la pena recopilar en cada ciclo | `ifHCInOctets`, `ifHCOutOctets` |
| `input-output` | Ambos | `ifOperStatus`, `ifAdminStatus` |

Los campos también declaran cómo debe leerse el valor. La mayoría lo toma tal cual; algunos
aplican una expresión regular para extraer un número de una enumeración SNMP y otros solicitan
que el valor se decodifique como texto en lugar de como bytes sin procesar.

Al ejecutar la consulta se almacena una fila por índice y por campo: el dispositivo, la consulta,
el nombre del campo, el valor y la posición de origen del valor. Esa tabla es la respuesta a
«¿qué tiene este dispositivo?», almacenada en caché hasta la siguiente ejecución. La selección
de gráficos utiliza esa caché, pero las herramientas de creación de gráficos también pueden asociar
o volver a ejecutar una consulta. Inspeccione los resultados del descubrimiento antes de añadir gráficos.

## El índice es un problema de identidad

La posición en una tabla SNMP no es un nombre. Es un número de ranura asignado por el agente, y
los agentes reordenan las ranuras tras un reinicio, la reinserción de una tarjeta, una actualización
de firmware o un cambio de configuración que elimine una interfaz. Si una fuente de datos solo recuerda
la «ranura 3», el día en que la ranura 3 pase a ser un puerto distinto, tres meses de historial
se vincularán silenciosamente al objeto equivocado.

Kadupul almacena el tipo de índice y el valor identificativo, junto con el índice SNMP resuelto
actualmente. La reindexación recurre a esa identidad para buscar la posición actual en la tabla;
los tipos de índice modificados manualmente reciben un tratamiento independiente.

En cada ejecución de la consulta se busca la ranura actual correspondiente a ese valor de campo.

| Resultado | Qué sucede |
|---|---|
| Misma ranura | Nada que hacer |
| Ranura diferente | La fuente de datos se reasigna a la nueva ranura y sus gráficos la siguen |
| El valor ya no está presente | El tratamiento de huérfanos depende de la consulta y la ruta de código; verifique el indicador resultante y los OID de sondeo en lugar de asumir que la recolección se detuvo |

Por lo general, la reindexación conserva la fuente de datos y su historial previo. La opción
`index_transient` trata las identidades ausentes como previstas y omite el marcado habitual
de huérfanos. `index_orphan_removal` elimina las entradas de sondeo afectadas y la salida de
Boost; no elimina la fuente de datos ni el propio archivo RRD.

El tratamiento actual de huérfanos presenta un defecto: cuando una identidad desaparece y ninguna
otra fuente cambia de índice, la rama sin cambios puede limpiar de nuevo el indicador de huérfano,
dejando el índice anterior y los OID de sondeo en su lugar. No confíe en el enmascaramiento
automático de huérfanos para impedir la recolección desde un índice de puerto reutilizado. Verifique
la identidad almacenada frente a los datos de descubrimiento y deshabilite la fuente de datos afectada
hasta resolver el problema.

## Elegir el campo como clave

No cualquier campo sirve como clave práctica. La definición de la consulta ofrece una lista de
preferencias ordenada; Kadupul la recorre y selecciona el primer candidato que supere una serie
de comprobaciones.

| Comprobación | Por qué existe |
|---|---|
| El campo es `input` o `input-output` | Los campos identificativos deben estar disponibles en el descubrimiento |
| No hay dos índices que compartan el mismo valor | Una clave duplicada no puede identificar una única fila |
| El número de valores distintos coincide con el número de índices | Descarta una cobertura incompleta de candidatos |

Estas comprobaciones contemplan excepciones: un único candidato declarado se devuelve directamente
y el OID del índice sin procesar se acepta por separado. `index_type=nonunique` omite el rechazo
de duplicados, pero no prescinde de la comprobación del número de valores distintos. Inspeccione
el campo seleccionado y los valores en caché; la etiqueta de tipo en el XML no constituye por sí sola
prueba de validación.

La consulta de interfaz prefiere `ifName`, luego `ifDescr`, después la dirección física de hardware
y finalmente el índice sin procesar. Ese orden es deliberado. `ifName` es corto y estable en la
mayoría de plataformas. `ifDescr` es estable pero en ocasiones incluye el número de ranura en el
texto, lo que desvirtúa el propósito. El índice sin procesar figura al final porque usarlo como clave
es apenas mejor que no usar clave alguna.

Aquí está el aspecto que toma por sorpresa a muchos usuarios. La elección se realiza por dispositivo
y por ejecución, a partir de los datos actuales de ese dispositivo. La falta de valores en caché o
nombres duplicados pueden hacer que `ifName` no sea idóneo y forzar la caída hacia `ifDescr`. Un
campo en blanco no demuestra por sí solo qué comprobación falló; inspeccione las filas reales de
descubrimiento. Dos conmutadores idénticos pueden terminar asociados a campos distintos, y un mismo
dispositivo puede variar de campo entre ejecuciones. Kadupul registra una advertencia cuando el campo
elegido cambia, pues ese es el momento en que se vuelven posibles los fallos de reasignación.

Por lo común, el campo elegido también da nombre a los gráficos mediante un formato de título que
lo referencia. Si los títulos de sus gráficos varían de patrón en su parque de equipos, el campo
de ordenación es el punto a examinar.

## Detectar que se necesita una reindexación

Volver a ejecutar una consulta de datos frente a cada dispositivo en cada ciclo resultaría costoso
y en gran parte inútil, ya que la mayoría de dispositivos no renumeran nada durante años. En su lugar,
cada par de dispositivo y consulta incorpora un método de reindexación, que consiste en una aserción
económica comprobada durante la recolección habitual. Cuando la aserción falla, se encola una reindexación.

| Método | Qué comprueba | Límites y coste |
|---|---|---|
| Ninguno | Sin aserción automática | Las nuevas ejecuciones de consultas deben originarse en una acción manual o explícita |
| Tiempo de actividad | El tiempo de actividad no ha retrocedido | Requiere SNMP funcional; no detecta cambios que no conlleven un retroceso de tiempo |
| Recuento de índices | El recuento actual coincide con los índices en caché | Un OID de recuento puede ser económico; sin él, la implementación cuenta los resultados de un recorrido o script. Cambios manteniendo el mismo recuento pueden pasar inadvertidos |
| Verificar todo | Los valores de clave conocidos coinciden aún en sus índices en caché | El trabajo crece con el conjunto en caché; no garantiza la detección de índices nuevos ni de cambios semánticos que preserven esos valores |

«Verificar todo» comprueba aserciones durante el sondeo; no ejecuta de nuevo y de forma incondicional
toda la consulta de descubrimiento en cada ciclo. Mida su coste en dispositivos representativos antes
de una implantación general. El tiempo de actividad es un valor predeterminado frecuente, pero no
ofrece aserción alguna si SNMP está inactivo. La definición de la consulta puede proporcionar su
propia fuente de tiempo de actividad o de recuento.

## La reindexación es asíncrona

Una aserción fallida no ejecuta la reindexación de inmediato. Escribe una instrucción, y una pasada
independiente posterior al ciclo de recolección la toma para ejecutar la consulta de nuevo. Conviene
tener presentes las consecuencias prácticas.

El ciclo que detecta el cambio aún puede emplear la caché antigua, de modo que un valor puede asentarse
en la serie equivocada antes de que finalice la reindexación. La supresión de picos vinculada al tiempo
de actividad sustituye la salida de valor único por desconocido cuando su indicador está activado; no
ofrece una garantía universal para todas las salidas multivalor ni para cada cambio de índice.

Una reindexación no se ejecutará en un dispositivo caído o deshabilitado. Un dispositivo que se haya
renumerado mientras era inaccesible todavía requiere una aserción o una reejecución explícita cuando
vuelva a estar disponible. El primer sondeo correcto no demuestra por sí solo que la reasignación se
haya completado. `--force` no invalida las comprobaciones de estado caído o deshabilitado.

Una vez que la consulta vuelve a ejecutarse, las fuentes de datos desplazadas ven reescritas sus
entradas en la caché del poller, lo cual redirige verdaderamente la recolección. Dicho mecanismo
es [La caché del poller](/es/concepts/the-poller-cache/), y la reejecución de consultas es de los
pocos procesos que la mantienen de forma automática.

Para la operativa práctica —añadir una consulta a un dispositivo e interpretar los resultados—,
consulte [Monitorizar un conmutador](/es/guides/monitor-a-switch/).
