(function () {
  'use strict';
  const tema = {
    nombre: "Conditions",
    frase: "Decide which instructions to run.",
    necesita: "Variables.",
    pasos: [
      {
        tipo: "explica",
        titulo: "A block with if",
        texto: [
          "`if` runs its block when the condition is true. The colon starts the block, and indentation groups its instructions.",
          "Try `age = 17`."
        ],
        recuerda: "The colon starts the block. Use the same indentation throughout the block.",
        codigo: "age = 18\n" +
          "if age >= 18:\n" +
          "    print('Access allowed')"
      },
      {
        tipo: "explica",
        titulo: "The other case",
        texto: [
          "`else` runs its block when the `if` condition is false.",
          "Change the age to 21."
        ],
        codigo: "age = 16\n" +
          "if age >= 18:\n" +
          "    print('Access allowed')\n" +
          "else:\n" +
          "    print('Access denied')"
      },
      {
        tipo: "explica",
        titulo: "More than two cases",
        texto: [
          "`elif` tests another condition if the earlier ones are false. Python runs the first block with a true condition.",
          "Try the grades 8, 5, and 4."
        ],
        codigo: "grade = 6\n" +
          "if grade >= 7:\n" +
          "    print('good')\n" +
          "elif grade >= 5:\n" +
          "    print('pass')\n" +
          "else:\n" +
          "    print('fail')"
      },
      {
        tipo: "predice",
        titulo: "The order of branches",
        texto: [
          "Both comparisons are true when `n` is 12."
        ],
        codigo: "n = 12\n" +
          "if n > 5:\n" +
          "    print('Greater than 5')\n" +
          "elif n > 10:\n" +
          "    print('Greater than 10')",
        pregunta: "What happens when you run the code?",
        opciones: ["Greater than 10","Greater than 5","Greater than 5\nGreater than 10"],
        correcta: 1,
        explicacion: "The first condition is true, so Python skips the other branches. Put the more specific test first to tell the two cases apart."
      },
      {
        tipo: "explica",
        titulo: "Assign and compare",
        texto: [
          "`=` assigns a value. `==` checks if values are equal, and `!=` checks if they differ. `<`, `>`, `<=`, and `>=` compare their order.",
          "Change `x` to 5 and compare the two lines of output."
        ],
        codigo: "x = 4\n" +
          "print(x == 4, x != 4)\n" +
          "print(x < 5, x > 5, x <= 4, x >= 4)"
      },
      {
        tipo: "explica",
        titulo: "Combine conditions",
        texto: [
          "`and` needs both conditions to be true. `or` needs at least one. `not` reverses the result.",
          "Change `b` to `True` and see which row changes."
        ],
        codigo: "a = True\n" +
          "b = False\n" +
          "print('Operation | Result')\n" +
          "print('a and b   |', a and b)\n" +
          "print('a or b    |', a or b)\n" +
          "print('not a     |', not a)"
      },
      {
        tipo: "arregla",
        titulo: "Start a block",
        texto: [
          "Run the code and fix the first line of the block so the code prints `Entrance open`."
        ],
        codigo: "open_now = True\n" +
          "if open_now\n" +
          "    print('Entrance open')",
        objetivo: "Fix the if line.",
        salidaEsperada: "Entrance open",
        requiere: ["if"],
        pistas: [
          "The if line is missing a sign at the end.",
          "Put a colon after open_now and keep print() indented."
        ],
        error: "SyntaxError",
        solucion: "open_now = True\n" +
          "if open_now:\n" +
          "    print('Entrance open')"
      },
      {
        tipo: "reto",
        titulo: "Advice for the temperature",
        texto: [
          "At 30 degrees or more, print `Find some shade`. From 15 to 29, print `Go for a walk`. Below 15, print `Put on a jacket`. Use `elif`."
        ],
        etiqueta: "Combination: conditions + variables",
        codigo: "temperature = 22\n" +
          "# Write the three branches",
        objetivo: "Show the right advice for the temperature.",
        salidaEsperada: "Go for a walk",
        requiere: ["if","elif"],
        pistas: [
          "Start with the case for 30 degrees or more.",
          "Then test temperature >= 15 with elif. Use else for the last case."
        ],
        solucion: "temperature = 22\n" +
          "if temperature >= 30:\n" +
          "    print('Find some shade')\n" +
          "elif temperature >= 15:\n" +
          "    print('Go for a walk')\n" +
          "else:\n" +
          "    print('Put on a jacket')"
      },
      {
        tipo: "mundo",
        titulo: "Rocks in the tunnel",
        texto: [
          "Pico has three squares to go before reaching the crystal. Before each `move()`, check `soft_rock_ahead()` and use `dig()` if needed. You can repeat the block for each square."
        ],
        codigo: "# Check the path and move",
        objetivo: "Guide Pico to the crystal.",
        requiere: ["if"],
        pistas: [
          "Check the square ahead before each move.",
          "Put move() outside the if block. Pico must also move when the path is clear."
        ],
        mundo: {"demo":"robot","mapa":{"trazo":"EEE","inicio":[1,3],"objetos":{"2,3":"r","3,3":"r"}}},
        solucion: "if soft_rock_ahead():\n" +
          "    dig()\n" +
          "move()\n" +
          "if soft_rock_ahead():\n" +
          "    dig()\n" +
          "move()\n" +
          "if soft_rock_ahead():\n" +
          "    dig()\n" +
          "move()"
      },
      {
        tipo: "resumen",
        titulo: "Conditions cheat sheet",
        texto: [
          "Order the branches so each case gets the right result."
        ],
        codigo: "",
        chuleta: [
          ["if age >= 18:","Starts a block with a condition."],
          ["elif age >= 16:","Tests another condition if the earlier one is false."],
          ["else:","Covers the other cases."],
          ["x == 3","Compares two values."],
          ["x > 0 and x < 10","Needs both comparisons to be true."],
          ["not finished","Reverses the Boolean value."]
        ]
      }
    ]
  };
  if (typeof module !== 'undefined') module.exports = tema;
  else (window.CR.TemasEn ||= []).push(tema);
})();
