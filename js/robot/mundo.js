(function () {
  'use strict';
  const traducir = typeof module !== 'undefined' ? require('../comun/idioma').t : globalThis.CR.t;
  const T = typeof module !== 'undefined' ? require('../comun/tablero') : window.CR.Tablero;
  const crear = mapa => T.crear(mapa, ['avanzar', 'girar_izquierda', 'girar_derecha', 'picar'],
    ['hay_muro', 'hay_roca_blanda', 'leer_cartel'], {
      obstaculos: { '#': traducir("robot.te_has_chocado_con_un"), r: traducir("robot.hay_roca_blanda_delante_pico") },
      accion(nombre, args, ficha, quitar) {
        if (nombre === 'picar' && ficha === 'r') return quitar();
        return T.fallo(traducir("robot.no_hay_roca_blanda_delante"));
      },
      sensor(nombre, ficha, actual) {
        if (nombre === 'hay_roca_blanda') return ficha === 'r';
        if (typeof actual === 'number') return actual;
        throw new Error(traducir("robot.pico_no_esta_sobre_un"));
      }
    });
  if (typeof window !== 'undefined') (window.CR ||= {}).MundoRobot = { crear };
  if (typeof module !== 'undefined') module.exports = { crear };
})();
