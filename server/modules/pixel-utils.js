const crypto = require('crypto');
const chalk = require('chalk');

const allGames = {};

const GAME_STATUSES = {
   ACTIVE: 'ACTIVE',
   FINISHED: 'FINISHED'
}


const newGame = ({size=5, version='1.0', colors=16} = {}) => {
   let pixels = [];
   for (let x=0; x<size; x++) {
      let row = [];
      for (let y=0; y<size; y++) {
         row.push({
            x,
            y,
            state: {
               color:   0,  // general state of the pixel
               status:  '', // arbitrary meta data field
               owner: null, // arbitrary owner of this pixel
            }
         })
      }
      pixels.push(row);
   }
   return {
      size,
      pixels,
      version,
      colors,
      id: crypto.randomUUID(),
      status: GAME_STATUSES.ACTIVE,
      setPixel: function({x, y, state={}} = {}) {
         if (x === undefined || y === undefined) {
            console.error(`Invalid attempt to update pixel, missing coords ${x} ${y}`);
            throw `Invalid attempt to update pixel`
         }
         if (typeof(x) !== 'number' || typeof(y) !== 'number') {
            console.error(`Invalid attempt to update pixel, missing coords ${x} ${y}`);
            throw `Invalid x/y coords ${x} ${y}`;
         }
         x = Math.max(0, x);
         x = Math.min(size-1, x);
         y = Math.max(0, y);
         y = Math.min(size-1, y);

         this.pixels[x][y].state = {
            ...this.pixels[x][y].state,
            ...state,
         }
      },
      print: function() {
         let colors = ['bgRed', 'bgGreen', 'bgBlue', 'bgMagenta', 'bgYellow', 'bgCyan', 'bgGrey']
         for (let x=0; x<this.pixels.length; x++) {
            for (let y=0; y<this.pixels.length; y++) {
               let c = this.pixels[x][y].state.color % colors.length;
               let currentColor = this.pixels[x][y].state.color.toString().padStart(2);
               process.stdout.write(`${chalk[colors[c]](currentColor)}`);
            }
            process.stdout.write('\n');
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
   // initialize a game and draw a + pattern
   let game = newGame({size: 5});
   for (let x=0; x<game.pixels.length; x++) {
      game.setPixel({x, y: Math.floor(game.size/2), state: { color: 1 }});
      if (x === Math.floor(game.size/2)) {
         for (let y=0; y<game.pixels[x].length; y++) {
            if (x === y) {
               game.setPixel({x, y, state: { color: 2 }});
            } else {
               game.setPixel({x, y, state: { color: 1 }});
            }
         }
      }
   }
   game.print();
   return game;
}

// simple testing for now
if (require.main === module) {
   test()
}

module.exports = {
   initializeGame,
   GAME_STATUSES,
   allGames,
   test
}