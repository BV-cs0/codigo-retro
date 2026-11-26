(function (CR) {
  'use strict';
  CR.DemoIdioma.registrar('robot', CR.Contenido.es.robot, [
    [
      "First steps",
      "I am Pico. The crystal is at the end of the tunnel.",
      "Write the commands in the order you want me to run them.",
      "Move twice, turn right and keep going down."
    ],
    [
      "The long tunnel",
      "I have seven steps straight ahead and three after the turn.",
      "Use a loop to repeat a command. You have five lines.",
      "Write a for loop for each part. Turn between the two loops."
    ],
    [
      "Surprise rocks",
      "The crystal is six steps away. The soft rocks change places.",
      "Before you move, check if you need to dig.",
      "Inside the loop, dig only if there is soft rock. Move on every turn."
    ],
    [
      "The sign",
      "The sign under my wheels tells me how far away the crystal is.",
      "Save that number in a variable and use it to take exactly that many steps.",
      "Assign read_sign() to steps and write range(steps)."
    ],
    [
      "The staircase",
      "The same group of commands gets you up each stair.",
      "Define a function for one stair and use it four times.",
      "Move, turn left, move and turn right. Call the function inside a for loop."
    ]
  ]);
})(globalThis.CR);
