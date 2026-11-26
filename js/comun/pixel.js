(function () {
  'use strict';
  const paleta = {
    k: '#181724', w: '#fff3c4', c: '#68e9e0', d: '#268d9d', t: '#a0523d', o: '#ff963f',
    a: '#ffcf62', p: '#b887f8', m: '#6535a1', s: '#f3a779', g: '#8cd05b', v: '#37734b',
    n: '#546079', l: '#acbfce'
  };
  const figuras = {
    robot: [
      '.......kk.......', '......kawk......', '......kaak......', '.......kk.......',
      '....kkkkkkkk....', '...kllllllllk...', '..kllccccccdlk..', '..klcckcckcdlk..',
      '..kldccccccdlk..', '..klllddddlldk..', '...klllaalldk...', '..k.kdddddkk.k..',
      '..k..kkkkkk..k..', '....knk..knk....', '....kkk..kkk....', '................'
    ],
    mago: [
      '.......a........', '......ao........', '......oa........', '.....kmkk.......',
      '.....kmmpk......', '....kmmppk......', '..kkmmmmmmkk....', '.kppppppppppk...',
      '..kkkkkkkkkk....', '....ksskssk.....', '....ksssssk..a..', '...kmksskmpk.k..',
      '...kmmpmmmkkk...', '..kppmmmmmk.....', '..kkkkkkkkk.....', '....kk..kk......'
    ],
    granja: [
      '................', '.....kaaaak.....', '....kaaawaak....', '..kkaaaaaaaakk..',
      '.kaaaaaaaaaaaak.', '..kkkkkkkkkkkk..', '...kcckcckcck...', '...kdccccccdk...',
      '....kkkkkkkk....', '...kvgggggvk....', '..k.kggagk.k..k.', '..k.kggggk.k.kdk',
      '....kkkkkk..kddk', '....kv.kvk..kkk.', '....kk.kk.......', '................'
    ],
    r: ['...kk...', '..ktok..', '.kttotk.', 'kttktttk', 'kootktkk', '.kkkkkk.'],
    b: ['k......k', 'kk.kk.kk', 'kmkppkmk', '.kmmamk.', '..kkk...'],
    cristal: ['...ww...', '..wccw..', '.wcccdw.', 'wcccdddw', '.wcdcdw.', '..wddw..', '...ww...'],
    portal: ['..kkkk..', '.kpppmk.', 'kppmmpmk', 'kpmpmpmk', 'kpmmmpmk', 'kpmmpmmk', '.kpppmk.', '..kkkk..'],
    carro: ['k......k', 'kttttttk', '.kttttk.', '..kkkk..', '..k..k..'],
    brote: ['.g..g.', '..gg..', '...v..'],
    zanahoria: ['.g.vg.', '..gg..', '.kaok.', '..ok..', '..k...'],
    sol: ['...aa...', '.aaaaaa.', '.aawwaa.', 'aaawwaaa', 'aaaaaaaa', '.aaaaaa.', '.aaaaaa.', '...aa...']
  };
  const letras = {
    A: [14,17,17,31,17,17,17], C: [15,16,16,16,16,16,15], D: [30,17,17,17,17,17,30],
    E: [31,16,16,30,16,16,31], F: [31,16,16,30,16,16,16], G: [15,16,16,19,17,17,15],
    I: [31,4,4,4,4,4,31], L: [16,16,16,16,16,16,31], N: [17,17,25,21,19,17,17],
    O: [14,17,17,17,17,17,14], R: [30,17,17,30,20,18,17], S: [15,16,16,14,1,1,30],
    T: [31,4,4,4,4,4,4], U: [17,17,17,17,17,17,14],
    B: [30,17,17,30,17,17,30], H: [17,17,17,31,17,17,17], J: [7,2,2,2,18,18,12],
    K: [17,18,20,24,20,18,17], M: [17,27,21,21,17,17,17], P: [30,17,17,30,16,16,16],
    Q: [14,17,17,17,21,18,13], V: [17,17,17,17,17,10,4], W: [17,17,17,21,21,27,17],
    X: [17,17,10,4,10,17,17], Y: [17,17,10,4,4,4,4], Z: [31,1,2,4,8,16,31],
    0: [14,17,19,21,25,17,14], 1: [4,12,4,4,4,4,14], 2: [14,17,1,2,4,8,31],
    3: [30,1,1,14,1,1,30], 4: [2,6,10,18,31,2,2], 5: [31,16,30,1,1,17,14],
    6: [6,8,16,30,17,17,14], 7: [31,1,2,4,8,8,8],
    8: [14,17,17,14,17,17,14], 9: [14,17,17,15,1,2,12],
    '!': [4,4,4,4,4,0,4], '¡': [4,0,4,4,4,4,4], ' ': []
  };

  function sprite(ctx, nombre, x, y, escala = 1, reflejo = false) {
    const dibujo = figuras[nombre];
    dibujo.forEach((fila, dy) => [...fila].forEach((color, dx) => {
      if (!paleta[color]) return;
      ctx.fillStyle = paleta[color];
      ctx.fillRect(x + (reflejo ? fila.length - 1 - dx : dx) * escala, y + dy * escala, escala, escala);
    }));
  }

  function texto(ctx, cadena, x, y, escala, color) {
    ctx.fillStyle = color;
    [...cadena].forEach((letra, i) => {
      const base = letra.normalize('NFD')[0];
      (letras[base] || []).forEach((fila, dy) => {
        for (let dx = 0; dx < 5; dx++) {
          if (fila & (16 >> dx)) ctx.fillRect(x + (6 * i + dx) * escala, y + dy * escala, escala, escala);
        }
      });
      if (letra === 'Ó') {
        ctx.fillRect(x + (6 * i + 3) * escala, y - 2 * escala, 2 * escala, escala);
        ctx.fillRect(x + (6 * i + 2) * escala, y - escala, 2 * escala, escala);
      }
    });
  }

  function retrato(canvas, demo, cuadro = 0) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#181724';
    ctx.fillRect(12, 38, 32, 4);
    sprite(ctx, demo, 12, 8 - cuadro * 2, 2);
    ctx.fillStyle = paleta[cuadro ? 'w' : 'a'];
    ctx.fillRect(45 + cuadro, 10 - cuadro, 2, 2);
  }

  function celda(ctx, ficha, x, y, tema) {
    ctx.fillStyle = ficha === '#' ? tema.muro : tema.suelo;
    ctx.fillRect(x, y, 22, 22);
    ctx.fillStyle = tema.detalle;
    ctx.fillRect(x + 3, y + 5, 6, 2);
    ctx.fillRect(x + 12, y + 16, 5, 2);
    if (ficha === '#') return;
    if (ficha === '*') sprite(ctx, tema.meta, x + 3, y + 3, 2);
    if (ficha === 'r' || ficha === 'b') sprite(ctx, ficha, x + 3, y + 5, 2);
    if (typeof ficha === 'number' || /^p\d/.test(ficha)) {
      ctx.fillStyle = ficha === 'p3' || ficha === 'p7' ? '#6535a1' : '#995c36';
      ctx.fillRect(x + 3, y + 2, 16, 18);
      texto(ctx, String(ficha).slice(-1), x + 6, y + 4, 2, '#fff3c4');
    }
  }

  function tablero(ctx, estado, tema) {
    const margen = 26;
    ctx.fillStyle = tema.fondo;
    ctx.fillRect(0, 0, 204, 192);
    estado.celdas.forEach((fila, y) => fila.forEach((ficha, x) =>
      celda(ctx, ficha, margen + x * 22, 8 + y * 22, tema)));
    const x = margen + estado.x * 22;
    const y = 8 + estado.y * 22;
    if (estado.x === -1) celda(ctx, '.', x, y, tema);
    if (tema.carro) sprite(ctx, 'carro', 12, 170, 2);
    sprite(ctx, tema.personaje, x + 3, y + 3, 1, estado.direccion === 2);
    const puntos = [[19, 10, 3, 5], [9, 19, 5, 3], [0, 10, 3, 5], [9, 0, 5, 3]];
    const [dx, dy, ancho, alto] = puntos[estado.direccion];
    ctx.fillStyle = '#fff3c4';
    ctx.fillRect(x + dx, y + dy, ancho, alto);
  }

  const Pixel = { sprite, texto, retrato, tablero };
  if (typeof window !== 'undefined') (window.CR ||= {}).Pixel = Pixel;
  if (typeof module !== 'undefined') module.exports = Pixel;
})();
