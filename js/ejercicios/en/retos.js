(function (CR) {
'use strict';
const ejercicios = [
  {
    "id": "retos-1",
    "tema": "retos",
    "tipo": "disena",
    "dificultad": 3,
    "titulo": "Check a password",
    "enunciado": [
      "Design check_password(password). Return a list of problems in this order: \"At least 8 characters\", \"Missing a digit\", \"Missing an uppercase letter\". Use digits 0–9 and check uppercase with isupper(). Return [] if all checks pass."
    ],
    "codigo": "",
    "solucion": "def check_password(password):\n    problems = []\n    digit = False\n    uppercase = False\n    for character in password:\n        if character in \"0123456789\":\n            digit = True\n        if character.isupper():\n            uppercase = True\n    if len(password) < 8:\n        problems.append(\"At least 8 characters\")\n    if not digit:\n        problems.append(\"Missing a digit\")\n    if not uppercase:\n        problems.append(\"Missing an uppercase letter\")\n    return problems",
    "pruebas": [
      {
        "llamada": "check_password(\"\")",
        "salida": "['At least 8 characters', 'Missing a digit', 'Missing an uppercase letter']",
        "codigo": "print(check_password(\"\"))",
        "tipo": "list"
      },
      {
        "llamada": "check_password(\"Abcdefg1\")",
        "salida": "[]",
        "codigo": "print(check_password(\"Abcdefg1\"))",
        "tipo": "list"
      },
      {
        "llamada": "check_password(\"abcdefg1\")",
        "salida": "['Missing an uppercase letter']",
        "codigo": "print(check_password(\"abcdefg1\"))",
        "tipo": "list"
      },
      {
        "llamada": "check_password(\"Abcdefgh\")",
        "salida": "['Missing a digit']",
        "codigo": "print(check_password(\"Abcdefgh\"))",
        "tipo": "list"
      },
      {
        "llamada": "check_password(\"A1\")",
        "salida": "['At least 8 characters']",
        "codigo": "print(check_password(\"A1\"))",
        "tipo": "list"
      },
      {
        "llamada": "check_password(\"abcdefgh\")",
        "salida": "['Missing a digit', 'Missing an uppercase letter']",
        "codigo": "print(check_password(\"abcdefgh\"))",
        "tipo": "list"
      },
      {
        "llamada": "check_password(\"Éclair123\")",
        "salida": "[]",
        "codigo": "print(check_password(\"Éclair123\"))",
        "tipo": "list"
      }
    ],
    "pistas": [
      "Use a Boolean for each check.",
      "Add the messages after you go through the text."
    ],
    "ejemplo": "check_password(\"Abcdefg1\") → []"
  },
  {
    "id": "retos-2",
    "tema": "retos",
    "tipo": "disena",
    "dificultad": 3,
    "titulo": "Caesar cipher",
    "enunciado": [
      "Design caesar_encrypt(text, shift). Shift only letters from a to z. Go back to a after z and keep all other characters. Accept negative shifts."
    ],
    "codigo": "",
    "solucion": "def caesar_encrypt(text, shift):\n    result = \"\"\n    for letter in text:\n        if \"a\" <= letter <= \"z\":\n            index = (ord(letter) - ord(\"a\") + shift) % 26\n            letter = chr(ord(\"a\") + index)\n        result += letter\n    return result",
    "pruebas": [
      {
        "llamada": "caesar_encrypt(\"xyz\", 3)",
        "salida": "abc",
        "codigo": "print(caesar_encrypt(\"xyz\", 3))",
        "tipo": "str"
      },
      {
        "llamada": "caesar_encrypt(\"a-É Z\", -1)",
        "salida": "z-É Z",
        "codigo": "print(caesar_encrypt(\"a-É Z\", -1))",
        "tipo": "str"
      },
      {
        "llamada": "caesar_encrypt(\"\", 2)",
        "salida": "",
        "codigo": "print(caesar_encrypt(\"\", 2))",
        "tipo": "str"
      },
      {
        "llamada": "caesar_encrypt(\"hello\", 26)",
        "salida": "hello",
        "codigo": "print(caesar_encrypt(\"hello\", 26))",
        "tipo": "str"
      },
      {
        "llamada": "caesar_encrypt(\"a\", 53)",
        "salida": "b",
        "codigo": "print(caesar_encrypt(\"a\", 53))",
        "tipo": "str"
      }
    ],
    "pistas": [
      "Use ord to get the position.",
      "Use the remainder after dividing by 26, then convert with chr."
    ],
    "ejemplo": "caesar_encrypt(\"xyz\", 3) → abc"
  },
  {
    "id": "retos-3",
    "tema": "retos",
    "tipo": "disena",
    "dificultad": 3,
    "titulo": "Decode a Caesar cipher",
    "enunciado": [
      "Design caesar_decrypt(text, shift). Use caesar_encrypt to undo the shift. The function from the last exercise is already in the editor."
    ],
    "codigo": "def caesar_encrypt(text, shift):\n    result = \"\"\n    for letter in text:\n        if \"a\" <= letter <= \"z\":\n            index = (ord(letter) - ord(\"a\") + shift) % 26\n            letter = chr(ord(\"a\") + index)\n        result += letter\n    return result",
    "solucion": "def caesar_encrypt(text, shift):\n    result = \"\"\n    for letter in text:\n        if \"a\" <= letter <= \"z\":\n            index = (ord(letter) - ord(\"a\") + shift) % 26\n            letter = chr(ord(\"a\") + index)\n        result += letter\n    return result\n\ndef caesar_decrypt(text, shift):\n    return caesar_encrypt(text, -shift)",
    "pruebas": [
      {
        "llamada": "caesar_decrypt(\"abc\", 3)",
        "salida": "xyz",
        "codigo": "print(caesar_decrypt(\"abc\", 3))",
        "tipo": "str"
      },
      {
        "llamada": "caesar_decrypt(\"z-É Z\", -1)",
        "salida": "a-É Z",
        "codigo": "print(caesar_decrypt(\"z-É Z\", -1))",
        "tipo": "str"
      },
      {
        "llamada": "caesar_decrypt(\"\", 4)",
        "salida": "",
        "codigo": "print(caesar_decrypt(\"\", 4))",
        "tipo": "str"
      },
      {
        "llamada": "caesar_decrypt(\"a\", 26)",
        "salida": "a",
        "codigo": "print(caesar_decrypt(\"a\", 26))",
        "tipo": "str"
      }
    ],
    "pistas": [
      "To decode, shift in the opposite direction.",
      "Pass the negative of the shift to caesar_encrypt."
    ],
    "requiere": [
      "cifrar_cesar"
    ],
    "ejemplo": "caesar_decrypt(\"abc\", 3) → xyz",
    "idioma": "en"
  },
  {
    "id": "retos-4",
    "tema": "retos",
    "tipo": "disena",
    "dificultad": 3,
    "titulo": "Grade summary",
    "enunciado": [
      "Design grade_summary(grades). Return the keys average, max, and min. Round the average to two decimal places. For an empty list, set all three values to None."
    ],
    "codigo": "",
    "solucion": "def grade_summary(grades):\n    if not grades:\n        return {\"average\": None, \"max\": None, \"min\": None}\n    return {\"average\": round(sum(grades) / len(grades), 2), \"max\": max(grades), \"min\": min(grades)}",
    "pruebas": [
      {
        "llamada": "grade_summary([1, 2, 2])",
        "salida": "{'average': 1.67, 'max': 2, 'min': 1}",
        "codigo": "print(grade_summary([1, 2, 2]))",
        "tipo": "dict"
      },
      {
        "llamada": "grade_summary([0])",
        "salida": "{'average': 0.0, 'max': 0, 'min': 0}",
        "codigo": "print(grade_summary([0]))",
        "tipo": "dict"
      },
      {
        "llamada": "grade_summary([])",
        "salida": "{'average': None, 'max': None, 'min': None}",
        "codigo": "print(grade_summary([]))",
        "tipo": "dict"
      }
    ],
    "pistas": [
      "Check if the list is empty.",
      "Calculate and round the average before returning it."
    ],
    "ejemplo": "grade_summary([1, 2, 2]) → {'average': 1.67, 'max': 2, 'min': 1}"
  },
  {
    "id": "retos-5",
    "tema": "retos",
    "tipo": "crea",
    "dificultad": 3,
    "titulo": "The three most common words",
    "enunciado": [
      "Count the words in text, separated by spaces. Keep uppercase and lowercase separate. Use sorted with key to show up to three words, starting with the most common. Print the word and count on one line for each result. For ties, use the order in which the words first appear. Keep the first line."
    ],
    "codigo": "text = \"sun sea sun moon sea sun air\"",
    "solucion": "text = \"sun sea sun moon sea sun air\"\ncounts = {}\nfor word in text.split():\n    counts[word] = counts.get(word, 0) + 1\ndef frequency(word):\n    return counts[word]\nfor word in sorted(counts, key=frequency, reverse=True)[:3]:\n    print(word, counts[word])",
    "salidaEsperada": "sun 3\nsea 2\nmoon 1",
    "datos": [
      {
        "linea": "text = \"z a b b\"",
        "salida": "b 2\nz 1\na 1"
      },
      {
        "linea": "text = \"\"",
        "salida": ""
      }
    ],
    "pistas": [
      "Use a dictionary to store the counts.",
      "Define a function that returns the count and pass it as key."
    ],
    "requiere": [
      "sorted-key"
    ],
    "ejemplo": "sun sea sun → sun 2 and sea 1 on separate lines"
  },
  {
    "id": "retos-6",
    "tema": "retos",
    "tipo": "disena",
    "dificultad": 2,
    "titulo": "Is it prime?",
    "enunciado": [
      "Design is_prime(n) for integers. Return True if n has exactly two different positive divisors. Otherwise return False."
    ],
    "codigo": "",
    "solucion": "def is_prime(n):\n    if n < 2:\n        return False\n    divisor = 2\n    while divisor * divisor <= n:\n        if n % divisor == 0:\n            return False\n        divisor += 1\n    return True",
    "pruebas": [
      {
        "llamada": "is_prime(0)",
        "salida": "False",
        "codigo": "print(is_prime(0))",
        "tipo": "bool"
      },
      {
        "llamada": "is_prime(1)",
        "salida": "False",
        "codigo": "print(is_prime(1))",
        "tipo": "bool"
      },
      {
        "llamada": "is_prime(2)",
        "salida": "True",
        "codigo": "print(is_prime(2))",
        "tipo": "bool"
      },
      {
        "llamada": "is_prime(9)",
        "salida": "False",
        "codigo": "print(is_prime(9))",
        "tipo": "bool"
      },
      {
        "llamada": "is_prime(13)",
        "salida": "True",
        "codigo": "print(is_prime(13))",
        "tipo": "bool"
      },
      {
        "llamada": "is_prime(97)",
        "salida": "True",
        "codigo": "print(is_prime(97))",
        "tipo": "bool"
      },
      {
        "llamada": "is_prime(-3)",
        "salida": "False",
        "codigo": "print(is_prime(-3))",
        "tipo": "bool"
      },
      {
        "llamada": "is_prime(49)",
        "salida": "False",
        "codigo": "print(is_prime(49))",
        "tipo": "bool"
      }
    ],
    "pistas": [
      "Numbers below 2 are never prime.",
      "Stop checking when a divisor squared is greater than n."
    ],
    "ejemplo": "is_prime(13) → True"
  },
  {
    "id": "retos-7",
    "tema": "retos",
    "tipo": "crea",
    "dificultad": 3,
    "titulo": "Shop menu",
    "enunciado": [
      "Start with an empty list. Each time through the loop, print 1 View | 2 Add | 3 Exit and read with input() without a prompt. For 1, print the list. For 2, read an item and add it. For 3, print See you soon and stop. For any other choice, print Invalid choice."
    ],
    "codigo": "",
    "solucion": "products = []\nwhile True:\n    print(\"1 View | 2 Add | 3 Exit\")\n    choice = input()\n    if choice == \"1\":\n        print(products)\n    elif choice == \"2\":\n        products.append(input())\n    elif choice == \"3\":\n        print(\"See you soon\")\n        break\n    else:\n        print(\"Invalid choice\")",
    "casos": [
      {
        "entradas": [
          "3"
        ],
        "salida": "1 View | 2 Add | 3 Exit\nSee you soon"
      },
      {
        "entradas": [
          "1",
          "3"
        ],
        "salida": "1 View | 2 Add | 3 Exit\n[]\n1 View | 2 Add | 3 Exit\nSee you soon"
      },
      {
        "entradas": [
          "2",
          "bread",
          "2",
          "milk",
          "1",
          "3"
        ],
        "salida": "1 View | 2 Add | 3 Exit\n1 View | 2 Add | 3 Exit\n1 View | 2 Add | 3 Exit\n['bread', 'milk']\n1 View | 2 Add | 3 Exit\nSee you soon"
      },
      {
        "entradas": [
          "x",
          "3"
        ],
        "salida": "1 View | 2 Add | 3 Exit\nInvalid choice\n1 View | 2 Add | 3 Exit\nSee you soon"
      }
    ],
    "pistas": [
      "Repeat the menu with while.",
      "Do one action in each branch. Use break to exit."
    ],
    "requiere": [
      "while",
      "input"
    ],
    "ejemplo": "1 with an empty shop → []"
  }
];
if (typeof module !== 'undefined') module.exports = ejercicios;
else (CR.EjerciciosEn ||= []).push(...ejercicios);
})(globalThis.CR ||= {});
