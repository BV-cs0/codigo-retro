(function () {
  'use strict';
  const conceptos = ['secuencia', 'repetir', 'si', 'asignar', 'definir'];
  const nombres = ['Secuencia', 'Bucles', 'Condiciones', 'Variables', 'Funciones'];
  const notas = [
    'En Python de verdad… las instrucciones se ejecutan en orden. Cambiar su posición puede cambiar el resultado.',
    'En Python de verdad… for con range(3) repite un bloque tres veces. El bloque va sangrado.',
    'En Python de verdad… if ejecuta un bloque si la condición es cierta. else cubre el caso contrario.',
    'En Python de verdad… = asigna un valor a un nombre. Puedes leerlo después o actualizarlo con +=.',
    'En Python de verdad… def define una función. Escribe su nombre y los paréntesis cada vez que quieras llamarla.'
  ];
  const logros = [
    'Una secuencia en el orden adecuado te ha llevado a la meta.',
    'Un bucle repite el mismo bloque sin copiar cada orden.',
    'Una condición deja que el programa decida según lo que encuentra.',
    'Una variable conserva un valor para usarlo más adelante.',
    'Una función permite llamar al mismo grupo de órdenes varias veces.'
  ];
  const opciones = ordenes => ({
    acciones: ordenes.filter(o => !o.sensor).map(o => o.nombre),
    sensores: ordenes.filter(o => o.sensor).map(o => o.nombre),
    aridades: Object.fromEntries(ordenes.map(o => [o.nombre, o.parametro ? 1 : 0]))
  });
  function crear(catalogo, fichas) {
    return fichas.map((ficha, i) => ({
      ...ficha, id: i + 1, concepto: conceptos[i], etiqueta: nombres[i], pythonReal: notas[i],
      logro: logros[i], ordenes: ficha.ordenes.split(' ').map(nombre => ({ nombre, ...catalogo[nombre] }))
    }));
  }
  const catalogo = {
    avanzar: { descripcion: 'Da un paso hacia delante.' },
    girar_izquierda: { descripcion: 'Gira 90° a la izquierda.' },
    girar_derecha: { descripcion: 'Gira 90° a la derecha.' },
    picar: { descripcion: 'Rompe la roca blanda que hay delante.' },
    hay_muro: { sensor: true, descripcion: 'Comprueba si hay un muro delante.' },
    hay_roca_blanda: { sensor: true, descripcion: 'Comprueba si hay roca blanda delante.' },
    leer_cartel: { sensor: true, descripcion: 'Devuelve el número del cartel bajo Pico.' },
    lanzar_fuego: { descripcion: 'Espanta al murciélago que hay delante.' },
    abrir: { parametro: 'numero', descripcion: 'Abre la puerta con el número de su runa.' },
    hay_enemigo: { sensor: true, descripcion: 'Comprueba si hay un murciélago delante.' },
    leer_runa: { sensor: true, descripcion: 'Devuelve el número de la piedra bajo Brasa.' },
    plantar: { descripcion: 'Siembra una parcela vacía.' },
    regar: { descripcion: 'Riega la parcela sembrada y seca.' },
    cosechar: { descripcion: 'Recoge la zanahoria madura de esta parcela.' },
    vender: { parametro: 'numero', descripcion: 'Declara cuántas zanahorias llevas al mercado.' },
    tierra_seca: { sensor: true, descripcion: 'Comprueba si la parcela actual está seca.' },
    hay_zanahoria: { sensor: true, descripcion: 'Comprueba si hay una zanahoria madura.' },
    en_mercado: { sensor: true, descripcion: 'Comprueba si estás en el puesto del mercado.' }
  };
  const Lecciones = { opciones, crear, catalogo };
  if (typeof window !== 'undefined') (window.CR ||= {}).Lecciones = Lecciones;
  if (typeof module !== 'undefined') module.exports = Lecciones;
})();
