---
title: Monitorizar un conmutador
description: Descubra los puertos de un conmutador, represente en gráficos los contadores correctos y elija un índice para que el historial de un puerto permanezca asociado a dicho puerto tras sustituir una tarjeta.
banner:
  content: Kadupul está en fase pre-alpha. Valide estos procedimientos en una instalación de prueba aislada. Este es un borrador de traducción a la espera de ser revisado por un hablante fluido.
sidebar:
  order: 2
---

:::caution[Validar antes del uso]
El código fuente está disponible, pero no existe una versión compatible de Kadupul ni una ruta de migración. Pruebe estos procedimientos en una copia aislada con copias de seguridad antes de confiar en ellos. Consulte el [estado del proyecto](/es/project/status/).
:::

Un conmutador es el caso de uso clásico para las consultas de datos. No sabe de antemano cuántos puertos hay presentes, el recuento puede variar y cada puerto necesita su propia fuente de datos. Consulte [Plantillas](/es/concepts/templates/) para saber cómo funcionan las consultas de datos; esta página se ocupa de la configuración correcta.

## Antes de comenzar

Asegúrese de que el dispositivo responda desde el recolector asignado, preferiblemente bajo el usuario del sondeador. Utilice sus credenciales configuradas de solo lectura. Los OID numéricos evitan la dependencia de nombres MIB instalados localmente.

```bash
snmpwalk -v2c -c 'your-read-only-community' switch.example.net .1.3.6.1.2.1.31.1.1.1.1
```

Utilice SNMP v2c o v3. Los contadores de interfaz de 64 bits son objetos SMIv2 y no se pueden consultar a través de v1. Un dispositivo v1 solo le proporcionará los contadores de 32 bits y nada más.

## Elegir una plantilla de dispositivo

La plantilla de dispositivo determina qué consultas de datos y plantillas de gráficos se ofrecen al añadir el dispositivo. Kadupul hereda el conjunto de plantillas suministrado por Cacti, que incluye una plantilla de dispositivo SNMP genérica y un conjunto de plantillas específicas de proveedores.

El descubrimiento de puertos proviene del mismo origen independientemente de su elección: la consulta de datos de interfaz definida en `resource/snmp_queries/interface.xml`. Si ninguna plantilla se adapta a su hardware, elija la plantilla genérica y asocie a ella la consulta de interfaz.

## Ejecutar la consulta de datos

La consulta recorre `ifIndex` para encontrar puertos y lee `ifNumber` para saber cuántos esperar. Luego recopila un conjunto de campos por puerto.

| Campo | OID | Utilizado para |
|---|---|---|
| `ifIndex` | `.1.3.6.1.2.1.2.2.1.1` | La posición en la tabla SNMP |
| `ifName` | `.1.3.6.1.2.1.31.1.1.1.1` | Nombre corto del puerto, `Gi1/0/3` |
| `ifDescr` | `.1.3.6.1.2.1.2.2.1.2` | Descripción más larga |
| `ifAlias` | `.1.3.6.1.2.1.31.1.1.1.18` | La descripción de la interfaz que configure |
| `ifHwAddr` | `.1.3.6.1.2.1.2.2.1.6` | Dirección MAC del puerto |
| `ifSpeed` | `.1.3.6.1.2.1.2.2.1.5` | Velocidad en bits/seg, 32 bits |
| `ifHighSpeed` | `.1.3.6.1.2.1.31.1.1.1.15` | Velocidad en Mbits/seg |
| `ifOperStatus` | `.1.3.6.1.2.1.2.2.1.8` | Up o Down |
| `ifInOctets` / `ifOutOctets` | `.1.3.6.1.2.1.2.2.1.10` / `.16` | Contadores de bytes de 32 bits |
| `ifHCInOctets` / `ifHCOutOctets` | `.1.3.6.1.2.1.31.1.1.1.6` / `.10` | Contadores de bytes de 64 bits |

Ejecute la consulta una vez en el dispositivo. Devolverá una tabla de puertos descubiertos. Lea esta tabla antes de crear gráficos, ya que sirve de base para cada decisión posterior.

## Elegir los contadores de 64 bits

La consulta de interfaz ofrece varias plantillas de gráficos de tráfico. Las principales:

| Plantilla de gráfico | Lee |
|---|---|
| In/Out Bits | `ifInOctets`, `ifOutOctets` |
| In/Out Bits (64-bit) | `ifHCInOctets`, `ifHCOutOctets` |
| In/Out Bits (64-bit, 95th) | Lo mismo, con una línea de percentil 95 |
| In/Out Bits (64-bit, BW) | Lo mismo, en relación con la velocidad de la interfaz |
| Status (Up/Down) | `ifOperStatus` |
| In/Out (Errors/Discards) | `ifInErrors`, `ifInDiscards`, `ifOutDiscards`, `ifOutErrors` |

Utilice una plantilla de 64 bits a menos que tenga una razón específica para no hacerlo. Un contador de octetos de 32 bits alcanza un límite en 4294967295. Un puerto gigabit bajo carga completa lo llena en unos 34 segundos. Con un paso de 300 segundos, el sondeador no puede distinguir un desbordamiento de siete desbordamientos, y `COUNTER` solo corrige un desbordamiento entre dos muestras. El gráfico no se ve roto de forma evidente; simplemente muestra valores perpetuamente demasiado bajos.

Compruebe que los contadores se rellenen realmente antes de crear cientos de gráficos.

```bash
snmpwalk -v2c -c 'your-read-only-community' switch.example.net .1.3.6.1.2.1.31.1.1.1.6
```

