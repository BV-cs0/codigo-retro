(function () {
  'use strict';
  const figura = [
    '..cccccccccc..', '.cbbbbbbbbbbc.', 'cbbddddddddbbc', 'cbdssssssssdbc',
    'cbdsgssssgsdbc', 'cbdsgssssgsdbc', 'cbdssssssssdbc', 'cbdssggggssdbc',
    'cbbddddddddbbc', '.cbbbbbbggbbc.', '..cccccccccc..', '...cc....cc...',
    '..ccc....ccc..'
  ];
  const paleta = { c: '#1a1627', b: '#bb9fc9', d: '#51425e', s: '#103229', g: '#9bf9af' };
  function pintar(canvas, cuadro) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const celebra = Object.hasOwn(canvas.dataset, 'celebra');
    const salto = celebra ? [0, 1, 2, 1][cuadro] : 0;
    figura.forEach((fila, y) => [...fila].forEach((ficha, x) => {
      if (!paleta[ficha]) return;
      ctx.fillStyle = !celebra && cuadro % 2 && y === 4 && ficha === 'g' ? paleta.s : paleta[ficha];
      ctx.fillRect(x + 1, y + (celebra ? 2 - salto : 1), 1, 1);
    }));
    if (celebra) {
      const destellos = [[[0, 4], [15, 3]], [[1, 2], [14, 1]], [[0, 0], [15, 0]], [[1, 1], [14, 3]]];
      destellos[cuadro].forEach(([x, y], i) => {
        ctx.fillStyle = i ? '#a6f6b6' : '#ffda79';
        ctx.fillRect(x, y, 1, 1);
      });
    }
  }
  const lienzos = [...document.querySelectorAll('[data-cursor]')];
  let cuadro = 0;
  const animar = () => {
    lienzos.forEach(canvas => pintar(canvas, cuadro));
    cuadro = (cuadro + 1) % 4;
  };
  animar();
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) setInterval(animar, 700);
})();
