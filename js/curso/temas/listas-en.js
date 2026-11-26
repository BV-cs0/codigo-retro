(function () {
  'use strict';
  const tema = {
    nombre: "Lists",
    frase: "Group values and go through them in order.",
    necesita: "Variables, Conditions, and Loops.",
    pasos: [
      {
        tipo: "explica",
        titulo: "Put values together",
        texto: [
          "A list keeps several values in order. Use square brackets and separate items with commas.",
          "Replace `kiwi` with another fruit."
        ],
        codigo: "fruits = [\"pear\", \"grape\", \"kiwi\"]\n" +
          "print(fruits)"
      },
      {
        tipo: "explica",
        titulo: "First and last positions",
        texto: [
          "Positions start at 0. Use `-1` to count from the end.",
          "Try positions `1` and `-2`."
        ],
        recuerda: "In a list of three items, the indexes from the start are 0, 1, and 2.",
        codigo: "fruits = ['pear', 'grape', 'kiwi']\n" +
          "print(fruits[0])\n" +
          "print(fruits[-1])"
      },
      {
        tipo: "arregla",
        titulo: "Outside the list",
        texto: [
          "There are three fruits. Fix the index to print `kiwi`."
        ],
        codigo: "fruits = ['pear', 'grape', 'kiwi']\n" +
          "print(fruits[3])",
        objetivo: "Use a valid index to read kiwi.",
        salidaEsperada: "kiwi",
        pistas: [
          "The first position is 0.",
          "Use [2] or [-1] to read the last item."
        ],
        error: "IndexError",
        solucion: "fruits = ['pear', 'grape', 'kiwi']\n" +
          "print(fruits[2])"
      },
      {
        tipo: "explica",
        titulo: "Add and count",
        texto: [
          "`append()` adds an item at the end. `len()` returns the number of items.",
          "Add another fruit and check the new length."
        ],
        codigo: "fruits = ['pear', 'grape']\n" +
          "fruits.append('kiwi')\n" +
          "print(fruits)\n" +
          "print(len(fruits))"
      },
      {
        tipo: "explica",
        titulo: "Go through a list",
        texto: [
          "On each round, `fruit` gets the next item in the list.",
          "Change the order of the items and compare the output."
        ],
        etiqueta: "Combination: lists + loops",
        codigo: "fruits = ['pear', 'grape', 'kiwi']\n" +
          "for fruit in fruits:\n" +
          "    print(fruit)"
      },
      {
        tipo: "predice",
        titulo: "Collect values in a list",
        texto: [
          "The loop adds three values before finding their sum, largest value, and smallest value."
        ],
        codigo: "numbers = [2]\n" +
          "for i in range(3, 6):\n" +
          "    numbers.append(i)\n" +
          "print(sum(numbers), max(numbers), min(numbers))",
        pregunta: "What happens when you run the code?",
        opciones: ["12 5 3","14 5 2","2 2 2"],
        correcta: 1,
        explicacion: "The final list is `[2, 3, 4, 5]`. The sum is 14, the largest value is 5, and the smallest is 2."
      },
      {
        tipo: "reto",
        titulo: "Count passing grades",
        texto: [
          "Count the grades in the list that are 5 or higher and show the total on one line."
        ],
        etiqueta: "Combination: lists + conditions",
        codigo: "grades = [8, 4, 5, 3, 9]\n" +
          "# Count the passing grades",
        objetivo: "Count and show how many grades are passing.",
        salidaEsperada: "3",
        requiere: ["lista","for","if"],
        pistas: [
          "Start a counter at 0 and go through each grade with for.",
          "Increase the counter only for grades of 5 or higher. Print after the loop."
        ],
        solucion: "grades = [8, 4, 5, 3, 9]\n" +
          "total = 0\n" +
          "for grade in grades:\n" +
          "    if grade >= 5:\n" +
          "        total += 1\n" +
          "print(total)"
      },
      {
        tipo: "explica",
        titulo: "Search with in",
        texto: [
          "`in` checks whether a value is in the list. You can use the result as a condition.",
          "Change `grape` to `mango` inside the `if`."
        ],
        codigo: "fruits = ['pear', 'grape', 'kiwi']\n" +
          "if 'grape' in fruits:\n" +
          "    print('There is a grape')"
      },
      {
        tipo: "resumen",
        titulo: "Lists cheat sheet",
        texto: [
          "Use indexes to read specific items and `for` to go through them all."
        ],
        codigo: "",
        chuleta: [
          ["fruits = ['pear', 'grape']","Creates a list with items in order."],
          ["fruits[0]","Reads the first item."],
          ["fruits[-1]","Reads the last item."],
          ["fruits.append('kiwi')","Adds an item at the end."],
          ["len(fruits)","Counts the items."],
          ["'grape' in fruits","Checks whether the item is in the list."]
        ]
      }
    ]
  };
  if (typeof module !== 'undefined') module.exports = tema;
  else (window.CR.TemasEn ||= []).push(tema);
})();
