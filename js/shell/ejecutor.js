(function (CR) {
'use strict';
const Shell = CR.Shell = CR.Shell || {};
if (typeof module !== 'undefined') {
  require('./sfa');
  require('./analizador');
  require('./expansion');
  for (const nombre of ['rutas', 'listado', 'texto', 'buscar', 'diff', 'sesion']) require('./comandos/' + nombre);
  require('./ayuda');
}
const { SFA, HOME, rutaAbsoluta, permite } = Shell.SFA;
const { comandos } = Shell.Base;
const { analizar } = Shell.Analizador;
const { expandir } = Shell.Expansion;
function salida(limite = Infinity) {
  return { salida: '', error: '', guia: [], segmentos: [], eventos: [], codigo: 0, limite };
}
function agregar(destino, clave, texto, estilo = '') {
  if (!texto) return;
  let cuenta = destino[clave + 'Lineas'] || 0;
  if (cuenta >= destino.limite) return;
  let fin = 0;
  while ((fin = texto.indexOf('\n', fin)) >= 0) {
    fin++;
    if (++cuenta === destino.limite) { texto = texto.slice(0, fin); break; }
  }
  destino[clave + 'Lineas'] = cuenta;
  destino[clave] += texto;
  if (clave === 'salida') destino.segmentos.push({ texto, estilo });
  destino.eventos.push({ texto, estilo: clave === 'error' ? 'error' : estilo });
}
function transferir(destino, origen, omitirSalida = false) {
  for (const elemento of origen.eventos) {
    const { texto, estilo } = elemento;
    if (estilo === 'limpiar') destino.eventos.push(elemento);
    else if (estilo === 'guia') {
      destino.guia.push(texto.trimEnd());
      destino.eventos.push(elemento);
    } else if (estilo === 'error') agregar(destino, 'error', texto);
    else if (!omitirSalida) agregar(destino, 'salida', texto, estilo);
  }
  destino.codigo = origen.codigo;
}
function contexto(sesion, nombre, args, entrada, captura, resultado) {
  return {
    sesion, fs: sesion.fs, nombre, args, entrada, captura,
    ruta: ruta => sesion.ruta(ruta, false),
    get codigo() { return resultado.codigo; },
    set codigo(valor) { resultado.codigo = valor; },
    out: (texto, estilo) => agregar(resultado, 'salida', texto, estilo),
    error: (texto, codigo = 1, explicacion) => {
      agregar(resultado, 'error', texto + '\n');
      const guia = explicacion || Shell.Ayuda.explicar(texto);
      resultado.guia.push(guia);
      resultado.eventos.push({ texto: guia + '\n', estilo: 'guia' });
      resultado.codigo = codigo;
    },
    invalido: argumento => {
      const nombreCompleto = argumento === nombre ? nombre : nombre + ' ' + argumento;
      const ejemplo = nombre === 'ls' ? 'ls -l' : Shell.Ayuda.fichas[nombre]?.ejemplos[0] || 'help';
      throw new Error(nombreCompleto + ' no está en este simulador. Prueba ' + ejemplo + '.');
    },
    preguntar: (texto, continuar) => { resultado.pendiente = { texto, continuar }; }
  };
}
function redirigir(nodo, sesion, c, flujo) {
  for (const { operador, destino, documento, literal } of nodo.redirecciones) {
    if (operador === '<<') {
      c.entrada = literal ? documento : Shell.Expansion.expandirDocumento(documento, sesion);
      c.entradaRedirigida = true;
      continue;
    }
    const rutas = expandir(destino, sesion);
    if (rutas.length !== 1) throw new Error('bash: ambiguous redirect');
    const nombre = rutas[0];
    const ruta = c.ruta(nombre);
    try {
      if (operador === '<') { c.entrada = sesion.fs.leer(ruta); c.entradaRedirigida = true; }
      else {
        sesion.fs.escribir(ruta, '', operador === '>>');
        flujo[operador === '2>' ? 'error' : 'salida'] = ruta;
        c.captura = Boolean(flujo.salida) || c.captura;
      }
    } catch (e) { throw new Error('bash: ' + nombre + ': ' + e.message); }
  }
}
function vaciar(resultado) {
  for (const clave of ['salida', 'error']) {
    resultado[clave] = '';
    resultado[clave + 'Lineas'] = 0;
  }
  for (const clave of ['segmentos', 'guia', 'eventos']) resultado[clave] = [];
}
function volcar(resultado, destino, flujo, c) {
  for (const clave of ['salida', 'error']) {
    if (!flujo[clave] || !resultado[clave]) continue;
    try { c.fs.escribir(flujo[clave], resultado[clave], true); }
    catch (e) { c.error(c.nombre + ': write error: ' + e.message); delete flujo.error; }
  }
  for (const evento of resultado.eventos) {
    const { texto, estilo } = evento;
    if (estilo === 'error' || estilo === 'guia') {
      if (!flujo.error) transferir(destino, { eventos: [evento], codigo: resultado.codigo });
    } else if (estilo === 'limpiar') destino.eventos.push(evento);
    else if (!flujo.salida) agregar(destino, 'salida', texto, estilo);
  }
  destino.codigo = resultado.codigo;
  vaciar(resultado);
}
function invocar(c) {
  const nombre = c.nombre;
  if (!nombre) return;
  if (comandos[nombre]) comandos[nombre](c);
  else if (nombre.includes('/')) c.script = { archivo: nombre, args: c.args, directo: true };
  else if (nombre === 'sudo') { c.out('Aquí no hay sudo. Ni falta que hace.\n'); c.codigo = 127; }
  else c.error('bash: ' + nombre + ': command not found', 127);
}
function* ejecutarBash(c, texto, archivo, args, profundidad) {
  const hijo = c.sesion.subsesion();
  const resultado = salida(5000);
  const interactiva = !c.entradaRedirigida && !c.captura &&
    (c.sesion.dialecto !== Shell.Bash.dialecto || c.sesion.entradaBash?.interactiva);
  const opciones = { archivo, args, entrada: c.entrada, profundidad, interactiva };
  if (!c.entradaRedirigida && c.sesion.entradaBash) opciones.flujoEntrada = c.sesion.entradaBash;
  const programa = Shell.Bash.programa(texto, hijo, resultado, opciones);
  let indice = 0, respuesta;
  for (;;) {
    const paso = programa.next(respuesta);
    transferir(c.resultado, { eventos: resultado.eventos.slice(indice), codigo: resultado.codigo });
    indice = resultado.eventos.length;
    if (paso.done) return;
    c.volcar();
    respuesta = yield paso.value;
  }
}
function* ejecutarScript(c, profundidad) {
  if (profundidad >= 100) return c.error('bash: demasiados scripts anidados.', 2);
  const { archivo, args, directo } = c.script;
  const ruta = c.ruta(archivo);
  let texto;
  try {
    const nodo = c.fs.obtener(ruta);
    if (directo && !permite(nodo, 'x')) throw new Error('Permission denied');
    texto = c.fs.leer(ruta);
  } catch (e) { return c.error('bash: ' + archivo + ': ' + e.message, e.message === 'No such file or directory' ? 127 : 126); }
  if (Shell.Bash && !c.sesion.dialecto?.reglas) return yield* ejecutarBash(c, texto, archivo, args, profundidad + 1);
  const sesion = c.sesion.subsesion();
  sesion.vars[0] = archivo;
  args.forEach((arg, i) => { sesion.vars[i + 1] = arg; });
  const resultado = salida();
  for (const linea of texto.split('\n')) {
    try {
      yield* ejecutarNodo(sesion.analizar(linea), sesion, resultado, c.entrada, c.captura, profundidad + 1);
    } catch (e) { c.error('bash: ' + e.message, 2); return; }
    for (const { texto, estilo } of resultado.eventos) {
      if (estilo === 'error') agregar(c.resultado, 'error', texto);
      else if (estilo === 'guia' || estilo === 'limpiar') c.resultado.eventos.push({ texto, estilo });
      else c.out(texto, estilo);
    }
    vaciar(resultado);
  }
  c.codigo = sesion.codigo;
  if (sesion.aviso) c.sesion.aviso = sesion.aviso;
}
function* ejecutarIntegrada(integrada, volcar) {
  let paso = integrada.next();
  try {
    while (!paso.done) {
      volcar();
      paso = integrada.next(yield paso.value);
    }
  } finally { if (!paso.done) integrada.return(); }
}
function restaurarVariables(sesion, vars, argsPrevios) {
  if (sesion.vars === vars) return;
  if (sesion.args !== argsPrevios)
    for (let i = 1; i <= 9; i++) vars[i] = sesion.vars[i];
  sesion.vars = vars;
}
function* simple(nodo, sesion, destino, entrada, captura, profundidad) {
  const resultado = salida(5000);
  const cwd = sesion.cwd;
  sesion.codigoSustitucion = undefined;
  const declaracion = ['local', 'export'].includes(nodo.palabras[0]?.partes[0]?.texto);
  const argumentos = nodo.palabras.flatMap((p, i) => expandir(p, sesion,
    declaracion && i > 0 && /^[A-Za-z_]\w*=/.test(p.partes[0].texto)));
  const nombre = argumentos.shift();
  const c = contexto(sesion, nombre, argumentos, entrada, captura, resultado);
  c.resultado = resultado;
  c.linea = nodo.linea;
  c.palabras = nodo.palabras;
  const flujo = {};
  c.volcar = () => volcar(resultado, destino, flujo, c);
  const vars = sesion.vars;
  const argsPrevios = sesion.args;
  if (nombre && nodo.asignaciones.length) sesion.vars = Object.assign(Object.create(null), vars);
  try {
    redirigir(nodo, sesion, c, flujo);
    for (const { nombre, partes } of nodo.asignaciones) sesion.vars[nombre] = expandir({ partes }, sesion, true)[0] || '';
    const integrado = sesion.dialecto?.invocar?.(c, destino, profundidad);
    if (integrado) yield* ejecutarIntegrada(integrado, c.volcar);
    else invocar(c);
    if (!nombre) c.codigo = sesion.codigoSustitucion ?? 0;
    if (c.script) yield* ejecutarScript(c, profundidad);
    while (resultado.pendiente) {
      const { texto, continuar } = resultado.pendiente;
      delete resultado.pendiente;
      volcar(resultado, destino, flujo, c);
      continuar(yield texto);
    }
  } catch (e) {
    if (e.control) {
      volcar(resultado, destino, flujo, c);
      throw e;
    }
    c.error(e.message, e.message.startsWith('bash: ') ? 1 : 2);
  }
  finally { restaurarVariables(sesion, vars, argsPrevios); }
  volcar(resultado, destino, flujo, c);
  if (nombre && resultado.codigo === 0) {
    sesion.usados.add(nombre);
    sesion.invocaciones.push({ nombre, args: argumentos.slice(), cwd });
  }
}
const ejecutores = {
  simple,
  *lista(nodo, sesion, destino, entrada, captura, profundidad) {
    for (const { enlace, nodo: paso } of nodo.pasos) {
      if ((enlace === '&&' && sesion.codigo) || (enlace === '||' && !sesion.codigo)) continue;
      yield* ejecutarNodo(paso, sesion, destino, entrada, captura, profundidad);
      sesion.codigo = destino.codigo;
    }
  },
  *tuberia(nodo, sesion, destino, entrada, captura, profundidad) {
    for (const [i, etapa] of nodo.etapas.entries()) {
      const ultimo = i === nodo.etapas.length - 1;
      const hijo = sesion.subsesion();
      sesion.dialecto?.tuberia?.(hijo, entrada, i);
      const temporal = salida();
      yield* ejecutarNodo(etapa, hijo, temporal, entrada, !ultimo || captura, profundidad);
      transferir(destino, temporal, !ultimo);
      if (hijo.aviso) sesion.aviso = hijo.aviso;
      entrada = temporal.salida;
    }
  }
};
function* ejecutarNodo(nodo, sesion, destino, entrada, captura, profundidad) {
  sesion.dialecto?.antes?.(nodo, sesion);
  if (sesion.pasoBash && nodo.linea && nodo.tipo !== 'lista') yield { linea: nodo.linea };
  const ejecutar = sesion.dialecto?.ejecutores?.[nodo.tipo] ?? ejecutores[nodo.tipo];
  if (!ejecutar) throw new Error('Estructura no soportada: ' + nodo.tipo);
  yield* ejecutar(nodo, sesion, destino, entrada, captura, profundidad);
}
class Sesion {
  constructor({ fs = {}, cwd = HOME, mision = null, captura = false, dialecto = null } = {}) {
    this.fs = new SFA(fs);
    this.cwd = rutaAbsoluta(cwd);
    this.vars = Object.assign(Object.create(null), { HOME, USER: 'aprendiz', PWD: this.cwd });
    this.historial = [];
    this.visitadas = new Set(['/']);
    let ruta = this.cwd;
    while (ruta !== '/') { this.visitadas.add(ruta); ruta = Shell.SFA.padre(ruta); }
    this.usados = new Set();
    this.invocaciones = [];
    this.leidos = new Set();
    this.respuestas = new Set();
    this.mision = mision;
    this.codigo = 0;
    this.columnas = 80;
    this.captura = captura;
    this.dialecto = dialecto;
    this.pendiente = null;
  }
  ruta(ruta, expandirCasa = true) { return rutaAbsoluta(ruta, this.cwd, expandirCasa ? this.vars.HOME : null); }
  analizar(linea) {
    if (this.dialecto?.analizar) return this.dialecto.analizar(linea);
    return analizar(linea, this.dialecto?.reglas, this.dialecto?.tokenizar);
  }
  subsesion() {
    return Object.assign(Object.create(Sesion.prototype), this, {
      vars: Object.assign(Object.create(null), this.vars), visitadas: new Set(this.visitadas)
    });
  }
  ejecutar(linea) {
    this.aviso = '';
    if (this.pendiente) return this.avanzar(this.pendiente, linea);
    if (!linea.trim()) return { ...salida(), codigo: this.codigo };
    this.historial.push(linea);
    const resultado = salida();
    if (this.terminalBash) {
      this.estado = { destino: resultado, indice: 0 };
      return this.avanzar(Shell.Bash.programa(linea, this, resultado, { archivo: 'bash', heredar: true, terminal: true }));
    }
    try {
      const ast = this.analizar(linea);
      if (!ast.pasos.length) return { ...resultado, codigo: this.codigo };
      this.estado = { destino: resultado, indice: 0 };
      return this.avanzar(ejecutarNodo(ast, this, resultado, '', this.captura, 0));
    } catch (e) {
      contexto(this, '', [], '', false, resultado).error('bash: ' + e.message, 2);
      this.codigo = resultado.codigo;
      return resultado;
    }
  }
  avanzar(iterador, respuesta) {
    const resultado = salida();
    // Cada reanudación entrega solo los eventos nuevos de la misma ejecución.
    const estado = this.estado || { destino: null, indice: 0 };
    this.estado = estado;
    const paso = iterador.next(respuesta);
    const fuente = estado.destino;
    if (fuente) {
      transferir(resultado, { eventos: fuente.eventos.slice(estado.indice), codigo: fuente.codigo });
      estado.indice = fuente.eventos.length;
    }
    this.pendiente = paso.done ? null : iterador;
    if (paso.done) this.estado = null;
    else resultado.pregunta = paso.value;
    return { ...resultado, aviso: this.aviso };
  }
  cancelar() {
    this.pendiente?.return();
    this.pendiente = this.estado = null;
    this.codigo = 130;
  }
}
Shell.Ejecutor = { Sesion, comandos: Object.keys(comandos).sort(), ejecutarNodo, salida, agregar, transferir, contexto };
if (typeof module !== 'undefined') require('./bash');
if (typeof module !== 'undefined') module.exports = CR.Shell.Ejecutor;
})(globalThis.CR = globalThis.CR || {});

