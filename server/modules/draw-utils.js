const crypto = require('crypto');

const drawPlus = (game) => {
   for (let x = 0; x < game.height; x++) {
      // Draw a horizontal line in the middle
      if (x === Math.floor(game.height / 2)) {
         for (let y = 0; y < game.width; y++) {
            game.setPixel({ x, y, state: { color: game.pixels[x][y].state.color + 1 } });
         }
      } else {
         // draw just the center column
         game.setPixel({
            x,
            y: Math.floor(game.width / 2),
            state: {
               color: game.pixels[x][Math.floor(game.width / 2)].state.color + 1
            }
         });
      }
   }
}

const makeItSnow = (game, probability = 1.0) => {
   game.loop((x, y) => game.setPixel({
      x, y, state: {
         color: (Math.random() < probability) ? crypto.randomInt(game.colors) : game.pixels[x][y].state.color
      }
   })
   )
}

const resetColors = (game) => game.loop((x,y) => game.setPixel({ x, y, state: { color: 0, owner: null}}))

const makeItRainbow = (game) => (
   game.loop((x, y) => game.setPixel(
      {
         x, y, state: {
            color: game.pixels[x][y].state.color + (
               x + y > game.width - 1
                  ? game.width - (x + y - game.width + 2)
                  : x + y
            )
         }
      }
   ))
)

module.exports = {
   drawPlus,
   makeItRainbow,
   makeItSnow,
   resetColors,
}