(function () {
  'use strict';
  const tema = {
    nombre: "Listas",
    frase: "Agrupa valores y recórrelos en orden.",
    necesita: "Variables, condiciones y bucles.",
    pasos: [
      {
        tipo: "explica",
        titulo: "Reunir valores",
        texto: [
          "Una lista guarda varios valores en orden. Usa corchetes y separa los elementos con comas.",
          "Sustituye `kiwi` por otra fruta."
        ],
        codigo: `frutas = ["pera", "uva", "kiwi"]
print(frutas)`
      },
      {
        tipo: "explica",
        titulo: "Primera y última posición",
        texto: [
          "Las posiciones empiezan en 0. Con `-1` cuentas desde el final.",
          "Prueba las posiciones `1` y `-2`."
        ],
        recuerda: "En una lista de tres elementos, los índices positivos disponibles son 0, 1 y 2.",
        codigo: `frutas = ['pera', 'uva', 'kiwi']
print(frutas[0])
print(frutas[-1])`
      },
      {
        tipo: "arregla",
        titulo: "Fuera de la lista",
        texto: [
          "Hay tres frutas. Corrige el índice para imprimir `kiwi`."
        ],
        codigo: `frutas = ['pera', 'uva', 'kiwi']
print(frutas[3])`,
        objetivo: "Usa un índice válido para leer kiwi.",
        salidaEsperada: "kiwi",
        pistas: ["La primera posición es 0.","Usa [2] o [-1] para leer el último elemento."],
        error: "IndexError",
        solucion: `frutas = ['pera', 'uva', 'kiwi']
print(frutas[2])`
      },
      {
        tipo: "explica",
        titulo: "Añadir y contar",
        texto: [
          "`append()` añade un elemento al final. `len()` devuelve la cantidad de elementos.",
          "Añade otra fruta y comprueba la nueva longitud."
        ],
        codigo: `frutas = ['pera', 'uva']
frutas.append('kiwi')
print(frutas)
print(len(frutas))`
      },
      {
        tipo: "explica",
        titulo: "Recorrer una lista",
        texto: [
          "En cada vuelta, `fruta` recibe el siguiente elemento de la lista.",
          "Cambia el orden de los elementos y compara la salida."
        ],
        etiqueta: "Combinación: listas + bucles",
        codigo: `frutas = ['pera', 'uva', 'kiwi']
for fruta in frutas:
    print(fruta)`
      },
      {
        tipo: "predice",
        titulo: "Acumular datos en una lista",
        texto: [
          "El bucle añade tres valores antes de calcular la suma, el máximo y el mínimo."
        ],
        codigo: `numeros = [2]
for i in range(3, 6):
    numeros.append(i)
print(sum(numeros), max(numeros), min(numeros))`,
        pregunta: "¿Qué ocurre al ejecutar el código?",
        opciones: ["12 5 3","14 5 2","2 2 2"],
        correcta: 1,
        explicacion: "La lista final es `[2, 3, 4, 5]`. La suma es 14, el máximo es 5 y el mínimo es 2."
      },
      {
        tipo: "reto",
        titulo: "Contar aprobados",
        texto: [
          "Cuenta las notas mayores o iguales que 5 en la lista y muestra el total en una línea."
        ],
        etiqueta: "Combinación: listas + condiciones",
        codigo: `notas = [8, 4, 5, 3, 9]
# Cuenta las notas aprobadas`,
        objetivo: "Cuenta y muestra cuántas notas son aprobadas.",
        salidaEsperada: "3",
        requiere: ["lista","for","if"],
        pistas: ["Inicia un contador en 0 y recorre cada nota con for.","Aumenta el contador solo si la nota es mayor o igual que 5. Imprime después del bucle."],
        solucion: `notas = [8, 4, 5, 3, 9]
total = 0
for nota in notas:
    if nota >= 5:
        total += 1
print(total)`
      },
      {
        tipo: "explica",
        titulo: "Buscar con in",
        texto: [
          "`in` comprueba si un valor está en la lista. Puedes usar el resultado como condición.",
          "Cambia `uva` por `mango` dentro del `if`."
        ],
        codigo: `frutas = ['pera', 'uva', 'kiwi']
if 'uva' in frutas:
    print('Hay uva')`
      },
      {
        tipo: "resumen",
        titulo: "Chuleta de listas",
        texto: [
          "Usa índices para acceder a elementos concretos y `for` para recorrerlos todos."
        ],
        codigo: "",
        chuleta: [
          ["frutas = ['pera', 'uva']","Crea una lista ordenada."],
          ["frutas[0]","Lee el primer elemento."],
          ["frutas[-1]","Lee el último elemento."],
          ["frutas.append('kiwi')","Añade al final."],
          ["len(frutas)","Cuenta los elementos."],
          ["'uva' in frutas","Comprueba si está en la lista."]
        ]
      }
    ]
  };
  if (typeof module !== 'undefined') module.exports = tema;
  else (window.CR.Temas ||= []).push(tema);
})();
