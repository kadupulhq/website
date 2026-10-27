---
title: "Por qué existe esta bifurcación"
description: "Prioridades independientes y criterios de aceptación de la migración para 2026–2027."
sidebar:
  order: 1
banner:
  content: "Kadupul está en fase prealfa. Valide estos procedimientos en una instalación de prueba aislada. Traducción en borrador pendiente de revisión lingüística."
---

Kadupul es una bifurcación independiente de Cacti con sus propias decisiones de desarrollo, lanzamientos y soporte. Estas prioridades orientan la planificación de 2026–2027; no son fechas de entrega ni evidencia de preparación para producción.

## Prioridades de desarrollo

La rama `main` de la aplicación requiere PHP 8.4+ y combina servicios de Symfony 7.4 con rutas heredadas de la web, el sondeador y la CLI. La línea de mantenimiento `lts/1.2` tiene requisitos propios. La migración busca hacer explícitos los límites de los casos de uso, la autorización, el manejo de fallos y la verificación, conservando los contratos necesarios de recopilación y gráficos. Un servicio moderno o una batería de pruebas aprobada no demuestra que se haya migrado un flujo completo. Consulte la arquitectura.

## Compatibilidad y migración

Conservar plugins, plantillas, esquemas e historial RRD es un objetivo de lanzamiento que requiere evidencia por versión. Cada migración debe identificar la ruta activa de escritura, preservar las correcciones de mantenimiento aplicables y considerar el trabajo en cola o en curso. Ensaye la instalación, la recuperación y los cambios de esquema en una copia aislada con respaldos coherentes. Hoy no existe una ruta validada de migración a producción. Consulte compatibilidad y estado.

Estas prioridades describen Kadupul, no los planes de otro proyecto ni un acuerdo con sus responsables. Kadupul no está afiliado a The Cacti Group ni cuenta con su respaldo.

[Arquitectura](https://github.com/kadupulhq/kadupul/blob/cbd6117d6e1092ef887c66f9844bef004a65119e/docs/architecture.md) · [Compatibilidad](/es-419/project/compatibility-with-cacti/) · [Estado](/es-419/project/status/)

Base de la aplicación verificada el 26 de octubre de 2026: [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
