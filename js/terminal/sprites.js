(function (CR) {
  'use strict';
  const lumen = [
    '......oo........', '.....o..o.......', '.....oooo.......', '....okkkko......',
    '...okaaakko.....', '...oakyyako.....', '...oayyyaao.....', '...oaywykao.....',
    '...oaywyyao.....', '...oayyyyao.....', '...okaaakko.....', '....okkkko......',
    '.....oooo.......', '................', '................', '................'
  ];
  const torre = [
    '.............', '......y......', '.....yyy.....', '....ppppp....', '....pyyyp....',
    '....ppppp....', '.....www.....', '.....www.....', '.....rrr.....', '.....rrr.....',
    '....wwwww....', '....wwwww....', '....rrrrr....', '....rrrrr....', '....wwwww....',
    '....wwpww....', '...wwwpwww...', '..ppppppppp..'
  ];
  const paleta = { o: '#44314e', k: '#805132', a: '#eaa03f', y: '#ffe27f', w: '#fff1d3', p: '#3f355b', r: '#bb5968' };
  function pintar(ctx, filas, dx, dy, cambio) {
    filas.forEach((fila, y) => [...fila].forEach((c, x) => {
      if (!paleta[c]) return;
      ctx.fillStyle = cambio(c, x, y) || paleta[c];
      ctx.fillRect(x + dx, y + dy, 1, 1);
    }));
  }
  function retrato(canvas, cuadro) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pintar(ctx, lumen, 1, cuadro % 2, (c, x, y) => cuadro === 2 && y === 8 && x >= 5 && x <= 8 ? paleta.k : '');
  }
  function encendido(canvas, cuadro) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 48, 32);
    ctx.fillStyle = '#2e4968';
    ctx.fillRect(0, 26, 48, 6);
    ctx.fillStyle = '#ffe27f';
    const lado = cuadro % 2 ? 1 : -1;
    for (let i = 5; i < 24; i++) ctx.fillRect(24 + lado * i, 12 - Math.floor(i / 6), 1, 1 + Math.floor(i / 3));
    pintar(ctx, torre, 18, 8, () => '');
  }
  function animar(callback) {
    let cuadro = 0;
    callback(cuadro);
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) setInterval(() => callback(++cuadro % 3), 480);
  }
  function terminalBash(canvas, cuadro) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#eaa03f';
    ctx.fillRect(2, 3, 25, 17);
    ctx.fillStyle = '#0b110d';
    ctx.fillRect(4, 5, 21, 12);
    ctx.fillStyle = '#805132';
    ctx.fillRect(11, 20, 7, 2);
    const simbolo = ['..#..', '.####', '#.#..', '.###.', '..#.#', '####.', '..#..'];
    ctx.fillStyle = '#8cf2a8';
    simbolo.forEach((fila, y) => [...fila].forEach((c, x) => {
      if (c === '#') ctx.fillRect(7 + x, 7 + y, 1, 1);
    }));
    if (cuadro !== 1) ctx.fillRect(14, 13, 6, 1);
    pintar(ctx, lumen, 24, 7 + cuadro % 2, () => '');
  }
  function celebrarBash(canvas, cuadro) {
    encendido(canvas, cuadro);
    const ctx = canvas.getContext('2d');
    pintar(ctx, lumen, 31, 17 - [0, 3, 5][cuadro], () => '');
    ctx.fillStyle = '#fff1d3';
    ctx.fillRect(34, 16 - 2 * cuadro, 1, 1);
    ctx.fillRect(44, 19 - 2 * cuadro, 1, 1);
  }
  CR.SpritesFaro = { retrato, encendido, animar, terminalBash, celebrarBash };
})(globalThis.CR = globalThis.CR || {});
