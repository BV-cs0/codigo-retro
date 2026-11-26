(function (CR) {
'use strict';
const Shell = CR.Shell = CR.Shell || {};
const { HOME, rutaAbsoluta } = typeof module !== 'undefined' ? require('../shell/sfa') : Shell.SFA;
const { cambiarModo } = typeof module !== 'undefined' ? require('../shell/comandos/rutas') : Shell.Rutas;
const en = ruta => ({ texto: 'Entra en ' + ruta, tipo: 'cwd', ruta });
const existe = (ruta, clase = 'archivo') => ({ texto: 'Crea o coloca ' + ruta, tipo: 'existe', ruta, clase });
const falta = ruta => ({ texto: 'Retira ' + ruta, tipo: 'noExiste', ruta });
const contenido = (ruta, igual, texto = 'Guarda el texto indicado en ' + ruta) => ({ texto, tipo: 'contenido', ruta, igual });
const contiene = (ruta, valor) => ({ texto: 'Incluye ' + valor + ' en ' + ruta, tipo: 'contenido', ruta, contiene: valor });
const modo = (ruta, modo, texto = 'Aplica ' + modo + ' a ' + ruta) => ({ texto, tipo: 'permisos', ruta, modo });
const usar = (comando, args, texto = 'Usa ' + comando) => ({ texto, tipo: 'usaComando', comando, args });
const respuesta = (valor, texto) => ({ texto, tipo: 'respuesta', valor });
const leer = ruta => ({ texto: 'Lee ' + ruta, tipo: 'leyo', ruta });
const normalizar = texto => texto.trim().replace(/\s+/g, ' ').toLowerCase();
function cumple(o, s) {
  if (o.tipo === 'faro2') return o.comprobar(s);
  if (o.tipo === 'usaComando') return s.invocaciones.some(p => p.nombre === o.comando && (!o.args || o.args(p.args, p.cwd)));
  if (o.tipo === 'respuesta') return s.respuestas.has(normalizar(o.valor));
  const ruta = rutaAbsoluta(o.ruta, s.identidad.home, s.identidad.home);
  const nodo = s.fs.nodos.get(ruta);
  if (o.tipo === 'cwd') return s.cwd === ruta;
  if (o.tipo === 'leyo') return s.leidos.has(ruta);
  if (o.tipo === 'noExiste') return !nodo;
  if (!nodo) return false;
  if (o.tipo === 'existe') return nodo.carpeta === (o.clase === 'carpeta');
  if (o.tipo === 'permisos') return nodo.permisos === cambiarModo(o.modo, nodo.permisos, nodo.carpeta);
  if (o.tipo === 'contenido') return !nodo.carpeta &&
    (o.igual !== undefined ? nodo.contenido === o.igual : nodo.contenido.includes(o.contiene));
  return false;
}
function m(titulo, texto, fs, objetivos, comandos, pistas, solucion, cierre, cwd = HOME) {
  return { titulo, texto, fs, objetivos, comandos: comandos.split(' '), pistas, solucion, cierre, cwd };
}
const bienvenida = { '~/bienvenida.txt': 'Faro-7 te da la bienvenida. La bitácora está al lado.\n',
  '~/bitacora/ultima.txt': '03:00. La boya del este vuelve a emitir.\n' };
const faro = { '/etc/faro/config': { contenido: 'luz=activa\n', permisos: 'rw-r--r--', dueno: 'root' },
  '~/.nota': 'Si oyes tres pitidos, mira hacia el este.\n' };
const descargas = { '~/descargas/ola.jpg': 'foto: ola\n', '~/descargas/roca.jpg': 'foto: roca\n',
  '~/descargas/ruta.txt': 'ruta\n', '~/descargas/turno.txt': 'turno\n' };
const almacen = { '~/almacen/fotos/': null, '~/almacen/textos/': null, '~/almacen/viejo/': null };
const luz = Array.from({ length: 342 }, (_, i) => i === 341 ? 'Luz estable' :
  'Pulso ' + String(i + 1).padStart(3, '0') + ' · sensor ' + ((i * 17 + 7) % 9 + 1)).join('\n') + '\n';
const logLuz = { '/var/log/faro/luz.log': luz };
const logs = { ...logLuz, '/var/log/acceso.log': '', '/var/log/red/trafico.log': '', '/var/log/red/README': 'Turnos.\n' };
const proyectos = { '~/proyectos/vacio/': null, '~/proyectos/antiguo/': null, '~/proyectos/radio/plan.txt': 'Conservar.\n' };
const archivos = { '/srv/archivo/boya.dat': 'b'.repeat(105000), '/srv/archivo/mapa.dat': 'm'.repeat(18600) };
const manual = { '~/manual.txt': 'Manual de guardia\nComprueba la radio.\nRevisa el rumbo.\nEn caso de tormenta, usa el canal 7.\nAnota la hora.\n' };
const ip = '192.0.2.41';
const hora = '02:43';
const rutaIntruso = '/srv/control/baliza.conf';
const bak = '/srv/control/.turno.bak';
function generarAccesos() {
  const ips = [ip, '198.51.100.19', '203.0.113.80'];
  let semilla = 17;
  const lineas = Array.from({ length: 160 }, (_, i) => {
    semilla = (semilla * 25173 + 13849) % 65536;
    const fallo = i < 32;
    const origen = fallo ? ips[i < 19 ? 0 : 1 + i % 2] : ips[1 + semilla % 2];
    return String(Math.floor(i / 60)).padStart(2, '0') + ':' + String(i % 60).padStart(2, '0') +
      (fallo ? ' FALLO ' : ' CORRECTO ') + origen + ' guardia';
  });
  return [...lineas, hora + ' CORRECTO ' + ip + ' visitante sesion-7',
    '02:44 CAMBIO ' + ip + ' sesion-7 baliza.conf', '03:00 CIERRE ' + ip + ' sesion-7'].join('\n') + '\n';
}
const acceso = { '/var/log/acceso.log': generarAccesos() };
const control = { '/srv/control/': { dueno: 'aprendiz', permisos: 'rwxrwxr-x' }, [rutaIntruso]: 'canal=9\nsesion-7\n',
  [bak]: 'Visitante: contraseña faro7. Cambiar después del turno.\n' };
const intruso = { ...acceso, ...control, '/srv/pruebas/baliza.conf': 'canal=7\n' };
const permisos = { '~/encender.sh': "echo 'Faro encendido'\n", '~/secretos.txt': 'El café de reserva está arriba.\n', ...faro };
const capitulos = [
  { titulo: 'Primera guardia', misiones: [
    m('¿Dónde estoy?', 'Soy Lumen. Antes de tocar nada, averigua en qué carpeta estás.', bienvenida,
      [usar('pwd')], 'pwd', ['El comando de tres letras imprime la ruta actual.', 'Escribe pwd.'],
      ['pwd'], 'Ya sabes dónde estás. Buen comienzo.'),
    m('¿Qué hay aquí?', 'Haz inventario de tu carpeta. Los cables no cuentan.', bienvenida,
      [usar('ls')], 'ls', ['Para listar el contenido de una carpeta, usa ls.'],
      ['ls'], 'Hay una carta. Lleva aquí más tiempo que yo.'),
    m('La carta', 'Lee el archivo bienvenida.txt.', bienvenida, [leer('~/bienvenida.txt')], 'cat',
      ['cat muestra el contenido de un archivo.', 'Escribe cat bienvenida.txt.'], ['cat bienvenida.txt'], 'Un saludo oficial. Qué lujo.'),
    m('En la bitácora', 'Entra en bitacora y lee la última entrada.', bienvenida,
      [en('~/bitacora'), leer('~/bitacora/ultima.txt')], 'cd cat', ['Usa cd bitacora.', 'Ya dentro, usa cat ultima.txt.'],
      ['cd bitacora', 'cat ultima.txt'], 'La boya del este sigue con nosotros.'),
    m('Vuelve a casa', 'Regresa a casa. Haz sitio en la pantalla y consulta los comandos disponibles.', bienvenida,
      [en('~'), usar('clear'), usar('help')], 'cd clear help', ['Desde bitacora, usa cd .. o cd ~.', 'Después prueba clear y help.'],
      ['cd ~', 'clear', 'help'], 'La guardia acaba. De momento.') ]
  },
  { titulo: 'Rutas', misiones: [
    m('El camino largo', 'Llega a /etc/faro con una ruta absoluta.', faro,
      [en('/etc/faro'), usar('cd', a => a[0]?.startsWith('/'), 'Usa una ruta que empiece por /')], 'cd',
      ['Una ruta absoluta comienza en la raíz /.', 'Usa cd /etc/faro.'], ['cd /etc/faro'], 'La configuración tiene su propio cuarto.'),
    m('La nota invisible', 'Lista el contenido de casa, incluidos los nombres ocultos.', faro,
      [usar('ls', a => a.some(p => /^-[^-]*[aA]/.test(p)), 'Incluye los nombres que empiezan por punto')], 'ls',
      ['Los nombres con punto se ocultan en un ls normal.', 'Usa ls -a o ls -A.'], ['ls -a'], 'La nota no se esconde mucho una vez que sabes mirar.'),
    m('Cartas pesadas', '¿Qué archivo es el más grande de ~/cartas? Dime su nombre.', { '~/cartas/marea.txt': 'a'.repeat(50),
      '~/cartas/puerto.txt': 'b'.repeat(2090), '~/cartas/boya.txt': 'c'.repeat(232) },
      [respuesta('puerto.txt', 'Responde con el nombre del archivo más grande')], 'ls responder',
      ['ls -l muestra tamaños. Añade S para ordenar por tamaño.', 'Usa ls -lS ~/cartas y luego responder seguido del nombre.'],
      ['ls -lS ~/cartas', 'responder puerto.txt'], 'Para esa carta hizo falta una saca.'),
    m('Ida y vuelta', 'Visita /etc/faro, vuelve con cd - y úsalo otra vez para regresar.', faro,
      [usar('cd', (a, cwd) => a[0] === '-' && cwd === '/etc/faro', 'Vuelve desde /etc/faro con cd -'),
        usar('cd', (a, cwd) => a[0] === '-' && cwd === HOME, 'Regresa a /etc/faro con cd -'), en('/etc/faro')], 'cd',
      ['cd - usa la carpeta anterior.', 'Prueba cd /etc/faro, cd - y cd -.'], ['cd /etc/faro', 'cd -', 'cd -'], 'La terminal recuerda de dónde vienes.'),
    m('Dos rutas', 'Desde /etc/faro, llega a tu bitácora con una ruta relativa y lee la entrada.', { ...faro, ...bienvenida },
      [en('~/bitacora'), usar('cd', a => a[0]?.startsWith('..'), 'Usa .. en la ruta relativa'), leer('~/bitacora/ultima.txt')], 'cd cat',
      ['Sube dos niveles para llegar a /.', 'Desde aquí, cd ../../home/aprendiz/bitacora.'],
      ['cd ../../home/aprendiz/bitacora', 'cat ultima.txt'], 'Has cruzado el servidor sin salir de la isla.', '/etc/faro') ]
  },
  { titulo: 'Orden en el almacén', misiones: [
    m('Tres estantes', 'Crea fotos, textos y viejo dentro de ~/almacen. Deja un archivo vacío inventario.txt en el almacén.', {},
      [...['fotos', 'textos', 'viejo'].map(n => existe('~/almacen/' + n, 'carpeta')), existe('~/almacen/inventario.txt')], 'mkdir touch',
      ['mkdir -p crea las carpetas intermedias. Admite varias rutas en la misma orden.', 'Usa touch ~/almacen/inventario.txt para el archivo.'],
      ['mkdir -p ~/almacen/fotos ~/almacen/textos ~/almacen/viejo', 'touch ~/almacen/inventario.txt'], 'Ahora parece un almacén.'),
    m('Fotos con fotos', 'Mueve los .jpg de descargas a fotos y los .txt a textos.', { ...descargas, ...almacen },
      Object.keys(descargas).flatMap(r => [existe('~/almacen/' + (r.endsWith('.jpg') ? 'fotos' : 'textos') + '/' + r.split('/').pop()), falta(r)]),
      'mv', ['*.jpg coincide con los nombres que terminan en .jpg.', 'Usa mv ~/descargas/*.jpg ~/almacen/fotos y repite con los textos.'],
      ['mv ~/descargas/*.jpg ~/almacen/fotos', 'mv ~/descargas/*.txt ~/almacen/textos'], 'Una foto de una roca. Qué vida la nuestra.'),
    m('Copia de guardia', 'Copia ~/almacen/textos en ~/respaldo.', { ...almacen, '~/almacen/textos/ruta.txt': 'ruta\n', '~/almacen/textos/turno.txt': 'turno\n' },
      [contenido('~/respaldo/ruta.txt', 'ruta\n'), contenido('~/respaldo/turno.txt', 'turno\n'),
        usar('cp', a => a.some(p => /^-[rR]+$/.test(p)), 'Usa una copia recursiva')], 'cp',
      ['Para copiar una carpeta, cp necesita -r.', 'Usa cp -r ~/almacen/textos ~/respaldo.'],
      ['cp -r ~/almacen/textos ~/respaldo'], 'Si algo se pierde, ya tienes otra copia.'),
    m('Limpieza temporal', 'Borra los dos archivos que terminan en .tmp. Conserva importante.tmp.txt.',
      { '~/uno.tmp': 'borrar', '~/dos.tmp': 'borrar', '~/importante.tmp.txt': 'conservar' },
      [falta('~/uno.tmp'), falta('~/dos.tmp'), { ...existe('~/importante.tmp.txt'), texto: 'Conserva importante.tmp.txt', diferido: true }], 'rm',
      ['Comprueba primero qué coincide con echo *.tmp.', 'El patrón *.tmp exige que .tmp esté al final. Usa rm *.tmp.'],
      ['rm *.tmp'], 'La basura se fue. El archivo importante sigue aquí.'),
    m('El informe finalísimo', 'Renombra informe_final_FINAL2.txt a informe.txt.', { '~/informe_final_FINAL2.txt': 'Informe de guardia\n' },
      [falta('~/informe_final_FINAL2.txt'), contenido('~/informe.txt', 'Informe de guardia\n')], 'mv',
      ['mv también sirve para cambiar el nombre de un archivo.', 'Pon primero el nombre viejo y luego el nuevo.'],
      ['mv informe_final_FINAL2.txt informe.txt'], 'Un final, como mucho.') ]
  },
  { titulo: 'Archivos largos', misiones: [
    m('Cuenta los pulsos', '¿Cuántas líneas tiene /var/log/faro/luz.log?', logLuz, [respuesta('342', 'Responde con el número de líneas')], 'wc responder',
      ['wc -l cuenta los saltos de línea.', 'Escribe wc -l /var/log/faro/luz.log y pasa el número a responder.'],
      ['wc -l /var/log/faro/luz.log', 'responder 342'], 'Muchos pulsos. Todos a su tiempo.'),
    m('La última señal', 'Dime qué texto hay en la última línea de luz.log.', logLuz, [respuesta('Luz estable', 'Responde con el texto de la última línea')],
      'tail responder', ['tail muestra el final.', 'Usa tail -n 1 /var/log/faro/luz.log.'], ['tail -n 1 /var/log/faro/luz.log', 'responder Luz estable'], 'Estable. Me gusta esa palabra.'),
    m('Una muestra', 'Guarda las diez primeras líneas de luz.log en ~/inicio.txt.', logLuz,
      [contenido('~/inicio.txt', luz.split('\n').slice(0, 10).join('\n') + '\n')], 'head',
      ['head muestra diez líneas por defecto.', 'Redirige la salida con head /var/log/faro/luz.log > ~/inicio.txt.'],
      ['head /var/log/faro/luz.log > ~/inicio.txt'], 'Ya tenemos una muestra para el archivo.'),
    m('Otra anotación', 'Añade Relevo listo al final de ~/notas.txt. Conserva la primera línea.', { '~/notas.txt': 'Revisé la boya.\n' },
      [contenido('~/notas.txt', 'Revisé la boya.\nRelevo listo\n')], 'echo',
      ['> reemplaza el contenido. >> lo conserva y añade al final.', 'Usa echo "Relevo listo" >> ~/notas.txt.'],
      ['echo "Relevo listo" >> ~/notas.txt'], 'El relevo ya tiene constancia.'),
    m('Líneas numeradas', 'Muestra el manual con números. ¿En qué línea está «Revisa el rumbo.»?', manual,
      [usar('cat', a => a.includes('-n') && a.some(p => p.endsWith('manual.txt')), 'Numera manual.txt con cat -n'),
        respuesta('3', 'Responde con el número de línea')], 'cat',
      ['cat -n añade un número a cada línea.'], ['cat -n manual.txt', 'responder 3'], 'Así se indica una línea sin recitar el manual.') ]
  }
];
capitulos[0].misiones[4].cwd = HOME + '/bitacora';
capitulos.push(
  { titulo: 'Búsqueda', misiones: [
    m('La llave', 'Encuentra llave.txt en /srv y lee el archivo.', { '/srv/radio/turnos/llave.txt': 'La llave de radio está bajo el manual.\n' },
      [usar('find'), leer('/srv/radio/turnos/llave.txt')], 'find cat',
      ['find /srv -name llave.txt imprime la ruta que buscas.', 'Pasa esa ruta a cat.'],
      ['find /srv -name llave.txt', 'cat /srv/radio/turnos/llave.txt'], 'La próxima vez pondremos una etiqueta.'),
    m('Censo de registros', '¿Cuántos archivos .log hay en /var/log, contando las subcarpetas?', logs,
      [usar('find'), usar('wc'), respuesta('3', 'Responde con el total de archivos .log')], 'find wc',
      ['Usa -type f para buscar solo archivos. Pon el comodín entre comillas.', 'find /var/log -type f -name "*.log" | wc -l'],
      ['find /var/log -type f -name "*.log" | wc -l', 'responder 3'], 'Un registro por aquí, otro por allá.'),
    m('Solo los vacíos', 'Encuentra las carpetas vacías de ~/proyectos y bórralas.', proyectos,
      [usar('find', a => a.includes('-empty'), 'Busca entradas vacías'), falta('~/proyectos/vacio'), falta('~/proyectos/antiguo')], 'find rmdir',
      ['Combina -type d con -empty.', 'Usa rmdir con las rutas que aparecen.'], ['find ~/proyectos -empty -type d', 'rmdir ~/proyectos/vacio ~/proyectos/antiguo'],
      'Queda el plan de radio. Ese sí tiene trabajo dentro.'),
    m('Carga pesada', '¿Qué archivo de /srv/archivo supera los 100 KiB? Dime su nombre.', archivos,
      [usar('find', a => a.includes('-size'), 'Filtra por tamaño'), respuesta('boya.dat', 'Responde con el nombre del archivo')], 'find',
      ['find admite -size +100k para buscar archivos grandes.', 'Prueba find /srv/archivo -type f -size +100k.'],
      ['find /srv/archivo -type f -size +100k', 'responder boya.dat'], 'La boya genera datos hasta cuando no le hablamos.'),
    m('Nombres revueltos', 'Busca en el primer nivel de ~/archivo sin distinguir mayúsculas. ¿Cómo se llama el archivo de turnos?', {
      '~/archivo/Turnos.TXT': 'Guardia del viernes\n', '~/archivo/copias/turnos.txt': 'Antiguo\n' },
      [usar('find', a => a.includes('-maxdepth') && a.includes('-iname'), 'Limita la profundidad y omite diferencias de mayúsculas'),
        respuesta('Turnos.TXT', 'Responde con el nombre del archivo del primer nivel')], 'find',
      ['-maxdepth 1 llega solo a los hijos inmediatos. -iname ignora las mayúsculas.', 'Usa find ~/archivo -maxdepth 1 -iname turnos.txt.'],
      ['find ~/archivo -maxdepth 1 -iname turnos.txt', 'responder Turnos.TXT'], 'Turnos. Esta vez, con T mayúscula.') ]
  },
  { titulo: 'Dentro de los archivos', misiones: [
    m('La tormenta', '¿En qué línea de manual.txt aparece la palabra tormenta?', manual,
      [usar('grep'), respuesta('4', 'Responde con el número de línea')], 'grep',
      ['grep -n muestra el número de cada coincidencia.', 'Escribe grep -n tormenta manual.txt.'],
      ['grep -n tormenta manual.txt', 'responder 4'], 'Canal 7. Anótalo.'),
    m('Intentos fallidos', 'Cuenta los intentos de acceso marcados como FALLO en /var/log/acceso.log.', acceso,
      [usar('grep'), respuesta('32', 'Responde con el total de fallos')], 'grep',
      ['grep -c cuenta las líneas que coinciden.', 'Usa grep -c FALLO /var/log/acceso.log.'],
      ['grep -c FALLO /var/log/acceso.log', 'responder 32'], 'Treinta y dos. Alguien tiene mucha paciencia.'),
    m('La IP insistente', '¿Qué IP falló más veces? Filtra el registro, extrae la tercera columna y cuenta cada IP.', acceso,
      [...['grep', 'cut', 'sort', 'uniq'].map(c => usar(c)), respuesta(ip, 'Responde con la IP más repetida')], 'cut sort uniq',
      ["Empieza con grep FALLO /var/log/acceso.log | cut -d' ' -f3.", 'Ordena, cuenta con uniq -c y usa sort -rn | head -1.'],
      ["grep FALLO /var/log/acceso.log | cut -d' ' -f3 | sort | uniq -c | sort -rn | head -1", 'responder ' + ip],
      'Guarda esa IP. Me suena.'),
    m('Palabra delicada', 'Busca la palabra contraseña en todo /srv. ¿Qué archivo la contiene? Responde con la ruta completa.', {
      '/srv/radio/turnos.txt': 'CONTRASEÑA: consultar al turno de control.\n', '/srv/notas/tiempo.txt': 'Mar en calma.\n' },
      [usar('grep', a => a.some(p => /^-[^-]*r/.test(p)), 'Busca en las subcarpetas'),
        respuesta('/srv/radio/turnos.txt', 'Responde con la ruta del archivo')], 'grep',
      ['-r recorre carpetas y -i ignora mayúsculas.', 'grep -ri contraseña /srv'],
      ['grep -ri contraseña /srv', 'responder /srv/radio/turnos.txt'], 'Al menos aquí no han apuntado la contraseña.'),
    m('Señales normalizadas', 'Pasa la lista señales.txt a mayúsculas, quita duplicados y guarda el resultado en lista.txt.', {
      '~/señales.txt': 'roja\nverde\nroja\nblanca\n' }, [contenido('~/lista.txt', 'BLANCA\nROJA\nVERDE\n')], 'tr sort',
      ['tr a-z A-Z cambia letras minúsculas por mayúsculas.', 'Encadena tr a-z A-Z < señales.txt | sort -u > lista.txt.'],
      ['tr a-z A-Z < señales.txt | sort -u > lista.txt'], 'Tres señales. Cada una cuenta una vez.') ]
  },
  { titulo: 'Permisos', misiones: [
    m('Enciende la luz', 'Revisa los permisos de encender.sh y dale ejecución a su dueño. Después ejecútalo.', permisos,
      [modo('~/encender.sh', 'u+x'), usar('./encender.sh', (_, cwd) => cwd === HOME, 'Ejecuta ./encender.sh')], 'chmod ./encender.sh',
      ['ls -l encender.sh muestra los permisos.', 'Usa chmod u+x encender.sh y luego ./encender.sh.'],
      ['ls -l encender.sh', 'chmod u+x encender.sh', './encender.sh'], 'La luz estaba lista. Le faltaba permiso.'),
    m('Cierra el cajón', 'Deja lectura y escritura solo para ti en secretos.txt.', permisos,
      [modo('~/secretos.txt', '600')], 'chmod', ['6 equivale a lectura más escritura. 0 quita los tres permisos.', 'chmod 600 secretos.txt'],
      ['chmod 600 secretos.txt'], 'El café de reserva sigue a salvo.'),
    m('¿Quién escribe?', 'Mira /etc/faro/config y dime qué usuario puede escribir en él.', permisos,
      [respuesta('root', 'Responde con el nombre del usuario')], 'ls responder',
      ['Busca la w en los tres bloques de permisos y fíjate en el dueño.', 'Usa ls -l /etc/faro/config.'],
      ['ls -l /etc/faro/config', 'responder root'], 'Ese fichero lleva las llaves de la luz.'),
    m('Permisos simbólicos', 'Quita la escritura a grupo y otros en relevo.txt. Mantén el resto de permisos.', {
      '~/relevo.txt': { contenido: 'Turno de mañana\n', permisos: 'rw-rw-rw-' } },
      [modo('~/relevo.txt', '644', 'Deja los permisos en rw-r--r--')], 'chmod',
      ['g es grupo y o es otros.', 'Usa chmod go-w relevo.txt.'], ['chmod go-w relevo.txt'], 'El turno lo podrá leer sin reescribirlo.'),
    m('Una orden archivada', 'Ejecuta registro.sh con bash. El script debe dejar un archivo listo.txt.', {
      '~/registro.sh': "echo 'Relevo listo' > listo.txt\n" }, [contenido('~/listo.txt', 'Relevo listo\n')], 'bash',
      ['bash lee las líneas de un archivo de texto.', 'Usa bash registro.sh.'], ['bash registro.sh'], 'Acabas de ejecutar tu primer guion de guardia.') ]
  },
  { titulo: 'El intruso', misiones: [
    m('Acceso correcto', 'La IP sospechosa es ' + ip + '. ¿A qué hora aparece su primer acceso CORRECTO en /var/log/acceso.log?', intruso,
      [respuesta(hora, 'Responde con la hora del primer acceso correcto')], 'grep head',
      ['Filtra por CORRECTO y por la IP.', 'Usa grep CORRECTO /var/log/acceso.log | grep ' + ip + ' | head -1.'],
      ['grep CORRECTO /var/log/acceso.log | grep ' + ip + ' | head -1', 'responder ' + hora], 'Alguien entró durante el cambio de turno.'),
    m('La huella de la sesión', 'Busca la línea CAMBIO de sesion-7. Encuentra en /srv el archivo modificado y responde con su ruta.', intruso,
      [usar('find'), usar('grep'), respuesta(rutaIntruso, 'Responde con la ruta del archivo modificado')], 'find grep',
      ['grep CAMBIO /var/log/acceso.log revela el nombre del archivo.', 'Busca baliza.conf con find. Solo uno contiene sesion-7.'],
      ['grep CAMBIO /var/log/acceso.log', 'find /srv -name baliza.conf', 'grep -r sesion-7 /srv', 'responder ' + rutaIntruso],
      'Visitante cambió el canal de la baliza.'),
    m('La copia olvidada', 'Busca una copia .bak en /srv/control y léela. ¿Qué contraseña quedó escrita?', intruso,
      [usar('find'), leer(bak), respuesta('faro7', 'Responde con la contraseña que dejó la copia')], 'find cat',
      ['find /srv/control -name "*.bak" incluye los nombres con punto.', 'Lee la ruta que devuelve find.'],
      ['find /srv/control -name "*.bak"', 'cat ' + bak, 'responder faro7'], 'Entró como visitante con una contraseña que era el nombre del equipo.'),
    m('Informe de guardia', 'Escribe ~/informe_intruso.txt con la IP, la hora y la ruta del archivo que cambió el visitante.', intruso,
      [contiene('~/informe_intruso.txt', ip), contiene('~/informe_intruso.txt', hora), contiene('~/informe_intruso.txt', rutaIntruso)], 'echo',
      ['Usa echo con el texto entre comillas y > para guardarlo.', 'Los datos son ' + ip + ', ' + hora + ' y ' + rutaIntruso + '.'],
      ['echo "' + ip + ' ' + hora + ' ' + rutaIntruso + '" > ~/informe_intruso.txt'], 'Con esos datos, el relevo podrá seguir la pista.'),
    m('La última guardia', 'Borra la copia ' + bak + ' y quita la lectura a otros en /srv/control.', intruso,
      [falta(bak), modo('/srv/control', 'o-r')], 'rm chmod',
      ['Usa rm con la ruta exacta de la copia.', 'chmod o-r /srv/control quita la lectura a otros.'],
      ['rm ' + bak, 'chmod o-r /srv/control'], 'Gracias, aprendiz. Faro-7 vuelve a guiar a los barcos.') ]
  }
);
function objetivos(mision, sesion) {
  const estados = mision.objetivos.map(o => cumple(o, sesion));
  const preparado = estados.some((estado, i) => estado && !mision.objetivos[i].diferido);
  return estados.map((estado, i) => estado && (preparado || !mision.objetivos[i].diferido));
}
capitulos.forEach((capitulo, c) => capitulo.misiones.forEach((mision, i) => {
  mision.id = (c + 1) + '-' + (i + 1);
}));
const temporada2 = typeof module !== 'undefined' ? require('./misiones-faro2') : Shell.MisionesFaro2;
capitulos.push(...temporada2('es'));
Shell.Misiones = { capitulos, objetivos };
CR.Idioma?.registrar('es', 'terminal', Shell.Misiones);
if (typeof module !== 'undefined') module.exports = CR.Shell.Misiones;
})(globalThis.CR = globalThis.CR || {});

