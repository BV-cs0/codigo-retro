(function (CR) {
'use strict';
const ejercicios = [
  {
    "id": "funciones-1",
    "tema": "funciones",
    "tipo": "disena",
    "dificultad": 1,
    "titulo": "Area of a rectangle",
    "enunciado": [
      "Design rectangle_area(width, height). Return the width times the height."
    ],
    "codigo": "",
    "solucion": "def rectangle_area(width, height):\n    return width * height",
    "pruebas": [
      {
        "llamada": "rectangle_area(3, 4)",
        "salida": "12",
        "codigo": "print(rectangle_area(3, 4))",
        "tipo": "numero"
      },
      {
        "llamada": "rectangle_area(0, 7)",
        "salida": "0",
        "codigo": "print(rectangle_area(0, 7))",
        "tipo": "numero"
      },
      {
        "llamada": "rectangle_area(2.5, 3)",
        "salida": "7.5",
        "codigo": "print(rectangle_area(2.5, 3))",
        "tipo": "numero"
      }
    ],
    "pistas": [
      "Multiply the two sizes.",
      "Use return to give back the area."
    ],
    "ejemplo": "rectangle_area(3, 4) → 12"
  },
  {
    "id": "funciones-2",
    "tema": "funciones",
    "tipo": "disena",
    "dificultad": 1,
    "titulo": "Celsius to Fahrenheit",
    "enunciado": [
      "Design celsius_to_fahrenheit(c). Return the temperature in Fahrenheit using c × 9 / 5 + 32."
    ],
    "codigo": "",
    "solucion": "def celsius_to_fahrenheit(c):\n    return c * 9 / 5 + 32",
    "pruebas": [
      {
        "llamada": "celsius_to_fahrenheit(0)",
        "salida": "32.0",
        "codigo": "print(round(celsius_to_fahrenheit(0), 1))",
        "tipo": "float"
      },
      {
        "llamada": "celsius_to_fahrenheit(100)",
        "salida": "212.0",
        "codigo": "print(round(celsius_to_fahrenheit(100), 1))",
        "tipo": "float"
      },
      {
        "llamada": "celsius_to_fahrenheit(-40)",
        "salida": "-40.0",
        "codigo": "print(round(celsius_to_fahrenheit(-40), 1))",
        "tipo": "float"
      },
      {
        "llamada": "celsius_to_fahrenheit(36.6)",
        "salida": "97.9",
        "codigo": "print(round(celsius_to_fahrenheit(36.6), 1))",
        "tipo": "float"
      }
    ],
    "pistas": [
      "Multiply by 9 first, then divide by 5.",
      "Add 32 to the result."
    ],
    "ejemplo": "celsius_to_fahrenheit(100) → 212.0"
  },
  {
    "id": "funciones-3",
    "tema": "funciones",
    "tipo": "disena",
    "dificultad": 2,
    "titulo": "Above the limit",
    "enunciado": [
      "Design count_above(items, limit). Return the number of items greater than limit."
    ],
    "codigo": "",
    "solucion": "def count_above(items, limit):\n    total = 0\n    for n in items:\n        if n > limit:\n            total += 1\n    return total",
    "pruebas": [
      {
        "llamada": "count_above([2, 3, 4, 5], 3)",
        "salida": "2",
        "codigo": "print(count_above([2, 3, 4, 5], 3))",
        "tipo": "int"
      },
      {
        "llamada": "count_above([], 0)",
        "salida": "0",
        "codigo": "print(count_above([], 0))",
        "tipo": "int"
      },
      {
        "llamada": "count_above([-3, -2, -2], -3)",
        "salida": "2",
        "codigo": "print(count_above([-3, -2, -2], -3))",
        "tipo": "int"
      }
    ],
    "pistas": [
      "Use > to skip equal values.",
      "Return the count after the loop."
    ],
    "ejemplo": "count_above([2, 3, 4, 5], 3) → 2"
  },
  {
    "id": "funciones-4",
    "tema": "funciones",
    "tipo": "disena",
    "dificultad": 2,
    "titulo": "Choose a greeting",
    "enunciado": [
      "Design greet(name, formal=False). Return Hello, followed by the name. If formal is true, use Good morning instead. Include a comma and a space after the greeting."
    ],
    "codigo": "",
    "solucion": "def greet(name, formal=False):\n    if formal:\n        return \"Good morning, \" + name\n    return \"Hello, \" + name",
    "pruebas": [
      {
        "llamada": "greet(\"Ana\")",
        "salida": "Hello, Ana",
        "codigo": "print(greet(\"Ana\"))",
        "tipo": "str"
      },
      {
        "llamada": "greet(\"Ana\", True)",
        "salida": "Good morning, Ana",
        "codigo": "print(greet(\"Ana\", True))",
        "tipo": "str"
      },
      {
        "llamada": "greet(\"Sol\", formal=False)",
        "salida": "Hello, Sol",
        "codigo": "print(greet(\"Sol\", formal=False))",
        "tipo": "str"
      }
    ],
    "pistas": [
      "Set the default value in def.",
      "Use formal to choose the greeting."
    ],
    "ejemplo": "greet(\"Ana\", True) → Good morning, Ana"
  },
  {
    "id": "funciones-5",
    "tema": "funciones",
    "tipo": "ordena",
    "dificultad": 2,
    "titulo": "Return double the number",
    "enunciado": [
      "Order these lines to define double(n), which returns twice n, and show the result for 4. Remove the extra line."
    ],
    "codigo": "def double(n):\n    return n * 2\nprint(double(4))",
    "solucion": "def double(n):\n    return n * 2\nprint(double(4))",
    "salidaEsperada": "8",
    "pistas": [
      "Define the function before calling it.",
      "The function uses return. Only the main program prints."
    ],
    "trampa": "print(n * 2)",
    "requiere": [
      "return"
    ],
    "ejemplo": "double(4) → 8"
  }
];
if (typeof module !== 'undefined') module.exports = ejercicios;
else (CR.EjerciciosEn ||= []).push(...ejercicios);
})(globalThis.CR ||= {});
