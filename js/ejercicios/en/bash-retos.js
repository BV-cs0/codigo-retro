(function (CR) {
'use strict';
const ejercicios = [
  {
    "args": [
      "a",
      "b"
    ],
    "casos": [
      {
        "args": [],
        "salida": "script.sh\n0\n"
      }
    ],
    "id": "bash-1",
    "lenguaje": "bash",
    "tema": "bash",
    "tipo": "crea",
    "dificultad": 1,
    "titulo": "My name and arguments",
    "enunciado": [
      "Print the script name, then the number of arguments. Use a separate line for each."
    ],
    "codigo": "",
    "solucion": "echo \"$0\"\necho \"$#\"",
    "salidaEsperada": "script.sh\n2\n",
    "pistas": [
      "Try one command at a time and check the output.",
      "Check the cases with the arguments shown."
    ],
    "idioma": "en"
  },
  {
    "args": [
      "12"
    ],
    "casos": [
      {
        "args": [
          "2"
        ],
        "salida": ""
      }
    ],
    "requiere": [
      "if"
    ],
    "id": "bash-2",
    "lenguaje": "bash",
    "tema": "bash",
    "tipo": "completa",
    "dificultad": 1,
    "titulo": "Greater than ten",
    "enunciado": [
      "Fill the gap with -gt so the test shows that 12 is greater than 10."
    ],
    "codigo": "if [ \"$1\" ___ 10 ]; then echo greater; fi",
    "solucion": "if [ \"$1\" -gt 10 ]; then echo greater; fi",
    "salidaEsperada": "greater\n",
    "pistas": [
      "Try one command at a time and check the output.",
      "Check the cases with the arguments shown."
    ],
    "idioma": "en"
  },
  {
    "id": "bash-3",
    "lenguaje": "bash",
    "tema": "bash",
    "tipo": "arregla",
    "dificultad": 1,
    "titulo": "Spaces in an assignment",
    "enunciado": [
      "Remove the spaces around = and print Lumen."
    ],
    "codigo": "name = Lumen\necho \"$name\"",
    "solucion": "name=Lumen\necho \"$name\"",
    "salidaEsperada": "Lumen\n",
    "pistas": [
      "Try one command at a time and check the output.",
      "Check the cases with the arguments shown."
    ],
    "idioma": "en"
  },
  {
    "requiere": [
      "if"
    ],
    "id": "bash-4",
    "lenguaje": "bash",
    "tema": "bash",
    "tipo": "arregla",
    "dificultad": 2,
    "titulo": "Spaces around brackets",
    "enunciado": [
      "Fix the spaces in the test so it prints ready."
    ],
    "codigo": "if [3 -gt 1]; then echo ready; fi",
    "solucion": "if [ 3 -gt 1 ]; then echo ready; fi",
    "salidaEsperada": "ready\n",
    "pistas": [
      "Try one command at a time and check the output.",
      "Check the cases with the arguments shown."
    ],
    "idioma": "en"
  },
  {
    "args": [
      "3"
    ],
    "casos": [
      {
        "args": [
          "2"
        ],
        "salida": "2\n1\n"
      }
    ],
    "requiere": [
      "while",
      "aritmetica"
    ],
    "id": "bash-5",
    "lenguaje": "bash",
    "tema": "bash",
    "tipo": "crea",
    "dificultad": 2,
    "titulo": "Countdown",
    "enunciado": [
      "Count down from $1 to 1 with while. Print one number per line."
    ],
    "codigo": "",
    "solucion": "n=$1\nwhile [ \"$n\" -gt 0 ]; do\n  echo \"$n\"\n  n=$((n - 1))\ndone",
    "salidaEsperada": "3\n2\n1\n",
    "pistas": [
      "Try one command at a time and check the output.",
      "Check the cases with the arguments shown."
    ],
    "idioma": "en"
  },
  {
    "args": [
      "3"
    ],
    "casos": [
      {
        "args": [
          "2"
        ],
        "salida": "2\n4\n6\n8\n10\n12\n14\n16\n18\n20\n"
      }
    ],
    "requiere": [
      "for",
      "aritmetica"
    ],
    "id": "bash-6",
    "lenguaje": "bash",
    "tema": "bash",
    "tipo": "crea",
    "dificultad": 2,
    "titulo": "Times table",
    "enunciado": [
      "Use for (( )) to print the first ten multiples of $1, one per line."
    ],
    "codigo": "",
    "solucion": "for (( i=1; i<=10; i++ )); do echo \"$(($1 * i))\"; done",
    "salidaEsperada": "3\n6\n9\n12\n15\n18\n21\n24\n27\n30\n",
    "pistas": [
      "Try one command at a time and check the output.",
      "Check the cases with the arguments shown."
    ],
    "idioma": "en"
  },
  {
    "args": [
      "10",
      "2"
    ],
    "casos": [
      {
        "args": [
          "-4",
          "-2"
        ],
        "salida": "-2\n"
      }
    ],
    "requiere": [
      "funcion",
      "if"
    ],
    "id": "bash-7",
    "lenguaje": "bash",
    "tema": "bash",
    "tipo": "disena",
    "dificultad": 2,
    "titulo": "The larger of two numbers",
    "enunciado": [
      "Define larger a b. Print the larger integer and call the function with the script arguments."
    ],
    "codigo": "",
    "solucion": "larger() { if [ \"$1\" -gt \"$2\" ]; then echo \"$1\"; else echo \"$2\"; fi; }\nlarger \"$1\" \"$2\"",
    "salidaEsperada": "10\n",
    "pistas": [
      "Try one command at a time and check the output.",
      "Check the cases with the arguments shown."
    ],
    "idioma": "en"
  },
  {
    "fs": {
      "main.conf": "a",
      "my copy.conf": "b",
      "ignore.txt": "c"
    },
    "archivos": {
      "~/backup/main.conf": {
        "exacto": "a"
      },
      "~/backup/my copy.conf": {
        "exacto": "b"
      },
      "~/backup/ignore.txt": {
        "existe": false
      },
      "main.conf": {
        "exacto": "a"
      }
    },
    "id": "bash-8",
    "lenguaje": "bash",
    "tema": "bash",
    "tipo": "crea",
    "dificultad": 2,
    "titulo": "Make a backup",
    "enunciado": [
      "Copy the .conf files to ~/backup. Create the folder if needed and keep the original files."
    ],
    "codigo": "",
    "solucion": "mkdir -p ~/backup\ncp *.conf ~/backup/",
    "salidaEsperada": "",
    "pistas": [
      "Try one command at a time and check the output.",
      "Check the cases with the arguments shown."
    ],
    "idioma": "en"
  },
  {
    "args": [
      "data"
    ],
    "fs": {
      "data/notes.txt": "",
      "data/report.txt": "",
      "data/nested/": null
    },
    "requiere": [
      "for",
      "test-archivo"
    ],
    "id": "bash-9",
    "lenguaje": "bash",
    "tema": "bash",
    "tipo": "crea",
    "dificultad": 2,
    "titulo": "Files and folders",
    "enunciado": [
      "Count the files and folders directly inside $1. Print the number of files first, then the number of folders."
    ],
    "codigo": "",
    "solucion": "files=0\nfolders=0\nfor item in \"$1\"/*; do\n  if [ -f \"$item\" ]; then files=$((files+1)); elif [ -d \"$item\" ]; then folders=$((folders+1)); fi\ndone\nprintf \"%d\\n%d\\n\" \"$files\" \"$folders\"",
    "salidaEsperada": "2\n1\n",
    "pistas": [
      "Try one command at a time and check the output.",
      "Check the cases with the arguments shown."
    ],
    "idioma": "en"
  },
  {
    "fs": {
      "the light.txt": "light",
      "the final report.txt": "report",
      "normal.txt": "n"
    },
    "archivos": {
      "the_light.txt": {
        "exacto": "light"
      },
      "the_final_report.txt": {
        "exacto": "report"
      },
      "the light.txt": {
        "existe": false
      },
      "normal.txt": {
        "exacto": "n"
      }
    },
    "requiere": [
      "for",
      "comillas"
    ],
    "id": "bash-10",
    "lenguaje": "bash",
    "tema": "bash",
    "tipo": "crea",
    "dificultad": 3,
    "titulo": "Names without spaces",
    "enunciado": [
      "Go through the files and replace each space with _. Use ${file// /_} to build the new name."
    ],
    "codigo": "",
    "solucion": "for file in *; do\n  if [[ $file == *\" \"* ]] && [ -f \"$file\" ]; then mv \"$file\" \"${file// /_}\"; fi\ndone",
    "salidaEsperada": "",
    "pistas": [
      "Try one command at a time and check the output.",
      "Check the cases with the arguments shown."
    ],
    "idioma": "en"
  },
  {
    "args": [
      "456"
    ],
    "casos": [
      {
        "args": [
          "4a"
        ],
        "salida": "no\n"
      },
      {
        "args": [
          ""
        ],
        "salida": "no\n"
      }
    ],
    "requiere": [
      "funcion"
    ],
    "id": "bash-11",
    "lenguaje": "bash",
    "tema": "bash",
    "tipo": "disena",
    "dificultad": 3,
    "titulo": "Digits only?",
    "enunciado": [
      "Define is_number with [[ =~ ]] to accept one or more digits. Print yes or no for the first argument."
    ],
    "codigo": "",
    "solucion": "is_number() { [[ $1 =~ ^[0-9]+$ ]]; }\nif is_number \"$1\"; then echo yes; else echo no; fi",
    "salidaEsperada": "yes\n",
    "pistas": [
      "Try one command at a time and check the output.",
      "Check the cases with the arguments shown."
    ],
    "idioma": "en"
  },
  {
    "entradas": [
      "status",
      "help",
      "quit",
      "status"
    ],
    "casos": [
      {
        "entradas": [
          "quit"
        ],
        "salida": ""
      }
    ],
    "requiere": [
      "while-read",
      "case"
    ],
    "id": "bash-12",
    "lenguaje": "bash",
    "tema": "bash",
    "tipo": "crea",
    "dificultad": 3,
    "titulo": "Watch menu",
    "enunciado": [
      "Read one command per line. status prints active, quit closes the menu, and any other input prints unknown."
    ],
    "codigo": "",
    "solucion": "while read -r command; do\n  case \"$command\" in\n    status) echo active ;;\n    quit) break ;;\n    *) echo unknown ;;\n  esac\ndone",
    "salidaEsperada": "active\nunknown\n",
    "pistas": [
      "Try one command at a time and check the output.",
      "Check the cases with the arguments shown."
    ],
    "idioma": "en"
  },
  {
    "requiere": [
      "if",
      "for"
    ],
    "id": "bash-13",
    "lenguaje": "bash",
    "tema": "bash",
    "tipo": "ordena",
    "dificultad": 2,
    "titulo": "Filter in a loop",
    "enunciado": [
      "Order the lines to show only numbers greater than 2."
    ],
    "codigo": "for i in 1 2 3 4; do\n    if [ \"$i\" -gt 2 ]; then\n        echo \"$i\"\n    fi\ndone",
    "solucion": "for i in 1 2 3 4; do\n    if [ \"$i\" -gt 2 ]; then\n        echo \"$i\"\n    fi\ndone",
    "salidaEsperada": "3\n4\n",
    "pistas": [
      "Try one command at a time and check the output.",
      "Check the cases with the arguments shown."
    ],
    "idioma": "en"
  },
  {
    "args": [
      "words.txt"
    ],
    "fs": {
      "words.txt": "sea light beacon light sea\nsalt beacon light sea light\n"
    },
    "id": "bash-14",
    "lenguaje": "bash",
    "tema": "bash",
    "tipo": "crea",
    "dificultad": 3,
    "titulo": "Three common words",
    "enunciado": [
      "Put each word from the file named by $1 on its own line. Print three lines of uniq -c, from highest to lowest count."
    ],
    "codigo": "",
    "solucion": "tr \" \" \"\\n\" < \"$1\" | grep -v \"^$\" | sort | uniq -c | sort -rn | head -3",
    "salidaEsperada": "      4 light\n      3 sea\n      2 beacon\n",
    "pistas": [
      "Try one command at a time and check the output.",
      "Check the cases with the arguments shown."
    ],
    "idioma": "en"
  },
  {
    "args": [
      "lumen"
    ],
    "fs": {
      "etc/passwd": "root:x:0:0\nlumen:x:1000:1000\n"
    },
    "casos": [
      {
        "args": [
          "lum"
        ],
        "salida": "does not exist\n"
      },
      {
        "args": [
          ".*"
        ],
        "salida": "does not exist\n"
      }
    ],
    "requiere": [
      "if"
    ],
    "id": "bash-15",
    "lenguaje": "bash",
    "tema": "bash",
    "tipo": "crea",
    "dificultad": 2,
    "titulo": "Look up a user in passwd",
    "enunciado": [
      "Look for an exact match for $1 in the first field of the local copy of etc/passwd. Print exists or does not exist."
    ],
    "codigo": "",
    "solucion": "if cut -d : -f 1 etc/passwd | grep -Fx -- \"$1\" > /dev/null; then echo exists; else echo \"does not exist\"; fi",
    "salidaEsperada": "exists\n",
    "pistas": [
      "Try one command at a time and check the output.",
      "Check the cases with the arguments shown."
    ],
    "idioma": "en"
  }
];
if (typeof module !== 'undefined') module.exports = ejercicios;
else (CR.EjerciciosEn ||= []).push(...ejercicios);
})(globalThis.CR ||= {});
