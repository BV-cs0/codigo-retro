(function () {
  'use strict';
  const CR = window.CR;
  const tema = { fondo: '#1d132e', muro: '#3a2854', suelo: '#604483', detalle: '#77559b',
    personaje: 'mago', meta: 'portal' };
  CR.NivelUI.iniciar({ demo: 'mago', personaje: 'Brasa', niveles: CR.NivelesMago,
    crear: CR.MundoMago.crear, dibujar: (ctx, estado) => CR.Pixel.tablero(ctx, estado, tema) });
})();
