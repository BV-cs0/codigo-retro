(function (CR) {
'use strict';
const { R } = CR.Shell.Entorno;
const { S, operar } = CR.Shell.Base;
const MiB = 1024 ** 2;
const tamano = n => n.carpeta ? 4096 : n.enlace !== undefined ? S.bytes(n.enlace) : n.simBytes ?? n.tamano;
const bloques = n => n.enlace !== undefined ? 0 : Math.ceil(tamano(n) / 4096) * 4096;
function humano(bytes) {
  if (bytes < 1024) return String(bytes);
  const i = Math.min(4, Math.floor(Math.log(bytes) / Math.log(1024)));
  const valor = bytes / 1024 ** i;
  const numero = valor < 10 ? (Math.ceil(valor * 10) / 10).toFixed(1) : Math.ceil(valor);
  return numero + ' KMGT'[i];
}
R('ln', ['ln -s mapa.txt acceso'], c => {
  if (c.args.length !== 3 || c.args[0] !== '-s') c.invalido(c.args.join(' ') || 'ln');
  const [, destino, enlace] = c.args;
  operar(c, [enlace], p => "failed to create symbolic link '" + p + "'", (_, ruta) => {
    if (c.fs.acceso(ruta, false)?.carpeta) ruta += '/' + S.nombre(destino);
    ruta = c.fs.resolver(ruta, false);
    if (c.fs.acceso(ruta, false)) S.fallo('File exists');
    c.fs.modificable(ruta);
    c.fs.inicial(ruta, { enlace: destino, permisos: 'rwxrwxrwx', dueno: c.sesion.identidad.usuario });
  });
}, { '-s': CR.t('faro2.lnS') });
R('readlink', ['readlink acceso'], c => {
  if (!c.args.length) c.invalido('readlink');
  for (const arg of c.args) {
    if (arg.startsWith('-')) c.invalido(arg);
    try {
      const enlace = c.fs.acceso(c.ruta(arg), false)?.enlace;
      if (enlace === undefined) c.codigo = 1;
      else c.out(enlace + '\n');
    } catch { c.codigo = 1; }
  }
});
function sumar(c, visible, nivel, maximo) {
  const ruta = c.ruta(visible);
  const nodo = c.fs.obtener(ruta, false);
  let bytes = bloques(nodo);
  if (nodo.carpeta) for (const hijo of c.fs.listar(ruta))
    bytes += sumar(c, visible.replace(/\/$/, '') + '/' + S.nombre(hijo), nivel + 1, maximo);
  if (nivel === 0 || (nivel <= maximo && nodo.carpeta)) c.out(humano(bytes) + '\t' + visible + '\n');
  return bytes;
}
R('du', ['du -sh .', 'du -h --max-depth=1 /var/log'], c => {
  const { args } = c;
  const resumen = args.includes('-sh') || args.includes('-hs') || (args.includes('-h') && args.includes('-s'));
  const maximo = resumen ? 0 : 1;
  const reconocidas = resumen ? ['-sh', '-hs', '-s', '-h'] : ['-h', '--max-depth=1'];
  if (!resumen && !reconocidas.every(op => args.includes(op))) c.invalido(args.join(' ') || 'du');
  const rutas = args.filter(arg => !reconocidas.includes(arg));
  for (const arg of rutas) if (arg.startsWith('-')) c.invalido(arg);
  operar(c, rutas.length ? rutas : ['.'], p => "cannot access '" + p + "'", p => sumar(c, p, 0, maximo));
}, { '-sh': CR.t('faro2.duSH'), '-h --max-depth=1': CR.t('faro2.duDepth') });
R('df', ['df -h'], c => {
  if (c.args.join(' ') !== '-h') c.invalido(c.args.join(' ') || 'df');
  const total = 1024 * MiB;
  const usado = Math.min(total, 740 * MiB + [...c.fs.nodos.values()].reduce((n, entrada) => n + bloques(entrada), 0));
  c.out('Filesystem      Size  Used Avail Use% Mounted on\n' +
    '/dev/sda1' + humano(total).padStart(11) + humano(usado).padStart(6) +
    humano(total - usado).padStart(6) + (Math.ceil(usado / total * 100) + '%').padStart(5) + ' /\n');
}, { '-h': CR.t('faro2.dfH') });
CR.Shell.Espacio = { tamano, MiB };
})(globalThis.CR = globalThis.CR || {});
