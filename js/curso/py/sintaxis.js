(function () {
  'use strict';
  const { fallo, palabra, numero, tokens, leer } = typeof module !== 'undefined' ? require('./lexico') : window.CR.PyLexico;
  const reservada = /^(if|elif|else|and|or|not|in|while|for|break|continue|return|def|pass|True|False|None|as|assert|async|await|class|del|except|finally|from|global|import|is|lambda|nonlocal|raise|try|with|yield)$/;

  const precedencia = { or: 1, and: 2, '==': 4, '!=': 4, '<': 4, '>': 4, '<=': 4, '>=': 4, in: 4,
    'not in': 4, '+': 5, '-': 5, '*': 6, '/': 6, '//': 6, '%': 6, '**': 8 };
  const nodo = (tipo, partes = {}) => ({ tipo, ...partes });
  const decodificar = s => s.replace(/\\([nt\\'"])/g, (_, c) => ({ n: '\n', t: '\t' })[c] || c);
  class Expresiones {
    constructor(texto, linea, columna) {
      this.tokens = Array.isArray(texto) ? texto : tokens(texto, linea, columna);
      this.i = 0;
      this.linea = linea;
    }
    ver() { return this.tokens[this.i].valor; }
    tomar() { return this.tokens[this.i++]; }
    aceptar(s) { return this.ver() === s && Boolean(this.tomar()); }
    error(mensaje, original = 'invalid syntax') {
      fallo('SyntaxError', this.tokens[this.i]?.linea ?? this.linea, mensaje, original);
    }
    pedir(s) {
      if (!this.aceptar(s)) this.error('Se esperaba «' + s + '».', s === ':' ? "expected ':'" : 'invalid syntax');
    }
    nombre() {
      const s = this.ver();
      if (!palabra.test(s) || reservada.test(s)) this.error('Se esperaba un nombre.');
      return this.tomar().valor;
    }
    items(fin, leer) {
      const items = [];
      while (this.ver() !== fin) {
        items.push(leer());
        if (!this.aceptar(',')) break;
      }
      this.pedir(fin);
      return items;
    }
    literal(token) {
      const { contenido, partes: fragmentos } = token.cita;
      if (!fragmentos) return nodo('texto', { valor: decodificar(contenido) });
      const partes = fragmentos.map(p => {
        if (typeof p === 'string') return decodificar(p);
        const parser = new Expresiones(p.expresion, token.linea);
        const expr = parser.expr();
        parser.pedir('');
        return expr;
      });
      return nodo('fstring', { partes });
    }
    inicial() {
      const t = this.tomar();
      const s = t.valor;
      if (t.cita) return this.literal(t);
      if (numero.test(s)) {
        const flotante = /[.eE]/.test(s);
        if (!flotante && /^0+[^0]/.test(s)) this.error('Los enteros decimales no empiezan con un cero.');
        return nodo(flotante ? 'float' : 'int', { valor: flotante ? Number(s) : s });
      }
      if (s === 'True' || s === 'False' || s === 'None') return nodo('constante', { valor: { True: true, False: false, None: null }[s] });
      if (s === '(') {
        const expr = this.ver() === ')' ? nodo('tupla', { items: [] }) : this.secuencia([')']);
        this.pedir(')');
        return expr;
      }
      if (s === '[') return nodo('lista', { items: this.items(']', () => this.expr()) });
      if (s === '{') return nodo('dict', { items: this.items('}', () => {
        const clave = this.expr();
        this.pedir(':');
        return { clave, valor: this.expr() };
      }) });
      if (['+', '-', 'not'].includes(s)) return nodo('unario', { op: s, expr: this.expr(s === 'not' ? 4 : 7) });
      if (palabra.test(s) && !reservada.test(s)) return nodo('nombre', { nombre: s });
      this.error('Se esperaba una expresión.');
    }
    argumento() {
      if (this.tokens[this.i + 1]?.valor !== '=') return { valor: this.expr() };
      const nombre = this.nombre();
      this.pedir('=');
      return { nombre, valor: this.expr() };
    }
    postfijo(base) {
      if (this.aceptar('.')) return nodo('atributo', { base, nombre: this.nombre() });
      if (this.aceptar('(')) return nodo('llamada', { base, args: this.items(')', () => this.argumento()) });
      this.pedir('[');
      const inicio = this.ver() === ':' ? null : this.expr();
      const corte = this.aceptar(':');
      const fin = corte && ![']', ':'].includes(this.ver()) ? this.expr() : null;
      const paso = corte && this.aceptar(':') && this.ver() !== ']' ? this.expr() : null;
      this.pedir(']');
      return nodo(corte ? 'corte' : 'indice', { base, inicio, fin, paso });
    }
    secuencia(limites, leer = () => this.expr()) {
      const primero = leer();
      if (!this.aceptar(',')) return primero;
      const items = [primero];
      while (!limites.includes(this.ver())) {
        items.push(leer());
        if (!this.aceptar(',')) break;
      }
      return nodo('tupla', { items });
    }
    expr(minimo = 1) {
      let izq = this.inicial();
      let comparacion = null;
      while (['.', '(', '['].includes(this.ver())) izq = this.postfijo(izq);
      for (;;) {
        const op = this.ver() === 'not' && this.tokens[this.i + 1]?.valor === 'in' ? 'not in' : this.ver();
        const nivel = Object.hasOwn(precedencia, op) ? precedencia[op] : 0;
        if (!nivel || nivel < minimo) return izq;
        this.tomar();
        if (op === 'not in') this.tomar();
        const der = this.expr(op === '**' ? nivel : nivel + 1);
        if (nivel === 4) {
          if (!comparacion) comparacion = izq = nodo('comparacion', { izq, pares: [] });
          comparacion.pares.push({ op, der });
        } else {
          comparacion = null;
          izq = nodo('binario', { izq, op, der });
        }
      }
    }
  }

  function sencilla(p, contexto) {
    const tipo = p.ver();
    if (['pass', 'return', 'break', 'continue'].includes(tipo)) {
      p.tomar();
      if (tipo === 'return' && !contexto.funcion) p.error('return debe estar dentro de una función.');
      if (['break', 'continue'].includes(tipo) && !contexto.bucle) p.error(tipo + ' debe estar dentro de un bucle.');
      return nodo(tipo, { expr: tipo === 'return' && p.ver() ? p.secuencia(['']) : null });
    }
    if (tipo === 'import' || tipo === 'from') return importar(p);
    if (tipo === 'raise' || tipo === 'del') {
      p.tomar();
      return nodo(tipo, { expr: p.ver() ? p.expr() : null });
    }
    const destino = p.secuencia(['=', '']);
    const op = p.ver();
    if (!['=', '+=', '-=', '*=', '/='].includes(op)) return nodo('expr', { expr: destino });
    if (!asignable(destino) || (op !== '=' && destino.tipo === 'tupla')) p.error('No puedes asignar un valor aquí.');
    p.tomar();
    return nodo('asigna', { destino, op, expr: p.secuencia(['']) });
  }
  function asignable(n) {
    return ['nombre', 'indice'].includes(n.tipo) || (n.tipo === 'tupla' && n.items.every(asignable));
  }
  function importar(p) {
    const desde = p.tomar().valor === 'from' ? p.nombre() : null;
    if (desde) p.pedir('import');
    const nombres = p.items('', () => {
      const nombre = p.nombre();
      return { nombre, alias: p.aceptar('as') ? p.nombre() : nombre };
    });
    // El lector de líneas deja un único token de fin.
    p.i--;
    return nodo('import', { desde, nombres });
  }
  function cabecera(p, tipo) {
    if (tipo === 'for') {
      const destino = p.secuencia(['in'], () => p.expr(5));
      if (!asignable(destino)) p.error('No puedes asignar un valor aquí.');
      p.pedir('in');
      return { destino, expr: p.secuencia([':']) };
    }
    if (tipo === 'def') {
      const nombre = p.nombre();
      p.pedir('(');
      const params = p.items(')', () => ({ nombre: p.nombre(), defecto: p.aceptar('=') ? p.expr() : null }));
      if (new Set(params.map(param => param.nombre)).size !== params.length ||
          params.some((param, i) => !param.defecto && params.slice(0, i).some(prev => prev.defecto))) {
        p.error('Revisa los nombres y el orden de los parámetros.');
      }
      return { nombre, params };
    }
    if (tipo === 'except') {
      const expr = p.ver() === ':' ? null : p.expr();
      return { expr, nombre: p.aceptar('as') ? p.nombre() : null };
    }
    return ['else', 'try', 'finally'].includes(tipo) ? {} : { expr: p.expr() };
  }
  function analizar(codigo) {
    const lineas = leer(codigo);
    let i = 0;
    function instruccion(contexto) {
      const { partes: tokens, linea } = lineas[i++];
      const p = new Expresiones(tokens, linea);
      const tipo = p.ver();
      if (!['if', 'elif', 'else', 'for', 'while', 'def', 'try', 'except', 'finally'].includes(tipo)) {
        const s = sencilla(p, contexto);
        p.pedir('');
        return { ...s, linea };
      }
      p.tomar();
      const partes = cabecera(p, tipo);
      p.pedir(':');
      const dentro = tipo === 'def' ? { funcion: true, bucle: false } :
        { ...contexto, bucle: contexto.bucle || tipo === 'for' || tipo === 'while' };
      let cuerpo;
      if (p.ver()) {
        cuerpo = [{ ...sencilla(p, dentro), linea }];
        p.pedir('');
      } else {
        if (lineas[i]?.tipo !== 'INDENT') fallo('IndentationError', lineas[i]?.linea ?? linea, 'Esperaba una línea con sangría después de «:».');
        i++;
        cuerpo = bloque(dentro);
        i++;
      }
      return nodo(tipo, { linea, cuerpo, ...partes });
    }
    function bloque(contexto) {
      const partes = [];
      while (lineas[i] && lineas[i].tipo !== 'DEDENT') {
        if (lineas[i].tipo === 'INDENT') fallo('IndentationError', lineas[i].linea, 'Esta sangría no coincide con ninguna anterior.');
        const s = instruccion(contexto);
        if (['elif', 'else', 'except', 'finally'].includes(s.tipo)) {
          agregarRama(partes.at(-1), s);
        } else {
          if (['if', 'try'].includes(s.tipo)) s.ramas = [];
          partes.push(s);
        }
      }
      for (const s of partes) if (s.tipo === 'try' && !s.ramas.length) fallo('SyntaxError', s.linea, 'Falta except o finally.');
      return partes;
    }
    return bloque({});
  }
  function agregarRama(previo, rama) {
    const ultima = previo?.ramas?.at(-1);
    const permitida = previo?.tipo === 'if' && ['elif', 'else'].includes(rama.tipo) && ultima?.tipo !== 'else' ||
      previo?.tipo === 'try' && ultima?.tipo !== 'finally' && (
        rama.tipo === 'finally' || rama.tipo === 'else' && ultima?.tipo === 'except' ||
        rama.tipo === 'except' && (!ultima || ultima.tipo === 'except' && ultima.expr));
    if (!permitida) fallo('SyntaxError', rama.linea, 'Esta rama no corresponde al bloque anterior.');
    previo.ramas.push(rama);
  }
  const Sintaxis = { analizar, fallo };
  if (typeof module !== 'undefined') module.exports = Sintaxis;
  else (window.CR ||= {}).PySintaxis = Sintaxis;
})();
