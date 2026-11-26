(function (CR) {
'use strict';
const traducir = typeof module !== 'undefined' ? require('../../comun/idioma').t : globalThis.CR.t;
const Shell = CR.Shell = CR.Shell || {};
const { S, registrar: R, opciones, recorrer, filas } = typeof module !== 'undefined' ? require('./base') : Shell.Base;
function ejecutarFind(c, args) {
  const fin = args.indexOf(';');
  if (fin < 1) c.invalido('-exec');
  const [nombre, ...plantilla] = args.splice(0, fin + 1).slice(0, -1);
  const ejecutar = Shell.Base.comandos[nombre];
  if (!ejecutar || ['bash', 'find', 'clear', 'cd', 'ssh', 'exit'].includes(nombre)) c.invalido('-exec ' + nombre);
  return ruta => {
    const codigo = c.codigo;
    try {
      c.codigo = 0;
      ejecutar({
        ...c, nombre, args: plantilla.map(a => a.replaceAll('{}', ruta)),
        get codigo() { return c.codigo; },
        set codigo(valor) { c.codigo = valor; }
      });
      return c.codigo === 0;
    } finally { c.codigo = codigo; }
  };
}
function filtroFind(c, args) {
  const filtros = [];
  let profundidad = Infinity;
  while (args.length) {
    const op = args.shift();
    if (op === '-exec') {
      filtros.push(ejecutarFind(c, args));
      filtros.exec = true;
      continue;
    }
    const valor = op === '-empty' ? '' : args.shift();
    if (op === '-name' || op === '-iname') {
      if (valor === undefined) c.invalido(op);
      const sensible = op === '-name';
      const regex = S.patron(sensible ? valor : valor.toLowerCase());
      filtros.push(r => regex.test(sensible ? S.nombre(r) : S.nombre(r).toLowerCase()));
    } else if (op === '-type' && ['d', 'f', 'l'].includes(valor)) {
      filtros.push((_, n) => (n.enlace !== undefined ? 'l' : n.carpeta ? 'd' : 'f') === valor);
    } else if (op === '-user' && valor) filtros.push((_, n) => n.dueno === valor);
    else if (op === '-perm' && ['-4000', '-o+w'].includes(valor)) {
      filtros.push((_, n) => valor === '-4000' ? n.suid : n.permisos[7] === 'w');
    } else if (op === '-maxdepth' && /^\d+$/.test(valor)) profundidad = Number(valor);
    else if (op === '-empty') filtros.push((r, n) => n.carpeta ? !c.fs.listar(c.ruta(r)).length : !n.contenido);
    else if (op === '-size' && /^[+-]?\d+[kcM]$/.test(valor)) {
      const cantidad = Math.abs(parseInt(valor, 10));
      filtros.push((_, n) => {
        const bytes = Shell.Espacio?.tamano(n) ?? (n.carpeta ? 4096 : S.bytes(n.contenido));
        const real = Math.ceil(bytes / ({ k: 1024, M: 1048576, c: 1 }[valor.at(-1)]));
        return valor.startsWith('+') ? real > cantidad : valor.startsWith('-') ? real < cantidad : real === cantidad;
      });
    } else c.invalido(op);
  }
  return { filtros, profundidad };
}
R('find', traducir("shell.busca_rutas_por_nombre_tipo"), ['find /srv -name "*.txt"', 'find . -type d -empty',
  'find /var/log -type f -size +50M', 'find / -perm -4000 -user root', 'find . -perm -o+w'], c => {
  const args = [...c.args];
  const raices = [];
  while (args.length && !args[0].startsWith('-')) raices.push(args.shift());
  const { filtros, profundidad } = filtroFind(c, args);
  for (const raiz of raices.length ? raices : ['.']) {
    recorrer(c, raiz, profundidad, (ruta, nodo) => {
      if (filtros.every(f => f(ruta, nodo)) && !filtros.exec) c.out(ruta + '\n');
    });
  }
}, { '-name P': traducir("shell.patron_de_nombre"), '-iname P': traducir("shell.ignora_mayusculas"), '-type f/d': traducir("shell.archivo_o_carpeta"),
  '-perm -4000 / -o+w': idioma => traducir[idioma]('atalaya.perm'), '-user NAME': idioma => traducir[idioma]('atalaya.owner'),
  '-size N': traducir("faro2.findSize"), '-maxdepth N': traducir("shell.limite_de_profundidad"), '-empty': traducir("shell.entradas_vacias"),
  '-exec ORDEN {} \\;': traducir("shell.ejecuta_una_orden_simulada_por") });
function expresion(patron, flags) {
  const texto = flags.F ? patron.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') :
    flags.E ? patron : patron.replace(/\\(.)|([+?|(){}])/g, (m, escape, especial) => {
    if (escape && '+?|(){}'.includes(escape)) return escape;
    return especial ? '\\' + especial : m;
  });
  return new RegExp(flags.x ? '^(?:' + texto + ')$' : flags.w ? '(?<!\\w)(?:' + texto + ')(?!\\w)' : texto, flags.i ? 'i' : '');
}
function procesar(c, flags, regex, archivo, texto, prefijo) {
  const coincidencias = [];
  filas(texto).forEach((fila, i) => {
    if (regex.test(fila) !== Boolean(flags.v)) coincidencias.push([fila, i + 1]);
  });
  if (flags.l) {
    if (coincidencias.length) c.out(archivo + '\n');
  } else if (flags.c) c.out(prefijo + coincidencias.length + '\n');
  else for (const [fila, n] of coincidencias) c.out(prefijo + (flags.n ? n + ':' : '') + fila + '\n');
  return coincidencias.length > 0;
}
R('grep', traducir("shell.filtra_lineas_por_un_patron"), ['grep -n tormenta manual.txt', 'grep -ri contraseña /srv'], c => {
  const { args, flags } = opciones(c, 'hinrcvlwExF');
  if (!args.length) return c.invalido('grep');
  const patron = args.shift();
  let regex;
  try { regex = expresion(patron, flags); }
  catch { return c.error('grep: Invalid regular expression', 2); }
  let encontrado = false;
  function leer(ruta, mostrar) {
    const nombre = ruta === '-' ? '(standard input)' : ruta;
    try {
      const texto = ruta === '-' ? c.entrada : c.fs.leer(c.ruta(ruta));
      encontrado = procesar(c, flags, regex, nombre, texto, mostrar && !flags.h ? nombre + ':' : '') || encontrado;
    } catch (e) { c.error('grep: ' + ruta + ': ' + e.message, 2); }
  }
  for (const ruta of args.length ? args : [flags.r ? '.' : '-']) {
    if (flags.r && ruta !== '-' && c.fs.nodos.get(c.ruta(ruta))?.carpeta) {
      recorrer(c, ruta, Infinity, (visible, nodo) => { if (!nodo.carpeta) leer(visible, true); });
    } else leer(ruta, args.length > 1);
  }
  if (!encontrado && !c.codigo) c.codigo = 1;
}, { '-i': traducir("shell.ignora_mayusculas"), '-n': traducir("shell.numera_las_coincidencias"), '-r': traducir("shell.recorre_carpetas"),
  '-c': traducir("shell.cuenta_coincidencias"), '-v': traducir("shell.invierte_el_filtro"), '-l': traducir("shell.solo_nombres"), '-w': traducir("shell.palabras_completas"), '-E': traducir("shell.expresion_extendida") });
})(globalThis.CR = globalThis.CR || {});

