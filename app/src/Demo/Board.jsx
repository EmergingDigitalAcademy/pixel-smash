import { useEffect, useState } from 'react';
import './Board.css';
import { io } from 'socket.io-client';

function App() {
  const [connected, setConnected] = useState(false);
  const [gameState, setGameState] = useState({});
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socket = io();
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
    })

    // Clean up the socket after we leave the page
    return () => socket.disconnect()
  }, []);

  // const offset = Math.random() * 360; // how wide of a band
  // const scale = Math.random() * 50 + 50; // starting color
  const scale = 100;
  const offset = 200;

  return (
    <main className="demo-board">
      <h2 className='status'>
        {connected ? 'connected' : 'not connected'}
      </h2>
      <h2 className='reset'>
        <button onClick={() => socket.emit('reset-game')}>reset</button>
      </h2>
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
