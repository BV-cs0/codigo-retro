'use strict';
const { existsSync } = require('node:fs');
const { join } = require('node:path');
const { casos } = require('./datos-sql');
const SQL = require('../js/sql/motor');

function cargarCurso(idioma) {
  require('../js/comun/idioma');
  require('../js/sql/granja');
  require('../js/sql/en/granja');
  require('../js/sql/lecciones');
  const prefijo = idioma === 'en' ? 'en/' : '';
  require('../js/sql/' + prefijo + 'temas');
  require('../js/sql/' + prefijo + 'temas-seguridad');
  const datos = CR.Contenido[idioma];
  const pasos = [...datos.sqlTemas, datos.sqlSeguridad].flatMap(tema => tema.pasos);
  return pasos.flatMap(paso => paso.tipo === 'formulario' ? casosFormulario(paso) : casosPaso(paso, datos));
}
// Las chuletas con ? no tienen zona de parámetros: se comparan con dos valores de ejemplo.
const EJEMPLO_RESUMEN = ['bina', 'x'];
function casosPaso(paso, datos) {
  const bd = paso.bd || datos.sqlGranja;
  const base = paso.tipo === 'resumen' && /\?/.test(paso.codigo) ? EJEMPLO_RESUMEN : paso.parametros || [];
  const casos = [{ sql: paso.codigo, id: 'ejemplo', parametros: base }, { sql: paso.solucion, id: 'solucion', parametros: base }];
  if (typeof paso.solucion === 'string')
    (paso.casos || []).forEach((c, i) => c.parametros && casos.push({ sql: paso.solucion, id: 'caso' + (i + 1), parametros: c.parametros }));
  return casos.filter(c => typeof c.sql === 'string' && c.sql.trim()).map(c => ({
    id: paso.id + '-' + c.id, sql: c.sql, bd, parametros: c.parametros
  }));
}
// Un formulario se compara con la consulta que sale al escribir la solución y al dejarlo vacío.
function casosFormulario(paso) {
  require('../js/sql/validar');
  return [['solucion', paso.solucion], ['vacio', {}]].map(([id, valores]) => {
    const r = CR.ValidarSQL.formulario(paso, valores, paso.bd);
    return { id: paso.id + '-' + id, sql: r.sql, bd: paso.bd, parametros: r.parametros };
  });
}
function sentencias(sql) {
  const tokens = CR.sqlInterno.tokenizar(sql);
  let inicio = 0, nivel = 0, orden = false;
  const salida = [];
  for (const t of tokens) {
    if (t.clave === '(') nivel++;
    if (t.clave === ')') nivel--;
    if (!nivel && t.clave === 'ORDER') orden = true;
    if (t.clave === ';' || t.tipo === 'fin') {
      const texto = sql.slice(inicio, t.fin);
      if (CR.sqlInterno.tokenizar(texto).some(x => ![';', ''].includes(x.clave)))
        salida.push({ texto, orden });
      orden = false;
      inicio = t.fin;
    }
  }
  return salida;
}
function exportar(idioma) {
  const curso = existsSync(join(__dirname, '../js/sql/temas.js')) ? cargarCurso(idioma) : [];
  return [...casos, ...curso].map(c => ({
    ...c, sentencias: sentencias(c.sql), motor: SQL.crear(c.bd).ejecutar(c.sql, c.parametros)
  }));
}
if (require.main === module) {
  const [, , opcion, idioma] = process.argv;
  if (opcion && (opcion !== '--idioma' || !['es', 'en'].includes(idioma))) {
    console.error('Uso: node pruebas/exportar-sql.js [--idioma es|en]');
    process.exitCode = 1;
  } else process.stdout.write(JSON.stringify(exportar(idioma || 'es')) + '\n');
}
module.exports = { exportar, sentencias };
