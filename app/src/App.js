import { useEffect, useState } from 'react';
import './App.css';
import { io } from 'socket.io-client';
const socket = io();

function App() {
  const [connected, setConnected] = useState(socket.connected);
  const [gameState, setGameState] = useState({});
  // console.log(gameState);
  useEffect(() => {
    // set up socket.io
    socket.on('connect', () => {
      setConnected(true);
    })

    socket.on('game-state', gameState => {
      setGameState(gameState);
    });

    socket.on('disconnect', () => {
      console.error('Disconnected from web socket');
      setConnected(false);
    })
  }, []);

  const offset = Math.random() * 360;
  const scale = Math.random() * 50+50;
  // const scale = 360;

  return (
    <main>
      <h2 className='status'>{connected ? 'connected' : 'not connected'}</h2>
      <div className='pixel-container'>
        {gameState.pixels &&
          gameState.pixels.map((row, index) => (
            <div class="pixel-row" key={index}>
              {row.map(pixel => (
                <div
                  key={`${pixel.x}-${pixel.y}-${pixel.color}`}
                  className={`pixel color-${pixel.state.color}`}
                  style={{ 
                    width: `${100 / gameState.size}%`,
                    paddingBottom: `${100 / gameState.size}%`,
                    backgroundColor: `hsl(${(pixel.state.color / gameState.colors) * scale + offset}, 100%, 50%)`
                  }}
                >
                  {/* {pixel.state.color} */}
                </div>
              ))}
            </div>
          ))}
      </div>
    </main>
  );
}

export default App;
