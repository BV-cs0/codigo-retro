# Código Retro — Curso "Consultas con SQL"

Curso paso a paso para aprender SQL con la base de datos de la granja de **Bina** (la de la demo *Granja de Bina*).
Funciona como el Curso de Python y el de Bash (`ESPECIFICACION-CURSO.md` y `ESPECIFICACION-BASH.md`): mismos tipos de paso,
pantallas parecidas, progreso y comprobaciones. Se mantienen todas las reglas técnicas de `ESPECIFICACION.md` (sección 1)
y el sistema de idiomas de `ESPECIFICACION-IDIOMAS.md`: **todo nace en español y en inglés**.

Todo es simulado: el SQL lo ejecuta un motor propio escrito en JavaScript, sin dependencias. Nunca se usa una base de datos real.

## 0. Reparto del trabajo

- **Codex** hace el motor SQL, la pantalla, el menú, el progreso, las pruebas, la comparación con SQLite y los **temas 1 a 7**
  en los dos idiomas.
- El **tema 8** ("Seguridad: consultas con parámetros") lo escribe Claude. Codex solo deja preparado:
  - los archivos `js/sql/temas-seguridad.js` y `js/sql/en/temas-seguridad.js`, que registran el tema 8 con una lista de pasos vacía;
  - el tipo de paso `formulario` (sección 3.2), con sus pruebas, usando datos de ejemplo neutros.

  Las pruebas deben aceptar que el tema 8 esté vacío. El total de pasos del menú se calcula, no se escribe a mano.

## 1. Motor SQL (`js/sql/`)

### 1.1 Referencia

El comportamiento de referencia es **SQLite 3.50**, el que trae Python 3.14 (`py -3.14 -c "import sqlite3"`).
Cuando haya dudas, manda lo que hace SQLite. Algunos detalles que hay que copiar:

- Tipos dinámicos con afinidad de columna (`INTEGER`, `REAL`, `TEXT`; una columna `INTEGER` guarda `'7'` como 7).
- `7 / 2` da `3` (división entera entre enteros); `7 / 2.0` da `3.5`; `AVG` siempre da un número real (`7.0`).
- `ROUND(2.5)` da `3.0`; `ROUND(x, 2)` redondea a 2 decimales.
- Lógica de tres valores con `NULL`: `NULL = NULL` es `NULL`, `WHERE` solo deja pasar lo verdadero; `COUNT(columna)` no cuenta los `NULL`.
- `=` distingue mayúsculas en textos; `LIKE` no las distingue en letras ASCII. `%` y `_` en `LIKE`.
- Booleanos como enteros: `1 = 1` da `1`.
- `ORDER BY` pone los `NULL` primero en orden ascendente.
- `"texto"` entre comillas dobles es un identificador, pero si no existe esa columna SQLite lo acepta como texto
  (`WHERE nombre = "Ana"` funciona). Hay que copiarlo y, además, mostrar un consejo (sección 1.5).
- Una columna sin `GROUP BY` junto a un agregado se permite (SQLite toma el valor de una fila). Copiar el resultado de SQLite
  cuando es determinista (`MAX`/`MIN` con una columna "desnuda" usa la fila del máximo o del mínimo).
- Mensajes de error exactos de SQLite: `no such table: x`, `no such column: x`, `near "FROM": syntax error`,
  `incomplete input`, `table x already exists`, `UNIQUE constraint failed: t.c`, `NOT NULL constraint failed: t.c`,
  `ambiguous column name: id`, `misuse of aggregate: COUNT()`, `X values for Y columns`, `table t has X columns but Y values were supplied`,
  `wrong number of arguments to function UPPER()`, `no such function: X`.

### 1.2 SQL soportado

- Varias sentencias separadas por `;`. Comentarios `-- …` y `/* … */`. Palabras clave sin distinguir mayúsculas.
- `CREATE TABLE [IF NOT EXISTS] t (col TIPO [PRIMARY KEY] [NOT NULL] [UNIQUE] [DEFAULT valor], …)` y `DROP TABLE [IF EXISTS] t`.
  `INTEGER PRIMARY KEY` se numera solo (rowid), como en SQLite.
