(function (CR) {
'use strict';
const ejercicios = [
  {
    "id": "bucles-1",
    "tema": "bucles",
    "tipo": "crea",
    "dificultad": 1,
    "titulo": "Countdown",
    "enunciado": [
      "Print from 10 down to 1, one number per line. Finish with Lift off! Use for or while."
    ],
    "codigo": "",
    "solucion": "for n in range(10, 0, -1):\n    print(n)\nprint(\"Lift off!\")",
    "salidaEsperada": "10\n9\n8\n7\n6\n5\n4\n3\n2\n1\nLift off!",
    "pistas": [
      "The step in range can be negative.",
      "Put the last print call outside the loop."
    ],
    "requiere": [
      "bucle"
    ],
    "ejemplo": "First line → 10. Last line → Lift off!"
  },
  {
    "id": "bucles-2",
    "tema": "bucles",
    "tipo": "crea",
    "dificultad": 1,
    "titulo": "The sum from 1 to 100",
    "enunciado": [
      "Add the integers from 1 to 100, including both ends. Use a loop without sum(). Print the total."
    ],
    "codigo": "",
    "solucion": "total = 0\nfor n in range(1, 101):\n    total += n\nprint(total)",
    "salidaEsperada": "5050",
    "pistas": [
      "Start the total at zero.",
      "Add each number to the total as you go."
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
      "Design factorial(n) for integers of zero or more. Use a loop to return the result of multiplying the integers from 1 through n. The factorial of zero is 1."
    ],
    "codigo": "",
    "solucion": "def factorial(n):\n    product = 1\n    for i in range(1, n + 1):\n        product *= i\n    return product",
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
      "Start the result at 1.",
      "Multiply by each integer up to and including n."
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
      "Print the numbers from 1 to 20. Replace multiples of 3 with Fizz, multiples of 5 with Buzz, and multiples of both with FizzBuzz."
    ],
    "codigo": "",
    "solucion": "for n in range(1, 21):\n    if n % 15 == 0:\n        print(\"FizzBuzz\")\n    elif n % 3 == 0:\n        print(\"Fizz\")\n    elif n % 5 == 0:\n        print(\"Buzz\")\n    else:\n        print(n)",
    "salidaEsperada": "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n16\n17\nFizz\n19\nBuzz",
    "pistas": [
      "Check multiples of both numbers first.",
      "A multiple of 15 is a multiple of 3 and 5."
    ],
    "ejemplo": "3 → Fizz, 5 → Buzz, 15 → FizzBuzz"
  },
  {
    "id": "bucles-5",
    "tema": "bucles",
    "tipo": "crea",
    "dificultad": 2,
    "titulo": "A triangle of stars",
    "enunciado": [
      "Print five rows. Start with one star and add one more on each row."
    ],
    "codigo": "",
    "solucion": "for n in range(1, 6):\n    print(\"*\" * n)",
    "salidaEsperada": "*\n**\n***\n****\n*****",
    "pistas": [
      "You can multiply a string by an integer.",
      "Use the row number to decide how many stars to print."
    ],
    "ejemplo": "Row 3 → ***"
  },
  {
    "id": "bucles-6",
    "tema": "bucles",
    "tipo": "crea",
    "dificultad": 2,
    "titulo": "Doubling",
    "enunciado": [
      "Start at 1 and double the value until it is above 1000. Use while and print how many times you doubled it."
    ],
    "codigo": "",
    "solucion": "value = 1\nsteps = 0\nwhile value <= 1000:\n    value *= 2\n    steps += 1\nprint(steps)",
    "salidaEsperada": "10",
    "pistas": [
      "Use a separate counter.",
      "Keep going while the value is at most 1000."
    ],
    "requiere": [
      "while"
    ],
    "ejemplo": "1 → 2 → 4 takes two steps."
  }
];
if (typeof module !== 'undefined') module.exports = ejercicios;
else (CR.EjerciciosEn ||= []).push(...ejercicios);
})(globalThis.CR ||= {});
