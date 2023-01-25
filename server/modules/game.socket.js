const http = require('http');
const { Server } = require('socket.io')
const { makeItSnow, makeItRainbow, resetColors, MakeItBlow, MakeItDecay } = require('./draw-utils');
let { allGames, initializeGame } = require('./game-utils');
const gameRouter = require('express').Router();

// Socket.io setup and server builder
const socketServerBuilder = (app) => {
   // allow all origin clients (sorry cors)
   const server = http.createServer(app);
   const io = new Server(server, { cors: { origin: '*' } });

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
               version: allGames[current].version,
               physics: allGames[current].physics
            }
         ], []));
   })

   // POST /game/ to create a new game
   gameRouter.post('/', (req, res) => {
      const { width, height, colors, physics, name } = req.body;
      const newGame = initializeGame({ width, height, colors, physics, name });

      if (physics?.engine) {
         setInterval(() => {
            if (physics.engine === 'snow') {
               makeItSnow(newGame, physics.probability);
            } else if (physics.engine === 'rainbow') {
               makeItRainbow(newGame);
            } else if (physics.engine === 'wind') {
               MakeItBlow(newGame);
            } else if (physics.engine === 'decay') {
               MakeItDecay(newGame);
            }
            let game = allGames[newGame.id]; // just in case reference changes
            io.to(game.id).emit('game-state', newGame);
         }, physics.interval || 5000)
      }

      res.status(201).send({
         id: newGame.id
      });
   });

   // DELETE /game/:id to delete a game by id
   gameRouter.delete('/:id', (req, res) => {
      delete allGames[req.params.id];
      res.sendStatus(204);
   })

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

      // join game room and send initial game state
      socket.join(gameId);
      io.to(socket.id).emit('game-state', thisGame);
      io.to(socket.id).emit('chat', { from: 'server', message: 'welcome' })

      socket.on('request-state', (data) => {
         io.to(socket.id).emit('game-state', thisGame);
      })

      socket.on('reset-game', (data) => {
         resetColors(thisGame);
         io.to(socket.id).emit('game-state', thisGame);
      })

      socket.on('set-phaser', (data) => {
         // create a little phaser that moves around the board
         // {x, y, payload: [{x1, y1, c1}, {x2, y2, c2}]}
         const func = (phaser, energy) => {
            try {
               let { x, y, payload } = phaser;
               let current = payload.pop(); // +x, +y, +color
               color = current.color || 0;
               thisGame.setPixel({ x, y, state: { color: thisGame.pixels[x][y].state.color + color } })
               io.to(thisGame.id).emit('game-state', thisGame);
               phaser.x += current.x;
               phaser.y += current.y;
               if (payload.length > 0 && energy > 0)
                  setTimeout(() => func(phaser, --energy), 250)
            } catch (err) {
               // dont crash the server

            }
         }
         func(data, 20);
      })

      socket.on('set-pixel', (data) => {
         if (typeof (data) !== 'object') return; // dont parse strings gross
         // console.log(data);

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
         try {

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
         } catch (err) {
            console.log(err);
            console.log(data);
         }
      })

      socket.on('chat', ({ from, message, to }) => {
         try {
            if (to) {
               io.to(to).emit('chat', { from, message })
            } else {
               io.to(gameId).emit('chat', { from, message })
            }
         } catch (err) {
            console.error('Error sending message', err);
         }

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

   const newGame = initializeGame({ width: 50, height: 30, colors: 30 }); // create a single game to start with
   // newGame.print();
   setInterval(() => {
      makeItSnow(newGame, .01);
      // makeItRainbow(newGame);
      io.to(newGame.id).emit('game-state', newGame);
   }, 1000);

   return server;
}

module.exports = {
   socketServerBuilder
}