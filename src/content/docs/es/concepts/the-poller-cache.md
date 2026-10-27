---
title: La caché del poller
description: Por qué el recolector lee una lista de trabajo precalculada en lugar de su configuración, y por qué ese es el motivo habitual de que un cambio parezca no hacer nada.
banner:
  content: Kadupul está en fase pre-alfa. Valide estos procedimientos en una instalación de prueba aislada.
sidebar:
  order: 6
---

[Arquitectura](/es/concepts/architecture/) presenta la caché del poller en una sola frase:
la lista de trabajo se precalcula y el recolector lee esa lista en lugar de evaluar
su configuración en cada ciclo. Esta página aborda lo que esa decisión implica
realmente en la práctica.

## Qué tendría que hacer el recolector de otro modo

Determinar qué recopilar para un único valor requiere resolver una cadena completa
de dependencias. La fuente de datos apunta a un dispositivo y a una plantilla de datos.
La plantilla apunta a una entrada de datos. La entrada de datos contiene campos,
algunos de ellos anulados por dispositivo y otros heredados de la plantilla. Si la
fuente de datos proviene de una consulta de datos, el índice actual debe resolverse
mediante la caché de consultas. Luego, las credenciales SNMP deben obtenerse del
dispositivo, a menos que un campo las anule.

Eso implica varias operaciones de combinación (joins) para un solo valor. Una
instalación modesta maneja decenas de miles de valores y ejecuta un ciclo cada cinco
minutos. Realizar esta resolución en el momento de la recolección significaría que
la base de datos, y no la red, decidiría cuántos dispositivos puede supervisar.

Por lo tanto, la resolución ocurre una sola vez, cuando algo cambia, y el resultado
se escribe de forma plana.

## Qué almacena la caché

La caché precalcula las instrucciones de recolección. Reduce la resolución repetida
de la configuración, pero no elimina las combinaciones ni la lectura del estado en
vivo de los dispositivos.

| Contenido de la fila | Motivo de su presencia |
|---|---|
| Qué recolector es el propietario | Cada recolector selecciona únicamente sus propias filas |
| La acción: SNMP, script o servidor de scripts | Decide qué ruta de código se ejecuta |
| Nombre de host, versión de SNMP, puerto, tiempo de espera, comunidad o credenciales | Campos de conexión almacenados en caché; también se lee el estado en vivo del host |
| El OID o la línea de comandos completa del script | Ya sustituidos, listos para su ejecución |
| La ruta al archivo RRD | Ya resuelta |
| El nombre del campo dentro de ese archivo y cuántos campos componen una lectura completa | Permite contrastar y validar la salida |
| El paso (step) y una cuenta regresiva para la próxima ejecución | Consulte [Tiempo e intervalos](/es/concepts/time-and-intervals/) |

`cmd.php` combina `poller_item` con `host`, filtra los dispositivos deshabilitados
y utiliza los campos en vivo del dispositivo para las comprobaciones de disponibilidad
y reindexación. Los OID, comandos y metadatos RRD en caché aún deben coincidir con la
fuente de datos prevista.

Las credenciales almacenadas en caché son una instantánea, pero guardar credenciales
modificadas mediante la API del dispositivo normalmente actualiza la caché afectada.
Las ediciones directas en la base de datos omiten esa ruta y pueden dejar una instantánea
obsoleta. Verifique la caché real en lugar de asumir que cada cambio de credenciales
requiere una reconstrucción manual.

La ruta RRD también es una instantánea. Mover archivos o cambiar su ubicación deja
cada fila almacenada en caché apuntando a la ubicación antigua.

## Qué la escribe

La caché se mantiene de forma incremental mediante las operaciones que detectan un
cambio en el sistema.

| Operación | Filas reescritas |
|---|---|
| Guardar un dispositivo | Los cambios en los campos de conexión, en el recolector o en el estado de deshabilitación activan un pushout; los campos de recolección sin cambios pueden usar la ruta de guardado rápido |
| Guardar una fuente de datos | Las filas de esa fuente de datos |
| Crear gráficos y fuentes de datos a partir de una plantilla | Las filas recién creadas |
| La ejecución de una consulta de datos que movió o resolvió un índice | Únicamente las fuentes de datos que cambiaron |
| Reconstrucción mediante la CLI | Dispositivos habilitados procesados por los workers; el defecto actual en el reenvío de `--host-id` impide depender del aislamiento por dispositivo |

La reescritura no es una inserción a ciegas. Las filas de las fuentes de datos que se
están reconstruyendo se marcan primero como ausentes, luego se escribe el nuevo conjunto
y finalmente se elimina todo lo que aún figure marcado como ausente. Así es como se
eliminan las filas de un campo que ya no existe. La limpieza del búfer se limita por
los identificadores del recolector y de la fuente de datos. Esto protege a las fuentes
no relacionadas en la ruta dirigida habitual; no constituye una garantía ante
reconstrucciones simultáneas o escrituras fallidas en la base de datos. Verifique las
filas resultantes tras una reconstrucción, incluido un dispositivo cercano no afectado
al examinar el alcance.

## Filas que nunca se escriben

Algunas configuraciones no generan ninguna fila nueva en la caché. Compruebe tanto los
registros como el gráfico.

