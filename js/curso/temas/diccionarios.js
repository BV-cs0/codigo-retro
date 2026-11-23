(function () {
  'use strict';
  const { explica, predice, reto, resumen } = typeof module !== 'undefined' ? require('./formatos') : window.CR.FormatosCurso;
  const persona = 'persona = {"nombre": "Ana", "edad": 30}\n';
  const tema = { nombre: 'Diccionarios', frase: 'Guarda y busca datos por clave.', necesita: 'Listas, bucles', pasos: [
    explica('Datos con nombre', 'Una lista busca por posición. Un diccionario busca por clave y cada clave tiene un valor. Cambia el nombre y ejecuta.',
      persona + 'print(persona["nombre"])'),
    explica('Añadir y cambiar', 'Asignar a una clave nueva añade un par. Asignar a una clave existente cambia su valor. Mira Variables con «Paso a paso» y prueba con otra ciudad.',
      persona + 'persona["ciudad"] = "Lima"\npersona["edad"] = 31\nprint(persona)'),
    reto('Falta la altura', 'Leer una clave ausente da `KeyError`. Arregla el código para que imprima «sin dato».',
      persona + 'print(persona["altura"])', persona + 'print(persona.get("altura", "sin dato"))',
      ['Puedes comprobar si "altura" está en persona con in.', 'Usa .get("altura", "sin dato") para indicar un valor por defecto.'],
      { tipo: 'arregla', error: 'KeyError', salidaEsperada: 'sin dato\n' }),
    explica('Recorrer pares', '`for clave in persona` recorre las claves. `items()` entrega pares (tuplas). Con dos nombres, el bucle separa cada par. Añade otra clave y observa ambos bucles.',
      persona + 'for clave in persona:\n    print(clave)\nfor clave, valor in persona.items():\n    print(clave, valor)'),
    predice('Orden y tamaño', '`len()` cuenta pares. ¿En qué orden aparecen las claves?', 'd = {"z": 1, "a": 2}\nprint(len(d), list(d.keys()))',
      ["2 ['z', 'a']", "2 ['a', 'z']", "4 ['z', 'a']"], 'Las claves salen en orden de inserción. Hay dos pares.'),
    explica('Una lista de fichas', 'Cada elemento de la lista es un diccionario. Accede a sus claves dentro de una f-string. Añade otro alumno.',
      "alumnos = [{\"nombre\": \"Ana\", \"nota\": 8}, {\"nombre\": \"Leo\", \"nota\": 7}]\nfor a in alumnos:\n    print(f\"{a['nombre']}: {a['nota']}\")",
      { etiqueta: 'Combinación: diccionarios + listas' }),
    reto('Cuenta palabras', 'Separa la frase y guarda cuántas veces aparece cada palabra. Imprime el diccionario.',
      'frase = "el gato y el perro"\ncuenta = {}\nprint(cuenta)',
      'frase = "el gato y el perro"\ncuenta = {}\nfor palabra in frase.split():\n    cuenta[palabra] = cuenta.get(palabra, 0) + 1\nprint(cuenta)',
      ['Usa split() para obtener las palabras.', 'Si la palabra es nueva, get(palabra, 0) devuelve cero.'],
      { etiqueta: 'Combinación: diccionarios + bucles', requiere: ['dict', 'for'], salidaEsperada: "{'el': 2, 'gato': 1, 'y': 1, 'perro': 1}\n" }),
    reto('El precio del carrito', 'Escribe `total_carrito(carrito, precios)`. Devuelve la suma de los precios de los productos de la lista.',
      'def total_carrito(carrito, precios):\n    pass',
      'def total_carrito(carrito, precios):\n    total = 0\n    for producto in carrito:\n        total += precios[producto]\n    return total',
      ['Recorre la lista carrito con for.', 'Usa el producto como clave de precios y suma su valor.'],
      { etiqueta: 'Combinación: diccionarios + funciones', pruebas: [
        { codigo: 'print(total_carrito(["pan", "té", "pan"], {"pan": 2, "té": 3}))', salida: '7' },
        { codigo: 'print(total_carrito([], {}), total_carrito(["manzana"], {"manzana": 1.5}))', salida: '0 1.5' }
      ] }),
    resumen('Chuleta de diccionarios', ['Un diccionario conserva el orden en el que añades sus claves.'], [
      ['d = {"nombre": "Ana"}', 'Crea un par clave y valor.'], ['d["edad"] = 30', 'Añade o cambia un par.'],
      ['"edad" in d', 'Busca una clave.'], ['d.get("altura", "sin dato")', 'Da un valor si la clave falta.'],
      ['for clave, valor in d.items():', 'Recorre y desempaqueta los pares.'], ['del d["edad"]', 'Borra un par.']
    ])
  ] };
  if (typeof module !== 'undefined') module.exports = tema;
  else (window.CR.Temas ||= []).push(tema);
})();
