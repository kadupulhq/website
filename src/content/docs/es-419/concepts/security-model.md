---
title: Modelo de seguridad
description: Dónde entran los datos no confiables en Kadupul, qué proceso se ejecuta con qué privilegio, qué puede hacer la cuenta de base de datos y qué límites impone el código en lugar de asumirlos.
banner:
  content: Kadupul está en pre-alfa. Valide estos procedimientos en una instalación de prueba aislada.
sidebar:
  order: 12
---

Un sistema de monitorización es algo incómodo de defender, por tres razones que no tienen nada que
ver con la calidad del código.

Contiene credenciales para todo lo que observa. Comunidades SNMP, nombres de usuario y frases de
contraseña v3, y cualquier otra cosa que necesite un dispositivo se almacenan para que el sondeador
pueda utilizarlos desatendido. No hay ningún ser humano que los escriba cada cinco minutos.

Ejecuta comandos de forma programada. Recolectar un valor que SNMP no expone implica ejecutar un
script, y la definición de ese script es configuración, almacenada en la base de datos y editable a
través de la interfaz.

Ingiere datos que producen las máquinas que observa. La descripción de una interfaz, un punto de
montaje de disco, el nombre de un sensor: todo llega desde el dispositivo y todo termina en la base
de datos, en títulos de gráficos y en argumentos entregados a otros programas. Un switch
comprometido es una fuente de entrada, no solo una víctima.

Ninguno de estos aspectos es un defecto. Son lo que exige el trabajo. Lo que sigue es dónde aterriza
cada uno en la arquitectura.

## Dónde entran las entradas no confiables

Cuatro puntos de entrada, en orden aproximado de cuánto los controla un operador.

| Punto de entrada | Origen | Hacia dónde va |
|---|---|---|
| Parámetros HTTP | Cualquiera que pueda alcanzar el servidor web | La base de datos, la salida de la página y SQL |
| Valores SNMP | El dispositivo sondeado | `host_snmp_cache`, títulos de gráficos, límites de RRD, argumentos de scripts |
| Salida de script | Un script local o con lo que se haya comunicado | `poller_output`, luego archivos RRD |
| Plantillas y paquetes cargados | Quien posea el ámbito de importación | Filas de plantillas y, para paquetes, archivos en disco |

### Parámetros HTTP

Los asistentes de solicitud residen en `lib/html_utility.php`. `get_filter_request_var()`
valida por defecto como enteros, pero también tiene casos especiales para valores vacíos, no
definidos y expresiones regulares. Un emisor todavía necesita comprobar si un valor es obligatorio y
adecuado para la operación. El filtrado no establece autorización.

`set_request_var()` almacena en caché un valor en `$_CACTI_REQUEST` y lo refleja en las matrices
de solicitud. `get_nfilter_request_var()` lee esa caché o la solicitud sin procesar y no valida ni
escribe el valor por sí mismo. Por lo tanto, las lecturas posteriores pueden observar un valor
almacenado previamente, y el orden de lectura importa.

Con `log_validation` habilitado, `get_request_var()` registra ciertas lecturas de solicitudes no
almacenadas en caché. Las lecturas superglobales directas y `get_nfilter_request_var()` no están
todas cubiertas. Es una ayuda de diagnóstico, no una auditoría completa de validación ni una
aplicación coercitiva.

### Valores SNMP

El descubrimiento de consultas de datos almacena valores indexados seleccionados en
`host_snmp_cache`; los resultados ordinarios de sondeo SNMP siguen la ruta de muestras.
`data_query_format_record()` en `lib/data_query.php` aplica dos transformaciones antes del
almacenamiento: un mapa opcional `rewrite_value` de la definición de consulta y `bin2hex()` en
cualquier valor cuya codificación no pueda identificar `mb_detect_encoding()`. Esa segunda es una
protección contra cadenas de octetos binarios, no contra contenido hostil.

A partir de ahí, el valor viaja. Nombra gráficos mediante `substitute_snmp_query_data()`. Puede
establecer un máximo de RRD, porque una plantilla de datos puede declarar su máximo como
`|query_ifSpeed|`. Se convierte en un argumento para una consulta de script, donde
`get_script_query_path()` pasa cada parte a través de `cacti_escapeshellarg()` primero.