- `INSERT INTO t [(cols)] VALUES (…), (…)`.
- `UPDATE t SET a = expr, b = expr [WHERE …]` y `DELETE FROM t [WHERE …]`.
- `SELECT [DISTINCT] expr [AS alias], … | * | t.* FROM t [AS] a`
  - `[INNER] JOIN t2 ON …`, `LEFT [OUTER] JOIN t2 ON …`, y varias uniones seguidas;
  - `WHERE`, `GROUP BY` (varias expresiones), `HAVING`, `ORDER BY expr|alias|número [ASC|DESC], …`, `LIMIT n [OFFSET m]`;
  - `UNION` y `UNION ALL` entre dos o más `SELECT` (mismo número de columnas; si no, `SELECTs to the left and right of UNION do not have the same number of result columns`);
  - subconsultas en `WHERE x IN (SELECT …)`, `EXISTS (SELECT …)` y subconsulta escalar `(SELECT MAX(…) FROM …)`.
  - `SELECT` sin `FROM` (`SELECT 1 + 1;`).
- Expresiones: números, textos `'…'` (con `''` para la comilla), `NULL`, `+ - * / %`, `||`, comparaciones `= == != <> < <= > >=`,
  `AND OR NOT`, `IS [NOT] NULL`, `[NOT] BETWEEN … AND …`, `[NOT] IN (…)`, `[NOT] LIKE`, `CASE WHEN … THEN … [ELSE …] END`, paréntesis.
- Funciones: `COUNT(*)`, `COUNT([DISTINCT] x)`, `SUM`, `AVG`, `MIN`, `MAX`, `UPPER`, `LOWER`, `LENGTH`, `ROUND`, `ABS`,
  `COALESCE`, `IFNULL`, `SUBSTR`, `TRIM`, `REPLACE`.
- **Parámetros** `?`: la API recibe una lista de valores y los enlaza en orden. Un parámetro es siempre un valor, nunca SQL.
  Si faltan o sobran: `Incorrect number of bindings supplied. The current statement uses 2, and there are 1 supplied.`
  (mensaje de Python, porque es lo que se verá en la comparación).

No hace falta: vistas, índices, disparadores, transacciones, `ALTER TABLE`, claves foráneas con comprobación, funciones de ventana,
`WITH`, fechas (`DATE()`). Si aparecen, el mensaje debe ser claro: "`ALTER TABLE` no está en este simulador".

### 1.3 API

```js
const bd = CR.SQL.crear(estadoInicial);      // estadoInicial: { tablas: {...} } o un guion SQL de CREATE/INSERT
const r = bd.ejecutar(sql, parametros = []); // nunca lanza: devuelve un resultado
// r = { resultados: [{ columnas: ['nombre'], filas: [['Ana']], cambios: 0 }],  // uno por sentencia
//       error: null | { mensaje, explicacion, linea, columna },
//       pasos: [...] }                                                 // para "Paso a paso" (sección 2)
bd.tablas();   // { animales: { columnas: [{ nombre, tipo, pk, notNull, unique }], filas: [[...]] } }
bd.copia();    // base de datos independiente con el mismo estado
```

Los valores son números de JS (enteros y reales; se guarda si es entero o real para mostrar `7` frente a `7.0`), textos o `null`.
Si una sentencia falla, las anteriores sí quedan hechas (como en SQLite sin transacción) y las siguientes no se ejecutan.

### 1.4 Límites

10 000 filas por tabla, 100 000 filas recorridas por consulta (las uniones cuentan), 200 sentencias por ejecución y 50 niveles de subconsulta.
Al pasarse: "Tu consulta recorre demasiadas filas. ¿Falta la condición `ON` en la unión?".

### 1.5 Errores y consejos

Cada error se muestra en rojo con el mensaje de SQLite y, debajo, una línea gris con la explicación en el idioma del juego.
Además hay **consejos** que salen aunque no haya error:

