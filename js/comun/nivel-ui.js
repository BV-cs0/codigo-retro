(function () {
  'use strict';
  const traducir = typeof module !== 'undefined' ? require('./idioma').t : globalThis.CR.t;
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
    }, texto => Progreso.guardarCodigo(demo, nivel.id,
      window.CR.DemoIdioma.adaptarBorrador(texto, 'es', nivel.ordenes)));
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
    $('variante').textContent = traducir("comun.mapa") + (variante + 1) + traducir("comun.de") + nivel.variantes.length;
    if (demo === 'granja') {
      const variables = Object.entries(ejecucion?.variables || {});
      $('datos').textContent = variables.length
        ? variables.map(([n, v]) => n + ' = ' + (typeof v === 'boolean' ? (v ? 'True' : 'False') : v)).join(' · ')
        : traducir("comun.todavia_no_hay_variables");
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
    mensaje(traducir("comun.mapa_listo"));
  }

  function libreta() {
    $('libreta-titulo').textContent = demo === 'mago' ? traducir("comun.libro_de_hechizos") : traducir("comun.libreta");
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
    $('encabezado-nivel').textContent = traducir("comun.seleccion_de_nivel");
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
    $('encabezado-nivel').textContent = traducir("comun.nivel") + ficha.id + traducir("comun.de_5") + ficha.etiqueta;
    $('titulo-nivel').textContent = ficha.titulo;
    $('estrellas').textContent = estrella(Progreso.estrellas(demo, ficha.id));
    $('mapas-info').textContent = ficha.variantes.length > 1
      ? traducir("comun.tu_programa_tiene_que_funcionar") + ficha.variantes.length + traducir("comun.mapas") : '';
    const guardado = window.CR.DemoIdioma.adaptarBorrador(Progreso.codigo(demo, ficha.id), 'en', ficha.ordenes);
    editor.configurar(ficha, guardado ?? ficha.codigoInicial ?? '');
    libreta();
    reiniciar();
    dialogo(ficha.titulo, [...ficha.intro, $('mapas-info').textContent].filter(Boolean), [[traducir("comun.vamos"), () => $('codigo').focus()]]);
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
    if (!cantidad) return fallo(traducir("comun.escribe_alguna_orden_antes_de"));
    if (nivel.maxLineas && cantidad > nivel.maxLineas) return fallo(traducir("comun.este_nivel_admite") + nivel.maxLineas + traducir("comun.lineas_2"));
    try {
      programa = Python.traducir(texto, Lecciones.opciones(nivel.ordenes));
    } catch (error) {
      return fallo(error.message, error.linea);
    }
    if (nivel.requiereConcepto && !Motor.usaConcepto(programa, nivel.concepto)) {
      return fallo(traducir("comun.define_una_funcion_con_def"));
    }
    variante = 0;
    editor.destacar(0);
    mensaje(traducir("comun.ejecutando_el_programa"));
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
      const nombre = paso.instr.nombre;
      const orden = window.CR.DemoIdioma.espanol[nombre] ?? nombre;
      Sonido.tocar(['picar', 'lanzar_fuego', 'abrir', 'cosechar', 'vender'].includes(orden) ? 'recoger' : 'paso');
    }
    if (paso.hecho) {
      if (!mundo.ganado()) return fallo(traducir("comun.el_programa_termino_y_el") + (variante + 1) + '.');
      if (variante + 1 === nivel.variantes.length) return victoria();
      variante++;
      nuevaVariante();
      mensaje(traducir("comun.objetivo_cumplido_probamos_el_mapa") + (variante + 1) + '.');
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
    mensaje(traducir("comun.objetivo_cumplido_en_todos_los"));
    const siguiente = niveles[nivel.id];
    const frases = [estrella(cantidad), concepto ? nivel.logro : traducir("comun.objetivo_cumplido_prueba_a_usar"), nivel.pythonReal];
    if (!siguiente) frases.push(traducir("comun.estrellas_de_la_demo") + Progreso.total(demo) + ' / 15.');
    dialogo(siguiente ? traducir("comun.nivel_superado") : traducir("comun.final_de_la_demo"), frases, [
      siguiente ? [traducir("comun.siguiente_nivel"), () => abrir(siguiente)] : [traducir("comun.ver_niveles"), selector],
      [traducir("comun.volver_a_intentar"), () => { reiniciar(); $('codigo').focus(); }]
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
    $('sonido').textContent = silencio ? traducir("comun.activar_sonido") : traducir("comun.silenciar");
  }

  function conectarControles() {
    $('ejecutar').addEventListener('click', () => correr(true));
    $('paso').addEventListener('click', () => correr(false));
    $('parar').addEventListener('click', () => { detener(); mensaje(traducir("comun.ejecucion_detenida")); $('ejecutar').focus(); });
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
