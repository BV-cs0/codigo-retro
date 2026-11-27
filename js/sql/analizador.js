(function () {
  'use strict';
  const I = CR.sqlInterno;
  const reservadas = new Set('SELECT FROM WHERE GROUP BY HAVING ORDER LIMIT OFFSET UNION ALL DISTINCT AS JOIN INNER LEFT RIGHT FULL OUTER CROSS ON USING ASC DESC AND OR NOT IS NULL IN BETWEEN LIKE CASE WHEN THEN ELSE END VALUES SET DEFAULT PRIMARY KEY UNIQUE COLLATE REFERENCES RETURNING'.split(' '));
  const precedencia = { OR: 1, AND: 2, IN: 4, BETWEEN: 4, LIKE: 4, IS: 4, '=': 4, '==': 4, '!=': 4, '<>': 4, '<': 5, '<=': 5, '>': 5, '>=': 5, '+': 6, '-': 6, '*': 7, '/': 7, '%': 7, '||': 8 };
  class Parser {
    constructor(sql) {
      this.sql = sql;
      this.tokens = I.tokenizar(sql);
      this.pos = 0;
      this.bindings = 0;
      this.profundidad = 0;
      this.marcas = new Set();
    }
    get actual() { return this.tokens[this.pos]; }
    get anterior() { return this.tokens[this.pos - 1]; }
    es(clave) { return this.actual.clave === clave; }
    toma() { return this.tokens[this.pos++]; }
    acepta(clave) { return this.es(clave) && this.toma(); }
    exige(clave) { return this.acepta(clave) || this.sintaxis(); }
    sintaxis(t = this.actual) {
      I.fallo(t.tipo === 'fin' ? 'incomplete input' : 'near "' + t.bruto + '": syntax error', t, 'sintaxis');
    }
    noSoportado(nombre, token = this.actual) { I.fallo(nombre, token, 'noSoportado', [nombre]); }
    esNombre() { return this.actual.tipo === 'id' && !reservadas.has(this.actual.clave); }
    nombre() { return this.esNombre() ? this.toma().valor : this.sintaxis(); }
    lista(leer) {
      const resultado = [leer()];
      while (this.acepta(',')) resultado.push(leer());
      return resultado;
    }
    alias() {
      if (this.acepta('AS')) return { nombre: this.nombre(), explicito: true };
      if (this.esNombre()) return { nombre: this.nombre(), explicito: false };
      return null;
    }
    expresion(minimo = 1) {
      const token = this.toma();
      let nodo = this.primaria(token);
      while (true) {
        const negado = this.es('NOT');
        const op = negado ? this.tokens[this.pos + 1].clave : this.actual.clave;
        if (!Object.hasOwn(precedencia, op) || precedencia[op] < minimo ||
          (negado && !['IN', 'BETWEEN', 'LIKE'].includes(op))) return nodo;
        if (negado) this.toma();
        const operador = this.toma();
        nodo = this.binaria(nodo, op, operador, negado);
      }
    }
    primaria(t) {
      const { clave, valor, tipo } = t;
      if (['integer', 'real', 'text'].includes(tipo)) return { clase: 'literal', tipo, valor, t };
      if (clave === 'NULL') return { clase: 'literal', tipo: 'null', valor: null, t };
      if (clave === '?') {
        this.marcas.add('parametros');
        return { clase: 'parametro', indice: this.bindings++, t };
      }
      if (['+', '-', 'NOT'].includes(clave)) return { clase: 'unaria', op: clave, expr: this.expresion(clave === 'NOT' ? 3 : 9), t };
      if (clave === 'CASE') return this.caso(t);
      if (clave === 'EXISTS') return { clase: 'existe', consulta: this.subconsulta(), t };
      if (clave === '(') {
        const nodo = this.es('SELECT') ? { clase: 'escalar', consulta: this.selectAnidado(), t } : this.expresion();
        this.exige(')');
        return nodo;
      }
      if (tipo !== 'id' || reservadas.has(clave)) return this.sintaxis(t);
      if (this.acepta('(')) return this.llamada(t);
      if (clave === 'TRUE' || clave === 'FALSE') return { clase: 'literal', tipo: 'integer', valor: clave === 'TRUE' ? 1 : 0, t };
      if (this.acepta('.')) return { clase: 'columna', tabla: valor, nombre: this.nombre(), t };
      return { clase: 'columna', nombre: valor, t };
    }
    binaria(izq, op, t, negado) {
      const nodo = { clase: 'binaria', izq, op, t, negado };
      if (['AND', 'OR', 'IN', 'BETWEEN', 'LIKE'].includes(op)) this.marcas.add(op.toLowerCase());
      if (op === 'IS') {
        this.marcas.add('null');
        nodo.negado = Boolean(this.acepta('NOT'));
      }
      if (op === 'IN') {
        this.exige('(');
        if (this.es('SELECT')) nodo.consulta = this.selectAnidado();
        else nodo.lista = this.es(')') ? [] : this.lista(() => this.expresion());
        this.exige(')');
      } else {
        nodo.der = this.expresion(precedencia[op] + 1);
        if (op === 'BETWEEN') {
          this.exige('AND');
          nodo.alto = this.expresion(5);
        }
      }
      return nodo;
    }
    caso(t) {
      const ramas = [];
      const base = this.es('WHEN') ? null : this.expresion();
      this.exige('WHEN');
      do {
        const cuando = this.expresion();
        this.exige('THEN');
        ramas.push({ cuando, valor: this.expresion() });
      } while (this.acepta('WHEN'));
      const otro = this.acepta('ELSE') ? this.expresion() : null;
      this.exige('END');
      return { clase: 'caso', base, ramas, otro, t };
    }
    llamada(t) {
      const nombre = t.valor.toUpperCase();
      const distinto = Boolean(this.acepta('DISTINCT'));
      const estrella = Boolean(this.acepta('*'));
      const args = estrella || this.es(')') ? [] : this.lista(() => this.expresion());
      this.exige(')');
      if (this.es('OVER')) this.noSoportado('OVER');
      this.marcas.add('funcion');
      this.marcas.add(nombre.toLowerCase());
      return { clase: 'funcion', nombre, distinto, estrella, args, t };
    }
    subconsulta() {
      this.exige('(');
      const consulta = this.selectAnidado();
      this.exige(')');
      return consulta;
    }
    selectAnidado() {
      this.marcas.add('subconsulta');
      if (++this.profundidad > 50) I.limite(this.actual);
      const consulta = this.select();
      this.profundidad--;
      return consulta;
    }
    tramo(destino, clave, leer) {
      const inicio = this.anterior.inicio;
      const valor = leer();
      destino.rangos[clave] = { inicio, fin: this.anterior.fin };
      this.marcas.add(clave.toLowerCase());
      return valor;
    }
    select() {
      const ramas = [this.bloqueSelect()];
      const uniones = [];
      while (this.acepta('UNION')) {
        uniones.push(Boolean(this.acepta('ALL')));
        ramas.push(this.bloqueSelect());
      }
      const q = { clase: 'select', ramas, uniones, rangos: ramas.at(-1).rangos };
      if (this.acepta('ORDER')) q.orden = this.tramo(q, 'ORDER BY', () => {
        this.marcas.add('order');
        this.exige('BY');
        return this.lista(() => {
          const inicio = this.actual.inicio;
          const expr = this.expresion();
          const etiqueta = this.sql.slice(inicio, this.anterior.fin);
          const desc = Boolean(this.acepta('DESC'));
          if (!desc) this.acepta('ASC');
          return { expr, desc, etiqueta };
        });
      });
      if (this.acepta('LIMIT')) q.limite = this.tramo(q, 'LIMIT', () => {
        let cantidad = this.expresion(), offset;
        if (this.acepta('OFFSET')) offset = this.expresion();
        else if (this.acepta(',')) [offset, cantidad] = [cantidad, this.expresion()];
        return { cantidad, offset };
      });
      return q;
    }
    bloqueSelect() {
      this.exige('SELECT');
      const q = { rangos: {} };
      q.campos = this.tramo(q, 'SELECT', () => {
        q.distinto = Boolean(this.acepta('DISTINCT'));
        if (q.distinto) this.marcas.add('distinct');
        else this.acepta('ALL');
        return this.lista(() => this.campo());
      });
      if (q.distinto) q.rangos.DISTINCT = q.rangos.SELECT;
      if (this.acepta('FROM')) q.fuentes = this.tramo(q, 'FROM', () => this.fuentes());
      if (this.acepta('WHERE')) q.filtro = this.tramo(q, 'WHERE', () => this.expresion());
      if (this.acepta('GROUP')) q.grupos = this.tramo(q, 'GROUP BY', () => {
        this.marcas.add('group');
        this.exige('BY');
        q.etiquetasGrupo = [];
        return this.lista(() => {
          const inicio = this.actual.inicio;
          const expr = this.expresion();
          q.etiquetasGrupo.push(this.sql.slice(inicio, this.anterior.fin));
          return expr;
        });
      });
      if (this.acepta('HAVING')) q.having = this.tramo(q, 'HAVING', () => this.expresion());
      return q;
    }
    campo() {
      const inicio = this.actual.inicio;
      if (this.acepta('*')) return { todo: true };
      if (this.esNombre() && this.tokens[this.pos + 1].clave === '.' && this.tokens[this.pos + 2].clave === '*') {
        const tabla = this.nombre();
        this.pos += 2;
        return { todo: true, tabla };
      }
      const expr = this.expresion();
      const etiqueta = this.sql.slice(inicio, this.anterior.fin);
      const alias = this.alias();
      if (alias) this.marcas.add('alias');
      return { expr, etiqueta, alias };
    }
    fuente() {
      const t = this.actual;
      const tabla = this.nombre();
      return { tabla, t, alias: this.alias()?.nombre };
    }
    fuentes() {
      const fuentes = [this.fuente()];
      while (['JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'CROSS', ','].includes(this.actual.clave)) {
        const tipo = this.toma().clave;
        if (['RIGHT', 'FULL'].includes(tipo)) this.noSoportado(tipo + ' JOIN', this.anterior);
        if (tipo === 'LEFT') this.acepta('OUTER');
        if (!['JOIN', ','].includes(tipo)) this.exige('JOIN');
        const fuente = this.fuente();
        fuente.izquierda = tipo === 'LEFT';
        if (this.acepta('ON')) fuente.on = this.expresion();
        if (this.es('USING')) this.noSoportado('USING');
        this.marcas.add('join');
        if (fuente.izquierda) this.marcas.add('left');
        fuentes.push(fuente);
      }
      return fuentes;
    }
    sentencia() {
      const t = this.actual;
      switch (t.clave) {
        case 'SELECT': return this.select();
        case 'CREATE': case 'DROP': case 'INSERT': case 'UPDATE': case 'DELETE':
          this.toma();
          this.marcas.add(t.clave.toLowerCase());
          return I.analizarCambio(this, t);
        case 'ALTER': this.noSoportado('ALTER TABLE', t); break;
        case 'BEGIN': case 'COMMIT': case 'ROLLBACK': case 'SAVEPOINT': case 'RELEASE':
        case 'WITH': case 'REPLACE': case 'PRAGMA': case 'ATTACH': case 'DETACH':
          this.noSoportado(t.clave, t); break;
        default: this.sintaxis();
      }
    }
    siguiente() {
      while (this.acepta(';')) { /* Sentencias vacías. */ }
      if (this.actual.tipo === 'fin') return null;
      this.bindings = 0;
      const nodo = this.sentencia();
      if (['RETURNING', 'COLLATE'].includes(this.actual.clave)) this.noSoportado(this.actual.clave);
      if (this.actual.tipo !== 'fin') this.exige(';');
      return nodo;
    }
  }
  I.Parser = Parser;
})();
