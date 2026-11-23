(function (CR) {
  'use strict';
  const $ = id => document.getElementById(id);
  const { Misiones, SFA, Ayuda } = CR.Shell;
  const progreso = CR.ProgresoFaro;
  function nodo(tipo, texto, clase) {
    const n = document.createElement(tipo);
    if (texto !== undefined) n.textContent = texto;
    if (clase) n.className = clase;
    return n;
  }
  function ejemplo(comando) {
    return Ayuda.fichas[comando]?.ejemplos.find(l => l.startsWith(comando + ' ') || l === comando) ??
      (comando === './encender.sh' ? './encender.sh' : comando);
  }
  function chuleta(comandos, destino) {
    const dl = nodo('dl');
    for (const comando of comandos) dl.append(nodo('dt', comando), nodo('dd', ejemplo(comando)));
    destino.replaceChildren(dl);
  }
  function mapa(sesion) {
    function rama(ruta, lista) {
      const item = nodo('li');
      const visible = sesion.visitadas.has(ruta);
      const texto = visible ? '▾ ' + SFA.nombre(ruta) : '▸ ???';
      const rotulo = nodo('span', texto);
      if (ruta === sesion.cwd) rotulo.setAttribute('aria-current', 'location');
      item.append(rotulo);
      lista.append(item);
      if (!visible) return;
      const entradas = sesion.fs.hijos(ruta).filter(p => sesion.fs.nodos.get(p).carpeta || !SFA.nombre(p).startsWith('.')).sort();
      if (!entradas.length) return;
      const hijos = nodo('ul');
      item.append(hijos);
      for (const hija of entradas) {
        if (sesion.fs.nodos.get(hija).carpeta) rama(hija, hijos);
        else hijos.append(nodo('li', SFA.nombre(hija)));
      }
    }
    const lista = nodo('ul');
    if (sesion.fs.nodos.has('/')) rama('/', lista);
    $('mapa').replaceChildren(lista);
  }
  function objetivos(mision, sesion) {
    const estados = Misiones.objetivos(mision, sesion);
    $('objetivos').replaceChildren(...mision.objetivos.map((o, i) =>
      nodo('li', (estados[i] ? '✔ ' : '□ ') + o.texto, estados[i] ? 'hecho' : '')));
    return estados.every(Boolean);
  }
  function capitulos(total) {
    $('progreso-capitulos').textContent = progreso.total() + ' / ' + total + ' misiones';
    const fichas = Misiones.capitulos.map(c => {
      const ficha = nodo('section', undefined, 'faro-panel');
      const listas = nodo('ol');
      for (const m of c.misiones) {
        const item = nodo('li');
        const a = nodo('a', (progreso.hecha(m.id) ? '✔ ' : '') + m.titulo);
        a.href = '#mision-' + m.id;
        item.append(a);
        listas.append(item);
      }
      ficha.append(nodo('h3', c.titulo), listas);
      return ficha;
    });
    $('lista-capitulos').replaceChildren(...fichas);
  }
  function pestanas() {
    const tabs = [$('tab-chuleta'), $('tab-mapa')];
    function abrir(actual, foco) {
      for (const [i, tab] of tabs.entries()) {
        tab.setAttribute('aria-selected', String(i === actual));
        tab.tabIndex = i === actual ? 0 : -1;
        $(tab.getAttribute('aria-controls')).hidden = i !== actual;
      }
      if (foco) tabs[actual].focus();
    }
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => abrir(i, false));
      tab.addEventListener('keydown', e => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
        e.preventDefault();
        abrir(e.key === 'Home' ? 0 : e.key === 'End' ? 1 : 1 - i, true);
      });
    });
  }
  CR.PanelesFaro = { $, nodo, chuleta, mapa, objetivos, capitulos, pestanas };
})(globalThis.CR);
