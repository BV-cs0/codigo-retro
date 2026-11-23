'use strict';
require('../js/shell/ejecutor');
for (const archivo of ['curso/bash-temas', 'curso/bash-proyecto', 'curso/bash-validar', 'ejercicios/bash-retos'])
  require('../js/' + archivo);
const { CursoBash, EjerciciosBash, ValidarBash, Shell } = globalThis.CR;
module.exports = { CursoBash, EjerciciosBash, ValidarBash, Bash: Shell.Bash };
