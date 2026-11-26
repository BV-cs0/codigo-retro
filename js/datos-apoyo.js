(function () {
  'use strict';
  const traducir = typeof module !== 'undefined' ? require('./comun/idioma').t : globalThis.CR.t;
(window.CR ||= {}).DatosApoyo = {
  formas: [
    { nombre: 'Ko-fi', url: '' }, { nombre: 'GitHub Sponsors', url: '' }, { nombre: 'PayPal', url: '' }
  ],
  gratis: [
    { texto: traducir("datos-apoyo.dale_una_estrella_en_github"), url: 'https://github.com/BV-cs0/codigo-retro' },
    { texto: traducir("datos-apoyo.comparte_el_juego_con_alguien"), url: '', compartir: true },
    { texto: traducir("datos-apoyo.cuentame_ideas_o_fallos"), url: 'https://github.com/BV-cs0/codigo-retro/issues' }
  ]
};

})();
