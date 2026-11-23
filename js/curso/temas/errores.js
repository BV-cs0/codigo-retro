(function () {
  'use strict';
  const { explica, predice, reto, resumen } = typeof module !== 'undefined' ? require('./formatos') : window.CR.FormatosCurso;
  const tema = { nombre: 'Errores', frase: 'Lee, captura y lanza excepciones.', necesita: 'Funciones, textos', pasos: [
    explica('Lee el mensaje', 'Un error sin capturar detiene el programa. En la consola verás el tipo, la línea y el mensaje original en inglés. Cambia «hola» por «12».',
      'print(int("hola"))\nprint("Fin")', { error: 'ValueError' }),
    explica('Capturar un error', '`try` ejecuta el código que puede fallar. `except ValueError` trata un valor inválido y el programa sigue. Prueba con "15".',
      'try:\n    print(int("hola"))\nexcept ValueError:\n    print("Número no válido")\nprint("Fin")'),
    predice('La línea que se salta', 'Sigue el orden de las instrucciones cuando la conversión falla.',
      'try:\n    int("x")\n    print("Dentro")\nexcept ValueError:\n    print("Error")\nprint("Fin")',
      ['Error\nFin', 'Dentro\nError\nFin', 'Error'], 'El error interrumpe el bloque try. Tras el except se ejecuta el resto del programa.'),
    explica('Distintos tipos de error', 'Cada `except` puede tratar un error distinto. Con `as e` puedes imprimir su mensaje. Cambia "0" por "x" y observa qué rama se ejecuta.',
      'try:\n    print(10 / int("0"))\nexcept ValueError as e:\n    print(e)\nexcept ZeroDivisionError as e:\n    print(e)'),
    explica('Si va bien y al terminar', '`else` se ejecuta si el bloque try termina sin error. `finally` se ejecuta siempre. Cambia "7" por "x" y compara.',
      'try:\n    numero = int("7")\nexcept ValueError:\n    print("Número no válido")\nelse:\n    print(numero)\nfinally:\n    print("Fin")'),
    explica('Lanzar una excepción', 'Usa `raise` para señalar un valor que tu función rechaza. Captura el error donde llamas a la función y prueba con una edad positiva.',
      'def validar(edad):\n    if edad < 0:\n        raise ValueError("La edad no puede ser negativa")\n    return edad\ntry:\n    print(validar(-1))\nexcept ValueError as e:\n    print(e)'),
    predice('Un error escondido', 'Lee con atención cómo está escrito el nombre de la variable.',
      'numero = 5\ntry:\n    print(nmero)\nexcept:\n    print("Número no válido")',
      ['Número no válido', '5', 'NameError'], 'El except sin tipo esconde que escribimos nmero. Captura solo el error que esperas, como ValueError.'),
    reto('Suma los enteros válidos', 'Escribe `a_numero(texto)` para devolver un entero o None si falla la conversión. Suma solo los valores válidos.',
      'def a_numero(texto):\n    pass\n\ndatos = ["4", "x", "10", "3.5"]\nprint(0)',
      'def a_numero(texto):\n    try:\n        return int(texto)\n    except ValueError:\n        return None\n\ntotal = 0\nfor texto in ["4", "x", "10", "3.5"]:\n    numero = a_numero(texto)\n    if numero != None:\n        total += numero\nprint(total)',
      ['Pon return int(texto) en el try.', 'Devuelve None en el except y evita sumarlo.'],
      { etiqueta: 'Combinación: errores + funciones + bucles', requiere: ['try', 'def'], salidaEsperada: '14\n',
        pruebas: [{ codigo: 'print(a_numero("-3"), a_numero("nada"))', salida: '-3 None' }] }),
    resumen('Chuleta de errores', ['Captura un error cuando sabes cómo continuar. Lee el mensaje para localizar lo que pasó.'], [
      ['try:', 'Abre el bloque que puede fallar.'], ['except ValueError:', 'Trata un valor inválido.'],
      ['except ZeroDivisionError as e:', 'Guarda el error en e para consultar su mensaje.'],
      ['else:', 'Se ejecuta al terminar el try sin errores.'], ['finally:', 'Se ejecuta al salir del bloque.'],
      ['raise ValueError("Edad inválida")', 'Lanza tu propia excepción.']
    ])
  ] };
  if (typeof module !== 'undefined') module.exports = tema;
  else (window.CR.Temas ||= []).push(tema);
})();
