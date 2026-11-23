(function () {
  'use strict';
  const memoria = Object.create(null);
  const clave = (demo, id, dato) => ['codigo-retro', demo, id, dato].join('/');
  function leer(id) {
    if (Object.hasOwn(memoria, id)) return memoria[id];
    try { return globalThis.localStorage.getItem(id); } catch { return null; }
  }
  function guardar(id, valor) {
    memoria[id] = String(valor);
    try { globalThis.localStorage.setItem(id, String(valor)); } catch { /* La partida sigue en memoria. */ }
  }
  function estrellas(demo, id) {
    const valor = Number(leer(clave(demo, id, 'estrellas')));
    return Number.isInteger(valor) && valor >= 0 && valor <= 3 ? valor : 0;
  }
  const Progreso = {
    estrellas,
    total: demo => [1, 2, 3, 4, 5].reduce((suma, id) => suma + estrellas(demo, id), 0),
    guardarEstrellas: (demo, id, valor) => guardar(clave(demo, id, 'estrellas'), Math.max(valor, estrellas(demo, id))),
    codigo: (demo, id) => leer(clave(demo, id, 'codigo')),
    guardarCodigo: (demo, id, texto) => guardar(clave(demo, id, 'codigo'), texto),
    silencio: () => leer('codigo-retro/silencio') === 'true',
    guardarSilencio: valor => guardar('codigo-retro/silencio', valor)
  };
  if (typeof window !== 'undefined') (window.CR ||= {}).Progreso = Progreso;
  if (typeof module !== 'undefined') module.exports = Progreso;
})();
