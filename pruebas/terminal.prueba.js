'use strict';
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { Sesion, comandos, ejecutarNodo } = require('../js/shell/ejecutor');
const { analizar } = require('../js/shell/analizador');
const { capitulos, objetivos } = require('../js/terminal/misiones');
const { casos, casosIngles } = require('./datos-terminal');
const ingles = require('../js/terminal/misiones-en');
const { Bash } = globalThis.CR.Shell;
function probarCasos(prueba) {
  for (const c of [...casos, ...casosIngles()]) prueba((c.idioma ?? 'es') + ' · ' + c.id + ' · ' + c.linea, () => {
    const resultado = new Sesion({ fs: c.fs, cwd: c.cwd, idioma: c.idioma, captura: c.bash }).ejecutar(c.linea);
    assert.equal(resultado.salida, c.salida);
    assert.equal(resultado.error, c.error);
    assert.equal(resultado.codigo, c.codigo);
  });
  prueba('El Faro · cantidad, capítulos y comandos', () => {
    assert.ok(casos.length >= 150);
    assert.ok(comandos.length > 30);
    assert.equal(capitulos.length, 12);
    assert.equal(capitulos.slice(0, 8).flatMap(c => c.misiones).length, 40);
    assert.equal(capitulos.flatMap(c => c.misiones).length, 60);
  });
  prueba('El Faro · el exportador conserva los casos y acepta --idioma en', () => {
    const ejecutar = (...args) => JSON.parse(execFileSync(process.execPath, [require.resolve('./exportar-terminal'), ...args]));
    const es = ejecutar();
    const en = ejecutar('--idioma', 'en');
    assert.deepEqual(es, ejecutar('--idioma', 'es'));
    assert.deepEqual(en.map(c => c.id), es.map(c => c.id));
    assert.ok(en.filter(c => !c.id.startsWith('atalaya-')).every(c => c.cwd === '/home/apprentice'));
    assert.equal(en[0].fs['a.txt'], 'one\nTWO\none\nend');
    assert.equal(en[0].salida, en[0].fs['a.txt']);
  });
}

function probarMotorInteractivo(prueba) {
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
}

function probarMisiones(prueba, lista, idioma) {
  for (const { misiones } of lista) for (const mision of misiones) {
    prueba('El Faro · ' + idioma + ' · ' + mision.id + ' ' + mision.titulo, () => {
      const s = Bash.sesionTerminal({ ...mision, idioma, mision });
      assert.ok(objetivos(mision, s).every(x => !x));
      for (const linea of mision.solucion) {
        const r = s.ejecutar(linea);
        assert.equal(r.error, '', linea);
        assert.equal(r.codigo, 0, linea);
        if (r.pregunta !== undefined)
          assert.equal(mision.remoto?.clave, mision.solucion[mision.solucion.indexOf(linea) + 1], linea);
      }
      assert.ok(objetivos(mision, s).every(Boolean));
    });
  }
}

function probarIdiomas(prueba) {
  prueba('El Faro · los capítulos, misiones y requisitos conservan su estructura', () => {
    const comandos = { answer: 'responder', './light.sh': './encender.sh' };
    const canonico = c => Object.hasOwn(comandos, c) ? comandos[c] : c;
    const forma = lista => lista.map(c => c.misiones.map(m => ({ id: m.id,
      comandos: m.comandos.map(canonico), pistas: m.pistas.length, archivos: Object.keys(m.fs).length,
      objetivos: m.objetivos.map(o => [o.tipo, o.clase, o.diferido, o.modo, canonico(o.comando), Boolean(o.args)])
    })));
    assert.deepEqual(forma(ingles.capitulos), forma(capitulos));
  });
  prueba('El Faro · los textos, rutas y archivos de las misiones están en inglés', () => {
    const espanol = /[áéíóúñ¿¡]|\b(?:que|el|los|las|prueba|borrar|conservar|sesion|tormenta|responder)\b/i;
    for (const { titulo, misiones } of ingles.capitulos) for (const m of misiones) {
      const textos = [titulo, m.titulo, m.texto, m.cierre, m.cwd, ...m.comandos, ...m.pistas, ...m.solucion,
        ...m.objetivos.flatMap(o => [o.texto, o.ruta, o.valor, o.igual, o.contiene]),
        ...Object.entries(m.fs).flatMap(([ruta, ficha]) => [ruta, ficha?.contenido ?? ficha, ficha?.dueno])];
      assert.doesNotMatch(textos.join('\n'), espanol, m.id);
    }
  });
  prueba('El Faro · identidad y contraseña dependen del idioma', () => {
    for (const [idioma, datos, usuario, maquina, contrario, responder] of [
      ['es', { capitulos }, 'aprendiz', 'faro7', 'beacon7', 'responder'],
      ['en', ingles, 'apprentice', 'beacon7', 'faro7', 'answer']
    ]) {
      const mision = datos.capitulos[7].misiones[2];
      const s = Bash.sesionTerminal({ ...mision, idioma, mision });
      assert.equal(s.ejecutar('whoami; hostname; pwd; echo "$HOME"').salida,
        [usuario, maquina, '/home/' + usuario, '/home/' + usuario, ''].join('\n'));
      assert.match(s.ejecutar('cat ' + mision.objetivos[1].ruta).salida, new RegExp(maquina));
      s.ejecutar(responder + ' ' + contrario);
      assert.equal(objetivos(mision, s)[2], false);
      s.ejecutar(responder + ' ' + maquina);
      assert.equal(objetivos(mision, s)[2], true);
    }
  });
}

function probarDiagnosticos(prueba) {
  for (const idioma of ['es', 'en']) prueba('El Faro · comandos ausentes y erratas · ' + idioma, () => {
    const s = Bash.sesionTerminal({ idioma });
    const comandos = 'sed awk vim vi nano sudo su apt scp wget top chown tar zip unzip git python python3';
    for (const nombre of comandos.split(' ')) {
      const linea = nombre === 'sed' ? 'sed s/a/b/ x' : nombre;
      const r = s.ejecutar(linea);
      assert.equal(r.codigo, 127, linea);
      assert.equal(r.error, nombre + (idioma === 'en' ? ' is not available in this simulator.\n' : ' no está en este simulador.\n'));
      assert.deepEqual(r.guia, []);
    }
    assert.deepEqual(s.ejecutar('lss').guia, [idioma === 'en' ? 'Did you mean ls?' : '¿Querías decir ls?']);
    assert.doesNotMatch(s.ejecutar('zzz').guia.join(' '), /Did you mean|Querías decir/);
  });
}

module.exports = prueba => {
  probarCasos(prueba);
  probarMisiones(prueba, capitulos, 'es');
  probarMisiones(prueba, ingles.capitulos, 'en');
  probarIdiomas(prueba);
  probarDiagnosticos(prueba);
  probarMotorInteractivo(prueba);
};
