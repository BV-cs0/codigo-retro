(function (CR) {
'use strict';
const sprite = [
  '................', '................', '...1........1...', '...1111111111...', '..122222222221..',
  '..123332233321..', '..123432234321..', '..123333333321..', '...1222552221...',
  '..112222222211..', '.11123333332111.', '.11123323332111.', '..112332333211..',
  '...1222222221...', '.....55..55.....', '................'
];
const colores = { 1: '#64558c', 2: '#a48bb7', 3: '#ead8c2', 4: '#152540', 5: '#ff9e75' };
function dibujar(canvas, cuadro) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, 16, 16);
  sprite.forEach((fila, y) => [...fila].forEach((pixel, x) => {
    if (pixel === '.') return;
    ctx.fillStyle = colores[cuadro && pixel === '4' ? '3' : pixel];
    ctx.fillRect(x, y, 1, 1);
  }));
}
function animar(...canvases) {
  let cuadro = 0;
  const pintar = () => canvases.forEach(canvas => dibujar(canvas, cuadro));
  pintar();
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) setInterval(() => {
    cuadro = 1 - cuadro;
    pintar();
  }, 800);
}
CR.Nix = { animar };
})(globalThis.CR);
