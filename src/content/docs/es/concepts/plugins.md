---
title: Complementos
description: Por qué la superficie de extensión es una lista de puntos de llamada con nombre, qué hereda un complemento al ejecutarse dentro del proceso y qué detienen y no detienen las protecciones.
banner:
  content: Kadupul está en pre-alfa. Valide estos procedimientos en una instalación de prueba aislada.
sidebar:
  order: 11
---

Un complemento es código que la aplicación incluye en su propio proceso y llama en puntos
con nombre. Todas las demás propiedades del modelo de complementos se derivan de esa única frase.

Para saber qué leer antes de instalar el complemento de otra persona, consulte
[Instalar y auditar complementos](/es/guides/install-and-vet-plugins/).

## Por qué se ejecuta dentro del proceso

Mire para qué sirven los complementos: añadir una columna a una lista que la aplicación está
renderizando, cambiar las opciones de un gráfico antes de dibujarlo, actuar cuando se elimina un
dispositivo o adjuntar una pestaña. Cada una de esas acciones es una modificación de algo que la
aplicación retiene en memoria en ese instante.

Un subproceso de trabajo aislado necesitaría una interfaz explícita y validación de sus
resultados. Eso puede preservar el aislamiento de privilegios, pero no es el mecanismo utilizado
aquí: el archivo del complemento se incluye y su función se invoca dentro del proceso de la aplicación.

## Qué hereda el complemento

El código del complemento se ejecuta como la cuenta del sistema operativo que lo invoca, con acceso
a la conexión de base de datos y a los permisos del sistema de archivos del proceso. Un emisor web
también puede tener una sesión; un emisor de CLI no necesariamente dispone de una. El mecanismo de
complementos no proporciona una identidad separada, un entorno aislado (sandbox) ni verificación
de firma.

Los permisos de usuarios y grupos rigen el acceso a la aplicación; no contienen código PHP
arbitrario de complementos. Las concesiones de la base de datos, los permisos del sistema de
archivos y las restricciones del proceso siguen limitando lo que ese proceso puede hacer. Revise el
complemento antes de la instalación y mantenga limitados los privilegios de la cuenta de la aplicación.

## Dos estilos de llamada

| Estilo | La aplicación | Un complemento que no devuelve nada |
|---|---|---|
| Notificación | Pasa argumentos, ignora el resultado | El valor devuelto no se utiliza; los efectos secundarios y las excepciones aún importan |
| Transformación | Pasa un valor, utiliza lo que regresa | Puede reemplazar el valor con null y romper los emisores posteriores |

El estilo de transformación es lo que permite que un complemento añada un botón, extienda una lista
de acciones o altere un gráfico. Es también donde los complementos se entrelazan: dos complementos
en el mismo punto ven cada uno la salida del anterior en el orden de complementos configurado.

El despachador advierte de que una matriz se convierte en una no-matriz, o de que un valor
previamente no vacío se vuelve similar a null, solo cuando hay múltiples filas de puntos de llamada
(hooks) coincidentes. Esa comprobación no es una validación completa del contrato del punto de llamada;
un solo complemento puede corromper un valor sin esta advertencia.

## El registro es estado, no descubrimiento

Los puntos de llamada viven en una tabla: qué complemento, qué nombre de punto, qué archivo, qué
función, habilitado o no. Las rutinas de instalación, actualización y configuración pueden registrar
puntos de llamada; el registro no está limitado a la primera instalación.

La alternativa sería el descubrimiento en tiempo de solicitud, lo que significa escanear el
directorio de complementos e incluir el código de cada complemento para preguntarle qué desea. Una
sola página alcanza muchos puntos de llamada. Incluir todo para descubrir que no hay nada adjunto
es la respuesta costosa, por lo que la aplicación consulta la tabla, almacena en caché la respuesta
para la solicitud e incluye únicamente el archivo que nombra una fila coincidente.

Esa elección tiene un coste que conviene conocer. La tabla puede discrepar del sistema de archivos.
Un directorio de complementos eliminado a mano deja sus filas atrás. Las devoluciones de llamada de
notificación faltantes pueden generar advertencias amortiguadas; el despachador de transformaciones
no tiene una advertencia equivalente para devoluciones de llamada faltantes. Un registro silencioso
no demuestra que el registro sea correcto.

El orden proviene del orden de registro del complemento y es ajustable. Por lo tanto, una cadena
de transformación está ordenada por algo que controla un administrador.

## A qué puede recurrir un complemento

| Capacidad | Nota |
|---|---|
| Crear sus propias tablas | Registrado, para que la desinstalación pueda eliminarlas |
| Añadir columnas a tablas existentes, incluidas las del núcleo | Registrado, para que la desinstalación pueda quitarlas |
| Registrar ámbitos de permisos | Nuevas secciones de la interfaz con control de acceso |
| Declarar dependencias de otros complementos | Versión comprobada antes de instalar |
| Ejecutarse en recolectores remotos | El despacho depende del punto de llamada, estilo, capacidades y conexión |

Los cambios de esquema registrados son la razón por la cual la desinstalación es destructiva. La
aplicación puede eliminar tablas y columnas rastreadas, datos incluidos. También invoca la devolución
de llamada de desinstalación del complemento antes de la limpieza. Esa devolución de llamada puede
realizar otros cambios; los cambios no rastreados no se revierten automáticamente y el directorio
fuente del complemento permanece.