- `UPDATE` o `DELETE` sin `WHERE`: "Has cambiado todas las filas de la tabla. Normalmente quieres un `WHERE`." Botón "↺ Restaurar datos".
- `= NULL` o `!= NULL`: "Nada es igual a `NULL`. Usa `IS NULL`."
- Texto entre comillas dobles aceptado como texto: "Para textos usa comillas simples: `'Ana'`."
- `SELECT nombre edad FROM …` (falta una coma: `edad` se convierte en alias): "¿Falta una coma? `edad` se ha usado como nombre de la columna `nombre`."
- `WHERE` con un agregado (`misuse of aggregate`): "Para filtrar grupos usa `HAVING` después de `GROUP BY`."
- `JOIN` sin `ON` que da muchas filas: "Sin `ON`, cada fila se une con todas las de la otra tabla."
- Una columna sin agregar junto a un agregado y sin `GROUP BY`: "¿Te falta `GROUP BY`?".

## 2. Pantalla (`sql.html`)

La misma estructura que `curso.html` y `bash.html` (índice de temas con cartuchos, vista de paso a tres columnas, navegación,
resumen al final de cada tema), con estas diferencias:

- **Editor**: el editor común con coloreado de SQL: palabras clave, textos, números, comentarios y funciones. Encima, el nombre `granja.sql` (en inglés `farm.sql`).
- **Resultado**:
  - **Tabla de resultados**: una tabla HTML por cada `SELECT` (cabecera con los nombres de columna, `NULL` en gris y cursiva,
    números alineados a la derecha). Debajo: "3 filas" o, para `INSERT`/`UPDATE`/`DELETE`, "2 filas cambiadas".
    Se construye con nodos y `textContent`, nunca con `innerHTML`.
  - **Panel "Tablas"**: las tablas de la base de datos del paso con su contenido. Las filas nuevas o cambiadas en la última
    ejecución se resaltan; las borradas se ven tachadas hasta la siguiente ejecución.
  - **Paso a paso**: para un `SELECT`, muestra cómo lo procesa la base de datos, en el orden lógico:
    `FROM` (y uniones) → `WHERE` → `GROUP BY` → `HAVING` → `SELECT` → `DISTINCT` → `ORDER BY` → `LIMIT`.
    En cada paso se resalta la cláusula en el editor y se ve la tabla intermedia ("Después de WHERE quedan 4 filas").
    Es la forma de entender "qué pasa si combinas esto con esto".
- **Guía**: **Bina**, la granjera de la demo, con su sprite animado. Su base de datos guarda los animales, los cultivos y las ventas de la granja.
- Cada paso empieza con su propia base de datos. "↺ Restaurar datos" la devuelve al estado inicial; "↺ Restaurar código", el código.
- En el menú, sección **Aprende**, una tarjeta nueva **"Consultas con SQL — pregunta a tus datos"** con Bina, del estilo de las
  tarjetas de Python y Bash, y el progreso ("0 / N pasos").

## 3. Pasos y comprobaciones

### 3.1 Tipos de siempre

`explica`, `predice`, `arregla`, `reto` y `resumen`, con las mismas reglas que en los otros cursos. Cada paso puede tener:

- `bd`: la base de datos inicial (si no, la de la granja completa, sección 4);
- `casos`: lo que se comprueba al ejecutar el código del jugador, en una copia nueva de `bd`:
  - `resultado: { columnas?: [...], filas: [[...]], orden: true|false }`: compara el **último** `SELECT`.
    Con `orden: false` no importa el orden de las filas. Los nombres de columna solo se comparan si se dan.
    `7` y `7.0` cuentan como iguales; textos y `NULL` deben coincidir exactamente;
  - `tablas: { ventas: { filas: [[...]] } }`: el estado final de esas tablas (orden por la clave primaria);
  - `consulta: 'SELECT …'`: otra consulta que se ejecuta después del código del jugador, con su `resultado` esperado.
- `requiere`: `'where' 'and' 'or' 'in' 'between' 'like' 'null' 'order' 'limit' 'distinct' 'alias' 'funcion' 'count' 'sum' 'avg'
  'group' 'having' 'join' 'left' 'subconsulta' 'insert' 'update' 'delete' 'create' 'parametros'`, comprobados en el árbol sintáctico.
- Si falla, decir **qué** falló: "Tu consulta devuelve 5 filas, pero se esperaban 3: ¿falta una condición?",
  "Las filas son correctas, pero el reto pide ordenarlas por precio", "Falta la columna `especie`".

### 3.2 Tipo nuevo: `formulario`

Simula una página que construye una consulta a partir de lo que escribe una persona. Sirve para el tema 8.

