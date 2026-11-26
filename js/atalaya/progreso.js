(function (CR) {
'use strict';
const clave = 'cr-atalaya';
function leer(almacen) {
  try { return JSON.parse(almacen.getItem(clave)) ?? {}; } catch { return {}; }
}
function crear(almacen) {
  let datos = leer(almacen);
  function guardar(cambios) {
    const ultima = leer(almacen);
    const mejores = { ...datos.mejores, ...ultima.mejores };
    for (const [id, puntos] of Object.entries(datos.mejores ?? {})) mejores[id] = Math.max(mejores[id] || 0, puntos);
    for (const [id, puntos] of Object.entries(cambios.mejores ?? {})) mejores[id] = Math.max(mejores[id] || 0, puntos);
    datos = { ...datos, ...ultima, ...cambios, mejores };
    try { almacen.setItem(clave, JSON.stringify(datos)); } catch { /* Conserva el progreso de esta página. */ }
  }
  return {
    etica: () => datos.etica === true,
    aceptar: () => guardar({ etica: true }),
    mejor: id => datos.mejores?.[id] ?? 0,
    actual: () => datos.actual,
    abrir: actual => guardar({ actual }),
    resolver: (id, puntos, pistas) => guardar({ mejores: { [id]: puntos * Math.max(.5, 1 - pistas * .25) } }),
    resumen() {
      const valores = Object.values(datos.mejores ?? {}).filter(p => Number.isFinite(p) && p > 0);
      return { hechas: valores.length, total: 20, puntos: valores.reduce((a, b) => a + b, 0) };
    }
  };
}
function navegador() {
  let almacen;
  try { almacen = globalThis.localStorage; } catch { /* Almacenamiento bloqueado. */ }
  return crear(almacen);
}
CR.ProgresoAtalaya = { crear, navegador };
})(globalThis.CR);
