(function () {
  'use strict';
  const ejercicios = [
    {
      "id": "textos-1",
      "tema": "textos",
      "tipo": "disena",
      "dificultad": 2,
      "titulo": "Iniciales con puntos",
      "enunciado": [
        "Diseña iniciales(nombre). Devuelve la inicial mayúscula de cada palabra con un punto. Ignora espacios sobrantes."
      ],
      "codigo": "",
      "solucion": "def iniciales(nombre):\n    resultado = \"\"\n    for palabra in nombre.split():\n        resultado += palabra[0].upper() + \".\"\n    return resultado",
      "pruebas": [
        {
          "llamada": "iniciales(\"Ada Lovelace King\")",
          "salida": "A.L.K.",
          "codigo": "print(iniciales(\"Ada Lovelace King\"))",
          "tipo": "str"
        },
        {
          "llamada": "iniciales(\"  ada   pérez \")",
          "salida": "A.P.",
          "codigo": "print(iniciales(\"  ada   pérez \"))",
          "tipo": "str"
        },
        {
          "llamada": "iniciales(\"\")",
          "salida": "",
          "codigo": "print(iniciales(\"\"))",
          "tipo": "str"
        }
      ],
      "pistas": [
        "Separa con split().",
        "Toma el carácter de índice cero."
      ],
      "ejemplo": "iniciales(\"Ada Lovelace King\") → A.L.K."
    },
    {
      "id": "textos-2",
      "tema": "textos",
      "tipo": "disena",
      "dificultad": 1,
      "titulo": "Cuenta una letra",
      "enunciado": [
        "Diseña contar_letra(texto, letra). Cuenta apariciones exactas distinguiendo mayúsculas, sin count()."
      ],
      "codigo": "",
      "solucion": "def contar_letra(texto, letra):\n    total = 0\n    for caracter in texto:\n        if caracter == letra:\n            total += 1\n    return total",
      "pruebas": [
        {
          "llamada": "contar_letra(\"banana\", \"a\")",
          "salida": "3",
          "codigo": "print(contar_letra(\"banana\", \"a\"))",
          "tipo": "int"
        },
        {
          "llamada": "contar_letra(\"\", \"a\")",
          "salida": "0",
          "codigo": "print(contar_letra(\"\", \"a\"))",
          "tipo": "int"
        },
        {
          "llamada": "contar_letra(\"AaA\", \"A\")",
          "salida": "2",
          "codigo": "print(contar_letra(\"AaA\", \"A\"))",
          "tipo": "int"
        }
      ],
      "pistas": [
        "Recorre cada carácter.",
        "Suma uno cuando coincida."
      ],
      "prohibe": [
        "count"
      ],
      "ejemplo": "contar_letra(\"banana\", \"a\") → 3"
    },
    {
      "id": "textos-3",
      "tema": "textos",
      "tipo": "disena",
      "dificultad": 2,
      "titulo": "Palabra censurada",
      "enunciado": [
        "Diseña censurar(frase, palabra). Sustituye todas las apariciones exactas por asteriscos del mismo largo. La palabra no estará vacía."
      ],
      "codigo": "",
      "solucion": "def censurar(frase, palabra):\n    return frase.replace(palabra, \"*\" * len(palabra))",
      "pruebas": [
        {
          "llamada": "censurar(\"pan y pan\", \"pan\")",
          "salida": "*** y ***",
          "codigo": "print(censurar(\"pan y pan\", \"pan\"))",
          "tipo": "str"
        },
        {
          "llamada": "censurar(\"\", \"pan\")",
          "salida": "",
          "codigo": "print(censurar(\"\", \"pan\"))",
          "tipo": "str"
        },
        {
          "llamada": "censurar(\"empanada\", \"pan\")",
          "salida": "em***ada",
          "codigo": "print(censurar(\"empanada\", \"pan\"))",
          "tipo": "str"
        }
      ],
      "pistas": [
        "Calcula la longitud.",
        "Usa replace para sustituir el texto."
      ],
      "ejemplo": "censurar(\"pan y pan\", \"pan\") → *** y ***"
    },
    {
      "id": "textos-4",
      "tema": "textos",
      "tipo": "disena",
      "dificultad": 3,
      "titulo": "Anagramas",
      "enunciado": [
        "Diseña es_anagrama(a, b). Comprueba si los textos tienen las mismas letras y cantidades al ignorar mayúsculas y espacios. Puedes usar sorted()."
      ],
      "codigo": "",
      "solucion": "def es_anagrama(a, b):\n    primera = \"\".join(a.lower().split())\n    segunda = \"\".join(b.lower().split())\n    return sorted(primera) == sorted(segunda)",
      "pruebas": [
        {
          "llamada": "es_anagrama(\"Roma\", \"amor\")",
          "salida": "True",
          "codigo": "print(es_anagrama(\"Roma\", \"amor\"))",
          "tipo": "bool"
        },
        {
          "llamada": "es_anagrama(\"La tina\", \"Latina\")",
          "salida": "True",
          "codigo": "print(es_anagrama(\"La tina\", \"Latina\"))",
          "tipo": "bool"
        },
        {
          "llamada": "es_anagrama(\"aab\", \"abb\")",
          "salida": "False",
          "codigo": "print(es_anagrama(\"aab\", \"abb\"))",
          "tipo": "bool"
        },
        {
          "llamada": "es_anagrama(\"\", \"  \")",
          "salida": "True",
          "codigo": "print(es_anagrama(\"\", \"  \"))",
          "tipo": "bool"
        }
      ],
      "pistas": [
        "Normaliza antes de comparar.",
        "Ordenar las letras conserva las repeticiones."
      ],
      "ejemplo": "es_anagrama(\"Roma\", \"amor\") → True"
    },
    {
      "id": "textos-5",
      "tema": "textos",
      "tipo": "crea",
      "dificultad": 1,
      "titulo": "La frase al revés",
      "enunciado": [
        "Invierte las palabras de frase con split y join. Conserva la primera línea e imprime con un espacio entre palabras."
      ],
      "codigo": "frase = \"hoy sale el sol\"",
      "solucion": "frase = \"hoy sale el sol\"\npalabras = frase.split()\nprint(\" \".join(palabras[::-1]))",
      "salidaEsperada": "sol el sale hoy",
      "datos": [
        {
          "linea": "frase = \"  luz   azul \"",
          "salida": "azul luz"
        }
      ],
      "pistas": [
        "Separa el texto en palabras.",
        "Invierte la lista y vuelve a unirla."
      ],
      "requiere": [
        "split",
        "join"
      ],
      "ejemplo": "hoy sale el sol → sol el sale hoy"
    }
  ];
  if (typeof module !== 'undefined') module.exports = ejercicios;
  else (window.CR.Ejercicios ||= []).push(...ejercicios);
})();
