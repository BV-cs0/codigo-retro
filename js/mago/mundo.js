(function () {
  'use strict';
  const traducir = typeof module !== 'undefined' ? require('../comun/idioma').t : globalThis.CR.t;
  const T = typeof module !== 'undefined' ? require('../comun/tablero') : window.CR.Tablero;
  const crear = mapa => T.crear(mapa, ['avanzar', 'girar_izquierda', 'girar_derecha', 'lanzar_fuego', 'abrir'],
    ['hay_muro', 'hay_enemigo', 'leer_runa'], {
      obstaculos: { '#': traducir("mago.hay_un_muro_delante"), b: traducir("mago.un_murcielago_te_corta_el"),
        p3: traducir("mago.la_puerta_sigue_cerrada"), p7: traducir("mago.la_puerta_sigue_cerrada") },
      accion(nombre, [clave], ficha, quitar) {
        if (nombre === 'lanzar_fuego') {
          return ficha === 'b' ? quitar() : T.fallo(traducir("mago.no_hay_murcielago_delante"));
        }
        if (ficha !== 'p3' && ficha !== 'p7') return T.fallo(traducir("mago.no_hay_una_puerta_delante"));
        return clave === Number(ficha[1]) ? quitar() : T.fallo(traducir("mago.la_runa_no_coincide_con"));
      },
      sensor(nombre, ficha, actual) {
        if (nombre === 'hay_enemigo') return ficha === 'b';
        if (typeof actual === 'number') return actual;
        throw new Error(traducir("mago.brasa_no_esta_sobre_una"));
      }
    });
  if (typeof window !== 'undefined') (window.CR ||= {}).MundoMago = { crear };
  if (typeof module !== 'undefined') module.exports = { crear };
})();
