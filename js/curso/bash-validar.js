(function (CR) {
'use strict';
const traducir = typeof module !== 'undefined' ? require('../comun/idioma').t : globalThis.CR.t;
const etiquetas = new Map(Object.entries({
  aritmetica: traducir("curso.aritmetica"), while: 'while', 'while-read': 'while read',
  funcion: traducir("curso.una_funcion"), case: 'case', if: 'if', for: 'for', until: 'until',
  local: 'local', read: 'read', 'test-archivo': traducir("curso.una_prueba_de_archivo"),
  comillas: traducir("curso.comillas_dobles_al_expandir_variables"), sustitucion: traducir("curso.sustitucion_de_comandos")
}));
const comando = n => n?.palabras?.[0]?.partes?.[0]?.texto;
function marcas(script) {
  const S = CR.Shell;
  const encontradas = new Set();
  function visitar(n) {
    if (!n || typeof n !== 'object') return;
    if (n.tipo === 'ramas') encontradas.add('if');
    if (n.tipo === 'casos') encontradas.add('case');
    if (n.tipo === 'bucle') encontradas.add(n.modo);
    if (n.tipo === 'bucle' && n.modo === 'while' && comando(n.condicion.pasos[0]?.nodo) === 'read')
      encontradas.add('while-read');
    if (n.tipo === 'funcion') encontradas.add('funcion');
    if (n.tipo === 'aritmetica' || n.formulas) encontradas.add('aritmetica');
    const orden = comando(n);
    if (['local', 'read'].includes(orden)) encontradas.add(orden);
    if (['test', '['].includes(orden) && n.palabras.some(p => /^-[fderwxs]$/.test(p.partes[0].texto)))
      encontradas.add('test-archivo');
    if (n.tipo === 'condicion' && /(?:^|\s)-[fderwxs]\s/.test(n.texto)) encontradas.add('test-archivo');
    if (n.modo && ['libre', 'doble'].includes(n.modo)) {
      if (n.modo === 'doble' && /\$/.test(n.texto)) encontradas.add('comillas');
      if (n.texto.includes('$((')) encontradas.add('aritmetica');
      if (/\$\((?!\()|`/.test(n.texto)) encontradas.add('sustitucion');
    }
    for (const valor of Object.values(n)) visitar(valor);
  }
  try { visitar(S.BashSintaxis.analizar(script)); } catch { /* El motor muestra el error de sintaxis. */ }
  return encontradas;
}
function casos(paso) {
  const { home } = CR.Shell.SFA.identidad(paso.idioma);
  const opciones = { fs: paso.fs || {}, args: paso.args || [], entradas: paso.entradas || [],
    idioma: paso.idioma, cwd: paso.cwd || home, archivo: paso.archivo || 'script.sh' };
  const base = { ...opciones, salida: paso.salidaEsperada, codigo: 0, archivos: paso.archivos };
  return [base, ...(paso.casos || []).map(caso => ({ ...opciones, codigo: 0, ...caso }))];
}
function archivo(r, c, ruta, regla) {
  const absoluta = CR.Shell.SFA.rutaAbsoluta(ruta, c.cwd, r.fs.home);
  const nodo = r.fs.nodos.get(absoluta);
  if (regla.existe === false) return !nodo;
  if (!nodo) return false;
  return (regla.exacto === undefined || nodo.contenido === regla.exacto) &&
    (regla.contiene === undefined || nodo.contenido.includes(regla.contiene));
}
function consejo(script) {
  if (/^\s*\$\w+=/m.test(script)) return traducir("curso.al_asignar_escribe_el_nombre");
  if (/^\s*\w+\s+=|^\s*\w+=\s+\S/m.test(script)) return traducir("curso.quita_los_espacios_alrededor_de");
  if (/(?:^|\s)\[\$|\S\](?=;|\s|$)/m.test(script)) return traducir("curso.separa_y_de_la_condicion");
  if (/\[ .*? == .*? \]/.test(script)) return traducir("curso.si_comparas_numeros_en_usa");
  if (/\b(if|while|for|until)\b/.test(script) &&
    !/\b(then|do)\b/.test(script)) return traducir("curso.comprueba_que_el_bloque_empieza");
  if (/\bthen\b/.test(script) && !/\bfi\b/.test(script)) return traducir("curso.cierra_el_if_con_fi");
  if (/\bdo\b/.test(script) && !/\bdone\b/.test(script)) return traducir("curso.cierra_el_bucle_con_done");
  if (/\s\$[a-zA-Z_]\w*/.test(script)) return traducir("curso.prueba_comillas_dobles_alrededor_de");
}
function comprobar(paso, script) {
  const checks = [];
  let asignacion;
  for (const [i, c] of casos(paso).entries()) {
    const r = CR.Shell.Bash.correr(script, c);
    asignacion ??= r.guia.find(g => g.startsWith(traducir("curso.en_bash_no_puede_haber")));
    const ok = r.salida === c.salida && r.codigo === c.codigo &&
      (c.stderr === undefined || r.stderr === c.stderr);
    checks.push({ ok, texto: ok ? traducir("curso.caso") + (i + 1) + traducir("curso.correcto_2") : traducir("curso.caso") + (i + 1) +
      traducir("curso.esperaba") + JSON.stringify(c.salida) + traducir("curso.y_codigo") + c.codigo +
      traducir("curso.obtuviste") + JSON.stringify(r.salida) + traducir("curso.y_codigo") + r.codigo + '. ' + (r.stderr.trim() || '') });
    for (const [ruta, regla] of Object.entries(c.archivos || {}))
      checks.push({ ok: archivo(r, c, ruta, regla), texto: traducir("curso.estado_de") + ruta });
  }
  const usadas = marcas(script);
  for (const marca of paso.requiere || [])
    checks.push({ ok: usadas.has(marca), texto: etiquetas.has(marca) ? traducir("curso.usa") + etiquetas.get(marca) : traducir("curso.requisito_sin_descripcion") });
  const ok = checks.every(c => c.ok);
  const ayuda = !ok && (asignacion || consejo(script));
  if (ayuda) checks.push({ ok: false, texto: ayuda });
  return { ok, checks };
}
function leerArgumentos(texto) {
  return CR.Shell.Lexico.tokenizar(texto).map(t => {
    if (!t.partes) throw new Error(traducir("curso.pon_entre_comillas_los_argumentos"));
    return t.partes.map(p => p.texto).join('');
  });
}
CR.ValidarBash = { casos, comprobar, leerArgumentos };
})(globalThis.CR);
