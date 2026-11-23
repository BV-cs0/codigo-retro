(function (CR) {
'use strict';
const etiquetas = new Map(Object.entries({
  aritmetica: 'aritmética $(( ))', while: 'while', 'while-read': 'while read',
  funcion: 'una función', case: 'case', if: 'if', for: 'for', until: 'until',
  local: 'local', read: 'read', 'test-archivo': 'una prueba de archivo',
  comillas: 'comillas dobles al expandir variables', sustitucion: 'sustitución de comandos'
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
  const opciones = { fs: paso.fs || {}, args: paso.args || [], entradas: paso.entradas || [],
    cwd: paso.cwd || '/home/aprendiz', archivo: paso.archivo || 'script.sh' };
  const base = { ...opciones, salida: paso.salidaEsperada, codigo: 0, archivos: paso.archivos };
  return [base, ...(paso.casos || []).map(caso => ({ ...opciones, codigo: 0, ...caso }))];
}
function archivo(r, c, ruta, regla) {
  const absoluta = CR.Shell.SFA.rutaAbsoluta(ruta, c.cwd);
  const nodo = r.fs.nodos.get(absoluta);
  if (regla.existe === false) return !nodo;
  if (!nodo) return false;
  return (regla.exacto === undefined || nodo.contenido === regla.exacto) &&
    (regla.contiene === undefined || nodo.contenido.includes(regla.contiene));
}
function consejo(script) {
  if (/^\s*\$\w+=/m.test(script)) return 'Al asignar, escribe el nombre sin $.';
  if (/^\s*\w+\s+=|^\s*\w+=\s+\S/m.test(script)) return 'Quita los espacios alrededor de =.';
  if (/(?:^|\s)\[\$|\S\](?=;|\s|$)/m.test(script)) return 'Separa [ y ] de la condición con espacios.';
  if (/\[ .*? == .*? \]/.test(script)) return 'Si comparas números en [ ], usa -eq.';
  if (/\b(if|while|for|until)\b/.test(script) &&
    !/\b(then|do)\b/.test(script)) return 'Comprueba que el bloque empieza con then o do.';
  if (/\bthen\b/.test(script) && !/\bfi\b/.test(script)) return 'Cierra el if con fi.';
  if (/\bdo\b/.test(script) && !/\bdone\b/.test(script)) return 'Cierra el bucle con done.';
  if (/\s\$[a-zA-Z_]\w*/.test(script)) return 'Prueba comillas dobles alrededor de las variables que puedan contener espacios.';
}
function comprobar(paso, script) {
  const checks = [];
  let asignacion;
  for (const [i, c] of casos(paso).entries()) {
    const r = CR.Shell.Bash.correr(script, c);
    asignacion ??= r.guia.find(g => g.startsWith('En Bash no puede haber espacios alrededor de =.'));
    const ok = r.salida === c.salida && r.codigo === c.codigo &&
      (c.stderr === undefined || r.stderr === c.stderr);
    checks.push({ ok, texto: ok ? 'Caso ' + (i + 1) + ' correcto' : 'Caso ' + (i + 1) +
      ' esperaba ' + JSON.stringify(c.salida) + ' y código ' + c.codigo +
      '. Obtuviste ' + JSON.stringify(r.salida) + ' y código ' + r.codigo + '. ' + (r.stderr.trim() || '') });
    for (const [ruta, regla] of Object.entries(c.archivos || {}))
      checks.push({ ok: archivo(r, c, ruta, regla), texto: 'Estado de ' + ruta });
  }
  const usadas = marcas(script);
  for (const marca of paso.requiere || [])
    checks.push({ ok: usadas.has(marca), texto: etiquetas.has(marca) ? 'Usa ' + etiquetas.get(marca) : 'Requisito sin descripción' });
  const ok = checks.every(c => c.ok);
  const ayuda = !ok && (asignacion || consejo(script));
  if (ayuda) checks.push({ ok: false, texto: ayuda });
  return { ok, checks };
}
function leerArgumentos(texto) {
  return CR.Shell.Lexico.tokenizar(texto).map(t => {
    if (!t.partes) throw new Error('Pon entre comillas los argumentos con operadores.');
    return t.partes.map(p => p.texto).join('');
  });
}
CR.ValidarBash = { casos, comprobar, leerArgumentos };
})(globalThis.CR);
