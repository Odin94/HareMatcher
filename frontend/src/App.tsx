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
import MatcherNavigation from './MatcherApp/MatcherNavigation';
import LandingNavigation from './Landing/LandingNavigation';


export default function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/me" element={<MatcherNavigation><User /></MatcherNavigation>} />
          <Route path="/matches" element={<MatcherNavigation><Matches /></MatcherNavigation>} />
          <Route path="/discover" element={<MatcherNavigation><Discover /></MatcherNavigation>} />
          <Route path="/profile/:id" element={<MatcherNavigation><SpecificProfile /></MatcherNavigation>} />
          <Route path="/profile/create" element={<MatcherNavigation><CreateProfile /></MatcherNavigation>} />

          <Route path="/" element={<LandingNavigation><Landing /></LandingNavigation>} />
          <Route path="/signup" element={<LandingNavigation><Signup /></LandingNavigation>} />
          <Route path="/login" element={<LandingNavigation><Login /></LandingNavigation>} />
        </Routes>
      </div>
    </Router>
  );
}

