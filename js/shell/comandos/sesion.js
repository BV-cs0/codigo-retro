(function (CR) {
'use strict';
const Shell = CR.Shell = CR.Shell || {};
const { registrar: R, opciones } = typeof module !== 'undefined' ? require('./base') : Shell.Base;
R('whoami', 'Muestra el usuario actual.', ['whoami', 'echo $USER'], c => {
  opciones(c); c.out('aprendiz\n');
});
R('hostname', 'Muestra el nombre del equipo.', ['hostname', 'whoami; hostname'], c => {
  opciones(c); c.out('faro7\n');
});
R('date', 'Muestra la fecha fija de Faro-7.', ['date', 'date > fecha.txt'], c => {
  opciones(c); c.out('Sat Nov 16 03:14:00 UTC 2024\n');
});
R('history', 'Muestra las líneas que escribiste.', ['history', 'history | tail -3'], c => {
  opciones(c);
  c.sesion.historial.forEach((linea, i) => c.out(String(i + 1).padStart(5) + '  ' + linea + '\n'));
});
R('clear', 'Limpia la pantalla.', ['clear', 'pwd; clear'], c => { opciones(c); c.resultado.eventos.push({ texto: '', estilo: 'limpiar' }); });
R('mision', 'Recuerda el objetivo actual.', ['mision', 'clear; mision'], c => {
  opciones(c);
  const m = c.sesion.mision;
  c.out(m ? m.texto + '\n' + m.objetivos.map(o => '• ' + o.texto + '\n').join('') : 'No hay una misión activa.\n');
});
R('responder', 'Entrega la respuesta de la misión.', ['responder 42', 'responder "solo root"'], c => {
  const valor = c.args.join(' ').trim().replace(/\s+/g, ' ').toLowerCase();
  c.sesion.respuestas.add(valor);
  const objetivos = c.sesion.mision?.objetivos.filter(o => o.tipo === 'respuesta') ?? [];
  if (!objetivos.length) c.out('Esta misión no pide una respuesta.\n');
  else if (objetivos.some(o => o.valor.trim().replace(/\s+/g, ' ').toLowerCase() === valor)) c.out('Lumen: Correcto.\n');
  else c.out('Lumen: Todavía no. Revisa la salida o pide una pista.\n');
});
R('bash', 'Ejecuta un script en el sistema de archivos simulado.', ['bash faro.sh', './faro.sh'], c => {
  const args = c.args[0] === '--' ? c.args.slice(1) : c.args;
  if (!args.length) c.invalido('bash');
  if (c.args[0] !== '--' && args[0].startsWith('-')) c.invalido(args[0]);
  c.script = { archivo: args[0], args: args.slice(1), directo: false };
});
})(globalThis.CR = globalThis.CR || {});

