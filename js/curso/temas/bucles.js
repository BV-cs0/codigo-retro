(function () {
  'use strict';
  const tema = {
    nombre: "Bucles",
    frase: "Repite instrucciones y acumula resultados.",
    necesita: "Variables y condiciones.",
    pasos: [
      {
        tipo: "explica",
        titulo: "Repetir con for",
        texto: [
          "`range(5)` da cinco valores, desde 0 hasta 4. `for` guarda el valor de cada vuelta en `i`.",
          "Cambia el 5 por 3."
        ],
        codigo: `for i in range(5):
    print(i)`
      },
      {
        tipo: "explica",
        titulo: "Inicio, límite y salto",
        texto: [
          "`range(1, 6)` empieza en 1 y se detiene antes de 6. El tercer argumento indica el salto.",
          "Cambia el salto de 2 a 3."
        ],
        codigo: `for i in range(1, 6):
    print(i)
print('Saltos')
for i in range(0, 10, 2):
    print(i)`
      },
      {
        tipo: "predice",
        titulo: "Contar vueltas",
        texto: [
          "El límite superior de `range()` queda fuera."
        ],
        codigo: `for i in range(2, 5):
    print('Vuelta')`,
        pregunta: "¿Qué ocurre al ejecutar el código?",
        opciones: ["Vuelta\nVuelta","Vuelta\nVuelta\nVuelta","Vuelta\nVuelta\nVuelta\nVuelta"],
        correcta: 1,
        explicacion: "El bucle recibe 2, 3 y 4. Imprime «Vuelta» una vez por valor."
      },
      {
        tipo: "explica",
        titulo: "Sumar en cada vuelta",
        texto: [
          "Empieza con `total = 0` y suma cada valor a `total`. Mira el acumulador en Variables con «Paso a paso».",
          "Cambia el límite para sumar del 1 al 5."
        ],
        codigo: `total = 0
for i in range(1, 11):
    total += i
print(total)`
      },
      {
        tipo: "explica",
        titulo: "Mientras se cumpla",
        texto: [
          "`while` comprueba su condición en cada vuelta. Aumenta el contador para que llegue al límite.",
          "Prueba con un contador que empiece en 2."
        ],
        recuerda: "Si la condición depende de un contador, actualízalo dentro del bucle.",
        codigo: `contador = 0
while contador < 3:
    print(contador)
    contador += 1`
      },
      {
        tipo: "predice",
        titulo: "Un bucle que no termina",
        texto: [
          "El cuerpo contiene `pass`, una instrucción que deja el estado tal como está."
        ],
        codigo: `contador = 0
while contador < 3:
    pass`,
        pregunta: "¿Qué ocurre al ejecutar el código?",
        opciones: ["La consola imprime 3","Termina tras tres vueltas","El curso detiene el bucle"],
        correcta: 2,
        explicacion: "El contador nunca cambia. Al superar el límite de instrucciones, el curso detiene la ejecución. Añade `contador += 1` dentro del bloque.",
        error: "RuntimeError"
      },
      {
        tipo: "explica",
        titulo: "Salir antes con break",
        texto: [
          "`break` termina el bucle en el punto en que se ejecuta.",
          "Cambia el valor de corte a 2."
        ],
        codigo: `for i in range(8):
    if i == 4:
        break
    print(i)`
      },
      {
        tipo: "reto",
        titulo: "Los números pares",
        texto: [
          "Imprime los pares del 1 al 20, uno por línea. Usa `%` para comprobar si el resto al dividir entre 2 es cero."
        ],
        etiqueta: "Combinación: bucles + condiciones",
        codigo: `for i in range(1, 21):
    pass`,
        objetivo: "Imprime los diez pares del 1 al 20.",
        salidaEsperada: "2\n4\n6\n8\n10\n12\n14\n16\n18\n20",
        requiere: ["for","if"],
        pistas: ["En cada vuelta calcula i % 2.","Imprime i dentro de un if que compare ese resto con 0."],
        solucion: `for i in range(1, 21):
    if i % 2 == 0:
        print(i)`
      },
      {
        tipo: "reto",
        titulo: "La tabla del 7",
        texto: [
          "Imprime la tabla del 7 del 1 al 10 con el formato `7 x 1 = 7`. Usa un bucle y una f-string."
        ],
        etiqueta: "Combinación: bucles + f-strings",
        codigo: `for i in range(1, 11):
    pass`,
        objetivo: "Imprime los diez productos de la tabla del 7.",
        salidaEsperada: "7 x 1 = 7\n7 x 2 = 14\n7 x 3 = 21\n7 x 4 = 28\n7 x 5 = 35\n7 x 6 = 42\n7 x 7 = 49\n7 x 8 = 56\n7 x 9 = 63\n7 x 10 = 70",
        requiere: ["for","fstring"],
        pistas: ["El bucle ya da los multiplicadores del 1 al 10.","Usa {i} y {7 * i} en una f-string con el formato del ejemplo."],
        solucion: `for i in range(1, 11):
    print(f'7 x {i} = {7 * i}')`
      },
      {
        tipo: "mundo",
        titulo: "El riego de Bina",
        texto: [
          "Bina recorre cuatro parcelas con semillas. Usa `tierra_seca()` antes de `regar()` y avanza en cada vuelta hasta el mercado."
        ],
        codigo: `for i in range(4):
    pass`,
        objetivo: "Riega las parcelas secas y llega al mercado.",
        requiere: ["for","if"],
        pistas: ["La parcela húmeda solo necesita que pases de largo.","Dentro del for, pon regar() bajo el if y avanzar() al nivel del if."],
        mundo: {"demo":"granja","mapa":{"tierra":"shss"}},
        solucion: `for i in range(4):
    if tierra_seca():
        regar()
    avanzar()`
      },
      {
        tipo: "resumen",
        titulo: "Chuleta de bucles",
        texto: [
          "Elige `for` para recorrer valores y `while` para repetir mientras se cumpla una condición."
        ],
        codigo: "",
        chuleta: [
          ["for i in range(5):","Recorre de 0 a 4."],
          ["range(1, 6)","Empieza en 1 y termina en 5."],
          ["range(0, 10, 2)","Avanza de dos en dos."],
          ["total += i","Actualiza el acumulador."],
          ["while contador < 3:","Repite mientras se cumpla la condición."],
          ["break","Sale del bucle actual."]
        ]
      }
    ]
  };
  if (typeof module !== 'undefined') module.exports = tema;
  else (window.CR.Temas ||= []).push(tema);
})();