Los ámbitos registrados por un complemento son propiedad de usuarios y grupos de la misma manera
que los ámbitos del núcleo. Los nuevos ámbitos también pueden otorgar acceso al administrador
principal y al usuario de la sesión actual cuando el registro lo solicita. Revise las concesiones
resultantes después de la instalación y actualización; no asuma que su política existente cubre la
nueva superficie.
Consulte [Permisos y acceso](/es/concepts/permissions-and-access/).

## Qué protegen realmente las protecciones

Existen protecciones, y leerlas le indica cuál es el modelo de amenazas.

El archivo que nombra un punto de llamada se resuelve dentro del propio directorio de ese
complemento. Se rechaza una ruta que escape de él y se registra como evento de seguridad. El nombre
del directorio de un complemento está restringido a letras, dígitos, el guion bajo y el guion. El
registro de puntos de llamada y ámbitos solo se acepta desde una función cuyo nombre parezca una
rutina de instalación, actualización o configuración; una llamada desde cualquier otro lugar se
rechaza y se registra.

La protección de ruta restringe qué archivo puede incluir una fila de punto de llamada. La
comprobación de registro solo examina el nombre de una función emisora en busca de instalación,
actualización o configuración; no autentica una operación del ciclo de vida. El código del
complemento puede usar dicho nombre en una carga de página ordinaria, por lo que esta convención no
es un límite de seguridad.

No hacen nada con respecto a lo que hace el código del propio complemento una vez que se ejecuta.
No son un límite de contención y no fueron construidas como tal.

## Deshabilitado no es apagado

Algunos tipos de puntos de llamada se registran en estado habilitado en el momento de la
instalación: aquellos que proporcionan páginas de ajustes, matrices de configuración y definiciones
de formularios. Un complemento debe ser configurable antes de activarse, por lo que se ejecutan de
cualquier manera.

Por lo tanto, un complemento deshabilitado todavía tiene código que se incluye y ejecuta en algunas
cargas de página. Deshabilitar es un interruptor de funciones, y las URL directas de complementos
también requieren revisión. Si sospecha de código malicioso, aísle la instalación y revise el
procedimiento de eliminación antes de invocar la desinstalación, que a su vez ejecuta código del
complemento. Eliminar los archivos fuente por sí solo no limpia los registros ni revierte los cambios
en la base de datos.

## Los recolectores remotos obtienen una superficie más estrecha

Un complemento declara sus capacidades en su archivo de información: si funciona cuando el
recolector puede alcanzar la instalación principal, si funciona cuando no puede y si participa en la
recolección.

En un recolector, los puntos de llamada enumerados se verifican según los requisitos de capacidad.
Los puntos de llamada de transformación no enumerados todavía se despachan; los puntos de
notificación no enumerados pueden despacharse cuando está en línea o cuando el complemento declara
soporte de administración/visualización fuera de línea. Las omisiones no se registran universalmente.
Esto es lógica de enrutamiento, no una lista de permitidos global ni un límite de aislamiento;
inspeccione el despachador exacto y el estado de conexión para el punto de llamada que utilice.

La razón es que un recolector es un entorno diferente. Su configuración es una réplica que puede
tener horas de antigüedad, y puede no tener ningún enlace con la base de datos central. Un punto de
llamada escrito bajo la suposición de que la base de datos central está a una consulta de distancia
es incorrecto allí, por lo que el modelo requiere que el complemento indique qué suposiciones hace
en lugar de inferirlas. Consulte [Recolección remota de datos](/es/concepts/remote-data-collection/).

## El sondeador es el lugar más costoso para engancharse

Un punto de llamada en la ruta de sondeo se ejecuta cuando se alcanza su punto de invocación. Su
frecuencia depende del evento, el proceso y el enrutamiento del recolector; no todos los puntos se
ejecutan en todos los procesos en cada ciclo. El código lento en una ruta frecuente consume el
intervalo de sondeo y puede contribuir a lagunas en los gráficos.

Un punto de llamada en una página se renderiza una vez para una persona que ya está esperando. Los
dos parecen iguales en la tabla de registro y difieren en órdenes de magnitud en el coste.

## Por qué la superficie parece desigual

La API de puntos de llamada expone sitios de invocación con diferentes propósitos y estructuras de
argumentos.

Por eso la lista es amplia e irregular, por qué algunos puntos le entregan un valor para cambiar y
otros solo le informan de que ocurrió un evento, y por qué los argumentos difieren en su estructura
de un punto de llamada al siguiente. Una versión mínima declarada del núcleo no establece
compatibilidad con todos los puntos de llamada: inspeccione los argumentos y las expectativas de
retorno de cada sitio de llamada, y pruebe el complemento en la versión de destino. Las limitaciones
de compatibilidad de CLI y concesión de ámbitos documentadas en
[Instalar y auditar complementos](/es/guides/install-and-vet-plugins/) también se aplican; la
instalación exitosa por sí sola no es prueba de compatibilidad.

La lectura práctica: un complemento está acoplado a la versión del núcleo contra la que se
escribió, mucho más estrechamente de lo que sugiere su mínimo declarado. Vuelva a comprobar los
complementos antes de una actualización del núcleo en lugar de después.
