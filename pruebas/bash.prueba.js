'use strict';
const assert = require('node:assert/strict');
const motor = require('./datos-bash');
const { CursoBash, EjerciciosBash, ValidarBash, Bash } = require('./contenido-bash');
const predicciones = [
  ['Inicio y Fin', 'Inicio\nFin\n'], ['Crea mi e informe.txt', '', 0, ['mi', 'informe.txt']],
  ['Segundo: <>', 'Segundo: <>\n'], ['verdadero', 'verdadero\n'],
  ['Se detiene al alcanzar el límite', '', 2], ['Ana', 'Ana\n'], ['5, 5 y 0', '5\n5\n0\n'], ['3', '3\n']
];
module.exports = prueba => {
  prueba('Bash · 8 temas, 66 pasos, 15 ejercicios y al menos 150 casos', () => {
    assert.deepEqual(CursoBash.map(t => t.pasos.length), [7, 9, 8, 10, 9, 8, 7, 8]);
    assert.equal(EjerciciosBash.length, 15);
    assert.ok(motor.length >= 150);
  });
  for (const c of motor) prueba(c.id + ' · ' + c.script.split('\n')[0], () => {
    const r = Bash.correr(c.script, c);
    assert.deepEqual([r.salida, r.codigo, r.stderr], [c.salida, c.codigo, c.stderr]);
  });
  let p = 0;
  for (const paso of CursoBash.flatMap(t => t.pasos).concat(EjerciciosBash)) {
    if (paso.solucion) prueba('Bash · solución e inicio · ' + paso.titulo, () => {
      const r = ValidarBash.comprobar(paso, paso.solucion);
      assert.ok(r.ok, JSON.stringify(r.checks.filter(c => !c.ok)));
      const inicial = paso.tipo === 'ordena' ? paso.codigo.split('\n').reverse().join('\n') : paso.anterior ?? paso.codigo;
      assert.equal(ValidarBash.comprobar(paso, inicial).ok, false);
    });
    else if (paso.tipo === 'predice') prueba('Bash · predicción · ' + paso.titulo, () => {
      const [opcion, salida, codigo = 0, archivos = []] = predicciones[p++];
      const r = Bash.correr(paso.codigo, paso);
      assert.deepEqual([paso.opciones[paso.correcta], r.salida, r.codigo], [opcion, salida, codigo]);
      for (const ruta of archivos) assert.ok(r.fs.nodos.has('/home/aprendiz/' + ruta));
    });
    else prueba('Bash · ejemplo · ' + paso.titulo, () => {
      const r = Bash.correr(paso.codigo, paso);
      assert.equal(r.stderr, '');
    });
  }
};
