'use strict';
const assert = require('node:assert/strict');
const ejercicios = require('./datos-ejercicios');
const { comprobar, ejecutar } = require('../js/ejercicios/validar');
const orden = require('../js/ejercicios/ordenar');
function probarEjercicios(prueba, fichas, idioma) {
  prueba('Taller ' + idioma + ' · 55 ejercicios con identificadores únicos', () => {
    assert.equal(fichas.length, 55);
    assert.equal(new Set(fichas.map(e => e.id)).size, 55);
  });
  for (const e of fichas) {
    prueba(idioma + ' · ' + e.id + ' acepta la solución', () => {
      const r = comprobar(e, e.solucion);
      assert.equal(r.ok, true, JSON.stringify(r.checks.filter(f => !f.ok)));
    });
    prueba(idioma + ' · ' + e.id + ' rechaza el inicio', () => {
      const inicial = e.tipo === 'ordena' ? orden.montar(orden.crear(e, () => 0.99)) : e.codigo;
      assert.equal(comprobar(e, inicial).ok, false);
    });
    if (e.alternativa) prueba(idioma + ' · ' + e.id + ' acepta la alternativa', () => assert.equal(comprobar(e, e.alternativa).ok, true));
  }
}
function probarVeredictos(prueba) {
  for (const [codigo, mensaje] of [
    ['while True:\n    pass', /no termina/],
    ['while True:\n    print(1)', /Revisa la condición del while/],
    ['print(1 / 0)', /ZeroDivisionError.*línea 1/],
    ['print(" despegue ")', /revisa mayúsculas y espacios/],
    ['print("Despegue")\nprint("sobra")', /una línea de más.*sobra/],
    ['print(max([1]))', /sin max\(\)/],
    ['', /Falta la línea.*al final/]
  ]) {
    prueba('Veredicto: ' + mensaje.source, () => {
      const r = comprobar({ salidaEsperada: 'Despegue', prohibe: ['max'] }, codigo);
      assert.equal(r.ok, false);
      assert.ok(r.checks.some(f => !f.ok && mensaje.test(f.texto)));
    });
  }
  prueba('Veredicto: la función que imprime debe devolver', () => {
    const r = comprobar({ pruebas: [{ llamada: 'f(4)', codigo: 'print(f(4))', salida: '8' }] },
      'def f(n):\n    print(n * 2)');
    assert.match(r.checks[0].texto, /imprime el resultado, pero no lo devuelve/);
  });
  prueba('Veredicto: huecos pendientes', () => {
    assert.equal(comprobar(ejercicios[1], 'print(___)').checks[0].texto, 'Todavía quedan huecos por rellenar');
  });
}
function probarInterprete(prueba) {
  prueba('Python 3.14: ord y chr aceptan caracteres fuera del BMP', () => {
    const r = ejecutar('print(ord("😀"), chr(128512))', {});
    assert.equal(r.error, null);
    assert.equal(r.salida, '128512 😀\n');
    assert.equal(ejecutar('chr(-1)', {}).error.tipo, 'ValueError');
    assert.equal(ejecutar('ord("AB")', {}).error.tipo, 'TypeError');
  });
  prueba('Python 3.14: sorted y list.sort con key, reverse y estabilidad', () => {
    const r = ejecutar([
      'def clave(x):', '    return x[0]', 'lista = ["b1", "a2", "b3"]',
      'print(sorted(lista, key=clave, reverse=True))', 'print(lista)',
      'print(lista.sort(key=clave, reverse=True))', 'print(lista)'
    ].join('\n'), {});
    assert.equal(r.error, null);
    assert.equal(r.salida, "['b1', 'b3', 'a2']\n['b1', 'a2', 'b3']\nNone\n['b1', 'b3', 'a2']\n");
  });
  prueba('Taller distingue los tipos de retorno y acepta diccionarios equivalentes', () => {
    const factorial = ejercicios.find(e => e.id === 'bucles-3');
    assert.equal(comprobar(factorial, factorial.solucion.replace('return producto', 'return str(producto)')).ok, false);
    const resumen = ejercicios.find(e => e.id === 'retos-4');
    const distinto = resumen.solucion.replace('"max": max(notas), "min": min(notas)', '"min": min(notas), "max": max(notas)');
    assert.equal(comprobar(resumen, distinto).ok, true);
  });
}
function probarOrden(prueba) {
  prueba('Ordena: sangría y descarte producen el código validado', () => {
    const e = ejercicios.find(e => e.trampa);
    const lineas = orden.crear(e, () => 0.99).sort((a, b) => a.id - b.id);
    orden.mover(lineas, 1, 'derecha');
    orden.mover(lineas, lineas.at(-1).id, 'descartar');
    assert.equal(orden.montar(lineas), e.solucion);
    assert.equal(comprobar(e, orden.montar(lineas)).ok, true);
    orden.mover(lineas, 1, 'izquierda');
    assert.equal(comprobar(e, orden.montar(lineas)).ok, false);
  });
}

module.exports = prueba => {
  probarEjercicios(prueba, ejercicios, 'es');
  probarEjercicios(prueba, ejercicios.en, 'en');
  probarVeredictos(prueba);
  probarInterprete(prueba);
  probarOrden(prueba);
};
