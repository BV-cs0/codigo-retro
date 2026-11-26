(function () {
  'use strict';
  const CR = window.CR;
  function rect(ctx, color, x, y, w, h) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  }

  function paisaje(ctx) {
    rect(ctx, '#79b3ad', 0, 0, 204, 192);
    CR.Pixel.sprite(ctx, 'sol', 154, 12, 4);
    rect(ctx, '#c0dbbe', 26, 27, 40, 7);
    rect(ctx, '#c0dbbe', 33, 21, 23, 8);
    rect(ctx, '#769f5b', 0, 57, 204, 135);
    rect(ctx, '#657f4a', 0, 69, 204, 123);
    rect(ctx, '#d9a56b', 0, 60, 204, 3);
    for (let x = 4; x < 204; x += 18) rect(ctx, '#efc186', x, 56, 3, 13);
  }

  function puesto(ctx, x, y) {
    rect(ctx, '#653e36', x + 1, y - 18, 17, 18);
    for (let i = 0; i < 5; i++) rect(ctx, i % 2 ? '#fff3c4' : '#ad5747', x + i * 4, y - 20, 4, 6);
    rect(ctx, '#e3a654', x, y - 6, 20, 4);
  }

  function dibujar(ctx, estado) {
    paisaje(ctx);
    const dos = estado.filas === 2;
    const ancho = dos ? 28 : 20;
    const base = dos ? 36 : 9;
    const parcela = i => dos
      ? [base + (i < 4 ? i : 7 - i) * ancho, i < 4 ? 104 : 157]
      : [base + i * ancho, 117];
    const mercado = dos ? [9, 157] : [base + estado.parcelas.length * ancho, 117];
    rect(ctx, '#cfac70', 0, dos ? 103 : 116, 204, 26);
    if (dos) {
      rect(ctx, '#cfac70', 0, 156, 204, 26);
      rect(ctx, '#cfac70', 146, 123, 18, 36);
    }
    estado.parcelas.forEach((ficha, i) => {
      const [x, y] = parcela(i);
      rect(ctx, '#513e33', x, y, ancho - 2, 22);
      rect(ctx, ficha === 'h' ? '#635548' : '#a26d47', x + 2, y + 2, ancho - 6, 17);
      rect(ctx, '#ce925b', x + 3, y + 17, ancho - 8, 2);
      if (ficha === 's' || ficha === 'h') CR.Pixel.sprite(ctx, 'brote', x + 6, y + 7, 2);
      if (ficha === 'z') CR.Pixel.sprite(ctx, 'zanahoria', x + 5, y + 4, 2);
    });
    puesto(ctx, ...mercado);
    const [x, y] = estado.posicion === estado.parcelas.length ? mercado : parcela(estado.posicion);
    CR.Pixel.sprite(ctx, 'granja', x + 1, y - 30, 2, dos && estado.posicion >= 4);
  }

  CR.NivelUI.iniciar({ demo: 'granja', personaje: 'Bina', niveles: CR.Idioma.contenido('granja'),
    crear: CR.DemoIdioma.crearMundo(CR.MundoGranja.crear), dibujar });
})();
