'use strict';
module.exports = ['primeros', 'variables', 'condiciones', 'bucles', 'listas', 'funciones',
  'textos', 'diccionarios', 'errores', 'entrada', 'proyecto']
  .map(tema => require('../js/curso/temas/' + tema));
