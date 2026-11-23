# Código Retro — Curso de Python paso a paso (modo nuevo)

Este documento amplía `ESPECIFICACION.md`. Se mantienen todas sus **reglas técnicas** (sección 1): JS puro, funciona con `file://`,
sin módulos ES ni `fetch`, sin `eval`/`new Function`, sin `innerHTML` con texto del usuario, UTF-8 sin BOM, sin red,
funciones de menos de 50 líneas y archivos de menos de 800 líneas, pixel art dibujado por código, todo original.

Público: personas de 15 años en adelante y adultos que empiezan desde cero. Español claro, frases cortas, tono cercano y nada infantil.

## 1. La idea

El jugador elige un **tema**, por ejemplo "Funciones", y el curso le enseña **paso a paso**:
qué es, cómo se escribe, qué pasa si cambias algo, qué pasa si lo combinas con lo que ya sabe (bucles, if, listas…),
y cómo se ve el error típico. Cada paso es corto (una idea por paso) y casi siempre se puede **ejecutar y tocar** el código.

Se enseña **Python real**: todo el código del curso debe dar exactamente la misma salida en el Python de verdad (CPython 3).
Lo comprobaré ejecutando cada fragmento en CPython (ver sección 8).

Las 3 demos existentes **no se tocan** (siguen igual y sus 72 pruebas deben seguir pasando). El curso es un modo nuevo.

## 2. Guía del curso

**Cursor**: una criatura pequeña con forma de monitor antiguo, cara de píxeles verdes en la pantalla y dos patitas.
Parpadea (2 fotogramas). Es quien explica en cada paso. Al final de algunos temas aparecen Pico, Brasa o Bina en los pasos de "mundo".

## 3. Pantallas

### 3.1 Menú principal (`index.html`)
Añadir una **cuarta tarjeta, la primera y más ancha**: "Curso de Python — aprende paso a paso", con Cursor animado y el progreso total
("12 / 67 pasos"). Enlaza a `curso.html`. Las tres demos quedan debajo con el título "Practica jugando".

### 3.2 Índice del curso (`curso.html`, vista índice)
- Los 6 temas como "cartuchos" retro en una cuadrícula: número, nombre, una frase, barra de progreso, "Necesitas: …" (temas previos recomendados,
  sin bloquear: se puede entrar a cualquiera).
- Botón "Continuar donde lo dejé".

### 3.3 Pantalla de paso (`curso.html`, vista paso)
Tres columnas (en pantallas estrechas se apilan, sin barra horizontal):
- **Izquierda — Lección**: "Funciones · Paso 4 de 15", título del paso, Cursor con un bocadillo con el texto (párrafos cortos;
  se permite `código` en línea, que se pinta con fuente monoespaciada; el texto se construye con nodos, nunca con `innerHTML`).
  Debajo, si el paso lo tiene, una caja **"Recuerda"** con 1–2 líneas clave.
- **Centro — Editor**: el editor de código común (reutilizar `js/comun/editor.js`, ampliando su coloreado para las palabras nuevas:
  `elif while break continue return True False None and or pass print len` y textos entre comillas).
  Botones: "▶ Ejecutar", "Paso a paso", "■ Parar", "↺ Restaurar código" (vuelve al código original del paso). Velocidad.
- **Derecha — Resultado**:
  - **Consola** retro (texto verde sobre negro, cursor parpadeante) con lo que imprime `print()`. Los errores salen en rojo con
    el nombre real de Python y una explicación en español (sección 5.5).
  - **Variables**: tabla nombre → valor (con el formato de Python: `'texto'`, `[1, 2]`, `True`, `None`) que se actualiza en cada paso.
  - **Llamadas**: la pila de funciones activas, p. ej. `doble(n=4)` encima de `programa principal`. Así se ve qué pasa al llamar a una función.
  - En los pasos de **mundo**, encima de la consola sale el mapa de la demo correspondiente.
- Abajo: "← Anterior" · puntos de progreso del tema (clicables) · "Siguiente →". "Siguiente" se activa al completar el paso
  (explicación: tras ejecutar una vez; predicción: tras responder; reto/arreglo/mundo: al superarlo). Se puede saltar con "Saltar paso"
  (queda marcado como no completado).
- Al terminar un tema: pantalla de resumen con la **chuleta** del tema (5–8 líneas de código clave con su explicación) y botón al siguiente tema.

