(function () {
  'use strict';
  const { Idioma } = typeof module !== 'undefined' ? require('../comun/idioma') : window.CR;
  const clave = 'codigo-retro-taller';
  let memoria = {}, enMemoria = false;
  function leer() {
    if (enMemoria) return memoria;
    try { return JSON.parse(localStorage.getItem(clave)) || memoria; }
    catch { return memoria; }
  }
  function estado(id) {
    const datos = leer()[id] || {};
    if (Idioma.actual() !== 'en') return datos;
    return { resuelto: datos.resuelto, fallos: datos.fallos, ...datos.en };
  }
  function guardar(id, cambios) {
    const datos = leer();
    if (Idioma.actual() === 'en') {
      const { codigo, lineas, ...progreso } = cambios;
      const en = { ...datos[id]?.en };
      if (codigo !== undefined) en.codigo = codigo;
      if (lineas !== undefined) en.lineas = lineas;
      datos[id] = { ...datos[id], ...progreso, en };
    } else datos[id] = { ...datos[id], ...cambios };
    memoria = datos;
    try { localStorage.setItem(clave, JSON.stringify(datos)); }
    catch { enMemoria = true; }
  }
  const ProgresoTaller = { estado, guardar, total: () => Object.values(leer()).filter(e => e.resuelto).length };
  if (typeof module !== 'undefined') module.exports = ProgresoTaller;
  else (window.CR ||= {}).ProgresoTaller = ProgresoTaller;
})();
