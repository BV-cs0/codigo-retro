(function () {
  'use strict';
  const tema = {
    nombre: "Loops",
    frase: "Repeat instructions and collect results.",
    necesita: "Variables and Conditions.",
    pasos: [
      {
        tipo: "explica",
        titulo: "Repeat with for",
        texto: [
          "`range(5)` gives five values, from 0 to 4. `for` stores the value for each round in `i`.",
          "Change 5 to 3."
        ],
        codigo: "for i in range(5):\n" +
          "    print(i)"
      },
      {
        tipo: "explica",
        titulo: "Start, stop, and step",
        texto: [
          "`range(1, 6)` starts at 1 and stops before 6. The third argument is the size of each step.",
          "Change the step from 2 to 3."
        ],
        codigo: "for i in range(1, 6):\n" +
          "    print(i)\n" +
          "print('Steps')\n" +
          "for i in range(0, 10, 2):\n" +
          "    print(i)"
      },
      {
        tipo: "predice",
        titulo: "Count the rounds",
        texto: [
          "`range()` leaves out the stop value."
        ],
        codigo: "for i in range(2, 5):\n" +
          "    print('Round')",
        pregunta: "What happens when you run the code?",
        opciones: ["Round\nRound","Round\nRound\nRound","Round\nRound\nRound\nRound"],
        correcta: 1,
        explicacion: "The loop gets 2, 3, and 4. It prints Round once for each value."
      },
      {
        tipo: "explica",
        titulo: "Add on each round",
        texto: [
          "Start with `total = 0` and add each value to `total`. Use Step by step to watch the total in Variables.",
          "Change the limit to add the numbers from 1 to 5."
        ],
        codigo: "total = 0\n" +
          "for i in range(1, 11):\n" +
          "    total += i\n" +
          "print(total)"
      },
      {
        tipo: "explica",
        titulo: "Repeat while a condition is true",
        texto: [
          "`while` checks its condition on each round. Increase the counter so it reaches the limit.",
          "Try starting the counter at 2."
        ],
        recuerda: "If the condition uses a counter, update it inside the loop.",
        codigo: "counter = 0\n" +
          "while counter < 3:\n" +
          "    print(counter)\n" +
          "    counter += 1"
      },
      {
        tipo: "predice",
        titulo: "A loop that never ends",
        texto: [
          "The body contains `pass`, an instruction that does nothing."
        ],
        codigo: "counter = 0\n" +
          "while counter < 3:\n" +
          "    pass",
        pregunta: "What happens when you run the code?",
        opciones: ["The console prints 3","It ends after three rounds","The course stops the loop"],
        correcta: 2,
        explicacion: "The counter never changes. The course stops the code when it runs too many instructions. Add `counter += 1` inside the block.",
        error: "RuntimeError"
      },
      {
        tipo: "explica",
        titulo: "Leave early with break",
        texto: [
          "`break` ends the loop as soon as it runs.",
          "Change the stop value to 2."
        ],
        codigo: "for i in range(8):\n" +
          "    if i == 4:\n" +
          "        break\n" +
          "    print(i)"
      },
      {
        tipo: "reto",
        titulo: "Even numbers",
        texto: [
          "Print the even numbers from 1 to 20, one per line. Use `%` to check whether the remainder after division by 2 is zero."
        ],
        etiqueta: "Combination: loops + conditions",
        codigo: "for i in range(1, 21):\n" +
          "    pass",
        objetivo: "Print the ten even numbers from 1 to 20.",
        salidaEsperada: "2\n4\n6\n8\n10\n12\n14\n16\n18\n20",
        requiere: ["for","if"],
        pistas: [
          "Calculate i % 2 on each round.",
          "Print i inside an if block that checks whether the remainder is 0."
        ],
        solucion: "for i in range(1, 21):\n" +
          "    if i % 2 == 0:\n" +
          "        print(i)"
      },
      {
        tipo: "reto",
        titulo: "The 7 times table",
        texto: [
          "Print the 7 times table from 1 to 10 in the format `7 x 1 = 7`. Use a loop and an f-string."
        ],
        etiqueta: "Combination: loops + f-strings",
        codigo: "for i in range(1, 11):\n" +
          "    pass",
        objetivo: "Print the ten results in the 7 times table.",
        salidaEsperada: "7 x 1 = 7\n7 x 2 = 14\n7 x 3 = 21\n7 x 4 = 28\n7 x 5 = 35\n7 x 6 = 42\n7 x 7 = 49\n7 x 8 = 56\n7 x 9 = 63\n7 x 10 = 70",
        requiere: ["for","fstring"],
        pistas: [
          "The loop already gives you the numbers from 1 to 10.",
          "Use {i} and {7 * i} in an f-string that matches the example."
        ],
        solucion: "for i in range(1, 11):\n" +
          "    print(f'7 x {i} = {7 * i}')"
      },
      {
        tipo: "mundo",
        titulo: "Water Bina's crops",
        texto: [
          "Bina visits four plots with seeds. Use `dry_soil()` before `water()`, and move on each round until you reach the market."
        ],
        codigo: "for i in range(4):\n" +
          "    pass",
        objetivo: "Water the dry plots and reach the market.",
        requiere: ["for","if"],
        pistas: [
          "Walk past the wet plot.",
          "Inside the for loop, put water() in the if block. Put move() at the same indentation as if."
        ],
        mundo: {"demo":"granja","mapa":{"tierra":"shss"}},
        solucion: "for i in range(4):\n" +
          "    if dry_soil():\n" +
          "        water()\n" +
          "    move()"
      },
      {
        tipo: "resumen",
        titulo: "Loops cheat sheet",
        texto: [
          "Use `for` to go through values and `while` to repeat as long as a condition is true."
        ],
        codigo: "",
        chuleta: [
          ["for i in range(5):","Goes from 0 to 4."],
          ["range(1, 6)","Starts at 1 and ends at 5."],
          ["range(0, 10, 2)","Moves in steps of two."],
          ["total += i","Updates the running total."],
          ["while counter < 3:","Repeats while the condition is true."],
          ["break","Leaves the current loop."]
        ]
      }
    ]
  };
  if (typeof module !== 'undefined') module.exports = tema;
  else (window.CR.TemasEn ||= []).push(tema);
})();
