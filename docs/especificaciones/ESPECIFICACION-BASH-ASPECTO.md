# Aspecto del curso "Scripting con Bash"

Objetivo: que el curso de Bash se vea tan cuidado como el Curso de Python, con su propio estilo.
El estilo de Bash es el de la terminal del faro: fondo oscuro, verde de consola (#8cf2a8) y el ámbar de Lumen (#eaa03f).
Lumen es el personaje guía de El Faro y también del curso de Bash.

Todo el arte es original y se dibuja en `<canvas>` con código, como los sprites que ya existen. No se usan imágenes ni recursos externos.

## 1. Tarjeta del menú principal (index.html)

Hoy la tarjeta del Curso de Python tiene un dibujo animado y un borde de color. La tarjeta de Bash solo tiene texto.

- Añade a `#tarjeta-bash` una `.escena` con un canvas de pixel art animado:
  - una pantalla de terminal pequeña con el texto `$_` en verde y el cursor `_` parpadeando;
  - Lumen asomado a un lado.
- Si el usuario tiene `prefers-reduced-motion`, el dibujo queda quieto.
- Dale a la tarjeta una clase propia (por ejemplo `portada-bash`) con borde y acento ámbar. Debe tener la misma estructura que `portada-curso`, pero con otro color.
- Título de la tarjeta: "Scripting con Bash — automatiza la terminal".
- Línea de resumen: "N / 66 pasos", como ahora.

## 2. Índice de temas (bash.html)

Usa el mismo formato de cartucho que el Curso de Python (js/curso/pantalla.js, función `indice`):

- en negrita, "N · Título";
- una frase corta que explica el tema;
- la barra de progreso;
- "N / M pasos";
- "Necesitas: …";
- el tema 8 (proyecto final) con la clase `cartucho dorado`.

Las barras de progreso tienen el mismo aspecto que en Python.

Añade el campo `frase` a cada tema en js/curso/bash-temas.js. Las frases son:

| Tema | Frase | Necesitas |
|---|---|---|
| 1 · Tu primer script | Escribe órdenes en un archivo y ejecútalas de una vez. | Ningún paso previo. |
| 2 · Variables y comillas | Guarda datos y aprende cuándo usar comillas. | Tu primer script. |
| 3 · Argumentos y read | Recibe datos al lanzar el script o pregúntalos. | Variables y comillas. |
| 4 · Condiciones | Decide qué hacer según archivos, números y textos. | Argumentos y read. |
| 5 · Bucles | Repite órdenes con for, while y until. | Condiciones. |
| 6 · Funciones | Agrupa órdenes con un nombre y reutilízalas. | Bucles. |
| 7 · Texto y tuberías en scripts | Filtra y cuenta líneas dentro de un script. | Funciones. |
| 8 · Proyecto final: el informe del faro | Junta todo en un script que escribe un informe. | Todos los temas anteriores. |

## 3. Pantalla de cada paso

- **Puntos de los pasos.** Como en Python, cada punto muestra su número (1, 2, 3…). Los pasos hechos llevan la clase `completo`. El paso actual se marca con `aria-current`. Hoy salen círculos ○ ● sin número.
- **Lumen.** El retrato de Lumen se ve del mismo tamaño en pantalla que el cursor del Curso de Python. Escálalo con CSS y `image-rendering: pixelated`. Sigue animado con `SpritesFaro.animar`.
- **Bocadillo.** Tiene el mismo estilo que el de Python, con "Lumen · jefe de turno" como encabezado.
- **Sonidos.** El curso de Bash suena en los mismos momentos que el de Python: acierto, error, paso completado y tema completado. Usa js/comun/sonido.js y respeta el botón Silenciar.

## 4. Pantalla final del curso

Como la del Curso de Python (`#final-curso` en curso.html y la función que la rellena en pantalla.js):

- Lumen celebra con una animación propia; se pueden usar el haz de luz del faro (`SpritesFaro.encendido`) y Lumen saltando.
- El título "Final del curso" va en letras de píxel con `Pixel.texto`, como en Python.
- Debajo:
  - el progreso total;
  - la lista de los 8 temas con sus pasos hechos (`progreso-temas`).
- Botones:
  - "Volver a los temas";
  - "Practicar en el Taller" (ejercicios.html#bash);
  - "Ir al capítulo 8 de El Faro".

## 5. Lo que no cambia

- Los contenidos de los pasos, el motor de Bash, las comprobaciones y el progreso guardado no cambian.
- El Curso de Python no cambia.
- Funciona en anchura de móvil (375 px) sin scroll horizontal.
