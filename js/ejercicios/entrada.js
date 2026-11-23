(function () {
  'use strict';
  const ejercicios = [
    {
      "id": "entrada-1",
      "tema": "entrada",
      "tipo": "crea",
      "dificultad": 2,
      "titulo": "Calculadora",
      "enunciado": [
        "Lee dos números con float y después un operador (+, -, * o /). Imprime el resultado. Para una división por cero imprime No se puede dividir entre cero. Usa input() sin mensajes."
      ],
      "codigo": "",
      "solucion": "a = float(input())\nb = float(input())\nop = input()\nif op == \"+\":\n    print(a + b)\nelif op == \"-\":\n    print(a - b)\nelif op == \"*\":\n    print(a * b)\nelif b == 0:\n    print(\"No se puede dividir entre cero.\")\nelse:\n    print(a / b)",
      "casos": [
        {
          "entradas": [
            "2",
            "3",
            "+"
          ],
          "salida": "5.0"
        },
        {
          "entradas": [
            "2",
            "3",
            "-"
          ],
          "salida": "-1.0"
        },
        {
          "entradas": [
            "2",
            "3",
            "*"
          ],
          "salida": "6.0"
        },
        {
          "entradas": [
            "7",
            "2",
            "/"
          ],
          "salida": "3.5"
        },
        {
          "entradas": [
            "2",
            "0",
            "/"
          ],
          "salida": "No se puede dividir entre cero."
        }
      ],
      "pistas": [
        "Lee cada dato con una llamada distinta.",
        "Comprueba si el divisor es cero antes de dividir."
      ],
      "requiere": [
        "input"
      ],
      "ejemplo": "7, 2, / → 3.5"
    },
    {
      "id": "entrada-2",
      "tema": "entrada",
      "tipo": "crea",
      "dificultad": 3,
      "titulo": "Piedra, papel o tijera",
      "enunciado": [
        "Lee piedra, papel o tijera con input() sin mensaje. Elige la jugada rival con random.choice. Imprime Empate, Ganaste o Perdiste."
      ],
      "codigo": "",
      "solucion": "import random\njugador = input()\nrival = random.choice([\"piedra\", \"papel\", \"tijera\"])\nvence = {\"piedra\": \"tijera\", \"papel\": \"piedra\", \"tijera\": \"papel\"}\nif jugador == rival:\n    print(\"Empate\")\nelif vence[jugador] == rival:\n    print(\"Ganaste\")\nelse:\n    print(\"Perdiste\")",
      "casos": [
        {
          "entradas": [
            "piedra"
          ],
          "aleatorios": [
            "piedra"
          ],
          "salida": "Empate"
        },
        {
          "entradas": [
            "piedra"
          ],
          "aleatorios": [
            "papel"
          ],
          "salida": "Perdiste"
        },
        {
          "entradas": [
            "piedra"
          ],
          "aleatorios": [
            "tijera"
          ],
          "salida": "Ganaste"
        },
        {
          "entradas": [
            "papel"
          ],
          "aleatorios": [
            "piedra"
          ],
          "salida": "Ganaste"
        },
        {
          "entradas": [
            "papel"
          ],
          "aleatorios": [
            "papel"
          ],
          "salida": "Empate"
        },
        {
          "entradas": [
            "papel"
          ],
          "aleatorios": [
            "tijera"
          ],
          "salida": "Perdiste"
        },
        {
          "entradas": [
            "tijera"
          ],
          "aleatorios": [
            "piedra"
          ],
          "salida": "Perdiste"
        },
        {
          "entradas": [
            "tijera"
          ],
          "aleatorios": [
            "papel"
          ],
          "salida": "Ganaste"
        },
        {
          "entradas": [
            "tijera"
          ],
          "aleatorios": [
            "tijera"
          ],
          "salida": "Empate"
        }
      ],
      "pistas": [
        "Una jugada igual es empate.",
        "Un diccionario puede indicar a qué gana cada jugada."
      ],
      "requiere": [
        "input",
        "choice"
      ],
      "ejemplo": "piedra contra tijera → Ganaste"
    },
    {
      "id": "entrada-3",
      "tema": "entrada",
      "tipo": "disena",
      "dificultad": 1,
      "titulo": "La hipotenusa",
      "enunciado": [
        "Diseña hipotenusa(a, b) para catetos no negativos. Usa math.sqrt para devolver la raíz de la suma de sus cuadrados."
      ],
      "codigo": "",
      "solucion": "import math\ndef hipotenusa(a, b):\n    return math.sqrt(a * a + b * b)",
      "pruebas": [
        {
          "llamada": "hipotenusa(3, 4)",
          "salida": "5.0",
          "codigo": "print(hipotenusa(3, 4))",
          "tipo": "float"
        },
        {
          "llamada": "hipotenusa(0, 0)",
          "salida": "0.0",
          "codigo": "print(hipotenusa(0, 0))",
          "tipo": "float"
        },
        {
          "llamada": "hipotenusa(0, 8)",
          "salida": "8.0",
          "codigo": "print(hipotenusa(0, 8))",
          "tipo": "float"
        },
        {
          "llamada": "hipotenusa(5, 12)",
          "salida": "13.0",
          "codigo": "print(hipotenusa(5, 12))",
          "tipo": "float"
        }
      ],
      "pistas": [
        "Importa math.",
        "Eleva ambos catetos al cuadrado."
      ],
      "requiere": [
        "sqrt"
      ],
      "ejemplo": "hipotenusa(3, 4) → 5.0"
    },
    {
      "id": "entrada-4",
      "tema": "entrada",
      "tipo": "crea",
      "dificultad": 2,
      "titulo": "Media hasta fin",
      "enunciado": [
        "Lee números con input() sin mensajes hasta recibir fin. Imprime la media, o Sin datos si no hubo números."
      ],
      "codigo": "",
      "solucion": "total = 0\ncantidad = 0\ntexto = input()\nwhile texto != \"fin\":\n    total += float(texto)\n    cantidad += 1\n    texto = input()\nif cantidad:\n    print(total / cantidad)\nelse:\n    print(\"Sin datos\")",
      "casos": [
        {
          "entradas": [
            "2",
            "4",
            "fin"
          ],
          "salida": "3.0"
        },
        {
          "entradas": [
            "fin"
          ],
          "salida": "Sin datos"
        },
        {
          "entradas": [
            "-1.5",
            "0",
            "fin"
          ],
          "salida": "-0.75"
        },
        {
          "entradas": [
            "5",
            "fin"
          ],
          "salida": "5.0"
        }
      ],
      "pistas": [
        "No conviertas fin a número.",
        "Lleva la suma y la cantidad por separado."
      ],
      "requiere": [
        "input"
      ],
      "ejemplo": "2, 4, fin → 3.0"
    }
  ];
  if (typeof module !== 'undefined') module.exports = ejercicios;
  else (window.CR.Ejercicios ||= []).push(...ejercicios);
})();
