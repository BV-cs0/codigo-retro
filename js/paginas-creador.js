(function () {
  'use strict';
  const traducir = typeof module !== 'undefined' ? require('./comun/idioma').t : globalThis.CR.t;
  const { DatosCreador, DatosApoyo } = window.CR;
  const $ = id => document.getElementById(id);
  const nodo = (tag, texto) => Object.assign(document.createElement(tag), { textContent: texto });
  function enlace(texto, url) {
    return Object.assign(nodo('a', texto), { href: url, target: '_blank', rel: 'noopener noreferrer' });
  }
  function dibujarAvatar(canvas) {
    const sprite = [
      '................', '.....pppppp.....', '....pppppppp....', '...ppsssssspp...', '...pssssssssps..',
      '...psosssossp...', '...pssssssssp...', '....pssosssp....', '..ppppsssspppp..', '.pppbpppppbpppp.',
      '.ppbbbbbbbbbbpp.', '.ppllllllllllpp.', '..pllllggllllp..', '..pllllggllllp..', '..pllllllllllp..', '.gggggggggggggg.'
    ];
    const paleta = { p: '#624d99', s: '#e6aa82', o: '#35273b', b: '#a081cf', l: '#453e62', g: '#a9f4c1' };
    const ctx = canvas.getContext('2d');
    sprite.forEach((fila, y) => [...fila].forEach((c, x) => {
      if (!paleta[c]) return;
      ctx.fillStyle = paleta[c];
      ctx.fillRect(x, y, 1, 1);
    }));
  }
  function creador(datos) {
    for (const id of ['nombre', 'rol', 'quienSoy', 'porQue']) $(id).textContent = datos[id] || '';
    for (const item of datos.enlaces || []) {
      if (item.url) $('enlaces-creador').append(enlace(item.texto, item.url));
    }
    dibujarAvatar($('avatar-creador'));
  }
  async function copiar() {
    try {
      await navigator.clipboard.writeText(location.href);
    } catch {
      const campo = $('enlace-pagina');
      campo.value = location.href;
      campo.hidden = false;
      campo.focus();
      campo.select();
      let copiado = false;
      try { copiado = document.execCommand('copy'); } catch { /* El campo permite copiar manualmente. */ }
      if (copiado) campo.hidden = true;
      else {
        $('estado-compartir').textContent = traducir("paginas-creador.selecciona_y_copia_este_enlace");
        return;
      }
    }
    $('estado-compartir').textContent = traducir("paginas-creador.enlace_copiado");
  }
  function compartir() {
    const nativo = typeof navigator.share === 'function';
    const b = nodo('button', nativo ? traducir("paginas-creador.compartir") : traducir("paginas-creador.copiar_enlace"));
    b.onclick = async () => {
      if (!nativo) return copiar();
      try { await navigator.share({ title: 'Código Retro', url: location.href }); }
      catch (error) { if (error.name !== 'AbortError') await copiar(); }
    };
    return b;
  }
  function apoyo(datos) {
    for (const forma of datos.formas || []) {
      const tarjeta = forma.url ? enlace('', forma.url) : nodo('article', '');
      tarjeta.className = 'panel tarjeta' + (forma.url ? '' : ' proximamente');
      tarjeta.append(nodo('h3', forma.nombre));
      if (!forma.url) tarjeta.append(Object.assign(nodo('span', traducir("paginas-creador.proximamente")), { className: 'sello' }));
      $('formas-apoyo').append(tarjeta);
    }
    for (const item of datos.gratis || []) {
      const li = nodo('li', '');
      li.append(item.url ? enlace(item.texto, item.url) : item.texto);
      if (item.compartir) li.append(' ', compartir());
      $('apoyo-gratis').append(li);
    }
  }
  if ($('avatar-creador')) creador(DatosCreador || {});
  if ($('formas-apoyo')) apoyo(DatosApoyo || {});
})();
