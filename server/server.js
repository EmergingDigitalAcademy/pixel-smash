require('dotenv').config(); // pull in environment variables

// Express setup
const express = require('express');
const { socketServerBuilder } = require('./modules/game.socket');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware setup
app.use(express.json()); // enables accepting content-type application/json
app.use(express.static("build/")); // serve out anything you find in the build/ folder (used in production/heroku)

// HTTP Routes
// app.use('/pixel', require('./routes/pixel.router'));

// Socket.io stuff - return an http server with sockets enabled
const server = socketServerBuilder(app);

// Listen on port 5000 unless PORT is in environment vars (heroku)
server.listen(PORT, () => {
   console.log(`Listening on port: ${PORT}`);
});