(function () {
  'use strict';
  const ejercicios = [
    {
      "id": "funciones-1",
      "tema": "funciones",
      "tipo": "disena",
      "dificultad": 1,
      "titulo": "Área de un rectángulo",
      "enunciado": [
        "Diseña area_rectangulo(base, altura). Devuelve el producto de la base y la altura."
      ],
      "codigo": "",
      "solucion": "def area_rectangulo(base, altura):\n    return base * altura",
      "pruebas": [
        {
          "llamada": "area_rectangulo(3, 4)",
          "salida": "12",
          "codigo": "print(area_rectangulo(3, 4))",
          "tipo": "numero"
        },
        {
          "llamada": "area_rectangulo(0, 7)",
          "salida": "0",
          "codigo": "print(area_rectangulo(0, 7))",
          "tipo": "numero"
        },
        {
          "llamada": "area_rectangulo(2.5, 3)",
          "salida": "7.5",
          "codigo": "print(area_rectangulo(2.5, 3))",
          "tipo": "numero"
        }
      ],
      "pistas": [
        "Multiplica las dimensiones.",
        "Devuelve el área con return."
      ],
      "ejemplo": "area_rectangulo(3, 4) → 12"
    },
    {
      "id": "funciones-2",
      "tema": "funciones",
      "tipo": "disena",
      "dificultad": 1,
      "titulo": "De Celsius a Fahrenheit",
      "enunciado": [
        "Diseña celsius_a_fahrenheit(c). Devuelve la temperatura en Fahrenheit con la fórmula c × 9 / 5 + 32."
      ],
      "codigo": "",
      "solucion": "def celsius_a_fahrenheit(c):\n    return c * 9 / 5 + 32",
      "pruebas": [
        {
          "llamada": "celsius_a_fahrenheit(0)",
          "salida": "32.0",
          "codigo": "print(round(celsius_a_fahrenheit(0), 1))",
          "tipo": "float"
        },
        {
          "llamada": "celsius_a_fahrenheit(100)",
          "salida": "212.0",
          "codigo": "print(round(celsius_a_fahrenheit(100), 1))",
          "tipo": "float"
        },
        {
          "llamada": "celsius_a_fahrenheit(-40)",
          "salida": "-40.0",
          "codigo": "print(round(celsius_a_fahrenheit(-40), 1))",
          "tipo": "float"
        },
        {
          "llamada": "celsius_a_fahrenheit(36.6)",
          "salida": "97.9",
          "codigo": "print(round(celsius_a_fahrenheit(36.6), 1))",
          "tipo": "float"
        }
      ],
      "pistas": [
        "Multiplica primero por 9 y divide por 5.",
        "Suma 32 al resultado."
      ],
      "ejemplo": "celsius_a_fahrenheit(100) → 212.0"
    },
    {
      "id": "funciones-3",
      "tema": "funciones",
      "tipo": "disena",
      "dificultad": 2,
      "titulo": "Por encima del límite",
      "enunciado": [
        "Diseña contar_mayores(lista, limite). Devuelve cuántos elementos son estrictamente mayores que limite."
      ],
      "codigo": "",
      "solucion": "def contar_mayores(lista, limite):\n    total = 0\n    for n in lista:\n        if n > limite:\n            total += 1\n    return total",
      "pruebas": [
        {
          "llamada": "contar_mayores([2, 3, 4, 5], 3)",
          "salida": "2",
          "codigo": "print(contar_mayores([2, 3, 4, 5], 3))",
          "tipo": "int"
        },
        {
          "llamada": "contar_mayores([], 0)",
          "salida": "0",
          "codigo": "print(contar_mayores([], 0))",
          "tipo": "int"
        },
        {
          "llamada": "contar_mayores([-3, -2, -2], -3)",
          "salida": "2",
          "codigo": "print(contar_mayores([-3, -2, -2], -3))",
          "tipo": "int"
        }
      ],
      "pistas": [
        "Usa > para excluir los empates.",
        "Devuelve el contador al salir del bucle."
      ],
      "ejemplo": "contar_mayores([2, 3, 4, 5], 3) → 2"
    },
    {
      "id": "funciones-4",
      "tema": "funciones",
      "tipo": "disena",
      "dificultad": 2,
      "titulo": "Saludo a medida",
      "enunciado": [
        "Diseña saludo(nombre, formal=False). Devuelve Hola, seguido del nombre, o Buenos días, seguido del nombre cuando formal sea verdadero. Incluye la coma y el espacio."
      ],
      "codigo": "",
      "solucion": "def saludo(nombre, formal=False):\n    if formal:\n        return \"Buenos días, \" + nombre\n    return \"Hola, \" + nombre",
      "pruebas": [
        {
          "llamada": "saludo(\"Ana\")",
          "salida": "Hola, Ana",
          "codigo": "print(saludo(\"Ana\"))",
          "tipo": "str"
        },
        {
          "llamada": "saludo(\"Ana\", True)",
          "salida": "Buenos días, Ana",
          "codigo": "print(saludo(\"Ana\", True))",
          "tipo": "str"
        },
        {
          "llamada": "saludo(\"Sol\", formal=False)",
          "salida": "Hola, Sol",
          "codigo": "print(saludo(\"Sol\", formal=False))",
          "tipo": "str"
        }
      ],
      "pistas": [
        "Indica el valor por defecto en def.",
        "Usa formal para elegir el texto."
      ],
      "ejemplo": "saludo(\"Ana\", True) → Buenos días, Ana"
    },
    {
      "id": "funciones-5",
      "tema": "funciones",
      "tipo": "ordena",
      "dificultad": 2,
      "titulo": "Devuelve el doble",
      "enunciado": [
        "Ordena estas líneas para definir doble(n), que devuelve el doble de n, y mostrar el resultado con 4. Descarta la línea que sobra."
      ],
      "codigo": "def doble(n):\n    return n * 2\nprint(doble(4))",
      "solucion": "def doble(n):\n    return n * 2\nprint(doble(4))",
      "salidaEsperada": "8",
      "pistas": [
        "La definición precede a la llamada.",
        "La función devuelve con return. Solo el programa principal imprime."
      ],
      "trampa": "print(n * 2)",
      "requiere": [
        "return"
      ],
      "ejemplo": "doble(4) → 8"
    }
  ];
  if (typeof module !== 'undefined') module.exports = ejercicios;
  else (window.CR.Ejercicios ||= []).push(...ejercicios);
})();
