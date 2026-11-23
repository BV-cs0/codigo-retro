(function () {
  'use strict';
  const CR = window.CR;
  const tema = { fondo: '#241a1b', muro: '#53342a', suelo: '#896044', detalle: '#b17c4a',
    personaje: 'robot', meta: 'cristal', carro: true };
  CR.NivelUI.iniciar({ demo: 'robot', personaje: 'Pico', niveles: CR.NivelesRobot,
    crear: CR.MundoRobot.crear, dibujar: (ctx, estado) => CR.Pixel.tablero(ctx, estado, tema) });
})();
