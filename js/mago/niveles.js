(function () {
  'use strict';
  const nodo = typeof module !== 'undefined';
  const { mapa } = nodo ? require('../comun/tablero') : window.CR.Tablero;
  const L = nodo ? require('../comun/lecciones') : window.CR.Lecciones;
  const giros = 'avanzar girar_izquierda girar_derecha';
  const rutina = '    avanzar()\n    girar_derecha()\n    avanzar()\n    girar_izquierda()';
  const niveles = L.crear(L.catalogo, [
    {
      titulo: 'Primer hechizo', intro: ['Soy Brasa. Ese portal es la salida.', 'El camino dobla dos veces. Por suerte, andar todavía no requiere magia.'],
      pista: 'Avanza, gira a la derecha, avanza, gira a la izquierda y avanza.',
      variantes: [mapa('ESE', {}, [2, 2])], ordenes: giros, estrellas3: 5, ejemplo: 'avanzar()',
      solucion: 'avanzar()\ngirar_derecha()\navanzar()\ngirar_izquierda()\navanzar()'
    }, {
      titulo: 'El pasillo eterno', intro: ['Desde el umbral hay ocho pasos hasta el portal.', 'Repite avanzar con un bucle. No hace falta memorizar ocho conjuros.'],
      pista: 'Usa range(8) y sangra avanzar() dentro del bucle.',
      variantes: [mapa('EEEEEEEE', {}, [-1, 3])], ordenes: 'avanzar', estrellas3: 2,
      ejemplo: 'for i in range(2):\n    avanzar()', solucion: 'for i in range(8):\n    avanzar()'
    }, {
      titulo: 'Murciélagos', intro: ['Los murciélagos de sombra han cambiado de refugio.', 'Si hay uno delante, espántalo con fuego antes de avanzar.'],
      pista: 'Repite seis veces. Comprueba si hay enemigo, lanza fuego si lo hay y da un paso.',
      variantes: [mapa('EEEEEE', { '1,4': 'b', '4,4': 'b' }, [0, 4]), mapa('EEEEEE', { '2,4': 'b', '5,4': 'b' }, [0, 4])],
      ordenes: 'avanzar lanzar_fuego hay_enemigo hay_muro', estrellas3: 4,
      ejemplo: 'if hay_enemigo():\n    lanzar_fuego()',
      solucion: 'for i in range(6):\n    if hay_enemigo():\n        lanzar_fuego()\n    avanzar()'
    }, {
      titulo: 'La puerta de la runa', intro: ['La piedra bajo mis botas guarda la clave.', 'Léela antes de moverte y guarda ese número para abrir la puerta.'],
      pista: 'Lee la runa, da un paso, abre con la variable y avanza dos veces.',
      variantes: [mapa('EEE', { '2,5': 3, '4,5': 'p3' }, [2, 5]), mapa('EEE', { '2,5': 7, '4,5': 'p7' }, [2, 5])],
      ordenes: 'avanzar abrir leer_runa', estrellas3: 5, ejemplo: 'clave = leer_runa()',
      solucion: 'clave = leer_runa()\navanzar()\nabrir(clave)\navanzar()\navanzar()'
    }, {
      titulo: 'Zigzag', intro: ['Este pasaje repite el mismo giro doble tres veces.', 'Dale nombre a ese recorrido y llámalo para cada tramo.'],
      pista: 'Cada tramo va a la derecha de la pantalla, luego hacia abajo, y termina mirando al este.',
      variantes: [mapa('ESESES', {}, [2, 2])], ordenes: giros, estrellas3: 7, ejemplo: 'def girar_dos_veces():\n    girar_derecha()\n    girar_derecha()',
      solucion: 'def tramo():\n' + rutina + '\nfor i in range(3):\n    tramo()'
    }
  ]);
  if (typeof window !== 'undefined') {
    window.CR.NivelesMago = niveles;
    window.CR.Idioma.registrar('es', 'mago', niveles);
  }
  if (nodo) module.exports = niveles;
})();
