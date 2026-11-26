'use strict';
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');

class Nodo {
  constructor(tagName) {
    this.tagName = tagName?.toUpperCase();
    this.dataset = {};
    this.style = {};
    this.children = [];
    this.eventos = {};
    this.value = '';
    this.textContent = '';
    this.classList = { add() {}, toggle() {} };
    this.selectionStart = this.selectionEnd = 0;
  }
  get firstElementChild() { return this.children[0]; }
  get childNodes() { return this.children; }
  append(...hijos) { this.children.push(...hijos); }
  appendChild(hijo) { this.append(hijo); return hijo; }
  replaceChildren(...hijos) { this.children = hijos; }
  addEventListener(tipo, evento) { this.eventos[tipo] = evento; }
  emitir(tipo, datos) { this.eventos[tipo]?.(datos); }
  click() {
    if (this.disabled) return;
    this.onclick?.();
    this.emitir('click');
  }
  focus() {}
  setSelectionRange(inicio, fin) { this.selectionStart = inicio; this.selectionEnd = fin; }
  setRangeText(texto, inicio, fin, modo) {
    this.value = this.value.slice(0, inicio) + texto + this.value.slice(fin);
    if (modo === 'end') this.setSelectionRange(inicio + texto.length, inicio + texto.length);
  }
  removeAttribute() {}
  setAttribute(nombre, valor) { (this.atributos ||= {})[nombre] = valor; }
  getAttribute(nombre) { return this.atributos?.[nombre]; }
  getContext() { return { fillRect() {}, clearRect() {} }; }
  showModal() { this.open = true; }
  close() { this.open = false; this.emitir('close'); }
}

