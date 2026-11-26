'use strict';
const HOME = '/home/aprendiz';
const fs = { 'a.txt': 'uno\nDOS\nuno\nfin', 'b.txt': 'dos\n40\n2\n', 'c.txt': 'x\n', vacío: '',
  datos: 'z:12:x\na:2:y\ny:2:z\nz:12:x\n', repite: 'x\nx\ny\nz\nz\n', '.nota': 'oculto\n',
  'sub/': null, 'sub/d.txt': 'uno\nmisc\n', 'sub/hueco/': null, 'sub/G.TXT': 'á\n' };
const casos = [];
function caso(linea, salida, opciones = {}) {
  casos.push({ id: 'terminal-' + String(casos.length + 1).padStart(3, '0'), fs, cwd: HOME,
    linea, salida, error: '', codigo: 0, bash: false, ...opciones });
}
for (const [linea, salida, opciones] of [
  ['cat a.txt', fs['a.txt']], ['cat a.txt b.txt', fs['a.txt'] + fs['b.txt']],
  ['cat -n b.txt', '     1\tdos\n     2\t40\n     3\t2\n'],
  ['cat -n a.txt c.txt', '     1\tuno\n     2\tDOS\n     3\tuno\n     4\tfinx\n'],
  ['head a.txt', fs['a.txt']], ['head -n 2 a.txt', 'uno\nDOS\n'], ['head -1 b.txt', 'dos\n'],
  ['head -n -1 b.txt', 'dos\n40\n'], ['head -n0 b.txt', ''],
  ['head -1 a.txt b.txt', '==> a.txt <==\nuno\n\n==> b.txt <==\ndos\n'],
  ['tail a.txt', fs['a.txt']], ['tail -n 2 a.txt', 'uno\nfin'], ['tail -1 b.txt', '2\n'], ['tail -n +2 b.txt', '40\n2\n'],
  ['tail -n0 b.txt', ''], ['tail -n 1 a.txt b.txt', '==> a.txt <==\nfin\n==> b.txt <==\n2\n'],
  ['wc a.txt', ' 3  4 15 a.txt\n'], ['wc -l a.txt', '3 a.txt\n'], ['wc -w a.txt', '4 a.txt\n'],
  ['wc -c sub/G.TXT', '3 sub/G.TXT\n'], ['wc -lc a.txt b.txt', ' 3 15 a.txt\n 3  9 b.txt\n 6 24 total\n'],
  ['echo x | wc', '      1       1       2\n'], ["echo -n 'hola mundo'", 'hola mundo'],
  ["echo -e 'a\\nb\\tfin'", 'a\nb\tfin\n'], ['echo -ne "a\\tb"', 'a\tb'],
  ["X='dos palabras'; echo \"$X\"", 'dos palabras\n'], ["X='dos palabras'; echo $X", 'dos palabras\n'],
  ["X='  dos   palabras  '; echo $X", 'dos palabras\n'], ["X='  dos   palabras  '; echo \"$X\"", '  dos   palabras  \n'],
  ["X=ok; echo '$X' \"$X\" \\$X", '$X ok $X\n'],
  ['echo uno\\ dos "tres cuatro"', 'uno dos tres cuatro\n'], ['echo "<y>"', '<y>\n'],
  ['echo "\'literal\'"', "'literal'\n"], ["echo '\"literal\"'", '"literal"\n'],
  ['echo a; echo b', 'a\nb\n'], ['echo ok && echo siguiente || echo nunca', 'ok\nsiguiente\n'],
  ['grep ausente a.txt || echo $?; echo $?', '1\n0\n'], ['grep ausente a.txt && echo no; echo sí', 'sí\n'],
  ['echo *.txt', 'a.txt b.txt c.txt\n'], ['echo ?.txt', 'a.txt b.txt c.txt\n'], ['echo [ab].txt', 'a.txt b.txt\n'],
  ['echo "*".txt \\?.txt *.gif', '*.txt ?.txt *.gif\n'], ['echo sub/*.[tT][xX][tT]', 'sub/G.TXT sub/d.txt\n'],
  ["cat '~/nota'", 'literal\n', { fs: { '~/~/nota': 'literal\n' }, bash: false }],
  ['echo .n*', '.nota\n'], ['echo sub/h*/', 'sub/hueco/\n'], ['echo */d.txt', 'sub/d.txt\n'],
  ['G="*.txt"; echo $G "$G"', 'a.txt b.txt c.txt *.txt\n'],
  ['ls -1', 'a.txt\nb.txt\nc.txt\ndatos\nrepite\nsub\nvacío\n'], ['ls -1a sub', '.\n..\nG.TXT\nd.txt\nhueco\n'],
  ['ls -1A', '.nota\na.txt\nb.txt\nc.txt\ndatos\nrepite\nsub\nvacío\n'], ['ls -1r a.txt b.txt c.txt', 'c.txt\nb.txt\na.txt\n'],
  ['grep uno a.txt', 'uno\nuno\n'], ['grep -i dos a.txt', 'DOS\n'], ['grep -n uno a.txt', '1:uno\n3:uno\n'],
  ['grep -c uno a.txt', '2\n'], ['grep -v uno a.txt', 'DOS\nfin\n'], ['grep -l uno a.txt b.txt', 'a.txt\n'],
  ["echo -e 'sola\\nsol\\nparasol' | grep -w sol", 'sol\n'],
  ["grep -E 'uno|DOS' a.txt", 'uno\nDOS\nuno\n'], ["grep 'uno\\|DOS' a.txt", 'uno\nDOS\nuno\n'],
  ["echo -e 'a\\naaa\\nb' | grep -E 'a+'", 'a\naaa\n'], ["grep -E '[0-9]+' b.txt", '40\n2\n'],
  ['grep -r uno sub', 'sub/d.txt:uno\n', { sinOrden: true }],
  ['grep -n Uno a.txt', '', { codigo: 1 }], ['grep -cn gato a.txt', '0\n', { codigo: 1 }],
  ['grep uno inexistente 2>/dev/null', '', { codigo: 2 }],
  ['sort b.txt', '2\n40\ndos\n'], ['sort -r b.txt', 'dos\n40\n2\n'], ['sort -n b.txt', 'dos\n2\n40\n'],
  ['sort -rn b.txt', '40\n2\ndos\n'], ['sort -u repite', 'x\ny\nz\n'],
  ['sort -nt: -k2,2 datos', 'a:2:y\ny:2:z\nz:12:x\nz:12:x\n'], ['sort -unt: -k2,2 datos', 'a:2:y\nz:12:x\n'],
  ["echo -e 'r 2\\na 1' | sort -nk2", 'a 1\nr 2\n'],
  ['uniq repite', 'x\ny\nz\n'], ['uniq -c repite', '      2 x\n      1 y\n      2 z\n'],
  ['uniq -d repite', 'x\nz\n'], ['uniq -cd repite', '      2 x\n      2 z\n'],
  ['cut -d: -f2 datos', '12\n2\n2\n12\n'], ['cut -d: -f1,3 datos', 'z:x\na:y\ny:z\nz:x\n'],
  ['cut -d: -f2- datos', '12:x\n2:y\n2:z\n12:x\n'], ['cut -d: -f2 a.txt', 'uno\nDOS\nuno\nfin\n'],
  ['tr a-z A-Z < b.txt', 'DOS\n40\n2\n'], ['tr -d a-z < b.txt', '\n40\n2\n'],
  ["echo -e 'a\\tb' | tr -d '\\t'", 'ab\n'], ['echo abcde | tr a-z XY', 'XYYYY\n'],
  ["find sub -name '*.txt'", 'sub/d.txt\n', { sinOrden: true }],
  ["find sub -iname '*.txt'", 'sub/d.txt\nsub/G.TXT\n', { sinOrden: true }],
  ['find sub -type d', 'sub\nsub/hueco\n', { sinOrden: true }],
  ['find sub -type f', 'sub/d.txt\nsub/G.TXT\n', { sinOrden: true }],
  ['find sub -maxdepth 0', 'sub\n', { sinOrden: true }], ['find sub -maxdepth 1 -type d', 'sub\nsub/hueco\n', { sinOrden: true }],
  ['find sub -empty', 'sub/hueco\n', { sinOrden: true }], ['find sub -size 3c', 'sub/G.TXT\n', { sinOrden: true }],
  ['find sub -type f -size -2k', 'sub/d.txt\nsub/G.TXT\n', { sinOrden: true }],
  ['find . -type f -size +1k', './grande\n', { fs: { grande: 'a'.repeat(1100), chico: 'b' }, sinOrden: true }],
  ['find sub -type f | wc -l', '2\n'], ['grep uno a.txt | sort | uniq -c', '      2 uno\n'],
  ['cat b.txt | tail -2 | sort -n | head -1', '2\n'],
  ['echo abrir > nuevo; cat nuevo', 'abrir\n'], ['echo abrir > nuevo; echo cerrar >> nuevo; cat < nuevo', 'abrir\ncerrar\n'],
  ['echo abrir > nuevo; echo cerrar > nuevo; cat nuevo', 'cerrar\n'],
  ['sort < b.txt > nuevo; cat nuevo', '2\n40\ndos\n'], ['cat noexiste 2>/dev/null || echo oculto', 'oculto\n'],
  ['echo silencio >/dev/null; cat /dev/null', ''], ['echo a > primero > segundo; cat primero segundo', 'a\n'],
  ['cat b.txt | grep dos > nuevo; cat nuevo', 'dos\n'], ['echo b > nuevo | wc -l; cat nuevo', '0\nb\n'],
  ['echo a | cat < b.txt', fs['b.txt']], ['X=hola; echo "$X" > nuevo; cat nuevo', 'hola\n'],
  ['cat noexiste 2> fallos; cat fallos', 'cat: noexiste: No such file or directory\n'],
  ['echo a # comentario', 'a\n'], ['echo \\#literal', '#literal\n']
]) caso(linea, salida, { bash: true, ...opciones });

