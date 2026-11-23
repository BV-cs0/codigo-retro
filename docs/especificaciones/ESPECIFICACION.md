# Código Retro — especificación de las 3 demos

Juego original de estilo retro (pixel art 8/16 bits) para aprender a programar jugando.
Público: personas de 15 años en adelante y adultos que empiezan a programar desde cero.
Todo el texto del juego en español claro y directo, frases cortas, con humor ligero; nada infantil, sin tratar al jugador como a un niño.
En las tres demos se programa **escribiendo Python** (un subconjunto pequeño de Python real, ver sección 4).
Lo que se aprende aquí debe servir tal cual en Python de verdad: al terminar cada nivel se muestra una nota corta
"En Python de verdad…" que explica cómo se usa ese concepto fuera del juego.
Se juega en el navegador abriendo `index.html` con doble clic (protocolo `file://`), sin instalar nada.

Hay **tres demos**, cada una con **5 niveles cortos**. Cada nivel enseña un concepto nuevo, siempre en este orden:

1. Secuencia (órdenes una detrás de otra)
2. Bucle (repetir)
3. Condición (si… / si no…)
4. Variable (una caja que guarda un número)
5. Función (dar nombre a un grupo de órdenes y usarlo varias veces)

Todo es original: personajes, dibujos, nombres, sonidos y niveles. No imitar ningún juego existente.

---

## 1. Reglas técnicas (obligatorias)

- Solo HTML + CSS + JavaScript puro. Sin frameworks, sin npm, sin paso de compilación, sin dependencias.
- Debe funcionar desde `file://`: **no usar módulos ES (`import`/`export`) ni `fetch`**. Usar `<script src="...">` normales.
  Cada archivo expone su API en un único objeto global (`window.CR = window.CR || {}` y luego `CR.Motor = ...`).
- Los archivos de `js/comun/` y los `niveles.js` deben poder cargarse también en Node para las pruebas:
  al final de cada uno, `if (typeof module !== 'undefined') module.exports = ...`. No deben tocar `document`/`window` al cargarse
  (el código de pantalla va en otros archivos).
- **Prohibido** `eval`, `new Function`, `innerHTML` con texto escrito por el jugador (usar `textContent`).
- Sin peticiones de red. Sin fuentes externas: usar una pila `font-family` monoespaciada (p. ej. `"Courier New", monospace`)
  en negrita; los títulos grandes se pueden dibujar en el canvas con una fuente de píxeles propia (mapa de bits definido en JS).
- Pixel art dibujado por código: cada sprite es un array de cadenas (un carácter = un píxel, con una paleta de colores).
  Canvas con resolución baja (por ejemplo 192×192 para el mapa) escalado con `image-rendering: pixelated`.
- Sonidos cortos con Web Audio (pitidos tipo chiptune: paso, choque, recoger, victoria). Botón para silenciar.
  No usar archivos de sonido. Ningún sonido de zumbido.
- Progreso (niveles superados y estrellas) en `localStorage`, siempre dentro de `try/catch`; el juego debe funcionar igual si falla.
- Archivos en UTF-8 **sin BOM**. Revisar que las tildes y la ñ se vean bien (nada de `?` en lugar de `á`).
  No escribir archivos con `Set-Content` de PowerShell 5.1.
- Funciones cortas (menos de 50 líneas), archivos de menos de 800 líneas, nombres claros en español.
- Pantalla pensada para 1280×720 o más; en pantallas más estrechas no debe salir barra de desplazamiento horizontal.
- Se juega con ratón y también con teclado (Tab, Enter). Botones con texto claro.

## 2. Estructura de carpetas

