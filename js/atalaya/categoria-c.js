(function (A) {
'use strict';
const minuto = n => String(n).padStart(2, '0');
const auth = Array.from({ length: 59 }, (_, i) => {
  const ip = i % 3 ? '203.0.113.77' : '198.51.100.44';
  const evento = i % 7 ? 'Failed password for backup from ' + ip : 'Accepted publickey for sam from 10.9.0.21';
  const clave = i % 7 ? '' : ': ED25519 SHA256:8IYXxkH2jAV2aoRjsyW44ufJ4bBKtro1CxjACFxo/Mo';
  return 'Nov  5 02:' + minuto(i) + ':17 bastion sshd[' + (3012 + i) + ']: ' +
    evento + ' port ' + (44000 + i) + ' ssh2' + clave;
}).concat('Nov  5 02:59:21 bastion sshd[3071]: Accepted password for backup from 203.0.113.77 port 44059 ssh2').join('\n') + '\n';
const nginx = Array.from({ length: 24 }, (_, i) => {
  const scanner = ['/search', '/products', '/catalog', '/items', '/status'][Math.floor(i / 5)];
  const [ip, ruta, estado, agente] = i === 23 ?
    ['203.0.113.19', '/files/../../etc/passwd', '400 157', 'curl/8.10.1'] : i % 5 === 2 ?
    ['198.51.100.42', scanner, '404 153', 'sqlmap/1.9'] : ['10.9.0.22', '/index.html', '200 482', 'Mozilla/5.0'];
  return ip + ' - - [05/Nov/2026:03:' + minuto(i) + ':11 +0000] "GET ' + ruta + ' HTTP/1.1" ' + estado + ' "-" "' + agente + '"';
}).join('\n') + '\n';
const ssh = '/var/log/auth.log', web = '/var/log/nginx/access.log';
const ordenes = [
  `grep "Failed password" ${ssh} | cut -d' ' -f12 | sort | uniq -c | sort -rn | head -1`,
  `grep "Accepted password" ${ssh} | grep -F '203.0.113.77' | cut -d' ' -f10`,
  `grep -F '198.51.100.42' ${web} | cut -d'"' -f6 | cut -d/ -f1 | sort -u`,
  `grep -F '../' ${web} | cut -d' ' -f7 | cut -d. -f5`
];
const comandos = [['grep', 'cut', 'sort', 'uniq', 'head'], ['grep', 'cut'], ['grep', 'cut', 'sort'], ['grep', 'cut']];
const banderas = ['203.0.113.77', 'backup', 'sqlmap', '/etc/passwd'];
function lista(idioma, textos) {
  return textos.map((t, i) => A.reto('C' + (i + 1), 200, idioma, t, i < 2 ? { [ssh]: auth } : { [web]: nginx },
    'FLAG{' + banderas[i] + '}', [ordenes[i]], comandos[i]));
}
const es = [
  ['Fuerza bruta', 'El registro SSH está lleno de fallos. Entrega la IP con más intentos fallidos.',
    ['Busca Failed password en /var/log/auth.log.', 'Extrae la IP con cut y cuenta por IP con sort y uniq -c.'],
    'Identificaste la IP con más fallos de SSH.', 'Limita los intentos con fail2ban. Usa claves SSH y desactiva el acceso remoto de root.'],
  ['El que entró', 'La IP 203.0.113.77 consiguió entrar. Entrega la cuenta que usó.',
    ['Busca Accepted password y la IP en /var/log/auth.log.', 'La cuenta va justo después de for.'],
    'Relacionaste los fallos con el acceso a la cuenta backup.',
    'Revoca las credenciales afectadas y revisa la sesión. Usa claves SSH y desactiva el acceso remoto de root.'],
  ['El escáner', 'La IP 198.51.100.42 hizo varias peticiones. Entrega la herramienta que declara su User-Agent.',
    ['Abre /var/log/nginx/access.log.', 'Filtra por la IP. El último campo entre comillas es el User-Agent.'],
    'Reconociste el nombre de una herramienta en el User-Agent.',
    'Un cliente puede falsificar el User-Agent. Correlaciona rutas, frecuencia y respuestas antes de bloquearlo.'],
  ['Salir de la carpeta', 'Una petición bloqueada intentó salir de su carpeta con ../. Entrega la ruta absoluta del archivo que buscaba.',
    ['Busca ../ como texto literal en /var/log/nginx/access.log.', 'Mira la ruta registrada y lee el sufijo después de los puntos.'],
    'Identificaste el archivo que buscaba la petición bloqueada.',
    'Normaliza las rutas y comprueba que sigan dentro del directorio permitido. Evita concatenar la entrada del usuario.']
];
const en = [
  ['Brute force', 'The SSH log is full of failed logins. Submit the IP with the most failed attempts.',
    ['Look for Failed password in /var/log/auth.log.', 'Use cut to get the IP and count each IP with sort and uniq -c.'],
    'You found the IP with the most SSH failures.', 'Limit attempts with fail2ban. Use SSH keys and turn off remote login for root.'],
  ['The one that got in', 'The IP 203.0.113.77 got in. Submit the account it used.',
    ['Look for Accepted password and the IP in /var/log/auth.log.', 'The account comes right after for.'],
    'You linked the failures to a login on the backup account.',
    'Remove access for the affected account and review the session. Use SSH keys and turn off remote login for root.'],
  ['The scanner', 'The IP 198.51.100.42 made several requests. Submit the tool named in its User-Agent.',
    ['Open /var/log/nginx/access.log.', 'Filter by IP. The last field in quotes is the User-Agent.'],
    'You found a tool name in the User-Agent.', 'A client can fake its User-Agent. Check paths, request rates and replies before you block it.'],
  ['Outside the folder', 'A blocked request tried to leave its folder with ../. Submit the full path of the file it looked for.',
    ['Look for the exact text ../ in /var/log/nginx/access.log.', 'Look at the logged path and read the part after the dots.'],
    'You found the file targeted by the blocked request.',
    'Clean up each path and check that it stays inside the allowed folder. Avoid joining raw user input to a path.']
];
A.registrar('C', { es: lista('es', es), en: lista('en', en) });
})(globalThis.CR.Atalaya);
