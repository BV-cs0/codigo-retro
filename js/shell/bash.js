(function (S) {
'use strict';
if (typeof module !== 'undefined') {
  require('./bash-sintaxis');
  require('./bash-integradas');
}
const E = S.Ejecutor, I = S.BashIntegradas;
const expandir = S.Expansion.expandir;
const calcular = (texto, s) => S.Aritmetica.calcular(texto, s.vars);
const lineasEntrada = texto => ({ filas: S.Base.filas(texto), parcial: Boolean(texto) && !texto.endsWith('\n') });
function argumentos(s, args) {
  s.args = args;
  for (let i = 1; i <= 9; i++) s.vars[i] = args[i - 1];
}
function control(tipo, codigo = 0) {
  throw Object.assign(new Error(tipo), { control: tipo, codigo });
}
function diagnostico(c, texto, codigo, guia) {
  const prefijo = c.sesion.terminalBash ? 'bash: ' : c.sesion.archivoBash + ': line ' + (c.linea || 1) + ': ';
  c.error(prefijo + texto, codigo, guia);
}
function consejoAsignacion(c) {
  const [variable, igual, valor] = c.palabras.map(p => p.original);
  if (!/^[A-Za-z_]\w*$/.test(variable) || !igual?.startsWith('=')) return;
  const asignacion = igual === '=' ? igual + (valor ?? '') : igual;
  return 'En Bash no puede haber espacios alrededor de =. Escribe ' + variable + asignacion + '.';
}
function* funcion(c, nodo, profundidad) {
  if (profundidad >= 100) control('limite', 2);
  const s = c.sesion, args = s.args, locales = s.locales;
  s.locales = new Map();
  argumentos(s, c.args);
  try {
    yield* E.ejecutarNodo(nodo.cuerpo, s, c.resultado, c.entrada, c.captura, profundidad + 1);
  } catch (e) {
    if (e.control !== 'return') throw e;
    c.codigo = e.codigo;
  } finally {
    for (const [k, v] of s.locales) {
      if (v === undefined) delete s.vars[k];
      else s.vars[k] = v;
    }
    s.locales = locales;
    argumentos(s, args);
  }
}
function asignar(c, local) {
  const s = c.sesion;
  if (local && !s.locales) return c.error('local: can only be used in a function');
  for (const arg of c.args) {
    const m = arg.match(/^([a-zA-Z_]\w*)(?:=(.*))?$/s);
    if (!m) return c.error(c.nombre + ': ' + arg + ': not a valid identifier');
    const [, k, v] = m;
    if (local && !s.locales.has(k)) { s.locales.set(k, s.vars[k]); s.vars[k] = ''; }
    if (v !== undefined) s.vars[k] = v;
  }
}
function* invocar(c, profundidad) {
  const s = c.sesion, nombre = c.nombre;
  if (s.funciones.has(nombre)) return yield* funcion(c, s.funciones.get(nombre), profundidad);
  if (nombre === 'read') return yield* I.leer(c);
  if (nombre === 'printf') return I.imprimir(c);
  if (nombre === 'local' || nombre === 'export') return asignar(c, nombre === 'local');
  if (nombre === ':' || nombre === 'true' || nombre === 'false') { c.codigo = +(nombre === 'false'); return; }
  if (nombre === 'set') {
    if (c.args[0] !== '--') return diagnostico(c,
      'set: esta forma no está en este simulador. Usa set -- ... para cambiar los parámetros posicionales.', 2);
    argumentos(s, c.args.slice(1));
    return;
  }
  if (nombre === 'shift') {
    const n = Number(c.args[0] ?? 1);
    if (!Number.isInteger(n) || n < 0 || n > s.args.length) c.codigo = 1;
    else argumentos(s, s.args.slice(n));
    return;
  }
  if (nombre === 'exit' || nombre === 'return') {
    const valor = c.args[0] ?? String(s.codigo);
    if (nombre === 'return' && !s.locales) return diagnostico(c, 'return: solo se admite dentro de una función', 1);
    if (!/^[+-]?\d+$/.test(valor)) {
      diagnostico(c, nombre + ': ' + valor + ': numeric argument required', 2);
      control(nombre, 2);
    }
    if (c.args.length > 1) return diagnostico(c, nombre + ': too many arguments', 1);
    control(nombre, (Number(valor) % 256 + 256) % 256);
  }
  if (nombre === 'break' || nombre === 'continue') {
    if (s.bucles) control(nombre);
    return diagnostico(c, nombre + ': only meaningful in a loop', 0, 'Usa esta orden dentro de un bucle.');
  }
  if (nombre === '[' || nombre === 'test') {
    const args = c.args.slice();
    if (nombre === '[' && args.pop() !== ']') return diagnostico(c, "[: missing ']'", 2);
    try { c.codigo = I.prueba(args, s) ? 0 : 1; }
    catch (e) { diagnostico(c, nombre + ': ' + e.message, 2); }
    return;
  }
  const excluido = ['eval', 'trap', 'getopts', 'select', 'declare', 'readonly'].includes(nombre);
  if (excluido) return diagnostico(c, nombre + ' no está en este simulador', 2);
  diagnostico(c, nombre + ': command not found', 127, consejoAsignacion(c));
}
const propias = new Set(['read', 'printf', 'local', 'export', ':', 'true', 'false', 'set', 'shift', 'exit', 'return', 'break', 'continue', '[', 'test']);
function integrada(c, _, profundidad) {
  if (!c.nombre || c.nombre.includes('/')) return;
  if (c.sesion.terminalBash && c.nombre === 'sudo' && !c.sesion.funciones.has(c.nombre)) return;
  if (c.sesion.funciones.has(c.nombre) || propias.has(c.nombre) || !S.Base.comandos[c.nombre])
    return invocar(c, profundidad);
}
function* ejecutar(nodo, s, r, entrada, captura, profundidad) {
  yield* E.ejecutarNodo(nodo, s, r, entrada, captura, profundidad);
  s.codigo = r.codigo;
}
function resolverEntrada(redir, s) {
  if (redir.valor === '<<') {
    return redir.literal ? redir.documento : S.Expansion.expandirDocumento(redir.documento, s);
  }
  const rutas = expandir(redir.destino, s);
  if (rutas.length !== 1) throw new Error('ambiguous redirect');
  return s.fs.leer(s.ruta(rutas[0], false));
}
function* iterar(n, s, r, e, c, p) {
  const valores = n.modo === 'for' && !n.formulas ?
    (n.valores ? n.valores.flatMap(t => expandir(t, s)) : s.args.slice()) : null;
  const [inicio, condicion, paso] = n.formulas || [];
  if (inicio?.trim()) calcular(inicio, s);
  let ultimo = 0;
  for (let i = 0; ; i++) {
    antes(n, s);
    if (valores) {
      if (i === valores.length) break;
      s.vars[n.variable] = valores[i];
    } else if (n.formulas) {
      if (condicion.trim() && !calcular(condicion, s)) break;
    } else {
      yield* ejecutar(n.condicion, s, r, e, c, p);
      if ((r.codigo === 0) === (n.modo === 'until')) break;
    }
    try { yield* ejecutar(n.cuerpo, s, r, e, c, p); ultimo = r.codigo; }
    catch (error) {
      if (error.control === 'break') { ultimo = 0; break; }
      if (error.control !== 'continue') throw error;
      ultimo = 0;
    }
    if (paso?.trim()) calcular(paso, s);
  }
  r.codigo = ultimo;
}
const ejecutores = {
  *ramas(n, s, r, e, c, p) {
    for (const { condicion, cuerpo } of n.ramas) {
      yield* ejecutar(condicion, s, r, e, c, p);
      if (r.codigo === 0) return yield* ejecutar(cuerpo, s, r, e, c, p);
    }
    if (n.resto) yield* ejecutar(n.resto, s, r, e, c, p);
    else r.codigo = 0;
  },
  *bucle(n, s, r, e, c, p) {
    const previa = s.entradaBash;
    s.bucles = (s.bucles ?? 0) + 1;
    try {
      if (n.entrada) {
        e = resolverEntrada(n.entrada, s);
        s.entradaBash = lineasEntrada(e);
      }
      yield* iterar(n, s, r, e, c, p);
    } finally { s.entradaBash = previa; s.bucles--; }
  },
  *funcion(n, s, r) { s.funciones.set(n.nombre, n); r.codigo = 0; },
  *aritmetica(n, s, r) { r.codigo = calcular(n.texto, s) ? 0 : 1; },
  *condicion(n, s, r) { r.codigo = I.condicion(n.texto, s) ? 0 : 1; },
  *casos(n, s, r, e, c, p) {
    const [valor] = expandir(n.selector, s, true);
    for (const opcion of n.opciones) {
      const coincide = opcion.patrones.some(t => S.Expansion.patronPalabra(t, s).test(valor));
      if (coincide) return yield* ejecutar(opcion.cuerpo, s, r, e, c, p);
    }
    r.codigo = 0;
  }
};
function antes(n, s) {
  if (n.tipo !== 'lista' && ++s.limiteBash.ordenes > 20000) control('limite', 2);
  if (n.linea) s.lineaBash = n.linea;
}
const dialecto = {
  ejecutores, analizar: S.BashSintaxis.analizar, antes, invocar: integrada,
  tuberia(hijo, entrada, i) {
    hijo.funciones = new Map(hijo.funciones);
    if (i) hijo.entradaBash = lineasEntrada(entrada);
  }
};
function inicializar(s, archivo, { args = [], entradas, entrada = '', flujoEntrada, interactiva } = {}) {
  s.vars[0] = archivo;
  argumentos(s, args);
  s.funciones = new Map();
  s.locales = null;
  s.bucles = 0;
  s.entradaBash = flujoEntrada ?? (entradas ? { filas: entradas.slice() } :
    entrada ? lineasEntrada(entrada) : { filas: [], interactiva });
}
function sesionTerminal(opciones) {
  const s = new E.Sesion({ ...opciones, dialecto });
  s.terminalBash = true;
  inicializar(s, 'bash', { interactiva: true });
  return s;
}
function* programa(script, s, r, opciones = {}) {
  const { archivo = 'script.sh', entrada = '', profundidad = 0, heredar = false, terminal = false } = opciones;
  s.dialecto = dialecto;
  s.archivoBash = archivo;
  s.destinoBash = r;
  s.terminalBash = terminal;
  if (!heredar) inicializar(s, archivo, opciones);
  if (terminal) s.limiteBash = { ordenes: 0 };
  s.limiteBash ||= { ordenes: 0 };
  s.lineaBash = 1;
  let analizado = false;
  try {
    const ast = dialecto.analizar(script);
    analizado = true;
    if (terminal && !ast.pasos.length) { r.codigo = s.codigo; return; }
    r.codigo = 0;
    yield* ejecutar(ast, s, r, entrada, terminal ? s.captura : true, profundidad);
  } catch (e) {
    r.codigo = e.codigo ?? 2;
    if (['exit', 'return'].includes(e.control)) return;
    const c = E.contexto(s, '', [], entrada, true, r);
    c.linea = e.linea ?? (analizado ? s.lineaBash : script.split('\n').length);
    diagnostico(c, e.control === 'limite' ? 'execution limit exceeded' : e.message, r.codigo,
      e.control === 'limite' ? 'Tu script no termina. ¿El bucle cambia la variable de la condición?' : undefined);
  } finally { s.codigo = r.codigo; }
}
function capturar(script, s) {
  const hijo = s.subsesion(), r = E.salida(5000);
  const heredar = s.dialecto === dialecto;
  if (heredar) { hijo.funciones = new Map(s.funciones); hijo.locales = s.locales && new Map(s.locales); }
  hijo.pasoBash = false;
  const iterador = programa(script, hijo, r, { heredar, archivo: s.archivoBash, entradas: [] });
  if (heredar) hijo.entradaBash = { filas: [] };
  const paso = iterador.next();
  if (!paso.done) throw new Error('No se admite entrada interactiva en esta sustitución.');
  s.codigoSustitucion = r.codigo;
  if (r.error && s.destinoBash) {
    for (const evento of r.eventos.filter(e => ['error', 'guia'].includes(e.estilo)))
      E.transferir(s.destinoBash, { eventos: [evento], codigo: s.destinoBash.codigo });
  } else if (r.error) throw new Error(r.error.trimEnd());
  return r.salida.replace(/\n+$/, '');
}
function preparar(script, opciones = {}) {
  const sesion = new E.Sesion(opciones);
  sesion.pasoBash = opciones.paso;
  if (opciones.vars) Object.assign(sesion.vars, opciones.vars);
  const resultado = E.salida(5000);
  const iterador = programa(script, sesion, resultado, { ...opciones, heredar: false });
  return { sesion, resultado, iterador };
}
function correr(script, opciones = {}) {
  const { sesion, resultado, iterador } = preparar(script, { entradas: [], ...opciones });
  iterador.next();
  return { ...resultado, stderr: resultado.error, fs: sesion.fs, variables: { ...sesion.vars } };
}
S.Bash = { programa, capturar, preparar, correr, lineasEntrada, dialecto, sesionTerminal };
if (typeof module !== 'undefined') module.exports = S.Bash;
})(globalThis.CR.Shell);
