(function () {
  'use strict';
  const tema = {
    nombre: "First Steps",
    frase: "Write instructions and read the console.",
    necesita: "No earlier topics.",
    pasos: [
      {
        tipo: "explica",
        titulo: "Your first instruction",
        texto: [
          "An instruction tells Python to do something. `print()` writes to the console, the panel on the right.",
          "Change the greeting and run the code again."
        ],
        codigo: "print(\"Hello, world\")"
      },
      {
        tipo: "explica",
        titulo: "Text or a calculation",
        texto: [
          "Quotes mark the start and end of a string. Without quotes, Python adds the numbers.",
          "Change 5 to 9 in both instructions."
        ],
        recuerda: "Quotes mark a string. Python calculates the result of operations between numbers.",
        codigo: "print(\"5 + 3\")\n" +
          "print(5 + 3)"
      },
      {
        tipo: "predice",
        titulo: "Repeating a string",
        texto: [
          "The `2` is in quotes."
        ],
        codigo: "print(\"2\" * 3)",
        pregunta: "What happens when you run the code?",
        opciones: ["6","222","An error"],
        correcta: 1,
        explicacion: "Multiplying a string by an integer repeats the string."
      },
      {
        tipo: "explica",
        titulo: "From top to bottom",
        texto: [
          "Python runs instructions in order. `print()` puts spaces between values.",
          "Swap the two instructions."
        ],
        codigo: "print('Start')\n" +
          "print('Total:', 5 + 3)"
      },
      {
        tipo: "explica",
        titulo: "Comments",
        texto: [
          "A `#` outside quotes starts a comment that lasts to the end of the line.",
          "Change the comment and check the output."
        ],
        codigo: "# Welcome greeting\n" +
          "print('Hello')  # Console greeting"
      },
      {
        tipo: "arregla",
        titulo: "A missing quote",
        texto: [
          "Run the example and read the error. Fix the code so it shows `Hello`."
        ],
        codigo: "print(\"Hello)",
        objetivo: "Print Hello.",
        salidaEsperada: "Hello",
        pistas: [
          "The string starts with a double quote.",
          "Close it with another double quote before the parenthesis."
        ],
        error: "SyntaxError",
        solucion: "print(\"Hello\")"
      },
      {
        tipo: "reto",
        titulo: "A name card",
        texto: [
          "Print these three exact lines in order: `Lucy`, `Design`, and `Madrid`."
        ],
        codigo: "# Write your card here",
        objetivo: "Print a three-line card.",
        salidaEsperada: "Lucy\nDesign\nMadrid",
        pistas: [
          "Use one call to print() per line.",
          "Put Lucy, Design, and Madrid in quotes. Copy the spelling from the instructions."
        ],
        solucion: "print('Lucy')\n" +
          "print('Design')\n" +
          "print('Madrid')"
      },
      {
        tipo: "resumen",
        titulo: "First Steps cheat sheet",
        texto: [
          "You can now write instructions, show results, and leave notes in your code."
        ],
        codigo: "",
        chuleta: [
          ["print('Hello')","Shows a string."],
          ["print(5 + 3)","Calculates and shows the result."],
          ["print('5 + 3')","Shows the text as written."],
          ["print('Total:', 8)","Puts a space between values."],
          ["# Note","Python ignores the comment."]
        ]
      }
    ]
  };
  if (typeof module !== 'undefined') module.exports = tema;
  else (window.CR.TemasEn ||= []).push(tema);
})();
