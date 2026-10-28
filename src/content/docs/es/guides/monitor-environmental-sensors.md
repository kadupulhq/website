---
title: Supervisar sensores ambientales
description: Graficar temperatura, humedad, flujo de aire, potencia y estado de SAI por SNMP, localizar las OID correctas en una MIB de proveedor y aplicar parámetros gráficos que respondan a una medición y no a un contador.
banner:
  content: Kadupul está en fase pre-alfa. Valide estos procedimientos en una instalación de prueba aislada. Este es un borrador de traducción pendiente de revisión por un hablante fluido.
sidebar:
  order: 23
---

:::caution[Validar antes del uso]
El código fuente está disponible, pero no existe una versión compatible de Kadupul ni
una ruta de migración. Pruebe estos procedimientos en una copia aislada con copias de seguridad antes de
confiar en ellos. Consulte el [estado del proyecto](/es/project/status/).
:::

La temperatura, la humedad y la potencia instantánea son mediciones que suelen almacenarse como
`GAUGE`. La energía acumulada o los recuentos de eventos pueden exigir un tipo de contador.
Compruebe las unidades, la identidad y la semántica de cada objeto antes de escoger una plantilla.

Examine qué se incluye de serie antes de escribir nada por su cuenta.

## Qué se incluye

En el directorio nativo de consultas del código fuente solo residen cuatro definiciones de consultas de datos,
y ninguna de ellas concierne a parámetros ambientales.

| Consulta SNMP incluida | Ámbito |
|---|---|
| `interface.xml` | Interfaces de red |
| `host_disk.xml` | Almacenamiento Host Resources |
| `net-snmp_disk.xml` | Particiones declaradas UCD |
| `net-snmp_devio.xml` | E/S de dispositivos de bloques UCD |

La cobertura de sensores se incorpora a través de otras dos vías.

**Consultas mediante servidor de scripts, provistas en el paquete Net-SNMP.** Importe
`install/templates/NetSNMP_Device.xml.gz` para desplegar sus tres archivos XML de consultas lmSensors
en `resource/script_server/`. El script auxiliar
`scripts/ss_netsnmp_lmsensors.php` también se encuentra presente en el código fuente.

| Consulta | Tabla |
|---|---|
| Net-SNMP - Sensors - Get Thermal Sensors | `.1.3.6.1.4.1.2021.13.16.2.1` |
| Net-SNMP - Sensors - Get Fan Sensors | `.1.3.6.1.4.1.2021.13.16.3.1` |
| Net-SNMP - Sensors - Get Voltage Sensors | `.1.3.6.1.4.1.2021.13.16.4.1` |

El asistente utiliza columnas de índice, nombre y lectura. La consulta indexa sobre el valor numérico
`sensorDevice`; `sensorName` aporta un nombre para visualización que el asistente recorta a
18 caracteres. Los nombres no garantizan identidades unívocas para los sensores.

