---
title: "Instalar en FreeBSD"
description: "Prepare servicios, extensiones PHP y almacenamiento local de FreeBSD para una evaluación aislada."
banner:
  content: "Kadupul está en fase prealfa. Este procedimiento de plataforma no se ha validado de principio a fin. Traducción en borrador pendiente de revisión lingüística."
---

## Elegir y preparar el equipo

Use una versión incluida en la tabla de versiones compatibles de FreeBSD y planifique sus actualizaciones hasta 2027. El soporte del sistema operativo no demuestra compatibilidad con Kadupul. Instale PHP 8.4+, MySQL o MariaDB, RRDtool, Net-SNMP y un servidor web siguiendo el manual de paquetes y ports. Los valores predeterminados de `php84-extensions` no incluyen toda la lista de extensiones de la aplicación; instale los módulos faltantes, incluido `pcntl` para CLI, antes de instalar dependencias.

## Comprobar el entorno y configurar servicios

Compruebe el intérprete CLI y las herramientas seleccionados:

```sh
php -v
php -m
rrdtool --version
snmpget --version
```

Compruebe PHP web por separado. Para PHP-FPM instalado como paquete, configure el pool y la conexión con el servidor web antes de habilitar el servicio `php_fpm`. FreeBSD usa servicios rc, no systemd; siga el manual de servicios. Siga la instalación para la base de datos, configuración, esquema y recursos del navegador. Haga coincidir las herramientas con el archivo `mise.toml` de la aplicación; esos valores no prueban que los instaladores de entornos de mise funcionen en FreeBSD.

## Programar y verificar con las cuentas de servicio

Use un solo mecanismo cron con rutas absolutas y el intervalo configurado; no instale la unidad systemd de Linux. Valide identidad POSIX, bloqueo de directorios, propiedad y confianza explícita de UID/GID con cada cuenta web y del sondeador antes de recopilar. En jails, verifique red, montajes y permisos dentro de la jail. Ejecute un ciclo sin solapamiento, revise filas retenidas en cola y marcas de tiempo de gráficos, y ensaye una restauración de la copia de seguridad coherente. Que el proceso arranque no es suficiente. Consulte requisitos y copias de seguridad.

[Versiones compatibles de FreeBSD](https://www.freebsd.org/security/) · [Paquetes y ports](https://docs.freebsd.org/en/books/handbook/ports/) · [Servicios de FreeBSD](https://docs.freebsd.org/en/books/handbook/config/) · [Instalación](/es/start/install/) · [Requisitos](/es/reference/requirements/) · [Copias de seguridad](/es/guides/back-up-and-restore/)

Base de la aplicación verificada el 26 de octubre de 2026: [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
