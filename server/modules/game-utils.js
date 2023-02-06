const crypto = require('crypto');

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
      id: crypto.randomUUID(), // also used as primary key
      width, height, pixels, version, colors, physics, name,
      status: GAME_STATUSES.ACTIVE,
   }
};

const setPixel = async function (game, { x, y, state = {} } = {}) {
   if (typeof (x) !== 'number' || typeof (y) !== 'number' || x === undefined || y === undefined) {
      console.error(`Invalid attempt to update pixel, missing coords ${x} ${y}`);
      throw `Invalid x/y coords ${x} ${y}`;
   }
   x = Math.max(0, x);
   x = Math.min(game.height - 1, x);
   y = Math.max(0, y);
   y = Math.min(game.width - 1, y);

   if (isNaN(state.color)) {
      // reset back to empty state?
      state.color = 0;
   }

   // ensure that pixel color remains in valid range
   state.color = Math.max(0, state.color);
   state.color = Math.min(game.colors - 1, state.color);

   // set the pixel state, preserving any unmodified keys
   game.pixels[x][y].state = {
      ...game.pixels[x][y].state,
      ...state,
   }
   return game;
}

const printGame = function (game) {
   const chalk = require('chalk');
   // simple console print
   let colors = ['bgRed', 'bgGreen', 'bgBlue', 'bgMagenta', 'bgYellow', 'bgCyan', 'bgGrey']
   for (let x = 0; x < game.height; x++) {
      for (let y = 0; y < game.width; y++) {
         // console.log(game.pixels[x][y].state.color)
         let c = game.pixels[x][y].state.color % (colors.length);
         let currentColor = game.pixels[x][y].state.color.toString().padStart(2);
         process.stdout.write(`${chalk[colors[c]](currentColor)}`);
      }
      process.stdout.write('\n');
   }
}

// a simple loop that calls a callback function on every pixel
const gameLoop = function (game, cb) {
   for (let x = 0; x < game.height; x++) {
      for (let y = 0; y < game.width; y++) {
         cb(x, y);
      }
   }
}



module.exports = {
   newGame,
   printGame,
   setPixel,
   gameLoop,
   GAME_STATUSES
}