---
title: Actualizar de forma segura
description: Ensayar una actualización, conservar copias de seguridad sincronizadas, verificar almacenamiento y esquema, y planificar una reversión coordinada.
banner:
  content: Kadupul está en fase prealfa. Valide estos procedimientos en una instalación de prueba aislada. Traducción en borrador, pendiente de revisión por una persona con dominio del idioma.
sidebar:
  order: 8
---

:::caution[Validar antes del uso]
El código fuente está disponible, pero no existe una versión publicada ni una ruta de migración con soporte para Kadupul. Pruebe estos procedimientos en una copia aislada con copias de seguridad antes de confiar en ellos. Consulte el [estado del proyecto](/es/project/status/).
:::

Una actualización modifica tres elementos en momentos diferentes y con distinta reversibilidad.

| Modificaciones | Reversible | Cómo |
|---|---|---|
| Código, dependencias y configuración | A partir de una copia retenida | Restaure la revisión y los ajustes coincidentes |
| Esquema de base de datos y muestras en cola | A partir de una copia de seguridad sincronizada | Restaure la base de datos; no existe una migración inversa automática |
| Ficheros RRD | A partir de una copia de seguridad sincronizada | Restaure el historial retenido; las muestras ausentes de la copia de seguridad no pueden recrearse mediante reversión |

El procedimiento existe para mantener los tres elementos al mismo paso.

## Antes de empezar

**Haga la copia de seguridad completa.** Las tres partes, coherentes entre sí. Siga [Copia de seguridad y restauración](/es/guides/back-up-and-restore/). Detenga todos los procesos de escritura antes de la captura final y conserve protegida la copia de seguridad hasta la aceptación de la actualización.

**Registre la revisión actual y la versión del esquema.** Incluya dependencias, cambios locales, plugins y configuración. Varias revisiones del código fuente pueden reportar la misma versión de esquema. Ensaye la revisión de destino sobre una copia restaurada aislada.

**Compruebe cada plugin.** Inspeccione su declaración de compatibilidad, código y dependencias, y luego pruebe las funciones que necesite frente a la revisión de destino. Una declaración de versión mínima por sí sola no garantiza compatibilidad. Consulte la [validación de plugins](/es/guides/install-and-vet-plugins/).

**Compruebe el entorno de ejecución.** Versión de PHP, extensiones de PHP y versión del servidor de base de datos. Compruebe los [requisitos](/es/reference/requirements/) del destino antes del despliegue. No asuma que la interfaz de línea de órdenes del esquema realiza todas las comprobaciones del instalador web.

**Compruebe que la cuenta de base de datos puede modificar el esquema.** En tiempo de ejecución, la cuenta necesita leer y escribir en su propia base de datos. En el momento de la actualización también necesita crear, modificar y eliminar tablas e índices. Las instalaciones que restringieron los permisos tras la configuración inicial descubren esto aquí.

**Detenga todos los productores.** Detenga la recolección programada, los recolectores remotos, la recolección iniciada desde la web y el mantenimiento manual; espere a que termine el trabajo en curso. Purgue las escrituras diferidas solo después de que se detengan los productores, y conserve las filas de cola no confirmadas junto con la copia de seguridad correspondiente. Mantenga detenidos los productores durante el despliegue y la validación del esquema.

## Sustituir la aplicación

Una copia superpuesta tiene límites específicos:

```bash
# Copies the contents of the new tree over the old one.
cp -a /path/to/new-release/. /path/to/kadupul/
```

Sin ello, `cp -a /path/to/new-release /path/to/kadupul` crea `kadupul/new-release/` y deja cada fichero de la aplicación antigua exactamente donde estaba. La actualización parece haber funcionado, la interfaz sigue ejecutando el código antiguo, y el primer síntoma de problema es que la migración del esquema se niega a coincidir con una versión que usted creía haber reemplazado.

Una copia superpuesta conserva los ficheros ausentes del nuevo árbol, incluidos los ficheros obsoletos de la aplicación. Puede sobrescribir cualquier ruta coincidente, por lo que debe inspeccionar el artefacto en lugar de asumir que la configuración o los datos quedan excluidos. Prefiera un árbol preparado y revisado con dependencias, configuración y plugins coincidentes. Si cambia de versión mediante un enlace simbólico, valide la ruta RRA efectiva y el acceso al almacenamiento antes del cambio; el arranque actual la deriva del directorio de la aplicación más `/rra`. Un cambio de enlace simbólico por sí solo no es una reversión de base de datos.

