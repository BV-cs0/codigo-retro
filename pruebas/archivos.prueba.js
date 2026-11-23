'use strict';
const assert = require('node:assert/strict');
const { readFileSync, readdirSync, existsSync } = require('node:fs');
const { join, dirname } = require('node:path');
const vm = require('node:vm');

function* archivos(ruta) {
  for (const entrada of readdirSync(ruta, { withFileTypes: true })) {
    const interior = join(ruta, entrada.name);
    if (entrada.isDirectory()) yield* archivos(interior);
    else yield interior;
  }
}

module.exports = prueba => {
  const raiz = join(__dirname, '..');
  for (const nombre of archivos(raiz)) {
    if (!/\.(js|html|css|md)$/.test(nombre)) continue;
    prueba('Archivos · ' + nombre.slice(raiz.length + 1), () => {
      const bytes = readFileSync(nombre);
      assert.notEqual(bytes.subarray(0, 3).toString('hex'), 'efbbbf', 'BOM');
      const texto = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
      assert.doesNotMatch(texto, /\ufffd/);
      if (/\.(js|html)$/.test(nombre)) {
        assert.doesNotMatch(texto, /\beval\s*\(|\bnew\s+Function\b|\bfetch\s*\(/);
      }
      if (nombre.endsWith('.js')) new vm.Script(texto, { filename: nombre });
      if (nombre.endsWith('.html')) {
        for (const [, ruta] of texto.matchAll(/(?:src|href)="([^"]+)"/g)) {
          const [archivo, ancla] = ruta.split('#');
          assert.equal(existsSync(join(dirname(nombre), archivo)), true, ruta);
          if (!archivo && ancla) assert.ok(texto.includes('id="' + ancla + '"'), ruta);
        }
      }
    });
  }
};
