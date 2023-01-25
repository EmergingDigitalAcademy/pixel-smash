const crypto = require('crypto');
const { drawPlus, makeItRainbow, makeItSnow, resetColors } = require('./draw-utils');
const allGames = {};

const GAME_STATUSES = {
   ACTIVE: 'ACTIVE',
   FINISHED: 'FINISHED'
}

// initialize a new game state object
const newGame = ({
   width = 5,
   height,
   version = '1.0',
   colors = 16,
   name = 'new game',
   physics = { engine: 'normal' }
} = {}) => {
   let pixels = [];
   if (!height) height = width; // default to square
   for (let x = 0; x < height; x++) {
      let row = [];
      for (let y = 0; y < width; y++) {
         row.push({
            x,
            y,
            state: {
               color: 0,      // general state of the pixel
               status: '',    // arbitrary meta data field
               owner: null,   // arbitrary owner of this pixel
            }
         })
      }
      pixels.push(row);
   }
   return {
      width, height, pixels, version, colors, physics, name,
      id: crypto.randomUUID(),
      status: GAME_STATUSES.ACTIVE,
      setPixel: function ({ x, y, state = {} } = {}) {
         if (typeof (x) !== 'number' || typeof (y) !== 'number' || x === undefined || y === undefined) {
            console.error(`Invalid attempt to update pixel, missing coords ${x} ${y}`);
            throw `Invalid x/y coords ${x} ${y}`;
         }
         x = Math.max(0, x);
         x = Math.min(height - 1, x);
         y = Math.max(0, y);
         y = Math.min(width - 1, y);

         if (isNaN(state.color)) {
            // reset back to empty state?
            state.color = 0;
         }

         // ensure that pixel color remains in valid range
         state.color = Math.max(0, state.color);
         state.color = Math.min(colors - 1, state.color);

         // set the pixel state, preserving any unmodified keys
         this.pixels[x][y].state = {
            ...this.pixels[x][y].state,
            ...state,
         }
      },
      print: function () {
         const chalk = require('chalk');
         // simple console print
         let colors = ['bgRed', 'bgGreen', 'bgBlue', 'bgMagenta', 'bgYellow', 'bgCyan', 'bgGrey']
         for (let x = 0; x < this.height; x++) {
            for (let y = 0; y < this.width; y++) {
               // console.log(this.pixels[x][y].state.color)
               let c = this.pixels[x][y].state.color % (colors.length);
               let currentColor = this.pixels[x][y].state.color.toString().padStart(2);
               process.stdout.write(`${chalk[colors[c]](currentColor)}`);
            }
            process.stdout.write('\n');
         }
      },
      // a simple loop that calls a callback function on every pixel
      loop: function (cb) {
         for (let x = 0; x < this.height; x++) {
            for (let y = 0; y < this.width; y++) {
               cb(x, y);
            }
         }
      }
   }
};

// build a game and register it with the global game registry
const initializeGame = (config) => {
   const game = newGame(config);
   allGames[game.id] = game;
   return game;
}

const test = () => {
   // initialize a game and draw some patterns
   let game = newGame({ width: 5, colors: 32 });

   drawPlus(game);
   drawPlus(game);
   game.print();

   console.log('');
   makeItSnow(game);
   game.print();

   console.log('');
   resetColors(game);
   makeItRainbow(game);
   game.print();
   console.log('');
   makeItRainbow(game);
   game.print();

   return game;
}

// simple test for now
if (require.main === module) {
   test()
}

module.exports = {
   initializeGame,
   GAME_STATUSES,
   allGames,
   test
}