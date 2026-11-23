(function () {
  'use strict';
  const V = typeof module !== 'undefined' ? require('./valores') : window.CR.PyValores;
  const espacios = /[\u0009-\u000d\u001c-\u0020\u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]/u;
  function aridad(nombre, args, error, min, max = min) {
    if (args.length < min || args.length > max) {
      error('TypeError', nombre + '() necesita ' + (min === max ? min : 'entre ' + min + ' y ' + max) + ' argumento(s). Has dado ' + args.length + '.');
    }
  }
  function normalizarNumero(texto) {
    const recortado = texto.replace(/^[\p{Z}\t-\r\u0085]+|[\p{Z}\t-\r\u0085]+$/gu, '');
    return recortado.replace(/\p{Nd}/gu, c => {
      if (/\d/.test(c)) return c;
      const n = c.codePointAt(0);
      let inicio = n;
      while (/\p{Nd}/u.test(String.fromCodePoint(inicio - 1))) inicio--;
      return String((n - inicio) % 10);
    }).replace(/(?<=\d)_(?=\d)/g, '');
  }
  function convertir(x, t, error) {
    if (V.numerico(x)) {
      const n = V.num(x);
      if (t === 'float') return V.float(n);
      if (!Number.isFinite(n)) error(Number.isNaN(n) ? 'ValueError' : 'OverflowError', 'No se puede convertir ese valor a entero.');
      return Math.trunc(n) || 0;
    }
    if (typeof x !== 'string') error('TypeError', 'Usa un número o un texto que represente un número.');
    const s = normalizarNumero(x);
    if (t === 'int' && /^[+-]?\d+$/.test(s)) return V.leerEntero(s, error);
    if (t === 'float' && /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(s)) return V.float(Number(s));
    if (t === 'float' && /^[+-]?(?:inf(?:inity)?|nan)$/i.test(s)) return V.float(/nan/i.test(s) ? NaN : s.startsWith('-') ? -Infinity : Infinity);
    error('ValueError', 'El texto no representa un número válido.',
      (t === 'int' ? 'invalid literal for int() with base 10: ' : 'could not convert string to float: ') + V.repr(x));
  }
  function rango(args, error) {
    const [a, b, paso = 1] = args.map(x => V.entero(x, error));
    const [inicio, fin] = b === undefined ? [0, a] : [a, b];
    if (!paso) error('ValueError', 'El paso de range() no puede ser cero.');
    return { tipo: 'range', inicio, fin, paso, longitud: Math.max(0, Math.ceil((fin - inicio) / paso)) };
  }
  function lista(x, error) {
    const items = [];
    for (const v of V.iterable(x, error)) {
      items.push(v);
      V.limite(items, error);
    }
    return items;
  }
  // La mantisa binaria permite detectar empates sin redondear primero en decimal.
  function razon(n) {
    const vista = new DataView(new ArrayBuffer(8));
    vista.setFloat64(0, n);
    const bits = vista.getBigUint64(0);
    const exponente = Number(bits >> 52n);
    const mantisa = (bits & ((1n << 52n) - 1n)) + (exponente ? 1n << 52n : 0n);
    const potencia = (exponente || 1) - 1075;
    return potencia >= 0 ? [mantisa << BigInt(potencia), 1n] : [mantisa, 1n << BigInt(-potencia)];
  }
  function redondearMagnitud(n, p) {
    if (p > 323) return n;
    if (p < -308 || n === 0) return 0;
    let [numerador, divisor] = razon(n);
    if (p > 0) numerador *= 10n ** BigInt(p);
    else if (p < 0) divisor *= 10n ** BigInt(-p);
    let cociente = numerador / divisor;
    const dobleResto = 2n * (numerador % divisor);
    if (dobleResto > divisor || (dobleResto === divisor && cociente % 2n)) cociente++;
    return Number(cociente + 'e' + -p);
  }
  function redondear([x, precision], error) {
    if (!V.numerico(x)) error('TypeError', 'round() necesita un número.');
    const n = V.num(x);
    const p = precision == null ? null : V.entero(precision, error);
    if (!Number.isFinite(n)) return p === null ? convertir(x, 'int', error) : x;
    const magnitud = redondearMagnitud(Math.abs(n), p ?? 0);
    if (!Number.isFinite(magnitud)) error('OverflowError', 'El resultado de round() es demasiado grande.');
    const resultado = n < 0 || Object.is(n, -0) ? -magnitud : magnitud;
    return p !== null && V.tipo(x) === 'float' ? V.float(resultado) : resultado || 0;
  }
  function imprimir(args, kw, error, escribir) {
    let { sep = ' ', end = '\n' } = kw;
    if (sep === null) sep = ' ';
    if (end === null) end = '\n';
    if (Object.keys(kw).some(k => k !== 'sep' && k !== 'end') || typeof sep !== 'string' || typeof end !== 'string') {
      error('TypeError', 'print() admite sep y end como textos o None.');
    }
    let salida = '';
    for (let i = 0; i < args.length; i++) salida = V.limite(salida + (i ? sep : '') + V.str(args[i], error), error);
    escribir(salida + end);
    return null;
  }
  const funciones = {
    len: [1, 1, ([x], e) => {
      if (typeof x === 'string') return Array.from(x).length;
      if (Array.isArray(x)) return x.length;
      if (x?.tipo === 'range') return x.longitud;
      if (x?.tipo === 'tuple') return x.items.length;
      if (x?.tipo === 'dict' || x?.base?.tipo === 'dict') return (x.base || x).pares.size;
      e('TypeError', 'Este valor no tiene longitud.');
    }],
    str: [0, 1, ([x = ''], e) => V.str(x, e)],
    int: [0, 1, ([x = 0], e) => convertir(x, 'int', e)],
    float: [0, 1, ([x = 0], e) => convertir(x, 'float', e)],
    bool: [0, 1, ([x = false]) => V.verdad(x)],
    range: [1, 3, rango],
    abs: [1, 1, ([x], e) => {
      if (!V.numerico(x)) e('TypeError', 'abs() necesita un número.');
      return V.tipo(x) === 'float' ? V.float(Math.abs(V.num(x))) : Math.abs(V.num(x));
    }],
    max: [1, Infinity, (a, e) => extremo(a, e, 1)],
    min: [1, Infinity, (a, e) => extremo(a, e, -1)],
    sum: [1, 2, sumar],
    round: [1, 2, redondear],
    type: [1, 1, ([x]) => x?.tipo === 'excepcion' ?
      { tipo: 'clase', nombre: x.error.tipo, excepcion: true } : { tipo: 'clase', nombre: V.tipo(x) }],
    list: [0, 1, ([x = []], e) => lista(x, e)],
    ord: [1, 1, ([x], e) => {
      if (typeof x !== 'string' || [...x].length !== 1) e('TypeError', 'ord() necesita un solo carácter.');
      return x.codePointAt(0);
    }],
    chr: [1, 1, ([x], e) => {
      const n = V.entero(x, e);
      if (n < 0 || n > 0x10ffff) e('ValueError', 'chr() arg not in range(0x110000)');
      return String.fromCodePoint(n);
    }]
  };
  function sumar([x, inicio = 0], error) {
    if (!V.numerico(inicio)) error('TypeError', 'sum() necesita un valor inicial numérico.');
    if (x?.tipo === 'range') {
      const longitud = BigInt(x.longitud), primero = BigInt(x.inicio), paso = BigInt(x.paso);
      const total = longitud * (2n * primero + (longitud - 1n) * paso) / 2n;
      if (V.tipo(inicio) === 'float') return V.float(V.num(inicio) + Number(total));
      return V.leerEntero(String(total + BigInt(V.num(inicio))), error);
    }
    let suma = inicio, ajuste = 0;
    for (const v of V.iterable(x, error)) {
      if (!V.numerico(v)) error('TypeError', 'sum() necesita números.');
      if (V.tipo(suma) !== 'float' && V.tipo(v) !== 'float') suma = V.operar('+', suma, v, error);
      else {
        const a = V.num(suma), b = V.num(v), total = a + b;
        ajuste += Math.abs(a) >= Math.abs(b) ? (a - total) + b : (b - total) + a;
        suma = V.float(total);
      }
    }
    if (Number.isFinite(ajuste) && ajuste !== 0) return V.float(V.num(suma) + ajuste);
    return suma;
  }
  function extremo(args, error, sentido) {
    if (args.length === 1 && args[0]?.tipo === 'range' && args[0].longitud) {
      const { inicio, paso, longitud } = args[0];
      return paso * sentido > 0 ? inicio + (longitud - 1) * paso : inicio;
    }
    let elegido, hay = false;
    for (const v of args.length === 1 ? V.iterable(args[0], error) : args) {
      if (!hay || V.ordenar(v, elegido, error) * sentido > 0) elegido = v;
      hay = true;
    }
    if (!hay) error('ValueError', 'La secuencia está vacía.');
    return elegido;
  }
  function buscar(lista, item, error, inicio = 0, fin = lista.length) {
    const ajustar = n => n < 0 ? Math.max(0, lista.length + n) : Math.min(lista.length, n);
    const limite = ajustar(fin);
    for (let i = ajustar(inicio); i < limite; i++) if (V.igual(lista[i], item)) return i;
    error('ValueError', 'No se encontró ese valor en la lista.');
  }
  const metodosLista = {
    append: [1, 1, (x, [v], e) => { if (x.length === 10000) e('OverflowError', 'La lista está llena.'); x.push(v); return null; }],
    pop: [0, 1, (x, [i = -1], e) => x.splice(V.posicion(V.entero(i, e), x.length, e, 'La lista'), 1)[0]],
    insert: [2, 2, (x, [i, v], e) => {
      if (x.length === 10000) e('OverflowError', 'La lista está llena.');
      x.splice(V.entero(i, e), 0, v);
      return null;
    }],
    remove: [1, 1, (x, [v], e) => { x.splice(buscar(x, v, e), 1); return null; }],
    index: [1, 3, (x, [v, a = 0, b = x.length], e) => buscar(x, v, e, V.entero(a, e), V.entero(b, e))],
    count: [1, 1, (x, [v]) => x.filter(item => V.igual(v, item)).length]
  };
  function texto(x, error) {
    if (typeof x !== 'string') error('TypeError', 'Se esperaba un texto.');
    return x;
  }
  function reemplazar(x, [a, b, n = -1], e) {
    a = texto(a, e);
    b = texto(b, e);
    n = V.entero(n, e);
    const partes = a ? x.split(a) : ['', ...x, ''];
    const cambiar = n < 0 ? partes.length - 1 : Math.min(n, partes.length - 1);
    if ((b.length - a.length) * cambiar + x.length > 100000) e('OverflowError', 'El texto supera los 100 000 caracteres.');
    return partes.slice(0, cambiar + 1).join(b) + (cambiar + 1 < partes.length ? a + partes.slice(cambiar + 1).join(a) : '');
  }
  function dividirTexto(x, [sep = null, maximo = -1], e) {
    let restantes = V.entero(maximo, e);
    if (restantes < 0) restantes = Infinity;
    const partes = [];
    if (sep !== null) {
      sep = texto(sep, e);
      if (!sep) e('ValueError', 'El separador no puede estar vacío.');
      let inicio = 0, i;
      while (restantes-- > 0 && (i = x.indexOf(sep, inicio)) !== -1) {
        partes.push(x.slice(inicio, i));
        inicio = i + sep.length;
        V.limite(partes, e);
      }
      partes.push(x.slice(inicio));
      return partes;
    }
    let i = 0;
    while (i < x.length) {
      while (i < x.length && espacios.test(x[i])) i++;
      if (i === x.length) break;
      if (restantes-- === 0) { partes.push(x.slice(i)); break; }
      const inicio = i;
      while (i < x.length && !espacios.test(x[i])) i++;
      partes.push(x.slice(inicio, i));
      V.limite(partes, e);
    }
    return partes;
  }
  function buscarTexto(x, [sub, a = 0, b = [...x].length], e, modo) {
    const letras = [...x], inicio = V.entero(a, e), fin = V.entero(b, e);
    const desde = inicio < 0 ? Math.max(0, letras.length + inicio) : inicio;
    const hasta = fin < 0 ? Math.max(0, letras.length + fin) : Math.min(fin, letras.length);
    const partes = sub?.tipo === 'tuple' && ['startsWith', 'endsWith'].includes(modo) ? sub.items : [sub];
    const zona = letras.slice(desde, hasta).join('');
    for (const parte of partes) {
      const s = texto(parte, e);
      if (modo === 'count') return desde > hasta ? 0 : s ? zona.split(s).length - 1 : hasta - desde + 1;
      if (modo === 'find') {
        const i = zona.indexOf(s);
        return desde > hasta || i < 0 ? -1 : desde + [...zona.slice(0, i)].length;
      }
      if (desde <= hasta && zona[modo](s)) return true;
    }
    return false;
  }
  const titlecase = c => {
    const especial = { 'Ǆ': 'ǅ', 'ǅ': 'ǅ', 'ǆ': 'ǅ', 'Ǉ': 'ǈ', 'ǈ': 'ǈ', 'ǉ': 'ǈ',
      'Ǌ': 'ǋ', 'ǋ': 'ǋ', 'ǌ': 'ǋ', 'Ǳ': 'ǲ', 'ǲ': 'ǲ', 'ǳ': 'ǲ' };
    const codigo = c.codePointAt(0);
    if (codigo >= 0x1f80 && codigo <= 0x1faf) return String.fromCodePoint(codigo | 8);
    if (codigo === 0x1fb3 || codigo === 0x1fc3 || codigo === 0x1ff3) return String.fromCodePoint(codigo + 9);
    const [primera, ...resto] = c.toUpperCase();
    return especial[c] || primera + resto.join('').toLowerCase();
  };
  const metodosDict = {
    keys: [0, 0, x => V.vista(x, 'keys')],
    values: [0, 0, x => V.vista(x, 'values')],
    items: [0, 0, x => V.vista(x, 'items')],
    get: [1, 2, (x, [k, d = null], e) => V.obtener(x, k, e, d)],
    pop: [1, 2, (x, [k, d], e) => V.obtener(x, k, e, d, true)]
  };
  const metodosTexto = {
    isupper: [0, 0, x => /\p{Uppercase}/u.test(x) && !/[\p{Lowercase}\p{Lt}]/u.test(x)],
    upper: [0, 0, x => x.toUpperCase()],
    lower: [0, 0, x => x.toLowerCase()],
    strip: [0, 1, (x, [chars = null], e) => {
      if (chars !== null) texto(chars, e);
      const quitar = chars === null ? c => espacios.test(c) : c => chars.includes(c);
      const letras = [...x];
      let a = 0, b = letras.length;
      while (a < b && quitar(letras[a])) a++;
      while (b > a && quitar(letras[b - 1])) b--;
      return letras.slice(a, b).join('');
    }],
    replace: [2, 3, reemplazar],
    split: [0, 2, dividirTexto],
    join: [1, 1, (x, [items], e) => {
      let salida = '', primero = true;
      for (const item of V.iterable(items, e)) {
        salida = V.limite(salida + (primero ? '' : x) + texto(item, e), e);
        primero = false;
      }
      return salida;
    }],
    startswith: [1, 3, (x, a, e) => buscarTexto(x, a, e, 'startsWith')],
    endswith: [1, 3, (x, a, e) => buscarTexto(x, a, e, 'endsWith')],
    count: [1, 3, (x, a, e) => buscarTexto(x, a, e, 'count')],
    find: [1, 3, (x, a, e) => buscarTexto(x, a, e, 'find')],
    isdigit: [0, 0, x => /^[\p{Nd}²³¹፩-፱᧚⁰⁴-⁹₀-₉①-⑨⑴-⒐⓪⓵-⓽⓿❶-❾➀-➈➊-➒𐩀-𐩃𐹠-𐹨𑁒-𑁚🄀-🄊]+$/u.test(x)],
    isalpha: [0, 0, x => /^\p{L}+$/u.test(x)],
    capitalize: [0, 0, x => x ? titlecase([...x][0]) + [...x.toLowerCase()].slice(1).join('') : x],
    title: [0, 0, x => {
      let anterior = false;
      return Array.from(x, c => {
        const s = anterior ? c.toLowerCase() : titlecase(c);
        anterior = /\p{Cased}/u.test(c);
        return s;
      }).join('');
    }]
  };
  function cercana(nombre, opciones) {
    const distancia = variante => {
      let fila = Array.from({ length: variante.length + 1 }, (_, i) => i);
      for (const c of nombre) {
        const previa = fila;
        fila = [previa[0] + 1];
        for (let i = 0; i < variante.length; i++) fila.push(Math.min(fila[i] + 1, previa[i + 1] + 1, previa[i] + (c !== variante[i])));
      }
      return fila.at(-1);
    };
    if (nombre.length > 64) return '';
    const pares = [...opciones].filter(s => Math.abs(nombre.length - s.length) <= 2)
      .map(s => [s, distancia(s)]).sort((a, b) => a[1] - b[1]);
    const tolerancia = nombre.length <= 2 ? 0 : nombre.length <= 4 ? 1 : 2;
    return pares[0] && pares[0][1] > 0 && pares[0][1] <= tolerancia ? ' ¿Querías escribir ' + pares[0][0] + '?' : '';
  }
  function metodo(base, nombre, error) {
    if (Array.isArray(base) && nombre === 'sort') return { tipo: 'integrada', nombre, ordenar: true, base };
    if (base?.tipo === 'modulo' && base.attrs.has(nombre)) return base.attrs.get(nombre);
    const metodos = Array.isArray(base) ? metodosLista : typeof base === 'string' ? metodosTexto : base?.tipo === 'dict' ? metodosDict : {};
    if (!Object.hasOwn(metodos, nombre)) error('AttributeError', 'Este valor no tiene el método ' + nombre + '.' + cercana(nombre, Object.keys(metodos)));
    const [min, max, fn] = metodos[nombre];
    return { tipo: 'integrada', nombre, fn: (args, kw, e) => {
      aridad(nombre, args, e, min, max);
      if (Object.keys(kw).length) e('TypeError', 'Usa argumentos posicionales para este método.');
      return V.limite(fn(base, args, e), e);
    } };
  }
  function crear(escribir, extras = {}) {
    const mapa = new Map([['print', { tipo: 'integrada', nombre: 'print', fn: (a, k, e) => imprimir(a, k, e, escribir) }]]);
    mapa.set('sorted', { tipo: 'integrada', nombre: 'sorted', ordenar: true });
    for (const [nombre, [min, max, fn]] of Object.entries(funciones)) {
      mapa.set(nombre, { tipo: 'integrada', nombre, fn: (args, kw, e) => {
        aridad(nombre, args, e, min, max);
        if (Object.keys(kw).length) e('TypeError', 'Usa argumentos posicionales.');
        return V.limite(fn(args, e), e);
      } });
    }
    for (const [nombre, fn] of Object.entries(extras)) {
      mapa.set(nombre, { tipo: 'integrada', nombre, fn: (args, kw, e) => {
        if (Object.keys(kw).length) e('TypeError', 'Usa argumentos posicionales para las órdenes del mapa.');
        try { return fn(...args.map(v => V.tipo(v) === 'float' ? V.num(v) : v)) ?? null; }
        catch (error) { return e('RuntimeError', error.message); }
      } });
    }
    return mapa;
  }
  const Integradas = { crear, metodo, cercana, lista };
  if (typeof module !== 'undefined') module.exports = Integradas;
  else (window.CR ||= {}).PyIntegradas = Integradas;
})();
