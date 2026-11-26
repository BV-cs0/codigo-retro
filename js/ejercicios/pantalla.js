(function () {
  'use strict';
  const traducir = typeof module !== 'undefined' ? require('../comun/idioma').t : globalThis.CR.t;
  window.CR.Idioma.registrar('es', 'ejercicios', window.CR.Ejercicios);
  window.CR.Idioma.registrar('en', 'ejercicios', window.CR.EjerciciosEn);
  const Ejercicios = window.CR.Idioma.contenido('ejercicios');
  const { Editor, ProgresoTaller: P, ValidarTaller, OrdenarTaller, EjecucionTaller, Sonido, Progreso } = window.CR;
  const $ = id => document.getElementById(id);
  const nodo = (tipo, texto) => Object.assign(document.createElement(tipo), { textContent: texto });
  const boton = (texto, accion) => Object.assign(nodo('button', texto), { type: 'button', onclick: accion });
  const temas = {
    primeros: traducir("ejercicios.primeros_pasos"), variables: traducir("comun.variables"), condiciones: traducir("comun.condiciones"), bucles: traducir("comun.bucles"),
    listas: traducir("ejercicios.listas"), funciones: traducir("comun.funciones"), textos: traducir("ejercicios.textos"), diccionarios: traducir("ejercicios.diccionarios"), errores: traducir("ejercicios.errores"),
    entrada: traducir("ejercicios.input_y_modulos"), proyecto: traducir("ejercicios.proyecto_final_adivina_el_numero"), retos: traducir("ejercicios.retos_finales"), bash: traducir("ejercicios.scripting_con_bash")
  };
  const tipos = { crea: traducir("ejercicios.crea"), disena: traducir("ejercicios.disena"), completa: traducir("ejercicios.completa"), ordena: traducir("ejercicios.ordena"), arregla: traducir("ejercicios.arregla") };
  const dificultad = n => '★'.repeat(n) + ' ' + [traducir("ejercicios.facil"), traducir("ejercicios.media"), traducir("ejercicios.dificil")][n - 1];
  let ficha, lineas, pistas;
  const editor = Editor.crear({ entrada: $('codigo'), espejo: $('espejo'), numeros: $('numeros'),
    contador: $('contador'), error: $('error') }, texto => {
    if (ficha && ficha.tipo !== 'ordena') P.guardar(ficha.id, { codigo: texto });
  });
  const ejecucion = EjecucionTaller.crear(editor, activo => {
    $('parar').disabled = !activo;
    for (const id of ['ejecutar', 'comprobar', 'solucion']) $(id).disabled = activo;
    editor.bloquear(activo);
  });
  function opcion(id, valor, texto) {
    $(id).append(Object.assign(nodo('option', texto), { value: valor }));
  }
  function estadisticas() {
    $('total-taller').textContent = P.total() + ' / ' + Ejercicios.length + traducir("ejercicios.resueltos_2");
    $('barras-taller').replaceChildren(...[1, 2, 3].map(n => {
      const grupo = Ejercicios.filter(e => e.dificultad === n);
      const hechos = grupo.filter(e => P.estado(e.id).resuelto).length;
      const barra = Object.assign(nodo('progress', ''), { max: grupo.length, value: hechos });
      const etiqueta = nodo('label', dificultad(n) + ' · ' + hechos + ' / ' + grupo.length);
      etiqueta.append(barra);
      return etiqueta;
    }));
  }
  function pendientes() { return Ejercicios.filter(e => !P.estado(e.id).resuelto); }
  function coincide(e) {
    const tema = $('filtro-tema').value, nivel = $('filtro-dificultad').value, estado = $('filtro-estado').value;
    const lenguaje = $('filtro-lenguaje').value;
    if (lenguaje && lenguaje !== (e.lenguaje || 'python')) return false;
    return (!tema || e.tema === tema) && (!nivel || e.dificultad === Number(nivel)) &&
      (!estado || Boolean(P.estado(e.id).resuelto) === (estado === 'resuelto'));
  }
  function tarjeta(e) {
    const { resuelto } = P.estado(e.id);
    const b = boton('', () => abrir(e));
    b.className = 'cartucho' + (resuelto ? ' ' + resuelto : '');
    b.append(nodo('span', tipos[e.tipo]), nodo('strong', e.titulo), nodo('span', dificultad(e.dificultad)));
    if (resuelto) b.append(nodo('span', resuelto === 'ayudado' ? traducir("ejercicios.resuelto_con_ayuda") : traducir("ejercicios.resuelto")));
    return b;
  }
  function lista(enfocar = true) {
    ejecucion.limpiar();
    ficha = null;
    $('lista-taller').hidden = false;
    $('detalle-taller').hidden = $('volver').hidden = true;
    estadisticas();
    const fichas = Ejercicios.filter(coincide).map(tarjeta);
    $('fichas-taller').replaceChildren(...fichas);
    $('sin-fichas').hidden = Boolean(fichas.length);
    $('azar').disabled = !pendientes().length;
    if (enfocar) $('titulo-lista').focus();
  }
  function abrir(e) {
    ejecucion.limpiar();
    ficha = e;
    pistas = 0;
    const estado = P.estado(e.id);
    const ordena = e.tipo === 'ordena';
    $('lista-taller').hidden = true;
    $('detalle-taller').hidden = $('volver').hidden = false;
    $('zona-texto').hidden = ordena;
    $('zona-orden').hidden = !ordena;
    $('titulo-ejercicio').textContent = e.titulo;
    $('etiqueta-ejercicio').textContent = temas[e.tema] + ' · ' + tipos[e.tipo] + ' · ' + dificultad(e.dificultad);
    $('enunciado').replaceChildren(...e.enunciado.map(p => nodo('p', p)));
    const ejemplo = e.ejemplo ?? (e.lenguaje === 'bash' ?
      [e.args && traducir("ejercicios.argumentos") + JSON.stringify(e.args), e.entradas && traducir("ejercicios.entradas") + JSON.stringify(e.entradas),
        e.fs && traducir("ejercicios.archivos") + Object.keys(e.fs).join(', ')].filter(Boolean).join('\n') : '');
    $('ejemplo').textContent = ejemplo;
    $('ejemplo').hidden = !ejemplo;
    $('ayuda').textContent = '';
    $('pista').disabled = false;
    $('solucion').hidden = (estado.fallos || 0) < 3;
    $('veredicto').hidden = $('siguiente-ejercicio').hidden = true;
    if (ordena) {
      lineas = estado.lineas || OrdenarTaller.crear(e);
      mostrarOrden();
    } else editor.configurar(configuracion(e), estado.codigo ?? e.codigo);
    $('titulo-ejercicio').focus();
  }
  function configuracion(e) {
    const bash = e.lenguaje === 'bash';
    return { curso: true, lenguaje: e.lenguaje, ordenes: bash ? window.CR.Shell.Ejecutor.comandos
      .concat('read', 'printf', 'test', 'exit', 'shift', 'export').map(nombre => ({ nombre })) : [] };
  }
  function cambiarOrden(id, accion, control) {
    OrdenarTaller.mover(lineas, id, accion);
    P.guardar(ficha.id, { lineas });
    mostrarOrden();
    $('lineas-orden').querySelector('[data-id="' + id + '"] ' + (control ? '[data-accion="' + control + '"]' : 'code')).focus();
  }
  const direcciones = {
    arriba: traducir("ejercicios.arriba"),
    abajo: traducir("ejercicios.abajo"),
    izquierda: traducir("ejercicios.izquierda"),
    derecha: traducir("ejercicios.derecha")
  };
  function filaOrden(l, i) {
    const li = nodo('li', '');
    li.dataset.id = l.id;
    li.classList.toggle('descartada', l.descartada);
    const codigo = Object.assign(nodo('code', l.texto), { tabIndex: 0 });
    codigo.style.paddingInlineStart = l.nivel * 1.25 + 'ch';
    codigo.onkeydown = e => {
      const acciones = e.shiftKey ? { ArrowUp: 'izquierda', ArrowDown: 'derecha', ArrowLeft: 'izquierda', ArrowRight: 'derecha' } :
        { ArrowUp: 'arriba', ArrowDown: 'abajo', ArrowLeft: 'izquierda', ArrowRight: 'derecha' };
      if (!acciones[e.key]) return;
      e.preventDefault();
      cambiarOrden(l.id, acciones[e.key]);
    };
    const controles = Object.assign(nodo('div', ''), { className: 'controles' });
    const acciones = [['▲', 'arriba'], ['▼', 'abajo'], ['◀', 'izquierda'], ['▶', 'derecha']];
    if (ficha.trampa) acciones.push([l.descartada ? traducir("ejercicios.restaurar") : traducir("ejercicios.descartar"), 'descartar']);
    for (const [icono, accion] of acciones) {
      const b = boton(icono, () => cambiarOrden(l.id, accion, accion));
      b.dataset.accion = accion;
      b.setAttribute('aria-label', (accion === 'descartar' ? icono : traducir("ejercicios.mover") + direcciones[accion]) + traducir("ejercicios.linea") + (i + 1));
      controles.append(b);
    }
    li.append(codigo, controles);
    return li;
  }
  function mostrarOrden() { $('lineas-orden').replaceChildren(...lineas.map(filaOrden)); }
  function codigoActual() { return ficha.tipo === 'ordena' ? OrdenarTaller.montar(lineas) : editor.texto(); }
  function mostrarVeredicto(r) {
    $('veredicto').hidden = false;
    $('veredicto').className = r.ok ? 'correcto' : 'incorrecto';
    $('titular-veredicto').textContent = r.ok ? traducir("ejercicios.correcto") : traducir("ejercicios.todavia_no");
    $('comprobaciones').replaceChildren(...r.checks.map(c => {
      return Object.assign(nodo('li', (c.ok ? '✔ ' : '✘ ') + c.texto), { className: c.ok ? 'correcto' : 'incorrecto' });
    }));
    $('animo').hidden = !r.ok;
    $('alternativa').hidden = !r.ok || !ficha.alternativa;
    $('alternativa').open = false;
    $('codigo-alternativo').textContent = ficha.alternativa || '';
    const siguiente = Ejercicios.slice(Ejercicios.indexOf(ficha) + 1).find(e => e.tema === ficha.tema);
    $('siguiente-ejercicio').hidden = !r.ok || !siguiente;
    $('siguiente-ejercicio').onclick = () => abrir(siguiente);
  }
  function comprobar() {
    Sonido.activar();
    const r = (ficha.lenguaje === 'bash' ? window.CR.ValidarBash : ValidarTaller).comprobar(ficha, codigoActual());
    const estado = P.estado(ficha.id);
    if (r.ok) {
      P.guardar(ficha.id, { resuelto: estado.resuelto || 'autonomo' });
      Sonido.tocar('victoria');
    } else {
      const fallos = (estado.fallos || 0) + 1;
      P.guardar(ficha.id, { fallos });
      $('solucion').hidden = fallos < 3;
    }
    mostrarVeredicto(r);
  }
  function solucionar() {
    if ($('solucion').hidden || !confirm(traducir("ejercicios.seguro_aprenderas_mas_si_lo"))) return;
    const resuelto = 'ayudado';
    if (ficha.tipo === 'ordena') {
      lineas = ficha.codigo.split('\n').map((texto, id) => ({
        texto: texto.trim(), id, nivel: (texto.length - texto.trimStart().length) / 4, descartada: false
      }));
      if (ficha.trampa) lineas.push({ texto: ficha.trampa, id: lineas.length, nivel: 0, descartada: true });
      P.guardar(ficha.id, { lineas, resuelto });
      mostrarOrden();
    } else {
      editor.configurar(configuracion(ficha), ficha.solucion);
      P.guardar(ficha.id, { codigo: ficha.solucion, resuelto });
    }
    $('ayuda').textContent = traducir("ejercicios.solucion_mostrada");
  }
  function sonido() { $('sonido').textContent = Progreso.silencio() ? traducir("comun.activar_sonido") : traducir("comun.silenciar"); }
  $('sonido').onclick = () => {
    Progreso.guardarSilencio(!Progreso.silencio());
    Sonido.activar();
    sonido();
  };
  $('pista').onclick = () => {
    $('ayuda').textContent = ficha.pistas[pistas++];
    $('pista').disabled = pistas === ficha.pistas.length;
  };
  $('azar').onclick = () => {
    const grupo = pendientes();
    if (grupo.length) abrir(grupo[Math.floor(Math.random() * grupo.length)]);
  };
  $('solucion').onclick = solucionar;
  $('ejecutar').onclick = () => ejecucion.ejecutar(codigoActual(), ficha);
  $('parar').onclick = () => { ejecucion.detener(); $('ejecutar').focus(); };
  $('comprobar').onclick = comprobar;
  $('volver').onclick = () => lista();
  for (const [id, tema] of Object.entries(temas)) opcion('filtro-tema', id, tema);
  for (const n of [1, 2, 3]) opcion('filtro-dificultad', n, dificultad(n));
  for (const id of ['filtro-tema', 'filtro-dificultad', 'filtro-estado', 'filtro-lenguaje']) $(id).onchange = () => lista(false);
  if (location.hash === '#bash') $('filtro-lenguaje').value = 'bash';
  editor.configurar({ curso: true, ordenes: [] }, '');
  lista(false);
  sonido();
})();
