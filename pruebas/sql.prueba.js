'use strict';
const assert = require('node:assert/strict');
const SQL = require('../js/sql/motor');
const { bd, casos } = require('./datos-sql');
const fallos = [
  'no such table: x', 'no such column: x', 'near "FROM": syntax error', 'incomplete input',
  'table t already exists', 'UNIQUE constraint failed: t.n', 'NOT NULL constraint failed: t.nombre',
  'ambiguous column name: id', 'misuse of aggregate: COUNT()', '1 values for 2 columns',
  'table t has 5 columns but 2 values were supplied', 'wrong number of arguments to function UPPER()',
  'no such function: X', 'SELECTs to the left and right of UNION do not have the same number of result columns'
];
module.exports = prueba => {
  const select = (sql, parametros) => SQL.crear(bd).ejecutar(sql, parametros);
  for (const caso of casos) {
    prueba('SQL ' + caso.id, () => {
      const r = SQL.crear(caso.bd).ejecutar(caso.sql, caso.parametros);
      const i = Number(caso.id.slice(6));
      if (caso.id.startsWith('motor-') && i >= 59 && i <= 72) assert.equal(r.error?.mensaje, fallos[i - 59]);
      else if (caso.error) assert.equal(r.error?.mensaje, caso.error);
      else if (caso.sql.startsWith('CREATE TABLE z (a TEXT UNIQUE')) assert.equal(r.error?.mensaje, 'UNIQUE constraint failed: z.a');
      else if (caso.sql.includes('; SELECT FROM')) assert.equal(r.error?.mensaje, fallos[2]);
      else if (caso.sql === 'SELECT ?, ?' || (caso.sql === 'SELECT 1' && caso.parametros.length)) assert.match(r.error.mensaje, /Incorrect number of bindings/);
      else assert.equal(r.error, null);
    });
  }
  prueba('SQL conserva los tipos y la lógica con NULL', () => {
    const r = select('SELECT 7/2, 7/2.0, AVG(n), NULL = NULL, 1 = 1, ROUND(2.5) FROM t');
    assert.deepEqual(r.resultados[0].filas, [[3, 3.5, 17 / 3, null, 1, 3]]);
    assert.deepEqual(r.resultados[0].tipos, [['integer','real','real','null','integer','real']]);
  });
  prueba('SQL vincula texto con comillas como valor', () => {
    assert.deepEqual(select('SELECT nombre FROM t WHERE nombre=?', ["O'Connor"]).resultados[0].filas, []);
    assert.deepEqual(select('SELECT nombre FROM t WHERE nombre=?', ["' OR '1'='1"]).resultados[0].filas, []);
  });
  prueba('SQL avisa de tipos y órdenes fuera del alcance del simulador', () => {
    for (const sql of ['ALTER TABLE t RENAME TO z', 'CREATE VIEW v AS SELECT * FROM t', 'SELECT DATE()']) {
      assert.equal(select(sql).error.clave, 'noSoportado');
    }
    assert.equal(select('SELECT 9007199254740993').error.clave, 'precision');
  });
  prueba('SQL conserva la identidad de filas sin clave primaria al actualizar', () => {
    const base = SQL.crear("CREATE TABLE t (x TEXT); INSERT INTO t VALUES ('a'),('b')");
    const anterior = base.tablas(true).t;
    assert.equal(base.ejecutar("UPDATE t SET x='c' WHERE x='a'").error, null);
    assert.deepEqual(base.tablas(true).t.ids, anterior.ids);
    assert.deepEqual(base.tablas().t.filas, [['c'], ['b']]);
  });
  prueba('SQL conserva sentencias previas y una copia independiente', () => {
    const base = SQL.crear(bd), copia = base.copia();
    const r = copia.ejecutar("DELETE FROM t WHERE id=4; INSERT INTO t(nombre) VALUES ('Sol'),(NULL); DELETE FROM t");
    assert.equal(r.error.mensaje, fallos[6]);
    assert.deepEqual(copia.tablas().t.filas.map(f => f[0]), [1,2,3]);
    assert.equal(base.tablas().t.filas.length, 4);
  });
  prueba('SQL limita las sentencias y la profundidad', () => {
    assert.equal(select('SELECT 1;'.repeat(201)).error.clave, 'limite');
    assert.equal(select('SELECT ('.repeat(51) + 'SELECT 1' + ')'.repeat(51)).error.clave, 'limite');
  });
  prueba('SQL limita filas por tabla y por recorrido', () => {
    const base = SQL.crear('CREATE TABLE t (id INTEGER PRIMARY KEY)');
    const filas = '(NULL),'.repeat(9999) + '(NULL)';
    assert.equal(base.ejecutar('INSERT INTO t VALUES ' + filas).error, null);
    assert.equal(base.ejecutar('INSERT INTO t VALUES(NULL)').error.clave, 'limite');
    assert.equal(base.ejecutar('SELECT COUNT(*) FROM t a JOIN t b').error.clave, 'limite');
  });
};
