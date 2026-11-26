(function (A) {
'use strict';
const es = [
  A.reto('A1', 100, 'es', ['Lo que no se ve', 'Hay una nota oculta en tu carpeta personal. Hasta mis ojos necesitan ayuda.',
    ['Empieza en tu carpeta personal.', 'Usa ls -a y lee la nota con cat.'], 'Leíste una nota oculta.',
    'El punto inicial oculta el nombre del listado normal. Aplica permisos como 600 para limitar el acceso.'],
  { '.nota': { contenido: 'FLAG{nota}\n', permisos: 'rw-r-----' } }, 'FLAG{nota}', ['ls -a', 'cat .nota'], ['ls', 'cat']),
  A.reto('A2', 100, 'es', ['El historial indiscreto', 'Revisa el historial de la cuenta compartida. Entrega la contraseña de práctica escrita en una orden.',
    ['Bash guarda el historial en .bash_history.', 'Busca password con grep.'], 'Encontraste una contraseña en el historial.',
    'Pide la clave con un prompt oculto. HISTCONTROL puede omitir algunas órdenes. Evita pasar secretos por la línea de comandos.'],
  { '.bash_history': { contenido: 'cd /srv/backup\nbackup-check --password=linterna\nls -l\n', permisos: 'rw-------' } }, 'FLAG{linterna}',
  ['cat .bash_history', 'grep password .bash_history'], ['cat', 'grep'])
];
const en = [
  A.reto('A1', 100, 'en', ['Out of sight', 'There is a hidden note in your home folder. Even my owl eyes need help.',
    ['Start in your home folder.', 'Use ls -a and read the note with cat.'], 'You read a hidden note.',
    'A dot at the start hides the name from a normal list. Use permissions like 600 to limit access.'],
  { '.note': { contenido: 'FLAG{note}\n', permisos: 'rw-r-----' } }, 'FLAG{note}', ['ls -a', 'cat .note'], ['ls', 'cat']),
  A.reto('A2', 100, 'en', ['The careless history', 'Check the shared account history. Submit the practice password written in a command.',
    ['Bash saves history in .bash_history.', 'Use grep to look for password.'], 'You found a password in the shell history.',
    'Ask for the password with a hidden prompt. HISTCONTROL can skip some commands. Keep secrets out of command lines.'],
  { '.bash_history': { contenido: 'cd /srv/backup\nbackup-check --password=lantern\nls -l\n', permisos: 'rw-------' } }, 'FLAG{lantern}',
  ['cat .bash_history', 'grep password .bash_history'], ['cat', 'grep'])
];
// A3 y A4: la web de la tienda (tienda.local / shop.local).
const html = 'text/html; charset=utf-8';
function web(idioma, origen, privada, textosA3, textosA4, banderas, portada) {
  const robots = { codigo: 200, cuerpo: 'User-agent: *\nDisallow: ' + privada + '\n' };
  const a3 = A.reto('A3', 100, idioma, textosA3, {}, banderas[0],
    ['curl ' + origen + '/robots.txt', 'curl ' + origen + privada], ['curl']);
  const a4 = A.reto('A4', 100, idioma, textosA4, {}, banderas[1],
    ["curl -s " + origen + " | grep '<!--'"], ['curl', 'grep']);
  const sitioA3 = { '/robots.txt': robots, '/': { codigo: 200, cabeceras: { 'Content-Type': html }, cuerpo: portada[0] },
    [privada]: { codigo: 200, cuerpo: portada[1] + banderas[0] + '\n' } };
  const sitioA4 = { '/robots.txt': robots, '/': { codigo: 200, cabeceras: { 'Content-Type': html }, cuerpo: portada[2] } };
  return [{ ...a3, sitios: { [origen]: sitioA3 } }, { ...a4, sitios: { [origen]: sitioA4 } }];
}
const portadaEs = '<!doctype html>\n<html lang="es">\n<head><title>Tienda de Faro-7</title></head>\n<body>\n' +
  '<h1>Tienda de Faro-7</h1>\n<p>Linternas, mapas y chubasqueros.</p>\n';
const portadaEn = '<!doctype html>\n<html lang="en">\n<head><title>Beacon 7 Shop</title></head>\n<body>\n' +
  '<h1>Beacon 7 Shop</h1>\n<p>Lanterns, maps and raincoats.</p>\n';
es.push(...web('es', 'http://tienda.local', '/copia-antigua/', ['Lo que robots.txt confiesa',
  'La tienda de Faro-7 tiene web en http://tienda.local. Mira qué carpeta pide a los buscadores que no visiten.',
  ['Muchas webs dejan instrucciones para los buscadores en /robots.txt.',
    'Lee http://tienda.local/robots.txt con curl y luego abre la carpeta de la línea Disallow.'],
  'Encontraste una carpeta que robots.txt pedía no visitar.',
  'robots.txt es una petición para los buscadores, no un control de acceso. Protege lo privado con contraseña o no lo publiques.'],
['Comentarios olvidados', 'Alguien dejó notas en el código de la portada de http://tienda.local. El navegador no las muestra, pero curl sí.',
  ['Descarga la portada con curl: verás el HTML.', "Los comentarios HTML empiezan por <!--. Fíltralos con grep '<!--'."],
  'Encontraste un comentario de desarrollo en el HTML publicado.',
  'Cualquiera puede leer el código de una web, comentarios incluidos. Revísalo antes de publicar y quita notas, claves y rutas internas.'],
['FLAG{prohibido}', 'FLAG{comentario}'],
[portadaEs + '</body>\n</html>\n', 'Copia de la tienda (2025). No borrar.\n',
  portadaEs + '<!-- Menú nuevo en pruebas -->\n<p>Abierto de 9 a 18.</p>\n' +
  '<!-- TODO: quitar antes de publicar. Acceso de pruebas: FLAG{comentario} -->\n</body>\n</html>\n']));
en.push(...web('en', 'http://shop.local', '/old-backup/', ['What robots.txt gives away',
  'The Beacon 7 shop has a website at http://shop.local. Check which folder it asks search engines not to visit.',
  ['Many websites leave notes for search engines in /robots.txt.',
    'Read http://shop.local/robots.txt with curl, then open the folder on the Disallow line.'],
  'You found a folder that robots.txt asked search engines to skip.',
  'robots.txt is a request for search engines, not access control. Protect private files with a password or do not publish them.'],
['Forgotten comments', 'Someone left notes in the code of the http://shop.local home page. The browser hides them, but curl does not.',
  ['Download the home page with curl: you will see the HTML.', "HTML comments start with <!--. Filter them with grep '<!--'."],
  'You found a developer comment in the published HTML.',
  'Anyone can read the code of a website, comments included. Check it before you publish and remove notes, passwords and internal paths.'],
['FLAG{forbidden}', 'FLAG{comment}'],
[portadaEn + '</body>\n</html>\n', 'Shop backup (2025). Do not delete.\n',
  portadaEn + '<!-- New menu being tested -->\n<p>Open 9 to 6.</p>\n' +
  '<!-- TODO: remove before release. Test access: FLAG{comment} -->\n</body>\n</html>\n']));
A.registrar('A', { es, en });
})(globalThis.CR.Atalaya);
