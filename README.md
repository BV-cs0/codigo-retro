# Código Retro

Juego retro de pixel art para aprender a programar en **Python**, usar la **terminal de Linux** y escribir **scripts de Bash**. Está pensado para personas de 15 años en adelante y adultos.

**Juega en el navegador:** https://bv-cs0.github.io/codigo-retro/

Es gratis, sin anuncios y sin cuentas. Funciona entero en el navegador: no instala nada y no envía tus datos a ningún sitio.

## Qué incluye

| Modo | Contenido |
|---|---|
| **Curso de Python** | 11 temas y 114 pasos: variables, condiciones, bucles, listas, funciones, textos, diccionarios, errores, `input()` y un proyecto final, *Adivina el número*. |
| **Scripting con Bash** | 8 temas y 66 pasos: variables y comillas, argumentos, `if` y `case`, bucles, funciones, tuberías y un proyecto final, *el informe del faro*. |
| **Taller de ejercicios** | 70 ejercicios (55 de Python y 15 de Bash) de tipo *crea*, *diseña*, *completa*, *ordena* y *arregla*. El juego te dice si tu solución está bien y por qué. |
| **El Faro** | Juego de terminal Linux con 8 capítulos y 40 misiones. Encuentra archivos y resuelve problemas con `ls`, `cd`, `find`, `grep`, tuberías, permisos y scripts. |
| **Demos** | *Pico en la mina*, *El hechizo de Brasa* y *Granja de Bina*: guía a un personaje escribiendo Python. Cada demo tiene 5 niveles. |

En cada paso puedes:

- cambiar el código y ejecutarlo;
- avanzar **paso a paso** para ver cómo cambian las variables;
- leer mensajes de error claros, en español.

## Cómo jugar sin internet

1. Descarga el repositorio (**Code → Download ZIP**) y descomprímelo.
2. Abre `index.html` con doble clic.

Tu progreso se guarda en el navegador con `localStorage`. Algunos navegadores no lo guardan si abres el juego desde un archivo local. Si te pasa, usa la versión online.

## Cómo funciona

- HTML, CSS y JavaScript puros, sin dependencias ni paso de compilación.
- El Python del curso lo ejecuta un intérprete propio escrito en JavaScript. Sus mensajes de error siguen los de CPython 3.14.
- La terminal y Bash funcionan sobre un sistema de archivos simulado. Las salidas se han comparado con Bash real usando `LC_ALL=C`.
- Si algo no está soportado en el simulador, el juego lo avisa en vez de inventar una salida.
- Los gráficos son pixel art original, dibujado en `<canvas>` con código.

Los documentos de diseño de cada parte están en [`docs/especificaciones`](docs/especificaciones).

## Pruebas

Con Node.js 18 o posterior, desde la carpeta del proyecto:

```
node pruebas/ejecutar.js
```

Comprueba las demos, los intérpretes de Python y Bash, todos los pasos y ejercicios, las pantallas y la codificación de los archivos.

Para comparar con los programas reales:

- `node pruebas/exportar-fragmentos.js` exporta fragmentos de Python para ejecutarlos con CPython 3.14.
- `node pruebas/exportar-terminal.js` exporta órdenes de terminal para ejecutarlas con Bash.
- `node pruebas/exportar-bash.js` exporta scripts para ejecutarlos con Bash.

## Seguridad

Consulta [SECURITY.md](SECURITY.md) para saber cómo avisar de un problema.

## Autor

Hecho por **Bryan Valenzuela** ([@BV-cs0](https://github.com/BV-cs0)). Si te gusta, dale una estrella ⭐ o cuéntame tus ideas en [Issues](https://github.com/BV-cs0/codigo-retro/issues).

## Licencia

[MIT](LICENSE)
