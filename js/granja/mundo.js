(function () {
  'use strict';
  const traducir = typeof module !== 'undefined' ? require('../comun/idioma').t : globalThis.CR.t;
  const bien = { ok: true };
  const fallo = mensaje => ({ ok: false, mensaje });

  function vender(estado, cantidad, enMercado) {
    if (!enMercado) return fallo(traducir("granja.la_venta_se_hace_en"));
    if (estado.venta !== null) return fallo(traducir("granja.ya_has_hecho_la_venta"));
    if (cantidad !== estado.cosechadas) {
      return fallo(traducir("granja.la_cuenta_no_cuadra_llevas") + estado.cosechadas + traducir("granja.zanahorias"));
    }
    estado.venta = cantidad;
    return bien;
  }

  function crear(mapa) {
    const parcelas = [...mapa.tierra];
    const estado = { parcelas, posicion: 0, cosechadas: 0, venta: null, filas: mapa.filas || 1 };
    const enMercado = () => estado.posicion === parcelas.length;
    const actual = () => parcelas[estado.posicion];

    function cuidar(nombre) {
      if (enMercado()) return fallo(traducir("granja.aqui_esta_el_mercado_las"));
      if (nombre === 'plantar') {
        if (actual() !== '.') return fallo(traducir("granja.esta_parcela_ya_tenia_semilla"));
        parcelas[estado.posicion] = 's';
      } else if (nombre === 'regar') {
        if (actual() === 'h') return fallo(traducir("granja.la_tierra_ya_estaba_mojada"));
        if (actual() !== 's') return fallo(traducir("granja.primero_hace_falta_una_semilla"));
        parcelas[estado.posicion] = 'h';
      } else {
        if (actual() !== 'z') return fallo(traducir("granja.aqui_no_hay_una_zanahoria"));
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
          if (enMercado()) return fallo(traducir("granja.ya_has_llegado_al_mercado"));
          estado.posicion++;
          return bien;
        }
        return nombre === 'vender' ? vender(estado, cantidad, enMercado()) : cuidar(nombre);
      }
    };
  }

  if (typeof window !== 'undefined') (window.CR ||= {}).MundoGranja = { crear };
  if (typeof module !== 'undefined') module.exports = { crear };
})();
