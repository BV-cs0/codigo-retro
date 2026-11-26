(function () {
  'use strict';
  const tema = {
    nombre: "Functions",
    frase: "Give a task a name and use it again.",
    necesita: "Variables, Conditions, Loops, and Lists.",
    pasos: [
      {
        tipo: "explica",
        titulo: "Functions you already know",
        texto: [
          "A function is a block of code with a name. It runs when you call it. You have already used `print()` and `len()`.",
          "Remove an item from `data` and run the code again."
        ],
        codigo: "data = [5, 8, 13]\n" +
          "print(len(data))"
      },
      {
        tipo: "explica",
        titulo: "Define and call",
        texto: [
          "`def` defines a function. Its indented instructions form the body. The definition makes the function ready to use. Each call runs its body.",
          "Add a third call."
        ],
        codigo: "def greet():\n" +
          "    print(\"Hello!\")\n" +
          "greet()\n" +
          "greet()"
      },
      {
        tipo: "predice",
        titulo: "A definition without a call",
        texto: [
          "Look for where the program uses the function's name."
        ],
        codigo: "def greet():\n" +
          "    print(\"Hello!\")\n",
        pregunta: "What happens when you run the code?",
        opciones: ["Hello!","Nothing","An error"],
        correcta: 1,
        explicacion: "The program saves the definition and ends. Adding `greet()` at the end would run the block."
      },
      {
        tipo: "explica",
        titulo: "Give an argument",
        texto: [
          "`name` is a parameter. On each call it gets the matching argument. Use Step by step and look at the Calls panel.",
          "Try a third name."
        ],
        recuerda: "Declare the parameter in def. Give the argument when you call the function.",
        codigo: "def greet(name):\n" +
          "    print(f\"Hello, {name}\")\n" +
          "greet(\"Emma\")\n" +
          "greet(\"Leo\")"
      },
      {
        tipo: "explica",
        titulo: "Several parameters",
        texto: [
          "The order of the arguments matters. The first goes to `name`, and the second goes to `age`.",
          "Swap the arguments to see how Python assigns them."
        ],
        codigo: "def introduce(name, age):\n" +
          "    print(f'{name} is {age} years old')\n" +
          "introduce('Emma', 30)"
      },
      {
        tipo: "arregla",
        titulo: "A missing argument",
        texto: [
          "Run the code to read the error. Fix the call so it shows `Emma is 30 years old`."
        ],
        codigo: "def introduce(name, age):\n" +
          "    print(f'{name} is {age} years old')\n" +
          "introduce('Emma')",
        objetivo: "Call introduce() with both values.",
        salidaEsperada: "Emma is 30 years old",
        requiere: ["def","parametro"],
        pistas: [
          "Look at the parameters of introduce().",
          "Pass 30 as the second argument after the comma."
        ],
        error: "TypeError",
        solucion: "def introduce(name, age):\n" +
          "    print(f'{name} is {age} years old')\n" +
          "introduce('Emma', 30)"
      },
      {
        tipo: "reto",
        titulo: "Print double",
        texto: [
          "Define `double(n)` to print twice its argument. Call the function with 3 and 10, in that order."
        ],
        codigo: "def double(n):\n" +
          "    pass\n" +
          "\n" +
          "double(3)\n" +
          "double(10)",
        objetivo: "Use a function to print double 3 and double 10.",
        salidaEsperada: "6\n20",
        requiere: ["def","parametro"],
        pistas: [
          "n gets a different value on each call.",
          "Print n * 2 inside the function."
        ],
        pruebas: [
          {"codigo":"double(7)","salida":"14"}
        ],
        solucion: "def double(n):\n" +
          "    print(n * 2)\n" +
          "\n" +
          "double(3)\n" +
          "double(10)"
      },
      {
        tipo: "explica",
        titulo: "Return a result",
        texto: [
          "`return` gives a value back to the code that called the function. You can store it or use it in a calculation. `print()` shows a value in the console.",
          "Change the argument to `double()`."
        ],
        recuerda: "Use `return` to give a value back to the code that called the function.",
        codigo: "def double(n):\n" +
          "    return n * 2\n" +
          "result = double(4)\n" +
          "print(result + 1)"
      },
      {
        tipo: "predice",
        titulo: "An automatic return",
        texto: [
          "The function calculates double the value. Look at how the function ends."
        ],
        codigo: "def double(n):\n" +
          "    n * 2\n" +
          "print(double(5))",
        pregunta: "What happens when you run the code?",
        opciones: ["10","Nothing","None"],
        correcta: 2,
        explicacion: "If a function reaches the end without `return`, it returns `None`."
      },
      {
        tipo: "predice",
        titulo: "After return",
        texto: [
          "`return` runs when Python reaches its line."
        ],
        codigo: "def value():\n" +
          "    return 4\n" +
          "    print('Inside')\n" +
          "print(value())",
        pregunta: "What happens when you run the code?",
        opciones: ["4","Inside\n4","An error"],
        correcta: 0,
        explicacion: "`return` ends the call right away. The final line prints only 4."
      },
      {
        tipo: "explica",
        titulo: "A default value",
        texto: [
          "If you leave out the argument, `name` gets the default value. If you give an argument, Python uses it for that call.",
          "Change the default value and run the code again."
        ],
        codigo: "def greet(name=\"friend\"):\n" +
          "    print(f'Hello, {name}')\n" +
          "greet()\n" +
          "greet('Leo')"
      },
      {
        tipo: "reto",
        titulo: "Check if a number is even",
        texto: [
          "Write `is_even(n)` to return `True` when the remainder after division by 2 is zero and `False` otherwise."
        ],
        etiqueta: "Combination: functions + conditions",
        codigo: "def is_even(n):\n" +
          "    pass",
        objetivo: "Return whether a number is even.",
        requiere: ["def","return"],
        pistas: [
          "An even number leaves a remainder of 0 when you divide it by 2.",
          "You can return the result of the comparison directly."
        ],
        pruebas: [
          {"codigo":"print(is_even(4))","salida":"True"},
          {"codigo":"print(is_even(7))","salida":"False"},
          {"codigo":"print(is_even(0))","salida":"True"}
        ],
        solucion: "def is_even(n):\n" +
          "    if n % 2 == 0:\n" +
          "        return True\n" +
          "    return False"
      },
      {
        tipo: "predice",
        titulo: "One call per round",
        texto: [
          "The loop passes a different value to `double()` on each round."
        ],
        etiqueta: "Combination: functions + loops",
        codigo: "def double(n):\n" +
          "    return n * 2\n" +
          "for i in range(1, 4):\n" +
          "    print(double(i))",
        pregunta: "What happens when you run the code?",
        opciones: ["2\n4\n6","2\n4\n6\n8","1\n2\n3"],
        correcta: 0,
        explicacion: "`i` takes the values 1, 2, and 3. Each call returns twice that value."
      },
      {
        tipo: "reto",
        titulo: "Find the average",
        texto: [
          "Define `average(numbers)` to return the average of a list with at least one item. Divide the sum by the number of items."
        ],
        etiqueta: "Combination: functions + lists",
        codigo: "def average(numbers):\n" +
          "    pass",
        objetivo: "Return the average of a list.",
        requiere: ["def","return"],
        pistas: [
          "sum() gives the sum, and len() gives the number of items.",
          "Use return to give back the result of dividing the sum by the count."
        ],
        pruebas: [
          {"codigo":"print(average([2, 4, 6]))","salida":"4.0"},
          {"codigo":"print(average([1, 2]))","salida":"1.5"},
          {"codigo":"print(average([9]))","salida":"9.0"}
        ],
        solucion: "def average(numbers):\n" +
          "    return sum(numbers) / len(numbers)"
      },
      {
        tipo: "predice",
        titulo: "The life of a local variable",
        texto: [
          "Python assigns `x` inside `f()`. The last line tries to read it outside the function."
        ],
        codigo: "def f():\n" +
          "    x = 5\n" +
          "f()\n" +
          "print(x)",
        pregunta: "What happens when you run the code?",
        opciones: ["5","None","NameError"],
        correcta: 2,
        explicacion: "The assignment creates a local variable in `f()`. The main program has no variable named `x`.",
        error: "NameError"
      },
      {
        tipo: "predice",
        titulo: "Change a shared list",
        texto: [
          "The function gets the same list that `data` holds."
        ],
        codigo: "def add_item(items):\n" +
          "    items.append(3)\n" +
          "data = [1, 2]\n" +
          "add_item(data)\n" +
          "print(data)",
        pregunta: "What happens when you run the code?",
        opciones: ["[1, 2]","[1, 2, 3]","None"],
        correcta: 1,
        explicacion: "`append()` changes the existing list. The parameter and `data` refer to that same list."
      },
      {
        tipo: "arregla",
        titulo: "Call before defining",
        texto: [
          "Run the code to see the error. Move the lines so the code prints `Hello!`."
        ],
        codigo: "greet()\n" +
          "def greet():\n" +
          "    print(\"Hello!\")\n",
        objetivo: "Define the function before calling it.",
        salidaEsperada: "Hello!",
        requiere: ["def"],
        pistas: [
          "Python runs the code from top to bottom.",
          "Move the call to greet() after the def block."
        ],
        error: "NameError",
        solucion: "def greet():\n" +
          "    print(\"Hello!\")\n" +
          "greet()"
      },
      {
        tipo: "explica",
        titulo: "One function calls another",
        texto: [
          "`describe()` calls `area()` to fill in the message. Use Step by step to see how the calls stack up.",
          "Change the side length."
        ],
        etiqueta: "Combination: one function calls another",
        codigo: "def area(side):\n" +
          "    return side * side\n" +
          "def describe(side):\n" +
          "    print(f\"Area: {area(side)}\")\n" +
          "describe(5)"
      },
      {
        tipo: "mundo",
        titulo: "Two sections to the crystal",
        texto: [
          "Define `move_n(steps)` with a `for` loop. Call it with 3, run `turn_right()`, then call it again with 4."
        ],
        codigo: "def move_n(steps):\n" +
          "    pass\n" +
          "\n" +
          "move_n(3)\n" +
          "turn_right()\n" +
          "move_n(4)",
        objetivo: "Reach the crystal with a function that takes the distance.",
        requiere: ["def","parametro"],
        pistas: [
          "Use the parameter as the stop value for range().",
          "Put move() inside the for loop. Make the turn between the two calls."
        ],
        mundo: {"demo":"robot","mapa":{"trazo":"EEESSSS","inicio":[1,1]}},
        solucion: "def move_n(steps):\n" +
          "    for i in range(steps):\n" +
          "        move()\n" +
          "\n" +
          "move_n(3)\n" +
          "turn_right()\n" +
          "move_n(4)"
      },
      {
        tipo: "resumen",
        titulo: "Functions cheat sheet",
        texto: [
          "Define a task, pass it data through parameters, and use `return` when you need a result."
        ],
        codigo: "",
        chuleta: [
          ["def double(n):","Defines a function with one parameter."],
          ["    return n * 2","Returns a value and ends the call."],
          ["result = double(4)","Calls the function and stores the result."],
          ["def greet(name='friend'):","Sets a default value."],
          ["print(double(7))","Uses the result of a function as an argument."],
          ["items.append(5)","Changes the original list, even inside a function."]
        ]
      }
    ]
  };
  if (typeof module !== 'undefined') module.exports = tema;
  else (window.CR.TemasEn ||= []).push(tema);
})();