**Compruebe lo que realmente está ejecutando antes de continuar.**

```bash
cat /path/to/kadupul/include/cacti_version
```

Si eso no reporta la versión que acaba de desplegar, deténgase. Todo lo que sigue a partir de este punto asume que se ha desplegado el código previsto. Compare también la revisión del código fuente o la suma de comprobación del artefacto con el registro de la versión; la cadena de versión por sí sola no es suficiente.

## La migración del esquema

La base de datos lleva su propia versión, independiente de la versión en el código. Reemplazar el código no la modifica.

Las páginas autenticadas heredadas redirigen al instalador cuando las versiones del código y de la base de datos no coinciden. Esta no es una protección universal para cada punto de conexión o interfaz de línea de órdenes, y las cadenas de versiones coincidentes no demuestran que cada migración se haya completado. Compruebe el estado del esquema directamente.

El instalador y la línea de órdenes ejecutan pasos de migración ordenados. Antes de la actualización normal del esquema, compruebe la cola duradera y el acceso al almacenamiento de la cuenta de servicio. Si una cola heredada `poller_output` no es InnoDB, conviértala explícitamente con los escritores detenidos y la copia de seguridad conservada:

```sh
php cli/upgrade_database.php --migrate-poller-queue
```

A continuación, ejecute esto bajo cada cuenta real web y de sondeo:

```sh
php cli/upgrade_database.php --check-rrd-storage
```

Las dos opciones son operaciones independientes y no se pueden combinar. La conversión de la cola preserva las muestras pendientes; no trunque filas para superar una comprobación. Resuelva la pertenencia y la configuración de UID/GID numéricos de confianza utilizando los [requisitos de almacenamiento](/es/reference/requirements/). Los recolectores remotos en línea normalmente seleccionan la cola principal; use `--local` únicamente para una comprobación o conversión intencionada de la cola local. Una vez superadas esas comprobaciones, ejecute la actualización del esquema desde la raíz de la aplicación:

```sh
php cli/upgrade_database.php
```

Ejecútelo como la cuenta de servicio configurada con el acceso al sistema de ficheros y los privilegios de base de datos requeridos. Una comprobación con éxito como root no demuestra el acceso de la cuenta de servicio. Existe una opción `--forcever` para establecer explícitamente la versión inicial, que existe para volver a ejecutar una migración durante pruebas previas al lanzamiento. No forma parte de una actualización normal y utilizarla para saltarse un paso fallido dejará el esquema a medio migrar.

Capture el estado de salida y la respuesta, y luego verifique la versión de la base de datos y los cambios de esquema requeridos. La línea de órdenes actual puede rechazar una versión inicial heredada desconocida o incompatible y salir aun así con código 0; un estado satisfactorio de la shell no basta por sí solo. Si la migración falla a mitad de camino, mantenga detenidos los productores y restaure el conjunto de copia de seguridad sincronizado en lugar de intentar omitir el paso fallido.

## Qué rompe los plugins

Las comprobaciones de plugins del instalador web pueden inhabilitar plugins incompatibles o ausentes. No asuma que la línea de órdenes de esquema realiza las mismas comprobaciones de ciclo de vida de los plugins.

**La versión mínima declarada es superior a la nueva versión del núcleo.** Deshabilitado. Este es el caso habitual y es el que su comprobación previa a la actualización debería haber detectado.

**Falta el directorio del plugin, su fichero de configuración o su fichero de declaración.** Deshabilitado. Un plugin cuyos ficheros se eliminaron mientras aún figuraba como habilitado en la base de datos encaja aquí.

**El plugin no tiene ningún fichero de declaración.** Puede fallar en la comprobación de compatibilidad del instalador. Pruebe un paquete de plugin mantenido y compatible en lugar de asumir que se puede volver a habilitar sin cambios.

Hay un cuarto caso que no constituye una rotura. La funcionalidad que antes era un plugin y que desde entonces se ha integrado en el núcleo se elimina por completo, no se deshabilita: se retiran sus puntos de anclaje y entradas de permisos y se elimina su fila. Si ve que un plugin desaparece en lugar de mostrarse atenuado, consulte los registros de migración y la disposición específica del plugin antes de concluir que existen funciones equivalentes disponibles.

