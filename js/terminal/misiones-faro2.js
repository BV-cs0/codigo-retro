(function (CR) {
'use strict';
const Shell = CR.Shell = CR.Shell || {};
if (typeof module !== 'undefined') require('../comun/idioma');
const datos = {
  es: { user: 'aprendiz', fake: 'baliza-falsa', ghost: 'eco-fantasma', noise: 'radio-ruido',
    shift: 'TURNO', turno: 'noche', mode: 'FARO_MODO', light: 'luz', report: 'informe',
    old: 'viejo', logs: ['tormenta.log', 'marea.log', 'hoy.log', 'copia.dat'], other: 'radio',
    map: 'mapa', carta: '/srv/cartas/mapa-costa.txt', config: '/etc/faro/config',
    boya: 'boya', status: 'estado', relay: 'relevo', watcher: 'vigia', note: 'nota.txt', log: 'parte.txt',
    clave: 'marea-7', canal: 'canal-16', informe: 'informe_red.txt', respuesta: 'responder' },
  en: { user: 'apprentice', fake: 'fake-beacon', ghost: 'ghost-echo', noise: 'radio-noise',
    shift: 'SHIFT', turno: 'night', mode: 'BEACON_MODE', light: 'light', report: 'report',
    old: 'old', logs: ['storm.log', 'tide.log', 'today.log', 'backup.dat'], other: 'radio',
    map: 'map', carta: '/srv/charts/coast-map.txt', config: '/etc/beacon/config',
    boya: 'buoy', status: 'status', relay: 'relay', watcher: 'watcher', note: 'note.txt', log: 'log.txt',
    clave: 'tide-7', canal: 'channel-16', informe: 'network_report.txt', respuesta: 'answer' }
};
function construir(idioma) {
  const d = datos[idioma];
  const traduccion = (id, datos) => CR.t[idioma]('faro2.' + id, datos);
  const cwd = '/home/' + d.user;
  const uso = (s, nombre, cumple = () => true) => s.invocaciones.some(p => p.nombre === nombre && cumple(p));
  const crear = (id, comandos, solucion, comprobar, opciones = {}, valor) => {
    const [titulo, texto, objetivo, pista, cierre] = traduccion(id).split('|');
    const objetivos = [{ tipo: 'faro2', texto: objetivo, comprobar }];
    if (valor !== undefined) objetivos.push({ tipo: 'respuesta', texto: traduccion('responde'), valor });
    return { id, titulo, texto, cierre, pistas: [pista], comandos: comandos.split(' '), solucion, objetivos,
      cwd, idioma, fs: {}, ...opciones };
  };
  const capitulo = (n, misiones) => ({ titulo: traduccion('c' + n), temporada: 2, misiones });
  return [capitulo(9, procesos(d, crear, uso)), capitulo(10, entorno(d, crear, uso, traduccion, cwd)),
    capitulo(11, espacio(d, crear, uso, traduccion, cwd)), capitulo(12, red(d, crear, uso, traduccion, cwd))];
}
function procesos(d, m, uso) {
  const p = (pid, command, cpu, mem = 0.2, user = d.user) => ({ pid, command, cpu, mem, user, ppid: pid === 1 ? 0 : 1 });
  const tabla = { procesos: [p(1, 'init', 0.1, 0.3, 'root'), p(110, 'bash', 0.2), p(120, d.fake, 87.4, 4.1)] };
  const fantasma = { procesos: [...tabla.procesos.slice(0, 2), { ...p(130, d.ghost, 15.5), resiste: true }] };
  const clones = { procesos: [...tabla.procesos.slice(0, 2), ...[141, 142, 143].map(id => p(id, d.noise, 7.2))] };
  return [
    m('9-1', 'ps', ['ps'], s => uso(s, 'ps'), tabla),
    m('9-2', 'ps', ['ps aux', d.respuesta + ' 120'], s => uso(s, 'ps', p => p.args[0] === 'aux'), tabla, '120'),
    m('9-3', 'pgrep kill', ['pgrep -l ' + d.fake, 'kill 120'],
      s => !s.procesos.has(120) && uso(s, 'kill'), tabla),
    m('9-4', 'pgrep kill', ['pgrep -l ' + d.ghost, 'kill 130', 'kill -9 130'],
      s => !s.procesos.has(130) && uso(s, 'kill', p => p.args[0] === '-9'), fantasma),
    m('9-5', 'pgrep killall', ['pgrep -l ' + d.noise, 'killall ' + d.noise],
      s => [141, 142, 143].every(id => !s.procesos.has(id)) && (uso(s, 'pgrep') || uso(s, 'killall')), clones)
  ];
}
function entorno(d, m, uso, t, cwd) {
  const bin = '/usr/local/bin';
  const orden = cwd + '/bin/' + d.light;
  const modo = d.mode + '=' + d.turno;
  return [
    m('10-1', 'env printenv', ['printenv ' + d.shift, d.respuesta + ' ' + d.turno],
      s => uso(s, 'env') || uso(s, 'printenv', p => !p.args.length || p.args.includes(d.shift)),
      { entorno: { [d.shift]: d.turno } }, d.turno),
    m('10-2', 'export unset printenv', ['export ' + modo], s => s.vars[d.mode] === d.turno && s.exportadas.has(d.mode)),
    m('10-3', 'mkdir echo chmod export', ['mkdir -p ~/bin', 'echo "echo ' + t('modoTexto') + '" > ~/bin/' + d.light,
      'chmod +x ~/bin/' + d.light, 'export PATH="$HOME/bin:$PATH"', d.light],
      s => uso(s, d.light, p => p.archivo === orden && p.cwd === cwd)),
    m('10-4', 'alias unalias ls', ["alias ll='ls -l'", 'll'], s => s.aliases.get('ll') === 'ls -l' && uso(s, 'll'),
      { fs: { [d.note]: '' } }),
    m('10-5', 'which type', ['which ' + d.report, d.respuesta + ' ' + bin],
      s => ['which', 'type'].some(n => uso(s, n, p => p.args.includes(d.report))),
      { fs: { [bin + '/' + d.report]: { contenido: 'echo ' + t('modoTexto') + '\n', permisos: 'rwxr-xr-x' } } }, bin)
  ];
}
function apunta(s, ruta, destino) {
  if (s.fs.nodos.get(ruta)?.enlace !== destino) return false;
  try { return s.fs.leer(ruta) === s.fs.leer(destino); } catch { return false; }
}
function espacio(d, m, uso, t, cwd) {
  const viejo = '/var/log/' + d.old;
  const rutas = d.logs.map(n => viejo + '/' + n);
  const archivo = (mib, contenido = '') => ({ contenido, simBytes: mib * 1024 ** 2 });
  const fs = { [viejo + '/']: { dueno: d.user, permisos: 'rwxr-xr-x' },
    [rutas[0]]: archivo(82), [rutas[1]]: archivo(64), [rutas[2]]: archivo(24, '03:14\n'),
    [rutas[3]]: archivo(52), ['/var/log/' + d.other + '/radio.log']: archivo(4) };
  return [
    m('11-1', 'df', ['df -h', d.respuesta + ' 95%'], s => uso(s, 'df'), { fs }, '95%'),
    m('11-2', 'du', ['du -h --max-depth=1 /var/log', d.respuesta + ' ' + viejo],
      s => uso(s, 'du'), { fs }, viejo),
    m('11-3', 'find rm du', ["find " + viejo + " -type f -name '*.log' -size +50M", 'rm ' + rutas.slice(0, 2).join(' ')],
      s => rutas.slice(0, 2).every(r => !s.fs.nodos.has(r)) && rutas.slice(2).every(r => {
        const n = s.fs.nodos.get(r);
        return n?.simBytes === fs[r].simBytes && n.contenido === fs[r].contenido;
      }), { fs }),
    m('11-4', 'ln readlink ls', ['ln -s ' + d.carta + ' ~/' + d.map, 'readlink ~/' + d.map],
      s => apunta(s, cwd + '/' + d.map, d.carta), { fs: { [d.carta]: t('mapa') + '\n' } }),
    m('11-5', 'readlink rm ln cat', ['readlink ~/config', 'rm ~/config', 'ln -s ' + d.config + ' ~/config', 'cat ~/config'],
      s => apunta(s, cwd + '/config', d.config), { fs: { '~/config': { enlace: d.config + '.old', permisos: 'rwxrwxrwx' },
        [d.config]: t('activa') + '\n' } })
  ];
}
function red(d, m, uso, t, cwd) {
  const url = 'http://' + d.boya + '.local/' + d.status;
  const ip = '10.7.0.1';
  const remoto = { clave: d.clave, fs: { ['~/' + d.log]: t('parte', { canal: d.canal }) + '\n' } };
  const fs = { ['~/' + d.note]: t('nota', { clave: d.clave }) + '\n' };
  const pasos = ['cat ~/' + d.note, 'ssh ' + d.watcher + '@' + d.relay, d.clave, 'cat ~/' + d.log];
  const leido = s => s.leidosRemotos.has('/home/' + d.watcher + '/' + d.log);
  return [
    m('12-1', 'ip hostname', ['ip addr', d.respuesta + ' ' + ip],
      s => uso(s, 'ip') || uso(s, 'hostname', p => p.args[0] === '-I'), { red: true }, ip),
    m('12-2', 'ping', ['ping -c 2 ' + d.boya],
      s => uso(s, 'ping', p => [d.boya, d.boya + '.local', '10.7.0.12'].includes(p.args[2])), { red: true }),
    m('12-3', 'curl', ['curl ' + url, d.respuesta + ' 14'],
      s => uso(s, 'curl', p => p.args[0] === url || p.args[0] === url.replace(d.boya + '.local', '10.7.0.12')),
      { red: true }, '14'),
    m('12-4', 'ssh cat exit', pasos, leido, { fs, remoto, red: true }),
    m('12-5', 'ssh cat exit echo', [...pasos, 'exit', 'echo ' + d.canal + ' > ~/' + d.informe],
      s => leido(s) && !s.local && uso(s, 'exit') && s.fs.nodos.get(cwd + '/' + d.informe)?.contenido.trim() === d.canal,
      { fs, remoto, red: true })
  ];
}
Shell.MisionesFaro2 = construir;
if (typeof module !== 'undefined') module.exports = construir;
})(globalThis.CR = globalThis.CR || {});