const privado = { '/etc/llave': { contenido: 'secreto', permisos: 'rw-------', dueno: 'root' },
  'faro.sh': 'echo Bien\ncd sub\npwd\n', 'sub/': null, 'ampliado.sh': 'if test 1; then echo Sí; fi\n' };
for (const [linea, salida, opciones] of [
  ['pwd', HOME + '\n'], ['whoami; hostname; date', 'aprendiz\nfaro7\nSat Nov 16 03:14:00 UTC 2024\n'],
  ['cd sub; cd -; cd', HOME + '\n'], ['cd sub//hueco/.././; pwd', HOME + '/sub\n'],
  ['history', '    1  history\n'], ['clear', ''], ['mision', 'No hay una misión activa.\n'],
  ['responder hola', 'Esta misión no pide una respuesta.\n'],
  ['man head', 'HEAD\n\nMuestra el principio de un archivo.\n  -n N  selecciona N líneas\n  -c N  selecciona N bytes\n  -N  forma abreviada\n\nEjemplos\n  head nota.txt\n  head -n 1 nota.txt\n'],
  ['file a.txt vacío sub', 'a.txt: ASCII text\nvacío: empty\nsub:   directory\n'],
  ['tree sub', 'sub\n├── G.TXT\n├── d.txt\n└── hueco\n\n1 directory, 2 files\n'],
  ['ls -l a.txt', '-rw-r--r-- 1 aprendiz aprendiz 15 Nov 16 03:14 a.txt\n'],
  ['ls -lh sub', 'total 12K\n-rw-r--r-- 1 aprendiz aprendiz    3 Nov 16 03:14 G.TXT\n-rw-r--r-- 1 aprendiz aprendiz    9 Nov 16 03:14 d.txt\ndrwxr-xr-x 2 aprendiz aprendiz 4.0K Nov 16 03:14 hueco\n'],
  ['ls -1t', 'reciente\nantiguo\n', { fs: { antiguo: { contenido: '', fecha: '2024-10-15T12:00:00Z' }, reciente: '' } }],
  ['ls -1S a.txt b.txt c.txt', 'a.txt\nb.txt\nc.txt\n'],
  ['ls -R1 sub', 'sub:\nG.TXT\nd.txt\nhueco\n\nsub/hueco:\n'], ['ls a.txt c.txt', 'a.txt  c.txt\n'],
  ['mkdir -p otra/interna; cd otra/interna; pwd', HOME + '/otra/interna\n'],
  ['rmdir sub/hueco; ls -1 sub', 'G.TXT\nd.txt\n'], ['rm -f x; rm -r sub; find . -type d', '.\n'],
  ['touch nuevo; file nuevo', 'nuevo: empty\n'], ['touch a.txt; cat a.txt', fs['a.txt']],
  ['cp a.txt copia; cat copia', fs['a.txt']], ['cp -r sub copia; cat copia/d.txt', fs['sub/d.txt']],
  ['mv a.txt sub; cat sub/a.txt', fs['a.txt']], ['mv a.txt nuevo; ls -1 nuevo', 'nuevo\n'],
  ['diff a b', '2c2\n< viejo\n---\n> nuevo\n', { fs: { a: 'hola\nviejo\n', b: 'hola\nnuevo\n' }, codigo: 1 }],
  ['diff a b', '1a2\n> dos\n', { fs: { a: 'uno\n', b: 'uno\ndos\n' }, codigo: 1 }],
  ['diff a b', '2d1\n< dos\n', { fs: { a: 'uno\ndos\n', b: 'uno\n' }, codigo: 1 }],
  ['diff a b', '1c1\n< x\n\\ No newline at end of file\n---\n> y\n\\ No newline at end of file\n',
    { fs: { a: 'x', b: 'y' }, codigo: 1 }],
  ['diff a.txt a.txt', ''],
  ['chmod u+x faro.sh && ./faro.sh; pwd', 'Bien\n' + HOME + '/sub\n' + HOME + '\n', { fs: privado }],
  ['chmod 755 faro.sh; ls -l faro.sh', '-rwxr-xr-x 1 aprendiz aprendiz 21 Nov 16 03:14 faro.sh\n', { fs: privado }],
  ['chmod go-w faro.sh; chmod a+r faro.sh; bash faro.sh', 'Bien\n' + HOME + '/sub\n', { fs: privado }],
  ['bash ampliado.sh', 'Sí\n', { fs: privado }],
  ['chmod +x ampliado.sh; ./ampliado.sh', 'Sí\n', { fs: privado }],
  ['echo "$HOME,$USER,$PWD,$OLDPWD"', HOME + ',aprendiz,' + HOME + ',\n'],
  ['cd sub; echo $PWD:$OLDPWD', HOME + '/sub:' + HOME + '\n'], ['cd sub | cat; pwd', HOME + '\n'],
  ['less a.txt', fs['a.txt']], ['sudo ls', 'Aquí no hay sudo. Ni falta que hace.\n', { codigo: 127 }]
]) caso(linea, salida, opciones);

