---
title: Monitorizar un host Windows
description: Gráficos de CPU, discos, interfaces y tiempo de actividad en Windows a través del servicio SNMP, qué objetos de recursos del host transportan los datos y qué hacer cuando SNMP no está disponible.
banner:
  content: Kadupul está en fase pre-alpha. Valide estos procedimientos en una instalación de prueba aislada. Este es un borrador de traducción a la espera de ser revisado por un hablante fluido.
sidebar:
  order: 14
---

:::caution[Validar antes del uso]
El código fuente está disponible, pero no existe una versión compatible de Kadupul ni una ruta de migración. Pruebe estos procedimientos en una copia aislada con copias de seguridad antes de confiar en ellos. Consulte el [estado del proyecto](/es/project/status/).
:::

Windows bajo SNMP proporciona interfaces, procesadores, almacenamiento y algunos contadores. El agente integrado de Microsoft no expone los objetos de carga, memoria y disco de las plantillas net-snmp UCD. La memoria aún se puede representar a partir de las filas de almacenamiento si el agente las expone. Los agentes de terceros pueden proporcionar otros objetos; inspeccione el agente real antes de elegir plantillas.

## Lo que proporciona el servicio SNMP

El servicio SNMP de Windows está obsoleto y es opcional. Para Windows 10 y 11, Microsoft documenta su instalación a través de características opcionales o características de Windows; un error de nombre de característica DISM más antiguo no demuestra por sí solo que no esté disponible. Compruebe las instrucciones correspondientes a su edición de Windows. Consulte la [guía de instalación de SNMP de Microsoft](https://learn.microsoft.com/en-us/troubleshoot/windows-client/networking/cannot-install-snmp-wmisnmpprovider).

Compruebe cuáles de estos subárboles expone su agente instalado:

| Área | Subárbol | Proporciona |
|---|---|---|
| Sistema | `.1.3.6.1.2.1.1` | Descripción, tiempo de actividad, contacto, nombre, ubicación |
| Interfaces | `.1.3.6.1.2.1.2` y `.1.3.6.1.2.1.31` | Tráfico, errores, estado |
| Recursos del host | `.1.3.6.1.2.1.25` | Procesadores, almacenamiento, recuento de procesos, usuarios conectados |
| LAN Manager | `.1.3.6.1.4.1.77` | Datos de servicios y recursos compartidos de Windows |

Las plantillas de Windows suministradas por Kadupul leen las primeras tres áreas. Nada en el conjunto empaquetado lee el subárbol LAN Manager.

Dos elementos de configuración en el host deciden si recibe datos: la cadena de comunidad y la lista de administradores de los que el agente acepta paquetes. Un host configurado para aceptar SNMP solo desde una única dirección de administrador responderá solo a ese administrador y descartará todo lo demás.

Compruebe cada área desde el host del sondeador antes de crear gráficos. Reemplace el host y la comunidad de ejemplo con sus valores configurados; `public` solo tiene fines ilustrativos.

```bash
snmpget  -v2c -c public win.example.net .1.3.6.1.2.1.1.1.0
snmpwalk -v2c -c public win.example.net .1.3.6.1.2.1.25.3.3.1.2
snmpwalk -v2c -c public win.example.net .1.3.6.1.2.1.25.2.3.1.3
```

El segundo recorrido lee la carga del procesador y el tercero lee la lista descriptiva de almacenamiento. Si el primer comando funciona y los otros dos no devuelven nada, verifique las restricciones de acceso, la compatibilidad del agente y el error SNMP devuelto.

## Añadir el dispositivo

Importe `install/templates/Windows_Device.xml.gz` si faltan las plantillas, de acuerdo con [Importar y exportar plantillas](/es/guides/import-and-export-templates/). Seleccione la plantilla de dispositivo Windows, verifique el descubrimiento de consultas y luego cree explícitamente los gráficos deseados. El paquete contiene tres consultas de datos y sus plantillas de gráficos asociadas.

| Consulta de datos | Respaldada por | Lee |
|---|---|---|
| SNMP - Estadísticas de interfaz | `resource/snmp_queries/interface.xml` | `IF-MIB`, recorrida directamente |
| SNMP - Obtener información del procesador | `resource/script_server/host_cpu.xml` | `hrProcessorLoad` a través de `scripts/ss_host_cpu.php` |
| SNMP - Obtener puntos de montaje | `resource/script_server/host_disk.xml` | `hrStorageTable` a través de `scripts/ss_host_disk.php` |

Las consultas de disco y procesador son consultas de servidor de scripts a pesar de sus nombres. Se ejecutan en un proceso de servidor de scripts PHP independiente y persistente y realizan llamadas SNMP con las credenciales del registro del dispositivo. La consulta de interfaz es una consulta SNMP pura. La consecuencia práctica es que un servidor de scripts PHP con errores detiene la recolección de disco y CPU en Windows mientras que los gráficos de interfaz continúan ejecutándose.

## Lo que obtiene sin consulta de datos

Dos plantillas de gráficos leen cada una un único OID fijo.

| Gráfico | OID | Almacenado como |
|---|---|---|
| MIB del host - Procesos | `.1.3.6.1.2.1.25.1.6.0` | `GAUGE` |
| MIB del host - Usuarios conectados | `.1.3.6.1.2.1.25.1.5.0` | `GAUGE` |

Otros dos no leen nada del dispositivo. Los gráficos de tiempo de actividad y tiempo de sondeo llaman a `scripts/ss_hstats.php` y devuelven una columna del propio registro del dispositivo de Kadupul: `snmp_sysUpTimeInstance` para el tiempo de actividad, la duración de sondeo registrada para el tiempo de sondeo. Leen mediciones almacenadas, no una respuesta SNMP fresca.

## Las tablas de recursos del host

### Procesadores

`hrProcessorLoad` bajo `.1.3.6.1.2.1.25.3.3.1.2` devuelve una entrada por procesador lógico que expone el agente. El recorrido proporciona los índices; no asuma que el recuento de filas coincide siempre con el recuento de subprocesos de hardware anunciado.

El valor ya es un porcentaje. La MIB lo define como el promedio durante el último minuto. Consulte la [definición de la MIB Host Resources](https://www.rfc-editor.org/rfc/rfc2790.html).

### Almacenamiento

La consulta de almacenamiento suministrada utiliza `hrStorageTable` bajo `.1.3.6.1.2.1.25.2.3.1`. Lee seis columnas.

| Columna | OID | Dirección |
|---|---|---|
| `hrStorageIndex` | `.1.3.6.1.2.1.25.2.3.1.1` | Índice |
| `hrStorageDescr` | `.1.3.6.1.2.1.25.2.3.1.3` | Índice y etiqueta visible |
| `hrStorageAllocationUnits` | `.1.3.6.1.2.1.25.2.3.1.4` | Entrada, el multiplicador |
| `hrStorageSize` | `.1.3.6.1.2.1.25.2.3.1.5` | Salida |
| `hrStorageUsed` | `.1.3.6.1.2.1.25.2.3.1.6` | Salida |
| `hrStorageAllocationFailures` | `.1.3.6.1.2.1.25.2.3.1.7` | Salida |

El tamaño y el espacio utilizado son recuentos de unidades de asignación, no bytes. El script multiplica cada valor por el tamaño de la unidad de asignación en caché para ese índice cuando ambos valores son válidos.

Dos cuestiones causan problemas con frecuencia en Windows.

**La tabla no es una lista de discos duros.** El agente informa todo lo que considera almacenamiento. Según el agente, la memoria física y la memoria virtual pueden aparecer junto a las unidades fijas. Etiquetas como `C:\`, `D:\`, `Physical Memory` y `Virtual Memory` son ejemplos, no filas garantizadas. Seleccione las filas que desea graficar.

**Los valores de almacenamiento grandes o no válidos requieren verificación.** La MIB define el tamaño y el uso como enteros de 32 bits no negativos (Integer32). Un agente que devuelva un valor negativo está fuera de ese rango. El script actual usa `(abs(value) + 2147483647) * allocation_units`, lo cual no representa una reinterpretación de 32 bits sin signo. Trate los valores afectados como poco fiables y vuelva a indexar después de corregir el descubrimiento. Consulte el [defecto de conversión de almacenamiento](https://github.com/kadupulhq/kadupul/issues/243).

## En qué se diferencia Windows de Linux

| Característica | Linux con net-snmp | Agente integrado de Windows / plantillas suministradas |
|---|---|---|
| Media de carga | `.1.3.6.1.4.1.2021.10.1.3` | Sin objetos UCD de media de carga |
| Memoria | `.1.3.6.1.4.1.2021.4` | Se puede graficar a partir de las filas `hrStorage` expuestas |
| CPU | Porcentajes UCD o `hrProcessorLoad` | Solo `hrProcessorLoad` |
| Lista de discos | `dskTable` declarada por usted o `hrStorage` | Solo `hrStorage`, sin filtrar |
| E/S de disco | `diskIOTable` | Nada suministrado lee esto |
| Nombres de interfaz | Nombres del kernel, cortos | Descripciones de adaptadores largas, a menudo duplicadas |

El agente integrado de Microsoft no proporciona el subárbol UCD `.1.3.6.1.4.1.2021`. Consulte [Solucionar problemas de datos faltantes](/es/guides/troubleshoot-missing-data/).

### Interfaces

La consulta de interfaz es idéntica a la que utiliza un conmutador. Su orden de preferencia de índice es `ifName`, luego `ifDescr`, luego `ifHwAddr`, luego `ifIndex`. Elige el primer campo presente y único en cada interfaz descubierta.

Windows es la plataforma donde esto falla con mayor frecuencia. Dos tarjetas de red idénticas pueden devolver el mismo `ifDescr`, y algunos agentes dejan `ifName` vacío. Cuando la consulta recurre a `ifIndex`, el historial de su interfaz queda vinculado a un número que Windows tiene la libertad de reasignar.

Consultez [Monitorizar un conmutador](/es/guides/monitor-a-switch/) y [Consultas de datos e índices](/es/concepts/data-queries-and-indexes/).

## Cuando SNMP no está disponible

Muchas instalaciones de Windows no tienen habilitado el servicio SNMP. El sustituto es una entrada de script.

Dos hechos determinan cómo escribir el script.

**El script se ejecuta en la máquina que ejecuta el sondeador.** Llegar al host de Windows es función de su script: WinRM, un agente, un extremo HTTP, un recurso compartido o cualquier mecanismo que utilice.

**Emita las mediciones en la salida estándar.** La ruta de comandos externos del sondeador PHP no utiliza el estado de salida como valor de medición. Emita un número, o `U` si no hay medición en este ciclo. No emita `0` cuando quiera indicar que la medición falló.

Si necesita un valor por interfaz, por disco o por servicio en lugar de un único número, el mismo mecanismo de script ofrece una forma indexada. `resource/script_queries/host_cpu.xml` es un ejemplo práctico que invoca un script PHP en lugar del servidor de scripts.

Consulte [Escribir un script de recolección de datos](/es/guides/write-a-data-collection-script/) para conocer el contrato de salida y las restricciones de nomenclatura.

## Modos de fallo

| Síntoma | Causa común |
|---|---|
| Se lee la descripción del sistema, nada más se recolecta | Compruebe la compatibilidad de objetos, las restricciones de acceso y el error SNMP específico |
| Sin respuesta alguna de un host en línea | Lista de administradores aceptados del agente o regla de firewall del host en UDP 161 |
| La lista de particiones contiene memoria | Comportamiento esperado; el agente reporta la memoria como almacenamiento |
| Un volumen grande aparece negativo o desconocido | Valores de agente no válidos o unidades de asignación obsoletas; verificar el error de conversión conocido |
| Disco y CPU se detienen, las interfaces continúan | Fallo del servidor de scripts; la consulta de interfaz no lo utiliza |
| Plantillas net-snmp asignadas, cada medición desconocida | El agente seleccionado no proporciona los objetos UCD requeridos para esas plantillas |
| El historial de la interfaz sigue al adaptador incorrecto tras un cambio | El índice recurrió a `ifIndex` porque los nombres estaban vacíos o duplicados |
| El tiempo de actividad repite un valor antiguo | Compruebe si el registro del dispositivo está obsoleto; el asistente no extrapola el uptime |
