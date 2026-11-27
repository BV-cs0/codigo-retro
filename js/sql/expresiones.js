(function () {
  'use strict';
  const I = CR.sqlInterno;
  const { nulo, valor, texto, entero, real, numero, verdad, logico, compararAfin } = I;
  function resolver(n, ambito) {
    const posibles = ambito.columnas.filter(c => I.ascii(c.nombre) === I.ascii(n.nombre) &&
      (!n.tabla || I.ascii(c.tabla) === I.ascii(n.tabla)));
    const ruta = n.tabla ? n.tabla + '.' + n.nombre : n.nombre;
    if (posibles.length > 1) I.fallo('ambiguous column name: ' + ruta, n.t, 'ambigua');
    if (posibles.length) return { ...posibles[0], nivel: 0 };
    if (!n.tabla && ambito.alias?.has(I.ascii(n.nombre))) return { alias: ambito.alias.get(I.ascii(n.nombre)), nivel: 0 };
    if (ambito.exterior) {
      const externo = resolver(n, ambito.exterior);
      if (externo) return { ...externo, nivel: externo.nivel + 1 };
    }
    return null;
  }
  function hijos(n) {
    return [n.expr, n.izq, n.der, n.alto, n.base, n.otro,
      ...(n.lista || []), ...(n.args || []), ...(n.ramas || []).flatMap(r => [r.cuando, r.valor])].filter(Boolean);
  }
  function preparar(n, ambito, ctx, permite = true) {
    if (!n) return;
    if (n.clase === 'columna') {
      const ref = resolver(n, ambito);
      if (ref) n.ref = ref;
      else if (!n.tabla && n.t.bruto[0] === '"') {
        n.comoTexto = true;
        ctx.consejo('comillas', n.t, [n.nombre]);
      } else I.fallo('no such column: ' + [n.tabla, n.nombre].filter(Boolean).join('.'), n.t, 'columna');
      if (!permite && ref?.alias && contieneAgregado(ref.alias))
        I.fallo('misuse of aggregate: ' + (ref.alias.nombre || n.nombre) + '()', n.t, 'agregado');
    }
    if (n.clase === 'funcion') I.validarFuncion(n, permite);
    if (n.clase === 'binaria' && ['=', '==', '!=', '<>'].includes(n.op) &&
      (n.izq.tipo === 'null' || n.der.tipo === 'null')) ctx.consejo('igualNull', n.t);
    for (const h of hijos(n)) preparar(h, ambito, ctx, permite && !(n.clase === 'funcion' && I.agregado(n)));
    if (n.consulta) {
      I.prepararConsulta(n.consulta, ctx, ambito);
      if (n.clase !== 'existe') {
        const columnas = n.consulta.ramas[0].proyeccion;
        if (columnas.length !== 1)
          I.fallo('sub-select returns ' + columnas.length + ' columns - expected 1', n.t, 'columna');
        n.afinidad = columnas[0].expr.ref?.tipo;
      }
    }
  }
  function contieneAgregado(n) {
    return n && ((n.clase === 'funcion' && I.agregado(n)) || hijos(n).some(contieneAgregado));
  }
  function aritmetica(a, b, op) {
    if (a === nulo || b === nulo) return nulo;
    if (op === '||') return texto(I.comoTexto(a) + I.comoTexto(b));
    const x = numero(a), y = numero(b);
    const i = x.tipo === 'integer' && y.tipo === 'integer';
    const u = x.valor, v = y.valor;
    if ((op === '/' || op === '%') && (op === '/' ? v : Math.trunc(v)) === 0) return nulo;
    const r = { '+': () => u + v, '-': () => u - v, '*': () => u * v,
      '/': () => i ? Math.trunc(u / v) : u / v, '%': () => Math.trunc(u) % Math.trunc(v) }[op]();
    if (Number.isNaN(r)) return nulo;
    return i && r >= -(2 ** 63) && r < 2 ** 63 ? entero(r || 0) : real(r || 0);
  }
  function leerColumna(n, contexto) {
    if (n.comoTexto) return texto(n.nombre);
    let ctx = contexto;
    for (let nivel = 0; nivel < n.ref.nivel; nivel++) ctx = ctx.padre;
    if (n.ref.alias) return evaluar(n.ref.alias, ctx);
    return ctx.fila[n.ref.indice] ?? nulo;
  }
  const tipo = expr => expr?.ref?.tipo || expr?.afinidad;
  function comparar(n, a, b, op, derecha = tipo(n.der)) {
    if (a === nulo || b === nulo) return null;
    const c = compararAfin(a, b, tipo(n.izq), derecha);
    return { '=': c === 0, '==': c === 0, '!=': c !== 0, '<>': c !== 0,
      '<': c < 0, '>': c > 0, '<=': c <= 0, '>=': c >= 0 }[op];
  }
  function conexion(a, b, op) {
    if (op === 'AND') return a === false || b === false ? false : a === null || b === null ? null : true;
    return a === true || b === true ? true : a === null || b === null ? null : false;
  }
  function como(a, b) {
    if (a === nulo || b === nulo) return null;
    const chars = x => Array.from(I.ascii(I.comoTexto(x)).split('\0')[0]);
    const texto = chars(a), patron = chars(b);
    let i = 0, j = 0, porcentaje = -1, reintentar = 0;
    while (i < texto.length) {
      if (patron[j] === '%') { porcentaje = j++; reintentar = i; }
      else if (patron[j] === '_' || patron[j] === texto[i]) { i++; j++; }
      else if (porcentaje >= 0) { j = porcentaje + 1; i = ++reintentar; }
      else return false;
    }
    while (patron[j] === '%') j++;
    return j === patron.length;
  }
  function pertenece(n, a, ctx) {
    const xs = n.consulta
      ? I.consultar(n.consulta, ctx, false).filas.map(f => f[0])
      : n.lista.map(x => evaluar(x, ctx));
    const tipo = n.afinidad ?? null;
    let resultado = false;
    for (const x of xs) {
      const coincide = comparar(n, a, x, '=', tipo);
      if (coincide) return true;
      if (coincide === null) resultado = null;
    }
    return resultado;
  }
  function binaria(n, ctx) {
    const a = evaluar(n.izq, ctx);
    const b = n.der ? evaluar(n.der, ctx) : nulo;
    let r;
    switch (n.op) {
      case 'AND': case 'OR': r = conexion(verdad(a), verdad(b), n.op); break;
      case 'IS': r = a === nulo || b === nulo ? a === b : comparar(n, a, b, '='); break;
      case 'BETWEEN':
        r = conexion(comparar(n, a, b, '>='), comparar(n, a, evaluar(n.alto, ctx), '<=', tipo(n.alto)), 'AND');
        break;
      case 'LIKE': r = como(a, b); break;
      case 'IN': r = pertenece(n, a, ctx); break;
      case '+': case '-': case '*': case '/': case '%': case '||': return aritmetica(a, b, n.op);
      default: r = comparar(n, a, b, n.op);
    }
    return logico(n.negado && r !== null ? !r : r);
  }
  function caso(n, ctx) {
    const base = n.base && evaluar(n.base, ctx);
    for (const rama of n.ramas) {
      const cuando = evaluar(rama.cuando, ctx);
      if (base ? base !== nulo && cuando !== nulo && compararAfin(base, cuando, n.base.ref?.tipo, rama.cuando.ref?.tipo) === 0 : verdad(cuando))
        return evaluar(rama.valor, ctx);
    }
    return evaluar(n.otro, ctx);
  }
  function evaluar(n, ctx) {
    if (!n) return nulo;
    switch (n.clase) {
      case 'literal': return valor(n.valor, n.tipo);
      case 'parametro': return ctx.parametros[n.indice];
      case 'columna': return leerColumna(n, ctx);
      case 'binaria': return binaria(n, ctx);
      case 'caso': return caso(n, ctx);
      case 'funcion': return I.aplicar(n, ctx);
      case 'existe': return logico(I.consultar(n.consulta, ctx, false).filas.length > 0);
      case 'escalar': return I.consultar(n.consulta, ctx, false).filas[0]?.[0] ?? nulo;
      case 'unaria': {
        const x = evaluar(n.expr, ctx);
        if (n.op === '+') return x;
        if (x === nulo) return nulo;
        if (n.op === 'NOT') return logico(!verdad(x));
        const num = numero(x);
        return valor(-num.valor || 0, num.tipo);
      }
    }
  }
  Object.assign(I, { preparar, evaluar, contieneAgregado, hijos });
})();
