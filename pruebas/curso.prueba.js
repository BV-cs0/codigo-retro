'use strict';
const assert = require('node:assert/strict');
const Py = require('../js/curso/py/interprete');
const V = require('../js/curso/validar');
const temas = require('./datos-curso');
const fragmentos = [...require('./fragmentos-curso'), ...require('./fragmentos-curso-2')];

function probarFragmentos(prueba) {
  for (const f of fragmentos) prueba('Python del curso · ' + f.id, () => {
    const r = V.terminar(Py.ejecutar(f.codigo, { entradas: f.entradas || [], aleatorios: f.aleatorios }));
    assert.equal(r.salida, f.salida);
    assert.equal(r.error?.tipo ?? null, f.error);
    if (f.linea) assert.equal(r.error?.linea, f.linea);
  });
  prueba('Curso · pausa, reanudación y salidas sin eco', () => {
    const programa = Py.ejecutar('print(input("A: "), input("B: "))');
    const primera = programa.paso();
    assert.equal(primera.esperandoEntrada, true);
    assert.equal(primera.salida, 'A: ');
    const espera = programa.paso();
    assert.equal(espera.esperandoEntrada, true);
    assert.equal(espera.salida, '');
    const segunda = programa.paso('uno');
    assert.equal(segunda.esperandoEntrada, true);
    assert.equal(segunda.salida, 'B: ');
    assert.equal(programa.paso('').salida, 'uno \n');
  });
}
function probarTemas(prueba) {
  prueba('Curso · 114 pasos en once temas', () => {
    assert.deepEqual(temas.map(t => t.pasos.length), [8, 9, 10, 11, 9, 20, 10, 9, 9, 9, 10]);
  });
  for (const t of temas) t.pasos.forEach((p, i) => prueba(t.nombre + ' · ' + (i + 1) + ' · ' + p.titulo, () => {
    if (p.tipo === 'resumen') {
      assert.equal(i, t.pasos.length - 1);
      assert.ok(p.chuleta.length >= 5 && p.chuleta.length <= 8);
    } else if (p.casos) {
      const previo = t.pasos[i - 1];
      const inicial = p.codigo === 'anterior' ? previo.solucion ?? previo.codigo : p.codigo;
      const resultado = V.comprobar(p, p.solucion);
      assert.equal(resultado.ok, true, JSON.stringify(resultado.filas));
      assert.equal(V.comprobar(p, inicial).ok, false);
    } else if (p.solucion !== undefined) {
      const comprobar = codigo => {
        const partida = V.mundo(p.mundo);
        const programa = Py.ejecutar(codigo, { integradas: partida?.integradas });
        const estado = V.terminar(programa);
        return [V.evaluar(p, programa, estado, partida), estado.error?.tipo];
      };
      assert.equal(comprobar(p.solucion)[0], '');
      const [fallo, error] = comprobar(p.codigo);
      assert.ok(fallo);
      if (p.error) assert.equal(error, p.error);
    } else {
      const r = V.terminar(Py.ejecutar(p.codigo, { entradas: p.entradas || [] }));
      assert.equal(r.error?.tipo, p.error);
      if (p.tipo === 'predice') {
        assert.equal(p.opciones.length, 3);
        const texto = p.error === 'RuntimeError' ? 'El curso detiene el bucle' : r.error?.tipo || V.normal(r.salida) || 'Nada';
        assert.equal(p.opciones[p.correcta], texto);
      }
    }
  }));
}
function probarEstado(prueba) {
  prueba('Curso · línea siguiente, variables y llamadas activas', () => {
    const programa = Py.ejecutar('def doble(n):\n    return n * 2\nx = doble(4)\nprint(x)');
    const estados = [programa.preparar(), ...Array.from({ length: 4 }, () => programa.paso())];
    assert.deepEqual(estados.map(r => r.linea), [1, 3, 2, 4, 4]);
    assert.deepEqual(estados[2].llamadas, ['doble(n=4)', 'programa principal']);
    assert.equal(estados[2].variables.n, '4');
    assert.equal(estados[3].variables.x, '8');
    assert.equal(estados[4].salida, '8\n');
  });
  prueba('Curso · diccionarios y tuplas en Variables', () => {
    const r = V.terminar(Py.ejecutar('d = {"nombre": "Ana"}\nt = ("x" * 90,)\ne = {"x": "ñ" * 90}'));
    assert.equal(r.variables.d, "{'nombre': 'Ana'}");
    for (const nombre of ['t', 'e']) {
      assert.equal(r.variables[nombre].length, 60);
      assert.ok(r.variables[nombre].endsWith('…'));
    }
  });
  prueba('Curso · mensajes de módulos y fin de entradas', () => {
    const ejecutar = codigo => V.terminar(Py.ejecutar(codigo, { entradas: [] }));
    const modulo = ejecutar('import os').error;
    assert.equal(modulo.tipo, 'ModuleNotFoundError');
    assert.equal(modulo.mensaje, 'Este curso solo incluye `math` y `random`. En Python real hay muchos más.');
    const entrada = ejecutar('input()').error;
    assert.equal(entrada.tipo, 'EOFError');
    assert.equal(entrada.mensaje, 'El programa pidió más datos de los previstos');
  });
  prueba('Curso · el progreso funciona sin almacenamiento local', () => {
    const P = require('../js/curso/progreso');
    const previo = P.total();
    P.completar(1, 2);
    P.completar(1, 2);
    P.guardarCodigo(1, 2, "print('Día')");
    P.visitar(1, 2);
    assert.equal(P.total(), previo + 1);
    assert.deepEqual(P.ultimo(), [1, 2]);
    assert.equal(P.codigo(1, 2), "print('Día')");
    assert.equal(P.completo(1, 1), false);
  });
}
function probarLimites(prueba) {
  prueba('Curso · límites propios del navegador', () => {
    for (const [codigo, tipo] of [
      ['x = 9007199254740994', 'OverflowError'],
      ['x = 9007199254740993', 'OverflowError'],
      ['x = 9007199254740992 + 1', 'OverflowError'],
      ['x = int("9007199254740993")', 'OverflowError'],
      ['x = "a" * 100001', 'OverflowError'],
      ['x = [0] * 10001', 'OverflowError'],
      ['for i in range(501): print(i)', 'RuntimeError'],
      ['input()', 'EOFError']
    ]) assert.equal(V.terminar(Py.ejecutar(codigo, { entradas: [] })).error?.tipo, tipo);
  });
}
module.exports = prueba => {
  probarFragmentos(prueba);
  probarTemas(prueba);
  probarEstado(prueba);
  probarLimites(prueba);
};
