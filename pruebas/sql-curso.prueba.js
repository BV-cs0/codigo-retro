'use strict';
const assert = require('node:assert/strict');
require('../js/comun/idioma');
require('../js/sql/motor');
require('../js/sql/validar');
require('../js/sql/granja');
require('../js/sql/en/granja');
require('../js/sql/lecciones');
require('../js/sql/temas');
require('../js/sql/en/temas');
require('../js/sql/temas-seguridad');
require('../js/sql/en/temas-seguridad');
const { SQL, ValidarSQL: V, Contenido } = CR;

function comprobarPrediccion(paso, r) {
  assert.ok(paso.opciones[paso.correcta]);
  assert.equal(new Set(paso.opciones).size, paso.opciones.length);
  const esperado = paso.prediccion;
  const ultimo = r.resultados.at(-1);
  if (esperado.filas) assert.equal(V.comprobarResultado(ultimo, esperado), null);
  if (esperado.total) assert.equal(ultimo.filas.length, esperado.total);
  if (esperado.primera) assert.deepEqual(ultimo.filas[0], esperado.primera);
  if (esperado.cambios) assert.equal(ultimo.cambios, esperado.cambios);
}
function ficha(paso, granja) {
  const r = SQL.crear(paso.bd || granja).ejecutar(paso.codigo, paso.parametros);
  assert.equal(r.error?.mensaje || null, paso.error || null);
  if (paso.tipo === 'predice') comprobarPrediccion(paso, r);
  if (paso.solucion) assert.equal(V.comprobar(paso, paso.solucion, granja), null);
}
function formulario(prueba) {
  const granja = Contenido.es.sqlGranja;
  const paso = {
    tipo: 'formulario', campos: [{ nombre: 'especie', etiqueta: 'Especie' }],
    plantilla: "SELECT nombre FROM animales WHERE especie = '{especie}'",
    mensajes: { conFilas: 'Encontré a {nombre}', sinFilas: 'No hay animales', error: 'La consulta falló' },
    casos: [{ valores: { especie: 'cabra' }, conFilas: true }]
  };
  for (const modo of ['texto', 'parametros']) {
    prueba('SQL formulario neutro · ' + modo, () => {
      const modelo = { ...paso, modo };
      const valores = { especie: 'cabra' };
      const r = V.formulario(modelo, valores, granja);
      assert.equal(r.resultado.error, null);
      assert.equal(r.sql, modo === 'texto' ? "SELECT nombre FROM animales WHERE especie = 'cabra'" :
        'SELECT nombre FROM animales WHERE especie = ?');
      assert.deepEqual(r.parametros, modo === 'texto' ? [] : ['cabra']);
      assert.equal(r.mensaje, 'Encontré a Luna');
      assert.equal(V.formularioCorrecto(modelo, r), true);
      const vacio = V.formulario(modelo, { especie: 'pingüino' }, granja);
      assert.equal(vacio.mensaje, 'No hay animales');
      assert.equal(V.formularioCorrecto(modelo, vacio), false);
    });
  }
}
// Un paso de formulario: la solución debe aprobar, y un intento vacío o el uso normal no.
function fichaFormulario(paso, granja) {
  assert.ok(paso.objetivo && paso.pistas.length && paso.casos.length);
  const nombres = paso.campos.map(c => c.nombre);
  assert.deepEqual(Object.keys(paso.solucion).sort(), [...nombres].sort());
  const bien = V.formulario(paso, paso.solucion, granja);
  assert.equal(V.formularioCorrecto(paso, bien), true, bien.sql);
  const vacio = V.formulario(paso, {}, granja);
  assert.equal(V.formularioCorrecto(paso, vacio), false, vacio.sql);
  for (const mensaje of Object.values(paso.mensajes)) assert.ok(mensaje);
}
// Valores de ejemplo para ejecutar las chuletas que llevan ? sin zona de parámetros.
const ejemploSeguridad = { es: ['bina', 'girasol'], en: ['bina', 'sunflower'] };
function fichaSeguridad(paso, granja, idioma) {
  if (paso.tipo === 'formulario') return fichaFormulario(paso, granja);
  if (paso.tipo !== 'resumen') return ficha(paso, granja);
  const r = SQL.crear(paso.bd).ejecutar(paso.codigo, ejemploSeguridad[idioma]);
  assert.equal(r.error, null);
}
function seguridad(prueba) {
  prueba('SQL tema 8 · ataques que funcionan y defensas que los paran', () => {
    const es = Contenido.es.sqlSeguridad.pasos, granja = Contenido.es.sqlGranja;
    const [entrar, comilla, comentario] = es;
    const probar = (paso, valores) => V.formularioCorrecto(paso, V.formulario(paso, valores, granja));
    assert.equal(probar(entrar, { usuario: 'bina', clave: 'mal' }), false);
    assert.equal(probar(comilla, { usuario: 'bina', clave: 'girasol' }), false);
    assert.equal(probar(comentario, { usuario: 'admin', clave: 'tractor-rojo-1987' }), false);
    assert.equal(probar(comentario, { usuario: "admin'--", clave: '' }), true);
    const arreglada = es.find(p => p.modo === 'parametros');
    assert.equal(probar(arreglada, { usuario: 'pepe', clave: 'x' }), false);
    assert.equal(probar(arreglada, { usuario: "' OR '1'='1", clave: "' OR '1'='1" }), true);
    const r = V.formulario(arreglada, { usuario: "admin' --", clave: 'x' }, granja);
    assert.equal(r.sql, 'SELECT nombre FROM usuarios WHERE nombre = ? AND clave = ?');
    assert.deepEqual(r.parametros, ["admin' --", 'x']);
    const reto = es.find(p => p.tipo === 'reto');
    assert.notEqual(V.comprobar(reto, "SELECT nombre FROM animales WHERE especie = 'cabra';", granja), null);
  });
}
module.exports = prueba => {
  prueba('SQL temas bilingües · misma estructura', () => {
    const resumir = pasos => pasos.map(({ id, tipo, requiere, modo }) => ({ id, tipo, requiere, modo }));
    const forma = idioma => [...Contenido[idioma].sqlTemas, Contenido[idioma].sqlSeguridad]
      .map(t => ({ id: t.id, pasos: resumir(t.pasos) }));
    assert.deepEqual(forma('es'), forma('en'));
    assert.deepEqual(forma('es').map(t => t.pasos.length), [7, 9, 7, 7, 9, 9, 8, 10]);
    assert.deepEqual(forma('es').at(-1).pasos.map(p => p.id).slice(0, 2), ['sql-8:1', 'sql-8:2']);
  });
  for (const idioma of ['es', 'en']) {
    const { sqlSeguridad, sqlGranja } = Contenido[idioma];
    for (const paso of sqlSeguridad.pasos)
      prueba('SQL curso ' + idioma + ' · ' + paso.id, () => fichaSeguridad(paso, sqlGranja, idioma));
  }
  seguridad(prueba);
  for (const idioma of ['es', 'en']) {
    const { sqlTemas, sqlGranja } = Contenido[idioma];
    for (const tema of sqlTemas) for (const paso of tema.pasos)
      prueba('SQL curso ' + idioma + ' · ' + paso.id, () => ficha(paso, sqlGranja));
  }
  formulario(prueba);
  prueba('SQL parámetros de editor y de casos', () => {
    const granja = Contenido.es.sqlGranja;
    const caso = { requiere: 'parametros', casos: [
      { parametros: ['cabras'], resultado: { filas: [] } },
      { parametros: ['cerdo'], resultado: { filas: [['Trufa']] } }
    ] };
    assert.equal(V.comprobar(caso, 'SELECT nombre FROM animales WHERE especie=?', granja), null);
    assert.deepEqual(V.leerParametros('"a,b", 7, 7.0, NULL'), ['a,b', 7, { valor: 7, tipo: 'real' }, null]);
  });
};
