(function (CR) {
  'use strict';
  CR.DemoIdioma.registrar('granja', CR.Contenido.es.granja, [
    [
      "First planting",
      "I am Bina. We have three empty plots.",
      "Plant and water each plot before you move. Finish at the market.",
      "Write plant(), water() and move() for each plot."
    ],
    [
      "The big field",
      "You need to plant and water eight plots today.",
      "You have only four lines. Use a loop to repeat the work.",
      "Put the three commands inside for i in range(8)."
    ],
    [
      "Dry soil",
      "All the plots already have seeds.",
      "Water only the dry soil. Keep walking if it is already wet.",
      "Use if dry_soil() inside the loop. Keep move() outside the if but inside the for loop."
    ],
    [
      "Count the carrots",
      "The harvest is different in each field.",
      "Start with an empty basket. Add one when you pick a carrot and report the total at the market.",
      "Visit eight plots. If there is a carrot, harvest it and increase basket. After the loop, sell using basket."
    ],
    [
      "Bina's routine",
      "We have two rows of four plots.",
      "The path joins the rows at the end. Define a function to care for each plot.",
      "Plant, water and move inside the function. Use a loop to call it eight times."
    ]
  ]);
})(globalThis.CR);
