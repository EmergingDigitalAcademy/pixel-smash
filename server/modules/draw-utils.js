const crypto = require('crypto');

const drawPlus = (game) => {
   for (let x = 0; x < game.pixels.length; x++) {
      // Draw a horizontal line in the middle
      if (x === Math.floor(game.size / 2)) {
         for (let y = 0; y < game.pixels[x].length; y++) {
            game.setPixel({ x, y, state: { color: game.pixels[x][y].state.color + 1 } });
         }
      } else {
         // draw just the center column
         game.setPixel({
            x,
            y: Math.floor(game.size / 2),
            state: {
               color: game.pixels[x][Math.floor(game.size / 2)].state.color + 1
            }
         });
      }
   }
}

const makeItSnow = (game) => {
   game.loop((x, y) => game.setPixel({
      x, y, state: {
         color: crypto.randomInt(game.colors)
      }
   })
   )
}

const makeItRainbow = (game) => (
   game.loop((x, y) => game.setPixel(
      {
         x, y, state: {
            color: (
               x + y > game.size - 1
                  ? game.size - (x + y - game.size + 2)
                  : x + y
            )
         }
      }
   ))
)

module.exports = {
   drawPlus,
   makeItRainbow,
   makeItSnow
}