(function () {
  'use strict';
  const tema = {
    nombre: "Condiciones",
    frase: "Decide qué instrucciones ejecutar.",
    necesita: "Variables.",
    pasos: [
      {
        tipo: "explica",
        titulo: "Un bloque con if",
        texto: [
          "`if` ejecuta el bloque si la condición es verdadera. Los dos puntos abren el bloque y la sangría agrupa sus instrucciones.",
          "Prueba con `edad = 17`."
        ],
        recuerda: "Los dos puntos abren el bloque. Mantén la misma sangría en todo el bloque.",
        codigo: `edad = 18
if edad >= 18:
    print('Acceso permitido')`
      },
      {
        tipo: "explica",
        titulo: "El otro caso",
        texto: [
          "`else` ejecuta su bloque si la condición del `if` es falsa.",
          "Cambia la edad a 21."
        ],
        codigo: `edad = 16
if edad >= 18:
    print('Acceso permitido')
else:
    print('Acceso restringido')`
      },
      {
        tipo: "explica",
        titulo: "Más de dos casos",
        texto: [
          "`elif` prueba una condición adicional si las anteriores son falsas. Python ejecuta el primer bloque que encaja.",
          "Prueba con las notas 8, 5 y 4."
        ],
        codigo: `nota = 6
if nota >= 7:
    print('notable')
elif nota >= 5:
    print('aprobado')
else:
    print('suspenso')`
      },
      {
        tipo: "predice",
        titulo: "El orden de las ramas",
        texto: [
          "Las dos comparaciones son verdaderas si `n` vale 12."
        ],
        codigo: `n = 12
if n > 5:
    print('Mayor que 5')
elif n > 10:
    print('Mayor que 10')`,
        pregunta: "¿Qué ocurre al ejecutar el código?",
        opciones: ["Mayor que 10","Mayor que 5","Mayor que 5\nMayor que 10"],
        correcta: 1,
        explicacion: "La primera rama coincide y las demás se omiten. Pon la prueba más específica primero si quieres distinguir ambos casos."
      },
      {
        tipo: "explica",
        titulo: "Asignar y comparar",
        texto: [
          "`=` asigna un valor. `==` compara igualdad y `!=` compara diferencia. `<`, `>`, `<=` y `>=` indican orden.",
          "Cambia `x` a 5 y compara las dos líneas."
        ],
        codigo: `x = 4
print(x == 4, x != 4)
print(x < 5, x > 5, x <= 4, x >= 4)`
      },
      {
        tipo: "explica",
        titulo: "Combinar condiciones",
        texto: [
          "`and` exige ambas, `or` exige al menos una y `not` invierte el resultado.",
          "Cambia `b` a `True` y comprueba qué fila cambia."
        ],
        codigo: `a = True
b = False
print('Operación | Resultado')
print('a and b   |', a and b)
print('a or b    |', a or b)
print('not a     |', not a)`
      },
      {
        tipo: "arregla",
        titulo: "El inicio del bloque",
        texto: [
          "Ejecuta el código y corrige la cabecera para imprimir `Entrada abierta`."
        ],
        codigo: `abierto = True
if abierto
    print('Entrada abierta')`,
        objetivo: "Corrige la cabecera del if.",
        salidaEsperada: "Entrada abierta",
        requiere: ["if"],
        pistas: ["La cabecera if debe terminar en un signo.","Pon dos puntos después de abierto y conserva la sangría del print()."],
        error: "SyntaxError",
        solucion: `abierto = True
if abierto:
    print('Entrada abierta')`
      },
      {
        tipo: "reto",
        titulo: "Consejo según la temperatura",
        texto: [
          "Con 30 grados o más, imprime `Busca sombra`. Entre 15 y 29, `Sal a caminar`. Con menos de 15, `Ponte una chaqueta`. Usa `elif`."
        ],
        etiqueta: "Combinación: condiciones + variables",
        codigo: `temperatura = 22
# Escribe las tres ramas`,
        objetivo: "Muestra el consejo adecuado para la temperatura.",
        salidaEsperada: "Sal a caminar",
        requiere: ["if","elif"],
        pistas: ["Empieza por el caso de 30 grados o más.","Después prueba temperatura >= 15 con elif. Deja el último caso para else."],
        solucion: `temperatura = 22
if temperatura >= 30:
    print('Busca sombra')
elif temperatura >= 15:
    print('Sal a caminar')
else:
    print('Ponte una chaqueta')`
      },
      {
        tipo: "mundo",
        titulo: "Rocas en el túnel",
        texto: [
          "Pico tiene tres casillas hasta el cristal. Antes de cada `avanzar()`, comprueba `hay_roca_blanda()` y usa `picar()` si hace falta. Puedes repetir el bloque por cada casilla."
        ],
        codigo: "# Comprueba el camino y avanza",
        objetivo: "Guía a Pico hasta el cristal.",
        requiere: ["if"],
        pistas: ["Comprueba la casilla de delante antes de cada avance.","Deja avanzar() fuera del bloque if: también debes avanzar si el camino está libre."],
        mundo: {"demo":"robot","mapa":{"trazo":"EEE","inicio":[1,3],"objetos":{"2,3":"r","3,3":"r"}}},
        solucion: `if hay_roca_blanda():
    picar()
avanzar()
if hay_roca_blanda():
    picar()
avanzar()
if hay_roca_blanda():
    picar()
avanzar()`
      },
      {
        tipo: "resumen",
        titulo: "Chuleta de condiciones",
        texto: [
          "Ordena las ramas según qué casos quieras distinguir."
        ],
        codigo: "",
        chuleta: [
          ["if edad >= 18:","Abre un bloque condicionado."],
          ["elif edad >= 16:","Prueba otra condición si la anterior es falsa."],
          ["else:","Cubre los demás casos."],
          ["x == 3","Compara dos valores."],
          ["x > 0 and x < 10","Exige que se cumplan ambas comparaciones."],
          ["not terminado","Invierte el valor lógico."]
        ]
      }
    ]
  };
  if (typeof module !== 'undefined') module.exports = tema;
  else (window.CR.Temas ||= []).push(tema);
})();