El escape y los validadores de RRDtool descritos en
[Integración con RRDtool](/es-419/reference/rrdtool-integration/) son el límite aquí. Los datos del
dispositivo deben permanecer como no confiables. La validación y el escape son propiedades de cada
sitio de llamada; la presencia de asistentes no es prueba de que cada consumidor los use
correctamente. Compruebe tanto la estructura del comando como el argumento sustituido.

### Salida de script

La rama `popen()` de `exec_poll()` lee con `fgets(..., 8192)`, devolviendo como máximo 8.191
bytes o el primer salto de línea. Su alternativa `shell_exec()` tiene un comportamiento de salida
diferente, y la recolección del servidor de scripts sigue otra ruta.

`prepare_validate_result()` reconoce valores numéricos y desconocidos, formas hexadecimales y
algunas estructuras de salida de múltiples campos. También puede eliminar texto para obtener un valor
numérico; no es un filtro escalar estricto universal. El análisis posterior y la validación de RRDtool
también importan. Consulte [Métodos de entrada de datos](/es-419/reference/data-input-methods/).

Las comprobaciones de salida no aíslan un script que ya se ha ejecutado. Revise el comando, la lista
de permitidos de entrada y los privilegios del sistema operativo antes de habilitar la recolección.

### Plantillas y paquetes

Dos mecanismos diferentes comparten un único ámbito.

Una **importación de plantilla** es XML plano sin firma. Crea plantillas, consultas de datos y
métodos de entrada de datos. Un método de entrada de datos es una línea de comandos, por lo que este
es un camino desde un archivo cargado hacia algo que ejecutará el sondeador. `lib/import.php`
ejecuta `cacti_input_string_is_safe()` en cualquier `input_string` importado y rechaza el método
cuando contiene metacaracteres de shell, registrando:

```
ERROR: Refusing to import data input method '<hash>' - input_string contains shell metacharacters
```

Una **importación de paquete** está firmada. `import_read_package_data()` lee la clave pública
incrustada del paquete y la compara con las tres claves compiladas en `lib/import.php`: las dos
claves de Cacti y la clave de Kadupul. Cualquier otra clave falla. Un paquete sin ningún elemento
`<publickey>` se lee como si reclamara la clave Cacti más antigua, y luego tiene que producir una
firma que se verifique contra ella. `import_read_package_data()` rechaza cualquier clave por debajo
de 2048 bits antes de intentar la verificación, lo cual la clave más antigua, de 512 bits, no supera.
Cada archivo contenido lleva su propia firma, verificada por separado.

Los paquetes pueden entonces escribir archivos seleccionados. Los nombres aceptados comienzan con
`scripts/` o `resource/`, opcionalmente debajo de un prefijo válido `plugins/<name>/`. El
importador rechaza bytes NUL, saltos de directorio y rutas absolutas, y resuelve la contención bajo la
raíz de instalación; simplemente contener un nombre de directorio es insuficiente. La capacidad de
escritura del destino también controla si la escritura tiene éxito. Un paquete que supera la
verificación escribe PHP ejecutable en el árbol de instalación por diseño. La verificación de firma
establece la identidad de firma aceptada y la integridad, no que el código sea inofensivo. La
autorización del ámbito, la contención de rutas, los archivos seleccionados, los permisos del sistema
de archivos y la política de lista de permitidos de comandos también importan.

Ambos mecanismos se encuentran detrás del ámbito 17. El rol estándar de Editor de plantillas posee el
ámbito 17 y el ámbito 2 (Métodos de entrada de datos). Una cuenta con esos permisos puede definir
comandos de recolección, sujeto a la validación y al tratamiento de listas de permitidos. Para eso es
el rol, y vale la pena saberlo antes de otorgarlo. Consulte
[Importar y exportar plantillas](/es-419/guides/import-and-export-templates/) para conocer el flujo de
trabajo validado y las limitaciones conocidas.

## Qué se ejecuta con qué privilegio

