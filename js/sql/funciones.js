(function () {
  'use strict';
  const I = CR.sqlInterno;
  const { nulo, valor, real, entero, texto, numero, comoTexto, comparar } = I;
  const agregados = new Set(['COUNT', 'SUM', 'AVG', 'MIN', 'MAX']);
  const aridades = { COUNT: [1, 1], SUM: [1, 1], AVG: [1, 1], MIN: [1, Infinity], MAX: [1, Infinity],
    UPPER: [1, 1], LOWER: [1, 1], LENGTH: [1, 1], ROUND: [1, 2], ABS: [1, 1], COALESCE: [2, Infinity],
    IFNULL: [2, 2], SUBSTR: [2, 3], TRIM: [1, 2], REPLACE: [3, 3] };
  const agregado = n => agregados.has(n.nombre) && (!['MIN', 'MAX'].includes(n.nombre) || n.args.length === 1);
  function validarFuncion(n, permiteAgregado) {
    if (['DATE', 'TIME', 'DATETIME', 'STRFTIME', 'JULIANDAY', 'UNIXEPOCH'].includes(n.nombre))
      I.fallo(n.nombre + '()', n.t, 'noSoportado', [n.nombre + '()']);
    if (!Object.hasOwn(aridades, n.nombre))
      I.fallo('no such function: ' + n.t.valor, n.t, 'funcion');
    const [min, max] = aridades[n.nombre];
    if ((n.estrella && n.nombre !== 'COUNT') || (!n.estrella && (n.args.length < min || n.args.length > max))) {
      I.fallo('wrong number of arguments to function ' + n.t.valor + '()', n.t, 'argumentos');
    }
    if (!permiteAgregado && agregado(n))
      I.fallo('misuse of aggregate: ' + n.t.valor + '()', n.t, 'agregado');
  }
  function extremo(xs, signo) {
    return xs.reduce((a, b) => a === nulo || signo * comparar(b, a) > 0 ? b : a, nulo);
  }
  function acumular(n, contexto) {
    const grupo = contexto.grupo || [];
    if (n.estrella) return entero(grupo.length);
    let xs = grupo.map(fila => I.evaluar(n.args[0], { ...contexto, fila })).filter(x => x !== nulo);
    if (n.distinto) xs = I.sinDuplicados(xs.map(x => [x])).map(([x]) => x);
    if (n.nombre === 'COUNT') return entero(xs.length);
    if (n.nombre === 'MIN') return extremo(xs, -1);
    if (n.nombre === 'MAX') return extremo(xs, 1);
    if (!xs.length) return nulo;
    const nums = xs.map(x => {
      if (x.tipo !== 'text') return x;
      const n = numero(x, true);
      return n.tipo === 'text' ? real(numero(x).valor) : n;
    });
    const suma = nums.reduce((a, b) => a + b.valor, 0);
    if (n.nombre === 'AVG') return real(suma / nums.length);
    return nums.every(x => x.tipo === 'integer') ? entero(suma) : real(suma);
  }
  function subcadena(s, inicio, largo) {
    const chars = Array.from(s);
    let i = Math.trunc(inicio);
    let n = Math.trunc(largo);
    if (i < 0) i += chars.length;
    else if (i > 0) i--;
    else if (n > 0) n--;
    if (n < 0) { i += n; n = -n; }
    return chars.slice(Math.max(0, i), Math.max(0, i + n)).join('');
  }
  function redondear(x, decimales) {
    const d = Math.max(0, Math.min(30, Math.trunc(decimales)));
    if (d === 0) return real(Math.sign(x) * Math.floor(Math.abs(x) + 0.5));
    if (Math.abs(x) >= 1e21) return real(x);
    return real(Number(x.toFixed(d)));
  }
  function recortar(s, caracteres) {
    const xs = Array.from(s);
    let a = 0, b = xs.length;
    while (a < b && caracteres.includes(xs[a])) a++;
    while (b > a && caracteres.includes(xs[b - 1])) b--;
    return xs.slice(a, b).join('');
  }
  function aplicar(n, contexto) {
    if (agregado(n)) return acumular(n, contexto);
    if (n.nombre === 'COALESCE' || n.nombre === 'IFNULL') {
      for (const arg of n.args) {
        const x = I.evaluar(arg, contexto);
        if (x !== nulo) return x;
      }
      return nulo;
    }
    const xs = n.args.map(a => I.evaluar(a, contexto));
    if (xs.includes(nulo)) return nulo;
    const a = comoTexto(xs[0]);
    switch (n.nombre) {
      case 'MIN': return extremo(xs, -1);
      case 'MAX': return extremo(xs, 1);
      case 'UPPER': return texto(a.replace(/[a-z]/g, c => c.toUpperCase()));
      case 'LOWER': return texto(I.ascii(a));
      case 'LENGTH': return entero(Array.from(a.split('\0')[0]).length);
      case 'ROUND': return redondear(numero(xs[0]).valor, xs[1] ? numero(xs[1]).valor : 0);
      case 'ABS': {
        const num = numero(xs[0]);
        return valor(Math.abs(num.valor), xs[0].tipo === 'text' ? 'real' : num.tipo);
      }
      case 'SUBSTR': return texto(subcadena(a, numero(xs[1]).valor, xs[2] ? numero(xs[2]).valor : Infinity));
      case 'TRIM': return texto(recortar(a, xs[1] ? comoTexto(xs[1]) : ' '));
      case 'REPLACE': return texto(xs[1].valor === '' ? a : a.replaceAll(comoTexto(xs[1]), () => comoTexto(xs[2])));
    }
  }
  Object.assign(I, { agregado, validarFuncion, aplicar });
})();
