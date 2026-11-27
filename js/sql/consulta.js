(function () {
  'use strict';
  const I = CR.sqlInterno;
  const { ascii, nulo, evaluar, preparar, comparar, claveFila, verdad, contieneAgregado } = I;
  function fuentes(q, ctx, exterior) {
    const columnas = [];
    for (const fuente of q.fuentes || []) {
      const tabla = I.existeTabla(ctx, fuente.tabla, fuente.t);
      const alias = fuente.alias || fuente.tabla;
      const esquema = tabla.columnas.map((c, i) => ({ ...c, tabla: alias, indice: columnas.length + i }));
      columnas.push(...esquema);
      preparar(fuente.on, { columnas, exterior }, ctx, false);
      fuente.esquema = esquema;
    }
    return { columnas, exterior };
  }
  function proyectar(q, ambito, ctx) {
    return q.campos.flatMap(c => {
      if (!c.todo) {
        preparar(c.expr, ambito, ctx);
        if (c.alias && !c.alias.explicito && c.expr.clase === 'columna')
          ctx.consejo('coma', c.expr.t, [c.alias.nombre, c.expr.nombre]);
        return [{ expr: c.expr, etiqueta: c.etiqueta, nombre: c.alias?.nombre || c.expr.ref?.nombre || c.etiqueta }];
      }
      const disponibles = ambito.columnas.filter(col => !c.tabla || ascii(col.tabla) === ascii(c.tabla));
      if (!disponibles.length) I.fallo(c.tabla ? 'no such table: ' + c.tabla : 'no tables specified', null, 'tabla');
      return disponibles.map(col => ({ nombre: col.nombre, expr: { clase: 'columna', ref: { ...col, nivel: 0 } } }));
    });
  }
  function ordinal(i) {
    const n = i + 1;
    return n + ([11, 12, 13].includes(n % 100) ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th'));
  }
  function columnaPosicional(expr, proyeccion, clausula, aliasPrimero, i) {
    if (expr.clase === 'literal' && expr.tipo === 'integer') {
      const destino = proyeccion[expr.valor - 1];
      if (!destino) I.fallo(ordinal(i) + ' ' + clausula + ' term out of range - should be between 1 and ' + proyeccion.length, expr.t, 'columna');
      return destino.expr;
    }
    if (aliasPrimero && expr.clase === 'columna' && !expr.tabla) {
      const destino = proyeccion.find(c => ascii(c.nombre) === ascii(expr.nombre));
      if (destino) return destino.expr;
    }
    return expr;
  }
  function prepararBloque(q, ctx, exterior) {
    const ambito = fuentes(q, ctx, exterior);
    q.proyeccion = proyectar(q, ambito, ctx);
    ambito.alias = new Map(q.proyeccion.map(c => [ascii(c.nombre), c.expr]));
    preparar(q.filtro, ambito, ctx, false);
    q.grupos = q.grupos?.map((e, i) => columnaPosicional(e, q.proyeccion, 'GROUP BY', false, i));
    for (const e of q.grupos || []) {
      preparar(e, ambito, ctx, true);
      if (contieneAgregado(e) || contieneAgregado(e.ref?.alias))
        I.fallo('aggregate functions are not allowed in the GROUP BY clause', e.t, 'agregado');
    }
    preparar(q.having, ambito, ctx);
    q.agregada = q.proyeccion.some(c => contieneAgregado(c.expr));
    if (q.having && !q.grupos && !q.agregada)
      I.fallo('HAVING clause on a non-aggregate query', q.having.t, 'agregado');
    return ambito;
  }
  function prepararConsulta(q, ctx, exterior) {
    const ambitos = q.ramas.map(b => prepararBloque(b, ctx, exterior));
    const p = q.ramas[0].proyeccion;
    for (const b of q.ramas.slice(1)) {
      if (p.length !== b.proyeccion.length)
        I.fallo('SELECTs to the left and right of UNION do not have the same number of result columns', null, 'union');
    }
    prepararOrden(q, p, ambitos[0], ctx);
    const bloque = q.ramas[0];
    const examinadas = [...p.map(c => c.expr), bloque.having, ...(q.orden || []).map(o => o.expr)];
    bloque.agregada ||= examinadas.some(contieneAgregado);
    if (bloque.agregada && !bloque.grupos && p.some(c => c.expr.clase === 'columna' && !c.expr.comoTexto))
      ctx.consejo('grupo', p[0].expr.t);
    for (const expr of Object.values(q.limite || {}))
      preparar(expr, { columnas: [], exterior }, ctx, false);
  }
  function prepararOrden(q, proyeccion, ambito, ctx) {
    for (const [i, orden] of (q.orden || []).entries()) {
      orden.expr = columnaPosicional(orden.expr, proyeccion, 'ORDER BY', true, i);
      orden.indice = proyeccion.findIndex(c => c.expr === orden.expr);
      if (q.ramas.length > 1 && orden.indice < 0) {
        orden.indice = indiceOrdenCompuesto(q.ramas, orden);
        if (orden.indice < 0)
          I.fallo(ordinal(i) + ' ORDER BY term does not match any column in the result set', orden.expr.t, 'columna');
      }
      if (orden.indice < 0) preparar(orden.expr, ambito, ctx);
    }
  }
  function indiceOrdenCompuesto(ramas, orden) {
    const firma = sql => I.tokenizar(sql).map(t =>
      t.tipo === 'id' ? ascii(t.valor) : t.tipo === 'text' ? JSON.stringify(t.valor) : t.bruto).join(' ');
    const forma = firma(orden.etiqueta);
    for (const rama of ramas) {
      const indice = rama.proyeccion.findIndex(c =>
        orden.expr.clase === 'columna' && !orden.expr.tabla && ascii(c.nombre) === ascii(orden.expr.nombre) ||
        c.etiqueta && firma(c.etiqueta) === forma);
      if (indice >= 0) return indice;
    }
    return -1;
  }
  function unir(filas, fuente, ctx, primera) {
    const datos = I.existeTabla(ctx, fuente.tabla, fuente.t).filas;
    if (primera) {
      ctx.recorre(datos.length, fuente.t);
      return datos;
    }
    if (!fuente.on && filas.length * datos.length > 25) ctx.consejo('unionSinOn', fuente.t);
    const unidas = [];
    for (const fila of filas) {
      let alguna = false;
      ctx.recorre(datos.length || 1, fuente.t);
      for (const derecha of datos) {
        const unida = fila.concat(derecha);
        if (!fuente.on || verdad(evaluar(fuente.on, { ...ctx, fila: unida }))) {
          unidas.push(unida);
          alguna = true;
        }
      }
      if (!alguna && fuente.izquierda) unidas.push(fila.concat(fuente.esquema.map(() => nulo)));
    }
    return unidas;
  }
  function agrupar(filas, q, ctx) {
    if (!q.grupos) return q.agregada ? [filas] : filas.map(f => [f]);
    const grupos = new Map();
    for (const fila of filas) {
      const valores = q.grupos.map(e => evaluar(e, { ...ctx, fila }));
      const clave = claveFila(valores);
      if (!grupos.has(clave)) grupos.set(clave, { valores, filas: [] });
      grupos.get(clave).filas.push(fila);
    }
    return [...grupos.values()].sort((a, b) => compararFilas(a.valores, b.valores)).map(g => g.filas);
  }
  function compararFilas(a, b) {
    for (let i = 0; i < a.length; i++) {
      const c = comparar(a[i], b[i]);
      if (c) return c;
    }
    return 0;
  }
  function representativa(grupo, extremo, ctx) {
    if (!extremo) return grupo[0] || [];
    let mejor = nulo, fila = grupo.at(-1) || [];
    for (const candidata of grupo) {
      const x = evaluar(extremo.args[0], { ...ctx, fila: candidata });
      if (x !== nulo && (mejor === nulo || comparar(x, mejor) * (extremo.nombre === 'MIN' ? -1 : 1) > 0)) {
        mejor = x;
        fila = candidata;
      }
    }
    return fila;
  }
  function extremos(n, encontrados) {
    if (!n) return;
    if (n.clase === 'funcion' && ['MIN', 'MAX'].includes(n.nombre) && I.agregado(n))
      encontrados.push(n);
    for (const h of I.hijos(n)) extremos(h, encontrados);
  }
  function traza(ctx, q, activa, etapa, columnas, filas) {
    if (activa && q.rangos[etapa]) ctx.pasos.push({
      etapa, ...q.rangos[etapa], columnas,
      filas: filas.map(f => f.map(x => x.valor)), total: filas.length
    });
  }
  function trazaGrupos(ctx, q, activa, etapa, grupos) {
    if (!activa || !q.rangos[etapa]) return;
    const total = CR.t ? CR.t('sql.filasGrupo') : 'filas';
    const columnas = [...(q.etiquetasGrupo || []), total];
    const filas = grupos.map(g => [...(q.grupos || []).map(e => evaluar(e, g)), I.entero(g.grupo.length)]);
    traza(ctx, q, activa, etapa, columnas, filas);
  }
  function bloque(q, ctx, activa) {
    const fuentes = q.fuentes || [];
    const nombres = fuentes.flatMap(f => f.esquema.map(c => c.nombre));
    let filas = [[]];
    fuentes.forEach((f, i) => { filas = unir(filas, f, ctx, i === 0); });
    traza(ctx, q, activa, 'FROM', nombres, filas);
    if (q.filtro) filas = filas.filter(fila => verdad(evaluar(q.filtro, { ...ctx, fila })));
    traza(ctx, q, activa, 'WHERE', nombres, filas);
    const encontrados = [];
    for (const c of q.proyeccion) extremos(c.expr, encontrados);
    extremos(q.having, encontrados);
    const extremo = encontrados.at(-1);
    let grupos = agrupar(filas, q, ctx).map(grupo => ({
      ...ctx, grupo, fila: representativa(grupo, extremo, ctx)
    }));
    trazaGrupos(ctx, q, activa, 'GROUP BY', grupos);
    if (q.having) grupos = grupos.filter(g => verdad(evaluar(q.having, g)));
    trazaGrupos(ctx, q, activa, 'HAVING', grupos);
    const columnas = q.proyeccion.map(c => c.nombre);
    let registros = grupos.map(g => ({ grupo: g, fila: q.proyeccion.map(c => evaluar(c.expr, g)) }));
    traza(ctx, q, activa, 'SELECT', columnas, registros.map(r => r.fila));
    if (q.distinto) {
      const vistas = new Set();
      registros = registros.filter(r => {
        const clave = claveFila(r.fila);
        if (vistas.has(clave)) return false;
        vistas.add(clave);
        return true;
      });
      traza(ctx, q, activa, 'DISTINCT', columnas, registros.map(r => r.fila));
    }
    return registros;
  }
  function ordenar(registros, orden) {
    const claves = r => orden.map(o => o.indice >= 0 ? r.fila[o.indice] : evaluar(o.expr, r.grupo));
    return registros.map(r => ({ ...r, claves: claves(r) })).sort((a, b) => {
      for (let i = 0; i < orden.length; i++) {
        const c = comparar(a.claves[i], b.claves[i]);
        if (c) return orden[i].desc ? -c : c;
      }
      return 0;
    });
  }
  function acotar(registros, q, ctx) {
    const enteroLimite = expr => {
      const x = I.numero(evaluar(expr, ctx), true);
      if (!I.esNumero(x) || !Number.isInteger(x.valor)) I.fallo('datatype mismatch', expr.t, 'tipo');
      return x.valor;
    };
    const { cantidad, offset } = q.limite;
    const n = enteroLimite(cantidad);
    const inicio = offset ? Math.max(0, enteroLimite(offset)) : 0;
    return registros.slice(inicio, n < 0 ? undefined : inicio + n);
  }
  function consultar(q, previo, activa = true) {
    const ctx = { ...previo, padre: previo, fila: [] };
    const columnas = q.ramas[0].proyeccion.map(c => c.nombre);
    let registros = bloque(q.ramas[0], ctx, activa);
    for (let i = 1; i < q.ramas.length; i++) {
      registros = registros.concat(bloque(q.ramas[i], ctx, activa));
      if (!q.uniones[i - 1]) {
        const filas = [...new Map(registros.map(r => [claveFila(r.fila), r.fila])).values()].sort(compararFilas);
        registros = filas.map(fila => ({ fila }));
      }
    }
    if (q.orden) {
      registros = ordenar(registros, q.orden);
      traza(ctx, q, activa, 'ORDER BY', columnas, registros.map(r => r.fila));
    }
    if (q.limite) {
      registros = acotar(registros, q, ctx);
      traza(ctx, q, activa, 'LIMIT', columnas, registros.map(r => r.fila));
    }
    return { columnas, filas: registros.map(r => r.fila), cambios: 0 };
  }
  Object.assign(I, { prepararConsulta, consultar });
})();
