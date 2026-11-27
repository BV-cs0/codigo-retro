'use strict';
const assert = require('node:assert/strict');
const { readFileSync, readdirSync, existsSync } = require('node:fs');
const { join, dirname } = require('node:path');
const vm = require('node:vm');

// escritorio/ es el empaquetador del .exe: tiene sus propias pruebas (npm test), y su aviso de
// versión nueva sí consulta GitHub. Tampoco se miran carpetas ocultas ni dependencias.
const OMITIR = new Set(['escritorio', 'node_modules']);

function* archivos(ruta) {
  for (const entrada of readdirSync(ruta, { withFileTypes: true })) {
    if (entrada.isDirectory() && (entrada.name.startsWith('.') || OMITIR.has(entrada.name))) continue;
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
          const [recurso, ancla] = ruta.split('#');
          const archivo = recurso.split('?')[0];
          assert.equal(existsSync(join(dirname(nombre), archivo)), true, ruta);
          if (!archivo && ancla) assert.ok(texto.includes('id="' + ancla + '"'), ruta);
        }
      }
    });
  }
};
