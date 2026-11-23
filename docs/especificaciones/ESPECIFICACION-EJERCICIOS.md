# Código Retro — Ejercicios, Sobre el creador, Apoya al creador y nuevo menú

Amplía el proyecto. Se mantienen todas las reglas técnicas de `ESPECIFICACION.md` (sección 1) y de los documentos del curso
(`ESPECIFICACION-CURSO.md` y `ESPECIFICACION-CURSO-2.md`). Lo que ya existe no se rompe: todas las pruebas actuales siguen pasando.

## 1. Menú principal nuevo (`index.html`)

Debajo del logo hay tres secciones con título:

- **Aprende**
  - "Curso de Python", la tarjeta actual del curso.
  - "Scripting con Bash", con el sello **Próximamente**. No es clicable: se ve apagada.
- **Practica**
  - "Taller de ejercicios": tarjeta nueva, enlaza a `ejercicios.html`. Muestra "18 / 55 resueltos".
  - "Terminal Linux": **Próximamente**.
  - Las 3 demos.
- **Pie**: enlaces "Sobre el creador" (`creador.html`) y "Apoya al creador" (`apoya.html`), con un icono de corazón de píxeles.

Las tarjetas "Próximamente" se generan desde una lista, para poder activarlas después cambiando un solo dato.

## 2. Taller de ejercicios (`ejercicios.html`)

El objetivo es que el jugador **escriba él solo** programas a partir de un enunciado ("Crea un bucle que…", "Diseña una función que…")
y que el juego le diga **si está bien o mal y por qué**.

### 2.1 Pantalla de lista
- Filtros: por tema (los 11 del curso más "Retos finales"), por dificultad (★ fácil, ★★ media, ★★★ difícil) y por estado
  (todos / sin hacer / resueltos).
- Cada ejercicio se ve como una ficha. La ficha tiene:
  - el tipo (Crea / Diseña / Completa / Ordena / Arregla);
  - el título;
  - la dificultad;
  - una marca ✔ si está resuelto.
- Arriba, un contador "18 / 55 resueltos" y una barra por dificultad.
- Botón "Ejercicio al azar (sin hacer)".

### 2.2 Pantalla de ejercicio
Es la misma disposición que un paso del curso. Se reutilizan todos los componentes que se pueda: editor, consola, Variables y Llamadas.

- **Izquierda**: enunciado claro, con un ejemplo de lo que se espera (entrada → salida), la dificultad y el tema.
- **Centro**: editor.
- **Derecha**: consola.
- Botones:
  - "▶ Ejecutar" prueba libremente.
  - **"✔ Comprobar"** valida el ejercicio.
  - "💡 Pista": las pistas salen de una en una.
  - "Ver solución": solo aparece tras 3 comprobaciones fallidas, y pide confirmación ("¿Seguro? Aprenderás más si lo intentas otra vez").
    Ver la solución marca el ejercicio como "resuelto con ayuda", con otro color.

### 2.3 Tipos de ejercicio
- **Crea**: "Crea un bucle que imprima del 10 al 1 y luego ¡Despegue!".
  - Se valida la salida, o los casos si hay `input` o `random`.
  - También se valida `requiere` y `prohibe`.
- **Diseña**: "Diseña una función `factorial(n)`…".
  - Se valida con **pruebas ocultas** que llaman a la función con varios valores, incluidos casos límite (0, listas vacías…).
  - También se valida `requiere` y `prohibe`.
- **Completa**: el código trae huecos `___` que hay que rellenar.
  - Si queda algún `___`, el aviso es "Todavía quedan huecos por rellenar".
- **Ordena**: las líneas de una solución aparecen desordenadas y sin sangría.
  - El jugador las ordena con ▲▼ y ajusta la sangría con ◀▶. También puede hacerlo con el teclado: flechas, y Mayús+flechas para la sangría.
  - Al comprobar, se monta el código y se valida como un "Crea".
  - No se usa el editor de texto en este tipo.
  - Puede haber 1 línea "trampa" que no se usa. En ese caso, al lado de cada línea hay un botón para "descartarla".
- **Arregla**: código con uno o varios fallos. Se valida como un "Crea".

