# Código Retro — Curso de Python, parte 2: cinco temas nuevos

Amplía `ESPECIFICACION-CURSO.md`. Se mantienen **todas** sus reglas, sus tipos de paso, su formato y sus pruebas.
También se mantienen las reglas técnicas de la sección 1 de `ESPECIFICACION.md`.
Los 6 temas actuales y las 3 demos no cambian de contenido. Las 302 pruebas actuales deben seguir pasando.

Temas nuevos (después de Funciones):

| Nº | Tema | Pasos |
|---|---|---|
| 7 | Textos | 10 |
| 8 | Diccionarios | 9 |
| 9 | Errores (`try` / `except`) | 9 |
| 10 | `input()` y módulos | 9 |
| 11 | Proyecto final: Adivina el número | 10 |

Total del curso: 67 + 47 = **114 pasos**. Actualizar los contadores del menú y del índice, que ahora tiene 11 cartuchos.
El cartucho 11 se distingue visualmente: es un "cartucho dorado" con el texto "Proyecto final".

---

## 1. Ampliaciones del intérprete (`js/curso/py/`)

Todo debe comportarse como CPython 3.12 o superior. Lo compararé con CPython.

### 1.1 Textos
- Cortes con paso: `t[::-1]`, `t[::2]`, `t[1:5:2]`, también en listas.
- Métodos nuevos: `endswith`, `count`, `find`, `isdigit`, `isalpha`, `title`, `capitalize`, `center` no hace falta.
- `for letra in texto` ya funciona; mantenerlo.

### 1.2 Diccionarios y tuplas
- Literales `{}` y `{"a": 1, "b": 2}`, con claves de texto, número o bool.
- Leer y escribir `d[k]`; `d[k] = v`; `del d[k]`; `k in d`; `len(d)`.
  Se recorren en orden de inserción, y `for k in d` recorre las claves.
- Métodos: `keys()`, `values()`, `items()`, `get(k)`, `get(k, defecto)`, `pop(k)`, `pop(k, defecto)`.
  `list(d.keys())` debe funcionar. Al imprimir directamente `d.keys()`, se muestra `dict_keys(['a', 'b'])`, como en Python.
- `repr` como Python: `{'nombre': 'Ana', 'edad': 30}` y `{}`.
- **Tuplas**:
  - literal `(1, 2)` y `(1,)`;
  - las devuelve `items()`;
  - `repr` `(1, 2)`.
- Desempaquetado en `for clave, valor in d.items():` y en la asignación `a, b = b, a`.
  Si no coincide el número de elementos, da `ValueError`.
- El panel **Variables** muestra diccionarios y tuplas con su `repr`, recortado a 60 caracteres con `…`.

### 1.3 Excepciones
- `try:` con uno o varios `except`:
  - `except ValueError:`
  - `except (ValueError, ZeroDivisionError):`
  - `except ValueError as e:`
  - `except Exception:`
  - `except:`
- Admite también `else:` y `finally:`.
- `raise ValueError("mensaje")` y `raise` solo dentro de un `except`.
- Clases de error disponibles como nombres:
  - `Exception`, `ValueError`, `TypeError`, `ZeroDivisionError`;
  - `KeyError`, `IndexError`, `NameError`, `RuntimeError`.
- `Exception` captura todas las demás.
- **`str(e)` y `print(e)` deben dar el mismo texto en inglés que CPython** en estos casos, porque así los verá el jugador en Python real:

| Código | Mensaje |
|---|---|
| `int("hola")` | `invalid literal for int() with base 10: 'hola'` |
| `float("x")` | `could not convert string to float: 'x'` |
| `1 / 0` | `division by zero` |
| `1 // 0` | `division by zero` (CPython 3.14) |
| `1 % 0` | `division by zero` (CPython 3.14) |
| `[1][5]` | `list index out of range` |
| `"ab"[9]` | `string index out of range` |
| `{"a": 1}["b"]` | `str(e)` es `'b'`, con comillas |
| `"a" + 1` | `can only concatenate str (not "int") to str` |
| `1 + "a"` | `unsupported operand type(s) for +: 'int' and 'str'` |
| `raise ValueError("x")` | `x` |

- Si un error no se captura, la consola del curso lo sigue mostrando como ahora: el tipo y la línea, más la explicación en español.
  Debajo se añade una línea gris con el mensaje original de Python, por ejemplo `ValueError: invalid literal for int() with base 10: 'hola'`.
  Así el jugador aprende a leer los errores reales.

