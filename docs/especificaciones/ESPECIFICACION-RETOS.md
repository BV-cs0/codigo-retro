# Operación Atalaya: retos de ciberseguridad

Objetivo: una sección nueva de retos tipo CTF (capturar la bandera), en español e inglés desde el principio.

En cada reto el jugador entra en una terminal simulada, investiga y encuentra una bandera con el formato `FLAG{...}`. La entrega con `enviar FLAG{...}` (en inglés, `submit FLAG{...}`).

Cada reto enseña dos cosas: cómo se ataca o se investiga algo, y **cómo se defiende**. La mirada es la de un analista de un SOC.

## 1. Historia y personaje

- **Atalaya** (en inglés, **Watchtower**) es el campo de entrenamiento del equipo de seguridad que protege la costa de Faro‑7. Todos los sistemas son de práctica.
- La guía es **Nix**, una lechuza de píxeles. Es la analista veterana del turno de noche.
  - Tiene un sprite de 16×16 con dos fotogramas, como Lumen.
  - Su estilo es el de Lumen: frases cortas, claras y con algo de humor.
- **Aviso ético obligatorio.** Sale la primera vez que se entra y queda siempre accesible con un botón "Ética" / "Ethics". Dice, en pocas palabras:
  - aquí todo es simulado;
  - estas técnicas solo se usan en sistemas propios o con permiso por escrito;
  - atacar sistemas ajenos es delito.

  El jugador pulsa "Entendido" / "Got it" y la elección se guarda.
- La identidad en la terminal es `analista@atalaya` / `analyst@watchtower`, con la carpeta `/home/analista` / `/home/analyst`.
- Las IP de los "atacantes" son siempre de los rangos de documentación: 203.0.113.0/24 y 198.51.100.0/24. La red interna es 10.9.0.0/24.

## 2. Página y tablero

- Página nueva `retos.html`, con el mismo motor de terminal que El Faro (js/shell, `Bash.sesionTerminal`) y la misma distribución: panel de misión, CRT y chuleta.
- **Tema visual propio.** Noche azul muy oscura con acentos rojo alerta y verde radar, para que no se confunda con El Faro.
- **Tablero de retos**, al estilo de los CTF:
  - una columna por categoría y una ficha por reto con sus puntos;
  - las fichas resueltas se marcan y muestran los puntos conseguidos;
  - arriba aparece el total, «N / 20 retos · P puntos».
- **Puntos.**
  - Los retos valen 100, 200, 300 o 500 puntos (ver la tabla).
  - Cada pista usada resta un 25 % de su valor, hasta un mínimo del 50 %.
  - Se guarda la mejor puntuación de cada reto.
- **Respuesta a una bandera.**
  - Si es incorrecta, la terminal dice `Bandera incorrecta.` / `Wrong flag.` y no resta nada.
  - Si es correcta, se abre el cierre del reto con tres partes: lo que hiciste, **cómo defenderse** y la lista de comandos usados.
- **Progreso** en su propia clave de localStorage: `cr-atalaya`. Los identificadores de reto (A1…E4) son los mismos en los dos idiomas, así que el progreso se comparte.
- **Menú.** En la zona de practicar hay una tarjeta nueva con marco, dibujo animado de Nix y «N / 20 retos · P puntos», con el mismo estilo de marco que las otras tarjetas.

## 3. Comandos nuevos del simulador

Todos con `help` y `man` en los dos idiomas y con su entrada en la chuleta. También estarán disponibles en El Faro, pero no hace falta añadir misiones para ellos allí.

- **`base64 [-d] [archivo]`.** Lee de un archivo o de la entrada estándar. Al codificar corta las líneas a 76 columnas, como GNU coreutils. Una entrada inválida al decodificar da `base64: invalid input`.
- **`xxd -p [archivo]` y `xxd -r -p [archivo]`.** Volcado en hexadecimal plano (60 caracteres por línea) y su inversa.
- **`md5sum` y `sha256sum`.**
  - Usan los algoritmos de verdad, implementados en JS sin librerías y con pruebas contra vectores conocidos.
  - El formato es `hash  archivo` o `hash  -` cuando leen de la entrada estándar.
