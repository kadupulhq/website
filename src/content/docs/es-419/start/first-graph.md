---
title: Interpretar el primer gráfico
description: Qué significan realmente las líneas y los tres errores que llevan a interpretarlas mal.
sidebar:
  order: 4
banner:
  content: Kadupul está en fase prealfa. Valide estos procedimientos en una instalación de prueba aislada. Traducción en borrador, pendiente de revisión por una persona con dominio del idioma.
---

Un gráfico aquí no es una imagen de sus datos. Es una imagen de un resumen de sus datos, y saber qué resumen importa.

## Qué está observando

Cada gráfico se dibuja a partir de un archivo circular (round-robin archive). El archivo almacena muestras recientes con resolución completa y muestras más antiguas consolidadas en intervalos más gruesos. Cuando amplía la vista a un año, no está viendo cada muestra de cinco minutos. Está viendo un único valor por intervalo, seleccionado por una función de consolidación.

Esa función suele ser el promedio. También puede ser el máximo o el mínimo. Esto importa más que cualquier otra cosa en la página.

Para una petición ordinaria de gráfico bajo demanda, Kadupul genera un comando de RRDtool a partir de la configuración del gráfico y lo ejecuta sobre los archivos en disco. Hay tres tipos de líneas que forman ese comando y conviene saber cuál es cuál.

| Parte | Qué hace |
|---|---|
| Una definición | Nombra un archivo, una fuente de datos en su interior y una función de consolidación |
| Un elemento de trazado | Convierte una serie en una línea, un área o una franja apilada |
| Un elemento de leyenda | Muestra un número, calculado sobre la ventana de tiempo que está visualizando |

Todo el proceso se describe en [Cómo se dibujan los gráficos](/es-419/concepts/how-graphs-are-drawn/). No lo necesita hoy. Solo necesita saber que la definición del gráfico y el rango de tiempo solicitado determinan la imagen. Las rutas de caché y de gráficos en tiempo real pueden comportarse de forma diferente.

## Comience con las últimas cuatro horas

Comience con una ventana reciente y corta. El archivo seleccionado depende de la retención, del paso y de la resolución del gráfico; cuatro horas no garantizan datos sin procesar o no consolidados. Incluso el archivo más preciso contiene valores normalizados en el tiempo. Utilice el comando de depuración del gráfico y `rrdtool info` para comprobar la función solicitada y los pasos de archivo disponibles antes de comparar valores.

Dos características de un gráfico nuevo son normales y, aun así, suelen alarmar.

**La línea puede terminar antes del momento actual.** El intervalo actual puede estar incompleto. La sincronización de la recolección, el almacenamiento en búfer y la normalización también pueden retrasar el punto final visible. Compruebe que las marcas de tiempo de actualización avanzan en lugar de considerar un desfase fijo como prueba de salud.

**El primer tramo puede faltar.** Una fuente de datos creada hace una hora tiene una hora de datos y once meses de nada. El archivo se asigna por completo en el momento de la creación, por lo que la parte vacía es almacenamiento real esperando a ser utilizado.

## Luego amplíelo y observe cómo cambia el pico

Amplíe el rango a una semana. Los picos pueden reducirse cuando el gráfico selecciona promedios más gruesos. Por ejemplo, si la utilización es del 100% durante cinco minutos y cero durante los 55 minutos restantes, el promedio por hora es de aproximadamente el 8,3%. Una ráfaga de cuatro minutos en una hora que por lo demás estuvo inactiva promedia alrededor del 6,7%. Los picos cortos ya pueden estar suavizados dentro del intervalo de muestreo original.

La consolidación descarta detalles. Si el historial de alta resolución ha caducado, volver a acercar el zoom no puede reconstruirlo a partir de un archivo de promedios.

Este es el primero de los tres errores, y el que genera más discusiones.

**Interpretar un promedio como un pico.** Si le preocupa la saturación, observe un gráfico basado en el máximo, no en el promedio. Eso solo funciona si los archivos conservan máximos. Si solo quedan promedios gruesos, los picos originales no se pueden reconstruir. Un archivo MAX conserva los máximos de sus puntos de entrada normalizados en el tiempo, no un pico instantáneo no observado entre sondeos.

Hay una falla silenciosa aquí que conviene conocer. Si un elemento del gráfico solicita máximos y el archivo no los tiene, el asistente de selección de Kadupul puede recurrir a la primera función disponible, o a AVERAGE cuando no puede determinar las funciones disponibles. La imagen parece correcta, pero está respondiendo a una pregunta diferente.

**Interpretar un hueco como un cero.** Un hueco representa un valor trazado desconocido. Entre las causas se incluyen actualizaciones faltantes, entradas explícitamente desconocidas, valores rechazados y expresiones del gráfico. No identifica de forma unívoca a un dispositivo no disponible.

