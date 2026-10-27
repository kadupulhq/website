---
title: Instalación
description: Lo que Kadupul necesita para funcionar y el orden en el que ensamblarlo.
sidebar:
  order: 2
banner:
  content: Kadupul está en fase prealfa. Valide estos procedimientos en una instalación de prueba aislada. Traducción en borrador, pendiente de revisión por una persona con dominio del idioma.
---

:::caution[Validar antes del uso]
El código fuente está disponible, pero no existe una versión publicada ni una ruta de migración con soporte para Kadupul. Pruebe estos procedimientos en una copia aislada con copias de seguridad antes de confiar en ellos. Consulte el [estado del proyecto](/es/project/status/).
:::

Siga estos pasos uno por uno, en orden. Cada paso finaliza con una comprobación. Realice la comprobación antes de continuar: cada fallo indicado aquí resulta fácil de detectar ahora y costoso de resolver después de que el sondeador lleve una semana en funcionamiento.

Para los requisitos específicos del equipo, consulta [Linux alojado en Windows](/es/guides/install-on-windows/) y [FreeBSD](/es/guides/install-on-freebsd/). Estos procedimientos no demuestran una validación completa de principio a fin.

## Lo que necesita primero

Kadupul es una aplicación PHP que almacena su configuración en MySQL o MariaDB y las mediciones en ficheros RRD en disco. Esta página describe una nueva instalación en un servidor principal a partir del código fuente `main` actual, no una actualización ni la rama archivada LTS. Cuatro elementos deben existir antes de que pueda ejecutarse.

| Componente | Por qué se necesita |
|---|---|
| PHP 8.4 o posterior, en una versión con soporte de seguridad | Ejecuta la interfaz web y el sondeador |
| MySQL o MariaDB | Almacena dispositivos, plantillas, usuarios y la caché del sondeador |
| RRDtool | Crea y actualiza los archivos round-robin, y genera gráficos |
| net-snmp | Proporciona las herramientas de cliente y las bibliotecas utilizadas para consultar dispositivos |

