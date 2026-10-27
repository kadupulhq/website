---
title: Colaborar
description: Las necesidades del proyecto, los estándares de ingeniería exigidos en cada cambio y el criterio con el que se evalúan.
banner:
  content: Kadupul está en fase prealfa. El código está disponible, pero no hay una versión compatible con producción ni una migración validada. No lo uses en producción.
sidebar:
  order: 6
---

El código fuente está disponible y el repositorio detalla un proceso de contribución. Lea el documento [CONTRIBUTING.md](https://github.com/kadupulhq/kadupul/blob/main/CONTRIBUTING.md) antes de comenzar. Comente los cambios sustanciales en el gestor de incidencias antes de su desarrollo.

## El estándar

Mantenga cada solicitud de extracción (pull request) enfocada en un único propósito. Reproduzca un fallo antes de corregirlo, verifique el comportamiento modificado e incluya los comandos de validación y los resultados. Preserve las interfaces públicas a menos que el cambio incluya una migración documentada.

## Estándares de ingeniería

Siga las normas de la rama en la que esté trabajando. Consulte la guía de colaboradores y la configuración de CI actuales en lugar de suponer que ambas ramas aplican las mismas reglas.

### Estilo

En `main`, los archivos PHP editados siguen el estándar PHP-FIG PER-CS 2.0. Reformatee cada archivo afectado en un commit exclusivo para espacios en blanco y compruébelo mediante `tests/tools/check_php_style.sh`. La rama `lts/1.2` mantiene el formato de la versión original.

### Análisis estático

Ejecute las verificaciones requeridas por la rama de destino. Este sitio web no prescribe un nivel de PHPStan, una interfaz de registro ni una migración de carga automática que el repositorio no haya adoptado formalmente.

### Pruebas

Compruebe el comportamiento alterado por el parche. Incluya un caso de regresión para la corrección de errores y exponga los comandos empleados. Superar pruebas no relacionadas no valida la corrección.

### Dependencias

Explique el motivo por el cual se precisa una dependencia, revise su licencia y actualice el manifiesto y el archivo de bloqueo oportunos. Cumpla las reglas de dependencias y validación del repositorio.

### Commits y solicitudes de extracción

Utilice Conventional Commits y firme cada commit mediante `git commit -s` en virtud del [Developer Certificate of Origin](https://developercertificate.org/). Separe el formato de las modificaciones de comportamiento para que cada aspecto pueda ser revisado de forma independiente.

## El árbol heredado no cumple estos estándares

El árbol contiene patrones de implementación y formatos heredados. La adaptación se rige por las directrices de la rama de destino, y no por una reescritura indiscriminada de todo el proyecto.

### ¿Qué regla prevalece?

Aplique las indicaciones de `CONTRIBUTING.md` en la rama correspondiente. En `main`, rige la norma PER-CS para los archivos modificados; en `lts/1.2`, preserve el estilo heredado.

## Documentación

Compruebe las afirmaciones frente a la implementación y utilice material cuya licencia admita su incorporación. No copie textos de terceros sin comprobar su licencia. Notifique los hallazgos de seguridad mediante el [procedimiento de reporte confidencial](/es-419/project/security/).

## Compatibilidad

Las interfaces de complementos, las plantillas, la compatibilidad de base de datos y la información RRD constituyen objetivos de publicación. Documente cualquier cambio de interfaz y aporte pruebas de migración y compatibilidad. Consulte [Compatibilidad con Cacti](/es-419/project/compatibility-with-cacti/).
