(function () {
  'use strict';
  const nodo = typeof module !== 'undefined';
  const { mapa } = nodo ? require('../comun/tablero') : window.CR.Tablero;
  const L = nodo ? require('../comun/lecciones') : window.CR.Lecciones;
  const giros = 'avanzar girar_izquierda girar_derecha';
  const niveles = L.crear(L.catalogo, [
    {
      titulo: 'Primeros pasos', intro: ['Soy Pico. El cristal está al final del túnel.', 'Escribe las órdenes en el orden en que quieres que las ejecute.'],
      pista: 'Avanza dos veces, gira a la derecha y sigue hacia abajo.',
      variantes: [mapa('EESS', {}, [1, 2])], ordenes: giros,
      ejemplo: 'avanzar()', estrellas3: 5,
      solucion: 'avanzar()\navanzar()\ngirar_derecha()\navanzar()\navanzar()'
    }, {
      titulo: 'El túnel largo', intro: ['Tengo siete pasos de frente y tres después del giro.', 'Una orden repetida cabe en un bucle. Aquí tienes cinco líneas.'],
      pista: 'Escribe un for para cada tramo. Gira entre los dos bucles.',
      variantes: [mapa('EEEEEEESSS', {}, [0, 2])], ordenes: giros, maxLineas: 5, estrellas3: 5,
      ejemplo: 'for i in range(7):\n    avanzar()',
      solucion: 'for i in range(7):\n    avanzar()\ngirar_derecha()\nfor i in range(3):\n    avanzar()'
    }, {
      titulo: 'Rocas por sorpresa', intro: ['El cristal queda a seis pasos. Las rocas blandas cambian de sitio.', 'Antes de avanzar, comprueba si hace falta picar.'],
      pista: 'Dentro del bucle, pica solo si hay roca blanda. Avanza en cada vuelta.',
      variantes: [mapa('EEEEEE', { '2,3': 'r', '5,3': 'r' }, [0, 3]), mapa('EEEEEE', { '1,3': 'r', '4,3': 'r' }, [0, 3])],
      ordenes: 'avanzar picar hay_roca_blanda hay_muro', estrellas3: 4,
      ejemplo: 'if hay_roca_blanda():\n    picar()',
      solucion: 'for i in range(6):\n    if hay_roca_blanda():\n        picar()\n    avanzar()'
    }, {
      titulo: 'El cartel', intro: ['El cartel bajo mis ruedas indica la distancia al cristal.', 'Guarda ese número en una variable y úsalo para dar los pasos exactos.'],
      pista: 'Asigna leer_cartel() a pasos y escribe range(pasos).',
      variantes: [mapa('EEEE', { '0,4': 4 }, [0, 4]), mapa('EEEEEE', { '0,4': 6 }, [0, 4])],
      ordenes: 'avanzar leer_cartel', estrellas3: 3,
      ejemplo: 'pasos = leer_cartel()',
      solucion: 'pasos = leer_cartel()\nfor i in range(pasos):\n    avanzar()'
    }, {
      titulo: 'La escalera', intro: ['Cada escalón se sube con el mismo grupo de órdenes.', 'Define una función para el escalón y úsala cuatro veces.'],
      pista: 'Avanza, gira a la izquierda, avanza y gira a la derecha. Llama a la función dentro de un for.',
      variantes: [mapa('ENENENEN', {}, [1, 6])], ordenes: giros, maxLineas: 7,
      requiereConcepto: true, estrellas3: 7, ejemplo: 'def mirar_arriba():\n    girar_izquierda()',
      solucion: 'def escalon():\n    avanzar()\n    girar_izquierda()\n    avanzar()\n    girar_derecha()\nfor i in range(4):\n    escalon()'
    }
  ]);
  if (typeof window !== 'undefined') (window.CR ||= {}).NivelesRobot = niveles;
  if (nodo) module.exports = niveles;
})();
