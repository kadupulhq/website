---
title: Asegurar una instalación expuesta a Internet
description: Qué modificar antes de que un sistema de monitorización con acceso por consola a su red responda a peticiones de la red pública.
banner:
  content: Kadupul está en fase prealfa. Valide estos procedimientos en una instalación de prueba aislada. Traducción en borrador, pendiente de revisión por una persona con dominio del idioma.
sidebar:
  order: 9
---

:::caution[Validar antes del uso]
El código fuente está disponible, pero no existe una versión publicada ni una ruta
de migración con soporte para Kadupul. Pruebe estos procedimientos en una copia
aislada con copias de seguridad antes de confiar en ellos. Consulte el [estado del proyecto](/es/project/status/).
:::

Comencemos con la respuesta honesta: sitúelo detrás de una VPN. Kadupul almacena las credenciales
SNMP de cada dispositivo que monitoriza en texto plano, y ejecuta comandos en su propio host como
parte de su funcionamiento habitual. Ninguna configuración hace aconsejable exponerlo a la red pública.

Las siguientes comprobaciones ayudan a evaluar una instalación aislada. No constituyen un despliegue
público seguro o con soporte; tenga presente la advertencia sobre el estado del proyecto indicada arriba
al interpretar los resultados.

## TLS

Termine TLS en el servidor web o en un proxy situado delante. Kadupul no escucha en un socket propio.

Active a continuación el ajuste que redirige las peticiones HTTP simples a HTTPS. Está desactivado
por defecto (`off`). Sin él, el formulario de inicio de sesión se sirve mediante HTTP y las contraseñas
viajan por la red en texto claro antes de que cualquier otra medida pueda intervenir.

La aplicación activa el indicador Secure de la cookie de sesión cuando PHP recibe un valor no vacío
de `$_SERVER['HTTPS']` distinto de `off`. Detrás de un proxy que termina TLS, configure el servidor
web de confianza o la capa FastCGI para representar HTTPS de manera adecuada y verifique el encabezado
`Set-Cookie` resultante en un navegador.

`$proxy_headers` controla la resolución de direcciones de clientes. No establece la variable de
servidor HTTPS ni habilita cookies Secure. Confíe únicamente en los encabezados de dirección que su
proxy defina, descarte las copias enviadas por los clientes e impida el acceso directo al backend.
Imponga redirecciones de HTTP a HTTPS en el proxy público antes de transmitir credenciales.

