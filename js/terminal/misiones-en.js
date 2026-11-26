(function (CR) {
'use strict';
const Shell = CR.Shell = CR.Shell || {};
const { identidad } = typeof module !== 'undefined' ? require('../shell/sfa') : Shell.SFA;
const HOME = identidad('en').home;
const en = ruta => ({ texto: 'Go to ' + ruta, tipo: 'cwd', ruta });
const existe = (ruta, clase = 'archivo') => ({ texto: 'Create or place ' + ruta, tipo: 'existe', ruta, clase });
const falta = ruta => ({ texto: 'Remove ' + ruta, tipo: 'noExiste', ruta });
const contenido = (ruta, igual, texto = 'Save the requested text in ' + ruta) => ({ texto, tipo: 'contenido', ruta, igual });
const contiene = (ruta, valor) => ({ texto: 'Include ' + valor + ' in ' + ruta, tipo: 'contenido', ruta, contiene: valor });
const modo = (ruta, modo, texto = 'Set ' + modo + ' on ' + ruta) => ({ texto, tipo: 'permisos', ruta, modo });
const usar = (comando, args, texto = 'Use ' + comando) => ({ texto, tipo: 'usaComando', comando, args });
const respuesta = (valor, texto) => ({ texto, tipo: 'respuesta', valor });
const leer = ruta => ({ texto: 'Read ' + ruta, tipo: 'leyo', ruta });
function m(titulo, texto, fs, objetivos, comandos, pistas, solucion, cierre, cwd = HOME) {
  return { titulo, texto, fs, objetivos, comandos: comandos.split(' '), pistas, solucion, cierre, cwd, idioma: 'en' };
}
const bienvenida = { '~/welcome.txt': 'Welcome to Beacon-7. The logbook is next to this file.\n',
  '~/logbook/latest.txt': '03:00. The east buoy is sending signals again.\n' };
const faro = { '/etc/beacon/config': { contenido: 'light=on\n', permisos: 'rw-r--r--', dueno: 'root' },
  '~/.note': 'If you hear three beeps, look east.\n' };
const descargas = { '~/downloads/wave.jpg': 'photo: wave\n', '~/downloads/rock.jpg': 'photo: rock\n',
  '~/downloads/route.txt': 'route\n', '~/downloads/shift.txt': 'shift\n' };
const almacen = { '~/storeroom/photos/': null, '~/storeroom/texts/': null, '~/storeroom/old/': null };
const luz = Array.from({ length: 342 }, (_, i) => i === 341 ? 'Steady light' :
  'Pulse ' + String(i + 1).padStart(3, '0') + ' · sensor ' + ((i * 17 + 7) % 9 + 1)).join('\n') + '\n';
const logLuz = { '/var/log/beacon/light.log': luz };
const logs = { ...logLuz, '/var/log/access.log': '', '/var/log/network/traffic.log': '', '/var/log/network/README': 'Shifts.\n' };
const proyectos = { '~/projects/empty/': null, '~/projects/old/': null, '~/projects/radio/plan.txt': 'Keep this.\n' };
const archivos = { '/srv/archive/buoy.dat': 'b'.repeat(105000), '/srv/archive/map.dat': 'm'.repeat(18600) };
const manual = { '~/manual.txt': 'Duty manual\nCheck the radio.\nCheck the heading.\nIn a storm, use channel 7.\nWrite down the time.\n' };
const ip = '192.0.2.41';
const hora = '02:43';
const rutaIntruso = '/srv/control/beacon.conf';
const bak = '/srv/control/.shift.bak';
function generarAccesos() {
  const ips = [ip, '198.51.100.19', '203.0.113.80'];
  let semilla = 17;
  const lineas = Array.from({ length: 160 }, (_, i) => {
    semilla = (semilla * 25173 + 13849) % 65536;
    const fallo = i < 32;
    const origen = fallo ? ips[i < 19 ? 0 : 1 + i % 2] : ips[1 + semilla % 2];
    return String(Math.floor(i / 60)).padStart(2, '0') + ':' + String(i % 60).padStart(2, '0') +
      (fallo ? ' FAIL ' : ' OK ') + origen + ' keeper';
  });
  return [...lineas, hora + ' OK ' + ip + ' visitor session-7',
    '02:44 CHANGE ' + ip + ' session-7 beacon.conf', '03:00 CLOSE ' + ip + ' session-7'].join('\n') + '\n';
}
const acceso = { '/var/log/access.log': generarAccesos() };
const control = { '/srv/control/': { dueno: 'apprentice', permisos: 'rwxrwxr-x' }, [rutaIntruso]: 'channel=9\nsession-7\n',
  [bak]: 'Visitor: password beacon7. Change it after the shift.\n' };
const intruso = { ...acceso, ...control, '/srv/tests/beacon.conf': 'channel=7\n' };
const permisos = { '~/light.sh': "echo 'Beacon lit'\n", '~/secrets.txt': 'The spare coffee is upstairs.\n', ...faro };
const capitulos = [
  { titulo: 'First watch', misiones: [
    m('Where am I?', 'I\'m Lumen. Before you touch anything, find out which folder you\'re in.', bienvenida,
      [usar('pwd')], 'pwd', ['The three-letter command prints your current path.', 'Type pwd.'],
      ['pwd'], 'Now you know where you are. Good start.'),
    m('What\'s here?', 'List what\'s in your folder. The cables don\'t count.', bienvenida,
      [usar('ls')], 'ls', ['Use ls to list what\'s in a folder.'],
      ['ls'], 'There\'s a letter. It\'s been here longer than I have.'),
    m('The letter', 'Read the welcome.txt file.', bienvenida, [leer('~/welcome.txt')], 'cat',
      ['cat shows the contents of a file.', 'Type cat welcome.txt.'], ['cat welcome.txt'], 'An official welcome. Fancy.'),
    m('In the logbook', 'Go to logbook and read the latest entry.', bienvenida,
      [en('~/logbook'), leer('~/logbook/latest.txt')], 'cd cat', ['Use cd logbook.', 'Once inside, use cat latest.txt.'],
      ['cd logbook', 'cat latest.txt'], 'The east buoy is still with us.'),
    m('Back home', 'Go back home. Clear the screen and check which commands are available.', bienvenida,
      [en('~'), usar('clear'), usar('help')], 'cd clear help', ['From logbook, use cd .. or cd ~.', 'Then try clear and help.'],
      ['cd ~', 'clear', 'help'], 'Your watch is over. For now.') ]
  },
  { titulo: 'Paths', misiones: [
    m('The long way', 'Go to /etc/beacon using an absolute path.', faro,
      [en('/etc/beacon'), usar('cd', a => a[0]?.startsWith('/'), 'Use a path that starts with /')], 'cd',
      ['An absolute path starts at the root, /.', 'Use cd /etc/beacon.'], ['cd /etc/beacon'], 'The settings have their own room.'),
    m('The invisible note', 'List your home folder, including hidden names.', faro,
      [usar('ls', a => a.some(p => /^-[^-]*[aA]/.test(p)), 'Include names that start with a dot')], 'ls',
      ['A plain ls hides names that start with a dot.', 'Use ls -a or ls -A.'], ['ls -a'], 'The note is easy to find once you know where to look.'),
    m('Heavy letters', 'Which file is the largest in ~/letters? Tell me its name.', { '~/letters/tide.txt': 'a'.repeat(50),
      '~/letters/harbor.txt': 'b'.repeat(2090), '~/letters/buoy.txt': 'c'.repeat(232) },
      [respuesta('harbor.txt', 'Answer with the name of the largest file')], 'ls answer',
      ['ls -l shows sizes. Add S to sort by size.', 'Use ls -lS ~/letters, then type answer followed by the name.'],
      ['ls -lS ~/letters', 'answer harbor.txt'], 'That letter needed a whole mailbag.'),
    m('There and back', 'Go to /etc/beacon, go back with cd -, then use it again to return.', faro,
      [usar('cd', (a, cwd) => a[0] === '-' && cwd === '/etc/beacon', 'Go back from /etc/beacon with cd -'),
        usar('cd', (a, cwd) => a[0] === '-' && cwd === HOME, 'Return to /etc/beacon with cd -'), en('/etc/beacon')], 'cd',
      ['cd - takes you to the previous folder.', 'Try cd /etc/beacon, cd -, then cd - again.'], ['cd /etc/beacon', 'cd -', 'cd -'], 'The terminal remembers where you came from.'),
    m('Two paths', 'From /etc/beacon, use a relative path to reach your logbook and read the entry.', { ...faro, ...bienvenida },
      [en('~/logbook'), usar('cd', a => a[0]?.startsWith('..'), 'Use .. in the relative path'), leer('~/logbook/latest.txt')], 'cd cat',
      ['Go up two levels to reach /.', 'From here, type cd ../../home/apprentice/logbook.'],
      ['cd ../../home/apprentice/logbook', 'cat latest.txt'], 'You crossed the server without leaving the island.', '/etc/beacon') ]
  },
  { titulo: 'Tidy the storeroom', misiones: [
    m('Three shelves', 'Create photos, texts and old in ~/storeroom. Leave an empty inventory.txt file in the storeroom.', {},
      [...['photos', 'texts', 'old'].map(n => existe('~/storeroom/' + n, 'carpeta')), existe('~/storeroom/inventory.txt')], 'mkdir touch',
      ['mkdir -p creates parent folders too. You can give it several paths in one command.', 'Use touch ~/storeroom/inventory.txt for the file.'],
      ['mkdir -p ~/storeroom/photos ~/storeroom/texts ~/storeroom/old', 'touch ~/storeroom/inventory.txt'], 'Now it looks like a storeroom.'),
    m('Photos go together', 'Move the .jpg files from downloads to photos and the .txt files to texts.', { ...descargas, ...almacen },
      Object.keys(descargas).flatMap(r => [existe('~/storeroom/' + (r.endsWith('.jpg') ? 'photos' : 'texts') + '/' + r.split('/').pop()), falta(r)]),
      'mv', ['*.jpg matches names that end in .jpg.', 'Use mv ~/downloads/*.jpg ~/storeroom/photos. Do the same for the text files.'],
      ['mv ~/downloads/*.jpg ~/storeroom/photos', 'mv ~/downloads/*.txt ~/storeroom/texts'], 'A photo of a rock. What a life.'),
    m('A backup copy', 'Copy ~/storeroom/texts to ~/backup.', { ...almacen, '~/storeroom/texts/route.txt': 'route\n', '~/storeroom/texts/shift.txt': 'shift\n' },
      [contenido('~/backup/route.txt', 'route\n'), contenido('~/backup/shift.txt', 'shift\n'),
        usar('cp', a => a.some(p => /^-[rR]+$/.test(p)), 'Copy the folder and its contents')], 'cp',
      ['To copy a folder, cp needs -r.', 'Use cp -r ~/storeroom/texts ~/backup.'],
      ['cp -r ~/storeroom/texts ~/backup'], 'If something gets lost, you have another copy.'),
    m('Clear out temporary files', 'Delete the two files that end in .tmp. Keep important.tmp.txt.',
      { '~/one.tmp': 'delete', '~/two.tmp': 'delete', '~/important.tmp.txt': 'keep' },
      [falta('~/one.tmp'), falta('~/two.tmp'), { ...existe('~/important.tmp.txt'), texto: 'Keep important.tmp.txt', diferido: true }], 'rm',
      ['First check what matches with echo *.tmp.', 'The pattern *.tmp only matches names ending in .tmp. Use rm *.tmp.'],
      ['rm *.tmp'], 'The junk is gone. The important file is still here.'),
    m('The very final report', 'Rename report_final_FINAL2.txt to report.txt.', { '~/report_final_FINAL2.txt': 'Watch report\n' },
      [falta('~/report_final_FINAL2.txt'), contenido('~/report.txt', 'Watch report\n')], 'mv',
      ['You can also use mv to rename a file.', 'Put the old name first, then the new one.'],
      ['mv report_final_FINAL2.txt report.txt'], 'One final is enough.') ]
  },
  { titulo: 'Long files', misiones: [
    m('Count the pulses', 'How many lines are in /var/log/beacon/light.log?', logLuz, [respuesta('342', 'Answer with the line count')], 'wc answer',
      ['wc -l counts line breaks.', 'Type wc -l /var/log/beacon/light.log, then give the number to answer.'],
      ['wc -l /var/log/beacon/light.log', 'answer 342'], 'Lots of pulses. All right on time.'),
    m('The last signal', 'Tell me what the last line of light.log says.', logLuz, [respuesta('Steady light', 'Answer with the text on the last line')],
      'tail answer', ['tail shows the end.', 'Use tail -n 1 /var/log/beacon/light.log.'], ['tail -n 1 /var/log/beacon/light.log', 'answer Steady light'], 'Steady. I like that word.'),
    m('A sample', 'Save the first ten lines of light.log in ~/start.txt.', logLuz,
      [contenido('~/start.txt', luz.split('\n').slice(0, 10).join('\n') + '\n')], 'head',
      ['head shows ten lines by default.', 'Send the output to a file with head /var/log/beacon/light.log > ~/start.txt.'],
      ['head /var/log/beacon/light.log > ~/start.txt'], 'We have a sample for the archive now.'),
    m('Another note', 'Add Next shift ready to the end of ~/notes.txt. Keep the first line.', { '~/notes.txt': 'I checked the buoy.\n' },
      [contenido('~/notes.txt', 'I checked the buoy.\nNext shift ready\n')], 'echo',
      ['> replaces the contents. >> adds text at the end.', 'Use echo "Next shift ready" >> ~/notes.txt.'],
      ['echo "Next shift ready" >> ~/notes.txt'], 'The next shift has a record now.'),
    m('Numbered lines', 'Show the manual with line numbers. Which line says “Check the heading.”?', manual,
      [usar('cat', a => a.includes('-n') && a.some(p => p.endsWith('manual.txt')), 'Number the lines in manual.txt with cat -n'),
        respuesta('3', 'Answer with the line number')], 'cat',
      ['cat -n adds a number to each line.'], ['cat -n manual.txt', 'answer 3'], 'Now you can point to one line without reading the whole manual.') ]
  }
];
capitulos[0].misiones[4].cwd = HOME + '/logbook';
capitulos.push(
  { titulo: 'Search', misiones: [
    m('The key', 'Find key.txt in /srv and read it.', { '/srv/radio/shifts/key.txt': 'The radio key is under the manual.\n' },
      [usar('find'), leer('/srv/radio/shifts/key.txt')], 'find cat',
      ['find /srv -name key.txt prints the path you need.', 'Give that path to cat.'],
      ['find /srv -name key.txt', 'cat /srv/radio/shifts/key.txt'], 'Next time we\'ll put a label on it.'),
    m('Count the logs', 'How many .log files are in /var/log, including its subfolders?', logs,
      [usar('find'), usar('wc'), respuesta('3', 'Answer with the total number of .log files')], 'find wc',
      ['Use -type f to find files only. Put the wildcard in quotes.', 'find /var/log -type f -name "*.log" | wc -l'],
      ['find /var/log -type f -name "*.log" | wc -l', 'answer 3'], 'One log here, another there.'),
    m('Only empty folders', 'Find and remove the empty folders in ~/projects.', proyectos,
      [usar('find', a => a.includes('-empty'), 'Search for empty entries'), falta('~/projects/empty'), falta('~/projects/old')], 'find rmdir',
      ['Use -type d with -empty.', 'Use rmdir with the paths you found.'], ['find ~/projects -empty -type d', 'rmdir ~/projects/empty ~/projects/old'],
      'The radio plan is still there. There\'s work to do in that folder.'),
    m('Heavy load', 'Which file in /srv/archive is larger than 100 KiB? Tell me its name.', archivos,
      [usar('find', a => a.includes('-size'), 'Filter by size'), respuesta('buoy.dat', 'Answer with the file name')], 'find',
      ['Use -size +100k with find to look for large files.', 'Try find /srv/archive -type f -size +100k.'],
      ['find /srv/archive -type f -size +100k', 'answer buoy.dat'], 'The buoy sends data even when we leave it alone.'),
    m('Mixed-up names', 'Search one level deep in ~/archive and ignore letter case. What is the shift file called?', {
      '~/archive/Shifts.TXT': 'Friday watch\n', '~/archive/copies/shifts.txt': 'Old\n' },
      [usar('find', a => a.includes('-maxdepth') && a.includes('-iname'), 'Limit the search depth and ignore letter case'),
        respuesta('Shifts.TXT', 'Answer with the name of the file at the first level')], 'find',
      ['-maxdepth 1 searches one level deep. -iname ignores letter case.', 'Use find ~/archive -maxdepth 1 -iname shifts.txt.'],
      ['find ~/archive -maxdepth 1 -iname shifts.txt', 'answer Shifts.TXT'], 'Shifts. With a capital S this time.') ]
  },
  { titulo: 'Inside the files', misiones: [
    m('The storm', 'On which line of manual.txt does the word storm appear?', manual,
      [usar('grep'), respuesta('4', 'Answer with the line number')], 'grep',
      ['grep -n shows the line number for each match.', 'Type grep -n storm manual.txt.'],
      ['grep -n storm manual.txt', 'answer 4'], 'Channel 7. Write that down.'),
    m('Failed attempts', 'Count the login attempts marked FAIL in /var/log/access.log.', acceso,
      [usar('grep'), respuesta('32', 'Answer with the total number of failed attempts')], 'grep',
      ['grep -c counts the matching lines.', 'Use grep -c FAIL /var/log/access.log.'],
      ['grep -c FAIL /var/log/access.log', 'answer 32'], 'Thirty-two. Someone has a lot of patience.'),
    m('The IP that keeps trying', 'Which IP failed most often? Filter the log, take the third column and count each IP.', acceso,
      [...['grep', 'cut', 'sort', 'uniq'].map(c => usar(c)), respuesta(ip, 'Answer with the most frequent IP')], 'cut sort uniq',
      ["Start with grep FAIL /var/log/access.log | cut -d' ' -f3.", 'Sort, count with uniq -c and use sort -rn | head -1.'],
      ["grep FAIL /var/log/access.log | cut -d' ' -f3 | sort | uniq -c | sort -rn | head -1", 'answer ' + ip],
      'Save that IP. It looks familiar.'),
    m('A sensitive word', 'Search all of /srv for the word password. Which file contains it? Answer with the full path.', {
      '/srv/radio/shifts.txt': 'PASSWORD: ask the keeper on duty.\n', '/srv/notes/weather.txt': 'Calm sea.\n' },
      [usar('grep', a => a.some(p => /^-[^-]*r/.test(p)), 'Search the subfolders'),
        respuesta('/srv/radio/shifts.txt', 'Answer with the file path')], 'grep',
      ['-r searches subfolders and -i ignores letter case.', 'grep -ri password /srv'],
      ['grep -ri password /srv', 'answer /srv/radio/shifts.txt'], 'At least they didn\'t write down the password here.'),
    m('Clean up the signals', 'Change the text in signals.txt to uppercase, remove duplicates and save the result in list.txt.', {
      '~/signals.txt': 'red\ngreen\nred\nwhite\n' }, [contenido('~/list.txt', 'GREEN\nRED\nWHITE\n')], 'tr sort',
      ['tr a-z A-Z changes lowercase letters to uppercase.', 'Link the commands with tr a-z A-Z < signals.txt | sort -u > list.txt.'],
      ['tr a-z A-Z < signals.txt | sort -u > list.txt'], 'Three signals. Each one counts once.') ]
  },
  { titulo: 'Permissions', misiones: [
    m('Turn on the light', 'Check the permissions on light.sh. Let its owner run it, then run it yourself.', permisos,
      [modo('~/light.sh', 'u+x'), usar('./light.sh', (_, cwd) => cwd === HOME, 'Run ./light.sh')], 'chmod ./light.sh',
      ['ls -l light.sh shows the permissions.', 'Use chmod u+x light.sh, then run ./light.sh.'],
      ['ls -l light.sh', 'chmod u+x light.sh', './light.sh'], 'The light was ready. It just needed permission.'),
    m('Close the drawer', 'Give only yourself read and write access to secrets.txt.', permisos,
      [modo('~/secrets.txt', '600')], 'chmod', ['6 gives read and write access. 0 removes all three permissions.', 'chmod 600 secrets.txt'],
      ['chmod 600 secrets.txt'], 'The spare coffee is still safe.'),
    m('Who can write?', 'Look at /etc/beacon/config and tell me which user can write to it.', permisos,
      [respuesta('root', 'Answer with the user name')], 'ls answer',
      ['Look for the w in the three groups of permissions and check the owner.', 'Use ls -l /etc/beacon/config.'],
      ['ls -l /etc/beacon/config', 'answer root'], 'That file holds the keys to the light.'),
    m('Symbolic permissions', 'Remove write access for group and others on handover.txt. Keep the other permissions.', {
      '~/handover.txt': { contenido: 'Morning shift\n', permisos: 'rw-rw-rw-' } },
      [modo('~/handover.txt', '644', 'Set the permissions to rw-r--r--')], 'chmod',
      ['g means group and o means others.', 'Use chmod go-w handover.txt.'], ['chmod go-w handover.txt'], 'The next shift can read it without changing it.'),
    m('A command in a file', 'Run record.sh with bash. The script should create ready.txt.', {
      '~/record.sh': "echo 'Next shift ready' > ready.txt\n" }, [contenido('~/ready.txt', 'Next shift ready\n')], 'bash',
      ['bash reads commands from a text file.', 'Use bash record.sh.'], ['bash record.sh'], 'You just ran your first watch script.') ]
  },
  { titulo: 'The intruder', misiones: [
    m('Successful login', 'The suspicious IP is ' + ip + '. At what time does its first OK login appear in /var/log/access.log?', intruso,
      [respuesta(hora, 'Answer with the time of the first successful login')], 'grep head',
      ['Filter by OK and by the IP.', 'Use grep OK /var/log/access.log | grep ' + ip + ' | head -1.'],
      ['grep OK /var/log/access.log | grep ' + ip + ' | head -1', 'answer ' + hora], 'Someone logged in during the shift change.'),
    m('The session\'s trail', 'Look for the CHANGE line for session-7. Find the changed file in /srv and answer with its path.', intruso,
      [usar('find'), usar('grep'), respuesta(rutaIntruso, 'Answer with the path of the changed file')], 'find grep',
      ['grep CHANGE /var/log/access.log shows the file name.', 'Use find to look for beacon.conf. Only one file contains session-7.'],
      ['grep CHANGE /var/log/access.log', 'find /srv -name beacon.conf', 'grep -r session-7 /srv', 'answer ' + rutaIntruso],
      'The visitor changed the beacon\'s channel.'),
    m('The forgotten backup', 'Find a .bak file in /srv/control and read it. What password is in it?', intruso,
      [usar('find'), leer(bak), respuesta('beacon7', 'Answer with the password in the backup')], 'find cat',
      ['find /srv/control -name "*.bak" also finds names that start with a dot.', 'Read the file that find shows you.'],
      ['find /srv/control -name "*.bak"', 'cat ' + bak, 'answer beacon7'], 'The visitor logged in with the machine name as the password.'),
    m('Watch report', 'Write the IP, time and path of the file the visitor changed to ~/intruder_report.txt.', intruso,
      [contiene('~/intruder_report.txt', ip), contiene('~/intruder_report.txt', hora), contiene('~/intruder_report.txt', rutaIntruso)], 'echo',
      ['Use echo with the text in quotes and > to save it.', 'The details are ' + ip + ', ' + hora + ' and ' + rutaIntruso + '.'],
      ['echo "' + ip + ' ' + hora + ' ' + rutaIntruso + '" > ~/intruder_report.txt'], 'The next shift can follow the trail with those details.'),
    m('The last watch', 'Delete the backup ' + bak + ' and remove read access for others on /srv/control.', intruso,
      [falta(bak), modo('/srv/control', 'o-r')], 'rm chmod',
      ['Use rm with the exact path to the backup.', 'chmod o-r /srv/control removes read access for others.'],
      ['rm ' + bak, 'chmod o-r /srv/control'], 'Thanks, apprentice. Beacon-7 is guiding ships again.') ]
  }
);
capitulos.forEach((capitulo, c) => capitulo.misiones.forEach((mision, i) => {
  mision.id = (c + 1) + '-' + (i + 1);
}));
const base = typeof module !== 'undefined' ? require('./misiones') : Shell.Misiones;
capitulos.push(...Shell.MisionesFaro2('en'));
const datos = { capitulos, objetivos: base.objetivos };
CR.Idioma?.registrar('en', 'terminal', datos);
if (typeof module !== 'undefined') module.exports = datos;
})(globalThis.CR = globalThis.CR || {});