for (const [linea, error, codigo = 1, opciones] of [
  ['tail -1 a.txt b.txt', 'tail: option used in invalid context -- 1'],
  ['cd noexiste', 'cd: noexiste: No such file or directory'], ['cd a.txt', 'cd: a.txt: Not a directory'],
  ['cd -', 'bash: cd: OLDPWD not set'], ['lss', 'bash: lss: command not found', 127],
  ['ls --color', 'ls --color no está en este simulador. Prueba ls -l.', 2], ['man lss', 'No manual entry for lss'],
  ['ls ausente', "ls: cannot access 'ausente': No such file or directory", 2], ['cat sub', 'cat: sub: Is a directory'],
  ['mkdir sub', "mkdir: cannot create directory 'sub': File exists"], ['rmdir sub', "rmdir: failed to remove 'sub': Directory not empty"],
  ['rm x', "rm: cannot remove 'x': No such file or directory"], ['rm sub', "rm: cannot remove 'sub': Is a directory"],
  ['cp sub copia', "cp: -r not specified; omitting directory 'sub'"],
  ['cat /etc/llave', 'cat: /etc/llave: Permission denied', 1, { fs: privado }],
  ['echo malo > /etc/llave', 'bash: /etc/llave: Permission denied', 1, { fs: privado }],
  ['touch /etc/nuevo', "touch: cannot touch '/etc/nuevo': Permission denied", 1, { fs: privado }],
  ['chmod 755 /etc/llave', "chmod: changing permissions of '/etc/llave': Operation not permitted", 1, { fs: privado }],
  ['./faro.sh', 'bash: ./faro.sh: Permission denied', 126, { fs: privado }],
  [Array(11).fill('cat').join(' | '), 'bash: Una tubería admite hasta 10 etapas.', 2],
  ['echo "sin cerrar', 'bash: Comillas sin cerrar.', 2], ['echo >', 'bash: Falta el destino de la redirección.', 2],
  ['echo a &&', 'bash: Falta un comando.', 2]
]) caso(linea, '', { error: error + '\n', codigo, ...opciones });

