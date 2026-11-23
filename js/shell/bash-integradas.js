(function (S) {
'use strict';
const numeros = { '-eq': '==', '-ne': '!=', '-lt': '<', '-le': '<=', '-gt': '>', '-ge': '>=' };
function archivo(op, ruta, sesion) {
  let nodo;
  try { nodo = sesion.fs.obtener(sesion.ruta(ruta, false)); }
  catch { return false; }
  if (op === '-e') return true;
  if (op === '-d') return nodo.carpeta;
  if (op === '-f') return !nodo.carpeta;
  if (op === '-s') return nodo.carpeta || Boolean(nodo.contenido);
  return S.SFA.permite(nodo, op[1]);
}
function prueba(args, sesion, doble = false, patron) {
  const [a, op, b] = args;
  if (!args.length) return false;
  if (args.length === 1) return Boolean(a);
  if (a === '!' && (args.length === 2 || args.length === 4 ||
    args.length === 3 && /^-[fderwxszn]$/.test(op)))
    return !prueba(args.slice(1), sesion, doble, patron);
  if (args.length === 2 && /^-[fderwxs]$/.test(a)) return archivo(a, op, sesion);
  if (args.length === 2 && ['-z', '-n'].includes(a)) return a === '-z' ? !op : Boolean(op);
  if (args.length !== 3) throw new Error('too many arguments');
  if (['=', '==', '!='].includes(op)) {
    const igual = doble ? patron.test(a) : a === b;
    return op === '!=' ? !igual : igual;
  }
  if (op === '<' || op === '>') return op === '<' ? S.Base.cmp(a, b) < 0 : S.Base.cmp(a, b) > 0;
  if (doble && op === '=~') return patron.test(a);
  if (!Object.hasOwn(numeros, op)) throw new Error('binary operator expected');
  if (!/^[+-]?\d+$/.test(a) || !/^[+-]?\d+$/.test(b))
    throw new Error((/^[+-]?\d+$/.test(a) ? b : a) + ': integer expression expected');
  const decimal = v => String(BigInt(v));
  return Boolean(S.Aritmetica.calcular(decimal(a) + numeros[op] + decimal(b), sesion.vars));
}
function condicion(texto, sesion) {
  const grupos = [[]];
  for (const t of S.Lexico.tokenizar(texto)) {
    if (['&&', '||'].includes(t.valor)) grupos.push(t.valor, []);
    else grupos.at(-1).push(t);
  }
  function grupo(g) {
    const args = g.map(t => t.valor ?? S.Expansion.expandir(t, sesion, true)[0] ?? '');
    const derecho = args.at(-1);
    const libre = g.at(-1)?.partes?.every(p => p.modo === 'libre');
    const regex = args.includes('=~') && libre ? new RegExp(derecho) :
      g.at(-1)?.partes ? S.Expansion.patronPalabra(g.at(-1), sesion) : S.SFA.patron(derecho ?? '');
    return prueba(args, sesion, true, regex);
  }
  let todos = true;
  for (let i = 0; i < grupos.length; i += 2) {
    todos = todos && grupo(grupos[i]);
    if (grupos[i + 1] === '||') {
      if (todos) return true;
      todos = true;
    }
  }
  return todos;
}
function escapes(texto) {
  const mapa = { n: '\n', t: '\t', r: '\r', b: '\b', a: '\x07', '\\': '\\' };
  return texto.replace(/\\([ntrab\\])/g, (_, c) => mapa[c]);
}
function imprimir(c) {
  const [formato, ...args] = c.args;
  if (formato === undefined) return c.error('printf: falta el formato', 2);
  let i = 0;
  const plantilla = escapes(formato);
  if ([...plantilla.matchAll(/%-?(\d+)s/g)].some(m => Number(m[1]) > 100000)) return c.invalido('ancho de formato');
  if (/%(?!%|-?\d*s|d|\.2f)/.test(plantilla.replace(/%%/g, ''))) return c.invalido('formato');
  for (;;) {
    const inicial = i;
    c.out(plantilla.replace(/%%|%(-?\d*)s|%d|%\.2f/g, (m, ancho) => {
      if (m === '%%') return '%';
      const v = args[i++] ?? '';
      if (ancho !== undefined) return ancho.startsWith('-') ? v.padEnd(-Number(ancho)) : v.padStart(Number(ancho));
      const n = Number(v);
      if (!Number.isFinite(n)) c.error('printf: ' + v + ': invalid number');
      return m === '%d' ? String(Math.trunc(n || 0)) : (n || 0).toFixed(2);
    }));
    if (i >= args.length || i === inicial) return;
  }
}
function repartir(linea, campos, crudo) {
  const unidades = [];
  for (let i = 0; i < linea.length; i++) {
    const letra = linea[i];
    if (!crudo && letra === '\\') {
      if (i + 1 < linea.length) unidades.push({ letra: linea[++i], separador: false });
    } else unidades.push({ letra, separador: /[ \t]/.test(letra) });
  }
  if (!campos.length) return [unidades.map(u => u.letra).join('')];
  let desde = 0, hasta = unidades.length;
  while (hasta && unidades[hasta - 1].separador) hasta--;
  return campos.map((_, i) => {
    while (desde < hasta && unidades[desde].separador) desde++;
    let fin = hasta;
    if (i < campos.length - 1) {
      fin = desde;
      while (fin < hasta && !unidades[fin].separador) fin++;
    }
    const valor = unidades.slice(desde, fin).map(u => u.letra).join('');
    desde = fin;
    return valor;
  });
}
function* leer(c) {
  const args = c.args.slice();
  let prompt = '', crudo = false;
  while (args[0]?.startsWith('-')) {
    const opcion = args.shift();
    if (opcion === '-r') crudo = true;
    else if (opcion === '-p' && args.length) prompt = args.shift();
    else if (opcion === '--') break;
    else return c.invalido(opcion);
  }
  const s = c.sesion;
  const entrada = c.entradaRedirigida ? S.Bash.lineasEntrada(c.entrada) : s.entradaBash;
  let linea = entrada.filas.length ? entrada.filas.shift() : entrada.interactiva ? yield prompt : undefined;
  while (!crudo && linea?.endsWith('\\') && /(?:^|[^\\])(?:\\\\)*\\$/.test(linea) && entrada.filas.length)
    linea = linea.slice(0, -1) + entrada.filas.shift();
  const campos = args.length ? args : ['REPLY'];
  const valores = repartir(linea ?? '', args, crudo);
  for (const [i, nombre] of campos.entries()) {
    if (!/^[A-Za-z_]\w*$/.test(nombre)) return c.error('read: ' + nombre + ': not a valid identifier');
    s.vars[nombre] = valores[i];
  }
  c.codigo = linea === undefined || (entrada.parcial && !entrada.filas.length) ? 1 : 0;
}
S.BashIntegradas = { prueba, condicion, imprimir, leer };
})(globalThis.CR.Shell);
