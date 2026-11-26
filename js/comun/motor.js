(function () {
  'use strict';
  const traducir = typeof module !== 'undefined' ? require('./idioma').t : globalThis.CR.t;
  const limite = traducir("comun.tu_programa_no_termina_nunca");
  const propio = (obj, nombre) => Object.hasOwn(obj, nombre);
  const operaciones = {
    '+': (a, b) => Number(a) + Number(b),
    '-': (a, b) => Number(a) - Number(b),
    '==': (a, b) => Number(a) === Number(b),
    '!=': (a, b) => Number(a) !== Number(b),
    '<': (a, b) => a < b,
    '>': (a, b) => a > b
  };

  function crearEjecucion(programa, mundo, opciones = {}) {
    const raiz = nuevoAmbito();
    const estado = { mundo, opciones, ambito: raiz, locales: new WeakMap(), internos: 0, acciones: 0, instr: null };
    const recorrido = ejecutarBloque(programa, estado, raiz);
    let terminado = false;
    return {
      get variables() { return variablesVisibles(estado.ambito); },
      paso() {
        if (terminado) return { hecho: true, instr: null, error: null };
        try {
          const paso = recorrido.next();
          terminado = paso.done;
          return { hecho: terminado, instr: paso.value || null, error: null };
        } catch (error) {
          terminado = true;
          return { hecho: true, instr: estado.instr, error: error.message };
        }
      }
    };
  }

  function consumir(estado) {
    if (++estado.internos > 5000) throw new Error(limite);
  }

  function nuevoAmbito(exterior = null, locales = new Set()) {
    return { exterior, locales, valores: Object.create(null) };
  }

  function variablesVisibles(ambito) {
    const variables = Object.create(null);
    const ocultos = new Set();
    for (let actual = ambito; actual; actual = actual.exterior) {
      for (const [nombre, valor] of Object.entries(actual.valores)) {
        if (!ocultos.has(nombre) && typeof valor !== 'object') variables[nombre] = valor;
        ocultos.add(nombre);
      }
      for (const nombre of actual.locales) ocultos.add(nombre);
    }
    return { ...variables };
  }

  function nombresLocales(programa, cache) {
    if (cache.has(programa)) return cache.get(programa);
    const nombres = new Set();
    const pendientes = [...programa];
    while (pendientes.length) {
      const instr = pendientes.pop();
      if (instr.tipo === 'asignar') nombres.add(instr.variable);
      if (instr.tipo === 'definir') nombres.add(instr.nombre);
      for (const bloque of [instr.entonces, instr.sino, instr.tipo === 'repetir' ? instr.cuerpo : null]) {
        if (bloque) for (const hija of bloque) pendientes.push(hija);
      }
    }
    cache.set(programa, nombres);
    return nombres;
  }

  function buscar(ambito, nombre) {
    for (let actual = ambito; actual; actual = actual.exterior) {
      if (propio(actual.valores, nombre)) return actual.valores[nombre];
      if (actual.locales.has(nombre)) break;
    }
    return undefined;
  }

  function valor(expr, estado) {
    consumir(estado);
    switch (expr.tipo) {
      case 'numero': return expr.valor;
      case 'variable': {
        const dato = buscar(estado.ambito, expr.nombre);
        if (dato !== undefined && typeof dato !== 'object') return dato;
        throw new Error(traducir("comun.la_variable_v0_todavia_no", { v0: expr.nombre }));
      }
      case 'sensor':
        if (!estado.mundo.sensores.includes(expr.nombre)) {
          throw new Error(traducir("comun.no_conozco_el_sensor_v0", { v0: expr.nombre }));
        }
        return estado.mundo.sensor(expr.nombre, expr.args.map(arg => valor(arg, estado)));
      case 'binaria': return operaciones[expr.op](valor(expr.izq, estado), valor(expr.der, estado));
      case 'no': return !valor(expr.expr, estado);
      default: throw new Error(traducir("comun.no_entiendo_esta_expresion"));
    }
  }

  function* ejecutarBloque(programa, estado, ambito) {
    const pila = [{ programa, indice: 0, vueltas: 1, ambito }];
    while (pila.length) {
      consumir(estado);
      const marco = pila[pila.length - 1];
      if (marco.indice === marco.programa.length) {
        if (--marco.vueltas) marco.indice = 0;
        else pila.pop();
        continue;
      }
      const instr = marco.programa[marco.indice++];
      estado.instr = instr;
      estado.ambito = marco.ambito;
      const bloque = ejecutarInstruccion(instr, estado);
      if (bloque) pila.push({ ambito: marco.ambito, ...bloque });
      if (instr.tipo === 'accion') {
        yield instr;
        if (estado.opciones.detenerAlGanar && estado.mundo.ganado()) return;
      }
    }
    estado.ambito = ambito;
  }

  function ejecutarInstruccion(instr, estado) {
    switch (instr.tipo) {
      case 'accion': {
        if (++estado.acciones > 1000) throw new Error(limite);
        if (!estado.mundo.acciones.includes(instr.nombre)) {
          throw new Error(traducir("comun.no_conozco_la_orden_v0", { v0: instr.nombre }));
        }
        const resultado = estado.mundo.accion(instr.nombre, instr.args.map(arg => valor(arg, estado)));
        if (!resultado.ok) throw new Error(resultado.mensaje);
        break;
      }
      case 'asignar': estado.ambito.valores[instr.variable] = valor(instr.valor, estado); break;
      case 'definir':
        estado.ambito.valores[instr.nombre] = { programa: instr.cuerpo, exterior: estado.ambito };
        break;
      case 'llamar': {
        const funcion = buscar(estado.ambito, instr.nombre);
        if (!funcion || typeof funcion !== 'object') {
          throw new Error(traducir("comun.la_funcion_v0_todavia_no", { v0: instr.nombre }));
        }
        const locales = nombresLocales(funcion.programa, estado.locales);
        return { programa: funcion.programa, indice: 0, vueltas: 1, ambito: nuevoAmbito(funcion.exterior, locales) };
      }
      case 'si':
        return { programa: valor(instr.condicion, estado) ? instr.entonces : instr.sino,
          indice: 0, vueltas: 1 };
      case 'repetir': {
        const vueltas = Number(valor(instr.veces, estado));
        if (!Number.isInteger(vueltas) || vueltas < 0 || vueltas > 50) {
          throw new Error(traducir("comun.usa_un_numero_entero_entre"));
        }
        if (vueltas) return { programa: instr.cuerpo, indice: 0, vueltas };
        break;
      }
      default: throw new Error(traducir("comun.no_entiendo_esta_instruccion"));
    }
    return null;
  }

  function* recorrer(programa) {
    for (const instr of programa) {
      yield instr;
      for (const bloque of [instr.cuerpo, instr.entonces, instr.sino]) {
        if (bloque) yield* recorrer(bloque);
      }
    }
  }

  const Motor = {
    crearEjecucion,
    contarInstrucciones: programa => Array.from(recorrer(programa)).length,
    usaConcepto: (programa, concepto) => Array.from(recorrer(programa)).some(i => i.tipo === concepto)
  };
  if (typeof window !== 'undefined') (window.CR ||= {}).Motor = Motor;
  if (typeof module !== 'undefined') module.exports = Motor;
})();
