(function () {
  'use strict';
  const tema = {
    nombre: "Dictionaries",
    frase: "Store and find data by key.",
    necesita: "Lists, Loops",
    pasos: [
      {
        tipo: "explica",
        titulo: "Data with names",
        texto: [
          "A list uses positions. A dictionary uses keys, and each key has a value. Change the name and run the code."
        ],
        codigo: "person = {\"name\": \"Emma\", \"age\": 30}\n" +
          "print(person[\"name\"])"
      },
      {
        tipo: "explica",
        titulo: "Add and change",
        texto: [
          "Assigning to a new key adds a pair. Assigning to an existing key changes its value. Use Step by step and look at Variables. Then try another city."
        ],
        codigo: "person = {\"name\": \"Emma\", \"age\": 30}\n" +
          "person[\"city\"] = \"Lima\"\n" +
          "person[\"age\"] = 31\n" +
          "print(person)"
      },
      {
        tipo: "arregla",
        titulo: "The height is missing",
        texto: [
          "Reading a key that is missing gives a `KeyError`. Fix the code so it prints \"no data\"."
        ],
        objetivo: "Reading a key that is missing gives a `KeyError`. Fix the code so it prints \"no data\".",
        codigo: "person = {\"name\": \"Emma\", \"age\": 30}\n" +
          "print(person[\"height\"])",
        solucion: "person = {\"name\": \"Emma\", \"age\": 30}\n" +
          "print(person.get(\"height\", \"no data\"))",
        pistas: [
          "You can use in to check if \"height\" is in person.",
          "Use .get(\"height\", \"no data\") to give a default value."
        ],
        error: "KeyError",
        salidaEsperada: "no data\n"
      },
      {
        tipo: "explica",
        titulo: "Go through pairs",
        texto: [
          "`for key in person` goes through the keys. `items()` gives pairs called tuples. With two names, the loop puts each part of the pair in a separate variable. Add another key and watch both loops."
        ],
        codigo: "person = {\"name\": \"Emma\", \"age\": 30}\n" +
          "for key in person:\n" +
          "    print(key)\n" +
          "for key, value in person.items():\n" +
          "    print(key, value)"
      },
      {
        tipo: "predice",
        titulo: "Order and size",
        texto: [
          "`len()` counts the pairs. In what order do the keys appear?"
        ],
        codigo: "d = {\"z\": 1, \"a\": 2}\n" +
          "print(len(d), list(d.keys()))",
        opciones: ["2 ['z', 'a']","2 ['a', 'z']","4 ['z', 'a']"],
        correcta: 0,
        pregunta: "What will you see in the console?",
        explicacion: "The keys appear in the order you added them. There are two pairs."
      },
      {
        tipo: "explica",
        titulo: "A list of student records",
        texto: [
          "Each item in the list is a dictionary. Read its keys inside an f-string. Add another student."
        ],
        codigo: "students = [{\"name\": \"Emma\", \"grade\": 8}, {\"name\": \"Leo\", \"grade\": 7}]\n" +
          "for a in students:\n" +
          "    print(f\"{a['name']}: {a['grade']}\")",
        etiqueta: "Combination: dictionaries + lists"
      },
      {
        tipo: "reto",
        titulo: "Count words",
        texto: [
          "Split the sentence and store how many times each word appears. Print the dictionary."
        ],
        objetivo: "Split the sentence and store how many times each word appears. Print the dictionary.",
        codigo: "sentence = \"the cat and the dog\"\n" +
          "count = {}\n" +
          "print(count)",
        solucion: "sentence = \"the cat and the dog\"\n" +
          "count = {}\n" +
          "for word in sentence.split():\n" +
          "    count[word] = count.get(word, 0) + 1\n" +
          "print(count)",
        pistas: [
          "Use split() to get the words.",
          "If the word is new, get(word, 0) returns zero."
        ],
        etiqueta: "Combination: dictionaries + loops",
        requiere: ["dict","for"],
        salidaEsperada: "{'the': 2, 'cat': 1, 'and': 1, 'dog': 1}\n"
      },
      {
        tipo: "reto",
        titulo: "The cart total",
        texto: [
          "Write `cart_total(cart, prices)`. Return the sum of the prices for the items in the list."
        ],
        objetivo: "Write `cart_total(cart, prices)`. Return the sum of the prices for the items in the list.",
        codigo: "def cart_total(cart, prices):\n" +
          "    pass",
        solucion: "def cart_total(cart, prices):\n" +
          "    total = 0\n" +
          "    for product in cart:\n" +
          "        total += prices[product]\n" +
          "    return total",
        pistas: [
          "Use for to go through the cart list.",
          "Use the product as a key in prices and add its value."
        ],
        etiqueta: "Combination: dictionaries + functions",
        pruebas: [
          {"codigo":"print(cart_total([\"bread\", \"tea\", \"bread\"], {\"bread\": 2, \"tea\": 3}))","salida":"7"},
          {"codigo":"print(cart_total([], {}), cart_total([\"apple\"], {\"apple\": 1.5}))","salida":"0 1.5"}
        ]
      },
      {
        tipo: "resumen",
        titulo: "Dictionaries cheat sheet",
        texto: [
          "A dictionary keeps the keys in the order you add them."
        ],
        codigo: "",
        chuleta: [
          ["d = {\"name\": \"Emma\"}","Creates a key and value pair."],
          ["d[\"age\"] = 30","Adds or changes a pair."],
          ["\"age\" in d","Looks for a key."],
          ["d.get(\"height\", \"no data\")","Gives a value if the key is missing."],
          ["for key, value in d.items():","Goes through the pairs and unpacks them."],
          ["del d[\"age\"]","Deletes a pair."]
        ]
      }
    ]
  };
  if (typeof module !== 'undefined') module.exports = tema;
  else (window.CR.TemasEn ||= []).push(tema);
})();
