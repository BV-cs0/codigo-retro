'use strict';
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');
const { pathToFileURL } = require('node:url');

const raiz = join(__dirname, '..');
const paginas = ['index', 'curso', 'bash', 'ejercicios', 'terminal', 'creador', 'apoya', 'robot', 'mago', 'granja'];
const scripts = ['js/idiomas/es.js', 'js/idiomas/en.js', 'js/comun/idioma.js'];
const leer = archivo => readFileSync(join(raiz, archivo), 'utf8');

function navegador(archivo, query = '', guardado, languages = ['es-ES'], bloquear = false) {
  const datos = new Map(guardado ? [['codigo-retro:idioma', guardado]] : []);
  const atributos = {};
  const botones = ['es', 'en'].map(idioma => ({
    dataset: { idioma }, setAttribute: (k, v) => { atributos[idioma] = v; },
    addEventListener(k, accion) { this.accion = accion; }
  }));
  const location = {
    href: pathToFileURL(join(raiz, archivo)).href + query,
    assign(url) { this.siguiente = url; }
  };
  const contexto = vm.createContext({ URL, TextEncoder, TextDecoder, location, navigator: { languages },
    localStorage: {
      getItem(k) { if (bloquear) throw Error('blocked'); return datos.get(k); },
      setItem(k, v) { if (bloquear) throw Error('blocked'); datos.set(k, v); }
    },
    document: {
      documentElement: {},
      querySelectorAll: selector => selector === '[data-idioma]' ? botones : []
    }
  });
  contexto.window = contexto;
  const cargar = archivo => vm.runInContext(leer(archivo), contexto, { filename: archivo });
  scripts.forEach(cargar);
  return { contexto, CR: contexto.CR, cargar, datos, atributos, botones };
}

function comprobarDemos(prueba) {
  for (const [demo, nombre] of Object.entries({ robot: 'Robot', mago: 'Mago', granja: 'Granja' })) {
    const { CR, cargar } = navegador(demo + '.html', '?lang=en');
    ['motor', 'python', 'tablero', 'lecciones', 'demo-idioma'].forEach(n => cargar('js/comun/' + n + '.js'));
    ['mundo', 'niveles', 'niveles-en'].forEach(n => cargar('js/' + demo + '/' + n + '.js'));
    const es = CR.Contenido.es[demo], en = CR.Contenido.en[demo];
    prueba('Idiomas · estructura de ' + demo, () => {
      const estructura = lista => JSON.stringify(lista.map(n => [
        n.id, n.concepto, n.requiereConcepto, n.estrellas3, n.maxLineas, n.variantes,
        n.ordenes.map(o => [Boolean(o.sensor), Boolean(o.parametro)])
      ]));
      assert.equal(estructura(en), estructura(es));
      assert.equal(CR.Idioma.contenido(demo), en);
    });
    for (const nivel of en) prueba('Idiomas · solución en inglés · ' + demo + ' ' + nivel.id, () => {
      const crear = CR.DemoIdioma.crearMundo(CR['Mundo' + nombre].crear);
      const programa = CR.Python.traducir(nivel.solucion, CR.Lecciones.opciones(nivel.ordenes));
      const textos = [nivel.titulo, ...nivel.intro, nivel.pista, nivel.logro, nivel.pythonReal, nivel.ejemplo, nivel.solucion];
      assert.doesNotMatch(textos.join(' '), /[áéíóúñ¿¡]|\b(?:el|que|nivel|avanzar|girar)\b/i);
      for (const mapa of nivel.variantes) {
        const mundo = crear(mapa);
        const ejecucion = CR.Motor.crearEjecucion(programa, mundo);
        let paso;
        do { paso = ejecucion.paso(); assert.equal(paso.error, null); } while (!paso.hecho);
        assert.ok(mundo.ganado());
      }
      if (nivel.requiereConcepto) assert.ok(CR.Motor.usaConcepto(programa, nivel.concepto));
    });
  }
}

