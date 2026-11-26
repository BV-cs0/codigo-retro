(function (CR) {
'use strict';
const traducir = typeof module !== 'undefined' ? require('../../comun/idioma').t : globalThis.CR.t;
const Shell = CR.Shell = CR.Shell || {};
const { registrar: R, opciones } = typeof module !== 'undefined' ? require('./base') : Shell.Base;
R('whoami', traducir("shell.muestra_el_usuario_actual"), ['whoami', "echo $USER"], c => {
  opciones(c); c.out(c.sesion.identidad.usuario + '\n');
});
R('hostname', traducir("shell.muestra_el_nombre_del_equipo"), ['hostname', 'hostname -I'], c => {
  if (c.args.join(' ') === '-I' && Shell.Red) return c.out(Shell.Red.ip(c.sesion) + ' \n');
  if (c.args.length) c.invalido(c.args.join(' '));
  c.out(c.sesion.identidad.maquina + '\n');
}, { '-I': traducir('faro2.hostnameI') });
R('date', traducir("shell.muestra_la_fecha_fija_de_faro"), ['date', 'date > fecha.txt'], c => {
  opciones(c); c.out("Sat Nov 16 03:14:00 UTC 2024\n");
});
R('history', traducir("shell.muestra_las_lineas_que_escribiste"), ['history', "history | tail -3"], c => {
  opciones(c);
  c.sesion.historial.forEach((linea, i) => c.out(String(i + 1).padStart(5) + '  ' + linea + '\n'));
});
R('clear', traducir("shell.limpia_la_pantalla"), ['clear', "pwd; clear"], c => { opciones(c); c.resultado.eventos.push({ texto: '', estilo: 'limpiar' }); });
R('mision', traducir("shell.recuerda_el_objetivo_actual"), ['mision', "clear; mision"], c => {
  opciones(c);
  const m = c.sesion.mision;
  c.out(m ? m.texto + '\n' + m.objetivos.map(o => '• ' + o.texto + '\n').join('') : traducir[c.sesion.idioma]("shell.no_hay_una_mision_activa"));
});
R('responder', traducir("shell.entrega_la_respuesta_de_la_mision"), ['responder 42', "responder \"solo root\""], c => {
  const valor = c.args.join(' ').trim().replace(/\s+/g, ' ').toLowerCase();
  c.sesion.respuestas.add(valor);
  const objetivos = c.sesion.mision?.objetivos.filter(o => o.tipo === 'respuesta') ?? [];
  if (!objetivos.length) c.out(traducir[c.sesion.idioma]("shell.esta_mision_no_pide_una"));
  else if (objetivos.some(o => o.valor.trim().replace(/\s+/g, ' ').toLowerCase() === valor)) c.out(traducir[c.sesion.idioma]("shell.lumen_correcto"));
  else c.out(traducir[c.sesion.idioma]("shell.lumen_todavia_no_revisa_la"));
});
R('bash', traducir("shell.ejecuta_un_script_en_el_sistema"), ["bash faro.sh", './faro.sh'], c => {
  const args = c.args[0] === '--' ? c.args.slice(1) : c.args;
  if (!args.length) c.invalido('bash');
  if (c.args[0] !== '--' && args[0].startsWith('-')) c.invalido(args[0]);
  c.script = { archivo: args[0], args: args.slice(1), directo: false };
});
})(globalThis.CR = globalThis.CR || {});

