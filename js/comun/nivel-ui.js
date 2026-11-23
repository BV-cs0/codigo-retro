(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const estrella = cantidad => '★'.repeat(cantidad) + '☆'.repeat(3 - cantidad);
  let Motor, Python, Lecciones, Progreso, Pixel, Editor, Sonido;
  let demo, personaje, niveles, crear, dibujar, ctx, editor;
  let nivel, mundo, ejecucion, programa, variante, temporizador, automatico;

  function iniciar(config) {
    ({ Motor, Python, Lecciones, Progreso, Pixel, Editor, Sonido } = window.CR);
    ({ demo, personaje, niveles, crear, dibujar } = config);
    ctx = $('mapa').getContext('2d');
    editor = Editor.crear({
      entrada: $('codigo'), espejo: $('espejo'), numeros: $('numeros'),
      contador: $('contador'), error: $('error')
    }, texto => Progreso.guardarCodigo(demo, nivel.id, texto));
    conectarControles();
    $('variables').hidden = demo !== 'granja';
    sonido();
    selector();
  }

  function botones() {
    $('ejecutar').disabled = Boolean(ejecucion && automatico);
    $('paso').disabled = Boolean(ejecucion && automatico);
    $('parar').disabled = !ejecucion;
    $('copiar').disabled = Boolean(ejecucion);
    editor.bloquear(Boolean(ejecucion));
  }

  function mostrarMapa() {
    dibujar(ctx, mundo.estado);
    $('variante').textContent = 'Mapa ' + (variante + 1) + ' de ' + nivel.variantes.length;
    if (demo === 'granja') {
      const variables = Object.entries(ejecucion?.variables || {});
      $('datos').textContent = variables.length
        ? variables.map(([n, v]) => n + ' = ' + (typeof v === 'boolean' ? (v ? 'True' : 'False') : v)).join(' · ')
        : 'Todavía no hay variables.';
    }
  }

  function mensaje(texto) {
    $('mensaje').textContent = personaje + ' · ' + texto;
  }

  function detener() {
    clearTimeout(temporizador);
    automatico = false;
    ejecucion = null;
    botones();
  }

  function reiniciar() {
    detener();
    variante = 0;
    mundo = crear(nivel.variantes[0]);
    editor.destacar(0);
    mostrarMapa();
    mensaje('Mapa listo.');
  }

  function libreta() {
    $('libreta-titulo').textContent = demo === 'mago' ? 'Libro de hechizos' : 'Libreta';
    $('ordenes').replaceChildren();
    for (const orden of nivel.ordenes) {
      const nombre = document.createElement('dt');
      const detalle = document.createElement('dd');
      nombre.textContent = orden.nombre + '(' + (orden.parametro || '') + ')';
      detalle.textContent = orden.descripcion;
      $('ordenes').append(nombre, detalle);
    }
    $('ejemplo').textContent = nivel.ejemplo;
  }

  function selector() {
    detener();
    $('partida').hidden = true;
    $('selector').hidden = false;
    $('encabezado-nivel').textContent = 'Selección de nivel';
    $('niveles').replaceChildren();
    for (const ficha of niveles) {
      const boton = document.createElement('button');
      const cantidad = Progreso.estrellas(demo, ficha.id);
      boton.textContent = ficha.id + ' · ' + ficha.titulo + ' / ' + ficha.etiqueta + ' · ' + estrella(cantidad);
      boton.addEventListener('click', () => abrir(ficha));
      $('niveles').append(boton);
    }
    $('niveles').firstElementChild.focus();
  }

  function abrir(ficha) {
    nivel = ficha;
    $('selector').hidden = true;
    $('partida').hidden = false;
    $('encabezado-nivel').textContent = 'Nivel ' + ficha.id + ' de 5 · ' + ficha.etiqueta;
    $('titulo-nivel').textContent = ficha.titulo;
    $('estrellas').textContent = estrella(Progreso.estrellas(demo, ficha.id));
    $('mapas-info').textContent = ficha.variantes.length > 1
      ? 'Tu programa tiene que funcionar en los ' + ficha.variantes.length + ' mapas.' : '';
    editor.configurar(ficha, Progreso.codigo(demo, ficha.id) ?? ficha.codigoInicial ?? '');
    libreta();
    reiniciar();
    dialogo(ficha.titulo, [...ficha.intro, $('mapas-info').textContent].filter(Boolean), [['¡Vamos!', () => $('codigo').focus()]]);
  }

  function dialogo(titulo, frases, acciones) {
    $('dialogo-titulo').textContent = titulo;
    Pixel.retrato($('retrato-dialogo'), demo);
    $('dialogo-texto').replaceChildren(...frases.map(frase => {
      const parrafo = document.createElement('p');
      parrafo.textContent = frase;
      return parrafo;
    }));
    $('dialogo-acciones').replaceChildren(...acciones.map(([etiqueta, proximo]) => {
      const boton = document.createElement('button');
      boton.textContent = etiqueta;
      boton.addEventListener('click', () => {
        $('dialogo').close();
        proximo();
      });
      return boton;
    }));
    $('dialogo').showModal();
  }

  function fallo(texto, linea = 0) {
    detener();
    Sonido.tocar('choque');
    if (linea) editor.destacar(linea, texto);
    mensaje(texto);
  }

  function preparar() {
    const texto = editor.texto();
    const cantidad = Python.contarLineas(texto);
    if (!cantidad) return fallo('Escribe alguna orden antes de ejecutar.');
    if (nivel.maxLineas && cantidad > nivel.maxLineas) return fallo('Este nivel admite ' + nivel.maxLineas + ' líneas.');
    try {
      programa = Python.traducir(texto, Lecciones.opciones(nivel.ordenes));
    } catch (error) {
      return fallo(error.message, error.linea);
    }
    if (nivel.requiereConcepto && !Motor.usaConcepto(programa, nivel.concepto)) {
      return fallo('Define una función con def y llámala para repetir la rutina.');
    }
    variante = 0;
    editor.destacar(0);
    mensaje('Ejecutando el programa.');
    nuevaVariante();
    return true;
  }

  function nuevaVariante() {
    mundo = crear(nivel.variantes[variante]);
    ejecucion = Motor.crearEjecucion(programa, mundo);
    mostrarMapa();
    botones();
  }

  function avanzar() {
    const paso = ejecucion.paso();
    mostrarMapa();
    if (paso.error) return fallo(paso.error, paso.instr?.linea);
    if (paso.instr) {
      editor.destacar(paso.instr.linea);
      Sonido.tocar(['picar', 'lanzar_fuego', 'abrir', 'cosechar', 'vender'].includes(paso.instr.nombre) ? 'recoger' : 'paso');
    }
    if (paso.hecho) {
      if (!mundo.ganado()) return fallo('El programa terminó y el objetivo sigue pendiente en el mapa ' + (variante + 1) + '.');
      if (variante + 1 === nivel.variantes.length) return victoria();
      variante++;
      nuevaVariante();
      mensaje('Objetivo cumplido. Probamos el mapa ' + (variante + 1) + '.');
    }
    if (automatico) temporizador = setTimeout(avanzar, Number($('velocidad').value));
  }

  function victoria() {
    detener();
    const concepto = nivel.concepto === 'secuencia' || Motor.usaConcepto(programa, nivel.concepto);
    const cantidad = !concepto ? 1 : Python.contarLineas(editor.texto()) <= nivel.estrellas3 ? 3 : 2;
    Progreso.guardarEstrellas(demo, nivel.id, cantidad);
    $('estrellas').textContent = estrella(Progreso.estrellas(demo, nivel.id));
    Sonido.tocar('victoria');
    mensaje('Objetivo cumplido en todos los mapas.');
    const siguiente = niveles[nivel.id];
    const frases = [estrella(cantidad), concepto ? nivel.logro : 'Objetivo cumplido. Prueba a usar el concepto de este nivel para mejorar tu marca.', nivel.pythonReal];
    if (!siguiente) frases.push('Estrellas de la demo: ' + Progreso.total(demo) + ' / 15.');
    dialogo(siguiente ? 'Nivel superado' : 'Final de la demo', frases, [
      siguiente ? ['Siguiente nivel', () => abrir(siguiente)] : ['Ver niveles', selector],
      ['Volver a intentar', () => { reiniciar(); $('codigo').focus(); }]
    ]);
  }

  function correr(auto) {
    Sonido.activar();
    if (!ejecucion && !preparar()) return;
    automatico = auto;
    botones();
    avanzar();
    if (ejecucion && auto) $('parar').focus();
  }

  function sonido() {
    const silencio = Progreso.silencio();
    $('sonido').textContent = silencio ? 'Activar sonido' : 'Silenciar';
  }

  function conectarControles() {
    $('ejecutar').addEventListener('click', () => correr(true));
    $('paso').addEventListener('click', () => correr(false));
    $('parar').addEventListener('click', () => { detener(); mensaje('Ejecución detenida.'); $('ejecutar').focus(); });
    $('reiniciar').addEventListener('click', reiniciar);
    $('pista').addEventListener('click', () => mensaje(nivel.pista));
    $('copiar').addEventListener('click', () => editor.copiar(nivel.ejemplo));
    $('volver-niveles').addEventListener('click', selector);
    $('sonido').addEventListener('click', () => {
      Progreso.guardarSilencio(!Progreso.silencio());
      Sonido.activar();
      sonido();
    });
  }

  const NivelUI = { iniciar };
  if (typeof window !== 'undefined') (window.CR ||= {}).NivelUI = NivelUI;
  if (typeof module !== 'undefined') module.exports = NivelUI;
})();
