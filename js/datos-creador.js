(function () {
  'use strict';
  const traducir = typeof module !== 'undefined' ? require('./comun/idioma').t : globalThis.CR.t;
(window.CR ||= {}).DatosCreador = {
  nombre: 'Bryan Valenzuela',
  rol: traducir("datos-creador.ciberseguridad_soc_y_pentesting"),
  quienSoy: traducir("datos-creador.soy_bryan_valenzuela_tecnico_analista"),
  porQue: traducir("datos-creador.queria_una_forma_de_aprender"),
  enlaces: [{ texto: 'GitHub', url: 'https://github.com/BV-cs0' }]
};

})();
