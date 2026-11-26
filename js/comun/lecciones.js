(function () {
  'use strict';
  const traducir = typeof module !== 'undefined' ? require('./idioma').t : globalThis.CR.t;
  const conceptos = ['secuencia', 'repetir', 'si', 'asignar', 'definir'];
  const nombres = ["comun.secuencia", "comun.bucles", "comun.condiciones", "comun.variables", "comun.funciones"];
  const notas = [
    "comun.en_python_de_verdad_las",
    "comun.en_python_de_verdad_for",
    "comun.en_python_de_verdad_if",
    "comun.en_python_de_verdad_asigna",
    "comun.en_python_de_verdad_def"
  ];
  const logros = [
    "comun.una_secuencia_en_el_orden",
    "comun.un_bucle_repite_el_mismo",
    "comun.una_condicion_deja_que_el",
    "comun.una_variable_conserva_un_valor",
    "comun.una_funcion_permite_llamar_al"
  ];
  const opciones = ordenes => ({
    acciones: ordenes.filter(o => !o.sensor).map(o => o.nombre),
    sensores: ordenes.filter(o => o.sensor).map(o => o.nombre),
    aridades: Object.fromEntries(ordenes.map(o => [o.nombre, o.parametro ? 1 : 0]))
  });
  const textos = (i, t) => ({ etiqueta: t(nombres[i]), pythonReal: t(notas[i]), logro: t(logros[i]) });
  const descripcion = (nombre, t) => t(catalogo[nombre].descripcion);
  function crear(catalogo, fichas) {
    return fichas.map((ficha, i) => ({
      ...ficha, id: i + 1, concepto: conceptos[i], ...textos(i, traducir.es),
      ordenes: ficha.ordenes.split(' ').map(nombre => ({
        nombre, ...catalogo[nombre], descripcion: descripcion(nombre, traducir.es)
      }))
    }));
  }
  const catalogo = {
    avanzar: { descripcion: "comun.da_un_paso_hacia_delante" },
    girar_izquierda: { descripcion: "comun.gira_90_a_la_izquierda" },
    girar_derecha: { descripcion: "comun.gira_90_a_la_derecha" },
    picar: { descripcion: "comun.rompe_la_roca_blanda_que" },
    hay_muro: { sensor: true, descripcion: "comun.comprueba_si_hay_un_muro" },
    hay_roca_blanda: { sensor: true, descripcion: "comun.comprueba_si_hay_roca_blanda" },
    leer_cartel: { sensor: true, descripcion: "comun.devuelve_el_numero_del_cartel" },
    lanzar_fuego: { descripcion: "comun.espanta_al_murcielago_que_hay" },
    abrir: { parametro: 'numero', descripcion: "comun.abre_la_puerta_con_el" },
    hay_enemigo: { sensor: true, descripcion: "comun.comprueba_si_hay_un_murcielago" },
    leer_runa: { sensor: true, descripcion: "comun.devuelve_el_numero_de_la" },
    plantar: { descripcion: "comun.siembra_una_parcela_vacia" },
    regar: { descripcion: "comun.riega_la_parcela_sembrada_y" },
    cosechar: { descripcion: "comun.recoge_la_zanahoria_madura_de" },
    vender: { parametro: 'numero', descripcion: "comun.declara_cuantas_zanahorias_llevas_al" },
    tierra_seca: { sensor: true, descripcion: "comun.comprueba_si_la_parcela_actual" },
    hay_zanahoria: { sensor: true, descripcion: "comun.comprueba_si_hay_una_zanahoria" },
    en_mercado: { sensor: true, descripcion: "comun.comprueba_si_estas_en_el" }
  };
  const Lecciones = { opciones, crear, catalogo, textos, descripcion };
  if (typeof window !== 'undefined') (window.CR ||= {}).Lecciones = Lecciones;
  if (typeof module !== 'undefined') module.exports = Lecciones;
})();
