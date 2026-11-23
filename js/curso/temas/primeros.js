(function () {
  'use strict';
  const tema = {
    nombre: "Primeros pasos",
    frase: "Escribe instrucciones y lee la consola.",
    necesita: "Ningún tema previo.",
    pasos: [
      {
        tipo: "explica",
        titulo: "Tu primera instrucción",
        texto: [
          "Una instrucción le pide a Python que haga algo. `print()` escribe en la consola, el panel de la derecha.",
          "Cambia el saludo y vuelve a ejecutar."
        ],
        codigo: "print(\"Hola, mundo\")"
      },
      {
        tipo: "explica",
        titulo: "Texto o cálculo",
        texto: [
          "Las comillas delimitan un texto. Sin comillas, Python calcula la suma.",
          "Cambia 5 por 9 en las dos instrucciones."
        ],
        recuerda: "Las comillas delimitan un texto. Python calcula las operaciones entre números.",
        codigo: `print("5 + 3")
print(5 + 3)`
      },
      {
        tipo: "predice",
        titulo: "Multiplicar un texto",
        texto: [
          "El `2` está entre comillas."
        ],
        codigo: "print(\"2\" * 3)",
        pregunta: "¿Qué ocurre al ejecutar el código?",
        opciones: ["6","222","Un error"],
        correcta: 1,
        explicacion: "Multiplicar un texto por un entero lo repite."
      },
      {
        tipo: "explica",
        titulo: "De arriba abajo",
        texto: [
          "Python ejecuta las instrucciones en orden. `print()` separa los valores con espacios.",
          "Invierte las dos instrucciones."
        ],
        codigo: `print('Inicio')
print('Total:', 5 + 3)`
      },
      {
        tipo: "explica",
        titulo: "Comentarios",
        texto: [
          "El `#` que está fuera de las comillas marca un comentario hasta el final de la línea.",
          "Cambia la nota y comprueba la salida."
        ],
        codigo: `# Saludo de bienvenida
print('Hola')  # Saludo por consola`
      },
      {
        tipo: "arregla",
        titulo: "Falta cerrar el texto",
        texto: [
          "Ejecuta el ejemplo y lee el error. Corrige el código para que muestre `Hola`."
        ],
        codigo: "print(\"Hola)",
        objetivo: "Imprime Hola.",
        salidaEsperada: "Hola",
        pistas: ["El texto empieza con una comilla doble.","Ciérralo con otra comilla doble antes del paréntesis."],
        error: "SyntaxError",
        solucion: "print(\"Hola\")"
      },
      {
        tipo: "reto",
        titulo: "Tarjeta de presentación",
        texto: [
          "Imprime tres líneas exactas: `Lucía`, `Diseño` y `Madrid`, en ese orden."
        ],
        codigo: "# Escribe aquí tu tarjeta",
        objetivo: "Imprime una tarjeta de tres líneas.",
        salidaEsperada: "Lucía\nDiseño\nMadrid",
        pistas: ["Usa una llamada a print() por línea.","Escribe Lucía, Diseño y Madrid entre comillas, con las tildes del enunciado."],
        solucion: `print('Lucía')
print('Diseño')
print('Madrid')`
      },
      {
        tipo: "resumen",
        titulo: "Chuleta de primeros pasos",
        texto: [
          "Ya puedes escribir instrucciones, mostrar resultados y dejar notas en el código."
        ],
        codigo: "",
        chuleta: [
          ["print('Hola')","Muestra un texto."],
          ["print(5 + 3)","Calcula y muestra el resultado."],
          ["print('5 + 3')","Muestra el texto literal."],
          ["print('Total:', 8)","Separa los valores con un espacio."],
          ["# Nota","Python ignora el comentario."]
        ]
      }
    ]
  };
  if (typeof module !== 'undefined') module.exports = tema;
  else (window.CR.Temas ||= []).push(tema);
})();
