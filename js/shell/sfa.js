(function (CR) {
'use strict';
const Shell = CR.Shell = CR.Shell || {};
function identidad(idioma) {
  const usuario = idioma === 'en' ? 'apprentice' : 'aprendiz';
  return { home: '/home/' + usuario, usuario, maquina: idioma === 'en' ? 'beacon7' : 'faro7' };
}
const HOME = identidad().home;
const FECHA = '2024-11-16T03:14:00Z';
const bytes = texto => new TextEncoder().encode(texto).length;
const padre = ruta => ruta.slice(0, ruta.lastIndexOf('/')) || '/';
const nombre = ruta => ruta.slice(ruta.lastIndexOf('/') + 1) || '/';
function rutaAbsoluta(ruta, cwd = HOME, home = HOME) {
  if (home !== null && (ruta === '~' || ruta.startsWith('~/'))) ruta = home + ruta.slice(1);
  const partes = [];
  for (const parte of (ruta.startsWith('/') ? ruta : cwd + '/' + ruta).split('/')) {
    if (parte === '..') partes.pop();
    else if (parte && parte !== '.') partes.push(parte);
  }
  return '/' + partes.join('/');
}
function fallo(mensaje) { throw new Error(mensaje); }
function patron(glob, comodin = () => true, ruta = true) {
  let regex = '';
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    const cierre = glob.indexOf(']', i + 2);
    if (comodin(i) && c === '*') regex += ruta ? '[^/]*' : '[\\s\\S]*';
    else if (comodin(i) && c === '?') regex += ruta ? '[^/]' : '[\\s\\S]';
    else if (comodin(i) && c === '[' && cierre > i && comodin(cierre)) {
      regex += '[' + glob.slice(i + 1, cierre).replace(/^!/, '^').replace(/\\/g, '\\\\') + ']';
      i = cierre;
    } else regex += c.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&');
  }
  try { return new RegExp('^' + regex + '$'); }
  catch { return /(?!)/; }
}
class SFA {
  constructor(arbol = {}, { home, usuario } = identidad()) {
    this.home = home;
    this.usuario = usuario;
    this.nodos = new Map();
    for (const ruta of ['/', '/home', home, '/dev', '/dev/null']) this.inicial(ruta, ruta === '/dev/null' ? '' : null);
    for (const [ruta, dato] of Object.entries(arbol)) this.inicial(rutaAbsoluta(ruta, home, home), dato, ruta.endsWith('/'));
  }
  permite(nodo, modo) {
    if (!nodo) return false;
    // root lee y escribe todo; solo ejecuta archivos que tengan alguna x (como en Linux).
    if (this.usuario === 'root') return modo !== 'x' || nodo.carpeta || nodo.permisos.includes('x');
    return nodo.permisos[(nodo.dueno === this.usuario ? 0 : 6) + 'rwx'.indexOf(modo)] === modo;
  }
  inicial(ruta, dato, carpeta = dato === null) {
    if (ruta !== '/' && !this.nodos.has(padre(ruta))) this.inicial(padre(ruta), null);
    const propio = ruta === this.home || ruta.startsWith(this.home + '/');
    const meta = typeof dato === 'object' && dato ? dato : { contenido: dato };
    this.poner(ruta, {
      nombre: nombre(ruta), carpeta, contenido: meta.contenido ?? '',
      suid: Boolean(meta.suid),
      permisos: meta.permisos ?? (carpeta ? (propio ? 'rwxr-xr-x' : 'r-xr-xr-x') : 'rw-r--r--'),
      dueno: meta.dueno ?? (propio ? this.usuario : 'root'),
      grupo: meta.grupo ?? meta.dueno ?? (propio ? this.usuario : 'root'),
      fecha: meta.fecha ?? FECHA, enlace: meta.enlace, simBytes: meta.simBytes
    });
  }
  poner(ruta, nodo) {
    if (!this.nodos.has(ruta) && this.nodos.size >= 2000) fallo('No space left on device');
    nodo.tamano = bytes(nodo.contenido);
    if (nodo.tamano > 1048576) fallo('File too large');
    this.nodos.set(ruta, nodo);
  }
  hijos(ruta) {
    return [...this.nodos.keys()].filter(otra => otra !== ruta && padre(otra) === ruta);
  }
  resolver(ruta, seguir = true, saltos = 0) {
    if (saltos >= 40) fallo('Too many levels of symbolic links');
    let actual = '/';
    const partes = ruta.split('/').filter(Boolean);
    for (const [i, parte] of partes.entries()) {
      const anterior = this.nodos.get(actual);
      if (!anterior) fallo('No such file or directory');
      if (!anterior.carpeta) fallo('Not a directory');
      if (!this.permite(anterior, 'x')) fallo('Permission denied');
      const siguiente = rutaAbsoluta(parte, actual, null);
      const enlace = this.nodos.get(siguiente)?.enlace;
      if (enlace !== undefined && (seguir || i < partes.length - 1)) {
        const destino = rutaAbsoluta(enlace, actual, null);
        const resto = partes.slice(i + 1);
        return this.resolver(resto.length ? destino.replace(/\/$/, '') + '/' + resto.join('/') : destino,
          seguir, saltos + 1);
      }
      actual = siguiente;
    }
    return actual;
  }
  acceso(ruta, seguir = true) {
    return this.nodos.get(this.resolver(ruta, seguir));
  }
  obtener(ruta, seguir = true) {
    return this.acceso(ruta, seguir) ?? fallo('No such file or directory');
  }
  listar(ruta) {
    const nodo = this.obtener(ruta);
    if (!nodo.carpeta) fallo('Not a directory');
    if (!this.permite(nodo, 'r')) fallo('Permission denied');
    return this.hijos(this.resolver(ruta));
  }
  leer(ruta) {
    if (ruta === '/dev/null') return '';
    const nodo = this.obtener(ruta);
    if (nodo.carpeta) fallo('Is a directory');
    if (!this.permite(nodo, 'r')) fallo('Permission denied');
    return nodo.contenido;
  }
  modificable(ruta) {
    const nodo = this.obtener(padre(ruta));
    if (!nodo.carpeta) fallo('Not a directory');
    if (!this.permite(nodo, 'w') || !this.permite(nodo, 'x')) fallo('Permission denied');
  }
  escribir(ruta, contenido, agregar = false) {
    ruta = this.resolver(ruta);
    if (ruta === '/dev/null') return;
    const nodo = this.acceso(ruta);
    if (nodo?.carpeta) fallo('Is a directory');
    if (nodo && !this.permite(nodo, 'w')) fallo('Permission denied');
    if (!nodo) this.modificable(ruta);
    const texto = (agregar ? nodo?.contenido ?? '' : '') + contenido;
    if (nodo) this.poner(ruta, { ...nodo, contenido: texto, simBytes: undefined, fecha: FECHA });
    else this.inicial(ruta, { contenido: texto, dueno: this.usuario });
  }
  crear(ruta, recursivo = false) {
    const nodo = this.accesoSeguro(ruta, recursivo);
    if (nodo) {
      if (recursivo && nodo.carpeta) return;
      fallo('File exists');
    }
    if (recursivo && !this.nodos.has(padre(ruta))) this.crear(padre(ruta), true);
    this.modificable(ruta);
    this.inicial(this.resolver(ruta, false), { dueno: this.usuario, permisos: 'rwxr-xr-x' }, true);
  }
  accesoSeguro(ruta, recursivo) {
    try { return this.acceso(ruta); }
    catch (error) {
      if (!recursivo || error.message !== 'No such file or directory') throw error;
      return undefined;
    }
  }
  rama(ruta) {
    return [...this.nodos.keys()].filter(otra => otra === ruta || otra.startsWith(ruta === '/' ? '/' : ruta + '/'));
  }
  borrar(ruta, recursivo, forzarSimulacion = false) {
    ruta = this.resolver(ruta, false);
    const nodo = this.obtener(ruta, false);
    if (nodo.carpeta && !recursivo) fallo('Is a directory');
    if (!forzarSimulacion) {
      this.modificable(ruta);
      for (const hijo of this.rama(ruta).slice(1)) this.modificable(hijo);
    }
    for (const hijo of this.rama(ruta)) this.nodos.delete(hijo);
  }
  transferir(origen, destino, recursivo, mover) {
    origen = this.resolver(origen, !mover && !recursivo);
    destino = this.resolver(destino, !mover);
    const nodo = this.obtener(origen, false);
    if (origen === destino) fallo('are the same file');
    if (nodo.carpeta && !recursivo && !mover) fallo('-r not specified; omitting directory');
    if (nodo.carpeta && destino.startsWith(origen + '/')) fallo('cannot copy a directory into itself');
    const anterior = this.acceso(destino, false);
    if (anterior && anterior.carpeta !== nodo.carpeta) fallo(nodo.carpeta ? 'Not a directory' : 'Is a directory');
    if (mover && anterior?.carpeta && this.hijos(destino).length) fallo('Directory not empty');
    if (!anterior || mover) this.modificable(destino);
    else if (!this.permite(anterior, 'w')) fallo('Permission denied');
    if (mover) this.modificable(origen);
    const cambios = this.rama(origen).map(ruta => {
      const entrada = this.obtener(ruta, false);
      if (!mover && !this.permite(entrada, 'r')) fallo('Permission denied');
      const nueva = destino + ruta.slice(origen.length);
      if (this.nodos.has(nueva) && !this.permite(this.nodos.get(nueva), 'w')) fallo('Permission denied');
      return [ruta, nueva, { ...entrada, nombre: nombre(nueva),
        dueno: mover ? entrada.dueno : this.usuario, grupo: mover ? entrada.grupo : this.usuario }];
    });
    const altas = cambios.filter(([, nueva]) => !this.nodos.has(nueva)).length;
    if (this.nodos.size + altas - (mover ? cambios.length : 0) > 2000) fallo('No space left on device');
    if (mover) for (const [ruta] of cambios) this.nodos.delete(ruta);
    for (const [, nueva, entrada] of cambios) this.poner(nueva, entrada);
  }
}
Shell.SFA = { SFA, HOME, FECHA, bytes, padre, nombre, rutaAbsoluta, identidad, patron, fallo };
if (typeof module !== 'undefined') module.exports = CR.Shell.SFA;
})(globalThis.CR = globalThis.CR || {});

