import React from 'react';
import logo from './logo.svg';
import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from "react-router-dom";
import Signup from './Landing/Signup';
import Login from './Landing/Login';
import Landing from './Landing/Landing';
import User from './MatcherApp/User';
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
            <li><Link to="/me">My Profile</Link></li>
          </ul>
        </nav>

        <Routes>
          <Route path="/signup" element={<Signup/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/me" element={<User/>} />
          <Route path="/profile/:id" element={<Profile/>} />
          <Route path="/" element={<Landing/>} />
        </Routes>
      </div>
    </Router>
  );
}
