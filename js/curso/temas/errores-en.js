(function () {
  'use strict';
  const tema = {
    nombre: "Errors",
    frase: "Read, catch, and raise exceptions.",
    necesita: "Functions, Strings",
    pasos: [
      {
        tipo: "explica",
        titulo: "Read the message",
        texto: [
          "An error that you do not catch stops the program. The console shows the type, the line, and the original message. Change \"hello\" to \"12\"."
        ],
        codigo: "print(int(\"hello\"))\n" +
          "print(\"End\")",
        error: "ValueError"
      },
      {
        tipo: "explica",
        titulo: "Catch an error",
        texto: [
          "`try` runs code that might fail. `except ValueError` handles a bad value so the program can continue. Try \"15\"."
        ],
        codigo: "try:\n" +
          "    print(int(\"hello\"))\n" +
          "except ValueError:\n" +
          "    print(\"Invalid number\")\n" +
          "print(\"End\")"
      },
      {
        tipo: "predice",
        titulo: "The line Python skips",
        texto: [
          "Follow the order of the instructions when the conversion fails."
        ],
        codigo: "try:\n" +
          "    int(\"x\")\n" +
          "    print(\"Inside\")\n" +
          "except ValueError:\n" +
          "    print(\"Error\")\n" +
          "print(\"End\")",
        opciones: ["Error\nEnd","Inside\nError\nEnd","Error"],
        correcta: 0,
        pregunta: "What will you see in the console?",
        explicacion: "The error stops the try block. After except, the rest of the program runs."
      },
      {
        tipo: "explica",
        titulo: "Different types of error",
        texto: [
          "Each `except` can handle a different error. Use `as e` to print its message. Change \"0\" to \"x\" and see which branch runs."
        ],
        codigo: "try:\n" +
          "    print(10 / int(\"0\"))\n" +
          "except ValueError as e:\n" +
          "    print(e)\n" +
          "except ZeroDivisionError as e:\n" +
          "    print(e)"
      },
      {
        tipo: "explica",
        titulo: "When it works and when it ends",
        texto: [
          "`else` runs if the try block ends without an error. `finally` always runs. Change \"7\" to \"x\" and compare."
        ],
        codigo: "try:\n" +
          "    number = int(\"7\")\n" +
          "except ValueError:\n" +
          "    print(\"Invalid number\")\n" +
          "else:\n" +
          "    print(number)\n" +
          "finally:\n" +
          "    print(\"End\")"
      },
      {
        tipo: "explica",
        titulo: "Raise an exception",
        texto: [
          "Use `raise` to signal that your function rejects a value. Catch the error where you call the function, then try a positive age."
        ],
        codigo: "def validate(age):\n" +
          "    if age < 0:\n" +
          "        raise ValueError(\"Age cannot be negative\")\n" +
          "    return age\n" +
          "try:\n" +
          "    print(validate(-1))\n" +
          "except ValueError as e:\n" +
          "    print(e)"
      },
      {
        tipo: "predice",
        titulo: "A hidden error",
        texto: [
          "Look closely at the spelling of the variable name."
        ],
        codigo: "number = 5\n" +
          "try:\n" +
          "    print(numbr)\n" +
          "except:\n" +
          "    print(\"Invalid number\")",
        opciones: ["Invalid number","5","NameError"],
        correcta: 0,
        pregunta: "What will you see in the console?",
        explicacion: "An except without a type hides the typo in numbr. Catch only the error you expect, such as ValueError."
      },
      {
        tipo: "reto",
        titulo: "Add the valid integers",
        texto: [
          "Write `to_number(string)` to return an integer or None if the conversion fails. Add only the valid values."
        ],
        objetivo: "Write `to_number(string)` to return an integer or None if the conversion fails. Add only the valid values.",
        codigo: "def to_number(string):\n" +
          "    pass\n" +
          "\n" +
          "data = [\"4\", \"x\", \"10\", \"3.5\"]\n" +
          "print(0)",
        solucion: "def to_number(string):\n" +
          "    try:\n" +
          "        return int(string)\n" +
          "    except ValueError:\n" +
          "        return None\n" +
          "\n" +
          "total = 0\n" +
          "for string in [\"4\", \"x\", \"10\", \"3.5\"]:\n" +
          "    number = to_number(string)\n" +
          "    if number != None:\n" +
          "        total += number\n" +
          "print(total)",
        pistas: [
          "Put return int(string) in the try block.",
          "Return None in the except block and skip that value when adding."
        ],
        etiqueta: "Combination: errors + functions + loops",
        requiere: ["try","def"],
        salidaEsperada: "14\n",
        pruebas: [
          {"codigo":"print(to_number(\"-3\"), to_number(\"none\"))","salida":"-3 None"}
        ]
      },
      {
        tipo: "resumen",
        titulo: "Errors cheat sheet",
        texto: [
          "Catch an error when you know how to continue. Read the message to find out what happened."
        ],
        codigo: "",
        chuleta: [
          ["try:","Starts the block that may fail."],
          ["except ValueError:","Handles a bad value."],
          ["except ZeroDivisionError as e:","Stores the error in e so you can read its message."],
          ["else:","Runs if try ends without errors."],
          ["finally:","Runs when you leave the block."],
          ["raise ValueError(\"Invalid age\")","Raises your own exception."]
        ]
      }
    ]
  };
  if (typeof module !== 'undefined') module.exports = tema;
  else (window.CR.TemasEn ||= []).push(tema);
})();