Deshabilitar un plugin es diferente a desinstalarlo. Los puntos de anclaje y las migraciones de los plugins pueden modificar sus propias tablas y permisos; conserve el código y los datos de plugins coincidentes y verifique la ruta de actualización específica. No prometa la preservación universal de datos.

## Planificación de la reversión

Decida la reversión antes de empezar, porque la decisión varía según lo lejos que haya llegado.

| Punto de fallo | Método de reversión |
|---|---|
| Código sustituido, no se ejecutó ninguna operación de cambio de estado ni proceso de escritura | Restaure el código anterior, las dependencias y la configuración tras confirmar que el estado no ha cambiado |
| Conversión de cola o migración iniciada, incluido un fallo parcial | Detenga los procesos de escritura y restaure el código, la configuración, la base de datos y las copias de seguridad de RRD coincidentes |
| Migración completada, la aplicación funciona incorrectamente | Detenga los procesos de escritura y restaure el conjunto de copia de seguridad sincronizado; tenga en cuenta las muestras recolectadas tras la copia |
| Solo un plugin está roto | Manténgalo deshabilitado mientras evalúa la reparación frente a una reversión coordinada según los criterios de aceptación |

La regla que subyace a la tabla: el código y el esquema se revierten juntos o no se revierten. El código antiguo frente a un esquema nuevo no es un estado admitido. No confíe en la comprobación de versión web para evitar cualquier operación incompatible.

Establézcase un límite de tiempo. Decida de antemano cuánto tiempo dedicará a la depuración antes de restaurar, y cúmplalo. La copia de seguridad pierde utilidad cuanto más tiempo funcione el sistema a medio actualizar.

## Por qué los ficheros RRD son la parte que no debe perder

No asuma que el despliegue, el mantenimiento o la reanudación de la recolección dejan los RRD inalterados. Realice una copia de seguridad de ellos junto con la base de datos y restaure el conjunto sincronizado al revertir cambios de estado. Es posible que las muestras retenidas en la cola aún no existan en esos ficheros. Una copia de seguridad de RRD verificada puede recuperar su historial capturado; una muestra ausente no se puede reconstruir simplemente restaurando el esquema o el código. Consulte [Fuentes de datos y archivos round-robin](/es/concepts/data-sources-and-rras/) para saber por qué la resolución que contienen tampoco se puede reconstruir.

Tres formas específicas en que se suelen perder durante una actualización:

**Desplegar reemplazando el directorio de instalación.** El directorio RRA es por defecto un subdirectorio de la instalación. Eliminar el directorio antiguo y desempaquetar el nuevo en su lugar puede borrar las mediciones retenidas. Conserve el árbol RRA mediante una disposición de almacenamiento comprobada antes de reemplazar la aplicación. Valide el `$config['rra_path']` efectivo, las rutas anidadas y las comprobaciones de confianza de la cuenta de servicio; esta revisión no proporciona un ajuste general de base de datos para una raíz RRA local arbitraria.

**Desplegar desde una copia de repositorio o un paquete que se apropia de todo el árbol.** El mismo fallo, pero automatizado. Confirme lo que su método de despliegue considera eliminable.

**Corregir permisos con un cambio de propiedad recursivo.** Es inofensivo para los datos, pero puede dejar al sondeador sin permisos de escritura, lo que se manifiesta como un sistema que grafica el historial a la perfección pero no recolecta nada nuevo.

## Después de la actualización

1. Inspeccione la salida de la actualización, la versión de la base de datos y los cambios de esquema requeridos, y luego confirme que la interfaz carga. La ausencia de una redirección por sí sola es insuficiente.
2. Finalice las actualizaciones previstas de código/configuración de los recolectores remotos y valide sus destinos de base de datos mientras sus productores permanecen detenidos.
3. Repita las comprobaciones de almacenamiento de la cuenta de servicio, reanude los recolectores designados y verifique las horas de última actualización de RRD representativos y los valores retenidos útiles.
4. Revise el registro en busca de la línea de estadísticas de ejecución y compare el tiempo transcurrido con el que tenía antes. Una nueva versión puede cambiar el coste de recolección.
5. Vuelva a habilitar los plugins que estaban deshabilitados, uno a uno, tras instalar versiones que declaren compatibilidad con el nuevo núcleo.
6. Compruebe la profundidad de la cola retenida, la recolección remota y los trabajos de plugins durante la ventana de aceptación acordada. Conserve la copia de seguridad de reversión hasta que se superen esas comprobaciones.
