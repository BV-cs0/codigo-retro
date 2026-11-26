(function (CR) {
  'use strict';
  const traducir = typeof module !== 'undefined' ? require('../comun/idioma').t : globalThis.CR.t;
  const { $, nodo, chuleta, mapa, objetivos, capitulos, pestanas } = CR.PanelesFaro;
  const { Bash } = CR.Shell;
  const Misiones = CR.Idioma.contenido('terminal');
  const { ProgresoFaro: progreso, Sonido, SpritesFaro } = CR;
  const misiones = Misiones.capitulos.flatMap(c => c.misiones);
  const input = $('linea');
  const salida = $('salida');
  const pantalla = $('pantalla');
  const dialogo = $('victoria');
  let sesion, mision, intentos, completada, pregunta, oculta = false;
  function ocultar(valor) {
    oculta = valor;
    input.type = valor ? 'password' : 'text';
  }
  const desplazar = () => { pantalla.scrollTop = pantalla.scrollHeight; };
  const limpiar = () => salida.replaceChildren();
  function prompt(destino) {
    if (pregunta !== null) { destino.textContent = pregunta; return; }
    const home = sesion.vars.HOME;
    const ruta = sesion.cwd === home || sesion.cwd.startsWith(home + '/') ? '~' + sesion.cwd.slice(home.length) : sesion.cwd;
    destino.replaceChildren(nodo('span', sesion.identidad.usuario + '@' + sesion.identidad.maquina, 'usuario'), nodo('span', ':'),
      nodo('span', ruta, 'ruta'), nodo('span', '$'));
  }
  function escribir(eventos) {
    const fragmento = document.createDocumentFragment();
    for (const { texto, estilo } of eventos) {
      if (estilo === 'limpiar') { limpiar(); fragmento.replaceChildren(); }
      else fragmento.append(estilo ? nodo('span', texto, estilo) : document.createTextNode(texto));
    }
    salida.append(fragmento);
  }
  function aprendidos(incluirActual) {
    const lista = misiones.filter(m => progreso.hecha(m.id) || (incluirActual && m === mision));
    return [...new Set(lista.flatMap(m => m.comandos))];
  }
  function iniciar(actual) {
    mision = actual;
    sesion = Bash.sesionTerminal({ ...actual, idioma: CR.Idioma.actual(), mision: actual });
    progreso.abrir(actual.id);
    pregunta = null;
    ocultar(false);
    completada = false;
    intentos = 0;
    input.value = '';
    teclado.reset();
    limpiar();
    const [c, i] = actual.id.split('-').map(Number);
    const capitulo = Misiones.capitulos[c - 1];
    $('numero-mision').textContent = capitulo.titulo + ' · ' + i + ' / ' + capitulo.misiones.length;
    $('titulo-mision').textContent = actual.titulo;
    $('texto-mision').textContent = "Lumen: " + actual.texto;
    $('aviso-simulacion').hidden = capitulo.temporada !== 2;
    $('texto-pista').textContent = '';
    $('pista').disabled = false;
    prompt($('prompt'));
    objetivos(actual, sesion);
    mapa(sesion);
    chuleta([...new Set([...aprendidos(true), 'base64', 'xxd', 'md5sum', 'sha256sum', 'curl', 'find', 'ls',
      'sudo', CR.Idioma.actual() === 'en' ? 'submit' : 'enviar'])], $('chuleta'));
    input.focus();
  }
  function victoria() {
    completada = true;
    const antes = aprendidos(false);
    progreso.completar(mision.id);
    Sonido.tocar('victoria');
    const nuevas = mision.comandos.filter(c => !antes.includes(c));
    const siguiente = misiones[misiones.indexOf(mision) + 1];
    $('torre').hidden = Boolean(siguiente);
    $('titulo-victoria').textContent = siguiente ? traducir("terminal.mision_cumplida_2") : traducir("terminal.faro_7_encendido_2");
    $('cierre').textContent = "Lumen: " + mision.cierre;
    $('aprendido').replaceChildren();
    if (!siguiente) $('aprendido').append(nodo('p', traducir("terminal.has_aprendido") + aprendidos(false).length + traducir("terminal.comandos")));
    chuleta(nuevas.length ? nuevas : mision.comandos, $('aprendido').appendChild(nodo('div')));
    $('siguiente').textContent = siguiente ? traducir("terminal.siguiente_mision_2") : traducir("terminal.ver_capitulos");
    if (!siguiente) SpritesFaro.encendido($('torre'), 0);
    dialogo.showModal();
    $('siguiente').focus();
  }
  function enviar(e) {
    e.preventDefault();
    Sonido.activar();
    const linea = input.value;
    const eco = nodo('div');
    const etiqueta = nodo('span');
    prompt(etiqueta);
    eco.append(etiqueta, document.createTextNode(oculta ? '' : ' ' + linea));
    salida.append(eco);
    sesion.columnas = Math.max(16, Math.floor((pantalla.clientWidth - 28) / (parseFloat(getComputedStyle(input).fontSize) * .6)));
    const resultado = sesion.ejecutar(linea);
    escribir(resultado.eventos);
    if (resultado.aviso) escribir([{ texto: "Lumen: " + resultado.aviso + '\n', estilo: 'guia' }]);
    pregunta = resultado.pregunta ?? null;
    ocultar(Boolean(resultado.oculta));
    input.value = '';
    teclado.reset();
    prompt($('prompt'));
    mapa(sesion);
    const lista = objetivos(mision, sesion);
    desplazar();
    if (lista && !completada && pregunta === null && !resultado.aviso) victoria();
  }
  function navegar() {
    if (dialogo.open) dialogo.close();
    const indice = location.hash === '#capitulos';
    $('capitulos').hidden = !indice;
    $('guardia').hidden = indice;
    $('enlace-capitulos').href = indice ? '#mision-' + (mision?.id || progreso.ultima() || '1-1') : '#capitulos';
    $('enlace-capitulos').textContent = indice ? traducir("terminal.volver_a_la_terminal_2") : traducir("terminal.capitulos_2");
    if (indice) { capitulos(misiones.length); return; }
    const id = location.hash.startsWith('#mision-') ? location.hash.slice(8) : progreso.ultima();
    const actual = misiones.find(m => m.id === id) || misiones[0];
    if (actual !== mision) iniciar(actual);
    else input.focus();
  }
  const teclado = CR.TecladoFaro.conectar(input, () => sesion, {
    limpiar,
    cancelar() {
      const eco = nodo('div');
      prompt(eco);
      eco.append(document.createTextNode(' ' + input.value + '^C'));
      salida.append(eco);
      sesion.cancelar();
      pregunta = null;
      ocultar(false);
      prompt($('prompt'));
      desplazar();
    },
    listar(lista) { escribir([{ texto: lista.join('  ') + '\n' }]); desplazar(); }
  });
  $('orden').addEventListener('submit', enviar);
  $('reiniciar').addEventListener('click', () => iniciar(mision));
  $('pista').addEventListener('click', () => {
    $('texto-pista').textContent = mision.pistas[intentos++];
    $('pista').disabled = intentos >= mision.pistas.length;
  });
  $('siguiente').addEventListener('click', () => {
    const siguiente = misiones[misiones.indexOf(mision) + 1];
    dialogo.close();
    location.hash = siguiente ? 'mision-' + siguiente.id : 'capitulos';
  });
  dialogo.addEventListener('close', () => { if (!$('guardia').hidden) input.focus(); });
  const fosforo = $('fosforo');
  function cambiarFosforo() { document.querySelector('.crt').dataset.fosforo = fosforo.value; }
  fosforo.value = progreso.fosforo();
  cambiarFosforo();
  fosforo.addEventListener('change', () => { progreso.cambiarFosforo(fosforo.value); cambiarFosforo(); });
  const audio = $('sonido-faro');
  function actualizarSonido() { audio.setAttribute('aria-pressed', String(CR.Progreso.silencio())); }
  actualizarSonido();
  audio.addEventListener('click', () => { CR.Progreso.guardarSilencio(!CR.Progreso.silencio()); actualizarSonido(); });
  SpritesFaro.animar(cuadro => {
    SpritesFaro.retrato($('lumen'), cuadro);
    if (!$('torre').hidden) SpritesFaro.encendido($('torre'), cuadro);
  });
  pestanas();
  window.addEventListener('hashchange', navegar);
  navegar();
})(globalThis.CR);
