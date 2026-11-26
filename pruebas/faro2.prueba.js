'use strict';
const assert = require('node:assert/strict');
require('../js/shell/ejecutor');
const { Bash } = globalThis.CR.Shell;
const misiones = {
  es: require('../js/terminal/misiones').capitulos,
  en: require('../js/terminal/misiones-en').capitulos
};
const casosBash = require('./datos-faro2-bash');

function abrir(id, idioma = 'es') {
  const mision = misiones[idioma].flatMap(c => c.misiones).find(m => m.id === id);
  return Bash.sesionTerminal({ ...mision, mision });
}
function comprobar(s, orden, salida, error = '', codigo = 0) {
  const r = s.ejecutar(orden);
  assert.deepEqual([r.salida, r.error, r.codigo], [salida, error, codigo], orden);
  return r;
}
const lineas = (...filas) => filas.join('\n') + '\n';

function procesos() {
  const s = abrir('9-2');
  comprobar(s, 'ps', lineas('    PID TTY          TIME CMD', '    110 pts/0    00:00:00 bash',
    '    120 pts/0    00:00:00 baliza-falsa'));
  comprobar(s, 'ps aux', lineas('USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND',
    'root          1  0.1  0.3   4096  1024 pts/0    S    03:14   0:00 init',
    'aprendiz    110  0.2  0.2   4096  1024 pts/0    S    03:14   0:00 bash',
    'aprendiz    120 87.4  4.1   4096  1024 pts/0    S    03:14   0:00 baliza-falsa'));
  comprobar(s, 'ps -ef', lineas('UID          PID    PPID  C STIME TTY          TIME CMD',
    'root           1       0  0 03:14 pts/0    00:00:00 init',
    'aprendiz     110       1  0 03:14 pts/0    00:00:00 bash',
    'aprendiz     120       1 87 03:14 pts/0    00:00:00 baliza-falsa'));
  comprobar(s, 'kill 1', '', 'bash: kill: (1) - Operation not permitted\n', 1);
  comprobar(s, 'pgrep -l init', '1 init\n');
  comprobar(s, 'kill 120; pgrep baliza-falsa', '', '', 1);
  const fantasma = abrir('9-4');
  comprobar(fantasma, 'kill 130; pgrep eco-fantasma', '130\n');
  comprobar(fantasma, 'kill -9 130; pgrep eco-fantasma', '', '', 1);
}

function disco() {
  comprobar(abrir('11-1'), 'df -h', lineas('Filesystem      Size  Used Avail Use% Mounted on',
    '/dev/sda1       1.0G  967M   58M  95% /'));
  const s = Bash.sesionTerminal({ fs: { 'charts/map': 'ok\n' } });
  comprobar(s, 'ln -s charts shortcut; cd shortcut; cat map', 'ok\n');
  comprobar(s, 'cd; ln -s missing broken; readlink broken', 'missing\n');
  comprobar(s, 'ls -l broken', 'lrwxrwxrwx 1 aprendiz aprendiz 7 Nov 16 03:14 broken -> missing\n');
  comprobar(s, 'cat broken', '', 'cat: broken: No such file or directory\n', 1);
  comprobar(s, 'rm broken; readlink broken', '', '', 1);
}

function entorno() {
  const s = Bash.sesionTerminal({ fs: { 'bin/demo': { contenido: 'echo ok\n' } } });
  comprobar(s, 'demo', '', 'bash: demo: command not found\n', 127);
  comprobar(s, 'export PATH=~/bin:$PATH; echo $PATH', '/home/aprendiz/bin:/usr/local/bin:/usr/bin:/bin\n');
  comprobar(s, 'which demo', '', '', 1);
  comprobar(s, 'chmod +x ~/bin/demo; type demo; demo', 'demo is /home/aprendiz/bin/demo\nok\n');
  comprobar(s, 'unset PATH; demo', '', 'bash: demo: command not found\n', 127);
}

