# Pixel Smash

## References
   - Sequelize: https://github.com/EmergingDigitalAcademy/intro-to-fullstack-javascript

## General Concepts
   A board game is an object with meta data and pixels. The meta data contains info
   like width, height, number of colors (states), unique id, and information on the
   'physics' of the game (which right now consists of just some generic patterns)

   A pixel is represented by a coordinate (x,y) and state object (color, owner)
   `{x: 1, y: 1, state: {color: 2, owner: 'user-123', status: ''}}` for example. 
   It is up to the client to choose how to display the states in a suitable color palette.
   The `owner` of a pixel is set to the socket ID (random unique id) and the
   status is reserved for arbitrary meta data that is stored along side the pixel

   There are many strategies to determine what color to draw for a given pixel state,
   but the simplest is to divide the state by the number of colors to get a 
   number between 0 and 1. Multiply this times 360 to get a color on the color wheel.
   Pass this value to `hsl` to generate a proper color. 

   Example: `hsl(${(pixel.state.color/game.colors)*360, 100%, 50%})`

   Decreasing 360 to a smaller number, then offsetting it, will provide a more narrow
   range of colors. `(pixel.state.color/game.colors)*50+150` would give a value between 150-200 for example (so a shade of green/dark blue)

## Server Messages & Routes
   - `POST /game/` will create a new game and return an object with the game id
      Example options: 
      ``` json
      { 
         name: 'my canvas',
         physics: { 
            engine: 'decay', // rainbow, wind, decay, snow
            interval: 500, // ms
         }, 
         width: 50,  // pixels wide
         height: 20, // pixels high
         colors: 256 // number of states (client has to figure out these mean)
      }
      ```
   - `GET /game/` will return an array of all current games
   - `web socket connect to /` will automatically subscribe the socket to the game
      identified with the query `gameId`, or default to the first game found if
      there is no `gameId` in the query string.

      Every update to the subscribed game will send the entire game state to
      all connected clients.
      - `game-state` will be dispatched by the server on every state change
      - `chat` with a payload of `{from, message}` will be dispatched for
         relaying game information or other info
   
The server accepts the following messages:
   - `set-pixel` can accept a pixel or an array of pixels:
      `{x, y, state: {color}}` or `[{}, {}, {}]`
      `{x: 1, y: 1, state: {color: 5}}` will set pixel (1,1) to color 5
   
   - `set-phaser` accepts a phaser object which can be used to initiate a 'worm'
      `{x, y, payload: [{x, y, color}, {x, y, color}]}` 
         Each payload value is relative. So a value of {x: 1, y: 0, color: 2} will
         increase x by 1, y by 0, and color by 2
   
   - `chat` accepts a message `{to, from, message}` that will be sent to all connected
      clients. Could be used for host messages. `to` is optional. If left off,
      message is sent to all clients. Setting it to a socket id would have the
      message sent directly to one client only (useful if host sends a message
      to a specific socket id that was stored in a pixel).


## Ideas for implementations:
   - Paint brush: send pixel arrays on mouse drag
   - Addative Brush: add values to existing pixel states
   - Animations: Loop through several frames, setting pixels on click
   - Worms: On click, recursively crawl around on the canvas
   - Highlight pixels that are owned by other players
   - Cellular Automata: Update pixels based on other pixels around

   Game Ideas:
   One client is the 'host' and manages the board. All other players use the
   standard canvas, either in static mode (set pixel state to X) or relative mode
   (add +1 to pixel on click)

   Host watches for incoming game state, analyzes, and enforces rules. Could draw
   score boards, titles, etc. simply by setting those pixels (clearing any player
   state) at intervals.

   Battleship Example:
      - Host randomly picks a 3x3 square and draws it on the canvas but does NOT
      send it to the server (clients do not receive).
      - Clients set pixels to state `1` to make a guess. 
      - Host receives pixels, adds `10` to mark as missed and draws
         a ring round the pixel in state 2
      - Host adds `20` and reveals the square if correctly guessed
      - Pixel owner of the guess is the winner (could send chat signal via
         different message group)
   
   Race Example:
      - All pixels must start on the left most square. Host enforces that all 
         other squares are owned by them and have 0 state. Any pixel entering
         the playing field owned by another player are cleared back to 0 by host.
      - When pixel is set at the starting line, host moves it 1 pixel
         to the right at an interval. A starting state of 50 starts the race.
      - The host reveals special pixels that, when hit, adds or subs to the
         state of the pixel (color), or change its direction.
      - The winner is the first to send a pixel to the goal line (or square).
         The pixel state subtracts one on each move until it runs out of gas.
         Host adds meta data to the trail to track who initiated it.

   Guessing Game:
      - Host draws 4 boxes on the screen (3x3)
      - Clients click on a box to see if it is the correct box or a dud.

   Grid Guesser:
      - Host draws a big grid of state 1 pixels
      - Client clicks a pixel to guess. Host changes guess to:
         2 if the guess is wrong
         3 if the guess is in the right row
         4 if the guess is in the right column
         5 if otherwise is within 40 pixels
         6 if otherwise is within 10 pixels
         10 if the guess was correct
      - Pixel then resets after 1 second
      - Guesses are tallied on the bottom of the screen
      - The person who gets the final guess wins
      - Guessers get +1 points for good guesses
      - Winner gets 5 points for answer

   Puzzle Game:
      - Host designs some kind of puzzle and draws it on the board. 
      - Clients add a value to a pixel to activate the puzzle. Clicking
         on different pixels cause the puzzle to evolve in different ways,
         via cellular automata based rules
      - The goal is to get the puzzle into an end state with only one click

   Controls:
      - Host can watch certain pixels for state change, and respond in a 
         kind of messaging system (set pixel 0,0 to '1' to reset game)
      - Host can maintain a game status by forcing a pixel to a state
         (1 for go, 2 for finished).
      - Client/Host could even design a communication protocol, using
         a specific area for sending messages / commands. Client sets
         top two pixels for identify command, host receives, clears 
         pixels, and executes the command. Host knows who sent the
         command because of pixel ownership tag.

   Potential upgrades for the future:
      - Allowing clients to send 'draft' pixels for host review. This would
         allow secret messaging to the host, or allow the host to review
         an individual incoming pixel prior to putting it on the board
         (to filter out bad state and enforce rules)
      - Creation of a chat system so that host / clients can send text
         messages (like who 'won').

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
