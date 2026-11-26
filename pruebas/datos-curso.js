'use strict';
const nombres = ['primeros', 'variables', 'condiciones', 'bucles', 'listas', 'funciones',
  'textos', 'diccionarios', 'errores', 'entrada', 'proyecto'];
const cargar = sufijo => nombres.map(tema => require('../js/curso/temas/' + tema + sufijo));
module.exports = { es: cargar(''), en: cargar('-en') };
