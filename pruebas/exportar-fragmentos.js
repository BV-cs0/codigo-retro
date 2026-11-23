'use strict';
const Py = require('../js/curso/py/interprete');
const { terminar } = require('../js/curso/validar');
const temas = require('./datos-curso');
const bateria = [...require('./fragmentos-curso'), ...require('./fragmentos-curso-2')];
const fragmentos = bateria.map(({ id, codigo, salida, error, entradas = [], aleatorios = [] }) =>
  ({ id, codigo, salida, error, entradas, aleatorios }));
function añadir(id, codigo, { entradas = [], aleatorios } = {}) {
  if (/(?:\bfrom\s+random\b|\bimport\s+random\b)/.test(codigo) && !aleatorios?.length) return;
  const r = terminar(Py.ejecutar(codigo, { entradas, aleatorios }));
  fragmentos.push({ id, codigo, salida: r.salida, error: r.error?.tipo ?? null, entradas, aleatorios: aleatorios || [] });
}
function exportarPaso(id, paso, anterior) {
  if (paso.tipo === 'mundo') return;
  if (paso.tipo === 'resumen') {
    for (const [k, caso] of (anterior?.casos || []).entries()) {
      if (paso.final) añadir(id + '-caso-' + (k + 1), paso.final, caso);
    }
    return;
  }
  // Tema 4, paso 6: el RuntimeError procede del límite del curso.
  if (paso.solucion === undefined) return añadir(id, paso.codigo, paso);
  if (paso.tipo === 'arregla') añadir(id + '-inicial', paso.codigo, paso);
  if (!paso.casos) añadir(id + '-solucion', paso.solucion, paso);
  for (const [k, caso] of (paso.casos || []).entries()) añadir(id + '-caso-' + (k + 1), paso.solucion, caso);
  for (const [k, prueba] of (paso.pruebas || []).entries()) {
    añadir(id + '-prueba-' + (k + 1), paso.solucion + '\n' + prueba.codigo, prueba);
  }
}
for (const [i, tema] of temas.entries()) {
  for (const [j, paso] of tema.pasos.entries()) {
    exportarPaso('tema-' + (i + 1) + '-paso-' + (j + 1), paso, tema.pasos[j - 1]);
  }
}
function exportarEjercicio(ejercicio, nombre, codigo) {
  const id = 'taller-' + ejercicio.id + '-' + nombre;
  const { casosSalida } = require('../js/ejercicios/validar');
  const casos = casosSalida(ejercicio, codigo);
  if (!casos.length) añadir(id, codigo);
  casos.forEach((caso, i) => añadir(id + '-caso-' + (i + 1), caso.codigo, caso));
  (ejercicio.pruebas || []).forEach((p, i) => añadir(id + '-prueba-' + (i + 1), codigo + '\n' + p.codigo));
}
for (const ejercicio of require('./datos-ejercicios')) {
  exportarEjercicio(ejercicio, 'solucion', ejercicio.solucion);
  if (ejercicio.alternativa) exportarEjercicio(ejercicio, 'alternativa', ejercicio.alternativa);
}
process.stdout.write('[\n' + fragmentos.map(f => '  ' + JSON.stringify(f)).join(',\n') + '\n]\n');
