# El Faro, segunda temporada: capítulos 9 a 12

Objetivo: cuatro capítulos nuevos de El Faro, de 5 misiones cada uno (20 misiones), en español e inglés desde el principio. Siguen la historia: tras el intruso del capítulo 8, Lumen y el aprendiz refuerzan Faro‑7.

Se mantienen las reglas de siempre:
- el mismo formato de misiones de js/terminal/misiones.js y misiones-en.js;
- la misma identidad por idioma (aprendiz@faro7 / apprentice@beacon7);
- la misma regla: nunca una salida inventada sin avisar.

## 1. Comandos nuevos del simulador

Todos con `help` y `man` en los dos idiomas, y con su entrada en la chuleta.

- **Procesos.** Hay una tabla de procesos simulada por misión: PID, USER, %CPU, %MEM, COMMAND.
  - `ps`, `ps aux` y `ps -ef`, con el formato de procps.
  - `pgrep nombre` y `pgrep -l`.
  - `kill PID`, `kill -9 PID`, `kill -l` y `killall nombre`.
  - Matar un proceso de root sin ser root da `Operation not permitted`.
  - Los PID son fijos por misión, para que todo sea reproducible.
- **Entorno.**
  - `env`, `printenv [VAR]`, `export VAR=valor`, `unset VAR` y `echo $PATH`.
  - `alias nombre='orden'`, `alias` para listar y `unalias`.
  - `which orden` y `type orden`.
  - **PATH de verdad.** Un script ejecutable en un directorio que esté en `PATH` se puede lanzar por su nombre. Si no, da `command not found`.
- **Enlaces y espacio.**
  - `ln -s destino enlace`, `readlink enlace` y `ls -l`, que muestra `enlace -> destino`.
  - `cat`, `cd`, etc. siguen los enlaces. Un enlace roto da el error real.
  - `du -sh`, `du -h --max-depth=1`, `df -h` (sobre un disco simulado con un tamaño fijo) y `find -size +NM`.
- **Red simulada.** Faro‑7 tiene una red pequeña, definida en `/etc/hosts`:
  - `faro7` / `beacon7`: 10.7.0.1;
  - `boya` / `buoy`: 10.7.0.12;
  - `radio`: 10.7.0.20;
  - `relevo` / `relay`: 10.7.0.30.

  Comandos:
  - `hostname` e `ip addr`, con un formato realista y abreviado.
  - `ping -c N host`, con el formato de iputils y tiempos fijos. Un host que no existe da `Name or service not known`.
  - `curl http://boya.local/estado` y similares, que devuelven contenido simulado; `curl -I` devuelve las cabeceras.
  - `ssh usuario@relevo` abre una sesión remota simulada con su propio pequeño sistema de archivos. El prompt cambia a `vigia@relevo` / `watcher@relay`, y `exit` vuelve a Faro‑7.
  - La contraseña se pide con una pregunta, como `read`. La correcta sale de una pista que el jugador encuentra en la misión.

## 2. Capítulos y misiones

En cada misión, entre paréntesis, lo que comprueba. Codex escribe los textos de Lumen, las pistas y los cierres en los dos idiomas, con el estilo de los capítulos 1 a 8.

### Capítulo 9 · Procesos / Processes

La batería del faro se agota: algo está consumiendo CPU.
1. **¿Qué se está ejecutando?** (usa ps).
2. **El glotón.** Busca el proceso que más CPU consume, `baliza-falsa` / `fake-beacon`, y responde su PID (respuesta).
3. **Apágalo.** (el proceso ya no existe; usa kill).
4. **El testarudo.** `eco-fantasma` / `ghost-echo` ignora `kill`; hay que usar `kill -9` (el proceso ya no existe; usa `kill -9`).
5. **Todos los clones.** Hay tres `radio-ruido` / `radio-noise`. Pista con pgrep (no queda ninguno; usa pgrep o killall).

### Capítulo 10 · Entorno / Environment

1. **Tu entorno.** ¿Qué valor tiene la variable `TURNO` / `SHIFT`? (respuesta; usa env o printenv).
2. **Exportar.** (la variable `FARO_MODO=noche` / `BEACON_MODE=night` existe en la sesión).
3. **Tu propia orden.** Crea `~/bin/luz` / `~/bin/light`, dale permiso de ejecución y añade `~/bin` al PATH (se ejecutó `luz` / `light` por su nombre).
4. **Un atajo.** (existe el alias `ll` con valor `ls -l`; se usó `ll`).
5. **¿Dónde está?** ¿En qué carpeta está la orden `informe` / `report`? (respuesta; usa which o type).

### Capítulo 11 · Enlaces y espacio / Links and disk

El disco del faro está casi lleno.
1. **¿Cuánto queda?** ¿Qué porcentaje de uso tiene el disco? (respuesta; usa df -h).
2. **El culpable.** ¿Qué carpeta de `/var/log` ocupa más? (respuesta; usa du).
3. **Archivos enormes.** Borra los `.log` de más de 50M en `/var/log/viejo` / `/var/log/old`, sin tocar los pequeños (estado del sistema de archivos).
4. **Un atajo al mapa.** Crea el enlace `~/mapa` / `~/map` a `/srv/cartas/mapa-costa.txt` / `/srv/charts/coast-map.txt` (es un enlace a esa ruta).
5. **El enlace roto.** `~/config` apunta a un archivo que ya no existe. Rehazlo hacia el bueno (el enlace apunta a la ruta correcta y funciona).

### Capítulo 12 · La red del faro / The beacon network

1. **Mi dirección.** ¿Qué IP tiene Faro‑7? (respuesta; usa ip addr o hostname -I).
2. **¿Responde la boya?** (usó ping -c contra boya / buoy).
3. **El estado de la boya.** ¿Qué temperatura del agua marca? (respuesta; usa curl).
4. **Entrar en el relevo.** La contraseña de `vigia@relevo` está en una nota de la misión. Entra y lee `~/parte.txt` / `~/log.txt` (leyó el archivo en la máquina remota).
5. **Cierre de temporada.** Desde el relevo, copia el dato que pide Lumen a `~/informe_red.txt` / `~/network_report.txt` en Faro‑7, saliendo con `exit` (el archivo existe en Faro‑7 con el dato).

## 3. Interfaz

- El mapa de capítulos y el menú muestran 60 misiones en lugar de 40, con «Temporada 2» / «Season 2» a partir del capítulo 9.
- El progreso de las 40 misiones antiguas no cambia.
- La tarjeta del menú dice «N / 60 misiones».

## 4. Pruebas

- Cada misión nueva se resuelve con su solución, en los dos idiomas, y la estructura es igual en los dos.
- Los comandos nuevos tienen pruebas unitarias: el formato de ps, ping y df, kill sin permiso, PATH, alias, enlaces rotos, y entrar y salir por ssh.
- **Contra Git Bash.** Lo que se pueda comparar (ln -s, readlink, ls -l con enlaces, env/export/unset, alias, which con un PATH propio, du sobre archivos reales) se añade al exportador de la terminal para compararlo.
- **Formatos de Linux.** ps, ping, df, ip y ssh no se pueden comparar en Windows. Su formato sigue el de las herramientas de Linux (procps, iputils, coreutils e iproute2), y cada uno tiene una prueba con la salida exacta esperada.
