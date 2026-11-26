(function (CR) {
'use strict';
const traducir = typeof module !== 'undefined' ? require('../../comun/idioma').t : globalThis.CR.t;
const Shell = CR.Shell = CR.Shell || {};
const { registrar: R, opciones, lineas } = typeof module !== 'undefined' ? require('./base') : Shell.Base;
function cambios(a, b) {
  const tabla = Array.from({ length: a.length + 1 }, () => new Uint16Array(b.length + 1));
  for (let i = a.length - 1; i >= 0; i--) for (let j = b.length - 1; j >= 0; j--) {
    tabla[i][j] = a[i] === b[j] ? 1 + tabla[i + 1][j + 1] : Math.max(tabla[i + 1][j], tabla[i][j + 1]);
  }
  const bloques = [];
  let i = 0;
  let j = 0;
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && a[i] === b[j]) { i++; j++; continue; }
    const x = i, y = j;
    while (i < a.length || j < b.length) {
      if (i < a.length && j < b.length && a[i] === b[j]) break;
      if (j === b.length || (i < a.length && tabla[i + 1][j] >= tabla[i][j + 1])) i++;
      else j++;
    }
    bloques.push([x, i, y, j]);
  }
  return bloques;
}
function mostrar(c, a, b, [x, i, y, j]) {
  const rango = (inicio, fin) => fin - inicio > 1 ? (inicio + 1) + ',' + fin : String(fin);
  const tipo = x === i ? 'a' : y === j ? 'd' : 'c';
  const prefijo = (marca, linea) => c.out(marca + linea + (linea.endsWith('\n') ? '' : '\n\\ No newline at end of file\n'));
  c.out(rango(x, i) + tipo + rango(y, j) + '\n');
  a.slice(x, i).forEach(l => prefijo('< ', l));
  if (tipo === 'c') c.out('---\n');
  b.slice(y, j).forEach(l => prefijo('> ', l));
}
R('diff', traducir("shell.compara_dos_archivos_linea_por"), ['diff antes.txt despues.txt', 'cat antes.txt | diff - despues.txt'], c => {
  const { args } = opciones(c);
  if (args.length !== 2) return c.invalido('diff');
  const datos = [];
  for (const arg of args) {
    try { datos.push(lineas(arg === '-' ? c.entrada : c.fs.leer(c.ruta(arg)))); }
    catch (e) { c.error('diff: ' + arg + ': ' + e.message, 2); }
  }
  if (c.codigo) return;
  const [a, b] = datos;
  if (a.length > 5000 || b.length > 5000) return c.error(traducir("shell.diff_se_admiten_hasta_5000"), 2);
  const bloques = cambios(a, b);
  for (const bloque of bloques) mostrar(c, a, b, bloque);
  if (bloques.length) c.codigo = 1;
});
})(globalThis.CR = globalThis.CR || {});

