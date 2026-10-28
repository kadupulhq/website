---
title: Supervisar un host de virtualización
description: Qué expone un hipervisor mediante SNMP, qué se incluye para ESXi y por qué el cómputo de invitados, CPU y memoria en una infraestructura virtualizada es más complejo de lo que parece.
banner:
  content: Kadupul está en fase pre-alfa. Valide estos procedimientos en una instalación de prueba aislada. Este es un borrador de traducción pendiente de revisión por un hablante fluido.
sidebar:
  order: 27
---

:::caution[Validar antes del uso]
El código fuente está disponible, pero no existe una versión compatible de Kadupul ni
una ruta de migración. Pruebe estos procedimientos en una copia aislada con copias de seguridad antes de
confiar en ellos. Consulte el [estado del proyecto](/es-419/project/status/).
:::

El paquete de ESXi incluido recopila mediciones del host e inventario de máquinas invitadas.
No proporciona mediciones de CPU, memoria ni contención por invitado. Verifique los
objetos expuestos por su versión de hipervisor antes de seleccionar los gráficos.

## Qué se incluye

Se incluye una única plantilla de dispositivo de hipervisor: **ESXi Device**. Al tratarse de un paquete de dispositivo,
`install/templates/ESXi_Device.xml.gz` contiene sus scripts y archivos de consulta de datos.
Siga la guía [Importar y exportar plantillas](/es-419/guides/import-and-export-templates/) y compruebe que
la importación haya concluido, incluido el despliegue de archivos. Seleccione la plantilla de dispositivo,
inspeccione el descubrimiento y cree explícitamente los gráficos deseados; la sola importación del paquete
o la mera asociación de una plantilla de dispositivo no los crea.

| Se incluye | Propósito |
|---|---|
| `resource/snmp_queries/esxi_cpu.xml` | Descubre procesadores y lee la carga por procesador |
| `resource/snmp_queries/esxi_hw.xml` | Descubre componentes de hardware y lee su estado |
| `resource/snmp_queries/interface.xml` | La consulta estándar de estadísticas de interfaces |
| `resource/script_server/host_disk.xml` | Particiones montadas, mediante la tabla de almacenamiento Host Resources |
| `scripts/ss_esxi_vhosts.php` | Empaquetado dentro de `install/templates/ESXi_Device.xml.gz`; cuenta invitados, invitados encendidos y estado de herramientas de invitado |
| `scripts/ss_multicpu_avg.php` | Calcula el promedio de carga de todos los procesadores en un solo valor |
| `scripts/ss_hstats.php` | Lee estadísticas de sondeo que Kadupul ya mantiene para el dispositivo |
| `scripts/ss_host_disk.php` | Respaldan la consulta de particiones |

No se incluye ningún paquete de dispositivo dedicado para Hyper-V, KVM/libvirt, Xen o Proxmox en esta
versión del código. Las plantillas genéricas de Linux/Windows pueden abarcar métricas de host compatibles con sus
agentes; la recopilación específica de hipervisores exige plantillas y recopiladores idóneos. Consulte
[Escribir un script de recopilación de datos](/es-419/guides/write-a-data-collection-script/).

## Activar primero el agente

Revise la configuración existente del agente y siga las instrucciones correspondientes a su versión de ESXi.
Las notas del paquete incluyen un restablecimiento de fábrica; no es un requisito de rutina y
borraría la configuración SNMP existente. Para una configuración basada en cadenas de comunidad, los siguientes
comandos definen los valores del agente; reemplace los ejemplos y preserve las comunidades requeridas
al establecer la lista.

```bash
esxcli system snmp get
esxcli system snmp set -c YOUR_STRING
esxcli system snmp set -p 161
esxcli system snmp set -L "City, State, Country"
esxcli system snmp set -C noc@example.com
esxcli system snmp set -e yes
```

