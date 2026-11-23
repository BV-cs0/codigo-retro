(function () {
  'use strict';
  const ejercicios = [
    {
      "id": "retos-1",
      "tema": "retos",
      "tipo": "disena",
      "dificultad": 3,
      "titulo": "Comprueba una contraseña",
      "enunciado": [
        "Diseña validar_contraseña(c). Devuelve una lista con los problemas en este orden: \"Mínimo 8 caracteres\", \"Falta un número\", \"Falta una mayúscula\". Considera dígitos 0–9 y mayúsculas según isupper(). Si cumple todo devuelve []."
      ],
      "codigo": "",
      "solucion": "def validar_contraseña(c):\n    problemas = []\n    numero = False\n    mayuscula = False\n    for caracter in c:\n        if caracter in \"0123456789\":\n            numero = True\n        if caracter.isupper():\n            mayuscula = True\n    if len(c) < 8:\n        problemas.append(\"Mínimo 8 caracteres\")\n    if not numero:\n        problemas.append(\"Falta un número\")\n    if not mayuscula:\n        problemas.append(\"Falta una mayúscula\")\n    return problemas",
      "pruebas": [
        {
          "llamada": "validar_contraseña(\"\")",
          "salida": "['Mínimo 8 caracteres', 'Falta un número', 'Falta una mayúscula']",
          "codigo": "print(validar_contraseña(\"\"))",
          "tipo": "list"
        },
        {
          "llamada": "validar_contraseña(\"Abcdefg1\")",
          "salida": "[]",
          "codigo": "print(validar_contraseña(\"Abcdefg1\"))",
          "tipo": "list"
        },
        {
          "llamada": "validar_contraseña(\"abcdefg1\")",
          "salida": "['Falta una mayúscula']",
          "codigo": "print(validar_contraseña(\"abcdefg1\"))",
          "tipo": "list"
        },
        {
          "llamada": "validar_contraseña(\"Abcdefgh\")",
          "salida": "['Falta un número']",
          "codigo": "print(validar_contraseña(\"Abcdefgh\"))",
          "tipo": "list"
        },
        {
          "llamada": "validar_contraseña(\"A1\")",
          "salida": "['Mínimo 8 caracteres']",
          "codigo": "print(validar_contraseña(\"A1\"))",
          "tipo": "list"
        },
        {
          "llamada": "validar_contraseña(\"abcdefgh\")",
          "salida": "['Falta un número', 'Falta una mayúscula']",
          "codigo": "print(validar_contraseña(\"abcdefgh\"))",
          "tipo": "list"
        },
        {
          "llamada": "validar_contraseña(\"Éxito123\")",
          "salida": "[]",
          "codigo": "print(validar_contraseña(\"Éxito123\"))",
          "tipo": "list"
        }
      ],
      "pistas": [
        "Usa una variable booleana para cada condición.",
        "Añade los mensajes después de recorrer el texto."
      ],
      "ejemplo": "validar_contraseña(\"Abcdefg1\") → []"
    },
    {
      "id": "retos-2",
      "tema": "retos",
      "tipo": "disena",
      "dificultad": 3,
      "titulo": "Cifrado César",
      "enunciado": [
        "Diseña cifrar_cesar(texto, desplazamiento). Desplaza solo las letras de a a z, vuelve a a después de z y conserva el resto. Acepta desplazamientos negativos."
      ],
      "codigo": "",
      "solucion": "def cifrar_cesar(texto, desplazamiento):\n    resultado = \"\"\n    for letra in texto:\n        if \"a\" <= letra <= \"z\":\n            indice = (ord(letra) - ord(\"a\") + desplazamiento) % 26\n            letra = chr(ord(\"a\") + indice)\n        resultado += letra\n    return resultado",
      "pruebas": [
        {
          "llamada": "cifrar_cesar(\"xyz\", 3)",
          "salida": "abc",
          "codigo": "print(cifrar_cesar(\"xyz\", 3))",
          "tipo": "str"
        },
        {
          "llamada": "cifrar_cesar(\"a-Ñ Z\", -1)",
          "salida": "z-Ñ Z",
          "codigo": "print(cifrar_cesar(\"a-Ñ Z\", -1))",
          "tipo": "str"
        },
        {
          "llamada": "cifrar_cesar(\"\", 2)",
          "salida": "",
          "codigo": "print(cifrar_cesar(\"\", 2))",
          "tipo": "str"
        },
        {
          "llamada": "cifrar_cesar(\"hola\", 26)",
          "salida": "hola",
          "codigo": "print(cifrar_cesar(\"hola\", 26))",
          "tipo": "str"
        },
        {
          "llamada": "cifrar_cesar(\"a\", 53)",
          "salida": "b",
          "codigo": "print(cifrar_cesar(\"a\", 53))",
          "tipo": "str"
        }
      ],
      "pistas": [
        "Usa ord para obtener la posición.",
        "Aplica módulo 26 y convierte con chr."
      ],
      "ejemplo": "cifrar_cesar(\"xyz\", 3) → abc"
    },
    {
      "id": "retos-3",
      "tema": "retos",
      "tipo": "disena",
      "dificultad": 3,
      "titulo": "Descifrado César",
      "enunciado": [
        "Diseña descifrar_cesar(texto, desplazamiento). Usa cifrar_cesar para deshacer el desplazamiento. La función del ejercicio anterior ya está en el editor."
      ],
      "codigo": "def cifrar_cesar(texto, desplazamiento):\n    resultado = \"\"\n    for letra in texto:\n        if \"a\" <= letra <= \"z\":\n            indice = (ord(letra) - ord(\"a\") + desplazamiento) % 26\n            letra = chr(ord(\"a\") + indice)\n        resultado += letra\n    return resultado",
      "solucion": "def cifrar_cesar(texto, desplazamiento):\n    resultado = \"\"\n    for letra in texto:\n        if \"a\" <= letra <= \"z\":\n            indice = (ord(letra) - ord(\"a\") + desplazamiento) % 26\n            letra = chr(ord(\"a\") + indice)\n        resultado += letra\n    return resultado\n\ndef descifrar_cesar(texto, desplazamiento):\n    return cifrar_cesar(texto, -desplazamiento)",
      "pruebas": [
        {
          "llamada": "descifrar_cesar(\"abc\", 3)",
          "salida": "xyz",
          "codigo": "print(descifrar_cesar(\"abc\", 3))",
          "tipo": "str"
        },
        {
          "llamada": "descifrar_cesar(\"z-Ñ Z\", -1)",
          "salida": "a-Ñ Z",
          "codigo": "print(descifrar_cesar(\"z-Ñ Z\", -1))",
          "tipo": "str"
        },
        {
          "llamada": "descifrar_cesar(\"\", 4)",
          "salida": "",
          "codigo": "print(descifrar_cesar(\"\", 4))",
          "tipo": "str"
        },
        {
          "llamada": "descifrar_cesar(\"a\", 26)",
          "salida": "a",
          "codigo": "print(descifrar_cesar(\"a\", 26))",
          "tipo": "str"
        }
      ],
      "pistas": [
        "Descifrar desplaza en sentido contrario.",
        "Pasa el desplazamiento negado a cifrar_cesar."
      ],
      "requiere": [
        "cifrar_cesar"
      ],
      "ejemplo": "descifrar_cesar(\"abc\", 3) → xyz"
    },
    {
      "id": "retos-4",
      "tema": "retos",
      "tipo": "disena",
      "dificultad": 3,
      "titulo": "Resumen de notas",
      "enunciado": [
        "Diseña resumen_notas(notas). Devuelve las claves media, max y min. Redondea la media a dos decimales. Para una lista vacía devuelve None en las tres claves."
      ],
      "codigo": "",
      "solucion": "def resumen_notas(notas):\n    if not notas:\n        return {\"media\": None, \"max\": None, \"min\": None}\n    return {\"media\": round(sum(notas) / len(notas), 2), \"max\": max(notas), \"min\": min(notas)}",
      "pruebas": [
        {
          "llamada": "resumen_notas([1, 2, 2])",
          "salida": "{'media': 1.67, 'max': 2, 'min': 1}",
          "codigo": "print(resumen_notas([1, 2, 2]))",
          "tipo": "dict"
        },
        {
          "llamada": "resumen_notas([0])",
          "salida": "{'media': 0.0, 'max': 0, 'min': 0}",
          "codigo": "print(resumen_notas([0]))",
          "tipo": "dict"
        },
        {
          "llamada": "resumen_notas([])",
          "salida": "{'media': None, 'max': None, 'min': None}",
          "codigo": "print(resumen_notas([]))",
          "tipo": "dict"
        }
      ],
      "pistas": [
        "Comprueba si la lista está vacía.",
        "Calcula y redondea la media antes de devolverla."
      ],
      "ejemplo": "resumen_notas([1, 2, 2]) → {'media': 1.67, 'max': 2, 'min': 1}"
    },
    {
      "id": "retos-5",
      "tema": "retos",
      "tipo": "crea",
      "dificultad": 3,
      "titulo": "Las tres palabras más frecuentes",
      "enunciado": [
        "Cuenta las palabras de texto separadas por espacios, distinguiendo mayúsculas. Usa sorted con key para mostrar hasta tres, de mayor a menor frecuencia, una línea palabra cantidad por resultado. En empate conserva el orden de primera aparición. Conserva la primera línea."
      ],
      "codigo": "texto = \"sol mar sol luna mar sol aire\"",
      "solucion": "texto = \"sol mar sol luna mar sol aire\"\nconteo = {}\nfor palabra in texto.split():\n    conteo[palabra] = conteo.get(palabra, 0) + 1\ndef frecuencia(palabra):\n    return conteo[palabra]\nfor palabra in sorted(conteo, key=frecuencia, reverse=True)[:3]:\n    print(palabra, conteo[palabra])",
      "salidaEsperada": "sol 3\nmar 2\nluna 1",
      "datos": [
        {
          "linea": "texto = \"z a b b\"",
          "salida": "b 2\nz 1\na 1"
        },
        {
          "linea": "texto = \"\"",
          "salida": ""
        }
      ],
      "pistas": [
        "Un diccionario guarda el número de apariciones.",
        "Define una función que devuelva la frecuencia para key."
      ],
      "requiere": [
        "sorted-key"
      ],
      "ejemplo": "sol mar sol → sol 2 y mar 1 en líneas separadas"
    },
    {
      "id": "retos-6",
      "tema": "retos",
      "tipo": "disena",
      "dificultad": 2,
      "titulo": "¿Es primo?",
      "enunciado": [
        "Diseña es_primo(n) para enteros. Devuelve True si n tiene exactamente dos divisores positivos distintos, o False en cualquier otro caso."
      ],
      "codigo": "",
      "solucion": "def es_primo(n):\n    if n < 2:\n        return False\n    divisor = 2\n    while divisor * divisor <= n:\n        if n % divisor == 0:\n            return False\n        divisor += 1\n    return True",
      "pruebas": [
        {
          "llamada": "es_primo(0)",
          "salida": "False",
          "codigo": "print(es_primo(0))",
          "tipo": "bool"
        },
        {
          "llamada": "es_primo(1)",
          "salida": "False",
          "codigo": "print(es_primo(1))",
          "tipo": "bool"
        },
        {
          "llamada": "es_primo(2)",
          "salida": "True",
          "codigo": "print(es_primo(2))",
          "tipo": "bool"
        },
        {
          "llamada": "es_primo(9)",
          "salida": "False",
          "codigo": "print(es_primo(9))",
          "tipo": "bool"
        },
        {
          "llamada": "es_primo(13)",
          "salida": "True",
          "codigo": "print(es_primo(13))",
          "tipo": "bool"
        },
        {
          "llamada": "es_primo(97)",
          "salida": "True",
          "codigo": "print(es_primo(97))",
          "tipo": "bool"
        },
        {
          "llamada": "es_primo(-3)",
          "salida": "False",
          "codigo": "print(es_primo(-3))",
          "tipo": "bool"
        },
        {
          "llamada": "es_primo(49)",
          "salida": "False",
          "codigo": "print(es_primo(49))",
          "tipo": "bool"
        }
      ],
      "pistas": [
        "Los números menores que 2 no son primos.",
        "Basta probar divisores hasta que su cuadrado supere n."
      ],
      "ejemplo": "es_primo(13) → True"
    },
    {
      "id": "retos-7",
      "tema": "retos",
      "tipo": "crea",
      "dificultad": 3,
      "titulo": "Menú de tienda",
      "enunciado": [
        "Empieza con una lista vacía. En cada vuelta imprime 1 Ver | 2 Añadir | 3 Salir y lee con input() sin mensaje. Con 1 imprime la lista, con 2 lee un producto y añádelo, con 3 imprime Hasta pronto y termina. Para otras opciones imprime Opción inválida."
      ],
      "codigo": "",
      "solucion": "productos = []\nwhile True:\n    print(\"1 Ver | 2 Añadir | 3 Salir\")\n    opcion = input()\n    if opcion == \"1\":\n        print(productos)\n    elif opcion == \"2\":\n        productos.append(input())\n    elif opcion == \"3\":\n        print(\"Hasta pronto\")\n        break\n    else:\n        print(\"Opción inválida\")",
      "casos": [
        {
          "entradas": [
            "3"
          ],
          "salida": "1 Ver | 2 Añadir | 3 Salir\nHasta pronto"
        },
        {
          "entradas": [
            "1",
            "3"
          ],
          "salida": "1 Ver | 2 Añadir | 3 Salir\n[]\n1 Ver | 2 Añadir | 3 Salir\nHasta pronto"
        },
        {
          "entradas": [
            "2",
            "pan",
            "2",
            "leche",
            "1",
            "3"
          ],
          "salida": "1 Ver | 2 Añadir | 3 Salir\n1 Ver | 2 Añadir | 3 Salir\n1 Ver | 2 Añadir | 3 Salir\n['pan', 'leche']\n1 Ver | 2 Añadir | 3 Salir\nHasta pronto"
        },
        {
          "entradas": [
            "x",
            "3"
          ],
          "salida": "1 Ver | 2 Añadir | 3 Salir\nOpción inválida\n1 Ver | 2 Añadir | 3 Salir\nHasta pronto"
        }
      ],
      "pistas": [
        "Repite el menú con while.",
        "Dentro de cada rama realiza una sola acción. Usa break para salir."
      ],
      "requiere": [
        "while",
        "input"
      ],
      "ejemplo": "1 con la tienda vacía → []"
    }
  ];
  if (typeof module !== 'undefined') module.exports = ejercicios;
  else (window.CR.Ejercicios ||= []).push(...ejercicios);
})();