function comprobarSelector(prueba) {
  prueba('Idiomas · URL, almacenamiento, navegador y selector', () => {
    const { CR, contexto, datos, botones, atributos } = navegador('robot.html', '?lang=en#nivel', 'es');
    assert.equal(CR.Idioma.actual(), 'en');
    assert.equal(contexto.document.documentElement.lang, 'en');
    assert.equal(datos.get('codigo-retro:idioma'), 'en');
    assert.deepEqual(atributos, { es: 'false', en: 'true' });
    botones[0].accion();
    assert.match(contexto.location.siguiente, /\?lang=es#nivel$/);
    assert.equal(datos.get('codigo-retro:idioma'), 'es');
    assert.equal(navegador('index.html', '?lang=fr', 'es', ['en']).CR.Idioma.actual(), 'es');
    assert.equal(navegador('index.html', '', undefined, ['en', 'es'], true).CR.Idioma.actual(), 'en');
    assert.equal(navegador('index.html', '', undefined, ['es-AR'], true).CR.Idioma.actual(), 'es');
    CR.Idioma.registrar('es', 'curso', ['respaldo']);
    assert.equal(CR.Idioma.contenido('curso')[0], 'respaldo');
  });
}

function comprobarInterfaz(prueba) {
  prueba('Idiomas · diccionarios e interfaz estática de las diez páginas', () => {
    const { CR } = navegador('index.html', '?lang=en');
    assert.deepEqual(Object.keys(CR.Idiomas.en).sort(), Object.keys(CR.Idiomas.es).sort());
    for (const [clave, texto] of Object.entries(CR.Idiomas.en)) {
      const excepciones = texto.replace(/Código Retro|CÓDIGO RETRO|aprendiz@faro/g, '');
      assert.doesNotMatch(excepciones, /[áéíóúñ¿¡]|\b(?:que|el|los|las|todavía)\b/i, clave);
      const huecos = s => (s.match(/\{\w+\}/g) || []).sort();
      assert.deepEqual(huecos(texto), huecos(CR.Idiomas.es[clave]), clave);
    }
    for (const pagina of paginas) {
      const html = leer(pagina + '.html');
      assert.match(html, /<title data-t="/);
      assert.equal([...html.matchAll(/data-idioma="(es|en)"/g)].length, 2);
      for (const [, clave] of html.matchAll(/data-t(?:-aria|-title|-placeholder)?="([^"]+)"/g))
        assert.ok(Object.hasOwn(CR.Idiomas.en, clave), pagina + ' · ' + clave);
    }
  });
  prueba('Idiomas · fuente de píxel completa', () => {
    const { CR, cargar } = navegador('index.html', '?lang=en');
    cargar('js/comun/pixel.js');
    for (const letra of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789¡!') {
      let rectangulos = 0;
      CR.Pixel.texto({ fillRect() { rectangulos++; } }, letra, 0, 0, 1, '#fff');
      assert.ok(rectangulos > 0, letra);
    }
  });
}

function comprobarInterpretes(prueba) {
  prueba('Idiomas · explicación de Python y mensaje original', () => {
    const { CR, cargar } = navegador('curso.html', '?lang=en');
    const html = leer('curso.html');
    for (const [archivo] of html.matchAll(/js\/curso\/py\/[^"]+\.js/g)) cargar(archivo);
    for (const [codigo, mensaje, original] of [
      ['int("bad")', 'The string does not represent a valid number.', "invalid literal for int() with base 10: 'bad'"],
      ['"abc"[4]', 'The string has 3 items. Valid positions go from 0 to 2.', 'string index out of range']
    ]) {
      const motor = CR.Py.ejecutar(codigo);
      let paso;
      do { paso = motor.paso(); } while (!paso.hecho);
      assert.equal(paso.error.mensaje, mensaje);
      assert.equal(paso.error.original, original);
    }
  });
  prueba('Idiomas · ayuda y errores de la terminal', () => {
    const { CR, cargar } = navegador('terminal.html', '?lang=en');
    for (const [archivo] of leer('terminal.html').matchAll(/js\/shell\/[^"]+\.js/g)) cargar(archivo);
    const { Bash, Ayuda } = CR.Shell;
    assert.match(Bash.correr('help').salida, /ls\s+List files and folders\./);
    assert.match(Bash.correr('man head').salida, /Show the start of a file\.[\s\S]+Examples/);
    assert.equal(Ayuda.explicar('bash: cdd: command not found'), 'Did you mean cd?');
    assert.match(Bash.correr('ls --color').stderr, /is not available in this simulator/);
  });
}

function comprobarFaro(prueba) {
  prueba('Idiomas · El Faro carga ambos contenidos y comparte el progreso', () => {
    const es = navegador('terminal.html', '?lang=es');
    const en = navegador('terminal.html', '?lang=en');
    const html = leer('terminal.html');
    for (const pagina of [es, en]) {
      for (const [archivo] of html.matchAll(/js\/(?:shell|terminal)\/[^\x22]+\.js/g)) {
        if (/\/(?:sprites|teclado|paneles|juego)\.js$/.test(archivo)) continue;
        pagina.cargar(archivo);
      }
      const actual = pagina.CR.Idioma.actual();
      assert.equal(pagina.CR.Idioma.contenido('terminal'), pagina.CR.Contenido[actual].terminal);
    }
    es.CR.ProgresoFaro.abrir('8-3');
    es.CR.ProgresoFaro.completar('1-1');
    en.datos.set('cr-el-faro', es.datos.get('cr-el-faro'));
    en.CR.ProgresoFaro.refrescar();
    assert.equal(en.CR.ProgresoFaro.ultima(), '8-3');
    assert.equal(en.CR.ProgresoFaro.hecha('1-1'), true);
    const s = en.CR.Shell.Bash.sesionTerminal({ idioma: 'en' });
    assert.match(s.ejecutar('help').salida, /^answer\s+Submit the mission answer\./m);
    assert.match(s.ejecutar('man head').salida, /Examples\n  head note\.txt\n/);
    assert.match(s.ejecutar('man mission').salida, /Examples\n  mission\n/);
  });
}

module.exports = prueba => {
  comprobarFaro(prueba);
  comprobarSelector(prueba);
  comprobarInterfaz(prueba);
  comprobarInterpretes(prueba);
  comprobarDemos(prueba);
};
