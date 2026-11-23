(function () {
  'use strict';
  const ejercicios = [
    {
      "id": "listas-1",
      "tema": "listas",
      "tipo": "disena",
      "dificultad": 2,
      "titulo": "El máximo, a mano",
      "enunciado": [
        "Diseña maximo(lista) para una lista no vacía. Devuelve su mayor elemento sin usar max()."
      ],
      "codigo": "",
      "solucion": "def maximo(lista):\n    mayor = lista[0]\n    for n in lista:\n        if n > mayor:\n            mayor = n\n    return mayor",
      "pruebas": [
        {
          "llamada": "maximo([4, 9, 2])",
          "salida": "9",
          "codigo": "print(maximo([4, 9, 2]))",
          "tipo": "int"
        },
        {
          "llamada": "maximo([-8, -2, -5])",
          "salida": "-2",
          "codigo": "print(maximo([-8, -2, -5]))",
          "tipo": "int"
        },
        {
          "llamada": "maximo([7])",
          "salida": "7",
          "codigo": "print(maximo([7]))",
          "tipo": "int"
        }
      ],
      "pistas": [
        "Empieza con el primer elemento.",
        "Actualiza el máximo solo cuando encuentres uno mayor."
      ],
      "prohibe": [
        "max"
      ],
      "ejemplo": "maximo([-8, -2, -5]) → -2"
    },
    {
      "id": "listas-2",
      "tema": "listas",
      "tipo": "crea",
      "dificultad": 1,
      "titulo": "Solo los pares",
      "enunciado": [
        "Crea una lista nueva con los números pares de numeros sin cambiar su orden. Conserva la primera línea e imprime la nueva lista."
      ],
      "codigo": "numeros = [1, 2, 3, 4, 0, -6]",
      "solucion": "numeros = [1, 2, 3, 4, 0, -6]\npares = []\nfor n in numeros:\n    if n % 2 == 0:\n        pares.append(n)\nprint(pares)",
      "salidaEsperada": "[2, 4, 0, -6]",
      "datos": [
        {
          "linea": "numeros = []",
          "salida": "[]"
        },
        {
          "linea": "numeros = [7, 8, 8, 1]",
          "salida": "[8, 8]"
        }
      ],
      "pistas": [
        "Los pares tienen resto cero al dividir por 2.",
        "Añade cada par a una lista vacía con append."
      ],
      "ejemplo": "[1, 2, 3, 4, 0, -6] → [2, 4, 0, -6]"
    },
    {
      "id": "listas-3",
      "tema": "listas",
      "tipo": "disena",
      "dificultad": 2,
      "titulo": "Lista al revés",
      "enunciado": [
        "Diseña invertir(lista). Devuelve una lista nueva en orden inverso. Hazlo sin [::-1], reverse() ni reversed()."
      ],
      "codigo": "",
      "solucion": "def invertir(lista):\n    resultado = []\n    for i in range(len(lista) - 1, -1, -1):\n        resultado.append(lista[i])\n    return resultado",
      "pruebas": [
        {
          "llamada": "invertir([1, 2, 3])",
          "salida": "[3, 2, 1]",
          "codigo": "print(invertir([1, 2, 3]))",
          "tipo": "list"
        },
        {
          "llamada": "invertir([])",
          "salida": "[]",
          "codigo": "print(invertir([]))",
          "tipo": "list"
        },
        {
          "llamada": "invertir([\"a\"])",
          "salida": "['a']",
          "codigo": "print(invertir([\"a\"]))",
          "tipo": "list"
        },
        {
          "llamada": "invertir([1, 1, 2])",
          "salida": "[2, 1, 1]",
          "codigo": "print(invertir([1, 1, 2]))",
          "tipo": "list"
        }
      ],
      "pistas": [
        "La última posición es len(lista) - 1.",
        "Recorre los índices con un paso de -1."
      ],
      "prohibe": [
        "corte-inverso",
        "reverse",
        "reversed"
      ],
      "ejemplo": "invertir([1, 2, 3]) → [3, 2, 1]"
    },
    {
      "id": "listas-4",
      "tema": "listas",
      "tipo": "completa",
      "dificultad": 1,
      "titulo": "Una fruta más",
      "enunciado": [
        "Completa el nombre del método que añade mango al final de frutas."
      ],
      "codigo": "frutas = [\"pera\"]\nfrutas.___(\"mango\")\nprint(frutas)",
      "solucion": "frutas = [\"pera\"]\nfrutas.append(\"mango\")\nprint(frutas)",
      "salidaEsperada": "['pera', 'mango']",
      "pistas": [
        "Busca el método que añade al final.",
        "Usa append."
      ],
      "ejemplo": "['pera'] → ['pera', 'mango']"
    },
    {
      "id": "listas-5",
      "tema": "listas",
      "tipo": "arregla",
      "dificultad": 1,
      "titulo": "Índice fuera de rango",
      "enunciado": [
        "Corrige el límite del bucle para imprimir cada elemento una vez, sin IndexError."
      ],
      "codigo": "lista = [\"sol\", \"luna\"]\nfor i in range(len(lista) + 1):\n    print(lista[i])",
      "solucion": "lista = [\"sol\", \"luna\"]\nfor i in range(len(lista)):\n    print(lista[i])",
      "salidaEsperada": "sol\nluna",
      "pistas": [
        "El índice inicial es cero.",
        "range ya excluye su límite final."
      ],
      "ejemplo": "[\"sol\", \"luna\"] → sol y luna, en líneas separadas."
    }
  ];
  if (typeof module !== 'undefined') module.exports = ejercicios;
  else (window.CR.Ejercicios ||= []).push(...ejercicios);
})();
