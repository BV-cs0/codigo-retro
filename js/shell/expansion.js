(function (CR) {
'use strict';
const traducir = typeof module !== 'undefined' ? require('../comun/idioma').t : globalThis.CR.t;
const Shell = CR.Shell = CR.Shell || {};
const { patron, nombre } = typeof module !== 'undefined' ? require('./sfa') : Shell.SFA;
const Lexico = typeof module !== 'undefined' ? require('./lexico') : Shell.Lexico;
if (typeof module !== 'undefined') require('./aritmetica');
function parametro(clave, sesion) {
  if (clave === '?') return String(sesion.codigo);
  if (clave === '#') return String(sesion.args?.length ?? 0);
  if (clave === '@' || clave === '*') return (sesion.args || []).join(' ');
  if (/^[A-Za-z_]\w*$|^[0-9]$/.test(clave)) return sesion.vars[clave] ?? '';
  if (/^\d{2,}$/.test(clave)) {
    const i = Number(clave);
    return (i === 0 ? sesion.vars[0] : sesion.args?.[i - 1]) ?? '';
  }
  if (/^#[A-Za-z_]\w*$/.test(clave)) return String(new TextEncoder().encode(parametro(clave.slice(1), sesion)).length);
  const defecto = clave.match(/^([A-Za-z_]\w*|\d):-(.*)$/s);
  if (defecto) return parametro(defecto[1], sesion) || trozos(defecto[2], sesion).map(t => t.texto).join('');
  const quitar = clave.match(/^([A-Za-z_]\w*)%([^*?\[]+)$/);
  if (quitar) {
    const v = parametro(quitar[1], sesion);
    return v.endsWith(quitar[2]) ? v.slice(0, -quitar[2].length) : v;
  }
  const reemplazar = clave.match(/^([A-Za-z_]\w*)\/\/([^/*?\[]+)\/([^/]*)$/);
  if (reemplazar) return parametro(reemplazar[1], sesion).replaceAll(reemplazar[2], reemplazar[3]);
  throw new Error(traducir("shell.expansion_de_parametro_fuera_del") + clave);
}
function trozos(texto, sesion, documento = false) {
  const valores = [];
  let literal = '';
  for (let i = 0; i < texto.length;) {
    if (documento && texto[i] === '\\' && /[\$`\\\n]/.test(texto[i + 1] || '')) {
      if (texto[i + 1] !== '\n') literal += texto[i + 1];
      i += 2;
      continue;
    }
    const fin = Lexico.sustitucion(texto, i);
    const token = fin > i ? texto.slice(i, fin) : texto.slice(i).match(/^\$(?:[a-zA-Z_]\w*|[?0-9#@*])/)?.[0];
    if (!token) { literal += texto[i++]; continue; }
    if (literal) valores.push({ texto: literal, expansion: false });
    literal = '';
    let valor;
    if (token.startsWith('$((')) valor = String(Shell.Aritmetica.calcular(token.slice(3, -2), sesion.vars));
    else if (token.startsWith('$(') || token.startsWith('`')) {
      if (!Shell.Bash) throw new Error(traducir("shell.sustitucion_de_comandos_no_disponible"));
      valor = Shell.Bash.capturar(token.startsWith('`') ? token.slice(1, -1) : token.slice(2, -1), sesion);
    } else valor = parametro(token.startsWith('${') ? token.slice(2, -1) : token.slice(1), sesion);
    valores.push({ texto: valor, expansion: true, varios: /^\$(?:@|\{@\})$/.test(token) });
    i += token.length;
  }
  if (literal) valores.push({ texto: literal, expansion: false });
  return valores;
}
function campos(partes, sesion, literal, comodines = !literal) {
  const valores = [{ texto: '', activos: [] }];
  let presente = literal;
  const insertar = (texto, activo) => {
    const actual = valores[valores.length - 1];
    const inicio = actual.texto.length;
    actual.texto += texto;
    if (activo) for (let i = inicio; i < actual.texto.length; i++) actual.activos[i] = true;
    presente ||= Boolean(texto);
  };
  for (const [i, parte] of partes.entries()) {
    const libre = parte.modo === 'libre';
    let texto = parte.texto;
    if (i === 0 && libre && /^~(?:\/|$)/.test(texto)) texto = (sesion.vars.HOME ?? sesion.identidad.home) + texto.slice(1);
    const piezas = parte.modo === 'literal' ? [{ texto }] : trozos(texto, sesion);
    if (!libre && !(piezas.length === 1 && piezas[0].varios && !literal)) presente = true;
    for (const pieza of piezas) {
      const valor = pieza.texto;
      if (pieza.varios && !libre && !literal) {
        for (const [j, arg] of (sesion.args || []).entries()) {
          if (j) valores.push({ texto: '', activos: [] });
          insertar(arg, false);
          presente = true;
        }
      } else if (pieza.expansion && libre && !literal) {
          for (const trozo of valor.split(/([ \t\n]+)/)) {
            if (/^[ \t\n]+$/.test(trozo)) {
              if (presente) valores.push({ texto: '', activos: [] });
              presente = false;
            } else insertar(trozo, true);
          }
      } else insertar(valor, libre && comodines);
    }
  }
  if (!presente) valores.pop();
  return valores;
}
function glob(campo, sesion) {
  const { texto, activos } = campo;
  if (![...texto].some((c, i) => activos[i] && '*?['.includes(c))) return [texto];
  let rutas = [texto.startsWith('/') ? '/' : ''];
  let inicio = 0;
  for (const parte of texto.split('/')) {
    const base = inicio;
    inicio += parte.length + 1;
    if (!parte) continue;
    const regex = patron(parte, i => activos[base + i]);
    const magica = parte.split('').some((c, i) => activos[base + i] && '*?['.includes(c));
    rutas = rutas.flatMap(ruta => {
      const prefijo = ruta && !ruta.endsWith('/') ? ruta + '/' : ruta;
      if (!magica) return [prefijo + parte];
      let hijos;
      try { hijos = sesion.fs.listar(sesion.ruta(ruta || '.', false)); }
      catch { return []; }
      return hijos.map(nombre).filter(n => (parte.startsWith('.') || !n.startsWith('.')) && regex.test(n))
        .map(n => prefijo + n);
    });
  }
  rutas = rutas.filter(ruta => {
    try {
      const nodo = sesion.fs.obtener(sesion.ruta(ruta, false), texto.endsWith('/'));
      return !texto.endsWith('/') || nodo.carpeta;
    } catch { return false; }
  }).sort(Shell.Base?.cmp);
  return rutas.length ? rutas.map(r => r + (texto.endsWith('/') ? '/' : '')) : [texto];
}
function rangoLlaves(texto) {
  const numeros = texto.match(/^([+-]?\d+)\.\.([+-]?\d+)(?:\.\.([+-]?\d+))?$/);
  const letras = numeros ? null : texto.match(/^([a-zA-Z])\.\.([a-zA-Z])(?:\.\.([+-]?\d+))?$/);
  if (!numeros && !letras) return null;
  const [, a, b, paso = '1'] = numeros || letras;
  const [inicio, fin] = numeros ? [Number(a), Number(b)] : [a.charCodeAt(0), b.charCodeAt(0)];
  const salto = Math.abs(Number(paso)) || 1;
  const diferencia = fin - inicio;
  const cantidad = Math.floor(Math.abs(diferencia) / salto) + 1;
  if (![inicio, fin, salto, diferencia].every(Number.isSafeInteger) || cantidad > 20001)
    throw new Error(traducir("shell.rango_de_llaves_demasiado_grande"));
  const ancho = /^-?0\d/.test(a) || /^-?0\d/.test(b) ? Math.max(a.length, b.length) : 0;
  return Array.from({ length: cantidad }, (_, i) => {
    const n = inicio + i * salto * Math.sign(diferencia);
    if (letras) return n === 92 ? '' : String.fromCharCode(n);
    return (n < 0 ? '-' : '') + String(Math.abs(n)).padStart(ancho - +(n < 0), '0');
  });
}
function sustituirLlave(partes, i, m, valor) {
  const parte = partes[i];
  const antes = parte.texto.slice(0, m.index), despues = parte.texto.slice(m.index + m[0].length);
  const reemplazo = valor === '`' || valor === '' ?
    [{ ...parte, texto: antes }, { modo: 'literal', texto: valor }, { ...parte, texto: despues }] :
    [{ ...parte, texto: antes + valor + despues }];
  return [...partes.slice(0, i), ...reemplazo, ...partes.slice(i + 1)];
}
function llaves(partes) {
  for (const [i, parte] of partes.entries()) {
    if (parte.modo !== 'libre') continue;
    const tramos = [];
    for (let j = 0; j < parte.texto.length;) {
      const fin = Lexico.sustitucion(parte.texto, j);
      if (fin > j) tramos.push([j, fin]);
      j = Math.max(fin, j + 1);
    }
    for (const m of parte.texto.matchAll(/\{([^{}]+)\}/g)) {
      if (tramos.some(([inicio, fin]) => inicio <= m.index && m.index < fin)) continue;
      const opciones = m[1].includes(',') ? m[1].split(',') : rangoLlaves(m[1]);
      if (opciones) return opciones.flatMap(o => llaves(sustituirLlave(partes, i, m, o)));
    }
  }
  return [partes];
}
function expandir(palabra, sesion, literal = false) {
  if (sesion.dialecto?.expandir) {
    const especial = sesion.dialecto.expandir(palabra, sesion, literal);
    if (especial !== undefined) return especial;
  }
  return (literal ? [palabra.partes] : llaves(palabra.partes))
    .flatMap(partes => campos(partes, sesion, literal)).flatMap(c => literal ? [c.texto] : glob(c, sesion));
}
function patronPalabra(palabra, sesion) {
  const [{ texto, activos }] = campos(palabra.partes, sesion, true, true);
  return patron(texto, i => activos[i], false);
}
function expandirDocumento(texto, sesion) {
  return trozos(texto, sesion, true).map(p => p.texto).join('');
}
Shell.Expansion = { expandir, expandirDocumento, patronPalabra };
if (typeof module !== 'undefined') module.exports = CR.Shell.Expansion;
})(globalThis.CR = globalThis.CR || {});

