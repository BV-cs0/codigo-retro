(function () {
  'use strict';
  const { Pixel } = window.CR;
  const temas = {
    robot: { fondo: '#241a1b', muro: '#53342a', suelo: '#896044', detalle: '#b17c4a', personaje: 'robot', meta: 'cristal', carro: true },
    mago: { fondo: '#1d132e', muro: '#3a2854', suelo: '#604483', detalle: '#77559b', personaje: 'mago', meta: 'portal' }
  };
  function granja(ctx, estado) {
    const rect = (color, x, y, w, h) => { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); };
    rect('#79b3ad', 0, 0, 192, 110);
    Pixel.sprite(ctx, 'sol', 149, 10, 3);
    rect('#607f4d', 0, 45, 192, 65);
    rect('#cfac70', 0, 70, 192, 30);
    estado.parcelas.forEach((ficha, i) => {
      const x = 11 + i * 34;
      rect('#513e33', x, 74, 26, 21);
      rect(ficha === 'h' ? '#635548' : '#a26d47', x + 2, 76, 22, 17);
      Pixel.sprite(ctx, 'brote', x + 7, 77, 2);
    });
    rect('#653e36', 148, 58, 30, 36);
    rect('#ad5747', 145, 54, 36, 8);
    Pixel.sprite(ctx, 'granja', 11 + estado.posicion * 34, 45, 2);
  }
  window.CR.MapaCurso = (canvas, demo, estado) => {
    const altura = demo === 'granja' ? 110 : 192;
    if (canvas.height !== altura) canvas.height = altura;
    const ctx = canvas.getContext('2d');
    if (demo === 'granja') granja(ctx, estado);
    else Pixel.tablero(ctx, estado, temas[demo]);
  };
})();
