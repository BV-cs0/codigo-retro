'use strict';
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { CursoBash, CursoBashEn, ValidarBash, Bash } = require('./contenido-bash');

const predicciones = [
  ['Start and End', 'Start\nEnd\n'],
  ['Creates "my" and "report.txt"', '', 0, ['my', 'report.txt']],
  ['Second: <>', 'Second: <>\n'],
  ['true', 'true\n'],
  ['It stops when it reaches the limit', '', 2],
  ['Ana', 'Ana\n'],
  ['5, 5 and 0', '5\n5\n0\n'],
  ['3', '3\n']
];

function estructura(temas) {
  return temas.map(({ proyecto, pasos }, i) => ({ proyecto, pasos: pasos.map((paso, j) => ({
    id: paso.id ?? i + ':' + j,
    claves: Object.keys(paso).filter(c => c !== 'idioma').sort(),
    tipo: paso.tipo, requiere: paso.requiere, correcta: paso.correcta,
    heredaCodigo: paso.codigo === 'anterior',
    codigos: paso.casos?.map(c => c.codigo ?? 0)
  })) }));
}

function probarPaso(paso, prediccion) {
  if (paso.solucion) {
    const r = ValidarBash.comprobar(paso, paso.solucion);
    assert.ok(r.ok, JSON.stringify(r.checks.filter(c => !c.ok)));
    assert.equal(ValidarBash.comprobar(paso, paso.anterior ?? paso.codigo).ok, false);
    return;
  }
  const r = Bash.correr(paso.codigo, paso);
  assert.equal(r.fs.home, '/home/apprentice');
  assert.equal(r.variables.USER, 'apprentice');
  assert.equal(r.variables.HOSTNAME, 'beacon7');
  if (prediccion) {
    const [opcion, salida, codigo = 0, archivos = []] = prediccion;
    assert.deepEqual([paso.opciones[paso.correcta], r.salida, r.codigo], [opcion, salida, codigo]);
    for (const ruta of archivos) assert.ok(r.fs.nodos.has(r.fs.home + '/' + ruta));
  } else assert.equal(r.stderr, '');
}

module.exports = prueba => {
  prueba('Curso Bash · 8 temas y 66 pasos con los mismos tipos, ids y requisitos', () => {
    assert.deepEqual(CursoBashEn.map(t => t.pasos.length), [7, 9, 8, 10, 9, 8, 7, 8]);
    assert.deepEqual(estructura(CursoBashEn), estructura(CursoBash));
  });
  prueba('Curso Bash · textos y código en inglés', () => {
    const textos = JSON.stringify(CursoBashEn, (k, v) => ['requiere', 'enlace'].includes(k) ? undefined : v);
    assert.doesNotMatch(textos, /[ñáéíóúü¿¡]|\b(?:que|el|los|las|hola|imprime|escribe|fallos|faro7|aprendiz|saludo)\b/iu);
  });
  let indice = 0;
  for (const paso of CursoBashEn.flatMap(t => t.pasos)) {
    const prediccion = paso.tipo === 'predice' ? predicciones[indice++] : undefined;
    prueba('Curso Bash en · ' + paso.titulo, () => probarPaso(paso, prediccion));
  }
  prueba('Exportar Bash · casos comparables del curso en inglés', () => {
    const comando = [require.resolve('./exportar-bash'), '--idioma', 'en'];
    const casos = JSON.parse(execFileSync(process.execPath, comando)).filter(c => c.id.startsWith('curso-'));
    assert.equal(casos.length, 80);
    assert.equal(new Set(casos.map(c => c.id)).size, casos.length);
    assert.ok(casos.every(c => c.home === 'home/apprentice'));
    const error = casos.find(c => c.id === 'curso-8-7-4');
    assert.deepEqual([error.archivo, error.args, error.salida, error.codigo], ['report.sh', ['empty'], 'No logs found\n', 2]);
  });
};
