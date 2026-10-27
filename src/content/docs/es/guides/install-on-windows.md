---
title: "Instalar desde un equipo Windows"
description: "Evalúe Kadupul en Linux desde Windows y conozca los bloqueos de Windows nativo."
banner:
  content: "Kadupul está en fase prealfa. Este procedimiento de plataforma no se ha validado de principio a fin. Traducción en borrador pendiente de revisión lingüística."
---

## Elegir el entorno de ejecución

La rama `main` actual requiere PHP 8.4+, `pcntl` y `posix`; PHP nativo de Windows no puede satisfacer esos requisitos Unix. No omita las comprobaciones de plataforma de Composer. Use una máquina virtual Linux o evalúe WSL 2 en una versión de Windows compatible con Microsoft. Son instalaciones Linux alojadas en Windows, no despliegues IIS nativos validados. Consulte las limitaciones de PHP.

## Preparar Linux e instalar

Para WSL, ejecute lo siguiente en PowerShell como administrador y reinicie si se solicita:

```powershell
wsl --install -d Ubuntu
wsl --list --verbose
```

Confirme la versión 2. Complete la creación de la cuenta Linux y siga la instalación dentro de Linux para la base de datos, extensiones PHP, recursos, servidor web y programador. Mantenga el código y los RRD en el sistema de ficheros Linux, fuera de `/mnt/c/`. Consulte las guías de Microsoft sobre WSL y sistemas de ficheros.

## Comprobar ciclo de vida y recuperación

Use cuentas dedicadas sin privilegios y un solo mecanismo de inicio de la recopilación. Verifique la confianza del almacenamiento, el sondeo, las marcas de tiempo de los gráficos y el reinicio después de reiniciar el equipo o apagar WSL. No suponga que una sesión de escritorio mantiene la recopilación. Haga copias de seguridad conjuntas de base de datos, configuración y RRD. El mantenimiento destructivo de RRD y la purga o archivo automáticos locales siguen sin estar disponibles en Windows nativo; el comportamiento de Linux no los valida. Consulte requisitos y copias de seguridad.

[Limitaciones de PHP](https://www.php.net/manual/en/pcntl.installation.php) · [Instalación](/es/start/install/) · [Guía WSL de Microsoft](https://learn.microsoft.com/en-us/windows/wsl/install) · [Sistemas de archivos](https://learn.microsoft.com/en-us/windows/wsl/filesystems) · [Requisitos](/es/reference/requirements/) · [Respaldos](/es/guides/back-up-and-restore/)

Base de la aplicación verificada el 26 de octubre de 2026: [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
