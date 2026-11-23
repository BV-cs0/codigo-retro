(function () {
  'use strict';
  const float = valor => ({ tipo: 'float', valor });
  const tupla = items => ({ tipo: 'tuple', items });
  const dict = () => ({ tipo: 'dict', pares: new Map() });
  const vista = (base, nombre) => ({ tipo: 'dict_' + nombre, base });
  function clave(x, error) {
    if (numerico(x)) return num(x);
    if (typeof x === 'string' || x === null) return x;
    error('TypeError', 'Este valor no puede ser una clave.', "unhashable type: '" + tipo(x) + "'");
  }
  function poner(d, k, v, error) {
    const id = clave(k, error);
    if (!d.pares.has(id) && d.pares.size >= 10000) error('OverflowError', 'El diccionario está lleno.');
    d.pares.set(id, [d.pares.has(id) ? d.pares.get(id)[0] : k, v]);
  }
  function obtener(d, k, error, defecto, borrar = false) {
    const id = clave(k, error);
    if (!d.pares.has(id)) {
      if (defecto !== undefined) return defecto;
      error('KeyError', 'Esa clave no existe en el diccionario.', repr(k));
    }
    const valor = d.pares.get(id)[1];
    if (borrar) d.pares.delete(id);
    return valor;
  }
  const tipo = x => x === null ? 'NoneType' : Array.isArray(x) ? 'list' : x?.tipo ||
    ({ boolean: 'bool', number: 'int', string: 'str' })[typeof x];
  const numerico = x => ['int', 'float', 'bool'].includes(tipo(x));
  const num = x => Number(x?.tipo === 'float' ? x.valor : x);
  const verdad = x => numerico(x) ? num(x) !== 0 : Array.isArray(x) || typeof x === 'string' ? x.length > 0 :
    x?.tipo === 'range' ? x.longitud > 0 : x?.tipo === 'tuple' ? x.items.length > 0 :
      x?.tipo === 'dict' ? x.pares.size > 0 : x?.base?.tipo === 'dict' ? x.base.pares.size > 0 : x !== null;
  function decimal(n) {
    if (!Number.isFinite(n)) return Number.isNaN(n) ? 'nan' : n < 0 ? '-inf' : 'inf';
    if (Object.is(n, -0)) return '-0.0';
    const abs = Math.abs(n);
    if (abs >= 1e16 || (abs && abs < 1e-4)) {
      return n.toExponential().replace(/e([+-])(\d)$/, 'e$10$2');
    }
    return String(n) + (Number.isInteger(n) ? '.0' : '');
  }
  function cita(s) {
    const comilla = s.includes("'") && !s.includes('"') ? '"' : "'";
    return comilla + Array.from(s, c => {
      if (c === comilla || c === '\\') return '\\' + c;
      const escape = { '\n': '\\n', '\t': '\\t', '\r': '\\r' }[c];
      if (escape) return escape;
      if (c !== ' ' && /[\p{C}\p{Z}]/u.test(c)) {
        const n = c.codePointAt(0);
        const tamaño = n < 256 ? 2 : n < 65536 ? 4 : 8;
        return '\\' + { 2: 'x', 4: 'u', 8: 'U' }[tamaño] + n.toString(16).padStart(tamaño, '0');
      }
      return c;
    }).join('') + comilla;
  }
  function repr(x, error = () => { throw new RangeError('Representación demasiado larga'); }, vistos = new Set()) {
    switch (tipo(x)) {
      case 'str': return cita(x);
      case 'bool': return x ? 'True' : 'False';
      case 'NoneType': return 'None';
      case 'float': return decimal(x.valor);
      case 'clase': return "<class '" + x.nombre + "'>";
      case 'funcion': return '<function ' + x.nombre + '>';
      case 'integrada': return '<built-in function ' + x.nombre + '>';
      case 'modulo': return "<module '" + x.nombre + "'>";
      case 'excepcion': return x.error.tipo + '(' + x.args.map(v => repr(v, error, vistos)).join(', ') + ')';
      case 'tuple': case 'dict': case 'dict_keys': case 'dict_values': case 'dict_items':
        return reprColeccion(x, error, vistos);
      case 'range': return 'range(' + [x.inicio, x.fin, ...(x.paso === 1 ? [] : [x.paso])].join(', ') + ')';
      case 'list': {
        if (vistos.has(x)) return '[...]';
        vistos.add(x);
        let salida = '[';
        for (let i = 0; i < x.length; i++) {
          salida = limite(salida + (i ? ', ' : '') + repr(x[i], error, vistos), error);
        }
        vistos.delete(x);
        return limite(salida + ']', error);
      }
      default: return String(x);
    }
  }
  function reprColeccion(x, error, vistos) {
    if (vistos.has(x)) return x.tipo === 'dict' ? '{...}' : x.tipo === 'tuple' ? '(...)' : '...';
    vistos.add(x);
    const r = v => repr(v, error, vistos);
    const esDict = x.tipo === 'dict';
    let texto = '', cantidad = 0;
    for (const item of esDict ? x.pares.values() : iterable(x, error)) {
      const parte = esDict ? r(item[0]) + ': ' + r(item[1]) : r(item);
      texto = limite(texto + (cantidad++ ? ', ' : '') + parte, error);
    }
    vistos.delete(x);
    if (esDict) return limite('{' + texto + '}', error);
    if (x.tipo === 'tuple') return limite('(' + texto + (cantidad === 1 ? ',' : '') + ')', error);
    return limite(x.tipo + '([' + texto + '])', error);
  }
  const str = (x, error) => typeof x === 'string' ? x : x?.tipo === 'excepcion' ? x.error.original : repr(x, error);
  function limite(x, error) {
    if (tipo(x) === 'int' && Math.abs(x) > 2 ** 53) error('OverflowError', 'Número demasiado grande.');
    if (typeof x === 'string' && x.length > 100000 && [...x].length > 100000) error('OverflowError', 'El texto supera los 100 000 caracteres.');
    if (Array.isArray(x) && x.length > 10000) error('OverflowError', 'La lista supera los 10 000 elementos.');
    return x;
  }
  function leerEntero(texto, error) {
    const magnitud = texto.replace(/^[+-]?0*/, '') || '0';
    const maximo = '9007199254740992';
    if (magnitud.length > maximo.length || (magnitud.length === maximo.length && magnitud > maximo)) {
      error('OverflowError', 'Número demasiado grande.');
    }
    return Number(texto) || 0;
  }
  function entero(x, error) {
    if (!['int', 'bool'].includes(tipo(x))) error('TypeError', 'Se necesita un número entero.');
    return num(x);
  }
  function* iterable(x, error) {
    if (x?.tipo === 'range') {
      for (let i = 0; i < x.longitud; i++) yield x.inicio + i * x.paso;
    } else if (typeof x === 'string' || Array.isArray(x)) yield* x;
    else if (x?.tipo === 'tuple') yield* x.items;
    else if (x?.tipo === 'dict' || x?.base?.tipo === 'dict') {
      const d = x.base || x, tamaño = d.pares.size;
      for (const [k, v] of d.pares.values()) {
        yield x.tipo === 'dict_items' ? tupla([k, v]) : x.tipo === 'dict_values' ? v : k;
        if (d.pares.size !== tamaño) error('RuntimeError', 'El tamaño del diccionario cambió al recorrerlo.', 'dictionary changed size during iteration');
      }
    }
    else error('TypeError', 'Este valor no se puede recorrer.');
  }
  function igual(a, b) {
    if (numerico(a) && numerico(b)) return num(a) === num(b);
    if (a?.tipo === 'tuple' && b?.tipo === 'tuple') return igual(a.items, b.items);
    if (a?.tipo === 'dict' && b?.tipo === 'dict') return a === b || (a.pares.size === b.pares.size &&
      [...a.pares].every(([id, [, v]]) => b.pares.has(id) && igual(v, b.pares.get(id)[1])));
    if (Array.isArray(a) && Array.isArray(b)) return a === b || (a.length === b.length && a.every((v, i) => igual(v, b[i])));
    return a === b || (a?.tipo === 'clase' && b?.tipo === 'clase' && a.nombre === b.nombre);
  }
  function ordenar(a, b, error) {
    if (numerico(a) && numerico(b)) return num(a) === num(b) ? 0 : Math.sign(num(a) - num(b));
    if (typeof a === 'string' && typeof b === 'string') {
      const izq = Array.from(a, c => c.codePointAt(0));
      const der = Array.from(b, c => c.codePointAt(0));
      return ordenarListas(izq, der, error);
    }
    if (Array.isArray(a) && Array.isArray(b)) return ordenarListas(a, b, error);
    if (a?.tipo === 'tuple' && b?.tipo === 'tuple') return ordenarListas(a.items, b.items, error);
    error('TypeError', 'No se pueden ordenar valores de estos tipos.');
  }
  function ordenarListas(a, b, error) {
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      if (!igual(a[i], b[i])) return ordenar(a[i], b[i], error);
    }
    return Math.sign(a.length - b.length);
  }
  function comparar(op, a, b, error) {
    if (op === '==' || op === '!=') return igual(a, b) === (op === '==');
    if (op === 'in' || op === 'not in') {
      let existe;
      if (typeof b === 'string') {
        if (typeof a !== 'string') error('TypeError', 'Para buscar dentro de un texto, usa otro texto.');
        existe = b.includes(a);
      } else if (b?.tipo === 'dict' || b?.tipo === 'dict_keys') {
        existe = (b.base || b).pares.has(clave(a, error));
      } else if (b?.tipo === 'range') {
        const i = numerico(a) ? (num(a) - b.inicio) / b.paso : NaN;
        existe = Number.isInteger(i) && i >= 0 && i < b.longitud;
      } else {
        existe = false;
        for (const v of iterable(b, error)) if (igual(a, v)) { existe = true; break; }
      }
      return existe === (op === 'in');
    }
    const orden = ordenar(a, b, error);
    return { '<': orden < 0, '>': orden > 0, '<=': orden <= 0, '>=': orden >= 0 }[op];
  }
  function dividir(x, y, op, flotante) {
    if (op === '/') return x / y;
    let resto = x % y;
    let cociente = (x - resto) / y;
    if (resto && (resto < 0) !== (y < 0)) { resto += y; cociente--; }
    if (op === '%') return resto || (y < 0 ? -0 : 0);
    if (!flotante) return Math.floor(x / y);
    return cociente ? Math.round(cociente) : (x / y) * 0;
  }
  function repetir(x, n, error) {
    n = Math.max(0, n);
    if (!x.length || !n) return typeof x === 'string' ? '' : [];
    if (x.length * n > (typeof x === 'string' ? 100000 : 10000)) error('OverflowError', 'La repetición supera el límite de tamaño.');
    return typeof x === 'string' ? x.repeat(n) : Array.from({ length: n }, () => x).flat();
  }
  function operar(op, a, b, error) {
    if (op === '+' && typeof a === 'string' && typeof b === 'string') return limite(a + b, error);
    if (op === '+' && Array.isArray(a) && Array.isArray(b)) return limite(a.concat(b), error);
    const secuencia = v => typeof v === 'string' || Array.isArray(v);
    if (op === '*' && secuencia(a)) return repetir(a, entero(b, error), error);
    if (op === '*' && secuencia(b)) return repetir(b, entero(a, error), error);
    if (!numerico(a) || !numerico(b)) {
      const original = "unsupported operand type(s) for " + op + ": '" + tipo(a) + "' and '" + tipo(b) + "'";
      if (op === '+' && (typeof a === 'string' || typeof b === 'string')) {
        error('TypeError', 'No se puede sumar un texto y un número. Convierte el número con str() o usa una f-string.',
          typeof a === 'string' ? 'can only concatenate str (not "' + tipo(b) + '") to str' : original);
      }
      error('TypeError', 'No se puede hacer esta operación con estos valores.', original);
    }
    const x = num(a), y = num(b);
    if ((!y && ['/', '//', '%'].includes(op)) || (!x && y < 0 && op === '**')) {
      // Mensajes de CPython 3.14.
      const mensaje = op === '**' ? 'zero to a negative power' : 'division by zero';
      error('ZeroDivisionError', 'No se puede dividir entre cero.', mensaje);
    }
    const flotante = tipo(a) === 'float' || tipo(b) === 'float' || op === '/' || (op === '**' && y < 0);
    let resultado;
    switch (op) {
      case '+': resultado = x + y; break;
      case '-': resultado = x - y; break;
      case '*': resultado = x * y; break;
      case '**': resultado = x ** y; break;
      default: resultado = dividir(x, y, op, flotante);
    }
    if (!flotante && Math.abs(resultado) === 2 ** 53 && ['+', '-', '*', '**'].includes(op)) {
      const [i, j] = [BigInt(x), BigInt(y)];
      const exacto = { '+': () => i + j, '-': () => i - j, '*': () => i * j, '**': () => i ** j }[op]();
      if (exacto < -(2n ** 53n) || exacto > 2n ** 53n) error('OverflowError', 'Número demasiado grande.');
    }
    return limite(flotante ? float(resultado) : resultado || 0, error);
  }
  function posicion(i, n, error, nombre) {
    const j = i < 0 ? n + i : i;
    if (j < 0 || j >= n) error('IndexError', nombre + ' tiene ' + n + ' elementos: las posiciones válidas van de 0 a ' + (n - 1) + '.',
      ({ 'El texto': 'string', 'La tupla': 'tuple' })[nombre] ? ({ 'El texto': 'string', 'La tupla': 'tuple' })[nombre] + ' index out of range' : 'list index out of range');
    return j;
  }
  const Valores = { float, tipo, numerico, num, verdad, repr, str, limite, leerEntero, entero, iterable, igual, ordenar, comparar, operar, posicion,
    tupla, dict, vista, poner, obtener };
  if (typeof module !== 'undefined') module.exports = Valores;
  else (window.CR ||= {}).PyValores = Valores;
})();
