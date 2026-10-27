---
title: "Usar y validar plantillas"
description: "Elija identidades, revise importaciones y verifique la propagación sin perder el historial RRD."
banner:
  content: "Kadupul está en fase prealfa. Valide estos procedimientos en una instalación de prueba aislada. Traducción en borrador pendiente de revisión lingüística."
---

## Elegir las definiciones adecuadas

Las plantillas de dispositivo ofrecen plantillas de gráficos y consultas de datos; las plantillas de datos definen entradas y almacenamiento. Duplique una plantilla similar si necesita una identidad separada y revise las dependencias compartidas. Duplicar no independiza cada entrada o perfil referenciado. Antes de cambiar definiciones en uso, guarde una exportación y un respaldo coherente de la base de datos y los RRD. Consulte los conceptos de plantillas.

## Vista previa y aplicación deliberada

En una instalación aislada, revise la procedencia del XML, las identidades de destino y el perfil de almacenamiento elegido. Desde la raíz de la aplicación, previsualice el XML de plantilla simple:

```sh
php cli/import_template.php --filename=/secure/template.xml --preview
```

La rama `main` actual devuelve un estado distinto de cero por entradas ilegibles, XML mal formado y fallos registrados por objeto. Revise también los diagnósticos y resultados por objeto; una importación puede actualizar identidades existentes. Los paquetes usan otra ruta que escribe archivos. Consulte importación y exportación.

## Verificar objetos derivados e historial

Después de aplicar, compruebe dispositivos representativos, correspondencias locales de elementos de gráficos, valores personalizados y mediciones recopiladas. Cambiar asociaciones de plantillas de dispositivo requiere su operación de sincronización separada. Guardar una plantilla de datos no modifica la estructura de los RRD existentes; inspeccione el archivo real antes de cambiar paso, heartbeat o retención. Detenga los procesos de escritura antes de una recuperación coordinada y restaure el respaldo coherente si hace falta. Consulte plantillas personalizadas y retención.

[Conceptos de plantillas](/es-419/concepts/templates/) · [Importación y exportación](/es-419/guides/import-and-export-templates/) · [Plantillas personalizadas](/es-419/guides/create-custom-templates/) · [Retención](/es-419/guides/manage-data-retention/)

Base de la aplicación verificada el 26 de octubre de 2026: [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
