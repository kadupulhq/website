---
title: Permisos y acceso
description: Por qué el acceso está dividido en dos sistemas independientes, por qué un permiso se almacena como un valor predeterminado más excepciones y por qué un árbol se ve diferente para cada cuenta.
banner:
  content: Kadupul está en fase prealfa. Valide estos procedimientos en una instalación de prueba aislada. Traducción en borrador, pendiente de revisión por una persona con dominio del idioma.
sidebar:
  order: 8
---

El acceso cuenta con comprobaciones independientes de realms y de políticas sobre objetos. Los realms
controlan qué funciones de la interfaz puede emplear una cuenta; las políticas de objetos determinan
los gráficos, dispositivos, plantillas y árboles permitidos. Una solicitud puede depender de ambos factores.
Las concesiones de realm no otorgan por sí mismas acceso a gráficos, y las concesiones de gráficos no
conceden funciones de consola. El estado de la cuenta, el modo de autenticación y los ajustes de vista
también influyen.

Esta página expone las razones del diseño de este modelo. Para los aspectos prácticos de la configuración
de una cuenta, consulta [Gestionar usuarios y permisos](/es-419/guides/manage-users-and-permissions/).

## Por qué dos sistemas

Ambas cuestiones pertenecen a ámbitos distintos.

Alcanzar una página es un asunto de código. O bien la cuenta está autorizada para ejecutar el editor
de dispositivos o no lo está, y existe una única respuesta para toda la instalación. Ver un dispositivo
es un asunto de datos. Hay miles de dispositivos y la respuesta varía para cada uno de ellos.

Fusionarlos supondría gestionar un permiso por página y por objeto, es decir, el producto de dos listas
en constante crecimiento. Separarlos permite disponer de una lista de apartados de interfaz, reducida
y fija, y de un conjunto de reglas por objeto. El costo de la separación radica en que ambos deben
configurarse, y una cuenta mal configurada en cualquiera de los dos muestra el mismo síntoma de acceso denegado.

## Los realms son una lista numerada fija

Un realm identifica un permiso de interfaz mediante un número. Las correspondencias del núcleo asocian
páginas con realms, mientras que los plugins pueden registrar realms adicionales. Comprueba los realms
exigidos y la identidad para la ruta efectiva, en lugar de interpretar el acceso a una página como una
decisión integral de autorización sobre los objetos.

Se usan números y no nombres de archivos porque un realm abarca diversas páginas y los archivos pueden
renombrarse. El número perdura; la lista de archivos asociada es una correspondencia que puede alterarse
sin tocar ninguna cuenta.

Los realms de una cuenta proceden de sí misma y de los grupos activos a los que pertenece, combinados
mediante unión. Los roles son conjuntos de números de realm aplicados en una sola operación. Un rol
traslada sus números a la cuenta y concluye su función: es un punto de partida y no un vínculo dinámico,
de modo que una cuenta creada a partir de un rol no se ve afectada si este se modifica posteriormente.

Los plugins añaden realms propios, almacenados por separado y gestionados por las cuentas exactamente
igual que los realms del núcleo. Todo plugin incorpora así nueva superficie bajo control de acceso que
tus políticas existentes deben revisar de forma explícita. Consulta [Plugins](/es-419/concepts/plugins/).

## Los objetos se almacenan como un valor predeterminado más excepciones

Cuatro clases de objetos gestionan permisos: gráficos, dispositivos, plantillas de gráficos y árboles.

Para cada clase, una cuenta (o un grupo) mantiene una política predeterminada y una lista de excepciones.
Una excepción es una fila elemental: quién, qué objeto, qué clase. Dicha fila es idéntica en ambos modos
de política. La política determina el sentido de la fila.

Esta es la decisión fundamental sobre la que descansa el modelo. En las tablas de excepciones solo se
almacena la discrepancia respecto a la regla predeterminada. Las reglas de Permitir por defecto sin
excepciones pueden otorgar un acceso amplio sin generar filas de excepción; las filas de cuenta, reglas
predeterminadas y realm continúan existiendo. Cinco dispositivos explícitamente permitidos bajo una regla
de Denegar por defecto requieren cinco excepciones de dispositivo, si bien otras concesiones de gráficos
y métodos pueden influir en la visibilidad. Sea cual sea la orientación del entorno, los datos almacenados
mantienen el tamaño de la parte significativa y no el del conjunto total.

## Por qué existen ambos modos de política

