# Idiomas: español e inglés

Objetivo: todo Código Retro se puede jugar en español o en inglés.

En inglés también cambian:
- el código de los ejemplos (nombres de variables y textos);
- las salidas esperadas;
- los archivos de El Faro.

Así, quien juegue en inglés no ve nada en español.

## 1. Elegir idioma

- Nuevo módulo `js/comun/idioma.js` con `CR.Idioma`:
  - `actual()` devuelve `'es'` o `'en'`.
  - Orden para decidirlo:
    1. el parámetro `?lang=es|en` de la URL (se guarda; así se pueden compartir enlaces en inglés);
    2. lo guardado en `localStorage` con la clave `codigo-retro:idioma` (con try/catch);
    3. `navigator.languages`: si el primero empieza por `es`, español; si no, inglés.
  - `cambiar(idioma)` guarda el idioma y recarga la página.
  - Pone `<html lang>` al idioma actual.
- **Selector.** En la barra superior de todas las páginas, y arriba en el menú principal, hay un selector `ES | EN`:
  - son dos botones;
  - el idioma activo lleva `aria-pressed="true"`;
  - debe caber a 375 px de ancho.
- **Progreso.** Es el mismo en los dos idiomas: si cambias de idioma, sigues donde ibas. Por eso el contenido en inglés tiene exactamente los mismos pasos, misiones y ejercicios, en el mismo orden y con los mismos `id`.

## 2. Textos de la interfaz

- Diccionarios `js/idiomas/es.js` y `js/idiomas/en.js`, con claves por página (`menu.titulo`, `curso.ejecutar`…).
- `CR.t(clave, datos)` devuelve el texto en el idioma actual y rellena `{huecos}`. Si falta una clave en inglés, usa el español y lo avisa en las pruebas, nunca en pantalla.
- **HTML estático.** Atributos `data-t` (texto), `data-t-aria` (aria-label) y `data-t-title` (title), aplicados al cargar. El texto en español sigue escrito en el HTML como respaldo.
- **`<title>` de cada página.** También se traduce.
- **Todo el texto que genera el JavaScript.** Pasa por `CR.t`:
  - botones, avisos y veredictos («✔ ¡Correcto!», «✘ Todavía no», «Caso 2 esperaba…»);
  - etiquetas de requisitos («Usa aritmética $(( ))»);
  - contadores («N / M pasos»);
  - pantallas finales.
- **Mensajes de los intérpretes.**
  - El Python simulado traduce sus explicaciones. El mensaje original de CPython sigue en inglés, como ahora.
  - La terminal traduce sus líneas de ayuda («¿Querías decir cd?» → «Did you mean cd?»), sus avisos de «no está en este simulador» y `help`/`man`. Los errores que imitan a GNU ya están en inglés y no cambian.
- **Letras de píxel.** `js/comun/pixel.js` debe tener las 26 letras A–Z, los dígitos y los signos que se usen (`¡`, `!`). Los títulos en píxel también se traducen: «FINAL DEL CURSO» → «COURSE COMPLETE».

## 3. Contenido

- Cada archivo de contenido tiene su versión en inglés **con la misma estructura**. Los dos idiomas se registran en `CR.Contenido.es` y `CR.Contenido.en`, o en un objeto equivalente; cada página incluye los dos y usa el del idioma actual.
- **Lo que cambia en inglés.** Los textos, y además:
  - los nombres de variables y funciones de los ejemplos (`nombre` → `name`);
  - los textos dentro del código (`print("Hola")` → `print("Hello")`);
  - las salidas esperadas;
  - las pistas y las soluciones.
- **Lo que no cambia.** El número de pasos, su orden, su tipo, los `id`, los requisitos (`requiere`) y la dificultad.
- **Nombres propios.** Lumen, Pico, Brasa, Bina y Cursor se quedan igual. «Código Retro» también, como marca.
- **Funciones de las demos.** En inglés tienen nombres en inglés:
  - `avanzar()` → `move()`;
  - `girar_izquierda()` → `turn_left()`;
  - `girar_derecha()` → `turn_right()`;
  - `picar()` → `dig()`;
  - `leer_cartel()` → `read_sign()`;
  - `leer_runa()` → `read_rune()`;
  - `plantar()` → `plant()`;
  - `regar()` → `water()`;
  - `quitar()` → `remove()`;
  - `tierra_seca()` → `dry_soil()`.
  - Completa tú el resto con el mismo criterio y anótalo en una tabla al final de este documento.
