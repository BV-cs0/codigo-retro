# Código Retro — Terminal Linux: "El Faro"

Juego nuevo para aprender a usar la terminal de Linux con misiones: "encuentra este archivo", "ordena esta carpeta",
"¿qué IP intentó entrar más veces?". Se mantienen todas las reglas técnicas de `ESPECIFICACION.md` (sección 1).
Todo es **simulado** en el navegador: no se ejecuta nada en el ordenador del jugador.

Este documento también define el **motor de terminal** (`js/shell/`), que después usará el curso "Scripting con Bash".
Por eso debe quedar bien separado y bien probado.

## 1. Historia y ambiente (original)

- El jugador es aprendiz de administrador de sistemas en **Faro-7**, un viejo servidor que guía barcos desde una isla.
- Le guía **Lumen**, la inteligencia del faro: un farolillo de píxeles con un ojo. Habla corto, con algo de humor seco.
- Hay 8 capítulos. Cada uno es una "noche de guardia" con 4–6 misiones.
- En los últimos capítulos alguien se ha colado en el servidor. Al final se descubre quién fue y cómo entró:
  una contraseña débil en un archivo olvidado. El tono es ligero; es ciberseguridad básica y realista.
- Usuario: `aprendiz`. Equipo: `faro7`. Prompt: `aprendiz@faro7:~$`, con los colores típicos (usuario verde y ruta azul).

## 2. Pantalla (`terminal.html`)

- **Centro**: la terminal a pantalla grande, con estética CRT. Tiene:
  - fondo negro;
  - un brillo suave;
  - líneas de barrido muy sutiles;
  - un selector de color de fósforo (verde, ámbar o blanco) que se guarda en `localStorage`.

  La terminal funciona así:
  - Se escribe en la última línea. Enter ejecuta.
  - ↑/↓ recorren el historial.
  - **Tab autocompleta** comandos y rutas. Si hay varias opciones, una segunda pulsación las lista.
  - Ctrl+L limpia la pantalla. Ctrl+C cancela la línea.
  - Se puede seleccionar y copiar texto.
  - La salida larga se puede desplazar con la rueda.
  - Al cargar la pantalla, el foco va a la terminal.
- **Izquierda — Misión**:
  - capítulo y número de misión;
  - Lumen con el texto de la misión;
  - lista de **objetivos** con ✔ cuando se cumplen, que se comprueban después de cada comando;
  - botón "💡 Pista", con pistas de una en una;
  - botón "↺ Reiniciar misión", que restaura el sistema de archivos de esa misión.
- **Derecha — Ayuda**: dos pestañas.
  - "Chuleta": los comandos aprendidos hasta ahora, con un ejemplo cada uno. Se va llenando.
  - "Mapa": árbol del sistema de archivos, con las carpetas que el jugador ya visitó y la carpeta actual resaltada.
    Las no visitadas se ven como `▸ ???`.
- Al completar una misión: cuadro con la frase de Lumen, el comando nuevo aprendido y el botón "Siguiente misión".
- Índice de capítulos (`terminal.html#capitulos`) con el progreso. Todos están desbloqueados, como en las demos.

## 3. Motor de terminal (`js/shell/`)

Archivos sugeridos:
- `sfa.js`: sistema de archivos en memoria.
- `lexico.js`: separa la línea en palabras con comillas, escapes, variables y comodines.
- `analizador.js`: tuberías, redirecciones, `;`, `&&`, `||`.
- `ejecutor.js`
- `comandos/*.js`: un archivo por grupo de comandos.
- `ayuda.js`: textos de `help` y `man`.

Todo se puede cargar en Node y no toca el DOM.

### 3.1 Sistema de archivos
- Nodos: carpeta o archivo, con:
  - nombre;
  - contenido (texto);
  - permisos (`rwxr-xr-x`);
  - dueño y grupo;
  - fecha de modificación fija (definida por la misión, para que `ls -l` sea predecible);
  - tamaño = longitud del contenido en bytes UTF-8.
