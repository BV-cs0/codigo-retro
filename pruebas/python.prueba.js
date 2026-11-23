'use strict';
const assert = require('node:assert/strict');
const { traducir, aTexto, contarLineas } = require('../js/comun/python');
const opciones = { acciones: ['avanzar', 'girar_derecha', 'abrir', 'lanzar_fuego', 'escudo'],
  sensores: ['leer_runa', 'hay_enemigo', 'hay_muro'], aridades: { abrir: 1, avanzar: 0 } };

module.exports = prueba => {
  prueba('Python · construcciones aceptadas e ida y vuelta del AST', () => {
    const codigo = [
      '# comentario', 'avanzar()', 'girar_derecha()', 'llave = leer_runa()', 'abrir(llave)',
      '', 'for i in range(3):', '\tavanzar()', 'if hay_enemigo():', '\tlanzar_fuego()',
      '', 'else: # alternativa', '\tavanzar()', 'if not hay_muro():', '\tavanzar()',
      'cesta = 0', 'cesta = cesta + 1', 'cesta += 1',
      'def escudo_y_avanzar():', '\tescudo()', '\tavanzar()', 'escudo_y_avanzar()',
      'cesta = (4 - 2) + 1', 'cesta = 1 != 2', 'cesta = 1 == 1', 'cesta = 1 < 2', 'cesta = 2 > 1'
    ].join('\n');
    const ast = traducir(codigo, opciones);
    assert.deepEqual(ast.map(i => i.tipo), ['accion', 'accion', 'asignar', 'accion', 'repetir',
      'si', 'si', 'asignar', 'asignar', 'asignar', 'definir', 'llamar',
      'asignar', 'asignar', 'asignar', 'asignar', 'asignar']);
    assert.equal(ast[5].sino[0].linea, 13);
    assert.equal(ast[6].condicion.tipo, 'no');
    assert.deepEqual(ast[8].valor, ast[9].valor);
    assert.match(aTexto(ast), /^ {4}avanzar\(\)/m);
    assert.deepEqual(traducir(aTexto(ast), opciones), ast);
    assert.equal(contarLineas('avanzar() # comentario\n\n# comentario\n  '), 1);
  });
  prueba('Python · errores, permisos del nivel y sugerencia', () => {
    for (const [codigo, linea, mensaje] of [
      ['\n\nfor i in range(3)\n    avanzar()', 3, /falta ':'/],
      ['if hay_muro():\n    avanzar()\n  avanzar()', 3, /sangría/],
      ['avanzar()\navansar()', 2, /¿Querías decir 'avanzar'\?/],
      ['llave = sensor_fuera()', 1, /sensor/],
      ['abrir()', 1, /1 argumento/],
      ['if 2 < 3:\n    avanzar()\n\tavanzar()', 3, /sangría/],
      ['avanzar(1)', 1, /0 argumentos/]
    ]) {
      assert.throws(() => traducir(codigo, opciones), e => e.linea === linea &&
        e.message.startsWith('Línea ' + linea + ': ') && mensaje.test(e.message));
    }
  });
};
