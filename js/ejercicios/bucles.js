(function () {
  'use strict';
  const ejercicios = [
    {
      "id": "bucles-1",
      "tema": "bucles",
      "tipo": "crea",
      "dificultad": 1,
      "titulo": "Cuenta atrás",
      "enunciado": [
        "Imprime del 10 al 1, un número por línea. Termina con ¡Despegue! Usa for o while."
      ],
      "codigo": "",
      "solucion": "for n in range(10, 0, -1):\n    print(n)\nprint(\"¡Despegue!\")",
      "salidaEsperada": "10\n9\n8\n7\n6\n5\n4\n3\n2\n1\n¡Despegue!",
      "pistas": [
        "El paso de range puede ser negativo.",
        "La última llamada a print queda fuera del bucle."
      ],
      "requiere": [
        "bucle"
      ],
      "ejemplo": "Primera línea → 10. Última línea → ¡Despegue!"
    },
    {
      "id": "bucles-2",
      "tema": "bucles",
      "tipo": "crea",
      "dificultad": 1,
      "titulo": "La suma de 1 a 100",
      "enunciado": [
        "Suma los enteros del 1 al 100 incluidos con un bucle, sin sum(). Imprime el total."
      ],
      "codigo": "",
      "solucion": "total = 0\nfor n in range(1, 101):\n    total += n\nprint(total)",
      "salidaEsperada": "5050",
      "pistas": [
        "Empieza el acumulador en cero.",
        "Suma el número de cada vuelta al acumulador."
      ],
      "requiere": [
        "bucle"
      ],
      "prohibe": [
        "sum"
      ],
      "ejemplo": "1 + 2 + … + 100 → 5050"
    },
    {
      "id": "bucles-3",
      "tema": "bucles",
      "tipo": "disena",
      "dificultad": 2,
      "titulo": "Factorial",
      "enunciado": [
        "Diseña factorial(n) para enteros no negativos. Usa un bucle y devuelve el producto de 1 hasta n. El factorial de cero es 1."
      ],
      "codigo": "",
      "solucion": "def factorial(n):\n    producto = 1\n    for i in range(1, n + 1):\n        producto *= i\n    return producto",
      "pruebas": [
        {
          "llamada": "factorial(0)",
          "salida": "1",
          "codigo": "print(factorial(0))",
          "tipo": "int"
        },
        {
          "llamada": "factorial(1)",
          "salida": "1",
          "codigo": "print(factorial(1))",
          "tipo": "int"
        },
        {
          "llamada": "factorial(5)",
          "salida": "120",
          "codigo": "print(factorial(5))",
          "tipo": "int"
        },
        {
          "llamada": "factorial(10)",
          "salida": "3628800",
          "codigo": "print(factorial(10))",
          "tipo": "int"
        }
      ],
      "pistas": [
        "El producto empieza en 1.",
        "Multiplica por cada entero hasta n incluido."
      ],
      "requiere": [
        "bucle"
      ],
      "ejemplo": "factorial(5) → 120"
    },
    {
      "id": "bucles-4",
      "tema": "bucles",
      "tipo": "crea",
      "dificultad": 2,
      "titulo": "FizzBuzz",
      "enunciado": [
        "Imprime del 1 al 20. Sustituye los múltiplos de 3 por Fizz, los de 5 por Buzz y los de ambos por FizzBuzz."
      ],
      "codigo": "",
      "solucion": "for n in range(1, 21):\n    if n % 15 == 0:\n        print(\"FizzBuzz\")\n    elif n % 3 == 0:\n        print(\"Fizz\")\n    elif n % 5 == 0:\n        print(\"Buzz\")\n    else:\n        print(n)",
      "salidaEsperada": "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n16\n17\nFizz\n19\nBuzz",
      "pistas": [
        "Comprueba primero los múltiplos de ambos números.",
        "Un múltiplo de 15 es múltiplo de 3 y de 5."
      ],
      "ejemplo": "3 → Fizz, 5 → Buzz, 15 → FizzBuzz"
    },
    {
      "id": "bucles-5",
      "tema": "bucles",
      "tipo": "crea",
      "dificultad": 2,
      "titulo": "Triángulo de asteriscos",
      "enunciado": [
        "Imprime cinco filas, empezando con un asterisco y añadiendo uno más en cada fila."
      ],
      "codigo": "",
      "solucion": "for n in range(1, 6):\n    print(\"*\" * n)",
      "salidaEsperada": "*\n**\n***\n****\n*****",
      "pistas": [
        "Puedes multiplicar un texto por un entero.",
        "Usa el número de fila como multiplicador."
      ],
      "ejemplo": "Fila 3 → ***"
    },
    {
      "id": "bucles-6",
      "tema": "bucles",
      "tipo": "crea",
      "dificultad": 2,
      "titulo": "Duplicaciones",
      "enunciado": [
        "Empieza en 1 y duplica el valor hasta que supere 1000. Usa while e imprime cuántas duplicaciones hiciste."
      ],
      "codigo": "",
      "solucion": "valor = 1\npasos = 0\nwhile valor <= 1000:\n    valor *= 2\n    pasos += 1\nprint(pasos)",
      "salidaEsperada": "10",
      "pistas": [
        "Mantén un contador separado.",
        "Sigue mientras el valor sea menor o igual a 1000."
      ],
      "requiere": [
        "while"
      ],
      "ejemplo": "1 → 2 → 4 son dos pasos."
    }
  ];
  if (typeof module !== 'undefined') module.exports = ejercicios;
  else (window.CR.Ejercicios ||= []).push(...ejercicios);
})();
