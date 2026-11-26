(function (CR) {
'use strict';
const traducir = typeof module !== 'undefined' ? require('../comun/idioma').t : globalThis.CR.t;
const Shell = CR.Shell = CR.Shell || {};
const { ayuda, registrar: R, opciones } = typeof module !== 'undefined' ? require('./comandos/base') : Shell.Base;
const noDisponibles = new Set(('sed awk vim vi nano sudo su apt apt-get scp wget top ' +
  'chown tar zip unzip git python python3 emacs more rsync systemctl htop').split(' '));
const ingles = { mision: 'mission', responder: 'answer', enviar: 'submit' };
const aliases = { mission: 'mision', answer: 'responder', submit: 'enviar' };
const canonico = (nombre, idioma) => (nombre === 'submit' || idioma === 'en') && Object.hasOwn(aliases, nombre) ? aliases[nombre] : nombre;
const nombreVisible = (nombre, idioma) => idioma === 'en' && Object.hasOwn(ingles, nombre) ? ingles[nombre] : nombre;
const nombres = idioma => Object.keys(ayuda).map(c => nombreVisible(c, idioma)).sort();
const palabras = { nota: 'note', hola: 'hello', nombres: 'names', puntos: 'scores',
  datos: 'data', faro: 'beacon', antes: 'before', despues: 'after', uno: 'one', dos: 'two', fotos: 'photos',
  almacen: 'storeroom', vieja: 'old', otra: 'other', copia: 'copy', secretos: 'secrets', tormenta: 'storm',
  contraseña: 'password', cartas: 'letters', fecha: 'date', mapa: 'map', acceso: 'shortcut',
  boya: 'buoy', estado: 'status', vigia: 'watcher', relevo: 'relay', ...ingles, solo: 'only' };
function ficha(nombre, idioma) {
  const original = ayuda[canonico(nombre, idioma)];
  if (!original) return original;
  const localizar = valor => typeof valor === 'function' ? valor(idioma) : valor;
  const ejemplos = idioma === 'en' ? original.ejemplos.map(linea => linea.replace(/\p{L}+/gu,
    palabra => Object.hasOwn(palabras, palabra) ? palabras[palabra] : palabra)) : original.ejemplos;
  return { descripcion: localizar(original.descripcion), ejemplos,
    opciones: Object.fromEntries(Object.entries(original.opciones).map(([op, texto]) => [op, localizar(texto)])) };
}
R('help', traducir("shell.lista_los_comandos_del_simulador"), ['help', 'man ls'], c => {
  opciones(c);
  for (const nombre of nombres(c.sesion.idioma)) c.out(nombre.padEnd(11) + ficha(nombre, c.sesion.idioma).descripcion + '\n');
});
R('man', traducir("shell.abre_el_manual_de_un"), ['man ls', 'man grep'], c => {
  const { args } = opciones(c);
  const manual = ficha(args[0], c.sesion.idioma);
  if (!manual) return c.error('No manual entry for ' + (args[0] || ''));
  c.out(args[0].toUpperCase() + '\n\n' + manual.descripcion + '\n');
  for (const [op, texto] of Object.entries(manual.opciones)) c.out('  ' + op + '  ' + texto + '\n');
  c.out(traducir[c.sesion.idioma]("shell.ejemplos") + manual.ejemplos.map(e => '  ' + e + '\n').join(''));
});
function distancia(a, b) {
  let fila = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 0; i < a.length; i++) {
    const anterior = fila;
    fila = [i + 1];
    for (let j = 0; j < b.length; j++) {
      fila.push(Math.min(fila[j] + 1, anterior[j + 1] + 1, anterior[j] + (a[i] === b[j] ? 0 : 1)));
    }
  }
  return fila[b.length];
}
function sugerir(palabra, idioma) {
  const texto = traducir[idioma] ?? traducir;
  const opciones = nombres(idioma).map(c => [c, distancia(palabra, c)]).filter(([c, d]) => {
    const longitud = Math.min(c.length, palabra.length);
    return longitud >= 2 && d <= (longitud >= 6 ? 2 : 1);
  }).sort((a, b) => a[1] - b[1] || a[0].length - b[0].length);
  const [mejor, siguiente] = opciones;
  if (mejor && (mejor[1] !== siguiente?.[1] || mejor[0].length < siguiente[0].length))
    return texto("shell.sugerencia", { comando: mejor[0] });
  return texto("shell.usa_help_para_ver_los");
}
function explicar(error, idioma) {
  const texto = traducir[idioma] ?? traducir;
  if (error.endsWith(': command not found')) {
    const palabra = error.replace(/^.*?: line \d+: |^bash: /, '').slice(0, -': command not found'.length);
    return sugerir(palabra, idioma);
  }
  if (error.includes("[: missing ']'")) return texto("shell.cierra_la_condicion_con_y");
  if (error.includes('[: too many arguments')) return texto("shell.la_condicion_recibio_palabras_de");
  if (error.includes('unexpected EOF while looking')) return texto("shell.revisa_que_las_comillas_abiertas");
  if (error.includes('unexpected end of file')) return texto("shell.revisa_que_los_bloques_se");
  if (error.includes('No such file or directory')) return texto("shell.no_existe_ese_archivo_o");
  if (error.includes('Permission denied') || error.includes('Operation not permitted')) return texto("shell.revisa_el_dueno_y_los");
  if (error.includes('Is a directory')) return texto("shell.esa_ruta_es_una_carpeta");
  if (error.includes('Not a directory')) return texto("shell.un_tramo_de_la_ruta");
  if (error.includes('File exists')) return texto("shell.ese_nombre_ya_existe_usa");
  if (error.includes('Directory not empty')) return texto("shell.hay_archivos_dentro_revisalos_antes");
  return texto("shell.consulta_help_o_man_para");
}
Shell.Ayuda = { fichas: ayuda, ficha, explicar, noDisponibles, canonico, nombres };
if (typeof module !== 'undefined') module.exports = CR.Shell.Ayuda;
})(globalThis.CR = globalThis.CR || {});

