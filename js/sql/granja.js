CR.Idioma.registrar('es', 'sqlGranja', {
  tablas: {
    animales: {
      columnas: [
        {"nombre":"id","tipo":"INTEGER","pk":true},
        {"nombre":"nombre","tipo":"TEXT","notNull":true},
        {"nombre":"especie","tipo":"TEXT"},
        {"nombre":"edad","tipo":"INTEGER"},
        {"nombre":"peso","tipo":"REAL"},
        {"nombre":"corral","tipo":"TEXT"}
      ],
      filas: [
        [1,"Pipa","gallina",3,2.5,"sur"],
        [2,"Nube","vaca",6,460,"norte"],
        [3,"Luna","cabra",5,47.5,"este"],
        [4,"Oliva","oveja",4,62,"este"],
        [5,"Pipa","cabra",2,32,null],
        [6,"Tiza","gallina",1,1.8,"sur"],
        [7,"Rayo","burro",9,180,"oeste"],
        [8,"Trufa","cerdo",3,95,"oeste"],
        [9,"Brisa","vaca",4,410,"norte"],
        [10,"Miga","gallina",4,2.8,"sur"],
        [11,"Copo","oveja",2,51,"este"],
        [12,"Menta","cabra",6,53,"este"]
      ]
    },
    cultivos: {
      columnas: [
        {"nombre":"id","tipo":"INTEGER","pk":true},
        {"nombre":"nombre","tipo":"TEXT"},
        {"nombre":"parcela","tipo":"TEXT"},
        {"nombre":"kilos","tipo":"REAL"},
        {"nombre":"sembrado","tipo":"TEXT"}
      ],
      filas: [
        [1,"zanahoria","A",90,"2026-03-14"],
        [2,"patata","B",120,"2026-03-15"],
        [3,"lechuga","A",36,"2026-03-16"],
        [4,"maíz","C",135,"2026-03-17"],
        [5,"tomate","D",84,"2026-03-18"],
        [6,"calabaza","C",103,"2026-03-19"],
        [7,"guisante","B",45,"2026-03-20"],
        [8,"cebolla","D",68,"2026-03-21"]
      ]
    },
    clientes: {
      columnas: [
        {"nombre":"id","tipo":"INTEGER","pk":true},
        {"nombre":"nombre","tipo":"TEXT"},
        {"nombre":"pueblo","tipo":"TEXT"}
      ],
      filas: [
        [1,"Ana","Vega"],
        [2,"Leo","Pinar"],
        [3,"Inés","Vega"],
        [4,"Ivo","Ribera"],
        [5,"Nora","Pinar"],
        [6,"Uma","Ribera"]
      ]
    },
    ventas: {
      columnas: [
        {"nombre":"id","tipo":"INTEGER","pk":true},
        {"nombre":"cliente_id","tipo":"INTEGER"},
        {"nombre":"producto","tipo":"TEXT"},
        {"nombre":"cantidad","tipo":"INTEGER"},
        {"nombre":"precio","tipo":"REAL"},
        {"nombre":"fecha","tipo":"TEXT"}
      ],
      filas: [
        [1,1,"huevos",6,0.5,"2026-04-01"],
        [2,2,"leche",4,1.5,"2026-04-02"],
        [3,3,"zanahoria",8,1.25,"2026-04-03"],
        [4,4,"queso",2,6,"2026-04-04"],
        [5,5,"patata",5,2,"2026-04-05"],
        [6,1,"queso",3,6,"2026-04-06"],
        [7,2,"huevos",12,0.5,"2026-04-07"],
        [8,3,"leche",6,1.5,"2026-04-08"],
        [9,4,"zanahoria",6,1.25,"2026-04-09"],
        [10,5,"queso",2,6,"2026-04-10"],
        [11,1,"patata",7,2,"2026-04-11"],
        [12,2,"zanahoria",10,1.25,"2026-04-12"],
        [13,3,"huevos",6,0.5,"2026-04-13"],
        [14,4,"leche",3,1.5,"2026-04-14"],
        [15,5,"zanahoria",2,1.25,"2026-04-15"],
        [16,1,"leche",3,1.5,"2026-04-16"],
        [17,2,"queso",1,6,"2026-04-17"],
        [18,3,"patata",4,2,"2026-04-18"],
        [19,5,"huevos",12,0.5,"2026-04-19"],
        [20,99,"patata",2,2,"2026-04-20"]
      ]
    }
  }
});
