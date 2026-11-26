(function () {
  'use strict';
  const tema = {
    nombre: "Variables",
    frase: "Store values and use them in calculations.",
    necesita: "First Steps.",
    pasos: [
      {
        tipo: "explica",
        titulo: "Name a value",
        texto: [
          "A variable is a name for a value. `=` assigns the value on the right to the name on the left.",
          "Replace `Emma` with your name."
        ],
        codigo: "name = \"Emma\"\n" +
          "print(name)"
      },
      {
        tipo: "explica",
        titulo: "The latest value",
        texto: [
          "You can assign a new value to a variable. Use Step by step and look at the Variables panel.",
          "Add another assignment before the last `print()`."
        ],
        codigo: "points = 3\n" +
          "print(points)\n" +
          "points = 8\n" +
          "print(points)"
      },
      {
        tipo: "explica",
        titulo: "Operations",
        texto: [
          "`+`, `-`, and `*` add, subtract, and multiply. `/` returns a decimal number. `//` rounds down, `%` gives the remainder, and `**` raises a number to a power.",
          "Try `a = 8`."
        ],
        recuerda: "Division with / returns a float, even when the result is a whole number.",
        codigo: "a = 7\n" +
          "b = 2\n" +
          "print(a + b)\n" +
          "print(a - b)\n" +
          "print(a * b)\n" +
          "print(a / b)\n" +
          "print(a // b)\n" +
          "print(a % b)\n" +
          "print(a ** b)"
      },
      {
        tipo: "predice",
        titulo: "Update a number",
        texto: [
          "Python works out the right side of the assignment first."
        ],
        codigo: "x = 5\n" +
          "x = x + 1\n" +
          "print(x)",
        pregunta: "What happens when you run the code?",
        opciones: ["5","6","11"],
        correcta: 1,
        explicacion: "Python adds 1 to the old value and stores 6. Here, `x += 1` does the same thing."
      },
      {
        tipo: "explica",
        titulo: "Put values in a string",
        texto: [
          "An f-string starts with `f` before the quotes. Python works out the value inside the braces.",
          "Change `age` and run the code again."
        ],
        codigo: "age = 30\n" +
          "print(f\"I am {age} years old\")"
      },
      {
        tipo: "arregla",
        titulo: "A string and a number",
        texto: [
          "Fix the error to print `Age: 30` using `str()` or an f-string."
        ],
        codigo: "print(\"Age: \" + 30)",
        objetivo: "Join the string and the number 30.",
        salidaEsperada: "Age: 30",
        pistas: [
          "Use + with two strings to join them.",
          "Convert 30 with str(30) or write f\"Age: {30}\"."
        ],
        error: "TypeError",
        solucion: "print('Age: ' + str(30))"
      },
      {
        tipo: "predice",
        titulo: "Assign a value to another variable",
        texto: [
          "Notice when each name gets its value."
        ],
        codigo: "a = 3\n" +
          "b = a\n" +
          "a = 10\n" +
          "print(b)",
        pregunta: "What happens when you run the code?",
        opciones: ["10","13","3"],
        correcta: 2,
        explicacion: "When Python assigns `b`, the value of `a` is 3. After that, it assigns 10 only to `a`."
      },
      {
        tipo: "reto",
        titulo: "Total with VAT",
        texto: [
          "Add three prices of 10, 15, and 25 euros. Add 21% VAT and use an f-string to show `Total: 60.5 euros`."
        ],
        codigo: "a = 10\n" +
          "b = 15\n" +
          "c = 25\n" +
          "vat = 0.21",
        objetivo: "Calculate and show the price with VAT.",
        salidaEsperada: "Total: 60.5 euros",
        requiere: ["fstring"],
        pistas: [
          "Add the three prices and store the sum in a variable.",
          "Add subtotal * vat to subtotal. Put the total inside the braces."
        ],
        solucion: "a = 10\n" +
          "b = 15\n" +
          "c = 25\n" +
          "vat = 0.21\n" +
          "subtotal = a + b + c\n" +
          "total = subtotal + subtotal * vat\n" +
          "print(f'Total: {total} euros')"
      },
      {
        tipo: "resumen",
        titulo: "Variables cheat sheet",
        texto: [
          "Store results in variables so you can use them again."
        ],
        codigo: "",
        chuleta: [
          ["name = 'Emma'","Assigns a string."],
          ["x = 5","Assigns a number."],
          ["x += 1","Adds and stores the new value."],
          ["4 / 2","Division gives 2.0."],
          ["f'Total: {x}'","Puts a value in a string."]
        ]
      }
    ]
  };
  if (typeof module !== 'undefined') module.exports = tema;
  else (window.CR.TemasEn ||= []).push(tema);
})();