### 2.4 El veredicto (lo más importante)
Al pulsar "✔ Comprobar" aparece un cuadro con:
- un titular: **"✔ ¡Correcto!"** (verde) o **"✘ Todavía no"** (rojo, sin dramatismo);
- una **lista de comprobaciones**, cada una con ✔ o ✘. Por ejemplo:
  - ✔ Usa un bucle `for`.
  - ✘ Con `factorial(5)` tu función devolvió `24`; se esperaba `120`.
  - ✔ No usa `max()`.
  - ✘ Falta la línea `¡Despegue!` al final.
- **Detección de fallos típicos**, con un consejo concreto:
  - La función imprime pero devuelve `None`: "Tu función imprime el resultado, pero no lo devuelve. Cambia `print(...)` por `return ...`."
  - Bucle infinito o demasiado largo: "Tu programa no termina. Revisa la condición del while."
  - Error de Python: se muestra el tipo, la línea y la explicación. Con eso basta.
  - La salida es correcta salvo por mayúsculas o espacios: "Casi: revisa mayúsculas y espacios. Se esperaba `¡Despegue!`."
  - La salida tiene líneas de más: "Tu programa imprime una línea de más: `…`".
  - Usa algo prohibido: "Este ejercicio pide hacerlo sin `max()`."
- Al acertar: una frase corta de ánimo, un sonido de victoria y, si existe, el botón "Siguiente ejercicio del mismo tema".
  También aparece una nota **"Otra forma de hacerlo"**, con una solución alternativa corta para comparar (campo `alternativa`, opcional).

### 2.5 Formato de datos (`js/ejercicios/<tema>.js`)
```js
{ id: 'bucles-3', tema: 'bucles', tipo: 'crea'|'disena'|'completa'|'ordena'|'arregla', dificultad: 1|2|3,
  titulo, enunciado: ['párrafo', ...], ejemplo: 'factorial(5) → 120' (opcional),
  codigo: 'código inicial' (en ordena: las líneas correctas en orden, que la pantalla desordena),
  trampa: 'línea que sobra' (solo ordena, opcional),
  salidaEsperada, pruebas: [{ codigo, salida }], casos: [{ entradas, aleatorios, salida }],
  requiere: [...], prohibe: ['max', 'sum', 'sorted', 'count', 'corte-inverso'] (nombres de funciones o métodos prohibidos;
  'corte-inverso' prohíbe `[::-1]`),
  pistas: [...], solucion, alternativa (opcional) }
```
`prohibe` se comprueba en el AST: se busca cualquier llamada a esa función o método.

### 2.6 Lista de ejercicios (55)
Hay que escribir los enunciados completos, las pruebas ocultas (incluidos los casos límite), las pistas y las soluciones.
Todo el código debe dar la misma salida que en CPython.

**Primeros pasos**
1. Crea ★: imprimir un marco de 3 líneas:
   ```
   +-------+
   | Hola! |
   +-------+
   ```
2. Completa ★: `print(___)` para que salga `12` usando una operación (cualquier operación válida que dé 12).
3. Ordena ★: las 4 líneas de un programa que imprime los pasos de una receta en orden.
4. Arregla ★: `print("Hola" mundo")`.

**Variables**
5. Crea ★★: intercambiar dos variables usando una variable auxiliar. Prohíbe la asignación múltiple; se comprueba en el AST.
6. Crea ★★: convertir `minutos = 135` en `2 h 15 min` con `//` y `%`. Tiene una prueba extra con otro valor: el ejercicio reemplaza la línea `minutos = …`
   (en los ejercicios "crea" con datos, los datos van en la primera línea y las pruebas la sustituyen; campo `datos: [{ linea: 'minutos = 61', salida: '1 h 1 min' }]`).
7. Completa ★: precio con IVA del 21 %.
8. Arregla ★: `"Total: " + 5`.
9. Crea ★: una f-string con nombre, edad y ciudad en una frase.

**Condiciones**
10. Diseña ★: `signo(n)` → `"positivo"`, `"negativo"` o `"cero"`.
11. Diseña ★★★: `es_bisiesto(año)`. Pruebas: 2024, 2023, 1900, 2000, 2100.
12. Crea ★★: con `edad` y `tiene_carnet` (bool), decir si puede conducir. Usa `and` y `datos` con varias combinaciones.
13. Ordena ★★: un `if`/`elif`/`else` de notas, con sangría.
14. Arregla ★: `=` en lugar de `==` dentro de un `if`.