- Rutas absolutas y relativas, `.`, `..`, `~`, y barras repetidas o finales.
- Archivos ocultos (los que empiezan por `.`).
- Errores con el mismo texto que GNU, por ejemplo:
  - `cd: noexiste: No such file or directory`;
  - `cat: carpeta: Is a directory`;
  - `rm: cannot remove 'x': No such file or directory`;
  - `mkdir: cannot create directory 'a': File exists`.

  Debajo de cada error, una línea en gris con la explicación en español:
  "No existe ese archivo o carpeta. Usa `ls` para ver qué hay aquí."
- Permisos simulados: sin `r` no se puede leer, sin `x` no se puede ejecutar un script, sin `w` no se puede escribir
  (`Permission denied`). El jugador es dueño de su `home`; algunas carpetas del sistema son de `root` y son de solo lectura.
  No hay `sudo`; si se escribe, Lumen bromea: "Aquí no hay sudo. Ni falta que hace."
- Una misión se define con un **árbol inicial** en JS, que es fácil de escribir:
  ```js
  fs: { '/home/aprendiz/bienvenida.txt': 'texto…', '/var/log/': null, '/var/log/acceso.log': { contenido: '…', permisos: 'rw-r-----', dueno: 'root' } }
  ```
  Las rutas que terminan en `/` son carpetas. Las carpetas intermedias se crean solas.
- Los archivos grandes (logs de cientos de líneas) se generan con una función determinista (semilla fija) dentro de la misión,
  así no hace falta escribirlos a mano.

