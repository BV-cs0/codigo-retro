(function (CR) {
'use strict';
const ejercicios = [
  {
    "id": "errores-1",
    "tema": "errores",
    "tipo": "disena",
    "dificultad": 1,
    "titulo": "Safe division",
    "enunciado": [
      "Design safe_divide(a, b). Use try and return a / b, or None if b is zero."
    ],
    "codigo": "",
    "solucion": "def safe_divide(a, b):\n    try:\n        return a / b\n    except ZeroDivisionError:\n        return None",
    "pruebas": [
      {
        "llamada": "safe_divide(8, 2)",
        "salida": "4.0",
        "codigo": "print(safe_divide(8, 2))",
        "tipo": "float"
      },
      {
        "llamada": "safe_divide(1, 0)",
        "salida": "None",
        "codigo": "print(safe_divide(1, 0))",
        "tipo": "NoneType"
      },
      {
        "llamada": "safe_divide(0, 4)",
        "salida": "0.0",
        "codigo": "print(safe_divide(0, 4))",
        "tipo": "float"
      },
      {
        "llamada": "safe_divide(3, -2)",
        "salida": "-1.5",
        "codigo": "print(safe_divide(3, -2))",
        "tipo": "float"
      }
    ],
    "pistas": [
      "Put the division inside try.",
      "Catch ZeroDivisionError."
    ],
    "requiere": [
      "try"
    ],
    "ejemplo": "safe_divide(1, 0) → None"
  },
  {
    "id": "errores-2",
    "tema": "errores",
    "tipo": "disena",
    "dificultad": 2,
    "titulo": "A valid age",
    "enunciado": [
      "Design read_age(text). Return the integer in text. If it is negative, raise ValueError(\"Negative age\"). Let int reject invalid text."
    ],
    "codigo": "",
    "solucion": "def read_age(text):\n    age = int(text)\n    if age < 0:\n        raise ValueError(\"Negative age\")\n    return age",
    "pruebas": [
      {
        "llamada": "read_age(\"25\")",
        "salida": "25",
        "codigo": "print(read_age(\"25\"))",
        "tipo": "int"
      },
      {
        "llamada": "read_age(\"0\")",
        "salida": "0",
        "codigo": "print(read_age(\"0\"))",
        "tipo": "int"
      },
      {
        "llamada": "read_age(\" 7 \")",
        "salida": "7",
        "codigo": "print(read_age(\" 7 \"))",
        "tipo": "int"
      },
      {
        "llamada": "read_age(\"-1\")",
        "salida": "Negative age",
        "codigo": "try:\n    read_age(\"-1\")\nexcept ValueError as e:\n    print(str(e))\nelse:\n    print(\"ValueError was not raised\")"
      },
      {
        "llamada": "read_age(\"no\")",
        "salida": "invalid literal for int() with base 10: 'no'",
        "codigo": "try:\n    read_age(\"no\")\nexcept ValueError as e:\n    print(str(e))\nelse:\n    print(\"ValueError was not raised\")"
      }
    ],
    "pistas": [
      "Convert the text before you compare.",
      "Use raise with the exact message."
    ],
    "ejemplo": "read_age(\"-1\") → ValueError(\"Negative age\")"
  },
  {
    "id": "errores-3",
    "tema": "errores",
    "tipo": "arregla",
    "dificultad": 2,
    "titulo": "An except that catches too much",
    "enunciado": [
      "Fix the variable name and catch only ValueError. Print the integer or Invalid amount. Keep the first line."
    ],
    "codigo": "amount = \"12\"\ntry:\n    print(int(amoun))\nexcept:\n    print(\"Invalid amount\")",
    "solucion": "amount = \"12\"\ntry:\n    print(int(amount))\nexcept ValueError:\n    print(\"Invalid amount\")",
    "salidaEsperada": "12",
    "datos": [
      {
        "linea": "amount = \"error\"",
        "salida": "Invalid amount"
      }
    ],
    "pistas": [
      "Check the name you pass to int.",
      "int raises ValueError when the text is invalid."
    ],
    "requiere": [
      "except-ValueError"
    ],
    "prohibe": [
      "except-general"
    ],
    "ejemplo": "\"12\" → 12. \"error\" → Invalid amount"
  },
  {
    "id": "errores-4",
    "tema": "errores",
    "tipo": "crea",
    "dificultad": 2,
    "titulo": "Add the valid numbers",
    "enunciado": [
      "Convert each item in strings to an integer and add the valid ones. Use try and skip items that raise ValueError. Keep the first line."
    ],
    "codigo": "strings = [\"4\", \"error\", \"-2\", \"7\"]",
    "solucion": "strings = [\"4\", \"error\", \"-2\", \"7\"]\ntotal = 0\nfor text in strings:\n    try:\n        total += int(text)\n    except ValueError:\n        pass\nprint(total)",
    "salidaEsperada": "9",
    "datos": [
      {
        "linea": "strings = [\"bad\", \"1.5\", \"\"]",
        "salida": "0"
      },
      {
        "linea": "strings = []",
        "salida": "0"
      }
    ],
    "pistas": [
      "Try to convert one item each time through the loop.",
      "If int fails, continue with the next string."
    ],
    "requiere": [
      "try"
    ],
    "ejemplo": "[\"4\", \"error\", \"-2\", \"7\"] → 9"
  }
];
if (typeof module !== 'undefined') module.exports = ejercicios;
else (CR.EjerciciosEn ||= []).push(...ejercicios);
})(globalThis.CR ||= {});
