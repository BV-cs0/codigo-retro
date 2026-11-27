'use strict';
// Copia el juego a resources/, dibuja el icono de Lumen y crea el .exe con Neutralino.
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { execSync } = require('child_process');

// El juego es la carpeta de arriba: este empaquetador vive en escritorio/ del mismo repositorio.
const JUEGO = path.resolve(__dirname, '..');
const RECURSOS = path.join(__dirname, 'resources');
// Solo se copia lo que necesita el juego para funcionar (escritorio/ es este empaquetador).
const EXCLUIR = new Set(['escritorio', 'pruebas', 'docs', 'node_modules', 'README.md', 'SECURITY.md']);
const ES_ESPECIFICACION = nombre => /^ESPECIFICACION.*\.md$/.test(nombre);

// Se copia entrada a entrada: Node no deja copiar una carpeta dentro de una subcarpeta suya.
function copiarJuego() {
  const seCopia = nombre => !nombre.startsWith('.') && !EXCLUIR.has(nombre) && !ES_ESPECIFICACION(nombre);
  fs.rmSync(RECURSOS, { recursive: true, force: true });
  fs.mkdirSync(RECURSOS);
  for (const nombre of fs.readdirSync(JUEGO).filter(seCopia)) {
    fs.cpSync(path.join(JUEGO, nombre), path.join(RECURSOS, nombre), {
      recursive: true,
      filter: origen => seCopia(path.basename(origen))
    });
  }
}

// Lumen, el farolero de El Faro (mismo dibujo que js/terminal/sprites.js).
const LUMEN = [
  '......oo........', '.....o..o.......', '.....oooo.......', '....okkkko......',
  '...okaaakko.....', '...oakyyako.....', '...oayyyaao.....', '...oaywykao.....',
  '...oaywyyao.....', '...oayyyyao.....', '...okaaakko.....', '....okkkko......',
  '.....oooo.......', '................', '................', '................'
];
const PALETA = { o: [0x44, 0x31, 0x4e], k: [0x80, 0x51, 0x32], a: [0xea, 0xa0, 0x3f], y: [0xff, 0xe2, 0x7f], w: [0xff, 0xf1, 0xd3] };
const FONDO = [0x1d, 0x1a, 0x2b];

function crc32(datos) {
  let c = ~0;
  for (const byte of datos) {
    c ^= byte;
    for (let i = 0; i < 8; i++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}
function bloque(tipo, datos) {
  const largo = Buffer.alloc(4);
  largo.writeUInt32BE(datos.length);
  const cuerpo = Buffer.concat([Buffer.from(tipo, 'ascii'), datos]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(cuerpo));
  return Buffer.concat([largo, cuerpo, crc]);
}
// PNG cuadrado: fondo redondeado oscuro y Lumen centrado.
function png(lado) {
  const escala = lado / 16;
  const filas = [];
  for (let y = 0; y < lado; y++) {
    const fila = Buffer.alloc(1 + lado * 4);
    for (let x = 0; x < lado; x++) {
      const sx = Math.floor(x / escala) + 2, sy = Math.floor(y / escala) + 1;
      const c = (LUMEN[sy] || '')[sx];
      const esquina = Math.min(x, lado - 1 - x) + Math.min(y, lado - 1 - y) < lado / 8;
      const color = PALETA[c] || FONDO;
      fila.set([...color, esquina ? 0 : 255], 1 + x * 4);
    }
    filas.push(fila);
  }
  const cabecera = Buffer.alloc(13);
  cabecera.writeUInt32BE(lado, 0);
  cabecera.writeUInt32BE(lado, 4);
  cabecera.set([8, 6, 0, 0, 0], 8);
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    bloque('IHDR', cabecera), bloque('IDAT', zlib.deflateSync(Buffer.concat(filas))), bloque('IEND', Buffer.alloc(0))
  ]);
}
// ICO con imágenes PNG dentro (válido desde Windows Vista).
function ico(lados) {
  const imagenes = lados.map(png);
  const cabecera = Buffer.alloc(6 + 16 * lados.length);
  cabecera.writeUInt16LE(1, 2);
  cabecera.writeUInt16LE(lados.length, 4);
  let desplazamiento = cabecera.length;
  imagenes.forEach((imagen, i) => {
    const base = 6 + 16 * i;
    cabecera[base] = lados[i] >= 256 ? 0 : lados[i];
    cabecera[base + 1] = lados[i] >= 256 ? 0 : lados[i];
    cabecera.writeUInt16LE(1, base + 4);
    cabecera.writeUInt16LE(32, base + 6);
    cabecera.writeUInt32LE(imagen.length, base + 8);
    cabecera.writeUInt32LE(desplazamiento, base + 12);
    desplazamiento += imagen.length;
  });
  return Buffer.concat([cabecera, ...imagenes]);
}

