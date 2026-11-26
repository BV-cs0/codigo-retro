(function (CR) {
'use strict';
const traducir = typeof module !== 'undefined' ? require('../comun/idioma').t : globalThis.CR.t;
CR.Idioma.registrar('es', 'bash', CR.CursoBash);
const temas = CR.Idioma.contenido('bash');
const { ProgresoBash: P, ValidarBash: V, Shell: S, Sonido } = CR;
const idioma = CR.Idioma.actual();
const identidad = S.SFA.identidad(idioma);
const saludo = idioma === 'en' ? 'hello.sh' : 'saludo.sh';
const campoCodigo = idioma === 'en' ? 'codigoEn' : 'codigo';
const $ = id => document.getElementById(id);
const nodo = (tag, texto = '') => Object.assign(document.createElement(tag), { textContent: texto });
const boton = (texto, onclick) => Object.assign(nodo('button', texto), { type: 'button', onclick });
const ordenes = S.Ejecutor.comandos.concat('read', 'printf', 'test', 'exit', 'shift', 'export').map(nombre => ({ nombre }));
let t, i, ficha, intento, pistas, ejecucion, reloj, mini;
const id = () => t + ':' + i;
const controles = ['ejecutar', 'paso', 'restaurar', 'comprobar'];
const editor = CR.Editor.crear({ entrada: $('codigo'), espejo: $('espejo'), numeros: $('numeros'),
  contador: $('contador'), error: $('error') }, codigo => P.guardar(id(), { [campoCodigo]: codigo }));
const ajustar = texto => editor.configurar({ lenguaje: 'bash', ordenes }, texto);
const esReto = () => ['reto', 'arregla'].includes(ficha.tipo);
const original = () => ficha.codigo === 'anterior' ?
  P.estado(t + ':' + (i - 1))[campoCodigo] ?? ficha.anterior : ficha.codigo;
function barraTema(tema, hechos) {
  const barra = Object.assign(nodo('progress'), { max: tema.pasos.length, value: hechos });
  barra.setAttribute('aria-label', traducir("curso.progreso_de") + tema.titulo);
  return barra;
}
const cuenta = (tema, hechos) => hechos + ' / ' + tema.pasos.length + traducir("curso.pasos");
function indice(enfocar = true) {
  parar();
  $('indice').hidden = false;
  $('paso-curso').hidden = $('final-curso').hidden = $('temas').hidden = true;
  $('cartuchos').replaceChildren(...temas.map((tema, j) => {
    const b = boton('', () => abrir(j, 0));
    b.className = tema.proyecto ? 'cartucho dorado' : 'cartucho';
    const hechos = P.total(j + ':');
    b.append(nodo('strong', (j + 1) + ' · ' + tema.titulo), nodo('span', tema.frase),
      barraTema(tema, hechos), nodo('span', cuenta(tema, hechos)), nodo('small', traducir("curso.necesitas") + tema.necesita));
    return b;
  }));
  if (enfocar) $('continuar').focus();
}
function progreso() {
  $('siguiente').disabled = !P.estado(id()).hecho;
  $('saltar').hidden = P.estado(id()).hecho || ficha.tipo === 'resumen';
  $('puntos').replaceChildren(...temas[t].pasos.map((paso, j) => {
    const actual = i === j, hecho = P.estado(t + ':' + j).hecho;
    const b = boton(String(j + 1), () => abrir(t, j));
    if (hecho) b.className = 'completo';
    b.setAttribute('aria-label', traducir("curso.paso") + (j + 1) + ', ' + paso.titulo + (hecho ? traducir("curso.completado") : ''));
    if (actual) b.setAttribute('aria-current', 'step');
    return b;
  }));
}
function completar(acierto) {
  const nuevo = !P.estado(id()).hecho;
  P.guardar(id(), { hecho: true });
  progreso();
  if (nuevo && P.total(t + ':') === temas[t].pasos.length) Sonido.tocar('victoria');
  else if (acierto) Sonido.tocar(acierto);
  else if (nuevo) Sonido.tocar('paso');
}
function introducir(texto) {
  const p = nodo('p');
  texto.split('`').forEach((trozo, j) => p.append(j % 2 ? nodo('code', trozo) : trozo));
  return p;
}
function mostrarFicha() {
  const resumen = ficha.tipo === 'resumen', predice = ficha.tipo === 'predice';
  $('resumen').hidden = !resumen;
  $('zona-editor').hidden = $('resultado').hidden = resumen;
  $('prediccion').hidden = !predice;
  $('etiqueta').textContent = ficha.etiqueta || '';
  $('etiqueta').hidden = !ficha.etiqueta;
  $('reto').hidden = $('comprobar').hidden = !esReto();
  for (const k of controles.filter(k => k !== 'comprobar')) $(k).hidden = predice;
  $('codigo').readOnly = predice;
  $('argumentos').readOnly = predice;
  $('pregunta').textContent = ficha.pregunta || '';
  $('opciones').replaceChildren(...(ficha.opciones || []).map((texto, j) => boton(texto, () => predecir(j))));
  $('objetivo').textContent = ficha.objetivo || '';
  $('solucion').hidden = intento < 2;
  $('pista').disabled = false;
  $('anterior').disabled = !i;
  $('codigo-final').textContent = ficha.codigo;
  $('enlace-faro').hidden = !ficha.enlace;
  $('enlace-faro').href = 'terminal.html' + (idioma === 'en' ? '?lang=en' : '') + '#mision-8-1';
  $('siguiente-tema').textContent = t + 1 === temas.length ? traducir("curso.terminar_curso") : traducir("curso.siguiente_tema");
}
function abrir(tema, paso) {
  Sonido.activar();
  parar();
  t = tema; i = paso; ficha = temas[t].pasos[i];
  P.guardar('ultima', { t, i });
  intento = P.estado(id()).intento || 0;
  pistas = 0;
  $('indice').hidden = $('final-curso').hidden = true;
  $('paso-curso').hidden = $('temas').hidden = false;
  $('posicion').textContent = temas[t].titulo + traducir("curso.paso_2") + (i + 1) + traducir("comun.de") + temas[t].pasos.length;
  $('titulo-paso').textContent = ficha.titulo;
  $('texto').replaceChildren(...ficha.texto.map(introducir));
  for (const k of ['respuesta', 'ayuda', 'estado', 'salida', 'variables']) $(k).replaceChildren();
  $('archivo').textContent = ficha.archivo || (t === 0 ? saludo : 'script.sh');
  $('argumentos').value = (ficha.args || []).map(a => /^[\w./-]+$/.test(a) ? a : "'" + a.replaceAll("'", "'\\''") + "'").join(' ');
  ajustar(P.estado(id())[campoCodigo] ?? original());
  mostrarFicha();
  const inicial = new S.SFA.SFA(ficha.fs, identidad);
  mostrarArchivos(inicial.nodos, inicial.nodos);
  mini = t === 0 && i === 2 ? new S.Ejecutor.Sesion({ fs: { [saludo]: ficha.codigo }, idioma }) : null;
  $('mini-terminal').hidden = !mini;
  if (mini) $('salida').textContent = traducir("curso.prueba_bash_saludo_sh_saludo");
  if (ficha.tipo === 'resumen') completar();
  else progreso();
  $('titulo-paso').focus();
}
function siguiente() {
  if (i + 1 < temas[t].pasos.length) return abrir(t, i + 1);
  if (t + 1 < temas.length) return abrir(t + 1, 0);
  finalCurso();
}
function finalCurso() {
  parar();
  $('paso-curso').hidden = true;
  $('final-curso').hidden = false;
  $('progreso-final').textContent = P.total() + traducir("curso.66_pasos_completados");
  if (document.documentElement.lang === 'en') $('letras-final').width = 198;
  CR.Pixel.texto($('letras-final').getContext('2d'), traducir("curso.final_del_curso"), 3, 3, 2, '#ffe27f');
  $('progreso-temas').replaceChildren(...temas.map((tema, j) => {
    const hechos = P.total(j + ':');
    const li = nodo('li');
    li.append(nodo('strong', tema.titulo), barraTema(tema, hechos), nodo('span', cuenta(tema, hechos)));
    return li;
  }));
  $('titulo-final').focus();
}
function mostrarArchivos(antes, despues) {
  const base = identidad.home + '/';
  const virtuales = new Set(['/', '/home', identidad.home, '/dev', '/dev/null']);
  const rutas = [...new Set([...antes.keys(), ...despues.keys()])].sort().filter(r => !virtuales.has(r));
  $('archivos').replaceChildren(...rutas.map(ruta => {
    const a = antes.get(ruta), d = despues.get(ruta);
    const nombre = ruta.startsWith(base) ? ruta.slice(base.length) : ruta.slice(1);
    const li = nodo('li', S.SFA.nombre(nombre) + ((d || a).carpeta ? '/' : ''));
    li.style.paddingInlineStart = nombre.split('/').length - 1 + 'em';
    li.className = !a ? 'nuevo' : !d ? 'borrado' : JSON.stringify(a) !== JSON.stringify(d) ? 'modificado' : '';
    if (li.className) li.append(' · ' + (idioma === 'en' ? traducir('bash.archivo_' + li.className) : li.className));
    li.title = ruta;
    return li;
  }));
}
function salida(eventos) {
  for (const { texto, estilo } of eventos) {
    if (estilo === 'limpiar') $('salida').replaceChildren();
    else $('salida').append(Object.assign(nodo('span', texto), { className: estilo === 'guia' ? 'guia-error' : estilo }));
  }
  const terminal = $('salida').parentElement;
  terminal.scrollTop = terminal.scrollHeight;
}
function pintar() {
  const { sesion, resultado, offset, antes, paso } = ejecucion;
  salida(resultado.eventos.slice(offset));
  ejecucion.offset = resultado.eventos.length;
  mostrarArchivos(antes, sesion.fs.nodos);
  if (paso) $('variables').replaceChildren(...Object.entries(sesion.vars).filter(([, v]) => v !== undefined).map(([k, v]) => {
    const tr = nodo('tr');
    tr.append(Object.assign(nodo('th', k), { scope: 'row' }), nodo('td', JSON.stringify(v)));
    return tr;
  }));
}
function parar() {
  clearTimeout(reloj);
  ejecucion?.iterador.return();
  ejecucion = null;
  editor.bloquear(ficha?.tipo === 'predice');
  for (const k of controles) $(k).disabled = false;
  $('parar').disabled = true;
  $('entrada-terminal').hidden = true;
}
function avanzar(entrada) {
  const r = ejecucion.iterador.next(entrada);
  pintar();
  if (r.done) {
    const fallo = ejecucion.resultado.error || ejecucion.resultado.codigo !== 0;
    salida([{ texto: traducir("curso.salio_con_codigo") + ejecucion.resultado.codigo + ']\n' }]);
    parar();
    if (ficha.tipo === 'explica') completar(fallo ? 'choque' : undefined);
    else if (fallo && ficha.tipo !== 'predice') Sonido.tocar('choque');
  } else if (r.value?.linea) {
    if (ejecucion.paso) editor.destacar(r.value.linea);
    reloj = setTimeout(avanzar, Number($('velocidad').value) || (ejecucion.paso ? 25 : 0));
  } else {
    $('entrada-terminal').hidden = false;
    $('prompt').textContent = r.value;
    $('entrada').value = '';
    $('entrada').focus();
  }
}
function ejecutar(paso = false, predice = false) {
  Sonido.activar();
  parar();
  $('salida').replaceChildren();
  $('variables').replaceChildren();
  $('estado').textContent = '';
  try {
    const args = V.leerArgumentos($('argumentos').value);
    ejecucion = S.Bash.preparar(editor.texto(), { ...ficha, archivo: $('archivo').textContent, args,
      entradas: predice ? ficha.entradas || [] : undefined, interactiva: !predice,
      paso: paso || (!predice && Number($('velocidad').value) > 0) });
  } catch (e) {
    $('estado').textContent = e.message;
    Sonido.tocar('choque');
    return;
  }
  Object.assign(ejecucion, { offset: 0, antes: new Map(ejecucion.sesion.fs.nodos), paso });
  editor.bloquear(true);
  for (const k of controles) $(k).disabled = true;
  $('parar').disabled = false;
  avanzar();
}
function predecir(j) {
  ejecutar(false, true);
  $('respuesta').textContent = (j === ficha.correcta ? traducir("curso.correcto") : traducir("curso.casi") + ficha.opciones[ficha.correcta] + '. ') + ficha.explicacion;
  completar(j === ficha.correcta ? 'recoger' : 'choque');
}
function comprobar() {
  Sonido.activar();
  const r = V.comprobar({ ...ficha, archivo: $('archivo').textContent }, editor.texto());
  $('estado').replaceChildren(...r.checks.map(c => nodo('p', (c.ok ? '✔ ' : '✘ ') + c.texto)));
  if (r.ok) completar('recoger');
  else {
    Sonido.tocar('choque');
    P.guardar(id(), { intento: ++intento });
    $('solucion').hidden = intento < 2;
  }
}
$('temas').onclick = indice;
$('volver-temas').onclick = indice;
$('continuar').onclick = () => { const ultima = P.estado('ultima'); abrir(ultima.t ?? 0, ultima.i ?? 0); };
$('anterior').onclick = () => abrir(t, i - 1);
$('siguiente').onclick = $('saltar').onclick = $('siguiente-tema').onclick = siguiente;
$('ejecutar').onclick = () => ejecutar();
$('paso').onclick = () => ejecutar(true);
$('parar').onclick = parar;
$('restaurar').onclick = () => { ajustar(original()); P.guardar(id(), { [campoCodigo]: editor.texto() }); };
$('comprobar').onclick = comprobar;
$('solucion').onclick = () => { ajustar(ficha.solucion); P.guardar(id(), { [campoCodigo]: editor.texto() }); };
$('pista').onclick = () => {
  $('ayuda').textContent = ficha.pistas[pistas++];
  $('pista').disabled = pistas >= ficha.pistas.length;
};
$('entrada-terminal').onsubmit = e => {
  e.preventDefault();
  const valor = $('entrada').value;
  salida([{ texto: $('prompt').textContent + valor + '\n' }]);
  $('entrada-terminal').hidden = true;
  avanzar(valor);
};
$('mini-terminal').onsubmit = e => {
  e.preventDefault();
  const orden = $('orden').value, antes = new Map(mini.fs.nodos);
  $('orden').value = '';
  salida([{ texto: '$ ' + orden + '\n' }, ...mini.ejecutar(orden).eventos]);
  mostrarArchivos(antes, mini.fs.nodos);
};
function sonido() { $('sonido').textContent = CR.Progreso.silencio() ? traducir("comun.activar_sonido") : traducir("comun.silenciar"); }
$('sonido').onclick = () => {
  CR.Progreso.guardarSilencio(!CR.Progreso.silencio());
  CR.Sonido.activar();
  sonido();
};
CR.SpritesFaro.animar(cuadro => {
  CR.SpritesFaro.retrato($('lumen'), cuadro);
  CR.SpritesFaro.celebrarBash($('lumen-final'), cuadro);
});
sonido();
indice(false);
})(globalThis.CR);