La vía ordinaria `get sensorReading` devuelve valores brutos: miligrados para el objeto histórico
de temperatura, milivoltios para tensión y RPM para ventiladores. El gráfico térmico
aplica un CDEF `Divide by 1000`. El gráfico de tensión carece de CDEF a pesar de su etiqueta Volts,
lo que constituye un [defecto de escalado confirmado](https://github.com/kadupulhq/kadupul/issues/247).

La vía independiente `query sensorReading` escala la temperatura y la tensión, e intenta
una conversión de tensión con signo usando la constante errónea 4294967294. También puede
[lanzar una excepción con lecturas no disponibles](https://github.com/kadupulhq/kadupul/issues/248).
No infiera unidades almacenadas a partir de esta salida de descubrimiento.

El asistente continúa usando la columna de temperatura heredada `.2.1.3`. La versión actual de
[LM-SENSORS-MIB](https://raw.githubusercontent.com/net-snmp/net-snmp/master/mibs/LM-SENSORS-MIB.txt)
declara obsoleto ese objeto sin signo en favor de la columna con signo `.2.1.4`; verifique la compatibilidad
y el comportamiento con temperaturas negativas en el agente real antes de adaptar una plantilla.

**Paquetes de dispositivos suministrados como archivos importables.** Varios integran sus propios
XML de consulta y los escriben en los directorios correspondientes durante la importación. Los pertinentes aquí:

| Paquete | Qué aporta |
|---|---|
| SNMP UPS | Consultas de líneas de entrada y salida UPS-MIB, junto con plantillas de OID fija para batería, autonomía, temperatura y alarmas |
| AKCP Device | Consultas por script para sensores de temperatura, humedad, flujo de aire y 4-20 mA |
| APC InfraStruXure PDU | Consultas de estadísticas de disyuntores y fases |
| APC InfraStruXure InRow CRAC | Consultas de estadísticas de unidades y grupos, incluyendo temperatura, humedad, flujo de aire y ventilación |
| BayTech PDU | Consulta de tomas y circuitos trifásicos, con corriente, tensión, potencia y temperatura |

Examine el paquete oportuno antes de elaborar una consulta manualmente. Siga
[Importar y exportar plantillas](/es/guides/import-and-export-templates/), verifique el despliegue de archivos
y el descubrimiento, y cree explícitamente los gráficos buscados. La mera existencia del paquete
no garantiza compatibilidad del dispositivo ni un escalado correcto; las deficiencias de SAI y
lmSensors detalladas a continuación demandan atención.

## Las dos formas que adopta un sensor

Para la recopilación SNMP, distinga objetos escalares de instancias de tablas indexadas.

**Una OID fija.** Un único valor escalar en una dirección determinada, idéntica en cada
dispositivo de ese modelo. Temperatura de la batería. Potencia de salida total. Emplee una fuente de datos
de OID fija: una petición SNMP get contra una OID literal y una fuente de datos por medición.

**Una tabla.** Un número indeterminado de lecturas descubiertas por dispositivo. Sondas de rack,
regletas de enchufes, mediciones por fase. Emplee una consulta de datos, que recorre la tabla,
aprende el índice y le permite designar qué filas se convertirán en gráficos.

El paquete de SAI (UPS) suministrado combina ambas. Respete la estructura de objetos de la MIB: un dispositivo
con una sola sonda de corriente puede presentarla, aun así, como fila de una tabla indexada.

| Medición de SAI (UPS) | Forma | OID |
|---|---|---|
| Temperatura de la batería | Fija | `.1.3.6.1.2.1.33.1.2.7.0` |
| Autonomía restante estimada | Fija | `.1.3.6.1.2.1.33.1.2.3.0` |
| Tiempo en batería | Fija | `.1.3.6.1.2.1.33.1.2.2.0` |
| Tensión de la batería | Fija | `.1.3.6.1.2.1.33.1.2.5.0` |
| Alarmas activas | Fija | `.1.3.6.1.2.1.33.1.6.1.0` |
| Tensión, corriente, potencia y frecuencia de entrada | Consulta | `.1.3.6.1.2.1.33.1.3.3.1` |
| Tensión, corriente, potencia y carga de salida | Consulta | `.1.3.6.1.2.1.33.1.4.4.1` |

Cada una de esas fuentes de datos es de tipo `GAUGE`. Ninguna es un contador. El archivo
de plantillas incluido estipula un paso de 60 segundos y un heartbeat de 600 segundos, un mínimo
de cero y ningún máximo, excepto la temperatura, que carece de mínimo. Compruebe el perfil importado
y la configuración real del RRD; tales declaraciones no establecen por sí mismas la cadencia efectiva de sondeo.
Una medición negativa válida precisa, además, un eje de gráfico capaz de mostrarla.

## Localizar las OID

Recorra el dispositivo antes de redactar nada. Está buscando tres elementos: una
tabla de mediciones, una tabla paralela de etiquetas y el multiplicador aplicado por el
fabricante, amén de objetos de validez o estado si estuvieran disponibles.

```bash
snmpwalk -v2c -c public probe.example.net .1.3.6.1.2.1.33
# Replace this example enterprise number with the vendor's actual number.
vendor_oid='.1.3.6.1.4.1.318'
snmpwalk -v2c -c public probe.example.net "$vendor_oid"
```

Sustituya el host y la comunidad de ejemplo por valores configurados y lance las comprobaciones desde el poller.
Cargue la MIB correspondiente y sus dependencias para examinar nombres, unidades y semántica;
la documentación técnica del fabricante también clarifica las OID numéricas. Un umbral próximo
o un código de estado no sustituyen a una medición.

```bash
snmptranslate -m +UPS-MIB -Td -OS .1.3.6.1.2.1.33.1.2.7
```

Es en la definición de la MIB donde se documenta el escalado. Un fabricante que informe
en décimas de grado lo hará constar en la descripción o en la cláusula de unidades del objeto, así como en
la documentación adjunta. Deducir a ojo a partir de una lectura puede transformar 23,5 grados
en un gráfico con valor 235.

Las MIB estándar cubren más de lo que se asume comúnmente. UPS-MIB en `.1.3.6.1.2.1.33` es
genérica para múltiples marcas. ENTITY-SENSOR-MIB suministra un valor de sensor acompañado
de sus propios campos de escala y precisión. Búsquelas antes de recurrir a un subárbol propietario.

Compare el descubrimiento entre reinicios y cambios de sondas representativos en un entorno de pruebas.
Dos recorridos sin cambios no demuestran estabilidad en los índices. Registre identificadores
estables de sensores siempre que existan antes de construir gráficos definitivos.

## Crear una fuente de datos de OID fija

Un sensor de OID fija precisa una plantilla de datos que utilice la entrada SNMP get, con
la OID como valor literal y un único elemento de fuente de datos. Fije el tipo a `GAUGE`,
asigne un valor real al mínimo solo cuando el sensor verdaderamente no pueda descender de él,
y deje el máximo indefinido salvo que el fabricante certifique un límite superior.

Los valores situados fuera de los márgenes de la fuente de datos RRD se descartan como desconocidos. Defina dichos límites
en las unidades brutas almacenadas, no en las unidades convertidas del gráfico; de lo contrario, lecturas
válidas pueden perderse antes de aplicar un CDEF de presentación.

## Crear una consulta de datos

Una consulta requiere una OID de índice, un método para convertir cada OID recorrida en un índice, y un
campo por cada columna deseada.

La consulta de salida de SAI (UPS) representa un práctico ejemplo ilustrativo. Indexa sobre la tabla de líneas,
extrae el índice del extremo de cada OID devuelta mediante una expresión regular, y
declara un campo de entrada para el índice y cuatro campos de salida para tensión,
corriente, potencia y carga. Las definiciones de salida abarcan método, origen, dirección y
OID de columna. Una OID de columna puede ser una raíz válida para el recorrido de índices; lo sustancial es
la concordancia entre el analizador de la consulta y las OID efectivas devueltas. Consulte [Consultas de datos e índices](/es/concepts/data-queries-and-indexes/) para comprender
cómo se selecciona y almacena el índice.

Seleccione el método de reindexación con deliberación. Las alternativas son: ninguno, ante retroceso del tiempo de actividad,
ante variación del total de índices, y Verificar todos los campos (Verify All Fields). Las tablas de sensores son el
escenario clásico donde fallan los métodos débiles: desconecte una sonda de una unidad de rack y enchufe otra distinta;
el total de elementos puede no alterarse mientras cada lectura ligada al índice pertenece ahora a un
sensor diferente. Una verificación exhaustiva consume operaciones SNMP en cada ciclo.
Verifique qué campos de identidad puede controlar la consulta: índices numéricos idénticos
o etiquetas recortadas/duplicadas no prueban que una sonda física sea la misma.
Actualice el descubrimiento y revise las asociaciones de gráficos tras cualquier sustitución.

## Escalar el valor

Decida dónde se realiza la conversión y ubíquela en un único punto.

| Dónde | Cuándo utilizarlo |
|---|---|
| En el script de recopilación | Respete el contrato documentado del colector; lmSensors get devuelve actualmente unidades brutas |
| En un CDEF en el elemento del gráfico | El valor bruto merece guardarse y la unidad visual es una elección estética |

Un CDEF constituye la respuesta habitual ante un multiplicador del fabricante. Los paquetes suministrados integran
definiciones como `Divide By 10`, articuladas a partir de la fuente de datos actual, `10` y
una división. Aplíquelas únicamente a objetos que compartan la correspondiente unidad bruta.

El paquete de SAI presenta [CDEF de potencia y tiempo incorrectos](https://github.com/kadupulhq/kadupul/issues/249):
su serie On Battery divide los segundos entre 6000 en lugar de 60, y las series de vatios de entrada/salida
dividen los vatios entre 10. Para un agente conforme a la norma, 600 segundos deben lucir como 10 minutos y 1000 vatios como
1000 vatios. La tensión de batería y la corriente de línea sí demandan división entre 10; la autonomía estimada ya viene en minutos. Consulte
las [unidades de objetos de SAI de la RFC 1628](https://www.rfc-editor.org/rfc/rfc1628.html).

Almacenar la lectura bruta y dividir en el gráfico preserva la pureza del archivo RRD y
le permite corregir un multiplicador de presentación sin alterar el histórico bruto,
siempre que las muestras hayan superado los límites de la fuente de datos y las directivas de retención. Convertir en el recopilador
modifica la unidad guardada y puede mermar precisión; documéntelo. Mediciones brutas sin justificar
no deben mostrarse como unidades de ingeniería verificadas.

No aplique la conversión por duplicado. Un CDEF sobre un gráfico cuyo script ya haya escalado
el valor puede generar una lectura plausible pero rotundamente errónea.

## Ajustes de gráficos acordes a una medición

Escoja los parámetros en función de una medición en lugar de replicar ciegamente los valores de tráfico de red.

| Parámetro | Tráfico | Sensor |
|---|---|---|
| Tipo de fuente de datos | `COUNTER` | `GAUGE` |
| Valor base | 1000, para que el eje exprese k y M | Sigue siendo 1000, pero el prefijo carece de sentido en grados |
| Escala automática | Conveniente, al ser el rango desconocido | Generalmente desaconsejada, al ser el rango previsible |
| Límites superior e inferior | Supeditados al modo de escala automática | Fije un rango visible útil |

Establezca límites inferior y superior explícitos junto con una etiqueta vertical que denomine la unidad
efectiva. El gráfico de temperatura de SAI provisto actúa así: límite inferior en 0, límite superior
en 100, y `C` como etiqueta vertical.

La opción de autoescala ofrece un repertorio de alternativas y no un conmutador simple. La empleada
por el gráfico de temperatura de serie envía un límite inferior mediante `--alt-autoscale-max`;
no remite el límite superior almacenado de 100. Sin límites rígidos, una lectura anómala
puede distorsionar y expandir el límite fijado. Un límite configurado no queda bloqueado automáticamente. Escoja la variante
que preserve la frontera que le interese:

| Opción | Efecto |
|---|---|
| Autoescala ignorando límites | Ambos extremos flotan. Útil si ignora por completo el rango |
| Autoescala aceptando límite inferior | Aplica el límite inferior; el máximo acompaña a los datos |
| Autoescala aceptando límite superior | Aplica el límite superior; el mínimo acompaña a los datos |
| Autoescala con ambos límites | Aplica ambos límites; la expansión sigue supeditada al modo rígido |

Existe asimismo una opción de límites rígidos (rigid boundaries) que impide al eje expandirse cuando una
lectura desborda los límites configurados. Actívela cuando mantener un eje inmutable prime sobre
la observación de anomalías, y desactívela en caso contrario, puesto que un gráfico rígido
puede recortar un pico situado fuera de la escala mostrada. Esto no destruye la muestra
almacenada. Consulte la [referencia de límites de gráficos de RRDtool](https://rrdtool.org/rrdtool/doc/rrdgraph.en.html).

Para grados o porcentajes donde los prefijos SI desorienten a los lectores, pondere un exponente de unidades fijado en 0.
La base 1000 gobierna los escalones de prefijos; no desactiva por sí misma los prefijos ni recalcula unidades de medida.

### La consolidación es más determinante aquí que en el tráfico

Un contador de interfaz promediado durante una hora sigue ilustrando a grandes rasgos lo acontecido.
Una temperatura promediada durante una hora encubre el pico de diez minutos que desencadenó el problema.
Asegúrese de que el perfil de almacenamiento asociado a estas fuentes de datos guarde un archivo `MAX`,
y configure la serie representada para que consulte la consolidación `MAX` pertinente.
Un máximo de leyenda calculado sobre una serie `AVERAGE` no recupera el pico original.

Incluso un archivo MAX solo preserva los máximos presentes en las muestras recolectadas;
no puede subsanar una desviación acontecida entre intervalos de sondeo o valores descartados antes del guardado. Consulte
[Gestionar la retención de datos](/es/guides/manage-data-retention/) y
[Fuentes de datos y archivos](/es/concepts/data-sources-and-rras/).

## Cuándo no existe una MIB aprovechable

Muchos equipos ambientales dialogan a través de Modbus, un enlace serie o una API HTTP,
y su agente SNMP no publica nada aprovechable. Tales equipos precisan una entrada de datos por script. El
script se ejecuta en el host del poller, no en el dispositivo, y alcanzar el dispositivo atañe a la
responsabilidad del script. Consulte [Escribir un script de recopilación de datos](/es/guides/write-a-data-collection-script/) para examinar
el contrato de salida.

Devuelva `U` en vez de `0` cuando un sensor esté inaccesible. Una sonda desconectada
no es una sonda midiendo cero grados.

## Modos de fallo

| Síntoma | Causa habitual |
|---|---|
| Temperatura graficada diez o cien veces mayor de lo real | Multiplicador del fabricante no dividido |
| Temperatura graficada diez veces inferior | Dividida dos veces: una en el script y otra en un CDEF |
| Una línea de tensión muestra cifras de miles de millones | Entero SNMP sin signo que contiene un valor negativo, sin corregir |
| Los gráficos de sensores se aplanan tras cambiar una sonda | La tabla se reindexó y la fuente de datos apunta a un sensor diferente |
| Las lecturas sobre un umbral provocan huecos | Se fijó un máximo en la fuente de datos y los valores reales lo superan |
| Eje rotulado en k o M en lecturas de grados | Valor base y configuración de unidades heredados de una plantilla de tráfico |
| Una anomalía no es visible en la vista semanal | Compruebe la consolidación escogida, la resolución retenida, el intervalo y las muestras rechazadas |
| Una consulta no devuelve índices | Revise las OID devueltas, la expresión regular, las restricciones de acceso y la compatibilidad; una raíz de columna puede ser válida |
| Las consultas lmSensors no detectan nada en un host Linux | Compruebe el soporte del agente, los accesos, las filas expuestas y los errores SNMP exactos |