```js
{ tipo: 'formulario', titulo, texto, bd,
  campos: [{ nombre: 'usuario', etiqueta: 'Usuario' }, { nombre: 'clave', etiqueta: 'Contraseña' }],
  plantilla: "SELECT nombre FROM usuarios WHERE nombre = '{usuario}' AND clave = '{clave}'",
  modo: 'texto' | 'parametros',
  mensajes: { conFilas: 'Hola, {nombre}', sinFilas: 'Datos incorrectos', error: 'La página ha fallado' },
  objetivo, casos: [{ valores: { usuario: '…', clave: '…' }, conFilas: true }], pistas, solucion: { usuario: '…', clave: '…' } }
```

- En la pantalla se ven los campos como un pequeño formulario retro, un botón "Enviar" y debajo, siempre visible,
  **la consulta final** que se ejecuta y la tabla de resultado.
- `modo: 'texto'`: cada `{campo}` se sustituye por el valor tal cual, sin escapar nada (así funcionan las páginas mal hechas).
- `modo: 'parametros'`: cada `{campo}` se sustituye por `?` y los valores se pasan como parámetros. La consulta mostrada lleva los `?`
  y, al lado, la lista de valores.
- El mensaje de la página sale de `mensajes`: `{columna}` se sustituye por el valor de la primera fila.
- El paso se supera cuando el jugador consigue lo que pide `objetivo`, comprobado con `casos` (por ejemplo, que haya filas).
- Ejemplo neutro para las pruebas de Codex: un buscador de animales por especie, `SELECT nombre FROM animales WHERE especie = '{especie}'`.

### 3.3 Paso del editor de consultas con parámetros

El tema 8 necesita escribir código que use parámetros. Para eso, un paso puede tener `parametros: ['Ana']`: el editor muestra
debajo un campo "Parámetros" con los valores separados por comas, y la consulta se ejecuta con ellos. Si el paso tiene `casos`
con `parametros`, se comprueba con esos valores.

## 4. La base de datos de la granja

La misma en todos los pasos salvo que el paso diga otra. En inglés, tablas, columnas y textos en inglés
(`animals(id, name, species, age, weight, pen)`, etc.). Datos inventados, sin personas reales.

- `animales(id INTEGER PRIMARY KEY, nombre TEXT NOT NULL, especie TEXT, edad INTEGER, peso REAL, corral TEXT)`:
  12 animales (gallinas, vacas, cabras, ovejas, un burro y un cerdo); una cabra sin `corral` (`NULL`); dos con el mismo nombre
  en distinta especie; un `peso` con decimales.
- `cultivos(id INTEGER PRIMARY KEY, nombre TEXT, parcela TEXT, kilos REAL, sembrado TEXT)`: 8 filas; `sembrado` con formato `'2026-03-14'`.
- `clientes(id INTEGER PRIMARY KEY, nombre TEXT, pueblo TEXT)`: 6 clientes; uno sin compras.
- `ventas(id INTEGER PRIMARY KEY, cliente_id INTEGER, producto TEXT, cantidad INTEGER, precio REAL, fecha TEXT)`:
  20 ventas; una de un `cliente_id` que no existe (para ver la diferencia entre `JOIN` y `LEFT JOIN`).

Los datos van en `js/sql/granja.js` (es) y `js/sql/en/granja.js` (en), como objetos, no como texto SQL.

## 5. Guion

Unos 56 pasos en los temas 1 a 7 (el número exacto puede variar ±3). Cada tema termina con un `resumen` con su chuleta.
Pasos cortos, frases sencillas, tono de Bina: práctica y cercana. Los ejemplos usan la granja.

### Tema 1 — Primeras consultas (7)
1. explica: una base de datos es un conjunto de tablas; una tabla, filas y columnas. `SELECT * FROM animales;` y mirar el panel Tablas.
2. explica: elegir columnas: `SELECT nombre, especie FROM animales;`.
3. explica: renombrar con `AS`: `SELECT nombre AS animal …`.
4. predice: `SELECT nombre especie FROM animales;` (falta la coma) → una sola columna llamada `especie` con los nombres.
5. arregla: `SELECT nombre FROM animal;` → `no such table: animal`.
6. reto: los nombres y el peso de todos los animales.
7. resumen.

