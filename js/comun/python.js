(function () {
  'use strict';
  const mensajeLocal = typeof module !== 'undefined' ? require('./idioma').t : globalThis.CR.t;
  const nombre = '[A-Za-z_][A-Za-z_0-9]*';
  const esNombre = new RegExp('^' + nombre + '$');
  const llamada = new RegExp('^(' + nombre + ')\\s*\\((.*)\\)$');
  const asignacion = new RegExp('^(' + nombre + ')\\s*(\\+=|=(?!=))\\s*(.*)$');
  const reservadas = new Set('False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield'.split(' '));
  const niveles = { '==': 2, '!=': 2, '<': 2, '>': 2, '+': 3, '-': 3 };
  const binaria = (op, izq, der) => ({ tipo: 'binaria', op, izq, der });
  const variable = nombre => ({ tipo: 'variable', nombre });

  function fallar(linea, mensaje) {
    const error = new Error(mensajeLocal("comun.linea") + linea + ': ' + mensaje);
    error.linea = linea;
    throw error;
  }

  function distancia(a, b) {
    let fila = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (const letra of a) {
      const anterior = fila;
      fila = [anterior[0] + 1];
      Array.from(b).forEach((otra, i) => fila.push(Math.min(
        fila[i] + 1, anterior[i + 1] + 1, anterior[i] + Number(letra !== otra))));
    }
    return fila[b.length];
  }

  function desconocido(ctx, tipo, texto, lista) {
    const sugerencia = [...lista].sort((a, b) => distancia(a, texto) - distancia(b, texto))[0];
    const ayuda = sugerencia && distancia(sugerencia, texto) <= 3
      ? mensajeLocal("comun.querias_decir") + sugerencia + "'?" : '';
    fallar(ctx.linea, mensajeLocal("comun.no_conozco") + tipo + " '" + texto + "'." + ayuda);
  }

  function lector(texto, ctx) {
    const tokens = texto.match(/[A-Za-z_][A-Za-z_0-9]*|\d+|==|!=|[^\s]/g) || [];
    if (tokens.length > 300) fallar(ctx.linea, mensajeLocal("comun.simplifica_esta_expresion"));
    let indice = 0;
    let profundidad = 0;
    const ver = () => tokens[indice];
    const tomar = () => tokens[indice++];
    function exigir(token) {
      if (tomar() !== token) fallar(ctx.linea, mensajeLocal("comun.esperaba") + token + "'.");
    }
    function lista(fin) {
      const args = [];
      while (ver() !== fin && ver() !== undefined) {
        args.push(leer());
        if (ver() !== ',') break;
        tomar();
      }
      exigir(fin);
      return args;
    }
    function leer(minimo = 1) {
      if (++profundidad > 100) fallar(ctx.linea, mensajeLocal("comun.simplifica_esta_expresion"));
      let expr = inicial(minimo, ctx, { ver, tomar, leer, exigir, lista });
      let comparacion = false;
      while (Object.hasOwn(niveles, ver()) && niveles[ver()] >= minimo) {
        const op = tomar();
        if (niveles[op] === 2 && comparacion) fallar(ctx.linea, mensajeLocal("comun.usa_una_comparacion_cada_vez"));
        if (niveles[op] === 2) comparacion = true;
        expr = binaria(op, expr, leer(niveles[op] + 1));
      }
      profundidad--;
      return expr;
    }
    return { leer, lista, terminar() {
      if (ver() !== undefined) fallar(ctx.linea, mensajeLocal("comun.sobra") + ver() + "'.");
    } };
  }

  function inicial(minimo, ctx, { ver, tomar, leer, exigir, lista }) {
    const token = tomar();
    if (token === 'not' && minimo === 1) return { tipo: 'no', expr: leer() };
    if (token === '(') {
      const expr = leer();
      exigir(')');
      return expr;
    }
    if (token === '-' && /^\d+$/.test(ver() || '')) return entero('-' + tomar(), ctx);
    if (/^\d+$/.test(token || '')) return entero(token, ctx);
    if (token && esNombre.test(token) && !reservadas.has(token)) {
      if (ver() !== '(') return variable(token);
      if (!ctx.sensores.includes(token)) desconocido(ctx, mensajeLocal("comun.el_sensor"), token, ctx.sensores);
      tomar();
      const args = lista(')');
      validarCantidad(ctx, token, args);
      return { tipo: 'sensor', nombre: token, args };
    }
    fallar(ctx.linea, mensajeLocal("comun.esperaba_un_numero_una_variable"));
  }

  function entero(token, ctx) {
    const valor = Number(token);
    if (!Number.isSafeInteger(valor) || /^-?0+[1-9]/.test(token)) {
      fallar(ctx.linea, mensajeLocal("comun.escribe_un_entero_valido_sin"));
    }
    return { tipo: 'numero', valor: valor || 0 };
  }

  function expresion(texto, ctx) {
    const tokens = lector(texto, ctx);
    const expr = tokens.leer();
    tokens.terminar();
    return expr;
  }

  function filasDe(texto) {
    let estilo;
    return texto.split(/\r\n?|\n/).flatMap((original, i) => {
      const limpia = original.split('#')[0].trimEnd();
      if (!limpia.trim()) return [];
      const margen = limpia.match(/^[ \t]*/)[0];
      if (margen) {
        estilo ||= margen[0];
        if ([...margen].some(c => c !== estilo)) fallar(i + 1, mensajeLocal("comun.la_sangria_no_cuadra"));
      }
      return [{ texto: limpia.trimStart(), margen: margen.length, linea: i + 1 }];
    });
  }

  function validarCantidad(ctx, nombre, args) {
    if (!Object.hasOwn(ctx.aridades, nombre)) return;
    const cantidad = ctx.aridades[nombre];
    if (cantidad !== args.length) {
      fallar(ctx.linea, nombre + mensajeLocal("comun.espera") + cantidad + (cantidad === 1 ? mensajeLocal("comun.argumento") : mensajeLocal("comun.argumentos")));
    }
  }

  function simple(texto, ctx) {
    const asignar = texto.match(asignacion);
    if (asignar && !reservadas.has(asignar[1])) {
      const [, nombreVariable, op, derecha] = asignar;
      const expr = expresion(derecha, ctx);
      return { tipo: 'asignar', variable: nombreVariable,
        valor: op === '+=' ? binaria('+', variable(nombreVariable), expr) : expr };
    }
    const orden = texto.match(llamada);
    if (!orden || reservadas.has(orden[1])) fallar(ctx.linea, mensajeLocal("comun.no_entiendo_esta_instruccion_2"));
    const [, nombreOrden, parametros] = orden;
    if (!ctx.acciones.includes(nombreOrden)) {
      if (!ctx.funciones.includes(nombreOrden)) {
        desconocido(ctx, mensajeLocal("comun.la_orden"), nombreOrden, [...ctx.acciones, ...ctx.funciones]);
      }
      if (parametros.trim()) fallar(ctx.linea, mensajeLocal("comun.esta_funcion_se_llama_sin"));
      return { tipo: 'llamar', nombre: nombreOrden };
    }
    const args = lector(parametros + ')', ctx);
    const valores = args.lista(')');
    args.terminar();
    validarCantidad(ctx, nombreOrden, valores);
    return { tipo: 'accion', nombre: nombreOrden, args: valores };
  }

  const patronDef = new RegExp('^def\\s+(' + nombre + ')\\s*\\(\\s*\\)\\s*:$');
  const patronFor = new RegExp('^for\\s+(' + nombre + ')\\s+in\\s+range\\s*\\((.*)\\)\\s*:$');

  function cabecera(texto, ctx, cuerpo) {
    if (!texto.endsWith(':')) fallar(ctx.linea, mensajeLocal("comun.falta_al_final"));
    const bucle = texto.match(patronFor);
    if (bucle && !reservadas.has(bucle[1])) {
      return { tipo: 'repetir', veces: expresion(bucle[2], ctx), cuerpo: cuerpo() };
    }
    const condicion = texto.match(/^if\s+(.*?)\s*:$/);
    if (condicion) return { tipo: 'si', condicion: expresion(condicion[1], ctx), entonces: cuerpo(true), sino: cuerpo(false) };
    const funcion = texto.match(patronDef);
    if (funcion && !reservadas.has(funcion[1]) && ![...ctx.acciones, ...ctx.sensores].includes(funcion[1])) {
      return { tipo: 'definir', nombre: funcion[1], cuerpo: cuerpo() };
    }
    fallar(ctx.linea, mensajeLocal("comun.revisa_como_empieza_este_bloque"));
  }

  function traducir(texto, opciones = {}) {
    const filas = filasDe(texto);
    const funciones = filas.flatMap(fila => fila.texto.match(patronDef)?.slice(1) || []);
    const ctx = { acciones: opciones.acciones || [], sensores: opciones.sensores || [],
      aridades: opciones.aridades || {}, funciones };
    let indice = 0;
    function bloque(margen, profundidad) {
      const cuerpo = [];
      while (filas[indice] && filas[indice].margen >= margen) {
        const fila = filas[indice++];
        const actual = { ...ctx, linea: fila.linea };
        if (fila.margen !== margen || profundidad > 100) fallar(fila.linea, mensajeLocal("comun.la_sangria_no_cuadra"));
        function subbloque(rama) {
          let linea = fila.linea;
          if (rama === false) {
            const otra = filas[indice];
            if (!otra || otra.margen !== margen || !/^else\b/.test(otra.texto)) return [];
            if (!/^else\s*:$/.test(otra.texto)) fallar(otra.linea, mensajeLocal("comun.falta_al_final"));
            linea = filas[indice++].linea;
          }
          const siguiente = filas[indice];
          if (!siguiente || siguiente.margen <= margen) fallar(siguiente?.linea || linea, mensajeLocal("comun.falta_un_bloque_con_sangria"));
          return bloque(siguiente.margen, profundidad + 1);
        }
        const instr = /^(for|if|def)\b/.test(fila.texto)
          ? cabecera(fila.texto, actual, subbloque) : simple(fila.texto, actual);
        cuerpo.push({ ...instr, linea: fila.linea });
      }
      return cuerpo;
    }
    return bloque(0, 0);
  }

  function textoExpr(expr) {
    switch (expr.tipo) {
      case 'numero': return String(expr.valor);
      case 'variable': return expr.nombre;
      case 'sensor': return textoLlamada(expr);
      case 'no': return '(not ' + textoExpr(expr.expr) + ')';
      case 'binaria': return '(' + textoExpr(expr.izq) + ' ' + expr.op + ' ' + textoExpr(expr.der) + ')';
      default: throw new Error(mensajeLocal("comun.no_entiendo_esta_expresion"));
    }
  }

  function textoLlamada(instr) {
    return instr.nombre + '(' + (instr.args || []).map(textoExpr).join(', ') + ')';
  }

  function aTexto(programa) {
    const filas = [];
    function escribir(texto, nivel, linea) {
      while (linea && filas.length + 1 < linea) filas.push('');
      filas.push('    '.repeat(nivel) + texto);
    }
    function bloque(instrucciones, nivel) {
      for (const instr of instrucciones) {
        const escribirLinea = texto => escribir(texto, nivel, instr.linea);
        switch (instr.tipo) {
          case 'accion': case 'llamar': escribirLinea(textoLlamada(instr)); break;
          case 'asignar': escribirLinea(instr.variable + ' = ' + textoExpr(instr.valor)); break;
          case 'repetir':
            escribirLinea('for _ in range(' + textoExpr(instr.veces) + '):');
            bloque(instr.cuerpo, nivel + 1);
            break;
          case 'definir':
            escribirLinea('def ' + instr.nombre + '():');
            bloque(instr.cuerpo, nivel + 1);
            break;
          case 'si':
            escribirLinea('if ' + textoExpr(instr.condicion) + ':');
            bloque(instr.entonces, nivel + 1);
            if (instr.sino.length) {
              escribir('else:', nivel);
              bloque(instr.sino, nivel + 1);
            }
            break;
        }
      }
    }
    bloque(programa, 0);
    return filas.join('\n');
  }

  const Python = { traducir, aTexto, contarLineas: texto => texto.split(/\r\n?|\n/).filter(l => l.split('#')[0].trim()).length };
  if (typeof window !== 'undefined') (window.CR ||= {}).Python = Python;
  if (typeof module !== 'undefined') module.exports = Python;
})();
