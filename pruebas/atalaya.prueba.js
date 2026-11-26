'use strict';
const assert = require('node:assert/strict');
require('./datos-atalaya-bash');
require('../js/atalaya/progreso');
const { Atalaya, Shell, ProgresoAtalaya } = globalThis.CR;
const vectores = [
  ['', 'd41d8cd98f00b204e9800998ecf8427e', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'],
  ['abc', '900150983cd24fb0d6963f7d28e17f72', 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'],
  ['abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq',
    '8215ef0796a20bcaaae116d3876c664a', '248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1'],
  ['Código Retro: acción', '7ef7eca9c5af6d60d8b50b407b05ace1', '7a9337addbcf694644724280a79dc0fa2cf8916ea697ae0005c04149f73b25f3']
];
function probarHerramientas(prueba) {
  for (const [i, [valor, md5, sha256]] of vectores.entries()) prueba('Atalaya · vector UTF-8 ' + i, () => {
    const s = Shell.Bash.sesionTerminal({ fs: { dato: valor }, captura: true });
    assert.equal(s.ejecutar('md5sum dato').salida, md5 + '  dato\n');
    assert.equal(s.ejecutar('sha256sum < dato').salida, sha256 + '  -\n');
    assert.equal(s.ejecutar('base64 dato').salida, Buffer.from(valor).toString('base64').replace(/.{1,76}/g, '$&\n'));
    assert.equal(s.ejecutar('base64 dato | base64 -d').salida, valor);
    assert.equal(s.ejecutar('xxd -p dato').salida, Buffer.from(valor).toString('hex').replace(/.{1,60}/g, '$&\n'));
    assert.equal(s.ejecutar('xxd -p dato | xxd -r -p').salida, valor);
  });
  prueba('Atalaya · bytes binarios en tuberías y entrada inválida', () => {
    const s = Shell.Bash.sesionTerminal({ captura: true });
    assert.equal(s.ejecutar("printf '00ff80efbbbf' | xxd -r -p | base64 | base64 -d | xxd -p").salida, '00ff80efbbbf\n');
    assert.equal(s.ejecutar("printf '%%%s' '' | base64 -d").error, 'base64: invalid input\n');
  });
}
function probarRetos(prueba) {
  const es = Atalaya.lista('es'), en = Atalaya.lista('en');
  prueba('Atalaya · estructura bilingüe y plazas reservadas', () => {
    assert.deepEqual(es.map(r => r.id), ['A','B','C','D','E'].flatMap(c => [1, 2, 3, 4].map(n => c + n)));
    assert.deepEqual(es.map(r => r.puntos), en.map(r => r.puntos));
    assert.equal(es.reduce((suma, r) => suma + r.puntos, 0), 4700);
    assert.deepEqual(es.map(estructura), en.map(estructura));
  });
  for (const idioma of ['es', 'en']) for (const reto of Atalaya.lista(idioma)) {
    prueba('Atalaya · solución ' + reto.id + ' · ' + idioma, () => {
      const s = Atalaya.sesion(reto, idioma);
      assert.equal(s.ejecutar('submit FLAG{no}').error, idioma === 'es' ? 'Bandera incorrecta.\n' : 'Wrong flag.\n');
      assert.equal(s.entrega.correcta, false);
      let evidencia = '';
      for (const orden of reto.solucion.slice(0, -1)) {
        const r = s.ejecutar(orden);
        assert.equal(r.codigo, 0, r.error || orden);
        evidencia += r.salida;
      }
      assert.ok(evidencia.includes(reto.bandera.slice(5, -1)), evidencia);
      assert.equal(s.ejecutar(reto.solucion.at(-1)).codigo, 0);
      assert.equal(s.entrega.correcta, true);
    });
  }
}
function estructura({ id, categoria, puntos, pistas, solucion, cierre, fs }) {
  return [id, categoria, puntos, pistas.length, solucion.length, cierre.comandos, Object.keys(fs).length];
}
function probarServicios(prueba) {
  prueba('Atalaya · HTTP, cookies, parámetros y cabeceras exactas', () => {
    const s = Atalaya.sesion({ sitios: { 'http://panel.local': { '/status': [
      { codigo: 200, cabeceras: { 'X-Source': 'sensor' }, cuerpo: 'cálido\n',
        cookie: { region: 'north' }, parametros: { name: 'Sensor 1' } },
      { codigo: 403, cuerpo: 'Denied\n' }
    ] } } }, 'en');
    const url = '"http://panel.local/status?name=Sensor%201"';
    assert.equal(s.ejecutar('curl ' + url).salida, 'Denied\n');
    assert.equal(s.ejecutar('curl -b region=north http://panel.local/status').salida, 'Denied\n');
    assert.equal(s.ejecutar('curl -s -b "scale=c; region=north" ' + url).salida, 'cálido\n');
    assert.equal(s.ejecutar('curl -I -b region=north ' + url).salida,
      'HTTP/1.1 200 OK\r\nContent-Type: text/plain; charset=utf-8\r\nContent-Length: 8\r\nX-Source: sensor\r\n\r\n');
  });
  prueba('Atalaya · dueño, SUID, permisos de escritura y sudo declarativo', () => {
    const ruta = '/usr/local/bin/report';
    const s = Atalaya.sesion({ sudo: { [ruta]: 'Report ready\n' }, fs: {
      [ruta]: { contenido: '#!/bin/bash\n', permisos: 'rwxr-xr-x', dueno: 'root', suid: true },
      'shared.txt': { contenido: 'data', permisos: 'rw-r--rw-' }
    } }, 'en');
    assert.equal(s.ejecutar('find / -type f -perm -4000 -user root').salida, ruta + '\n');
    assert.equal(s.ejecutar('find . -type f -perm -o+w -user analyst').salida, './shared.txt\n');
    assert.equal(s.ejecutar('ls -l ' + ruta).salida, '-rwsr-xr-x 1 root root 12 Nov 16 03:14 ' + ruta + '\n');
    assert.equal(s.ejecutar('sudo -l').salida,
      'User analyst may run the following commands on watchtower:\n    (root) NOPASSWD: ' + ruta + '\n');
    assert.equal(s.ejecutar('sudo ' + ruta).salida, 'Report ready\n');
    assert.equal(s.ejecutar('sudo /no').error, "Sorry, user analyst is not allowed to execute '/no' as root on watchtower.\n");
    assert.equal(s.ejecutar('sudo -i').error, 'This simulator does not open root shells.\n');
  });
}
function probarEscalada(prueba) {
  const reto = id => Atalaya.lista('es').find(r => r.id === id);
  prueba('Atalaya · sudo ejecuta el script como root y luego vuelve al analista', () => {
    const s = Atalaya.sesion(reto('D3'), 'es');
    const script = '/usr/local/bin/copia.sh';
    assert.match(s.ejecutar('cat /root/bandera.txt').error, /Permission denied/);
    assert.equal(s.ejecutar('sudo ' + script).salida, 'Copia terminada.\n');
    assert.equal(s.ejecutar('cat /var/backups/turno.txt').salida, 'Turno 3: sin incidencias.\n');
    s.ejecutar("echo 'whoami; echo $USER $HOME' >> " + script);
    assert.equal(s.ejecutar('sudo ' + script).salida, 'Copia terminada.\nroot\nroot /root\n');
    assert.equal(s.ejecutar('whoami; echo $USER $HOME').salida, 'analista\nanalista /home/analista\n');
    assert.match(s.ejecutar('cat /root/bandera.txt').error, /Permission denied/);
    assert.match(s.ejecutar('bash ' + script).error, /Permission denied/);
    assert.match(s.ejecutar('sudo /usr/local/bin/otro.sh').error, /is not allowed to execute/);
  });
  prueba('Atalaya · D1 pide la bandera y además quitar el permiso', () => {
    const r = reto('D1');
    const s = Atalaya.sesion(r, 'es');
    assert.equal(s.ejecutar('enviar ' + r.bandera).error, r.requisito.falta + '\n');
    assert.equal(s.entrega.correcta, false);
    s.ejecutar('chmod o-w /srv/radio/claves.txt');
    assert.equal(s.ejecutar('enviar ' + r.bandera).codigo, 0);
    assert.equal(s.entrega.correcta, true);
  });
  prueba('Atalaya · los programas SUID de práctica no tapan las órdenes del simulador', () => {
    const s = Atalaya.sesion(Atalaya.lista('en').find(r => r.id === 'D2'), 'en');
    assert.equal(s.ejecutar('passwd').salida, 'passwd: practice program: it does nothing here\n');
    assert.match(s.ejecutar('sudo -l').error, /is not allowed to run sudo/);
    assert.equal(s.ejecutar('find / -perm -4000 -type f | grep -c /').salida, '7\n');
  });
}
module.exports = prueba => {
  probarHerramientas(prueba);
  probarEscalada(prueba);
  probarRetos(prueba);
  probarServicios(prueba);
  for (const idioma of ['es', 'en']) prueba('Atalaya · ayuda y manual · ' + idioma, () => {
    const s = Atalaya.sesion({}, idioma);
    const comando = idioma === 'es' ? 'enviar' : 'submit';
    const help = s.ejecutar('help').salida;
    assert.match(help, idioma === 'es' ? /base64 +Codifica/ : /base64 +Encode/);
    for (const nombre of ['base64', 'xxd', 'md5sum', 'sha256sum', 'curl', 'find', 'ls', 'sudo', comando]) {
      assert.ok(help.includes(nombre));
      assert.equal(s.ejecutar('man ' + nombre).codigo, 0);
    }
    assert.match(s.ejecutar('man ' + comando).salida, new RegExp(comando + ' FLAG'));
    assert.match(s.ejecutar('man find').salida, idioma === 'es' ? /Filtra por propietario/ : /Filter by owner/);
  });
  prueba('Atalaya · aviso guardado y puntuación máxima entre intentos', () => {
    const mapa = new Map();
    const almacen = { getItem: k => mapa.get(k), setItem: (k, v) => mapa.set(k, v) };
    const p = ProgresoAtalaya.crear(almacen);
    assert.equal(p.etica(), false);
    p.aceptar();
    assert.equal(ProgresoAtalaya.crear(almacen).etica(), true);
    p.resolver('B4', 300, 3);
    assert.equal(p.mejor('B4'), 150);
    p.resolver('B4', 300, 1);
    p.resolver('B4', 300, 2);
    assert.deepEqual(ProgresoAtalaya.crear(almacen).resumen(), { hechas: 1, total: 20, puntos: 225 });
  });
};