### Tema 2 — Filtrar con WHERE (9)
1. explica: `WHERE especie = 'cabra'`. Textos entre comillas simples.
2. explica: comparar números: `edad > 3`, `peso <= 50`, `<>`.
3. explica: `AND`, `OR` y paréntesis.
4. predice: `especie = 'vaca' OR especie = 'cabra' AND edad > 4` (el `AND` va antes que el `OR`).
5. explica: `IN (…)` y `BETWEEN … AND …`.
6. explica: `LIKE` con `%` y `_`; no distingue mayúsculas, `=` sí.
7. explica: `NULL`: `corral IS NULL`; `= NULL` no encuentra nada (sale el consejo).
8. reto: las gallinas de más de 2 años o los animales sin corral.
9. resumen.

### Tema 3 — Ordenar y limitar (7)
1. explica: `ORDER BY peso` y `DESC`.
2. explica: ordenar por varias columnas.
3. predice: `ORDER BY corral`: los `NULL` salen primero.
4. explica: `LIMIT` y `OFFSET`: los 3 más pesados.
5. explica: `DISTINCT`: qué especies hay.
6. reto: los 2 cultivos con más kilos, de mayor a menor.
7. resumen.

### Tema 4 — Calcular (7)
1. explica: cuentas en el `SELECT`: `cantidad * precio AS total`.
2. predice: `SELECT 7 / 2;` da 3. `7 / 2.0` da 3.5.
3. explica: unir textos con `||`.
4. explica: `UPPER`, `LOWER`, `LENGTH`, `ROUND`.
5. explica: `CASE WHEN … THEN … ELSE … END` para poner etiquetas ("joven" / "adulto").
6. reto: cada venta con su total redondeado a 2 decimales, de mayor a menor.
7. resumen.

### Tema 5 — Agrupar (9)
1. explica: `COUNT(*)`: cuántos animales hay.
2. explica: `SUM`, `AVG`, `MIN`, `MAX`.
3. predice: `COUNT(*)` frente a `COUNT(corral)` (no cuenta `NULL`).
4. explica: `GROUP BY especie`: cuántos hay de cada especie. Usar "Paso a paso" para ver los grupos.
5. explica: agrupar y ordenar: la especie con más animales primero.
6. arregla: `WHERE COUNT(*) > 2` → `misuse of aggregate`. Se arregla con `HAVING`.
7. explica: `WHERE` filtra filas antes de agrupar; `HAVING` filtra grupos después. Verlo con "Paso a paso".
8. reto: lo vendido (suma de `cantidad * precio`) por producto, solo los productos con más de 20 € en total.
9. resumen.

### Tema 6 — Unir tablas (9)
1. explica: por qué hay varias tablas: `ventas.cliente_id` apunta a `clientes.id` (clave primaria y clave ajena).
2. explica: `JOIN … ON`: cada venta con el nombre del cliente.
3. explica: alias de tabla: `FROM ventas v JOIN clientes c ON v.cliente_id = c.id`.
4. arregla: `SELECT id FROM ventas JOIN clientes …` → `ambiguous column name: id`.
5. predice: `JOIN` sin `ON` → 120 filas (cada venta con cada cliente). Sale el consejo.
6. explica: `LEFT JOIN`: los clientes sin compras salen con `NULL`. La venta del cliente que no existe solo sale con la tabla de ventas a la izquierda.
7. explica: subconsulta: los animales que pesan más que la media (`WHERE peso > (SELECT AVG(peso) FROM animales)`).
8. reto — proyecto "el informe de la granja": cuánto ha gastado cada cliente (también los que no han comprado, con 0, usando `COALESCE`), ordenado de mayor a menor.
9. resumen.

### Tema 7 — Cambiar datos (8)
1. explica: `INSERT INTO animales (nombre, especie, edad) VALUES ('Lola', 'oveja', 1);` y ver la fila nueva resaltada. El `id` se pone solo.
2. explica: insertar varias filas de una vez.
3. explica: `UPDATE … SET … WHERE id = 3`.
4. predice: `UPDATE animales SET corral = 'norte';` sin `WHERE` → cambia todas las filas. Sale el consejo y el botón de restaurar.
5. explica: `DELETE FROM … WHERE …`. Lo borrado se ve tachado.
6. explica: `CREATE TABLE` con tipos, `PRIMARY KEY` y `NOT NULL`; el error `NOT NULL constraint failed`.
7. reto: crear la tabla `huevos(id, gallina_id, dia, cantidad)`, insertar 3 filas y consultar el total por gallina.
8. resumen.

