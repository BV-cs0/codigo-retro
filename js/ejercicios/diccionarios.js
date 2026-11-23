(function () {
  'use strict';
  const ejercicios = [
    {
      "id": "diccionarios-1",
      "tema": "diccionarios",
      "tipo": "disena",
      "dificultad": 1,
      "titulo": "Consulta la agenda",
      "enunciado": [
        "Diseña buscar_telefono(agenda, nombre). Usa get para devolver el teléfono o \"Desconocido\"."
      ],
      "codigo": "",
      "solucion": "def buscar_telefono(agenda, nombre):\n    return agenda.get(nombre, \"Desconocido\")",
      "pruebas": [
        {
          "llamada": "buscar_telefono({\"Ana\": \"555\"}, \"Ana\")",
          "salida": "555",
          "codigo": "print(buscar_telefono({\"Ana\": \"555\"}, \"Ana\"))",
          "tipo": "str"
        },
        {
          "llamada": "buscar_telefono({}, \"Ana\")",
          "salida": "Desconocido",
          "codigo": "print(buscar_telefono({}, \"Ana\"))",
          "tipo": "str"
        },
        {
          "llamada": "buscar_telefono({\"Ana\": 123}, \"Ana\")",
          "salida": "123",
          "codigo": "print(buscar_telefono({\"Ana\": 123}, \"Ana\"))",
          "tipo": "int"
        }
      ],
      "pistas": [
        "Busca por clave con get.",
        "El segundo argumento es el valor por defecto."
      ],
      "requiere": [
        "get"
      ],
      "ejemplo": "buscar_telefono({\"Ana\": \"555\"}, \"Ana\") → 555"
    },
    {
      "id": "diccionarios-2",
      "tema": "diccionarios",
      "tipo": "crea",
      "dificultad": 1,
      "titulo": "Cuenta el stock",
      "enunciado": [
        "Suma todas las cantidades de inventario e imprime el total. Conserva la primera línea."
      ],
      "codigo": "inventario = {\"pan\": 3, \"leche\": 5}",
      "solucion": "inventario = {\"pan\": 3, \"leche\": 5}\nprint(sum(inventario.values()))",
      "salidaEsperada": "8",
      "datos": [
        {
          "linea": "inventario = {}",
          "salida": "0"
        },
        {
          "linea": "inventario = {\"pan\": 0, \"arroz\": 12}",
          "salida": "12"
        }
      ],
      "pistas": [
        "Las cantidades son los valores.",
        "Puedes obtenerlas con values()."
      ],
      "ejemplo": "{\"pan\": 3, \"leche\": 5} → 8"
    },
    {
      "id": "diccionarios-3",
      "tema": "diccionarios",
      "tipo": "disena",
      "dificultad": 2,
      "titulo": "Diccionario invertido",
      "enunciado": [
        "Diseña invertir_dict(d). Intercambia claves y valores. Los valores serán distintos y aptos como claves."
      ],
      "codigo": "",
      "solucion": "def invertir_dict(d):\n    resultado = {}\n    for clave, valor in d.items():\n        resultado[valor] = clave\n    return resultado",
      "pruebas": [
        {
          "llamada": "invertir_dict({\"a\": 1, \"b\": 2})",
          "salida": "{1: 'a', 2: 'b'}",
          "codigo": "print(invertir_dict({\"a\": 1, \"b\": 2}))",
          "tipo": "dict"
        },
        {
          "llamada": "invertir_dict({})",
          "salida": "{}",
          "codigo": "print(invertir_dict({}))",
          "tipo": "dict"
        },
        {
          "llamada": "invertir_dict({3: \"c\"})",
          "salida": "{'c': 3}",
          "codigo": "print(invertir_dict({3: \"c\"}))",
          "tipo": "dict"
        }
      ],
      "pistas": [
        "Recorre los pares con items().",
        "Escribe cada valor como clave."
      ],
      "ejemplo": "invertir_dict({\"a\": 1}) → {1: \"a\"}"
    },
    {
      "id": "diccionarios-4",
      "tema": "diccionarios",
      "tipo": "disena",
      "dificultad": 3,
      "titulo": "El más frecuente",
      "enunciado": [
        "Diseña mas_frecuente(lista). Devuelve el elemento más repetido. Si hay empate, devuelve el que aparece primero. Si la lista está vacía, devuelve None."
      ],
      "codigo": "",
      "solucion": "def mas_frecuente(lista):\n    conteo = {}\n    for valor in lista:\n        conteo[valor] = conteo.get(valor, 0) + 1\n    mejor = None\n    frecuencia = 0\n    for valor in lista:\n        if conteo[valor] > frecuencia:\n            mejor = valor\n            frecuencia = conteo[valor]\n    return mejor",
      "pruebas": [
        {
          "llamada": "mas_frecuente([2, 1, 1, 2])",
          "salida": "2",
          "codigo": "print(mas_frecuente([2, 1, 1, 2]))",
          "tipo": "int"
        },
        {
          "llamada": "mas_frecuente([1, 2, 2, 3])",
          "salida": "2",
          "codigo": "print(mas_frecuente([1, 2, 2, 3]))",
          "tipo": "int"
        },
        {
          "llamada": "mas_frecuente([])",
          "salida": "None",
          "codigo": "print(mas_frecuente([]))",
          "tipo": "NoneType"
        },
        {
          "llamada": "mas_frecuente([\"sí\"])",
          "salida": "sí",
          "codigo": "print(mas_frecuente([\"sí\"]))",
          "tipo": "str"
        }
      ],
      "pistas": [
        "Primero cuenta las apariciones.",
        "Cambia de elección solo si la frecuencia mejora."
      ],
      "ejemplo": "mas_frecuente([2, 1, 1, 2]) → 2"
    },
    {
      "id": "diccionarios-5",
      "tema": "diccionarios",
      "tipo": "crea",
      "dificultad": 2,
      "titulo": "Grupos por inicial",
      "enunciado": [
        "Agrupa las palabras no vacías de palabras por su primer carácter. Imprime un diccionario de listas en orden de llegada. Conserva la primera línea."
      ],
      "codigo": "palabras = [\"sol\", \"luna\", \"sal\"]",
      "solucion": "palabras = [\"sol\", \"luna\", \"sal\"]\ngrupos = {}\nfor palabra in palabras:\n    inicial = palabra[0]\n    if inicial not in grupos:\n        grupos[inicial] = []\n    grupos[inicial].append(palabra)\nprint(grupos)",
      "salidaEsperada": "{'s': ['sol', 'sal'], 'l': ['luna']}",
      "datos": [
        {
          "linea": "palabras = []",
          "salida": "{}"
        },
        {
          "linea": "palabras = [\"ala\", \"Ana\", \"ave\"]",
          "salida": "{'a': ['ala', 'ave'], 'A': ['Ana']}"
        }
      ],
      "pistas": [
        "Usa la primera letra como clave.",
        "Crea una lista vacía para cada inicial nueva."
      ],
      "ejemplo": "['sol', 'luna', 'sal'] → {'s': ['sol', 'sal'], 'l': ['luna']}"
    }
  ];
  if (typeof module !== 'undefined') module.exports = ejercicios;
  else (window.CR.Ejercicios ||= []).push(...ejercicios);
})();
