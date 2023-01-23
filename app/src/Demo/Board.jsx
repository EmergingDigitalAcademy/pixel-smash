import { useEffect, useState } from 'react';
import './Board.css';
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

  // const offset = Math.random() * 360; // color selection (random point on the color wheel)
  const scale = Math.random() * 50 + 50; // variation of color (how wide of a band)
  // const scale = 360;
  const offset = 200;

  console.log('rendering');

  return (
    <main className="demo-board">
      <h2 className='status'>{connected ? 'connected' : 'not connected'}</h2>
      <div className='pixel-container'>
        {gameState.pixels &&
          gameState.pixels.map((row, index) => (
            <div className="pixel-row" key={index}>
              {row.map(pixel => (
                <div
                  key={`${pixel.x}-${pixel.y}`}
                  className={`pixel color-${pixel.state.color}`}
                  style={{ 
                    width: `${100 / gameState.width}%`,
                    paddingBottom: `${100 / gameState.width}%`,
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
