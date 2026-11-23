(function (CR) {
  'use strict';
  const { SFA, Ejecutor } = CR.Shell;
  function candidatos(fragmento, comandos, s) {
    const ruta = fragmento;
    const corte = ruta.lastIndexOf('/') + 1;
    const prefijo = ruta.slice(0, corte);
    const inicio = ruta.slice(corte);
    let rutas = [];
    try {
      rutas = s.fs.listar(s.ruta(prefijo || '.')).map(p => {
        const nombre = SFA.nombre(p);
        if (!nombre.startsWith(inicio) || (nombre.startsWith('.') && !inicio.startsWith('.'))) return '';
        const sufijo = s.fs.nodos.get(p).carpeta ? '/' : '';
        return (prefijo + nombre + sufijo).replace(/[ \t"'\\|;<>*&?[$]/g, '\\$&');
      }).filter(Boolean);
    } catch {}
    const nombres = comandos && !prefijo ? Ejecutor.comandos.filter(n => n.startsWith(ruta)) : [];
    return [...new Set([...nombres, ...rutas])].sort();
  }
  function fragmento(antes) {
    let inicio = 0;
    let texto = '';
    let comilla = '';
    let comando = true;
    for (let i = 0; i < antes.length; i++) {
      const c = antes[i];
      if (c === '\\' && comilla !== "'" && i + 1 < antes.length &&
        (!comilla || /["\\$]/.test(antes[i + 1]))) {
        texto += antes[++i];
      } else if (c === comilla) comilla = '';
      else if (!comilla && (c === '"' || c === "'")) comilla = c;
      else if (!comilla && /[\s;|&<>]/.test(c)) {
        if (';|&'.includes(c)) comando = true;
        else if ('<>'.includes(c) || i > inicio) comando = false;
        inicio = i + 1;
        texto = '';
      } else texto += c;
    }
    return { inicio, texto, comando };
  }
  function sugerir(linea, cursor, s) {
    const antes = linea.slice(0, cursor);
    const { inicio, texto, comando } = fragmento(antes);
    const lista = candidatos(texto, comando, s);
    if (!lista.length) return { lista };
    let comun = lista[0];
    for (const item of lista) while (!item.startsWith(comun)) comun = comun.slice(0, -1);
    if (lista.length === 1 && !comun.endsWith('/')) comun += ' ';
    return { lista, nuevo: antes.slice(0, inicio) + comun + linea.slice(cursor), cursor: inicio + comun.length };
  }
  function conectar(input, sesion, eventos) {
    let indice = 0;
    let borrador = '';
    let tab = null;
    function reset() { indice = sesion().historial.length; borrador = ''; tab = null; }
    function historial(delta) {
      const ls = sesion().historial;
      if (indice === ls.length) borrador = input.value;
      indice = Math.min(ls.length, Math.max(0, indice + delta));
      input.value = ls[indice] ?? borrador;
      input.setSelectionRange(input.value.length, input.value.length);
    }
    function completar() {
      const estado = input.value + '\0' + input.selectionStart;
      if (tab?.estado === estado) { eventos.listar(tab.lista); tab = null; return; }
      const propuesta = sugerir(input.value, input.selectionStart, sesion());
      if (!propuesta.lista.length) return;
      input.value = propuesta.nuevo;
      input.setSelectionRange(propuesta.cursor, propuesta.cursor);
      if (propuesta.lista.length > 1) tab = { estado: input.value + '\0' + propuesta.cursor, lista: propuesta.lista };
    }
    input.addEventListener('keydown', e => {
      const tecla = e.key;
      if (e.ctrlKey && tecla.toLowerCase() === 'c' && (getSelection()?.toString() || input.selectionStart !== input.selectionEnd)) return;
      if (e.ctrlKey && ['l', 'c'].includes(tecla.toLowerCase())) {
        e.preventDefault();
        if (tecla.toLowerCase() === 'l') eventos.limpiar();
        else { eventos.cancelar(); input.value = ''; reset(); }
      } else if (tecla === 'ArrowUp' || tecla === 'ArrowDown') {
        e.preventDefault(); tab = null; historial(tecla === 'ArrowUp' ? -1 : 1);
      } else if (tecla === 'Tab' && !e.shiftKey && input.value && !sesion().pendiente) {
        e.preventDefault(); completar();
      } else tab = null;
    });
    input.addEventListener('input', () => { tab = null; });
    return { reset };
  }
  CR.TecladoFaro = { conectar };
})(globalThis.CR);
