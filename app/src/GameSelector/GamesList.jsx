import { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import axios from "axios";

function GamesList() {
   const [games, setGames] = useState([]);
   const history = useHistory();

   const fetchGames = async () => {
      try {
         const result = await axios.get('/game/');
         setGames(result.data);
      } catch (err) {
         console.error(`Error getting games`, err);
      }
   }
   useEffect(() => {
      fetchGames();
   }, []);


   const newGame = async (params) => {
      try {
         const response = await axios.post('/game/', params);
         console.log(`Created game: `, response.data);
         history.push(`/game/${response.data.id}`)
      } catch (err) {
         console.error(`Error getting games`, err);
      }
   }
   return (
      <main>
         <header>
            <h1>Games List</h1>
         </header>
         <section>
            <button onClick={() => newGame()}>New Game</button>
            <button onClick={() => newGame({ physics: { engine: 'rainbow', interval: 500 }, width: 50, height: 20, colors: 5000 })}>New Rainbow</button>
            <button onClick={() => newGame({ physics: { engine: 'snow', probability: 0.01, interval: 2000 }, width: 50, height: 20 })}>Light Rain</button>
            <button onClick={() => newGame({ physics: { engine: 'snow', probability: 1.0, interval: 1000 }, width: 50, height: 20 })}>Chaotic</button>
            <button onClick={() => newGame({ physics: { engine: 'snow', probability: 0.1, interval: 1000 }, colors: 3, width: 50, height: 20 })}>Pixels</button>

            <ul>
               {games.map((g, i) => (
                  <li key={i}>
                     <Link to={`/game/${g.id}`}>{g.id.slice(0, 4)} / {g.physics.engine}</Link>
                  </li>
               ))}
            </ul>
         </section>
         <footer>
            <Link to="/demo">Demo</Link>
         </footer>
      </main>
   )
}

export default GamesList;