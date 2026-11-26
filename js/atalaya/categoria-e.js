(function (A) {
'use strict';
// E · Web. Los sitios son simulados: curl solo habla con ellos dentro del reto.
const html = 'text/html; charset=utf-8';
const pagina = (titulo, cuerpo) => '<!doctype html>\n<html>\n<head><title>' + titulo + '</title></head>\n<body>\n' +
  cuerpo + '\n</body>\n</html>\n';
const conSitio = (reto, origen, rutas) => ({ ...reto, sitios: { [origen]: rutas } });

function e1(idioma, t, origen, titulo, bandera) {
  const reto = A.reto('E1', 300, idioma, t, {}, bandera, ['curl -I ' + origen], ['curl']);
  return conSitio(reto, origen, { '/': { codigo: 200, cuerpo: pagina(titulo, '<h1>' + titulo + '</h1>'), cabeceras: {
    'Content-Type': html, Server: 'nginx/1.18.0', 'X-Powered-By': 'PHP/7.4.3', 'X-Debug-Token': bandera } } });
}
function e2(idioma, t, origen, [nombre, invitado, admin], textos, bandera) {
  const url = origen + '/panel';
  const reto = A.reto('E2', 300, idioma, t, {}, bandera,
    ['curl ' + url, 'curl -I ' + url, 'curl -b "' + nombre + '=' + admin + '" ' + url], ['curl']);
  return conSitio(reto, origen, { '/panel': [
    { codigo: 200, cookie: { [nombre]: admin }, cuerpo: textos[0] + '\n' + bandera + '\n' },
    { codigo: 403, cabeceras: { 'Set-Cookie': nombre + '=' + invitado + '; Path=/' }, cuerpo: textos[1] + '\n' }] });
}
function e3(idioma, t, origen, ruta, [mio, ajeno, noHay], bandera) {
  const url = id => '"' + origen + ruta + '?id=' + id + '"';
  const reto = A.reto('E3', 300, idioma, t, {}, bandera, ['curl ' + url(1042), 'curl ' + url(1041)], ['curl']);
  return conSitio(reto, origen, { [ruta]: [
    { codigo: 200, parametros: { id: '1042' }, cuerpo: mio },
    { codigo: 200, parametros: { id: '1041' }, cuerpo: ajeno + bandera + '\n' },
    { codigo: 404, cuerpo: noHay + '\n' }] });
}
// E4: listado abierto + copia en Base64 + hash SHA-256 que se rompe con el diccionario.
function e4(idioma, t, origen, carpeta, archivo, base64, palabras, contrasena) {
  const listado = pagina('Index of ' + carpeta, '<h1>Index of ' + carpeta + '</h1><hr><pre><a href="../">../</a>\n' +
    '<a href="' + archivo + '">' + archivo + '</a>' + ' '.repeat(50 - archivo.length) + '05-Nov-2026 03:12     ' +
    base64.replace(/\n/g, '').length + '\n</pre><hr>');
  const diccionario = idioma === 'es' ? 'diccionario.txt' : 'wordlist.txt';
  const hash = idioma === 'es' ? '7804cc0abacc62b5adbb9ab207b3493a7cc434921c45f74c3d721944fa7ff77e' :
    '24f93dc159383ed5094a231c8bcf3985168a73c9298244548b9f0a49765736a0';
  const reto = A.reto('E4', 500, idioma, t, { [diccionario]: palabras.join('\n') + '\n' }, 'FLAG{' + contrasena + '}', [
    'curl -s ' + origen + carpeta, 'curl -s ' + origen + carpeta + archivo + ' | base64 -d',
    'while read p; do echo "$(echo -n "$p" | sha256sum) $p"; done < ' + diccionario + ' | grep ' + hash
  ], ['curl', 'base64', 'sha256sum', 'grep']);
  return conSitio(reto, origen, { [carpeta]: { codigo: 200, cabeceras: { 'Content-Type': html }, cuerpo: listado },
    [carpeta + archivo]: { codigo: 200, cuerpo: base64 } });
}

const b64es = 'LS0gQ29waWEgZGUgbGEgdGFibGEgdXN1YXJpb3MgZGUgbGEgdGllbmRhCklOU0VSVCBJTlRPIHVz\n' +
  'dWFyaW9zIChpZCwgbm9tYnJlLCBzaGEyNTYpIFZBTFVFUyAoMSwgJ2FkbWluJywgJzc4MDRjYzBh\n' +
  'YmFjYzYyYjVhZGJiOWFiMjA3YjM0OTNhN2NjNDM0OTIxYzQ1Zjc0YzNkNzIxOTQ0ZmE3ZmY3N2Un\n' +
  'KTsKSU5TRVJUIElOVE8gdXN1YXJpb3MgKGlkLCBub21icmUsIHNoYTI1NikgVkFMVUVTICgyLCAn\n' +
  'bml4JywgJzM1OWZkMDgzYjUwM2VmMjM2Y2VlNjMxNDM4ZTA1NDY4Yzk2MWRlZmNiNDVhNzI2YWVk\n' +
  'MTVhM2ZiOWNlZTU2ODAnKTsK\n';
const b64en = 'LS0gQmFja3VwIG9mIHRoZSBzaG9wIHVzZXJzIHRhYmxlCklOU0VSVCBJTlRPIHVzZXJzIChpZCwg\n' +
  'bmFtZSwgc2hhMjU2KSBWQUxVRVMgKDEsICdhZG1pbicsICcyNGY5M2RjMTU5MzgzZWQ1MDk0YTIz\n' +
  'MWM4YmNmMzk4NTE2OGE3M2M5Mjk4MjQ0NTQ4YjlmMGE0OTc2NTczNmEwJyk7CklOU0VSVCBJTlRP\n' +
  'IHVzZXJzIChpZCwgbmFtZSwgc2hhMjU2KSBWQUxVRVMgKDIsICduaXgnLCAnOTIxMzk4ZWJhMjM5\n' +
  'MmNhYzY0MThjMDI0OWFiZDBiZGU3MjM0YjM3OGI2MWUxOTJjNjZmYmVlZTE4NmJkOWQzNCcpOwo=\n';
const palabrasEs = ('contraseña hola123 bienvenido dragon futbol verano invierno primavera sol luna estrella marea ' +
  'faro gaviota albatros ancla velero puerto brujula linterna tormenta niebla arena concha delfin ballena ' +
  'pescador timon bahia isla').split(' ');
const palabrasEn = ('password hello123 welcome dragon football summer winter spring sun moon star tide ' +
  'lighthouse seagull albatross anchor sailboat harbor compass lantern storm fog sand shell dolphin whale ' +
  'fisher rudder bay island').split(' ');

const es = [
  e1('es', ['Cabeceras que hablan', 'El servidor de http://tienda.local cuenta más de lo que debe en sus cabeceras. Míralas.',
    ['curl -I muestra solo las cabeceras de la respuesta.', 'Busca una cabecera que empiece por X-. Las de depuración no deberían estar a la vista.'],
    'Encontraste datos de depuración en las cabeceras del servidor.',
    'Las cabeceras con versiones o datos de depuración ayudan a quien ataca. Quítalas en producción (en nginx, server_tokens off) y oculta X-Powered-By.'],
  'http://tienda.local', 'Tienda de Faro-7', 'FLAG{cabecera}'),
  e2('es', ['La galleta', 'El panel http://tienda.local/panel no te deja entrar. Mira qué te dice y qué cookie te da.',
    ['curl -I muestra la cabecera Set-Cookie con la cookie que te da el servidor.',
      'El rol viaja en la cookie y la cookie la controla el cliente. Prueba curl -b "rol=admin".'],
    'Entraste al panel cambiando una cookie que el servidor no comprobaba.',
    'Nunca confíes en lo que controla el cliente, como una cookie con el rol. El servidor debe guardar la sesión y comprobar los permisos en cada petición.'],
  'http://tienda.local', ['rol', 'invitado', 'admin'],
  ['Panel de administración. Hola, admin.', 'Acceso denegado: eres rol=invitado.'], 'FLAG{galleta}'),
  e3('es', ['El pedido de otro',
    'Tu pedido está en http://tienda.local/pedido?id=1042. ¿Qué pasa si cambias el número? Pon la dirección entre comillas.',
    ['Pide tu pedido con curl "http://tienda.local/pedido?id=1042".',
      'Prueba con el número anterior, 1041. Si el servidor no comprueba de quién es, te lo enseñará.'],
    'Viste el pedido de otra persona solo cambiando un número: eso es un IDOR.',
    'El servidor debe comprobar en cada petición que el pedido es de quien lo pide. Un número difícil de adivinar no basta.'],
  'http://tienda.local', '/pedido', ['Pedido 1042\nCliente: analista\nProducto: linterna de bolsillo\n',
    'Pedido 1041\nCliente: marina.p\nProducto: mapa de la costa\nNota interna: ', 'Pedido no encontrado.'], 'FLAG{idor}'),
  e4('es', ['Reto final: la copia expuesta',
    'Último reto. La carpeta /copias/ de http://tienda.local enseña lo que tiene dentro. Hay una copia de los usuarios. Consigue la contraseña de admin: la bandera es FLAG{contraseña}.',
    ['Abre http://tienda.local/copias/ con curl y busca el nombre del archivo.',
      'El archivo está en Base64: pásalo por base64 -d con una tubería. Verás el hash SHA-256 de admin.',
      'Compara el hash con diccionario.txt, como en el reto B4: while read p; do echo "$(echo -n "$p" | sha256sum) $p"; done < diccionario.txt | grep HASH'],
    'Juntaste todo: un listado abierto, una copia en Base64 y un hash débil.',
    'Desactiva el listado de carpetas (autoindex off), guarda las copias fuera de la web y usa hashes lentos con sal (bcrypt o Argon2) para las contraseñas.'],
  'http://tienda.local', '/copias/', 'usuarios.sql.b64', b64es, palabrasEs, 'albatros')
];
const en = [
  e1('en', ['Talking headers', 'The http://shop.local server says more than it should in its headers. Take a look.',
    ['curl -I shows only the response headers.', 'Look for a header that starts with X-. Debug headers should not be visible.'],
    'You found debug data in the server headers.',
    'Headers with versions or debug data help attackers. Remove them in production (in nginx, server_tokens off) and hide X-Powered-By.'],
  'http://shop.local', 'Beacon 7 Shop', 'FLAG{header}'),
  e2('en', ['The cookie', 'The http://shop.local/panel page does not let you in. Check what it says and which cookie it gives you.',
    ['curl -I shows the Set-Cookie header with the cookie the server gives you.',
      'The role travels in the cookie, and the client controls the cookie. Try curl -b "role=admin".'],
    'You got into the panel by changing a cookie that the server did not check.',
    'Never trust what the client controls, like a cookie with the role. The server must keep the session and check permissions on every request.'],
  'http://shop.local', ['role', 'guest', 'admin'],
  ['Admin panel. Hello, admin.', 'Access denied: you are role=guest.'], 'FLAG{cookie}'),
  e3('en', ["Someone else's order",
    'Your order is at http://shop.local/order?id=1042. What happens if you change the number? Put the address in quotes.',
    ['Get your order with curl "http://shop.local/order?id=1042".',
      'Try the number before it, 1041. If the server does not check whose order it is, it will show it.'],
    'You saw another person’s order just by changing a number: that is an IDOR.',
    'The server must check on every request that the order belongs to the person asking. A number that is hard to guess is not enough.'],
  'http://shop.local', '/order', ['Order 1042\nCustomer: analyst\nItem: pocket lantern\n',
    'Order 1041\nCustomer: marina.p\nItem: coast map\nInternal note: ', 'Order not found.'], 'FLAG{idor}'),
  e4('en', ['Final challenge: the exposed backup',
    'Last challenge. The /backups/ folder on http://shop.local shows what is inside. There is a backup of the users. Get the admin password: the flag is FLAG{password}.',
    ['Open http://shop.local/backups/ with curl and find the file name.',
      'The file is in Base64: pipe it into base64 -d. You will see the SHA-256 hash of admin.',
      'Compare the hash with wordlist.txt, like in challenge B4: while read p; do echo "$(echo -n "$p" | sha256sum) $p"; done < wordlist.txt | grep HASH'],
    'You put it all together: an open folder list, a Base64 backup and a weak hash.',
    'Turn off folder listing (autoindex off), keep backups outside the website and use slow salted hashes (bcrypt or Argon2) for passwords.'],
  'http://shop.local', '/backups/', 'users.sql.b64', b64en, palabrasEn, 'albatross')
];
A.registrar('E', { es, en });
})(globalThis.CR.Atalaya);
