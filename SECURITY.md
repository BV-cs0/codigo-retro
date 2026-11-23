# Seguridad

## Cómo avisar de un problema de seguridad

Si encuentras una vulnerabilidad, no abras una issue pública. Avísame en privado desde la pestaña **Security → Report a vulnerability** de este repositorio.

Cuenta qué ocurre, cómo reproducirlo y qué versión o enlace usaste. Te responderé lo antes posible.

## Diseño

Código Retro funciona entero en el navegador y no tiene servidor:

- No pide cuentas ni datos personales.
- No envía nada a internet. El progreso se guarda solo en tu navegador, con `localStorage`.
- No carga scripts, fuentes ni imágenes de otros sitios.
- No ejecuta código con `eval` ni `new Function`. El Python y el Bash del juego son intérpretes propios y simulados: no tocan tu equipo ni tus archivos reales.
- El texto que escribe el jugador nunca se inserta como HTML.
