'use strict';
const casos = [];
function caso(script, salida, extra) {
  casos.push({ id: 'motor-bash-' + (casos.length + 1), fs: {}, cwd: '/home/aprendiz',
    args: [], entradas: [], codigo: 0, stderr: '', script, salida, ...extra });
}
const fijos = [
  ["#!/bin/bash\n# comentario\n\necho luz; echo final","luz\nfinal\n"],
  ["echo lu\\\nz","luz\n"],
  ["n=Lumen\necho \"$n:${n}:${#n}:${falta:-noche}\"","Lumen:Lumen:5:noche\n"],
  ["n=\"a b\"\nprintf \"<%s>\\n\" $n \"$n\" '$n'","<a>\n<b>\n<a b>\n<$n>\n"],
  ["v=\"a b\"; f() { local x=$v; echo \"$x\"; }; f","a b\n"],
  ["v=$(echo \"luz\"; echo); printf \"<%s>\\n\" \"$v\"","<luz>\n"],
  ["echo \"`echo luz`\"","luz\n"],
  ["v=$(echo \"$(printf %s luz)\"); echo \"$v\"","luz\n"],
  ["echo $((3 + 4 * 2))","11\n"],
  ["i=1; (( i++ )); (( i > 1 )) && echo \"$i\"","2\n"],
  ["echo {1..5} {a,b,c} {08..10}","1 2 3 4 5 a b c 08 09 10\n"],
  ["echo fotos/*.{jpg,png}","fotos/a.jpg fotos/c.png\n",{"fs":{"fotos/a.jpg":"","fotos/b.gif":"","fotos/c.png":""}}],
  ["echo \"$0|$1|$9|$#|$*\"; printf \"<%s>\\n\" \"$@\"; shift; echo \"$#:$1\"","script.sh|mi parte||3|mi parte  fin\n<mi parte>\n<>\n<fin>\n2:\n",{"args":["mi parte","","fin"]}],
  ["for v in \"$@\"; do echo mal; done; echo bien","bien\n"],
  ["false; echo \"$?\"; true; echo \"$?\"; :","1\n0\n"],
  ["test -z \"\" && test -n a && test ! -f falta && echo luz","luz\n"],
  ["[ \"10\" \\< \"9\" ] && echo texto","texto\n"],
  ["if [ 1 -eq 2 ]; then echo no; elif [ 1 -ne 2 ]; then echo sí; else echo no; fi","sí\n"],
  ["if false; then echo no; else echo sí; fi","sí\n"],
  ["[[ foo < zoo && foo != bar || a > z ]] && echo luz","luz\n"],
  ["[[ ! a == b && x == x ]] && echo sí","sí\n"],
  ["x=\"mi log.txt\"; [[ $x == *\" \"*.txt ]] && echo sí","sí\n"],
  ["[[ \"$1\" =~ ^[0-9]+$ ]] && echo entero","entero\n",{"args":["104"]}],
  ["case \"$1\" in start|stop) echo orden ;; est*) echo estado ;; *) echo otra ;; esac","orden\n",{"args":["stop"]}],
  ["case \"$1\" in start|stop) echo orden ;; est*) echo estado ;; *) echo otra ;; esac","estado\n",{"args":["estado"]}],
  ["case \"$1\" in a) echo a ;; *) echo otra ;; esac","otra\n",{"args":["z"]}],
  ["for nombre in \"Ana Luz\" Iris; do echo \"<$nombre>\"; done","<Ana Luz>\n<Iris>\n"],
  ["for f in *.txt; do echo \"$f\"; done","A.txt\nz.txt\n",{"fs":{"z.txt":"","A.txt":"",".oculto.txt":""}}],
  ["for f in *.txt; do echo \"$f\"; done","*.txt\n"],
  ["for (( i=0; i<4; i++ )); do [ \"$i\" -eq 1 ] && continue; [ \"$i\" -eq 3 ] && break; echo \"$i\"; done","0\n2\n"],
  ["n=1; while [ \"$n\" -lt 4 ]; do echo \"$n\"; n=$((n+1)); done","1\n2\n3\n"],
  ["n=3; until [ \"$n\" -eq 0 ]; do echo \"$n\"; n=$((n-1)); done","3\n2\n1\n"],
  ["while read -r l; do echo \"<$l>\"; done < parte","<uno>\n<>\n<a\\b>\n",{"fs":{"parte":"uno\n\na\\b\n"}}],
  ["read -p \"¿Nombre? \" a b; printf \"%s|%s\\n\" \"$a\" \"$b\"","Ana|Luz Pérez\n",{"entradas":["Ana  Luz Pérez "]}],
  ["read -r a; echo \"$?\"; read -r b; echo \"$?\"","0\n1\n",{"entradas":[""]}],
  ["read -r a b <<EOF\nuno dos tres\nEOF\necho \"$a:$b\"","uno:dos tres\n"],
  ["v=luz; cat <<EOF\nFaro: $v\nEOF","Faro: luz\n"],
  ["v=luz; cat <<'EOF'\nFaro: $v\nEOF","Faro: $v\n"],
  ["f() { local x=$1; echo \"$x/$2\"; return 7; }; x=fuera; f dentro dos; echo \"$?:$x:$1\"","dentro/dos\n7:fuera:principal\n",{"args":["principal"]}],
  ["function f { echo \"$#:$1\"; }; f \"hola mundo\"","1:hola mundo\n"],
  ["x=fuera; f() { x=dentro; echo bien; }; v=$(f); echo \"$x:$v\"","fuera:bien\n"],
  ["f() { echo luz; exit 3; }; f; echo no","luz\n",{"codigo":3}],
  ["printf \"%5s|%-5s|%.2f|%d\\n\" x y 3.75 7","    x|y    |3.75|7\n"],
  ["printf \"%s\\t%d\\n\" luz 3 mar 4","luz\t3\nmar\t4\n"],
  ["echo -ne 'luz\\tverde\\nfin'","luz\tverde\nfin"],
  ["export x=luz; echo \"$x\"; exit 5; echo no","luz\n",{"codigo":5}],
  ["echo x\nx = 5\nx","x\n",{"codigo":127,"stderr":"script.sh: line 2: x: command not found\nscript.sh: line 3: x: command not found\n"}],
  ["echo x\n[ 1 -eq 1","x\n",{"codigo":2,"stderr":"script.sh: line 2: [: missing ']'\n"}],
  ["echo x\nv=\"a b\"\n:\n[ $v = a ]","x\n",{"codigo":2,"stderr":"script.sh: line 4: [: too many arguments\n"}],
  ["if true; then\n  echo sí\n","",{"codigo":2,"stderr":"script.sh: line 3: syntax error: unexpected end of file\n"}],
  ["getopts ab x","",{"codigo":2,"stderr":"script.sh: line 1: getopts no está en este simulador\n","sinExportar":true}],
  ["echo hi &","",{"codigo":2,"stderr":"script.sh: line 1: & no está en este simulador\n","sinExportar":true}],
  ["while true; do :; done","",{"codigo":2,"stderr":"script.sh: line 1: execution limit exceeded\n","sinExportar":true}],
  ["f() { f; }; f","",{"codigo":2,"stderr":"script.sh: line 1: execution limit exceeded\n","sinExportar":true}],
  ["echo abcdef | cut -c 1-3","abc\n"],
  ["echo abcdef | cut -c 2-","bcdef\n"],
  ["echo abcdef | cut -c -4","abcd\n"],
  ["head -c 3 datos; tail -c 4 datos","abccdef",{"fs":{"datos":"abcdef"}}],
  ["find fotos -type f -name \"*.jpg\" -exec echo {} \\; | sort","fotos/A.jpg\nfotos/b.jpg\n",{"fs":{"fotos/A.jpg":"","fotos/b.jpg":"","fotos/z.txt":""}}],
  ["test -r parte && test -w parte && test -s parte && test -e parte && test -d . && echo sí","sí\n",{"fs":{"parte":"luz"}}],
  ["bash hijo.sh luz; echo \"$?\"","luz\n9\n",{"fs":{"hijo.sh":"if [ -n \"$1\" ]; then echo \"$1\"; exit 9; fi\n"}}],
  ["mkdir sub; cd sub; echo luz > parte; cat parte","luz\n"],
  ["read -r a; echo \"<$a>\"","<a\\b>\n",{"entradas":["a\\b"]}],
  ["read a; echo \"<$a>\"","<ab>\n",{"entradas":["a\\b"]}],
  ["read a b; echo \"<$a>|<$b>\"","<Ana Luz>|<Pérez>\n",{"entradas":["Ana\\ Luz Pérez"]}],
  ["while read -r a; do echo \"$a\"; done < parte","uno\n",{"fs":{"parte":"uno\ndos"}}],
  ["echo \"Hola","",{"codigo":2,"stderr":"script.sh: line 1: unexpected EOF while looking for matching `\"'\n"}],
  ["v='ruta/parte'; [[ $v == * ]] && echo sí","sí\n"],
  ["printf '<%s>\\n' $(printf '{a,b}')","<{a,b}>\n"]
];
for (const fila of fijos) caso(...fila);
caso('for (( i=0; i<5100; i++ )); do echo x; done', 'x\n'.repeat(5000), { sinExportar: true });
for (const [a, b] of [[7, 2], [-7, 2], [9, -4], [0, 3], [3, 3], [14, 5]]) {
  for (const [op, calcular] of Object.entries({
    '+': (x, y) => x + y, '-': (x, y) => x - y, '*': (x, y) => x * y,
    '/': (x, y) => Math.trunc(x / y), '%': (x, y) => x % y,
    '<': (x, y) => +(x < y), '>=': (x, y) => +(x >= y), '==': (x, y) => +(x === y)
  })) caso('a=$1; b=$2; echo "$((a ' + op + ' b))"', calcular(a, b) + '\n', { args: [String(a), String(b)] });
}
for (const [op, comparar] of Object.entries({
  '-eq': (a, b) => a === b, '-ne': (a, b) => a !== b, '-lt': (a, b) => a < b,
  '-le': (a, b) => a <= b, '-gt': (a, b) => a > b, '-ge': (a, b) => a >= b
})) {
  for (const [a, b] of [[2, 2], [2, 10], [10, 2], [-1, 0], [0, -1], [0, 0], [-9, -8]]) {
    caso('[ "$1" ' + op + ' "$2" ] && echo sí || echo no', comparar(a, b) ? 'sí\n' : 'no\n',
      { args: [String(a), String(b)] });
  }
}
caso('for (( i=10; i>0; i-=3 )); do printf "%d," "$i"; done; echo\n' +
  'n=2; echo "$((n += 3)) $((n *= 8)) $((n /= 3)) $((n %= 5))"; (( n -= 1 )); echo "$n"\n' +
  'echo "$((2 ** 10)) $((2 ** 3 ** 2)) $((-2 ** 2)) $((2 ** 64))"\n' +
  'n=2; echo "$((n += n++)) $n"', '10,7,4,1,\n5 40 13 3\n2\n1024 512 4 0\n4 4\n');
caso('echo {05..10..2} {a..e..2} {03..-03..-2} {e..a..-2} {1..3..0} "{a..e..2}"\n' +
  'printf "<%s>\\n" {Y..b}', '05 07 09 a c e 003 001 -01 -03 e c a 1 2 3 {a..e..2}\n' +
  '<Y>\n<Z>\n<[>\n<>\n<]>\n<^>\n<_>\n<`>\n<a>\n<b>\n');
caso('set -- a b c; shift; echo "$1 $#"\n' +
  'set -- 1 2 3 4 5 6 7 8 9 diez; echo "${10}"\n' +
  'f() { set -- dentro; printf "<%s>\\n" "$@"; }; f\n' +
  'echo "$1 $#"; X=temporal set -- nuevo; echo "$1 ${X:-}"\n' +
  'echo "${01} ${00}"; set --; echo "$#" "${1:-vacío}"',
  'b 2\ndiez\n<dentro>\n1 10\nnuevo \nnuevo script.sh\n0 vacío\n');
module.exports = casos;