```
juego-retro/
  index.html            menú principal: elegir demo (3 tarjetas con dibujo, nombre y frase)
  robot.html            demo 1
  mago.html             demo 2
  granja.html           demo 3
  css/estilo.css        estilo común retro (bordes gruesos de píxel, colores planos, sombras duras)
  js/comun/
    motor.js            intérprete del árbol de programa (AST) — ver sección 3
    python.js           traductor de Python sencillo a AST, y de AST a texto Python
    editor.js           editor de código común a las 3 demos (sección 5) — pantalla
    pixel.js            dibujo de sprites, fuente de píxeles, utilidades de canvas — pantalla
    sonido.js           sonidos Web Audio — pantalla
    progreso.js         guardar/leer progreso (con try/catch); sin DOM
    nivel-ui.js         pantalla común de nivel: intro, botones ▶ / paso a paso / parar / reiniciar, mensajes, estrellas
  js/robot/  mundo.js  niveles.js  juego.js
  js/mago/   mundo.js  niveles.js  juego.js
  js/granja/ mundo.js  niveles.js  juego.js
  pruebas/
    ejecutar.js         `node pruebas/ejecutar.js` ejecuta todas las pruebas, sin dependencias, y sale con código 1 si alguna falla
    *.prueba.js         pruebas del motor, del traductor Python y de que cada nivel se puede resolver
  README.md             cómo jugar y cómo ejecutar las pruebas
```

`mundo.js` contiene solo la lógica del mundo (sin DOM), para poder probarla en Node. `juego.js` dibuja y conecta la pantalla.

## 3. El motor común (`js/comun/motor.js`)

Las tres demos usan el mismo árbol de programa (AST). El texto Python se convierte en este árbol.

### Instrucciones
```
{ tipo: 'accion',  nombre: 'avanzar', args: [expr...] }    // orden del mundo
{ tipo: 'repetir', veces: expr, cuerpo: [instr...] }
{ tipo: 'si',      condicion: expr, entonces: [instr...], sino: [instr...] }
{ tipo: 'asignar', variable: 'gemas', valor: expr }
{ tipo: 'definir', nombre: 'escalon', cuerpo: [instr...] }  // función sin parámetros
{ tipo: 'llamar',  nombre: 'escalon' }
```
### Expresiones
```
{ tipo: 'numero', valor: 3 }
{ tipo: 'variable', nombre: 'gemas' }
{ tipo: 'sensor', nombre: 'hay_muro', args: [] }    // pregunta al mundo, devuelve número o booleano
{ tipo: 'binaria', op: '+'|'-'|'=='|'!='|'<'|'>', izq: expr, der: expr }
{ tipo: 'no', expr: expr }
```

### Ejecución
- `CR.Motor.crearEjecucion(programa, mundo, opciones)` devuelve un objeto con `paso()` que avanza **una acción del mundo**
  cada vez (usar un generador internamente). Así la pantalla puede animar paso a paso y resaltar la línea que se ejecuta.
- Cada instrucción del AST lleva `linea` (número de línea del texto); `paso()` devuelve `{ hecho, instr, error }` para resaltarla.
- El mundo tiene la forma: `mundo.accion(nombre, args)` → `{ ok: true }` o `{ ok: false, mensaje: 'Te has chocado con un muro.' }`;
  `mundo.sensor(nombre, args)` → valor; `mundo.ganado()` → booleano; `mundo.acciones` y `mundo.sensores` (listas de nombres válidos).
- Límite de seguridad: como mucho 1000 acciones y 5000 pasos internos; si se pasa: "¡Tu programa no termina nunca! Revisa los bucles."
- Errores con mensajes amables en español: variable sin valor, función que no existe, orden desconocida, `repetir` con un número negativo o enorme (máx. 50).
- `CR.Motor.contarInstrucciones(programa)` cuenta instrucciones y `CR.Motor.usaConcepto(programa, concepto)` dice si usa repetir, si, asignar o definir.

### Niveles con variantes
Cada nivel tiene una o más **variantes** del mapa. En los niveles de condición y de variable hay al menos 2 variantes distintas:
el programa del jugador se ejecuta en todas, una tras otra, y solo gana si funciona en todas. Así la condición o la variable
sirven de verdad (un programa fijo no vale). La pantalla lo explica: "Tu programa tiene que funcionar en los 2 mapas".

