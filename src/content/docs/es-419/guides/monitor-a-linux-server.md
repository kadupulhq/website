---
title: Monitorizar un servidor Linux
description: Gráficos de CPU, memoria, disco y carga en un host Linux mediante net-snmp, lo que snmpd debe exponer y cómo utilizar un script cuando SNMP no es suficiente.
banner:
  content: Kadupul está en fase pre-alpha. Valide estos procedimientos en una instalación de prueba aislada. Este es un borrador de traducción a la espera de ser revisado por un hablante fluido.
sidebar:
  order: 3
---

:::caution[Validar antes del uso]
El código fuente está disponible, pero no existe una versión compatible de Kadupul ni una ruta de migración. Pruebe estos procedimientos en una copia aislada con copias de seguridad antes de confiar en ellos. Consulte el [estado del proyecto](/es-419/project/status/).
:::

Un host Linux que ejecuta net-snmp le ofrece la mayor parte de las métricas sin necesidad de código adicional. El trabajo consiste en hacer que `snmpd` exponga los subárboles correctos y saber cuál de las dos MIB de disco superpuestas está observando.

## Lo que snmpd debe exponer

Kadupul sondea cuatro áreas. Otorgue a la identidad de monitorización los subárboles requeridos para los gráficos seleccionados; no todos los despliegues necesitan cada subárbol.

| Área | Subárbol | Proporciona |
|---|---|---|
| Sistema | `.1.3.6.1.2.1.1` | Descripción, tiempo de actividad, contacto, nombre, ubicación |
| Interfaces | `.1.3.6.1.2.1.2` y `.1.3.6.1.2.1.31` | Tráfico, errores, estado |
| Recursos del host | `.1.3.6.1.2.1.25` | Procesos, usuarios conectados, almacenamiento, procesadores |
| UCD / net-snmp | `.1.3.6.1.4.1.2021` | Medias de carga, memoria, tiempo de CPU, E/S de disco, particiones declaradas |

Varias distribuciones envían un `snmpd.conf` predeterminado que otorga una vista que solo cubre el subárbol del sistema. El dispositivo responderá, informará una descripción del sistema y no recolectará nada. Esta combinación es el error inicial más común en un host Linux y se parece exactamente a un problema de plantilla.

Compruebe las áreas requeridas desde el host del sondeador utilizando la misma identidad SNMP configurada en el dispositivo. Estos ejemplos usan una comunidad ilustrativa; reemplácela con el valor configurado. Los OID numéricos evitan requerir definiciones simbólicas locales de MIB.

```bash
snmpget  -v2c -c public server.example.net .1.3.6.1.2.1.1.1.0
snmpwalk -v2c -c public server.example.net .1.3.6.1.4.1.2021.10.1.3
snmpwalk -v2c -c public server.example.net .1.3.6.1.2.1.25.2.3.1.3
```

Si solo funciona el primer comando, investigue la respuesta exacta: una vista restringida, un módulo de agente no disponible, un contexto SNMP diferente o una tabla vacía pueden explicar el resultado. Verifique la configuración y el acceso del agente antes de modificar la plantilla de Kadupul.

## Añadir el dispositivo

El paquete suministrado `install/templates/NetSNMP_Device.xml.gz` contiene la plantilla de dispositivo Net-SNMP y sus dependencias. Impórtelo si falta la plantilla y luego selecciónela al añadir el dispositivo. Confirme los índices de consulta y cree explícitamente los gráficos deseados; seleccionar una plantilla de dispositivo no demuestra que la recolección funcione. Consulte [Importar plantillas](/es-419/guides/import-and-export-templates/) y [Su primer gráfico](/es-419/start/first-graph/).

## Lo que obtiene sin consulta de datos

Estas plantillas de datos de OID fijo se incluyen en el paquete. Un gráfico puede combinar varias de ellas; la disponibilidad depende del agente de destino. No requieren descubrimiento de índices.

