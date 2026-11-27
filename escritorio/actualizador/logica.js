// Aviso de versión nueva del .exe portátil de Código Retro.
// Al abrir el menú mira en GitHub Releases si hay una versión más nueva. Si la hay, el menú
// muestra una línea discreta con el enlace a la página oficial del release. No descarga ni
// cambia nada: la persona la baja cuando quiera. Cualquier fallo (sin internet, GitHub caído,
// datos raros) se ignora: nunca se lanza una excepción ni se muestra un diálogo.
(function (raiz) {
  'use strict';
  const REPO = 'BV-cs0/codigo-retro';
  const API_ULTIMA = 'https://api.github.com/repos/' + REPO + '/releases/latest';
  const NOMBRE_EXE = 'CodigoRetro.exe';
  const TIEMPO_API_MS = 5000;
  const PAGINA = /^https:\/\/github\.com\/BV-cs0\/codigo-retro\/releases\/tag\/v(\d+\.\d+\.\d+)$/;
  const DESCARGA = /^https:\/\/github\.com\/BV-cs0\/codigo-retro\/releases\/download\/v(\d+\.\d+\.\d+)\/CodigoRetro\.exe$/;
  const TEXTOS = {
    es: { aviso: 'Hay una versión nueva:', enlace: 'descargar' },
    en: { aviso: 'A new version is available:', enlace: 'download' }
  };

  function partes(version) {
    const m = /^v?(\d+)\.(\d+)\.(\d+)$/.exec(String(version ?? '').trim());
    return m ? m.slice(1).map(Number) : null;
  }
  // -1, 0 o 1. Una versión con formato raro nunca cuenta como más nueva.
  function compararVersiones(a, b) {
    const pa = partes(a), pb = partes(b);
    if (!pa || !pb) return 0;
    for (let i = 0; i < 3; i++) if (pa[i] !== pb[i]) return pa[i] < pb[i] ? -1 : 1;
    return 0;
  }
  function esMasNueva(actual, candidata) {
    return Boolean(partes(actual) && partes(candidata)) && compararVersiones(candidata, actual) > 0;
  }
  // Del JSON de la API saca la versión y la página del release, solo si es del canal oficial
  // (HTTPS, este repositorio) y si el release trae el .exe.
  function leerRelease(datos) {
    if (!datos || typeof datos !== 'object' || datos.draft || datos.prerelease) return null;
    const version = partes(datos.tag_name);
    if (!version || !Array.isArray(datos.assets)) return null;
    const texto = version.join('.');
    const pagina = PAGINA.exec(String(datos.html_url ?? ''));
    const exe = datos.assets.find(a => a && a.name === NOMBRE_EXE);
    const descarga = DESCARGA.exec(String(exe?.browser_download_url ?? ''));
    if (!pagina || pagina[1] !== texto || !descarga || descarga[1] !== texto) return null;
    return { version: texto, url: datos.html_url };
  }
  // Promesa que nunca tarda más de `ms`: si se pasa, se resuelve con `valor`.
  function conLimite(promesa, ms, valor) {
    return new Promise(resolve => {
      const reloj = setTimeout(() => resolve(valor), ms);
      Promise.resolve(promesa).then(
        resultado => { clearTimeout(reloj); resolve(resultado); },
        () => { clearTimeout(reloj); resolve(valor); });
    });
  }
  // deps: versionActual, pedirJson(url, ms) → datos. Devuelve siempre un estado:
  // 'nueva' (con version y url), 'al-dia', 'sin-datos' o 'no-aplica'. Nunca rechaza.
  async function comprobar(d, ms = TIEMPO_API_MS) {
    try {
      if (!partes(d?.versionActual) || typeof d.pedirJson !== 'function') return { estado: 'no-aplica' };
      const pedido = new Promise(resolve => resolve(d.pedirJson(API_ULTIMA, ms)));
      const release = leerRelease(await conLimite(pedido, ms + 500, null));
      if (!release) return { estado: 'sin-datos' };
      if (!esMasNueva(d.versionActual, release.version)) return { estado: 'al-dia', version: release.version };
      return { estado: 'nueva', version: release.version, url: release.url };
    } catch {
      return { estado: 'sin-datos' };
    }
  }
  function textos(idioma) {
    return TEXTOS[String(idioma ?? '').slice(0, 2).toLowerCase()] ?? TEXTOS.es;
  }

  const api = { compararVersiones, esMasNueva, leerRelease, conLimite, comprobar, textos, API_ULTIMA, TIEMPO_API_MS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else raiz.CRActualizador = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