PHP también necesita las extensiones requeridas por [el manifiesto de la aplicación](https://github.com/kadupulhq/kadupul/blob/main/composer.json), incluidas `pdo_mysql`, `gd`, `sockets`, `gmp`, `intl`, `ldap`, `mbstring`, `pcntl`, `posix` y `sqlite3`. Instálelas tanto para el entorno de línea de órdenes como para el servidor web. [Requisitos](/es/reference/requirements/) distingue los requisitos de Composer de las comprobaciones independientes del instalador.

## Paso 1: instalar el entorno de ejecución

Instale PHP con sus extensiones, el servidor de bases de datos, RRDtool y net-snmp a partir de los paquetes de su distribución.

**Compruébelo.**

```bash
php -v
php -m | sort
rrdtool --version
snmpget --version
```

`php -m` debe listar las extensiones requeridas. La extensión PHP `snmp` es opcional cuando las herramientas de línea de órdenes de net-snmp están disponibles. Composer comprueba sus propias extensiones requeridas durante la instalación de dependencias; el instalador web dispone de una comprobación de extensiones independiente. Un mecanismo de respaldo en tiempo de ejecución no elimina un requisito de Composer.

Las configuraciones de PHP para la línea de órdenes y el servidor web pueden diferir. Compruebe ambas. El instalador recomienda un `memory_limit` de al menos 400M y un `max_execution_time` de al menos 60 segundos; también acepta sus valores sin límite (`-1` y `0`, respectivamente). Los valores por debajo de esas recomendaciones generan advertencias, mientras que la falta de `date.timezone` es un error. Establezca una zona horaria explícita, como `UTC`, y utilice `php --ini` para identificar la configuración de la línea de órdenes.

## Paso 2: crear la base de datos y su usuario

Cree una base de datos vacía y un usuario con permisos sobre esa base de datos. Para una base de datos local, ejecute estas órdenes SQL como administrador de la base de datos, sustituyendo la contraseña del ejemplo antes de su uso:

```sql
CREATE DATABASE kadupul CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'kadupul'@'localhost' IDENTIFIED BY 'replace-with-a-unique-password';
GRANT ALL PRIVILEGES ON kadupul.* TO 'kadupul'@'localhost';
```

Utilice el host de la cuenta de base de datos correspondiente si PHP se conecta desde otra máquina.

El servidor de bases de datos también necesita que se carguen sus tablas de zonas horarias, y el usuario de Kadupul necesita acceso de lectura a ellas, en la base de datos `mysql`. Es la única concesión fuera de su propio esquema. Nada en un sistema de monitorización hace sospechar esto, y no es opcional; la comprobación que figura a continuación fallará sin ello.

```bash
# Populate the tables, then grant the one extra read the installer needs.
mysql_tzinfo_to_sql /usr/share/zoneinfo | mysql -u root -p mysql
mysql -u root -p -e "GRANT SELECT ON mysql.time_zone_name TO 'kadupul'@'localhost';"
```

**Compruébelo.** Inicie sesión como el usuario de base de datos de Kadupul y ejecute:

```sql
SELECT COUNT(*) FROM mysql.time_zone_name;
```

Lo que busca es que devuelva un recuento distinto de cero sin errores de permisos. Cero significa que las tablas nunca se cargaron; un error indica que el usuario no puede leerlas. Ambos casos detienen el instalador.

Cuatro ajustes propios del servidor son lo bastante importantes como para corregirlos ahora.

| Parámetro | Valor deseado | Por qué |
|---|---|---|
| `max_allowed_packet` | 16M o más | Sincronizaciones de gran tamaño entre el servidor principal y los recolectores remotos |
| `character_set_server`, `collation_server` | `utf8mb4`, `utf8mb4_unicode_ci` | Las descripciones de dispositivos contienen caracteres multibyte |
| `innodb_file_per_table` | Activado | Mantiene los espacios de tablas separados y manejables |
| `innodb_buffer_pool_size` | Alrededor de un cuarto de la memoria del sistema | Mantiene el conjunto de trabajo en memoria |

El instalador informa de su propia lectura de estos parámetros y señala lo que no alcanza el nivel adecuado, de modo que no tiene que fiarse a ciegas de la tabla. [Optimizar el rendimiento de la base de datos](/es/guides/tune-database-performance/) profundiza en ello una vez que tenga carga.

## Paso 3: desempaquetar, corregir la propiedad y servir la aplicación

Coloque la aplicación en un lugar donde su servidor web pueda servirla y, a continuación, decida qué usuario del sistema será su propietario. Esa decisión importa más que la ubicación. Dos procesos escriben aquí: el servidor web y lo que programe el sondeador. Ejecute ambos como el mismo usuario. Ejecute el sondeador sin privilegios y conceda a ambos procesos el acceso que necesitan. Una propiedad o unos modos incorrectos pueden impedir actualizaciones posteriores incluso cuando los gráficos se generen correctamente.

### Si ha clonado el repositorio en lugar de desempaquetar una versión

Una copia de trabajo de Git necesita tanto las dependencias de PHP como los recursos del navegador generados. Con los entornos de ejecución del fichero `mise.toml` del repositorio instalados, ejecute desde la raíz del repositorio:

```bash
mise exec -- php "$(command -v composer)" install --no-dev --optimize-autoloader
mise exec -- npm ci --ignore-scripts
mise exec -- npm run build
mise exec -- php bin/console asset-map:compile
mise exec -- php bin/console about
```

Composer rellena `include/vendor/` y restaura los ficheros de compatibilidad fijados. La compilación de npm genera recursos bajo `include/js/`, `include/fa/` e `include/vendor/flag-icons/`. Composer por sí solo no resulta suficiente para una instalación desde el código fuente.

Un paquete completo con todas las dependencias para trabajar sin conexión es un artefacto de compilación independiente. Un archivo genérico de código fuente de GitHub no es ese paquete. Siga el [procedimiento de compilación y verificación sin conexión](https://github.com/kadupulhq/kadupul/blob/main/docs/symfony-migration.md#offline-installation) cuando el host de destino no tenga acceso a Internet.

Prepare las rutas con permisos de escritura tras instalar las dependencias:

| Grupo | Directorios | Con permisos de escritura cuándo |
|---|---|---|
| Durante la instalación | `resource/snmp_queries`, `resource/script_server`, `resource/script_queries`, `scripts` | Solo durante la instalación o actualización |
| Durante la instalación | `include/vendor/csrf/`, o la ubicación configurada para `path_csrf_secret` | El instalador debe crear el secreto específico de la instalación; consérvelo después |
| Siempre | `log`, `cache/boost`, `cache/mibcache`, `cache/realtime`, `cache/spikekill`, el directorio temporal del sistema | Durante toda la vida útil de la instalación |
| Entorno de ejecución de Symfony | `var/cache`, y `var/log` si se ha configurado el registro en fichero | Para el entorno de ejecución PHP y el usuario que precalienta la caché |

El directorio RRD también debe tener permisos de escritura durante toda la vida útil de la instalación. Contiene su histórico, de modo que concédale el mismo cuidado que dedicaría al directorio de una base de datos.

La migración actual todavía necesita las rutas heredadas de inicio de sesión, instalador y complementos. Para esta instalación combinada, sirva la raíz del repositorio con reglas explícitas que denieguen el acceso a directorios privados, configuración, dependencias y estado de ejecución. No traslade toda la instalación a `public/`: eso eliminaría rutas heredadas aún en uso. El punto de entrada independiente de Symfony dispone de un enrutamiento distinto; consulte las [instrucciones de migración](https://github.com/kadupulhq/kadupul/blob/main/docs/symfony-migration.md).

Para Nginx, comience a partir de las [reglas de ubicación de Nginx](https://github.com/kadupulhq/kadupul/blob/main/tests/e2e/nginx.conf) del repositorio, adaptando la raíz y el servidor PHP-FPM upstream. Mantenga las reglas de denegación antes del procesamiento genérico de PHP y conserve PATH_INFO para `/app.php/...`. Nginx no lee `.htaccess`. Mantenga los ficheros RRD, registros y secretos inaccesibles a través de HTTP; verifique la configuración real del servidor en lugar de asumir que los permisos de los ficheros impiden servirlos.

**Compruébelo.** Cambie a la identidad del usuario del sondeador, escriba un fichero en cada directorio del grupo permanente y luego bórrelo. Un permiso que parezca correcto en `ls -l` todavía puede ser denegado por SELinux o AppArmor, y escribir el fichero es la única comprobación que cubre ese aspecto. A continuación, solicite un fichero bajo el directorio de registros a través de HTTP. Lo que busca es una denegación.

## Paso 4: redactar el fichero de configuración

Para una nueva instalación, copie el fichero de configuración distribuido:

```bash
cp include/config.php.dist include/config.php
```

No sobreescriba la configuración de una instalación existente. Establezca el host, el nombre, el usuario y la contraseña de la base de datos a partir del paso 2. Otros dos valores importan en una primera instalación: `url_path`, la ruta bajo la cual se sirve la aplicación con barras diagonales inicial y final, y `poller_id`, que es `1` en un servidor principal y otro valor únicamente en un recolector remoto.

Deje comentado el bloque del recolector remoto. Todavía no está construyendo uno; [Recolección remota de datos](/es/concepts/remote-data-collection/) lo cubre cuando llegue el momento. Todos los demás ajustes disponen de un valor predeterminado funcional, de modo que lea [Configuración](/es/reference/configuration/) antes de modificar cualquiera de ellos.

Configure un `APP_SECRET` específico del despliegue en el entorno del proceso PHP para las funciones de Symfony que lo utilicen. El arranque utiliza por defecto `APP_ENV=prod` y `APP_DEBUG=0` y no carga ficheros `.env`. Esto es independiente del secreto CSRF del instalador heredado.

**Compruébelo.** Compruebe la sintaxis sin mostrar las credenciales:

```bash
php -l include/config.php
```

Importe el esquema en el paso siguiente antes de abrir el instalador en un navegador.

## Paso 5: importar el esquema

El instalador espera que las tablas ya existan. Cargue el esquema suministrado en la base de datos que ha creado:

```bash
mysql -u kadupul -p kadupul < cacti.sql
```

Haga esto una sola vez, sobre una base de datos vacía. No es un script de actualización; importarlo en una base de datos con datos puede fallar o dejar datos contradictorios y parciales.

## Paso 6: ejecutar el instalador

Abra el sitio en un navegador y avance por sus pasos. El instalador sigue una secuencia fija, y cada paso da paso al siguiente:

1. Bienvenida y licencia.
2. Comprobación de dependencias: versión y extensiones de PHP, los ajustes de PHP del paso 1 tanto para la línea de órdenes como para el servidor web, las tablas de zonas horarias y los ajustes de la base de datos del paso 2. Los errores bloquean el botón siguiente. Las advertencias no, pero léalas.
3. Tipo de instalación: un nuevo servidor principal o un recolector remoto.
4. Comprobación de permisos: los directorios del paso 3, probados escribiendo en ellos.
5. Ubicaciones de binarios: las rutas a PHP, RRDtool y las herramientas de net-snmp.
6. Perfil de fuente de datos e intervalo de inicio.
7. Selección de plantillas: qué plantillas de dispositivo cargar.
8. Conversión de tablas, confirmación y la propia instalación.

El punto 6 de esa lista es el más difícil de revertir. El perfil que elija decide el paso y el conjunto de archivos escritos en cada fichero RRD creado a partir de entonces, y modificar el perfil no migra los ficheros existentes. Los cambios de retención necesitan una migración independiente y probada; no siempre obligan a descartar el histórico. Si los picos importan, asegúrese de que el perfil conserve los máximos y no solo las medias: lea [Fuentes de datos y archivos circulares](/es/concepts/data-sources-and-rras/) antes de hacer clic para continuar. El intervalo de inicio que se ofrece allí es de un minuto o cinco minutos. El perfil de fuente de datos establece el intervalo de recolección; el iniciador y el perfil deben configurarse de manera coherente.

## Paso 7: cambiar las credenciales predeterminadas

El esquema suministrado crea una cuenta de administrador inicial llamada `admin` con la contraseña `admin`, marcada para que el primer inicio de sesión obligue a cambiarla. También crea una cuenta de invitado deshabilitada. Cambie la contraseña antes de que la instancia sea accesible por cualquier otra persona, lo que significa antes de conectarla a una red hacia la que otros puedan enrutar tráfico.

## Paso 8: programar el sondeador

El sondeador tiene que iniciarse desde el exterior. Configure su intervalo de recolección y su intervalo de inicio de manera coherente; el sondeador admite intervalos de inicio de un minuto o cinco minutos y dispone de una protección frente a ejecuciones ordinarias que lleguen demasiado pronto. Para un iniciador de un minuto, instale esta entrada en la crontab del usuario sin privilegios del sondeador, sustituyendo `php` y la ruta de la aplicación por sus rutas absolutas:

```
* * * * * php -q /path/to/kadupul/poller.php > /dev/null 2>&1
```

o ejecute el demonio suministrado `cactid.php` utilizando `service/cactid.service`, ajustado para su ruta de instalación y su usuario sin privilegios. Utilice un único mecanismo de inicio: deshabilite la tarea cron o el temporizador cuando utilice el demonio.

Haga coincidir la planificación real con el intervalo de inicio configurado. Para perfiles de recolección inferiores al minuto, el sondeador iniciado ejecuta ciclos de recolección dentro de ese intervalo; no intente expresar una cadencia inferior al minuto con esta entrada de cron.

**Compruébelo.** Ejecute un ciclo manualmente como el usuario del sondeador:

```bash
php -q /path/to/kadupul/poller.php --force --debug
```

`--force` omite la protección de sincronización ante ejecuciones prematuras. Utilice esta comprobación manual con el programador detenido para que no coincida con una ejecución programada. No elude otras comprobaciones de mantenimiento ni de seguridad. Lo que busca es una finalización limpia con una línea de resumen. Después active el programador y déjelo funcionar durante dos intervalos; confirme que se ha producido otra ejecución sin su intervención.

## Qué puede fallar

Estos son los fallos que una primera instalación experimenta en la práctica.

| Síntoma | Causa | Dónde mirar |
|---|---|---|
| El instalador se bloquea con ajustes de PHP que parecen correctos | El servidor web y la línea de órdenes leen ficheros `php.ini` distintos | `php --ini`, y el fichero que indica la SAPI web |
| El instalador se bloquea con las zonas horarias | Las tablas de zonas horarias no están cargadas, o el usuario de Kadupul no puede leerlas | `SELECT COUNT(*) FROM mysql.time_zone_name` |
| El paso de permisos falla en un directorio que parece tener permisos de escritura | Propietario incorrecto, o SELinux y AppArmor | Escribir un fichero como el usuario del sondeador |
| La instalación finaliza, pero nunca llegan datos | El sondeador nunca se programó | Ejecutar `poller.php --force --debug` manualmente |
| Datos durante unos ciclos, luego nada | El sondeador se ejecuta con el usuario incorrecto, dejando ficheros que el usuario web no puede actualizar | Propietario de los ficheros en el directorio RRD |
| Gráficos llenos de pequeños huecos | El intervalo programado y el intervalo configurado no coinciden | La crontab, frente al intervalo configurado |
| Composer rechaza la instalación | PHP es anterior a 8.4 o falta una extensión requerida por el manifiesto | `php -v`, `php -m` y la salida de error de Composer |
| El sondeador no puede ejecutar más de un proceso | Falta `pcntl` o `posix` | `php -m` |

[Registro](/es/reference/logging/) describe dónde registra cada componente. [Solucionar problemas de datos faltantes](/es/guides/troubleshoot-missing-data/) aborda el caso en que la instalación funciona correctamente pero un dispositivo no.

## Antes de exponer la instalación

El sondeador se ejecuta como un usuario del sistema y ejecuta RRDtool y sus scripts de recolección. Trate la instalación como algo que ejecuta órdenes, porque realmente lo hace.

- Sírvala a través de TLS.
- No mantenga la contraseña de administrador predeterminada, ni siquiera brevemente.
- Restrinja el usuario de base de datos a su propia base de datos.
- Mantenga los directorios RRD y de registros fuera de la raíz de documentos.
- Deje la cuenta de invitado deshabilitada a menos que decida lo contrario.

[Asegurar una instalación expuesta a Internet](/es/guides/secure-an-internet-facing-install/) contiene el resto. A continuación: [Añadir el primer dispositivo](/es/start/first-device/).
