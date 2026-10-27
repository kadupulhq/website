---
title: "Compatibilidad con Cacti"
description: "Alcance, evidencia de verificación y límites de compatibilidad para planificar 2026–2027."
sidebar:
  order: 2
banner:
  content: "Kadupul está en fase prealfa. Valide estos procedimientos en una instalación de prueba aislada. Traducción en borrador pendiente de revisión lingüística."
---

La compatibilidad es un objetivo de lanzamiento, no una afirmación de que toda versión, plugin o plantilla de Cacti funciona sin cambios. Kadupul sigue en fase prealfa. Evalúe la revisión exacta del código y los componentes que utiliza antes de confiar en su comportamiento.

## Qué incluye

Compruebe hooks de plugins, comportamiento de argumentos y retornos, y permisos; identidades de plantillas, mapeos de entrada y propagación; semántica de esquemas, valores predeterminados y referencias; y rutas, campos, archivos de consolidación y valores retenidos de RRD existentes. Que un perfil de base de datos coincida no demuestra que el fichero RRD tenga la misma estructura. Los plugins se ejecutan como código de confianza de la aplicación, no en un sandbox. Consulte plantillas y evaluación de plugins.

## Qué significa en la práctica

Registre rama y revisión de la aplicación, PHP y dependencias bloqueadas, versiones de plugins, estado del esquema y configuración de almacenamiento. Pruebe recopilación, gráficos, autorización, fallos y recuperación en una copia restaurada aislada. Incluya recolectores remotos y trabajo en segundo plano cuando los utilice. Documente diferencias intencionales y carencias pendientes; las pruebas solo cubren las rutas que ejecutan. Consulte ensayo de actualización y respaldos.

## Qué no garantiza

No existe una garantía general de compatibilidad binaria, de esquema o plugins, ni una versión con soporte para producción ni una ruta de migración a producción validada. Revertir solo el código no deshace cambios en esquemas o RRD; la recuperación puede requerir el conjunto coherente de copias de seguridad. Use las fuentes mantenidas del proyecto y registre su procedencia, sin suponer que los ficheros de otro proyecto forman un paquete Kadupul probado. Kadupul no está afiliado a The Cacti Group ni cuenta con su respaldo. Consulte el estado.

[Plantillas](/es/concepts/templates/) · [Evaluación de plugins](/es/guides/install-and-vet-plugins/) · [Ensayo de actualización](/es/guides/upgrade-safely/) · [Respaldos](/es/guides/back-up-and-restore/) · [Estado](/es/project/status/)

Base de la aplicación verificada el 26 de octubre de 2026: [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
