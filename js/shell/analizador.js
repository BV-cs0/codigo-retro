(function (CR) {
'use strict';
const traducir = typeof module !== 'undefined' ? require('../comun/idioma').t : globalThis.CR.t;
const Shell = CR.Shell = CR.Shell || {};
const Lexico = typeof module !== 'undefined' ? require('./lexico') : Shell.Lexico;
const redirecciones = ['<', '>', '>>', '2>', '<<'];
const separadores = [';', '&&', '||'];
class Analizador {
  constructor(tokens, reglas) {
    this.tokens = tokens;
    this.reglas = reglas;
    this.indice = 0;
  }
  mirar() { return this.tokens[this.indice]; }
  tomar() { return this.tokens[this.indice++]; }
  simple() {
    const linea = this.mirar()?.linea;
    const palabras = [];
    const redirs = [];
    const asignaciones = [];
    while (this.mirar()) {
      const token = this.mirar();
      if (redirecciones.includes(token.valor)) {
        this.tomar();
        const destino = this.tomar();
        if (destino?.tipo !== 'palabra') throw new Error(traducir("shell.falta_el_destino_de_la"));
        redirs.push({ operador: token.valor, destino, documento: token.documento, literal: token.literal });
      } else if (token.tipo === 'palabra') {
        const inicio = token.partes[0];
        const asignacion = !palabras.length && inicio.modo === 'libre' && inicio.texto.match(/^([A-Za-z_]\w*)=/);
        if (asignacion) asignaciones.push({ nombre: asignacion[1], partes: [
          { ...inicio, texto: inicio.texto.slice(asignacion[0].length) }, ...token.partes.slice(1)
        ] });
        else palabras.push(token);
        this.tomar();
      } else break;
    }
    if (!palabras.length && !redirs.length && !asignaciones.length) throw new Error(traducir("shell.falta_un_comando"));
    return { tipo: 'simple', palabras, redirecciones: redirs, asignaciones, linea };
  }
  comando() {
    // Una regla compuesta consume su cabecera y puede analizar listas hasta una palabra reservada.
    for (const regla of this.reglas) {
      const nodo = regla(this);
      if (nodo) return nodo;
    }
    return this.simple();
  }
  tuberia() {
    const etapas = [this.comando()];
    while (this.mirar()?.valor === '|') {
      this.tomar();
      if (etapas.length >= 10) throw new Error(traducir("shell.una_tuberia_admite_hasta_10"));
      etapas.push(this.comando());
    }
    return etapas.length === 1 ? etapas[0] : { tipo: 'tuberia', etapas };
  }
  lista(termina = () => false) {
    const pasos = [];
    let enlace = ';';
    while (this.mirar() && !termina(this.mirar())) {
      pasos.push({ enlace, nodo: this.tuberia() });
      const token = this.mirar();
      if (!token || termina(token)) break;
      enlace = token.valor;
      if (enlace === '&') throw new Error(traducir("shell.no_esta_en_este_simulador"));
      if (!separadores.includes(enlace)) throw new Error(traducir("shell.separador_inesperado"));
      this.tomar();
      if (enlace !== ';' && (!this.mirar() || termina(this.mirar()))) throw new Error(traducir("shell.falta_un_comando"));
    }
    return { tipo: 'lista', pasos };
  }
}
function analizar(linea, reglas = [], tokenizar = Lexico.tokenizar) {
  return new Analizador(tokenizar(linea), reglas).lista();
}
Shell.Analizador = { analizar, Analizador };
if (typeof module !== 'undefined') module.exports = CR.Shell.Analizador;
})(globalThis.CR = globalThis.CR || {});

