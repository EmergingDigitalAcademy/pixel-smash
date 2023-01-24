# Pixel Smash

## References
   - Sequelize: https://github.com/EmergingDigitalAcademy/intro-to-fullstack-javascript

## Socket.io high level concepts:
   - Clients connect to a web socket to maintain a persistent connection with the server. 
   - A 'message' can be emitted from the server to the client or the client to the server.
   - A 'message' has an id and data. For example: `say-hello` message may contain `{"message": "hi there"}`
      and this message will only be captured and processesd if the receiving end has a specific
      listener to capture the message by id.
   - Rooms are a server-only concept. They define which sockets to emit a message to.
      - Server can emit to all connected clients (`io.emit(...)`)
      - Server can emit to a single socket by socket (`io.to(socketid).emit(...)`)
      - Server can emit to everyone except sender (`socket.broadcast.emit(...)`)
      - Server can emit to a group of sockets (called a 'room') (`io.in('room1').emit(...)`)
      - Server can emit to a group of sockets except sender (`socket.to('room1'.emit(...)`)
      - Server can emit with acknowledgement (`socket.emit('question', (answer) => {...})`)
      - Client can emit a message directly to the server (`socket.emit(...)`)
      - Client can emit with acknowledgement (`socket.emit('question', (answer) => {...})`)
   - Reserved messages (that can be hooked into server-side):
      `connect`, `connect_error`, `disconnect`, `disconnecting`, `newListener`, `removeListener`

## General Concepts
   A board game is an object with meta data and pixels. The meta data contains info
   like width, height, number of colors (states), unique id, and information on the
   'physics' of the game (which right now consists of just some generic patterns)

   A pixel is represented by a coordinate (x,y) and state object (color, owner)
   `{x: 1, y: 1, state: {color: 2, owner: 'user-123'}}` for example. It is up to
   the client to choose how to display the states in a suitable color palette.

## Server Messages & Routes
   - `POST /game/` will create a new game and return an object with the game id
   - `GET /game/` will return an array of all current games
   - `web socket connect to /` will automatically subscribe the socket to the game
      identified with the query `gameId`, or default to the first game found if
      there is no `gameId` in the query string.

      Every update to the subscribed game will send the entire game state to
      all connected clients.
      - `game-state` will be dispatched by the server on every state change
   
The server accepts the following messages:
   - `set-pixel` can accept a pixel or an array of pixels:
      `{x, y, state: {color}}` or `[{}, {}, {}]`
      `{x: 1, y: 1, state: {color: 5}}` will set pixel (1,1) to color 5
   
   - `set-phaser` accepts a phaser object which can be used to initiate a 'worm'
      `{x, y, payload: [{x, y, color}, {x, y, color}]}` 
         Each payload value is relative. So a value of {x: 1, y: 0, color: 2} will
         increase x by 1, y by 0, and color by 2