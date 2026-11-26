'use strict';
require('../js/shell/ejecutor');
for (const archivo of ['curso/bash-temas', 'curso/bash-proyecto', 'curso/bash-validar', 'ejercicios/bash-retos'])
  require('../js/' + archivo);
const { CursoBash, EjerciciosBash, ValidarBash, Shell } = globalThis.CR;
const CursoBashEn = [...require('../js/curso/en/bash-temas'), require('../js/curso/en/bash-proyecto')];
module.exports = { CursoBash, CursoBashEn, EjerciciosBash, ValidarBash, Bash: Shell.Bash };
