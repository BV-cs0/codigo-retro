(function (CR) {
'use strict';
const ejercicios = [
  {
    "id": "variables-1",
    "tema": "variables",
    "tipo": "crea",
    "dificultad": 2,
    "titulo": "Swap two values",
    "enunciado": [
      "Set a and b to the two items in values. Swap them using a temporary variable. Keep the first line and print a and b with a space between them."
    ],
    "codigo": "values = [3, 7]",
    "solucion": "values = [3, 7]\na = values[0]\nb = values[1]\ntemp = a\na = b\nb = temp\nprint(a, b)",
    "salidaEsperada": "7 3",
    "datos": [
      {
        "linea": "values = [-2, 0]",
        "salida": "0 -2"
      }
    ],
    "pistas": [
      "Save a before you change it.",
      "Assign b to a, then assign the saved value to b."
    ],
    "prohibe": [
      "asignacion-multiple"
    ],
    "requiere": [
      "auxiliar"
    ],
    "ejemplo": "3, 7 → 7 3"
  },
  {
    "id": "variables-2",
    "tema": "variables",
    "tipo": "crea",
    "dificultad": 2,
    "titulo": "Hours and minutes",
    "enunciado": [
      "Convert minutes to whole hours and minutes left. Use // and %, keep the first line, and print the units shown."
    ],
    "codigo": "minutes = 135",
    "solucion": "minutes = 135\nprint(minutes // 60, \"h\", minutes % 60, \"min\")",
    "salidaEsperada": "2 h 15 min",
    "datos": [
      {
        "linea": "minutes = 61",
        "salida": "1 h 1 min"
      }
    ],
    "pistas": [
      "An hour has 60 minutes.",
      "The remainder is the number of minutes left."
    ],
    "requiere": [
      "//",
      "%"
    ],
    "ejemplo": "135 → 2 h 15 min"
  },
  {
    "id": "variables-3",
    "tema": "variables",
    "tipo": "completa",
    "dificultad": 1,
    "titulo": "Price with VAT",
    "enunciado": [
      "Finish the calculation to include 21% VAT in the price."
    ],
    "codigo": "price = 100\nprint(___)",
    "solucion": "price = 100\nprint(price * 1.21)",
    "salidaEsperada": "121.0",
    "pistas": [
      "Add 21% of the price to the price.",
      "Multiplying by 1.21 includes the original price."
    ],
    "ejemplo": "100 → 121.0"
  },
  {
    "id": "variables-4",
    "tema": "variables",
    "tipo": "arregla",
    "dificultad": 1,
    "titulo": "Text and a number",
    "enunciado": [
      "Fix the code to show Total: 5."
    ],
    "codigo": "print(\"Total: \" + 5)",
    "solucion": "print(\"Total: \" + str(5))",
    "salidaEsperada": "Total: 5",
    "pistas": [
      "You cannot join a string and an integer with +.",
      "Use str() to turn the integer into text."
    ],
    "ejemplo": "5 → Total: 5",
    "alternativa": "print(\"Total:\", 5)"
  },
  {
    "id": "variables-5",
    "tema": "variables",
    "tipo": "crea",
    "dificultad": 1,
    "titulo": "Introduce yourself",
    "enunciado": [
      "Read the name, age, and city from data. Use an f-string to introduce the person as shown. Keep the first line."
    ],
    "codigo": "data = [\"Ana\", 20, \"Lima\"]",
    "solucion": "data = [\"Ana\", 20, \"Lima\"]\nname, age, city = data\nprint(f\"I am {name}. I am {age} years old and I live in {city}.\")",
    "salidaEsperada": "I am Ana. I am 20 years old and I live in Lima.",
    "datos": [
      {
        "linea": "data = [\"Eva\", 31, \"Quito\"]",
        "salida": "I am Eva. I am 31 years old and I live in Quito."
      }
    ],
    "pistas": [
      "Put an f before the first quote.",
      "Put each variable inside braces."
    ],
    "requiere": [
      "fstring"
    ],
    "ejemplo": "Ana, 20, Lima → I am Ana. I am 20 years old and I live in Lima."
  }
];
if (typeof module !== 'undefined') module.exports = ejercicios;
else (CR.EjerciciosEn ||= []).push(...ejercicios);
})(globalThis.CR ||= {});
