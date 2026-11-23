(function () {
  'use strict';
  const tema = {
    nombre: "Funciones",
    frase: "Da nombre a una tarea y reutilízala.",
    necesita: "Variables, condiciones, bucles y listas.",
    pasos: [
      {
        tipo: "explica",
        titulo: "Funciones que ya conoces",
        texto: [
          "Una función es un bloque de código con nombre. Se ejecuta cuando la llamas. Ya has usado `print()` y `len()`.",
          "Quita un elemento de `datos` y vuelve a ejecutar."
        ],
        codigo: `datos = [5, 8, 13]
print(len(datos))`
      },
      {
        tipo: "explica",
        titulo: "Definir y llamar",
        texto: [
          "`def` define una función. Las instrucciones con sangría forman su cuerpo. Definirla la deja lista; cada llamada ejecuta su cuerpo.",
          "Añade una tercera llamada."
        ],
        codigo: `def saludar():
    print("¡Hola!")
saludar()
saludar()`
      },
      {
        tipo: "predice",
        titulo: "Una definición sin llamada",
        texto: [
          "Busca dónde se usa el nombre de la función."
        ],
        codigo: `def saludar():
    print("¡Hola!")
`,
        pregunta: "¿Qué ocurre al ejecutar el código?",
        opciones: ["¡Hola!","Nada","Un error"],
        correcta: 1,
        explicacion: "El programa guarda la definición y termina. `saludar()` ejecutaría el bloque si lo añadieras al final."
      },
      {
        tipo: "explica",
        titulo: "Dar un argumento",
        texto: [
          "`nombre` es un parámetro. En cada llamada recibe el argumento correspondiente. Usa «Paso a paso» y mira el panel Llamadas.",
          "Prueba un tercer nombre."
        ],
        recuerda: "El parámetro se declara en def. El argumento se da al llamar.",
        codigo: `def saludar(nombre):
    print(f"Hola, {nombre}")
saludar("Ana")
saludar("Leo")`
      },
      {
        tipo: "explica",
        titulo: "Varios parámetros",
        texto: [
          "Los argumentos posicionales se asignan en orden: primero `nombre`, después `edad`.",
          "Intercambia los argumentos para ver cómo se asignan."
        ],
        codigo: `def presentar(nombre, edad):
    print(f'{nombre} tiene {edad} años')
presentar('Ana', 30)`
      },
      {
        tipo: "arregla",
        titulo: "Falta un argumento",
        texto: [
          "Ejecuta para leer el error. Corrige la llamada para mostrar `Ana tiene 30 años`."
        ],
        codigo: `def presentar(nombre, edad):
    print(f'{nombre} tiene {edad} años')
presentar('Ana')`,
        objetivo: "Llama a presentar() con los dos datos.",
        salidaEsperada: "Ana tiene 30 años",
        requiere: ["def","parametro"],
        pistas: ["Revisa los parámetros de presentar().","Pasa 30 como segundo argumento, tras la coma."],
        error: "TypeError",
        solucion: `def presentar(nombre, edad):
    print(f'{nombre} tiene {edad} años')
presentar('Ana', 30)`
      },
      {
        tipo: "reto",
        titulo: "Imprimir el doble",
        texto: [
          "Define `doble(n)` para imprimir el doble de su argumento. Llama a la función con 3 y 10, en ese orden."
        ],
        codigo: `def doble(n):
    pass

doble(3)
doble(10)`,
        objetivo: "Imprime el doble de 3 y de 10 con una función.",
        salidaEsperada: "6\n20",
        requiere: ["def","parametro"],
        pistas: ["n recibe un valor distinto en cada llamada.","Dentro de la función, imprime n * 2."],
        pruebas: [
          {"codigo":"doble(7)","salida":"14"}
        ],
        solucion: `def doble(n):
    print(n * 2)

doble(3)
doble(10)`
      },
      {
        tipo: "explica",
        titulo: "Devolver un resultado",
        texto: [
          "`return` entrega un valor al código que hizo la llamada. Puedes guardarlo o usarlo en un cálculo. `print()` muestra un valor en la consola.",
          "Cambia el argumento de `doble()`."
        ],
        recuerda: "Usa `return` para dar un valor a quien llama.",
        codigo: `def doble(n):
    return n * 2
resultado = doble(4)
print(resultado + 1)`
      },
      {
        tipo: "predice",
        titulo: "Un retorno implícito",
        texto: [
          "La función calcula el doble, pero fíjate en cómo termina."
        ],
        codigo: `def doble(n):
    n * 2
print(doble(5))`,
        pregunta: "¿Qué ocurre al ejecutar el código?",
        opciones: ["10","Nada","None"],
        correcta: 2,
        explicacion: "Al llegar al final sin `return`, la función devuelve `None`."
      },
      {
        tipo: "predice",
        titulo: "Después de return",
        texto: [
          "`return` se ejecuta al llegar a su línea."
        ],
        codigo: `def dato():
    return 4
    print('Dentro')
print(dato())`,
        pregunta: "¿Qué ocurre al ejecutar el código?",
        opciones: ["4","Dentro\n4","Un error"],
        correcta: 0,
        explicacion: "`return` termina la llamada de inmediato. Solo se imprime el 4 de la última línea."
      },
      {
        tipo: "explica",
        titulo: "Valor por defecto",
        texto: [
          "Si omites el argumento, `nombre` toma el valor por defecto. Si lo das, se usa el valor de esa llamada.",
          "Cambia el valor por defecto y vuelve a ejecutar."
        ],
        codigo: `def saludar(nombre="amigo"):
    print(f'Hola, {nombre}')
saludar()
saludar('Leo')`
      },
      {
        tipo: "reto",
        titulo: "Comprobar si es par",
        texto: [
          "Escribe `es_par(n)` para devolver `True` si el resto entre 2 es cero y `False` en los demás casos."
        ],
        etiqueta: "Combinación: funciones + condiciones",
        codigo: `def es_par(n):
    pass`,
        objetivo: "Devuelve si un número es par.",
        requiere: ["def","return"],
        pistas: ["Un número par deja resto 0 cuando se divide entre 2.","Puedes devolver directamente el resultado lógico de la comparación."],
        pruebas: [
          {"codigo":"print(es_par(4))","salida":"True"},
          {"codigo":"print(es_par(7))","salida":"False"},
          {"codigo":"print(es_par(0))","salida":"True"}
        ],
        solucion: `def es_par(n):
    if n % 2 == 0:
        return True
    return False`
      },
      {
        tipo: "predice",
        titulo: "Una llamada por vuelta",
        texto: [
          "El bucle pasa un valor distinto a `doble()` en cada vuelta."
        ],
        etiqueta: "Combinación: funciones + bucles",
        codigo: `def doble(n):
    return n * 2
for i in range(1, 4):
    print(doble(i))`,
        pregunta: "¿Qué ocurre al ejecutar el código?",
        opciones: ["2\n4\n6","2\n4\n6\n8","1\n2\n3"],
        correcta: 0,
        explicacion: "`i` toma los valores 1, 2 y 3. Cada llamada devuelve el doble de ese valor."
      },
      {
        tipo: "reto",
        titulo: "Calcular la media",
        texto: [
          "Define `media(numeros)` para devolver la media de una lista no vacía. Divide la suma entre la cantidad de elementos."
        ],
        etiqueta: "Combinación: funciones + listas",
        codigo: `def media(numeros):
    pass`,
        objetivo: "Devuelve la media de una lista.",
        requiere: ["def","return"],
        pistas: ["sum() da la suma y len() la cantidad de elementos.","Devuelve con return el cociente entre ambos valores."],
        pruebas: [
          {"codigo":"print(media([2, 4, 6]))","salida":"4.0"},
          {"codigo":"print(media([1, 2]))","salida":"1.5"},
          {"codigo":"print(media([9]))","salida":"9.0"}
        ],
        solucion: `def media(numeros):
    return sum(numeros) / len(numeros)`
      },
      {
        tipo: "predice",
        titulo: "La vida de una variable local",
        texto: [
          "`x` se asigna dentro de `f()` y se lee fuera."
        ],
        codigo: `def f():
    x = 5
f()
print(x)`,
        pregunta: "¿Qué ocurre al ejecutar el código?",
        opciones: ["5","None","NameError"],
        correcta: 2,
        explicacion: "La asignación crea una variable local de `f()`. El programa principal no tiene un nombre `x`.",
        error: "NameError"
      },
      {
        tipo: "predice",
        titulo: "Modificar una lista compartida",
        texto: [
          "La función recibe la misma lista que guarda `datos`."
        ],
        codigo: `def añadir(lista):
    lista.append(3)
datos = [1, 2]
añadir(datos)
print(datos)`,
        pregunta: "¿Qué ocurre al ejecutar el código?",
        opciones: ["[1, 2]","[1, 2, 3]","None"],
        correcta: 1,
        explicacion: "`append()` modifica la lista existente. El parámetro y `datos` apuntan a esa misma lista."
      },
      {
        tipo: "arregla",
        titulo: "Llamar antes de definir",
        texto: [
          "Ejecuta para ver el error. Reordena el código para que imprima `¡Hola!`."
        ],
        codigo: `saludar()
def saludar():
    print("¡Hola!")
`,
        objetivo: "Define la función antes de llamarla.",
        salidaEsperada: "¡Hola!",
        requiere: ["def"],
        pistas: ["Python ejecuta de arriba abajo.","Mueve la llamada saludar() después del bloque def."],
        error: "NameError",
        solucion: `def saludar():
    print("¡Hola!")
saludar()`
      },
      {
        tipo: "explica",
        titulo: "Una función llama a otra",
        texto: [
          "`describir()` llama a `area()` para completar el mensaje. En «Paso a paso», mira cómo se apilan las llamadas.",
          "Cambia la longitud del lado."
        ],
        etiqueta: "Combinación: una función que llama a otra",
        codigo: `def area(lado):
    return lado * lado
def describir(lado):
    print(f"Área: {area(lado)}")
describir(5)`
      },
      {
        tipo: "mundo",
        titulo: "Dos tramos hasta el cristal",
        texto: [
          "Define `avanzar_n(pasos)` con un `for`. Llama con 3, ejecuta `girar_derecha()` y vuelve a llamar con 4."
        ],
        codigo: `def avanzar_n(pasos):
    pass

avanzar_n(3)
girar_derecha()
avanzar_n(4)`,
        objetivo: "Llega al cristal con una función que reciba la distancia.",
        requiere: ["def","parametro"],
        pistas: ["Usa el parámetro como límite de range().","Pon avanzar() dentro del for. El giro va entre las llamadas."],
        mundo: {"demo":"robot","mapa":{"trazo":"EEESSSS","inicio":[1,1]}},
        solucion: `def avanzar_n(pasos):
    for i in range(pasos):
        avanzar()

avanzar_n(3)
girar_derecha()
avanzar_n(4)`
      },
      {
        tipo: "resumen",
        titulo: "Chuleta de funciones",
        texto: [
          "Define una tarea, pásale datos mediante parámetros y usa `return` cuando necesites recuperar un resultado."
        ],
        codigo: "",
        chuleta: [
          ["def doble(n):","Define una función con un parámetro."],
          ["    return n * 2","Devuelve un valor y termina la llamada."],
          ["resultado = doble(4)","Llama y guarda el resultado."],
          ["def saludar(nombre='amigo'):","Define un valor por defecto."],
          ["print(doble(7))","Usa el resultado de una función como argumento."],
          ["lista.append(5)","Modifica la lista original, también dentro de una función."]
        ]
      }
    ]
  };
  if (typeof module !== 'undefined') module.exports = tema;
  else (window.CR.Temas ||= []).push(tema);
})();
