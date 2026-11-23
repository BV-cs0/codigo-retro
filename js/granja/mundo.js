(function () {
  'use strict';
  const bien = { ok: true };
  const fallo = mensaje => ({ ok: false, mensaje });

  function crear(mapa) {
    const parcelas = [...mapa.tierra];
    const estado = { parcelas, posicion: 0, cosechadas: 0, venta: null, filas: mapa.filas || 1 };
    const enMercado = () => estado.posicion === parcelas.length;
    const actual = () => parcelas[estado.posicion];

    function cuidar(nombre) {
      if (enMercado()) return fallo('Aquí está el mercado. Las parcelas quedan atrás.');
      if (nombre === 'plantar') {
        if (actual() !== '.') return fallo('Esta parcela ya tenía semilla.');
        parcelas[estado.posicion] = 's';
      } else if (nombre === 'regar') {
        if (actual() === 'h') return fallo('La tierra ya estaba mojada. Se ha encharcado.');
        if (actual() !== 's') return fallo('Primero hace falta una semilla.');
        parcelas[estado.posicion] = 'h';
      } else {
        if (actual() !== 'z') return fallo('Aquí no hay una zanahoria madura.');
        parcelas[estado.posicion] = '.';
        estado.cosechadas++;
      }
      return bien;
    }

    return {
      estado,
      acciones: ['avanzar', 'plantar', 'regar', 'cosechar', 'vender'],
      sensores: ['tierra_seca', 'hay_zanahoria', 'en_mercado'],
      ganado: () => enMercado() && (mapa.venta ? estado.venta === mapa.venta : parcelas.every(p => p === 'h')),
      sensor(nombre) {
        if (nombre === 'en_mercado') return enMercado();
        if (nombre === 'tierra_seca') return actual() === 's' || actual() === '.';
        return actual() === 'z';
      },
      accion(nombre, [cantidad] = []) {
        if (nombre === 'avanzar') {
          if (enMercado()) return fallo('Ya has llegado al mercado.');
          estado.posicion++;
          return bien;
        }
        if (nombre !== 'vender') return cuidar(nombre);
        if (!enMercado()) return fallo('La venta se hace en el puesto del mercado.');
        if (estado.venta !== null) return fallo('Ya has hecho la venta.');
        if (cantidad !== estado.cosechadas) {
          return fallo('La cuenta no cuadra. Llevas ' + estado.cosechadas + ' zanahorias.');
        }
        estado.venta = cantidad;
        return bien;
      }
    };
  }

  if (typeof window !== 'undefined') (window.CR ||= {}).MundoGranja = { crear };
  if (typeof module !== 'undefined') module.exports = { crear };
})();
