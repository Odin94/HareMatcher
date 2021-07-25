import React from 'react';
import logo from './logo.svg';
import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import Signup from './Landing/Signup';
import Login from './Landing/Login';
import Landing from './Landing/Landing';
import Profile from './MatcherApp/Profile';

export default function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/signup">Signup</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/profile">Profile</Link></li>
          </ul>
        </nav>

        <Switch>
          <Route path="/signup"><Signup /></Route>
          <Route path="/login"><Login /></Route>
          <Route path="/profile"><Profile /></Route>
          <Route path="/"><Landing /></Route>
        </Switch>
      </div>
    </Router>
  );
}
