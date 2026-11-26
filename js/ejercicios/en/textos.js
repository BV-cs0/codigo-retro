(function (CR) {
'use strict';
const ejercicios = [
  {
    "id": "textos-1",
    "tema": "textos",
    "tipo": "disena",
    "dificultad": 2,
    "titulo": "Initials with dots",
    "enunciado": [
      "Design initials(name). Return the first letter of every word in uppercase, with a dot after each letter. Ignore extra spaces."
    ],
    "codigo": "",
    "solucion": "def initials(name):\n    result = \"\"\n    for word in name.split():\n        result += word[0].upper() + \".\"\n    return result",
    "pruebas": [
      {
        "llamada": "initials(\"Ada Lovelace King\")",
        "salida": "A.L.K.",
        "codigo": "print(initials(\"Ada Lovelace King\"))",
        "tipo": "str"
      },
      {
        "llamada": "initials(\"  ada   smith \")",
        "salida": "A.S.",
        "codigo": "print(initials(\"  ada   smith \"))",
        "tipo": "str"
      },
      {
        "llamada": "initials(\"\")",
        "salida": "",
        "codigo": "print(initials(\"\"))",
        "tipo": "str"
      }
    ],
    "pistas": [
      "Split the name with split().",
      "Take the character at index zero."
    ],
    "ejemplo": "initials(\"Ada Lovelace King\") → A.L.K."
  },
  {
    "id": "textos-2",
    "tema": "textos",
    "tipo": "disena",
    "dificultad": 1,
    "titulo": "Count a letter",
    "enunciado": [
      "Design count_letter(text, letter). Count exact matches without count(). Uppercase and lowercase letters are different."
    ],
    "codigo": "",
    "solucion": "def count_letter(text, letter):\n    total = 0\n    for character in text:\n        if character == letter:\n            total += 1\n    return total",
    "pruebas": [
      {
        "llamada": "count_letter(\"banana\", \"a\")",
        "salida": "3",
        "codigo": "print(count_letter(\"banana\", \"a\"))",
        "tipo": "int"
      },
      {
        "llamada": "count_letter(\"\", \"a\")",
        "salida": "0",
        "codigo": "print(count_letter(\"\", \"a\"))",
        "tipo": "int"
      },
      {
        "llamada": "count_letter(\"AaA\", \"A\")",
        "salida": "2",
        "codigo": "print(count_letter(\"AaA\", \"A\"))",
        "tipo": "int"
      }
    ],
    "pistas": [
      "Go through the text one character at a time.",
      "Add one when the character matches."
    ],
    "prohibe": [
      "count"
    ],
    "ejemplo": "count_letter(\"banana\", \"a\") → 3"
  },
  {
    "id": "textos-3",
    "tema": "textos",
    "tipo": "disena",
    "dificultad": 2,
    "titulo": "Hide a word",
    "enunciado": [
      "Design hide_word(sentence, word). Replace every exact match with the same number of stars as characters. The word will contain at least one character."
    ],
    "codigo": "",
    "solucion": "def hide_word(sentence, word):\n    return sentence.replace(word, \"*\" * len(word))",
    "pruebas": [
      {
        "llamada": "hide_word(\"jam and jam\", \"jam\")",
        "salida": "*** and ***",
        "codigo": "print(hide_word(\"jam and jam\", \"jam\"))",
        "tipo": "str"
      },
      {
        "llamada": "hide_word(\"\", \"jam\")",
        "salida": "",
        "codigo": "print(hide_word(\"\", \"jam\"))",
        "tipo": "str"
      },
      {
        "llamada": "hide_word(\"pajamas\", \"jam\")",
        "salida": "pa***as",
        "codigo": "print(hide_word(\"pajamas\", \"jam\"))",
        "tipo": "str"
      }
    ],
    "pistas": [
      "Find the length of the word.",
      "Use replace to change the text."
    ],
    "ejemplo": "hide_word(\"jam and jam\", \"jam\") → *** and ***"
  },
  {
    "id": "textos-4",
    "tema": "textos",
    "tipo": "disena",
    "dificultad": 3,
    "titulo": "Anagrams",
    "enunciado": [
      "Design is_anagram(a, b). Check if the texts have the same letters and the same number of each letter. Ignore case and spaces. You can use sorted()."
    ],
    "codigo": "",
    "solucion": "def is_anagram(a, b):\n    first = \"\".join(a.lower().split())\n    second = \"\".join(b.lower().split())\n    return sorted(first) == sorted(second)",
    "pruebas": [
      {
        "llamada": "is_anagram(\"Listen\", \"silent\")",
        "salida": "True",
        "codigo": "print(is_anagram(\"Listen\", \"silent\"))",
        "tipo": "bool"
      },
      {
        "llamada": "is_anagram(\"The eyes\", \"They see\")",
        "salida": "True",
        "codigo": "print(is_anagram(\"The eyes\", \"They see\"))",
        "tipo": "bool"
      },
      {
        "llamada": "is_anagram(\"aab\", \"abb\")",
        "salida": "False",
        "codigo": "print(is_anagram(\"aab\", \"abb\"))",
        "tipo": "bool"
      },
      {
        "llamada": "is_anagram(\"\", \"  \")",
        "salida": "True",
        "codigo": "print(is_anagram(\"\", \"  \"))",
        "tipo": "bool"
      }
    ],
    "pistas": [
      "Put both texts in the same form first.",
      "Sorting keeps repeated letters."
    ],
    "ejemplo": "is_anagram(\"Listen\", \"silent\") → True"
  },
  {
    "id": "textos-5",
    "tema": "textos",
    "tipo": "crea",
    "dificultad": 1,
    "titulo": "Reverse the words",
    "enunciado": [
      "Reverse the words in sentence using split and join. Keep the first line and print the words with a space between them."
    ],
    "codigo": "sentence = \"the sun is up\"",
    "solucion": "sentence = \"the sun is up\"\nwords = sentence.split()\nprint(\" \".join(words[::-1]))",
    "salidaEsperada": "up is sun the",
    "datos": [
      {
        "linea": "sentence = \"  blue   light \"",
        "salida": "light blue"
      }
    ],
    "pistas": [
      "Split the text into words.",
      "Reverse the list, then join the words again."
    ],
    "requiere": [
      "split",
      "join"
    ],
    "ejemplo": "the sun is up → up is sun the"
  }
];
if (typeof module !== 'undefined') module.exports = ejercicios;
else (CR.EjerciciosEn ||= []).push(...ejercicios);
})(globalThis.CR ||= {});
