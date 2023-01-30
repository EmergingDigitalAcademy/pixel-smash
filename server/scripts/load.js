const { io } = require('socket.io-client');

let N = 200;
let sockets = [];
const GAME_SERVER_URL = `https://pixel-smash.fly.dev/`;

console.log(`Building ${N} sockets...`);
for (let i = 0; i < N; i++) {
   process.stdout.write(`${i} `);
   const s = io(GAME_SERVER_URL, { upgrade: false, transports: ['websocket'] });
   // const s = io(GAME_SERVER_URL);
   s.on('game-state', () => {});
   s.on('connect_error', err => process.stdout.write(`${i} ${err}`))
   s.on('connect_failed', err => process.stdout.write(`${i} ${err} `))
   // s.on('disconnect', err => console.log(err));
   // s.on('chat', (data) => console.log(data));
   sockets.push(s);
}

// setTimeout(() => {
//    console.log('cleaning up (asking each socket to disconnect)');
//    for (let socket of sockets) {
//       socket.disconnect();
//    }
//    process.exit();
// }, 10000) // 10 seconds

setInterval(() => {
   for (let s of sockets) {
      s.emit('set-pixel', {
         x: Math.floor(Math.random()*50),
         y: Math.floor(Math.random()*20),
         state: {
            color: Math.floor(Math.random()*15)
         }
      })
   }
   console.log('--> SENT 50 PIXELS');
}, 100);