### 1.4 `input()`
- `input()` e `input("texto")`:
  1. escribe el texto en la consola sin salto de línea;
  2. espera a que el jugador escriba;
  3. devuelve siempre un `str`.
- **En la pantalla**: cuando el programa llega a `input()`, la ejecución se pausa. El generador devuelve un estado `esperandoEntrada`.
  Al final de la consola aparece un campo de texto con el cursor parpadeante. Al pulsar Enter:
  - lo escrito queda en la consola, en otro color (como el eco de un terminal);
  - la ejecución continúa.
- "■ Parar" cancela la espera.
- **En las comprobaciones automáticas** (pruebas y casos de reto), las entradas salen de una lista `entradas`.
  Si se acaba la lista, el error es `EOFError` con el mensaje "El programa pidió más datos de los previstos".
- La salida que se compara es **solo lo que escribe el programa**: el texto del `input()` sí cuenta, el eco de lo que se escribe no.
  Es igual que la salida estándar de CPython.

### 1.5 Módulos
- `import math`, `import random`, `from math import sqrt, pi`, `from random import randint, choice`.
  - Opcional: `import random as r`.
- Cualquier otro módulo da `ModuleNotFoundError` con este texto:
  "Este curso solo incluye `math` y `random`. En Python real hay muchos más."
- `math`: `sqrt` (siempre devuelve float), `pi`, `floor`, `ceil`, `pow` (float), `fabs`.
- `random`: `randint(a, b)` (ambos incluidos), `choice(secuencia)`, `random()`, `shuffle(lista)`.
- **Aleatorios fijos para las comprobaciones**:
  - Un paso o un caso puede tener `aleatorios: [7, 3]`.
  - Mientras dura esa comprobación, cada llamada a `randint`, `choice` o `random` devuelve el siguiente valor de la lista, en orden.
  - En `choice`, el valor dado debe estar en la secuencia.
  - En `shuffle`, el valor dado es la lista ya barajada.
- En el juego normal, el azar es real (`Math.random`).

### 1.6 `requiere` nuevo
`'try'`, `'except'`, `'dict'`, `'input'`, `'import'`, `'while'` (ya existía), `'tupla'`, `'corte'`.

## 2. Casos múltiples en los retos

Un reto con `input()` o `random` se comprueba con varios casos:

```js
casos: [
  { entradas: ['20'], salida: '¿Cuántos años tienes? Eres mayor de edad.\n' },
  { entradas: ['15'], salida: '¿Cuántos años tienes? Todavía eres menor.\n' },
  { entradas: ['7', '3'], aleatorios: [3], salida: '...' }
]
```

En los pasos con `casos`, además de "▶ Ejecutar" (que es interactivo y no valida) aparece el botón **"✔ Comprobar"**.
Ese botón ejecuta todos los casos en silencio y muestra una tabla. Cada fila tiene:
- ✓ o ✗;
- las entradas;
- un resumen de lo esperado y de lo obtenido. Solo la primera línea distinta, resaltada.

El paso se supera cuando pasan todos los casos y se cumple `requiere`.

Los pasos de reto sin `input` ni `random` siguen funcionando como ahora.

## 3. Proyecto por partes: `codigo: 'anterior'`

En el tema 11, cada paso empieza con el código que el jugador escribió en el paso anterior si lo superó.
Si no lo superó, empieza con la `solucion` del paso anterior.
Esto se indica con `codigo: 'anterior'`. El botón "↺ Restaurar código" vuelve a ese mismo punto de partida.

## 4. Guion de los temas nuevos

Las mismas normas que en el curso actual:
- una idea por paso;
- textos cortos y claros para mayores de 15 años;
- invitar a tocar el código;
- en las predicciones, explicar también los fallos con amabilidad.

### Tema 7 — Textos
*Necesitas: Variables, bucles.*

1. **explica**: un texto es una secuencia de caracteres: `len("Python")`, `texto[0]`, `texto[-1]`.
2. **explica**: cortes: `texto[0:3]`, `texto[2:]`, `texto[:4]`. El final no se incluye, igual que en `range`.
3. **predice**: `print("Python"[1:4])` → `yth`.
4. **explica**: `upper`, `lower`, `strip`, `replace`. Los textos no cambian: el método devuelve un texto nuevo.
5. **predice**: `nombre = "ana"`, `nombre.upper()`, `print(nombre)` → `ana`. Arreglarlo con `nombre = nombre.upper()`.
6. **explica**: `split` y `join`: `"rojo,verde,azul".split(",")` y `" - ".join(colores)`.
7. Combinación textos + bucles — **reto**: contar las vocales de una frase con `for letra in frase` y `in "aeiou"`.
8. Combinación textos + condiciones — **reto**: `def email_valido(email):`. Devuelve `True` si contiene `@` y termina en `.com` o `.es`.
   Tiene pruebas ocultas.