| Gráfico | OID | Almacenado como |
|---|---|---|
| Media de carga 1 minuto | `.1.3.6.1.4.1.2021.10.1.3.1` | `GAUGE` |
| Media de carga 5 minutos | `.1.3.6.1.4.1.2021.10.1.3.2` | `GAUGE` |
| Media de carga 15 minutos | `.1.3.6.1.4.1.2021.10.1.3.3` | `GAUGE` |
| Memoria total | `.1.3.6.1.4.1.2021.4.5.0` | `GAUGE` |
| Memoria libre | `.1.3.6.1.4.1.2021.4.6.0` | `GAUGE` |
| Memoria en búfer | `.1.3.6.1.4.1.2021.4.14.0` | `GAUGE` |
| Memoria en caché | `.1.3.6.1.4.1.2021.4.15.0` | `GAUGE` |
| CPU usuario | `.1.3.6.1.4.1.2021.11.9.0` | `GAUGE` |
| CPU sistema | `.1.3.6.1.4.1.2021.11.10.0` | `GAUGE` |
| CPU inactiva | `.1.3.6.1.4.1.2021.11.11.0` | `GAUGE` |
| Interrupciones | `.1.3.6.1.4.1.2021.11.7.0` | `GAUGE` |
| Cambios de contexto | `.1.3.6.1.4.1.2021.11.8.0` | `GAUGE` |
| Procesos | `.1.3.6.1.2.1.25.1.6.0` | `GAUGE` |
| Usuarios conectados | `.1.3.6.1.2.1.25.1.5.0` | `GAUGE` |

Los objetos de memoria están en kilobytes. El gráfico de memoria empaquetado aplica una conversión para que el eje se muestre en bytes. Si crea su propio gráfico a partir de estos OID, dicha conversión corre por su cuenta.