Durante "Paso a paso" se resalta la línea que se va a ejecutar y se actualizan Variables y Llamadas en cada instrucción.
En "Ejecutar" se anima con la velocidad elegida (rápida = casi instantáneo).

## 4. Tipos de paso

Cada paso es un objeto en `js/curso/temas/<tema>.js`:

```js
{ tipo: 'explica' | 'predice' | 'reto' | 'arregla' | 'mundo' | 'resumen',
  titulo, texto: ['párrafo', 'párrafo con `codigo`'], recuerda: '...'(opcional),
  etiqueta: 'Combinación: funciones + bucles' (opcional, se muestra como insignia),
  codigo: 'código inicial del editor',
  // predice:
  pregunta: '¿Qué saldrá en la consola?', opciones: ['...', '...', '...'], correcta: 1, explicacion: '...',
  // reto / arregla / mundo:
  objetivo: 'frase corta', salidaEsperada: 'texto exacto de la consola' (opcional),
  pruebas: [{ codigo: 'print(doble(7))', salida: '14' }] (opcional, se ejecutan después del código del jugador en el mismo ámbito global),
  requiere: ['def', 'return', 'for', 'while', 'if', 'elif', 'lista', 'parametro', 'fstring'] (opcional, se comprueba en el AST),
  pistas: ['pista 1', 'pista 2'], solucion: 'código que supera el paso (solo para pruebas; se puede mostrar tras 2 intentos fallidos con el botón "Ver una solución")',
  mundo: { demo: 'robot'|'mago'|'granja', mapa: ... } (solo tipo mundo) }
```

- **explica**: texto + código de ejemplo editable. El jugador lo ejecuta y puede cambiarlo y volver a ejecutarlo. Invitar a tocar:
  "Cambia `'Ana'` por tu nombre y ejecuta otra vez."
- **predice** ("¿Qué pasa si…?"): se muestra el código **sin ejecutar** y 3 opciones. Al elegir, se ejecuta el código, se ve la salida real
  y la explicación (acierte o no; si falla, el tono es amable: "Casi. Fíjate en…").
- **reto**: objetivo + código inicial con huecos o vacío. Se supera si la salida coincide con `salidaEsperada` (comparando líneas, sin
  espacios finales), pasan todas las `pruebas` y se cumple `requiere`. Si falla, decir **qué** falló:
  "Tu programa imprimió `6` y `20`, pero se esperaba `6`, `20` y `14`." o "Funciona, pero este reto pide usar `return`."
- **arregla** ("¿Qué falla aquí?"): código con un error típico. El jugador lo ejecuta, ve el error y lo corrige. Se supera igual que un reto.
- **mundo**: reto en el mapa de una demo (Pico, Brasa o Bina) usando lo aprendido (p. ej. una función con parámetro). Las órdenes del mundo
  son funciones integradas más (`avanzar()`…). Se supera al ganar el mapa (y `requiere`).
- **resumen**: la chuleta del tema (también es un paso, el último).

## 5. Intérprete de Python del curso (`js/curso/py/`)

Intérprete nuevo, separado del motor de las demos (que no se toca). Archivos sugeridos: `lexico.js` (tokens con línea y columna,
INDENT/DEDENT), `sintaxis.js` (parser a AST), `valores.js` (tipos, formato `repr`/`str` como Python), `interprete.js` (ejecución
paso a paso con generador), `integradas.js` (funciones integradas), `errores.js` (mensajes). Todos cargables en Node.

### 5.1 Subconjunto de Python soportado
- **Valores**: `int`, `float`, `str` (comillas simples o dobles; escapes `\n \t \\ \' \"`), `bool` (`True`/`False`), `None`, `list`.
- **Expresiones**: `+ - * / // % **`, menos unario, comparaciones `== != < > <= >=` (encadenadas como `0 < x < 10` también),
  `and or not` (con cortocircuito y devolviendo el operando como en Python), `in` / `not in` (listas y textos), paréntesis,
  índices `lista[i]` y `texto[i]` (incluidos negativos), cortes sencillos `a[i:j]`, literales de lista `[1, 2, 3]`,
  **f-strings** con `{expresion}` (sin especificadores de formato), llamadas a funciones y a métodos.
