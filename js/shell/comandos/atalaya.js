(function (CR) {
'use strict';
const S = CR.Shell;
const { registrar: R, opciones, archivos } = S.Base;
const t = CR.t;
const localizar = (clave, datos) => idioma => t[idioma](clave, datos);
const codificador = new TextEncoder();

// Conserva bytes sin representación UTF-8 entre órdenes y redirecciones.
function texto(bytes) {
  const decodificador = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true });
  let salida = '';
  for (let i = 0; i < bytes.length;) {
    const n = bytes[i];
    const largo = n < 128 ? 1 : n < 224 ? 2 : n < 240 ? 3 : 4;
    try {
      salida += decodificador.decode(bytes.subarray(i, i + largo));
      i += largo;
    } catch {
      salida += String.fromCharCode(0xdc00 + n);
      i++;
    }
  }
  return salida;
}
function bytes(valor) {
  const salida = [];
  for (const parte of valor) {
    const n = parte.charCodeAt(0);
    if (n >= 0xdc80 && n <= 0xdcff) salida.push(n - 0xdc00);
    else salida.push(...codificador.encode(parte));
  }
  return Uint8Array.from(salida);
}
const envolver = (valor, ancho) => valor.match(new RegExp('.{1,' + ancho + '}', 'g'))?.join('\n') + '\n';
function base64(c, dato, inverso) {
  if (!inverso) {
    const valor = btoa(Array.from(bytes(dato), n => String.fromCharCode(n)).join(''));
    if (valor) c.out(envolver(valor, 76));
    return;
  }
  dato = dato.replaceAll('\n', '');
  const valido = /^(?:[\w+/]{4})*(?:[\w+/]{2}==|[\w+/]{3}=)?$/.test(dato) && !dato.includes('_');
  if (!valido) return c.error('base64: invalid input', 1, false);
  c.out(texto(Uint8Array.from(atob(dato), ch => ch.charCodeAt(0))));
}
R('base64', localizar('atalaya.base64'), ['base64 [-d] [FILE]'], c => {
  const { args, flags } = opciones(c, 'd');
  if (args.length > 1) return c.invalido(args[1]);
  archivos(c, args, dato => base64(c, dato, flags.d));
}, { '-d': localizar('atalaya.decode') });
R('xxd', localizar('atalaya.xxd'), ['xxd -p [FILE]', 'xxd -r -p [FILE]'], c => {
  const { args, flags } = opciones(c, 'pr');
  if (!flags.p || args.length > 1) return c.invalido(c.args.join(' '));
  archivos(c, args, dato => {
    if (flags.r) {
      const pares = dato.replace(/\s/g, '').match(/[a-f\d]{2}/gi) ?? [];
      c.out(texto(Uint8Array.from(pares, x => parseInt(x, 16))));
    } else if (dato) c.out(envolver(S.Hashes.hex(bytes(dato)), 60));
  });
}, { '-p': localizar('atalaya.plain'), '-r': localizar('atalaya.decode') });
for (const nombre of ['md5', 'sha256']) {
  R(nombre + 'sum', localizar('atalaya.hash', { algoritmo: nombre.toUpperCase() }), [nombre + 'sum [FILE]'], c => {
    archivos(c, opciones(c).args, (dato, archivo) => c.out(S.Hashes[nombre](bytes(dato)) + '  ' + archivo + '\n'));
  });
}
function sudo(c) {
  const { usuario, maquina } = c.sesion.identidad;
  const reglas = c.sesion.reto?.sudo ?? {};
  const [ruta] = c.args;
  const permiso = path => '(root) NOPASSWD: ' + path;
  if (ruta === '-l' && c.args.length === 1) {
    if (!Object.keys(reglas).length) return c.error('User ' + usuario + ' is not allowed to run sudo on ' + maquina + '.');
    return c.out('User ' + usuario + ' may run the following commands on ' + maquina + ':\n    ' +
      Object.keys(reglas).map(permiso).join('\n    ') + '\n');
  }
  if (['su', '-i', '-s'].includes(ruta)) return c.error(t[c.sesion.idioma]('atalaya.noRoot'));
  if (c.args.length === 1 && ruta.startsWith('/') && Object.hasOwn(reglas, ruta)) {
    // { script: true }: se ejecuta el archivo de verdad como root (por ejemplo, un script que otros pueden editar).
    if (reglas[ruta]?.script) c.script = { archivo: ruta, args: [], directo: true, comoRoot: true };
    else c.out(reglas[ruta]);
    return;
  }
  c.error("Sorry, user " + usuario + " is not allowed to execute '" + c.args.join(' ') + "' as root on " + maquina + ".");
}
R('sudo', localizar('atalaya.sudo'), ['sudo -l', 'sudo /PATH'], sudo, { '-l': localizar('atalaya.rules') });
R('enviar', localizar('atalaya.submit'), ['enviar FLAG{...}'], c => {
  const reto = c.sesion.reto, traducir = t[c.sesion.idioma];
  if (!reto) return c.error(traducir('atalaya.noChallenge'));
  if (c.args.length !== 1 || c.args[0] !== reto.bandera) return c.error(traducir('atalaya.wrong'), 1, false);
  // Algunos retos piden además dejar algo arreglado (por ejemplo, quitar un permiso).
  if (reto.requisito && !reto.requisito.cumplido(c.sesion)) return c.error(reto.requisito.falta, 1, false);
  c.sesion.entrega.correcta = true;
  c.out(traducir('atalaya.correct') + '\n');
});
})(globalThis.CR);