- **`curl` general.** Además de la boya de El Faro, cada reto puede definir sus propios sitios web simulados:
  - `curl URL` (también con `?parámetros` en la URL);
  - `curl -I URL`, que devuelve las cabeceras;
  - `curl -b "nombre=valor" URL`, que envía una cookie;
  - `curl -s`, que se acepta y no cambia nada.

  Cada respuesta tiene código, cabeceras y cuerpo. El formato de las cabeceras es el mismo de ahora (HTTP/1.1, CRLF).
- **`find -perm` y `find -user`.**
  - `-perm` admite `-4000` (SUID) y `-o+w` (escribible por otros).
  - `-user NOMBRE` filtra por propietario.

  Para esto, el sistema de archivos simulado guarda el propietario y el bit SUID, y `ls -l` muestra la `s` (`-rwsr-xr-x`).
- **`sudo`.**
  - `sudo -l` muestra las reglas del reto en el formato de sudo, por ejemplo `(root) NOPASSWD: /usr/local/bin/copia.sh`.
  - `sudo RUTA` ejecuta esa ruta como root solo si está en las reglas. Si no, da `Sorry, user analista is not allowed to execute '…' as root on atalaya.`
  - No pide contraseña y no existe `sudo su` ni `sudo -i`; si se intenta, el simulador lo explica.
- **`enviar FLAG{...}` / `submit FLAG{...}`.** Comprueba la bandera del reto actual.

## 4. Los 20 retos

Cada reto tiene: título, texto de Nix, archivos y sitios simulados, 2 o 3 pistas que van de menos a más, la bandera, una solución de referencia, el cierre "cómo defenderse" y los comandos que enseña.

Codex escribe los textos en los dos idiomas. Las banderas cambian de idioma solo si su contenido es una palabra; las IP, rutas y herramientas son iguales.

### A · Reconocimiento / Recon (100 puntos cada uno)

1. **Lo que no se ve.** Hay un archivo oculto en la carpeta personal (`ls -a`, `cat`).
   *Defensa:* ocultar un archivo no lo protege; lo que lo protege son los permisos.
2. **El historial indiscreto.** El `.bash_history` de una cuenta compartida guarda una orden con la contraseña escrita en la línea de comandos (`cat`, `grep`).
   *Defensa:* no escribir contraseñas en la línea de comandos; usar `HISTCONTROL` y pedir la clave con un prompt.
3. **Lo que robots.txt confiesa.** `curl http://tienda.local/robots.txt` revela `Disallow: /copia-antigua/` (en inglés, `/old-backup/`), y allí está la bandera.
   *Defensa:* robots.txt no es un control de acceso.
4. **Comentarios olvidados.** El HTML de la portada tiene un comentario con la bandera (`curl … | grep '<!--'`).
   *Defensa:* revisar lo que se publica y quitar los comentarios de desarrollo.

### B · Criptografía / Crypto (200 puntos cada uno; B4 vale 300)

1. **No es cifrado.** `base64 -d mensaje.txt`.
   *Defensa:* Base64 es una codificación, no un cifrado.
2. **Rotación 13.** Un texto en ROT13 se descifra con `tr 'A-Za-z' 'N-ZA-Mn-za-m'`.
   *Defensa:* los cifrados clásicos no protegen nada.
3. **Hexadecimal.** `xxd -r -p volcado.hex`.
4. **La contraseña débil.** `hash.txt` tiene el SHA‑256 de una contraseña que está en `diccionario.txt` (unas 30 palabras). Se rompe con un bucle:
   `while read p; do echo "$(echo -n "$p" | sha256sum) $p"; done < diccionario.txt | grep "$(cat hash.txt)"`
   La bandera es `FLAG{contraseña}`.
   *Defensa:* contraseñas largas, y hashes lentos y con sal (bcrypt, Argon2).

### C · Análisis de logs / Log analysis (200 puntos cada uno)

1. **Fuerza bruta.** `/var/log/auth.log` tiene unas 60 líneas reales del formato de sshd. La bandera es `FLAG{IP}` de la IP con más `Failed password`:
   `grep "Failed password" auth.log | cut -d' ' -f11 | sort | uniq -c | sort -rn | head -1`
   Ojo: el campo depende del formato exacto, así que hay que comprobarlo con Git Bash.
2. **El que entró.** Tras los fallos, esa IP consigue un `Accepted password` para una cuenta. La bandera es `FLAG{cuenta}`.
   *Defensa:* fail2ban, solo claves SSH y nada de root por SSH.
