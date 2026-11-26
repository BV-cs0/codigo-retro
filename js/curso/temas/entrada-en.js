(function () {
  'use strict';
  const tema = {
    nombre: "input() and Modules",
    frase: "Ask for data and use Python tools.",
    necesita: "Conditions, Loops, Errors",
    pasos: [
      {
        tipo: "explica",
        titulo: "Type in the console",
        texto: [
          "`input()` shows the question and waits until you press Enter. Run the code and try two different names."
        ],
        codigo: "name = input(\"What is your name? \")\n" +
          "print(f\"Hello, {name}\")",
        entradas: ["Emma"]
      },
      {
        tipo: "predice",
        titulo: "Number or string?",
        texto: [
          "The program receives 30 when it asks for input. What happens when you add 1?"
        ],
        codigo: "age = input(\"Age: \")\n" +
          "print(age + 1)",
        opciones: ["TypeError","31","301"],
        correcta: 0,
        pregunta: "What will you see in the console?",
        explicacion: "input() always returns a string. To add a number, first convert the input with int().",
        entradas: ["30"],
        error: "TypeError"
      },
      {
        tipo: "explica",
        titulo: "Convert as you read",
        texto: [
          "`int(input(...))` converts the input to an integer. Type letters to see the ValueError from topic 9."
        ],
        codigo: "age = int(input(\"Age: \"))\n" +
          "print(age + 1)",
        entradas: ["30"]
      },
      {
        tipo: "explica",
        titulo: "Tools from math",
        texto: [
          "`import math` loads the module. Use `math.` to reach its functions and pi. Change the numbers and compare how they round."
        ],
        codigo: "import math\n" +
          "print(math.sqrt(16))\n" +
          "print(math.pi)\n" +
          "print(math.floor(2.7))\n" +
          "print(math.ceil(2.1))"
      },
      {
        tipo: "explica",
        titulo: "A little randomness",
        texto: [
          "`randint(1, 6)` includes both ends of the range, and `choice()` picks one item. Run the code a few times and see how the results change."
        ],
        codigo: "import random\n" +
          "print(random.randint(1, 6))\n" +
          "print(random.choice([\"rock\", \"paper\", \"scissors\"]))",
        azar: true
      },
      {
        tipo: "explica",
        titulo: "Import a function",
        texto: [
          "`from random import randint` imports only randint. You can then call it directly. Change the ends of the range."
        ],
        codigo: "from random import randint\n" +
          "print(randint(1, 6))",
        azar: true
      },
      {
        tipo: "reto",
        titulo: "Are you an adult?",
        texto: [
          "Ask the age with \"How old are you? \" and answer \"You are an adult.\" or \"You are under 18.\" Use Check to try all three ages."
        ],
        objetivo: "Ask the age with \"How old are you? \" and answer \"You are an adult.\" or \"You are under 18.\" Use Check to try all three ages.",
        codigo: "age = int(input(\"How old are you? \"))\n",
        solucion: "age = int(input(\"How old are you? \"))\n" +
          "if age >= 18:\n" +
          "    print(\"You are an adult.\")\n" +
          "else:\n" +
          "    print(\"You are under 18.\")",
        pistas: [
          "Use int() to convert the input to an integer.",
          "Use >= to include 18."
        ],
        etiqueta: "Combination: input + conditions",
        requiere: ["input","if"],
        casos: [
          {"entradas":["20"],"salida":"How old are you? You are an adult.\n"},
          {"entradas":["15"],"salida":"How old are you? You are under 18.\n"},
          {"entradas":["18"],"salida":"How old are you? You are an adult.\n"}
        ]
      },
      {
        tipo: "reto",
        titulo: "Five dice rolls",
        texto: [
          "Roll a die five times with `randint(1, 6)`. Print each roll on its own line, then print \"Total: \" followed by the sum."
        ],
        objetivo: "Roll a die five times with `randint(1, 6)`. Print each roll on its own line, then print \"Total: \" followed by the sum.",
        codigo: "from random import randint\n" +
          "print(randint(1, 6))",
        solucion: "from random import randint\n" +
          "total = 0\n" +
          "for i in range(5):\n" +
          "    roll = randint(1, 6)\n" +
          "    print(roll)\n" +
          "    total += roll\n" +
          "print(f\"Total: {total}\")",
        pistas: [
          "Use for with range(5).",
          "Store each roll so you can print and add it with a single roll."
        ],
        etiqueta: "Combination: random + loops",
        requiere: ["import","for"],
        casos: [
          {"aleatorios":[1,6,3,2,5],"salida":"1\n6\n3\n2\n5\nTotal: 17\n"},
          {"aleatorios":[6,6,1,4,1],"salida":"6\n6\n1\n4\n1\nTotal: 18\n"}
        ]
      },
      {
        tipo: "resumen",
        titulo: "Input and modules cheat sheet",
        texto: [
          "You can now ask the player for data and import functions from a module."
        ],
        codigo: "",
        chuleta: [
          ["input(\"Name: \")","Shows a question and reads a string."],
          ["int(input(\"Age: \"))","Reads the input and converts it to an integer."],
          ["import math","Loads the math module."],
          ["math.sqrt(16)","Finds the square root and returns 4.0."],
          ["from random import randint","Imports randint directly."],
          ["randint(1, 6)","Picks an integer from 1 to 6."]
        ]
      }
    ]
  };
  if (typeof module !== 'undefined') module.exports = tema;
  else (window.CR.TemasEn ||= []).push(tema);
})();
