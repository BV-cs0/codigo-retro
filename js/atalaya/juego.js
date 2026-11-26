(function (CR) {
'use strict';
const { Atalaya, ProgresoAtalaya, Nix, TecladoFaro } = CR;
const $ = id => document.getElementById(id);
const t = CR.t;
const idioma = CR.Idioma.actual();
const retos = Atalaya.lista(idioma);
const progreso = ProgresoAtalaya.navegador();
const input = $('linea'), salida = $('salida'), pantalla = $('pantalla');
const cierre = $('cierre'), final = $('final'), etica = $('etica');
let reto, sesion, pistas, pregunta, resuelto;
function nodo(tag, texto) {
  const n = document.createElement(tag);
  n.textContent = texto;
  return n;
}
function tablero() {
  $('total').textContent = t('atalaya.total', progreso.resumen());
  $('ver-final').hidden = !terminado();
  $('categorias').replaceChildren(...Atalaya.categorias.map(categoria => {
    const seccion = nodo('section', '');
    seccion.className = 'faro-panel';
    const lista = retos.filter(r => r.categoria === categoria);
    seccion.append(nodo('h3', categoria + ' · ' + t('atalaya.' + categoria)));
    if (!lista.length) seccion.append(nodo('p', t('atalaya.empty')));
    for (const r of lista) {
      const puntos = progreso.mejor(r.id);
      const boton = nodo('button', (puntos ? '✓ ' : '') + r.id + ' · ' + r.titulo + ' · ' +
        t('atalaya.points', { puntos: puntos || r.puntos }));
      boton.type = 'button';
      boton.setAttribute('aria-pressed', String(r === reto));
      boton.addEventListener('click', () => iniciar(r, true));
      seccion.append(boton);
    }
    return seccion;
  }));
}
function chuleta(comandos, destino) {
  const dl = nodo('dl', '');
  for (const comando of new Set(comandos)) {
    const ficha = CR.Shell.Ayuda.ficha(comando, idioma);
    dl.append(nodo('dt', comando), nodo('dd', ficha?.ejemplos.join('\n') ?? comando));
  }
  destino.replaceChildren(dl);
}
function textoPrompt() {
  const { usuario, maquina, home } = sesion.identidad;
  const ruta = sesion.cwd === home || sesion.cwd.startsWith(home + '/') ? '~' + sesion.cwd.slice(home.length) : sesion.cwd;
  return pregunta ?? usuario + '@' + maquina + ':' + ruta + '$';
}
function prompt() { $('prompt').textContent = textoPrompt(); }
function desplazar() { pantalla.scrollTop = pantalla.scrollHeight; }
function escribir(eventos) {
  for (const { texto, estilo } of eventos) {
    if (estilo === 'limpiar') salida.replaceChildren();
    else {
      const linea = nodo('span', texto);
      if (estilo) linea.className = estilo;
      salida.append(linea);
    }
  }
}
function iniciar(actual, enfocar = false) {
  reto = actual;
  sesion = Atalaya.sesion(reto, idioma);
  progreso.abrir(reto.id);
  pistas = 0;
  pregunta = null;
  resuelto = false;
  $('guardia').hidden = false;
  $('titulo-reto').textContent = reto.id + ' · ' + reto.titulo;
  $('texto-reto').textContent = reto.nix;
  $('pista').disabled = !reto.pistas.length;
  $('texto-pista').textContent = '';
  input.value = '';
  input.type = 'text';
  teclado.reset();
  salida.replaceChildren();
  prompt();
  tablero();
  actualizarPuntos();
  chuleta([...reto.cierre.comandos, 'help', 'man', 'base64', 'xxd', 'md5sum', 'sha256sum',
    'curl', 'find', 'ls', 'sudo', idioma === 'en' ? 'submit' : 'enviar'], $('chuleta'));
  if (enfocar) input.focus();
}
function actualizado() {
  progreso.resolver(reto.id, reto.puntos, pistas);
  resuelto = true;
  tablero();
  $('hecho').textContent = reto.cierre.hecho;
  $('defensa').textContent = reto.cierre.defensa;
  $('comandos-usados').textContent = reto.cierre.comandos.join(', ');
  cierre.showModal();
}
function terminado() {
  return progreso.mejor('E4') > 0 || (retos.length > 0 && retos.every(r => progreso.mejor(r.id) > 0));
}
function mostrarFinal() {
  $('final-total').textContent = t('atalaya.total', progreso.resumen());
  final.showModal();
}
function enviar(e) {
  e.preventDefault();
  const linea = input.value;
  escribir([{ texto: textoPrompt() + (input.type === 'password' ? '' : ' ' + linea) + '\n', estilo: 'usuario' }]);
  sesion.columnas = Math.max(16, Math.floor((pantalla.clientWidth - 28) / (parseFloat(getComputedStyle(input).fontSize) * .6)));
  const r = sesion.ejecutar(linea);
  escribir(r.eventos);
  pregunta = r.pregunta ?? null;
  input.type = r.oculta ? 'password' : 'text';
  input.value = '';
  teclado.reset();
  prompt();
  desplazar();
  if (sesion.entrega.correcta && !resuelto) actualizado();
}
function actualizarPuntos() {
  $('puntos-reto').textContent = t('atalaya.points', { puntos: reto.puntos * Math.max(.5, 1 - pistas * .25) });
}
const teclado = TecladoFaro.conectar(input, () => sesion, {
  limpiar: () => salida.replaceChildren(),
  cancelar() {
    sesion.cancelar();
    pregunta = null;
    input.type = 'text';
    prompt();
  },
  listar(lista) { escribir([{ texto: lista.join('  ') + '\n' }]); desplazar(); }
});
$('orden').addEventListener('submit', enviar);
$('reiniciar').addEventListener('click', () => iniciar(reto, true));
$('pista').addEventListener('click', () => {
  $('texto-pista').textContent = reto.pistas[pistas++];
  $('pista').disabled = pistas >= reto.pistas.length;
  actualizarPuntos();
});
$('cerrar-reto').addEventListener('click', () => cierre.close());
cierre.addEventListener('close', () => { if (terminado()) mostrarFinal(); else input.focus(); });
$('ver-final').addEventListener('click', mostrarFinal);
$('cerrar-final').addEventListener('click', () => final.close());
final.addEventListener('close', () => input.focus());
$('abrir-etica').addEventListener('click', () => etica.showModal());
etica.addEventListener('cancel', e => { if (!progreso.etica()) e.preventDefault(); });
$('aceptar-etica').addEventListener('click', () => { progreso.aceptar(); etica.close(); });
Nix.animar($('nix'), $('nix-final'));
const inicial = retos.find(r => r.id === progreso.actual()) ?? retos[0];
if (inicial) iniciar(inicial);
else tablero();
if (!progreso.etica()) etica.showModal();
})(globalThis.CR);