9. **reto**: dar la vuelta a un texto con `[::-1]` y decir si es un palíndromo, como "reconocer".
   La función es `def es_palindromo(palabra):` y tiene pruebas ocultas. `requiere: ['corte']`.
10. **resumen**.

### Tema 8 — Diccionarios
*Necesitas: Listas, bucles.*

1. **explica**: un diccionario guarda pares clave → valor: `persona = {"nombre": "Ana", "edad": 30}` y `persona["nombre"]`.
   Compararlo con una lista: aquí se busca por nombre, no por posición.
2. **explica**: añadir y cambiar: `persona["ciudad"] = "Lima"` y `persona["edad"] = 31`. Mirar el panel Variables con «Paso a paso».
3. **arregla**: `print(persona["altura"])` → `KeyError`. Arreglarlo con `in` o con `.get("altura", "sin dato")`.
4. **explica**: recorrer un diccionario: `for clave in persona:` y `for clave, valor in persona.items():`.
5. **predice**: el orden al recorrer es el de inserción, y `len()` cuenta los pares.
6. Combinación diccionarios + listas — **explica**: una lista de diccionarios (`alumnos`, cada uno con nombre y nota).
   Recorrerla imprimiendo `f"{a['nombre']}: {a['nota']}"`.
7. Combinación diccionarios + bucles — **reto**: contar cuántas veces aparece cada palabra de una frase.
   El resultado es un diccionario. Se imprime `{'el': 2, 'gato': 1, ...}`. `requiere: ['dict', 'for']`.
8. Combinación diccionarios + funciones — **reto**: `def total_carrito(carrito, precios):`.
   `carrito` es una lista de productos y `precios` un diccionario. Devuelve la suma. Tiene pruebas ocultas.
9. **resumen**.

### Tema 9 — Errores (`try` / `except`)
*Necesitas: Funciones, textos.*

1. **explica**: un error no capturado detiene el programa. Leer el mensaje: el tipo, la línea y la descripción en inglés de Python real.
   Ejemplo: `int("hola")`.
2. **explica**: `try` / `except ValueError:`. El programa sigue después del `except`.
3. **predice**: dentro del `try`, lo que va después de la línea que falla no se ejecuta. Lo que va después del bloque `try`/`except` sí.
4. **explica**: varios `except` (`ValueError` y `ZeroDivisionError`) y `except ... as e: print(e)` → `division by zero`.
5. **explica**: `else` (se ejecuta si no hubo error) y `finally` (se ejecuta siempre).
6. **explica**: `raise ValueError("La edad no puede ser negativa")` dentro de una función, y capturarlo fuera.
7. **predice**: un `except:` sin tipo esconde un error de escritura. El código usa `nmero` en vez de `numero` y el `except` imprime "Número no válido".
   Lección: captura solo el error que esperas.
8. Combinación errores + funciones + bucles — **reto**: `def a_numero(texto):`. Devuelve el `int` o `None` si no se puede convertir.
   Después se suman solo los válidos de `["4", "x", "10", "3.5"]`. `requiere: ['try', 'def']`.
9. **resumen**.

### Tema 10 — `input()` y módulos
*Necesitas: Condiciones, bucles, errores.*

1. **explica**: `nombre = input("¿Cómo te llamas? ")` y `print(f"Hola, {nombre}")`. El programa espera a que escribas.
2. **predice**: `edad = input("Edad: ")` y `print(edad + 1)`, con la entrada `30` → `TypeError`. `input` siempre devuelve texto.
   En los pasos de predicción con `input`, se usa `entradas` y la salida se muestra con el eco.
3. **explica**: convertir con `int(input(...))`. Mostrar qué pasa si escribes letras (ValueError) y recordar el tema 9.
4. **explica**: `import math`: `math.sqrt(16)` → `4.0`, `math.pi`, `math.floor(2.7)`, `math.ceil(2.1)`.
5. **explica**: `import random`: `random.randint(1, 6)` y `random.choice(["piedra", "papel", "tijera"])`. Ejecutarlo varias veces: cambia.
6. **explica**: `from random import randint`. Explicar la diferencia con `import random`.
7. Combinación `input` + condiciones — **reto**: pedir la edad y responder "Eres mayor de edad." o "Todavía eres menor.".
   Tiene 3 casos: 20, 15 y 18.