Cada nivel define:
```
{ id, titulo, concepto, intro: [frases cortas del personaje], pista, variantes: [mapa...],
  ordenes: [...] (órdenes y sensores disponibles), ejemplo: 'texto Python corto de la libreta',
  codigoInicial: '' (opcional), maxLineas (opcional, obliga a usar el concepto), estrellas3: N (líneas para 3 estrellas),
  pythonReal: 'nota corta: así se usa este concepto en Python de verdad',
  solucion: texto Python que resuelve todas las variantes (se usa en las pruebas, nunca se muestra) }
```
Estrellas: superar el nivel = 1; usar el concepto nuevo del nivel = 2; usar como mucho `estrellas3` líneas de código = 3
(no cuentan líneas vacías ni comentarios). Usar `CR.Motor.usaConcepto` sobre el AST para saber si se usó el concepto.

## 4. Traductor Python sencillo (`js/comun/python.js`)

Lo usan las tres demos. Cada demo solo acepta las órdenes y sensores de su mundo y de su nivel.

Sintaxis aceptada (subconjunto pequeño de Python real):
```python
# comentario
avanzar()
girar_derecha()
abrir(llave)
for i in range(3):
    avanzar()
if hay_enemigo():
    lanzar_fuego()
else:
    avanzar()
if not hay_muro():
    avanzar()
llave = leer_runa()
cesta = 0
cesta = cesta + 1
cesta += 1
def escudo_y_avanzar():
    escudo()
    avanzar()
escudo_y_avanzar()
```
- Bloques por sangría (espacios o tabuladores, de forma coherente). `for _ in range(n)` se traduce a `repetir`; la variable del for se puede ignorar.
- Expresiones: enteros, nombres de variable, llamadas a sensores, `+ - == != < >`, `not`, paréntesis.
- Errores con número de línea y frases sencillas: "Línea 3: falta ':' al final.", "Línea 5: la sangría no cuadra.",
  "Línea 2: no conozco la orden 'avansar'. ¿Querías decir 'avanzar'?" (sugerir el nombre más parecido).
- `CR.Python.aTexto(programa)` hace lo contrario: convierte un AST en texto Python bonito (4 espacios). Probar ida y vuelta.

## 5. Editor de código (`js/comun/editor.js`) — las 3 demos

- Un `<textarea>` con números de línea a la izquierda, fuente monoespaciada, fondo oscuro tipo terminal retro.
  Tab escribe 4 espacios; Enter después de una línea que acaba en `:` añade sangría automáticamente; Mayús+Tab quita sangría.
- Coloreado sencillo de sintaxis (palabras clave, números, comentarios, órdenes del mundo) con una capa `<pre>` detrás del
  textarea transparente, escapando el texto (nunca `innerHTML` con texto sin escapar).
- Al lado, la **libreta**: lista de órdenes y sensores disponibles en el nivel, con una línea de explicación cada una,
  y el `ejemplo` del nivel con un botón "Copiar al editor" (lo añade al final).
- Contador "Líneas: 5 / 8" si hay `maxLineas`.
- Durante la ejecución, la línea que se ejecuta se resalta; el editor queda en solo lectura hasta parar o terminar.
- Los errores de sintaxis salen debajo del editor con el número de línea, y esa línea se marca en rojo.
- El código de cada nivel se guarda en `localStorage` (con try/catch) para no perderlo al recargar.
- El ritmo y la cara de cada demo cambian con el tema de colores (mina: ocres y cian; mazmorra: morados; granja: verdes y amarillos).

## 6. Pantalla de nivel común (`js/comun/nivel-ui.js`)

- Arriba: nombre de la demo, "Nivel 2 de 5 · Bucles", estrellas, botón "Menú", botón de sonido.
- Al entrar: cuadro de diálogo del personaje con 2–4 frases (pixel art del personaje al lado). Botón "¡Vamos!".
- Botones: "▶ Ejecutar", "Paso a paso", "■ Parar", "↺ Reiniciar mapa", "💡 Pista", y control de velocidad (lenta / normal / rápida).
- Al ganar: ventana con estrellas, una frase sobre el concepto aprendido ("¡Has usado un bucle! Repetir ahorra mucho trabajo.")
  y botones "Siguiente nivel" / "Volver a intentar". Al terminar el nivel 5: pantalla final de la demo con las estrellas totales.
