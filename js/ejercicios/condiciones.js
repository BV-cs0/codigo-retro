(function () {
  'use strict';
  const ejercicios = [
    {
      "id": "condiciones-1",
      "tema": "condiciones",
      "tipo": "disena",
      "dificultad": 1,
      "titulo": "El signo de un número",
      "enunciado": [
        "Diseña signo(n). Devuelve \"positivo\", \"negativo\" o \"cero\" según el valor de n."
      ],
      "codigo": "",
      "solucion": "def signo(n):\n    if n > 0:\n        return \"positivo\"\n    if n < 0:\n        return \"negativo\"\n    return \"cero\"",
      "pruebas": [
        {
          "llamada": "signo(8)",
          "salida": "positivo",
          "codigo": "print(signo(8))",
          "tipo": "str"
        },
        {
          "llamada": "signo(-3)",
          "salida": "negativo",
          "codigo": "print(signo(-3))",
          "tipo": "str"
        },
        {
          "llamada": "signo(0)",
          "salida": "cero",
          "codigo": "print(signo(0))",
          "tipo": "str"
        }
      ],
      "pistas": [
        "Compara n con cero.",
        "Devuelve un texto con return."
      ],
      "ejemplo": "signo(-3) → negativo"
    },
    {
      "id": "condiciones-2",
      "tema": "condiciones",
      "tipo": "disena",
      "dificultad": 3,
      "titulo": "Año bisiesto",
      "enunciado": [
        "Diseña es_bisiesto(año). Devuelve True si el año es múltiplo de 4, excepto los múltiplos de 100 que no lo son de 400."
      ],
      "codigo": "",
      "solucion": "def es_bisiesto(año):\n    return año % 400 == 0 or (año % 4 == 0 and año % 100 != 0)",
      "pruebas": [
        {
          "llamada": "es_bisiesto(2024)",
          "salida": "True",
          "codigo": "print(es_bisiesto(2024))",
          "tipo": "bool"
        },
        {
          "llamada": "es_bisiesto(2023)",
          "salida": "False",
          "codigo": "print(es_bisiesto(2023))",
          "tipo": "bool"
        },
        {
          "llamada": "es_bisiesto(1900)",
          "salida": "False",
          "codigo": "print(es_bisiesto(1900))",
          "tipo": "bool"
        },
        {
          "llamada": "es_bisiesto(2000)",
          "salida": "True",
          "codigo": "print(es_bisiesto(2000))",
          "tipo": "bool"
        },
        {
          "llamada": "es_bisiesto(2100)",
          "salida": "False",
          "codigo": "print(es_bisiesto(2100))",
          "tipo": "bool"
        }
      ],
      "pistas": [
        "Un resto de cero indica divisibilidad.",
        "Comprueba los múltiplos de 400 antes que los de 100."
      ],
      "ejemplo": "es_bisiesto(2000) → True"
    },
    {
      "id": "condiciones-3",
      "tema": "condiciones",
      "tipo": "crea",
      "dificultad": 2,
      "titulo": "Permiso para conducir",
      "enunciado": [
        "Lee edad y tiene_carnet de la lista datos. Imprime Puede conducir si tiene al menos 18 años y tiene carnet. En los demás casos imprime No puede conducir. Usa and y conserva la primera línea."
      ],
      "codigo": "datos = [18, True]",
      "solucion": "datos = [18, True]\nedad, tiene_carnet = datos\nif edad >= 18 and tiene_carnet:\n    print(\"Puede conducir\")\nelse:\n    print(\"No puede conducir\")",
      "salidaEsperada": "Puede conducir",
      "datos": [
        {
          "linea": "datos = [30, False]",
          "salida": "No puede conducir"
        },
        {
          "linea": "datos = [17, True]",
          "salida": "No puede conducir"
        },
        {
          "linea": "datos = [16, False]",
          "salida": "No puede conducir"
        }
      ],
      "pistas": [
        "Ambas condiciones deben cumplirse.",
        "Pon la edad mínima y el carnet a ambos lados de and."
      ],
      "requiere": [
        "and"
      ],
      "ejemplo": "18, True → Puede conducir"
    },
    {
      "id": "condiciones-4",
      "tema": "condiciones",
      "tipo": "ordena",
      "dificultad": 2,
      "titulo": "Clasifica la nota",
      "enunciado": [
        "Ordena el programa. Imprime Excelente desde 9, Aprobado desde 5 y Suspenso por debajo de 5. Ajusta la sangría de cada rama."
      ],
      "codigo": "nota = 7\nif nota >= 9:\n    print(\"Excelente\")\nelif nota >= 5:\n    print(\"Aprobado\")\nelse:\n    print(\"Suspenso\")",
      "solucion": "nota = 7\nif nota >= 9:\n    print(\"Excelente\")\nelif nota >= 5:\n    print(\"Aprobado\")\nelse:\n    print(\"Suspenso\")",
      "salidaEsperada": "Aprobado",
      "datos": [
        {
          "linea": "nota = 9",
          "salida": "Excelente"
        },
        {
          "linea": "nota = 4",
          "salida": "Suspenso"
        }
      ],
      "pistas": [
        "Comprueba la nota más alta primero.",
        "Solo van sangradas las llamadas a print."
      ],
      "ejemplo": "7 → Aprobado"
    },
    {
      "id": "condiciones-5",
      "tema": "condiciones",
      "tipo": "arregla",
      "dificultad": 1,
      "titulo": "Una comparación",
      "enunciado": [
        "Corrige la condición para que el programa muestre Acceso permitido si el PIN coincide."
      ],
      "codigo": "pin = 1234\nif pin = 1234:\n    print(\"Acceso permitido\")",
      "solucion": "pin = 1234\nif pin == 1234:\n    print(\"Acceso permitido\")",
      "salidaEsperada": "Acceso permitido",
      "pistas": [
        "El signo de asignación no compara dos valores.",
        "Usa == dentro del if."
      ],
      "ejemplo": "1234 → Acceso permitido"
    }
  ];
  if (typeof module !== 'undefined') module.exports = ejercicios;
  else (window.CR.Ejercicios ||= []).push(...ejercicios);
})();
