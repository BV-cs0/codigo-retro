(function () {
  'use strict';
  const { Temas, ProgresoCurso: P, ValidarCurso: V, Py, Editor, MapaCurso, Sonido, Progreso } = window.CR;
  const $ = id => document.getElementById(id);
  const nodo = (tipo, texto) => Object.assign(document.createElement(tipo), { textContent: texto });
  const boton = (texto, accion) => Object.assign(nodo('button', texto), { onclick: accion });
  const acciones = ['reto', 'arregla', 'mundo'];
  let tema, paso, ficha, partida, programa, salida, intentos, pistas, respuesta, temporizador, automatico;
  let origen, esperando, historial;
  const editor = Editor.crear({ entrada: $('codigo'), espejo: $('espejo'), numeros: $('numeros'),
    contador: $('contador'), error: $('error') }, texto => {
    if (acciones.includes(ficha.tipo)) P.guardarCodigo(tema, paso, texto);
  });

  function parrafo(texto, tipo = 'p') {
    const elemento = nodo(tipo, '');
    texto.split('\x60').forEach((s, i) => elemento.append(i % 2 ? nodo('code', s) : s));
    return elemento;
  }
  function indice(enfocar = true) {
    detener();
    $('indice').hidden = false;
    $('final-curso').hidden = true;
    $('paso-curso').hidden = $('temas').hidden = true;
    $('cartuchos').replaceChildren(...Temas.map((t, i) => {
      const b = boton('', () => abrir(i, 0));
      const total = t.pasos.filter((_, j) => P.completo(i, j)).length;
      const barra = Object.assign(nodo('progress', ''), { value: total, max: t.pasos.length });
      barra.setAttribute('aria-label', 'Progreso de ' + t.nombre);
      b.className = t.proyecto ? 'cartucho dorado' : 'cartucho';
      b.append(nodo('strong', (i + 1) + ' · ' + t.nombre), nodo('span', t.frase), barra,
        nodo('span', total + ' / ' + t.pasos.length + ' pasos'), nodo('small', 'Necesitas: ' + t.necesita));
      return b;
    }));
    if (enfocar) $('continuar').focus();
  }
  function navegacion() {
    const { pasos } = Temas[tema];
    const completo = P.completo(tema, paso);
    $('anterior').disabled = paso === 0;
    $('siguiente').hidden = $('saltar').hidden = paso === pasos.length - 1;
    $('siguiente').disabled = !completo;
    $('puntos').replaceChildren(...pasos.map((p, i) => {
      const b = boton(String(i + 1), () => abrir(tema, i));
      const hecho = P.completo(tema, i);
      if (hecho) b.className = 'completo';
      if (i === paso) b.setAttribute('aria-current', 'step');
      b.setAttribute('aria-label', 'Paso ' + (i + 1) + ', ' + p.titulo + (hecho ? ', completado' : ''));
      return b;
    }));
  }
  function completar() {
    P.completar(tema, paso);
    navegacion();
  }
  function resumen() {
    $('chuleta').replaceChildren(...ficha.chuleta.flatMap(([c, t]) => [parrafo('\x60' + c + '\x60', 'dt'), nodo('dd', t)]));
    $('siguiente-tema').textContent = Temas[tema + 1] ? 'Siguiente tema → ' + Temas[tema + 1].nombre : 'Ver final del curso';
    $('codigo-final').hidden = !ficha.final;
    if (ficha.final) {
      $('codigo-final').textContent = ficha.final;
      $('codigo-jugador').textContent = origen;
    }
    $('tu-codigo').hidden = !ficha.final || origen === Temas[tema].pasos[paso - 1]?.solucion;
    completar();
  }
  function finalCurso() {
    $('paso-curso').hidden = true;
    $('final-curso').hidden = false;
    $('progreso-final').textContent = P.total() + ' / ' + P.cantidad + ' pasos completados.';
    const titulo = $('letras-final').getContext('2d');
    window.CR.Pixel.texto(titulo, 'FINAL DEL CURSO', 3, 3, 2, '#fff0a9');
    $('progreso-temas').replaceChildren(...Temas.map((t, i) => {
      const hechos = t.pasos.filter((_, j) => P.completo(i, j)).length;
      const li = nodo('li', '');
      const barra = Object.assign(nodo('progress', ''), { value: hechos, max: t.pasos.length });
      barra.setAttribute('aria-label', 'Progreso de ' + t.nombre);
      li.append(nodo('strong', t.nombre), barra, nodo('span', hechos + ' / ' + t.pasos.length + ' pasos'));
      return li;
    }));
    $('titulo-final').focus();
  }
  function prediccion() {
    $('prediccion').hidden = ficha.tipo !== 'predice';
    $('respuesta').textContent = '';
    $('pregunta').textContent = ficha.pregunta || '';
    $('opciones').replaceChildren(...(ficha.opciones || []).map((t, i) => boton(t, () => {
      respuesta = i;
      for (const b of $('opciones').children) b.disabled = true;
      iniciar(ficha.codigo, ficha.entradas || []);
      procesar(true);
    })));
  }
  function leccion() {
    $('texto').replaceChildren(...ficha.texto.map(t => parrafo(t)));
    $('recuerda').hidden = !ficha.recuerda;
    $('clave').replaceChildren(...(ficha.recuerda ? [...parrafo(ficha.recuerda).childNodes] : []));
    $('etiqueta').hidden = !ficha.etiqueta;
    $('etiqueta').textContent = ficha.etiqueta || '';
    $('reto').hidden = !acciones.includes(ficha.tipo);
    $('objetivo').replaceChildren(...[...parrafo(ficha.objetivo || '').childNodes]);
    $('solucion').hidden = true;
    $('solucion').disabled = false;
    $('ayuda').textContent = '';
    prediccion();
  }
  function abrir(t, i) {
    if (!Temas[t]?.pasos[i]) return abrir(0, 0);
    detener();
    tema = t;
    paso = i;
    ficha = Temas[t].pasos[i];
    intentos = pistas = 0;
    respuesta = null;
    P.visitar(t, i);
    $('indice').hidden = true;
    $('final-curso').hidden = true;
    $('paso-curso').hidden = $('temas').hidden = false;
    $('posicion').textContent = Temas[t].nombre + ' · Paso ' + (i + 1) + ' de ' + Temas[t].pasos.length;
    $('titulo-paso').textContent = ficha.titulo;
    const cerrar = ficha.tipo === 'resumen';
    $('resumen').hidden = !cerrar;
    $('zona-editor').hidden = $('resultado').hidden = cerrar;
    leccion();
    reiniciarVista();
    origen = codigoInicial(t, i);
    configurar(acciones.includes(ficha.tipo) ? P.codigo(t, i) ?? origen : origen);
    controles();
    if (cerrar) resumen();
    else navegacion();
    $('titulo-paso').focus();
  }
  function codigoInicial(t, i) {
    if (ficha.codigo !== 'anterior') return ficha.codigo;
    const anterior = Temas[t].pasos[i - 1];
    const guardado = P.codigo(t, i) == null ? undefined : P.inicio(t, i);
    const base = guardado ?? (P.completo(t, i - 1) ? P.aprobado(t, i - 1) : undefined) ??
      anterior.solucion ?? anterior.codigo;
    P.guardarInicio(t, i, base);
    return base;
  }
  function configurar(codigo) {
    editor.configurar({ curso: true, ordenes: Object.keys(partida?.integradas || {}).map(nombre => ({ nombre })) }, codigo);
  }
  function dibujar() {
    $('mapa').hidden = !partida;
    if (!partida) return;
    const mapas = { robot: 'Mapa de Pico en la mina', mago: 'Mapa de Brasa', granja: 'Mapa de Bina en la granja' };
    $('mapa').setAttribute('aria-label', mapas[ficha.mundo.demo]);
    MapaCurso($('mapa'), ficha.mundo.demo, partida.motor.estado);
  }
  function mostrar(estado) {
    $('salida').replaceChildren(...historial.map(({ texto, eco }) => eco ?
      Object.assign(nodo('span', texto), { className: 'eco-terminal' }) : document.createTextNode(texto)));
    $('variables').replaceChildren(...Object.entries(estado.variables).map(([n, v]) => {
      const fila = nodo('tr', '');
      const nombre = nodo('th', n);
      nombre.scope = 'row';
      fila.append(nombre, nodo('td', v));
      return fila;
    }));
    $('llamadas').replaceChildren(...estado.llamadas.map(l => nodo('li', l)));
    const terminal = $('salida').parentElement;
    terminal.scrollTop = terminal.scrollHeight;
    dibujar();
  }
  function reiniciarVista() {
    salida = '';
    historial = [];
    partida = V.mundo(ficha.mundo);
    $('estado').textContent = $('error-consola').textContent = '';
    $('error-original').textContent = '';
    $('casos').hidden = true;
    mostrar({ variables: {}, llamadas: ['programa principal'] });
  }
  function controles() {
    const pendiente = ficha?.tipo === 'predice' && respuesta === null;
    $('ejecutar').disabled = $('paso').disabled = Boolean(automatico || pendiente || esperando);
    $('comprobar').hidden = !ficha?.casos;
    $('comprobar').disabled = Boolean(programa);
    $('parar').disabled = !programa;
    $('restaurar').disabled = $('solucion').disabled = Boolean(programa);
    editor.bloquear(Boolean(programa) || pendiente);
  }
  function detener() {
    clearTimeout(temporizador);
    programa = null;
    automatico = false;
    esperar(false);
    controles();
  }
  function iniciar(codigo, entradas) {
    Sonido.activar();
    reiniciarVista();
    programa = Py.ejecutar(codigo, { integradas: partida?.integradas, entradas });
  }
  function terminar(estado) {
    const error = estado.error;
    if (error) {
      $('error-consola').textContent = error.tipo + ' (línea ' + error.linea + ')\n' + error.mensaje;
      $('error-original').textContent = error.tipo + ': ' + (error.original ?? error.mensaje);
      editor.destacar(error.linea, error.tipo);
      Sonido.tocar('choque');
    }
    if (ficha.tipo === 'predice' && respuesta !== null) {
      $('respuesta').replaceChildren(...parrafo((respuesta === ficha.correcta ? 'Correcto. ' : 'Casi. ') + ficha.explicacion).childNodes);
      completar();
    } else if (ficha.tipo === 'explica') {
      completar();
    } else if (acciones.includes(ficha.tipo) && !ficha.casos) {
      resultadoReto(V.evaluar(ficha, programa, { ...estado, salida }, partida));
    }
    detener();
  }
  function resultadoReto(mensaje) {
    $('estado').textContent = mensaje || 'Objetivo cumplido.';
    if (mensaje) {
      intentos++;
      $('solucion').hidden = intentos < 2;
    } else {
      if (Temas[tema].proyecto) P.guardarAprobado(tema, paso, editor.texto());
      completar();
      Sonido.tocar('victoria');
    }
  }
  function comprobar() {
    const resultado = V.comprobar(ficha, editor.texto());
    const representar = texto => texto === undefined ? 'Sin línea' : JSON.stringify(texto);
    $('filas-casos').replaceChildren(...resultado.filas.map(f => {
      const fila = nodo('tr', '');
      const detalle = nodo('td', f.mensaje || (f.ok ? 'Coincide' : ''));
      if (f.diferencia) {
        const diferencia = nodo('mark', 'Esperado ' + representar(f.esperada) + '\nObtenido ' + representar(f.obtenida));
        detalle.append(diferencia);
      }
      fila.append(nodo('td', f.ok ? '✓' : '✗'), nodo('td', f.entradas.map(representar).join(', ') || '—'), detalle);
      return fila;
    }));
    $('casos').hidden = false;
    resultadoReto(resultado.ok ? '' : 'Revisa los casos marcados con ✗.');
  }
  function esperar(activo) {
    esperando = activo;
    $('entrada-terminal').hidden = !activo;
    if (activo) {
      $('entrada').value = '';
      $('entrada').focus();
      const terminal = $('salida').parentElement;
      terminal.scrollTop = terminal.scrollHeight;
    }
  }
  function eco(texto) { historial.push({ texto: texto + '\n', eco: true }); }
  function anotar(texto) {
    if (!texto) return;
    const anterior = historial.at(-1);
    if (anterior && !anterior.eco) anterior.texto += texto;
    else historial.push({ texto });
  }
  function ciclo(entrada) {
    const demora = ficha.tipo === 'predice' && ficha.error === 'RuntimeError' ? 0 : Number($('velocidad').value);
    const lote = automatico && !demora ? 500 : 1;
    let estado;
    for (let i = 0; i < lote; i++) {
      estado = programa.paso(i === 0 ? entrada : undefined);
      salida += estado.salida;
      anotar(estado.salida);
      if (estado.eco !== undefined) eco(estado.eco);
      if (estado.hecho || estado.esperandoEntrada) break;
    }
    mostrar(estado);
    editor.destacar(estado.hecho ? 0 : estado.linea);
    if (estado.hecho) terminar(estado);
    else if (estado.esperandoEntrada) {
      esperar(true);
      controles();
    } else if (automatico) temporizador = setTimeout(ciclo, demora);
    else Sonido.tocar('paso');
  }
  function procesar(auto) {
    if (!programa) {
      iniciar(editor.texto());
      const inicio = programa.preparar();
      if (!auto && !inicio.hecho) {
        mostrar(inicio);
        editor.destacar(inicio.linea);
        controles();
        return;
      }
    }
    automatico = auto;
    controles();
    ciclo();
    if (programa && auto && !esperando) $('parar').focus();
  }
  $('temas').onclick = () => indice();
  $('continuar').onclick = () => abrir(...P.ultimo());
  $('anterior').onclick = () => abrir(tema, paso - 1);
  $('siguiente').onclick = $('saltar').onclick = () => abrir(tema, paso + 1);
  $('siguiente-tema').onclick = () => Temas[tema + 1] ? abrir(tema + 1, 0) : finalCurso();
  $('volver-temas').onclick = () => indice();
  $('comprobar').onclick = comprobar;
  $('entrada-terminal').onsubmit = evento => {
    evento.preventDefault();
    if (!programa || !esperando) return;
    const texto = $('entrada').value;
    eco(texto);
    esperar(false);
    controles();
    ciclo(texto);
    if (!esperando) $(programa ? 'parar' : 'ejecutar').focus();
  };
  $('ejecutar').onclick = () => procesar(true);
  $('paso').onclick = () => procesar(false);
  $('parar').onclick = () => {
    detener();
    editor.destacar(0);
    $('estado').textContent = 'Ejecución detenida.';
    $('ejecutar').focus();
  };
  $('restaurar').onclick = () => {
    reiniciarVista();
    configurar(origen);
    if (acciones.includes(ficha.tipo)) P.guardarCodigo(tema, paso, origen);
    $('codigo').focus();
  };
  $('pista').onclick = () => {
    $('ayuda').textContent = ficha.pistas[Math.min(pistas++, ficha.pistas.length - 1)];
  };
  $('solucion').onclick = () => {
    configurar(ficha.solucion);
    P.guardarCodigo(tema, paso, ficha.solucion);
    $('codigo').focus();
  };
  function sonido() { $('sonido').textContent = Progreso.silencio() ? 'Activar sonido' : 'Silenciar'; }
  $('sonido').onclick = () => {
    Progreso.guardarSilencio(!Progreso.silencio());
    Sonido.activar();
    sonido();
  };
  indice(false);
  sonido();
})();
