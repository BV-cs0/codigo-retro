(function () {
  'use strict';
  const V = typeof module !== 'undefined' ? require('./valores') : window.CR.PyValores;

  function funcion(nombre, cantidad, fn) {
    return { tipo: 'integrada', nombre, fn(args, kw, error) {
      if (args.length !== cantidad || Object.keys(kw).length) {
        error('TypeError', nombre + ' necesita ' + cantidad + ' argumentos posicionales.');
      }
      return fn(args, error);
    } };
  }
  function matematicas() {
    const attrs = new Map([['pi', V.float(Math.PI)]]);
    for (const [nombre, fn] of Object.entries({ sqrt: Math.sqrt, floor: Math.floor,
      ceil: Math.ceil, pow: Math.pow, fabs: Math.abs })) {
      attrs.set(nombre, funcion(nombre, nombre === 'pow' ? 2 : 1, (args, error) => {
        if (!args.every(V.numerico)) error('TypeError', 'Usa números en esta función.');
        const numeros = args.map(V.num);
        const resultado = fn(...numeros);
        if ((Number.isNaN(resultado) && !numeros.some(Number.isNaN)) ||
            nombre === 'pow' && numeros[0] === 0 && numeros[1] < 0 && Number.isFinite(numeros[1])) {
          if (nombre === 'sqrt') {
            error('ValueError', 'La raíz cuadrada necesita un número que no sea negativo.',
              'expected a nonnegative input, got ' + V.repr(V.float(numeros[0])));
          }
          error('ValueError', 'El valor está fuera del dominio de la función.', 'math domain error');
        }
        if (nombre === 'floor' || nombre === 'ceil') {
          if (Number.isNaN(resultado)) error('ValueError', 'No se puede convertir NaN a entero.', 'cannot convert float NaN to integer');
          if (!Number.isFinite(resultado)) error('OverflowError', 'No se puede convertir infinito a entero.', 'cannot convert float infinity to integer');
          return V.limite(resultado || 0, error);
        }
        if (nombre === 'pow' && !Number.isFinite(resultado) && numeros.every(Number.isFinite)) {
          error('OverflowError', 'El resultado supera el límite numérico.', 'math range error');
        }
        return V.float(resultado);
      }));
    }
    return { tipo: 'modulo', nombre: 'math', attrs };
  }
  function azar(fijos) {
    let i = 0;
    function siguiente(generar, valido, error) {
      if (fijos === undefined) return generar();
      const valor = fijos[i++];
      if (!valido(valor)) error('ValueError', 'El valor aleatorio previsto falta o no es válido.');
      return valor;
    }
    const attrs = new Map([
      ['randint', funcion('randint', 2, ([a, b], e) => {
        a = V.entero(a, e);
        b = V.entero(b, e);
        if (b < a) e('ValueError', 'El intervalo está vacío.', 'empty range in randrange(' + a + ', ' + (b + 1) + ')');
        return siguiente(() => a + Math.floor(Math.random() * (b - a + 1)), x => Number.isInteger(x) && x >= a && x <= b, e);
      })],
      ['choice', funcion('choice', 1, ([seq], e) => {
        if (seq?.tipo === 'range') {
          if (!seq.longitud) e('IndexError', 'La secuencia está vacía.', 'Cannot choose from an empty sequence');
          return V.num(siguiente(() => seq.inicio + Math.floor(Math.random() * seq.longitud) * seq.paso,
            x => V.comparar('in', x, seq, e), e));
        }
        const items = typeof seq === 'string' ? [...seq] : seq?.tipo === 'tuple' ? seq.items : seq;
        if (!Array.isArray(items)) e('TypeError', 'choice necesita una secuencia.');
        if (!items.length) e('IndexError', 'La secuencia está vacía.', 'Cannot choose from an empty sequence');
        const valor = siguiente(() => items[Math.floor(Math.random() * items.length)], x => items.some(v => V.igual(v, x)), e);
        return items.find(v => V.igual(v, valor)) ?? valor;
      })],
      ['random', funcion('random', 0, (_, e) => V.float(siguiente(Math.random, x => typeof x === 'number' && x >= 0 && x < 1, e)))],
      ['shuffle', funcion('shuffle', 1, ([lista], e) => mezclar(lista, siguiente, e))]
    ]);
    return { tipo: 'modulo', nombre: 'random', attrs };
  }
  function mezclar(lista, siguiente, error) {
    if (!Array.isArray(lista)) error('TypeError', 'shuffle necesita una lista.');
    const resultado = siguiente(() => {
      const copia = lista.slice();
      for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
      }
      return copia;
    }, x => Array.isArray(x) && x.length === lista.length, error);
    lista.splice(0, lista.length, ...resultado);
    return null;
  }
  const Modulos = { crear: fijos => new Map([['math', matematicas()], ['random', azar(fijos)]]) };
  if (typeof module !== 'undefined') module.exports = Modulos;
  else (window.CR ||= {}).PyModulos = Modulos;
})();
