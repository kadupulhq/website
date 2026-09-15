---
title: "Qué es Kadupul"
description: "Consulta dispositivos mediante SNMP y scripts, guarda las mediciones en archivos RRD y genera gráficos."
banner:
  content: "Kadupul está en fase prealfa. El código está disponible, pero no hay una versión compatible con producción ni una migración validada. No lo uses en producción."
---

Kadupul es una bifurcación independiente de Cacti. Consulta dispositivos a intervalos regulares y utiliza RRDtool para almacenar y representar mediciones.

Esta página ofrece una introducción resumida. Consulta la página completa en inglés para más detalles. [English](/start/what-kadupul-is/)

## Qué es Kadupul

- Una aplicación PHP ofrece la interfaz y el instalador.
- MySQL o MariaDB almacena la configuración, los usuarios y la caché del sondeador.
- Los archivos RRD guardan mediciones según los períodos de retención y consolidación configurados. No conservan todos los datos para siempre.
- Un planificador inicia el sondeador. Los scripts de recopilación se ejecutan con los permisos de su usuario del sistema.

## Primeros pasos

Empieza con una instalación de prueba aislada, añade un dispositivo y comprueba que llegan datos antes de interpretar los gráficos. Conserva copias de seguridad y valida la recuperación.

- [Instalación](/es/start/install/)
- [Añadir el primer dispositivo](/es/start/first-device/)
- [Interpretar el primer gráfico](/es/start/first-graph/)
