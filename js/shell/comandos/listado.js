(function (CR) {
'use strict';
const Shell = CR.Shell = CR.Shell || {};
const { S, registrar: R, opciones, cmp } = typeof module !== 'undefined' ? require('./base') : Shell.Base;
const tamano = nodo => nodo.carpeta ? 4096 : S.bytes(nodo.contenido);
function humano(bytes) {
  const unidades = ['K', 'M', 'G'];
  let i = -1;
  while (bytes >= 1024 && i < unidades.length - 1) { bytes /= 1024; i++; }
  return i < 0 ? String(bytes) : (bytes < 10 ? (Math.ceil(bytes * 10) / 10).toFixed(1) : Math.ceil(bytes)) + unidades[i];
}
function fecha(nodo) {
  const d = new Date(nodo.fecha);
  const meses = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ');
  const dias = (Date.parse(S.FECHA) - d.getTime()) / 86400000;
  const hora = dias < -1 || dias > 182 ? String(d.getUTCFullYear()).padStart(5) : d.toISOString().slice(11, 16);
  return meses[d.getUTCMonth()] + ' ' + String(d.getUTCDate()).padStart(2) + ' ' + hora;
}
function ordenar(datos, flags) {
  return datos.sort((a, b) => (flags.r ? -1 : 1) *
    ((flags.S ? tamano(b.nodo) - tamano(a.nodo) : flags.t ? Date.parse(b.nodo.fecha) - Date.parse(a.nodo.fecha) : 0) ||
    cmp(a.nombre, b.nombre)));
}
function detalle(c, datos, flags, total) {
  const filas = datos.map(({ ruta, nombre, nodo }) => [
    (nodo.carpeta ? 'd' : '-') + nodo.permisos,
    String(nodo.carpeta ? 2 + c.fs.hijos(ruta).filter(p => c.fs.nodos.get(p).carpeta).length : 1),
    nodo.dueno, nodo.grupo, flags.h ? humano(tamano(nodo)) : String(tamano(nodo)), fecha(nodo), nombre
  ]);
  const anchos = [1, 2, 3, 4].map(i => Math.max(0, ...filas.map(f => f[i].length)));
  if (total) {
    const bloques = datos.reduce((n, { nodo }) => n + Math.ceil(tamano(nodo) / 4096) * 4, 0);
    c.out('total ' + (flags.h ? humano(bloques * 1024) : bloques) + '\n');
  }
  filas.forEach((f, i) => {
    c.out([f[0], f[1].padStart(anchos[0]), f[2].padEnd(anchos[1]), f[3].padEnd(anchos[2]),
      f[4].padStart(anchos[3]), f[5]].join(' ') + ' ');
    c.out(f[6], datos[i].nodo.carpeta ? 'carpeta' : '');
    c.out('\n');
  });
}
function columnas(c, datos) {
  let filas, anchos;
  for (let cols = Math.min(datos.length, 40); cols >= 1; cols--) {
    filas = Math.ceil(datos.length / cols);
    anchos = Array.from({ length: cols }, (_, i) =>
      Math.max(0, ...datos.slice(i * filas, (i + 1) * filas).map(e => Array.from(e.nombre).length)));
    if (anchos.reduce((n, ancho) => n + ancho + 2, -2) <= c.sesion.columnas) break;
  }
  for (let j = 0; j < filas; j++) {
    const fila = datos.filter((_, i) => i % filas === j);
    fila.forEach(({ nombre, nodo }, i) => {
      c.out(nombre, nodo.carpeta ? 'carpeta' : '');
      if (i < fila.length - 1) c.out(' '.repeat(anchos[i] - Array.from(nombre).length + 2));
    });
    c.out('\n');
  }
}
function listado(c, datos, flags, total) {
  if (flags.l) detalle(c, datos, flags, total);
  else if (flags['1'] || c.captura) datos.forEach(d => c.out(d.nombre + '\n', d.nodo.carpeta ? 'carpeta' : ''));
  else columnas(c, datos);
}
function directorio(c, entrada, flags, rotulo) {
  if (rotulo) c.out(entrada.nombre + ':\n');
  let hijos;
  try { hijos = c.fs.listar(entrada.ruta); }
  catch (e) { return c.error("ls: cannot open directory '" + entrada.nombre + "': " + e.message, 2); }
  const datos = hijos.filter(p => flags.a || flags.A || !S.nombre(p).startsWith('.'))
    .map(ruta => ({ ruta, nombre: S.nombre(ruta), nodo: c.fs.nodos.get(ruta) }));
  if (flags.a) for (const [nombre, ruta] of [['.', entrada.ruta], ['..', S.padre(entrada.ruta)]]) {
    datos.push({ nombre, ruta, nodo: c.fs.nodos.get(ruta) });
  }
  ordenar(datos, flags);
  listado(c, datos, flags, true);
  if (flags.R) for (const dato of datos) {
    if (!dato.nodo.carpeta || ['.', '..'].includes(dato.nombre)) continue;
    c.out('\n');
    directorio(c, { ...dato, nombre: entrada.nombre.replace(/\/$/, '') + '/' + dato.nombre }, flags, true);
  }
}
R('ls', 'Lista archivos y carpetas.', ['ls -la', 'ls -lhS cartas'], c => {
  const { args, flags } = opciones(c, 'laAhR1tSr');
  const datos = [];
  for (const nombre of args.length ? args : ['.']) {
    const ruta = c.ruta(nombre);
    try { datos.push({ ruta, nombre, nodo: c.fs.obtener(ruta) }); }
    catch (e) { c.error("ls: cannot access '" + nombre + "': " + e.message, 2); }
  }
  ordenar(datos, flags);
  const archivos = datos.filter(d => !d.nodo.carpeta);
  const carpetas = datos.filter(d => d.nodo.carpeta);
  if (archivos.length) listado(c, archivos, flags, false);
  carpetas.forEach((d, i) => {
    if (archivos.length || i) c.out('\n');
    directorio(c, d, flags, flags.R || args.length > 1);
  });
}, { '-l': 'permisos y tamaños', '-a / -A': 'incluye ocultos', '-h': 'tamaños legibles',
  '-R': 'recorre subcarpetas', '-1': 'un nombre por línea', '-t / -S': 'fecha o tamaño', '-r': 'invierte el orden' });
R('tree', 'Dibuja un árbol de carpetas.', ['tree', 'tree almacen'], c => {
  const { args } = opciones(c);
  let carpetas = 0;
  let archivos = 0;
  function arbol(ruta, prefijo) {
    let hijos;
    try { hijos = c.fs.listar(ruta).filter(p => !S.nombre(p).startsWith('.')).sort(cmp); }
    catch { c.out(' [error opening dir]\n'); return; }
    hijos.forEach((hijo, i) => {
      const ultimo = i === hijos.length - 1;
      c.out(prefijo + (ultimo ? '└── ' : '├── ') + S.nombre(hijo) + '\n');
      if (c.fs.nodos.get(hijo).carpeta) { carpetas++; arbol(hijo, prefijo + (ultimo ? '    ' : '│   ')); }
      else archivos++;
    });
  }
  for (const arg of args.length ? args : ['.']) {
    c.out(arg + '\n');
    arbol(c.ruta(arg), '');
  }
  c.out('\n' + carpetas + (carpetas === 1 ? ' directory, ' : ' directories, ') +
    archivos + (archivos === 1 ? ' file\n' : ' files\n'));
});
})(globalThis.CR = globalThis.CR || {});

