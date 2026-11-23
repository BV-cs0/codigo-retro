'use strict';
const { readdirSync } = require('node:fs');
const { join } = require('node:path');
let correctas = 0;
let fallidas = 0;
function prueba(nombre, ejecutar) {
  try {
    ejecutar();
    correctas++;
    console.log('✓ ' + nombre);
  } catch (error) {
    fallidas++;
    console.error('✗ ' + nombre + '\n' + error.stack);
  }
}
for (const archivo of readdirSync(__dirname).filter(n => n.endsWith('.prueba.js'))) {
  prueba('Cargar ' + archivo, () => require(join(__dirname, archivo))(prueba));
}
console.log('\n' + correctas + ' comprobaciones correctas · ' + fallidas + ' fallidas');
process.exitCode = fallidas ? 1 : 0;
