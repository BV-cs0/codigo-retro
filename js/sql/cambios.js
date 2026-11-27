(function () {
  'use strict';
  const I = CR.sqlInterno;
  const { ascii, preparar, evaluar, nulo, afinidad, comparar, verdad, entero } = I;
  function columna(p) {
    if (['FOREIGN', 'CONSTRAINT', 'CHECK'].includes(p.actual.clave)) p.noSoportado(p.actual.clave);
    const c = { nombre: p.nombre(), tipo: '', pk: false, notNull: false, unique: false };
    if (p.esNombre()) c.tipo = p.nombre().toUpperCase();
    while (true) {
      if (p.acepta('PRIMARY')) { p.exige('KEY'); c.pk = true; }
      else if (p.acepta('NOT')) { p.exige('NULL'); c.notNull = true; }
      else if (p.acepta('UNIQUE')) c.unique = true;
      else if (p.acepta('DEFAULT')) c.defecto = p.expresion(6);
      else if (['REFERENCES', 'COLLATE', 'CHECK'].includes(p.actual.clave)) p.noSoportado(p.actual.clave);
      else return c;
    }
  }
  function analizarCambio(p, t) {
    const clase = t.clave.toLowerCase();
    let opcional = false;
    if (clase === 'create' || clase === 'drop') {
      if (['VIEW', 'INDEX', 'TRIGGER', 'VIRTUAL', 'TEMP', 'TEMPORARY'].includes(p.actual.clave))
        p.noSoportado(t.clave + ' ' + p.actual.clave);
      p.exige('TABLE');
      if (p.acepta('IF')) {
        opcional = true;
        if (clase === 'create') p.exige('NOT');
        p.exige('EXISTS');
      }
    }
    if (clase === 'insert') p.exige('INTO');
    if (clase === 'delete') p.exige('FROM');
    const token = p.actual;
    const tabla = p.nombre();
    const s = { clase, tabla, token, opcional };
    if (clase === 'create') {
      p.exige('(');
      s.columnas = p.lista(() => columna(p));
      p.exige(')');
    } else if (clase === 'insert') {
      if (p.acepta('(')) { s.columnas = p.lista(() => p.nombre()); p.exige(')'); }
      p.exige('VALUES');
      s.valores = p.lista(() => {
        p.exige('(');
        const exprs = p.lista(() => p.expresion());
        p.exige(')');
        return exprs;
      });
    } else if (clase === 'update') {
      p.exige('SET');
      s.asignaciones = p.lista(() => {
        const nombre = p.nombre();
        p.exige('=');
        return { nombre, expr: p.expresion() };
      });
    }
    if (['update', 'delete'].includes(clase) && p.acepta('WHERE')) {
      p.marcas.add('where');
      s.filtro = p.expresion();
    }
    return s;
  }
  function existeTabla(ctx, tabla, token) {
    const t = ctx.tablas.get(ascii(tabla));
    if (!t) I.fallo('no such table: ' + tabla, token, 'tabla');
    return t;
  }
  function indice(tabla, nombre, s, inserta = false) {
    const i = tabla.columnas.findIndex(c => ascii(c.nombre) === ascii(nombre));
    if (i < 0) I.fallo(inserta ? 'table ' + s.tabla + ' has no column named ' + nombre : 'no such column: ' + nombre, s.token, 'columna');
    return i;
  }
  function crear(s, ctx) {
    const clave = ascii(s.tabla);
    if (ctx.tablas.has(clave)) {
      if (s.opcional) return;
      I.fallo('table ' + s.tabla + ' already exists', s.token, 'existe');
    }
    const nombres = new Set();
    let pks = 0;
    const columnas = s.columnas.map(c => {
      const nombre = ascii(c.nombre);
      if (nombres.has(nombre)) I.fallo('duplicate column name: ' + c.nombre, s.token, 'columna');
      nombres.add(nombre);
      if (c.pk && ++pks > 1) I.fallo('table "' + s.tabla + '" has more than one primary key', s.token, 'clave');
      preparar(c.defecto, { columnas: [] }, ctx, false);
      return { ...c, predeterminado: evaluar(c.defecto, ctx) };
    });
    ctx.tablas.set(clave, { nombre: s.tabla, columnas, filas: [] });
  }
  function falloRestriccion(tabla, c, s, restriccion) {
    I.fallo(restriccion + ' constraint failed: ' + tabla.nombre + '.' + c.nombre, s.token, 'restriccion');
  }
  function ordenarPk(filas, pk) {
    return pk < 0 ? filas : filas.sort((a, b) => comparar(a[pk], b[pk]));
  }
  function validar(filas, tabla, s, pk) {
    if (filas.length > 10000) I.limite(s.token);
    for (let i = 0; i < tabla.columnas.length; i++) {
      const c = tabla.columnas[i], vistos = new Set();
      for (const fila of filas) {
        const x = fila[i];
        if (x === nulo && c.notNull) falloRestriccion(tabla, c, s, 'NOT NULL');
        if (i === pk && x.tipo !== 'integer') I.fallo('datatype mismatch', s.token, 'tipo');
        if (x === nulo || !(c.unique || c.pk)) continue;
        if (vistos.has(x.valor)) falloRestriccion(tabla, c, s, 'UNIQUE');
        vistos.add(x.valor);
      }
    }
  }
  function insertar(tabla, s, ctx, pk) {
    const cols = s.columnas ? s.columnas.map(n => indice(tabla, n, s, true)) : tabla.columnas.map((_, i) => i);
    const filas = tabla.filas.slice();
    let maximo = filas.length && pk >= 0 ? filas.at(-1)[pk].valor : null;
    for (const exprs of s.valores) {
      if (exprs.length !== cols.length) {
        const mensaje = s.columnas ? exprs.length + ' values for ' + cols.length + ' columns'
          : 'table ' + s.tabla + ' has ' + cols.length + ' columns but ' + exprs.length + ' values were supplied';
        I.fallo(mensaje, s.token, 'valores');
      }
      const fila = tabla.columnas.map(c => afinidad(c.predeterminado ?? nulo, c.tipo, true));
      exprs.forEach((expr, j) => {
        preparar(expr, { columnas: [] }, ctx, false);
        const i = cols[j];
        if (cols.indexOf(i) === j) fila[i] = afinidad(evaluar(expr, ctx), tabla.columnas[i].tipo, true);
      });
      if (pk >= 0 && fila[pk] === nulo) fila[pk] = entero((maximo ?? 0) + 1);
      if (pk >= 0) maximo = maximo == null ? fila[pk].valor : Math.max(maximo, fila[pk].valor);
      filas.push(fila);
    }
    validar(filas, tabla, s, pk);
    tabla.filas = ordenarPk(filas, pk);
    return s.valores.length;
  }
  function restriccionesUpdate(tabla, s, pk) {
    const ocupados = tabla.columnas.map((c, i) => c.unique || c.pk
      ? new Set(tabla.filas.filter(f => f[i] !== nulo).map(f => f[i].valor)) : null);
    return (anterior, nueva) => {
      tabla.columnas.forEach((c, i) => {
        if (nueva[i] === nulo && c.notNull) falloRestriccion(tabla, c, s, 'NOT NULL');
        if (i === pk && nueva[i].tipo !== 'integer') I.fallo('datatype mismatch', s.token, 'tipo');
      });
      for (const [i, valores] of ocupados.entries()) {
        if (!valores) continue;
        const antes = anterior[i].valor, despues = nueva[i].valor;
        if (antes === despues) continue;
        if (despues !== null && valores.has(despues)) falloRestriccion(tabla, tabla.columnas[i], s, 'UNIQUE');
        valores.delete(antes);
        if (despues !== null) valores.add(despues);
      }
    };
  }
  function actualizarOBorrar(tabla, s, ctx, pk) {
    const ambito = { columnas: tabla.columnas.map((c, i) => ({ ...c, tabla: s.tabla, indice: i })) };
    preparar(s.filtro, ambito, ctx, false);
    const cambios = (s.asignaciones || []).map(({ nombre, expr }) => {
      preparar(expr, ambito, ctx, false);
      return { i: indice(tabla, nombre, s), expr };
    });
    if (!s.filtro) ctx.consejo('todas', s.token);
    let cantidad = 0;
    ctx.recorre(tabla.filas.length, s.token);
    const restricciones = s.clase === 'update' && restriccionesUpdate(tabla, s, pk);
    const filas = tabla.filas.flatMap(fila => {
      const local = { ...ctx, fila };
      if (s.filtro && !verdad(evaluar(s.filtro, local))) return [fila];
      cantidad++;
      if (s.clase === 'delete') return [];
      const copia = fila.slice();
      for (const { i, expr } of cambios) copia[i] = afinidad(evaluar(expr, local), tabla.columnas[i].tipo, true);
      restricciones(fila, copia);
      I.identidadFila(copia, fila);
      return [copia];
    });
    validar(filas, tabla, s, pk);
    tabla.filas = ordenarPk(filas, pk);
    return cantidad;
  }
  function cambiar(s, ctx) {
    let cambios = 0;
    if (s.clase === 'create') crear(s, ctx);
    else if (s.clase === 'drop') {
      if (!s.opcional) existeTabla(ctx, s.tabla, s.token);
      ctx.tablas.delete(ascii(s.tabla));
    } else {
      const tabla = existeTabla(ctx, s.tabla, s.token);
      const pk = tabla.columnas.findIndex(c => c.pk && c.tipo === 'INTEGER');
      cambios = s.clase === 'insert' ? insertar(tabla, s, ctx, pk) : actualizarOBorrar(tabla, s, ctx, pk);
    }
    return { columnas: [], filas: [], cambios };
  }
  Object.assign(I, { analizarCambio, existeTabla, cambiar, ordenarPk });
})();