- **El Faro en inglés.**
  - El usuario es `apprentice`, la máquina `beacon7`, la carpeta personal `/home/apprentice` y el indicador `apprentice@beacon7`.
  - Los archivos y carpetas llevan nombres en inglés: `bienvenida.txt` → `welcome.txt`, `bitacora` → `logbook`, `descargas` → `downloads`, `almacen` → `storeroom`…
  - La contraseña de la misión del intruso pasa a ser `beacon7`.
  - `HOME`, el usuario y la máquina dejan de ser constantes: dependen del idioma.
  - Las misiones comprueban las rutas y respuestas de su idioma.
- **Sobre el creador, en inglés:**
  - Quién soy: "I'm Bryan Valenzuela, a cybersecurity analyst technician. I'm training to work in a SOC or in pentesting, and I build tools and games to learn and teach."
  - Por qué: "I wanted a way to learn Python, Linux and Bash with short exercises where you write real code and see right away what happens. It's free and runs in the browser, with nothing to install."

## 4. Estilo del inglés

Frases cortas y claras, de nivel B1, con el mismo tono que el español. Se trata al jugador de «you», sin jerga innecesaria.

Glosario fijo:

| Español | Inglés |
|---|---|
| Curso de Python | Python Course |
| Scripting con Bash | Bash Scripting |
| Taller de ejercicios | Exercise Workshop |
| Terminal Linux / El Faro | Linux Terminal / The Lighthouse |
| Pico en la mina | Pico in the Mine |
| El hechizo de Brasa | Brasa's Spell |
| Granja de Bina | Bina's Farm |
| Sobre el creador / Apoya al creador | About the creator / Support the creator |
| tema, paso, misión, reto, pista | topic, step, mission, challenge, hint |
| Ejecutar, Paso a paso, Parar, Comprobar | Run, Step by step, Stop, Check |
| Restaurar código, Saltar paso | Reset code, Skip step |
| Continuar donde lo dejé | Continue where I left off |
| Menú principal, Ver temas, Silenciar | Main menu, Topics, Mute |
| Crea, Completa, Ordena, Arregla, Diseña | Create, Complete, Order, Fix, Design |
| Lumen · jefe de turno | Lumen · head keeper |
| Aprende / Practica | Learn / Practice |

## 5. Fases

Cada fase es un encargo separado. Al terminar cada fase el juego funciona entero, y lo que aún no está traducido sigue en español.

1. **Base:**
   - `idioma.js`, el selector y los diccionarios;
   - todos los textos de la interfaz de todas las páginas;
   - menú, Sobre el creador y Apoya;
   - las 3 demos con sus niveles;
   - los mensajes de los intérpretes de Python y de la terminal;
   - las letras de píxel.
2. **Curso de Python** en inglés: 11 temas y 114 pasos.
3. **Taller** en inglés: 55 ejercicios de Python y 15 de Bash.
4. **El Faro** en inglés: 8 capítulos y 40 misiones.
5. **Scripting con Bash** en inglés: 8 temas y 66 pasos.

## 6. Pruebas

- **Una prueba de estructura** compara español e inglés en cada contenido: los mismos pasos, `id`, tipos y requisitos.
- **Todas las pruebas que hoy validan el contenido español** (soluciones, salidas esperadas, misiones resolubles) se ejecutan también con el inglés.
- **Una prueba busca textos sin traducir.** Avisa de las claves que faltan en `en.js` y del contenido en inglés con palabras típicas del español (`ñ`, `á`, « que », « el »…), con una lista de excepciones para los nombres propios.
- **Exportadores.** `exportar-fragmentos.js` y `exportar-bash.js` aceptan `--idioma en`, para comparar también el inglés con CPython y con Git Bash.

## 7. Funciones de las demos

| Español | Inglés | Demo |
|---|---|---|
| `avanzar()` | `move()` | Las tres |
| `girar_izquierda()` | `turn_left()` | Pico y Brasa |
| `girar_derecha()` | `turn_right()` | Pico y Brasa |
| `picar()` | `dig()` | Pico |
| `hay_muro()` | `wall_ahead()` | Pico y Brasa |
| `hay_roca_blanda()` | `soft_rock_ahead()` | Pico |
| `leer_cartel()` | `read_sign()` | Pico |
| `lanzar_fuego()` | `cast_fire()` | Brasa |
| `abrir(numero)` | `open_door(number)` | Brasa |
| `hay_enemigo()` | `enemy_ahead()` | Brasa |
| `leer_runa()` | `read_rune()` | Brasa |
| `plantar()` | `plant()` | Bina |
| `regar()` | `water()` | Bina |
| `cosechar()` | `harvest()` | Bina |
| `vender(numero)` | `sell(number)` | Bina |
| `tierra_seca()` | `dry_soil()` | Bina |
| `hay_zanahoria()` | `has_carrot()` | Bina |
| `en_mercado()` | `at_market()` | Bina |
| `quitar()` | `remove()` | Operación interna del tablero |