function cargar(archivo, storage, datos = {}, idioma = 'es') {
  const raiz = join(__dirname, '..');
  const html = readFileSync(join(raiz, archivo), 'utf8');
  const ids = Object.fromEntries([...html.matchAll(/id="([^"]+)"/g)].map(([, id]) => [id, new Nodo()]));
  if (ids.salida) ids.salida.parentElement = new Nodo();
  const retratos = ['robot', 'mago', 'granja'].map(demo => Object.assign(new Nodo(), { dataset: { demo, total: demo } }));
  const pendientes = new Map();
  let contador = 0;
  const ubicacion = { hash: '', href: 'file:///codigo-retro/' + archivo };
  const eventos = {};
  const crt = new Nodo();
  const contexto = vm.createContext({
    document: {
      documentElement: {},
      getElementById: id => ids[id],
      createElement: tag => new Nodo(tag),
      createTextNode: texto => Object.assign(new Nodo(), { textContent: texto }),
      createDocumentFragment: () => new Nodo(),
      querySelectorAll: selector => /^\[data-(?:t(?:-|\])|idioma)/.test(selector) ? [] : retratos,
      querySelector: () => crt
    },
    localStorage: storage, matchMedia: () => ({ matches: true }),
    addEventListener(tipo, evento) { eventos[tipo] = evento; },
    URL, TextEncoder, TextDecoder, btoa, atob, location: ubicacion, getSelection: () => '', getComputedStyle: () => ({ fontSize: '16px' }),
    setTimeout(funcion) { pendientes.set(++contador, funcion); return contador; },
    clearTimeout: id => pendientes.delete(id)
  });
  contexto.window = contexto;
  contexto.navigator = { languages: [idioma] };
  contexto.confirm = () => true;
  for (const [, recurso] of html.matchAll(/<script src="([^"]+)"/g)) {
    const ruta = recurso.split(/[?#]/)[0];
    vm.runInContext(datos[ruta] ?? readFileSync(join(raiz, ruta), 'utf8'), contexto, { filename: ruta });
  }
  function animar() {
    const siguiente = pendientes.entries().next().value;
    if (!siguiente) return false;
    pendientes.delete(siguiente[0]);
    siguiente[1]();
    return true;
  }
  return { ids, retratos, animar, crt, navegar(hash) { ubicacion.hash = hash; eventos.hashchange(); } };
}

function abrirNivel(ids, indice) {
  ids.niveles.children[indice].click();
  assert.equal(ids.dialogo.open, true);
  ids['dialogo-acciones'].firstElementChild.click();
  assert.equal(ids.dialogo.open, false);
}

function escribir(ids, codigo) {
  ids.codigo.value = codigo;
  ids.codigo.emitir('input');
}

function ganar(pantalla, nivel) {
  const { ids, animar } = pantalla;
  abrirNivel(ids, nivel.id - 1);
  escribir(ids, nivel.solucion);
  ids.ejecutar.click();
  assert.equal(ids.codigo.readOnly, true);
  for (let i = 0; i < 100 && animar(); i++) {}
  assert.equal(ids.codigo.readOnly, false);
  assert.equal(ids.dialogo.open, true);
  assert.equal(ids['dialogo-titulo'].textContent, nivel.id === 5 ? 'Final de la demo' : 'Nivel superado');
  assert.equal(ids['dialogo-texto'].firstElementChild.textContent, '★★★');
  assert.ok(ids['dialogo-texto'].children.some(nodo => nodo.textContent.startsWith('En Python de verdad…')));
  if (nivel.id === 5) assert.ok(ids['dialogo-texto'].children.some(nodo => nodo.textContent.endsWith('15 / 15.')));
  ids.dialogo.close();
  ids['volver-niveles'].click();
}

function probarDemos(prueba) {
  prueba('Pantalla simulada · carga de los HTML, ejecución de 15 niveles y progreso', () => {
    const memoria = new Map();
    const storage = { getItem: id => memoria.get(id), setItem: (id, valor) => memoria.set(id, valor) };
    for (const demo of ['robot', 'mago', 'granja']) {
      const pantalla = cargar(demo + '.html', storage);
      assert.equal(pantalla.ids.niveles.children.length, 5);
      for (const nivel of require('../js/' + demo + '/niveles')) ganar(pantalla, nivel);
      const recarga = cargar(demo + '.html', storage);
      abrirNivel(recarga.ids, 0);
      assert.equal(recarga.ids.estrellas.textContent, '★★★');
      assert.equal(recarga.ids.codigo.value, require('../js/' + demo + '/niveles')[0].solucion);
    }
    assert.deepEqual(cargar('index.html', storage).retratos.map(n => n.textContent), Array(3).fill('★ 15 / 15'));
  });
  prueba('Pantalla simulada · editor, pasos, reinicio y almacenamiento bloqueado', () => {
    const bloquear = () => { throw new Error('Almacenamiento bloqueado.'); };
    const { ids } = cargar('robot.html', { getItem: bloquear, setItem: bloquear });
    abrirNivel(ids, 1);
    const tecla = (key, shiftKey = false) => ids.codigo.emitir('keydown', { key, shiftKey, preventDefault() {} });
    escribir(ids, 'for i in range(2):');
    ids.codigo.setSelectionRange(18, 18);
    tecla('Enter');
    assert.equal(ids.codigo.value, 'for i in range(2):\n    ');
    tecla('Tab', true);
    assert.equal(ids.codigo.value, 'for i in range(2):\n');
    escribir(ids, 'avansar()');
    ids.ejecutar.click();
    assert.match(ids.error.textContent, /Línea 1:.*avanzar/);
    escribir(ids, 'avanzar()');
    ids.paso.click();
    assert.equal(ids.codigo.readOnly, true);
    ids.parar.click();
    assert.equal(ids.codigo.readOnly, false);
    ids.reiniciar.click();
    assert.equal(ids.error.textContent, '');
    assert.equal(ids.codigo.value, 'avanzar()');
  });
}
function probarCurso(prueba) {
  prueba('Pantalla del curso · input, eco, predicción y parada', () => {
    const { ids, animar } = cargar('curso.html');
    assert.equal(ids.cartuchos.children.length, 11);
    assert.match(ids.cartuchos.children[10].className, /dorado/);
    ids.cartuchos.children[9].click();
    ids.ejecutar.click();
    assert.equal(ids['entrada-terminal'].hidden, false);
    ids.entrada.value = '<Ana>';
    ids['entrada-terminal'].onsubmit({ preventDefault() {} });
    while (animar()) {}
    assert.equal(ids.salida.children.map(n => n.textContent).join(''), '¿Cómo te llamas? <Ana>\nHola, <Ana>\n');
    assert.equal(ids.salida.children[1].className, 'eco-terminal');
    ids.ejecutar.click();
    ids.parar.click();
    assert.equal(ids['entrada-terminal'].hidden, true);
    assert.equal(ids.codigo.readOnly, false);
    ids.puntos.children[1].click();
    ids.opciones.firstElementChild.click();
    while (animar()) {}
    assert.equal(ids.salida.children.map(n => n.textContent).join(''), 'Edad: 30\n');
    assert.match(ids['error-original'].textContent, /^TypeError: can only concatenate str/);
  });
}
function probarProyecto(prueba) {
  prueba('Pantalla del curso · comprobar, arrastrar código y final', () => {
    const { ids, animar } = cargar('curso.html');
    const proyecto = require('../js/curso/temas/proyecto').pasos;
    ids.cartuchos.children[10].click();
    ids.puntos.children[1].click();
    ids.comprobar.click();
    assert.equal(ids['filas-casos'].children[0].firstElementChild.textContent, '✗');
    const codigo = proyecto[1].solucion + '\n# Mi código';
    escribir(ids, codigo);
    ids.ejecutar.click();
    ids.entrada.value = '42';
    ids['entrada-terminal'].onsubmit({ preventDefault() {} });
    while (animar()) {}
    assert.equal(ids.siguiente.disabled, true);
    ids.comprobar.click();
    assert.equal(ids.siguiente.disabled, false);
    escribir(ids, 'pass');
    ids.siguiente.click();
    assert.equal(ids.codigo.value, codigo);
    escribir(ids, 'pass');
    ids.restaurar.click();
    assert.equal(ids.codigo.value, codigo);
    ids.puntos.children[3].click();
    assert.equal(ids.codigo.value, proyecto[2].solucion);
    ids.puntos.children[9].click();
    assert.match(ids['codigo-final'].textContent, /def jugar\(\)/);
    ids['siguiente-tema'].click();
    assert.equal(ids['final-curso'].hidden, false);
    assert.equal(ids['progreso-final'].textContent, '2 / 114 pasos completados.');
    assert.equal(ids['progreso-temas'].children.length, 11);
    ids['volver-temas'].click();
    assert.equal(ids.indice.hidden, false);
  });
}
function probarCursoEnIngles(prueba) {
  prueba('Pantalla del curso · progreso común y código del proyecto por idioma', () => {
    const memoria = new Map();
    const storage = { getItem: id => memoria.get(id), setItem: (id, valor) => memoria.set(id, valor) };
    const es = cargar('curso.html', storage).ids;
    const proyectoEs = require('../js/curso/temas/proyecto').pasos;
    es.cartuchos.children[10].click();
    es.puntos.children[1].click();
    escribir(es, proyectoEs[1].solucion + '\n# Mi partida');
    es.comprobar.click();
    es.siguiente.click();

    const en = cargar('curso.html', storage, {}, 'en').ids;
    const proyectoEn = require('../js/curso/temas/proyecto-en').pasos;
    assert.match(en.cartuchos.children[10].firstElementChild.textContent, /Guess the Number/);
    en.continuar.click();
    assert.equal(en['titulo-paso'].textContent, proyectoEn[2].titulo);
    assert.equal(en.puntos.children[1].className, 'completo');
    assert.equal(en.codigo.value, proyectoEn[1].solucion);
    escribir(en, proyectoEn[2].solucion);
    en.comprobar.click();
    assert.equal(en.siguiente.disabled, false);
    en.puntos.children[9].click();
    assert.match(en['codigo-final'].textContent, /def play\(\)/);

    const recarga = cargar('curso.html', storage).ids;
    recarga.cartuchos.children[10].click();
    recarga.puntos.children[2].click();
    assert.equal(recarga.codigo.value, proyectoEs[1].solucion + '\n# Mi partida');
    assert.equal(recarga.puntos.children[2].className, 'completo');
  });
  prueba('Pantalla del curso · Pico ejecuta sus órdenes en inglés', () => {
    const { ids, animar } = cargar('curso.html', undefined, {}, 'en');
    const mundo = require('../js/curso/temas/condiciones-en').pasos[8];
    ids.cartuchos.children[2].click();
    ids.puntos.children[8].click();
    escribir(ids, mundo.solucion);
    ids.ejecutar.click();
    while (animar()) {}
    assert.equal(ids.siguiente.disabled, false);
  });
}
function probarTaller(prueba) {
  prueba('Taller en pantalla · fichas, filtros y progreso compartido en inglés', () => {
    const memoria = new Map();
    const storage = { getItem: id => memoria.get(id), setItem: (id, valor) => memoria.set(id, valor) };
    const en = cargar('ejercicios.html', storage, {}, 'en').ids;
    assert.equal(en['fichas-taller'].children.length, 70);
    assert.ok(en['filtro-tema'].children.some(n => n.value === 'bash' && n.textContent === 'Bash Scripting'));
    assert.ok(en['filtro-dificultad'].children.some(n => n.value === 1 && n.textContent === '★ Easy'));
    en['filtro-lenguaje'].value = 'bash';
    en['filtro-lenguaje'].onchange();
    assert.equal(en['fichas-taller'].children.length, 15);
    en['filtro-lenguaje'].value = 'python';
    en['filtro-lenguaje'].onchange();
    assert.equal(en['fichas-taller'].children.length, 55);
    en['fichas-taller'].children[0].click();
    assert.equal(en['titulo-ejercicio'].textContent, 'A text frame');
    en.pista.click();
    assert.equal(en.ayuda.textContent, 'Use one print call per line.');
    escribir(en, require('./datos-ejercicios').en[0].solucion);
    en.comprobar.click();
    assert.equal(en['titular-veredicto'].textContent, '✔ Correct!');
    const es = cargar('ejercicios.html', storage).ids;
    assert.match(es['fichas-taller'].children[0].className, /autonomo/);
    es['fichas-taller'].children[0].click();
    assert.equal(es['titulo-ejercicio'].textContent, 'Un marco de texto');
    assert.equal(es.codigo.value, '');
    assert.equal(cargar('index.html', storage).ids['resueltos-menu'].textContent, '1 / 70 resueltos');
  });
  prueba('Taller en pantalla · filtros, pistas, solución asistida y persistencia', () => {
    const memoria = new Map();
    const storage = { getItem: id => memoria.get(id), setItem: (id, valor) => memoria.set(id, valor) };
    const { ids } = cargar('ejercicios.html', storage);
    assert.equal(ids['fichas-taller'].children.length, 70);
    ids['filtro-lenguaje'].value = 'bash';
    ids['filtro-lenguaje'].onchange();
    assert.equal(ids['fichas-taller'].children.length, 15);
    ids['filtro-lenguaje'].value = 'python';
    ids['filtro-lenguaje'].onchange();
    assert.equal(ids['fichas-taller'].children.length, 55);
    ids['filtro-tema'].value = 'primeros';
    ids['filtro-tema'].onchange();
    assert.equal(ids['fichas-taller'].children.length, 4);
    ids['fichas-taller'].children[0].click();
    ids.pista.click();
    const primera = ids.ayuda.textContent;
    ids.pista.click();
    assert.notEqual(ids.ayuda.textContent, primera);
    for (let i = 0; i < 2; i++) ids.comprobar.click();
    assert.equal(ids.solucion.hidden, true);
    ids.comprobar.click();
    assert.equal(ids.solucion.hidden, false);
    assert.equal(ids['titular-veredicto'].textContent, '✘ Todavía no');
    ids.solucion.click();
    ids.comprobar.click();
    assert.equal(ids['titular-veredicto'].textContent, '✔ ¡Correcto!');
    assert.equal(ids.alternativa.hidden, false);
    assert.equal(ids['siguiente-ejercicio'].hidden, false);
    ids.volver.click();
    assert.match(ids['fichas-taller'].children[0].className, /ayudado/);
    assert.equal(cargar('index.html', storage).ids['resueltos-menu'].textContent, '1 / 70 resueltos');
  });
  prueba('Taller en pantalla · ordenar con teclado y sin editor de texto', () => {
    const { ids } = cargar('ejercicios.html');
    ids['filtro-tema'].value = 'funciones';
    ids['filtro-tema'].onchange();
    ids['fichas-taller'].children.at(-1).click();
    assert.equal(ids['zona-texto'].hidden, true);
    assert.equal(ids['zona-orden'].hidden, false);
    const lista = ids['lineas-orden'];
    lista.querySelector = selector => {
      const id = Number(selector.match(/"(\d+)"/)[1]);
      return lista.children.find(l => l.dataset.id === id).firstElementChild;
    };
    const enviar = (fila, key, shiftKey = false) => {
      fila.firstElementChild.onkeydown({ key, shiftKey, preventDefault() {} });
    };
    const id = lista.firstElementChild.dataset.id;
    enviar(lista.firstElementChild, 'ArrowDown');
    assert.equal(lista.children[1].dataset.id, id);
    enviar(lista.children[1], 'ArrowDown', true);
    assert.equal(lista.children[1].firstElementChild.style.paddingInlineStart, '1.25ch');
  });
}
function probarBash(prueba) {
  prueba('Bash en pantalla · temas, argumentos, entrada, variables y proyecto', () => {
    const { ids, animar } = cargar('bash.html');
    const salida = () => ids.salida.children.map(n => n.textContent).join('');
    assert.equal(ids.cartuchos.children.length, 8);
    ids.cartuchos.children[2].click();
    ids.argumentos.value = '"parte de guardia" 3';
    ids.ejecutar.click();
    assert.match(salida(), /Primero: parte de guardia/);
    assert.equal(ids.siguiente.disabled, false);
    ids.puntos.children[3].click();
    ids.paso.click();
    while (animar() && ids['entrada-terminal'].hidden) {}
    assert.equal(ids['entrada-terminal'].hidden, false);
    assert.equal(ids.prompt.textContent, '¿Tu nombre? ');
    ids.entrada.value = 'Iris';
    ids['entrada-terminal'].onsubmit({ preventDefault() {} });
    while (animar()) {}
    assert.match(salida(), /Hola, Iris/);
    assert.ok(ids.variables.children.some(fila => fila.firstElementChild.textContent === 'nombre'));
    ids.temas.click();
    ids.cartuchos.children[7].click();
    ids.puntos.children[7].click();
    ids['siguiente-tema'].click();
    assert.equal(ids['final-curso'].hidden, false);
  });
  prueba('Bash en pantalla · mini terminal, permisos y cambios de archivos', () => {
    const { ids } = cargar('bash.html');
    ids.cartuchos.children[0].click();
    ids.puntos.children[2].click();
    for (const orden of ['./saludo.sh', 'chmod +x saludo.sh', './saludo.sh']) {
      ids.orden.value = orden;
      ids['mini-terminal'].onsubmit({ preventDefault() {} });
    }
    const salida = ids.salida.children.map(n => n.textContent).join('');
    assert.match(salida, /Permission denied/);
    assert.match(salida, /Luz encendida/);
    ids.temas.click();
    ids.cartuchos.children[1].click();
    ids.puntos.children[3].click();
    ids.opciones.children[0].click();
    assert.equal(ids.archivos.children.filter(n => n.className === 'nuevo').length, 2);
  });
}
function probarBashEnIngles(prueba) {
  prueba('Bash en pantalla · contenido inglés, borradores por idioma y avance compartido', () => {
    const datos = new Map();
    const storage = { getItem: clave => datos.get(clave), setItem: (clave, valor) => datos.set(clave, valor) };
    const { ids: es } = cargar('bash.html', storage);
    es.continuar.click();
    escribir(es, 'echo "Mi parte"');
    es.ejecutar.click();
    const { ids } = cargar('bash.html', storage, {}, 'en');
    assert.equal(ids.cartuchos.children.length, 8);
    assert.match(ids.cartuchos.children[0].firstElementChild.textContent, /Your first script/);
    ids.continuar.click();
    assert.equal(ids.siguiente.disabled, false);
    assert.match(ids.codigo.value, /Hello/);
    escribir(ids, 'echo "My report"');
    ids.puntos.children[2].click();
    assert.equal(ids.archivo.textContent, 'hello.sh');
    ids.orden.value = 'echo $USER@$HOSTNAME:$HOME; bash hello.sh';
    ids['mini-terminal'].onsubmit({ preventDefault() {} });
    const salida = ids.salida.children.map(n => n.textContent).join('');
    assert.match(salida, /apprentice@beacon7:\/home\/apprentice/);
    assert.match(salida, /Light on/);
    ids.temas.click();
    ids.cartuchos.children[7].click();
    ids.puntos.children[7].click();
    assert.match(ids['codigo-final'].textContent, /Lighthouse report/);
    assert.equal(ids['enlace-faro'].href, 'terminal.html?lang=en#mision-8-1');
    ids['siguiente-tema'].click();
    assert.equal(ids['final-curso'].hidden, false);
    assert.equal(ids['progreso-final'].textContent, '2 / 66 steps complete');
    assert.equal(ids['progreso-temas'].children.length, 8);
    es.puntos.children[0].click();
    assert.equal(es.codigo.value, 'echo "Mi parte"');
  });
}
function probarAspectoBash(prueba) {
  prueba('Bash · frases y requisitos de los ocho cartuchos', () => {
    const { ids } = cargar('bash.html');
    const frases = [
      'Escribe órdenes en un archivo y ejecútalas de una vez.',
      'Guarda datos y aprende cuándo usar comillas.',
      'Recibe datos al lanzar el script o pregúntalos.',
      'Decide qué hacer según archivos, números y textos.',
      'Repite órdenes con for, while y until.',
      'Agrupa órdenes con un nombre y reutilízalas.',
      'Filtra y cuenta líneas dentro de un script.',
      'Junta todo en un script que escribe un informe.'
    ];
    const cartuchos = ids.cartuchos.children;
    assert.deepEqual(cartuchos.map(c => c.children[1].textContent), frases);
    cartuchos.forEach((c, j) => {
      const [titulo, , barra, cuenta, necesita] = c.children;
      assert.equal(titulo.tagName, 'STRONG');
      assert.ok(titulo.textContent.startsWith((j + 1) + ' · '));
      assert.equal(barra.tagName, 'PROGRESS');
      assert.equal(cuenta.textContent, '0 / ' + barra.max + ' pasos');
      const previo = j === 0 ? 'Ningún paso previo.' : j === 7 ? 'Todos los temas anteriores.' :
        cartuchos[j - 1].children[0].textContent.slice(4) + '.';
      assert.equal(necesita.textContent, 'Necesitas: ' + previo);
    });
  });
  prueba('Bash · cartucho dorado reservado al proyecto', () => {
    const { ids } = cargar('bash.html');
    assert.deepEqual(ids.cartuchos.children.map(c => c.className),
      [...Array(7).fill('cartucho'), 'cartucho dorado']);
  });
  prueba('Bash · puntos numerados con estado guardado y paso actual', () => {
    const storage = { getItem: () => '{"0:0":{"hecho":true},"ultima":{"t":0,"i":1}}', setItem() {} };
    const { ids } = cargar('bash.html', storage);
    ids.continuar.click();
    assert.deepEqual(ids.puntos.children.map(p => p.textContent), ['1', '2', '3', '4', '5', '6', '7']);
    assert.equal(ids.puntos.children[0].className, 'completo');
    assert.equal(ids.puntos.children[1].getAttribute('aria-current'), 'step');
    assert.equal(ids.puntos.children.filter(p => p.getAttribute('aria-current')).length, 1);
    ids.puntos.children[0].click();
    assert.equal(ids.puntos.children[0].getAttribute('aria-current'), 'step');
  });
}
function probarFinalBash(prueba) {
  prueba('Bash · final con progreso total, ocho temas y vuelta al índice', () => {
    const memoria = new Map([['codigo-retro-bash', '{"0:0":{"hecho":true},"7:0":{"hecho":true}}']]);
    const storage = { getItem: k => memoria.get(k), setItem: (k, v) => memoria.set(k, v) };
    const { ids } = cargar('bash.html', storage);
    ids.cartuchos.children[7].click();
    ids.puntos.children.at(-1).click();
    ids['siguiente-tema'].click();
    assert.equal(ids['paso-curso'].hidden, true);
    assert.equal(ids['final-curso'].hidden, false);
    assert.equal(ids['progreso-final'].textContent, '3 / 66 pasos completados');
    const filas = ids['progreso-temas'].children;
    assert.deepEqual(filas.map(f => f.children[1].value), [1, 0, 0, 0, 0, 0, 0, 2]);
    assert.equal(filas[7].children[2].textContent, '2 / 8 pasos');
    const html = readFileSync(join(__dirname, '../bash.html'), 'utf8');
    assert.match(html, /aria-label="Final del curso"/);
    assert.match(html, /href="ejercicios\.html#bash"[^>]*>Practicar en el Taller/);
    assert.match(html, /href="terminal\.html#mision-8-1"[^>]*>Ir al capítulo 8 de El Faro/);
    ids['volver-temas'].click();
    assert.equal(ids.indice.hidden, false);
    assert.equal(ids['final-curso'].hidden, true);
  });
}
function probarPaginas(prueba) {
  prueba('Menú y páginas del creador · tarjeta de Bash y datos vacíos', () => {
    const { ids } = cargar('index.html');
    assert.match(readFileSync(join(__dirname, '../index.html'), 'utf8'), /id="tarjeta-bash" href="bash\.html"/);
    assert.equal(ids['total-bash'].textContent, '0 / 66 pasos');
    assert.match(readFileSync(join(__dirname, '../index.html'), 'utf8'), /href="terminal\.html"/);
    assert.equal(ids['total-faro'].textContent, '0 / 60 misiones');
    assert.equal(cargar('index.html', { getItem: () => JSON.stringify({ hechas: ['1-1'] }) }).ids['total-faro'].textContent, '1 / 60 misiones');
    const creador = cargar('creador.html', undefined, { 'js/datos-creador.js': 'window.CR = { DatosCreador: {} }' });
    const apoyo = cargar('apoya.html', undefined, { 'js/datos-apoyo.js': 'window.CR = { DatosApoyo: {} }' });
    assert.equal(creador.ids['enlaces-creador'].children.length, 0);
    assert.equal(apoyo.ids['formas-apoyo'].children.length, 0);
    assert.equal(cargar('creador.html').ids['enlaces-creador'].firstElementChild.rel, 'noopener noreferrer');
    assert.ok(cargar('apoya.html').ids['formas-apoyo'].children.every(t => t.tagName === 'ARTICLE'));
  });
}
function probarFaro(prueba) {
  prueba('El Faro en pantalla · función y lectura interactiva persistentes', () => {
    const { ids } = cargar('terminal.html');
    const enviar = texto => {
      ids.linea.value = texto;
      ids.orden.emitir('submit', { preventDefault() {} });
    };
    enviar('mostrar() { printf "<%s>\\n" "$nombre"; }');
    enviar('read -r nombre');
    assert.equal(ids.prompt.textContent, '');
    enviar('Lumen');
    enviar('if [ -d /home ]; then mostrar; fi');
    assert.equal(ids.salida.children.at(-1).firstElementChild.textContent, '<Lumen>\n');
  });
  prueba('El Faro en pantalla · 60 misiones, animación final y progreso', () => {
    const datos = new Map();
    const storage = { getItem: id => datos.get(id), setItem: (id, valor) => datos.set(id, valor) };
    const { ids, navegar } = cargar('terminal.html', storage);
    const { capitulos } = require('../js/terminal/misiones');
    for (const capitulo of capitulos) for (const mision of capitulo.misiones) {
      navegar('#mision-' + mision.id);
      for (const linea of mision.solucion) {
        ids.linea.value = linea;
        ids.orden.emitir('submit', { preventDefault() {} });
      }
      assert.equal(ids.victoria.open, true, mision.id);
      assert.ok(ids.objetivos.children.every(o => o.className === 'hecho'), mision.id);
    }
    assert.equal(ids['titulo-victoria'].textContent, 'Faro-7 encendido');
    assert.match(ids.aprendido.firstElementChild.textContent, /Has aprendido \d+ comandos/);
    navegar('#capitulos');
    assert.equal(ids['progreso-capitulos'].textContent, '60 / 60 misiones');
    assert.equal(ids['lista-capitulos'].children.length, 13);
    assert.equal(ids['lista-capitulos'].children[8].textContent, 'Temporada 2');
    const recarga = cargar('terminal.html', storage);
    recarga.navegar('#capitulos');
    assert.equal(recarga.ids['progreso-capitulos'].textContent, '60 / 60 misiones');
    assert.equal(cargar('index.html', storage).ids['total-faro'].textContent, '60 / 60 misiones');
    const ingles = cargar('terminal.html', storage, {}, 'en');
    ingles.navegar('#capitulos');
    assert.equal(ingles.ids['lista-capitulos'].children[8].textContent, 'Season 2');
    assert.equal(ingles.ids['progreso-capitulos'].textContent, '60 / 60 missions');
  });
  prueba('El Faro en pantalla · Tab, historial, fósforo y restablecimiento', () => {
    const datos = new Map();
    const storage = { getItem: id => datos.get(id), setItem: (id, valor) => datos.set(id, valor) };
    const { ids, crt, navegar } = cargar('terminal.html', storage);
    const tecla = (key, ctrlKey = false) => ids.linea.emitir('keydown', { key, ctrlKey, preventDefault() {} });
    const linea = texto => {
      ids.linea.value = texto;
      ids.linea.setSelectionRange(texto.length, texto.length);
      ids.linea.emitir('input');
    };
    navegar('#mision-1-4');
    linea('cd bi');
    tecla('Tab');
    tecla('Tab');
    assert.equal(ids.salida.firstElementChild.firstElementChild.textContent, 'bienvenida.txt  bitacora/\n');
    linea('cd bit');
    tecla('Tab');
    assert.equal(ids.linea.value, 'cd bitacora/');
    ids.orden.emitir('submit', { preventDefault() {} });
    tecla('ArrowUp');
    assert.equal(ids.linea.value, 'cd bitacora/');
    tecla('ArrowDown');
    assert.equal(ids.linea.value, '');
    tecla('l', true);
    assert.equal(ids.salida.children.length, 0);
    ids.fosforo.value = 'ambar';
    ids.fosforo.emitir('change');
    assert.equal(crt.dataset.fosforo, 'ambar');
    assert.equal(cargar('terminal.html', storage).crt.dataset.fosforo, 'ambar');
    ids.reiniciar.click();
    assert.ok(ids.objetivos.children.every(o => o.className !== 'hecho'));
  });
}
function probarAtalaya(prueba) {
  prueba('Atalaya en pantalla · ética, puntuación, final y cambio de idioma', () => {
    const datos = new Map();
    const storage = { getItem: id => datos.get(id), setItem: (id, valor) => datos.set(id, valor) };
    const { ids } = cargar('retos.html', storage);
    const enviar = linea => {
      ids.linea.value = linea;
      ids.orden.emitir('submit', { preventDefault() {} });
    };
    assert.equal(ids.etica.open, true);
    let obligatorio = false;
    ids.etica.emitir('cancel', { preventDefault() { obligatorio = true; } });
    assert.equal(obligatorio, true);
    ids['aceptar-etica'].click();
    require('./datos-atalaya-bash');
    const retos = globalThis.CR.Atalaya.lista('es');
    ids.pista.click();
    assert.equal(ids['puntos-reto'].textContent, '75 puntos');
    enviar('enviar FLAG{mal}');
    assert.equal(ids.cierre.open, undefined);
    for (const [i, reto] of retos.entries()) {
      if (i) {
        const botones = ids.categorias.children.flatMap(columna => columna.children.filter(n => n.tagName === 'BUTTON'));
        botones[i].click();
      }
      for (const linea of reto.solucion) enviar(linea);
      assert.equal(ids.cierre.open, true);
      ids['cerrar-reto'].click();
    }
    assert.equal(ids.final.open, true);
    assert.equal(ids['final-total'].textContent, '20 / 20 retos · 4675 puntos');
    const en = cargar('retos.html', storage, {}, 'en').ids;
    assert.equal(en.etica.open, undefined);
    assert.equal(en.total.textContent, '20 / 20 challenges · 4675 points');
    assert.match(en.prompt.textContent, /^analyst@watchtower/);
    en['abrir-etica'].click();
    assert.equal(en.etica.open, true);
    assert.equal(cargar('index.html', storage, {}, 'en').ids['total-atalaya'].textContent, en.total.textContent);
  });
}
module.exports = prueba => {
  probarAtalaya(prueba);
  probarFaro(prueba);
  probarTaller(prueba);
  probarBash(prueba);
  probarBashEnIngles(prueba);
  probarAspectoBash(prueba);
  probarFinalBash(prueba);
  probarPaginas(prueba);
  probarDemos(prueba);
  probarCurso(prueba);
  probarProyecto(prueba);
  probarCursoEnIngles(prueba);
};