// La versión sale de una sola fuente: CR.VERSION del juego.
function versionDelJuego() {
  const idioma = fs.readFileSync(path.join(JUEGO, 'js', 'comun', 'idioma.js'), 'utf8');
  const m = /CR\.VERSION\s*=\s*'(\d+\.\d+\.\d+)'/.exec(idioma);
  if (!m) throw new Error('No encuentro CR.VERSION en js/comun/idioma.js');
  return m[1];
}
function ponerVersionEnConfig(version) {
  const ruta = path.join(__dirname, 'neutralino.config.json');
  const config = JSON.parse(fs.readFileSync(ruta, 'utf8'));
  fs.writeFileSync(ruta, JSON.stringify({ ...config, version }, null, 2) + '\n');
}
// Solo el .exe lleva el aviso de versión nueva: se copia y se carga al final del menú.
// No usa funciones nativas de Neutralino (enableNativeAPI sigue en false).
function anadirActualizador() {
  const destino = path.join(RECURSOS, 'actualizador');
  fs.mkdirSync(destino, { recursive: true });
  for (const archivo of ['logica.js', 'aviso.js'])
    fs.copyFileSync(path.join(__dirname, 'actualizador', archivo), path.join(destino, archivo));
  const menu = path.join(RECURSOS, 'index.html');
  const html = fs.readFileSync(menu, 'utf8');
  if (!html.includes('</body>')) throw new Error('index.html no tiene </body>');
  const v = '?v=' + versionDelJuego();
  const scripts = '<script src="actualizador/logica.js' + v + '"></script>\n' +
    '<script src="actualizador/aviso.js' + v + '"></script>\n</body>';
  fs.writeFileSync(menu, html.replace('</body>', scripts));
}
function escribirHash(exe) {
  const hash = require('crypto').createHash('sha256').update(fs.readFileSync(exe)).digest('hex');
  fs.writeFileSync(exe + '.sha256', hash + '  ' + path.basename(exe) + '\n');
  return hash;
}

function main() {
  const version = versionDelJuego();
  ponerVersionEnConfig(version);
  copiarJuego();
  anadirActualizador();
  fs.writeFileSync(path.join(RECURSOS, 'icono.png'), png(256));
  fs.writeFileSync(path.join(__dirname, 'icono.ico'), ico([16, 32, 48, 256]));
  // Los binarios de Neutralino no se guardan en el repositorio: se descargan la primera vez
  // de sus releases oficiales, en la versión fijada en neutralino.config.json (cli.binaryVersion).
  if (!fs.existsSync(path.join(__dirname, 'bin', 'neutralino-win_x64.exe')))
    execSync('npx neu update', { cwd: __dirname, stdio: 'inherit' });
  execSync('npx neu build --release --embed-resources', { cwd: __dirname, stdio: 'inherit' });
  const exe = ponerIcono(version);
  console.log('Código Retro ' + version + ' · SHA-256 ' + escribirHash(exe));
}
// Pone el icono y los datos del programa al .exe de Windows y lo deja en entrega/.
function ponerIcono(version) {
  const origen = path.join(__dirname, 'dist', 'CodigoRetro', 'CodigoRetro-win_x64.exe');
  const destino = path.join(__dirname, 'entrega', 'CodigoRetro.exe');
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.copyFileSync(origen, destino);
  const rcedit = path.join(__dirname, 'node_modules', 'rcedit', 'bin', 'rcedit-x64.exe');
  const datos = ['--set-icon', path.join(__dirname, 'icono.ico'),
    '--set-version-string', 'ProductName', 'Código Retro',
    '--set-version-string', 'FileDescription', 'Código Retro: aprende Python, Linux, Bash y SQL jugando',
    '--set-version-string', 'CompanyName', 'Bryan Valenzuela',
    '--set-version-string', 'LegalCopyright', 'Bryan Valenzuela',
    '--set-file-version', version, '--set-product-version', version];
  require('child_process').execFileSync(rcedit, [destino, ...datos], { stdio: 'inherit' });
  return destino;
}
main();
