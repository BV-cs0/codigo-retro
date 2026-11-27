'use strict';
// Pruebas del aviso de versión nueva: npm test
const test = require('node:test');
const assert = require('node:assert/strict');
const A = require('../actualizador/logica');

const RAIZ = 'https://github.com/BV-cs0/codigo-retro/releases/';
function release(version, cambios = {}) {
  return { tag_name: 'v' + version, draft: false, prerelease: false, html_url: RAIZ + 'tag/v' + version, assets: [
    { name: 'CodigoRetro.exe', browser_download_url: RAIZ + 'download/v' + version + '/CodigoRetro.exe' },
    { name: 'CodigoRetro.exe.sha256', browser_download_url: RAIZ + 'download/v' + version + '/CodigoRetro.exe.sha256' }
  ], ...cambios };
}
const deps = (pedirJson, versionActual = '1.3.0') => ({ versionActual, pedirJson });

test('compara versiones número a número, no como texto', () => {
  assert.equal(A.compararVersiones('1.10.0', '1.9.9'), 1);
  assert.equal(A.compararVersiones('v1.3.0', '1.3.0'), 0);
  assert.equal(A.compararVersiones('1.3.0', '1.3.1'), -1);
  assert.equal(A.compararVersiones('2.0.0', '10.0.0'), -1);
  assert.equal(A.esMasNueva('1.3.0', '1.4.0'), true);
  assert.equal(A.esMasNueva('1.3.0', '1.3.0'), false);
  assert.equal(A.esMasNueva('1.3.0', '1.2.9'), false);
});

test('una versión con formato raro nunca cuenta como más nueva', () => {
  for (const rara of ['', null, undefined, 'latest', '1.4', '1.4.0-beta', '1.4.0.1', 'v9.9.9 ', ' x9.9.9', {}, 99])
    if (String(rara).trim() !== 'v9.9.9') assert.equal(A.esMasNueva('1.3.0', rara), false, String(rara));
  assert.equal(A.esMasNueva('raro', '9.9.9'), false);
});

test('solo acepta releases del canal oficial por HTTPS y con el .exe', () => {
  assert.deepEqual(A.leerRelease(release('1.4.0')), { version: '1.4.0', url: RAIZ + 'tag/v1.4.0' });
  const malos = [
    release('1.4.0', { draft: true }),
    release('1.4.0', { prerelease: true }),
    release('1.4.0', { html_url: 'http://github.com/BV-cs0/codigo-retro/releases/tag/v1.4.0' }),
    release('1.4.0', { html_url: 'https://github.com/otra/codigo-retro/releases/tag/v1.4.0' }),
    release('1.4.0', { html_url: RAIZ + 'tag/v1.4.0?x=1' }),
    release('1.4.0', { html_url: RAIZ + 'tag/v1.5.0' }),
    release('1.4.0', { assets: [] }),
    release('1.4.0', { assets: 'nada' }),
    release('1.4.0', { assets: [{ name: 'CodigoRetro.exe', browser_download_url: RAIZ + 'download/v1.3.0/CodigoRetro.exe' }] }),
    release('1.4.0', { assets: [{ name: 'CodigoRetro.exe', browser_download_url: 'https://malicioso.example/CodigoRetro.exe' }] }),
    release('1.4.0', { tag_name: 'latest' }),
    null, undefined, 'texto', 42, []
  ];
  for (const malo of malos) assert.equal(A.leerRelease(malo), null, JSON.stringify(malo));
});

test('avisa cuando hay una versión más nueva', async () => {
  const resultado = await A.comprobar(deps(async () => release('1.4.0')));
  assert.deepEqual(resultado, { estado: 'nueva', version: '1.4.0', url: RAIZ + 'tag/v1.4.0' });
});

test('si ya es la última versión (o una anterior) no avisa', async () => {
  assert.equal((await A.comprobar(deps(async () => release('1.3.0')))).estado, 'al-dia');
  assert.equal((await A.comprobar(deps(async () => release('1.2.0')))).estado, 'al-dia');
});

test('sin red: no lanza excepción, solo dice que no hay datos', async () => {
  const sinRed = async () => { throw new TypeError('Failed to fetch'); };
  assert.deepEqual(await A.comprobar(deps(sinRed)), { estado: 'sin-datos' });
  const lanzaYa = () => { throw new Error('falla antes de la promesa'); };
  assert.deepEqual(await A.comprobar(deps(lanzaYa)), { estado: 'sin-datos' });
});

test('si GitHub no contesta, se rinde al pasar el tiempo límite', async () => {
  const inicio = Date.now();
  const resultado = await A.comprobar(deps(() => new Promise(() => {})), 50);
  assert.deepEqual(resultado, { estado: 'sin-datos' });
  assert.ok(Date.now() - inicio < 2000);
});

test('con datos raros de la API no avisa', async () => {
  for (const raro of [null, {}, { message: 'API rate limit exceeded' }, 'html', release('9.9.9', { draft: true })])
    assert.deepEqual(await A.comprobar(deps(async () => raro)), { estado: 'sin-datos' });
});

test('sin versión actual válida o sin forma de pedir datos no hace nada', async () => {
  assert.deepEqual(await A.comprobar(deps(async () => release('9.9.9'), 'dev')), { estado: 'no-aplica' });
  assert.deepEqual(await A.comprobar({ versionActual: '1.3.0' }), { estado: 'no-aplica' });
  assert.deepEqual(await A.comprobar(null), { estado: 'no-aplica' });
});

test('pide la API oficial de GitHub con el tiempo límite', async () => {
  let pedido;
  await A.comprobar(deps(async (url, ms) => { pedido = { url, ms }; return release('1.3.0'); }));
  assert.deepEqual(pedido, { url: 'https://api.github.com/repos/BV-cs0/codigo-retro/releases/latest', ms: A.TIEMPO_API_MS });
  assert.ok(A.TIEMPO_API_MS <= 5000);
});

test('el texto del aviso sigue el idioma del juego', () => {
  assert.equal(A.textos('en').enlace, 'download');
  assert.equal(A.textos('en-GB').aviso, 'A new version is available:');
  assert.equal(A.textos('es').enlace, 'descargar');
  assert.equal(A.textos('fr').enlace, 'descargar');
  assert.equal(A.textos(undefined).enlace, 'descargar');
});

test('el .exe no activa funciones nativas de Neutralino', () => {
  const config = require('../neutralino.config.json');
  assert.equal(config.enableNativeAPI, false);
  assert.deepEqual(config.nativeAllowList, []);
});
