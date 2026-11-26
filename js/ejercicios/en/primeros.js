(function (CR) {
'use strict';
const ejercicios = [
  {
    "id": "primeros-1",
    "tema": "primeros",
    "tipo": "crea",
    "dificultad": 1,
    "titulo": "A text frame",
    "enunciado": [
      "Print the three-line frame exactly as shown in the example."
    ],
    "codigo": "",
    "solucion": "print(\"+-------+\")\nprint(\"|  Hi!  |\")\nprint(\"+-------+\")",
    "salidaEsperada": "+-------+\n|  Hi!  |\n+-------+",
    "pistas": [
      "Use one print call per line.",
      "Put the bars and spaces inside the quotes."
    ],
    "ejemplo": "+-------+\n|  Hi!  |\n+-------+",
    "alternativa": "print(\"+-------+\\n|  Hi!  |\\n+-------+\")"
  },
  {
    "id": "primeros-2",
    "tema": "primeros",
    "tipo": "completa",
    "dificultad": 1,
    "titulo": "A calculation that gives 12",
    "enunciado": [
      "Fill the gap with a calculation that gives 12."
    ],
    "codigo": "print(___)",
    "solucion": "print(3 * 4)",
    "salidaEsperada": "12",
    "pistas": [
      "Find two factors of 12.",
      "What is 3 times 4?"
    ],
    "requiere": [
      "aritmetica"
    ],
    "ejemplo": "3 * 4 → 12"
  },
  {
    "id": "primeros-3",
    "tema": "primeros",
    "tipo": "ordena",
    "dificultad": 1,
    "titulo": "Put the recipe in order",
    "enunciado": [
      "Put the steps for making toast in order. Cut the bread, toast it, add oil, and serve it."
    ],
    "codigo": "print(\"Cut the bread\")\nprint(\"Toast the bread\")\nprint(\"Add oil\")\nprint(\"Serve the toast\")",
    "solucion": "print(\"Cut the bread\")\nprint(\"Toast the bread\")\nprint(\"Add oil\")\nprint(\"Serve the toast\")",
    "salidaEsperada": "Cut the bread\nToast the bread\nAdd oil\nServe the toast",
    "pistas": [
      "Start by cutting the bread.",
      "Add the oil after toasting."
    ],
    "ejemplo": "First line → Cut the bread"
  },
  {
    "id": "primeros-4",
    "tema": "primeros",
    "tipo": "arregla",
    "dificultad": 1,
    "titulo": "Quotes in the right place",
    "enunciado": [
      "Fix the quotes to print Hello world."
    ],
    "codigo": "print(\"Hello\" world\")",
    "solucion": "print(\"Hello world\")",
    "salidaEsperada": "Hello world",
    "pistas": [
      "A string starts and ends with quotes.",
      "Put the whole greeting in one string."
    ],
    "ejemplo": "Output → Hello world"
  }
];
if (typeof module !== 'undefined') module.exports = ejercicios;
else (CR.EjerciciosEn ||= []).push(...ejercicios);
})(globalThis.CR ||= {});