La aplicación establece HttpOnly y SameSite=Strict en su cookie de sesión. Compruebe el comportamiento
real de cookies y redirecciones en el límite del despliegue; estas opciones no demuestran que todas
las demás cookies compartan idéntica configuración. Consulte la
[referencia de configuración de sesiones en PHP](https://www.php.net/manual/en/session.configuration.php).

## Credenciales por defecto

El esquema distribuido incluye una cuenta administrativa denominada `admin` cuyo hash de contraseña
es el MD5 de la cadena `admin`. Está marcada para exigir un cambio en el primer inicio de sesión.
Confirme que el cambio se efectuó en lugar de asumirlo. El aviso que lo exige se omite bajo la
autenticación web básica, en la que el servidor web ya determinó la identidad del usuario.

Revise después las credenciales que no corresponden a cuentas de usuario:

- La cuenta de base de datos se define por defecto como `cactiuser` con contraseña `cactiuser` en la plantilla de configuración distribuida.
- El subsistema de automatización incluye opciones SNMP por defecto con las cadenas de comunidad `public` y `private`, además de un par de usuario y contraseña SNMPv3. Se trata de valores por defecto para descubrimiento, no de la configuración de sus dispositivos, pero son las cadenas que el rastreo probará en primer lugar.

La directiva de contraseñas es configurable. Los valores por defecto requieren ocho caracteres y
mayúsculas y minúsculas combinadas. La caducidad y el bloqueo de cuenta tras intentos fallidos están
disponibles y ambos vienen desactivados por defecto. En una instalación expuesta a Internet, active el bloqueo.

## Privilegios de base de datos

El ejemplo de instalación utiliza privilegios asignados a nivel de base de datos más acceso a la
tabla de zonas horarias. Reemplace estos nombres ilustrativos de cuenta y base de datos y revise los
permisos para las tareas reales de despliegue y mantenimiento:

```sql
GRANT ALL ON kadupul.* TO 'someuser'@'localhost';
GRANT SELECT ON mysql.time_zone_name TO 'someuser'@'localhost';
```

Esa segunda concesión no es opcional. La gestión de zonas horarias consulta esa tabla y el instalador
verifica el acceso y la presencia de datos de zona horaria. Revise los permisos adicionales en función
de las necesidades reales de mantenimiento y recolección antes de eliminarlos; este ejemplo no demuestra
que todo despliegue requiera con exactitud los mismos privilegios.

Consideraciones de alcance importantes:

- Vincule la base de datos a localhost o a una interfaz privada, nunca a la dirección en la que atiende el servidor web.
- Asigne a cada recolector de datos remoto su propia cuenta de base de datos. Sus credenciales residen en la base de datos central y en su propio fichero de configuración; el uso de cuentas separadas mejora la atribución y la revocación. No aíslan por sí solas a un recolector comprometido si sus permisos le permiten efectuar escrituras centrales.
- La conexión admite TLS, configurado mediante clave, certificado y ruta de CA en el fichero de configuración. Utilícelo siempre que la base de datos no resida en el mismo host.
- Haga que el fichero de configuración sea legible por el usuario del servidor web y no modificable ni por el usuario web ni por el del servicio de sondeo durante el funcionamiento normal. Consérvelo bajo la propiedad de una cuenta administrativa. La configuración del recolector remoto comprueba específicamente si puede actualizar el fichero; no asuma que toda instalación en un servidor primario necesita los mismos permisos temporales de escritura.
- El secreto de CSRF puede almacenarse en un fichero en lugar de la base de datos. Si opta por ello, el fichero debe situarse fuera de la raíz de documentos. Esto se establece como un requisito, no como una sugerencia.

## Mantener los directorios de datos fuera de la raíz de documentos

En un despliegue desde la raíz del repositorio, los datos privados y los directorios de código fuente
pueden encontrarse bajo la raíz servida. Varios directorios contienen reglas de exclusión en
`.htaccess`; haga un inventario de la copia real y de la configuración del servidor en lugar de
suponer que todas las rutas están protegidas. La migración parcial actual del framework también implica
que pasar todo el sitio a `public/` sin sus rutas heredadas no constituye un procedimiento completo de despliegue.

Dichos ficheros solo son efectivos en Apache y cuando la configuración permite anulaciones en ese
directorio. En nginx resultan inertes. En un Apache mal configurado resultan inertes. Una denegación
inoperante ante el directorio de registros permite a cualquiera leer el registro de su aplicación,
que revela nombres de dispositivos, usuarios, consultas y detalles de fallos. Apache documenta el
comportamiento de anulación requerido en su [guía de `.htaccess`](https://httpd.apache.org/docs/2.4/howto/htaccess.html).

Adopte ambas medidas:

**Verificar las rutas de almacenamiento antes de mover datos.** Los destinos de registro son
configurables, pero `include/global.php` define la base RRA en el directorio `rra` de la instalación;
no existe un ajuste general en la interfaz para el directorio RRA. Una estructura de almacenamiento
montada por separado puede mantener esa ruta esperada, pero la disposición en el sistema de ficheros
no impide por sí sola el acceso HTTP a través de un directorio servido o un enlace simbólico.
Verifique conjuntamente las rutas de fuentes de datos existentes, permisos de servicio, copias de
seguridad y denegaciones HTTP. No reubique árboles de caché sin comprobar cómo resuelven los ficheros
sus consumidores. Consulte [Migrar a nuevo hardware](/es/guides/migrate-to-new-hardware/) y
[Actualizar con seguridad](/es/guides/upgrade-safely/).

**Denegar rutas privadas en el servidor web.** Adapte el
[ejemplo de Nginx para raíz de repositorio](https://github.com/kadupulhq/kadupul/blob/661a57ff43ebf275e6b07211d4284dd727103959/tests/e2e/nginx.conf)
presente en el código fuente al prefijo URL y al servidor correspondientes; las reglas de denegación
deben tener prioridad sobre el procesamiento genérico de PHP. Esta lista constituye una ayuda de
inventario, no una configuración de servidor prefabricada:

| Directorio | Motivo |
|---|---|
| `rra/` | Ficheros de mediciones |
| `log/` | Registro de la aplicación, incluidos detalles de consultas y errores |
| `cache/` | Inspeccionar acceso a recursos previsto; bloquear ejecución de PHP en rutas de caché |
| `scripts/` | El código de recolección no debe servirse ni invocarse directamente por HTTP |
| `cli/` | Herramientas de línea de comandos que no deben ser accesibles por HTTP |
| `mibs/`, `contrib/`, `docs/` | Recursos internos y documentación |
| `src/`, `config/`, `templates/`, `var/`, `lib/`, `bin/`, `tests/`, `tools/` | Aspectos internos de la aplicación, estado y herramientas |
| Ficheros que empiezan por punto, manifiestos de dependencias, PHP interno de include/bootstrap | Metadatos del repositorio y puntos de entrada internos |

Conserve los recursos públicos obligatorios como `include/js` e `include/themes`; un bloqueo general
sobre todos los includes puede inutilizar la interfaz. Verifique la denegación mediante rutas de prueba
inocuas y confirme que las respuestas no revelen código fuente ni contenido de ficheros. No realice pruebas
recuperando secretos reales hacia un terminal o registro.

Existe también un fichero opcional con encabezados de seguridad para recursos estáticos. Las respuestas
PHP definen sus propios encabezados en código; los ficheros estáticos no lo hacen salvo que active dicho
fichero o incorpore las directivas correspondientes en la configuración del servidor.

La directiva de seguridad de contenido (CSP) es configurable. La directiva de scripts por defecto admite
JavaScript en línea sin nonce, dado que los plugins dependen de ello. El modo estricto con nonce ofrecido
en la configuración opera únicamente en modo reporte. La implementación de encabezados también admite
la exigencia de `nonce`, a pesar de la [ayuda obsoleta de configuración](https://github.com/kadupulhq/kadupul/issues/265).
La exigencia estricta y el modo reporte son distintos; examine los encabezados y pruebe todas las
páginas y plugins pertinentes antes de alternar de modo. La exigencia implementada no demuestra una
compatibilidad total con nonces.

## El sondeador ejecuta comandos

Este es el aspecto que modifica sustancialmente el modelo de amenazas.

La recolección no es solo SNMP. Un método de entrada de datos puede definir una línea de comandos y el
sondeador la ejecutará. Dicha línea de comandos se guarda en la caché del sondeador y la ejecuta el
recolector en cada intervalo con el usuario de sistema operativo de este último. Las entradas basadas
en el servidor de scripts PHP emplean un proceso PHP independiente y persistente. Los comandos externos
y las entradas del servidor de scripts representan vías diferentes; no asuma que todo script corre en
dicho servidor ni que se haya validado un recolector en C para esta revisión.

Considere los siguientes permisos como superficies de configuración altamente privilegiadas para la
ejecución de código. Sus consecuencias dependen de las funciones habilitadas y los controles de validación:

| Permiso | Motivo |
|---|---|
| Métodos de entrada de datos | Define la línea de comandos directamente |
| Importar plantillas | Una plantilla o paquete importado puede incorporar un método de entrada de datos |
| Administración de plugins | El código del plugin se ejecuta en la aplicación |
| Configuración / Utilidades | Controla las rutas hacia los binarios que se ejecutan |

No los conceda a nadie que no posea ya acceso por consola al host. Un usuario de solo lectura facultado
para ver gráficos es algo completamente distinto, y esa es la función que debería asignarse a casi cualquier cuenta.

Existen dos controles y ambos merecen ser aprovechados:

**Restricción de metacaracteres.** Los metacaracteres de consola en las cadenas de comando de entrada
de datos están bloqueados por defecto. Existe un ajuste para permitirlos, presente por compatibilidad
con definiciones antiguas que empleaban tuberías (pipelines). Manténgalo desactivado. Si cuenta con
definiciones que lo requieran, traslade la tubería a un script bajo el directorio de scripts e invoque dicho script.

**La lista blanca de entradas.** Un fichero, indicado en el fichero de configuración, que recopila las
cadenas de comandos aprobadas clasificadas por método de entrada de datos. Al estar activado, no se pueden
crear gráficos ni fuentes de datos a partir de un método de entrada cuya cadena no figure en la lista.
Modificar un comando aprobado hace que la validación falle hasta actualizar la lista blanca revisada.
Su regeneración es un paso por consola, y esa es la clave: requiere acceso por consola al host, no una
sesión administrativa en el navegador.

La comprobación vuelve a ejecutarse al reconstruir la caché del sondeador. Una entrada de datos que
no la supere no genera elementos de sondeo, y cualquier fila remanente se elimina en la siguiente
reconstrucción o volcado confirmado. Esto controla la creación y el llenado de la caché; no constituye
un mecanismo de cancelación instantánea para tareas en ejecución ni demuestra que cada recolector recargue
una lista blanca modificada antes de cada ejecución. Verifique el estado confirmado de la caché y el
comportamiento del recolector tras un cambio de política.

```sh
php cli/input_whitelist.php --audit
# After reviewing this data input's command; 42 is an example data-input ID.
php cli/input_whitelist.php --update --id=42
```

Un `--update` sin acotar admite las definiciones de comando actuales en la lista blanca; no lo use
como sustituto de una revisión concienzuda. Proteja la lista blanca y su directorio contenedor contra
escrituras de los usuarios de servicio. Permanece inactiva si no se configura expresamente. Consulte
[Escribir un script de recolección de datos](/es/guides/write-a-data-collection-script/) para conocer
detalles sobre selección y salida.
Esto eleva la dificultad de un compromiso administrativo en el navegador, ya que incorporar un nuevo
comando a la recolección pasa a requerir también acceso de escritura en el sistema de ficheros del host
del sondeador. Sigue sin sustituir la restricción de quiénes ostentan los permisos de la tabla anterior,
puesto que un atacante con acceso a un comando ya aprobado no necesita añadir ninguno nuevo.

## Autenticación

Se ofrecen cuatro métodos. La disponibilidad de cada uno depende de las extensiones PHP instaladas.

| Método | Dónde se comprueban los usuarios | Notas |
|---|---|---|
| Integrado | La base de datos local | Contraseñas, directivas y bloqueos se gestionan íntegramente a nivel local |
| Web básico | El servidor web | Kadupul confía en la identidad de usuario que indique el servidor |
| LDAP | Un único directorio | Requiere la extensión PHP LDAP |
| Múltiples dominios LDAP/AD | Varios directorios | Idéntico requisito |

El selector de configuración muestra estos métodos autenticados, no el modo cero heredado. El arranque
de autenticación intenta migrar una configuración antigua sin autenticación hacia la autenticación local,
pero los asistentes de autorización de nivel inferior aún albergan bifurcaciones para el modo cero.
Compruebe el método almacenado, las identidades configuradas y las rutas realmente protegidas en lugar
de interpretar la falta de opción en la interfaz como una prueba concluyente.

Aspectos a considerar:

- **La autenticación web básica delega la validación de la identidad.** Kadupul lee las variables de identidad autenticadas por el servidor cuando se selecciona este modo y continúa aplicando la asignación de cuentas, el estado de habilitación y las reglas de autorización. La ausencia de identidad no equivale automáticamente a un administrador. Configure el servidor para autenticar cada ruta prevista e impida que los clientes faciliten variables de identidad supuestamente fiables; verifique de forma independiente las rutas de imagen/exportación y el comportamiento deliberado de invitados.
- **La opción "Mantener la sesión iniciada"** viene activada por defecto. Se genera un token persistente cuando el usuario marca esa opción tras autenticarse, no para toda sesión automáticamente. Expira tras noventa días de inactividad. En una instalación expuesta a Internet, valore conscientemente si desea mantenerla.
- **Asigne el usuario invitado a "nadie"**, salvo que pretenda expresamente habilitar la consulta anónima de gráficos. Por defecto no hay usuario asignado, lo cual es la elección adecuada; compruebe que no se haya modificado durante la instalación.
- **Anteponga autenticación multifactor.** La aplicación no incorpora MFA. El lugar donde debe implementarse es en un proxy consciente de identidades o en una pasarela SSO.

## Puntos de enlace de recolectores de datos remotos

Si opera recolectores remotos, la instalación central expone un punto de enlace al que estos llaman.
No se autentica mediante sesión de usuario. Autoriza resolviendo la dirección llamante y cotejándola
con los nombres de host de los recolectores registrados, registrando los rechazos bajo una categoría
de seguridad.

De ello se desprenden dos conclusiones. Primero, dicho extremo no debe ser accesible desde la red
pública; limítelo en el servidor web a las direcciones de los recolectores. Segundo, la dirección de
cliente que evalúa es la deducida a partir de la petición, por lo que la confianza en encabezados
reenviados configurada anteriormente resulta aplicable aquí también. Confiar en encabezados que no
controla permite a un atacante suplantar la dirección de un recolector.

Asimismo, el ajuste que tolera certificados autofirmados y discrepancias en nombres de host cuando
el servidor central se comunica con un recolector viene activado por defecto. Emita certificados reales
para sus recolectores y desactive dicha opción.

## Lista de comprobación mínima

1. TLS terminado, HTTP redirigido antes del inicio de sesión, estado HTTPS de PHP configurado por el servidor de confianza y cookies Secure verificadas. Encabezados de dirección de cliente limitados a los que el proxy define y elimina.
2. Contraseña del administrador cambiada y confirmada. Bloqueo de cuenta activado.
3. Permisos de base de datos revisados para instalación, mantenimiento y recolectores; acceso a zonas horarias confirmado y acceso de red a la base restringido a clientes autorizados.
4. Rutas de almacenamiento verificadas, directorios privados y metadatos denegados en el servidor web, y recursos estáticos imprescindibles plenamente operativos.
5. Fichero de configuración sin permisos de escritura en ejecución. Fichero de secreto de CSRF, si se utiliza, fuera de la raíz de documentos.
6. Métodos de entrada de datos, Importar plantillas y Administración de plugins no asignados a nadie que carezca de consola en el host del sondeador. Restricción de metacaracteres activada. Lista blanca de entradas configurada.
7. Punto de enlace de recolectores remotos restringido por dirección IP. Verificación de certificados activada.
8. MFA en un proxy antepuesto a la totalidad del despliegue.
