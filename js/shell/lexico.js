(function (CR) {
'use strict';
const Shell = CR.Shell = CR.Shell || {};
const operadores = ['&&', '||', '>>', '2>', '|', ';', '<', '>', '&'];
function sustitucion(texto, i) {
  if (texto[i] === '`') {
    const fin = texto.indexOf('`', i + 1);
    if (fin < 0) throw new Error('Sustitución sin cerrar.');
    return fin + 1;
  }
  if (texto.startsWith('${', i)) {
    const fin = texto.indexOf('}', i + 2);
    if (fin < 0) throw new Error('Expansión sin cerrar.');
    return fin + 1;
  }
  if (!texto.startsWith('$(', i)) return i;
  let nivel = 1, comilla = '';
  for (let j = i + 2; j < texto.length; j++) {
    const c = texto[j];
    if (c === '\\' && comilla !== "'") { j++; continue; }
    if (comilla) { if (c === comilla) comilla = ''; continue; }
    if (c === '"' || c === "'") comilla = c;
    else if (c === '(') nivel++;
    else if (c === ')' && !--nivel) return j + 1;
  }
  throw new Error('Sustitución sin cerrar.');
}
class Tokenizador {
  constructor(texto, script) {
    Object.assign(this, { texto, script, tokens: [], documentos: [], partes: [], i: 0, numero: 1 });
    this.signos = script ? [';;', '<<<', '<<', '(', ')', ...operadores] : operadores;
  }
  agregar(texto, modo) { this.partes.push({ texto, modo }); }
  palabra() {
    if (this.partes.length) this.tokens.push({ tipo: 'palabra', partes: this.partes, linea: this.numero,
      original: this.texto.slice(this.inicioPalabra, this.i) });
    this.partes = [];
  }
  mover(fin) {
    const tramo = this.texto.slice(this.i, fin);
    this.numero += (tramo.match(/\n/g) || []).length;
    this.i = fin;
    return tramo;
  }
  operador(valor) {
    this.palabra();
    const token = { tipo: 'operador', valor, linea: this.numero };
    if (valor === '<<') this.documentos.push(token);
    this.tokens.push(token);
  }
  salto() {
    this.palabra();
    if (this.tokens.length && ![';', ';;', '|', '&&', '||'].includes(this.tokens.at(-1).valor)) this.operador(';');
    this.mover(this.i + 1);
    for (const doc of this.documentos.splice(0)) this.documento(doc);
  }
  documento(doc) {
    const destino = this.tokens[this.tokens.indexOf(doc) + 1];
    if (destino?.tipo !== 'palabra') throw new Error('Falta el delimitador del here-doc.');
    const marca = destino.partes.map(p => p.texto).join('');
    doc.documento = '';
    doc.literal = destino.partes.some(p => p.modo !== 'libre');
    while (this.i < this.texto.length) {
      const fin = this.texto.indexOf('\n', this.i);
      const fila = this.mover(fin < 0 ? this.texto.length : fin + 1);
      if (fila.replace(/\n$/, '') === marca) return;
      doc.documento += fila;
    }
    throw new Error('Falta el delimitador final del here-doc: ' + marca);
  }
  entreComillas(cierre) {
    const modo = cierre === '"' ? 'doble' : 'literal';
    const inicio = this.numero;
    let texto = '';
    this.i++;
    while (this.i < this.texto.length && this.texto[this.i] !== cierre) {
      const c = this.texto[this.i], siguiente = this.texto[this.i + 1];
      if (modo === 'doble' && c === '\\' && siguiente === '\n') this.mover(this.i + 2);
      else if (modo === 'doble' && c === '\\' && /["\\$\x60]/.test(siguiente || '')) {
        if (texto) this.agregar(texto, modo);
        this.agregar(siguiente, 'literal');
        texto = '';
        this.i += 2;
      } else {
        const fin = modo === 'doble' ? sustitucion(this.texto, this.i) : this.i;
        texto += this.mover(Math.max(this.i + 1, fin));
      }
    }
    if (this.i === this.texto.length) {
      const mensaje = this.script ? 'unexpected EOF while looking for matching \x60' + cierre + "'" : 'Comillas sin cerrar.';
      throw Object.assign(new Error(mensaje), { linea: inicio });
    }
    this.agregar(texto, modo);
    this.i++;
  }
  finCondicion() {
    let cita = '';
    for (let j = this.i + 2; j < this.texto.length; j++) {
      const c = this.texto[j];
      if (c === '\\' && cita !== "'") { j++; continue; }
      if (cita) { if (c === cita) cita = ''; continue; }
      const fin = sustitucion(this.texto, j);
      if (fin > j) { j = fin - 1; continue; }
      if (c === '"' || c === "'") cita = c;
      else if (/\s/.test(this.texto[j - 1]) && this.texto.startsWith(']]', j)) return j + 2;
    }
    throw new Error('syntax error: unexpected end of file');
  }
  compuesto() {
    if (!this.script || this.partes.length) return false;
    const arit = this.texto.startsWith('((', this.i);
    if (!arit && !/^\[\[\s/.test(this.texto.slice(this.i, this.i + 3))) return false;
    const fin = arit ? this.i + sustitucion('$' + this.texto.slice(this.i), 0) - 1 : this.finCondicion();
    this.tokens.push({ tipo: arit ? 'aritmetica' : 'condicion', texto: this.texto.slice(this.i + 2, fin - 2),
      linea: this.numero });
    this.mover(fin);
    return true;
  }
  libre(fin) {
    const texto = this.mover(fin);
    const anterior = this.partes.at(-1);
    if (anterior?.modo === 'libre') anterior.texto += texto;
    else this.agregar(texto, 'libre');
  }
  siguiente() {
    const c = this.texto[this.i];
    if (this.script && c === '\n') { this.salto(); return; }
    if (/\s/.test(c)) { this.palabra(); this.i++; return; }
    if (c === '#' && !this.partes.length) {
      const salto = this.texto.indexOf('\n', this.i);
      this.i = this.script && salto >= 0 ? salto : this.texto.length;
      return;
    }
    if (this.compuesto()) return;
    const op = this.signos.find(s => this.texto.startsWith(s, this.i) && (s !== '2>' || !this.partes.length));
    if (op) { this.operador(op); this.i += op.length; return; }
    if (this.script && /^\$['"!$-]/.test(this.texto.slice(this.i, this.i + 2)))
      throw Object.assign(new Error('Expansión fuera del subconjunto admitido.'), { linea: this.numero });
    if (!this.partes.length) this.inicioPalabra = this.i;
    const fin = sustitucion(this.texto, this.i);
    if (fin > this.i) this.libre(fin);
    else if (c === '"' || c === "'") this.entreComillas(c);
    else if (c === '\\') {
      if (++this.i === this.texto.length) throw new Error('Escape incompleto.');
      const letra = this.mover(this.i + 1);
      if (letra !== '\n') this.agregar(letra, 'literal');
    } else this.libre(this.i + 1);
  }
}
function tokenizar(texto, script = false) {
  const t = new Tokenizador(texto, script);
  while (t.i < texto.length) t.siguiente();
  t.palabra();
  if (t.documentos.length) throw new Error('Falta el cuerpo del here-doc.');
  return t.tokens;
}
Shell.Lexico = { tokenizar, sustitucion };
if (typeof module !== 'undefined') module.exports = CR.Shell.Lexico;
})(globalThis.CR = globalThis.CR || {});

