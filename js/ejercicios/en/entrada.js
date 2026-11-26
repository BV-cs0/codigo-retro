(function (CR) {
'use strict';
const ejercicios = [
  {
    "id": "entrada-1",
    "tema": "entrada",
    "tipo": "crea",
    "dificultad": 2,
    "titulo": "Calculator",
    "enunciado": [
      "Read two numbers with float, then an operator (+, -, * or /). Print the result. If you divide by zero, print \"Cannot divide by zero.\" Use input() without prompts."
    ],
    "codigo": "",
    "solucion": "a = float(input())\nb = float(input())\nop = input()\nif op == \"+\":\n    print(a + b)\nelif op == \"-\":\n    print(a - b)\nelif op == \"*\":\n    print(a * b)\nelif b == 0:\n    print(\"Cannot divide by zero.\")\nelse:\n    print(a / b)",
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
        "salida": "Cannot divide by zero."
      }
    ],
    "pistas": [
      "Read each value with a separate call.",
      "Check if the second number is zero before dividing."
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
    "titulo": "Rock, paper, scissors",
    "enunciado": [
      "Read rock, paper, or scissors with input() without a prompt. Pick the other move with random.choice. Print Draw, You win, or You lose."
    ],
    "codigo": "",
    "solucion": "import random\nplayer = input()\nopponent = random.choice([\"rock\", \"paper\", \"scissors\"])\nbeats = {\"rock\": \"scissors\", \"paper\": \"rock\", \"scissors\": \"paper\"}\nif player == opponent:\n    print(\"Draw\")\nelif beats[player] == opponent:\n    print(\"You win\")\nelse:\n    print(\"You lose\")",
    "casos": [
      {
        "entradas": [
          "rock"
        ],
        "aleatorios": [
          "rock"
        ],
        "salida": "Draw"
      },
      {
        "entradas": [
          "rock"
        ],
        "aleatorios": [
          "paper"
        ],
        "salida": "You lose"
      },
      {
        "entradas": [
          "rock"
        ],
        "aleatorios": [
          "scissors"
        ],
        "salida": "You win"
      },
      {
        "entradas": [
          "paper"
        ],
        "aleatorios": [
          "rock"
        ],
        "salida": "You win"
      },
      {
        "entradas": [
          "paper"
        ],
        "aleatorios": [
          "paper"
        ],
        "salida": "Draw"
      },
      {
        "entradas": [
          "paper"
        ],
        "aleatorios": [
          "scissors"
        ],
        "salida": "You lose"
      },
      {
        "entradas": [
          "scissors"
        ],
        "aleatorios": [
          "rock"
        ],
        "salida": "You lose"
      },
      {
        "entradas": [
          "scissors"
        ],
        "aleatorios": [
          "paper"
        ],
        "salida": "You win"
      },
      {
        "entradas": [
          "scissors"
        ],
        "aleatorios": [
          "scissors"
        ],
        "salida": "Draw"
      }
    ],
    "pistas": [
      "If both moves match, it is a draw.",
      "A dictionary can show which move beats which."
    ],
    "requiere": [
      "input",
      "choice"
    ],
    "ejemplo": "rock against scissors → You win"
  },
  {
    "id": "entrada-3",
    "tema": "entrada",
    "tipo": "disena",
    "dificultad": 1,
    "titulo": "The hypotenuse",
    "enunciado": [
      "Design hypotenuse(a, b) for two sides of length zero or more that meet at a right angle. Use math.sqrt to return the square root of the sum of their squares."
    ],
    "codigo": "",
    "solucion": "import math\ndef hypotenuse(a, b):\n    return math.sqrt(a * a + b * b)",
    "pruebas": [
      {
        "llamada": "hypotenuse(3, 4)",
        "salida": "5.0",
        "codigo": "print(hypotenuse(3, 4))",
        "tipo": "float"
      },
      {
        "llamada": "hypotenuse(0, 0)",
        "salida": "0.0",
        "codigo": "print(hypotenuse(0, 0))",
        "tipo": "float"
      },
      {
        "llamada": "hypotenuse(0, 8)",
        "salida": "8.0",
        "codigo": "print(hypotenuse(0, 8))",
        "tipo": "float"
      },
      {
        "llamada": "hypotenuse(5, 12)",
        "salida": "13.0",
        "codigo": "print(hypotenuse(5, 12))",
        "tipo": "float"
      }
    ],
    "pistas": [
      "Import math.",
      "Square both sides before adding them."
    ],
    "requiere": [
      "sqrt"
    ],
    "ejemplo": "hypotenuse(3, 4) → 5.0"
  },
  {
    "id": "entrada-4",
    "tema": "entrada",
    "tipo": "crea",
    "dificultad": 2,
    "titulo": "Average until you enter end",
    "enunciado": [
      "Read numbers with input() without prompts until you get end. Print the average, or No data if there were no numbers."
    ],
    "codigo": "",
    "solucion": "total = 0\namount = 0\ntext = input()\nwhile text != \"end\":\n    total += float(text)\n    amount += 1\n    text = input()\nif amount:\n    print(total / amount)\nelse:\n    print(\"No data\")",
    "casos": [
      {
        "entradas": [
          "2",
          "4",
          "end"
        ],
        "salida": "3.0"
      },
      {
        "entradas": [
          "end"
        ],
        "salida": "No data"
      },
      {
        "entradas": [
          "-1.5",
          "0",
          "end"
        ],
        "salida": "-0.75"
      },
      {
        "entradas": [
          "5",
          "end"
        ],
        "salida": "5.0"
      }
    ],
    "pistas": [
      "Skip the number conversion for end.",
      "Keep the total and the count in separate variables."
    ],
    "requiere": [
      "input"
    ],
    "ejemplo": "2, 4, end → 3.0"
  }
];
if (typeof module !== 'undefined') module.exports = ejercicios;
else (CR.EjerciciosEn ||= []).push(...ejercicios);
})(globalThis.CR ||= {});
