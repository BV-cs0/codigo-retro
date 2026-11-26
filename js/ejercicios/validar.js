(function () {
  'use strict';
  const traducir = typeof module !== 'undefined' ? require('../comun/idioma').t : globalThis.CR.t;
  const nodo = typeof module !== 'undefined';
  const Py = nodo ? require('../curso/py/interprete') : window.CR.Py;
  const V = nodo ? require('../curso/py/valores') : window.CR.PyValores;
  const filas = codigo => codigo.split(/\r\n|\r|\n/);
  const resultado = (ok, texto) => ({ ok, texto });
  const cita = texto => '«' + texto + '»';
  const nombre = n => n?.nombre;
  const llamada = (n, objetivo) => n.tipo === 'llamada' && nombre(n.base) === objetivo;
  const asigna = (n, origen, destino) => n?.tipo === 'asigna' && n.op === '=' &&
    n.destino.tipo === 'nombre' && n.expr.tipo === 'nombre' &&
    (origen === undefined || n.expr.nombre === origen) && n.destino.nombre === destino;
  const reglas = {
    bucle: [n => ['for', 'while'].includes(n.tipo), traducir("ejercicios.un_bucle_for_o_while")],
    while: [n => n.tipo === 'while', traducir("ejercicios.un_bucle_while")],
    try: [n => n.tipo === 'try', 'try'],
    return: [n => n.tipo === 'return' && n.expr, traducir("ejercicios.return_con_un_valor")],
    auxiliar: [n => {
      if (!Array.isArray(n)) return false;
      return n.some((s, i) => asigna(s, 'a', s.destino?.nombre) &&
        !['a', 'b'].includes(s.destino.nombre) && n.slice(i + 1).some((t, j) =>
          asigna(t, 'b', 'a') && n.slice(i + j + 2).some(u => asigna(u, s.destino.nombre, 'b'))));
    }, traducir("ejercicios.una_variable_auxiliar_para_intercambiar")],
    fstring: [n => n.tipo === 'fstring', traducir("ejercicios.una_f_string")],
    aritmetica: [n => llamada(n, 'print') && n.args.some(a =>
      a.valor.tipo === 'binario' && ['+', '-', '*', '/', '//', '%', '**'].includes(a.valor.op)), traducir("ejercicios.una_operacion_aritmetica_dentro_de")],
    'except-ValueError': [n => n.tipo === 'except' && nombre(n.expr) === 'ValueError', 'except ValueError'],
    'except-general': [n => n.tipo === 'except' && (!n.expr || nombre(n.expr) === 'Exception'), traducir("ejercicios.un_except_general")],
    'asignacion-multiple': [n => n.tipo === 'asigna' && n.destino.tipo === 'tupla', traducir("ejercicios.asignacion_multiple")],
    'corte-inverso': [n => n.tipo === 'corte' && n.paso?.tipo === 'unario' && n.paso.op === '-' &&
      ['int', 'float'].includes(n.paso.expr.tipo) && Number(n.paso.expr.valor) === 1, '[::-1]'],
    'sorted-key': [n => llamada(n, 'sorted') && n.args.some(a => a.nombre === 'key'), traducir("ejercicios.sorted_con_key")]
  };
  function recorre(n, predicado) {
    return Boolean(n && typeof n === 'object' && (predicado(n) || Object.values(n).some(v => recorre(v, predicado))));
  }
  function reglasAst(ejercicio, ast) {
    const comprobar = (id, prohibido) => {
      if (id === 'cifrar_cesar' && ejercicio.idioma === 'en') id = 'caesar_encrypt';
      const [busca, etiqueta] = reglas[id] || (['and', '//', '%'].includes(id) ?
        [n => n.tipo === 'binario' && n.op === id, id] : [n => llamada(n, id), id + '()']);
      const presente = recorre(ast, busca);
      if (prohibido) return resultado(!presente, presente ?
        traducir("ejercicios.este_ejercicio_pide_hacerlo_sin") + etiqueta + '.' : traducir("ejercicios.no_usa") + etiqueta + '.');
      return resultado(presente, presente ? traducir("curso.usa") + etiqueta + '.' : traducir("ejercicios.falta_usar") + etiqueta + '.');
    };
    return [...(ejercicio.requiere || []).map(r => comprobar(r, false)),
      ...(ejercicio.prohibe || []).map(r => comprobar(r, true))];
  }
  function ejecutar(codigo, opciones, capturar) {
    const programa = Py.ejecutar(codigo, opciones);
    if (capturar) programa.integradas.set('__retro_resultado', {
      tipo: 'integrada', fn: ([valor]) => { capturar(valor); return null; }
    });
    let salida = '', estado;
    do {
      estado = programa.paso();
      salida += estado.salida;
    } while (!estado.hecho && !estado.esperandoEntrada);
    return { ...estado, salida, ast: programa.ast };
  }
  function errorPython(error, contexto = '') {
    const limite = error.limite || error.tipo === 'RuntimeError' && error.mensaje.startsWith(traducir("ejercicios.la_consola_admite"));
    const consejo = limite ? traducir("ejercicios.tu_programa_no_termina_revisa") :
      error.tipo === 'OverflowError' ? traducir("ejercicios.el_numero_se_ha_hecho") :
      error.tipo + traducir("curso.linea") + error.linea + '). ' + error.mensaje;
    // Tras «Con f(1), » la frase sigue en minúscula.
    const texto = contexto.endsWith(', ') && /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]/.test(consejo)
      ? consejo[0].toLowerCase() + consejo.slice(1) : consejo;
    return resultado(false, contexto + texto);
  }
  function comparar(obtenida, esperada, contexto) {
    if (obtenida === esperada) return resultado(true, contexto + traducir("ejercicios.la_salida_coincide"));
    const real = filas(obtenida.replace(/\n$/, '')), ideal = filas(esperada.replace(/\n$/, ''));
    if (!obtenida) real.length = 0;
    if (!esperada) ideal.length = 0;
    const i = ideal.findIndex((s, j) => s !== real[j]);
    const simplificar = s => s.replace(/\s+/gu, '').toLowerCase();
    let consejo;
    if (i < 0 && real.length > ideal.length) consejo = traducir("ejercicios.tu_programa_imprime_una_linea") + cita(real[ideal.length]);
    else if (i >= real.length) consejo = traducir("ejercicios.falta_la_linea") + cita(ideal[i]) + (i === ideal.length - 1 ? traducir("ejercicios.al_final") : '.');
    else if (i >= 0 && simplificar(real[i]) === simplificar(ideal[i])) {
      consejo = traducir("ejercicios.casi_revisa_mayusculas_y_espacios") + cita(ideal[i]) + '.';
    } else if (i >= 0) consejo = traducir("comun.linea") + (i + 1) + traducir("ejercicios.imprimio") + cita(real[i]) + traducir("curso.se_esperaba_3") + cita(ideal[i]) + '.';
    else consejo = traducir("ejercicios.revisa_el_salto_de_linea");
    return resultado(false, contexto + consejo);
  }
  function conDatos(codigo, linea) {
    return [linea, ...filas(codigo).slice(1)].join('\n');
  }
  function casosSalida(ejercicio, codigo) {
    const casos = [];
    if (ejercicio.salidaEsperada !== undefined) casos.push({ codigo, salida: ejercicio.salidaEsperada });
    for (const dato of ejercicio.datos || []) casos.push({ codigo: conDatos(codigo, dato.linea), salida: dato.salida, dato: dato.linea });
    for (const caso of ejercicio.casos || []) casos.push({ ...caso, codigo });
    return casos;
  }
  function pruebaFuncion(codigo, prueba) {
    const contexto = traducir("ejercicios.con") + prueba.llamada + ', ';
    const simple = prueba.codigo.startsWith('print(');
    let valor;
    const cuerpo = simple ? prueba.codigo.replace(/^print\(/, '__retro_resultado(') : prueba.codigo;
    const r = ejecutar(codigo + '\n' + cuerpo, { entradas: [] }, v => { valor = v; });
    if (r.error) return errorPython(r.error, contexto);
    if (simple && valor === null && r.salida) {
      return resultado(false, contexto + traducir("ejercicios.tu_funcion_imprime_el_resultado"));
    }
    if (!simple) return comparar(r.salida, prueba.salida + '\n', contexto);
    const tipo = V.tipo(valor);
    const tipoCorrecto = !prueba.tipo || (prueba.tipo === 'numero' ? ['int', 'float'].includes(tipo) : tipo === prueba.tipo);
    if (!tipoCorrecto) {
      return resultado(false, contexto + traducir("ejercicios.tu_funcion_devolvio_un_valor") + tipo + traducir("ejercicios.se_esperaba") + prueba.tipo + '.');
    }
    const texto = V.str(valor);
    let coincide = texto === prueba.salida;
    if (!coincide && prueba.tipo === 'dict') {
      let esperado;
      ejecutar('__retro_resultado(' + prueba.salida + ')', { entradas: [] }, v => { esperado = v; });
      coincide = V.igual(valor, esperado);
    }
    const ok = coincide && !r.salida;
    return resultado(ok, contexto + (ok ? traducir("ejercicios.tu_funcion_devolvio") + cita(texto) + '.' :
      traducir("ejercicios.tu_funcion_devolvio") + cita(texto) + traducir("ejercicios.se_esperaba") + cita(prueba.salida) + '.' +
      (r.salida ? traducir("ejercicios.la_funcion_tambien_imprimio_en") : '')));
  }
  function comprobar(ejercicio, codigo) {
    const checks = [];
    if (ejercicio.tipo === 'completa' && /\b___\b/.test(codigo)) {
      checks.push(resultado(false, traducir("ejercicios.todavia_quedan_huecos_por_rellenar")));
    } else {
      const casos = casosSalida(ejercicio, codigo);
      const base = ejecutar(codigo, { entradas: casos[0]?.entradas || [], aleatorios: casos[0]?.aleatorios });
      checks.push(...reglasAst(ejercicio, base.ast));
      if (ejercicio.datos?.length && filas(codigo)[0] !== filas(ejercicio.codigo)[0]) {
        checks.push(resultado(false, traducir("ejercicios.conserva_la_primera_linea_de")));
      }
      if (base.error && !casos[0]) checks.push(errorPython(base.error));
      for (const [i, caso] of casos.entries()) {
        const r = i ? ejecutar(caso.codigo, { entradas: caso.entradas || [], aleatorios: caso.aleatorios }) : base;
        const contexto = caso.dato ? caso.dato + ' → ' : caso.entradas ?
          traducir("curso.caso") + (i + 1) + ' (' + caso.entradas.map(cita).join(', ') + ') → ' : '';
        checks.push(r.error ? errorPython(r.error, contexto) :
          comparar(r.salida, caso.salida ? caso.salida + '\n' : '', contexto));
      }
      if (!base.error) for (const prueba of ejercicio.pruebas || []) checks.push(pruebaFuncion(codigo, prueba));
    }
    return { ok: checks.length > 0 && checks.every(c => c.ok), checks };
  }
  const ValidarTaller = { comprobar, casosSalida, ejecutar };
  if (nodo) module.exports = ValidarTaller;
  else window.CR.ValidarTaller = ValidarTaller;
})();