const { identidad } = require('../js/shell/sfa');
const palabras = { aprendiz: 'apprentice', uno: 'one', DOS: 'TWO', dos: 'two', fin: 'end',
  vacío: 'zero', datos: 'data', repite: 'repeat', nota: 'note', oculto: 'hidden', hueco: 'hollow', á: 'OK',
  hola: 'hello', mundo: 'world', palabras: 'words', tres: 'three', cuatro: 'four', siguiente: 'next', findos: 'endtwo', finx: 'endx',
  nunca: 'never', ausente: 'absent', sí: 'yes', sola: 'alone', sol: 'sun', parasol: 'sunshade',
  Uno: 'One', gato: 'cat', grande: 'large', chico: 'small', abrir: 'open', cerrar: 'close',
  nuevo: 'new', noexiste: 'missing', silencio: 'silence', primero: 'first', segundo: 'second',
  fallos: 'errors', comentario: 'comment' };
function traducir(texto) {
  return texto.replace(/\\[nt]|\p{L}+/gu, palabra => Object.hasOwn(palabras, palabra) ? palabras[palabra] : palabra);
}
function casosIngles() {
  return casos.filter(c => c.bash).map(c => ({ ...c, idioma: 'en', cwd: identidad('en').home,
    fs: Object.fromEntries(Object.entries(c.fs).map(([ruta, contenido]) =>
      [traducir(ruta), contenido === null ? null : traducir(contenido)])),
    linea: traducir(c.linea),
    salida: traducir(c.salida) }));
}
module.exports = { casos, casosIngles, HOME };
