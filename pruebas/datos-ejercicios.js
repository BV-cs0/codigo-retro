'use strict';
module.exports = ["primeros","variables","condiciones","bucles","listas","funciones","textos","diccionarios","errores","entrada","retos"]
  .flatMap(tema => require('../js/ejercicios/' + tema));
