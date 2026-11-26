'use strict';
const assert = require('node:assert/strict');
const { mkdtempSync, mkdirSync, writeFileSync, rmSync } = require('node:fs');
const { dirname, join, resolve, sep } = require('node:path');
const { spawnSync } = require('node:child_process');
const casos = require('./datos-atalaya-bash');
const bash = process.argv[2] ?? 'D:\\Git\\bin\\bash.exe';
const raiz = resolve(__dirname, '..');
const carpeta = mkdtempSync(join(raiz, '.atalaya-bash-'));

function comparar(caso, idioma) {
  // Cada caso en su propia carpeta: así no ve archivos de casos anteriores.
  const dir = mkdtempSync(join(carpeta, 'caso-'));
  for (const [ruta, contenido] of Object.entries(caso.fs)) {
    const archivo = resolve(dir, ruta);
    assert.ok(archivo.startsWith(dir + sep), ruta);
    mkdirSync(dirname(archivo), { recursive: true });
    writeFileSync(archivo, contenido);
  }
  // MSYS marca los hashes como binarios por defecto. -t usa el formato de GNU/Linux.
  const entorno = 'export PATH=/usr/bin:$PATH\n' +
    'md5sum() { command md5sum -t "$@"; }\nsha256sum() { command sha256sum -t "$@"; }\n';
  const r = spawnSync(bash, ['--noprofile', '--norc', '-c', entorno + caso.linea],
    { cwd: dir, env: { ...process.env, LC_ALL: 'C' }, encoding: 'utf8' });
  if (r.error) throw r.error;
  const nombre = caso.id + ' · ' + idioma;
  assert.equal(r.status, 0, nombre + '\n' + r.stderr);
  assert.equal(r.stderr, '', nombre);
  assert.equal(r.stdout, caso.salida, nombre);
  console.log('✓ ' + nombre);
}
try {
  let total = 0;
  for (const idioma of ['es', 'en']) for (const caso of casos(idioma)) {
    comparar(caso, idioma);
    total++;
  }
  console.log(total + ' comparaciones exactas con Git Bash');
} finally {
  assert.equal(dirname(carpeta), raiz);
  rmSync(carpeta, { recursive: true, force: true });
}
