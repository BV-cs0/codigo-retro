'use strict';
const assert = require('node:assert/strict');
const { readdirSync, readFileSync } = require('node:fs');
const { join } = require('node:path');
require('../js/comun/idioma');

function* htmlEn(carpeta) {
  for (const entrada of readdirSync(carpeta, { withFileTypes: true })) {
    if (entrada.name.startsWith('.') || entrada.name === 'node_modules' || entrada.name === 'escritorio') continue;
    const ruta = join(carpeta, entrada.name);
    if (entrada.isDirectory()) yield* htmlEn(ruta);
    else if (/\.html$/i.test(entrada.name)) yield ruta;
  }
}

function atributo(etiqueta, nombre) {
  const patron = new RegExp('\\s' + nombre + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))', 'i');
  return patron.exec(etiqueta)?.slice(1).find(v => v !== undefined);
}

module.exports = prueba => {
  const version = globalThis.CR.VERSION;
  prueba('CR.VERSION tiene el formato de la versión publicada', () => assert.match(version, /^\d+\.\d+\.\d+$/));
  for (const ruta of htmlEn(join(__dirname, '..'))) {
    prueba('Recursos locales con CR.VERSION · ' + ruta.split(/[\\/]/).at(-1), () => {
      const html = readFileSync(ruta, 'utf8').replace(/<!--[\s\S]*?-->/g, '');
      for (const [tag, tipo] of html.matchAll(/<(script|link)\b(?:"[^"]*"|'[^']*'|[^'">])*>/gi)) {
        const esScript = tipo.toLowerCase() === 'script';
        if (!esScript && !atributo(tag, 'rel')?.toLowerCase().split(/\s+/).includes('stylesheet')) continue;
        const ref = atributo(tag, esScript ? 'src' : 'href');
        if (ref === undefined || /^(?:[a-z][\w+.-]*:|\/\/)/i.test(ref.trim())) continue;
        const url = new URL(ref, 'https://local.invalid/');
        assert.deepEqual(url.searchParams.getAll('v'), [version], ref);
      }
    });
  }
};
