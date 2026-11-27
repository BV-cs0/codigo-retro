# Código Retro

Juego retro de pixel art para aprender a programar en **Python**, usar la **terminal de Linux**, escribir **scripts de Bash**, hacer **consultas SQL** y practicar **ciberseguridad** con retos CTF. Está pensado para personas de 15 años en adelante y adultos, y se puede jugar en español o en inglés.

**Juega en el navegador:** https://bv-cs0.github.io/codigo-retro/

Es gratis, sin anuncios y sin cuentas. Funciona entero en el navegador: no instala nada y no envía tus datos a ningún sitio.

## Qué incluye

| Modo | Contenido |
|---|---|
| **Curso de Python** | 11 temas y 114 pasos: variables, condiciones, bucles, listas, funciones, textos, diccionarios, errores, `input()` y un proyecto final, *Adivina el número*. |
| **Scripting con Bash** | 8 temas y 66 pasos: variables y comillas, argumentos, `if` y `case`, bucles, funciones, tuberías y un proyecto final, *el informe del faro*. |
| **Consultas con SQL** | 8 temas y 66 pasos con Bina: selecciona, filtra, ordena, agrupa, une tablas y cambia datos en una granja simulada. Incluye consultas paso a paso, un informe de la granja y un tema de seguridad: la inyección SQL y cómo evitarla con parámetros. |
| **Taller de ejercicios** | 70 ejercicios (55 de Python y 15 de Bash) de tipo *crea*, *diseña*, *completa*, *ordena* y *arregla*. El juego te dice si tu solución está bien y por qué. |
| **El Faro** | Juego de terminal Linux con 12 capítulos y 60 misiones. La segunda temporada añade procesos, entorno, enlaces, espacio en disco y una red simulada. |
| **Operación Atalaya** | 20 retos CTF de ciberseguridad con la lechuza Nix: reconocimiento, criptografía, análisis de logs, permisos y escalada, y web. Todo pasa en un sistema simulado, con aviso ético al empezar. |
| **Demos** | *Pico en la mina*, *El hechizo de Brasa* y *Granja de Bina*: guía a un personaje escribiendo Python. Cada demo tiene 5 niveles. |

En cada paso puedes:

- cambiar el código y ejecutarlo;
- avanzar **paso a paso** para ver cómo cambian las variables;
- leer mensajes de error claros, en español.

## Cómo jugar sin internet

- **En Windows:** descarga `CodigoRetro.exe` desde la última [Release](https://github.com/BV-cs0/codigo-retro/releases/latest). Junto a él está su `.sha256` para comprobar la descarga. Como no está firmado, Windows puede avisar con «Windows protegió su PC»: pulsa *Más información* → *Ejecutar de todas formas*. Si hay una versión nueva, el pie del menú lo avisa con el enlace para descargarla. Nunca descarga nada por su cuenta.
- **Desde el código:** descarga el repositorio (**Code → Download ZIP**), descomprímelo y abre `index.html` con doble clic.

Tu progreso se guarda en el navegador con `localStorage`. Algunos navegadores no lo guardan si abres el juego desde un archivo local. Si te pasa, usa la versión online.

## Cómo funciona

- HTML, CSS y JavaScript puros, sin dependencias ni paso de compilación.
- El Python del curso lo ejecuta un intérprete propio escrito en JavaScript. Sus mensajes de error siguen los de CPython 3.14.
- La terminal y Bash funcionan sobre un sistema de archivos simulado. Las salidas se han comparado con Bash real usando `LC_ALL=C`.
- Si algo no está soportado en el simulador, el juego lo avisa en vez de inventar una salida.
- Los gráficos son pixel art original, dibujado en `<canvas>` con código.

Los documentos de diseño de cada parte están en [`docs/especificaciones`](docs/especificaciones). El `.exe` para Windows se crea con Neutralino desde [`escritorio/`](escritorio/LEEME.md), y GitHub Actions lo genera y lo publica solo en cada versión.

## Pruebas

Con Node.js 18 o posterior, desde la carpeta del proyecto:

```
node pruebas/ejecutar.js
```

Comprueba las demos, los intérpretes de Python y Bash, todos los pasos y ejercicios, las pantallas y la codificación de los archivos.

Para comparar con los programas reales:

- `node pruebas/exportar-fragmentos.js` exporta fragmentos de Python para ejecutarlos con CPython 3.14.
- `node pruebas/exportar-terminal.js` exporta órdenes de terminal para ejecutarlas con Bash.
  Usa `LC_ALL=C`. Los casos de la segunda temporada indican en `bash` los ajustes necesarios.
  En Git Bash, los enlaces usan `MSYS=winsymlinks:lnk` y los alias en scripts usan `shopt -s expand_aliases`.
  Para `which`, compara sustituyendo la carpeta real de prueba por `cwd`. Para `ls -l`, compara permisos,
  número de enlaces, tamaño y `nombre -> destino`, omitiendo los campos locales de propietario, grupo y fecha.
- `node pruebas/exportar-bash.js` exporta scripts para ejecutarlos con Bash.
- `node pruebas/exportar-sql.js --idioma es > casos.json` exporta las consultas del motor y del curso de SQL. Compáralas con SQLite usando `python pruebas/comparar-sql.py casos.json`.
- `node pruebas/exportar-bash.js --idioma en` exporta los casos en inglés del curso y del Taller. Los campos `cwd` y `home` son rutas relativas a la raíz de cada caso. Usa `archivo` como nombre del script si el caso lo indica. El nombre por defecto es `script.sh`.

## Versionado de archivos

Al publicar una actualización, cambia `CR.VERSION` en `js/comun/idioma.js` y pon ese mismo número en el parámetro `?v=` de todos los scripts y hojas de estilo locales de todos los HTML. Publica los HTML y los recursos juntos. Ejecuta `node pruebas/ejecutar.js` para comprobar que todas las referencias usan la misma versión.

GitHub Pages guarda el HTML en caché hasta 10 minutos. Si una página antigua recibe ya los archivos nuevos, `idioma.js` lo detecta porque su `?v=` no coincide con `CR.VERSION`, y recarga la página una sola vez. Así nadie juega con una mezcla de versiones ni tiene que recargar a mano.

La versión se ve en el pie del menú. Las novedades de cada versión están en [CHANGELOG.md](CHANGELOG.md).

## Seguridad

Consulta [SECURITY.md](SECURITY.md) para saber cómo avisar de un problema.

## Autor

Hecho por **Bryan Valenzuela** ([@BV-cs0](https://github.com/BV-cs0)). Si te gusta, dale una estrella ⭐ o cuéntame tus ideas en [Issues](https://github.com/BV-cs0/codigo-retro/issues).

## Licencia

[MIT](LICENSE)
