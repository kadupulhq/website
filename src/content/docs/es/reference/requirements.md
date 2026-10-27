---
title: "Requisitos"
description: "Requisitos de ejecución, almacenamiento y despliegue para planificar 2026–2027."
sidebar:
  order: 1
banner:
  content: "Kadupul está en fase prealfa. Valide estos procedimientos en una instalación de prueba aislada. Traducción en borrador, pendiente de revisión por una persona con dominio del idioma."
---

Verificado el 26 de octubre de 2026 con la revisión de la aplicación indicada abajo. Esta referencia sirve para planificar 2026–2027; no constituye un compromiso de lanzamiento ni de soporte.
[`d579c33c6`](https://github.com/kadupulhq/kadupul/tree/d579c33c60cca7e4c9d84dbd9e1b2c6ba5492daf).

## Entorno de ejecución

`main` requiere PHP 8.4 o posterior y combina Symfony 7.4 con puntos de entrada heredados. La rama `lts/1.2` tiene requisitos propios. Instale MySQL o MariaDB, RRDtool y un recolector PHP o una compilación compatible de Spine. Para compilar desde el código fuente, utilice las versiones de `mise.toml` mediante `mise exec`; instale las dependencias del fichero de bloqueo sin actualizarlas.

## PHP

El manifiesto requiere estas extensiones además de PHP:

`PDO`, `Phar`, `dom`, `gd`, `gmp`, `intl`, `json`, `ldap`, `mbstring`, `mysqlnd`, `openssl`, `pcntl`, `pdo_mysql`, `posix`, `sockets`, `sqlite3`, `xml`.

El instalador comprueba por separado `ctype`, `date`, `filter`, `hash`, `pcre`, `session`, `simplexml`, `spl`, `standard` y `zlib`, entre otras. En Unix comprueba `posix` y `pcntl` para CLI; en Windows, `com_dotnet`. Superar el instalador no demuestra que se cumplan los requisitos de Composer. Compruebe PHP de la línea de órdenes y del servidor web por separado. Configure `date.timezone`; el instalador recomienda `memory_limit=400M` y `max_execution_time=60`, o valores sin límite. La extensión opcional `snmp` permite consultas dentro del proceso; `gettext` habilita los catálogos de traducción.

## Base de datos

Utilice una versión de MySQL o MariaDB mantenida por su proveedor y valídela con la revisión de destino. Los umbrales antiguos del instalador para MySQL 5.6 y MariaDB 10.0 no acreditan soporte para 2026–2027. En `main`, `poller_output`, `poller_output_boost` y `poller_output_realtime` usan InnoDB; algunas tablas de coordinación siguen usando MEMORY. No convierta todas las tablas al mismo motor. Cargue `mysql.time_zone_name` y conceda a la cuenta de la aplicación acceso SELECT a esa tabla.

## RRDtool

Configure la ruta absoluta del ejecutable y haga coincidir la versión configurada con la instalada. `DCOUNTER` y `DDERIVE` requieren RRDtool 1.5 o posterior. El almacenamiento local en Unix requiere comprobaciones de identidad POSIX y un `flock` funcional sobre directorios. Detenga los procesos de escritura externos y los demonios de caché antes del mantenimiento exclusivo. Existe una ruta de proxy heredada, pero no garantiza un despliegue validado.

## net-snmp

Instale las herramientas Net-SNMP si PHP `snmp` no está disponible o está deshabilitado. Configure `path_snmpget`, `path_snmpgetnext`, `path_snmpwalk`, `path_snmpbulkwalk` y `path_snmptrap` con las rutas de los ejecutables correspondientes. Pruebe la ruta seleccionada con la versión SNMP del dispositivo, incluido SNMPv3 sobre IPv6 cuando corresponda; el instalador heredado desaconseja PHP `snmp` para esa combinación.

## Servidor web

Ejecute PHP mediante el entorno web configurado y utilice TLS. Conserve las rutas heredadas junto con `/app.php/...`; no cambie toda la raíz de documentos a `public/` mientras sigan existiendo páginas heredadas. Configure PATH_INFO para el punto de entrada de compatibilidad. Nginx ignora `.htaccess`; aplique reglas explícitas que bloqueen el acceso al código fuente, la configuración, las dependencias, las herramientas, las pruebas, los secretos y el estado de ejecución antes del procesamiento PHP. Haga coincidir el prefijo de URL con `$url_path`.

## Planificación de tareas

Utilice un solo mecanismo de inicio: cron, el Programador de tareas o el servicio del demonio recolector incluido. Haga coincidir su frecuencia con el intervalo de inicio configurado. La recolección de menos de un minuto se ejecuta dentro de ese intervalo; cron por sí solo no ofrece esa frecuencia. Ejecute las comprobaciones con la cuenta del sondeador y detenga el mecanismo habitual para evitar ejecuciones simultáneas.

## Sistema de ficheros

Conceda acceso a las rutas RRD efectivas, registros, cachés y directorios de ejecución de Symfony solo a las cuentas que lo necesiten. El directorio RRD predeterminado es `rra/`. Las cuentas Unix separadas para web y sondeo requieren identificadores numéricos explícitos en `rrd_maintenance_trusted_uids` y, para grupos con permiso de escritura, `rrd_maintenance_trusted_gids`, en `include/config.php`. Todos los miembros de esos grupos deben ser de confianza. Los permisos normales siguen aplicándose; se rechaza el almacenamiento con escritura para todo el mundo. Utilice la misma configuración de confianza en todos los procesos de escritura y compruebe ambas cuentas antes de actualizar.

## Privilegios

Ejecute el proceso web y el sondeador con cuentas dedicadas sin privilegios. ICMP mediante sockets sin procesar requiere privilegios adicionales del sistema operativo; si no están disponibles, utilice comprobaciones TCP, UDP o SNMP. No ejecute toda la aplicación como root para habilitar ping. Windows carece de la validación de ACL necesaria para el mantenimiento destructivo de RRD locales; las actualizaciones ordinarias usan confirmaciones síncronas de RRDtool. Las pruebas de rendimiento en Unix no validan la capacidad de Windows.

## Acerca de la versión de PHP

Para planificar 2026–2027, PHP 8.4 recibe soporte activo hasta el 31 de diciembre de 2026 y correcciones de seguridad hasta el 31 de diciembre de 2028. PHP 8.5 recibe soporte activo hasta el 31 de diciembre de 2027 y correcciones de seguridad hasta el 31 de diciembre de 2029. Son fechas del proyecto PHP, no una matriz de compatibilidad de Kadupul. Pruebe los entornos nuevos con las dependencias bloqueadas antes de adoptarlos. El mínimo inferior de PHP que exige Symfony no reduce el mínimo 8.4 de Kadupul. Revise los calendarios oficiales y la revisión de destino antes del despliegue.

[Ajuste de la base de datos](/es/guides/tune-database-performance/) · [Integración con RRDtool](/es/reference/rrdtool-integration/) · [SNMP](/es/reference/snmp/) · [Organización de ficheros](/es/reference/file-layout/) · [Instalación](/es/start/install/) · [Requisitos previos para actualizar el almacenamiento](https://github.com/kadupulhq/kadupul/blob/d579c33c60cca7e4c9d84dbd9e1b2c6ba5492daf/docs/testing/spikekill-safety.md) · [Versiones compatibles de PHP](https://www.php.net/supported-versions.php)
