(function (CR) {
  'use strict';
  const CLAVE = 'cr-el-faro';
  let estado = {};
  const hechas = new Set();
  function refrescar() {
    try {
      const guardado = JSON.parse(localStorage.getItem(CLAVE) || '{}') || {};
      for (const id of Array.isArray(guardado.hechas) ? guardado.hechas : []) {
        if (/^(?:[1-9]|1[0-2])-[1-5]$/.test(id)) hechas.add(id);
      }
      estado = { ...estado, ...guardado, hechas: [...hechas] };
    } catch {}
  }
  refrescar();
  function guardar(cambios) {
    estado = { ...estado, ...cambios };
    try { localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch {}
  }
  CR.ProgresoFaro = {
    refrescar,
    total: () => hechas.size,
    hecha: id => hechas.has(id),
    completar(id) { hechas.add(id); guardar({ hechas: [...hechas] }); },
    ultima: () => estado.ultima,
    abrir(id) { guardar({ ultima: id }); },
    fosforo: () => ['verde', 'ambar', 'blanco'].includes(estado.fosforo) ? estado.fosforo : 'verde',
    cambiarFosforo(fosforo) { guardar({ fosforo }); }
  };
})(globalThis.CR = globalThis.CR || {});
