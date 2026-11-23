(function () {
  'use strict';
  const { explica, reto, resumen } = typeof module !== 'undefined' ? require('./formatos') : window.CR.FormatosCurso;
  const pregunta = 'Adivina el número (1-100): ';
  const leer = 'numero = int(input("' + pregunta + '"))';
  const simple = 'secreto = 42\n' + leer;
  const pistas = 'if numero < secreto:\n    print("Más alto.")\nelif numero > secreto:\n    print("Más bajo.")';
  const comparar = simple + '\n' + pistas + '\nelse:\n    print("¡Acertaste!")';
  const sangrar = codigo => codigo.split('\n').map(l => l ? '    ' + l : '').join('\n');
  const acierto = 'if intentos == 1:\n    print("¡Acertaste en 1 intento!")\nelse:\n    print(f"¡Acertaste en {intentos} intentos!")';
  const repetir = 'secreto = 42\nwhile True:\n' + sangrar(leer + '\n' + pistas + '\nelse:\n    print("¡Acertaste!")\n    break');
  const jugada = pistas + '\nelse:\n' + sangrar(acierto + '\nbreak');
  const contar = 'secreto = 42\nintentos = 0\nwhile True:\n' + sangrar(leer + '\nintentos += 1\n' + jugada);
  const secreto = 'secreto = random.randint(1, 100)';
  const azar = 'import random\n' + contar.replace('secreto = 42', secreto);
  const error = 'Eso no es un número.';
  const leerSeguro = 'try:\n    ' + leer + '\nexcept ValueError:\n    print("' + error + '")\n    continue';
  const proteger = azar.replace(leer, leerSeguro.replaceAll('\n', '\n    '));
  const pedir = 'def pedir_numero():\n    while True:\n        try:\n            return int(input("' + pregunta +
    '"))\n        except ValueError:\n            print("' + error + '")';
  function juego(limite) {
    const ronda = 'numero = pedir_numero()\nintentos += 1\n' + jugada;
    const cuerpo = secreto + '\nintentos = 0\nwhile ' + (limite ? 'intentos < 7' : 'True') + ':\n' +
      sangrar(ronda.replace('    break', '    return')) +
      (limite ? '\nprint(f"Sin intentos. Era el {secreto}.")' : '');
    return 'import random\n\n' + pedir + '\n\ndef jugar():\n' + sangrar(cuerpo) + '\n\njugar()';
  }
  const completo = juego(true);
  const comentado = completo.replace('def pedir_numero():', '# Repite si el texto no representa un entero.\ndef pedir_numero():')
    .replace('def jugar():', '# Elige el secreto y da hasta siete intentos válidos.\ndef jugar():')
    .replace('        intentos += 1', '        # Solo cuentan las entradas que se convirtieron a entero.\n        intentos += 1');
  const caso = (entradas, mensajes, aleatorios) => ({
    entradas: entradas.map(String), salida: mensajes.map(m => pregunta + (m ? m + '\n' : '')).join(''), aleatorios
  });
  const alto = 'Más alto.', bajo = 'Más bajo.', bien = '¡Acertaste!';
  const uno = '¡Acertaste en 1 intento!', tres = '¡Acertaste en 3 intentos!';
  const tresTurnos = (secreto, entradas = [50, 25, secreto]) => caso(entradas, [bajo, alto, tres], [secreto]);
  const conError = caso(['hola', 50, 25, 37], [error, bajo, alto, tres], [37]);
  const etapa = (titulo, texto, solucion, pistas, casos, requiere) =>
    reto(titulo, texto, 'anterior', solucion, pistas, { casos, requiere });
  const tema = { nombre: 'Proyecto final: Adivina el número', frase: 'Construye un juego en ocho retos.', necesita: 'Todo lo anterior', proyecto: true, pasos: [
    explica('El plan del juego', 'Construye el juego por partes. Cada reto añade una pieza al código anterior.', '# Empieza aquí.\npass', {
      texto: ['Construye el juego por partes. Cada reto añade una pieza al código anterior.',
        '1. Pide el número. 2. Compara. 3. Repite. 4. Cuenta intentos.',
        '5. Sortea el secreto. 6. Trata los errores. 7. Ordena en funciones. 8. Limita los intentos.',
        'Ejecuta el punto de partida. Puedes añadir un comentario sobre el juego.']
    }),
    etapa('Pide un número', 'Fija `secreto = 42`. Pide «Adivina el número (1-100): » y convierte lo escrito a entero. Por ahora solo se muestra la pregunta.',
      simple, ['Usa input con el mensaje exacto.', 'Rodea input(...) con int(...). Para esta etapa usa una variable llamada numero.'],
      [caso([50], ['']), caso([42], ['']), { entradas: ['hola'], salida: pregunta, error: 'ValueError' }], ['input']),
    etapa('Da una pista', 'Compara el número con el secreto. Imprime «Más alto.», «Más bajo.» o «¡Acertaste!». Por ahora hay un intento.',
      comparar, ['Usa if para el número menor.', 'Usa elif para el mayor y else para el acierto.'],
      [caso([25], [alto]), caso([50], [bajo]), caso([42], [bien])], ['if']),
    etapa('Repite hasta acertar', 'Vuelve a preguntar después de cada pista y termina al acertar.',
      repetir, ['Mete la pregunta y la comparación en while True.', 'Usa break al acertar.'],
      [caso([50, 25, 42], [bajo, alto, bien])], ['while']),
    etapa('Cuenta los intentos', 'Usa una f-string para decir cuántos intentos hubo. Imprime «¡Acertaste en 1 intento!» o «¡Acertaste en {n} intentos!».',
      contar, ['Empieza a contar en cero.', 'Comprueba si intentos vale 1 antes de elegir el mensaje.'],
      [caso([42], [uno]), caso([50, 25, 42], [bajo, alto, tres])], ['fstring']),
    etapa('Sortea el secreto', 'Usa `random.randint(1, 100)` para elegir el secreto una vez antes de preguntar.',
      azar, ['Añade import random arriba.', 'Cambia el valor fijo por random.randint(1, 100).'],
      [caso([7], [uno], [7]), tresTurnos(37)], ['import']),
    etapa('Trata lo que no es un entero', 'Si la conversión falla, imprime «Eso no es un número.» y pregunta otra vez. Esa entrada no cuenta como intento.',
      proteger, ['Pon la conversión en try y captura ValueError.', 'Usa continue antes de sumar el intento.'],
      [conError, caso(['x', 7], [error, uno], [7])], ['try', 'except']),
    etapa('Separa las tareas', 'Crea `pedir_numero()` para pedir hasta obtener un entero y devolverlo. Pon el juego en `jugar()`. El programa principal llama a jugar().',
      juego(false), ['Mueve la lectura y el tratamiento de errores a pedir_numero().', 'En jugar(), cada vuelta empieza con numero = pedir_numero().'],
      [conError, caso([81], [uno], [81])], ['def', 'return']),
    etapa('Limita a siete intentos', 'Al agotar siete intentos válidos, imprime «Sin intentos. Era el {secreto}.». Si acierta, termina con el mensaje de siempre.',
      completo, ['Haz que el while dependa de intentos < 7.', 'Tras el bucle, muestra el secreto si el acierto no terminó la función.'],
      [tresTurnos(37), caso([50, 25, 30, 31, 32, 33, 34], [bajo, alto, alto, alto, alto, alto, alto + '\nSin intentos. Era el 37.'], [37])],
      ['while', 'return']),
    resumen('Tu juego completo', [
      'Has usado: variables, condiciones, bucles, funciones, errores, input y random.',
      'Tres ideas para seguir: jugar otra vez, elegir la dificultad y guardar el mejor récord.'
    ], [
      ['random.randint(1, 100)', 'Sortea el secreto.'], ['int(input(...))', 'Lee un intento válido.'],
      ['except ValueError:', 'Responde a una entrada que no se puede convertir.'],
      ['while intentos < 7:', 'Repite hasta el límite.'], ['return', 'Termina la partida cuando hay un acierto.']
    ], { codigo: 'anterior', final: comentado })
  ] };
  if (typeof module !== 'undefined') module.exports = tema;
  else (window.CR.Temas ||= []).push(tema);
})();
