(function () {
  'use strict';
  const nodo = typeof module !== 'undefined';
  const L = nodo ? require('../comun/lecciones') : window.CR.Lecciones;
  const ordenes = 'avanzar plantar regar';
  const rutina = 'plantar()\nregar()\navanzar()';
  const bloque = '    ' + rutina.replace(/\n/g, '\n    ');
  const niveles = L.crear(L.catalogo, [
    {
      titulo: 'Primera siembra', intro: ['Soy Bina. Tenemos tres parcelas vacías.', 'Planta y riega cada una antes de avanzar. Acabamos en el mercado.'],
      pista: 'Escribe plantar(), regar() y avanzar() para cada parcela.',
      variantes: [{ tierra: '...' }], ordenes, estrellas3: 9, ejemplo: rutina,
      solucion: [rutina, rutina, rutina].join('\n')
    }, {
      titulo: 'El campo grande', intro: ['Hoy hay ocho parcelas por sembrar y regar.', 'Solo tienes cuatro líneas. Repite el trabajo con un bucle.'],
      pista: 'Dentro de for i in range(8), escribe las tres órdenes de la rutina.',
      variantes: [{ tierra: '........' }], ordenes, maxLineas: 4, estrellas3: 4,
      ejemplo: 'for i in range(2):\n' + bloque,
      solucion: 'for i in range(8):\n' + bloque
    }, {
      titulo: 'Tierra seca', intro: ['Ya hay semillas en todas las parcelas.', 'Riega solo la tierra seca. Si ya está húmeda, sigue caminando.'],
      pista: 'Usa if tierra_seca() dentro del bucle. Deja avanzar() fuera del if, pero dentro del for.',
      variantes: [{ tierra: 'shshhshs' }, { tierra: 'hshshhss' }], ordenes: 'avanzar regar tierra_seca', estrellas3: 4,
      ejemplo: 'if tierra_seca():\n    regar()',
      solucion: 'for i in range(8):\n    if tierra_seca():\n        regar()\n    avanzar()'
    }, {
      titulo: 'A contar zanahorias', intro: ['La cosecha cambia de un campo al otro.', 'Empieza con la cesta a cero. Suma uno al cosechar y declara el total en el mercado.'],
      pista: 'Recorre ocho parcelas. Si hay zanahoria, cosecha y aumenta cesta. Al salir del bucle, vende con cesta.',
      variantes: [{ tierra: '.z..z.z.', venta: 3 }, { tierra: 'z.zz.zz.', venta: 5 }],
      ordenes: 'avanzar cosechar vender hay_zanahoria en_mercado', estrellas3: 7,
      ejemplo: 'cesta = 0\ncesta += 1',
      solucion: 'cesta = 0\nfor i in range(8):\n    if hay_zanahoria():\n        cosechar()\n        cesta = cesta + 1\n    avanzar()\nvender(cesta)'
    }, {
      titulo: 'La rutina de Bina', intro: ['Tenemos dos filas de cuatro parcelas.', 'El camino enlaza las filas por el extremo. Define una función para cuidar cada parcela.'],
      pista: 'Dentro de la función, planta, riega y avanza. Llámala ocho veces con un bucle.',
      variantes: [{ tierra: '........', filas: 2 }], ordenes, requiereConcepto: true,
      estrellas3: 6, ejemplo: 'def sembrar_y_regar():\n    plantar()\n    regar()',
      solucion: 'def cuidar_parcela():\n' + bloque + '\nfor i in range(8):\n    cuidar_parcela()'
    }
  ]);
  if (typeof window !== 'undefined') {
    window.CR.NivelesGranja = niveles;
    window.CR.Idioma.registrar('es', 'granja', niveles);
  }
  if (nodo) module.exports = niveles;
})();
