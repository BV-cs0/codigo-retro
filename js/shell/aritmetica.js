(function (Shell) {
'use strict';
const niveles = [['==', '!='], ['<', '<=', '>', '>='], ['+', '-'], ['*', '/', '%']];
const operaciones = {
  '+': (a, b) => a + b, '-': (a, b) => a - b, '*': (a, b) => a * b,
  '/': (a, b) => a / b, '%': (a, b) => a % b,
  '==': (a, b) => BigInt(a === b), '!=': (a, b) => BigInt(a !== b),
  '<': (a, b) => BigInt(a < b), '<=': (a, b) => BigInt(a <= b),
  '>': (a, b) => BigInt(a > b), '>=': (a, b) => BigInt(a >= b)
};
const entero = n => BigInt.asIntN(64, n);
const asignaciones = ['=', '+=', '-=', '*=', '/=', '%='];
const tokenizar = texto => texto.match(/\$?[a-zA-Z_]\w*|\$[0-9]|\d+|\+\+|--|\*\*|[=!<>+*/%-]=|[^\s]/g) || [];
function potencia(base, exponente) {
  if (exponente < 0n) throw new Error('Exponente negativo en la expresión aritmética.');
  let n = 1n;
  for (; exponente; exponente >>= 1n) {
    if (exponente & 1n) n = entero(n * base);
    base = entero(base * base);
  }
  return n;
}
function guardar(vars, clave, op, izquierda, derecha) {
  const n = op === '=' ? derecha : entero(operaciones[op[0]](izquierda, derecha));
  vars[clave] = String(n);
  return n;
}
function literal(t) {
  if (/^0\d*[89]/.test(t)) throw new Error('Número octal incorrecto.');
  return entero(BigInt(/^0\d/.test(t) ? '0o' + t : t));
}
function calcular(texto, vars, profundidad = 0) {
  if (profundidad >= 100) throw new Error('Referencia aritmética circular.');
  const tokens = tokenizar(texto);
  let i = 0;
  const valor = clave => calcular(vars[clave] || '0', vars, profundidad + 1);
  function numero() {
    const t = tokens[i++];
    if (t === '+' || t === '-' || t === '!') {
      const n = numero();
      return t === '-' ? entero(-n) : t === '!' ? BigInt(!n) : n;
    }
    if (t === '(') {
      const n = asignacion();
      if (tokens[i++] !== ')') throw new Error('Falta un paréntesis en la expresión.');
      return n;
    }
    if (/^\d+$/.test(t)) return literal(t);
    if (!/^\$?(?:[a-zA-Z_]\w*|\d)$/.test(t ?? '')) throw new Error('Expresión aritmética incorrecta.');
    const clave = t.replace(/^\$/, '');
    const n = valor(clave);
    if (['++', '--'].includes(tokens[i])) vars[clave] = String(entero(n + (tokens[i++] === '++' ? 1n : -1n)));
    return n;
  }
  function expresion(nivel) {
    if (nivel === niveles.length) {
      const base = numero();
      if (tokens[i] !== '**') return base;
      i++;
      return potencia(base, expresion(nivel));
    }
    let n = expresion(nivel + 1);
    while (niveles[nivel].includes(tokens[i])) {
      const op = operaciones[tokens[i++]];
      n = entero(op(n, expresion(nivel + 1)));
    }
    return n;
  }
  function asignacion() {
    const [clave, op] = [tokens[i], tokens[i + 1]];
    if (!/^[a-zA-Z_]\w*$/.test(clave ?? '') || !asignaciones.includes(op)) return expresion(0);
    i += 2;
    const izquierda = op === '=' ? 0n : valor(clave);
    return guardar(vars, clave, op, izquierda, asignacion());
  }
  const n = asignacion();
  if (i !== tokens.length) throw new Error('Expresión aritmética fuera del subconjunto admitido.');
  return n;
}
Shell.Aritmetica = { calcular };
})( (globalThis.CR = globalThis.CR || {}).Shell ||= {} );
