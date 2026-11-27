(function (CR) {
  'use strict';
  const $ = id => document.getElementById(id);
  const nodo = (tag, texto = '') => Object.assign(document.createElement(tag), { textContent: texto });
  const boton = (texto, onclick) => Object.assign(nodo('button', texto), { type: 'button', onclick });
  const t = (clave, datos) => CR.t('sql.' + clave, datos);
  function celda(valor, tipo) {
    const numero = typeof valor === 'number';
    const texto = valor === null ? 'NULL' : tipo === 'real' && Number.isInteger(valor) ? CR.sqlInterno.comoTexto(CR.sqlInterno.real(valor)) : String(valor);
    const td = nodo('td', texto);
    td.className = valor === null ? 'nulo' : numero ? 'num' : '';
    return td;
  }
  function tabla(datos, clases = [], etiqueta = t('resultados')) {
    const caja = nodo('div');
    caja.className = 'tabla-sql';
    caja.tabIndex = 0;
    caja.setAttribute('role', 'region');
    caja.setAttribute('aria-label', etiqueta);
    const tabla = nodo('table'), cabeza = nodo('thead'), titulos = nodo('tr'), cuerpo = nodo('tbody');
    for (const nombre of datos.columnas) {
      const th = nodo('th', nombre);
      th.scope = 'col';
      titulos.append(th);
    }
    cabeza.append(titulos);
    for (const [i, fila] of datos.filas.entries()) {
      const tr = nodo('tr');
      tr.className = clases[i] || '';
      tr.append(...fila.map((v, j) => celda(v, datos.tipos?.[i]?.[j])));
      cuerpo.append(tr);
    }
    tabla.append(cabeza, cuerpo);
    caja.append(tabla);
    return caja;
  }
  function diferencias(actual, anterior) {
    const filas = actual?.filas.slice() || [];
    const viejas = new Map(anterior?.filas.map((f, i) => [anterior.ids[i], f]));
    const clases = filas.map((fila, i) => {
      const id = actual.ids[i], previa = viejas.get(id);
      viejas.delete(id);
      return !previa ? 'nuevo' : JSON.stringify(previa) === JSON.stringify(fila) ? '' : 'modificado';
    });
    for (const fila of viejas.values()) {
      filas.push(fila);
      clases.push('borrado');
    }
    return { filas, clases };
  }
  function tablas(actual, anterior = actual) {
    const nombres = new Set([...Object.keys(actual), ...Object.keys(anterior)]);
    $('tablas').replaceChildren(...[...nombres].map(nombre => {
      const datos = actual[nombre] || anterior[nombre];
      const { filas, clases } = diferencias(actual[nombre], anterior[nombre]);
      const columnas = datos.columnas.map(c => c.nombre);
      const tipos = filas.map(f => f.map((v, i) => typeof v === 'number' && datos.columnas[i].tipo === 'REAL' ? 'real' : ''));
      const bloque = nodo('section');
      bloque.append(nodo('h4', nombre), tabla({ filas, columnas, tipos }, clases, nombre));
      return bloque;
    }));
  }
  function mostrar(r, salida = $('salida')) {
    $('error-sql').textContent = r.error?.mensaje || '';
    $('explicacion-error').textContent = r.error?.explicacion || '';
    $('consejos').replaceChildren(...r.consejos.map(({ clave, datos }) =>
      nodo('li', t('consejo_' + clave, { nombre: datos[0], alias: datos[0], columna: datos[1] }))));
    salida.replaceChildren(...r.resultados.flatMap(x => {
      if (x.columnas.length) return [tabla(x), nodo('p', t(x.filas.length === 1 ? 'fila' : 'filas', { n: x.filas.length }))];
      if (['insert', 'update', 'delete'].includes(x.sentencia)) return [nodo('p', t(x.cambios === 1 ? 'cambio' : 'cambios', { n: x.cambios }))];
      return [];
    }));
  }
  function texto(linea) {
    const p = nodo('p');
    linea.split('`').forEach((parte, i) => p.append(i % 2 ? nodo('code', parte) : parte));
    return p;
  }
  CR.VistasSQL = { $, nodo, boton, t, tabla, tablas, mostrar, texto };
})(globalThis.CR);
