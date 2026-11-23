(function (CR) {
'use strict';
const clave = 'codigo-retro-bash';
let memoria = {}, persistente = true;
function leer() {
  if (!persistente) return memoria;
  try { return JSON.parse(localStorage.getItem(clave)) || memoria; }
  catch { return memoria; }
}
function guardar(id, datos) {
  const actual = leer();
  actual[id] = { ...actual[id], ...datos };
  memoria = actual;
  try { localStorage.setItem(clave, JSON.stringify(actual)); }
  catch { persistente = false; }
}
CR.ProgresoBash = {
  guardar, estado: id => leer()[id] || {},
  total: (tema = '') => Object.entries(leer()).filter(([k, v]) => k.startsWith(tema) && v.hecho).length
};
})(globalThis.CR = globalThis.CR || {});
