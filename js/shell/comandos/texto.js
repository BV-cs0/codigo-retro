(function (CR) {
'use strict';
const traducir = typeof module !== 'undefined' ? require('../../comun/idioma').t : globalThis.CR.t;
const Shell = CR.Shell = CR.Shell || {};
const B = typeof module !== 'undefined' ? require('./base') : Shell.Base;
const { S, registrar: R, opciones, archivos, lineas, filas, cmp } = B;
R('echo', traducir("shell.escribe_texto"), ['echo hola', "echo -e 'a\\nb'"], c => {
  const args = [...c.args];
  let flags = '';
  while (/^-[neE]+$/.test(args[0] || '')) flags += args.shift().slice(1);
  let salida = args.join(' ');
  if (flags.lastIndexOf('e') > flags.lastIndexOf('E')) {
    const escapes = { n: '\n', t: '\t', r: '\r', b: '\b', a: '\x07', '\\': '\\' };
    salida = salida.replace(/\\([ntrab\\])/g, (_, letra) => escapes[letra]);
  }
  c.out(salida + (flags.includes('n') ? '' : '\n'));
}, { '-n': traducir("shell.omite_el_salto_final"), '-e': traducir("shell.interpreta_escapes") });
R('cat', traducir("shell.lee_o_concatena_archivos"), ['cat nota.txt', "cat -n nota.txt"], c => {
  const { args, flags } = opciones(c, 'n');
  let numero = 1;
  let inicio = true;
  archivos(c, args, texto => {
    for (const linea of lineas(texto)) {
      c.out((flags.n && inicio ? String(numero++).padStart(6) + '\t' : '') + linea);
      inicio = linea.endsWith('\n');
    }
  });
}, { '-n': traducir("shell.numera_las_lineas") });
R('less', traducir("shell.muestra_un_archivo_en_el_historial"), ['less nota.txt', "less manual.txt"], c => {
  archivos(c, opciones(c).args, texto => c.out(texto));
});
function recortar(nombre, datos, cantidad) {
  const n = Number(cantidad);
  if (nombre === 'head') return datos.slice(0, n < 0 ? Math.max(0, datos.length + n) : n);
  return datos.slice(cantidad.startsWith('+') ? Math.max(0, n - 1) : Math.max(0, datos.length - Math.abs(n)));
}
for (const nombre of ['head', 'tail']) R(nombre, traducir("shell.muestra") + (nombre === 'head' ? traducir("shell.el_principio") : traducir("shell.el_final")) + traducir("shell.de_un_archivo"),
  [nombre + ' nota.txt', nombre + ' -n 1 nota.txt'], c => {
    let abreviada;
    const argumentos = c.args.map((a, i) => {
      if (!/^-\d+$/.test(a) || ['-n', '-c'].includes(c.args[i - 1]) || c.args.slice(0, i).includes('--')) return a;
      abreviada = a;
      return '-n' + a.slice(1);
    });
    const cc = { ...c, args: argumentos };
    const { args, flags } = opciones(cc, '', 'nc');
    if (nombre === 'tail' && abreviada && args.length > 1) {
      return c.error('tail: option used in invalid context -- ' + abreviada.slice(1));
    }
    const modo = Object.keys(flags).at(-1);
    const cantidad = flags[modo] ?? '10';
    if (!/^[+-]?\d+$/.test(cantidad)) return c.error(nombre + ': invalid number of ' +
      (modo === 'c' ? 'bytes' : 'lines') + ": '" + cantidad + "'");
    let vistos = 0;
    archivos(c, args, (texto, archivo, total) => {
      if (total > 1) c.out((vistos++ ? '\n' : '') + '==> ' + (archivo === '-' ? "standard input" : archivo) + ' <==\n');
      if (modo === 'c') {
        const bytes = recortar(nombre, new TextEncoder().encode(texto), cantidad);
        try { c.out(new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes)); }
        catch { c.error(nombre + traducir("shell.el_corte_deja_una_secuencia")); }
      } else c.out(recortar(nombre, lineas(texto), cantidad).join(''));
    });
  }, { '-n N': traducir("shell.selecciona_n_lineas"), '-c N': traducir("shell.selecciona_n_bytes"), '-N': traducir("shell.forma_abreviada") });
R('wc', traducir("shell.cuenta_lineas_palabras_y_bytes"), ['wc nota.txt', "wc -l nota.txt"], c => {
  const { args, flags } = opciones(c, 'lwc');
  const seleccion = ['l', 'w', 'c'].filter(k => flags[k] || !Object.keys(flags).length);
  const registros = [];
  const total = [0, 0, 0];
  let maximo = 0;
  archivos(c, args, (texto, nombre) => {
    const cuenta = { l: (texto.match(/\n/g) || []).length, w: texto.match(/\S+/g)?.length || 0, c: S.bytes(texto) };
    maximo += cuenta.c;
    const numeros = seleccion.map((k, i) => { total[i] += cuenta[k]; return cuenta[k]; });
    registros.push([numeros, nombre === '-' && !args.length ? '' : nombre]);
  });
  if (args.length > 1) registros.push([total.slice(0, seleccion.length), 'total']);
  const ancho = seleccion.length === 1 && args.length <= 1 ? 1 :
    (args.length && !args.includes('-') ? String(maximo).length : 7);
  for (const [numeros, nombre] of registros) {
    c.out(numeros.map(n => String(n).padStart(ancho)).join(' ') + (nombre ? ' ' + nombre : '') + '\n');
  }
}, { '-l': traducir("shell.lineas"), '-w': traducir("shell.palabras"), '-c': traducir("shell.bytes_utf_8") });
function claveOrden(texto, flags) {
  if (!flags.k) return texto;
  const campos = flags.t ? texto.split(flags.t) : texto.match(/\s*\S+/g) || [];
  const [desde, hasta] = flags.k.split(',').map(Number);
  return campos.slice(desde - 1, hasta || campos.length).join(flags.t || '');
}
R('sort', traducir("shell.ordena_lineas"), ['sort nombres.txt', "sort -rn puntos.txt"], c => {
  const { args, flags } = opciones(c, 'rnu', 'kt');
  if (flags.t && [...flags.t].length !== 1) return c.invalido('-t');
  if (flags.k && !/^[1-9]\d*(?:,[1-9]\d*)?$/.test(flags.k)) return c.invalido('-k');
  const datos = [];
  archivos(c, args, texto => datos.push(...filas(texto)));
  const numero = valor => Number(valor.match(/^\s*-?(?:\d+\.?\d*|\.\d+)/)?.[0] || 0);
  function comparar(a, b) {
    a = claveOrden(a, flags);
    b = claveOrden(b, flags);
    return flags.n ? numero(a) - numero(b) : cmp(a, b);
  }
  datos.sort((a, b) => (flags.r ? -1 : 1) * (comparar(a, b) || (flags.u ? 0 : cmp(a, b))));
  datos.forEach((dato, i) => {
    if (!flags.u || !i || comparar(datos[i - 1], dato)) c.out(dato + '\n');
  });
}, { '-r': traducir("shell.orden_inverso"), '-n': traducir("shell.orden_numerico"), '-u': traducir("shell.una_fila_por_clave"), '-k N': traducir("shell.campo_inicial"), '-t C': traducir("shell.separador") });
R('uniq', traducir("shell.agrupa_lineas_iguales_consecutivas"), ['sort nombres.txt | uniq', "uniq -c nombres.txt"], c => {
  const { args, flags } = opciones(c, 'cd');
  if (args.length > 1) return c.invalido(args[1]);
  archivos(c, args, texto => {
    const datos = filas(texto);
    for (let i = 0; i < datos.length;) {
      let j = i + 1;
      while (j < datos.length && datos[i] === datos[j]) j++;
      if (!flags.d || j - i > 1) c.out((flags.c ? String(j - i).padStart(7) + ' ' : '') + datos[i] + '\n');
      i = j;
    }
  });
}, { '-c': traducir("shell.cuenta_cada_grupo"), '-d': traducir("shell.muestra_grupos_repetidos") });
R('cut', traducir("shell.selecciona_campos_de_cada_linea"), ["cut -d' ' -f2 datos.txt", 'cut -d: -f1,3 datos.txt'], c => {
  const { args, flags } = opciones(c, '', 'dfc');
  const lista = flags.c ?? flags.f;
  if (!lista || (flags.c && (flags.f || flags.d))) return c.invalido(flags.c ? '-c' : '-f');
  if (!/^(?:[1-9]\d*(?:-[1-9]?\d*)?|-[1-9]\d*)(?:,(?:[1-9]\d*(?:-[1-9]?\d*)?|-[1-9]\d*))*$/.test(lista)) {
    return c.invalido(flags.c ? '-c' : '-f');
  }
  const divisor = flags.d ?? '\t';
  if ([...divisor].length !== 1) return c.invalido('-d');
  const rangos = lista.split(',').map(r => r.includes('-') ? r.split('-') : [r, r]);
  if (rangos.some(([a, b]) => b && Number(a) > Number(b))) return c.error("cut: invalid decreasing range");
  const elegir = (_, i) => rangos.some(([a, b]) => i + 1 >= Number(a || 1) && i + 1 <= (b ? Number(b) : Infinity));
  archivos(c, args, texto => {
    for (const fila of filas(texto)) {
      if (flags.c) {
        const bytes = new TextEncoder().encode(fila).filter(elegir);
        try { c.out(new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes) + '\n'); }
        catch { c.error(traducir("shell.cut_el_corte_deja_una")); }
      } else if (!fila.includes(divisor)) c.out(fila + '\n');
      else c.out(fila.split(divisor).filter(elegir).join(divisor) + '\n');
    }
  });
}, { '-d C': traducir("shell.separador_de_campos"), '-f N': traducir("shell.campos_que_se_conservan"), '-c N': traducir("shell.posiciones_que_se_conservan") });
function conjunto(texto) {
  const escapes = { n: '\n', t: '\t', r: '\r', '\\': '\\' };
  const chars = Array.from(texto.replace(/\\([ntr\\])/g, (_, c) => escapes[c]));
  const salida = [];
  for (let i = 0; i < chars.length; i++) {
    if (chars[i + 1] === '-' && chars[i + 2] && chars[i] <= chars[i + 2]) {
      for (let n = chars[i].codePointAt(0); n <= chars[i + 2].codePointAt(0); n++) salida.push(String.fromCodePoint(n));
      i += 2;
    } else salida.push(chars[i]);
  }
  return salida;
}
R('tr', traducir("shell.sustituye_o_elimina_caracteres_de_la"), ['echo hola | tr a-z A-Z', "echo faro | tr -d 'a'"], c => {
  const { args, flags } = opciones(c, 'd');
  if (args.length !== (flags.d ? 1 : 2) || !args[0] || (!flags.d && !args[1])) return c.invalido('tr');
  const origen = conjunto(args[0]);
  const destino = flags.d ? [] : conjunto(args[1]);
  const mapa = new Map(origen.map((letra, i) => [letra, destino[Math.min(i, destino.length - 1)] ?? '']));
  c.out(Array.from(c.entrada, letra => mapa.get(letra) ?? letra).join(''));
}, { '-d': traducir("shell.elimina_los_caracteres_del_conjunto") });
R('file', traducir("shell.identifica_archivos_y_carpetas"), ['file nota.txt', 'file .'], c => {
  const { args } = opciones(c);
  const ancho = Math.max(0, ...args.map(a => a.length));
  for (const arg of args) {
    let tipo;
    try {
      const nodo = c.fs.obtener(c.ruta(arg));
      tipo = nodo.carpeta ? 'directory' : nodo.contenido ? 'ASCII text' : 'empty';
    } catch (e) { tipo = "cannot open '" + arg + "' (" + e.message + ')'; }
    c.out((arg + ':').padEnd(ancho + 2) + tipo + '\n');
  }
});
})(globalThis.CR = globalThis.CR || {});