| Proceso | Iniciado por | Se ejecuta como | Qué hace |
|---|---|---|---|
| Interfaz web | El servidor web | El usuario del servidor web | Lee y escribe en la base de datos, renderiza gráficos a través de RRDtool, escribe archivos RRD a petición, escribe archivos de paquetes durante la importación |
| `poller.php` | Programador o servicio configurado | Cuenta de servicio/programador | Lee la caché del sondeador, inicia recolectores, escribe archivos RRD |
| `cmd.php` | Sondeador o ruta de recolección en tiempo real | Cuenta iniciadora | Realiza peticiones SNMP get y comandos de recolección |
| `script_server.php` | Recolector | Cuenta iniciadora | Incluye un archivo PHP y llama a una función en su propio proceso |
| RRDtool | El proceso web o el sondeador | Cualquiera que lo haya llamado | Lee y escribe archivos bajo `rra/` |

Dos de ellos merecen una atención más cercana:

**El servidor de scripts no es un entorno aislado.** Incluye el archivo de destino en un proceso PHP
de larga duración y llama a una función en él. Esa función comparte el proceso, su memoria y su
conexión a la base de datos. Las comprobaciones en `script_server.php` deciden si la llamada se
produce en absoluto: `realpath()` del archivo a incluir debe resolverse bajo `$config['base_path']`
o `$config['scripts_path']`, la función debe existir tras la inclusión,
`ReflectionFunction::isInternal()` debe ser false y el archivo que define la función también debe
estar bajo una raíz permitida. Una vez que se superan, el código se ejecuta con todos los privilegios
del sondeador. Un método de servidor de scripts es una forma de ejecutar PHP dentro de Kadupul, no
una forma de ejecutar PHP junto a él.

**El proceso web puede escribir archivos RRD.** Las solicitudes de gráficos pueden desencadenar
actualizaciones de Boost y creación de archivos a petición. Una advertencia que delega una ruta de
creación de directorio al sondeador no hace que el acceso de escritura web sea universalmente opcional.
La comprobación previa del almacenamiento y la coordinación de mantenimiento también verifican el
acceso a la cuenta y las configuraciones de UID/GID numéricas de confianza. La creación ejecutada
como root intenta hacer coincidir la propiedad del almacenamiento, pero se pueden registrar fallos.
Consulte [Actualizar con seguridad](/es-419/guides/upgrade-safely/).

Las cuentas de la web y del sondeador programado pueden diferir. La recolección en tiempo real
iniciada desde una solicitud web puede heredar la cuenta web, por lo que la ejecución de comandos no
está restringida a la identidad del sondeador programado. La integración heredada de Spine requiere
validación por separado contra el binario real; esta página no establece una compilación admitida.

## Qué necesita la cuenta de base de datos

Los procesos que utilizan la misma configuración de base de datos normalmente comparten su cuenta.
Los recolectores remotos pueden tener credenciales locales y centrales separadas; las configuraciones
específicas del despliegue pueden diferir. Inspeccione las concesiones reales de cada cuenta configurada.

| Requisito | Por qué |
|---|---|
| DML completo en el esquema de Kadupul | Operación ordinaria |
| DDL en el esquema de Kadupul | Actualizaciones y operaciones en tiempo de ejecución como rotación de tablas Boost, tablas temporales y cambios en el ciclo de vida de complementos |
| `SELECT` en `mysql.time_zone_name` | Las listas de zonas horarias del sitio y del recolector leen esa tabla directamente |

No elimine los privilegios DDL bajo el supuesto de que solo las actualizaciones los necesitan. La
aplicación no cambia universalmente a una identidad de migración separada; la separación de cuentas
requiere validación específica del despliegue de todas las rutas de tiempo de ejecución afectadas.

`include/config.php` contiene credenciales de base de datos y los recolectores remotos también
pueden contener credenciales centrales `$rdatabase_*`. Los permisos del sistema de archivos, las
reglas de acceso HTTP, la configuración del controlador PHP y la protección de copias de seguridad
son importantes. PHP normalmente ejecuta el archivo en lugar de servir su código fuente, pero eso no
es un sustituto de protegerlo contra la divulgación directa. Consulte
[Asegurar una instalación expuesta a Internet](/es-419/guides/secure-an-internet-facing-install/).

