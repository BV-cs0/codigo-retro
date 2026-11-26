(function () {
  'use strict';
  const tema = {
    nombre: "Strings",
    frase: "Go through, slice, and change strings.",
    necesita: "Variables, Loops",
    pasos: [
      {
        tipo: "explica",
        titulo: "A sequence of letters",
        texto: [
          "Each character has a position. Use `len()` to count them and `[-1]` to read the last one. Try your name."
        ],
        codigo: "string = \"Python\"\n" +
          "print(len(string))\n" +
          "print(string[0], string[-1])"
      },
      {
        tipo: "explica",
        titulo: "Slice a string",
        texto: [
          "The slice leaves out the stop position, just like `range()`. If you leave out one end, the slice goes to the start or end of the string. Change the positions."
        ],
        codigo: "string = \"Python\"\n" +
          "print(string[0:3])\n" +
          "print(string[2:])\n" +
          "print(string[:4])"
      },
      {
        tipo: "predice",
        titulo: "The stop position stays out",
        texto: [
          "Count the positions from zero."
        ],
        codigo: "print(\"Python\"[1:4])",
        opciones: ["yth","Pyt","ytho"],
        correcta: 0,
        pregunta: "What will you see in the console?",
        explicacion: "Position 1 is y, and the slice leaves out position 4. It takes positions 1, 2, and 3."
      },
      {
        tipo: "explica",
        titulo: "A new string",
        texto: [
          "These methods return a new string. Change the words and see the results."
        ],
        codigo: "string = \"  Hello, Emma  \"\n" +
          "print(string.upper())\n" +
          "print(string.lower())\n" +
          "print(string.strip())\n" +
          "print(string.replace(\"Emma\", \"Leo\"))"
      },
      {
        tipo: "predice",
        titulo: "Did the name change?",
        texto: [
          "Look for where the code stores the result of the method."
        ],
        codigo: "name = \"emma\"\n" +
          "name.upper()\n" +
          "print(name)",
        opciones: ["emma","EMMA","Nothing"],
        correcta: 0,
        pregunta: "What will you see in the console?",
        explicacion: "The variable still holds emma. Try `name = name.upper()` to store the new string."
      },
      {
        tipo: "explica",
        titulo: "Split and join",
        texto: [
          "`split()` breaks a string into a list. `join()` puts the items together with the separator you choose. Try another separator."
        ],
        codigo: "colors = \"red,green,blue\".split(\",\")\n" +
          "print(colors)\n" +
          "print(\" - \".join(colors))"
      },
      {
        tipo: "reto",
        titulo: "Count the vowels",
        texto: [
          "Go through the sentence and count its lowercase vowels with `for letter in sentence` and `in \"aeiou\"`."
        ],
        objetivo: "Go through the sentence and count its lowercase vowels with `for letter in sentence` and `in \"aeiou\"`.",
        codigo: "sentence = \"hello world\"\n" +
          "count = 0\n" +
          "print(count)",
        solucion: "sentence = \"hello world\"\n" +
          "count = 0\n" +
          "for letter in sentence:\n" +
          "    if letter in \"aeiou\":\n" +
          "        count += 1\n" +
          "print(count)",
        pistas: [
          "Start a counter at zero.",
          "Add one when the letter is in \"aeiou\"."
        ],
        etiqueta: "Combination: strings + loops",
        requiere: ["for"],
        salidaEsperada: "3\n"
      },
      {
        tipo: "reto",
        titulo: "A simple email check",
        texto: [
          "Write `valid_email(email)`. Return True if it contains @ and ends in .com or .es."
        ],
        objetivo: "Write `valid_email(email)`. Return True if it contains @ and ends in .com or .es.",
        codigo: "def valid_email(email):\n" +
          "    pass",
        solucion: "def valid_email(email):\n" +
          "    return \"@\" in email and email.endswith((\".com\", \".es\"))",
        pistas: [
          "Check whether \"@\" is in email.",
          "Use endswith to check the ending."
        ],
        etiqueta: "Combination: strings + conditions",
        pruebas: [
          {"codigo":"print(valid_email(\"emma@example.com\"), valid_email(\"leo@example.es\"))","salida":"True True"},
          {"codigo":"print(valid_email(\"emma.es\"), valid_email(\"a@b.org\"))","salida":"False False"}
        ]
      },
      {
        tipo: "reto",
        titulo: "Palindromes",
        texto: [
          "Write `is_palindrome(word)`. Use `[::-1]` to reverse the word, then compare the two strings."
        ],
        objetivo: "Write `is_palindrome(word)`. Use `[::-1]` to reverse the word, then compare the two strings.",
        codigo: "def is_palindrome(word):\n" +
          "    pass",
        solucion: "def is_palindrome(word):\n" +
          "    return word == word[::-1]",
        pistas: [
          "A step of -1 goes through the string backwards.",
          "Compare the two strings with ==."
        ],
        requiere: ["corte"],
        pruebas: [
          {"codigo":"print(is_palindrome(\"level\"), is_palindrome(\"python\"), is_palindrome(\"pop\"))","salida":"True False True"}
        ]
      },
      {
        tipo: "resumen",
        titulo: "Strings cheat sheet",
        texto: [
          "You can now find and change parts of a string."
        ],
        codigo: "",
        chuleta: [
          ["len(string)","Counts the characters."],
          ["string[-1]","Reads the last character."],
          ["string[1:4]","Takes positions 1 to 3."],
          ["string[::-1]","Reverses the string."],
          ["string.strip()","Removes spaces from both ends."],
          ["string.split(\",\")","Splits at commas."],
          ["\" - \".join(colors)","Joins the strings."],
          ["string.endswith(\".es\")","Checks how the string ends."]
        ]
      }
    ]
  };
  if (typeof module !== 'undefined') module.exports = tema;
  else (window.CR.TemasEn ||= []).push(tema);
})();
