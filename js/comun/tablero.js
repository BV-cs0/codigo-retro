(function () {
  'use strict';
  const rumbos = [[1, 0], [0, 1], [-1, 0], [0, -1]];
  const ok = { ok: true };
  const fallo = mensaje => ({ ok: false, mensaje });

  function mapa(trazo, objetos = {}, inicio = [0, 0]) {
    const celdas = Array.from({ length: 8 }, () => Array(8).fill('#'));
    let [x, y] = inicio;
    const abrir = () => { if (x >= 0) celdas[y][x] = '.'; };
    abrir();
    for (const letra of trazo) {
      const [dx, dy] = rumbos['ESON'.indexOf(letra)];
      x += dx;
      y += dy;
      abrir();
    }
    celdas[y][x] = '*';
    for (const [posicion, ficha] of Object.entries(objetos)) {
      const [columna, fila] = posicion.split(',').map(Number);
      celdas[fila][columna] = ficha;
    }
    return { celdas, inicio };
  }

  function crear(mapa, acciones, sensores, reglas) {
    const celdas = mapa.celdas.map(fila => fila.slice());
    const [x, y] = mapa.inicio;
    const estado = { celdas, x, y, direccion: 0 };
    const actual = () => celdas[estado.y]?.[estado.x];
    const delante = () => {
      const [dx, dy] = rumbos[estado.direccion];
      return [estado.x + dx, estado.y + dy];
    };
    const ficha = () => {
      const [x, y] = delante();
      return celdas[y]?.[x] ?? '#';
    };
    const quitar = () => {
      const [x, y] = delante();
      celdas[y][x] = '.';
      return ok;
    };
    return {
      estado, acciones, sensores,
      ganado: () => actual() === '*',
      accion(nombre, args = []) {
        if (nombre === 'avanzar') {
          const problema = reglas.obstaculos[String(ficha())];
          if (problema) return fallo(problema);
          [estado.x, estado.y] = delante();
          return ok;
        }
        if (nombre === 'girar_izquierda' || nombre === 'girar_derecha') {
          estado.direccion = (estado.direccion + (nombre === 'girar_izquierda' ? 3 : 1)) % 4;
          return ok;
        }
        return reglas.accion(nombre, args, ficha(), quitar);
      },
      sensor(nombre) {
        if (nombre === 'hay_muro') return ficha() === '#';
        return reglas.sensor(nombre, ficha(), actual());
      }
    };
  }

  const Tablero = { mapa, crear, ok, fallo };
  if (typeof window !== 'undefined') (window.CR ||= {}).Tablero = Tablero;
  if (typeof module !== 'undefined') module.exports = Tablero;
})();