- Al fallar: el personaje explica el problema con una frase corta y amable, sin palabras técnicas difíciles.
- Selector de niveles en el menú de cada demo: los 5 niveles visibles; en la demo todos están desbloqueados (para probar fácil),
  pero se marca cuáles están superados.

## 7. Demo 1 — "Pico en la mina" (Python, puzles de movimiento)

Personaje: **Pico**, un robot minero pequeño y redondo con una lámpara en la cabeza. Mapa de cuadros 8×8 de una mina
(suelo, roca/muro, vagonetas decorativas, cristal brillante como meta). Pico mira hacia una dirección (se ve en el sprite).

Órdenes: `avanzar()`, `girar_izquierda()`, `girar_derecha()`, `picar()` (rompe una roca blanda delante).
Sensores: `hay_muro()` (delante), `hay_roca_blanda()` (delante), `leer_cartel()` (número escrito en el cartel donde está Pico).
Gana al llegar a la casilla del cristal (en todas las variantes).

1. **Secuencia — "Primeros pasos"**: camino en forma de L hasta el cristal. Órdenes: avanzar y girar. Sin límite.
2. **Bucle — "El túnel largo"**: pasillo recto de 7 casillas y luego un giro y 3 más. `maxLineas` 5 obliga a usar `for`.
3. **Condición — "Rocas por sorpresa"**: pasillo recto de 6; en cada variante hay rocas blandas en sitios distintos.
   Solución: `for` de 6 vueltas con `if hay_roca_blanda(): picar()` y luego `avanzar()`. 2 variantes.
4. **Variable — "El cartel"**: Pico empieza sobre un cartel con un número (4 en una variante, 6 en otra) = pasos hasta el cristal.
   Solución: `pasos = leer_cartel()` y `for i in range(pasos): avanzar()`. 2 variantes.
5. **Función — "La escalera"**: escalera en diagonal de 4 escalones (avanzar, girar_izquierda, avanzar, girar_derecha).
   Solución: `def escalon():` y llamarla (con o sin `for`). `maxLineas` obliga a usar la función.

## 8. Demo 2 — "El hechizo de Brasa" (Python, mazmorra con peligros)

Personaje: **Brasa**, una aprendiz de maga con capa morada y un sombrero con una llama pequeña. Mazmorra vista desde arriba,
cuadros 8×8: baldosas, muros, puertas con runas, murciélagos de sombra (enemigos), portal mágico (meta).
Aquí la libreta se llama "libro de hechizos". Esta demo es algo más difícil que la de Pico.

Acciones: `avanzar()`, `girar_izquierda()`, `girar_derecha()`, `lanzar_fuego()` (espanta al murciélago de la casilla de delante),
`abrir(numero)` (abre la puerta de delante si el número es el de la runa).
Sensores: `hay_enemigo()` (delante), `hay_muro()` (delante), `leer_runa()` (número de la piedra de runa donde está Brasa).
Pierde si avanza contra un muro, una puerta cerrada o un murciélago. Gana al llegar al portal.

1. **Secuencia — "Primer hechizo"**: camino corto con dos giros. Ejemplo de la libreta: `avanzar()`.
2. **Bucle — "El pasillo eterno"**: 8 casillas rectas; 3 estrellas con 2 líneas (`for i in range(8):` + `avanzar()`).
3. **Condición — "Murciélagos"**: pasillo de 6; los murciélagos cambian de sitio entre las 2 variantes.
   Solución: `for` + `if hay_enemigo(): lanzar_fuego()` + `avanzar()`.
4. **Variable — "La puerta de la runa"**: Brasa empieza sobre una piedra de runa; la puerta pide ese número (distinto en cada variante).
   Solución: `clave = leer_runa()`, avanzar, `abrir(clave)`, avanzar hasta el portal.
