'use strict';
const { identidad } = require('../js/shell/sfa');

module.exports = idioma => {
  const { home: cwd, usuario } = identidad(idioma);
  const target = { target: 'ok\n' };
  const enlace = { msys: 'winsymlinks:lnk' };
  const casos = [
    ['ln', target, 'ln -s target shortcut && cat shortcut', 'ok\n', enlace],
    ['readlink', {}, 'ln -s missing shortcut && readlink shortcut', 'missing\n', enlace],
    ['ls', target, 'ln -s target shortcut && ls -l shortcut',
      'lrwxrwxrwx 1 ' + usuario + ' ' + usuario + ' 6 Nov 16 03:14 shortcut -> target\n',
      { ...enlace, normalizar: 'ls-enlace' }],
    ['env', {}, "DEMO_FARO=cold; env | grep '^DEMO_FARO='; export DEMO_FARO='night shift'; " +
      "env | grep '^DEMO_FARO='; printenv DEMO_FARO; unset DEMO_FARO; printenv DEMO_FARO || echo unset",
      'DEMO_FARO=night shift\nnight shift\nunset\n'],
    ['alias', {}, "alias demo='echo ok'\ndemo\nalias\nunalias demo\nalias", "ok\nalias demo='echo ok'\n",
      { expandirAlias: true }],
    ['which', { 'bin/demo': { contenido: '#!/bin/bash\necho ok\n', permisos: 'rwxr-xr-x' } },
      'export PATH="$PWD/bin:$PATH"; which demo; demo', cwd + '/bin/demo\nok\n', { normalizar: 'cwd' }],
    ['du', { data: 'x'.repeat(5000), empty: '' }, 'du -sh data empty', '8.0K\tdata\n0\tempty\n']
  ];
  return casos.map(([id, fs, linea, salida, bash]) => ({ id: 'faro2-' + id,
    fs, cwd, linea, salida, ...(bash && { bash }) }));
};
