(function (CR) {
'use strict';
const Shell = CR.Shell = CR.Shell || {};
const { ayuda, registrar: R, opciones } = typeof module !== 'undefined' ? require('./comandos/base') : Shell.Base;
R('help', 'Lista los comandos del simulador.', ['help', 'man ls'], c => {
  opciones(c);
  for (const nombre of Object.keys(ayuda).sort()) c.out(nombre.padEnd(11) + ayuda[nombre].descripcion + '\n');
});
R('man', 'Abre el manual de un comando.', ['man ls', 'man grep'], c => {
  const { args } = opciones(c);
  const ficha = ayuda[args[0]];
  if (!ficha) return c.error('No manual entry for ' + (args[0] || ''));
  c.out(args[0].toUpperCase() + '\n\n' + ficha.descripcion + '\n');
  for (const [op, texto] of Object.entries(ficha.opciones)) c.out('  ' + op + '  ' + texto + '\n');
  c.out('\nEjemplos\n' + ficha.ejemplos.map(e => '  ' + e + '\n').join(''));
});
function distancia(a, b) {
  let fila = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 0; i < a.length; i++) {
    const anterior = fila;
    fila = [i + 1];
    for (let j = 0; j < b.length; j++) {
      fila.push(Math.min(fila[j] + 1, anterior[j + 1] + 1, anterior[j] + (a[i] === b[j] ? 0 : 1)));
    }
  }
  return fila[b.length];
}
function explicar(error) {
  if (error.endsWith(': command not found')) {
    const palabra = error.replace(/^.*?: line \d+: |^bash: /, '').slice(0, -': command not found'.length);
    const opciones = Object.keys(ayuda).map(c => [c, distancia(palabra, c)]).sort((a, b) => a[1] - b[1]);
    if (opciones[0]?.[1] <= 2) return '¿Querías decir ' + opciones[0][0] + '?';
    return 'Usa help para ver los comandos disponibles.';
  }
  if (error.includes("[: missing ']'")) return 'Cierra la condición con ] y deja un espacio antes del corchete.';
  if (error.includes('[: too many arguments')) return 'La condición recibió palabras de más. Pon comillas dobles alrededor de la variable.';
  if (error.includes('unexpected EOF while looking')) return 'Revisa que las comillas abiertas tengan su pareja.';
  if (error.includes('unexpected end of file')) return 'Revisa que los bloques se cierren con fi, done o esac.';
  if (error.includes('No such file or directory')) return 'No existe ese archivo o carpeta. Usa ls para ver qué hay aquí.';
  if (error.includes('Permission denied') || error.includes('Operation not permitted')) return 'Revisa el dueño y los permisos con ls -l.';
  if (error.includes('Is a directory')) return 'Esa ruta es una carpeta. Usa ls para ver su contenido.';
  if (error.includes('Not a directory')) return 'Un tramo de la ruta apunta a un archivo. Revisa la ruta con ls.';
  if (error.includes('File exists')) return 'Ese nombre ya existe. Usa ls para revisar qué hay en la carpeta.';
  if (error.includes('Directory not empty')) return 'Hay archivos dentro. Revísalos antes de borrar la carpeta.';
  return 'Consulta help o man para ver ejemplos.';
}
Shell.Ayuda = { fichas: ayuda, explicar };
if (typeof module !== 'undefined') module.exports = CR.Shell.Ayuda;
})(globalThis.CR = globalThis.CR || {});

