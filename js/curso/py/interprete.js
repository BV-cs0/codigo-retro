(function () {
  'use strict';
  const traducir = typeof module !== 'undefined' ? require('../../comun/idioma').t : globalThis.CR.t;
  const [S, V, I] = typeof module !== 'undefined' ? [require('./sintaxis'), require('./valores'), require('./integradas')] :
    [window.CR.PySintaxis, window.CR.PyValores, window.CR.PyIntegradas];
  const M = typeof module !== 'undefined' ? require('./modulos') : window.CR.PyModulos;
  const excepciones = 'Exception ValueError TypeError ZeroDivisionError KeyError IndexError NameError RuntimeError EOFError ModuleNotFoundError AttributeError'.split(' ');
  const nombresDestino = d => d?.tipo === 'nombre' ? [d.nombre] : d?.tipo === 'tupla' ? d.items.flatMap(nombresDestino) : [];
  function locales(cuerpo, nombres = new Set()) {
    for (const s of cuerpo) {
      if (s.tipo === 'def' || s.tipo === 'except' && s.nombre) nombres.add(s.nombre);
      for (const nombre of nombresDestino(s.destino)) nombres.add(nombre);
      if (s.tipo === 'import') for (const { alias } of s.nombres) nombres.add(alias);
      if (s.cuerpo && s.tipo !== 'def') locales(s.cuerpo, nombres);
      if (s.ramas) locales(s.ramas, nombres);
    }
    return nombres;
  }
  function contiene(n, requisito) {
    if (!n || typeof n !== 'object') return false;
    if (requisito === 'input' && n.tipo === 'llamada' && n.base.tipo === 'nombre' && n.base.nombre === 'input') return true;
    if (requisito === 'parametro' ? n.tipo === 'def' && n.params.length :
      requisito === 'return' ? n.tipo === 'return' && n.expr : n.tipo === requisito) return true;
    return Object.values(n).some(v => contiene(v, requisito));
  }
  function visible(valor) {
    try {
      const texto = V.repr(valor);
      const letras = [...texto];
      return ['dict', 'tuple'].includes(V.tipo(valor)) && letras.length > 60 ? letras.slice(0, 59).join('') + '…' : texto;
    }
    catch { return '…'; }
  }
  class Programa {
    constructor(codigo, opciones) {
      this.global = opciones.global || new Map();
      this.pila = [{ valores: this.global, etiqueta: traducir("curso.programa_principal") }];
      this.salida = '';
      this.lineas = 0;
      this.longitudLinea = 0;
      this.instrucciones = 0;
      this.integradas = I.crear(texto => this.escribir(texto), opciones.integradas);
      this.modulos = M.crear(opciones.aleatorios);
      this.entradas = opciones.entradas;
      this.indiceEntrada = 0;
      this.excepciones = [];
      this.integradas.set('input', { tipo: 'integrada', nombre: 'input', entrada: true });
      for (const nombre of excepciones) this.integradas.set(nombre, { tipo: 'clase', nombre, excepcion: true });
      this.motor = this.iniciar(codigo);
    }
    get marco() { return this.pila.at(-1); }
    error(tipo, linea, mensaje, original) { S.fallo(tipo, linea, mensaje, original); }
    escribir(texto) {
      const filas = texto.split('\n');
      this.longitudLinea += filas[0].length;
      if (this.longitudLinea > 100000) S.fallo('OverflowError', this.linea, traducir("curso.una_linea_de_consola_supera"));
      if (filas.length > 1) this.longitudLinea = filas.at(-1).length;
      this.lineas += filas.length - 1;
      if (this.lineas > 500 || (this.lineas === 500 && this.longitudLinea)) {
        S.fallo('RuntimeError', this.linea, traducir("curso.la_consola_admite_hasta_500"));
      }
      this.salida += texto;
    }
    *iniciar(codigo) {
      this.ast = S.analizar(codigo);
      yield* this.bloque(this.ast);
    }
    *marca(linea) {
      if (++this.instrucciones > 20000) throw { tipo: 'RuntimeError', linea, limite: true,
        mensaje: traducir("curso.tu_programa_no_termina_nunca") };
      this.linea = linea;
      yield linea;
    }
    avanzar(entrada) {
      if (!this.final?.done) {
        try { this.final = this.motor.next(entrada); }
        catch (err) {
          this.fallo = err.tipo ? err : { tipo: err instanceof RangeError ? 'RecursionError' : 'RuntimeError',
            linea: this.linea || 1, mensaje: err instanceof RangeError ? traducir("curso.demasiadas_llamadas_una_dentro_de") : err.message };
          this.final = { done: true };
        }
      }
    }
    preparar() {
      if (!this.final) this.avanzar();
      return this.estado();
    }
    paso(entrada) {
      this.salida = '';
      if (!this.final) this.avanzar();
      if (!this.final.value?.esperandoEntrada || entrada !== undefined) this.avanzar(entrada);
      return this.estado();
    }
    estado() {
      const { done, value } = this.final;
      const error = this.fallo ? { ...this.fallo, type: this.fallo.tipo } : null;
      return { hecho: done, linea: error?.linea ?? (typeof value === 'number' ? value : this.linea) ?? 0, salida: this.salida,
        esperandoEntrada: Boolean(value?.esperandoEntrada), eco: value?.eco,
        variables: Object.fromEntries([...this.visibles()].map(([k, v]) => [k, visible(v)])),
        llamadas: this.pila.map(m => m.etiqueta).reverse(), error };
    }
    visibles() {
      const ambitos = [];
      for (let marco = this.marco; marco && marco !== this.pila[0]; marco = marco.padre) ambitos.unshift(marco);
      const valores = new Map(this.global);
      for (const marco of ambitos) {
        for (const nombre of marco.locales) valores.delete(nombre);
        for (const [nombre, valor] of marco.valores) valores.set(nombre, valor);
      }
      return valores;
    }
    leer(nombre, e) {
      for (let marco = this.marco; marco; marco = marco.padre) {
        if (marco.valores.has(nombre)) return marco.valores.get(nombre);
        if (marco.locales?.has(nombre)) {
          e(marco === this.marco ? 'UnboundLocalError' : 'NameError', nombre + traducir("curso.todavia_no_tiene_un_valor"));
        }
      }
      if (this.global.has(nombre)) return this.global.get(nombre);
      if (this.integradas.has(nombre)) return this.integradas.get(nombre);
      e('NameError', '«' + nombre + traducir("curso.no_existe_todavia_lo_has") +
        I.cercana(nombre, new Set([...this.marco.valores.keys(), ...this.global.keys(), ...this.integradas.keys()])),
        "name '" + nombre + "' is not defined");
    }
    *referencia(n, e, escritura = false) {
      const base = yield* this.expr(n.base, e);
      const clave = n.inicio ? yield* this.expr(n.inicio, e) : null;
      if (base?.tipo === 'dict' && n.tipo === 'indice') {
        return escritura ? { leer: () => V.obtener(base, clave, e), poner: v => V.poner(base, clave, v, e),
          borrar: () => V.obtener(base, clave, e, undefined, true) } : V.obtener(base, clave, e);
      }
      const a = typeof base === 'string' ? [...base] : base?.tipo === 'tuple' ? base.items : base;
      if (!Array.isArray(a)) e('TypeError', traducir("curso.este_valor_no_tiene_posiciones"));
      if (escritura && a !== base) e('TypeError', traducir("curso.este_valor_no_permite_modificar"));
      if (n.tipo === 'corte') {
        const fin = n.fin ? yield* this.expr(n.fin, e) : null;
        const paso = n.paso ? yield* this.expr(n.paso, e) : null;
        const items = cortar(a, clave, fin, paso, e);
        return a === base ? items : base?.tipo === 'tuple' ? V.tupla(items) : items.join('');
      }
      const tipo = typeof base === 'string' ? 'string' : base?.tipo === 'tuple' ? 'tuple' : 'list';
      const i = V.posicion(V.entero(clave, e), a.length, e, tipo);
      return escritura ? { leer: () => a[i], poner: v => { a[i] = v; }, borrar: () => a.splice(i, 1) } : a[i];
    }
    *operacion(n, e) {
      const a = yield* this.expr(n.izq, e);
      if (n.op === 'and') return V.verdad(a) ? yield* this.expr(n.der, e) : a;
      if (n.op === 'or') return V.verdad(a) ? a : yield* this.expr(n.der, e);
      return V.operar(n.op, a, yield* this.expr(n.der, e), e);
    }
    *expr(n, e) {
      switch (n.tipo) {
        case 'int': return V.leerEntero(n.valor, e);
        case 'texto': return V.limite(n.valor, e);
        case 'constante': return n.valor;
        case 'float': return V.float(n.valor);
        case 'nombre': return this.leer(n.nombre, e);
        case 'atributo': return I.metodo(yield* this.expr(n.base, e), n.nombre, e);
        case 'llamada': return yield* this.llamar(n, e);
        case 'indice': case 'corte': return yield* this.referencia(n, e);
        case 'binario': return yield* this.operacion(n, e);
        case 'unario': {
          const v = yield* this.expr(n.expr, e);
          if (n.op === 'not') return !V.verdad(v);
          if (!V.numerico(v)) e('TypeError', traducir("curso.el_signo_necesita_un_numero"));
          const num = n.op === '-' ? -V.num(v) : V.num(v);
          return V.tipo(v) === 'float' ? V.float(num) : num || 0;
        }
        case 'comparacion': {
          let a = yield* this.expr(n.izq, e);
          for (const { op, der } of n.pares) {
            const b = yield* this.expr(der, e);
            if (!V.comparar(op, a, b, e)) return false;
            a = b;
          }
          return true;
        }
        case 'lista': case 'tupla': {
          const items = [];
          for (const item of n.items) items.push(yield* this.expr(item, e));
          V.limite(items, e);
          return n.tipo === 'tupla' ? V.tupla(items) : items;
        }
        case 'dict': {
          const d = V.dict();
          for (const { clave, valor } of n.items) V.poner(d, yield* this.expr(clave, e), yield* this.expr(valor, e), e);
          return d;
        }
        case 'fstring': {
          let texto = '';
          for (const p of n.partes) texto = V.limite(texto + (typeof p === 'string' ? p : V.str(yield* this.expr(p, e), e)), e);
          return texto;
        }
      }
    }
    *llamar(n, e) {
      const f = yield* this.expr(n.base, e);
      const args = [], kw = Object.create(null);
      for (const arg of n.args) {
        const v = yield* this.expr(arg.valor, e);
        if (arg.nombre) {
          if (Object.hasOwn(kw, arg.nombre)) e('SyntaxError', traducir("curso.ese_argumento_aparece_dos_veces"));
          kw[arg.nombre] = v;
        } else {
          if (Object.keys(kw).length) e('SyntaxError', traducir("curso.pon_los_argumentos_posicionales_primero"));
          args.push(v);
        }
      }
      return yield* this.invocar(f, args, kw, e);
    }
    *ordenar(f, args, kw, e) {
      if (args.length !== (f.base ? 0 : 1) || Object.keys(kw).some(k => k !== 'key' && k !== 'reverse')) {
        e('TypeError', traducir("curso.revisa_los_argumentos_de") + f.nombre + '().');
      }
      const { key = null, reverse = false } = kw;
      const sentido = V.verdad(reverse) ? -1 : 1;
      const elementos = f.base ? f.base.slice() : I.lista(args[0], e);
      const pares = [];
      if (f.base) f.base.length = 0;
      try {
        for (const valor of elementos) {
          const clave = key === null ? valor : yield* this.invocar(key, [valor], {}, e);
          pares.push({ valor, clave });
        }
        pares.sort((a, b) => sentido * V.ordenar(a.clave, b.clave, e));
      } finally {
        if (f.base) {
          const modificado = f.base.length !== 0;
          f.base.splice(0, f.base.length, ...(pares.length === elementos.length ? pares.map(p => p.valor) : elementos));
          if (modificado) e('ValueError', 'list modified during sort');
        }
      }
      return f.base ? null : pares.map(p => p.valor);
    }
    *invocar(f, args, kw, e) {
      if (f?.ordenar) return yield* this.ordenar(f, args, kw, e);
      if (f?.entrada) return yield* this.entrada(args, kw, e);
      if (f?.excepcion) return crearExcepcion(f.nombre, args, e);
      if (f?.tipo === 'clase' && f.nombre !== 'NoneType') return this.integradas.get(f.nombre)?.fn?.(args, kw, e) ?? null;
      if (f?.tipo === 'integrada') return f.fn(args, kw, e);
      if (f?.tipo !== 'funcion') e('TypeError', traducir("curso.este_valor_no_es_una"));
      if (this.pila.length > 100) e('RecursionError', traducir("curso.demasiadas_llamadas_una_dentro_de"));
      const valores = this.argumentos(f, args, kw, e);
      const etiqueta = f.nombre + '(' + [...valores].map(([k, v]) => k + '=' + visible(v)).join(', ') + ')';
      this.pila.push({ valores, etiqueta, locales: f.locales, padre: f.padre });
      try { return (yield* this.bloque(f.cuerpo))?.valor ?? null; }
      finally { this.pila.pop(); }
    }
    *entrada(args, kw, e) {
      if (args.length > 1 || Object.keys(kw).length) e('TypeError', traducir("curso.input_admite_un_argumento_posicional"));
      if (args.length) this.escribir(V.str(args[0], e));
      if (this.entradas === undefined) return V.limite(String(yield { esperandoEntrada: true }), e);
      if (this.indiceEntrada >= this.entradas.length) e('EOFError', traducir("curso.el_programa_pidio_mas_datos"), 'EOF when reading a line');
      const texto = V.limite(String(this.entradas[this.indiceEntrada++]), e);
      yield { eco: texto };
      return texto;
    }
    argumentos(f, args, kw, e) {
      const valores = new Map();
      const invalido = original => e('TypeError', f.nombre + traducir("curso.necesita") + f.params.length +
        (f.params.length === 1 ? traducir("curso.argumento") : traducir("curso.argumentos")) + ' (' + f.params.map(p => p.nombre).join(', ') + traducir("curso.y_le_has_dado") +
        (args.length + Object.keys(kw).length) + '.', original);
      if (args.length > f.params.length || Object.keys(kw).some(k => !f.params.some(p => p.nombre === k))) invalido();
      f.params.forEach(({ nombre }, i) => {
        if (i < args.length && Object.hasOwn(kw, nombre)) invalido();
        const v = i < args.length ? args[i] : Object.hasOwn(kw, nombre) ? kw[nombre] : f.defectos.get(nombre);
        valores.set(nombre, v);
      });
      const faltantes = [...valores].filter(([, v]) => v === undefined).map(([nombre]) => V.repr(nombre));
      if (faltantes.length) {
        const nombres = faltantes.length === 1 ? faltantes[0] : faltantes.slice(0, -1).join(', ') + ' and ' + faltantes.at(-1);
        invalido(f.nombre + '() missing ' + faltantes.length + ' required positional argument' +
          (faltantes.length === 1 ? '' : 's') + ': ' + nombres);
      }
      return valores;
    }
    *asignar(s, e) {
      const { destino: d, op } = s;
      let valor, anterior, ref;
      if (op === '=') valor = yield* this.expr(s.expr, e);
      if (d.tipo === 'indice') ref = yield* this.referencia(d, e, true);
      if (op !== '=') {
        anterior = ref ? ref.leer() : this.leer(d.nombre, e);
        const otro = yield* this.expr(s.expr, e);
        if (Array.isArray(anterior) && op === '+=') {
          const extra = [];
          for (const v of V.iterable(otro, e)) {
            if (anterior.length + extra.length >= 10000) e('OverflowError', traducir("curso.la_lista_supera_los_10"));
            extra.push(v);
          }
          anterior.push(...extra);
          valor = anterior;
        } else {
          valor = V.operar(op[0], anterior, otro, e);
          if (Array.isArray(anterior) && op === '*=') {
            anterior.splice(0, anterior.length, ...valor);
            valor = anterior;
          }
        }
      }
      if (ref) ref.poner(valor);
      else yield* this.guardar(d, valor, e);
    }
    *guardar(d, valor, e) {
      if (d.tipo === 'nombre') this.marco.valores.set(d.nombre, valor);
      else if (d.tipo === 'indice') (yield* this.referencia(d, e, true)).poner(valor);
      else {
        const it = V.iterable(valor, e);
        const valores = [];
        for (const item of it) {
          if (valores.length === d.items.length) e('ValueError', traducir("curso.sobran_valores_al_desempaquetar"),
            'too many values to unpack (expected ' + d.items.length + ')');
          valores.push(item);
        }
        if (valores.length !== d.items.length) e('ValueError', traducir("curso.faltan_valores_al_desempaquetar"),
          'not enough values to unpack (expected ' + d.items.length + ', got ' + valores.length + ')');
        for (const [i, item] of d.items.entries()) yield* this.guardar(item, valores[i], e);
      }
    }
    *bucle(s, e) {
      if (s.tipo === 'while') {
        while (V.verdad(yield* this.expr(s.expr, e))) {
          const fin = yield* this.bloque(s.cuerpo);
          if (fin?.tipo === 'return') return fin;
          if (fin?.tipo === 'break') return;
          yield* this.marca(s.linea);
        }
      } else {
        let primero = true;
        for (const v of V.iterable(yield* this.expr(s.expr, e), e)) {
          if (!primero) yield* this.marca(s.linea);
          primero = false;
          yield* this.guardar(s.destino, v, e);
          const fin = yield* this.bloque(s.cuerpo);
          if (fin?.tipo === 'return') return fin;
          if (fin?.tipo === 'break') return;
        }
      }
    }
    *condicion(s) {
      for (const rama of [s, ...s.ramas]) {
        if (rama !== s) yield* this.marca(rama.linea);
        const e = (tipo, mensaje, original) => this.error(tipo, rama.linea, mensaje, original);
        if (!rama.expr || V.verdad(yield* this.expr(rama.expr, e))) return yield* this.bloque(rama.cuerpo);
      }
    }
    importar(s, e) {
      for (const { nombre, alias } of s.nombres) {
        const modulo = this.modulos.get(s.desde || nombre);
        if (!modulo) {
          const mensaje = traducir("curso.este_curso_solo_incluye_math");
          e('ModuleNotFoundError', mensaje);
        }
        if (s.desde && !modulo.attrs.has(nombre)) e('ImportError', traducir("curso.el_modulo_no_incluye") + nombre + '.');
        this.marco.valores.set(alias, s.desde ? modulo.attrs.get(nombre) : modulo);
      }
    }
    *capturar(s, error) {
      for (const rama of s.ramas.filter(r => r.tipo === 'except')) {
        yield* this.marca(rama.linea);
        const e = (tipo, mensaje, original) => this.error(tipo, rama.linea, mensaje, original);
        if (rama.expr && !coincide(yield* this.expr(rama.expr, e), error, e)) continue;
        this.excepciones.push(error);
        if (rama.nombre) this.marco.valores.set(rama.nombre, { tipo: 'excepcion', error, args: error.args || [error.original] });
        try { return yield* this.bloque(rama.cuerpo); }
        finally {
          this.excepciones.pop();
          if (rama.nombre) this.marco.valores.delete(rama.nombre);
        }
      }
      throw error;
    }
    *intentar(s) {
      const alternativa = s.ramas.find(r => r.tipo === 'else');
      const final = s.ramas.find(r => r.tipo === 'finally');
      let pendiente;
      try {
        let resultado;
        try { resultado = yield* this.bloque(s.cuerpo); }
        catch (error) {
          if (!error.tipo || error.limite) throw error;
          return yield* this.capturar(s, error);
        }
        if (!resultado && alternativa) {
          yield* this.marca(alternativa.linea);
          resultado = yield* this.bloque(alternativa.cuerpo);
        }
        return resultado;
      } catch (error) {
        pendiente = error;
        throw error;
      } finally {
        if (final && !pendiente?.limite) {
          const resultado = yield* this.finalizarTry(final, pendiente);
          if (resultado) return resultado;
        }
      }
    }
    *finalizarTry(final, pendiente) {
      if (pendiente?.tipo) this.excepciones.push(pendiente);
      try {
        yield* this.marca(final.linea);
        return yield* this.bloque(final.cuerpo);
      } finally {
        if (pendiente?.tipo) this.excepciones.pop();
      }
    }
    *lanzar(s, e) {
      if (!s.expr) {
        if (this.excepciones.length) throw this.excepciones.at(-1);
        e('RuntimeError', traducir("curso.no_hay_ningun_error_que"), 'No active exception to reraise');
      }
      let valor = yield* this.expr(s.expr, e);
      if (valor?.excepcion) valor = crearExcepcion(valor.nombre, [], e);
      if (valor?.tipo !== 'excepcion') e('TypeError', traducir("curso.solo_puedes_lanzar_una_excepcion"), 'exceptions must derive from BaseException');
      throw { ...valor.error, linea: s.linea, args: valor.args };
    }
    *bloque(cuerpo) {
      for (const s of cuerpo) {
        yield* this.marca(s.linea);
        const e = (tipo, mensaje, original) => this.error(tipo, s.linea, mensaje, original);
        let resultado;
        switch (s.tipo) {
          case 'asigna': yield* this.asignar(s, e); break;
          case 'expr': yield* this.expr(s.expr, e); break;
          case 'if': resultado = yield* this.condicion(s); break;
          case 'try': resultado = yield* this.intentar(s); break;
          case 'raise': yield* this.lanzar(s, e); break;
          case 'import': this.importar(s, e); break;
          case 'del':
            if (s.expr?.tipo === 'indice') (yield* this.referencia(s.expr, e, true)).borrar();
            else e('SyntaxError', traducir("curso.indica_la_posicion_o_clave"));
            break;
          case 'while': case 'for': resultado = yield* this.bucle(s, e); break;
          case 'def': {
            const defectos = new Map();
            for (const p of s.params) if (p.defecto) defectos.set(p.nombre, yield* this.expr(p.defecto, e));
            this.marco.valores.set(s.nombre, { ...s, tipo: 'funcion', defectos,
              locales: locales(s.cuerpo), padre: this.marco === this.pila[0] ? null : this.marco });
            break;
          }
          case 'return': return { tipo: 'return', valor: s.expr ? yield* this.expr(s.expr, e) : null };
          case 'break': case 'continue': return { tipo: s.tipo };
        }
        if (resultado) return resultado;
      }
    }
  }
  function cortar(items, inicio, fin, paso, e) {
    const salto = paso === null ? 1 : V.entero(paso, e);
    if (!salto) e('ValueError', traducir("curso.el_paso_no_puede_ser"), 'slice step cannot be zero');
    const n = items.length, inverso = salto < 0;
    const ajustar = (x, defecto) => {
      if (x === null) return defecto;
      const i = V.entero(x, e);
      return Math.max(inverso ? -1 : 0, Math.min(inverso ? n - 1 : n, i < 0 ? n + i : i));
    };
    const salida = [];
    const hasta = ajustar(fin, inverso ? -1 : n);
    for (let i = ajustar(inicio, inverso ? n - 1 : 0); inverso ? i > hasta : i < hasta; i += salto) salida.push(items[i]);
    return salida;
  }
  function crearExcepcion(tipo, args, e) {
    const original = !args.length ? '' : args.length > 1 ? V.repr(V.tupla(args), e) :
      tipo === 'KeyError' ? V.repr(args[0], e) : V.str(args[0], e);
    return { tipo: 'excepcion', args, error: { tipo, original, mensaje: original } };
  }
  function coincide(clase, error, e) {
    if (clase?.tipo === 'tuple') return clase.items.some(c => coincide(c, error, e));
    if (!clase?.excepcion) e('TypeError', traducir("curso.indica_una_clase_de_excepcion"),
      'catching classes that do not inherit from BaseException is not allowed');
    return clase.nombre === 'Exception' || clase.nombre === error.tipo ||
      clase.nombre === 'NameError' && error.tipo === 'UnboundLocalError';
  }
  const Py = { ejecutar: (codigo, opciones = {}) => new Programa(codigo, opciones), analizar: S.analizar, contiene };
  if (typeof module !== 'undefined') module.exports = Py;
  else (window.CR ||= {}).Py = Py;
})();