5. **Función — "Zigzag"**: camino en zigzag que repite el mismo trozo 3 veces; 3 estrellas solo si se usa `def`.

## 9. Demo 3 — "Granja de Bina" (Python, gestión y datos)

Personaje: **Bina**, una robot granjera con sombrero de paja y una regadera. Vista lateral de una fila de 8 parcelas de tierra
(o un campo de 2 filas), con cielo, sol, valla y un puesto de mercado al final. Ritmo tranquilo, sin peligros: si algo sale mal,
Bina dice qué ha pasado ("¡Uy! Esta parcela ya tenía semilla.").

Órdenes: `avanzar()`, `plantar()`, `regar()`, `cosechar()`, `vender(numero)` (en el puesto: dice cuántas verduras lleva).
Sensores: `tierra_seca()` (la parcela donde está Bina), `hay_zanahoria()` (madura, en la parcela), `en_mercado()`.
Cada nivel tiene un objetivo que se comprueba al terminar el programa (p. ej. "todas las parcelas plantadas y regadas").
Debajo del dibujo, un pequeño panel "Variables" muestra en vivo el valor de cada variable mientras se ejecuta el programa
(muy útil en el nivel 4).

1. **Secuencia — "Primera siembra"**: 3 parcelas: plantar, regar y avanzar en cada una.
2. **Bucle — "El campo grande"**: 8 parcelas; `maxLineas` obliga a usar `for`.
3. **Condición — "Tierra seca"**: algunas parcelas están secas y otras ya mojadas (cambia entre 2 variantes);
   regar una parcela mojada la encharca y falla. Solución: `for` con `if tierra_seca(): regar()` y luego `avanzar()`.
4. **Variable — "A contar zanahorias"**: hay zanahorias maduras en algunas parcelas (3 en una variante, 5 en otra).
   Hay que cosecharlas, contarlas con una variable `cesta` (empieza en 0, `cesta = cesta + 1`) y al llegar al mercado
   `vender(cesta)` con el número exacto.
5. **Función — "La rutina de Bina"**: cada parcela necesita plantar, regar y avanzar; 2 filas de 4. Definir `cuidar_parcela()` y usarla.

## 10. Menú principal (`index.html`)

- Título "CÓDIGO RETRO" grande en fuente de píxeles con un brillo sencillo, fondo de estrellas o cuadros animados.
- Tres tarjetas, cada una con el personaje animado (2 fotogramas), el nombre de la demo, una frase ("Guía a Pico por la mina",
  "Abre camino con hechizos", "Organiza la granja con datos"), la dificultad (fácil / media / media) y las estrellas conseguidas (0–15).
- Pie: "Aprende Python: secuencias · bucles · condiciones · variables · funciones".

## 11. Pruebas (`node pruebas/ejecutar.js`)

Mínimo:
- Motor: cada tipo de instrucción y expresión; límite de pasos (bucle infinito detectado); errores (variable sin valor, función desconocida).
- Python: traducir cada construcción de la sección 4; errores con número de línea (falta `:`, sangría mal, orden desconocida con sugerencia);
  ida y vuelta `aTexto` → traducir → mismo AST.
- Niveles: para **cada uno de los 15 niveles**, ejecutar `solucion` en **todas** sus variantes y comprobar que gana.
  En los niveles 3 y 4 de cada demo, comprobar también que un programa fijo sin condición/variable (el que resuelve solo la variante 1)
  **falla** en la variante 2 (así el concepto es necesario).
- Comprobar que todos los `.js` y `.html` son UTF-8 sin BOM y no contienen `eval(` ni `new Function`.

## 12. Hecho significa

- Abrir `index.html` con doble clic muestra el menú; desde él se entra a las 3 demos y se puede volver.
- En cada demo se pueden jugar y superar los 5 niveles de principio a fin, y cada nivel enseña un concepto nuevo.
- `node pruebas/ejecutar.js` pasa entero.
- Sin errores en la consola del navegador.
