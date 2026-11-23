(function () {
  'use strict';
  const explica = (titulo, texto, codigo, extras) => ({ tipo: 'explica', titulo, texto: [texto], codigo, ...extras });
  const predice = (titulo, texto, codigo, opciones, explicacion, extras) => ({
    tipo: 'predice', titulo, texto: [texto], codigo, opciones, correcta: 0, pregunta: '¿Qué verás en la consola?', explicacion, ...extras
  });
  const reto = (titulo, texto, codigo, solucion, pistas, extras) => ({
    tipo: 'reto', titulo, texto: [texto], objetivo: texto, codigo, solucion, pistas, ...extras
  });
  const resumen = (titulo, texto, chuleta, extras) => ({ tipo: 'resumen', titulo, texto, codigo: '', chuleta, ...extras });
  const formatos = { explica, predice, reto, resumen };
  if (typeof module !== 'undefined') module.exports = formatos;
  else (window.CR ||= {}).FormatosCurso = formatos;
})();
