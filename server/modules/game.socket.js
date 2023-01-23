const http = require('http');
const { Server } = require('socket.io');
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
            size: allGames[current].size,
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
const socketServerBuilder = (app) => {
   const server = http.createServer(app);
   const io = new Server(server);
   io.on('connection', socket => {
      console.log('connected', socket.handshake);
      socket.join('general'); // this is a server-only concept

      socket.on("ping", () => {
         console.log('pong');
         io.emit('msg');
      });

      socket.on("message", (data) => {
         console.log(data);
      });

      //    setInterval(() => {
      //       io.to('general').emit('msg', { data: 'general?' });
      //   }, 1000);

      setInterval(() => {
         io.emit('msg', { data: 'msg' });
      }, 5000);
   });

   // Wire up the games router to the express app we received
   app.use('/game/', gameRouter);

   return server;
}

module.exports = {
   socketServerBuilder
}