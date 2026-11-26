(function (CR) {
  'use strict';
  const ingles = {
    avanzar: 'move', girar_izquierda: 'turn_left', girar_derecha: 'turn_right', picar: 'dig',
    hay_muro: 'wall_ahead', hay_roca_blanda: 'soft_rock_ahead', leer_cartel: 'read_sign',
    lanzar_fuego: 'cast_fire', abrir: 'open_door', hay_enemigo: 'enemy_ahead', leer_runa: 'read_rune',
    plantar: 'plant', regar: 'water', cosechar: 'harvest', vender: 'sell', quitar: 'remove',
    tierra_seca: 'dry_soil', hay_zanahoria: 'has_carrot', en_mercado: 'at_market'
  };
  const identificadores = {
    ...ingles, pasos: 'steps', mirar_arriba: 'look_up', escalon: 'stair_step', clave: 'key',
    girar_dos_veces: 'turn_twice', tramo: 'section', cesta: 'basket',
    sembrar_y_regar: 'plant_and_water', cuidar_parcela: 'tend_plot'
  };
  const codigo = texto => texto?.replace(/\b[a-z_][a-z_0-9]*\b/g,
    nombre => Object.hasOwn(identificadores, nombre) ? identificadores[nombre] : nombre);
  const espanol = Object.fromEntries(Object.entries(ingles).map(([es, en]) => [en, es]));

  function adaptarBorrador(texto, destino, ordenes) {
    if (texto == null || CR.Idioma.actual() !== 'en') return texto;
    const nombres = destino === 'es' ? espanol : ingles;
    const disponibles = new Set(ordenes.map(o => destino === 'es' ? o.nombre : espanol[o.nombre]));
    return texto.replace(/#[^\r\n]*|\b([a-z_]\w*)(?=[ \t]*\()/g,
      (fragmento, nombre) => disponibles.has(nombre) ? nombres[nombre] : fragmento);
  }

  function mundo(crear) {
    return mapa => {
      const base = crear(mapa);
      const nombres = Object.fromEntries([...base.acciones, ...base.sensores].map(n => [ingles[n], n]));
      return {
        ...base, acciones: base.acciones.map(n => ingles[n]), sensores: base.sensores.map(n => ingles[n]),
        accion: (nombre, args) => base.accion(nombres[nombre], args),
        sensor: nombre => base.sensor(nombres[nombre])
      };
    };
  }

  function registrar(demo, niveles, textos) {
    const { Idioma, t } = CR;
    Idioma.registrar('en', demo, niveles.map((nivel, i) => {
      const [titulo, primera, segunda, pista] = textos[i];
      return {
        ...nivel, titulo, intro: [primera, segunda], pista,
        ejemplo: codigo(nivel.ejemplo), solucion: codigo(nivel.solucion), codigoInicial: codigo(nivel.codigoInicial),
        ...CR.Lecciones.textos(i, t.en),
        ordenes: nivel.ordenes.map(orden => ({
          ...orden, nombre: ingles[orden.nombre], descripcion: CR.Lecciones.descripcion(orden.nombre, t.en),
          ...(orden.parametro && { parametro: 'number' })
        }))
      };
    }));
  }

  const crearMundo = (crear, idioma = CR.Idioma.actual()) => idioma === 'en' ? mundo(crear) : crear;
  CR.DemoIdioma = { ingles, espanol, adaptarBorrador, crearMundo, registrar };
  if (typeof module !== 'undefined') module.exports = CR.DemoIdioma;
})(globalThis.CR ||= {});
