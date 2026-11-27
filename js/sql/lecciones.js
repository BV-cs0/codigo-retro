(function (CR) {
  'use strict';
  function crear(idioma) {
    const temas = [];
    const tema = (titulo, pasos) => {
      const id = 'sql-' + (temas.length + 1);
      temas.push({ id, titulo, pasos: pasos.map((paso, i) => ({ ...paso, id: id + ':' + (i + 1) })) });
    };
    const ficha = (tipo, titulo, texto, codigo) => ({ tipo, titulo, texto: [texto], codigo });
    const explica = (titulo, texto, codigo, error) => ({ ...ficha('explica', titulo, texto, codigo), ...(error ? { error } : {}) });
    const resumen = (...datos) => ficha('resumen', ...datos);
    function predice(titulo, texto, codigo, pregunta, opciones, correcta, prediccion) {
      return { ...ficha('predice', titulo, texto, codigo), pregunta, opciones, correcta, prediccion };
    }
    function ejercicio(tipo, titulo, texto, codigo, objetivo, pistas, solucion, requiere, casos, error) {
      return { ...ficha(tipo, titulo, texto, codigo), objetivo, pistas, solucion, requiere, casos, ...(error ? { error } : {}) };
    }
    const reto = (...datos) => ejercicio('reto', ...datos);
    const arregla = (...datos) => ejercicio('arregla', ...datos);
    const resultado = (filas, columnas, orden = false) => ({ resultado: { filas, columnas, orden } });
    const filas = nombre => CR.Contenido[idioma].sqlGranja.tablas[nombre].filas;
    const publicar = () => CR.Idioma.registrar(idioma, 'sqlTemas', temas);
    return { tema, explica, resumen, predice, reto, arregla, resultado, filas, publicar };
  }
  CR.LeccionesSQL = { crear };
})(globalThis.CR);
