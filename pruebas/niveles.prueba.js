'use strict';
const assert = require('node:assert/strict');
const { traducir, contarLineas } = require('../js/comun/python');
const { crearEjecucion, usaConcepto } = require('../js/comun/motor');
const { opciones } = require('../js/comun/lecciones');

function jugar(programa, mundo) {
  const ejecucion = crearEjecucion(programa, mundo);
  for (let i = 0; i <= 1000; i++) {
    const paso = ejecucion.paso();
    if (paso.hecho) return { ganado: !paso.error && mundo.ganado(), error: paso.error };
  }
  assert.fail('La ejecución no se detuvo.');
}

const avanzar = 'avanzar()';
const ruta = (obstaculos, orden, pasos) => Array.from({ length: pasos }, (_, i) =>
  obstaculos.includes(i) ? orden + '\n' + avanzar : avanzar).join('\n');
const fijos = {
  robot: [ruta([1, 4], 'picar()', 6), 'for i in range(4):\n    avanzar()'],
  mago: [ruta([0, 3], 'lanzar_fuego()', 6), 'avanzar()\nabrir(3)\navanzar()\navanzar()'],
  granja: [ruta([0, 2, 5, 7], 'regar()', 8), ruta([1, 4, 6], 'cosechar()', 8) + '\nvender(3)']
};

module.exports = prueba => {
  for (const demo of Object.keys(fijos)) {
    const niveles = require('../js/' + demo + '/niveles');
    const { crear } = require('../js/' + demo + '/mundo');
    assert.equal(niveles.length, 5);
    for (const nivel of niveles) {
      for (const [i, mapa] of nivel.variantes.entries()) {
        prueba(demo + ' · ' + nivel.titulo + ' · mapa ' + (i + 1), () => {
          const programa = traducir(nivel.solucion, opciones(nivel.ordenes));
          const resultado = jugar(programa, crear(mapa));
          assert.ok(resultado.ganado, resultado.error || 'El objetivo no se cumplió.');
          assert.ok(contarLineas(nivel.solucion) <= nivel.estrellas3);
          if (nivel.maxLineas) assert.ok(contarLineas(nivel.solucion) <= nivel.maxLineas);
          if (nivel.id > 1) assert.ok(usaConcepto(programa, nivel.concepto));
          assert.doesNotThrow(() => traducir(nivel.ejemplo, opciones(nivel.ordenes)));
        });
      }
      if ([3, 4].includes(nivel.id)) {
        prueba(demo + ' · ' + nivel.titulo + ' · el programa fijo solo gana en el mapa 1', () => {
          const ast = traducir(fijos[demo][nivel.id - 3], opciones(nivel.ordenes));
          assert.equal(usaConcepto(ast, nivel.concepto), false);
          assert.equal(jugar(ast, crear(nivel.variantes[0])).ganado, true);
          assert.equal(jugar(ast, crear(nivel.variantes[1])).ganado, false);
        });
      }
    }
  }
};