### 3.2 Línea de comandos
- Palabras separadas por espacios.
- Comillas `'…'` (literal) y `"…"` (expande `$VAR`). Escape con `\`.
- Variables: `$HOME`, `$USER`, `$PWD`, `$OLDPWD` y las que cree el jugador (`NOMBRE=valor`). `echo $NOMBRE`.
- Comodines `*`, `?` y `[abc]`, expandidos contra el sistema de archivos y ordenados.
  Si no hay coincidencias, se deja el patrón tal cual, como en bash.
- Tuberías `|`. Redirecciones `>`, `>>`, `<` y `2>` (se pueden simplificar a `2>/dev/null`). `/dev/null` existe.
- Separadores `;`, `&&` y `||` con su código de salida (`$?`).
- Comando no encontrado: `bash: lss: command not found`. Debajo, la explicación en gris: "¿Querías decir `ls`?"

### 3.3 Comandos (con las opciones más usadas)
Salidas **idénticas a GNU coreutils / bash**, salvo donde se indica.

| Comando | Qué hay que soportar |
|---|---|
| `pwd` | — |
| `ls` | `-l -a -A -h -R -1 -t -S -r`, y combinaciones (`-la`, `-lh`). Sin `-l` muestra los nombres en columnas, como en una terminal, con las carpetas en azul. `-l` con el formato GNU y las fechas fijas de la misión. |
| `cd` | ruta, `..`, `~`, `-`, sin argumentos (va a `~`) |
| `cat` | uno o varios archivos, `-n` |
| `head` / `tail` | `-n N` y `-N` |
| `wc` | `-l -w -c`; sin opciones, las tres |
| `echo` | `-n`, `-e` (`\n`, `\t`) |
| `touch` | crea o actualiza |
| `mkdir` | `-p` |
| `rmdir` | — |
| `rm` | `-r -f -i` (`-i` pregunta `rm: remove regular file 'x'?` y espera `y`/`n`) |
| `cp` | `-r` |
| `mv` | mover y renombrar |
| `find` | `ruta`, `-name` con comodines, `-iname`, `-type f/d`, `-size +Nk/-Nk/Nc`, `-mtime` no hace falta, `-maxdepth N`, `-empty`, `-perm` no hace falta |
| `grep` | `-i -n -r -c -v -l -w -E` (alternativas `a\|b` y `+`) |
| `sort` | `-r -n -u -k N -t` |
| `uniq` | `-c -d` |
| `cut` | `-d -f` |
| `tr` | `a-z A-Z` y `-d` |
| `tree` | igual que `tree`, con el resumen final `N directories, M files` |
| `chmod` | numérico (`755`) y simbólico (`u+x`, `go-w`, `a+r`) |
| `whoami`, `hostname`, `date` | `date` muestra la fecha fija del juego |
| `history` | — |
| `clear` | — |
| `help` | lista los comandos con una línea en español |
| `man <cmd>` | manual corto en español: qué hace, las 3–5 opciones más útiles y 2 ejemplos |
| `diff` | solo el formato normal |
| `file` | `ASCII text`, `directory`, `empty` |
| `du -sh`, `stat` | no hacen falta |
| `./script.sh`, `bash script.sh` | en este juego solo ejecutan líneas de comandos simples, una tras otra; si hay `if`/`for`, mostrar "Esto lo aprenderás en Scripting con Bash". Comprueba el permiso `x` para `./`. |
| `responder <texto>` | comando del juego: entrega la respuesta de una misión de pregunta |
| `mision` | comando del juego: vuelve a mostrar el objetivo actual |

Si un comando o una opción no está soportado, el mensaje es amable y claro:
"`ls --color` no está en este simulador. Prueba `ls -l`."
No se debe fallar en silencio ni dar una salida inventada.

### 3.4 Seguridad del simulador
- `rm -rf /` y `rm -rf ~`: el simulador los ejecuta (solo borra la simulación).
  Después Lumen explica por qué es peligroso en un sistema real y ofrece "↺ Reiniciar misión".
- Límites: 2000 nodos, archivos de 1 MB, salida de 5000 líneas por comando y tuberías de 10 etapas.

## 4. Objetivos de misión (se comprueban tras cada comando)

```js
objetivos: [
  { texto: 'Entra en /var/log', tipo: 'cwd', ruta: '/var/log' },
  { texto: 'Crea la carpeta ~/informes', tipo: 'existe', ruta: '~/informes', clase: 'carpeta' },
  { texto: 'Borra temp.txt', tipo: 'noExiste', ruta: '~/temp.txt' },
  { texto: 'Guarda las IPs en ips.txt', tipo: 'contenido', ruta: '~/ips.txt', igual: '…' | contiene: '…' },
  { texto: 'Haz ejecutable faro.sh', tipo: 'permisos', ruta: '~/faro.sh', modo: 'u+x' },
  { texto: 'Usa find', tipo: 'usaComando', comando: 'find' },
  { texto: '¿Cuántas líneas tiene acceso.log?', tipo: 'respuesta', valor: '342' },
  { texto: 'Lee el mensaje secreto', tipo: 'leyo', ruta: '/srv/.secreto' }   // se cumple al hacer cat/head/tail/less sobre ese archivo
]
```
Una misión se completa cuando todos sus objetivos están cumplidos. `responder` con una respuesta errónea da una pista suave.
Las respuestas se comparan sin distinguir mayúsculas y sin espacios sobrantes.

## 5. Capítulos y misiones (unas 40)

Hay que escribir textos, árboles de archivos, objetivos y pistas. Cada misión introduce o refuerza 1–2 comandos.

1. **Primera guardia** — `pwd`, `ls`, `cd`, `cat`, `clear`, `help`
   - ¿Dónde estoy? (`pwd`)
   - ¿Qué hay aquí? (`ls`)
   - Lee `bienvenida.txt` (`cat`)
   - Entra en `bitacora` y lee la última entrada
   - Vuelve a casa (`cd ~`, `cd ..`)
2. **Rutas** — rutas absolutas y relativas, `ls -a`, `ls -l`
   - Visita `/etc/faro` con ruta absoluta
   - Encuentra el archivo oculto `.nota` en `~` (`ls -a`)
   - ¿Qué archivo es el más grande de `~/cartas`? Responde con su nombre (`ls -lS` o `ls -l`)
   - Usa `cd -` para ir y volver
3. **Orden en el almacén** — `mkdir`, `touch`, `cp`, `mv`, `rm`, comodines
   - Crea `~/almacen/fotos`, `~/almacen/textos` y `~/almacen/viejo` (`mkdir -p`)
   - Mueve todos los `*.jpg` de `~/descargas` a `fotos` y todos los `*.txt` a `textos`
   - Haz una copia de seguridad de `textos` (`cp -r`)
   - Borra los archivos `*.tmp` (`rm`). Ojo: hay un `importante.tmp.txt` que **no** debe borrarse (objetivo `existe`)
   - Renombra `informe_final_FINAL2.txt` a `informe.txt`
4. **Archivos largos** — `head`, `tail`, `wc`, `cat -n`
   - ¿Cuántas líneas tiene `/var/log/faro/luz.log`? (`wc -l`)
   - ¿Qué dice la última línea? (`tail -n 1`)
   - Guarda las 10 primeras líneas en `~/inicio.txt` (`head > archivo`)
   - Añade una línea a `~/notas.txt` sin borrar lo que había (`echo >>`)
5. **Búsqueda** — `find`
   - Encuentra `llave.txt` en algún lugar de `/srv` (`find /srv -name`)
   - ¿Cuántos archivos `.log` hay en `/var/log`, contando subcarpetas? (`find -type f -name "*.log" | wc -l`)
   - Encuentra las carpetas vacías de `~/proyectos` y bórralas (`find -empty -type d`)
   - Encuentra los archivos de más de 100 KB en `/srv/archivo` (`find -size`)
6. **Dentro de los archivos** — `grep`, tuberías, `sort`, `uniq`, `cut`
   - ¿En qué línea de `manual.txt` aparece "tormenta"? (`grep -n`)
   - ¿Cuántos intentos de acceso fallidos hay en `acceso.log`? (`grep -c "FALLO"`)
   - ¿Qué IP falló más veces? (`grep FALLO | cut -d' ' -f3 | sort | uniq -c | sort -rn | head -1`)
   - Busca "contraseña" en todo `/srv` (`grep -ri`)
7. **Permisos** — `ls -l`, `chmod`, `./`
   - `encender.sh` no se ejecuta: averigua por qué y arréglalo (`chmod u+x`)
   - `secretos.txt` lo pueden leer todos: déjalo solo para ti (`chmod 600`)
   - Lee los permisos de `/etc/faro/config` y responde quién puede escribir en él
8. **El intruso** (misión final, varias partes) — todo junto
   - En `acceso.log`, encuentra la hora del primer acceso CORRECTO desde la IP sospechosa
   - Encuentra el archivo que esa sesión modificó (pista en el log, `find` + `grep`)
   - Descubre cómo entró: un `.bak` olvidado con una contraseña débil (`find -name "*.bak"`, `cat`)
   - Escribe un informe `~/informe_intruso.txt` con la IP, la hora y el archivo (objetivo `contenido` con `contiene` para cada dato)
   - Borra el `.bak` y quita los permisos de lectura a otros en la carpeta afectada
   - Final: Lumen da las gracias, se ve el faro encendido (animación de píxeles) y el resumen "Has aprendido N comandos"

## 6. Pruebas

- **Motor**: al menos 150 casos `{ fs, cwd, linea, salida, error, codigo }`. Cubren:
  - cada comando y cada opción de la tabla;
  - comillas y comodines;
  - variables;
  - tuberías y redirecciones;
  - `&&` y `||`;
  - permisos;
  - errores con el texto exacto de GNU.
- **Misiones**: para cada misión, una lista de comandos `solucion` que la completa partiendo de su árbol inicial,
  y la comprobación de que al empezar no hay ningún objetivo cumplido.
- **Exportación para comparar con bash real**: `node pruebas/exportar-terminal.js > pruebas/terminal.json`, con
  `[{ id, fs: {ruta: contenido|null}, cwd, linea, salida }]`. Debe cubrir los casos del motor **cuya salida no dependa de fechas,
  colores ni columnas**: `cat`, `head`, `tail`, `wc`, `grep`, `sort`, `uniq`, `cut`, `tr`, `find`, `echo`, `ls -1`, comodines,
  tuberías y redirecciones. Yo recrearé cada árbol en una carpeta temporal y lo ejecutaré con bash para comparar.
  Las rutas de `find` y de `grep -r` deben salir en el mismo orden que en GNU: el orden de los directorios no está garantizado,
  así que yo compararé esas salidas ordenadas.

## 7. Menú
Activar la tarjeta "Terminal Linux" del menú (sección Practica), con Lumen animado y el progreso "12 / 40 misiones".

## 8. Hecho significa
- Se puede jugar `terminal.html` de principio a fin.
- Tab, el historial y los colores funcionan.
- El Mapa y la Chuleta se actualizan.
- Las pruebas pasan, las antiguas y las nuevas.
- No hay errores en la consola.
