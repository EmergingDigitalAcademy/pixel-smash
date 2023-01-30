const http = require('http');
const { Server } = require('socket.io')
const { makeItSnow, makeItRainbow, resetColors, MakeItBlow, MakeItDecay } = require('./draw-utils');
let { newGame, printGame, setPixel } = require('./game-utils');
const gameRouter = require('express').Router();
const pool = require('../modules/pool');

// Socket.io setup and server builder
const socketServerBuilder = (app) => {
   // allow all origin clients (sorry cors)
   const server = http.createServer(app);
   const io = new Server(server, { cors: { origin: '*' } });

   // Express Router Setup for Games Endpoint
   // GET /games/ to get an array of game objects (with pixel state stripped)
   gameRouter.get('/', async (req, res) => {
      try {
         const result = await pool.query(`
         SELECT "id", "height", "width", "colors", "version", "physics", "created_at"
         FROM "games" ORDER BY "created_at";`);
         res.send(result.rows);
      } catch (err) {
         res.sendStatus(500);
         console.error('Error with query: ', err);
      }
   })

   // POST /game/ to create a new game
   gameRouter.post('/', async (req, res) => {
      const { width, height, colors, physics, name } = req.body;
      const ng = newGame({ width, height, colors, physics, name });
      const queryText = `
      INSERT INTO "games" (id, width, height, colors, name, version, status, physics, pixels)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::jsonb)`;
      const params = [
         ng.id, ng.width, ng.height, ng.colors, ng.name,
         ng.version, ng.status, JSON.stringify(ng.physics),
         JSON.stringify(ng.pixels)
      ]
      try {
         await pool.query(queryText, params);
         res.status(201).send({
            id: ng.id
         });
      } catch (err) {
         console.log(err);
         res.sendStatus(500);
         return;
      }

      // if (physics?.engine) {
      //    setInterval(() => {
      //       if (physics.engine === 'snow') {
      //          makeItSnow(newGame, physics.probability);
      //       } else if (physics.engine === 'rainbow') {
      //          makeItRainbow(newGame);
      //       } else if (physics.engine === 'wind') {
      //          MakeItBlow(newGame);
      //       } else if (physics.engine === 'decay') {
      //          MakeItDecay(newGame);
      //       }
      //       let game = allGames[newGame.id]; // just in case reference changes
      //       io.to(game.id).emit('game-state', newGame);
      //    }, physics.interval || 5000)
      // }
   });

   // DELETE /game/:id to delete a game by id
   gameRouter.delete('/:id', async (req, res) => {
      try {
         await pool.query(`DELETE FROM "games" WHERE id=$1;`, [req.params.id]);
         res.sendStatus(204);
      } catch (err) {
         console.error(`Error deleting game`, err);
         res.sendStatus(500);
      }
   });

   // Helper function to grab a game from the DB
   const getGame = async (gameId) => {
      const result = await pool.query(`SELECT * FROM "games" WHERE ID=$1;`, [gameId]);
      return result.rows[0];
   }

   const saveGame = async (game) => {
      try {
         await pool.query(`
            UPDATE "games" SET 
               name=$1, status=$2, physics=$3::jsonb, pixels=$4::jsonb
            WHERE id=$5
         `, [game.name, game.status, JSON.stringify(game.physics), JSON.stringify(game.pixels), game.id]);
         // res.sendStatus(200);
      } catch (err) {
         console.error(`Error updating game`, err);
         // res.sendStatus(500);
      }
   }

   io.on('connection', async socket => {
      // for now, if there is no gameid specified, default to the first game
      let { gameId } = socket.handshake.query;
      if (gameId === undefined) {
         // no gameid defined, lets use the default game
         try {
            const result = await pool.query(`SELECT "id" FROM "games" ORDER BY "created_at" LIMIT 1`);
            gameId = result.rows[0].id;
         } catch (err) {
            console.error(`Error getting game`, err);
         }
      }

      if (!gameId) {
         console.log(`Socket ${socket.id} connected but being dropped due to invalid game id`);
         io.to(socket.id).emit('error', { message: 'invalid game id and no default game available to join' });
         socket.disconnect();
         return;
      }

      const userId = socket.id; // for now, until socket identifies itself as a real user
      console.log(`Socket ${userId} connected to game ${gameId}`);

      // join game room and send initial game state
      socket.join(gameId);
      io.to(socket.id).emit('game-state', await getGame(gameId));
      io.to(socket.id).emit('chat', { from: 'server', message: 'welcome' })

      socket.on('request-state', async () => {
         console.log(getGame(gameId));
         io.to(socket.id).emit('game-state', await getGame(gameId));
      })

      socket.on('reset-game', async () => {
         resetColors(getGame(gameId));
         io.to(gameId).emit('game-state', await getGame(gameId));
      });

      // socket.on('set-phaser', (data) => {
      //    // create a little phaser that moves around the board
      //    // {x, y, payload: [{x1, y1, c1}, {x2, y2, c2}]}
      //    const func = (phaser, energy) => {
      //       try {
      //          let { x, y, payload } = phaser;
      //          let current = payload.pop(); // +x, +y, +color
      //          color = current.color || 0;
      //          thisGame.setPixel({ x, y, state: { color: thisGame.pixels[x][y].state.color + color } })
      //          io.to(thisGame.id).emit('game-state', thisGame);
      //          phaser.x += current.x;
      //          phaser.y += current.y;
      //          if (payload.length > 0 && energy > 0)
      //             setTimeout(() => func(phaser, --energy), 250)
      //       } catch (err) {
      //          // dont crash the server

      //       }
      //    }
      //    func(data, 20);
      // })

      socket.on('set-pixel', async (data) => {
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
            let thisGame = await getGame(gameId);
            for (let pixel of pixels) {
               try {
                  setPixel(thisGame, {
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
            await saveGame(thisGame);
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
         printGame(getGame(gameId));
      })

      // setInterval(() => {
      //    io.emit('msg', { data: 'msg' });
      // }, 5000);
   });

   // Wire up the games router to the express app we received
   app.use('/game/', gameRouter);

   // const newGame = initializeGame({ width: 50, height: 30, colors: 30 }); // create a single game to start with
   // newGame.print();
   // setInterval(() => {
   //    makeItSnow(newGame, .01);
   //    // makeItRainbow(newGame);
   //    io.to(newGame.id).emit('game-state', newGame);
   // }, 1000);

   return server;
}

module.exports = {
   socketServerBuilder
}