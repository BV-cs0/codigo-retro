(function () {
  'use strict';
  const traducir = typeof module !== 'undefined' ? require('../comun/idioma').t : globalThis.CR.t;
  const nodo = typeof module !== 'undefined';
  const Py = nodo ? require('./py/interprete') : window.CR.Py;
  const Tablero = nodo ? require('../comun/tablero') : window.CR.Tablero;
  const Robot = nodo ? require('../robot/mundo') : window.CR.MundoRobot;
  const Granja = nodo ? require('../granja/mundo') : window.CR.MundoGranja;
  const Mago = nodo ? require('../mago/mundo') : window.CR.MundoMago;
  const DemoIdioma = nodo ? require('../comun/demo-idioma') : window.CR.DemoIdioma;
  const motores = { robot: Robot, mago: Mago, granja: Granja };
  function mundo(config, idioma) {
    if (!config) return null;
    const { demo, mapa } = config;
    const tablero = demo === 'granja' || mapa.celdas ? mapa : Tablero.mapa(mapa.trazo, mapa.objetos, mapa.inicio);
    const motor = DemoIdioma.crearMundo(motores[demo].crear, idioma)(tablero);
    const comprobar = (nombre, args, cantidad) => {
      if (args.length !== cantidad) throw new Error(nombre + traducir("comun.espera") + cantidad + traducir("comun.argumentos"));
    };
    const integradas = Object.fromEntries([
      ...motor.acciones.map(n => [n, (...args) => {
        comprobar(n, args, ['vender', 'abrir'].includes(DemoIdioma.espanol[n] ?? n) ? 1 : 0);
        const r = motor.accion(n, args);
        if (!r.ok) throw new Error(r.mensaje);
      }]),
      ...motor.sensores.map(n => [n, (...args) => {
        comprobar(n, args, 0);
        return motor.sensor(n);
      }])
    ]);
    return { motor, integradas };
  }
  function terminar(programa, salida = '') {
    let estado;
    do {
      estado = programa.paso();
      salida += estado.salida;
    } while (!estado.hecho && !estado.esperandoEntrada);
    return { ...estado, salida };
  }
  const normal = salida => salida.replace(/\r\n/g, '\n').split('\n').map(l => l.trimEnd()).join('\n').replace(/\n$/, '');
  const lineas = salida => normal(salida) ? normal(salida).split('\n').map(s => '«' + s + '»').join(', ') : traducir("curso.ninguna_linea");
  function evaluar(paso, programa, resultado, partida) {
    if (resultado.error) return resultado.error.mensaje;
    if (paso.salidaEsperada !== undefined && normal(resultado.salida) !== normal(paso.salidaEsperada)) {
      return traducir("curso.tu_programa_imprimio") + lineas(resultado.salida) + traducir("curso.se_esperaba_2") + lineas(paso.salidaEsperada) + '.';
    }
    for (const requisito of paso.requiere || []) {
      if (!Py.contiene(programa.ast, requisito)) return traducir("curso.este_paso_pide_usar") + requisito + '.';
    }
    if (partida && !partida.motor.ganado()) return traducir("curso.el_programa_termino_y_el");
    for (const prueba of paso.pruebas || []) {
      const r = terminar(Py.ejecutar(prueba.codigo, { global: programa.global, entradas: [] }));
      if (r.error || normal(r.salida) !== normal(prueba.salida)) {
        return traducir("curso.al_probar") + prueba.codigo + traducir("curso.se_esperaba_3") + lineas(prueba.salida) + '. ' +
          (r.error ? r.error.tipo + '. ' + r.error.mensaje : traducir("curso.se_obtuvo") + lineas(r.salida) + '.');
      }
    }
    return '';
  }
  function comprobar(paso, codigo) {
    const filas = paso.casos.map(caso => {
      const programa = Py.ejecutar(codigo, { entradas: caso.entradas || [], aleatorios: caso.aleatorios });
      const r = terminar(programa);
      const mensaje = caso.error && r.error?.tipo !== caso.error ? traducir("curso.se_esperaba_4") + caso.error + '.' :
        evaluar(paso, programa, caso.error === r.error?.tipo ? { ...r, error: null } : r);
      const esperadas = caso.salida.split('\n'), obtenidas = r.salida.split('\n');
      const distinta = Array.from({ length: Math.max(esperadas.length, obtenidas.length) }, (_, i) => i)
        .find(i => esperadas[i] !== obtenidas[i]);
      return { ok: !mensaje && distinta === undefined, entradas: caso.entradas || [],
        diferencia: distinta !== undefined, esperada: esperadas[distinta], obtenida: obtenidas[distinta], mensaje };
    });
    return { filas, ok: filas.every(f => f.ok) };
  }
  const ValidarCurso = { mundo, terminar, evaluar, normal, comprobar };
  if (nodo) module.exports = ValidarCurso;
  else window.CR.ValidarCurso = ValidarCurso;
})();
