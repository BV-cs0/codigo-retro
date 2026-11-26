'use strict';
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const python = require('./datos-ejercicios');
const { Bash, EjerciciosBash, ValidarBash } = require('./contenido-bash');
const bashEn = require('../js/ejercicios/en/bash-retos');

function estructura(ficha) {
  const { id, tema, tipo, dificultad, lenguaje, requiere, prohibe, datos, casos, pruebas, archivos, fs } = ficha;
  return { id, tema, tipo, dificultad, lenguaje, requiere, prohibe, datos: datos?.length, casos: casos?.length,
    pruebas: pruebas?.map(p => p.tipo), archivos: Object.keys(archivos || {}).length, fs: Object.keys(fs || {}).length,
    salidas: Object.hasOwn(ficha, 'salidaEsperada'), alternativa: Boolean(ficha.alternativa), trampa: Boolean(ficha.trampa) };
}

function contenido(ficha) {
  const { titulo, enunciado, pistas, ejemplo, codigo, solucion, alternativa, trampa, salidaEsperada,
    args, entradas, casos, datos, pruebas, fs } = ficha;
  return [titulo, enunciado, pistas, ejemplo, codigo, solucion, alternativa, trampa, salidaEsperada,
    args, entradas, casos, datos, pruebas?.flatMap(p => [p.llamada, p.codigo, p.salida]), fs];
}

function probarBash(prueba) {
  for (const ficha of bashEn) prueba('en · ' + ficha.id + ' acepta la solución y rechaza el inicio', () => {
    const r = ValidarBash.comprobar(ficha, ficha.solucion);
    assert.ok(r.ok, JSON.stringify(r.checks.filter(c => !c.ok)));
    const inicial = ficha.tipo === 'ordena' ? ficha.codigo.split('\n').reverse().join('\n') : ficha.codigo;
    assert.equal(ValidarBash.comprobar(ficha, inicial).ok, false);
  });
  prueba('Taller Bash · identidad y permisos en cada idioma', () => {
    for (const [idioma, usuario, maquina, fichas] of [
      ['es', 'aprendiz', 'faro7', EjerciciosBash], ['en', 'apprentice', 'beacon7', bashEn]
    ]) {
      const home = '/home/' + usuario;
      const r = Bash.correr('whoami; hostname; pwd; echo "$HOME"; echo "$USER"', { idioma });
      assert.equal(r.salida, [usuario, maquina, home, home, usuario, ''].join('\n'));
      const ficha = fichas.find(e => e.id === 'bash-8');
      const copia = Bash.correr(ficha.solucion, ficha);
      assert.equal(copia.fs.obtener(home + '/backup').dueno, usuario);
    }
  });
  prueba('Exportar Bash · todos los casos del Taller en inglés', () => {
    const casos = JSON.parse(execFileSync(process.execPath, [require.resolve('./exportar-bash'), '--idioma', 'en']))
      .filter(c => c.id.startsWith('taller-bash-'));
    assert.equal(casos.length, bashEn.reduce((n, e) => n + ValidarBash.casos(e).length, 0));
    assert.ok(casos.every(c => c.id.startsWith('taller-bash-') && c.home === 'home/apprentice'));
    const copia = casos.find(c => c.id === 'taller-bash-8-1');
    assert.equal(copia.cwd, 'home/apprentice');
    assert.equal(copia.fs['home/apprentice/my copy.conf'], 'b');
  });
}

module.exports = prueba => {
  const es = [...python, ...EjerciciosBash];
  const en = [...python.en, ...bashEn];
  prueba('Taller · la estructura española e inglesa coincide', () => {
    assert.equal(bashEn.length, 15);
    assert.deepEqual(en.map(estructura), es.map(estructura));
  });
  prueba('Taller · los textos y el código en inglés no contienen palabras españolas', () => {
    for (const e of en) {
      const texto = JSON.stringify(contenido(e)).replace(/Éclair123|[az]-É Z/g, '');
      assert.doesNotMatch(texto, /[ñáéíóúü¿¡]|(?<![\p{L}_])(?:que|el|los|las|diseña|imprime|devuelve|escribe|hola)(?![\p{L}_])/iu, e.id);
    }
  });
  probarBash(prueba);
};