3. **El escáner.** En `/var/log/nginx/access.log` (formato combined), ¿qué herramienta aparece en el User-Agent de las peticiones sospechosas? Por ejemplo `FLAG{sqlmap}`.
4. **Salir de la carpeta.** Una petición con `../` intenta leer un archivo del sistema. La bandera es `FLAG{ruta}`, por ejemplo `FLAG{/etc/passwd}`.
   *Defensa:* validar rutas y no concatenar la entrada del usuario.

### D · Permisos y escalada / Privilege escalation (300 puntos cada uno)

1. **Permisos de más.** `find / -type f -perm -o+w` encuentra un archivo de claves que cualquiera puede escribir. Hay que leer la bandera y además arreglarlo con `chmod o-w`. Para resolverlo deben cumplirse las dos cosas.
2. **El binario raro.** `find / -perm -4000 -type f` lista los SUID. Uno no es estándar, y la bandera es `FLAG{ruta}`.
   *Defensa:* auditar los SUID.
3. **Sudo con trampa.**
   - `sudo -l` permite ejecutar `/usr/local/bin/copia.sh` como root, y ese script lo puede escribir el analista.
   - Se añade `cat /root/bandera.txt` al script y se ejecuta con sudo.

   *Defensa:* los scripts que se ejecutan con sudo solo debe poder escribirlos root.
4. **Secretos en la configuración.** `grep -ri password /var/www /opt` encuentra la clave de la base de datos en un archivo de configuración.
   *Defensa:* usar variables de entorno o un gestor de secretos, y permisos 600.

### E · Web (300 puntos cada uno; E4 vale 500)

1. **Cabeceras que hablan.** `curl -I http://tienda.local` muestra una cabecera de depuración con la bandera.
   *Defensa:* no exponer versiones ni cabeceras de depuración.
2. **La galleta.**
   - `/panel` responde `403` y dice que eres `rol=invitado`; `curl -I` muestra `Set-Cookie: rol=invitado`.
   - Con `curl -b "rol=admin"` se entra.

   *Defensa:* nunca confiar en lo que controla el cliente; los permisos se comprueban en el servidor.
3. **El pedido de otro.**
   - `/pedido?id=1042` es tu pedido; `/pedido?id=1041` es el de otra persona y tiene la bandera.
   - Esto es un IDOR.

   *Defensa:* comprobar en cada petición que el recurso es del usuario.
4. **Reto final: la copia expuesta.**
   - `/copias/` tiene el listado de carpeta abierto, con `usuarios.sql.b64`.
   - Al decodificarlo sale el SHA‑256 del admin.
   - Se rompe con el diccionario, y la bandera es `FLAG{contraseña}`.

   Combina curl, base64, grep y el bucle de hashes. Al resolverlo se abre la pantalla final de Atalaya, con Nix animada y el total de puntos.

## 5. Interfaz y versión

- Nada de lo nuevo rompe El Faro ni sus 60 misiones. `curl`, `find` y `ls` siguen igual allí.
- Textos nuevos de la interfaz en js/idiomas/es.js y en.js.
- Funciona a 375 px de ancho.
- La versión sube a 1.3.0: `CR.VERSION` y los `?v=` de todos los HTML, también de retos.html.

## 6. Pruebas

- Cada reto se resuelve con su solución de referencia, en los dos idiomas, y la estructura es igual en los dos.
- Una bandera incorrecta no resuelve el reto. Los puntos bajan con las pistas, hasta un mínimo del 50 %.
- El aviso ético sale la primera vez y no vuelve después de aceptarlo.
- Pruebas unitarias de base64, xxd, md5sum y sha256sum con vectores conocidos (cadena vacía, "abc", un texto largo y un texto con acentos en UTF‑8).
- Pruebas de curl con cookie y con parámetros, de `find -perm` y `-user`, de `ls -l` con SUID, y de `sudo -l` y sudo denegado.
- **Contra Git Bash** (LC_ALL=C), añadidos al exportador de la terminal:
  - base64 y base64 -d, xxd -p y xxd -r -p, md5sum y sha256sum;
  - el ROT13 con tr;
  - el bucle de B4;
  - las tuberías de C1 a C4 sobre los logs reales del reto.

  `sudo`, SUID y `curl` no se comparan, pero tienen pruebas con la salida exacta esperada.
