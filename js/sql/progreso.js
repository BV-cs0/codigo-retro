(function (CR) {
  'use strict';
  const clave = 'cr-sql';
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
  function temas() {
    return [...(CR.Idioma.contenido('sqlTemas') || []), CR.Idioma.contenido('sqlSeguridad')].filter(Boolean);
  }
  const hechos = pasos => pasos.filter(paso => leer()[paso.id]?.hecho).length;
  const pasos = () => temas().flatMap(t => t.pasos);
  CR.ProgresoSQL = { guardar, temas, hechos, pasos, estado: id => leer()[id] || {} };
})(globalThis.CR);
