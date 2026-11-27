// Topic 8: security. It uses its own database (the farm shop) so the course farm stays untouched.
(function (CR) {
  'use strict';
  const column = (nombre, tipo, pk) => ({ nombre, tipo, ...(pk ? { pk: true } : {}) });
  const bd = {
    tablas: {
      users: {
        columnas: [column('id', 'INTEGER', true), column('name', 'TEXT'), column('password', 'TEXT')],
        filas: [[1, 'admin', 'red-tractor-1987'], [2, 'bina', 'sunflower'], [3, 'nix', 'full-moon']]
      },
      animals: {
        columnas: [column('id', 'INTEGER', true), column('name', 'TEXT'), column('species', 'TEXT')],
        filas: [[1, 'Pearl', 'hen'], [2, 'Cinnamon', 'cow'], [3, 'Breeze', 'goat'], [4, 'Truffle', 'pig'], [5, 'Cloud', 'sheep']]
      }
    }
  };
  const login = {
    tipo: 'formulario', bd, modo: 'texto',
    campos: [{ nombre: 'user', etiqueta: 'User' }, { nombre: 'password', etiqueta: 'Password' }],
    plantilla: "SELECT name FROM users WHERE name = '{user}' AND password = '{password}'",
    mensajes: { conFilas: 'Hello, {name}. You are in.', sinFilas: 'Wrong user or password.', error: 'The page has failed.' }
  };
  function attacks() {
    return [
      { ...login, titulo: 'The shop door',
        texto: ['The farm shop has a page where you log in with a user and a password.',
          'Look at the query below: the page pastes what you type into the query, between quotes.',
          'Log in with the user `bina` and the password `sunflower`.'],
        objetivo: 'Log in as bina.', casos: [{ conFilas: true, primeraFila: { name: 'bina' } }],
        pistas: ['Type bina in User and sunflower in Password.'], solucion: { user: 'bina', password: 'sunflower' } },
      { ...login, titulo: 'One quote too many',
        texto: ["What if someone is called O'Neil? The quote in the name closes the text too early.",
          'Type a name with a quote and look at the query.',
          'Remember: if a value can break the query, it can also change it.'],
        objetivo: 'Make the page fail by typing a quote.', casos: [{ error: true }],
        pistas: ["Type O'Neil in User."], solucion: { user: "O'Neil", password: 'x' } },
      { ...login, titulo: 'In without the password',
        texto: ['`--` starts a comment: SQL ignores everything after it.',
          "If the user ends with `' --`, the quote closes the name. The rest of the query, the password part, becomes a comment.",
          'Log in as `admin` without knowing the password. This attack is called SQL injection.'],
        objetivo: 'Log in as admin with any password.',
        casos: [{ conFilas: true, primeraFila: { name: 'admin' }, escrito: { user: '--' } }],
        pistas: ['Close the name with a quote and comment out the rest with --.', "Type admin' -- in User and anything in Password."],
        solucion: { user: "admin' --", password: 'no-idea' } },
      { tipo: 'predice', titulo: 'A condition that is always true', bd,
        texto: ["Now the user is `x` and the password is `' OR '1'='1`. This is the query you get."],
        codigo: "SELECT name FROM users WHERE name = 'x' AND password = '' OR '1'='1';",
        pregunta: 'What does the query return?',
        opciones: ['All the users: admin, bina and nix.', 'No rows.', 'A syntax error.'], correcta: 0,
        prediccion: { filas: [['admin'], ['bina'], ['nix']], columnas: ['name'] },
        explicacion: "`AND` comes before `OR`. You get `(false) OR '1'='1'`, which is true for every row. The page would greet the first one: admin." },
      { ...login, titulo: 'The search box that shows too much',
        texto: ['The animal search box also pastes the text into the query.',
          '`UNION` joins the results of two `SELECT` queries that have the same number of columns.',
          'Search for a species that does not exist and add a `UNION` that reads the `users` table.'],
        campos: [{ nombre: 'species', etiqueta: 'Species' }],
        plantilla: "SELECT name, species FROM animals WHERE species = '{species}'",
        mensajes: { conFilas: 'Results:', sinFilas: 'There are no animals of that species.', error: 'The page has failed.' },
        objetivo: 'Make the search box show the users and their passwords.',
        casos: [{ conFilas: true, contiene: 'red-tractor-1987' }],
        pistas: ['First try goat: the query returns 2 columns.', "Type x' UNION SELECT name, password FROM users --"],
        solucion: { species: "x' UNION SELECT name, password FROM users --" } }
    ];
  }
  function defenses() {
    return [
      { tipo: 'explica', titulo: 'The fix: parameters', bd,
        texto: ['Instead of pasting the text, you put `?` in the query and pass the value separately.',
          'The database always treats a parameter as a value, never as SQL. Even if it has quotes or `--`.',
          'Run it: with the attack from before there are no rows. Change the parameters to `bina, sunflower` and run it again.'],
        codigo: 'SELECT name FROM users WHERE name = ? AND password = ?;', parametros: ["admin' --", 'no-idea'] },
      { ...login, modo: 'parametros', titulo: 'The fixed door',
        texto: ['This is the same page, but now it uses parameters. Look at the query: it has `?` and the values go separately.',
          "Try the attacks from before: `admin' --` or `' OR '1'='1`."],
        objetivo: 'Try an attack with a quote and check that it does not work any more.',
        casos: [{ conFilas: false, escrito: { user: "'" } }],
        pistas: ["Type admin' -- in User and anything in Password."], solucion: { user: "admin' --", password: 'no-idea' } },
      { tipo: 'reto', titulo: 'A safe search box', bd, codigo: '', parametros: ['goat'],
        texto: ['Write the search query with a parameter: the names of the animals of the species that comes in `?`.'],
        objetivo: 'Return the names of the animals of the species in the parameter.',
        casos: [
          { parametros: ['goat'], resultado: { columnas: ['name'], filas: [['Breeze']] } },
          { parametros: ["x' UNION SELECT name FROM users --"], resultado: { columnas: ['name'], filas: [] } }],
        requiere: ['parametros', 'where'],
        pistas: ['Start with SELECT name FROM animals WHERE …', 'Put ? where the species goes, without quotes.'],
        solucion: 'SELECT name FROM animals WHERE species = ?;' },
      { tipo: 'explica', titulo: 'More layers of defense', bd,
        texto: ['Parameters are the main defense. Also:',
          'The app connects to the database with a user that can only do what it needs.',
          'Passwords are not stored as they are: you store a slow salted hash, like bcrypt or Argon2. So even if someone reads the table, they do not see the passwords.',
          'Database errors are not shown on the page: they give clues to attackers.'],
        codigo: '-- Bad: the password is stored as it is\nSELECT name, password FROM users;\n-- Good: store only a slow salted hash and query with parameters' },
      { tipo: 'resumen', titulo: 'Security cheat sheet', bd,
        texto: ['Never paste what a person types into your SQL. Always use parameters.',
          'To practice more, try Operation Watchtower with Nix.'],
        codigo: "-- Dangerous: the text becomes part of the SQL\n-- \"... WHERE name = '\" + user + \"'\"\n\n-- Safe: the value goes separately\nSELECT name FROM users WHERE name = ? AND password = ?;\n\n-- ' closes the text and -- comments out the rest\n-- OR '1'='1' is always true\n-- UNION reads other tables" }
    ];
  }
  const pasos = [...attacks(), ...defenses()].map((paso, i) => ({ ...paso, id: 'sql-8:' + (i + 1) }));
  CR.Idioma.registrar('en', 'sqlSeguridad', { id: 'sql-8', titulo: 'Security: queries with parameters', pasos });
})(globalThis.CR);
