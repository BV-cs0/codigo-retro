'use strict';
const motor = require('./datos-bash');
const { Bash, CursoBash, EjerciciosBash, ValidarBash } = require('./contenido-bash');
const { HOME, rutaAbsoluta } = globalThis.CR.Shell.SFA;
function exportar({ id, fs = {}, cwd = HOME, script, args = [], entradas = [], salida, codigo }) {
  const relativo = Object.fromEntries(Object.entries(fs).map(([ruta, valor]) =>
    [rutaAbsoluta(ruta).slice(1) + (ruta.endsWith('/') ? '/' : ''), valor]));
  return { id, fs: relativo, cwd: cwd.slice(1) || '.', script, args, entradas, salida, codigo };
}
function* contenido() {
  const fichas = CursoBash.flatMap((t, i) => t.pasos.map((p, j) => ['curso-' + (i + 1) + '-' + (j + 1), p]));
  for (const [id, ficha] of fichas.concat(EjerciciosBash.map(e => ['taller-' + e.id, e]))) {
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
const casos = [...motor.filter(c => !c.sinExportar), ...contenido()].map(exportar);
if (require.main === module) process.stdout.write('[\n' + casos.map(c => '  ' + JSON.stringify(c)).join(',\n') + '\n]\n');
module.exports = casos;
