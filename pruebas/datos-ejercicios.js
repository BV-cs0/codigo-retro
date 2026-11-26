'use strict';
const temas = ["primeros","variables","condiciones","bucles","listas","funciones","textos","diccionarios","errores","entrada","retos"];
function ejercicios(idioma) {
  const ruta = idioma === 'en' ? '../js/ejercicios/en/' : '../js/ejercicios/';
  return temas.flatMap(tema => require(ruta + tema));
}
module.exports = ejercicios('es');
module.exports.en = ejercicios('en');
