---
title: Preguntas frecuentes
description: Respuestas concisas a las primeras dudas de recién llegados y usuarios actuales de Cacti, con enlace a la página explicativa correspondiente.
banner:
  content: Kadupul está en fase prealfa. El código está disponible, pero no hay una versión compatible con producción ni una migración validada. No lo uses en producción.
sidebar:
  order: 7
---

Respuestas concisas. Cada una enlaza con la página que trata el tema en profundidad.

## El proyecto

### ¿Puedo instalarlo hoy mismo?

El código fuente está disponible para tareas de desarrollo y pruebas en entornos aislados. No existe una versión con soporte ni una ruta de instalación validada para producción.

Las instrucciones de instalación y las guías prácticas deben cotejarse con el código real que utilice. Consulte [Estado del proyecto](/es/project/status/).

### ¿Está listo para entornos de producción?

No. El repositorio califica a Kadupul como prealfa y no apto para producción. El estado de publicación no indica si alguien ha llegado a implementar código en desarrollo.

### ¿Se trata de un sustituto directo de Cacti?

Kadupul es una bifurcación independiente con prioridades de desarrollo y canales de soporte propios. Se encuentra en fase prealfa; una migración exige validar las versiones y extensiones en uso. Consulte [Migración desde Cacti](/es/guides/coming-from-cacti/).

### ¿Por qué un proyecto independiente?

Kadupul brinda un espacio para sustituir subsistemas, elevar los requisitos del lenguaje y adaptar las interfaces internas bajo una política de publicaciones propia. Consulte [Por qué existe esta bifurcación](/es/project/why-this-fork/).

### ¿De qué versión de Cacti procede la bifurcación?

La aplicación se deriva de Cacti 1.2.31. El repositorio mantiene las ramas `main` y `lts/1.2` con diferentes propósitos de lanzamiento. Consulte [Estado del proyecto](/es/project/status/).

### ¿Quién gestiona su mantenimiento?

El proyecto Kadupul mantiene el repositorio. Emplee el gestor de incidencias y el [proceso de contribución](/es/project/contributing/) para cualquier labor técnica.

### ¿Hay una hoja de ruta, una frecuencia de lanzamientos o una política de soporte?

El repositorio cuenta con objetivos de entrega, una política de versiones y un marco de colaboración. Aún no existe una versión de producción con soporte formal. Consulte [Estado del proyecto](/es/project/status/) para distinguir entre versiones proyectadas y artefactos ya publicados.

### ¿Está vinculado a The Cacti Group?

No. Kadupul no está afiliado a The Cacti Group ni cuenta con su respaldo. Se define como una bifurcación de Cacti por ser una descripción factual acerca de la procedencia del código. Cacti es su proyecto y su marca.

### ¿A qué se debe el nombre?

Kadupul es el vocablo cingalés que designa a un cactus de floración nocturna. Cacti toma su denominación de la familia botánica en su conjunto; Kadupul es una especie englobada en ella. Este nombre refleja el origen del proyecto sin pretender erigirse en la totalidad del mismo. Encontrará una explicación más amplia en [Qué es Kadupul](/es/start/what-kadupul-is/).

## Migración desde Cacti

### ¿Funcionarán mis plugins?

Ese es el propósito. La API de plugins figura entre los cuatro objetivos fundamentales de compatibilidad. Cargar y ejecutar un plugin de Cacti sin modificaciones debe demostrarse empíricamente para las versiones utilizadas.

La compatibilidad representa una meta, no una garantía universal para cualquier plugin. Compruebe los plugins y versiones de los que realmente depende antes de plantear una migración. Consulte [Compatibilidad con Cacti](/es/project/compatibility-with-cacti/) y [Migración desde Cacti](/es/guides/coming-from-cacti/).

### ¿Seguirán funcionando mis archivos RRD?

La conservación del histórico RRD es un compromiso de compatibilidad esencial. Dichos archivos contienen información histórica imposible de recrear. Valide la lectura de los archivos existentes sobre una copia antes de acometer una migración.

Cualquier procedimiento que requiera desecharlos y crearlos desde cero plantea algo que debería rechazar. Consulte [Migración desde Cacti](/es/guides/coming-from-cacti/).

### ¿Se conservarán mis plantillas y la base de datos?

Las plantillas están diseñadas para importarse sin cambios. El esquema relacional se concibe para permanecer reconocible y susceptible de migración sin recurrir a formatos de exportación intermedios. Son metas que precisan validación, al igual que los plugins y los archivos RRD.

