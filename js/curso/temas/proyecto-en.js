(function () {
  'use strict';
  const pregunta = 'Guess the number (1-100): ';
  const leer = 'number = int(input("' + pregunta + '"))';
  const simple = 'secret = 42\n' + leer;
  const pistas = 'if number < secret:\n    print("Higher.")\nelif number > secret:\n    print("Lower.")';
  const comparar = simple + '\n' + pistas + '\nelse:\n    print("You got it!")';
  const sangrar = codigo => codigo.split('\n').map(l => l ? '    ' + l : '').join('\n');
  const acierto = 'if attempts == 1:\n    print("You got it in 1 try!")\nelse:\n    print(f"You got it in {attempts} tries!")';
  const repetir = 'secret = 42\nwhile True:\n' + sangrar(leer + '\n' + pistas + '\nelse:\n    print("You got it!")\n    break');
  const jugada = pistas + '\nelse:\n' + sangrar(acierto + '\nbreak');
  const contar = 'secret = 42\nattempts = 0\nwhile True:\n' + sangrar(leer + '\nattempts += 1\n' + jugada);
  const secret = 'secret = random.randint(1, 100)';
  const azar = 'import random\n' + contar.replace('secret = 42', secret);
  const error = 'That is not a number.';
  const leerSeguro = 'try:\n    ' + leer + '\nexcept ValueError:\n    print("' + error + '")\n    continue';
  const proteger = azar.replace(leer, leerSeguro.replaceAll('\n', '\n    '));
  const pedir = 'def ask_number():\n    while True:\n        try:\n            return int(input("' + pregunta +
    '"))\n        except ValueError:\n            print("' + error + '")';
  function juego(limite) {
    const ronda = 'number = ask_number()\nattempts += 1\n' + jugada;
    const cuerpo = secret + '\nattempts = 0\nwhile ' + (limite ? 'attempts < 7' : 'True') + ':\n' +
      sangrar(ronda.replace('    break', '    return')) +
      (limite ? '\nprint(f"No tries left. It was {secret}.")' : '');
    return 'import random\n\n' + pedir + '\n\ndef play():\n' + sangrar(cuerpo) + '\n\nplay()';
  }
  const completo = juego(true);
  const comentado = completo.replace('def ask_number():', '# Ask again if the text is not a whole number.\ndef ask_number():')
    .replace('def play():', '# Pick the secret and allow up to seven valid tries.\ndef play():')
    .replace('        attempts += 1', '        # Count only entries that converted to an integer.\n        attempts += 1');
  const tema = {
    nombre: "Final Project: Guess the Number",
    frase: "Build a game in eight challenges.",
    necesita: "All earlier topics",
    proyecto: true,
    pasos: [
      {
        tipo: "explica",
        titulo: "The game plan",
        texto: [
          "Build the game one part at a time. Each challenge adds a piece to the previous code.",
          "1. Ask for a number. 2. Compare. 3. Repeat. 4. Count tries.",
          "5. Pick a secret number. 6. Handle errors. 7. Organize the code into functions. 8. Limit tries.",
          "Run the starting code. You can add a comment about the game."
        ],
        codigo: "# Start here.\n" +
          "pass"
      },
      {
        tipo: "reto",
        titulo: "Ask for a number",
        texto: [
          "Set `secret = 42`. Ask \"Guess the number (1-100): \" and convert the answer to an integer. For now, the program only shows the question."
        ],
        objetivo: "Set `secret = 42`. Ask \"Guess the number (1-100): \" and convert the answer to an integer. For now, the program only shows the question.",
        codigo: "anterior",
        solucion: simple,
        pistas: [
          "Use input with the exact message.",
          "Put input(...) inside int(...). For this step, use a variable called number."
        ],
        casos: [
          {"entradas":["50"],"salida":"Guess the number (1-100): ",aleatorios: undefined},
          {"entradas":["42"],"salida":"Guess the number (1-100): ",aleatorios: undefined},
          {"entradas":["hello"],"salida":"Guess the number (1-100): ","error":"ValueError"}
        ],
        requiere: ["input"]
      },
      {
        tipo: "reto",
        titulo: "Give a hint",
        texto: [
          "Compare the guess with the secret number. Print \"Higher.\", \"Lower.\", or \"You got it!\" For now, give the player one try."
        ],
        objetivo: "Compare the guess with the secret number. Print \"Higher.\", \"Lower.\", or \"You got it!\" For now, give the player one try.",
        codigo: "anterior",
        solucion: comparar,
        pistas: [
          "Use if when the guess is too low.",
          "Use elif when the guess is too high and else when it is right."
        ],
        casos: [
          {"entradas":["25"],"salida":"Guess the number (1-100): Higher.\n",aleatorios: undefined},
          {"entradas":["50"],"salida":"Guess the number (1-100): Lower.\n",aleatorios: undefined},
          {"entradas":["42"],"salida":"Guess the number (1-100): You got it!\n",aleatorios: undefined}
        ],
        requiere: ["if"]
      },
      {
        tipo: "reto",
        titulo: "Repeat until the guess is right",
        texto: [
          "Ask again after each hint. Stop when the player guesses the number."
        ],
        objetivo: "Ask again after each hint. Stop when the player guesses the number.",
        codigo: "anterior",
        solucion: repetir,
        pistas: [
          "Put the question and comparison inside while True.",
          "Use break when the guess is right."
        ],
        casos: [
          {"entradas":["50","25","42"],"salida":"Guess the number (1-100): Lower.\nGuess the number (1-100): Higher.\nGuess the number (1-100): You got it!\n",aleatorios: undefined}
        ],
        requiere: ["while"]
      },
      {
        tipo: "reto",
        titulo: "Count the tries",
        texto: [
          "Use an f-string to say how many tries the player took. Print \"You got it in 1 try!\" or \"You got it in {n} tries!\""
        ],
        objetivo: "Use an f-string to say how many tries the player took. Print \"You got it in 1 try!\" or \"You got it in {n} tries!\"",
        codigo: "anterior",
        solucion: contar,
        pistas: [
          "Start counting at zero.",
          "Check whether attempts is 1 before choosing the message."
        ],
        casos: [
          {"entradas":["42"],"salida":"Guess the number (1-100): You got it in 1 try!\n",aleatorios: undefined},
          {"entradas":["50","25","42"],"salida":"Guess the number (1-100): Lower.\nGuess the number (1-100): Higher.\nGuess the number (1-100): You got it in 3 tries!\n",aleatorios: undefined}
        ],
        requiere: ["fstring"]
      },
      {
        tipo: "reto",
        titulo: "Pick the secret number",
        texto: [
          "Use `random.randint(1, 100)` to pick the secret number once before asking."
        ],
        objetivo: "Use `random.randint(1, 100)` to pick the secret number once before asking.",
        codigo: "anterior",
        solucion: azar,
        pistas: [
          "Add import random at the top.",
          "Replace the fixed value with random.randint(1, 100)."
        ],
        casos: [
          {"entradas":["7"],"salida":"Guess the number (1-100): You got it in 1 try!\n","aleatorios":[7]},
          {"entradas":["50","25","37"],"salida":"Guess the number (1-100): Lower.\nGuess the number (1-100): Higher.\nGuess the number (1-100): You got it in 3 tries!\n","aleatorios":[37]}
        ],
        requiere: ["import"]
      },
      {
        tipo: "reto",
        titulo: "Handle input that is not an integer",
        texto: [
          "If the conversion fails, print \"That is not a number.\" and ask again. This input does not count as a try."
        ],
        objetivo: "If the conversion fails, print \"That is not a number.\" and ask again. This input does not count as a try.",
        codigo: "anterior",
        solucion: proteger,
        pistas: [
          "Put the conversion in try and catch ValueError.",
          "Use continue before adding to the count."
        ],
        casos: [
          {"entradas":["hello","50","25","37"],"salida":"Guess the number (1-100): That is not a number.\nGuess the number (1-100): Lower.\nGuess the number (1-100): Higher.\nGuess the number (1-100): You got it in 3 tries!\n","aleatorios":[37]},
          {"entradas":["x","7"],"salida":"Guess the number (1-100): That is not a number.\nGuess the number (1-100): You got it in 1 try!\n","aleatorios":[7]}
        ],
        requiere: ["try","except"]
      },
      {
        tipo: "reto",
        titulo: "Split the tasks",
        texto: [
          "Create `ask_number()` to keep asking until it gets an integer, then return it. Put the game in `play()`. The main program calls play()."
        ],
        objetivo: "Create `ask_number()` to keep asking until it gets an integer, then return it. Put the game in `play()`. The main program calls play().",
        codigo: "anterior",
        solucion: juego(false),
        pistas: [
          "Move the input and error handling to ask_number().",
          "In play(), start each round with number = ask_number()."
        ],
        casos: [
          {"entradas":["hello","50","25","37"],"salida":"Guess the number (1-100): That is not a number.\nGuess the number (1-100): Lower.\nGuess the number (1-100): Higher.\nGuess the number (1-100): You got it in 3 tries!\n","aleatorios":[37]},
          {"entradas":["81"],"salida":"Guess the number (1-100): You got it in 1 try!\n","aleatorios":[81]}
        ],
        requiere: ["def","return"]
      },
      {
        tipo: "reto",
        titulo: "Limit the game to seven tries",
        texto: [
          "After seven valid tries, print \"No tries left. It was {secret}.\" If the player guesses the number, end with the usual message."
        ],
        objetivo: "After seven valid tries, print \"No tries left. It was {secret}.\" If the player guesses the number, end with the usual message.",
        codigo: "anterior",
        solucion: completo,
        pistas: [
          "Use attempts < 7 as the while condition.",
          "After the loop, show the secret number if a correct guess did not end the function."
        ],
        casos: [
          {"entradas":["50","25","37"],"salida":"Guess the number (1-100): Lower.\nGuess the number (1-100): Higher.\nGuess the number (1-100): You got it in 3 tries!\n","aleatorios":[37]},
          {"entradas":["50","25","30","31","32","33","34"],"salida":"Guess the number (1-100): Lower.\nGuess the number (1-100): Higher.\nGuess the number (1-100): Higher.\nGuess the number (1-100): Higher.\nGuess the number (1-100): Higher.\nGuess the number (1-100): Higher.\nGuess the number (1-100): Higher.\nNo tries left. It was 37.\n","aleatorios":[37]}
        ],
        requiere: ["while","return"]
      },
      {
        tipo: "resumen",
        titulo: "Your complete game",
        texto: [
          "You used variables, conditions, loops, functions, errors, input, and random.",
          "Three ideas to try next: play again, choose the difficulty, and save the best score."
        ],
        codigo: "anterior",
        chuleta: [
          ["random.randint(1, 100)","Picks the secret number."],
          ["int(input(...))","Reads a guess as an integer."],
          ["except ValueError:","Handles input that Python cannot convert."],
          ["while attempts < 7:","Repeats up to the limit."],
          ["return","Ends the game when the guess is right."]
        ],
        final: comentado
      }
    ]
  };
  if (typeof module !== 'undefined') module.exports = tema;
  else (window.CR.TemasEn ||= []).push(tema);
})();
