(function (CR) {
'use strict';
const temas = [
  {
    titulo: "Your first script",
    frase: "Write commands in a file and run them all at once.",
    necesita: "No previous steps.",
    proyecto: false,
    pasos: [
      {
        tipo: "explica",
        titulo: "Your first watch report",
        texto: ["A script is a file of commands. Bash runs them from top to bottom. Change the greeting and run it again."],
        codigo: "echo \"Hello\"\ndate",
        idioma: "en"
      },
      {
        tipo: "explica",
        titulo: "Shebang and comments",
        texto: ["The shebang on the first line tells the system which interpreter to use when you run the file directly. Other lines that start with # are comments."],
        codigo: "#!/bin/bash\n# Watch greeting\necho \"Good morning\"",
        idioma: "en"
      },
      {
        tipo: "explica",
        titulo: "Two ways to run a script",
        texto: ["For bash hello.sh, you only need permission to read the file. For ./hello.sh, you need permission to run it. Try the commands in the mini terminal."],
        codigo: "echo \"Light on\"",
        idioma: "en"
      },
      {
        tipo: "predice",
        titulo: "An error between two commands",
        texto: ["Without set -e, Bash can still run more commands after one fails."],
        codigo: "echo Start\nmissing_command\necho End",
        idioma: "en",
        pregunta: "What happens when you run the script?",
        explicacion: "Without set -e, Bash can still run more commands after one fails.",
        opciones: ["Only End","Only Start","Start and End"],
        correcta: 2
      },
      {
        tipo: "arregla",
        titulo: "Close the quotes",
        texto: ["Find where the greeting ends."],
        codigo: "echo \"Hello",
        idioma: "en",
        solucion: "echo \"Hello\"",
        objetivo: "Find where the greeting ends.",
        pistas: ["Run the example and look for the first error."],
        salidaEsperada: "Hello\n"
      },
      {
        tipo: "reto",
        titulo: "The Lighthouse watch report",
        texto: ["Print three lines: Lighthouse open, Light on and Watch ready. Match the capital letters."],
        codigo: "",
        idioma: "en",
        solucion: "echo \"Lighthouse open\"\necho \"Light on\"\necho \"Watch ready\"",
        objetivo: "Print three lines: Lighthouse open, Light on and Watch ready. Match the capital letters.",
        pistas: ["Try one command at a time first."],
        salidaEsperada: "Lighthouse open\nLight on\nWatch ready\n"
      },
      {
        tipo: "resumen",
        titulo: "Watch cheat sheet",
        texto: ["Keep these commands for your first watch report."],
        codigo: "#!/bin/bash\n# Comment\necho \"Light on\"\n# bash hello.sh: run the file\n# chmod +x hello.sh: give permission\n# ./hello.sh: run directly",
        idioma: "en"
      }
    ]
  },
  {
    titulo: "Variables and quotes",
    frase: "Store data and learn when to use quotes.",
    necesita: "Your first script.",
    proyecto: false,
    pasos: [
      {
        tipo: "explica",
        titulo: "Store a name",
        texto: ["Use name=value to store a value. Use $name to get it back."],
        codigo: "name=\"Lumen\"\necho \"Hello, $name\"",
        idioma: "en"
      },
      {
        tipo: "arregla",
        titulo: "Remove the spaces",
        texto: ["Bash treats the first word as a command if you leave spaces around =."],
        codigo: "name = \"Lumen\"\necho \"Hello, $name\"",
        idioma: "en",
        solucion: "name=\"Lumen\"\necho \"Hello, $name\"",
        objetivo: "Bash treats the first word as a command if you leave spaces around =.",
        pistas: ["Run the example and look for the first error."],
        salidaEsperada: "Hello, Lumen\n"
      },
      {
        tipo: "explica",
        titulo: "Single and double quotes",
        texto: ["Single quotes keep every character as it is. Double quotes expand $name and keep the result as one argument."],
        codigo: "name=Lumen\necho '$name'\necho \"$name\"",
        idioma: "en"
      },
      {
        tipo: "predice",
        titulo: "A name with spaces",
        texto: ["Look for the new paths under Files. Then try touch with quotes around the name."],
        codigo: "file=\"my report.txt\"\ntouch $file",
        idioma: "en",
        pregunta: "What happens when you run the script?",
        explicacion: "Look for the new paths under Files. Then try touch with quotes around the name.",
        opciones: ["Creates \"my report.txt\"","Creates \"my\" and \"report.txt\"","Creates no files"],
        correcta: 1
      },
      {
        tipo: "explica",
        titulo: "Save the output",
        texto: ["$(command) runs a command and removes any newlines at the end of its output."],
        codigo: "today=$(date)\nn=$(ls | wc -l)\necho \"$today\"\necho \"$n\"",
        idioma: "en"
      },
      {
        tipo: "explica",
        titulo: "Calculate with whole numbers",
        texto: ["Use $(( expression )). Inside, you can write a and b without $. With whole numbers, 7 / 2 gives 3."],
        codigo: "a=3\nb=4\ntotal=$((a + b))\necho \"$total\"\necho \"$((7 / 2))\"",
        idioma: "en"
      },
      {
        tipo: "explica",
        titulo: "Length and default value",
        texto: ["Use # in an expansion to get the length. Use :- to choose a value if the variable is empty or unset."],
        codigo: "text=Lumen\necho \"${#text}\"\necho \"${watch:-night}\"",
        idioma: "en"
      },
      {
        tipo: "reto",
        titulo: "Count log files",
        texto: ["Count the .log files in /var/log/lighthouse. Use the relative path var/log/lighthouse from the simulated root and print Found N log files."],
        codigo: "# Use command substitution",
        idioma: "en",
        fs: {"/var/log/lighthouse/a.log":"a\n","/var/log/lighthouse/b.log":"b\n","/var/log/lighthouse/c.txt":""},
        cwd: "/",
        requiere: ["sustitucion"],
        solucion: "n=$(find var/log/lighthouse -name \"*.log\" -type f | wc -l)\necho \"Found $n log files\"",
        objetivo: "Count the .log files in /var/log/lighthouse. Use the relative path var/log/lighthouse from the simulated root and print Found N log files.",
        pistas: ["Try one command at a time first."],
        salidaEsperada: "Found 2 log files\n"
      },
      {
        tipo: "resumen",
        titulo: "Variables cheat sheet",
        texto: ["Use double quotes when a value needs to stay in one argument."],
        codigo: "name=Lumen\necho \"$name\"\necho '$name'\ntoday=$(date)\nn=$((2 + 3))\necho \"${n:-0}\"",
        idioma: "en"
      }
    ]
  },
  {
    titulo: "Arguments and read",
    frase: "Pass data when you run a script, or ask for it as the script runs.",
    necesita: "Variables and quotes.",
    proyecto: false,
    pasos: [
      {
        tipo: "explica",
        titulo: "The first arguments",
        texto: ["$1 and $2 are the first two arguments. $# counts them all. Change the Arguments field and run the script."],
        codigo: "echo \"First: $1\"\necho \"Second: $2\"\necho \"Total: $#\"",
        idioma: "en",
        args: ["report.txt","3"]
      },
      {
        tipo: "explica",
        titulo: "The name and the list",
        texto: ["$0 gives the script name. \"$@\" keeps each argument separate, even if it has spaces."],
        codigo: "echo \"$0\"\nprintf \"<%s>\\n\" \"$@\"",
        idioma: "en",
        args: ["my report.txt","3"]
      },
      {
        tipo: "predice",
        titulo: "When an argument is missing",
        texto: ["There is only one argument in the field above."],
        codigo: "echo \"Second: <$2>\"",
        idioma: "en",
        args: ["report.txt"],
        pregunta: "What happens when you run the script?",
        explicacion: "There is only one argument in the field above.",
        opciones: ["Second: <$2>","Second: <>","An error"],
        correcta: 1
      },
      {
        tipo: "explica",
        titulo: "Ask for a name",
        texto: ["read waits for a line of input. Use -p to show a question before reading."],
        codigo: "read -p \"Your name? \" name\necho \"Hello, $name\"",
        idioma: "en",
        entradas: ["Ana"]
      },
      {
        tipo: "explica",
        titulo: "Exit codes",
        texto: ["$? shows the exit code of the last command. Zero means success. exit ends the script with the code you give it."],
        codigo: "false\necho \"$?\"\nexit 1\necho \"This does not run\"",
        idioma: "en"
      },
      {
        tipo: "reto",
        titulo: "Add two arguments",
        texto: ["Write sum.sh to print the sum of its two arguments."],
        codigo: "",
        idioma: "en",
        args: ["3","4"],
        archivo: "sum.sh",
        requiere: ["aritmetica"],
        etiqueta: "Combination: arguments + arithmetic",
        solucion: "# sum.sh\necho \"$(($1 + $2))\"",
        objetivo: "Write sum.sh to print the sum of its two arguments.",
        pistas: ["Try one command at a time first."],
        casos: [{"args":["-2","9"],"salida":"7\n"}],
        salidaEsperada: "7\n"
      },
      {
        tipo: "reto",
        titulo: "Greet with or without an argument",
        texto: ["Store $1 in name. If there are no arguments, ask for a name with [ $# -eq 0 ] && read. The right side of && only runs if the left side succeeds."],
        codigo: "name=$1\n",
        idioma: "en",
        args: ["Ana"],
        requiere: ["read"],
        etiqueta: "Combination: arguments + read",
        solucion: "name=$1\n[ $# -eq 0 ] && read -p \"Name? \" name\necho \"Hello, $name\"",
        objetivo: "Store $1 in name. If there are no arguments, ask for a name with [ $# -eq 0 ] && read. The right side of && only runs if the left side succeeds.",
        pistas: ["Try one command at a time first."],
        casos: [{"args":[],"entradas":["Leo"],"salida":"Hello, Leo\n"}],
        salidaEsperada: "Hello, Ana\n"
      },
      {
        tipo: "resumen",
        titulo: "Arguments cheat sheet",
        texto: ["Change the script arguments to try these parameters."],
        codigo: "echo \"$0\"\necho \"$#\"\necho \"$1\"\nprintf \"%s\\n\" \"$@\"\nshift\nexit 0",
        idioma: "en"
      }
    ]
  },
  {
    titulo: "Conditions",
    frase: "Decide what to do based on files, numbers and text.",
    necesita: "Arguments and read.",
    proyecto: false,
    pasos: [
      {
        tipo: "explica",
        titulo: "Make a decision",
        texto: ["[ is a command. Put spaces between [ and ] and the rest of the test. then starts the block and fi ends it."],
        codigo: "age=18\nif [ \"$age\" -ge 18 ]; then\n  echo \"Access allowed\"\nfi",
        idioma: "en"
      },
      {
        tipo: "arregla",
        titulo: "Put spaces around the brackets",
        texto: ["Fix the command that Bash tries to run with the name [18."],
        codigo: "age=18\nif [$age -ge 18]; then echo Yes; fi",
        idioma: "en",
        requiere: ["if"],
        solucion: "age=18\nif [ \"$age\" -ge 18 ]; then echo Yes; fi",
        objetivo: "Fix the command that Bash tries to run with the name [18.",
        pistas: ["Run the example and look for the first error."],
        salidaEsperada: "Yes\n"
      },
      {
        tipo: "explica",
        titulo: "More than two paths",
        texto: ["elif checks another condition if the previous one fails. else handles all other cases."],
        codigo: "level=2\nif [ \"$level\" -gt 2 ]; then echo high\nelif [ \"$level\" -eq 2 ]; then echo medium\nelse echo low\nfi",
        idioma: "en"
      },
      {
        tipo: "explica",
        titulo: "Numbers and text",
        texto: ["Use -eq, -lt or -gt for numbers. Use = and != for text."],
        codigo: "test 10 -gt 9 && echo greater\ntest 010 != 10 && echo \"different text\"",
        idioma: "en"
      },
      {
        tipo: "predice",
        titulo: "The order of text values",
        texto: ["The backslash protects < so Bash passes it as an argument to [."],
        codigo: "[ \"10\" \\< \"9\" ] && echo true",
        idioma: "en",
        pregunta: "What happens when you run the script?",
        explicacion: "The backslash protects < so Bash passes it as an argument to [.",
        opciones: ["false","true","Redirection error"],
        correcta: 1
      },
      {
        tipo: "explica",
        titulo: "Check files",
        texto: ["Use -f to check for a file, -d for a folder, -e to see if a path exists and -s to check for content. Count the lines only if the log exists."],
        codigo: "if [ -f watch.log ]; then wc -l < watch.log; fi",
        idioma: "en",
        fs: {"watch.log":"start\nend\n"}
      },
      {
        tipo: "explica",
        titulo: "Patterns with [[ ]]",
        texto: ["Inside [[ ]], you can use && and ||. On the right side of ==, *.log is a pattern."],
        codigo: "file=\"night watch.log\"\nif [[ $file == *.log && -n $file ]]; then echo \"Log file\"; fi",
        idioma: "en"
      },
      {
        tipo: "explica",
        titulo: "A menu with case",
        texto: ["Each branch ends with ;;. Use | for several patterns and * for any value left over."],
        codigo: "case \"$1\" in\n  start|stop) echo \"Command received\" ;;\n  status) echo \"Lighthouse active\" ;;\n  *) echo \"Unknown command\" ;;\nesac",
        idioma: "en",
        args: ["status"]
      },
      {
        tipo: "reto",
        titulo: "Check a file",
        texto: ["With no argument, print Usage: check.sh FILE and exit with 1. If the file is missing, print File not found and exit with 2. If it exists, print the number of lines."],
        codigo: "# Check the argument first",
        idioma: "en",
        fs: {"a.txt":"a\nb\n"},
        args: ["a.txt"],
        archivo: "check.sh",
        requiere: ["if","test-archivo"],
        etiqueta: "Combination: conditions + arguments",
        solucion: "if [ $# -eq 0 ]; then echo \"Usage: check.sh FILE\"; exit 1; fi\nif [ ! -f \"$1\" ]; then echo \"File not found\"; exit 2; fi\nwc -l < \"$1\"",
        objetivo: "With no argument, print Usage: check.sh FILE and exit with 1. If the file is missing, print File not found and exit with 2. If it exists, print the number of lines.",
        pistas: ["Try one command at a time first."],
        casos: [{"args":[],"salida":"Usage: check.sh FILE\n","codigo":1},{"args":["missing"],"salida":"File not found\n","codigo":2}],
        salidaEsperada: "2\n"
      },
      {
        tipo: "resumen",
        titulo: "Conditions cheat sheet",
        texto: ["The exit code of a command decides whether the block runs."],
        codigo: "test -f watch.log\n[ 3 -gt 2 ]\n[[ watch.log == *.log ]]\nif true; then echo yes; fi\ncase \"$1\" in *) echo ready ;; esac",
        idioma: "en"
      }
    ]
  },
  {
    titulo: "Loops",
    frase: "Repeat commands with for, while and until.",
    necesita: "Conditions.",
    proyecto: false,
    pasos: [
      {
        tipo: "explica",
        titulo: "Go through a list",
        texto: ["for gives name a new value each time. do and done mark the start and end of the loop body."],
        codigo: "for name in Ana Leo Iris; do\n  echo \"Hello, $name\"\ndone",
        idioma: "en"
      },
      {
        tipo: "explica",
        titulo: "Two ways to count",
        texto: ["Braces make a list. An arithmetic for loop uses a start value, a condition and a step."],
        codigo: "for i in {1..5}; do echo \"$i\"; done\nfor (( i=1; i<=5; i++ )); do echo \"$i\"; done",
        idioma: "en"
      },
      {
        tipo: "explica",
        titulo: "Go through files",
        texto: ["Patterns expand in LC_ALL=C order. If *.txt matches nothing, Bash keeps the pattern as written. Check with -f before using it."],
        codigo: "for f in *.txt; do\n  [ -f \"$f\" ] && echo \"$f\"\ndone",
        idioma: "en",
        fs: {"B.txt":"","a.txt":""}
      },
      {
        tipo: "explica",
        titulo: "A counter with while",
        texto: ["while repeats as long as the condition returns zero. Change n each time through the loop."],
        codigo: "n=0\nwhile [ \"$n\" -lt 5 ]; do\n  echo \"$n\"\n  n=$((n + 1))\ndone",
        idioma: "en"
      },
      {
        tipo: "explica",
        titulo: "Read a file line by line",
        texto: ["The redirection at the end gives input to the whole loop. read -r keeps backslashes."],
        codigo: "while read -r line; do\n  echo \"$line\"\ndone < watch.txt",
        idioma: "en",
        fs: {"watch.txt":"Light on\nLight wind\n"}
      },
      {
        tipo: "predice",
        titulo: "A loop that makes no progress",
        texto: ["Look for lines that change n and lines that only read it."],
        codigo: "n=0\nwhile [ \"$n\" -lt 5 ]; do\n  :\ndone",
        idioma: "en",
        sinExportar: true,
        pregunta: "What happens when you run the script?",
        explicacion: "Look for lines that change n and lines that only read it.",
        opciones: ["It ends after five turns","It stops when it reaches the limit","The condition fails at the start"],
        correcta: 1
      },
      {
        tipo: "reto",
        titulo: "Change file extensions",
        texto: ["Rename the .txt files in ~/photos to .bak. Keep their contents and use quotes for names with spaces."],
        codigo: "# Use for, [ -f ... ] and mv",
        idioma: "en",
        fs: {"photos/a.txt":"a","photos/my photo.txt":"b","photos/c.jpg":"c"},
        archivos: {"~/photos/a.bak":{"contiene":"a"},"~/photos/my photo.bak":{"contiene":"b"},"~/photos/a.txt":{"existe":false}},
        requiere: ["for","if"],
        etiqueta: "Combination: loops + conditions",
        solucion: "for f in ~/photos/*.txt; do\n  if [ -f \"$f\" ]; then mv \"$f\" \"${f%.txt}.bak\"; fi\ndone",
        objetivo: "Rename the .txt files in ~/photos to .bak. Keep their contents and use quotes for names with spaces.",
        pistas: ["Try one command at a time first."],
        salidaEsperada: ""
      },
      {
        tipo: "reto",
        titulo: "Add numbers from a file",
        texto: ["Read numbers.txt and print one total. Use while read and arithmetic."],
        codigo: "total=0",
        idioma: "en",
        fs: {"numbers.txt":"3\n-1\n8\n"},
        requiere: ["while-read","aritmetica"],
        etiqueta: "Combination: loops + arithmetic",
        solucion: "total=0\nwhile read -r n; do total=$((total + n)); done < numbers.txt\necho \"$total\"",
        objetivo: "Read numbers.txt and print one total. Use while read and arithmetic.",
        pistas: ["Try one command at a time first."],
        salidaEsperada: "10\n"
      },
      {
        tipo: "resumen",
        titulo: "Loops cheat sheet",
        texto: ["Use break to leave a loop and continue to skip to the next turn."],
        codigo: "for i in {1..3}; do echo \"$i\"; done\nfor (( i=0; i<3; i++ )); do :; done\nwhile false; do break; done\nuntil true; do continue; done\n# while read -r row; do echo \"$row\"; done < file",
        idioma: "en"
      }
    ]
  },
  {
    titulo: "Functions",
    frase: "Give a group of commands a name so you can reuse it.",
    necesita: "Loops.",
    proyecto: false,
    pasos: [
      {
        tipo: "explica",
        titulo: "Define and call a function",
        texto: ["Define the block once and call it by name wherever you need it."],
        codigo: "greet() { echo \"Hello, $1\"; }\ngreet Ana",
        idioma: "en"
      },
      {
        tipo: "explica",
        titulo: "Arguments for a function call",
        texto: ["Inside a function, $1 belongs to that call. When the function ends, the script gets its own arguments back."],
        codigo: "greet() { echo \"Inside: $1\"; }\ngreet Ana\necho \"Outside: $1\"",
        idioma: "en",
        args: ["Leo"]
      },
      {
        tipo: "predice",
        titulo: "An assignment without local",
        texto: ["Predict which name stays after the function ends. Then add local inside the function."],
        codigo: "name=Lumen\nchange() { name=Ana; }\nchange\necho \"$name\"",
        idioma: "en",
        pregunta: "What happens when you run the script?",
        explicacion: "Predict which name stays after the function ends. Then add local inside the function.",
        opciones: ["Ana","Lumen","An error"],
        correcta: 0
      },
      {
        tipo: "explica",
        titulo: "Output and exit code",
        texto: ["return sets an exit code. To get text from a function, print it and save it with $( )."],
        codigo: "find_light() { echo \"Light\"; return 3; }\nresult=$(find_light)\necho \"Code: $?\"\necho \"Text: $result\"",
        idioma: "en"
      },
      {
        tipo: "predice",
        titulo: "Text and exit codes",
        texto: ["A direct call prints to the terminal. Command substitution saves the text."],
        codigo: "add() { echo \"$(($1 + $2))\"; }\nresult=$(add 2 3)\necho \"$result\"\nadd 2 3\necho \"$?\"",
        idioma: "en",
        pregunta: "What happens when you run the script?",
        explicacion: "A direct call prints to the terminal. Command substitution saves the text.",
        opciones: ["5, 5 and 0","5, 5 and 5","Only 5"],
        correcta: 0
      },
      {
        tipo: "reto",
        titulo: "Is it even?",
        texto: ["Define is_even. Return 0 for an even argument and 1 for an odd one. Use the function in an if."],
        codigo: "# Define is_even here",
        idioma: "en",
        args: ["4"],
        requiere: ["funcion","if"],
        etiqueta: "Combination: functions + conditions",
        solucion: "is_even() { local n=$1; (( n % 2 == 0 )); }\nif is_even \"$1\"; then echo even; else echo odd; fi",
        objetivo: "Define is_even. Return 0 for an even argument and 1 for an odd one. Use the function in an if.",
        pistas: ["Try one command at a time first."],
        casos: [{"args":["7"],"salida":"odd\n"}],
        salidaEsperada: "even\n"
      },
      {
        tipo: "reto",
        titulo: "Count lines in each log",
        texto: ["Define count_lines. Call it from a for loop to print each .log file name and its line count."],
        codigo: "# Define count_lines",
        idioma: "en",
        fs: {"a.log":"a\nb\n","b.log":"c\n"},
        requiere: ["funcion","for"],
        etiqueta: "Combination: functions + loops",
        solucion: "count_lines() { wc -l < \"$1\"; }\nfor f in *.log; do echo \"$f: $(count_lines \"$f\")\"; done",
        objetivo: "Define count_lines. Call it from a for loop to print each .log file name and its line count.",
        pistas: ["Try one command at a time first."],
        salidaEsperada: "a.log: 2\nb.log: 1\n"
      },
      {
        tipo: "resumen",
        titulo: "Functions cheat sheet",
        texto: ["Use local for variables that belong to one function call."],
        codigo: "greet() { echo \"Hello, $1\"; }\ngreet Ana\nresult=$(greet Leo)\necho \"$result\"\ncheck() { local n=$1; return \"$n\"; }",
        idioma: "en"
      }
    ]
  },
  {
    titulo: "Text and pipes in scripts",
    frase: "Filter and count lines inside a script.",
    necesita: "Functions.",
    proyecto: false,
    pasos: [
      {
        tipo: "explica",
        titulo: "Filter and save",
        texto: ["grep selects lines. cut extracts fields, sort puts them in order and uniq removes repeated lines that are next to each other."],
        codigo: "ips=$(grep FAIL access.log | cut -d \" \" -f 1 | sort | uniq)\necho \"$ips\"",
        idioma: "en",
        fs: {"access.log":"2 FAIL\n1 OK\n2 FAIL\n3 FAIL\n"}
      },
      {
        tipo: "explica",
        titulo: "A table in a file",
        texto: ["printf sets the format of each field. > creates or overwrites the file. >> adds to the end."],
        codigo: "printf \"%-5s %5s\\n\" IP TOTAL > table.txt\nprintf \"%-5s %5s\\n\" 127 3 >> table.txt\ncat table.txt",
        idioma: "en"
      },
      {
        tipo: "explica",
        titulo: "A block of text",
        texto: ["A here-doc gives input to cat until it finds the marker on its own line. Bash expands variables when the marker has no quotes."],
        codigo: "watch=night\ncat <<EOF > report.txt\nLighthouse watch report\nWatch: $watch\nEOF\ncat report.txt",
        idioma: "en"
      },
      {
        tipo: "predice",
        titulo: "Overwrite a file in a loop",
        texto: ["Each turn opens the same file again with >."],
        codigo: "for i in {1..3}; do echo \"$i\" > report.txt; done\ncat report.txt",
        idioma: "en",
        pregunta: "What happens when you run the script?",
        explicacion: "Each turn opens the same file again with >.",
        opciones: ["3","1, 2 and 3","1"],
        correcta: 0
      },
      {
        tipo: "arregla",
        titulo: "Keep all the lines",
        texto: ["Clear the file once. Then add each line at the end."],
        codigo: "for i in {1..3}; do echo \"$i\" > report.txt; done",
        idioma: "en",
        archivos: {"report.txt":{"exacto":"1\n2\n3\n"}},
        solucion: ": > report.txt\nfor i in {1..3}; do echo \"$i\" >> report.txt; done",
        objetivo: "Clear the file once. Then add each line at the end.",
        pistas: ["Run the example and look for the first error."],
        salidaEsperada: ""
      },
      {
        tipo: "reto",
        titulo: "Unique IP addresses in order",
        texto: ["Take the first field from access.log. Save all unique IP addresses in order in ips.txt."],
        codigo: "# Connect cut, sort and uniq",
        idioma: "en",
        fs: {"access.log":"3 OK\n2 FAIL\n3 FAIL\n"},
        archivos: {"ips.txt":{"exacto":"2\n3\n"}},
        solucion: "cut -d \" \" -f 1 access.log | sort | uniq > ips.txt",
        objetivo: "Take the first field from access.log. Save all unique IP addresses in order in ips.txt.",
        pistas: ["Try one command at a time first."],
        salidaEsperada: ""
      },
      {
        tipo: "resumen",
        titulo: "Pipes cheat sheet",
        texto: ["Connect small commands and save the result where you need it."],
        codigo: "echo light | tr a-z A-Z\nprintf \"%s\\n\" text > report.txt\necho end >> report.txt\ncat <<EOF\nWatch report\nEOF",
        idioma: "en"
      }
    ]
  }
];
if (typeof module !== 'undefined') module.exports = temas;
else CR.Idioma.registrar('en', 'bash', temas);
})(globalThis.CR);
