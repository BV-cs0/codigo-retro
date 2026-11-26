(function (CR) {
  'use strict';
  CR.VERSION = '1.3.0';
  // GitHub Pages guarda el HTML hasta 10 minutos. Si una página antigua recibe ya los archivos
  // nuevos (su ?v= no coincide con CR.VERSION), se recarga una sola vez para traer el HTML nuevo.
  (function comprobarVersion() {
    if (typeof document === 'undefined' || !document.currentScript?.src) return;
    const pedida = new URL(document.currentScript.src).searchParams.get('v');
    if (!pedida || pedida === CR.VERSION) return;
    try {
      const marca = 'codigo-retro:recargada-' + CR.VERSION;
      if (sessionStorage.getItem(marca)) return;
      sessionStorage.setItem(marca, '1');
    } catch { return; /* Sin almacenamiento no se arriesga un bucle de recargas. */ }
    location.reload();
  })();
  const clave = 'codigo-retro:idioma';
  const valido = idioma => idioma === 'es' || idioma === 'en';

  function guardar(idioma) {
    try { localStorage.setItem(clave, idioma); } catch { /* El navegador puede bloquear el almacenamiento. */ }
  }

  function elegir() {
    if (typeof document === 'undefined') return 'es';
    const pedido = new URL(location.href).searchParams.get('lang');
    if (valido(pedido)) {
      guardar(pedido);
      return pedido;
    }
    try {
      const guardado = localStorage.getItem(clave);
      if (valido(guardado)) return guardado;
    } catch { /* Se usa el idioma del navegador. */ }
    return navigator.languages?.[0]?.toLowerCase().startsWith('es') ? 'es' : 'en';
  }

  const idioma = elegir();
  const contenido = CR.Contenido = { es: Object.create(null), en: Object.create(null) };

  function cambiar(nuevo) {
    if (!valido(nuevo) || nuevo === idioma) return;
    guardar(nuevo);
    const url = new URL(location.href);
    url.searchParams.set('lang', nuevo);
    location.assign(url.href);
  }

  function aplicar() {
    const atributos = { t: 'textContent', 't-aria': 'aria-label', 't-title': 'title', 't-placeholder': 'placeholder' };
    for (const [marca, atributo] of Object.entries(atributos)) {
      for (const nodo of document.querySelectorAll('[data-' + marca + ']')) {
        const texto = CR.t(nodo.getAttribute('data-' + marca));
        if (marca === 't') nodo.textContent = texto;
        else nodo.setAttribute(atributo, texto);
      }
    }
    for (const boton of document.querySelectorAll('[data-idioma]')) {
      boton.setAttribute('aria-pressed', String(boton.dataset.idioma === idioma));
      boton.addEventListener('click', () => cambiar(boton.dataset.idioma));
    }
    if (idioma === 'en') {
      for (const enlace of document.querySelectorAll('a[href]')) {
        const ruta = enlace.getAttribute('href');
        if (!/^[\w-]+\.html(?:[?#]|$)/.test(ruta)) continue;
        const url = new URL(ruta, location.href);
        url.searchParams.set('lang', idioma);
        enlace.href = url.href;
      }
    }
  }

  function traducir(lengua, id, datos = {}) {
    const diccionario = CR.Idiomas?.[lengua] ?? {};
    const espanol = CR.Idiomas?.es ?? {};
    const texto = Object.hasOwn(diccionario, id) ? diccionario[id] : Object.hasOwn(espanol, id) ? espanol[id] : id;
    return texto.replace(/\{(\w+)\}/g, (hueco, nombre) => Object.hasOwn(datos, nombre) ? datos[nombre] : hueco);
  }
  CR.t = traducir.bind(null, idioma);
  CR.t.es = traducir.bind(null, 'es');
  CR.t.en = traducir.bind(null, 'en');
  CR.Idioma = {
    actual: () => idioma, cambiar, aplicar,
    registrar: (lengua, nombre, datos) => {
      if (valido(lengua)) contenido[lengua][nombre] = datos;
    },
    contenido: nombre => contenido[idioma][nombre] ?? contenido.es[nombre]
  };
  if (typeof module !== 'undefined') {
    require('../idiomas/es');
    require('../idiomas/en');
    module.exports = { t: CR.t, Idioma: CR.Idioma };
  }
  if (typeof document !== 'undefined') {
    document.documentElement.lang = idioma;
    aplicar();
  }
})(globalThis.CR ||= {});
