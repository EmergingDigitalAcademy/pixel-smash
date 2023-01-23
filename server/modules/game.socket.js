const http = require('http');
const { Server } = require('socket.io');
const { makeItSnow, makeItRainbow } = require('./draw-utils');
let { allGames, initializeGame } = require('./game-utils');
const gameRouter = require('express').Router();

// Express Router Setup for Games Endpoint
// GET /games/ to get an array of game objects (with pixel state stripped)
gameRouter.get('/', (req, res) => {
   res.send(Object.keys(allGames).reduce(
      (result, current) => [
         ...result,
         {
            id: allGames[current].id,
            height: allGames[current].height,
            width: allGames[current].width,
            colors: allGames[current].colors,
            version: allGames[current].version
         }
      ]
      , []));
})

// POST /game/ to create a new game
gameRouter.post('/', (req, res) => {
   const newGame = initializeGame();
   res.status(201).send(newGame);
});

// DELETE /game/:id to delete a game by id
gameRouter.delete('/:id', (req, res) => {
   delete allGames[req.params.id];
   res.sendStatus(204)
})

// Socket.io setup and server builder
// `ehlo` - sends a welcome message
// `game-state` - 
const socketServerBuilder = (app) => {
   const server = http.createServer(app);
   const io = new Server(server);

   io.on('connection', socket => {
      // for now, if there is no gameid specified, default to the first game
      let { gameId } = socket.handshake.query;
      if (gameId === undefined || allGames[gameId] === undefined) gameId = Object.keys(allGames)[0];

      if (!gameId) {
         console.log(`Socket ${socket.id} connected but being dropped due to invalid game id`);
         io.to(socket.id).emit('error', { message: 'invalid game id and no default game available to join' });
         socket.disconnect();
         return;
      }
      const thisGame = allGames[gameId];
      const userId = socket.id; // for now, until socket identifies itself as a real user

      console.log(`Socket ${userId} connected to game ${gameId}`);
      socket.join(gameId); // join the game room
      // send initial game state
      io.to(socket.id).emit('game-state', thisGame);

      socket.on('request-state', (data) => {
         io.to(socket.id).emit('game-state', thisGame);
      })

      socket.on('set-pixel', (data) => {
         if (typeof (data) !== 'object') return; // dont parse strings gross
         console.log(data);

         let pixels = [];
         if (data.length === undefined && (
            data.x !== undefined &&
            data.y !== undefined &&
            data.state?.color !== undefined)
         ) {
            // its a valid pixel object
            pixels = [data];
         } else {
            // its an array of pixels
            pixels = data;
         }

         // process each pixel
         for (let pixel of pixels) {
            try {
               thisGame.setPixel({
                  x: pixel.x,
                  y: pixel.y,
                  state: {
                     ...pixel.state,
                     owner: userId,
                  }
               });
            } catch (err) {
               console.log(err);
            }
         }
         // broadcast the new game state
         io.to(gameId).emit('game-state', thisGame);
      })

      socket.on('debug', (data) => {
         thisGame.print();
      })

      // setInterval(() => {
      //    io.emit('msg', { data: 'msg' });
      // }, 5000);
   });

   // Wire up the games router to the express app we received
   app.use('/game/', gameRouter);

   const newGame = initializeGame({ width: 50, height: 30, colors: 3 }); // create a single game to start with
   // newGame.print();
   setInterval(() => {
      makeItSnow(newGame);
      // makeItRainbow(newGame);
      io.to(newGame.id).emit('game-state', newGame);
   }, 5000);

   return server;
}

module.exports = {
   socketServerBuilder
}