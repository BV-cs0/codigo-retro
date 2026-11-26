(function (CR) {
'use strict';
const ejercicios = [
  {
    "id": "diccionarios-1",
    "tema": "diccionarios",
    "tipo": "disena",
    "dificultad": 1,
    "titulo": "Look up a phone number",
    "enunciado": [
      "Design find_phone(contacts, name). Use get to return the phone number or \"Unknown\"."
    ],
    "codigo": "",
    "solucion": "def find_phone(contacts, name):\n    return contacts.get(name, \"Unknown\")",
    "pruebas": [
      {
        "llamada": "find_phone({\"Ana\": \"555\"}, \"Ana\")",
        "salida": "555",
        "codigo": "print(find_phone({\"Ana\": \"555\"}, \"Ana\"))",
        "tipo": "str"
      },
      {
        "llamada": "find_phone({}, \"Ana\")",
        "salida": "Unknown",
        "codigo": "print(find_phone({}, \"Ana\"))",
        "tipo": "str"
      },
      {
        "llamada": "find_phone({\"Ana\": 123}, \"Ana\")",
        "salida": "123",
        "codigo": "print(find_phone({\"Ana\": 123}, \"Ana\"))",
        "tipo": "int"
      }
    ],
    "pistas": [
      "Use get to look up a key.",
      "The second argument is the default value."
    ],
    "requiere": [
      "get"
    ],
    "ejemplo": "find_phone({\"Ana\": \"555\"}, \"Ana\") → 555"
  },
  {
    "id": "diccionarios-2",
    "tema": "diccionarios",
    "tipo": "crea",
    "dificultad": 1,
    "titulo": "Count the stock",
    "enunciado": [
      "Add all the amounts in stock and print the total. Keep the first line."
    ],
    "codigo": "stock = {\"bread\": 3, \"milk\": 5}",
    "solucion": "stock = {\"bread\": 3, \"milk\": 5}\nprint(sum(stock.values()))",
    "salidaEsperada": "8",
    "datos": [
      {
        "linea": "stock = {}",
        "salida": "0"
      },
      {
        "linea": "stock = {\"bread\": 0, \"rice\": 12}",
        "salida": "12"
      }
    ],
    "pistas": [
      "The amounts are the values.",
      "Get them with values()."
    ],
    "ejemplo": "{\"bread\": 3, \"milk\": 5} → 8"
  },
  {
    "id": "diccionarios-3",
    "tema": "diccionarios",
    "tipo": "disena",
    "dificultad": 2,
    "titulo": "Swap keys and values",
    "enunciado": [
      "Design flip_dict(d). Swap the keys and values. The values will be unique and can be used as keys."
    ],
    "codigo": "",
    "solucion": "def flip_dict(d):\n    result = {}\n    for key, value in d.items():\n        result[value] = key\n    return result",
    "pruebas": [
      {
        "llamada": "flip_dict({\"a\": 1, \"b\": 2})",
        "salida": "{1: 'a', 2: 'b'}",
        "codigo": "print(flip_dict({\"a\": 1, \"b\": 2}))",
        "tipo": "dict"
      },
      {
        "llamada": "flip_dict({})",
        "salida": "{}",
        "codigo": "print(flip_dict({}))",
        "tipo": "dict"
      },
      {
        "llamada": "flip_dict({3: \"c\"})",
        "salida": "{'c': 3}",
        "codigo": "print(flip_dict({3: \"c\"}))",
        "tipo": "dict"
      }
    ],
    "pistas": [
      "Go through the pairs with items().",
      "Use each value as a key."
    ],
    "ejemplo": "flip_dict({\"a\": 1}) → {1: 'a'}"
  },
  {
    "id": "diccionarios-4",
    "tema": "diccionarios",
    "tipo": "disena",
    "dificultad": 3,
    "titulo": "The most common item",
    "enunciado": [
      "Design most_common(items). Return the item that appears most often. If two items tie, return the one that comes first. For an empty list, return None."
    ],
    "codigo": "",
    "solucion": "def most_common(items):\n    counts = {}\n    for value in items:\n        counts[value] = counts.get(value, 0) + 1\n    best = None\n    frequency = 0\n    for value in items:\n        if counts[value] > frequency:\n            best = value\n            frequency = counts[value]\n    return best",
    "pruebas": [
      {
        "llamada": "most_common([2, 1, 1, 2])",
        "salida": "2",
        "codigo": "print(most_common([2, 1, 1, 2]))",
        "tipo": "int"
      },
      {
        "llamada": "most_common([1, 2, 2, 3])",
        "salida": "2",
        "codigo": "print(most_common([1, 2, 2, 3]))",
        "tipo": "int"
      },
      {
        "llamada": "most_common([])",
        "salida": "None",
        "codigo": "print(most_common([]))",
        "tipo": "NoneType"
      },
      {
        "llamada": "most_common([\"yes\"])",
        "salida": "yes",
        "codigo": "print(most_common([\"yes\"]))",
        "tipo": "str"
      }
    ],
    "pistas": [
      "Count how often each item appears first.",
      "Change your choice only if you find a higher count."
    ],
    "ejemplo": "most_common([2, 1, 1, 2]) → 2"
  },
  {
    "id": "diccionarios-5",
    "tema": "diccionarios",
    "tipo": "crea",
    "dificultad": 2,
    "titulo": "Group by first letter",
    "enunciado": [
      "Group the non-empty words in words by their first character. Print a dictionary of lists in the order the words arrive. Keep the first line."
    ],
    "codigo": "words = [\"sun\", \"moon\", \"salt\"]",
    "solucion": "words = [\"sun\", \"moon\", \"salt\"]\ngroups = {}\nfor word in words:\n    initial = word[0]\n    if initial not in groups:\n        groups[initial] = []\n    groups[initial].append(word)\nprint(groups)",
    "salidaEsperada": "{'s': ['sun', 'salt'], 'm': ['moon']}",
    "datos": [
      {
        "linea": "words = []",
        "salida": "{}"
      },
      {
        "linea": "words = [\"wing\", \"Ana\", \"bird\"]",
        "salida": "{'w': ['wing'], 'A': ['Ana'], 'b': ['bird']}"
      }
    ],
    "pistas": [
      "Use the first letter as the key.",
      "Create an empty list for each new first letter."
    ],
    "ejemplo": "['sun', 'moon', 'salt'] → {'s': ['sun', 'salt'], 'm': ['moon']}"
  }
];
if (typeof module !== 'undefined') module.exports = ejercicios;
else (CR.EjerciciosEn ||= []).push(...ejercicios);
})(globalThis.CR ||= {});
