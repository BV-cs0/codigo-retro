'use strict';
const bd = "CREATE TABLE t (id INTEGER PRIMARY KEY, nombre TEXT NOT NULL, grupo TEXT, n INTEGER UNIQUE, peso REAL DEFAULT 2.0);" +
  "INSERT INTO t VALUES (1,'Ana','a',7,7), (2,'Bina','b',2,2.5), (3,'Ágata','a',NULL,4), (4,'Ana',NULL,8,3);" +
  "CREATE TABLE u (id INTEGER PRIMARY KEY, t_id INTEGER, nota TEXT);" +
  "INSERT INTO u VALUES (1,1,'uno'), (2,1,'dos'), (3,2,'tres'), (4,99,'cuatro');";
const consultas = [
  'SELECT * FROM t', 'SELECT t.* FROM t', 'SELECT a.nombre AS animal FROM t AS a',
  'SELECT nombre grupo FROM t', 'SELECT nombre FROM t WHERE nombre = "Ana"',
  'SELECT nombre FROM t WHERE nombre = \'ana\'', 'SELECT nombre FROM t WHERE nombre LIKE \'a%\'',
  "SELECT nombre FROM t WHERE nombre LIKE '_na'", "SELECT nombre FROM t WHERE nombre NOT LIKE '_na'",
  'SELECT nombre FROM t WHERE n BETWEEN 2 AND 7', 'SELECT nombre FROM t WHERE n NOT BETWEEN 2 AND 7',
  'SELECT nombre FROM t WHERE grupo IS NULL', 'SELECT nombre FROM t WHERE grupo IS NOT NULL',
  'SELECT nombre FROM t WHERE grupo != NULL', 'SELECT n FROM t WHERE n IN (7,8,NULL)',
  'SELECT n FROM t WHERE n NOT IN (2,NULL)', 'SELECT n FROM t WHERE NOT n = 2',
  'SELECT n FROM t WHERE n = 7 OR n = 8 AND grupo IS NULL',
  'SELECT n FROM t WHERE (n = 7 OR n = 8) AND grupo IS NULL',
  'SELECT DISTINCT nombre FROM t ORDER BY nombre', 'SELECT n AS valor FROM t ORDER BY valor ASC',
  'SELECT nombre, peso FROM t ORDER BY 2 DESC LIMIT 2', 'SELECT id FROM t ORDER BY id LIMIT 2 OFFSET 1',
  'SELECT id FROM t ORDER BY id LIMIT -1 OFFSET 2',
  'SELECT grupo, COUNT(*) AS c FROM t GROUP BY grupo HAVING COUNT(*) > 1 ORDER BY c DESC',
  'SELECT grupo,n,COUNT(*) FROM t GROUP BY grupo,n', 'SELECT nombre, MAX(peso) FROM t',
  'SELECT nombre, MIN(peso) FROM t', 'SELECT COUNT(*),COUNT(grupo),COUNT(DISTINCT nombre),SUM(n),AVG(n),MIN(n),MAX(n) FROM t',
  'SELECT COUNT(*),SUM(n),AVG(n),MIN(n),MAX(n) FROM t WHERE 0',
  'SELECT t.nombre,u.nota FROM t JOIN u ON t.id = u.t_id',
  'SELECT t.nombre,u.nota FROM t INNER JOIN u ON t.id = u.t_id',
  'SELECT t.nombre,u.nota FROM t LEFT OUTER JOIN u ON t.id = u.t_id',
  'SELECT t.nombre,u.nota FROM u LEFT JOIN t ON t.id = u.t_id',
  'SELECT t.nombre, a.nota, b.nota FROM t JOIN u a ON a.t_id=t.id JOIN u b ON b.id=a.id',
  'SELECT COUNT(*) FROM t JOIN u', 'SELECT id FROM t UNION SELECT t_id FROM u ORDER BY 1',
  'SELECT id FROM t UNION ALL SELECT t_id FROM u UNION ALL SELECT 0 ORDER BY 1 DESC LIMIT 4',
  'SELECT nombre FROM t WHERE id IN (SELECT t_id FROM u)',
  'SELECT nombre FROM t WHERE EXISTS (SELECT 1 FROM u WHERE t_id=t.id)',
  'SELECT nombre FROM t WHERE NOT EXISTS (SELECT 1 FROM u WHERE t_id=t.id)',
  'SELECT nombre FROM t WHERE peso > (SELECT AVG(peso) FROM t)',
  "SELECT CASE WHEN n > 6 THEN 'alto' WHEN n IS NULL THEN 'sin dato' ELSE 'bajo' END FROM t",
  "SELECT CASE grupo WHEN 'a' THEN 'sí' ELSE 'no' END FROM t",
  "SELECT UPPER('áña'),LOWER('ÁÑA'),LENGTH('🌱'),ROUND(2.5),ROUND(-2.5),ROUND(12.345,2)",
  "SELECT SUBSTR('granja',-3,2),TRIM('  hola  '),REPLACE('aba','a','x')",
  "SELECT ABS(-2),ABS('-3'),COALESCE(NULL,7.0),IFNULL(NULL,'x'),NULL || 'x',2 || 'x'",
  "SELECT 7/2,7/2.0,-7/2,7%2,7%2.0,1/0,1+2*3,3-4,'3' * 2",
  'SELECT NULL=NULL,NULL IS NULL,NULL OR 1,NULL AND 0,NOT NULL,1==1,2>=1,1<=2,1<>2',
  '-- comentario\n SELECT /* comentario */ \'It\'\'s fine\' AS texto',
  "INSERT INTO t(nombre,n) VALUES ('Sol','11'),('Luna',12); SELECT id,n,peso FROM t WHERE id>4 ORDER BY id",
  "UPDATE t SET n=peso, peso=n WHERE id=2; SELECT n,peso FROM t WHERE id=2",
  'UPDATE t SET grupo=NULL; SELECT COUNT(grupo) FROM t',
  'DELETE FROM t WHERE id>2; SELECT id FROM t ORDER BY id', 'DELETE FROM t; SELECT COUNT(*) FROM t',
  'CREATE TABLE IF NOT EXISTS t (x INTEGER); DROP TABLE IF EXISTS z; DROP TABLE t',
  "CREATE TABLE z (id INTEGER PRIMARY KEY, a TEXT DEFAULT 'hola', b INTEGER); INSERT INTO z(b) VALUES (7.0); SELECT * FROM z",
  "CREATE TABLE z (a TEXT UNIQUE, b INTEGER NOT NULL); INSERT INTO z VALUES ('x',1),('x',2); SELECT * FROM z",
  'SELECT * FROM x', 'SELECT x FROM t', 'SELECT FROM t', 'SELECT',
  'CREATE TABLE t (x INTEGER)', 'INSERT INTO t(id,nombre,n) VALUES (5,\'Sol\',7)',
  'INSERT INTO t(id) VALUES (5)', 'SELECT id FROM t JOIN u ON t.id=u.t_id',
  'SELECT COUNT(*) FROM t WHERE COUNT(*) > 2', 'INSERT INTO t(nombre,n) VALUES (\'a\')',
  'INSERT INTO t VALUES (1,2)', 'SELECT UPPER()', 'SELECT X(1)',
  'SELECT 1 UNION SELECT 1,2', 'SELECT 1; SELECT FROM t; SELECT 2'
];
const casos = consultas.map((sql, i) => ({ id: 'motor-' + (i + 1), bd, sql, parametros: [] }));
for (const a of ['NULL', '0', '2', '2.0', "'2'", "'A'", "'a'"]) {
  for (const b of ['NULL', '2', '2.0', "'2'", "'A'", "'a'"]) {
    casos.push({ id: 'logica-' + casos.length, bd: '', sql: 'SELECT ' +
      ['=', 'IS', '!=', '<', 'AND', 'OR'].map(op => a + ' ' + op + ' ' + b).join(', '), parametros: [] });
  }
}
for (const a of ['NULL', '0', '2', '2.0', "'2'", "'A'"]) {
  for (const b of ['NULL', '2', '2.0', "'2'", "'A'"]) {
    casos.push({ id: 'cuentas-' + casos.length, bd: '', sql: 'SELECT ' +
      ['+', '-', '*', '/', '%', '||'].map(op => a + ' ' + op + ' ' + b).join(', '), parametros: [] });
  }
}
for (const [sql, parametros] of [
  ['SELECT nombre FROM t WHERE nombre=?', ['Ana']],
  ['SELECT nombre FROM t WHERE nombre=?', ["O'Connor"]],
  ['SELECT ? AS a, ? AS b, ? AS c', [1, 1.5, null]],
  ['SELECT ?, ?', [1]], ['SELECT 1', [1]]
]) casos.push({ id: 'parametros-' + casos.length, bd, sql, parametros });
for (const [sql, error] of [
  ['SELECT NOMBRE, t.ID FROM t'],
  ['SELECT 1 AS x UNION SELECT 1.0 AS y'],
  ['SELECT 4 AS x UNION ALL SELECT 2 AS y ORDER BY y'],
  ['SELECT n+1 FROM t UNION ALL SELECT t_id+1 FROM u ORDER BY n+1'],
  ["SELECT SUM(nombre), (SELECT n FROM t WHERE id=1) = '7' FROM t"],
  ['SELECT id, MIN(n), MAX(peso) FROM t'],
  ['SELECT (SELECT id, nombre FROM t)', 'sub-select returns 2 columns - expected 1'],
  ['UPDATE t SET n=CASE WHEN n=7 THEN 2 WHEN n=2 THEN 7 END', 'UNIQUE constraint failed: t.n']
]) casos.push({ id: 'compatibilidad-' + casos.length, bd, sql, parametros: [], error });
module.exports = { bd, casos };
