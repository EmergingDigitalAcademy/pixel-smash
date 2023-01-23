import Demo from '../Demo/Board';
import GamesList from '../GameSelector/GamesList';
import Game from '../GameSelector/Game';
import './App.css';
import { BrowserRouter, Switch, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/demo">
          <Demo />
        </Route>

        <Route path="/game/:gameId">
          <Game />
        </Route>

        <Route path="/">
          <GamesList />
        </Route>
      </Switch>

    </BrowserRouter>
  )
}

export default App;
