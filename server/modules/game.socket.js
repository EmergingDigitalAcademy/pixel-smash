const http = require('http');
const { Server } = require('socket.io');

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

   return server;
}

module.exports = {
   socketServerBuilder
}