El latido es el tiempo máximo permitido entre actualizaciones, no un tiempo adicional sumado al paso. Por ejemplo, un paso de 300 segundos con un latido de 600 segundos permite como máximo 600 segundos entre actualizaciones, no 900. Los umbrales de datos desconocidos del archivo también afectan a los huecos visibles. Consulte [Definiciones de fuentes de datos de RRDtool](https://oss.oetiker.ch/rrdtool/doc/rrdcreate.en.html) y [Tiempo e intervalos](/es-419/concepts/time-and-intervals/).

Tenga cuidado con los gráficos apilados aquí. Algunas plantillas sustituyen los valores desconocidos por cero en sus expresiones de gráfico. En esos gráficos, una interrupción y un período de inactividad se ven idénticos por diseño. Compruebe una vista sin apilar antes de concluir que un servicio quedó inactivo.

**Comparar dos gráficos con escalas verticales diferentes.** Dos gráficos colocados uno al lado del otro se escalarán cada uno según sus propios datos. Una pequeña elevación y una grande pueden parecer idénticas. Compruebe el eje antes de sacar conclusiones.

Mientras observa el eje, compruebe su base. Un gráfico puede etiquetar en millares o en unidades de 1024. Los números almacenados son idénticos; solo se mueven las etiquetas. La diferencia depende del prefijo: 1024 frente a 1000 es un 2,4% para una potencia y aumenta en prefijos mayores. Compruebe también bits frente a bytes, expresiones del gráfico y consolidación; una diferencia porcentual por sí sola no identifica la causa.

## Lectura de la leyenda

La leyenda contiene los números que importan más que la forma. El valor actual suele ser la reducción LAST de la serie seleccionada, que no tiene por qué ser una medición tomada en el instante exacto en que se visualiza el gráfico. El promedio y el máximo se calculan a lo largo de la ventana que está visualizando, no sobre todo el tiempo, por lo que cambian según se ajusta el zoom.

Las entradas de leyenda incluidas son mínimo, máximo, promedio y último, que se etiqueta como actual. Hay dos aspectos sobre ellas que suelen sorprender.

**Un número de leyenda es una reducción de lo que se dibujó, no de lo que se almacenó.** Un máximo mostrado sobre una serie leída con promedios es el máximo de esos promedios derivados con la resolución seleccionada. No es la muestra más grande tomada jamás. En un enlace ocupado son cifras muy distintas, y ambas son respuestas legítimas a preguntas diferentes.

**Compruebe qué serie utiliza la leyenda.** Las entradas GPRINT simples pueden heredar la serie del elemento trazado precedente; los elementos dedicados de mínimo, máximo, promedio y último tienen un tratamiento independiente. Por lo tanto, reordenar elementos en una plantilla de gráfico puede cambiar lo que informa la leyenda sin que nadie la haya editado. Si un número cambia tras modificar una plantilla no relacionada, compruebe primero el orden de los elementos.

## Cuando un gráfico parece incorrecto

Compruebe la ruta de recolección en este orden; puede haber fallas en más de una fase.

1. ¿El dispositivo está respondiendo en este momento?
2. ¿El sondeador se está ejecutando y finaliza dentro de su intervalo?
3. ¿El archivo RRD tiene una hora de actualización reciente?
4. ¿El gráfico está leyendo la fuente de datos que usted cree?

En la práctica:

**Paso 1.** Ejecute el mismo comando `snmpget` que ejecutó al agregar el dispositivo, desde el recolector asignado. Si falla, resuelva esa falla de recolección antes de juzgar el gráfico.

**Paso 2.** Busque el resumen de fin de ejecución. Si no aparece, revise la programación, el destino configurado para el registro y las fallas tempranas del sondeador. Una ejecución que supere el intervalo puede retrasar las actualizaciones; compare el hueco de actualización resultante con el latido.

**Paso 3.** Pregunte directamente a RRDtool:

```bash
rrdtool last /path/to/rra/the_file.rrd
rrdtool info /path/to/rra/the_file.rrd
```

`last` informa de la última marca de tiempo de actualización, incluidas las actualizaciones con valores desconocidos; las escrituras en búfer pueden retrasarla. Utilice `lastupdate` y `fetch` para inspeccionar los valores tal como se describe en la guía del dispositivo. `info` le indica el paso, el latido, el tipo de fuente de datos y qué archivos existen. Si el archivo no tiene un archivo de máximos, eso resuelve la duda anterior sobre los picos.

**Paso 4.** Active el modo de depuración del gráfico y examine el comando que genera. Nombra los archivos, las fuentes de datos en su interior y la función de consolidación para cada una. Es frecuente que un gráfico apunte a una fuente de datos distinta a la esperada después de volver a aplicar plantillas o reindexar interfaces.

## Síntomas y su significado habitual

| Lo que ve | Habitualmente |
|---|---|
| Línea plana en cero | Podría ser un cero real o una expresión que sustituye valores desconocidos por cero |
| La línea se detiene y luego continúa | Un valor desconocido interrumpió la serie trazada; compruebe la recolección y las expresiones del gráfico |
| Pequeños huecos constantes | El sondeador termina con retraso o el latido se configuró demasiado cerca del paso |
| Pico visible a cuatro horas, ausente a una semana | Compruebe la resolución del archivo y la consolidación antes de asumir pérdida de datos o una falla de recolección |
| El máximo de la leyenda es menor que el pico dibujado | La leyenda está reduciendo una serie distinta a la que cree |
| Todo el gráfico está vacío, sin error | No hay una fuente de datos detrás o todavía no se ha recolectado nada |
| Valores con un orden de magnitud incorrecto | Tipo de fuente de datos erróneo o contadores de 32 bits desbordándose |
| Dos gráficos del mismo enlace difieren ligeramente | Diferente base de eje o diferente consolidación |

[Solución de problemas de datos ausentes](/es-419/guides/troubleshoot-missing-data/) profundiza en este mismo procedimiento. [Ajustar el aspecto de los gráficos](/es-419/guides/tune-graph-appearance/) describe cómo cambiar la apariencia de un gráfico una vez que confíe en lo que muestra.

Con esto concluye el tutorial. Dispone de una instalación, un dispositivo que responde y un gráfico que puede interpretar. A partir de aquí, las [Guías prácticas](/es-419/guides/monitor-a-switch/) cubren tareas específicas y los [Conceptos](/es-419/concepts/architecture/) explican por qué el sistema funciona de esta manera.
