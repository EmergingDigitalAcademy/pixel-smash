import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './Game.css';
import Pixel from './Pixel';

// connect to game server (by default on localhost)
const GAME_SERVER_URL = 'http://localhost:5000/';

function Game() {
   const [connected, setConnected] = useState(false);
   const [gameState, setGameState] = useState({});
   const params = useParams();
   const { gameId } = params;

   useEffect(() => {
      const socket = io(GAME_SERVER_URL, {query: { gameId }});

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

   return (
      <section className="game-board">
         <h2>Game {gameId}</h2>
         <Link to="/">Back To Games List</Link>
         <hr />
         <h2 className='status'>{connected ? 'connected' : 'not connected'}</h2>
         <div className='pixel-container'>
            {gameState.pixels &&
               gameState.pixels.map((row, index) => (
                  <div className="pixel-row" key={index}>
                     {row.map(pixel => (
                        <Pixel
                           key={`${pixel.x}-${pixel.y}-${pixel.state.color}`}
                           pixel={pixel}
                           gameState={gameState}
                           scale={scale}
                           offset={offset}
                        />))}
                  </div>
               ))}
         </div>
      </section>
   )
}

export default Game;