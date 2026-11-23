(function () {
  'use strict';
  const { Py, Sonido } = window.CR;
  const $ = id => document.getElementById(id);
  const nodo = (tag, texto) => Object.assign(document.createElement(tag), { textContent: texto });
  function crear(editor, bloqueo) {
    let programa, temporizador;
    function detener() {
      clearTimeout(temporizador);
      programa = null;
      $('entrada-terminal').hidden = true;
      bloqueo(false);
    }
    function mostrar(estado) {
      $('variables').replaceChildren(...Object.entries(estado.variables).map(([n, v]) => {
        const fila = nodo('tr', '');
        fila.append(Object.assign(nodo('th', n), { scope: 'row' }), nodo('td', v));
        return fila;
      }));
      $('llamadas').replaceChildren(...estado.llamadas.map(l => nodo('li', l)));
      const terminal = $('salida').parentElement;
      terminal.scrollTop = terminal.scrollHeight;
    }
    function limpiar() {
      detener();
      for (const id of ['salida', 'error-consola', 'error-original']) $(id).textContent = '';
      editor.destacar(0);
      mostrar({ variables: {}, llamadas: ['programa principal'] });
    }
    function terminar(r) {
      detener();
      editor.destacar(r.error?.linea || 0, r.error?.tipo);
      if (!r.error) return;
      $('error-consola').textContent = r.error.tipo + ' (línea ' + r.error.linea + ')\n' + r.error.mensaje;
      $('error-original').textContent = r.error.tipo + ': ' + (r.error.original ?? r.error.mensaje);
    }
    function ciclo(entrada) {
      let r;
      for (let i = 0; i < 250; i++) {
        r = programa.paso(i ? undefined : entrada);
        if (r.salida) $('salida').append(r.salida);
        if (r.hecho || r.esperandoEntrada) break;
      }
      mostrar(r);
      if (r.hecho) terminar(r);
      else if (r.esperandoEntrada) {
        $('entrada-terminal').hidden = false;
        $('entrada').value = '';
        $('entrada').focus();
      } else temporizador = setTimeout(ciclo, 0);
    }
    function ejecutar(codigo, ficha) {
      limpiar();
      Sonido.activar();
      if (ficha?.lenguaje === 'bash') {
        const r = window.CR.Shell.Bash.correr(codigo, ficha);
        $('salida').textContent = r.salida + '[salió con código ' + r.codigo + ']';
        $('error-consola').textContent = r.stderr;
        $('error-original').textContent = r.guia.join('\n');
        mostrar({ variables: Object.fromEntries(Object.entries(r.variables).filter(([, v]) => v !== undefined)), llamadas: [] });
        return;
      }
      programa = Py.ejecutar(codigo);
      bloqueo(true);
      ciclo();
    }
    $('entrada-terminal').onsubmit = e => {
      e.preventDefault();
      const texto = $('entrada').value;
      $('salida').append(Object.assign(nodo('span', texto + '\n'), { className: 'eco-terminal' }));
      $('entrada-terminal').hidden = true;
      ciclo(texto);
      if (!programa) $('ejecutar').focus();
    };
    return { ejecutar, limpiar, detener };
  }
  window.CR.EjecucionTaller = { crear };
})();