Un recorrido vacío o fallido requiere investigación: verifique el error reportado, la vista de acceso y la compatibilidad del agente.

## Comprobar el máximo almacenado tras cambios de velocidad

Cuando la fuente de datos utiliza un máximo basado en la velocidad de la consulta, la creación obtiene la velocidad a partir de los datos de descubrimiento almacenados en caché. Se prefiere `ifHighSpeed`, se utiliza `ifSpeed` si falta el primero y se aplica un valor predeterminado configurado si ambos son cero.

Ese valor se escribe en el archivo. Un puerto descubierto a 100 Mbps y luego negociado más alto puede retener un límite inferior a su tráfico real, y RRDtool registrará las tasas superiores a ese límite como desconocidas. Compare la velocidad en caché, la definición de la fuente de datos y el archivo real con `rrdtool info`.

## La decisión del índice

Aquí es donde se pierde el historial si se equivoca.

Cada fuente de datos almacena dos cosas sobre su puerto: qué campo lo identifica (el tipo de índice) y el valor de ese campo. En cada reindexación, vuelve a encontrar el puerto preguntando qué índice SNMP tiene actualmente ese valor en ese campo. La fuente de datos sigue el valor, no la posición en la tabla.

La cuestión es, por tanto, qué campo lleva el valor.

La consulta de interfaz declara un orden de preferencia: `ifName`, luego `ifDescr`, luego `ifHwAddr`, luego `ifIndex`. Kadupul generalmente elige entre los candidatos que tienen valores suficientemente distintos y sin duplicados.

| Campo | Sobrevive a | Falla cuando |
|---|---|---|
| `ifName` | Reinicios, sustitución de tarjetas, renumeración | El agente lo deja vacío o lo repite en los miembros de una pila |
| `ifDescr` | Generalmente estable en hardware de conmutación | En servidores, un nombre de kernel sujeto a cambios |
| `ifHwAddr` | Reinicios | Una tarjeta sustituida tiene nuevas direcciones MAC, que es precisamente el caso que deseaba proteger |
| `ifIndex` | Nada fiable | La sustitución de una tarjeta, un reinicio o un cambio de firmware renumera la tabla |

Si la consulta recurre a `ifIndex`, considere esto como un problema y no como un resultado normal. El historial de su puerto estará entonces vinculado a un número que el conmutador puede reasignar libremente.

## Método de reindexación

Se establece por dispositivo y por consulta de datos. Determina cuándo Kadupul vuelve a leer los campos de índice.

| Método | Se activa con | Coste |
|---|---|---|
| None | Nada; manual o script únicamente | Ninguno |
| Uptime | Tiempo de actividad SNMP del dispositivo retrocediendo | Una comparación por ciclo |
| Index Count | Cambio en el recuento de índices descubiertos | Un conteo por ciclo |
| Verify All | Fallo en la verificación de identidad en caché | Consulta índices conocidos durante el sondeo |

Uptime es el valor predeterminado y se adapta a la mayoría de los conmutadores porque un reinicio es el evento que renumera los índices. Index Count captura tarjetas añadidas o eliminadas sin reinicio. Verify All puede detectar identidades modificadas en índices conocidos, pero no garantiza el descubrimiento de nuevos puertos.

Para volver a ejecutar un dispositivo y una consulta seleccionados, reemplace ambos identificadores con los identificadores instalados. Omita `--qid` para volver a ejecutar todas las consultas de ese dispositivo:

```bash
php cli/poller_reindex_hosts.php --id=42 --qid=16
```

`--id=all` amplía la ejecución a todos los dispositivos habilitados. Evite ejecuciones de reindexación superpuestas. `--force` omite el registro de procesos y actualiza las cachés de títulos.

## Cuando desaparece un puerto

No asuma que un puerto ausente detiene la recolección automáticamente. El código de reindexación actual puede restablecer un indicador de huérfano y mantener los OID de sondeo antiguos cuando una identidad queda sin resolver y ninguna fuente cambia el índice. Compare la identidad almacenada con la nueva caché de descubrimiento y desactive una fuente afectada hasta que se confirme la correspondencia. Consulte [Consultas de datos e índices](/es/concepts/data-queries-and-indexes/).

## Chasis de gran tamaño

Dos configuraciones por dispositivo resultan importantes cuando el recuento de puertos es elevado: compruebe los OID configurados por solicitud SNMP y el recuento de subprocesos por dispositivo. La compatibilidad con el procesamiento por lotes y el paralelismo efectivo dependen del recolector y del agente; PHP `cmd.php` y Spine no ofrecen un comportamiento de subprocesamiento idéntico.

Modifique solo una configuración a la vez y observe la duración del ciclo del sondeador.

## Modos de fallo

| Síntoma | Causa |
|---|---|
| Gráficos creados, cada medición desconocida | Contadores de 64 bits no implementados, o el dispositivo usa SNMP v1 |
| Los contadores saltan a valores absurdos | Contador de 32 bits desborda más de una vez por intervalo |
| Huecos solo con carga elevada | Máximo RRD fijado a una velocidad descubierta obsoleta |
| Historial de puerto asignado al puerto incorrecto tras mantenimiento | Identidad inestable, correspondencia obsoleta o manejo de huérfanos sin resolver |
| El sondeador registra advertencias sobre índices SNMP no válidos | Fuentes de datos dejadas sin índice; reindexar, eliminar o deshabilitar |
| Puertos descubiertos, nada se recolecta | Fuentes de datos con índice vacío no crean entradas en la caché del sondeador |
