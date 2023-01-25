require('dotenv').config(); // pull in environment variables
const express = require('express');
const { socketServerBuilder } = require('./modules/game.socket');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware setup
app.use(express.json()); // enables accepting content-type application/json
app.use(express.static("build/")); // serve out anything you find in the build/ folder (used in production/heroku)
app.use(cors()); // allow cors

// Socket.io stuff - return an http server with sockets enabled
// note: this also sets up a router that can access the game state
const server = socketServerBuilder(app);

// Listen on port 5000 unless PORT is in environment vars (heroku)
server.listen(PORT, () => {
   console.log(`Listening on port: ${PORT}`);
});