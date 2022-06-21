import React from 'react';
import logo from './logo.svg';
import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import Signup from './Landing/Signup';
import Login from './Landing/Login';
import Landing from './Landing/Landing';
import User from './MatcherApp/User';
import CreateProfile from './MatcherApp/CreateProfile';
import Matches from './MatcherApp/Matches';
import SpecificProfile from './MatcherApp/SpecificProfile';
import Discover from './MatcherApp/Discover';
import NavBar from './MatcherApp/NavBar';


export default function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/me" element={<NavBar><User /></NavBar>} />
          <Route path="/matches" element={<NavBar><Matches /></NavBar>} />
          <Route path="/discover" element={<NavBar><Discover /></NavBar>} />
          <Route path="/profile/:id" element={<NavBar><SpecificProfile /></NavBar>} />
          <Route path="/profile/create" element={<NavBar><CreateProfile /></NavBar>} />

          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}
