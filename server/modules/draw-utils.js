const crypto = require('crypto');
const { gameLoop, setPixel, printGame, newGame } = require('./game-utils');

const drawPlus = (game) => {
   for (let x = 0; x < game.height; x++) {
      // Draw a horizontal line in the middle
      if (x === Math.floor(game.height / 2)) {
         for (let y = 0; y < game.width; y++) {
            setPixel(game, { x, y, state: { color: game.pixels[x][y].state.color + 1 } });
         }
      } else {
         // draw just the center column
         setPixel(game, {
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
   gameLoop(game, (x, y) => {
      setPixel(game, {
         x, y, state: {
            color: (Math.random() < probability) ? crypto.randomInt(game.colors) : game.pixels[x][y].state.color
         }
      });
   })
}

const resetColors = (game) => gameLoop(game, (x, y) => setPixel(game, { x, y, state: { color: 0, owner: null } }))

const makeItRainbow = (game) => (
   gameLoop(game, (x, y) => setPixel(game,
      {
         x, y, state: {
            color: (game.pixels[x][y].state.color + (
               x + y > game.width - 1
                  ? game.width - (x + y - game.width + 2)
                  : x + y)
            ) % game.colors
         }
      }
   ))
)

const MakeItBlow = (game) => (
   gameLoop(game, (x, y) => setPixel(game,
      {
         x, y, state: {
            color: Math.floor((game.pixels[x][(y + 1) % game.width].state.color * .9 + (Math.random() * .1)) % game.colors)
         }
      }
   ))
)

const MakeItDecay = (game) => (
   gameLoop(game, (x, y) => setPixel(game,
      {
         x, y, state: {
            color: Math.floor((game.pixels[x][y].state.color - 1))
         }
      }
   ))
)

const test = () => {
   // initialize a game and draw some patterns
   let game = newGame({ width: 5, colors: 32 });

   drawPlus(game);
   drawPlus(game);
   printGame(game)

   console.log('');
   makeItSnow(game);
   printGame(game)

   console.log('');
   resetColors(game);
   makeItRainbow(game);
   printGame(game)
   console.log('');
   makeItRainbow(game);
   printGame(game)

   return game;
}

// simple test for now
if (require.main === module) {
   test()
}

module.exports = {
   drawPlus,
   makeItRainbow,
   makeItSnow,
   MakeItBlow,
   MakeItDecay,
   resetColors,
}