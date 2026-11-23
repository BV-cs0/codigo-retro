(function (CR) {
'use strict';
const Shell = CR.Shell = CR.Shell || {};
const { S, registrar: R, opciones, operar } = typeof module !== 'undefined' ? require('./base') : Shell.Base;
const q = nombre => "'" + nombre + "'";
R('pwd', 'Muestra la ruta actual.', ['pwd', 'cd /srv; pwd'], c => { opciones(c); c.out(c.sesion.cwd + '\n'); });
R('cd', 'Cambia de carpeta.', ['cd /var/log', 'cd -'], c => {
  if (c.args.length > 1) return c.error('bash: cd: too many arguments');
  const arg = c.args[0] ?? c.sesion.vars.HOME;
  if (arg.startsWith('-') && arg !== '-') return c.invalido(arg);
  const ruta = c.ruta(arg === '-' ? c.sesion.vars.OLDPWD || '' : arg);
  if (arg === '-' && !c.sesion.vars.OLDPWD) return c.error('bash: cd: OLDPWD not set');
  operar(c, [arg], a => a, () => {
    const nodo = c.fs.obtener(ruta);
    if (!nodo.carpeta) S.fallo('Not a directory');
    if (!S.permite(nodo, 'x')) S.fallo('Permission denied');
    c.sesion.vars.OLDPWD = c.sesion.cwd;
    c.sesion.cwd = c.sesion.vars.PWD = ruta;
    c.sesion.visitadas.add(ruta);
    if (arg === '-') c.out(ruta + '\n');
  });
}, { '~': 'va a tu casa', '..': 'sube una carpeta', '-': 'vuelve a la carpeta anterior' });
R('touch', 'Crea archivos vacíos o actualiza la fecha.', ['touch nota.txt', 'touch uno.txt dos.txt'], c => {
  operar(c, opciones(c).args, a => 'cannot touch ' + q(a), (_, r) => {
    const nodo = c.fs.acceso(r);
    if (!nodo) c.fs.escribir(r, '');
    else if (S.permite(nodo, 'w')) nodo.fecha = S.FECHA;
    else S.fallo('Permission denied');
  });
});
R('mkdir', 'Crea carpetas.', ['mkdir fotos', 'mkdir -p almacen/fotos'], c => {
  const { args, flags } = opciones(c, 'p');
  operar(c, args, a => 'cannot create directory ' + q(a), (_, r) => c.fs.crear(r, flags.p));
}, { '-p': 'crea las carpetas necesarias' });
R('rmdir', 'Borra carpetas vacías.', ['rmdir vieja', 'rmdir vieja otra'], c => {
  operar(c, opciones(c).args, a => 'failed to remove ' + q(a), (_, r) => {
    const nodo = c.fs.obtener(r);
    if (!nodo.carpeta) S.fallo('Not a directory');
    if (c.fs.hijos(r).length) S.fallo('Directory not empty');
    c.fs.borrar(r, true);
  });
});
function eliminar(c, args, flags, indice = 0) {
  for (let i = indice; i < args.length; i++) {
    const arg = args[i];
    const ruta = c.ruta(arg);
    const peligro = flags.r && flags.f && ['/', c.sesion.vars.HOME].includes(ruta);
    const borrar = () => {
      operar(c, [arg], a => 'cannot remove ' + q(a), () => {
        c.fs.borrar(ruta, flags.r, peligro);
        if (peligro) c.sesion.aviso = 'Eso borraría datos de verdad en Linux. Usa ↺ Reiniciar misión para recuperar el faro.';
      });
    };
    let nodo;
    try { nodo = c.fs.acceso(ruta); }
    catch (e) { if (!flags.f || e.message !== 'No such file or directory') borrar(); continue; }
    if (!nodo && flags.f) continue;
    if (flags.i && nodo && (!nodo.carpeta || flags.r)) {
      const tipo = nodo.carpeta ? 'directory' : (nodo.contenido ? 'regular file' : 'regular empty file');
      c.preguntar('rm: remove ' + tipo + ' ' + q(arg) + '?', respuesta => {
        if (/^y/i.test(respuesta.trim())) borrar();
        eliminar(c, args, flags, i + 1);
      });
      return;
    }
    borrar();
  }
}
R('rm', 'Borra archivos o carpetas.', ['rm *.tmp', 'rm -i nota.txt'], c => {
  const flags = { r: false, f: false, i: false };
  const args = [];
  let leer = true;
  for (const arg of c.args) {
    if (leer && arg === '--') { leer = false; continue; }
    if (leer && /^-./.test(arg)) for (const f of arg.slice(1)) {
      if (!'rRfi'.includes(f)) c.invalido(arg);
      flags[f === 'R' ? 'r' : f] = true;
      if (f === 'f') flags.i = false;
      if (f === 'i') flags.f = false;
    } else args.push(arg);
  }
  if (!args.length && !flags.f) return c.error('rm: missing operand');
  eliminar(c, args, flags);
}, { '-r': 'recorre carpetas', '-f': 'ignora archivos ausentes', '-i': 'pide confirmación' });
for (const mover of [false, true]) {
  const nombre = mover ? 'mv' : 'cp';
  R(nombre, mover ? 'Mueve o renombra archivos.' : 'Copia archivos y carpetas.',
    [nombre + ' nota.txt copia.txt', nombre + (mover ? ' fotos almacen/' : ' -r fotos copia')], c => {
      const { args, flags } = opciones(c, mover ? '' : 'rR');
      if (!args.length) return c.error(nombre + ': missing file operand');
      if (args.length === 1) return c.error(nombre + ': missing destination file operand after ' + q(args[0]));
      const destino = args.pop();
      const ruta = c.ruta(destino);
      let esCarpeta;
      try { esCarpeta = c.fs.acceso(ruta)?.carpeta; }
      catch (e) { return c.error(nombre + ': ' + q(destino) + ': ' + e.message); }
      if (!esCarpeta && args.length > 1) return c.error(nombre + ': target ' + q(destino) + ': No such file or directory');
      for (const arg of args) {
        const origen = c.ruta(arg);
        const final = esCarpeta ? c.ruta(ruta + '/' + S.nombre(origen)) : ruta;
        try { c.fs.transferir(origen, final, flags.r || flags.R, mover); }
        catch (e) {
          if (e.message === '-r not specified; omitting directory') c.error('cp: ' + e.message + ' ' + q(arg));
          else if (e.message === 'No such file or directory' && !c.fs.nodos.has(origen)) {
            c.error(nombre + ': cannot stat ' + q(arg) + ': ' + e.message);
          } else if (e.message === 'are the same file') c.error(nombre + ': ' + q(arg) + ' and ' + q(destino) + ' are the same file');
          else c.error(nombre + ': cannot ' + (mover ? 'move ' : 'copy ') + q(arg) + ' to ' + q(destino) + ': ' + e.message);
        }
      }
    }, mover ? {} : { '-r': 'copia carpetas recursivamente' });
}
function cambiarModo(modo, original, carpeta = false) {
  if (/^[0-7]{3}$/.test(modo)) return [...modo].map(d =>
    [...'rwx'].map((letra, i) => Number(d) & (4 >> i) ? letra : '-').join('')).join('');
  const permisos = [...original];
  for (const operacion of modo.split(',')) {
    const partes = operacion.match(/^([ugoa]*)([+=-])([rwxXugo]*)$/);
    if (!partes) S.fallo('invalid mode: ' + q(modo));
    const [, quien, op, letras] = partes;
    const grupos = !quien || quien.includes('a') ? 'ugo' : quien;
    const anterior = permisos.join('');
    for (const grupo of grupos) for (const [i, letra] of [...'rwx'].entries()) {
      const indice = 'ugo'.indexOf(grupo) * 3 + i;
      const aplica = letras.includes(letra) || (letra === 'x' && letras.includes('X') && (carpeta || anterior.includes('x'))) ||
        [...letras].some(g => 'ugo'.includes(g) && anterior['ugo'.indexOf(g) * 3 + i] === letra);
      if (aplica) permisos[indice] = op === '-' ? '-' : letra;
      else if (op === '=') permisos[indice] = '-';
    }
  }
  return permisos.join('');
}
R('chmod', 'Cambia los permisos de un archivo.', ['chmod 600 secretos.txt', 'chmod u+x faro.sh'], c => {
  const [modo, ...args] = c.args;
  if (modo?.startsWith('--')) return c.invalido(modo);
  if (!args.length) return c.error('chmod: missing operand');
  try { cambiarModo(modo, '---------'); }
  catch (e) { return c.error('chmod: ' + e.message); }
  operar(c, args, a => 'changing permissions of ' + q(a), (_, r) => {
    const nodo = c.fs.obtener(r);
    if (nodo.dueno !== 'aprendiz') S.fallo('Operation not permitted');
    nodo.permisos = cambiarModo(modo, nodo.permisos, nodo.carpeta);
  });
}, { '755': 'modo numérico', 'u+x': 'da ejecución al dueño', 'go-w': 'quita escritura al grupo y al resto', 'a+r': 'da lectura a todos' });
Shell.Rutas = { cambiarModo };
if (typeof module !== 'undefined') module.exports = CR.Shell.Rutas;
})(globalThis.CR = globalThis.CR || {});

