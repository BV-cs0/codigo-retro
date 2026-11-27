(function () {
  'use strict';
  const I = CR.sqlInterno;
  const nulo = Object.freeze({ valor: null, tipo: 'null' });
  function valor(v, tipo) {
    if (v == null) return nulo;
    const clase = tipo || (typeof v === 'string' ? 'text' : Number.isInteger(v) ? 'integer' : 'real');
    if (clase === 'integer' && !Number.isSafeInteger(v) || clase === 'real' && !Number.isFinite(v))
      I.fallo('Numeric value outside the simulator range', null, 'precision');
    return { valor: v, tipo: clase };
  }
  const real = v => valor(v, 'real');
  const entero = v => valor(v, 'integer');
  const texto = v => valor(v, 'text');
  const esNumero = x => x.tipo === 'integer' || x.tipo === 'real';
  const ascii = v => v.replace(/[A-Z]/g, c => c.toLowerCase());
  function comoTexto(x) {
    return x.tipo === 'real' && Number.isInteger(x.valor) && Math.abs(x.valor) < 1e15 ? x.valor.toFixed(1) : String(x.valor);
  }
  function numero(x, completo = false) {
    if (esNumero(x) || x === nulo) return x;
    const m = x.valor.trim().match(/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?/i);
    if (!m || (completo && m[0] !== x.valor.trim())) return completo ? x : entero(0);
    const v = Number(m[0]);
    return !/[.e]/i.test(m[0]) && v >= -(2 ** 63) && v < 2 ** 63 ? entero(v) : real(v);
  }
  function afinidad(x, tipo, guardar = false) {
    if (x === nulo || !tipo) return x;
    if (tipo === 'TEXT') return texto(comoTexto(x));
    const n = numero(x, true);
    if (!esNumero(n) || !guardar) return n;
    if (tipo === 'REAL') return real(n.valor);
    return Number.isInteger(n.valor) && n.valor >= -(2 ** 63) && n.valor < 2 ** 63 ? entero(n.valor) : n;
  }
  function comparar(a, b) {
    const nivel = x => x === nulo ? 0 : esNumero(x) ? 1 : 2;
    return nivel(a) - nivel(b) || (a.valor < b.valor ? -1 : a.valor > b.valor ? 1 : 0);
  }
  function compararAfin(a, b, ta, tb) {
    const numerica = tipo => ['INTEGER', 'REAL', 'NUMERIC'].includes(tipo);
    if (numerica(ta) && !numerica(tb)) b = afinidad(b, ta);
    else if (numerica(tb) && !numerica(ta)) a = afinidad(a, tb);
    else if (ta === 'TEXT' && !tb) b = afinidad(b, ta);
    else if (tb === 'TEXT' && !ta) a = afinidad(a, tb);
    return comparar(a, b);
  }
  const verdad = x => x === nulo ? null : numero(x).valor !== 0;
  const logico = v => v == null ? nulo : entero(Number(v));
  const claveFila = fila => JSON.stringify(fila.map(v => v.valor));
  const sinDuplicados = filas => [...new Map(filas.slice().reverse().map(f => [claveFila(f), f])).values()].reverse();
  Object.assign(I, { nulo, valor, real, entero, texto, esNumero, ascii, comoTexto, numero, afinidad, comparar, compararAfin, verdad, logico, claveFila, sinDuplicados });
})();
