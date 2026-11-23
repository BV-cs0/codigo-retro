(function () {
  'use strict';
  const ejercicios = [
    {
      "id": "errores-1",
      "tema": "errores",
      "tipo": "disena",
      "dificultad": 1,
      "titulo": "División segura",
      "enunciado": [
        "Diseña dividir_seguro(a, b). Usa try y devuelve a / b o None si b es cero."
      ],
      "codigo": "",
      "solucion": "def dividir_seguro(a, b):\n    try:\n        return a / b\n    except ZeroDivisionError:\n        return None",
      "pruebas": [
        {
          "llamada": "dividir_seguro(8, 2)",
          "salida": "4.0",
          "codigo": "print(dividir_seguro(8, 2))",
          "tipo": "float"
        },
        {
          "llamada": "dividir_seguro(1, 0)",
          "salida": "None",
          "codigo": "print(dividir_seguro(1, 0))",
          "tipo": "NoneType"
        },
        {
          "llamada": "dividir_seguro(0, 4)",
          "salida": "0.0",
          "codigo": "print(dividir_seguro(0, 4))",
          "tipo": "float"
        },
        {
          "llamada": "dividir_seguro(3, -2)",
          "salida": "-1.5",
          "codigo": "print(dividir_seguro(3, -2))",
          "tipo": "float"
        }
      ],
      "pistas": [
        "Pon la división en try.",
        "Captura ZeroDivisionError."
      ],
      "requiere": [
        "try"
      ],
      "ejemplo": "dividir_seguro(1, 0) → None"
    },
    {
      "id": "errores-2",
      "tema": "errores",
      "tipo": "disena",
      "dificultad": 2,
      "titulo": "Edad válida",
      "enunciado": [
        "Diseña leer_edad(texto). Devuelve el entero correspondiente. Si es negativo, lanza ValueError(\"Edad negativa\"). Deja que int rechace textos inválidos."
      ],
      "codigo": "",
      "solucion": "def leer_edad(texto):\n    edad = int(texto)\n    if edad < 0:\n        raise ValueError(\"Edad negativa\")\n    return edad",
      "pruebas": [
        {
          "llamada": "leer_edad(\"25\")",
          "salida": "25",
          "codigo": "print(leer_edad(\"25\"))",
          "tipo": "int"
        },
        {
          "llamada": "leer_edad(\"0\")",
          "salida": "0",
          "codigo": "print(leer_edad(\"0\"))",
          "tipo": "int"
        },
        {
          "llamada": "leer_edad(\" 7 \")",
          "salida": "7",
          "codigo": "print(leer_edad(\" 7 \"))",
          "tipo": "int"
        },
        {
          "llamada": "leer_edad(\"-1\")",
          "salida": "Edad negativa",
          "codigo": "try:\n    leer_edad(\"-1\")\nexcept ValueError as e:\n    print(str(e))\nelse:\n    print(\"No se lanzó ValueError\")"
        },
        {
          "llamada": "leer_edad(\"no\")",
          "salida": "invalid literal for int() with base 10: 'no'",
          "codigo": "try:\n    leer_edad(\"no\")\nexcept ValueError as e:\n    print(str(e))\nelse:\n    print(\"No se lanzó ValueError\")"
        }
      ],
      "pistas": [
        "Convierte antes de comparar.",
        "Usa raise con el mensaje exacto."
      ],
      "ejemplo": "leer_edad(\"-1\") → ValueError(\"Edad negativa\")"
    },
    {
      "id": "errores-3",
      "tema": "errores",
      "tipo": "arregla",
      "dificultad": 2,
      "titulo": "Un except demasiado amplio",
      "enunciado": [
        "Corrige el nombre de la variable y captura solo ValueError. Imprime el entero o Cantidad inválida. Conserva la primera línea."
      ],
      "codigo": "cantidad = \"12\"\ntry:\n    print(int(cantida))\nexcept:\n    print(\"Cantidad inválida\")",
      "solucion": "cantidad = \"12\"\ntry:\n    print(int(cantidad))\nexcept ValueError:\n    print(\"Cantidad inválida\")",
      "salidaEsperada": "12",
      "datos": [
        {
          "linea": "cantidad = \"error\"",
          "salida": "Cantidad inválida"
        }
      ],
      "pistas": [
        "Revisa el nombre que pasas a int.",
        "int lanza ValueError con texto inválido."
      ],
      "requiere": [
        "except-ValueError"
      ],
      "prohibe": [
        "except-general"
      ],
      "ejemplo": "\"12\" → 12. \"error\" → Cantidad inválida"
    },
    {
      "id": "errores-4",
      "tema": "errores",
      "tipo": "crea",
      "dificultad": 2,
      "titulo": "Suma tolerante",
      "enunciado": [
        "Convierte cada elemento de textos a entero y suma los válidos. Usa try e ignora los que produzcan ValueError. Conserva la primera línea."
      ],
      "codigo": "textos = [\"4\", \"error\", \"-2\", \"7\"]",
      "solucion": "textos = [\"4\", \"error\", \"-2\", \"7\"]\ntotal = 0\nfor texto in textos:\n    try:\n        total += int(texto)\n    except ValueError:\n        pass\nprint(total)",
      "salidaEsperada": "9",
      "datos": [
        {
          "linea": "textos = [\"mal\", \"1.5\", \"\"]",
          "salida": "0"
        },
        {
          "linea": "textos = []",
          "salida": "0"
        }
      ],
      "pistas": [
        "Intenta la conversión en cada vuelta.",
        "Si int falla, continúa con el siguiente texto."
      ],
      "requiere": [
        "try"
      ],
      "ejemplo": "[\"4\", \"error\", \"-2\", \"7\"] → 9"
    }
  ];
  if (typeof module !== 'undefined') module.exports = ejercicios;
  else (window.CR.Ejercicios ||= []).push(...ejercicios);
})();
