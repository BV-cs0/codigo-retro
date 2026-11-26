'use strict';
const motor = require('./datos-bash');
const { Bash, CursoBash, CursoBashEn, EjerciciosBash, ValidarBash } = require('./contenido-bash');
const { identidad, rutaAbsoluta } = globalThis.CR.Shell.SFA;
function exportar({ id, fs = {}, cwd, idioma, archivo, script, args = [], entradas = [], salida, codigo }) {
  const { home } = identidad(idioma);
  cwd = rutaAbsoluta(cwd ?? home, home, home);
  const relativo = Object.fromEntries(Object.entries(fs).map(([ruta, valor]) =>
    [rutaAbsoluta(ruta, home, home).slice(1) + (ruta.endsWith('/') ? '/' : ''), valor]));
  return { id, fs: relativo, cwd: cwd.slice(1) || '.', script, args, entradas, salida, codigo,
    ...(idioma === 'en' ? { home: home.slice(1), ...(archivo ? { archivo } : {}) } : {}) };
}
function* contenido(idioma) {
  const ingles = idioma === 'en';
  const ejercicios = ingles ? require('../js/ejercicios/en/bash-retos') : EjerciciosBash;
  const curso = ingles ? CursoBashEn : CursoBash;
  const fichas = curso.flatMap((t, i) => t.pasos.map((p, j) => ['curso-' + (i + 1) + '-' + (j + 1), p]));
  for (const [id, ficha] of fichas.concat(ejercicios.map(e => ['taller-' + e.id, e]))) {
    const script = ficha.solucion ?? ficha.codigo;
    if (ficha.sinExportar || /\bdate\b/.test(script)) continue;
    if (ficha.solucion) {
      for (const [i, c] of ValidarBash.casos(ficha).entries()) yield { ...c, id: id + '-' + (i + 1), script };
    } else {
      const { salida, codigo } = Bash.correr(script, ficha);
      yield { ...ficha, id, script, salida, codigo };
    }
  }
}
function casosExportados(idioma) {
  const base = idioma === 'en' ? [] : motor.filter(c => !c.sinExportar);
  return [...base, ...contenido(idioma)].map(exportar);
}
if (require.main === module) {
  const indice = process.argv.indexOf('--idioma');
  const idioma = indice < 0 ? 'es' : process.argv[indice + 1];
  if (!['es', 'en'].includes(idioma)) {
    process.stderr.write('Uso: node pruebas/exportar-bash.js [--idioma es|en]\n');
    process.exitCode = 1;
  } else {
    const casos = casosExportados(idioma);
    process.stdout.write('[\n' + casos.map(c => '  ' + JSON.stringify(c)).join(',\n') + '\n]\n');
  }
}
module.exports = casosExportados('es');
