'use strict';
require('../js/shell/ejecutor');
for (const archivo of ['datos', 'categoria-a', 'categoria-b', 'categoria-c', 'categoria-d', 'categoria-e'])
  require('../js/atalaya/' + archivo);

const { Atalaya, Shell } = globalThis.CR;
const texto = 'Código Retro: acción\n' + 'abcdefghijklmnopqrstuvwxyz'.repeat(5) + '\n';
const herramientas = ['base64 muestra', 'base64 muestra | base64 -d', 'xxd -p muestra',
  'xxd -p muestra | xxd -r -p', 'md5sum muestra', 'sha256sum muestra'];
module.exports = idioma => {
  const sesion = Shell.Bash.sesionTerminal({ idioma, fs: { muestra: texto }, captura: true });
  const cwd = sesion.cwd;
  const casos = herramientas.map((linea, i) => ({
    id: 'atalaya-util-' + (i + 1), fs: { muestra: texto }, cwd, linea, salida: sesion.ejecutar(linea).salida
  }));
  for (const reto of Atalaya.lista(idioma).filter(r => /^B[24]|^C/.test(r.id))) {
    const s = Atalaya.sesion(reto, idioma);
    const linea = reto.solucion[0];
    const fs = Object.fromEntries(Object.entries(reto.fs).map(([ruta, dato]) => [ruta.replace(/^\//, ''), dato]));
    casos.push({ id: 'atalaya-' + reto.id, fs, cwd: s.cwd,
      linea: linea.replaceAll('/var/log/', 'var/log/'), salida: s.ejecutar(linea).salida });
  }
  // D4: grep -r desde la raíz (con rutas relativas, para que coincidan las de Bash).
  // E4: el bucle que compara cada palabra del diccionario con el hash.
  const relativo = fs => Object.fromEntries(Object.entries(fs).map(([ruta, dato]) => [ruta.replace(/^\//, ''), dato]));
  const buscar = id => Atalaya.lista(idioma).find(r => r.id === id);
  const d4 = buscar('D4'), sesionD4 = Atalaya.sesion(d4, idioma), lineaD4 = 'grep -ri password var/www opt';
  sesionD4.ejecutar('cd /');
  casos.push({ id: 'atalaya-D4', fs: relativo(d4.fs), cwd: '/', linea: lineaD4, salida: sesionD4.ejecutar(lineaD4).salida });
  const e4 = buscar('E4'), sesionE4 = Atalaya.sesion(e4, idioma), lineaE4 = e4.solucion[2];
  casos.push({ id: 'atalaya-E4', fs: e4.fs, cwd: sesionE4.cwd, linea: lineaE4, salida: sesionE4.ejecutar(lineaE4).salida });
  return casos;
};
