'use strict';
const assert = require('node:assert/strict');
const { Bash, CursoBash, EjerciciosBash, ValidarBash } = require('./contenido-bash');
const lineas = [
  'nombre=Lumen',
  'saludar() { printf "%s\\n" "$nombre:$1"; }',
  'if [ -d . ] && test -n "$nombre" && [[ $nombre == L* ]]; then saludar hola; fi',
  'case "$nombre" in L*) printf "%s\\n" caso ;; esac',
  'for i in 1 2; do printf "%s\\n" "$i"; done',
  'while (( i > 0 )); do (( i -= 1 )); done; until (( i > 0 )); do (( i += 1 )); done; echo "$i"',
  'leer() { echo antes; read -r -p "Nombre: " nombre; }; leer',
  'saludar después'
];
const salidaTerminal = 'Lumen:hola\ncaso\n1\n2\n1\nantes\nAna:después\n';
module.exports = prueba => {
  prueba('El Faro · sintaxis de scripts, entrada y estado entre órdenes', () => {
    const s = Bash.sesionTerminal();
    let salida = '';
    for (const linea of lineas) {
      const r = s.ejecutar(linea);
      assert.equal(r.error, '', linea);
      assert.equal(r.codigo, 0, linea);
      salida += r.salida;
      if (linea === lineas[6]) {
        assert.equal(r.pregunta, 'Nombre: ');
        assert.equal(r.salida, 'antes\n');
        assert.equal(s.ejecutar('Ana').error, '');
      }
    }
    assert.equal(salida, salidaTerminal);
    assert.deepEqual(s.historial, lineas);
    assert.equal(s.ejecutar('read nombre').pregunta, '');
    s.cancelar();
    assert.equal(s.ejecutar('echo "$? $nombre"').salida, '130 Ana\n');
  });
  prueba('Bash · set informa de las opciones no admitidas', () => {
    for (const script of ['set -e', 'set --opcion-inexistente', 'set']) {
      const r = Bash.correr(script);
      assert.equal(r.salida, '');
      assert.equal(r.codigo, 2);
      assert.match(r.stderr, /no está en este simulador.*set --/);
    }
  });
  prueba('Bash · consejo con el nombre y el valor escritos', () => {
    for (const [script, correcto] of [
      ['nombre = "Lumen"', 'nombre="Lumen"'], ['x = 5', 'x=5'], ["turno = 'luz azul'", "turno='luz azul'"]
    ]) {
      const r = Bash.correr(script);
      assert.equal(r.salida, '');
      assert.equal(r.codigo, 127);
      assert.deepEqual(r.guia, ['En Bash no puede haber espacios alrededor de =. Escribe ' + correcto + '.']);
      const ficha = ValidarBash.comprobar({ salidaEsperada: '' }, script);
      assert.equal(ficha.checks.at(-1).texto, r.guia[0]);
    }
  });
  prueba('Bash · nombres de requisitos del curso y del Taller', () => {
    const fichas = CursoBash.flatMap(t => t.pasos).concat(EjerciciosBash);
    const nombres = fichas.flatMap(f => {
      if (!f.requiere?.length) return [];
      const r = ValidarBash.comprobar(f, f.solucion);
      assert.ok(r.ok, f.titulo);
      return r.checks.slice(-f.requiere.length).map(c => c.texto);
    });
    assert.deepEqual([...new Set(nombres)].sort(), [
      'Usa aritmética $(( ))', 'Usa case', 'Usa comillas dobles al expandir variables', 'Usa for', 'Usa if',
      'Usa read', 'Usa sustitución de comandos', 'Usa una función', 'Usa una prueba de archivo', 'Usa while',
      'Usa while read'
    ].sort());
    const r = ValidarBash.comprobar({ salidaEsperada: '', requiere: ['while-read'] },
      'while false; do read nombre; done');
    assert.deepEqual(r.checks.at(-1), { ok: false, texto: 'Usa while read' });
  });
};
module.exports.referencia = { lineas, salidaTerminal };
