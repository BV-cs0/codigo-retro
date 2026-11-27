(function () {
  'use strict';
  const interno = (globalThis.CR ??= {}).sqlInterno ??= {};
  function fallo(mensaje, token, clave, datos) {
    throw Object.assign(new Error(mensaje), { token, clave, datos });
  }

  function tokenizar(sql) {
    const patron = /\s+|--[^\r\n]*|\/\*[\s\S]*?(?:\*\/|$)|'(?:''|[^'])*'|"(?:""|[^"])*"|`[^`]*`|\[[^\]]*\]|(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?|[\p{L}_][\p{L}\p{N}_$]*|\|\||==|!=|<>|<=|>=|[\s\S]/giyu;
    const tokens = [];
    for (const m of sql.matchAll(patron)) {
      const bruto = m[0];
      if (/^(?:\s|--|\/\*)/.test(bruto)) continue;
      const inicio = m.index, fin = inicio + bruto.length;
      let tipo = 'simbolo', valor = bruto, clave = bruto;
      if (/^[\p{L}_]/u.test(bruto)) {
        tipo = 'id';
        clave = bruto.toUpperCase();
      } else if (/^(?:\d|\.\d)/.test(bruto)) {
        tipo = /[.e]/i.test(bruto) ? 'real' : 'integer';
        valor = Number(bruto);
      } else if (bruto.length >= 2 && /^['"`\[]/.test(bruto)) {
        tipo = bruto[0] === "'" ? 'text' : 'id';
        valor = bruto.slice(1, -1).replaceAll(bruto[0] + bruto[0], bruto[0]);
      }
      tokens.push({ tipo, valor, clave, bruto, inicio, fin });
    }
    tokens.push({ tipo: 'fin', clave: '', bruto: '', inicio: sql.length, fin: sql.length });
    return tokens;
  }
  Object.assign(interno, { fallo, tokenizar });
})();
