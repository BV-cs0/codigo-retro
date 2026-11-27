# Código Retro para Windows (.exe)

Esta carpeta empaqueta el juego (la carpeta de arriba) en un único `.exe` de unos 3 MB.
Usa [Neutralino](https://neutralino.js.org/) y el WebView2 que ya trae Windows 10 y 11.

## Crear el .exe

Con Node.js 20 o posterior, desde esta carpeta:

```powershell
npm ci --ignore-scripts
node construir.js
```

El resultado queda en `entrega\CodigoRetro.exe`, junto a `entrega\CodigoRetro.exe.sha256`.

El script hace esto:
1. Copia el juego a `resources/`. No copia esta carpeta, las pruebas, `docs`, el README, SECURITY.md ni las carpetas ocultas.
2. Dibuja el icono de Lumen (`icono.png` e `icono.ico`).
3. La primera vez descarga los binarios oficiales de Neutralino (`npx neu update`) en la versión de `neutralino.config.json`.
4. Crea el `.exe` con el juego dentro (`neu build --release --embed-resources`).
5. Le pone el icono, el nombre y la versión con rcedit.
6. Añade al menú el aviso de versión nueva (`actualizador/`) y escribe el `.sha256`.

## Publicar una versión

1. Cambia `CR.VERSION` en `js/comun/idioma.js` (y el `?v=` de los HTML, como explica el README) y añade la versión a `CHANGELOG.md`.
2. Sube los cambios y crea la etiqueta `vX.Y.Z`.

El flujo `.github/workflows/publicar.yml` comprueba que la etiqueta coincide con `CR.VERSION`, pasa las pruebas, crea el `.exe` en GitHub y publica la Release con `CodigoRetro.exe`, su `.sha256` y las novedades del CHANGELOG. Si lo lanzas a mano (*Actions* → **Publicar el .exe** → *Run workflow*), solo crea el `.exe` y lo deja como artefacto, sin publicar nada.

## Aviso de versión nueva

Al abrir el menú, el `.exe` mira en segundo plano la última versión publicada en GitHub
(`https://api.github.com/repos/BV-cs0/codigo-retro/releases/latest`), una vez por sesión y con 5 segundos de límite.
Si hay una versión más nueva, el pie del menú muestra una línea con el enlace a la página oficial del release.
La persona la descarga cuando quiera, en una ventana aparte, sin perder la partida.

- No descarga ni sustituye nada. Así no hace falta activar las funciones nativas de Neutralino
  (`enableNativeAPI` sigue en `false`), y Smart App Control no bloquea un `.exe` nuevo sin firma.
- Solo enlaza a `https://github.com/BV-cs0/codigo-retro/releases/tag/vX.Y.Z`, y solo si el release trae `CodigoRetro.exe`.
- Sin internet o con cualquier error, el menú queda igual y no aparece ningún mensaje.
- Pruebas: `npm test` (comparación de versiones, canal oficial y fallos de red).

La versión web no lleva este aviso: no lo necesita, y no hace ninguna petición a internet.

## Detalles

- **Puerto fijo.** El juego se sirve en `http://127.0.0.1:47823`. Tiene que ser siempre el mismo para que el progreso, guardado en `localStorage`, no se pierda entre una vez y otra.
- **Dónde se guarda el progreso.** En `%APPDATA%\CodigoRetro.exe\EBWebView`.
- **Aviso de Windows.** El `.exe` no está firmado, así que Windows SmartScreen puede avisar la primera vez. Para abrirlo: «Más información» → «Ejecutar de todas formas».
- **Versión.** Sale sola de `CR.VERSION` en `js/comun/idioma.js`: `construir.js` la pone en `neutralino.config.json` y en los datos del `.exe`.
