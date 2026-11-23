'use strict';
const assert = require('node:assert/strict');
const { Sesion, comandos, ejecutarNodo } = require('../js/shell/ejecutor');
const { analizar } = require('../js/shell/analizador');
const { capitulos, objetivos } = require('../js/terminal/misiones');
const { casos } = require('./datos-terminal');
module.exports = prueba => {
  for (const c of casos) prueba(c.id + ' · ' + c.linea, () => {
    const resultado = new Sesion({ fs: c.fs, cwd: c.cwd, captura: c.bash }).ejecutar(c.linea);
    assert.equal(resultado.salida, c.salida);
    assert.equal(resultado.error, c.error);
    assert.equal(resultado.codigo, c.codigo);
  });
  prueba('El Faro · cantidad, capítulos y comandos', () => {
    assert.ok(casos.length >= 150);
    assert.ok(comandos.length > 30);
    assert.equal(capitulos.length, 8);
    assert.equal(capitulos.flatMap(c => c.misiones).length, 40);
  });
  for (const capitulo of capitulos) for (const mision of capitulo.misiones) {
    prueba('El Faro · ' + mision.id + ' ' + mision.titulo, () => {
      const s = new Sesion({ ...mision, mision });
      assert.ok(objetivos(mision, s).every(x => !x));
      for (const linea of mision.solucion) {
        const r = s.ejecutar(linea);
        assert.equal(r.error, '', linea);
        assert.equal(r.codigo, 0, linea);
      }
      assert.ok(objetivos(mision, s).every(Boolean));
    });
  }
  prueba('El Faro · confirmación interactiva y reanudación de la lista', () => {
    const s = new Sesion({ fs: { a: 'a', b: 'b' } });
    assert.equal(s.ejecutar('echo antes; rm -i a b && echo después').pregunta, "rm: remove regular file 'a'?");
    assert.equal(s.ejecutar('n').pregunta, "rm: remove regular file 'b'?");
    assert.equal(s.ejecutar('y').salida, 'después\n');
    assert.equal(s.ejecutar('ls -1').salida, 'a\n');
  });
  prueba('El Faro · límites y recuperación tras borrar la raíz simulada', () => {
    const s = new Sesion({ fs: { grande: 'x'.repeat(1048576), largo: 'x\n'.repeat(5100) } });
    assert.match(s.ejecutar('echo x >> grande').error, /File too large/);
    assert.equal(s.ejecutar('cat largo').salida.split('\n').length, 5001);
    assert.match(s.ejecutar('rm -rf /').aviso, /Reiniciar misión/);
    assert.equal(s.fs.nodos.size, 0);
    assert.throws(() => new Sesion({ fs: Object.fromEntries(Array.from({ length: 2000 }, (_, i) => ['n' + i, ''])) }),
      /No space left on device/);
  });
  prueba('El Faro · AST con redirecciones y asignaciones separadas de las palabras', () => {
    const lista = analizar('N=hola; cat < entrada | grep "$N" >> salida || echo $?');
    assert.equal(lista.tipo, 'lista');
    assert.equal(lista.pasos[0].nodo.asignaciones[0].nombre, 'N');
    assert.equal(lista.pasos[1].nodo.tipo, 'tuberia');
    assert.equal(lista.pasos[1].nodo.etapas[0].redirecciones[0].operador, '<');
    assert.equal(lista.pasos[2].enlace, '||');
  });
  prueba('El Faro · una regla de lenguaje y su ejecutor comparten listas y tuberías', () => {
    const dialecto = {
      reglas: [cursor => {
        if (cursor.mirar()?.partes?.[0]?.texto !== 'doble') return undefined;
        cursor.tomar();
        return { tipo: 'doble', cuerpo: cursor.simple() };
      }],
      ejecutores: {
        *doble(nodo, ...contexto) {
          yield* ejecutarNodo(nodo.cuerpo, ...contexto);
          yield* ejecutarNodo(nodo.cuerpo, ...contexto);
        }
      }
    };
    assert.equal(new Sesion({ dialecto }).ejecutar('doble echo luz | wc -l && echo listo').salida, '2\nlisto\n');
  });
  prueba('El Faro · el objetivo de ejecución exige que el script llegue a ejecutarse', () => {
    const mision = capitulos[6].misiones[0];
    const s = new Sesion({ ...mision, mision });
    assert.equal(s.ejecutar('./encender.sh').codigo, 126);
    s.ejecutar('chmod u+x encender.sh');
    assert.deepEqual(objetivos(mision, s), [true, false]);
  });
  prueba('El Faro · errores y explicaciones separados', () => {
    const s = new Sesion();
    assert.deepEqual(s.ejecutar('lss').guia, ['¿Querías decir ls?']);
    assert.deepEqual(s.ejecutar('cat ausente 2>/dev/null').guia, []);
  });
  prueba('El Faro · ayuda enumera todos los comandos registrados', () => {
    const r = new Sesion().ejecutar('help');
    assert.deepEqual(r.salida.trimEnd().split('\n').map(l => l.split(/\s+/)[0]), comandos);
  });
};