Las credenciales del dispositivo se almacenan de la misma manera. `host.snmp_community`,
`host.snmp_password` y `host.snmp_priv_passphrase` son columnas ordinarias, escritas por
`api_device_save()` a través de `form_input_validate()` sin paso de cifrado, y copiadas en filas
de `poller_item` para que las lea el sondeador. El acceso de lectura a las tablas relevantes puede
exponer las credenciales almacenadas del dispositivo; no implica acceso a todas las fuentes externas.
Las contraseñas de usuario son la excepción: `compat_password_hash()` utiliza `password_hash()`
de PHP con `PASSWORD_DEFAULT`, y un hash MD5 heredado que todavía se verifica se vuelve a calcular
en el siguiente inicio de sesión.

## Impuesto, y meramente convencional

Esta es la distinción que más importa al razonar sobre un cambio.

### Mecanismos de código y su alcance

| Límite | Mecanismo |
|---|---|
| Autenticación | Las páginas de interfaz comunes usan `include/auth.php`; los extremos especializados tienen su propio manejo |
| CSRF | El arranque web compartido configura el manejo de tokens; se rechazan matrices de tokens mal formadas. Compruebe cada extremo y ruta de despacho en lugar de asumir una cobertura universal |
| Scripts solo para CLI | `include/cli_check.php` responde `404` y finaliza cuando el SAPI no es `cli` |
| Ubicación XML de consulta de datos | `cacti_path_is_within()` contra `<base_path>/resource`, registrado y rechazado de lo contrario |
| Autenticidad del paquete | Firma contra una clave compilada, mínimo 2048 bits, firmas por archivo |
| Colocación de archivos del paquete | Nombres no válidos rechazados; prefijos permitidos de script/recurso y contención de raíz resuelta comprobados |
| Destinos del servidor de scripts | Contención mediante `realpath()`, más las comprobaciones de función anteriores |
| Argumentos de shell | Escape, asistentes de comandos estructurados y validadores donde se aplican; inspeccione el sitio de llamada real |
| Argumentos de RRDtool | Validadores de caracteres de control y formato en `lib/functions.php` |
| SQL | Los asistentes preparados enlazan valores; SQL dinámico, identificadores y llamadas no preparadas aún requieren revisión |
| Emisores de agentes remotos | La dirección de origen debe coincidir con una fila habilitada en `poller`, por IP exacta o búsqueda inversa confirmada |

### Responsabilidades del despliegue y del sitio de llamada

| Límite | Por qué no se impone |
|---|---|
| Filtrado de solicitudes | Una página elige `get_filter_request_var()` o no. `log_validation` informa, no bloquea |
| Escape de salida | `html_escape()` y `html_purify()` se aplican por sitio de llamada |
| Autorización por página | La comprobación de ámbito utiliza `$user_auth_realm_filenames`, indexada por nombre de archivo. Una página no asignada no recibe una comprobación positiva de ámbito solo de ese mapa. Pueden aplicarse comprobaciones adicionales; las páginas de complementos deben registrar y hacer cumplir su política de acceso |
| Denegación de directorio | Los archivos `.htaccess` bajo `cli/`, `log/`, `rra/`, `scripts/`, `contrib/`, `mibs/` y `cache/*` son directivas de Apache. En nginx, o en Apache con `AllowOverride` desactivado, ninguno de ellos se aplica |
| Encabezados de seguridad en archivos estáticos | `.htaccess.dist` se envía sin renombrar. La emisión de encabezados PHP depende de su ruta y configuración; las respuestas estáticas dependen de la configuración del servidor/proxy |
| Separación de usuarios web y del sondeador | Una convención, no un requisito |
| Permisos en `include/config.php` | Establecidos por quien lo instaló |

Los archivos de redireccionamiento `index.php` en `resource/` y sus subdirectorios detienen la
lista de directorios. No son control de acceso y no detienen una solicitud directa de un archivo
concreto.