**Bucles**
15. Crea ★: cuenta atrás de 10 a 1 y `¡Despegue!`. Requiere `for` o `while`.
16. Crea ★: la suma de 1 a 100. Prohíbe `sum`. Requiere un bucle.
17. Diseña ★★: `factorial(n)` con un bucle. Pruebas: 0, 1, 5, 10.
18. Crea ★★: FizzBuzz del 1 al 20.
19. Crea ★★: triángulo de asteriscos de 5 filas (`*`, `**`, …).
20. Crea ★★: con `while`, duplicar 1 hasta pasar de 1000 y decir cuántos pasos hicieron falta. Requiere `while`.

**Listas**
21. Diseña ★★: `maximo(lista)` sin `max`. Pruebas con negativos y con un solo elemento.
22. Crea ★: a partir de `numeros`, crear una lista nueva solo con los pares e imprimirla.
23. Diseña ★★: `invertir(lista)` sin `[::-1]`, `reverse` ni `reversed`.
24. Completa ★: `frutas.___("mango")`.
25. Arregla ★: `for i in range(len(lista) + 1)` → IndexError.

**Funciones**
26. Diseña ★: `area_rectangulo(base, altura)`.
27. Diseña ★: `celsius_a_fahrenheit(c)`. Pruebas con 0, 100, -40 y 36.6 (comprobar con `round(…, 1)` en la prueba).
28. Diseña ★★: `contar_mayores(lista, limite)`.
29. Diseña ★★: `saludo(nombre, formal=False)` → `"Hola, Ana"` / `"Buenos días, Ana"`.
30. Ordena ★★: una función con `return` y su llamada, con una línea trampa (`print` en vez de `return`).

**Textos**
31. Diseña ★★: `iniciales("Ada Lovelace King")` → `"A.L.K."`.
32. Diseña ★: `contar_letra(texto, letra)` sin `count`.
33. Diseña ★★: `censurar(frase, palabra)`: sustituye la palabra por asteriscos del mismo largo.
34. Diseña ★★★: `es_anagrama(a, b)`. Ignora mayúsculas y espacios. Puede usar `sorted`.
35. Crea ★: dar la vuelta a una frase palabra por palabra (`split` y `join`).

**Diccionarios**
36. Diseña ★: `buscar_telefono(agenda, nombre)` → número o `"Desconocido"`. Usa `get`.
37. Crea ★: sumar todo el stock de un inventario.
38. Diseña ★★: `invertir_dict(d)`: las claves pasan a ser valores y los valores, claves.
39. Diseña ★★★: `mas_frecuente(lista)`: el elemento que más se repite. Si hay empate, el que aparece primero.
40. Crea ★★: agrupar palabras por su primera letra en un diccionario de listas.

**Errores**
41. Diseña ★: `dividir_seguro(a, b)` → el resultado, o `None` si `b` es 0. Requiere `try`.
42. Diseña ★★: `leer_edad(texto)`: convierte a `int` y lanza `ValueError("Edad negativa")` si es menor que 0.
    Pruebas que capturan el error e imprimen `str(e)`.
43. Arregla ★★: un `except:` que esconde un `NameError`. Hay que poner el tipo correcto y arreglar el nombre.
44. Crea ★★: sumar solo los números válidos de una lista de textos, ignorando los que fallen.

**`input()` y módulos**
45. Crea ★★: calculadora. Pide dos números y una operación (`+ - * /`) y muestra el resultado.
    Dividir entre 0 muestra `No se puede dividir entre cero.` Tiene 5 casos.
46. Crea ★★★: piedra, papel o tijera contra `random.choice`. Casos con `aleatorios` y `entradas`.
47. Diseña ★: `hipotenusa(a, b)` con `math.sqrt`.
48. Crea ★★: pedir números hasta que escriban `fin` y mostrar la media. Casos.

**Retos finales** (mezclan varios temas)
49. Diseña ★★★: `validar_contraseña(c)`. Devuelve una lista de problemas (`"Mínimo 8 caracteres"`, `"Falta un número"`,
    `"Falta una mayúscula"`), o `[]` si es válida. Tiene muchas pruebas.
