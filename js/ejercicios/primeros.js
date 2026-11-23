(function () {
  'use strict';
  const ejercicios = [
    {
      "id": "primeros-1",
      "tema": "primeros",
      "tipo": "crea",
      "dificultad": 1,
      "titulo": "Un marco de texto",
      "enunciado": [
        "Imprime el marco de tres líneas tal como aparece en el ejemplo."
      ],
      "codigo": "",
      "solucion": "print(\"+-------+\")\nprint(\"| Hola! |\")\nprint(\"+-------+\")",
      "salidaEsperada": "+-------+\n| Hola! |\n+-------+",
      "pistas": [
        "Usa un print por línea.",
        "Pon las barras y los espacios dentro de las comillas."
      ],
      "ejemplo": "+-------+\n| Hola! |\n+-------+",
      "alternativa": "print(\"+-------+\\n| Hola! |\\n+-------+\")"
    },
    {
      "id": "primeros-2",
      "tema": "primeros",
      "tipo": "completa",
      "dificultad": 1,
      "titulo": "Una operación que da 12",
      "enunciado": [
        "Rellena el hueco con una operación aritmética que dé 12."
      ],
      "codigo": "print(___)",
      "solucion": "print(3 * 4)",
      "salidaEsperada": "12",
      "pistas": [
        "Busca dos factores de 12.",
        "¿Cuánto es 3 por 4?"
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
      "titulo": "La receta en orden",
      "enunciado": [
        "Ordena los pasos para preparar una tostada: primero corta el pan, tuéstalo, añade aceite y sírvelo."
      ],
      "codigo": "print(\"Corta el pan\")\nprint(\"Tuesta el pan\")\nprint(\"Añade aceite\")\nprint(\"Sirve la tostada\")",
      "solucion": "print(\"Corta el pan\")\nprint(\"Tuesta el pan\")\nprint(\"Añade aceite\")\nprint(\"Sirve la tostada\")",
      "salidaEsperada": "Corta el pan\nTuesta el pan\nAñade aceite\nSirve la tostada",
      "pistas": [
        "Empieza por cortar el pan.",
        "El aceite va después de tostar."
      ],
      "ejemplo": "Primera línea → Corta el pan"
    },
    {
      "id": "primeros-4",
      "tema": "primeros",
      "tipo": "arregla",
      "dificultad": 1,
      "titulo": "Comillas en su sitio",
      "enunciado": [
        "Corrige las comillas para imprimir Hola mundo."
      ],
      "codigo": "print(\"Hola\" mundo\")",
      "solucion": "print(\"Hola mundo\")",
      "salidaEsperada": "Hola mundo",
      "pistas": [
        "Una cadena empieza y termina con comillas.",
        "Todo el saludo va dentro de la misma cadena."
      ],
      "ejemplo": "Salida → Hola mundo"
    }
  ];
  if (typeof module !== 'undefined') module.exports = ejercicios;
  else (window.CR.Ejercicios ||= []).push(...ejercicios);
})();
