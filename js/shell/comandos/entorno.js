(function (CR) {
'use strict';
const { registrar } = CR.Shell.Base;
const variable = /^[A-Za-z_]\w*$/;
const asignacion = /^([A-Za-z_]\w*)=([\s\S]*)$/;
const integradas = new Set(('alias cd echo exit export history pwd type unalias unset kill ' +
  'read printf local : true false set shift return break continue [ test').split(' '));
const binarios = new Set(('ls cat head tail wc grep sort uniq cut tr find mkdir rmdir rm touch cp mv diff chmod file tree less bash env printenv which ps pgrep killall ln readlink du df hostname ip ping curl ssh whoami date clear base64 xxd md5sum sha256sum').split(' '));
const PATH = '/usr/local/bin:/usr/bin:/bin';
function buscar(sesion, nombre) {
  for (const carpeta of (sesion.vars.PATH === undefined ? [] : sesion.vars.PATH.split(':'))) {
    const ruta = sesion.ruta((carpeta ? carpeta + '/' : '') + nombre, false);
    try {
      const nodo = sesion.fs.acceso(ruta);
      if (nodo && !nodo.carpeta && sesion.fs.permite(nodo, 'x')) return { ruta };
    } catch { /* Try the next directory. */ }
    if (binarios.has(nombre) && ['/usr/bin/' + nombre, '/bin/' + nombre].includes(ruta)) return { ruta, virtual: true };
  }
}
function entorno(sesion) {
  return [...sesion.exportadas].filter(k => Object.hasOwn(sesion.vars, k))
    .map(k => [k, sesion.vars[k]]);
}
function R(nombre, ejemplos, ejecutar, opciones = {}) {
  registrar(nombre, CR.t('faro2.' + nombre), ejemplos, ejecutar, opciones);
}
R('env', ['env'], c => {
  if (c.args.length) c.invalido(c.args[0]);
  for (const [k, v] of entorno(c.sesion)) c.out(k + '=' + v + '\n');
});
R('printenv', ['printenv PATH'], c => {
  const valores = new Map(entorno(c.sesion));
  if (!c.args.length) for (const [k, v] of valores) c.out(k + '=' + v + '\n');
  for (const k of c.args) {
    if (k.startsWith('-')) c.invalido(k);
    if (valores.has(k)) c.out(valores.get(k) + '\n');
    else c.codigo = 1;
  }
});
R('export', ['export PATH="$HOME/bin:$PATH"'], c => {
  if (!c.args.length) {
    for (const [k, v] of entorno(c.sesion).sort(([a], [b]) => a.localeCompare(b, 'en')))
      c.out('declare -x ' + k + '=' + JSON.stringify(v) + '\n');
  }
  for (const arg of c.args) {
    if (arg.startsWith('-')) c.invalido(arg);
    const dato = asignacion.exec(arg);
    const k = dato?.[1] ?? arg;
    if (!variable.test(k)) { c.error("bash: export: `" + arg + "': not a valid identifier"); continue; }
    if (dato) c.sesion.vars[k] = dato[2];
    c.sesion.exportadas.add(k);
  }
});
R('unset', ['unset NAME'], c => {
  for (const k of c.args) {
    if (!variable.test(k)) c.invalido(k);
    delete c.sesion.vars[k];
    c.sesion.exportadas.delete(k);
  }
});
const citar = texto => "'" + texto.replaceAll("'", "'\\''") + "'";
R('alias', ["alias ll='ls -l'", 'alias'], c => {
  const { aliases } = c.sesion;
  for (const arg of c.args.length ? c.args : [...aliases.keys()].sort()) {
    const dato = asignacion.exec(arg);
    if (dato) aliases.set(dato[1], dato[2]);
    else if (arg.startsWith('-')) c.invalido(arg);
    else if (aliases.has(arg)) c.out('alias ' + arg + '=' + citar(aliases.get(arg)) + '\n');
    else c.error('bash: alias: ' + arg + ': not found');
  }
});
R('unalias', ['unalias ll'], c => {
  if (!c.args.length) c.invalido('unalias');
  for (const arg of c.args) {
    if (arg.startsWith('-')) c.invalido(arg);
    if (!c.sesion.aliases.delete(arg)) c.error('bash: unalias: ' + arg + ': not found');
  }
});
for (const orden of ['which', 'type']) R(orden, [orden + ' ls'], c => {
  if (!c.args.length) c.invalido(orden);
  for (const arg of c.args) {
    if (arg.startsWith('-')) c.invalido(arg);
    const alias = c.sesion.aliases.get(arg);
    const entrada = buscar(c.sesion, arg);
    if (orden === 'type' && alias !== undefined) c.out(arg + " is aliased to `" + alias + "'\n");
    else if (orden === 'type' && c.sesion.funciones?.has(arg)) c.out(arg + ' is a function\n');
    else if (orden === 'type' && integradas.has(arg)) c.out(arg + ' is a shell builtin\n');
    else if (entrada) c.out((orden === 'type' ? arg + ' is ' : '') + entrada.ruta + '\n');
    else if (orden === 'type') c.error('bash: type: ' + arg + ': not found');
    else c.codigo = 1;
  }
});
CR.Shell.Entorno = { buscar, PATH, R, integradas, binarios };
})(globalThis.CR = globalThis.CR || {});
