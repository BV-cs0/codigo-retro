(function () {
  'use strict';
  const clave = 'codigo-retro-taller';
  let memoria = {}, enMemoria = false;
  function leer() {
    if (enMemoria) return memoria;
    try { return JSON.parse(localStorage.getItem(clave)) || memoria; }
    catch { return memoria; }
  }
  function estado(id) { return leer()[id] || {}; }
  function guardar(id, cambios) {
    const datos = leer();
    datos[id] = { ...datos[id], ...cambios };
    memoria = datos;
    try { localStorage.setItem(clave, JSON.stringify(datos)); }
    catch { enMemoria = true; }
  }
  const ProgresoTaller = { estado, guardar, total: () => Object.values(leer()).filter(e => e.resuelto).length };
  if (typeof module !== 'undefined') module.exports = ProgresoTaller;
  else (window.CR ||= {}).ProgresoTaller = ProgresoTaller;
})();