El primer comando visualiza la configuración; el último activa el agente. La opción de comunidad
reemplaza la lista configurada. Compruebe los accesos requeridos en el cortafuegos desde el poller
y consulte la [referencia de comandos SNMP de ESXCLI](https://developer.broadcom.com/xapis/esxcli-command-reference/latest/namespace/esxcli_system.html).
Estos comandos configuran sondeo basado en comunidades; no configuran SNMPv3.
Verifique la conexión desde la máquina en la que se ejecuta el poller antes de añadir el dispositivo.

```bash
snmpget  -v2c -c YOUR_STRING esxi.example.net .1.3.6.1.2.1.1.1.0
snmpwalk -v2c -c YOUR_STRING esxi.example.net .1.3.6.1.2.1.25.3.3.1.2
snmpwalk -v2c -c YOUR_STRING esxi.example.net .1.3.6.1.4.1.6876.2.1.1.6
```

Si el primer comando tiene éxito y el tercero no devuelve nada, inspeccione el error SNMP,
la política de acceso y la compatibilidad del agente; un walk vacío por sí solo no identifica la causa. El
script de invitados empaquetado utiliza SNMPv1, por lo que una comprobación v2c satisfactoria no valida su
ruta de recopilación. Los recorridos de invitados vacíos devuelven ceros, no necesariamente huecos en los gráficos;
consulte el [error de resultado vacío](https://github.com/kadupulhq/kadupul/issues/245).

## Qué expone el host

| Área | Subárbol | Información aportada |
|---|---|---|
| Procesadores | `.1.3.6.1.2.1.25.3.3.1` | Carga de cada procesador expuesto por el agente |
| Componentes de hardware | `.1.3.6.1.2.1.25.3.2.1` | Índice, descripción y estado del componente |
| Almacenamiento | `.1.3.6.1.2.1.25.2.3.1` | Almacenes de datos y sistemas de archivos locales, según los reporte el agente |
| Interfaces | `.1.3.6.1.2.1.2` y `.1.3.6.1.2.1.31` | Tráfico, errores, estado |
| Inventario de invitados | `.1.3.6.1.4.1.6876` | Estado de energía y de herramientas por cada máquina invitada |

Los cuatro primeros corresponden a las tablas estándar de Host Resources e interfaces, las mismas que
devuelve un host Linux. Consulte [Supervisar un servidor Linux](/es-419/guides/monitor-a-linux-server/)
para conocer su comportamiento y qué tabla de discos priorizar.

El quinto es el subárbol del fabricante utilizado por el script de cómputo de invitados suministrado.

## Las plantillas de gráficos

| Gráfico | Origen | Qué lee |
|---|---|---|
| ESXi - CPU | Consulta de datos | Carga de un procesador descubierto |
| ESXi - MultiCPU Average | Script | Media de la carga de todos los procesadores |
| ESXi - Hardware | Consulta de datos | Estado de un componente descubierto |
| ESXi - VHosts | Script | Número de invitados y estado de herramientas |
| Host MIB - Processes | OID fija | Número de procesos en el host |
| Host MIB - Logged in Users | OID fija | Número de sesiones en el host |
| Device - Uptime | Script | Tiempo de actividad según lo registró Kadupul por última vez |
| Device - Polling Time | Script | Duración empleada por Kadupul en sondear este dispositivo |
| Gráficos de interfaces | Consulta de datos | Tráfico, errores, paquetes y estado por interfaz |

La consulta de procesadores lee la carga por cada entrada descubierta. No asuma que su número de filas
coincide con los subprocesos de hardware del host: el patrón de índices empaquetado solo acepta índices
de uno o dos dígitos y rechaza valores de 100 o superiores, incluso en hosts con pocas CPU.
Compare el descubrimiento con un walk directo; consulte el [error de índice de CPU](https://github.com/kadupulhq/kadupul/issues/246).
El script de promedio recorre de forma independiente las cargas de los procesadores y calcula la media de las filas devueltas.

Device - Uptime y Device - Polling Time leen el registro almacenado del dispositivo en Kadupul.
El asistente de tiempo de actividad devuelve el valor SNMP guardado sin extrapolar el tiempo transcurrido;
el tiempo de sondeo refleja la labor de recopilación de Kadupul. Un valor histórico guardado no garantiza
la accesibilidad actual. Si la recopilación cesa, estos asistentes no generan nuevas muestras.

## Los problemas de cómputo

Este es el ámbito donde la virtualización se distancia de un servidor físico, y nada
de esto se subsana mediante una plantilla de gráfico.

**Los invitados se desplazan.** Un invitado que migra a otro host desaparece del inventario del primer host
y figura en el del segundo. Las muestras tomadas en instantes desfasados pueden duplicar
temporalmente o ignorar a dicho invitado. Las fluctuaciones en el cómputo no acreditan por sí solas una migración: utilice
identificadores y eventos del hipervisor para explicarlas.

**Los recursos se comparten, por lo que la atribución por invitado es una estimación.** El host reporta
la carga física del procesador. No reporta qué invitado la generó. Dividir la CPU del host
entre el número de invitados produce una cifra aritméticamente correcta que no responde a ninguna pregunta con sentido.

**El sobrecompromiso (overcommit) hace que asignación y uso sean magnitudes distintas.** Las CPU virtuales asignadas
pueden exceder los núcleos físicos, y la memoria asignada puede superar la memoria física, deliberadamente. Un
gráfico de recursos asignados describe una provisión y no una demanda real medida.
Contr鋪telo con la capacidad física, los límites fijados y el uso efectivo.

**La contención no figura en estas tablas.** Las mediciones que revelan si un invitado
está sufriendo inanición —el tiempo que permaneció esperando un procesador físico y la memoria que el
host le reclamó— no se encuentran en lo que esta plantilla recopila. Un host al 60 por ciento de
CPU con invitados en severa contención resulta idéntico aquí a un host al 60 por ciento con
invitados operando sin trabas.

**Las mediciones de invitados y hosts responden a preguntas diferentes.** La utilización de un invitado por sí sola
quizá no aclare las demoras de programación del host. Correlacione las mediciones de la aplicación e invitados
con las métricas de contención del hipervisor en lugar de derivar atribuciones a partir de la carga del host.

### Qué hacer en su lugar

| Pregunta | Dónde reside la respuesta |
|---|---|
| ¿Está el host saturado? | Carga de procesador del host, directamente desde el host |
| ¿Está un invitado saturado? | Dentro del invitado, más una métrica de contención del hipervisor |
| ¿Cuántos invitados están corriendo? | Inventario de invitados del host, como recuento numérico |
| ¿Está la infraestructura sobrecargada? | No en estos gráficos. Exige datos de ubicación que el host no publica |
| ¿Se desplazó un invitado? | Identificadores de inventario y eventos de migración del hipervisor; el recuento aislado es insuficiente |

Supervise a los invitados como sus propios dispositivos para todo lo atinente al invitado, y supervise al host
para lo atinente al host. Evite construir gráficos por invitado a partir de cifras globales del host:
son indirectas, aparentan solidez y resultan erróneas de un modo que nadie podrá dilucidar más tarde.

## Trampas en el recuento de invitados suministrado

Conviene comprender el script de inventario de invitados antes de fiarse de sus resultados.

**Realiza el walk exclusivamente con SNMP versión 1 y la cadena de comunidad.** La versión está fijada en
el script y las credenciales v3 del dispositivo no se suministran. Un dispositivo configurado para
v3 puede recopilar datos por otras vías mientras falla la de invitados. La recopilación de invitados
puede completarse si dicho agente acepta de forma independiente la comunidad guardada sobre v1;
seleccionar v3 en el dispositivo no condiciona por sí solo el resultado. Los walks de invitados vacíos
se devuelven como ceros. Revise este desacople de protocolos sin degradar la directiva de seguridad
del agente para acomodar el script.

**El cómputo procede de la tabla de estado de energía.** La cifra reportada como total de invitados
corresponde al número de entradas devueltas por el recorrido del subárbol de estados de energía, no de un
objeto de inventario independiente. Un invitado listado por el host que carezca de entrada de estado de energía
no se contabiliza.

**El encendido se coteja sobre el texto de estado.** Tras recortar espacios y pasar a minúsculas,
únicamente `powered on` y `poweredon` incrementan el contador de ejecución. Otras variantes
no lo hacen; verifique la respuesta original del agente antes de interpretar un cero.

**La clasificación de herramientas de invitado presenta un defecto contrastado.** El texto literal `not installed`
se contabiliza como en ejecución debido a que la coincidencia comienza en la posición cero. Cadenas no reconocidas
también se computan por defecto como en ejecución. No considere este dato como prueba de herramientas saludables;
consulte el [error del estado de herramientas](https://github.com/kadupulhq/kadupul/issues/244).

**Ejecuta tres recorridos por llamada.** Lee la tabla de estados de energía dos veces, luego la tabla
de herramientas, de modo que sus propios recuentos no configuran una instantánea atómica. En un host
con numerosos invitados, calibre este coste de recopilación. Si el poller está ajustado, conviene alargar el intervalo antes
de incrementar los subprocesos. Consulte [Escalar el poller](/es-419/guides/scale-the-poller/).

El script suele emitir los cinco valores nominales, incluyendo ceros ante recorridos vacíos.
Un recorrido fallido puede emitir una muestra sintácticamente completa pero engañosa.
Ante salidas incompletas, el procesador PHP verifica los campos exigidos por la
fuente de datos asociada y retiene los grupos de marcas temporales incompletos; no los desecha
necesariamente de forma inmediata. Consulte [La caché del poller](/es-419/concepts/the-poller-cache/).

## Trampas en el resto

**El promedio de procesadores oculta asimetrías.** Un host con un núcleo al cien por cien y 63 ociosos
arroja un promedio bajo. Conserve gráficos validados por procesador donde esto resulte crítico. El asistente
de promedio también devuelve `load:0` ante un walk vacío, indistinguible de una CPU ociosa real;
correlaciónelo con el estado de recopilación y el fallo conocido de resultados vacíos.

**Los índices de procesador son posicionales.** Se descubren recorriendo la tabla
de procesadores. Si los índices del agente cambian, corrobore las correspondencias de identidad antes de confiar en la continuidad.
La restricción a uno o dos dígitos es un defecto de descubrimiento aparte.

**Las entradas de almacenamiento son lo que el agente catalogue como almacenamiento.** Espere datastores mezclados con
elementos no deseados, en unidades de asignación que exigen multiplicación. Es el
comportamiento estándar de Host Resources, no una singularidad de ESXi. Verifique las unidades de asignación en caché antes
de interpretar los bytes; el script compartido padece un [defecto de conversión conocido](https://github.com/kadupulhq/kadupul/issues/243)
ante muestras negativas inválidas o multiplicadores ausentes.

**Los nombres de interfaz en un hipervisor son estables hasta que dejan de serlo.** Una actualización de controladores o una
reconfiguración puede renumerarlos. Consulte [Supervisar un conmutador](/es-419/guides/monitor-a-switch/) para
entender cómo se escoge el índice y por qué es relevante.

**Los scripts se ejecutan en el host del poller.** Conectan directamente con el hipervisor utilizando el
ID de dispositivo suministrado por el comando en caché. Los asistentes de invitados y promedio de CPU consultan la
fila actual del dispositivo en cada invocación; cambiar la comunidad no requiere reconstruir
dichos argumentos de comando. Otros colectores pueden incrustar credenciales en sus elementos de trabajo.
Consulte [La caché del poller](/es-419/concepts/the-poller-cache/).

## Modos de fallo

| Síntoma | Causa habitual |
|---|---|
| Se recopila todo excepto el cómputo de invitados | El dispositivo está configurado con SNMPv3 y el script opera con v1 |
| Recuento de invitados correcto, pero encendidos marca cero | Compruebe el texto exacto de energía y si el segundo walk se completó |
| El total de invitados cae a cero y se recupera | Revise walks fallidos o vacíos; el asistente puede emitir una línea íntegra de ceros |
| Los gráficos de CPU se interrumpen tras un cambio de hardware | Verifique índices alterados y la limitación a índices de uno o dos dígitos |
| CPU del host plana y baja mientras los invitados van lentos | Compruebe fallos de captura y contención; un promedio vacío se reporta como cero |
| Los gráficos de datastores incluyen particiones no solicitadas | El agente las cataloga como almacenamiento |
| El gráfico de tiempo de actividad parece anómalo tras una caída del poller | Reporta el último valor registrado por Kadupul, no una lectura viva |
| El total de invitados fluctúa bruscamente durante mantenimientos | Los invitados en migración se computan brevemente por duplicado o se omiten |
