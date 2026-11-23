(function () {
  'use strict';
  const tema = {
    nombre: "Variables",
    frase: "Guarda valores y úsalos en cálculos.",
    necesita: "Primeros pasos.",
    pasos: [
      {
        tipo: "explica",
        titulo: "Nombrar un valor",
        texto: [
          "Una variable es un nombre para un valor. `=` asigna el valor de la derecha al nombre de la izquierda.",
          "Cambia `Ana` por tu nombre."
        ],
        codigo: `nombre = "Ana"
print(nombre)`
      },
      {
        tipo: "explica",
        titulo: "El último valor",
        texto: [
          "Puedes volver a asignar una variable. Usa «Paso a paso» y mira el panel Variables.",
          "Añade otra asignación antes del último `print()`."
        ],
        codigo: `puntos = 3
print(puntos)
puntos = 8
print(puntos)`
      },
      {
        tipo: "explica",
        titulo: "Operaciones",
        texto: [
          "`+`, `-` y `*` suman, restan y multiplican. `/` devuelve un decimal. `//` redondea hacia abajo, `%` calcula el resto y `**` eleva a una potencia.",
          "Prueba con `a = 8`."
        ],
        recuerda: "La división con / devuelve un float, incluso cuando el resultado es entero.",
        codigo: `a = 7
b = 2
print(a + b)
print(a - b)
print(a * b)
print(a / b)
print(a // b)
print(a % b)
print(a ** b)`
      },
      {
        tipo: "predice",
        titulo: "Actualizar un número",
        texto: [
          "Python calcula primero el lado derecho de la asignación."
        ],
        codigo: `x = 5
x = x + 1
print(x)`,
        pregunta: "¿Qué ocurre al ejecutar el código?",
        opciones: ["5","6","11"],
        correcta: 1,
        explicacion: "Se suma 1 al valor anterior y se guarda 6. Aquí `x += 1` hace lo mismo."
      },
      {
        tipo: "explica",
        titulo: "Insertar valores en texto",
        texto: [
          "Una f-string empieza por `f` antes de las comillas. Python calcula lo que va entre llaves.",
          "Cambia `edad` y vuelve a ejecutar."
        ],
        codigo: `edad = 30
print(f"Tengo {edad} años")`
      },
      {
        tipo: "arregla",
        titulo: "Texto y número",
        texto: [
          "Corrige el error para imprimir `Edad: 30` con `str()` o una f-string."
        ],
        codigo: "print(\"Edad: \" + 30)",
        objetivo: "Combina el texto con el número 30.",
        salidaEsperada: "Edad: 30",
        pistas: ["El + necesita dos textos si quieres concatenar.","Convierte 30 con str(30) o escribe f\"Edad: {30}\"."],
        error: "TypeError",
        solucion: "print('Edad: ' + str(30))"
      },
      {
        tipo: "predice",
        titulo: "Asignar otra variable",
        texto: [
          "Fíjate en cuándo se asigna un valor a cada nombre."
        ],
        codigo: `a = 3
b = a
a = 10
print(b)`,
        pregunta: "¿Qué ocurre al ejecutar el código?",
        opciones: ["10","13","3"],
        correcta: 2,
        explicacion: "Cuando se asigna `b`, el valor de `a` es 3. Después se asigna 10 solo a `a`."
      },
      {
        tipo: "reto",
        titulo: "Total con IVA",
        texto: [
          "Suma tres precios de 10, 15 y 25 euros. Añade el 21 % de IVA y usa una f-string para mostrar `Total: 60.5 euros`."
        ],
        codigo: `a = 10
b = 15
c = 25
iva = 0.21`,
        objetivo: "Calcula y muestra el precio con IVA.",
        salidaEsperada: "Total: 60.5 euros",
        requiere: ["fstring"],
        pistas: ["Suma los tres precios en una variable.","Añade subtotal * iva a subtotal e inserta el total entre llaves."],
        solucion: `a = 10
b = 15
c = 25
iva = 0.21
subtotal = a + b + c
total = subtotal + subtotal * iva
print(f'Total: {total} euros')`
      },
      {
        tipo: "resumen",
        titulo: "Chuleta de variables",
        texto: [
          "Guarda resultados intermedios para poder reutilizarlos."
        ],
        codigo: "",
        chuleta: [
          ["nombre = 'Ana'","Asigna un texto."],
          ["x = 5","Asigna un número."],
          ["x += 1","Suma y guarda el nuevo valor."],
          ["4 / 2","La división da 2.0."],
          ["f'Total: {x}'","Inserta un valor en el texto."]
        ]
      }
    ]
  };
  if (typeof module !== 'undefined') module.exports = tema;
  else (window.CR.Temas ||= []).push(tema);
})();
