(function () {
  'use strict';
  const traducir = typeof module !== 'undefined' ? require('../../comun/idioma').t : globalThis.CR.t;
  const V = typeof module !== 'undefined' ? require('./valores') : window.CR.PyValores;

  function funcion(nombre, cantidad, fn) {
    return { tipo: 'integrada', nombre, fn(args, kw, error) {
      if (args.length !== cantidad || Object.keys(kw).length) {
        error('TypeError', nombre + traducir("curso.necesita_2") + cantidad + traducir("curso.argumentos_posicionales"));
      }
      return fn(args, error);
    } };
  }
  function matematicas() {
    const attrs = new Map([['pi', V.float(Math.PI)]]);
    for (const [nombre, fn] of Object.entries({ sqrt: Math.sqrt, floor: Math.floor,
      ceil: Math.ceil, pow: Math.pow, fabs: Math.abs })) {
      attrs.set(nombre, funcion(nombre, nombre === 'pow' ? 2 : 1, (args, error) => {
        if (!args.every(V.numerico)) error('TypeError', traducir("curso.usa_numeros_en_esta_funcion"));
        const numeros = args.map(V.num);
        const resultado = fn(...numeros);
        if ((Number.isNaN(resultado) && !numeros.some(Number.isNaN)) ||
            nombre === 'pow' && numeros[0] === 0 && numeros[1] < 0 && Number.isFinite(numeros[1])) {
          if (nombre === 'sqrt') {
            error('ValueError', traducir("curso.la_raiz_cuadrada_necesita_un"),
              'expected a nonnegative input, got ' + V.repr(V.float(numeros[0])));
          }
          error('ValueError', traducir("curso.el_valor_esta_fuera_del"), 'math domain error');
        }
        if (nombre === 'floor' || nombre === 'ceil') {
          if (Number.isNaN(resultado)) error('ValueError', traducir("curso.no_se_puede_convertir_nan"), 'cannot convert float NaN to integer');
          if (!Number.isFinite(resultado)) error('OverflowError', traducir("curso.no_se_puede_convertir_infinito"), 'cannot convert float infinity to integer');
          return V.limite(resultado || 0, error);
        }
        if (nombre === 'pow' && !Number.isFinite(resultado) && numeros.every(Number.isFinite)) {
          error('OverflowError', traducir("curso.el_resultado_supera_el_limite"), 'math range error');
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
      if (!valido(valor)) error('ValueError', traducir("curso.el_valor_aleatorio_previsto_falta"));
      return valor;
    }
    const attrs = new Map([
      ['randint', funcion('randint', 2, ([a, b], e) => {
        a = V.entero(a, e);
        b = V.entero(b, e);
        if (b < a) e('ValueError', traducir("curso.el_intervalo_esta_vacio"), 'empty range in randrange(' + a + ', ' + (b + 1) + ')');
        return siguiente(() => a + Math.floor(Math.random() * (b - a + 1)), x => Number.isInteger(x) && x >= a && x <= b, e);
      })],
      ['choice', funcion('choice', 1, ([seq], e) => {
        if (seq?.tipo === 'range') {
          if (!seq.longitud) e('IndexError', traducir("curso.la_secuencia_esta_vacia"), 'Cannot choose from an empty sequence');
          return V.num(siguiente(() => seq.inicio + Math.floor(Math.random() * seq.longitud) * seq.paso,
            x => V.comparar('in', x, seq, e), e));
        }
        const items = typeof seq === 'string' ? [...seq] : seq?.tipo === 'tuple' ? seq.items : seq;
        if (!Array.isArray(items)) e('TypeError', traducir("curso.choice_necesita_una_secuencia"));
        if (!items.length) e('IndexError', traducir("curso.la_secuencia_esta_vacia"), 'Cannot choose from an empty sequence');
        const valor = siguiente(() => items[Math.floor(Math.random() * items.length)], x => items.some(v => V.igual(v, x)), e);
        return items.find(v => V.igual(v, valor)) ?? valor;
      })],
      ['random', funcion('random', 0, (_, e) => V.float(siguiente(Math.random, x => typeof x === 'number' && x >= 0 && x < 1, e)))],
      ['shuffle', funcion('shuffle', 1, ([lista], e) => mezclar(lista, siguiente, e))]
    ]);
    return { tipo: 'modulo', nombre: 'random', attrs };
  }
  function mezclar(lista, siguiente, error) {
    if (!Array.isArray(lista)) error('TypeError', traducir("curso.shuffle_necesita_una_lista"));
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
