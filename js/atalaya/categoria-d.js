(function (A) {
'use strict';
// D · Permisos y escalada. Todo pasa en el sistema simulado: root, sudo y SUID son de práctica.
// Programas de mentira: si alguien los ejecuta, solo avisan. No se usan nombres de órdenes
// del simulador (sudo, ls...), porque un archivo en el PATH tiene prioridad, como en Bash.
const aviso = { es: 'programa de práctica: aquí no hace nada', en: 'practice program: it does nothing here' };
const binario = (idioma, nombre, suid = true) =>
  ({ contenido: '#!/bin/sh\necho "' + nombre + ': ' + aviso[idioma] + '"\n', permisos: 'rwxr-xr-x', suid });
const estandar = idioma => Object.fromEntries(['passwd', 'su', 'mount', 'umount', 'chsh', 'newgrp']
  .map(nombre => ['/usr/bin/' + nombre, binario(idioma, nombre)]));
const propio = (contenido, permisos) => ({ contenido, permisos, dueno: '@' });
// '@' se cambia por el usuario del idioma (analista / analyst).
function deQuien(fs, usuario) {
  return Object.fromEntries(Object.entries(fs).map(([ruta, dato]) =>
    [ruta, dato && dato.dueno === '@' ? { ...dato, dueno: usuario, grupo: usuario } : dato]));
}

function d1(idioma, t, ruta, contenido, otros, bandera) {
  const usuario = idioma === 'es' ? 'analista' : 'analyst';
  const fs = deQuien({ [ruta]: propio(contenido, 'rw-rw-rw-'), ...otros }, usuario);
  const reto = A.reto('D1', 300, idioma, t.textos, fs, bandera,
    ['find / -type f -perm -o+w', 'cat ' + ruta, 'chmod o-w ' + ruta], ['find', 'cat', 'chmod']);
  return { ...reto, requisito: { falta: t.falta, cumplido: s => s.fs.nodos.get(ruta)?.permisos[7] !== 'w' } };
}
function d2(idioma, textos) {
  const raro = '/usr/local/bin/logview';
  return A.reto('D2', 300, idioma, textos, { ...estandar(idioma), [raro]: binario(idioma, 'logview'),
    '/usr/local/bin/report': binario(idioma, 'report', false) },
    'FLAG{' + raro + '}', ['find / -perm -4000 -type f', 'ls -l ' + raro], ['find', 'ls']);
}
function d3(idioma, textos, script, [comentario, aviso], rutaBandera, bandera) {
  const [informe, copia] = idioma === 'es' ? ['/srv/informes/turno.txt', '/var/backups/turno.txt'] :
    ['/srv/reports/shift.txt', '/var/backups/shift.txt'];
  const cuerpo = '#!/bin/bash\n# ' + comentario + '\ncp ' + informe + ' ' + copia + '\necho "' + aviso + '"\n';
  const fs = { '/root/': { dueno: 'root', permisos: 'rwx------' },
    [rutaBandera]: { contenido: bandera + '\n', dueno: 'root', permisos: 'rw-------' },
    [script]: { contenido: cuerpo, dueno: 'root', permisos: 'rwxrwxrwx' },
    [informe]: idioma === 'es' ? 'Turno 3: sin incidencias.\n' : 'Shift 3: no incidents.\n', '/var/backups/': null };
  const reto = A.reto('D3', 300, idioma, textos, fs, bandera,
    ['sudo -l', 'ls -l ' + script, "echo 'cat " + rutaBandera + "' >> " + script, 'sudo ' + script], ['sudo', 'ls', 'echo']);
  return { ...reto, sudo: { [script]: { script: true } } };
}
function d4(idioma, textos, fs, bandera) {
  return A.reto('D4', 300, idioma, textos, fs, bandera, ['grep -ri password /var/www /opt'], ['grep']);
}

const es = [
  d1('es', { textos: ['Permisos de más',
    'Un archivo de claves de radio de tu equipo quedó con permisos de más: cualquiera puede escribirlo. Encuéntralo, lee la bandera y quítale ese permiso.',
    ['find puede buscar por permisos: -perm -o+w encuentra lo que pueden escribir los demás.',
      'Prueba find / -type f -perm -o+w. Lee el archivo con cat y arréglalo con chmod o-w.'],
    'Encontraste un archivo de claves que cualquiera podía cambiar, y lo arreglaste.',
    'Si otros pueden escribir un archivo de claves, pueden cambiarlas sin que lo notes. Revisa los permisos con find -perm y deja solo los necesarios, por ejemplo 600.'],
  falta: 'La bandera es buena, pero el archivo sigue escribible por otros. Quítale ese permiso con chmod o-w.' },
  '/srv/radio/claves.txt', 'canal-1: 4471\ncanal-2: 9083\nFLAG{escritura}\n',
  { '/srv/radio/frecuencias.txt': '156.800 MHz\n', '/srv/radio/LEEME.txt': 'Cambiar claves cada mes.\n' }, 'FLAG{escritura}'),
  d2('es', ['El binario raro',
    'Los programas con SUID se ejecutan con los permisos de su dueño, aunque los lance otro. Uno de esta máquina no debería estar ahí. Entrega su ruta.',
    ['find / -perm -4000 -type f lista los programas con SUID.',
      'Casi todos son normales: passwd, su, mount, umount, chsh, newgrp. Busca el que no conoces y míralo con ls -l.'],
    'Encontraste un programa con SUID que no es estándar.',
    'Un SUID de más permite a cualquiera ejecutar algo como root. Revisa la lista de SUID a menudo y quita el bit con chmod u-s si no hace falta.']),
  d3('es', ['Sudo con trampa',
    'Puedes ejecutar un script como root con sudo. Mira qué script es y quién puede cambiarlo. La bandera está en /root/bandera.txt.',
    ['sudo -l muestra qué puedes ejecutar como root.', 'Mira con ls -l quién puede escribir ese script.',
      "Añade una línea al final con echo 'cat /root/bandera.txt' >> y el script, y ejecútalo con sudo."],
    'Conseguiste root cambiando un script que se ejecuta con sudo.',
    'Un script que se ejecuta con sudo solo debe poder cambiarlo root: dueño root y permisos 755. Si otros pueden editarlo, pueden ser root.'],
  '/usr/local/bin/copia.sh', ['Copia nocturna de los informes del turno', 'Copia terminada.'],
  '/root/bandera.txt', 'FLAG{centinela}'),
  d4('es', ['Secretos en la configuración',
    'La web de la tienda se conecta a una base de datos. Busca su contraseña en los archivos de /var/www y /opt. La bandera es FLAG{contraseña}.',
    ['grep -r busca dentro de carpetas enteras y -i no distingue mayúsculas.', 'Prueba grep -ri password /var/www /opt.'],
    'Encontraste una contraseña escrita en un archivo de configuración.',
    'No escribas contraseñas en los archivos de la web. Usa variables de entorno o un gestor de secretos, y deja la configuración con permisos 600.'],
  { '/var/www/tienda/index.html': '<h1>Tienda de Faro-7</h1>\n',
    '/var/www/tienda/config.php': "<?php\n// Conexión a la base de datos\n$db_host = 'localhost';\n$db_user = 'tienda';\n$db_password = 'marea-alta-77';\n",
    '/opt/radar/radar.conf': '# Password: ya no se guarda aquí (ver el gestor de secretos)\nintervalo=30\n',
    '/opt/radar/LEEME.txt': 'Radar de la costa. Reiniciar si se congela.\n' }, 'FLAG{marea-alta-77}')
];
const en = [
  d1('en', { textos: ['Too many permissions',
    'A radio key file of your team has too many permissions: anyone can write to it. Find it, read the flag and remove that permission.',
    ['find can search by permissions: -perm -o+w finds files that others can write.',
      'Try find / -type f -perm -o+w. Read the file with cat and fix it with chmod o-w.'],
    'You found a key file that anyone could change, and you fixed it.',
    'If others can write to a key file, they can change the keys without you noticing. Check permissions with find -perm and keep only what is needed, for example 600.'],
  falta: 'The flag is right, but others can still write to the file. Remove that permission with chmod o-w.' },
  '/srv/radio/keys.txt', 'channel-1: 4471\nchannel-2: 9083\nFLAG{writable}\n',
  { '/srv/radio/frequencies.txt': '156.800 MHz\n', '/srv/radio/README.txt': 'Change the keys every month.\n' }, 'FLAG{writable}'),
  d2('en', ['The odd binary',
    'SUID programs run with the permissions of their owner, even when someone else starts them. One on this machine should not be there. Submit its path.',
    ['find / -perm -4000 -type f lists the SUID programs.',
      'Most are normal: passwd, su, mount, umount, chsh, newgrp. Look for the one you do not know and check it with ls -l.'],
    'You found a SUID program that is not standard.',
    'An extra SUID lets anyone run something as root. Check the SUID list often and remove the bit with chmod u-s if it is not needed.']),
  d3('en', ['The sudo trap',
    'You can run a script as root with sudo. Check which script it is and who can change it. The flag is in /root/flag.txt.',
    ['sudo -l shows what you can run as root.', 'Use ls -l to see who can write to that script.',
      "Add a line at the end with echo 'cat /root/flag.txt' >> and the script, then run it with sudo."],
    'You got root by changing a script that runs with sudo.',
    'Only root should be able to change a script that runs with sudo: owner root and permissions 755. If others can edit it, they can become root.'],
  '/usr/local/bin/backup.sh', ['Nightly backup of the shift reports', 'Backup done.'],
  '/root/flag.txt', 'FLAG{sentinel}'),
  d4('en', ['Secrets in the config',
    'The shop website connects to a database. Find its password in the files under /var/www and /opt. The flag is FLAG{password}.',
    ['grep -r searches whole folders and -i ignores upper and lower case.', 'Try grep -ri password /var/www /opt.'],
    'You found a password written in a config file.',
    'Do not write passwords in website files. Use environment variables or a secrets manager, and set the config file to permissions 600.'],
  { '/var/www/shop/index.html': '<h1>Beacon 7 Shop</h1>\n',
    '/var/www/shop/config.php': "<?php\n// Database connection\n$db_host = 'localhost';\n$db_user = 'shop';\n$db_password = 'high-tide-77';\n",
    '/opt/radar/radar.conf': '# Password: not stored here any more (see the secrets manager)\ninterval=30\n',
    '/opt/radar/README.txt': 'Coast radar. Restart it if it freezes.\n' }, 'FLAG{high-tide-77}')
];
A.registrar('D', { es, en });
})(globalThis.CR.Atalaya);
