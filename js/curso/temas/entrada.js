(function () {
  'use strict';
  const { explica, predice, reto, resumen } = typeof module !== 'undefined' ? require('./formatos') : window.CR.FormatosCurso;
  const edad = 'edad = int(input("¿Cuántos años tienes? "))\n';
  const dados = aleatorios => ({ aleatorios, salida: [...aleatorios, 'Total: ' + aleatorios.reduce((a, b) => a + b, 0)].join('\n') + '\n' });
  const tema = { nombre: 'input() y módulos', frase: 'Pide datos y usa herramientas de Python.', necesita: 'Condiciones, bucles, errores', pasos: [
    explica('Escribe en la consola', '`input()` muestra la pregunta y espera a que pulses Enter. Ejecuta y prueba con dos nombres distintos.',
      'nombre = input("¿Cómo te llamas? ")\nprint(f"Hola, {nombre}")', { entradas: ['Ana'] }),
    predice('¿Número o texto?', 'Cuando el programa pregunte, se escribirá 30. ¿Qué pasa al sumarle 1?',
      'edad = input("Edad: ")\nprint(edad + 1)', ['TypeError', '31', '301'],
      'input() siempre devuelve texto. Para sumar un número, primero convierte la entrada con int().',
      { entradas: ['30'], error: 'TypeError' }),
    explica('Convertir al leer', '`int(input(...))` convierte la entrada en un entero. Escribe letras para ver el ValueError del tema 9.',
      'edad = int(input("Edad: "))\nprint(edad + 1)', { entradas: ['30'] }),
    explica('Herramientas de math', '`import math` carga el módulo. Usa `math.` para acceder a sus funciones y a pi. Cambia los números y compara los redondeos.',
      'import math\nprint(math.sqrt(16))\nprint(math.pi)\nprint(math.floor(2.7))\nprint(math.ceil(2.1))'),
    explica('Un poco de azar', '`randint(1, 6)` incluye ambos extremos y `choice()` elige un elemento. Ejecuta varias veces y observa cómo varían los resultados.',
      'import random\nprint(random.randint(1, 6))\nprint(random.choice(["piedra", "papel", "tijera"]))', { azar: true }),
    explica('Importar una función', '`from random import randint` trae solo randint y permite llamarla directamente. Cambia los extremos.',
      'from random import randint\nprint(randint(1, 6))', { azar: true }),
    reto('¿Mayor de edad?', 'Pide la edad con «¿Cuántos años tienes? » y responde «Eres mayor de edad.» o «Todavía eres menor.». Usa Comprobar para probar las tres edades.',
      edad, edad + 'if edad >= 18:\n    print("Eres mayor de edad.")\nelse:\n    print("Todavía eres menor.")',
      ['Convierte la entrada a entero con int().', 'Incluye el 18 con >=.'],
      { etiqueta: 'Combinación: input + condiciones', requiere: ['input', 'if'], casos: ['20', '15', '18'].map(e => ({
        entradas: [e], salida: '¿Cuántos años tienes? ' + (e === '15' ? 'Todavía eres menor.' : 'Eres mayor de edad.') + '\n'
      })) }),
    reto('Cinco tiradas de dado', 'Tira un dado cinco veces con `randint(1, 6)`. Imprime cada tirada en una línea y luego «Total: » seguido de la suma.',
      'from random import randint\nprint(randint(1, 6))',
      'from random import randint\ntotal = 0\nfor i in range(5):\n    tirada = randint(1, 6)\n    print(tirada)\n    total += tirada\nprint(f"Total: {total}")',
      ['Usa for con range(5).', 'Guarda cada tirada para imprimirla y sumarla sin repetir el sorteo.'],
      { etiqueta: 'Combinación: random + bucles', requiere: ['import', 'for'], casos: [dados([1, 6, 3, 2, 5]), dados([6, 6, 1, 4, 1])] }),
    resumen('Chuleta de input y módulos', ['Ya puedes pedir datos al jugador y traer funciones de un módulo.'], [
      ['input("Nombre: ")', 'Muestra la pregunta y lee texto.'], ['int(input("Edad: "))', 'Lee y convierte a entero.'],
      ['import math', 'Carga el módulo math.'], ['math.sqrt(16)', 'Calcula la raíz y devuelve 4.0.'],
      ['from random import randint', 'Importa randint directamente.'], ['randint(1, 6)', 'Elige un entero de 1 a 6.']
    ])
  ] };
  if (typeof module !== 'undefined') module.exports = tema;
  else (window.CR.Temas ||= []).push(tema);
})();