- **Instrucciones**: asignación (la asignación múltiple `a, b = b, a` no hace falta), asignación a índice `lista[0] = 5`, `+= -= *= /=`,
  `if/elif/else`, `for x in <iterable>` (range, lista, texto), `while`, `break`, `continue`, `def nombre(p1, p2=valor):`,
  `return` (con o sin valor), `pass`, expresiones sueltas (p. ej. una llamada), comentarios `#`.
- **Integradas**: `print(*args, sep=' ', end='\n')`, `len`, `str`, `int`, `float`, `bool`, `range(n) / range(a, b) / range(a, b, paso)`,
  `abs`, `max`, `min`, `sum`, `round(x)` y `round(x, n)`, `type` (devuelve `<class 'int'>` al imprimir), `list`, `sorted`.
  Métodos: listas `append`, `pop`, `insert`, `remove`, `index`, `count`; textos `upper`, `lower`, `strip`, `replace`, `split`, `join`, `startswith`.
  `input()` **no** se soporta (decir "En el curso no usamos input(); da el valor directamente").
- **Ámbitos como Python**: dentro de una función, asignar crea una variable local; leer una global está permitido; no hay `global`.
  Las listas se pasan por referencia (modificarlas dentro de la función se ve fuera, igual que en Python).
- **Formato como Python**: `print(3/2)` → `1.5`; `print(4/2)` → `2.0`; `print(0.1+0.2)` → `0.30000000000000004`
  (usar el formato de JS para float salvo que acabe en entero: añadir `.0`); `print([1, 'a', True])` → `[1, 'a', True]`;
  `//` y `%` con negativos como Python (redondeo hacia abajo); `int('7')` → 7; `str(2.0)` → `'2.0'`; `True + 1` → 2.
  Los `int` se representan con `Number` de JS (no hace falta BigInt; si un entero supera 2^53, error "número demasiado grande").
- Distinguir `int` y `float` (p. ej. `{ tipo: 'float', valor }`) para que `print(2.0)` muestre `2.0` y `print(2)` muestre `2`.

### 5.2 Ejecución paso a paso
`CR.Py.ejecutar(codigo, opciones)` devuelve un objeto con `paso()` que avanza **una instrucción** y devuelve
`{ hecho, linea, salida (texto nuevo de la consola), variables (globales y locales visibles, ya formateadas), llamadas (pila), error }`.
`opciones.integradas` permite añadir funciones del mundo (para los pasos de mundo); una acción del mundo que falla lanza un error amable.

### 5.3 Límites
Máximo 20 000 instrucciones ("Tu programa no termina nunca. ¿Hay un `while` cuya condición nunca se vuelve falsa?"),
profundidad de llamadas 100 ("RecursionError: demasiadas llamadas una dentro de otra"), listas de 10 000 elementos, textos de 100 000 caracteres,
consola de 500 líneas.

### 5.4 Comprobaciones de `requiere`
`'def'` hay alguna función definida; `'parametro'` alguna función tiene parámetros; `'return'` hay un `return` con valor;
`'for' 'while' 'if' 'elif'` aparece esa instrucción; `'lista'` hay un literal de lista; `'fstring'` hay una f-string.

### 5.5 Errores
Formato: primera línea con el nombre real de Python y la línea, después la explicación sencilla. Ejemplos:
- `NameError` (línea 4): "`nombre` no existe todavía. ¿Lo has escrito bien? ¿Lo creaste antes de usarlo?" + sugerencia del nombre más parecido.
- `TypeError` al sumar texto y número: "No se puede sumar un texto y un número. Convierte el número con `str()` o usa una f-string."
- `TypeError` por número de argumentos: "`doble()` necesita 1 argumento (`n`) y le has dado 0."
- `ZeroDivisionError`: "No se puede dividir entre cero."
- `IndexError`: "La lista tiene 3 elementos: las posiciones válidas van de 0 a 2."
- `SyntaxError`: falta `:`, paréntesis sin cerrar, comillas sin cerrar.
- `IndentationError`: "Esperaba una línea con sangría después de `:`." / "Esta sangría no coincide con ninguna anterior."
- `AttributeError`: método que no existe (sugerir el parecido).
El `type` de cada error (`'NameError'`, etc.) debe estar disponible por separado para las pruebas.

## 6. Contenido del curso