Los objetos de CPU enumerados son porcentajes obsoletos, no contadores acumulativos de tiempo de CPU. No asuma que estos tres cubren solos cada estado del procesador. Net-SNMP los declara obsoletos en favor de contadores en bruto; los contadores en bruto requieren cálculos adecuados de tasa y porcentaje, no una simple inserción en una plantilla de tipo gauge. Consulte la [MIB UCD-SNMP](https://www.net-snmp.org/docs/mibs/ucdavis.html).

## Lo que requiere una consulta de datos

| Consulta | Descubre | Respaldada por |
|---|---|---|
| SNMP - Obtener puntos de montaje | Todo lo que el agente denomina almacenamiento | `hrStorageTable`, `.1.3.6.1.2.1.25.2.3.1` |
| Net-SNMP - Obtener particiones monitorizadas | Solo las particiones declaradas en `snmpd.conf` | `dskTable`, `.1.3.6.1.4.1.2021.9.1` |
| SNMP - Obtener información del procesador | Una entrada por CPU | Carga del procesador de recursos del host |
| Net-SNMP - Obtener E/S de dispositivos | Dispositivos de bloque | `diskIOTable`, `.1.3.6.1.4.1.2021.13.15.1.1` |
| SNMP - Estadísticas de interfaz | Interfaces de red | `IF-MIB` |

### Qué consulta de disco utilizar

No son dos vistas de los mismos datos.

La consulta de recursos del host recorre todo lo que el agente informa como almacenamiento. En la mayoría de los hosts Linux, esto agrupa la memoria física, swap, montajes tmpfs y los sistemas de archivos reales en una sola lista. Los tamaños se devuelven en unidades de asignación, y la consulta lee el tamaño de la unidad de asignación como un campo independiente para que el gráfico pueda multiplicar. Obtiene todo sin configurar nada, pero también una larga lista de entradas que no desea.

La consulta net-snmp lee la tabla de disco UCD, poblada por directivas `disk` o `includeAllDisks`. Elija particiones explícitas o un descubrimiento amplio; son políticas diferentes.

```
disk /      10%
disk /var   10%
```

Alternativamente, `includeAllDisks 10%` rellena los discos encontrados al iniciarse el agente. El valor del 10% configura un umbral de espacio libre; no es un filtro de selección y no configura alertas de Kadupul por sí mismo. Recargue o reinicie el agente y luego revise los índices. Una consulta vacía también puede reflejar problemas de acceso o disponibilidad del módulo. Consulte la [configuración de snmpd](https://www.net-snmp.org/docs/man/snmpd.conf.html).

Prefiera la consulta de recursos del host cuando desee exhaustividad y esté dispuesto a limpiar. Prefiera la consulta net-snmp con entradas explícitas de `disk` cuando desee una lista específica. `includeAllDisks` amplía esa lista; vuelva a verificar los índices después de reiniciar el agente.

### Interfaces

La consulta de datos de interfaz en un servidor se comporta exactamente como en un conmutador, con una advertencia: `ifDescr` en Linux es el nombre de la interfaz del kernel, que puede cambiar después de un reinicio o una actualización de controlador. Consulte [Monitorizar un conmutador](/es-419/guides/monitor-a-switch/) para conocer los detalles de elección de índice.

## Cuando SNMP no es suficiente

Algunas métricas no disponen de una MIB utilizable. La profundidad de una cola, un contador de aplicación o un número en un archivo requieren una entrada de script.

Dos hechos determinan cómo escribir el script.

**El script se ejecuta en la máquina que ejecuta el sondeador, no en el host monitorizado.** Llegar al destino es función de su script: SSH, una llamada HTTP, un agente o lo que ya tenga implementado.

**El sondeador lee la salida estándar y nada más.** El estado de salida no se evalúa.

El contrato de salida:

| Salida | Significado |
|---|---|
| `42` o `3.7` | Un solo valor para una sola fuente de datos |
| `U` | Ningún valor en este ciclo, registrado como desconocido |
| `in:1420 out:980` | Múltiples valores, uno por fuente de datos |

Para la forma de valores múltiples, los pares se separan con espacios simples y el nombre se separa del valor con dos puntos. El analizador cuenta los delimitadores frente a los espacios en blanco, por lo que los espacios internos adicionales pueden hacer fallar la validación. El sondeador PHP recorta los espacios en blanco finales. Emita el formato canónico con espacios simples y desvíe los diagnósticos fuera de stdout.

Los nombres internos de fuentes de datos RRD aceptados por el editor de plantillas coinciden con `[a-zA-Z0-9_]{1,19}`; los guiones no son aceptados allí. Las etiquetas de salida del script deben coincidir con los nombres de los campos de entrada de datos y asignarse a los elementos internos previstos. La línea de salida completa se almacena en una columna de 512 caracteres. Consulte [Scripts de recolección](/es-419/guides/write-a-data-collection-script/) para conocer el contrato auditado del sondeador PHP.

Devuelva `U` en lugar de `0` cuando no pueda medir algo. Cero es una medida y se representará como tal. Consulte [Fuentes de datos y RRA](/es-419/concepts/data-sources-and-rras/) para comprender por qué se mantienen separados.

### Servidor de scripts

Un script simple se ejecuta una vez por fuente de datos y por intervalo. Para un script escrito en PHP, la forma de servidor de scripts llama a una función en un proceso PHP independiente y persistente, lo que reduce la sobrecarga de inicio del intérprete.

### La trampa de la lista blanca

Cuando se utiliza un archivo de lista blanca de entrada de datos, el sondeador compara la cadena de comando de cada entrada de datos con la registrada. Una cadena de comando modificada sin regenerar la lista blanca deja de crear entradas en la caché del sondeador, y la fuente de datos se silencia sin error en el gráfico. El registro lo reporta, la interfaz de usuario no.

```bash
php cli/input_whitelist.php --audit
php cli/input_whitelist.php --update --id=42
```

Reemplace `42` con el identificador del método de entrada de datos auditado, no con un identificador de dispositivo. Una actualización sin `--id` acepta las cadenas de comandos actuales en todo el inventario de entradas. Audite los cambios previamente. Después de actualizar, verifique la habilitación de la fuente y las entradas efectivas en la caché del sondeador.

## Modos de fallo

| Síntoma | Causa común |
|---|---|
| Se lee la descripción del sistema, nada más se recolecta | Vista de `snmpd` restringida al subárbol del sistema |
| La consulta de particiones de net-snmp no encuentra índices | No hay líneas `disk` o `includeAllDisks` en `snmpd.conf` |
| Las particiones de recursos del host incluyen RAM y tmpfs | Comportamiento esperado; el agente las reporta como almacenamiento |
| El gráfico de memoria difiere por un factor de 1024 | Construcción sobre los OID en bruto sin conversión |
| El script devuelve un valor en línea de comandos, el sondeador registra desconocido | Discrepancia de salida/mapeo, errores de delimitador interno o nombre interno no válido |
| El script funciona manualmente pero falla a través del sondeador | Se ejecuta como el usuario del sondeador con su entorno y permisos |
