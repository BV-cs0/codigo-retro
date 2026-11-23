(function () {
  'use strict';
  const T = typeof module !== 'undefined' ? require('../comun/tablero') : window.CR.Tablero;
  const crear = mapa => T.crear(mapa, ['avanzar', 'girar_izquierda', 'girar_derecha', 'picar'],
    ['hay_muro', 'hay_roca_blanda', 'leer_cartel'], {
      obstaculos: { '#': 'Te has chocado con un muro.', r: 'Hay roca blanda delante. Pico puede picarla.' },
      accion(nombre, args, ficha, quitar) {
        if (nombre === 'picar' && ficha === 'r') return quitar();
        return T.fallo('No hay roca blanda delante.');
      },
      sensor(nombre, ficha, actual) {
        if (nombre === 'hay_roca_blanda') return ficha === 'r';
        if (typeof actual === 'number') return actual;
        throw new Error('Pico no está sobre un cartel.');
      }
    });
  if (typeof window !== 'undefined') (window.CR ||= {}).MundoRobot = { crear };
  if (typeof module !== 'undefined') module.exports = { crear };
})();
