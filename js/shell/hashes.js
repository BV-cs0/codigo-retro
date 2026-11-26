(function (S) {
'use strict';
const rotar = (n, k) => (n >>> k) | (n << (32 - k));
function bloques(bytes, little) {
  const datos = new Uint8Array(Math.ceil((bytes.length + 9) / 64) * 64);
  datos.set(bytes);
  datos[bytes.length] = 128;
  const vista = new DataView(datos.buffer);
  vista.setUint32(datos.length - (little ? 8 : 4), bytes.length * 8, little);
  vista.setUint32(datos.length - (little ? 4 : 8), Math.floor(bytes.length / 0x20000000), little);
  return vista;
}
function hash(bytes, estado, ronda, little = false) {
  const datos = bloques(bytes, little);
  for (let i = 0; i < datos.byteLength; i += 64) {
    const palabras = Array.from({ length: 16 }, (_, j) => datos.getUint32(i + j * 4, little));
    ronda(palabras, estado).forEach((n, j) => { estado[j] = (estado[j] + n) | 0; });
  }
  const salida = new DataView(new ArrayBuffer(estado.length * 4));
  estado.forEach((n, i) => salida.setUint32(i * 4, n, little));
  return hex(new Uint8Array(salida.buffer));
}
const hex = bytes => Array.from(bytes, n => n.toString(16).padStart(2, '0')).join('');
const senos = Array.from({ length: 64 }, (_, i) => Math.floor(Math.abs(Math.sin(i + 1)) * 2 ** 32));
const giros = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21];
function md5(bytes) {
  return hash(bytes, [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476], (w, estado) => {
    let [a, b, c, d] = estado;
    for (let i = 0; i < 64; i++) {
      const fase = i >> 4;
      const f = [((b & c) | (~b & d)), ((d & b) | (~d & c)), b ^ c ^ d, c ^ (b | ~d)][fase];
      const g = [i, 5 * i + 1, 3 * i + 5, 7 * i][fase] % 16;
      const siguiente = (b + rotar((a + f + senos[i] + w[g]) | 0, 32 - giros[fase * 4 + i % 4])) | 0;
      [a, b, c, d] = [d, siguiente, b, c];
    }
    return [a, b, c, d];
  }, true);
}
const inicial = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
const constantes = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
];
function sha256(bytes) {
  return hash(bytes, inicial.slice(), (w, estado) => {
    for (let i = 16; i < 64; i++) {
      const x = w[i - 15], y = w[i - 2];
      const s0 = rotar(x, 7) ^ rotar(x, 18) ^ (x >>> 3);
      const s1 = rotar(y, 17) ^ rotar(y, 19) ^ (y >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }
    let [a, b, c, d, e, f, g, h] = estado;
    for (let i = 0; i < 64; i++) {
      const s1 = rotar(e, 6) ^ rotar(e, 11) ^ rotar(e, 25);
      const s0 = rotar(a, 2) ^ rotar(a, 13) ^ rotar(a, 22);
      const t1 = h + s1 + ((e & f) ^ (~e & g)) + constantes[i] + w[i];
      const t2 = s0 + ((a & b) ^ (a & c) ^ (b & c));
      [a, b, c, d, e, f, g, h] = [(t1 + t2) | 0, a, b, c, (d + t1) | 0, e, f, g];
    }
    return [a, b, c, d, e, f, g, h];
  });
}
S.Hashes = { md5, sha256, hex };
})(globalThis.CR.Shell);