6 temas, 67 pasos en total. Cada tema termina con un paso **resumen**. Las "combinaciones" llevan `etiqueta`.
A continuación, el guion de cada tema. Hay que escribir los textos completos y el código siguiendo este guion
(se puede ajustar el detalle, pero no quitar pasos ni cambiar su intención).

### Tema 1 — Primeros pasos (`print`, textos, números, orden)
1. explica: `print("Hola, mundo")`. Qué es una instrucción y la consola.
2. explica: textos con comillas vs números sin comillas: `print("5 + 3")` y `print(5 + 3)`.
3. predice: `print("2" * 3)` → `222`.
4. explica: varias instrucciones se ejecutan en orden, de arriba abajo; `print` con varios valores separados por coma.
5. explica: comentarios con `#`.
6. arregla: `print("Hola)` (comillas sin cerrar) → SyntaxError.
7. reto: imprimir tres líneas exactas (una pequeña tarjeta de presentación).
8. resumen.

### Tema 2 — Variables (guardar, cambiar, operar)
1. explica: una variable es un nombre para un valor: `nombre = "Ana"`, `print(nombre)`.
2. explica: cambiar el valor; la variable guarda **el último**. Ver el panel Variables con "Paso a paso".
3. explica: operaciones `+ - * / // % **` con un ejemplo de cada; `/` siempre da decimal.
4. predice: `x = 5`, `x = x + 1`, `print(x)` → 6. Y `+=`.
5. explica: f-strings: `print(f"Tengo {edad} años")`.
6. arregla: `"Edad: " + 30` → TypeError; arreglar con `str()` o f-string.
7. predice: `a = 3`, `b = a`, `a = 10`, `print(b)` → 3.
8. reto: calcular el precio total con IVA de 3 productos y mostrarlo con una f-string.
9. resumen.

### Tema 3 — Condiciones (`if`, `elif`, `else`, comparar, `and/or/not`)
1. explica: `if edad >= 18:` y la sangría (el bloque).
2. explica: `else`.
3. explica: `elif` para más de dos casos (nota: "notable", "aprobado", "suspenso").
4. predice: orden de `elif` importa (`if n > 5` antes de `if n > 10` → nunca llega al segundo).
5. explica: comparaciones y `==` frente a `=`.
6. explica: `and`, `or`, `not` con una tabla pequeña.
7. arregla: falta `:` o sangría mal en un if → error y arreglo.
8. Combinación: condiciones + variables — reto: según la temperatura, imprimir un consejo (3 casos, `elif` obligatorio).
9. mundo (Pico): reto con `if hay_roca_blanda():` dentro de un recorrido.
10. resumen.

### Tema 4 — Bucles (`for`, `range`, `while`, `break`)
1. explica: `for i in range(5): print(i)` → empieza en 0 y no incluye el 5.
2. explica: `range(1, 6)` y `range(0, 10, 2)`.
3. predice: ¿cuántas veces imprime? `for i in range(2, 5)` → 3 veces.
4. explica: acumular dentro de un bucle: sumar del 1 al 10 (`total += i`). Ver Variables paso a paso.
5. explica: `while` con contador.
6. predice: `while` que nunca acaba → el curso lo detiene; explicar por qué.
7. explica: `break` para salir antes.
8. Combinación: bucles + condiciones — reto: imprimir los pares del 1 al 20 (con `%`).
9. Combinación: bucles + f-strings — reto: tabla de multiplicar del 7 (`7 x 1 = 7`…).
10. mundo (Bina): regar todas las parcelas secas con un `for` y un `if`.
11. resumen.

### Tema 5 — Listas
1. explica: `frutas = ["pera", "uva", "kiwi"]`, `print(frutas)`.
2. explica: posiciones desde 0, `frutas[0]`, `frutas[-1]`.
3. arregla: `frutas[3]` → IndexError.
4. explica: `append`, `len`.
5. Combinación: listas + bucles — explica: `for fruta in frutas:`.
6. predice: modificar una lista dentro de un bucle de suma (`sum`, `max`, `min`).
7. Combinación: listas + condiciones — reto: de una lista de notas, contar cuántas son aprobadas.
8. explica: `in`: `if "uva" in frutas:`.
9. resumen.

