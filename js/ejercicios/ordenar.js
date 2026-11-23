(function () {
  'use strict';
  function crear(ejercicio, azar = Math.random) {
    const correctas = ejercicio.codigo.split('\n');
    const lineas = [...correctas, ...(ejercicio.trampa ? [ejercicio.trampa] : [])]
      .map((texto, id) => ({ id, texto: texto.trim(), nivel: 0, descartada: false }));
    for (let i = lineas.length - 1; i > 0; i--) {
      const j = Math.floor(azar() * (i + 1));
      [lineas[i], lineas[j]] = [lineas[j], lineas[i]];
    }
    const activas = lineas.filter(l => l.id < correctas.length);
    if (activas.every((l, i) => l.id === i)) lineas.push(lineas.shift());
    if (lineas.filter(l => l.id < correctas.length).every((l, i) => l.id === i)) lineas.reverse();
    return lineas;
  }
  function montar(lineas) {
    return lineas.filter(l => !l.descartada).map(l => '    '.repeat(l.nivel) + l.texto).join('\n');
  }
  function mover(lineas, id, accion) {
    const i = lineas.findIndex(l => l.id === id);
    const linea = lineas[i];
    if (accion === 'descartar') linea.descartada = !linea.descartada;
    else if (accion === 'izquierda') linea.nivel = Math.max(0, linea.nivel - 1);
    else if (accion === 'derecha') linea.nivel = Math.min(8, linea.nivel + 1);
    else {
      const j = i + (accion === 'arriba' ? -1 : 1);
      if (lineas[j]) [lineas[i], lineas[j]] = [lineas[j], lineas[i]];
    }
  }
  const OrdenarTaller = { crear, montar, mover };
  if (typeof module !== 'undefined') module.exports = OrdenarTaller;
  else window.CR.OrdenarTaller = OrdenarTaller;
})();
