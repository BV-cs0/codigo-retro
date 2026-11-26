'use strict';
const { casos, casosIngles } = require('./datos-terminal');
const casosFaro2 = require('./datos-faro2-bash');
const casosAtalaya = require('./datos-atalaya-bash');
const indice = process.argv.indexOf('--idioma');
const idioma = indice < 0 ? 'es' : process.argv[indice + 1];
if (!['es', 'en'].includes(idioma)) {
  process.stderr.write('Uso: node pruebas/exportar-terminal.js [--idioma es|en]\n');
  process.exitCode = 1;
} else {
  const base = idioma === 'en' ? casosIngles() : casos.filter(c => c.bash);
  const exportados = base.map(({ id, fs, cwd, linea, salida }) => ({ id, fs, cwd, linea, salida }));
  exportados.push(...casosFaro2(idioma), ...casosAtalaya(idioma));
  process.stdout.write('[\n' + exportados.map(caso => '  ' + JSON.stringify(caso)).join(',\n') + '\n]\n');
}
