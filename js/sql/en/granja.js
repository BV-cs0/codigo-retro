CR.Idioma.registrar('en', 'sqlGranja', {
  tablas: {
    animals: {
      columnas: [
        {"nombre":"id","tipo":"INTEGER","pk":true},
        {"nombre":"name","tipo":"TEXT","notNull":true},
        {"nombre":"species","tipo":"TEXT"},
        {"nombre":"age","tipo":"INTEGER"},
        {"nombre":"weight","tipo":"REAL"},
        {"nombre":"pen","tipo":"TEXT"}
      ],
      filas: [
        [1,"Pip","hen",3,2.5,"south"],
        [2,"Cloud","cow",6,460,"north"],
        [3,"Moon","goat",5,47.5,"east"],
        [4,"Olive","sheep",4,62,"east"],
        [5,"Pip","goat",2,32,null],
        [6,"Chalk","hen",1,1.8,"south"],
        [7,"Flash","donkey",9,180,"west"],
        [8,"Truffle","pig",3,95,"west"],
        [9,"Breeze","cow",4,410,"north"],
        [10,"Crumb","hen",4,2.8,"south"],
        [11,"Flake","sheep",2,51,"east"],
        [12,"Mint","goat",6,53,"east"]
      ]
    },
    crops: {
      columnas: [
        {"nombre":"id","tipo":"INTEGER","pk":true},
        {"nombre":"name","tipo":"TEXT"},
        {"nombre":"plot","tipo":"TEXT"},
        {"nombre":"kilos","tipo":"REAL"},
        {"nombre":"planted","tipo":"TEXT"}
      ],
      filas: [
        [1,"carrot","A",90,"2026-03-14"],
        [2,"potato","B",120,"2026-03-15"],
        [3,"lettuce","A",36,"2026-03-16"],
        [4,"corn","C",135,"2026-03-17"],
        [5,"tomato","D",84,"2026-03-18"],
        [6,"pumpkin","C",103,"2026-03-19"],
        [7,"pea","B",45,"2026-03-20"],
        [8,"onion","D",68,"2026-03-21"]
      ]
    },
    customers: {
      columnas: [
        {"nombre":"id","tipo":"INTEGER","pk":true},
        {"nombre":"name","tipo":"TEXT"},
        {"nombre":"town","tipo":"TEXT"}
      ],
      filas: [
        [1,"Ana","Meadow"],
        [2,"Leo","Pinewood"],
        [3,"Inez","Meadow"],
        [4,"Ivo","Riverside"],
        [5,"Nora","Pinewood"],
        [6,"Uma","Riverside"]
      ]
    },
    sales: {
      columnas: [
        {"nombre":"id","tipo":"INTEGER","pk":true},
        {"nombre":"customer_id","tipo":"INTEGER"},
        {"nombre":"product","tipo":"TEXT"},
        {"nombre":"quantity","tipo":"INTEGER"},
        {"nombre":"price","tipo":"REAL"},
        {"nombre":"date","tipo":"TEXT"}
      ],
      filas: [
        [1,1,"eggs",6,0.5,"2026-04-01"],
        [2,2,"milk",4,1.5,"2026-04-02"],
        [3,3,"carrot",8,1.25,"2026-04-03"],
        [4,4,"cheese",2,6,"2026-04-04"],
        [5,5,"potato",5,2,"2026-04-05"],
        [6,1,"cheese",3,6,"2026-04-06"],
        [7,2,"eggs",12,0.5,"2026-04-07"],
        [8,3,"milk",6,1.5,"2026-04-08"],
        [9,4,"carrot",6,1.25,"2026-04-09"],
        [10,5,"cheese",2,6,"2026-04-10"],
        [11,1,"potato",7,2,"2026-04-11"],
        [12,2,"carrot",10,1.25,"2026-04-12"],
        [13,3,"eggs",6,0.5,"2026-04-13"],
        [14,4,"milk",3,1.5,"2026-04-14"],
        [15,5,"carrot",2,1.25,"2026-04-15"],
        [16,1,"milk",3,1.5,"2026-04-16"],
        [17,2,"cheese",1,6,"2026-04-17"],
        [18,3,"potato",4,2,"2026-04-18"],
        [19,5,"eggs",12,0.5,"2026-04-19"],
        [20,99,"potato",2,2,"2026-04-20"]
      ]
    }
  }
});