| Modo | Significado | Comportamiento al añadir un dispositivo |
|---|---|---|
| Permitir, con excepciones | Objetos de esa clase salvo las exclusiones listadas | La política de dispositivos admite el nuevo objeto; se aplican el resto de comprobaciones |
| Denegar, con excepciones | Únicamente los objetos listados de esa clase | Este origen no concede ningún dispositivo nuevo; otros orígenes o permisos de gráfico pueden facilitar acceso |

Las reglas predeterminadas difieren en su tratamiento de los objetos nuevos. Elige el alcance de la política
y la conducta ante fallos de forma deliberada; ninguna de las dos opciones describe la totalidad de las
comprobaciones de acceso de la solicitud.

«Todos los miembros del departamento de redes, excepto los dos bastidores de contabilidad» son dos filas
bajo Permitir y cuatro mil bajo Denegar. «Este consultor externo, limitado a estos cinco dispositivos»
son cinco filas bajo Denegar y cuatro mil bajo Permitir. Obligar a un único modo forzaría a que la mitad de
las políticas reales tuvieran que redactarse enumerando el parque al completo, y una lista de tal magnitud
nunca se mantiene al día.

Una regla de Permitir por defecto incorpora los nuevos objetos de su clase a menos que se excluyan. Una
regla de Denegar por defecto exige una excepción explícita desde ese origen. Son definiciones semánticas
de política predeterminada, no garantías sobre la gestión de errores. Analiza a otros usuarios o grupos
y los métodos de permisos de gráficos antes de deducir que una regla de Denegar sobre dispositivos oculta
sus gráficos asociados.

## El acceso es una unión y no existe la denegación

El acceso efectivo se evalúa combinando la política propia de la cuenta y la de cada grupo activo al que
pertenece. Para el acceso a gráficos, aplica primero el método de gráfico seleccionado dentro de cada
origen por separado y luego une los resultados. Bajo el método Restrictivo, la concesión de un dispositivo
en un grupo y la de una plantilla en otro no forman la combinación requerida.

No existe una denegación de grupo que anule una concesión proveniente de otro origen. Una exclusión bajo
una regla de Permitir por defecto solo elimina la aportación de dicho origen; no es una denegación general.
Quitar esa exclusión amplía el acceso, a diferencia de suprimir una concesión bajo Denegar. Se trata de
una acotación consciente: un modelo con concesiones y denegaciones necesita reglas de prioridad, y las
reglas de prioridad hacen que los sistemas de permisos resulten imposibles de auditar mediante una simple lectura.

Las repercusiones deben formularse con claridad.

Revocar el acceso exige suprimirlo de la cuenta y de cada grupo que lo otorgue. Eliminarlo en un punto
no produce efecto si otro origen sigue concediéndolo.

Inhabilitar un grupo elimina sus concesiones para todos los integrantes simultáneamente, convirtiendo
al grupo en un recurso de revocación mucho más eficaz que una sucesión de ediciones individuales.

No es posible responder a «¿qué puede ver esta cuenta?» examinando una sola fila. Debes combinar las cuatro
políticas y listas de la cuenta con los datos homólogos de cada grupo.

## Por qué el permiso de gráficos tiene cuatro métodos

Un gráfico posee una triple condición. Es él mismo, corresponde a un dispositivo y se construyó a partir
de una plantilla de gráficos. Los tres elementos pueden llevar permisos, por lo que el modelo debe
determinar qué combinación es válida. Dicha elección constituye un ajuste general de la instalación.

| Método | Pregunta formulada | Conjuntos de excepciones consultados |
|---|---|---|
| Permisivo | ¿Se permite cualquiera de los tres? | Tres |
| Restrictivo | ¿Se permite el gráfico, o se permiten tanto el dispositivo como la plantilla en un mismo origen? | Tres |
| Basado en dispositivo | ¿Se permite el gráfico o el dispositivo? | Dos |
| Basado en plantilla de gráficos | ¿Se permite el gráfico o la plantilla? | Dos |

Estas directrices reflejan las comprobaciones de autorización implementadas. Las concesiones directas
de gráficos se mantienen activas en los cuatro métodos; optar por el método Basado en dispositivo no las
anula. Evalúa el rendimiento con las políticas y volúmenes reales en lugar de asumir que la cantidad
de conjuntos de excepciones anticipa el costo de la consulta.