## Extremos que responden antes de la autenticación

Estos son ejemplos de puntos de entrada especializados, no un inventario exhaustivo de extremos
públicos. La ausencia de la inclusión común no demuestra la ausencia de autenticación o autorización
en otra parte de la ruta de la solicitud.

| Archivo | Comportamiento |
|---|---|
| `auth_login.php`, `auth_changepassword.php` | La superficie de inicio de sesión en sí |
| `csp_report.php` | Recibe informes de infracción de CSP del navegador |
| `service_check.php` | Responde `success` o `fail` después de una consulta a `version`. Un sondeo de actividad sin autenticación |
| `link.php` | Carga una fila de enlace externo, luego comprueba `is_realm_allowed($page['id'] + 10000)` por sí mismo |
| `remote_agent.php` | La RPC del recolector de datos, autorizada por dirección de origen |

`remote_agent.php` es en el que hay que pensar. Su autorización es
`remote_client_authorized()`, que compara `get_client_addr()` con los nombres de host y
direcciones de la tabla `poller`. No hay ningún secreto compartido. Un emisor cuya dirección
coincida con una fila de recolector de datos habilitado puede invocar las acciones del agente:
sondear datos, ejecutar una consulta de datos, hacer ping a un dispositivo, realizar peticiones SNMP
get y walk, solicitar datos de gráficos y ejecutar descubrimiento de red. Dos protecciones perfilan
esto. Primero, la función devuelve false directamente cuando se devuelve como máximo una fila de
recolector habilitado, por lo que este caso es rechazado por esta función. Segundo, cuando la
coincidencia es por nombre de host en lugar de por IP exacta, la búsqueda inversa se confirma con una
búsqueda directa antes de aceptarse.

`get_client_addr()` lee `REMOTE_ADDR` y nada más a menos que se establezca `$proxy_headers` en
`include/config.php`. El valor predeterminado es `null`. Habilitar los encabezados de proxy
compatibles cambia las fuentes ordenadas a partir de las cuales se selecciona una dirección de cliente
válida. Utilice únicamente encabezados controlados por el proxy de entrada de confianza y evite que
los clientes omitan o proporcionen esos valores ellos mismos. Esta es la única línea de configuración
que más cambia el significado de cada decisión basada en direcciones en el sistema, incluida la
autorización del agente remoto y las direcciones registradas en el log.

## Acceso de invitados

La configuración `guest_user` nombra una cuenta cuyos permisos se utilizan para las páginas de
gráficos sin inicio de sesión. Por defecto no hay usuario, y la visualización de gráficos requiere
entonces autenticación como todo lo demás. Configurarlo publica lo que esa cuenta puede ver a
cualquiera que pueda alcanzar el servidor web. Esa es la intención de la función. La cuenta todavía
existe en los registros de usuarios; la configuración de invitado es lo que hace que sus permisos de
gráficos aplicables sean utilizables sin un inicio de sesión normal. Verifique las solicitudes reales
y los permisos de objetos, no solo el nombre de cuenta configurado.

## Cómo razonar sobre un cambio

Hágase tres preguntas en orden:

¿Qué proceso ejecutará esto y como qué usuario? La respuesta para un método de entrada de datos es
normalmente la cuenta del sistema operativo del recolector que lo inicia; la recolección activada por
la web puede diferir de la recolección programada.

¿Qué tocan los datos en su camino? Un valor de un dispositivo que solo aterriza en un archivo RRD ha
cruzado un límite. El mismo valor en el título de un gráfico ha cruzado dos, y en un argumento de
script, tres.

¿El límite en el que confío es obligatorio o convencional? Si es convencional, el código que está
escribiendo es la aplicación efectiva.

Lecturas relacionadas: [Permisos y acceso](/es-419/concepts/permissions-and-access/) para el modelo de
autorización en sí, [Métodos de entrada de datos](/es-419/reference/data-input-methods/) para el contrato
de ejecución y la lista de permitidos de entrada, y
[Recolección remota de datos](/es-419/concepts/remote-data-collection/) para lo que hace un recolector
de datos con la confianza que se le otorga.
