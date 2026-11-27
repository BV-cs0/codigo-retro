(function () {
  'use strict';
  if (typeof module !== 'undefined' && module.exports) {
    for (const archivo of ['lexico', 'analizador', 'valores', 'funciones', 'expresiones', 'consulta', 'cambios'])
      require('./' + archivo);
  }
  const I = CR.sqlInterno;
  const LIMITE = 'Tu consulta recorre demasiadas filas. ¿Falta la condición `ON` en la unión?';
  I.limite = token => I.fallo(LIMITE, token, 'limite');
  const identidades = new WeakMap();
  let siguienteFila = 0;
  I.identidadFila = function identidadFila(fila, previa) {
    if (previa) identidades.set(fila, I.identidadFila(previa));
    if (!identidades.has(fila)) identidades.set(fila, ++siguienteFila);
    return identidades.get(fila);
  };
  function ubicacion(sql, token) {
    const lineas = sql.slice(0, token?.inicio ?? 0).split(/\r\n|\r|\n/);
    return { linea: lineas.length, columna: lineas.at(-1).length + 1 };
  }
  function contexto(sql, tablas, pasos, consejos, parametros) {
    let recorridas = 0;
    return {
      tablas, pasos, parametros, fila: [],
      recorre(n, token) {
        recorridas += n;
        if (recorridas > 100000) I.limite(token);
      },
      consejo(clave, token, datos = []) {
        const pos = ubicacion(sql, token);
        if (!consejos.some(c => c.clave === clave && c.linea === pos.linea && c.columna === pos.columna))
          consejos.push({ clave, datos, ...pos });
      }
    };
  }
  function normalizar(r) {
    return { ...r, filas: r.filas.map(f => f.map(x => x.valor)), tipos: r.filas.map(f => f.map(x => x.tipo)) };
  }
  function comprobarParametros(cantidad, parametros, token) {
    if (cantidad !== parametros.length) I.fallo('Incorrect number of bindings supplied. The current statement uses ' +
      cantidad + ', and there are ' + parametros.length + ' supplied.', token, 'parametros');
    return parametros.map(v => {
      if (v && typeof v === 'object' && v.tipo === 'real' && typeof v.valor === 'number') return I.real(v.valor);
      if (v === null || typeof v === 'string' || (typeof v === 'number' && Number.isFinite(v))) return I.valor(v);
      if (typeof v === 'boolean') return I.entero(Number(v));
      I.fallo('Unsupported parameter type', token, 'tipo');
    });
  }
  function ejecutar(tablas, sql, parametros) {
    const respuesta = { resultados: [], error: null, pasos: [], consejos: [], marcas: [] };
    let parser;
    try {
      sql = String(sql ?? '');
      parser = new I.Parser(sql);
      while (true) {
        const token = parser.actual;
        const s = parser.siguiente();
        if (!s) break;
        if (respuesta.resultados.length >= 200) I.limite(token);
        const valores = comprobarParametros(parser.bindings, parametros, token);
        const ctx = contexto(sql, tablas, respuesta.pasos, respuesta.consejos, valores);
        if (s.clase === 'select') I.prepararConsulta(s, ctx);
        const r = s.clase === 'select' ? I.consultar(s, ctx) : I.cambiar(s, ctx);
        respuesta.resultados.push(normalizar({ ...r, sentencia: s.clase }));
      }
    } catch (err) {
      const clave = err.clave || (err instanceof RangeError ? 'limite' : 'interno');
      const datos = err.datos || [];
      const traducir = (k, d, respaldo) => CR.t ? CR.t('sql.' + k, { nombre: d[0], alias: d[0], columna: d[1] }) : respaldo;
      const sinSoporte = traducir('error_noSoportado', datos, '`' + datos[0] + '` no está en este simulador');
      const mensaje = clave === 'noSoportado' ? sinSoporte : clave === 'limite' ? LIMITE : err.message;
      const posicion = ubicacion(typeof sql === 'string' ? sql : '', err.token);
      respuesta.error = { mensaje, explicacion: traducir('error_' + clave, datos, mensaje), clave, ...posicion };
      if (clave === 'precision' || clave === 'limite') respuesta.error.mensaje = respuesta.error.explicacion;
      if (clave === 'agregado') respuesta.consejos.push({ clave: 'agregado', datos, ...ubicacion(sql, err.token) });
    }
    respuesta.marcas = [...(parser?.marcas || [])];
    return respuesta;
  }
  function importar(estado) {
    const tablas = new Map();
    for (const [nombre, estructura] of Object.entries(estado?.tablas || {})) {
      const columnas = estructura.columnas.map(c => ({ pk: false, unique: false, notNull: false, ...c, tipo: (c.tipo || '').toUpperCase() }));
      const filas = estructura.filas.map((fila, i) => columnas.map((c, j) =>
        I.afinidad(I.valor(fila[j], estructura.tipos?.[i]?.[j]), c.tipo, true)));
      if (filas.length > 10000) I.limite();
      tablas.set(I.ascii(nombre), { nombre, columnas, filas: I.ordenarPk(filas, columnas.findIndex(c => c.pk && c.tipo === 'INTEGER')) });
    }
    return tablas;
  }
  function publicar(tablas, conIdentidades) {
    return Object.fromEntries([...tablas.values()].map(t => {
      const columnas = t.columnas.map(({ defecto, predeterminado, ...c }) => ({ ...c }));
      const filas = t.filas.map(f => f.map(v => v.valor));
      const ids = conIdentidades ? { ids: t.filas.map(f => I.identidadFila(f)) } : {};
      return [t.nombre, { columnas, filas, ...ids }];
    }));
  }
  function base(tablas) {
    return {
      ejecutar: (sql, parametros = []) => ejecutar(tablas, sql, parametros),
      tablas: (conIdentidades = false) => publicar(tablas, conIdentidades),
      copia: () => base(new Map([...tablas].map(([k, t]) => [k, { ...t, filas: t.filas.slice() }])))
    };
  }
  function crear(estadoInicial) {
    const bd = base(importar(estadoInicial));
    if (typeof estadoInicial === 'string') {
      const resultado = bd.ejecutar(estadoInicial);
      if (resultado.error) throw new Error(resultado.error.mensaje);
    }
    return bd;
  }
  CR.SQL = { crear };
  if (typeof module !== 'undefined' && module.exports) module.exports = CR.SQL;
})();
