(function (CR) {
  'use strict';
  CR.DemoIdioma.registrar('mago', CR.Contenido.es.mago, [
    [
      "First spell",
      "I am Brasa. That portal is the way out.",
      "The path turns twice. Luckily, walking takes no magic.",
      "Move, turn right, move, turn left and move."
    ],
    [
      "The endless hall",
      "It takes eight steps to reach the portal from here.",
      "Use a loop to repeat move(). You do not need eight spells.",
      "Use range(8) and indent move() inside the loop."
    ],
    [
      "Bats",
      "The shadow bats have moved to new hiding places.",
      "If a bat is ahead, scare it away with fire before you move.",
      "Repeat six times. Check for an enemy, cast fire if you find one, and take a step."
    ],
    [
      "The rune door",
      "The stone under my boots holds the key.",
      "Read it before you move and save the number to open the door.",
      "Read the rune, take one step, open the door with the variable and move twice."
    ],
    [
      "Zigzag",
      "This passage repeats the same two turns three times.",
      "Give that path a name and call it for each section.",
      "Go right on the screen, then down, and finish facing east."
    ]
  ]);
})(globalThis.CR);
