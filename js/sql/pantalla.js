(function (CR) {
  'use strict';
  const { $, nodo, boton, t, tabla, tablas, mostrar, texto } = CR.VistasSQL;
  const P = CR.ProgresoSQL, V = CR.ValidarSQL, temas = P.temas();
  const granja = CR.Idioma.contenido('sqlGranja');
  const campo = CR.Idioma.actual() === 'es' ? 'codigo' : 'codigoEn';
  let tema, ficha, indice, bd, campos, traza, etapa, pistas;
  const editor = CR.Editor.crear({ entrada: $('codigo'), espejo: $('espejo'), numeros: $('numeros'),
    contador: $('contador'), error: $('error') }, codigo => {
    P.guardar(ficha.id, { [campo]: codigo });
    cerrarTraza();
  });
  const reto = () => ['reto', 'arregla'].includes(ficha.tipo);
  const esForm = () => ficha.tipo === 'formulario';
  const inicial = () => ficha.bd || granja;
  const ajustar = codigo => editor.configurar({ lenguaje: 'sql', ordenes: [] }, codigo);
  const botones = (id, ocultar) => { $(id).hidden = ocultar; };
  function progreso() {
    const hecho = P.estado(ficha.id).hecho;
    $('anterior').disabled = indice === 0;
    $('siguiente').disabled = !hecho;
    botones('saltar', Boolean(hecho));
    $('puntos').replaceChildren(...tema.pasos.map((paso, i) => {
      const b = boton(String(i + 1), () => abrir(tema, i));
      b.setAttribute('aria-label', paso.titulo);
      if (i === indice) b.setAttribute('aria-current', 'step');
      if (P.estado(paso.id).hecho) b.className = 'completo';
      return b;
    }));
  }
  function completar() {
    P.guardar(ficha.id, { hecho: true });
    progreso();
  }
  function cerrarTraza() {
    traza = [];
    botones('traza', true);
    editor.destacar(0);
  }
  function portada() {
    if (ficha) cerrarTraza();
    botones('indice', false);
    botones('paso-curso', true);
    botones('temas', true);
    $('continuar').disabled = !P.pasos().length;
    $('cartuchos').replaceChildren(...temas.map(tm => {
      const b = boton('', () => abrir(tm, 0));
      b.className = 'cartucho';
      b.disabled = !tm.pasos.length;
      const hechas = P.hechos(tm.pasos);
      b.append(nodo('strong', tm.titulo));
      if (tm.pasos.length) {
        const p = Object.assign(nodo('progress'), { max: tm.pasos.length, value: hechas });
        p.setAttribute('aria-label', tm.titulo);
        b.append(p);
      }
      b.append(nodo('span', t('progreso', { n: hechas, total: tm.pasos.length })));
      return b;
    }));
  }
  function restaurarDatos() {
    bd = CR.SQL.crear(inicial());
    tablas(bd.tablas(true));
    mostrar({ error: null, resultados: [], consejos: [] });
    if (esForm()) prepararFormulario();
    cerrarTraza();
  }
  function formatoParametros(parametros) {
    return parametros.map(p => p?.tipo === 'real' ? CR.sqlInterno.comoTexto(CR.sqlInterno.real(p.valor)) : JSON.stringify(p)).join(', ');
  }
  function prepararFormulario() {
    campos = new Map(ficha.campos.map(c => {
      const label = nodo('label', c.etiqueta), entrada = nodo('input');
      entrada.name = c.nombre;
      entrada.autocomplete = 'off';
      label.append(entrada);
      return [c.nombre, { label, entrada }];
    }));
    $('campos').replaceChildren(...[...campos.values()].map(c => c.label));
    const r = V.formulario(ficha, {}, inicial());
    mostrarConsulta(r);
    mostrar(r.resultado, $('salida-form'));
    $('mensaje-form').textContent = '';
  }
  function mostrarConsulta(r) {
    $('consulta-final').textContent = r.sql + (esForm() && ficha.modo === 'parametros'
      ? '\n' + t('parametros') + ' · ' + formatoParametros(r.parametros) : '');
  }
  function enviar(evento) {
    evento.preventDefault();
    const valores = Object.fromEntries([...campos].map(([k, c]) => [k, c.entrada.value]));
    const r = V.formulario(ficha, valores, inicial());
    mostrarConsulta(r);
    $('mensaje-form').textContent = r.mensaje;
    mostrar(r.resultado, $('salida-form'));
    if (V.formularioCorrecto(ficha, r)) completar();
  }
  function prepararFicha() {
    const resumen = ficha.tipo === 'resumen', predice = ficha.tipo === 'predice';
    botones('resumen', !resumen);
    // En un formulario haces de visitante de una web: no ves la base de datos.
    botones('resultado', resumen || esForm());
    botones('zona-editor', resumen);
    botones('zona-codigo', esForm());
    botones('formulario', !esForm());
    botones('titulo-resultados', esForm());
    botones('zona-parametros', !ficha.parametros);
    botones('prediccion', !predice);
    botones('reto', !reto() && !esForm());
    botones('comprobar', !reto());
    botones('solucion', true);
    for (const id of ['ejecutar', 'paso', 'restaurar']) botones(id, predice);
    editor.bloquear(predice);
    $('parametros').value = formatoParametros(ficha.parametros || []);
    $('parametros').readOnly = predice;
    $('objetivo').textContent = ficha.objetivo || '';
    $('codigo-final').textContent = ficha.codigo || '';
    $('siguiente-tema').textContent = CR.t(temaSiguiente() ? 'curso.siguiente_tema' : 'bash.volver_a_los_temas');
    $('pregunta').textContent = ficha.pregunta || '';
    $('opciones').replaceChildren(...(ficha.opciones || []).map((o, i) => boton(o, () => predecir(i))));
  }
  const temaSiguiente = () => temas.slice(temas.indexOf(tema) + 1).find(tm => tm.pasos.length);
  function abrir(tm, i) {
    if (!tm.pasos[i]) return;
    tema = tm;
    indice = i;
    ficha = tm.pasos[i];
    pistas = 0;
    P.guardar('ultima', { t: temas.indexOf(tm), i });
    botones('indice', true);
    botones('paso-curso', false);
    botones('temas', false);
    $('posicion').textContent = t('posicion', { tema: tm.titulo, n: i + 1, total: tm.pasos.length });
    $('titulo-paso').textContent = ficha.titulo;
    $('texto').replaceChildren(...ficha.texto.map(texto));
    for (const id of ['respuesta', 'ayuda']) $(id).textContent = '';
    $('archivo').textContent = t('archivo');
    ajustar(P.estado(ficha.id)[campo] ?? ficha.codigo ?? '');
    prepararFicha();
    restaurarDatos();
    if (ficha.tipo === 'resumen') completar();
    else progreso();
    $('titulo-paso').focus();
  }
  function ejecutar(pasos = false) {
    cerrarTraza();
    const anterior = bd.tablas(true);
    const codigo = editor.texto();
    const parametros = V.leerParametros($('parametros').value);
    const r = (pasos ? bd.copia() : bd).ejecutar(codigo, parametros);
    mostrar(r);
    if (pasos) tablas(anterior);
    else tablas(bd.tablas(true), anterior);
    if (r.error) editor.destacar(r.error.linea, r.error.mensaje, false);
    const errorPrevisto = ficha.error && r.error?.mensaje === ficha.error;
    if ((!r.error || errorPrevisto) && ficha.tipo === 'explica') completar();
    if (pasos && r.pasos.length) {
      traza = r.pasos;
      etapa = 0;
      mostrarEtapa();
    }
  }
  function mostrarEtapa() {
    const paso = traza[etapa];
    if (!paso) return cerrarTraza();
    botones('traza', false);
    $('etapa').textContent = t(paso.total === 1 ? 'trazaUna' : 'trazaVarias', { etapa: paso.etapa, n: paso.total });
    $('intermedia').replaceChildren(tabla(paso));
    editor.destacarRango(paso.inicio, paso.fin);
    $('traza-siguiente').textContent = t(etapa + 1 < traza.length ? 'etapaSiguiente' : 'etapaFin');
  }
  function predecir(i) {
    const acierto = i === ficha.correcta;
    const explicacion = acierto && ficha.explicacion ? [texto(ficha.explicacion)] : [];
    $('respuesta').replaceChildren(nodo('p', t(acierto ? 'acierto' : 'reintento')), ...explicacion);
    if (acierto) {
      completar();
      ejecutar();
    }
  }
  function comprobar() {
    ejecutar();
    const fallo = V.comprobar(ficha, editor.texto(), inicial(), V.leerParametros($('parametros').value));
    if (!fallo) {
      $('ayuda').textContent = t('acierto');
      completar();
    } else {
      $('ayuda').textContent = fallo.error?.mensaje || t('validar_' + fallo.clave, fallo.datos);
      const intento = (P.estado(ficha.id).intento || 0) + 1;
      P.guardar(ficha.id, { intento });
      botones('solucion', intento < 2);
    }
  }
  function siguiente() {
    if (tema.pasos[indice + 1]) return abrir(tema, indice + 1);
    const nuevo = temaSiguiente();
    if (nuevo) abrir(nuevo, 0);
    else portada();
  }
  function continuar() {
    const ultima = P.estado('ultima');
    const tm = temas[ultima.t];
    if (tm?.pasos[ultima.i]) return abrir(tm, ultima.i);
    const primero = temas.find(t => t.pasos.length);
    if (primero) abrir(primero, 0);
  }
  function pista() {
    const lista = ficha.pistas || [];
    $('ayuda').textContent = lista[Math.min(pistas++, lista.length - 1)] || '';
    botones('solucion', !ficha.solucion || pistas < lista.length);
  }
  function solucion() {
    if (esForm()) for (const [k, c] of campos) c.entrada.value = ficha.solucion[k] ?? '';
    else { ajustar(ficha.solucion); P.guardar(ficha.id, { [campo]: ficha.solucion }); }
  }
  const acciones = {
    temas: portada, continuar, ejecutar: () => ejecutar(), paso: () => ejecutar(true),
    comprobar, pista, solucion, anterior: () => abrir(tema, indice - 1), siguiente,
    saltar: siguiente, 'siguiente-tema': siguiente, 'restaurar-datos': restaurarDatos,
    restaurar: () => { ajustar(ficha.codigo || ''); P.guardar(ficha.id, { [campo]: editor.texto() }); cerrarTraza(); },
    'traza-siguiente': () => { etapa++; mostrarEtapa(); }, 'traza-parar': cerrarTraza
  };
  for (const [id, accion] of Object.entries(acciones)) $(id).onclick = accion;
  $('formulario').addEventListener('submit', enviar);
  let cuadro = 0;
  const animar = () => CR.Pixel.retrato($('bina'), 'granja', cuadro++ % 2);
  animar();
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) setInterval(animar, 520);
  portada();
})(globalThis.CR);
