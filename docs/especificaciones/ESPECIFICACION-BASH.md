# Código Retro — Curso "Scripting con Bash"

Curso paso a paso para aprender a escribir scripts de Bash. Funciona igual que el Curso de Python
(`ESPECIFICACION-CURSO.md`: tipos de paso, pantallas, progreso y comprobaciones), pero el lenguaje es Bash.
Los scripts se ejecutan en el **motor de terminal simulado** de `js/shell/`, el que se hizo para "El Faro".
Ese motor se amplía con las estructuras de scripting. Se mantienen todas las reglas técnicas de `ESPECIFICACION.md` (sección 1).

Todo es simulado: nunca se ejecuta nada en el ordenador del jugador.

## 1. Ampliación del motor (`js/shell/`)

El terminal de "El Faro" debe seguir funcionando igual, y sus pruebas, pasando.
Los scripts también se podrán ejecutar dentro de "El Faro" (`bash script.sh`, `./script.sh`).
Así desaparece el aviso "Esto lo aprenderás en Scripting con Bash".

### 1.1 Lenguaje soportado (comportamiento de GNU bash 5)
- Comentarios `#` y shebang `#!/bin/bash` (se ignora).
- Varias líneas, `;`, y continuación de línea con `\`.
- **Variables**:
  - `nombre=valor` sin espacios;
  - `$nombre` y `${nombre}`;
  - `${#nombre}`;
  - `${nombre:-defecto}`;
  - `local` dentro de funciones;
  - `readonly` no hace falta.
- **Comillas**: simples (literal), dobles (expanden variables y `$( )`) y la separación en palabras de variables sin comillas,
  como en bash. Es importante para la lección de "pon comillas a tus variables".
- **Sustituciones**: `$(comando)` y `` `comando` ``; `$(( expresión ))` con `+ - * / %`, comparaciones, paréntesis y variables sin `$`;
  `(( i++ ))` y `(( x > 3 ))` como orden.
- **Llaves**: `{1..5}`, `{a,b,c}` y `{01..10}`.
- **Parámetros**: `$0 $1 … $9 $# $@ $* "$@" $?`, y `shift`.
- **Condiciones**:
  - `test` y `[ ]`, con `-f -d -e -r -w -x -s -z -n = != -eq -ne -lt -le -gt -ge !`;
  - `[[ ]]`, con `== != < >`, patrones `*`, `&& || !` y `=~` sencillo;
  - `if / elif / else / fi`;
  - `case … in … ;; esac`, con patrones y `|`.
- **Bucles**:
  - `for x in lista; do … done`, incluido `for f in *.txt`;
  - `for (( i=0; i<5; i++ ))`;
  - `while` y `until`;
  - `while read -r linea; do … done < archivo`;
  - `break` y `continue`.
- **Funciones**: `nombre() { … }` y `function nombre { … }`, con argumentos `$1`… y `return N` (el código de salida).
  La forma de "devolver" un texto es hacer `echo` y capturarlo con `$( )`.
- **Órdenes internas**:
  - `echo` (`-n -e`);
  - `printf` (`%s %d %5s %-5s %.2f \n \t`);
  - `read` (`-p "texto"`, `-r`, varias variables);
  - `exit N`, `shift`, `local`, `true`, `false`, `:`, `cd`, `export` (sin efecto especial).
- **Entrada estándar de los scripts**: `read` toma los datos de una lista `entradas`, igual que `input()` en el curso de Python.
  En la pantalla, la consola espera a que el jugador escriba.
- **Errores con el formato de bash**:
  - `script.sh: line 3: x: command not found`;
  - `script.sh: line 7: syntax error: unexpected end of file`;
  - `script.sh: line 2: [: missing ']'`;
  - `script.sh: line 4: [: too many arguments`.

  Debajo de cada error va una línea gris con la explicación en español y la causa típica. Por ejemplo, para `x = 5`:
  "En Bash no puede haber espacios alrededor de `=`. Escribe `x=5`."
- **Límites**: 20 000 órdenes ejecutadas ("Tu script no termina. ¿El bucle cambia la variable de la condición?"),
  profundidad de llamadas 100 y salida de 5000 líneas.

No hace falta soportar: arrays asociativos, `trap`, `eval`, procesos en segundo plano (`&`), `select`, here-strings ni `getopts`.
Si aparecen, el mensaje debe ser claro: "`getopts` no está en este simulador".

Opcional, solo si cabe sin complicar: arrays simples `a=(x y z)`, `${a[0]}`, `${a[@]}` y `${#a[@]}`.

## 2. Pantalla (`bash.html`)

Es la misma estructura que `curso.html`, con estas diferencias:

- **Editor**: es el editor común, con coloreado de Bash: palabras clave, `$variables`, textos, comentarios y órdenes.
  El nombre del archivo aparece arriba (`saludo.sh`).
- **Encima del editor**: el campo **"Argumentos:"** (por ejemplo `informe.txt 3`), que se pasa como `$1 $2…`.
- **Resultado**:
  - una mini terminal con la estética de "El Faro", que muestra la salida (en rojo los errores de stderr) y el código de salida al terminar
    (`[salió con código 0]`);
  - el panel **"Archivos"**: árbol del sistema de archivos simulado del paso (los scripts pueden crear, leer y borrar archivos),
    con los cambios del último run resaltados;
  - el panel **"Variables"**: las variables del script durante "Paso a paso".
- **Guía**: Lumen (el farolillo de "El Faro"). En este curso es "jefe de turno" y enseña a automatizar las tareas del faro.
- En el menú se activa la tarjeta "Scripting con Bash" (sección Aprende), con el progreso.

## 3. Tipos de paso y comprobaciones

Los mismos tipos que en el curso de Python: `explica`, `predice`, `reto`, `arregla` y `resumen`. Además:
- Cada paso puede definir `fs` (el árbol inicial, en el formato de "El Faro"), `args` y `entradas`.
- `casos`: `[{ args: ['a.txt'], entradas: [], fs: {…} (opcional), salida: '…', codigo: 0, archivos: { '~/informe.txt': { contiene: '…' } } }]`.
  Se comprueban la salida estándar, el código de salida y, si los hay, el estado final de los archivos.
- `requiere`: `'if' 'case' 'for' 'while' 'funcion' 'local' 'read' 'aritmetica' 'sustitucion' 'test-archivo' 'comillas'`.
- Fallos típicos detectados con consejo concreto:
  - espacios en `=`;
  - falta un espacio dentro de `[ ]`;
  - falta `then`/`do`/`fi`/`done`;
  - una variable sin comillas que se rompe con espacios;
  - `$` al asignar (`$x=5`);
  - `==` dentro de `[ ]` con números (sugerir `-eq`).

## 4. Guion (8 temas, 66 pasos)

### Tema 1 — Tu primer script (7)
1. explica: qué es un script: un archivo con órdenes que ya conoces de "El Faro". `echo "Hola"` y `date`.
2. explica: el shebang `#!/bin/bash` y los comentarios.
3. explica: ejecutar con `bash saludo.sh` frente a `./saludo.sh`. Falla sin permiso; se arregla con `chmod +x` (paso con un mini terminal).
4. predice: el orden de ejecución, y que un error en una línea no detiene las siguientes (sin `set -e`).
5. arregla: `echo "Hola` sin cerrar → `unexpected EOF`.
6. reto: un script que imprima 3 líneas de un parte del faro.
7. resumen.

### Tema 2 — Variables y comillas (9)
1. explica: `nombre="Lumen"` y `echo "Hola, $nombre"`.
2. arregla: `nombre = "Lumen"` → `command not found`. Sin espacios alrededor de `=`.
3. explica: comillas simples frente a dobles.
4. predice: `archivo="mi informe.txt"` y `touch $archivo` → crea 2 archivos. Con comillas, uno. Mirar el panel Archivos.
5. explica: `$(comando)`: `hoy=$(date)` y `n=$(ls | wc -l)`.
6. explica: `$(( ))` para hacer cuentas: `total=$(( a + b ))`. Avisar de que `$((7 / 2))` da 3 (solo números enteros).
7. explica: `${#texto}` y `${var:-valor}`.
8. reto: contar los archivos `.log` de `/var/log/faro` e imprimir `Hay N registros`.
9. resumen.

### Tema 3 — Argumentos y `read` (8)
1. explica: `$1`, `$2` y `$#`. Probar cambiando el campo Argumentos.
2. explica: `$@` y `"$@"`, y `$0`.
3. predice: ¿qué pasa si falta `$2`? Queda vacío y no da error.
4. explica: `read -p "¿Tu nombre? " nombre`.
5. explica: `exit 1` y `$?`. El código de salida indica si algo fue bien.
6. Combinación argumentos + `$(( ))` — reto: `suma.sh 3 4` → `7`.
7. reto: `saludo.sh` saluda a quien se pase en `$1`. Hace `nombre=$1` y, si no hay argumentos, lo pide con
   `[ $# -eq 0 ] && read -p "¿Nombre? " nombre`. Este paso enseña `&&` como un "si" corto; el `if` llega en el tema 4.
   Tiene casos con argumento y sin argumento.
8. resumen.

### Tema 4 — Condiciones (10)
1. explica: `if [ "$edad" -ge 18 ]; then … fi`. Los espacios dentro de `[ ]` son obligatorios.
2. arregla: `if [$edad -ge 18]` → `[18: command not found`.
3. explica: `else` y `elif`.
4. explica: comparar números (`-eq -lt -gt…`) frente a textos (`= !=`).
5. predice: `[ "10" \< "9" ]` compara como texto: 10 < 9 es verdadero. Para números, usa `-lt`.
6. explica: comprobar archivos: `-f -d -e -s`. "Si existe el log, cuéntalo".
7. explica: `[[ ]]`, con `&&`, `||` y patrones (`[[ $archivo == *.log ]]`).
8. explica: `case` para un menú (`start|stop|estado`).
9. Combinación condiciones + argumentos — reto: `comprobar.sh <archivo>`.
   - Sin argumento: `Uso: comprobar.sh ARCHIVO` y `exit 1`.
   - Si no existe: `No existe` y `exit 2`.
   - Si existe: muestra su número de líneas.
   Tiene 3 casos.
10. resumen.

### Tema 5 — Bucles (9)
1. explica: `for nombre in Ana Leo Iris; do echo …; done`.
2. explica: `for i in {1..5}` y `for (( i=1; i<=5; i++ ))`.
3. explica: `for f in *.txt` para recorrer archivos. Avisar del caso sin coincidencias.
4. explica: `while [ $n -lt 5 ]` con un contador.
5. explica: leer un archivo línea a línea con `while read -r linea; do … done < archivo`.
6. predice: bucle sin incremento → se detiene por el límite. Explicar por qué.
7. Combinación bucles + condiciones — reto: renombrar todos los `.txt` de `~/fotos` a `.bak`
   (el estado de los archivos se comprueba con `archivos`).
8. Combinación bucles + `$(( ))` — reto: sumar los números de `numeros.txt` (uno por línea).
9. resumen.

### Tema 6 — Funciones (8)
1. explica: `saludar() { echo "Hola, $1"; }` y la llamada `saludar Ana`.
2. explica: los argumentos de la función no son los del script: `$1` dentro de una función es su propio argumento.
3. predice: sin `local`, una variable de la función cambia la de fuera.
4. explica: `return` devuelve un código, no un valor. Para devolver texto se usa `echo` y se captura con `$( )`.
5. predice: `resultado=$(sumar 2 3)` frente a `sumar 2 3; echo $?`.
6. Combinación funciones + condiciones — reto: `es_par() { … }` que devuelve 0 o 1, usada en un `if es_par 4; then …`.
7. Combinación funciones + bucles — reto: `contar_lineas archivo` usada en un `for` sobre todos los logs.
8. resumen.

### Tema 7 — Texto y tuberías en scripts (7)
1. explica: usar `grep`, `cut`, `sort` y `uniq` dentro de un script, y guardar el resultado en una variable.
2. explica: escribir archivos desde el script (`>` y `>>`), y `printf` para dar formato a una tabla.
3. explica: `cat <<EOF … EOF` (here-doc) para escribir varias líneas. **Añadirlo al motor**.
4. predice: `>` sobrescribe y `>>` añade, dentro de un bucle.
5. arregla: un script que escribe el informe con `>` dentro del bucle y solo queda la última línea.
6. reto: a partir de `acceso.log`, generar `ips.txt` con las IP únicas y ordenadas.
7. resumen.

### Tema 8 — Proyecto final: el informe del faro (8)
Cada paso parte del código del anterior (`codigo: 'anterior'`, como en el proyecto de Python).
1. explica: qué hará `informe.sh`. Recibe una carpeta de logs y escribe `informe.txt` con las líneas totales, los fallos por IP
   y la IP más sospechosa.
2. reto: comprobar los argumentos (uso y que la carpeta exista).
3. reto: recorrer los `.log` de la carpeta y contar las líneas de cada uno.
4. reto: una función `fallos_por_ip` (tubería `grep | cut | sort | uniq -c | sort -rn`).
5. reto: escribir el informe con `printf` y un here-doc.
6. reto: la IP más sospechosa con `head -1` y `read` desde `$( )`.
7. reto: códigos de salida correctos (0 si todo fue bien, 1 si hay error de uso, 2 si no hay logs). Casos que comprueban cada código.
8. resumen: el script completo comentado, y un enlace al capítulo 8 de "El Faro": "Ahora puedes automatizar la caza del intruso".
   Pantalla de final del curso de Bash.

## 5. Ejercicios de Bash en el Taller
- Añadir **15 ejercicios de Bash** al Taller (`js/ejercicios/bash-*.js`), con los mismos tipos y el mismo veredicto.
- En la lista del Taller, un filtro nuevo "Lenguaje: Python / Bash".
- Ejercicios:
  - Crea ★: un script que imprima su propio nombre y el número de argumentos.
  - Completa ★: un `if` con el operador correcto (`-gt`).
  - Arregla ★: espacios en `=`.
  - Arregla ★★: `[` sin espacios.
  - Crea ★★: cuenta atrás con `while`.
  - Crea ★★: tabla de multiplicar de `$1` con `for (( ))`.
  - Diseña ★★: una función `mayor a b` que hace `echo` del mayor.
  - Crea ★★: copia de seguridad (copiar `*.conf` a `~/backup` y crear la carpeta si no existe).
  - Crea ★★: contar los archivos y las carpetas de `$1`.
  - Crea ★★★: renombrar los archivos con espacios para que usen `_`.
  - Diseña ★★★: `es_numero "$x"` con `[[ =~ ]]`.
  - Crea ★★★: un menú `case` con `read` en bucle (casos con entradas).
  - Ordena ★★: un `for` + `if` + `fi` + `done`.
  - Crea ★★★: las 3 palabras más repetidas de un archivo (tubería).
  - Crea ★★: comprobar si un usuario existe en una copia de `/etc/passwd` simulada.

## 6. Pruebas

- **Motor**: al menos 150 casos nuevos `{ fs, cwd, script, args, entradas, salida, stderr?, codigo }`, que cubren todo lo de la sección 1.1,
  incluidos los errores con su texto exacto.
- **Curso y Taller**:
  - la `solucion` de cada reto o ejercicio pasa;
  - el código inicial no pasa;
  - en las predicciones, la opción correcta coincide con la salida real.
- **"El Faro"**: sus pruebas siguen pasando. Comprobar también que `./script.sh` ahora ejecuta un `if`.
- **Comparación con bash real**: `node pruebas/exportar-bash.js > pruebas/bash.json`, con
  `[{ id, fs, cwd, script, args, entradas, salida, codigo }]` de todos los casos del motor y de todas las soluciones del curso y del Taller.
  Yo crearé cada `fs` en una carpeta temporal, escribiré el script, lo ejecutaré con bash pasando `args` y las `entradas` por stdin,
  y compararé la salida y el código. Las salidas con fechas, colores o columnas no se exportan.
  Las rutas absolutas del `fs` (`/var/log/…`, `/home/aprendiz/…`) se exportan **relativas a una raíz**: yo ejecutaré con
  `HOME=<raiz>/home/aprendiz` y desde `<raiz>`. Por eso los scripts del curso que se exportan usan rutas relativas, `~` o `$HOME`, nunca `/`.

## 7. Hecho significa
- `bash.html` permite hacer los 8 temas de principio a fin.
- Los argumentos y `read` funcionan.
- Los paneles Archivos y Variables se actualizan.
- El Taller tiene 70 ejercicios y el filtro de lenguaje.
- En "El Faro" se pueden ejecutar scripts.
- Todas las pruebas pasan.
- No hay errores en la consola.
