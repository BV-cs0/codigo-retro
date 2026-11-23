(function (CR) {
'use strict';
const tipos = { e: 'explica', p: 'predice', a: 'arregla', r: 'reto', s: 'resumen' };
function ficha([tipo, titulo, texto, codigo, dato, salida, extra]) {
  const paso = { tipo: tipos[tipo], titulo, texto: [texto], codigo };
  if (tipo === 'a' || tipo === 'r') {
    Object.assign(paso, extra, { solucion: dato, salidaEsperada: salida, objetivo: texto,
      pistas: [tipo === 'a' ? 'Ejecuta el ejemplo y revisa dónde aparece el primer error.' : 'Prueba primero cada orden por separado.'] });
  } else if (tipo === 'p') {
    const posicion = (titulo.length % 3);
    const opciones = dato.slice();
    [opciones[0], opciones[posicion]] = [opciones[posicion], opciones[0]];
    Object.assign(paso, salida, { pregunta: '¿Qué ocurrirá al ejecutar el script?', opciones, correcta: posicion, explicacion: texto });
  } else Object.assign(paso, dato);
  return paso;
}
const datos = [
  ["Tu primer script", [
    ["e","Tu primer parte","Un script es un archivo de órdenes. Bash las ejecuta de arriba abajo. Cambia el saludo y ejecuta otra vez.","echo \"Hola\"\ndate"],
    ["e","Shebang y comentarios","El shebang de la primera línea indica qué intérprete usar al ejecutar el archivo directamente. Las demás líneas que empiezan con # son comentarios.","#!/bin/bash\n# Saludo de guardia\necho \"Buenos días\""],
    ["e","Dos formas de ejecutar","Con bash saludo.sh basta con poder leer el archivo. Para ./saludo.sh hace falta permiso de ejecución. Prueba las órdenes en la mini terminal.","echo \"Luz encendida\""],
    ["p","Un error entre dos órdenes","Sin set -e, un comando que falla puede ir seguido de otros comandos.","echo Inicio\norden_inexistente\necho Fin",["Inicio y Fin","Solo Inicio","Solo Fin"]],
    ["a","Cerrar las comillas","Busca dónde termina el texto del saludo.","echo \"Hola","echo \"Hola\"","Hola\n"],
    ["r","El parte del faro","Imprime tres líneas: Faro abierto, Luz encendida y Turno listo. Respeta las mayúsculas.","","echo \"Faro abierto\"\necho \"Luz encendida\"\necho \"Turno listo\"","Faro abierto\nLuz encendida\nTurno listo\n"],
    ["s","Chuleta del turno","Guarda estas órdenes para tu primer parte.","#!/bin/bash\n# Comentario\necho \"Luz encendida\"\n# bash saludo.sh: ejecuta el archivo\n# chmod +x saludo.sh: da permiso\n# ./saludo.sh: ejecución directa"]
  ]],
  ["Variables y comillas", [
    ["e","Guardar un nombre","Asigna con nombre=valor. Usa $nombre para recuperar lo guardado.","nombre=\"Lumen\"\necho \"Hola, $nombre\""],
    ["a","Quitar los espacios","Bash interpreta la primera palabra como una orden si dejas espacios alrededor de =.","nombre = \"Lumen\"\necho \"Hola, $nombre\"","nombre=\"Lumen\"\necho \"Hola, $nombre\"","Hola, Lumen\n"],
    ["e","Simples y dobles","Las comillas simples conservan cada carácter. Las dobles expanden $nombre y mantienen el resultado en un solo argumento.","nombre=Lumen\necho '$nombre'\necho \"$nombre\""],
    ["p","Un nombre con espacios","Mira las rutas nuevas en Archivos. Después prueba touch con el nombre entre comillas.","archivo=\"mi informe.txt\"\ntouch $archivo",["Crea mi e informe.txt","Crea mi informe.txt","No crea archivos"]],
    ["e","Guardar la salida","$(orden) ejecuta una orden y quita los saltos de línea que quedan al final de su salida.","hoy=$(date)\nn=$(ls | wc -l)\necho \"$hoy\"\necho \"$n\""],
    ["e","Calcular con enteros","Usa $(( expresión )). Dentro puedes escribir a y b sin $. La división entera 7 / 2 da 3.","a=3\nb=4\ntotal=$((a + b))\necho \"$total\"\necho \"$((7 / 2))\""],
    ["e","Longitud y valor por defecto","La expansión con # cuenta la longitud. Con :- eliges un valor si la variable está vacía o sin definir.","texto=Lumen\necho \"${#texto}\"\necho \"${turno:-noche}\""],
    ["r","Contar registros","Cuenta los archivos .log de /var/log/faro. Usa la ruta relativa var/log/faro desde la raíz simulada e imprime Hay N registros.","# Usa una sustitución de comandos","n=$(find var/log/faro -name \"*.log\" -type f | wc -l)\necho \"Hay $n registros\"","Hay 2 registros\n",{"cwd":"/","fs":{"/var/log/faro/a.log":"a\n","/var/log/faro/b.log":"b\n","/var/log/faro/c.txt":""},"requiere":["sustitucion"]}],
    ["s","Chuleta de variables","Las comillas dobles son una buena elección cuando el valor debe ser un solo argumento.","nombre=Lumen\necho \"$nombre\"\necho '$nombre'\nhoy=$(date)\nn=$((2 + 3))\necho \"${n:-0}\""]
  ]],
  ["Argumentos y read", [
    ["e","Los primeros argumentos","$1 y $2 son los primeros argumentos. $# cuenta todos. Cambia el campo Argumentos y ejecuta.","echo \"Primero: $1\"\necho \"Segundo: $2\"\necho \"Total: $#\"",{"args":["informe.txt","3"]}],
    ["e","El nombre y la lista","$0 identifica el script. Con \"$@\" se conserva cada argumento, incluso si lleva espacios.","echo \"$0\"\nprintf \"<%s>\\n\" \"$@\"",{"args":["mi informe.txt","3"]}],
    ["p","Cuando falta un argumento","Solo hay un argumento en el campo de arriba.","echo \"Segundo: <$2>\"",["Segundo: <>","Segundo: <$2>","Un error"],{"args":["informe.txt"]}],
    ["e","Pedir el nombre","read espera una línea. Con -p puedes mostrar una pregunta antes de leer.","read -p \"¿Tu nombre? \" nombre\necho \"Hola, $nombre\"",{"entradas":["Ana"]}],
    ["e","Códigos de salida","$? muestra el código de la última orden. Cero indica éxito. exit termina el script con el código indicado.","false\necho \"$?\"\nexit 1\necho \"No se ejecuta\""],
    ["r","Sumar argumentos","Escribe suma.sh para imprimir la suma de sus dos argumentos.","","# suma.sh\necho \"$(($1 + $2))\"","7\n",{"archivo":"suma.sh","args":["3","4"],"requiere":["aritmetica"],"casos":[{"args":["-2","9"],"salida":"7\n"}]}],
    ["r","Saludar con o sin argumento","Guarda $1 en nombre. Si no hay argumentos, pide el nombre con [ $# -eq 0 ] && read. El lado derecho de && solo se ejecuta si el izquierdo tiene éxito.","nombre=$1\n","nombre=$1\n[ $# -eq 0 ] && read -p \"¿Nombre? \" nombre\necho \"Hola, $nombre\"","Hola, Ana\n",{"args":["Ana"],"requiere":["read"],"casos":[{"args":[],"entradas":["Leo"],"salida":"Hola, Leo\n"}]}],
    ["s","Chuleta de argumentos","Prueba los parámetros cambiando los argumentos del script.","echo \"$0\"\necho \"$#\"\necho \"$1\"\nprintf \"%s\\n\" \"$@\"\nshift\nexit 0"]
  ]],
  ["Condiciones", [
    ["e","Una decisión","[ es una orden. Separa [ y ] del resto con espacios. then inicia el bloque y fi lo cierra.","edad=18\nif [ \"$edad\" -ge 18 ]; then\n  echo \"Acceso permitido\"\nfi"],
    ["a","Separar los corchetes","Corrige el comando que Bash intenta ejecutar con el nombre [18.","edad=18\nif [$edad -ge 18]; then echo Sí; fi","edad=18\nif [ \"$edad\" -ge 18 ]; then echo Sí; fi","Sí\n",{"requiere":["if"]}],
    ["e","Más de dos caminos","elif prueba otra condición si falló la anterior. else cubre el resto de casos.","nivel=2\nif [ \"$nivel\" -gt 2 ]; then echo alto\nelif [ \"$nivel\" -eq 2 ]; then echo medio\nelse echo bajo\nfi"],
    ["e","Números y textos","Usa -eq, -lt o -gt para números. Usa = y != para textos.","test 10 -gt 9 && echo mayor\ntest 010 != 10 && echo \"textos distintos\""],
    ["p","El orden de los textos","La barra protege < para que Bash lo pase como argumento de [.","[ \"10\" \\< \"9\" ] && echo verdadero",["verdadero","falso","Error de redirección"]],
    ["e","Comprobar archivos","-f prueba un archivo, -d una carpeta, -e si existe y -s si tiene contenido. Cuenta el log solo si existe.","if [ -f guardia.log ]; then wc -l < guardia.log; fi",{"fs":{"guardia.log":"inicio\nfin\n"}}],
    ["e","Patrones con [[ ]]","Dentro de [[ ]] puedes usar && y ||. A la derecha de ==, *.log compara como patrón.","archivo=\"turno de noche.log\"\nif [[ $archivo == *.log && -n $archivo ]]; then echo Registro; fi"],
    ["e","Un menú con case","Cada rama termina con ;;. Usa | para varios patrones y * para cualquier valor restante.","case \"$1\" in\n  start|stop) echo \"Orden recibida\" ;;\n  estado) echo \"Faro activo\" ;;\n  *) echo \"Orden desconocida\" ;;\nesac",{"args":["estado"]}],
    ["r","Comprobar un archivo","Sin argumento imprime Uso: comprobar.sh ARCHIVO y sale con 1. Si falta el archivo imprime No existe y sale con 2. Si existe imprime el número de líneas.","# Valida primero el argumento","if [ $# -eq 0 ]; then echo \"Uso: comprobar.sh ARCHIVO\"; exit 1; fi\nif [ ! -f \"$1\" ]; then echo \"No existe\"; exit 2; fi\nwc -l < \"$1\"","2\n",{"archivo":"comprobar.sh","args":["a.txt"],"fs":{"a.txt":"a\nb\n"},"requiere":["if","test-archivo"],"casos":[{"args":[],"salida":"Uso: comprobar.sh ARCHIVO\n","codigo":1},{"args":["falta"],"salida":"No existe\n","codigo":2}]}],
    ["s","Chuleta de condiciones","El código de salida de una orden decide si se ejecuta el bloque.","test -f guardia.log\n[ 3 -gt 2 ]\n[[ turno.log == *.log ]]\nif true; then echo sí; fi\ncase \"$1\" in *) echo listo ;; esac"]
  ]],
  ["Bucles", [
    ["e","Recorrer una lista","for asigna un valor a nombre en cada vuelta. do y done delimitan el cuerpo.","for nombre in Ana Leo Iris; do\n  echo \"Hola, $nombre\"\ndone"],
    ["e","Dos maneras de contar","Las llaves generan una lista. El for aritmético usa inicio, condición e incremento.","for i in {1..5}; do echo \"$i\"; done\nfor (( i=1; i<=5; i++ )); do echo \"$i\"; done"],
    ["e","Recorrer archivos","Los patrones se expanden en orden LC_ALL=C. Si *.txt no coincide, Bash conserva el patrón literal. Comprueba -f antes de usarlo.","for f in *.txt; do\n  [ -f \"$f\" ] && echo \"$f\"\ndone",{"fs":{"B.txt":"","a.txt":""}}],
    ["e","Un contador con while","while repite mientras la condición devuelva cero. Cambia n en cada vuelta.","n=0\nwhile [ \"$n\" -lt 5 ]; do\n  echo \"$n\"\n  n=$((n + 1))\ndone"],
    ["e","Leer un archivo línea a línea","La redirección al final alimenta a todo el bucle. read -r conserva las barras invertidas.","while read -r linea; do\n  echo \"$linea\"\ndone < guardia.txt",{"fs":{"guardia.txt":"Luz encendida\nViento suave\n"}}],
    ["p","Un bucle que no avanza","Fíjate en qué líneas modifican n y cuáles solo lo leen.","n=0\nwhile [ \"$n\" -lt 5 ]; do\n  :\ndone",["Se detiene al alcanzar el límite","Termina tras cinco vueltas","La condición falla al principio"],{"sinExportar":true}],
    ["r","Cambiar extensiones","Renombra los archivos .txt de ~/fotos a .bak. Conserva el contenido y protege los nombres con espacios.","# Usa for, [ -f ... ] y mv","for f in ~/fotos/*.txt; do\n  if [ -f \"$f\" ]; then mv \"$f\" \"${f%.txt}.bak\"; fi\ndone","",{"fs":{"fotos/a.txt":"a","fotos/mi foto.txt":"b","fotos/c.jpg":"c"},"archivos":{"~/fotos/a.bak":{"contiene":"a"},"~/fotos/mi foto.bak":{"contiene":"b"},"~/fotos/a.txt":{"existe":false}},"requiere":["for","if"]}],
    ["r","Sumar un archivo de números","Lee numeros.txt y escribe un único total. Usa while read y aritmética.","total=0","total=0\nwhile read -r n; do total=$((total + n)); done < numeros.txt\necho \"$total\"","10\n",{"fs":{"numeros.txt":"3\n-1\n8\n"},"requiere":["while-read","aritmetica"]}],
    ["s","Chuleta de bucles","Usa break para salir y continue para saltar a la vuelta siguiente.","for i in {1..3}; do echo \"$i\"; done\nfor (( i=0; i<3; i++ )); do :; done\nwhile false; do break; done\nuntil true; do continue; done\n# while read -r fila; do echo \"$fila\"; done < archivo"]
  ]],
  ["Funciones", [
    ["e","Definir y llamar","Define el bloque una vez y llámalo por su nombre donde lo necesites.","saludar() { echo \"Hola, $1\"; }\nsaludar Ana"],
    ["e","Argumentos de la llamada","Dentro de una función, $1 pertenece a esa llamada. Al salir vuelves a los argumentos del script.","saludar() { echo \"Dentro: $1\"; }\nsaludar Ana\necho \"Fuera: $1\"",{"args":["Leo"]}],
    ["p","Una asignación sin local","Predice qué nombre queda al volver. Después añade local dentro de la función.","nombre=Lumen\ncambiar() { nombre=Ana; }\ncambiar\necho \"$nombre\"",["Ana","Lumen","Un error"]],
    ["e","Resultado y código","return fija un código de salida. Para devolver texto, imprímelo y captúralo con $( ).","buscar() { echo \"Luz\"; return 3; }\nresultado=$(buscar)\necho \"Código: $?\"\necho \"Texto: $resultado\""],
    ["p","Texto frente a código","Una llamada directa imprime en la terminal. La sustitución guarda el texto.","sumar() { echo \"$(($1 + $2))\"; }\nresultado=$(sumar 2 3)\necho \"$resultado\"\nsumar 2 3\necho \"$?\"",["5, 5 y 0","5, 5 y 5","Solo 5"]],
    ["r","¿Es par?","Define es_par. Haz que devuelva 0 si el argumento es par y 1 si es impar. Usa la función en un if.","# Define es_par aquí","es_par() { local n=$1; (( n % 2 == 0 )); }\nif es_par \"$1\"; then echo par; else echo impar; fi","par\n",{"args":["4"],"casos":[{"args":["7"],"salida":"impar\n"}],"requiere":["funcion","if"]}],
    ["r","Contar cada registro","Define contar_lineas y llámala desde un for para mostrar el nombre de cada .log y su número de líneas.","# Define contar_lineas","contar_lineas() { wc -l < \"$1\"; }\nfor f in *.log; do echo \"$f: $(contar_lineas \"$f\")\"; done","a.log: 2\nb.log: 1\n",{"fs":{"a.log":"a\nb\n","b.log":"c\n"},"requiere":["funcion","for"]}],
    ["s","Chuleta de funciones","Declara con local las variables que pertenecen a una llamada.","saludar() { echo \"Hola, $1\"; }\nsaludar Ana\nresultado=$(saludar Leo)\necho \"$resultado\"\nvalida() { local n=$1; return \"$n\"; }"]
  ]],
  ["Texto y tuberías en scripts", [
    ["e","Filtrar y guardar","grep selecciona líneas. cut extrae campos, sort ordena y uniq elimina repeticiones consecutivas.","ips=$(grep FALLO acceso.log | cut -d \" \" -f 1 | sort | uniq)\necho \"$ips\"",{"fs":{"acceso.log":"2 FALLO\n1 OK\n2 FALLO\n3 FALLO\n"}}],
    ["e","Una tabla en un archivo","printf da formato a cada campo. > crea o sobrescribe el archivo. >> añade al final.","printf \"%-5s %5s\\n\" IP TOTAL > tabla.txt\nprintf \"%-5s %5s\\n\" 127 3 >> tabla.txt\ncat tabla.txt"],
    ["e","Un bloque de texto","El here-doc alimenta a cat hasta encontrar el delimitador en su propia línea. Las variables se expanden si el delimitador va sin comillas.","turno=noche\ncat <<EOF > parte.txt\nParte del faro\nTurno: $turno\nEOF\ncat parte.txt"],
    ["p","Sobrescribir en un bucle","Cada vuelta vuelve a abrir el mismo archivo con >.","for i in {1..3}; do echo \"$i\" > parte.txt; done\ncat parte.txt",["3","1, 2 y 3","1"]],
    ["a","Conservar todas las líneas","Limpia el archivo una vez. Después añade cada línea al final.","for i in {1..3}; do echo \"$i\" > parte.txt; done",": > parte.txt\nfor i in {1..3}; do echo \"$i\" >> parte.txt; done","",{"archivos":{"parte.txt":{"exacto":"1\n2\n3\n"}}}],
    ["r","IP únicas y ordenadas","Extrae el primer campo de acceso.log. Guarda todas las IP únicas en ips.txt en orden.","# Conecta cut, sort y uniq","cut -d \" \" -f 1 acceso.log | sort | uniq > ips.txt","",{"fs":{"acceso.log":"3 OK\n2 FALLO\n3 FALLO\n"},"archivos":{"ips.txt":{"exacto":"2\n3\n"}}}],
    ["s","Chuleta de tuberías","Encadena órdenes pequeñas y guarda el resultado donde haga falta.","echo luz | tr a-z A-Z\nprintf \"%s\\n\" texto > parte.txt\necho fin >> parte.txt\ncat <<EOF\nParte del turno\nEOF"]
  ]]
];
const frases = [
  'Escribe órdenes en un archivo y ejecútalas de una vez.',
  'Guarda datos y aprende cuándo usar comillas.',
  'Recibe datos al lanzar el script o pregúntalos.',
  'Decide qué hacer según archivos, números y textos.',
  'Repite órdenes con for, while y until.',
  'Agrupa órdenes con un nombre y reutilízalas.',
  'Filtra y cuenta líneas dentro de un script.',
  'Junta todo en un script que escribe un informe.'
];
function temaBash(titulo, pasos, indice) {
  const proyecto = indice === frases.length - 1;
  const necesita = proyecto ? 'Todos los temas anteriores.' :
    indice === 0 ? 'Ningún paso previo.' : datos[indice - 1][0] + '.';
  return { titulo, frase: frases[indice], necesita, proyecto, pasos: pasos.map(ficha) };
}
CR.CursoBash = datos.map(([titulo, pasos], indice) => temaBash(titulo, pasos, indice));
for (const [tema, paso, etiqueta] of [
  [3, 6, 'argumentos + aritmética'], [3, 7, 'argumentos + read'],
  [4, 9, 'condiciones + argumentos'], [5, 7, 'bucles + condiciones'],
  [5, 8, 'bucles + aritmética'], [6, 6, 'funciones + condiciones'], [6, 7, 'funciones + bucles']
]) CR.CursoBash[tema - 1].pasos[paso - 1].etiqueta = 'Combinación: ' + etiqueta;
CR.TemaBash = temaBash;
})(globalThis.CR = globalThis.CR || {});
