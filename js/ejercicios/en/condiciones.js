(function (CR) {
'use strict';
const ejercicios = [
  {
    "id": "condiciones-1",
    "tema": "condiciones",
    "tipo": "disena",
    "dificultad": 1,
    "titulo": "The sign of a number",
    "enunciado": [
      "Design sign(n). Return \"positive\", \"negative\", or \"zero\" based on the value of n."
    ],
    "codigo": "",
    "solucion": "def sign(n):\n    if n > 0:\n        return \"positive\"\n    if n < 0:\n        return \"negative\"\n    return \"zero\"",
    "pruebas": [
      {
        "llamada": "sign(8)",
        "salida": "positive",
        "codigo": "print(sign(8))",
        "tipo": "str"
      },
      {
        "llamada": "sign(-3)",
        "salida": "negative",
        "codigo": "print(sign(-3))",
        "tipo": "str"
      },
      {
        "llamada": "sign(0)",
        "salida": "zero",
        "codigo": "print(sign(0))",
        "tipo": "str"
      }
    ],
    "pistas": [
      "Compare n with zero.",
      "Use return to give back a string."
    ],
    "ejemplo": "sign(-3) → negative"
  },
  {
    "id": "condiciones-2",
    "tema": "condiciones",
    "tipo": "disena",
    "dificultad": 3,
    "titulo": "Leap year",
    "enunciado": [
      "Design is_leap_year(year). Return True if the year is a multiple of 4. For multiples of 100, return True only for multiples of 400."
    ],
    "codigo": "",
    "solucion": "def is_leap_year(year):\n    return year % 400 == 0 or (year % 4 == 0 and year % 100 != 0)",
    "pruebas": [
      {
        "llamada": "is_leap_year(2024)",
        "salida": "True",
        "codigo": "print(is_leap_year(2024))",
        "tipo": "bool"
      },
      {
        "llamada": "is_leap_year(2023)",
        "salida": "False",
        "codigo": "print(is_leap_year(2023))",
        "tipo": "bool"
      },
      {
        "llamada": "is_leap_year(1900)",
        "salida": "False",
        "codigo": "print(is_leap_year(1900))",
        "tipo": "bool"
      },
      {
        "llamada": "is_leap_year(2000)",
        "salida": "True",
        "codigo": "print(is_leap_year(2000))",
        "tipo": "bool"
      },
      {
        "llamada": "is_leap_year(2100)",
        "salida": "False",
        "codigo": "print(is_leap_year(2100))",
        "tipo": "bool"
      }
    ],
    "pistas": [
      "If the remainder is zero, the number divides exactly.",
      "Check multiples of 400 before multiples of 100."
    ],
    "ejemplo": "is_leap_year(2000) → True"
  },
  {
    "id": "condiciones-3",
    "tema": "condiciones",
    "tipo": "crea",
    "dificultad": 2,
    "titulo": "Permission to drive",
    "enunciado": [
      "Read age and has_license from data. Print Can drive if the person is at least 18 and has a license. Otherwise print Cannot drive. Use and and keep the first line."
    ],
    "codigo": "data = [18, True]",
    "solucion": "data = [18, True]\nage, has_license = data\nif age >= 18 and has_license:\n    print(\"Can drive\")\nelse:\n    print(\"Cannot drive\")",
    "salidaEsperada": "Can drive",
    "datos": [
      {
        "linea": "data = [30, False]",
        "salida": "Cannot drive"
      },
      {
        "linea": "data = [17, True]",
        "salida": "Cannot drive"
      },
      {
        "linea": "data = [16, False]",
        "salida": "Cannot drive"
      }
    ],
    "pistas": [
      "Both conditions must be true.",
      "Put the age check and the license check on either side of and."
    ],
    "requiere": [
      "and"
    ],
    "ejemplo": "18, True → Can drive"
  },
  {
    "id": "condiciones-4",
    "tema": "condiciones",
    "tipo": "ordena",
    "dificultad": 2,
    "titulo": "Classify the grade",
    "enunciado": [
      "Order the code. Print Excellent for 9 or more, Pass for 5 or more, and Fail below 5. Adjust the spaces at the start of each branch."
    ],
    "codigo": "grade = 7\nif grade >= 9:\n    print(\"Excellent\")\nelif grade >= 5:\n    print(\"Pass\")\nelse:\n    print(\"Fail\")",
    "solucion": "grade = 7\nif grade >= 9:\n    print(\"Excellent\")\nelif grade >= 5:\n    print(\"Pass\")\nelse:\n    print(\"Fail\")",
    "salidaEsperada": "Pass",
    "datos": [
      {
        "linea": "grade = 9",
        "salida": "Excellent"
      },
      {
        "linea": "grade = 4",
        "salida": "Fail"
      }
    ],
    "pistas": [
      "Check the highest grade first.",
      "Indent only the print calls."
    ],
    "ejemplo": "7 → Pass"
  },
  {
    "id": "condiciones-5",
    "tema": "condiciones",
    "tipo": "arregla",
    "dificultad": 1,
    "titulo": "A comparison",
    "enunciado": [
      "Fix the condition so the program shows Access allowed when the PIN matches."
    ],
    "codigo": "pin = 1234\nif pin = 1234:\n    print(\"Access allowed\")",
    "solucion": "pin = 1234\nif pin == 1234:\n    print(\"Access allowed\")",
    "salidaEsperada": "Access allowed",
    "pistas": [
      "The assignment sign sets a value.",
      "Use == inside the if."
    ],
    "ejemplo": "1234 → Access allowed"
  }
];
if (typeof module !== 'undefined') module.exports = ejercicios;
else (CR.EjerciciosEn ||= []).push(...ejercicios);
})(globalThis.CR ||= {});
