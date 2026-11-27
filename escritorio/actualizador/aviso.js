// Solo en el .exe: muestra en el pie del menú una línea discreta si hay versión nueva.
// La consulta a GitHub se hace una vez por sesión, en segundo plano y con tiempo límite.
// Sin red o con cualquier error, el menú queda igual que siempre.
(function () {
  'use strict';
  const L = window.CRActualizador;
  const version = window.CR?.VERSION;
  if (!L || !version) return;
  const CLAVE = 'codigo-retro:aviso-version-' + version;
  const ESPERA_MS = 2500;

  function leerGuardado() {
    try { return JSON.parse(sessionStorage.getItem(CLAVE) ?? 'null'); } catch { return null; }
  }
  function guardar(resultado) {
    try { sessionStorage.setItem(CLAVE, JSON.stringify(resultado)); } catch { /* sin almacenamiento: se vuelve a mirar */ }
  }
  async function pedirJson(url, ms) {
    const control = new AbortController();
    const reloj = setTimeout(() => control.abort(), ms);
    try {
      const respuesta = await fetch(url, { signal: control.signal, cache: 'no-store',
        credentials: 'omit', headers: { Accept: 'application/vnd.github+json' } });
      return respuesta.ok ? await respuesta.json() : null;
    } finally {
      clearTimeout(reloj);
    }
  }
  function mostrar(resultado) {
    const pie = document.querySelector('.pie-menu');
    if (!pie || resultado?.estado !== 'nueva' || document.getElementById('aviso-version')) return;
    // Se vuelve a validar lo guardado: solo se enlaza la página oficial del release.
    const valido = L.leerRelease({ tag_name: 'v' + resultado.version, html_url: resultado.url, assets: [{
      name: 'CodigoRetro.exe',
      browser_download_url: 'https://github.com/BV-cs0/codigo-retro/releases/download/v' + resultado.version + '/CodigoRetro.exe'
    }] });
    if (!valido || !L.esMasNueva(version, valido.version)) return;
    const textos = L.textos(document.documentElement.lang);
    const aviso = document.createElement('span');
    aviso.id = 'aviso-version';
    aviso.className = 'version-juego';
    const enlace = document.createElement('a');
    enlace.href = valido.url;
    enlace.target = '_blank';
    enlace.rel = 'noopener noreferrer';
    enlace.textContent = textos.enlace + ' ' + valido.version;
    aviso.append(textos.aviso + ' ', enlace);
    pie.append(aviso);
  }
  async function revisar() {
    const guardado = leerGuardado();
    if (guardado) return mostrar(guardado);
    const resultado = await L.comprobar({ versionActual: version, pedirJson });
    guardar(resultado);
    mostrar(resultado);
  }
  setTimeout(() => { revisar().catch(() => { /* nunca molesta al juego */ }); }, ESPERA_MS);
})();