El generador omite los dispositivos deshabilitados, pero la acción masiva **Deshabilitar**
conserva las filas existentes de la caché y el proceso de recolección filtra y excluye
el dispositivo. Una reconstrucción mientras el dispositivo está deshabilitado puede
eliminar filas. La acción masiva **Habilitar** reutiliza una caché poblada o la inicializa
cuando está vacía; por lo general, no se requiere un guardado adicional del dispositivo.
Una caché existente parcial u obsoleta aún requiere investigación.

Un elemento SNMP cuyo dispositivo carece de una configuración SNMP utilizable no genera
ninguna fila. La falta de versión, una versión fuera de rango o una comunidad vacía en
la versión 1 o 2 hacen que la fila se omita en lugar de escribirse como una entrada que
fallaría en cada ciclo.

Cuando se configura una lista blanca de entrada, la falta de un archivo o una entrada
rechazada impide la creación de nuevas filas para esa entrada. Una reconstrucción
confirmada limpia igualmente sus filas obsoletas. Sin una configuración de `input_whitelist`,
esta comprobación permite las entradas; no es una protección habilitada de forma permanente.
Revise el comando rechazado y la directiva configurada antes de modificar la lista blanca.

La interfaz aún puede mostrar una fuente de datos cuya caché esté vacía. Su gráfico
puede retener el historial antiguo o mostrar lagunas; una línea plana en cero no es un
indicador confiable. Las credenciales faltantes y las entradas rechazadas son condiciones
de configuración que deben resolverse.

## Por qué un cambio puede parecer que no hace nada

Tres mecanismos diferentes producen el mismo síntoma.

**La fila no se reconstruyó.** Modificó algo que la interfaz no considera que afecte
a la recolección, o lo modificó fuera de la interfaz. La caché sigue conservando la
respuesta antigua. Una reconstrucción puede actualizar los campos almacenados en caché
tras verificar la configuración prevista.

**La fila nunca se construyó.** Se explicó anteriormente. Una reconstrucción también
resuelve esto, pero solo después de subsanar la causa subyacente; los diagnósticos suelen
aparecer en los registros y no en el gráfico.

**El valor se recolecta y luego se descarta.** Las salidas con múltiples valores se
asocian mediante las definiciones de campos de la plantilla, y los campos no referenciados
pueden omitirse durante el análisis. Compruebe los nombres de campo esperados, los mapeos
y las asociaciones a gráficos; esta regla no descarta indistintamente todas las muestras
numéricas sin referencia a gráficos. Una reconstrucción de la caché no puede corregir
un contrato de salida incorrecto.

## El instrumento contundente

Para un solo dispositivo, utilice **Repoblar la caché del poller** en su página clásica
de dispositivo. Dicha acción invoca la ruta `push_out_host()` delimitada al dispositivo.
Compruebe posteriormente las filas resultantes y los diagnósticos.

El script principal actual `rebuild_poller_cache.php` acepta `--host-id`, pero no
reenvía dicho filtro al comando del worker. Por lo tanto, una supuesta reconstrucción
por CLI de un solo dispositivo puede reconstruir otros dispositivos habilitados. No
confíe en esa opción para el aislamiento hasta que se corrija este defecto de la aplicación.

Una reconstrucción completa mediante la CLI está disponible desde la raíz de la
aplicación, ejecutada con el usuario del poller:

```bash
php cli/rebuild_poller_cache.php
```

Procesa dispositivos habilitados; no es una reparación para todas las fuentes sin host
o deshabilitadas. Esta operación escribe en las tablas de recolección y puede llevar tiempo.
Evite reconstrucciones superpuestas y no interrumpa el proceso. La opción `--force` de
la CLI anula la protección de registro de procesos, por lo que no es una opción de
reparación rutinaria.

La reconstrucción actualiza el estado derivado; no repara la accesibilidad de los
dispositivos, no mueve archivos RRD, no corrige comandos de entrada rechazados ni
recupera el historial perdido. Inspeccione la caché resultante, los registros y la
recolección posterior antes de dar por finalizada la reparación.

Kadupul registra cuándo cambió la caché por última vez, lo que permite que otras partes
del sistema detecten la necesidad de volver a leerla.

## Múltiples recolectores

Cuando hay más de un recolector, cada fila pertenece exactamente a uno de ellos, y las
filas se envían tanto a la base de datos propia de ese recolector como a la central.

Si un recolector remoto no está accesible cuando guarda un cambio, el cambio se aplica
de forma centralizada y no remota, y Kadupul así lo indica: solicita una sincronización
completa en cuanto el recolector vuelve a estar disponible. Hasta esa sincronización, el
recolector remoto ejecuta una lista de trabajo más antigua que la que muestra la interfaz.
Una discrepancia específica de un recolector es motivo para inspeccionar el estado de
replicación, la conectividad y la caché local de cada recolector.

El orden en un ciclo completo, incluido el punto en que se lee la caché y el momento
en que se procesan los comandos de reindexación, se detalla en
[Ciclo de vida del poller](/es/reference/poller-lifecycle/). Para el escalado de
recolectores, consulte [Escalar el poller](/es/guides/scale-the-poller/).
