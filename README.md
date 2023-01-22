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