### ¿Cómo sabré en qué aspectos difieren Kadupul y Cacti?

Leyéndolo por escrito. El problema que el proyecto persigue eludir no radica en la divergencia funcional, que constituye la razón de ser de una bifurcación, sino en la discrepancia indocumentada, que transformaría cada actualización en una investigación.

### ¿Funciona con Spine?

Kadupul mantendrá una bifurcación de Spine de forma paralela al recolector PHP. La ubicación de su repositorio y los binarios validados no están aún detallados en este sitio. Spine se compila e instala por separado. La integración heredada comprende el parámetro `poller_type` y las rutas del sistema, la línea de comandos del recolector principal, los valores que Spine lee y las tablas en las que escribe.

Valide conjuntamente sus versiones de Kadupul y Spine antes de realizar la transición definitiva. Informe de cualquier anomalía en el [gestor de incidencias de Kadupul](https://github.com/kadupulhq/kadupul/issues). Consulte [Spine, el recolector en C](/es/reference/spine/) para pautas sobre compilación y ajustes.

### ¿Es compatible con el proxy de RRDtool?

Kadupul no emplea el demonio proxy gestionado por la organización Cacti. Recurra al almacenamiento local de RRDtool. La página [Referencia del proxy de RRDtool](/es/reference/rrdproxy/) recoge el protocolo de cliente heredado; no constituye una alternativa de despliegue admitida. Antes de documentar formalmente el uso de un proxy, deberá establecerse y validarse un reemplazo desarrollado por Kadupul.

### ¿Qué se necesita para ejecutarlo?

Un servidor web provisto de PHP, base de datos MySQL o MariaDB, RRDtool y un sistema de programación de tareas que invoque el recolector periódicamente. Las versiones y extensiones exigidas se especifican en [Requisitos](/es/reference/requirements/).

## Gestión de licencias

### ¿Bajo qué licencia se distribuye el software?

GPL-3.0-or-later.

### Cacti indica GPL-2. ¿Cómo puede una bifurcación ser GPL-3?

La licencia de la aplicación original autoriza explícitamente el empleo de la GPL versión 2 o cualquier versión más reciente. Kadupul hace uso de esa alternativa de versión posterior para su distribución. Las dependencias externas conservan sus propios términos. Consulte [Licencia](/es/project/license/).

### ¿Qué licencia ampara esta documentación?

CC BY-SA 4.0. El código de este sitio permanece bajo la licencia GPL-3.0-or-later junto con el resto del proyecto. Es posible reutilizar los textos siempre que se reconozca la autoría del proyecto y se licencien las obras derivadas con condiciones equivalentes.

### ¿Cuál es la procedencia de estas páginas?

Estas páginas describen el comportamiento real extraído directamente del código fuente de la aplicación. La documentación de terceros exige un análisis jurídico independiente antes de su reutilización.

Este principio rige igualmente para las colaboraciones. Las adaptaciones documentales justifican sus premisas en el código. Consulte [Colaborar](/es/project/contributing/).

## Participación

### ¿Cómo notifico una vulnerabilidad de seguridad?

De forma confidencial, mediante las GitHub Security Advisories en el repositorio afectado. Nunca abriendo una incidencia pública.

El código aún no publicado puede haber sido desplegado y albergar vulnerabilidades. Remita la notificación en privado con independencia del estado de lanzamiento. Consulte nuestra [Política de seguridad](/es/project/security/).

### Una vulnerabilidad detectada aquí concierne probablemente también a Cacti. ¿Qué procede hacer?

Notifíquela confidencialmente a Kadupul adjuntando la información que posea sobre el código compartido. El equipo de mantenimiento de Kadupul se encarga de la clasificación y corrección para Kadupul con arreglo a la [política de seguridad del repositorio](https://github.com/kadupulhq/kadupul/blob/main/SECURITY.md).

### ¿Cómo puedo colaborar?

Examine el documento [Colaborar](/es/project/contributing/) y las pautas para colaboradores en la rama en la que desee trabajar. Dialoge acerca de las modificaciones de envergadura antes de su puesta en práctica.

### He advertido un error en este sitio.

Excelente. Cada página ha sido elaborada tomando como base el código fuente, por lo que cualquier inexactitud responde a hechos concretos. Cada artículo incorpora un enlace para facilitar su edición.
