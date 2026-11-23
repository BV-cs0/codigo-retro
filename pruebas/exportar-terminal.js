'use strict';
const { casos } = require('./datos-terminal');
const exportados = casos.filter(c => c.bash).map(({ id, fs, cwd, linea, salida }) => ({ id, fs, cwd, linea, salida }));
process.stdout.write('[\n' + exportados.map(caso => '  ' + JSON.stringify(caso)).join(',\n') + '\n]\n');