El método Permisivo es el predeterminado y el que suele sorprender a los administradores. En él, autorizar
una plantilla de gráficos da acceso a cualquier gráfico derivado de ella, en cualquier dispositivo,
incluidos aquellos a los que la cuenta nunca tuvo acceso. El modelo actúa exactamente como se define.
Ocurre simplemente que esa definición no coincide con lo que la mayoría intuye.

## Los permisos se compilan en consultas

El filtrado de permisos sobre listas de gráficos se incorpora a las consultas de base de datos. Una
página que exhiba veinte de cuatro mil gráficos no puede recuperar cuatro mil filas para descartar a
posteriori las no autorizadas para la cuenta: el recuento resultaría inexacto, la paginación errónea
y el trabajo variaría en función del parque total y no de la página.

Por ello, las políticas y listas de excepciones se traducen en cláusulas de unión (join) y filtro (where)
entregadas a la base de datos. El modelo de permisos se estructuró en parte para soportar dicha traducción.
Los conjuntos de identificadores y una marca predeterminada se compilan de forma limpia en SQL. Una lógica
arbitraria por objeto no admite esa conversión.

El circuito de gráficos dispone de un atajo para permisos amplios, como la regla de Permitir gráficos
por defecto sin excepciones en un usuario. No extrapoles este comportamiento a cualquier clase de objeto
o punto de acceso. Las comprobaciones de realm, estado de cuenta y visualización siguen siendo necesarias;
la optimización de consultas de permisos no sustituye a las pruebas de acceso.

## Los árboles son un eje independiente

Los permisos sobre árboles y sobre gráficos se verifican de manera desacoplada. Obtener acceso a un árbol
no autoriza su contenido. Tener permiso sobre un gráfico no exige disponer de acceso a un árbol.

Un árbol es una presentación de objetos, no un contenedor que ostente su propiedad. Un mismo gráfico
puede figurar en cinco árboles distintos. Si el árbol concediera acceso a sus elementos, editarlo
equivaldría a editar permisos, y cualquiera con facultades para organizar gráficos podría publicarlos.

Lo que hace el árbol es ocultar los nodos vacíos. Una rama se despliega cuando contiene algún elemento
visible para la cuenta, aplicándose la comprobación de forma recursiva: una rama cuyas subramas queden
vacías para esa cuenta se oculta también. Dos usuarios que abran el mismo árbol verán configuraciones
distintas, sin marcadores que sugieran lo que el otro visualiza.

Esta verificación de ausencia de elementos conlleva un costo. Explora la rama y formula de forma
recursiva las consultas sobre gráficos y dispositivos encontrados. Un árbol profundo sumado a un método
costoso de permisos de gráficos interactúan de forma desfavorable, razón por la cual existen métodos más directos.

La repercusión en la auditoría reviste mayor importancia que la de rendimiento. **Una vista en árbol no
es un informe de lo que una cuenta puede acceder.** Es un informe de lo que una cuenta puede acceder
*y que alguien ha dispuesto en ese árbol*. Para auditar accesos, examina las políticas y verifica
peticiones reales admitidas y denegadas. La vista de Política efectiva procede de un desarrollo
independiente a las comprobaciones de autorización, por lo que su indicación y cuadro de texto no deben
tomarse como prueba concluyente. Consulta [Auditar quién puede ver qué](/es-419/guides/audit-who-can-see-what/).

## Almacenamiento en caché y por qué los cambios surten efecto en momentos imprevistos

Las resoluciones de permisos se guardan en la caché de la sesión, evitando reiterar la misma comprobación
en cada página cargada. Cualquier modificación efectuada por un administrador marca como desfasadas las
respuestas en caché de la cuenta afectada; la siguiente página que cargue dicha cuenta reconstruirá los
datos en lugar de aguardar a un nuevo inicio de sesión.

Inhabilitar una cuenta suprime las credenciales persistentes, las autorizaciones en caché y las sesiones
en el servidor. Las solicitudes protegidas verifican asimismo la condición de cuenta habilitada/bloqueada;
una página ya cargada en un navegador no se borra de inmediato. Las rutas con acceso para invitados pueden
asociar una identidad de invitado independiente según su configuración, de modo que una respuesta exitosa
no prueba por sí sola que la cuenta inhabilitada conserve acceso.

Comprueba los cambios empleando sesiones previas y nuevas, revisando tanto los accesos conservados como
los revocados y registrando el contenido y la identidad en la respuesta. No emplees el código de estado
HTTP como única confirmación de autorización, ni asumas que todos los componentes que usan la caché se
actualizan al unísono.
