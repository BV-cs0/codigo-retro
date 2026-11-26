(function (CR) {
'use strict';
const Shell = CR.Shell = CR.Shell || {};
const S = typeof module !== 'undefined' ? require('../sfa') : Shell.SFA;
const comandos = Object.create(null);
const ayuda = Object.create(null);
function cmp(a, b) {
  const ai = Array.from(a, c => c.codePointAt(0));
  const bi = Array.from(b, c => c.codePointAt(0));
  for (let i = 0; i < Math.min(ai.length, bi.length); i++) if (ai[i] !== bi[i]) return ai[i] - bi[i];
  return ai.length - bi.length;
}
const lineas = texto => texto.match(/[^\n]*\n|[^\n]+$/g) || [];
const filas = texto => lineas(texto).map(l => l.replace(/\n$/, ''));
function registrar(nombre, descripcion, ejemplos, ejecutar, opciones = {}) {
  comandos[nombre] = ejecutar;
  ayuda[nombre] = { descripcion, ejemplos, opciones };
}
function opciones(ctx, permitidas = '', valores = '') {
  const flags = Object.create(null);
  const args = [];
  let interpretar = true;
  for (let i = 0; i < ctx.args.length; i++) {
    const arg = ctx.args[i];
    if (interpretar && arg === '--') interpretar = false;
    else if (interpretar && arg.startsWith('-') && arg.length > 1) {
      for (let j = 1; j < arg.length; j++) {
        const c = arg[j];
        if (valores.includes(c)) {
          const valor = arg.slice(j + 1) || ctx.args[++i];
          if (valor === undefined) ctx.invalido(arg);
          flags[c] = valor;
          break;
        }
        if (!permitidas.includes(c)) ctx.invalido(arg);
        flags[c] = true;
      }
    } else args.push(arg);
  }
  return { flags, args };
}
function archivos(ctx, args, fn) {
  const nombres = args.length ? args : ['-'];
  for (const nombre of nombres) {
    try {
      const ruta = ctx.ruta(nombre);
      const datos = nombre === '-' ? ctx.entrada : ctx.fs.leer(ruta);
      if (nombre !== '-' && ['cat', 'head', 'tail', 'less'].includes(ctx.nombre)) ctx.sesion.leidos.add(ruta);
      fn(datos, nombre, nombres.length);
    } catch (e) { ctx.error(ctx.nombre + ': ' + nombre + ': ' + e.message); }
  }
}
function operar(ctx, args, prefijo, fn) {
  if (!args.length) return ctx.error(ctx.nombre + ': missing operand');
  for (const arg of args) {
    try { fn(arg, ctx.ruta(arg)); }
    catch (e) { ctx.error(ctx.nombre + ': ' + prefijo(arg) + ': ' + e.message); }
  }
}
function recorrer(ctx, visible, maximo, visitar, nivel = 0) {
  const ruta = ctx.ruta(visible);
  try {
    const nodo = ctx.fs.obtener(ruta, ctx.nombre !== 'find');
    visitar(visible, nodo, nivel);
    if (!nodo.carpeta || nivel >= maximo) return;
    const prefijo = visible.endsWith('/') ? visible : visible + '/';
    for (const hijo of ctx.fs.listar(ruta)) recorrer(ctx, prefijo + S.nombre(hijo), maximo, visitar, nivel + 1);
  } catch (e) { ctx.error(ctx.nombre + ": '" + visible + "': " + e.message, ctx.nombre === 'grep' ? 2 : 1); }
}
Shell.Base = { S, comandos, ayuda, registrar, opciones, archivos, operar, recorrer, lineas, filas, cmp };
if (typeof module !== 'undefined') module.exports = CR.Shell.Base;
})(globalThis.CR = globalThis.CR || {});