8. Combinación random + bucles — **reto**: tirar un dado 5 veces con `randint(1, 6)`, imprimir cada tirada y el total.
   Tiene 2 casos con `aleatorios`.
9. **resumen**.

### Tema 11 — Proyecto final: Adivina el número
*Necesitas: todo lo anterior.*

Cada paso parte del código del paso anterior (`codigo: 'anterior'`).

Los mensajes del juego son siempre estos, para poder comprobarlos:
- `Adivina el número (1-100): `
- `Más alto.`
- `Más bajo.`
- `¡Acertaste!` (pasos 3 y 4, antes de contar los intentos)
- `¡Acertaste en 1 intento!` / `¡Acertaste en {n} intentos!` (desde el paso 5)
- `Eso no es un número.`
- `Sin intentos. Era el {secreto}.`

1. **explica**: el plan del juego, partido en piezas pequeñas. Cada paso añade una pieza. Lista de las piezas.
2. **reto**: `secreto = 42`; pedir un número con `input` y convertirlo con `int`. Casos con entradas.
3. **reto**: comparar y decir `Más alto.`, `Más bajo.` o `¡Acertaste!`. Por ahora solo hay un intento.
4. **reto**: repetir con `while` hasta acertar. El caso tiene las entradas `50, 25, 42`. `requiere: ['while']`.
5. **reto**: contar los intentos y mostrarlos al acertar con una f-string. Usar la forma singular si es 1:
   `¡Acertaste en 1 intento!` / `¡Acertaste en 3 intentos!`.
6. **reto**: `secreto = random.randint(1, 100)`. Casos con `aleatorios`. `requiere: ['import']`.
7. **reto**: proteger el `int()` con `try`/`except ValueError`.
   Si escriben letras, imprimir `Eso no es un número.`, sin contar el intento y volviendo a preguntar. `requiere: ['try']`.
8. **reto**: ordenar en funciones: `def pedir_numero():` (pide hasta recibir un número válido y lo devuelve) y `def jugar():`.
   El programa principal solo llama a `jugar()`. `requiere: ['def', 'return']`.
9. **reto**: límite de 7 intentos.
   - Si se acaban: `Sin intentos. Era el {secreto}.`
   - Casos: uno que gana al tercer intento y otro que agota los 7.
10. **resumen**:
    - el juego completo con comentarios;
    - "Has usado: variables, condiciones, bucles, funciones, errores, input y random";
    - 3 ideas para seguir mejorándolo, sin código: jugar otra vez, elegir la dificultad y guardar el mejor récord;
    - pantalla de **final del curso** con Cursor celebrando (animación de 4 fotogramas) y el total de pasos completados.

## 5. Pruebas

Añadir a `node pruebas/ejecutar.js`:

- **Intérprete**, unos 80 fragmentos nuevos:
  - todo lo de la sección 1;
  - los mensajes en inglés de `str(e)`;
  - `repr` de diccionarios y tuplas;
  - `dict_keys`;
  - desempaquetado;
  - `else` y `finally`;
  - `raise`;
  - `input` con entradas y `EOFError`;
  - `math`;
  - `random` con aleatorios fijos.
- **Curso**: las mismas comprobaciones de antes para los 47 pasos nuevos. En los retos con `casos`:
  - la `solucion` pasa todos los casos;
  - el código inicial no los pasa.

  En el tema 11, el código inicial de cada paso es la `solucion` del anterior.
- **Exportación para CPython**: `pruebas/exportar-fragmentos.js` añade a cada fragmento `entradas` (lista o `[]`) y `aleatorios` (lista o `[]`).
  - Los fragmentos con `input` se exportan con sus entradas.
  - Los que usan azar sin `aleatorios` fijos no se exportan.
  - `salida` es solo la salida estándar, sin eco.

  Yo pasaré las entradas por stdin. Para los aleatorios, sustituiré `random.randint`/`choice`/`random`/`shuffle` por funciones que devuelvan esos valores en orden.

## 6. Hecho significa
- El índice muestra 11 temas (el 11 como cartucho dorado).
- Los 5 temas nuevos se pueden hacer de principio a fin.
- `input()` funciona en la consola del navegador.
- "✔ Comprobar" muestra la tabla de casos.
- Al acabar el tema 11 sale la pantalla de final del curso.
- Pasan todas las pruebas, las antiguas y las nuevas.
- El README explica el curso y cómo ejecutar las pruebas.
- No hay errores en la consola del navegador.
