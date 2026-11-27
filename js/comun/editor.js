(function () {
  'use strict';
  const traducir = typeof module !== 'undefined' ? require('./idioma').t : globalThis.CR.t;
  const palabra = /^(for|in|range|if|else|not|def)$/;

  const palabraCurso = /^(elif|while|break|continue|return|True|False|None|and|or|pass|print|len|try|except|finally|raise|input|import|from|as|del)$/;
  const tokensCurso = /#.*|f?(?:"(?:\\.|[^"\\])*"?|'(?:\\.|[^'\\])*'?)|[\p{L}_][\p{L}\p{N}_]*|\d+|[^]/gu;
  const tokensBash = /#.*|"(?:\\.|[^"\\])*"?|'[^']*'?|\$(?:\{[^}]*\}|[A-Za-z_]\w*|[0-9@*?#])|[A-Za-z_]\w*|\d+|[^]/g;
  const palabraBash = /^(if|then|elif|else|fi|case|in|esac|for|while|until|do|done|function|local|return|break|continue)$/;

  const tokensSQL = /--.*|\/\*[^]*?\*\/|\/\*[^]*|'(?:''|[^'])*'?|"(?:""|[^"])*"?|(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?|[\p{L}_][\p{L}\p{N}_]*|[^]/giu;
  const palabraSQL = /^(SELECT|FROM|WHERE|AS|GROUP|BY|HAVING|ORDER|ASC|DESC|LIMIT|OFFSET|DISTINCT|JOIN|INNER|LEFT|OUTER|ON|UNION|ALL|AND|OR|NOT|IS|NULL|IN|BETWEEN|LIKE|CASE|WHEN|THEN|ELSE|END|EXISTS|CREATE|DROP|TABLE|IF|INTEGER|REAL|TEXT|PRIMARY|KEY|UNIQUE|DEFAULT|INSERT|INTO|VALUES|UPDATE|SET|DELETE)$/i;
  const funcionSQL = /^(COUNT|SUM|AVG|MIN|MAX|UPPER|LOWER|LENGTH|ROUND|ABS|COALESCE|IFNULL|SUBSTR|TRIM|REPLACE)$/i;

  function filaSQL(piezas, rango, inicio) {
    const fila = document.createElement('span');
    fila.className = 'fila';
    for (const { token, clase } of piezas || []) {
      const cortes = [0, ...[rango?.inicio, rango?.fin].map(n => n - inicio)
        .filter(n => n > 0 && n < token.length), token.length];
      for (let i = 1; i < cortes.length; i++) {
        const pieza = document.createElement('span');
        pieza.textContent = token.slice(cortes[i - 1], cortes[i]);
        const activo = rango && inicio + cortes[i - 1] >= rango.inicio && inicio + cortes[i] <= rango.fin;
        pieza.className = clase + (activo ? ' traza-activa' : '');
        fila.append(pieza);
      }
      inicio += token.length;
    }
    fila.append('\u200b');
    return fila;
  }

  function piezasSQL(texto) {
    const filas = [[]];
    for (const token of texto.match(tokensSQL) || []) {
      let clase = '';
      if (/^(--|\/\*)/.test(token)) clase = 'comentario';
      else if (/^['"]/.test(token)) clase = 'cadena';
      else if (palabraSQL.test(token)) clase = 'palabra';
      else if (funcionSQL.test(token)) clase = 'orden';
      else if (/^(?:\d|\.\d)/.test(token)) clase = 'numero';
      token.split('\n').forEach((trozo, i) => {
        if (i) filas.push([]);
        if (trozo) filas.at(-1).push({ token: trozo, clase });
      });
    }
    return filas;
  }

  function filaColoreada(texto, ordenes, curso) {
    const fila = document.createElement('span');
    fila.className = 'fila';
    const bash = curso === 'bash';
    const tokens = texto.match(bash ? tokensBash : curso ? tokensCurso : /#.*|[A-Za-z_][A-Za-z_0-9]*|\d+|[^]/g) || [];
    for (const token of tokens) {
      const pieza = document.createElement('span');
      pieza.textContent = token;
      if (token.startsWith('#')) pieza.className = 'comentario';
      else if (curso && /^f?["']/.test(token)) pieza.className = 'cadena';
      else if (bash ? palabraBash.test(token) || token.startsWith('$') : palabra.test(token) || (curso && palabraCurso.test(token)))
        pieza.className = 'palabra';
      else if (/^\d+$/.test(token)) pieza.className = 'numero';
      else if (ordenes.has(token)) pieza.className = 'orden';
      fila.append(pieza);
    }
    fila.append('\u200b');
    return fila;
  }

  function pintarFilas(entrada, espejo, numeros, ordenes, linea, clase, curso, rango) {
    const vista = document.createDocumentFragment();
    const margen = document.createDocumentFragment();
    const sql = curso === 'sql' ? piezasSQL(entrada.value) : null;
    let inicio = 0;
    entrada.value.split('\n').forEach((texto, i) => {
      const fila = sql ? filaSQL(sql[i], rango, inicio) : filaColoreada(texto, ordenes, curso);
      inicio += texto.length + 1;
      const numero = document.createElement('span');
      if (i + 1 === linea) fila.classList.add(clase);
      numero.textContent = i + 1;
      vista.append(fila);
      margen.append(numero);
    });
    espejo.replaceChildren(vista);
    numeros.replaceChildren(margen);
  }

  function conectarTeclado(entrada, editar) {
    let salir = false;
    entrada.addEventListener('blur', () => { salir = false; });
    entrada.addEventListener('keydown', evento => {
      if (evento.key === 'Escape' && !entrada.readOnly) {
        salir = true;
        return;
      }
      if (entrada.readOnly || evento.ctrlKey || evento.altKey || evento.metaKey) return;
      if (evento.key === 'Tab' && salir) {
        salir = false;
        return;
      }
      salir = false;
      if (evento.key !== 'Tab' && evento.key !== 'Enter') return;
      evento.preventDefault();
      aplicarSangria(entrada, evento);
      editar();
    });
  }

  function aplicarSangria(entrada, evento) {
    const inicio = entrada.selectionStart;
    const fin = entrada.selectionEnd;
    const lineaInicio = inicio === 0 ? 0 : entrada.value.lastIndexOf('\n', inicio - 1) + 1;
    const antes = entrada.value.slice(lineaInicio, inicio);
    if (evento.key === 'Enter') {
      const sangria = antes.match(/^[ \t]*/)[0];
      const paso = sangria.startsWith('\t') ? '\t' : '    ';
      const extra = antes.split('#')[0].trimEnd().endsWith(':') ? paso : '';
      entrada.setRangeText('\n' + sangria + extra, inicio, fin, 'end');
    } else if (evento.shiftKey) {
      const quitar = entrada.value.slice(lineaInicio).match(/^( {1,4}|\t)/)?.[0].length || 0;
      if (quitar) entrada.setRangeText('', lineaInicio, lineaInicio + quitar, 'preserve');
    } else {
      entrada.setRangeText('    ', inicio, fin, 'end');
    }
  }

  function revelarFila(entrada, fila) {
    if (fila && (fila.offsetTop < entrada.scrollTop ||
      fila.offsetTop + fila.offsetHeight > entrada.scrollTop + entrada.clientHeight)) {
      entrada.scrollTop = Math.max(0, fila.offsetTop - entrada.clientHeight / 2);
    }
  }

  class SesionEditor {
    constructor({ entrada, espejo, numeros, contador, error }, cambio) {
      Object.assign(this, { entrada, espejo, numeros, contador, error, cambio, linea: 0, clase: '' });
      entrada.addEventListener('input', () => this.editar());
      entrada.addEventListener('scroll', () => this.sincronizar());
      conectarTeclado(entrada, () => this.editar());
    }

    sincronizar() {
      this.espejo.scrollTop = this.numeros.scrollTop = this.entrada.scrollTop;
      this.espejo.scrollLeft = this.entrada.scrollLeft;
    }

    pintar() {
      const { entrada, espejo, numeros, ordenes, linea, clase, nivel } = this;
      pintarFilas(entrada, espejo, numeros, ordenes, linea, clase, nivel.lenguaje || nivel.curso, this.rango);
      const cantidad = window.CR.Python.contarLineas(entrada.value);
      this.contador.textContent = traducir("comun.lineas") + cantidad + (nivel.maxLineas ? ' / ' + nivel.maxLineas : '');
      this.sincronizar();
    }

    limpiar() {
      this.rango = null;
      this.linea = 0;
      this.clase = '';
      this.error.textContent = '';
      this.entrada.removeAttribute('aria-invalid');
    }

    editar() {
      this.limpiar();
      this.pintar();
      this.cambio(this.entrada.value);
    }

    configurar(ficha, texto) {
      this.nivel = ficha;
      this.ordenes = new Set(ficha.ordenes.map(o => o.nombre));
      this.entrada.value = texto;
      this.entrada.scrollTop = this.entrada.scrollLeft = 0;
      this.limpiar();
      this.pintar();
    }

    texto() { return this.entrada.value; }
    bloquear(estado) { this.entrada.readOnly = estado; }

    destacar(numero, mensaje = '', mostrarMensaje = true) {
      this.rango = null;
      this.linea = numero;
      this.clase = mensaje ? 'fallida' : 'activa';
      this.error.textContent = mostrarMensaje ? mensaje : '';
      if (mensaje) this.entrada.setAttribute('aria-invalid', 'true');
      else this.entrada.removeAttribute('aria-invalid');
      this.pintar();
      revelarFila(this.entrada, this.espejo.children[numero - 1]);
      this.sincronizar();
    }

    destacarRango(inicio, fin) {
      this.rango = { inicio, fin };
      this.pintar();
      const linea = this.entrada.value.slice(0, inicio).split('\n').length;
      revelarFila(this.entrada, this.espejo.children[linea - 1]);
      this.sincronizar();
    }

    copiar(texto) {
      const { entrada, espejo } = this;
      if (entrada.readOnly) return;
      entrada.value += (entrada.value && !entrada.value.endsWith('\n') ? '\n' : '') + texto;
      entrada.focus();
      entrada.setSelectionRange(entrada.value.length, entrada.value.length);
      this.editar();
      entrada.scrollTop = espejo.scrollHeight;
    }
  }

  const Editor = { crear: (elementos, cambio) => new SesionEditor(elementos, cambio) };
  if (typeof window !== 'undefined') (window.CR ||= {}).Editor = Editor;
  if (typeof module !== 'undefined') module.exports = Editor;
})();