function red() {
  const s = abrir('12-4');
  comprobar(s, 'ip addr', lineas('1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 state UNKNOWN',
    '    inet 127.0.0.1/8 scope host lo', '2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 state UP',
    '    inet 10.7.0.1/24 brd 10.7.0.255 scope global eth0'));
  comprobar(s, 'ping -c 2 boya', lineas('PING boya (10.7.0.12) 56(84) bytes of data.',
    '64 bytes from boya (10.7.0.12): icmp_seq=1 ttl=64 time=0.420 ms',
    '64 bytes from boya (10.7.0.12): icmp_seq=2 ttl=64 time=0.420 ms', '',
    '--- boya ping statistics ---', '2 packets transmitted, 2 received, 0% packet loss, time 1000ms',
    'rtt min/avg/max/mdev = 0.420/0.420/0.420/0.000 ms'));
  comprobar(s, 'ping -c 1 unknown', '', 'ping: unknown: Name or service not known\n', 2);
  comprobar(s, 'curl -I http://boya.local/estado',
    'HTTP/1.1 200 OK\r\nContent-Type: text/plain; charset=utf-8\r\nContent-Length: 29\r\n\r\n');
}

function ssh() {
  for (const [idioma, usuario, host, local, clave, conecta, archivo, parte] of [
    ['es', 'vigia', 'relevo', 'aprendiz', 'marea-7', 'Conexión simulada con el relevo.', 'parte.txt', 'Canal de reserva: canal-16'],
    ['en', 'watcher', 'relay', 'apprentice', 'tide-7', 'Simulated connection to the relay.', 'log.txt', 'Backup channel: channel-16']
  ]) {
    const s = abrir('12-4', idioma);
    const cuenta = usuario + '@' + host;
    const orden = 'ssh ' + cuenta;
    const pregunta = cuenta + "'s password: ";
    comprobar(s, 'touch local; alias demo="echo local"', '');
    const primera = comprobar(s, orden, '');
    assert.equal(primera.pregunta, pregunta);
    assert.equal(primera.oculta, true, 'la contraseña no se muestra al escribirla');
    comprobar(s, 'incorrect', '', cuenta + ': Permission denied (password).\n', 255);
    comprobar(s, 'whoami', local + '\n');
    assert.equal(comprobar(s, orden, '').pregunta, pregunta);
    comprobar(s, clave, conecta + '\n');
    assert.equal(s.identidad.maquina, host);
    comprobar(s, 'whoami; pwd; cat ~/' + archivo, lineas(usuario, '/home/' + usuario, parte));
    comprobar(s, 'cat local', '', 'cat: local: No such file or directory\n', 1);
    comprobar(s, 'touch remote; exit', lineas('logout', 'Connection to ' + host + ' closed.'));
    comprobar(s, 'whoami; pwd; ls -1 local; demo', lineas(local, '/home/' + local, 'local', 'local'));
    comprobar(s, 'cat remote', '', 'cat: remote: No such file or directory\n', 1);
  }
}

function ayuda() {
  const ordenes = ('ps pgrep kill killall env printenv export unset alias unalias which type ln readlink ' +
    'ls du df find hostname ip ping curl ssh exit').split(' ');
  for (const idioma of ['es', 'en']) {
    const s = Bash.sesionTerminal({ idioma });
    const nombres = s.ejecutar('help').salida.split('\n').map(l => l.split(/\s+/)[0]);
    for (const nombre of ordenes) {
      assert.ok(nombres.includes(nombre), nombre);
      const manual = s.ejecutar('man ' + nombre);
      assert.equal(manual.codigo, 0, nombre);
      assert.match(manual.salida, idioma === 'es' ? /\nEjemplos\n/ : /\nExamples\n/);
    }
    assert.match(s.ejecutar('man ssh').salida, idioma === 'es' ? /ssh vigia@relevo/ : /ssh watcher@relay/);
  }
}

module.exports = prueba => {
  prueba('Faro 2 · ps, señales y permisos', procesos);
  prueba('Faro 2 · df y enlaces simbólicos', disco);
  prueba('Faro 2 · PATH, permisos y ejecución por nombre', entorno);
  prueba('Faro 2 · formato de ip, ping y curl', red);
  prueba('Faro 2 · autenticación SSH y regreso en ambos idiomas', ssh);
  prueba('Faro 2 · help y man en ambos idiomas', ayuda);
  for (const idioma of ['es', 'en']) for (const c of casosBash(idioma)) {
    prueba('Faro 2 · caso exportado · ' + idioma + ' · ' + c.id, () => {
      comprobar(Bash.sesionTerminal({ ...c, idioma }), c.linea, c.salida);
    });
  }
};
