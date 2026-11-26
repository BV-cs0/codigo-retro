(function (CR) {
'use strict';
const { R } = CR.Shell.Entorno;
const filas = (cabecera, procesos, campos) => cabecera + '\n' + procesos.map(campos).map(f => f + '\n').join('');
const ancho = (valor, n) => String(valor).padStart(n);
const usuario = nombre => nombre.length > 8 ? nombre.slice(0, 7) + '+' : nombre.padEnd(8);
function aux(p) {
  return usuario(p.user) + ancho(p.pid, 7) + ancho(p.cpu.toFixed(1), 5) + ancho(p.mem.toFixed(1), 5) +
    '   4096  1024 pts/0    S    03:14   0:00 ' + p.command;
}
R('ps', ['ps', 'ps aux', 'ps -ef'], c => {
  const modo = c.args.join(' ');
  const procesos = [...c.sesion.procesos.values()].sort((a, b) => a.pid - b.pid);
  if (modo === 'aux') c.out(filas('USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND', procesos, aux));
  else if (modo === '-ef') c.out(filas('UID          PID    PPID  C STIME TTY          TIME CMD', procesos,
    p => usuario(p.user) + ancho(p.pid, 8) + ancho(p.ppid ?? 0, 8) +
      ancho(Math.trunc(p.cpu), 3) + ' 03:14 pts/0    00:00:00 ' + p.command));
  else if (!modo) c.out(filas('    PID TTY          TIME CMD', procesos.filter(p => p.user === c.sesion.identidad.usuario),
    p => ancho(p.pid, 7) + ' pts/0    00:00:00 ' + p.command.split(' ')[0]));
  else c.invalido(modo);
}, { 'aux': CR.t('faro2.psAux'), '-ef': CR.t('faro2.psEf') });
const nombre = p => p.command.split(' ')[0].split('/').pop();
R('pgrep', ['pgrep -l bash', 'pgrep bash'], c => {
  const args = c.args.slice();
  const listar = args[0] === '-l' && args.shift();
  if (args.length !== 1 || args[0].startsWith('-')) c.invalido(args.join(' ') || 'pgrep');
  const patron = new RegExp(args[0]);
  const encontrados = [...c.sesion.procesos.values()].filter(p => patron.test(nombre(p)));
  for (const p of encontrados) c.out(p.pid + (listar ? ' ' + nombre(p) : '') + '\n');
  if (!encontrados.length) c.codigo = 1;
}, { '-l': CR.t('faro2.pgrepL') });
function terminar(c, p, fuerte, prefijo) {
  if (!p) return c.error(prefijo + 'No such process');
  const user = c.sesion.identidad.usuario;
  if (user !== 'root' && user !== p.user) return c.error(prefijo + 'Operation not permitted');
  if (fuerte || !p.resiste) c.sesion.procesos.delete(p.pid);
}
R('kill', ['kill 120', 'kill -9 120', 'kill -l'], c => {
  if (c.args.join(' ') === '-l') {
    c.out(' 1) SIGHUP\t 2) SIGINT\t 3) SIGQUIT\t 4) SIGILL\t 5) SIGTRAP\n' +
      ' 6) SIGABRT\t 7) SIGBUS\t 8) SIGFPE\t 9) SIGKILL\t10) SIGUSR1\n' +
      '11) SIGSEGV\t12) SIGUSR2\t13) SIGPIPE\t14) SIGALRM\t15) SIGTERM\n');
    return;
  }
  const args = c.args.slice();
  const fuerte = args[0] === '-9' && args.shift();
  if (!args.length || args.some(id => !/^[1-9]\d*$/.test(id))) c.invalido(args.join(' ') || 'kill');
  for (const id of args) terminar(c, c.sesion.procesos.get(Number(id)), fuerte, 'bash: kill: (' + id + ') - ');
}, { '-9': CR.t('faro2.kill9'), '-l': CR.t('faro2.killL') });
R('killall', ['killall bash'], c => {
  if (c.args.length !== 1 || c.args[0].startsWith('-')) c.invalido(c.args.join(' ') || 'killall');
  const [orden] = c.args;
  const procesos = [...c.sesion.procesos.values()].filter(p => nombre(p) === orden);
  if (!procesos.length) return c.error(orden + ': no process found');
  for (const p of procesos) terminar(c, p, false, orden + '(' + p.pid + '): ');
});
})(globalThis.CR = globalThis.CR || {});
