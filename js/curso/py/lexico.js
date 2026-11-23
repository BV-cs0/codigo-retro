(function () {
  'use strict';
  const fallo = (tipo, linea, mensaje, original = mensaje) => { throw { tipo, linea, mensaje, original }; };
  const palabra = /^[\p{ID_Start}_][\p{ID_Continue}]*/u;
  const numero = /^(?:\d+\.\d*|\.\d+|\d+)(?:[eE][+-]?\d+)?/;
  const simbolo = /^(?:\*\*|\/\/|[=!<>+\-*/]=|[+\-*/%=<>(){}\[\]:,.])/;
  const cadena = /^(["'])((?:\\.|(?!\1).)*?)\1/;
  function finCampo(texto, inicio, linea) {
    let llaves = 0;
    for (let i = inicio; i < texto.length; i++) {
      if (/^f?["']/.test(texto.slice(i, i + 2))) i += citaDe(texto.slice(i), linea).valor.length - 1;
      else if (texto[i] === '{') llaves++;
      else if (texto[i] === '}') {
        if (!llaves) return i;
        llaves--;
      }
    }
    fallo('SyntaxError', linea, 'Falta cerrar una llave de la f-string.');
  }
  function citaDe(texto, linea) {
    if (!/^f?["']/.test(texto)) return null;
    if (texto[0] !== 'f') {
      const cita = cadena.exec(texto);
      if (!cita) fallo('SyntaxError', linea, 'Faltan las comillas de cierre.',
        'unterminated string literal (detected at line ' + linea + ')');
      return { valor: cita[0], contenido: cita[2] };
    }
    const partes = [];
    const comilla = texto[1];
    let literal = '';
    for (let i = 2; i < texto.length; i++) {
      const c = texto[i];
      if (c === comilla) {
        partes.push(literal);
        return { valor: texto.slice(0, i + 1), partes };
      }
      if (c === '\\' && /[nt\\'"]/.test(texto[i + 1] || '')) literal += c + texto[++i];
      else if ((c === '{' || c === '}') && texto[i + 1] === c) {
        literal += c;
        i++;
      } else if (c === '{') {
        const fin = finCampo(texto, i + 1, linea);
        partes.push(literal, { expresion: texto.slice(i + 1, fin) });
        literal = '';
        i = fin;
      } else if (c === '}') fallo('SyntaxError', linea, 'Revisa las llaves de la f-string.');
      else literal += c;
    }
    fallo('SyntaxError', linea, 'Faltan las comillas de cierre de la f-string.');
  }
  function tokens(texto, linea, columna = 1) {
    const salida = [];
    while (texto && texto[0] !== '#') {
      const espacio = /^[ \t]+/.exec(texto);
      const cita = citaDe(texto, linea);
      const valor = cita?.valor || (espacio || numero.exec(texto) || palabra.exec(texto) || simbolo.exec(texto))?.[0];
      if (!valor) fallo('SyntaxError', linea, 'Este símbolo no se reconoce.');
      if (!espacio) salida.push({ valor, cita, linea, columna });
      columna += valor.length;
      texto = texto.slice(valor.length);
    }
    salida.push({ valor: '', linea, columna });
    return salida;
  }
  function reajustar(salidas, sangrias, nivel, linea, columna) {
    if (nivel > sangrias.at(-1)) {
      sangrias.push(nivel);
      salidas.push({ tipo: 'INDENT', linea, columna });
    }
    while (nivel < sangrias.at(-1)) {
      sangrias.pop();
      salidas.push({ tipo: 'DEDENT', linea, columna });
    }
    if (nivel !== sangrias.at(-1)) fallo('IndentationError', linea, 'Esta sangría no coincide con ninguna anterior.');
  }
  function leer(codigo) {
    const salida = [], sangrias = [0], aperturas = [];
    let actual;
    const lineas = codigo.split(/\r\n|\r|\n/);
    lineas.forEach((original, i) => {
      const linea = i + 1;
      const prefijo = /^[ \t]*/.exec(original)[0];
      const nivel = [...prefijo].reduce((n, c) => c === '\t' ? n + 8 - n % 8 : n + 1, 0);
      const columna = prefijo.length + 1;
      const partes = tokens(original.slice(prefijo.length), linea, columna);
      const fin = partes.pop();
      if (!partes.length) return;
      if (!actual) {
        reajustar(salida, sangrias, nivel, linea, columna);
        actual = { tipo: 'LINEA', linea, columna, partes: [] };
      }
      for (const t of partes) {
        if (['(', '[', '{'].includes(t.valor)) aperturas.push(t);
        if ([')', ']', '}'].includes(t.valor)) {
          const a = aperturas.pop();
          if (a?.valor !== { ')': '(', ']': '[', '}': '{' }[t.valor]) fallo('SyntaxError', t.linea, 'Revisa los paréntesis, corchetes y llaves.');
        }
        actual.partes.push(t);
      }
      if (!aperturas.length) {
        actual.partes.push(fin);
        salida.push(actual);
        actual = null;
      }
    });
    if (aperturas.length) fallo('SyntaxError', aperturas[0].linea, 'Falta cerrar un paréntesis o corchete.');
    reajustar(salida, sangrias, 0, lineas.length, 1);
    return salida;
  }
  const Lexico = { fallo, palabra, numero, tokens, leer };
  if (typeof module !== 'undefined') module.exports = Lexico;
  else (window.CR ||= {}).PyLexico = Lexico;
})();
