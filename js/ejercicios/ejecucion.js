(function () {
  'use strict';
  const traducir = typeof module !== 'undefined' ? require('../comun/idioma').t : globalThis.CR.t;
  const { Py, Sonido } = window.CR;
  const $ = id => document.getElementById(id);
  const nodo = (tag, texto) => Object.assign(document.createElement(tag), { textContent: texto });
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

  function mostrarError(error) {
    if (!error) return;
    $('error-consola').textContent = error.tipo + traducir("curso.linea") + error.linea + ')\n' + error.mensaje;
    $('error-original').textContent = error.tipo + ': ' + (error.original ?? error.mensaje);
  }

  function ejecutarBash(codigo, ficha) {
    const r = window.CR.Shell.Bash.correr(codigo, ficha);
    $('salida').textContent = r.salida + traducir("curso.salio_con_codigo") + r.codigo + ']';
    $('error-consola').textContent = r.stderr;
    $('error-original').textContent = r.guia.join('\n');
    mostrar({ variables: Object.fromEntries(Object.entries(r.variables).filter(([, v]) => v !== undefined)), llamadas: [] });
  }

  function conectarEntrada(ciclo, activo) {
    $('entrada-terminal').onsubmit = e => {
      e.preventDefault();
      const texto = $('entrada').value;
      $('salida').append(Object.assign(nodo('span', texto + '\n'), { className: 'eco-terminal' }));
      $('entrada-terminal').hidden = true;
      ciclo(texto);
      if (!activo()) $('ejecutar').focus();
    };
  }

  function crear(editor, bloqueo) {
    let programa, temporizador;
    function detener() {
      clearTimeout(temporizador);
      programa = null;
      $('entrada-terminal').hidden = true;
      bloqueo(false);
    }
    function limpiar() {
      detener();
      for (const id of ['salida', 'error-consola', 'error-original']) $(id).textContent = '';
      editor.destacar(0);
      mostrar({ variables: {}, llamadas: [traducir("curso.programa_principal")] });
    }
    function terminar(r) {
      detener();
      editor.destacar(r.error?.linea || 0, r.error?.tipo);
      mostrarError(r.error);
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
      if (ficha?.lenguaje === 'bash') return ejecutarBash(codigo, ficha);
      programa = Py.ejecutar(codigo);
      bloqueo(true);
      ciclo();
    }
    conectarEntrada(ciclo, () => Boolean(programa));
    return { ejecutar, limpiar, detener };
  }
  window.CR.EjecucionTaller = { crear };
})();
