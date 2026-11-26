(function (CR) {
'use strict';
const Shell = CR.Shell;
const { R, PATH } = Shell.Entorno;
const { SFA } = Shell.SFA;
function red(idioma) {
  const en = idioma === 'en';
  const [local, boya, relevo, vigia] = en ? ['beacon7', 'buoy', 'relay', 'watcher'] : ['faro7', 'boya', 'relevo', 'vigia'];
  const hosts = [[local, '10.7.0.1'], [boya, '10.7.0.12'], ['radio', '10.7.0.20'], [relevo, '10.7.0.30']];
  return { local, boya, relevo, vigia, hosts,
    archivo: hosts.map(([host, ip]) => ip + ' ' + host + ' ' + host + '.local\n').join('') };
}
function resolver(s, host) {
  const archivo = s.fs.nodos.has('/etc/hosts') ? s.fs.leer('/etc/hosts') : s.reto ? '' : red(s.idioma).archivo;
  for (const linea of archivo.split('\n')) {
    const [ip, nombre, ...aliases] = linea.split('#')[0].trim().split(/\s+/);
    if (nombre && [nombre, ...aliases, ip].includes(host)) return [nombre, ip];
  }
}
function ip(s) { return resolver(s, s.identidad.maquina)?.[1] ?? ''; }
R('ip', ['ip addr'], c => {
  if (c.args.join(' ') !== 'addr') c.invalido(c.args.join(' ') || 'ip');
  c.out('1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 state UNKNOWN\n' +
    '    inet 127.0.0.1/8 scope host lo\n' +
    '2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 state UP\n' +
    '    inet ' + ip(c.sesion) + '/24 brd ' + (c.sesion.reto ? '10.9.0.255' : '10.7.0.255') + ' scope global eth0\n');
}, { addr: CR.t('faro2.ipAddr') });
R('ping', ['ping -c 2 boya'], c => {
  const [op, cantidad, host] = c.args;
  if (c.args.length !== 3 || op !== '-c' || !/^\d+$/.test(cantidad) ||
      Number(cantidad) < 1 || Number(cantidad) > 10) c.invalido(c.args.join(' ') || 'ping');
  const entrada = resolver(c.sesion, host);
  if (!entrada) return c.error('ping: ' + host + ': Name or service not known', 2);
  const [nombre, direccion] = entrada;
  const n = Number(cantidad);
  c.out('PING ' + host + ' (' + direccion + ') 56(84) bytes of data.\n');
  for (let i = 1; i <= n; i++)
    c.out('64 bytes from ' + nombre + ' (' + direccion + '): icmp_seq=' + i + ' ttl=64 time=0.420 ms\n');
  c.out('\n--- ' + host + ' ping statistics ---\n' + n + ' packets transmitted, ' + n +
    ' received, 0% packet loss, time ' + (n - 1) * 1000 + 'ms\n' +
    'rtt min/avg/max/mdev = 0.420/0.420/0.420/0.000 ms\n');
}, { '-c N': CR.t('faro2.pingC') });
const estados = { 200: 'OK', 201: 'Created', 204: 'No Content', 301: 'Moved Permanently', 302: 'Found',
  400: 'Bad Request', 401: 'Unauthorized', 403: 'Forbidden', 404: 'Not Found', 500: 'Internal Server Error' };
function respuesta(c, flags, codigo, cuerpo, extras = {}) {
  if (!flags.I) return c.out(cuerpo);
  const cabeceras = { 'Content-Type': 'text/plain; charset=utf-8',
    'Content-Length': Shell.SFA.bytes(cuerpo), ...extras };
  c.out('HTTP/1.1 ' + codigo + ' ' + (estados[codigo] ?? '') + '\r\n' +
    Object.entries(cabeceras).map(([clave, valor]) => clave + ': ' + valor + '\r\n').join('') + '\r\n');
}
function sitio(c, flags, rutas, url) {
  const ruta = Object.hasOwn(rutas, url.pathname) ? rutas[url.pathname] : undefined;
  const variantes = Array.isArray(ruta) ? ruta : ruta ? [ruta] : [];
  const cookies = new Map((flags.b || '').split(';').map(par => par.trim().split(/=(.*)/s, 2)));
  const ficha = variantes.find(v => Object.entries(v.cookie ?? {}).every(([k, valor]) => cookies.get(k) === valor) &&
    Object.entries(v.parametros ?? {}).every(([k, valor]) => url.searchParams.get(k) === valor));
  respuesta(c, flags, ficha?.codigo ?? 404, ficha?.cuerpo ?? '', ficha?.cabeceras);
}
R('curl', ['curl http://boya.local/estado', 'curl -I http://boya.local/estado',
  'curl -b "name=value" -s "http://example.local/path?name=value"'], c => {
  const { args, flags } = Shell.Base.opciones(c, 'Is', 'b');
  let url;
  try { url = new URL(args[0]); } catch { return c.invalido(args[0] || 'curl'); }
  if (args.length !== 1 || !['http:', 'https:'].includes(url.protocol) || url.username || url.password)
    return c.invalido(args.join(' '));
  const sitios = c.sesion.reto?.sitios ?? {};
  if (Object.hasOwn(sitios, url.origin)) return sitio(c, flags, sitios[url.origin], url);
  const entrada = resolver(c.sesion, url.hostname);
  if (!entrada) return c.error('curl: (6) Could not resolve host: ' + url.hostname, 6);
  const { boya } = red(c.sesion.idioma);
  const en = c.sesion.idioma === 'en';
  const ruta = url.pathname;
  const rutaEstado = en ? '/status' : '/estado';
  const cuerpo = ruta === '/' ? entrada[0] + '\n' : entrada[0] === boya && ruta === rutaEstado ?
    CR.t[c.sesion.idioma]('faro2.temperatura') + '\n' : '';
  respuesta(c, flags, cuerpo ? 200 : 404, cuerpo);
}, { '-I': CR.t('faro2.curlI'), '-b NAME=VALUE': idioma => CR.t[idioma]('atalaya.cookie'), '-s': idioma => CR.t[idioma]('atalaya.silent'),
  '?NAME=VALUE': idioma => CR.t[idioma]('atalaya.query') });
function conectar(s, cuenta, remoto) {
  const campos = ['identidad', 'fs', 'cwd', 'vars', 'exportadas', 'aliases', 'visitadas', 'leidos', 'procesos', 'funciones'];
  s.local = Object.fromEntries(campos.map(k => [k, s[k]]));
  const home = '/home/' + cuenta.vigia;
  s.identidad = { home, usuario: cuenta.vigia, maquina: cuenta.relevo };
  s.fs = new SFA({ '/etc/hosts': cuenta.archivo, ...remoto.fs }, s.identidad);
  s.cwd = home;
  s.vars = Object.assign(Object.create(null),
    { HOME: home, USER: cuenta.vigia, HOSTNAME: cuenta.relevo, PWD: home, PATH });
  s.exportadas = new Set(Object.keys(s.vars));
  s.aliases = new Map();
  if (s.funciones) s.funciones = new Map();
  s.visitadas = new Set(['/', '/home', home]);
  s.leidos = s.leidosRemotos;
  s.procesos = new Map();
}
R('ssh', ['ssh vigia@relevo'], c => {
  const s = c.sesion;
  const cuenta = red(s.idioma);
  const remoto = s.mision?.remoto ?? s.configRemota;
  if (c.args.length !== 1 || !/^[\w-]+@[\w.-]+$/.test(c.args[0]) || s.local) c.invalido(c.args.join(' ') || 'ssh');
  const [usuario, host] = c.args[0].split('@');
  const destino = resolver(s, host);
  if (!destino) return c.error('ssh: Could not resolve hostname ' + host + ': Name or service not known', 255);
  if (destino[0] !== cuenta.relevo || !remoto) return c.error('ssh: connect to host ' + host + ' port 22: Connection refused', 255);
  c.preguntar(c.args[0] + CR.t[s.idioma]('faro2.password'), clave => {
    if (usuario !== cuenta.vigia || clave !== remoto.clave) return c.error(c.args[0] + ': Permission denied (password).', 255);
    conectar(s, cuenta, remoto);
    c.out(CR.t[s.idioma]('faro2.conectado') + '\n');
  }, true);
});
R('exit', ['exit'], c => {
  if (c.args.length || !c.sesion.local) c.invalido(c.args.join(' ') || 'exit');
  const host = c.sesion.identidad.maquina;
  Object.assign(c.sesion, c.sesion.local);
  c.sesion.local = null;
  c.out('logout\nConnection to ' + host + ' closed.\n');
});
Shell.Red = { red, ip };
})(globalThis.CR = globalThis.CR || {});
