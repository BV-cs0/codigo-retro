(function () {
  'use strict';
  const T = typeof module !== 'undefined' ? require('../comun/tablero') : window.CR.Tablero;
  const crear = mapa => T.crear(mapa, ['avanzar', 'girar_izquierda', 'girar_derecha', 'lanzar_fuego', 'abrir'],
    ['hay_muro', 'hay_enemigo', 'leer_runa'], {
      obstaculos: { '#': 'Hay un muro delante.', b: 'Un murciélago te corta el paso.',
        p3: 'La puerta sigue cerrada.', p7: 'La puerta sigue cerrada.' },
      accion(nombre, [clave], ficha, quitar) {
        if (nombre === 'lanzar_fuego') {
          return ficha === 'b' ? quitar() : T.fallo('No hay murciélago delante.');
        }
        if (ficha !== 'p3' && ficha !== 'p7') return T.fallo('No hay una puerta delante.');
        return clave === Number(ficha[1]) ? quitar() : T.fallo('La runa no coincide con la puerta.');
      },
      sensor(nombre, ficha, actual) {
        if (nombre === 'hay_enemigo') return ficha === 'b';
        if (typeof actual === 'number') return actual;
        throw new Error('Brasa no está sobre una piedra de runa.');
      }
    });
  if (typeof window !== 'undefined') (window.CR ||= {}).MundoMago = { crear };
  if (typeof module !== 'undefined') module.exports = { crear };
})();
