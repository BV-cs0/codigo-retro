// Tema 8: seguridad. Usa su propia base de datos (la tienda de la granja) para no tocar la granja del curso.
(function (CR) {
  'use strict';
  const columna = (nombre, tipo, pk) => ({ nombre, tipo, ...(pk ? { pk: true } : {}) });
  const bd = {
    tablas: {
      usuarios: {
        columnas: [columna('id', 'INTEGER', true), columna('nombre', 'TEXT'), columna('clave', 'TEXT')],
        filas: [[1, 'admin', 'tractor-rojo-1987'], [2, 'bina', 'girasol'], [3, 'nix', 'luna-llena']]
      },
      animales: {
        columnas: [columna('id', 'INTEGER', true), columna('nombre', 'TEXT'), columna('especie', 'TEXT')],
        filas: [[1, 'Perla', 'gallina'], [2, 'Canela', 'vaca'], [3, 'Brisa', 'cabra'], [4, 'Trufa', 'cerdo'], [5, 'Nube', 'oveja']]
      }
    }
  };
  const entrada = {
    tipo: 'formulario', bd, modo: 'texto',
    campos: [{ nombre: 'usuario', etiqueta: 'Usuario' }, { nombre: 'clave', etiqueta: 'Contraseña' }],
    plantilla: "SELECT nombre FROM usuarios WHERE nombre = '{usuario}' AND clave = '{clave}'",
    mensajes: { conFilas: 'Hola, {nombre}. Has entrado.', sinFilas: 'Usuario o contraseña incorrectos.', error: 'La página ha fallado.' }
  };
  function ataques() {
    return [
      { ...entrada, titulo: 'La puerta de la tienda',
        texto: ['La tienda de la granja tiene una página para entrar con usuario y contraseña.',
          'Mira la consulta de abajo: la página pega lo que escribes dentro de la consulta, entre comillas.',
          'Entra con el usuario `bina` y la contraseña `girasol`.'],
        objetivo: 'Entra como bina.', casos: [{ conFilas: true, primeraFila: { nombre: 'bina' } }],
        pistas: ['Escribe bina en Usuario y girasol en Contraseña.'], solucion: { usuario: 'bina', clave: 'girasol' } },
      { ...entrada, titulo: 'Una comilla de más',
        texto: ["¿Y si alguien se llama O'Neil? La comilla de su nombre cierra el texto antes de tiempo.",
          'Escribe un nombre con una comilla y mira cómo queda la consulta.',
          'Recuerda: si un dato puede romper la consulta, también puede cambiarla.'],
        objetivo: 'Haz que la página falle escribiendo una comilla.', casos: [{ error: true }],
        pistas: ["Escribe O'Neil en Usuario."], solucion: { usuario: "O'Neil", clave: 'x' } },
      { ...entrada, titulo: 'Entrar sin la contraseña',
        texto: ['Con `--` empieza un comentario: SQL ignora todo lo que va detrás.',
          "Si el usuario termina en `' --`, la comilla cierra el nombre. El resto de la consulta, la parte de la contraseña, se queda en un comentario.",
          'Entra como `admin` sin saber su contraseña. Este ataque se llama inyección SQL.'],
        objetivo: 'Entra como admin con cualquier contraseña.',
        casos: [{ conFilas: true, primeraFila: { nombre: 'admin' }, escrito: { usuario: '--' } }],
        pistas: ['Cierra el nombre con una comilla y comenta el resto con --.', "Escribe admin' -- en Usuario y cualquier cosa en Contraseña."],
        solucion: { usuario: "admin' --", clave: 'no-la-se' } },
      { tipo: 'predice', titulo: 'Una condición siempre verdadera', bd,
        texto: ["Ahora el usuario es `x` y la contraseña es `' OR '1'='1`. Así queda la consulta."],
        codigo: "SELECT nombre FROM usuarios WHERE nombre = 'x' AND clave = '' OR '1'='1';",
        pregunta: '¿Qué devuelve la consulta?',
        opciones: ['Todos los usuarios: admin, bina y nix.', 'Ninguna fila.', 'Un error de sintaxis.'], correcta: 0,
        prediccion: { filas: [['admin'], ['bina'], ['nix']], columnas: ['nombre'] },
        explicacion: "`AND` va antes que `OR`. Queda `(falso) OR '1'='1'`, que es verdadero en todas las filas. La página saludaría a la primera: admin." },
      { ...entrada, titulo: 'El buscador que enseña demasiado',
        texto: ['El buscador de animales también pega el texto en la consulta.',
          'Con `UNION` se juntan los resultados de dos `SELECT` que tienen el mismo número de columnas.',
          'Busca una especie que no existe y añade un `UNION` que lea la tabla `usuarios`.'],
        campos: [{ nombre: 'especie', etiqueta: 'Especie' }],
        plantilla: "SELECT nombre, especie FROM animales WHERE especie = '{especie}'",
        mensajes: { conFilas: 'Resultados:', sinFilas: 'No hay animales de esa especie.', error: 'La página ha fallado.' },
        objetivo: 'Haz que el buscador muestre los usuarios y sus contraseñas.',
        casos: [{ conFilas: true, contiene: 'tractor-rojo-1987' }],
        pistas: ['Primero prueba con cabra: la consulta devuelve 2 columnas.', "Escribe x' UNION SELECT nombre, clave FROM usuarios --"],
        solucion: { especie: "x' UNION SELECT nombre, clave FROM usuarios --" } }
    ];
  }
  function defensas() {
    return [
      { tipo: 'explica', titulo: 'La solución: parámetros', bd,
        texto: ['En lugar de pegar el texto, se pone `?` en la consulta y el valor se pasa aparte.',
          'La base de datos trata un parámetro siempre como un valor, nunca como SQL. Aunque lleve comillas o `--`.',
          'Ejecuta: con el ataque de antes no sale ninguna fila. Cambia los parámetros por `bina, girasol` y ejecuta otra vez.'],
        codigo: 'SELECT nombre FROM usuarios WHERE nombre = ? AND clave = ?;', parametros: ["admin' --", 'no-la-se'] },
      { ...entrada, modo: 'parametros', titulo: 'La puerta arreglada',
        texto: ['Es la misma página, pero ahora usa parámetros. Mira la consulta: lleva `?` y los valores van aparte.',
          "Prueba los ataques de antes: `admin' --` o `' OR '1'='1`."],
        objetivo: 'Prueba un ataque con una comilla y comprueba que ya no funciona.',
        casos: [{ conFilas: false, escrito: { usuario: "'" } }],
        pistas: ["Escribe admin' -- en Usuario y cualquier cosa en Contraseña."], solucion: { usuario: "admin' --", clave: 'no-la-se' } },
      { tipo: 'reto', titulo: 'Un buscador seguro', bd, codigo: '', parametros: ['cabra'],
        texto: ['Escribe la consulta del buscador con un parámetro: el nombre de los animales de la especie que llega en `?`.'],
        objetivo: 'Devuelve el nombre de los animales de la especie del parámetro.',
        casos: [
          { parametros: ['cabra'], resultado: { columnas: ['nombre'], filas: [['Brisa']] } },
          { parametros: ["x' UNION SELECT nombre FROM usuarios --"], resultado: { columnas: ['nombre'], filas: [] } }],
        requiere: ['parametros', 'where'],
        pistas: ['Empieza por SELECT nombre FROM animales WHERE …', 'Pon ? donde va la especie, sin comillas.'],
        solucion: 'SELECT nombre FROM animales WHERE especie = ?;' },
      { tipo: 'explica', titulo: 'Más capas de defensa', bd,
        texto: ['Los parámetros son la defensa principal. Además:',
          'La aplicación entra en la base de datos con un usuario que solo puede hacer lo que necesita.',
          'Las contraseñas no se guardan tal cual: se guarda un hash lento con sal, como bcrypt o Argon2. Así, aunque alguien lea la tabla, no ve las claves.',
          'Los errores de la base de datos no se enseñan en la página: dan pistas a quien ataca.'],
        codigo: '-- Mal: la contraseña está guardada tal cual\nSELECT nombre, clave FROM usuarios;\n-- Bien: guardar solo un hash lento con sal y consultar con parámetros' },
      { tipo: 'resumen', titulo: 'Chuleta de seguridad', bd,
        texto: ['Nunca pegues lo que escribe una persona dentro del SQL. Usa siempre parámetros.',
          'Para practicar más, prueba Operación Atalaya con Nix.'],
        codigo: "-- Peligroso: el texto forma parte del SQL\n-- \"... WHERE nombre = '\" + usuario + \"'\"\n\n-- Seguro: el valor va aparte\nSELECT nombre FROM usuarios WHERE nombre = ? AND clave = ?;\n\n-- ' cierra el texto y -- comenta el resto\n-- OR '1'='1' es siempre verdadero\n-- UNION lee otras tablas" }
    ];
  }
  const pasos = [...ataques(), ...defensas()].map((paso, i) => ({ ...paso, id: 'sql-8:' + (i + 1) }));
  CR.Idioma.registrar('es', 'sqlSeguridad', { id: 'sql-8', titulo: 'Seguridad: consultas con parámetros', pasos });
})(globalThis.CR);
