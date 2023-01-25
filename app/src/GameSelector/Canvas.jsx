import { useParams, Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

// connect to game server (by default on localhost)
const GAME_SERVER_URL = window.location.host;

function Canvas() {
   const [connected, setConnected] = useState(false);
   const [gameState, setGameState] = useState({});
   const [socket, setSocket] = useState(null);

   const params = useParams();
   const { gameId } = params;

   useEffect(() => {
      console.log(`connecting to game with id ${gameId}`);
      const socket = io(GAME_SERVER_URL, { query: { gameId } });
      setSocket(socket);

      socket.on('connect', () => {
         setConnected(true);
      })

      socket.on('game-state', gameState => {
         setGameState(gameState);
      });

      socket.on('disconnect', () => {
         console.error('Disconnected from web socket');
         setConnected(false);
      });

      return () => socket.disconnect();
   }, [gameId]);

   // const offset = Math.random() * 360; // color selection (random point on the color wheel)
   // const scale = Math.random() * 50 + 50; // variation of color (how wide of a band)
   const scale = 360;
   const offset = 200;

   const canvasRef = useRef(null);

   useEffect(() => {
      if (!gameState.pixels) return;

      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      //Our first draw
      context.fillStyle = '#FFFFFF'
      context.fillRect(0, 0, context.canvas.width, context.canvas.height)
      for (let row of gameState.pixels) {
         for (let cell of row) {
            let x = (cell.x / gameState.height) * (context.canvas.height);
            let y = (cell.y / gameState.width) * (context.canvas.width);
            let width = (1 / gameState.height) * context.canvas.height;
            // let height = (1 / gameState.width) * context.canvas.width;
            let color = `hsl(100, ${cell.state.color / gameState.colors * 50}%, 50%)`
            context.fillStyle = color;
            context.fillRect(y, x, width, width)
         }
      }
   }, [gameState])

   const handleclick = (event) => {
      // console.log(canvasRef);
      let rect = canvasRef.current.getBoundingClientRect();
      let x = event.clientX - rect.left;
      let y = event.clientY - rect.top;
      let rowX = Math.floor((x / canvasRef.current.width) * gameState.width);
      let rowY = Math.floor((y / canvasRef.current.height) * gameState.height);
      // console.log(rowX, rowY);
      socket.emit('set-phaser', {
         x: rowY,
         y: rowX,
         payload: [{ x: 1, y: 0, color: 1 }, { x: 1, y: 0, color: 1 }, { x: 1, y: 0, color: 1 }, { x: 1, y: 0, color: 1 }]
      })
   }

   const mouseHandler = (event) => {
      if (event.buttons > 0) {
         let rect = canvasRef.current.getBoundingClientRect();
         let x = event.clientX - rect.left;
         let y = event.clientY - rect.top;
         let rowX = Math.floor((x / canvasRef.current.width) * gameState.width);
         let rowY = Math.floor((y / canvasRef.current.height) * gameState.height);
         socket.emit('set-pixel', [
            { x: rowY, y: rowX, state: { color: gameState.pixels[rowY][rowX].state.color + Math.floor(Math.random()*5)+50 % gameState.colors } },
            { x: rowY + 1, y: rowX, state: { color: gameState.pixels[rowY][rowX].state.color + Math.floor(Math.random()*5) % gameState.colors } },
            { x: rowY - 1, y: rowX, state: { color: gameState.pixels[rowY][rowX].state.color + Math.floor(Math.random()*5) % gameState.colors } },
            { x: rowY, y: rowX + 1, state: { color: gameState.pixels[rowY][rowX].state.color + Math.floor(Math.random()*5) % gameState.colors } },
            { x: rowY, y: rowX - 1, state: { color: gameState.pixels[rowY][rowX].state.color + Math.floor(Math.random()*5) % gameState.colors } },
         ]);
         // socket.emit('set-phaser', {
         //    x: pixel.x,
         //    y: pixel.y,
         //    payload:[{x: 1, y: 0, color: 1}, {x: 1, y: 0, color: 1}, {x: 1, y: 0, color: 1}, {x: 1, y: 0, color: 1}]
         // })
      }
   }


   return (
      <section className="game-board">
         <h2>Game {gameId}</h2>
         <Link to="/">Back To Games List</Link>
         <hr />
         <h2 className='status'>{connected ? 'connected' : 'not connected'}</h2>
         <canvas
            width={800} height={500} ref={canvasRef} onClick={handleclick}
            draggable={false}
            onMouseMove={mouseHandler}
         ></canvas>
      </section>
   )
}

export default Canvas;