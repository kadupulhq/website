---
title: "Qué es Kadupul"
description: "Recopilación, almacenamiento, arquitectura y límites del proyecto para planificar 2026–2027."
sidebar:
  order: 1
banner:
  content: "Kadupul está en fase prealfa. Valide estos procedimientos en una instalación de prueba aislada. Traducción en borrador, pendiente de revisión por una persona con dominio del idioma."
---

Kadupul es una aplicación de monitorización de redes y generación de gráficos. Recopila mediciones mediante SNMP y scripts, almacena series temporales en ficheros RRD y genera gráficos con RRDtool. Esta descripción se verificó el 26 de octubre de 2026 con la revisión de la aplicación indicada abajo.
[`005d797cc`](https://github.com/kadupulhq/kadupul/tree/005d797cca3884f7f60e7778f631f2fcfedad4cf).

## Estado del proyecto para 2026–2027

Kadupul está en fase prealfa, sin una versión con soporte para producción ni una ruta de migración a producción validada. Use una instalación de prueba aislada. Las fechas de esta documentación sirven para planificar; no son compromisos de entrega. Consulte el estado del proyecto antes de elegir una revisión para evaluar.

[Estado del proyecto](/es/project/status/)

## Recopilación y programación

Un programador externo inicia el sondeador. Este lee una lista de recopilación preparada, invoca el recolector PHP o una compilación compatible de Spine y procesa los resultados. Los intervalos de recopilación son configurables; cinco minutos es un ejemplo, no una regla universal. Un mecanismo de inicio puede ejecutar varios ciclos más cortos dentro de su intervalo. Los tiempos de espera, los reintentos y la latencia de los dispositivos consumen ese tiempo disponible.

[Ciclo del sondeador](/es/reference/poller-lifecycle/)

## Retención y almacenamiento

Un fichero RRD tiene una estructura de almacenamiento elegida al crearlo. Las mediciones recientes pueden conservar más detalle que los valores antiguos consolidados; la retención está limitada por los archivos de consolidación configurados. No conserva todas las muestras para siempre. Los valores desconocidos representan observaciones faltantes o no utilizables, no ceros. Las colas, los registros y las estadísticas de la base de datos pueden crecer aunque los ficheros RRD existentes mantengan un tamaño fijo.

[Fuentes de datos y archivos de consolidación](/es/concepts/data-sources-and-rras/)

## Gráficos y términos compartidos

Un dispositivo es un punto supervisado. Una consulta de datos descubre elementos, como interfaces. Una fuente de datos describe una medición y su almacenamiento; un gráfico describe cómo representarla. Las plantillas reutilizan definiciones y los árboles organizan la navegación. Son registros separados: revise las opciones de eliminación y sus dependencias antes de quitarlos. Los gráficos se generan bajo demanda a partir de los datos retenidos; la caché de imágenes puede reutilizar un resultado ya generado.

[Glosario](/es/reference/glossary/)

## Componentes de la instalación

Una instalación funcional combina la aplicación web PHP, MySQL o MariaDB, almacenamiento RRD, RRDtool y un mecanismo de inicio de la recopilación. Las credenciales de dispositivos y la configuración residen en la base de datos o en ficheros de configuración protegidos. Haga una copia de seguridad del código, la configuración, las colas de la base de datos y el historial RRD como un conjunto coherente, y ensaye la restauración. Un volcado de la base de datos por sí solo no restaura los gráficos históricos.

[Copias de seguridad y recuperación](/es/guides/back-up-and-restore/)

## Main y la migración a Symfony

La rama `main` de la aplicación requiere PHP 8.4 o posterior y combina servicios de Symfony 7.4 con puntos de entrada web, del sondeador y de CLI heredados. La línea de mantenimiento `lts/1.2` tiene requisitos propios. Las rutas migradas coexisten con las heredadas; la existencia de un servicio Symfony no demuestra que el flujo antiguo se haya retirado. Las copias del código fuente necesitan dependencias PHP bloqueadas y recursos del navegador generados. Use los entornos de ejecución del fichero `mise.toml` de la aplicación.

[Guía de migración](https://github.com/kadupulhq/kadupul/blob/005d797cca3884f7f60e7778f631f2fcfedad4cf/docs/symfony-migration.md)

## Cuentas, plugins y acceso al almacenamiento

La visibilidad de dispositivos y gráficos depende de los permisos de usuarios y grupos. Los plugins se ejecutan como código de confianza de la aplicación, con el acceso de la cuenta del proceso; no están aislados en una zona de pruebas. Revise su procedencia, hooks y comportamiento de instalación y desinstalación antes de habilitarlos. Los procesos que escriben RRD locales en Unix requieren comprobaciones de identidad POSIX y una configuración explícita de confianza cuando las cuentas web y del sondeador son distintas. Windows no admite mantenimiento destructivo de RRD locales.

[Evaluación de plugins](/es/guides/install-and-vet-plugins/)

## Usos adecuados y límites

Evalúe Kadupul para interfaces de red, contadores de dispositivos, sensores ambientales y otras mediciones disponibles mediante métodos de recopilación que pueda validar. Es software autoalojado que requiere mantener la base de datos, el servidor web y el programador. El sondeo numérico del núcleo no es un almacén de registros, un sistema de trazas distribuidas ni un motor general de consultas por etiquetas de alta cardinalidad. Las alertas por umbrales dependen de plugins adecuados; verifique su compatibilidad en vez de suponer que funcionan inmediatamente después de instalar.

## Origen, nombre y compatibilidad

Kadupul es una bifurcación independiente de Cacti con licencia GPL-3.0-or-later, sin afiliación ni respaldo de The Cacti Group. Su nombre en cingalés, කඩුපුල්, se refiere a *Epiphyllum oxypetalum*, un cactus de floración nocturna. Conservar las interfaces de plugins, plantillas, esquemas e historial RRD existente es un objetivo de lanzamiento que requiere evidencia para cada revisión del código y combinación de plugins.

[Compatibilidad](/es/project/compatibility-with-cacti/)

## Empiece con un dispositivo verificado

Siga, en orden, la instalación, el primer dispositivo y el primer gráfico. Revise registros, marcas de tiempo de recopilación y valores utilizables antes de confiar en la imagen. Mida la duración de los ciclos y el trabajo en cola con sus dispositivos antes de ampliar la instalación. Consulte los conceptos para entender el diseño y los requisitos para conocer las condiciones previas.

[Instalación](/es/start/install/) · [Primer dispositivo](/es/start/first-device/) · [Primer gráfico](/es/start/first-graph/) · [Conceptos](/es/concepts/architecture/) · [Requisitos](/es/reference/requirements/)
