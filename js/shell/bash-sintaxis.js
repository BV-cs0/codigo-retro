(function (S) {
'use strict';
const traducir = typeof module !== 'undefined' ? require('../comun/idioma').t : globalThis.CR.t;
const palabra = t => t?.partes?.length === 1 && t.partes[0].modo === 'libre' ? t.partes[0].texto : t?.valor;
class Parser extends S.Analizador.Analizador {
  es(...ops) { return ops.includes(palabra(this.mirar())); }
  exigir(...ops) {
    if (!this.mirar()) throw new Error('syntax error: unexpected end of file');
    if (!this.es(...ops)) throw new Error("syntax error near unexpected token `" + palabra(this.mirar()) + "'");
    return this.tomar();
  }
  saltar() { while (this.es(';')) this.tomar(); }
  bloque(...hasta) { this.saltar(); return this.lista(t => hasta.includes(palabra(t))); }
  ramas() {
    const ramas = [];
    do {
      this.tomar();
      const condicion = this.bloque('then');
      this.exigir('then');
      ramas.push({ condicion, cuerpo: this.bloque('elif', 'else', 'fi') });
    } while (this.es('elif'));
    let resto;
    if (this.es('else')) { this.tomar(); resto = this.bloque('fi'); }
    this.exigir('fi');
    return { tipo: 'ramas', ramas, resto };
  }
  bucle() {
    const modo = palabra(this.tomar());
    const nodo = { tipo: 'bucle', modo };
    if (modo !== 'for') nodo.condicion = this.bloque('do');
    else {
      const variable = this.tomar();
      if (variable?.tipo === 'aritmetica') {
        nodo.formulas = variable.texto.split(';');
        if (nodo.formulas.length !== 3) throw new Error(traducir("shell.cabecera_aritmetica_incorrecta"));
      } else {
        nodo.variable = palabra(variable);
        if (!/^[A-Za-z_]\w*$/.test(nodo.variable || '')) throw new Error(traducir("shell.variable_de_bucle_incorrecta"));
        if (this.es('in')) {
          this.tomar();
          nodo.valores = [];
          while (this.mirar()?.tipo === 'palabra') nodo.valores.push(this.tomar());
        }
      }
      this.saltar();
    }
    this.exigir('do');
    nodo.cuerpo = this.bloque('done');
    this.exigir('done');
    if (['<', '<<'].includes(this.mirar()?.valor)) {
      const op = this.tomar();
      nodo.entrada = { ...op, destino: this.tomar() };
      if (nodo.entrada.destino?.tipo !== 'palabra') throw new Error(traducir("shell.falta_el_destino_de_la"));
    }
    return nodo;
  }
  casos() {
    this.tomar();
    const selector = this.tomar();
    this.saltar(); this.exigir('in'); this.saltar();
    const opciones = [];
    while (!this.es('esac')) {
      if (this.es('(')) this.tomar();
      const patrones = [];
      do {
        if (patrones.length) this.tomar();
        const t = this.tomar();
        if (t?.tipo !== 'palabra') throw new Error(traducir("shell.falta_un_patron_de_case"));
        patrones.push(t);
      } while (this.es('|'));
      this.exigir(')');
      opciones.push({ patrones, cuerpo: this.bloque(';;', 'esac') });
      if (!this.es('esac')) this.exigir(';;');
      this.saltar();
    }
    this.tomar();
    return { tipo: 'casos', selector, opciones };
  }
  funcion() {
    if (this.es('function')) this.tomar();
    const nombre = palabra(this.tomar());
    if (!/^[A-Za-z_]\w*$/.test(nombre || '')) throw new Error(traducir("shell.nombre_de_funcion_incorrecto"));
    if (this.es('(')) { this.tomar(); this.exigir(')'); }
    this.saltar(); this.exigir('{');
    const cuerpo = this.bloque('}');
    this.exigir('}');
    return { tipo: 'funcion', nombre, cuerpo };
  }
  comando() {
    const token = this.mirar();
    if (this.es('if')) return this.ramas();
    if (this.es('for', 'while', 'until')) return this.bucle();
    if (this.es('case')) return this.casos();
    if (this.es('select')) throw Object.assign(new Error(traducir("shell.select_no_esta_en_este")), { linea: token.linea });
    if (this.tokens[this.indice + 1]?.valor === '(' && /=$/.test(palabra(token) ?? ''))
      throw Object.assign(new Error(traducir("shell.los_arrays_no_estan_en")), { linea: token.linea });
    if (this.es('function') || this.tokens[this.indice + 1]?.valor === '(') return this.funcion();
    if (['aritmetica', 'condicion'].includes(token.tipo)) return this.tomar();
    if (this.es('then', 'elif', 'else', 'fi', 'do', 'done', 'esac', '}')) {
      throw new Error("syntax error near unexpected token `" + palabra(token) + "'");
    }
    return this.simple();
  }
}
function analizar(texto) {
  const tokens = S.Lexico.tokenizar(texto.replace(/\r\n/g, '\n'), true);
  const excluido = tokens.find(t => ['&', '<<<'].includes(t.valor));
  if (excluido) throw new Error(excluido.valor + traducir("shell.no_esta_en_este_simulador_2"));
  return new Parser(tokens, []).bloque();
}
S.BashSintaxis = { analizar };
})(globalThis.CR.Shell);
