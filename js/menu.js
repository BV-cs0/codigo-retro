(function () {
  'use strict';
  const traducir = typeof module !== 'undefined' ? require('./comun/idioma').t : globalThis.CR.t;
  const { Pixel, Progreso } = window.CR;
  const logo = document.getElementById('logo').getContext('2d');
  Pixel.texto(logo, 'CÓDIGO RETRO', 16, 6, 2, '#6c459f');
  Pixel.texto(logo, 'CÓDIGO RETRO', 14, 4, 2, '#fff0a9');
  const corazon = document.getElementById('corazon').getContext('2d');
  corazon.fillStyle = '#ffa3b5';
  ['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...'].forEach((fila, y) =>
    [...fila].forEach((c, x) => { if (c === '#') corazon.fillRect(x, y, 1, 1); }));
  const retratos = [...document.querySelectorAll('[data-demo]')];
  let cuadro = 0;
  const animar = () => {
    retratos.forEach(canvas => Pixel.retrato(canvas, canvas.dataset.demo, cuadro));
    cuadro = 1 - cuadro;
  };
  const { SpritesFaro, ProgresoFaro } = window.CR;
  const lumen = document.getElementById('lumen-menu');
  const bash = document.getElementById('bash-menu');
  SpritesFaro.animar(cuadro => {
    SpritesFaro.retrato(lumen, cuadro);
    SpritesFaro.terminalBash(bash, cuadro);
  });
  window.CR.Nix.animar(document.getElementById('nix-menu'));
  const actualizar = () => {
    document.getElementById('total-atalaya').textContent =
      traducir('atalaya.total', window.CR.ProgresoAtalaya.navegador().resumen());
    ProgresoFaro.refrescar();
    document.getElementById('total-faro').textContent = ProgresoFaro.total() + traducir("menu.60_misiones");
    document.getElementById('resueltos-menu').textContent = window.CR.ProgresoTaller.total() + traducir("menu.70_resueltos");
    document.getElementById('total-bash').textContent = window.CR.ProgresoBash.total() + traducir("menu.66_pasos");
    const progreso = window.CR.ProgresoCurso;
    document.getElementById('total-curso').textContent = progreso.total() + ' / ' + progreso.cantidad + traducir("curso.pasos");
    document.querySelectorAll('[data-total]').forEach(nodo => {
      nodo.textContent = '★ ' + Progreso.total(nodo.dataset.total) + ' / 15';
    });
  };
  // La versión queda a la vista para quien la busque (las novedades están en CHANGELOG.md).
  document.getElementById('version-juego').textContent = traducir('menu.version') + ' ' + window.CR.VERSION;
  animar();
  actualizar();
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) setInterval(animar, 520);
  window.addEventListener('pageshow', actualizar);
})();
