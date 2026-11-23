'use strict';
const assert = require('node:assert/strict');
const { crearEjecucion, contarInstrucciones, usaConcepto } = require('../js/comun/motor');
const { traducir } = require('../js/comun/python');
const opciones = { acciones: ['avanzar'], sensores: ['distancia'] };

function mundo() {
  const historial = [];
  return {
    ...opciones, historial,
    accion(nombre, args) { historial.push([nombre, ...args]); return { ok: true }; },
    sensor: (nombre, args) => 4 + (args[0] || 0),
    ganado: () => false
  };
}

function acabar(ejecucion) {
  for (let i = 0; i < 1100; i++) {
    const paso = ejecucion.paso();
    if (paso.hecho) return paso;
  }
  assert.fail('La ejecución no se detuvo.');
}

module.exports = prueba => {
  prueba('Motor · instrucciones, expresiones, línea y una acción por paso', () => {
    const ast = traducir([
      'n = distancia(1) - 2', 'n += 1', 'def mover():', '    if not (n < 4):',
      '        avanzar(n + 1)', '    else:', '        avanzar(0)', 'for i in range(2):', '    mover()',
      'if n != 4:', '    avanzar(10)', 'else:', '    avanzar(n > 0)', 'if n == 4:', '    avanzar(4)'
    ].join('\n'), opciones);
    const terreno = mundo();
    const ejecucion = crearEjecucion(ast, terreno);
    assert.equal(contarInstrucciones(ast), 13);
    for (const tipo of ['repetir', 'si', 'asignar', 'definir']) assert.ok(usaConcepto(ast, tipo));
    assert.equal(usaConcepto(ast, 'inexistente'), false);
    assert.equal(ejecucion.paso().instr.linea, 5);
    assert.deepEqual(terreno.historial, [['avanzar', 5]]);
    assert.deepEqual(ejecucion.variables, { n: 4 });
    assert.equal(acabar(ejecucion).error, null);
    assert.deepEqual(terreno.historial, [['avanzar', 5], ['avanzar', 5], ['avanzar', true], ['avanzar', 4]]);
  });
  prueba('Motor · límites de acciones, pasos internos y range()', () => {
    for (const [texto, mensaje] of [
      ['def ciclo():\n    ciclo()\nciclo()', /no termina nunca/],
      ['for i in range(50):\n    for j in range(50):\n        avanzar()', /no termina nunca/],
      ['for i in range(-1):\n    avanzar()', /entre 0 y 50/],
      ['for i in range(51):\n    avanzar()', /entre 0 y 50/]
    ]) {
      const terreno = mundo();
      assert.match(acabar(crearEjecucion(traducir(texto, opciones), terreno)).error, mensaje);
      if (texto.includes('range(50)')) assert.equal(terreno.historial.length, 1000);
    }
    assert.equal(acabar(crearEjecucion(traducir('for i in range(0):\n    avanzar()', opciones), mundo())).error, null);
  });
  prueba('Motor · variables, funciones, órdenes y fallos del mundo', () => {
    const casos = [
      [{ tipo: 'llamar', nombre: 'mover' }, /función 'mover'/],
      [{ tipo: 'accion', nombre: 'z', args: [] }, /orden 'z'/],
      [traducir('avanzar(pasos)', opciones)[0], /variable 'pasos'/]
    ];
    for (const [instr, mensaje] of casos) {
      const paso = crearEjecucion([{ ...instr, linea: 7 }], mundo()).paso();
      assert.match(paso.error, mensaje);
      assert.equal(paso.instr.linea, 7);
    }
    const terreno = { ...mundo(), accion: () => ({ ok: false, mensaje: 'Te has chocado.' }) };
    assert.equal(crearEjecucion(traducir('avanzar()', opciones), terreno).paso().error, 'Te has chocado.');
  });
  prueba('Motor · ámbito local de las funciones', () => {
    const terreno = mundo();
    const codigo = 'n = 7\ndef mover():\n    n = 2\n    avanzar(n)\nmover()\navanzar(n)';
    const ejecucion = crearEjecucion(traducir(codigo, opciones), terreno);
    assert.equal(ejecucion.paso().error, null);
    assert.deepEqual(ejecucion.variables, { n: 2 });
    assert.equal(acabar(ejecucion).error, null);
    assert.deepEqual(terreno.historial, [['avanzar', 2], ['avanzar', 7]]);
    assert.deepEqual(ejecucion.variables, { n: 7 });
    const sinValor = 'n = 7\ndef mover():\n    n += 1\nmover()';
    assert.match(acabar(crearEjecucion(traducir(sinValor, opciones), mundo())).error, /variable 'n'/);
  });
};
