(function (CR) {
  'use strict';
  const claveFila = fila => JSON.stringify(fila);
  const comparar = (a, b) => claveFila(a) === claveFila(b);
  const ultima = r => r.resultados.filter(x => x.columnas.length).at(-1);
  function comprobarResultado(real, esperado) {
    if (!real) return { clave: 'faltaConsulta' };
    const falta = esperado.columnas?.find(c => !real.columnas.includes(c));
    if (falta) return { clave: 'faltaColumna', datos: { nombre: falta } };
    if (esperado.columnas && !comparar(real.columnas, esperado.columnas)) return { clave: 'columnas' };
    if (real.filas.length !== esperado.filas.length)
      return { clave: 'cantidad', datos: { real: real.filas.length, esperado: esperado.filas.length } };
    const claves = filas => filas.map(claveFila).sort();
    if (!comparar(claves(real.filas), claves(esperado.filas))) return { clave: 'valores' };
    if (esperado.orden && !comparar(real.filas, esperado.filas)) return { clave: 'orden' };
    return null;
  }
  function comprobarCaso(paso, caso, sql, inicial, parametros) {
    const bd = CR.SQL.crear(caso.bd || paso.bd || inicial);
    const r = bd.ejecutar(sql, caso.parametros ?? parametros);
    if (r.error) return { clave: 'error', error: r.error };
    const requiere = [paso.requiere || []].flat();
    const falta = requiere.find(k => !r.marcas.includes(k));
    if (falta) return { clave: 'requiere', datos: { nombre: CR.t('sql.requiere_' + falta) } };
    for (const [nombre, esperado] of Object.entries(caso.tablas || {})) {
      const tabla = bd.tablas()[nombre];
      const pk = tabla?.columnas.findIndex(c => c.pk);
      if (!tabla) return { clave: 'faltaTabla', datos: { nombre } };
      const filas = pk < 0 ? tabla.filas : tabla.filas.sort((a, b) => a[pk] < b[pk] ? -1 : Number(a[pk] > b[pk]));
      const fallo = comprobarResultado({ ...tabla, filas }, { ...esperado, orden: true });
      if (fallo) return fallo;
    }
    if (!caso.resultado) return null;
    const consulta = caso.consulta ? bd.ejecutar(caso.consulta) : r;
    if (consulta.error) return { clave: 'error', error: consulta.error };
    return comprobarResultado(ultima(consulta), caso.resultado);
  }
  function comprobar(paso, sql, inicial, parametros = []) {
    for (const caso of paso.casos || []) {
      const fallo = comprobarCaso(paso, caso, sql, inicial, parametros);
      if (fallo) return fallo;
    }
    return null;
  }
  function formulario(paso, valores, inicial) {
    const parametros = [];
    const campos = new Set(paso.campos.map(c => c.nombre));
    const patron = paso.modo === 'parametros' ? /'\{(\w+)\}'|\{(\w+)\}/g : /\{(\w+)\}/g;
    const sql = paso.plantilla.replace(patron, (hueco, a, b) => {
      const nombre = a || (typeof b === 'string' ? b : '');
      if (!campos.has(nombre)) return hueco;
      const valor = String(valores[nombre] ?? '');
      if (paso.modo !== 'parametros') return valor;
      parametros.push(valor);
      return '?';
    });
    const bd = CR.SQL.crear(paso.bd || inicial);
    const resultado = bd.ejecutar(sql, parametros);
    const tabla = ultima(resultado);
    const conFilas = Boolean(!resultado.error && tabla?.filas.length);
    const mensaje = paso.mensajes[resultado.error ? 'error' : conFilas ? 'conFilas' : 'sinFilas']
      .replace(/\{(\w+)\}/g, (_, c) => String(tabla?.filas[0]?.[tabla.columnas.indexOf(c)] ?? ''));
    return { sql, parametros, resultado, conFilas, mensaje, valores, tabla };
  }
  // Un caso del formulario puede pedir: error (la página falla), conFilas, primeraFila { columna: valor },
  // contiene (un valor que debe salir en alguna celda) y escrito { campo: texto } (lo que la persona tuvo que escribir).
  function casoFormulario(caso, obtenido) {
    if (Boolean(caso.error) !== Boolean(obtenido.resultado.error)) return false;
    if (caso.error) return true;
    if (caso.conFilas !== undefined && caso.conFilas !== obtenido.conFilas) return false;
    const { tabla, valores = {} } = obtenido;
    const primera = tabla?.filas[0] || [];
    const columna = nombre => tabla?.columnas.indexOf(nombre) ?? -1;
    if (Object.entries(caso.primeraFila || {}).some(([c, v]) => columna(c) < 0 || primera[columna(c)] !== v)) return false;
    if (caso.contiene !== undefined && !tabla?.filas.some(f => f.includes(caso.contiene))) return false;
    return !Object.entries(caso.escrito || {}).some(([campo, texto]) => !String(valores[campo] ?? '').includes(texto));
  }
  function formularioCorrecto(paso, obtenido) {
    return (paso.casos || []).some(c => casoFormulario(c, obtenido));
  }
  function leerParametros(texto) {
    if (!texto.trim()) return [];
    const tokens = texto.match(/"(?:\\.|[^"\\])*"|'(?:''|[^'])*'|[^,]+|,/g) || [];
    const valores = [''];
    for (const t of tokens) {
      if (t === ',') valores.push('');
      else valores[valores.length - 1] += t;
    }
    return valores.map(t => {
      const v = t.trim();
      if (/^null$/i.test(v)) return null;
      if (/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(v)) {
        const n = Number(v);
        return /[.e]/i.test(v) ? { tipo: 'real', valor: n } : n;
      }
      if (v.startsWith('"') && v.endsWith('"')) {
        try { return JSON.parse(v); } catch { return v; }
      }
      if (v.startsWith("'") && v.endsWith("'")) return v.slice(1, -1).replaceAll("''", "'");
      return v;
    });
  }
  CR.ValidarSQL = { comprobar, comprobarResultado, ultima, formulario, formularioCorrecto, leerParametros };
})(globalThis.CR);