### Tema 6 — Funciones (el tema más completo)
1. explica: ya has usado funciones: `print()`, `len()`. Una función es un trozo de código con nombre que haces funcionar al llamarla.
2. explica: crear una: `def saludar():` + `print("¡Hola!")` y llamarla dos veces. "Definir no la ejecuta; llamarla sí."
3. predice: definir sin llamar → no sale nada. Opciones: `¡Hola!` / nada / un error.
4. explica: parámetros: `def saludar(nombre):` + `print(f"Hola, {nombre}")`, llamadas con `"Ana"` y `"Leo"`. Mirar la pila de Llamadas con Paso a paso.
5. explica: varios parámetros y el orden de los argumentos: `def presentar(nombre, edad):`.
6. arregla: llamar `presentar("Ana")` sin la edad → TypeError por número de argumentos.
7. reto: `def doble(n):` que imprima el doble; llamar con 3 y 10 (salida `6` y `20`); `requiere: ['def', 'parametro']`.
8. explica: `return`: la función **devuelve** un valor en vez de imprimirlo; `resultado = doble(4)` y `print(resultado + 1)`. Diferencia print/return.
9. predice: ¿qué pasa si olvidas `return`? `def doble(n): n * 2` + `print(doble(5))` → `None`.
10. predice: el código después de `return` no se ejecuta.
11. explica: parámetros con valor por defecto: `def saludar(nombre="amigo"):`.
12. Combinación: funciones + condiciones — reto: `def es_par(n):` que devuelva `True`/`False`; pruebas ocultas con 4, 7 y 0.
13. Combinación: funciones + bucles — predice: `for i in range(1, 4): print(doble(i))` con `doble` que devuelve → `2 4 6` en líneas.
14. Combinación: funciones + listas — reto: `def media(numeros):` que devuelva la media; pruebas ocultas con varias listas; `requiere: ['def', 'return']`.
15. predice: variables locales: `def f(): x = 5` + `f()` + `print(x)` → NameError. Explicar ámbito: lo de dentro se queda dentro.
16. predice: una lista pasada a una función y modificada con `append` sí cambia fuera.
17. arregla: llamar a una función antes de su `def` → NameError; moverla arriba.
18. Combinación: una función que llama a otra — explica: `def area(lado): return lado * lado` y `def describir(lado): print(f"Área: {area(lado)}")`. Ver la pila con dos niveles.
19. mundo (Pico): `def avanzar_n(pasos):` con un `for` dentro; llegar al cristal con `avanzar_n(3)`, `girar_derecha()`, `avanzar_n(4)`. `requiere: ['def', 'parametro']`.
20. resumen: chuleta de funciones.

## 7. Progreso

En `localStorage` (con try/catch, el curso funciona sin él): pasos completados por tema, último paso visitado y el código que el jugador
escribió en cada paso de reto/arregla/mundo. Reutilizar o ampliar `js/comun/progreso.js` sin romper las demos.

## 8. Pruebas (`node pruebas/ejecutar.js` debe seguir pasando entero)

Añadir:
- **Intérprete**: una batería de al menos 80 fragmentos con su salida esperada (todo lo de la sección 5.1: formato de float, división
  entera con negativos, f-strings, ámbitos, listas por referencia, `and/or` devolviendo operandos, cortes, métodos, valores por defecto, etc.)
  y al menos 15 errores con su tipo (`NameError`, `TypeError`, …) y número de línea.
- **Curso**: para cada paso:
  - explica / predice: el código se ejecuta sin error (salvo los pasos que enseñan un error, que deben dar el error esperado);
    en predice, la opción `correcta` coincide con la salida real.
  - reto / arregla / mundo: la `solucion` supera el paso; el `codigo` inicial **no** lo supera.
- **Exportación para CPython**: `node pruebas/exportar-fragmentos.js > pruebas/fragmentos.json` escribe un JSON con
  `[{ id, codigo, salida, error }]` de **todos** los fragmentos de la batería del intérprete y de todos los códigos del curso que no usen
  funciones de mundo (código de explica/predice, `solucion` de los retos, `solucion` + cada prueba oculta). `error` es el tipo de error o `null`.
  Yo compararé ese JSON con el Python real.

## 9. Hecho significa
- `index.html` muestra la tarjeta del curso; `curso.html` muestra los 6 temas; se puede hacer cualquier tema de principio a fin.
- Cada paso funciona según su tipo; Variables y Llamadas se actualizan en "Paso a paso".
- Las pruebas pasan (las antiguas y las nuevas). Las demos siguen funcionando igual.
- Sin errores en la consola del navegador.
