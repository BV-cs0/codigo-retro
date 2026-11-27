# Consultas con SQL

1. Motor JavaScript y pruebas de sintaxis, consultas, cambios, parámetros y límites. `node pruebas/ejecutar.js` pasó 2009 comprobaciones, con 0 fallidas.
2. Exportador JSON y comparador Python. La suite pasó 2011 comprobaciones; SQLite 3.53.4 de Node dio 150 de 150 iguales. El lanzador no encontró Python 3.14.
3. Pantalla, tarjeta, editor, formularios y progreso. La suite pasó 2021 comprobaciones, incluida la prueba de pantalla con datos neutros.
4. Temas 1–7 y granja en español e inglés, con 56 pasos por idioma y tema 8 vacío. La suite pasó 2144 comprobaciones. SQLite 3.53.4 dio 216 de 216 iguales en cada idioma.
5. Versión 1.4.0, recursos HTML, CHANGELOG y README. La suite pasó 2157 comprobaciones, con 0 fallidas. Chrome verificó el curso en ambos idiomas a 375 px, con desplazamiento dentro de la tabla y progreso compartido en el menú. Se comprobó UTF-8 sin BOM.
6. Tema 8 (seguridad, 10 pasos por idioma) y casos de formulario con error, primeraFila, contiene y escrito. La suite pasó 2178 comprobaciones. `py -3.14 -I -X utf8 pruebas/comparar-sql.py` con SQLite 3.50.4 dio 241 de 241 iguales en español y en inglés.

La comparación final con SQLite 3.53.4 de Node dio 224 de 224 casos iguales en español y 224 de 224 en inglés.

Fuera del rango entero seguro de JavaScript, el motor muestra un aviso de precisión. Por ejemplo, SQLite devuelve el entero exacto para `SELECT 9007199254740993`, que el simulador no puede entregar como número de JavaScript sin cambiar su valor.

