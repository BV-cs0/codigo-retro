(function (A) {
'use strict';
const diccionario = 'password welcome letmein qwerty football monkey dragon winter summer orange purple shadow flower sunshine cookie coffee access hockey banana pepper silver guitar rabbit panda tiger falcon sailor anchor beacon starfish'.split(' ').join('\n') + '\n';
const hash = 'a941a4c4fd0c01cddef61b8be963bf4c1e2b0811c037ce3f1835fddf6ef6c223\n';
function lista(idioma, textos, archivos, datos, banderas) {
  const [mensaje, rotacion, volcado, palabras] = archivos;
  const p = idioma === 'es' ? 'p' : 'word';
  const bucle = 'while read ' + p + '; do echo "$(echo -n "$' + p +
    '" | sha256sum) $' + p + '"; done < ' + palabras + ' | grep "$(cat hash.txt)"';
  return [
    A.reto('B1', 200, idioma, textos[0], { [mensaje]: datos[0] }, banderas[0], ['base64 -d ' + mensaje], ['base64']),
    A.reto('B2', 200, idioma, textos[1], { [rotacion]: datos[1] }, banderas[1],
      ["tr 'A-Za-z' 'N-ZA-Mn-za-m' < " + rotacion], ['tr']),
    A.reto('B3', 200, idioma, textos[2], { [volcado]: datos[2] }, banderas[2], ['xxd -r -p ' + volcado], ['xxd']),
    A.reto('B4', 300, idioma, textos[3], { [palabras]: diccionario, 'hash.txt': hash }, 'FLAG{sunshine}',
      [bucle], ['read', 'echo', 'sha256sum', 'cat', 'grep'])
  ];
}
const es = [
  ['No es cifrado', 'Lee la bandera de este mensaje Base64.', ['Mira el archivo de mensaje.', 'Usa base64 -d mensaje.txt.'],
    'Decodificaste Base64.', 'Base64 cambia la representación. Protege los secretos con cifrado.'],
  ['Rotación 13', 'Alguien giró el alfabeto 13 posiciones. Deshaz el cambio.',
    ['ROT13 se invierte al aplicarlo otra vez.', "Usa tr 'A-Za-z' 'N-ZA-Mn-za-m'."],
    'Leíste el mensaje con ROT13.', 'Una sustitución fija es fácil de invertir. Usa cifrado moderno.'],
  ['Hexadecimal', 'Recupera la bandera de este volcado hexadecimal.',
    ['Cada par de dígitos representa un byte.', 'Usa xxd -r -p volcado.hex.'],
    'Convertiste el volcado en texto.', 'Protege el volcado con los mismos controles de acceso que el archivo original.'],
  ['La contraseña débil', 'Comprueba si este hash de práctica coincide con una palabra del diccionario.',
    ['Usa echo -n para calcular el hash sin un salto de línea.', 'Lee cada palabra con while read y usa grep con el hash de hash.txt.'],
    'Confirmaste que el hash corresponde a una contraseña débil.',
    'Usa contraseñas largas y únicas. Guarda sus hashes con sal y una función lenta como Argon2 o bcrypt.']
];
const en = [
  ['Encoding in plain sight', 'Read the flag in this Base64 message.', ['Look at the message file.', 'Use base64 -d message.txt.'],
    'You decoded Base64.', 'Base64 changes how data is written. Use encryption to protect secrets.'],
  ['Rotation 13', 'Someone moved the alphabet 13 places. Undo the change.',
    ['Apply ROT13 again to undo it.', "Use tr 'A-Za-z' 'N-ZA-Mn-za-m'."],
    'You read the message with ROT13.', 'A fixed letter swap is easy to undo. Use modern encryption.'],
  ['Hexadecimal', 'Find the flag in this hex dump.', ['Each pair of digits stands for one byte.', 'Use xxd -r -p dump.hex.'],
    'You turned the dump into text.', 'Use the same access rules for the dump and the original file.'],
  ['The weak password', 'Check if this practice hash matches a word on the list.',
    ['Use echo -n to hash the word without a newline.', 'Read each word with while read and use grep with the hash in hash.txt.'],
    'You confirmed that the hash matches a weak password.',
    'Use long, unique passwords. Store their hashes with a salt and a slow function like Argon2 or bcrypt.']
];
A.registrar('B', {
  es: lista('es', es, ['mensaje.txt', 'rotacion.txt', 'volcado.hex', 'diccionario.txt'],
    ['RkxBR3tjb2RpZmljYWRvfQo=\n', 'SYNT{ebgnqb}\n', '464c41477b766f6c6361646f7d0a\n'],
    ['FLAG{codificado}', 'FLAG{rotado}', 'FLAG{volcado}']),
  en: lista('en', en, ['message.txt', 'rotation.txt', 'dump.hex', 'wordlist.txt'],
    ['RkxBR3tlbmNvZGVkfQo=\n', 'SYNT{ebgngrq}\n', '464c41477b64756d707d0a\n'],
    ['FLAG{encoded}', 'FLAG{rotated}', 'FLAG{dump}'])
});
})(globalThis.CR.Atalaya);