50. Diseña ★★★: `cifrar_cesar(texto, desplazamiento)`. Solo letras minúsculas de la a a la z; el resto se deja igual.
    Añadir **`ord` y `chr`** al intérprete.
51. Diseña ★★★: `descifrar_cesar` usando la función anterior.
52. Diseña ★★★: `resumen_notas(notas)` → `{'media': …, 'max': …, 'min': …}`, con la media redondeada a 2 decimales.
53. Crea ★★★: un contador de palabras que imprime las 3 más frecuentes. Usa `sorted` con `key` (ver nota).
54. Diseña ★★: `es_primo(n)`. Pruebas: 0, 1, 2, 9, 13, 97.
55. Crea ★★★: un menú de tienda con `while` e `input`. Opciones `1` ver, `2` añadir y `3` salir. Casos.

Nota: los nombres pueden llevar tildes y ñ (`año`, `validar_contraseña`), como en Python real.
El analizador léxico debe aceptar letras Unicode en los identificadores.

Nota: para el 53, añadir a `sorted` y a `list.sort` el parámetro `key=` con una función (también `lambda x: …` sencilla)
y `reverse=True`. Si `lambda` complica demasiado, el enunciado puede pedir una función con `def` para el `key`.

## 3. Sobre el creador (`creador.html`)

- Una página retro con:
  - un avatar de píxeles original (genérico, una persona con sudadera y portátil);
  - nombre;
  - un párrafo "Quién soy";
  - un párrafo "Por qué hice Código Retro";
  - enlaces.
- Los textos y enlaces se leen de `js/datos-creador.js`, para que el creador los cambie sin tocar el diseño:
  ```js
  { nombre: 'Bryan Valenzuela', rol: 'Ciberseguridad · SOC y pentesting',
    quienSoy: 'BORRADOR: …', porQue: 'BORRADOR: …',
    enlaces: [{ texto: 'GitHub', url: 'https://github.com/BV-cs0' }, { texto: 'LinkedIn', url: '' }] }
  ```
  - Escribe borradores cortos y neutros, marcados con "BORRADOR:" al principio, para que el creador los revise.
  - Los enlaces con `url` vacía no se muestran.
  - Los enlaces externos se abren con `target="_blank" rel="noopener noreferrer"`.

## 4. Apoya al creador (`apoya.html`)

- Una frase sencilla: el juego es gratis y sin anuncios; si te ayuda, puedes apoyarlo.
- Tarjetas leídas de `js/datos-apoyo.js`:
  ```js
  { formas: [
    { nombre: 'Ko-fi', url: '' }, { nombre: 'GitHub Sponsors', url: '' }, { nombre: 'PayPal', url: '' } ],
    gratis: [
      { texto: 'Dale una estrella en GitHub', url: '' },
      { texto: 'Comparte el juego con alguien que quiera aprender', url: '' },
      { texto: 'Cuéntame ideas o fallos', url: '' } ] }
  ```
  - Las tarjetas con `url` vacía se ven con el sello "Próximamente" y no son clicables.
  - En "Comparte", si el navegador tiene `navigator.share`, ofrecerlo. Si no, el botón "Copiar enlace" copia la dirección de la página.
- Sin rastreadores, sin scripts externos y sin formularios.

## 5. Pruebas
- Ejercicios: para cada uno de los 55, comprobar que:
  - la `solucion` da "Correcto";
  - el `codigo` inicial da "Todavía no";
  - la `alternativa`, si existe, también da "Correcto".
- Veredicto: probar cada fallo típico de la sección 2.4 con un programa preparado.
- Ordena: con el orden correcto se supera; con un orden incorrecto, no.
- Exportación para CPython: añadir las soluciones, las alternativas y las pruebas de los ejercicios a `pruebas/exportar-fragmentos.js`.
- Menú: las tarjetas "Próximamente" no son enlaces. `creador.html` y `apoya.html` cargan sin errores con los datos vacíos.

## 6. Hecho significa
- El menú tiene las secciones nuevas.
- Los 55 ejercicios se pueden resolver y el veredicto explica bien qué falla.
- Las páginas Creador y Apoya funcionan.
- Todas las pruebas pasan.
- No hay errores en la consola.