### Tema 8 — Seguridad: consultas con parámetros (lo escribe Claude)
Solo hay que dejar el tema registrado y vacío (sección 0). Usará `formulario`, `parametros` y la tabla `usuarios`.

## 6. Progreso, idiomas y versión

- Progreso en `localStorage`, clave `cr-sql`, con el mismo formato que el curso de Bash. Los identificadores de paso son iguales en los dos idiomas.
- Textos de interfaz en `js/idiomas/es.js` y `en.js`. Contenido en `js/sql/temas.js` y `js/sql/en/temas.js` (y el tema 8 aparte).
- Funciona a 375 px de ancho, sin barra horizontal. La tabla de resultados, si es ancha, se desplaza dentro de su caja.
- La versión sube a **1.4.0**: `CR.VERSION` y los `?v=` de todos los HTML, también de `sql.html`. Añadir en `CHANGELOG.md`
  una entrada `## 1.4.0 (en preparación)` con el curso de SQL.
- README: una fila nueva en la tabla "Qué incluye".

## 7. Pruebas

`node pruebas/ejecutar.js` debe seguir pasando entero, con pruebas nuevas:

- Motor: cada cláusula y función de la sección 1.2, `NULL`, afinidad de tipos, división entera, `LIKE`, uniones, `UNION`,
  subconsultas, parámetros y todos los mensajes de error de la sección 1.1. Límites.
- Que un parámetro nunca se interpreta como SQL: enlazar `"' OR '1'='1"` devuelve 0 filas en una búsqueda por nombre.
- Todos los pasos en los dos idiomas: la `solucion` de cada reto y arreglo supera sus `casos`; el código de los `arregla` falla
  como se dice; las opciones de los `predice` tienen una correcta que coincide con lo que da el motor; la estructura es igual en los dos idiomas.
- El tipo `formulario` en los dos modos, con el ejemplo neutro.
- Pantalla (como en `pantalla.prueba.js`): ejecutar, tabla de resultados, panel Tablas, restaurar, paso a paso, progreso y cambio de idioma.
- **Contra SQLite real**:
  - `node pruebas/exportar-sql.js [--idioma es|en]` exporta casos `{ id, bd, sql, parametros }` a JSON. Incluye todas las consultas
    de ejemplo y soluciones de los pasos, y una batería del motor (unos 150 casos con lo de la sección 1).
  - `py -3.14 -I -X utf8 pruebas/comparar-sql.py casos.json` los ejecuta con `sqlite3` en memoria y compara columnas, filas
    (valor y tipo: entero, real, texto o `NULL`), filas cambiadas y el mensaje de error. Escribe un resumen "N de N iguales"
    y, si hay diferencias, cada caso con lo esperado y lo obtenido.
  - El orden de las filas solo se compara si la consulta tiene `ORDER BY`.

## 8. Reglas técnicas para Codex

- UTF-8 sin BOM. No usar `Set-Content` ni `Out-File`.
- Nada de `eval`, `new Function`, módulos ES, `fetch` ni `innerHTML` con texto del usuario o de la base de datos.
- Funciones de menos de 50 líneas y archivos de menos de 800 líneas: el motor en varios archivos
  (`lexico.js`, `analizador.js`, `expresiones.js`, `consulta.js`, `cambios.js`, `funciones.js`, `errores.js`…).
- Sin dependencias nuevas. Sin perfiles `.verificacion-*` dentro del proyecto. Sin git.
- No romper nada de lo que hay: los otros cursos, El Faro, Atalaya y las demos siguen igual y sus pruebas pasan.

## 9. Hecho significa

- Todas las pruebas pasan, también las nuevas.
- La comparación con SQLite da todos los casos iguales, o los distintos están explicados uno a uno en `docs/especificaciones/NOTAS-SQL.md`.
- `sql.html` funciona en los dos idiomas y a 375 px, con el tema 8 todavía vacío.
