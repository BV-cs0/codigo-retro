(function () {
  'use strict';
  const ejercicios = [
    {
      "id": "variables-1",
      "tema": "variables",
      "tipo": "crea",
      "dificultad": 2,
      "titulo": "Intercambio",
      "enunciado": [
        "Carga a y b con los dos elementos de valores. Intercámbialas usando una variable auxiliar. Conserva la primera línea e imprime a y b separados por un espacio."
      ],
      "codigo": "valores = [3, 7]",
      "solucion": "valores = [3, 7]\na = valores[0]\nb = valores[1]\naux = a\na = b\nb = aux\nprint(a, b)",
      "salidaEsperada": "7 3",
      "datos": [
        {
          "linea": "valores = [-2, 0]",
          "salida": "0 -2"
        }
      ],
      "pistas": [
        "Guarda a antes de cambiarla.",
        "Asigna b a a y luego la auxiliar a b."
      ],
      "prohibe": [
        "asignacion-multiple"
      ],
      "requiere": [
        "auxiliar"
      ],
      "ejemplo": "3, 7 → 7 3"
    },
    {
      "id": "variables-2",
      "tema": "variables",
      "tipo": "crea",
      "dificultad": 2,
      "titulo": "Horas y minutos",
      "enunciado": [
        "Convierte minutos en horas enteras y minutos restantes. Usa // y %, conserva la primera línea e imprime con las unidades indicadas."
      ],
      "codigo": "minutos = 135",
      "solucion": "minutos = 135\nprint(minutos // 60, \"h\", minutos % 60, \"min\")",
      "salidaEsperada": "2 h 15 min",
      "datos": [
        {
          "linea": "minutos = 61",
          "salida": "1 h 1 min"
        }
      ],
      "pistas": [
        "Una hora tiene 60 minutos.",
        "El resto de la división indica los minutos sobrantes."
      ],
      "requiere": [
        "//",
        "%"
      ],
      "ejemplo": "135 → 2 h 15 min"
    },
    {
      "id": "variables-3",
      "tema": "variables",
      "tipo": "completa",
      "dificultad": 1,
      "titulo": "Precio con IVA",
      "enunciado": [
        "Completa el cálculo del precio con un IVA del 21 %."
      ],
      "codigo": "precio = 100\nprint(___)",
      "solucion": "precio = 100\nprint(precio * 1.21)",
      "salidaEsperada": "121.0",
      "pistas": [
        "Suma al precio el 21 % del mismo.",
        "Multiplicar por 1.21 incluye el precio inicial."
      ],
      "ejemplo": "100 → 121.0"
    },
    {
      "id": "variables-4",
      "tema": "variables",
      "tipo": "arregla",
      "dificultad": 1,
      "titulo": "Texto y número",
      "enunciado": [
        "Corrige la concatenación para mostrar Total: 5."
      ],
      "codigo": "print(\"Total: \" + 5)",
      "solucion": "print(\"Total: \" + str(5))",
      "salidaEsperada": "Total: 5",
      "pistas": [
        "No puedes concatenar texto con un entero.",
        "Convierte el entero usando str()."
      ],
      "ejemplo": "5 → Total: 5",
      "alternativa": "print(\"Total:\", 5)"
    },
    {
      "id": "variables-5",
      "tema": "variables",
      "tipo": "crea",
      "dificultad": 1,
      "titulo": "Una presentación",
      "enunciado": [
        "Lee el nombre, la edad y la ciudad de la lista datos. Usa una f-string para presentarlos con el formato del ejemplo. Conserva la primera línea."
      ],
      "codigo": "datos = [\"Ana\", 20, \"Lima\"]",
      "solucion": "datos = [\"Ana\", 20, \"Lima\"]\nnombre, edad, ciudad = datos\nprint(f\"Soy {nombre}, tengo {edad} años y vivo en {ciudad}.\")",
      "salidaEsperada": "Soy Ana, tengo 20 años y vivo en Lima.",
      "datos": [
        {
          "linea": "datos = [\"Eva\", 31, \"Quito\"]",
          "salida": "Soy Eva, tengo 31 años y vivo en Quito."
        }
      ],
      "pistas": [
        "Coloca una f delante de la comilla inicial.",
        "Escribe cada variable entre llaves."
      ],
      "requiere": [
        "fstring"
      ],
      "ejemplo": "Ana, 20, Lima → Soy Ana, tengo 20 años y vivo en Lima."
    }
  ];
  if (typeof module !== 'undefined') module.exports = ejercicios;
  else (window.CR.Ejercicios ||= []).push(...ejercicios);
})();
