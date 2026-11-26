(function () {
  'use strict';
  const P = typeof module !== 'undefined' ? require('../comun/progreso') : window.CR.Progreso;
  const Idioma = typeof module !== 'undefined' ? require('../comun/idioma').Idioma : window.CR.Idioma;
  const id = (tema, paso) => tema + '-' + paso;
  const borrador = Idioma.actual() === 'en' ? 'curso-en' : 'curso';
  const pasos = [8, 9, 10, 11, 9, 20, 10, 9, 9, 9, 10];
  const ProgresoCurso = {
    completo: (tema, paso) => P.estrellas('curso', id(tema, paso)) > 0,
    completar: (tema, paso) => P.guardarEstrellas('curso', id(tema, paso), 1),
    codigo: (tema, paso) => P.codigo(borrador, id(tema, paso)),
    guardarCodigo: (tema, paso, codigo) => P.guardarCodigo(borrador, id(tema, paso), codigo),
    aprobado: (tema, paso) => P.codigo(borrador, 'aprobado-' + id(tema, paso)),
    guardarAprobado: (tema, paso, codigo) => P.guardarCodigo(borrador, 'aprobado-' + id(tema, paso), codigo),
    inicio: (tema, paso) => P.codigo(borrador, 'inicio-' + id(tema, paso)),
    guardarInicio: (tema, paso, codigo) => P.guardarCodigo(borrador, 'inicio-' + id(tema, paso), codigo),
    cantidad: pasos.reduce((total, n) => total + n, 0),
    visitar: (tema, paso) => P.guardarCodigo('curso', 'ultimo', id(tema, paso)),
    ultimo: () => (P.codigo('curso', 'ultimo') || '0-0').split('-').map(Number),
    total() {
      let n = 0;
      for (const [tema, cantidad] of pasos.entries()) {
        for (let paso = 0; paso < cantidad; paso++) n += Number(this.completo(tema, paso));
      }
      return n;
    }
  };
  if (typeof module !== 'undefined') module.exports = ProgresoCurso;
  else window.CR.ProgresoCurso = ProgresoCurso;
})();
