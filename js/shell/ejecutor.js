(function (CR) {
'use strict';
const traducir = typeof module !== 'undefined' ? require('../comun/idioma').t : globalThis.CR.t;
const Shell = CR.Shell = CR.Shell || {};
if (typeof module !== 'undefined') {
  require('./sfa');
  require('./analizador');
  require('./expansion');
  for (const nombre of ['rutas', 'listado', 'texto', 'buscar', 'diff', 'sesion', 'entorno', 'procesos', 'espacio', 'red'])
    require('./comandos/' + nombre);
  require('./hashes');
  require('./comandos/atalaya');
  require('./ayuda');
}
const { SFA, identidad, rutaAbsoluta } = Shell.SFA;
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
      if (explicacion !== false) {
        const guia = explicacion || Shell.Ayuda.explicar(texto, sesion.idioma);
        resultado.guia.push(guia);
        resultado.eventos.push({ texto: guia + '\n', estilo: 'guia' });
      }
      resultado.codigo = codigo;
    },
    invalido: argumento => {
      const nombreCompleto = argumento === nombre ? nombre : nombre + ' ' + argumento;
      const ejemplo = nombre === 'ls' ? "ls -l" : Shell.Ayuda.ficha(nombre, sesion.idioma)?.ejemplos[0] || 'help';
      throw new Error(nombreCompleto + traducir[sesion.idioma]("shell.no_esta_en_este_simulador_prueba") + ejemplo + '.');
    },
    preguntar: (texto, continuar, oculta = false) => { resultado.pendiente = { texto, continuar, oculta }; }
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
    catch (e) { c.error(c.nombre + ": write error: " + e.message); delete flujo.error; }
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
  const sudoAntiguo = nombre === 'sudo' && !c.sesion.reto && (!c.sesion.terminalBash || !c.args.length);
  const comando = sudoAntiguo ? undefined : comandos[Shell.Ayuda.canonico(nombre, c.sesion.idioma)];
  const encontrado = !nombre.includes('/') ? Shell.Entorno?.buscar(c.sesion, nombre) : null;
  if (encontrado && !encontrado.virtual && !Shell.Entorno.integradas.has(nombre))
    c.script = { archivo: encontrado.ruta, args: c.args, directo: true };
  else if (comando && (encontrado || !Shell.Entorno.binarios.has(nombre))) comando(c);
  else if (nombre.includes('/')) c.script = { archivo: nombre, args: c.args, directo: true };
  else if (nombre === 'sudo' && c.sesion.idioma === 'es' && !c.sesion.dialecto) { c.out(traducir("shell.aqui_no_hay_sudo_ni")); c.codigo = 127; }
  else if (Shell.Ayuda.noDisponibles.has(nombre))
    c.error(nombre + traducir[c.sesion.idioma]("shell.no_esta_en_este_simulador_2") + '.', 127, false);
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
// sudo de Atalaya: el script autorizado corre como root y al terminar se vuelve al usuario.
function* comoRoot(c, programa) {
  const sesion = c.sesion, fs = sesion.fs;
  const antes = { usuario: fs.usuario, identidad: sesion.identidad, USER: sesion.vars.USER, HOME: sesion.vars.HOME };
  fs.usuario = 'root';
  sesion.identidad = { ...antes.identidad, usuario: 'root', home: '/root' };
  Object.assign(sesion.vars, { USER: 'root', HOME: '/root' });
  try { return yield* programa(); }
  finally {
    fs.usuario = antes.usuario;
    sesion.identidad = antes.identidad;
    Object.assign(sesion.vars, { USER: antes.USER, HOME: antes.HOME });
  }
}
function* ejecutarScript(c, profundidad) {
  if (c.script.comoRoot) return yield* comoRoot(c, () => leerYEjecutarScript(c, profundidad));
  return yield* leerYEjecutarScript(c, profundidad);
}
function* leerYEjecutarScript(c, profundidad) {
  if (profundidad >= 100) return c.error(traducir("shell.bash_demasiados_scripts_anidados"), 2);
  const { archivo, args, directo } = c.script;
  const ruta = c.ruta(archivo);
  let texto;
  try {
    const nodo = c.fs.obtener(ruta);
    if (directo && !c.fs.permite(nodo, 'x')) throw new Error('Permission denied');
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
function expandirAlias(nodo, sesion) {
  const vistos = new Set();
  let palabras = nodo.palabras;
  while (palabras[0]?.partes.length === 1 && palabras[0].partes[0].modo === 'libre') {
    const nombre = palabras[0].partes[0].texto;
    if (vistos.has(nombre) || !sesion.aliases.has(nombre)) break;
    vistos.add(nombre);
    const { pasos } = sesion.analizar(sesion.aliases.get(nombre));
    const reemplazo = pasos[0]?.nodo;
    if (pasos.length !== 1 || reemplazo.tipo !== 'simple' || !reemplazo.palabras.length ||
        reemplazo.asignaciones.length || reemplazo.redirecciones.length)
      throw new Error(traducir[sesion.idioma]('faro2.aliasSimple'));
    palabras = [...reemplazo.palabras, ...palabras.slice(1)];
  }
  return { palabras, alias: vistos.values().next().value };
}
function expandirArgumento(palabra, sesion, declaracion) {
  const [primera, ...resto] = palabra.partes;
  const asignacion = declaracion && primera.modo === 'libre' && /^[A-Za-z_]\w*=/.exec(primera.texto);
  if (!asignacion) return expandir(palabra, sesion);
  const prefijo = asignacion[0];
  const partes = [{ ...primera, texto: primera.texto.slice(prefijo.length) }, ...resto];
  return [prefijo + expandir({ partes }, sesion, true)[0]];
}
function* continuarPreguntas(resultado, volcar) {
  while (resultado.pendiente) {
    const { texto, continuar, oculta } = resultado.pendiente;
    delete resultado.pendiente;
    volcar();
    // Una pregunta oculta (contraseña) viaja como objeto para que la terminal no muestre lo escrito.
    continuar(yield oculta ? { pregunta: texto, oculta: true } : texto);
  }
}
function* simple(nodo, sesion, destino, entrada, captura, profundidad) {
  const resultado = salida(5000);
  const cwd = sesion.cwd;
  sesion.codigoSustitucion = undefined;
  const { palabras, alias } = expandirAlias(nodo, sesion);
  const declaracion = ['local', 'export'].includes(palabras[0]?.partes[0]?.texto);
  const argumentos = palabras.flatMap((p, i) => expandirArgumento(p, sesion, declaracion && i > 0));
  const nombre = argumentos.shift();
  const c = contexto(sesion, nombre, argumentos, entrada, captura, resultado);
  c.resultado = resultado;
  c.linea = nodo.linea;
  c.palabras = palabras;
  const flujo = {};
  c.volcar = () => volcar(resultado, destino, flujo, c);
  const vars = sesion.vars;
  const argsPrevios = sesion.args;
  const temporal = nombre && nodo.asignaciones.length;
  const exportadas = sesion.exportadas;
  if (temporal) {
    sesion.vars = Object.assign(Object.create(null), vars);
    sesion.exportadas = new Set([...exportadas, ...nodo.asignaciones.map(a => a.nombre)]);
  }
  try {
    redirigir(nodo, sesion, c, flujo);
    for (const { nombre, partes } of nodo.asignaciones) sesion.vars[nombre] = expandir({ partes }, sesion, true)[0] || '';
    const integrado = sesion.dialecto?.invocar?.(c, destino, profundidad);
    if (integrado) yield* ejecutarIntegrada(integrado, c.volcar);
    else invocar(c);
    if (!nombre) c.codigo = sesion.codigoSustitucion ?? 0;
    if (c.script) yield* ejecutarScript(c, profundidad);
    yield* continuarPreguntas(resultado, c.volcar);
  } catch (e) {
    if (e.control) {
      c.volcar();
      throw e;
    }
    c.error(e.message, e.message.startsWith('bash: ') ? 1 : 2);
  } finally {
    if (temporal) {
      restaurarVariables(sesion, vars, argsPrevios);
      sesion.exportadas = exportadas;
    }
  }
  c.volcar();
  if (nombre && resultado.codigo === 0) {
    sesion.usados.add(alias ?? nombre);
    sesion.invocaciones.push({ nombre: alias ?? nombre, args: argumentos.slice(), cwd, archivo: c.script?.archivo });
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
  if (!ejecutar) throw new Error(traducir("shell.estructura_no_soportada") + nodo.tipo);
  yield* ejecutar(nodo, sesion, destino, entrada, captura, profundidad);
}
class Sesion {
  constructor({ fs = {}, cwd, idioma, mision = null, captura = false, dialecto = null,
    entorno = {}, procesos = [], remoto, red = mision?.red, reto, cuenta } = {}) {
    this.idioma = idioma ?? CR.Idioma.actual();
    this.identidad = cuenta ?? identidad(this.idioma);
    this.reto = reto;
    this.entrega = { correcta: false };
    const { home, usuario, maquina } = this.identidad;
    this.fs = new SFA(red ? { '/etc/hosts': Shell.Red.red(this.idioma).archivo, ...fs } : fs,
      this.identidad);
    this.cwd = rutaAbsoluta(cwd ?? home, home, home);
    this.vars = Object.assign(Object.create(null), { HOME: home, USER: usuario, PWD: this.cwd });
    if (idioma === 'en' || cuenta) this.vars.HOSTNAME = maquina;
    if (Shell.Entorno) this.vars.PATH = Shell.Entorno.PATH;
    Object.assign(this.vars, entorno);
    this.exportadas = new Set([...Object.keys(this.vars), 'OLDPWD']);
    this.aliases = new Map();
    this.procesos = new Map(procesos.map(p => [p.pid, { ...p }]));
    this.configRemota = remoto;
    this.leidosRemotos = new Set();
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
      vars: Object.assign(Object.create(null), this.vars), visitadas: new Set(this.visitadas),
      exportadas: new Set(this.exportadas), aliases: new Map(this.aliases)
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
    else if (paso.value?.oculta) Object.assign(resultado, { pregunta: paso.value.pregunta, oculta: true });
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

