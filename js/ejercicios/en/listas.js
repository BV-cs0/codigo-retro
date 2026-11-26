(function (CR) {
'use strict';
const ejercicios = [
  {
    "id": "listas-1",
    "tema": "listas",
    "tipo": "disena",
    "dificultad": 2,
    "titulo": "Find the largest item",
    "enunciado": [
      "Design largest(items) for a list with at least one item. Return its largest item without using max()."
    ],
    "codigo": "",
    "solucion": "def largest(items):\n    biggest = items[0]\n    for n in items:\n        if n > biggest:\n            biggest = n\n    return biggest",
    "pruebas": [
      {
        "llamada": "largest([4, 9, 2])",
        "salida": "9",
        "codigo": "print(largest([4, 9, 2]))",
        "tipo": "int"
      },
      {
        "llamada": "largest([-8, -2, -5])",
        "salida": "-2",
        "codigo": "print(largest([-8, -2, -5]))",
        "tipo": "int"
      },
      {
        "llamada": "largest([7])",
        "salida": "7",
        "codigo": "print(largest([7]))",
        "tipo": "int"
      }
    ],
    "pistas": [
      "Start with the first item.",
      "Update the largest value only when you find a bigger one."
    ],
    "prohibe": [
      "max"
    ],
    "ejemplo": "largest([-8, -2, -5]) → -2"
  },
  {
    "id": "listas-2",
    "tema": "listas",
    "tipo": "crea",
    "dificultad": 1,
    "titulo": "Even numbers only",
    "enunciado": [
      "Create a new list with the even numbers from numbers in the same order. Keep the first line and print the new list."
    ],
    "codigo": "numbers = [1, 2, 3, 4, 0, -6]",
    "solucion": "numbers = [1, 2, 3, 4, 0, -6]\nevens = []\nfor n in numbers:\n    if n % 2 == 0:\n        evens.append(n)\nprint(evens)",
    "salidaEsperada": "[2, 4, 0, -6]",
    "datos": [
      {
        "linea": "numbers = []",
        "salida": "[]"
      },
      {
        "linea": "numbers = [7, 8, 8, 1]",
        "salida": "[8, 8]"
      }
    ],
    "pistas": [
      "Even numbers have a remainder of zero when divided by 2.",
      "Use append to add each even number to an empty list."
    ],
    "ejemplo": "[1, 2, 3, 4, 0, -6] → [2, 4, 0, -6]"
  },
  {
    "id": "listas-3",
    "tema": "listas",
    "tipo": "disena",
    "dificultad": 2,
    "titulo": "Reverse a list",
    "enunciado": [
      "Design reverse_list(items). Return a new list in reverse order. Do it without [::-1], reverse(), or reversed()."
    ],
    "codigo": "",
    "solucion": "def reverse_list(items):\n    result = []\n    for i in range(len(items) - 1, -1, -1):\n        result.append(items[i])\n    return result",
    "pruebas": [
      {
        "llamada": "reverse_list([1, 2, 3])",
        "salida": "[3, 2, 1]",
        "codigo": "print(reverse_list([1, 2, 3]))",
        "tipo": "list"
      },
      {
        "llamada": "reverse_list([])",
        "salida": "[]",
        "codigo": "print(reverse_list([]))",
        "tipo": "list"
      },
      {
        "llamada": "reverse_list([\"a\"])",
        "salida": "['a']",
        "codigo": "print(reverse_list([\"a\"]))",
        "tipo": "list"
      },
      {
        "llamada": "reverse_list([1, 1, 2])",
        "salida": "[2, 1, 1]",
        "codigo": "print(reverse_list([1, 1, 2]))",
        "tipo": "list"
      }
    ],
    "pistas": [
      "The last position is len(items) - 1.",
      "Go through the positions with a step of -1."
    ],
    "prohibe": [
      "corte-inverso",
      "reverse",
      "reversed"
    ],
    "ejemplo": "reverse_list([1, 2, 3]) → [3, 2, 1]"
  },
  {
    "id": "listas-4",
    "tema": "listas",
    "tipo": "completa",
    "dificultad": 1,
    "titulo": "One more fruit",
    "enunciado": [
      "Fill in the method name to add mango to the end of fruits."
    ],
    "codigo": "fruits = [\"pear\"]\nfruits.___(\"mango\")\nprint(fruits)",
    "solucion": "fruits = [\"pear\"]\nfruits.append(\"mango\")\nprint(fruits)",
    "salidaEsperada": "['pear', 'mango']",
    "pistas": [
      "Look for the method that adds to the end.",
      "Use append."
    ],
    "ejemplo": "['pear'] → ['pear', 'mango']"
  },
  {
    "id": "listas-5",
    "tema": "listas",
    "tipo": "arregla",
    "dificultad": 1,
    "titulo": "Index out of range",
    "enunciado": [
      "Fix the loop limit to print each item once without an IndexError."
    ],
    "codigo": "items = [\"sun\", \"moon\"]\nfor i in range(len(items) + 1):\n    print(items[i])",
    "solucion": "items = [\"sun\", \"moon\"]\nfor i in range(len(items)):\n    print(items[i])",
    "salidaEsperada": "sun\nmoon",
    "pistas": [
      "The first index is zero.",
      "range already stops before its end value."
    ],
    "ejemplo": "[\"sun\", \"moon\"] → sun and moon on separate lines."
  }
];
if (typeof module !== 'undefined') module.exports = ejercicios;
else (CR.EjerciciosEn ||= []).push(...ejercicios);
})(globalThis.CR ||= {});
