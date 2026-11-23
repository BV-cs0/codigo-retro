(function () {
  'use strict';
  const { explica, predice, reto, resumen } = typeof module !== 'undefined' ? require('./formatos') : window.CR.FormatosCurso;
  const tema = { nombre: 'Textos', frase: 'Recorre, corta y transforma cadenas.', necesita: 'Variables, bucles', pasos: [
    explica('Una secuencia de letras', 'Cada carácter ocupa una posición. Usa `len()` para contar y `[-1]` para leer el último. Prueba con tu nombre.',
      'texto = "Python"\nprint(len(texto))\nprint(texto[0], texto[-1])'),
    explica('Cortar un texto', 'El límite final queda fuera, como en `range()`. Si omites un límite, el corte llega al comienzo o al final. Cambia los límites.',
      'texto = "Python"\nprint(texto[0:3])\nprint(texto[2:])\nprint(texto[:4])'),
    predice('El límite queda fuera', 'Cuenta las posiciones desde cero.', 'print("Python"[1:4])', ['yth', 'Pyt', 'ytho'],
      'La posición 1 es la y y la posición 4 queda fuera. Se toman las posiciones 1, 2 y 3.'),
    explica('Un texto nuevo', 'Los métodos devuelven un texto nuevo. Cambia las palabras y observa los resultados.',
      'texto = "  Hola, Ana  "\nprint(texto.upper())\nprint(texto.lower())\nprint(texto.strip())\nprint(texto.replace("Ana", "Leo"))'),
    predice('¿Cambió el nombre?', 'Fíjate en si guardamos el resultado del método.', 'nombre = "ana"\nnombre.upper()\nprint(nombre)',
      ['ana', 'ANA', 'Nada'], 'La variable sigue valiendo ana. Prueba con `nombre = nombre.upper()` para guardar el nuevo texto.'),
    explica('Separar y unir', '`split()` crea una lista al separar un texto. `join()` une sus elementos con el separador que elijas. Prueba con otro separador.',
      'colores = "rojo,verde,azul".split(",")\nprint(colores)\nprint(" - ".join(colores))'),
    reto('Cuenta las vocales', 'Recorre la frase y cuenta sus vocales minúsculas con `for letra in frase` e `in "aeiou"`.',
      'frase = "hola mundo"\ncuenta = 0\nprint(cuenta)',
      'frase = "hola mundo"\ncuenta = 0\nfor letra in frase:\n    if letra in "aeiou":\n        cuenta += 1\nprint(cuenta)',
      ['Empieza con un contador a cero.', 'Suma uno cuando la letra esté en "aeiou".'],
      { etiqueta: 'Combinación: textos + bucles', requiere: ['for'], salidaEsperada: '4\n' }),
    reto('Un correo sencillo', 'Escribe `email_valido(email)`. Devuelve True si contiene @ y acaba en .com o .es.',
      'def email_valido(email):\n    pass',
      'def email_valido(email):\n    return "@" in email and email.endswith((".com", ".es"))',
      ['Comprueba si "@" está en email.', 'Usa endswith para comprobar el final.'],
      { etiqueta: 'Combinación: textos + condiciones', pruebas: [
        { codigo: 'print(email_valido("ana@ejemplo.com"), email_valido("leo@ejemplo.es"))', salida: 'True True' },
        { codigo: 'print(email_valido("ana.es"), email_valido("a@b.org"))', salida: 'False False' }
      ] }),
    reto('Palíndromos', 'Escribe `es_palindromo(palabra)`. Compara la palabra con el texto invertido mediante `[::-1]`.',
      'def es_palindromo(palabra):\n    pass',
      'def es_palindromo(palabra):\n    return palabra == palabra[::-1]',
      ['Un paso de -1 recorre el texto hacia atrás.', 'Compara ambos textos con ==.'],
      { requiere: ['corte'], pruebas: [
        { codigo: 'print(es_palindromo("reconocer"), es_palindromo("python"), es_palindromo("oso"))', salida: 'True False True' }
      ] }),
    resumen('Chuleta de textos', ['Ya puedes buscar y transformar partes de un texto.'], [
      ['len(texto)', 'Cuenta los caracteres.'], ['texto[-1]', 'Lee el último carácter.'],
      ['texto[1:4]', 'Toma las posiciones 1 a 3.'], ['texto[::-1]', 'Invierte el texto.'],
      ['texto.strip()', 'Quita espacios de los extremos.'], ['texto.split(",")', 'Separa por comas.'],
      ['" - ".join(colores)', 'Une los textos.'], ['texto.endswith(".es")', 'Comprueba cómo termina.']
    ])
  ] };
  if (typeof module !== 'undefined') module.exports = tema;
  else (window.CR.Temas ||= []).push(tema);
})();
