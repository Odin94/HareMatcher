import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import Signup from './Landing/Signup';
import Login from './Landing/Login';
import Landing from './Landing/Landing';
import CreateProfile from './MatcherApp/CreateProfile';
import Matches from './MatcherApp/Matches';
import SpecificProfile from './MatcherApp/SpecificProfile';
import Discover from './MatcherApp/Discover';
import MatcherNavigation from './MatcherApp/MatcherNavigation';
import LandingNavigation from './Landing/LandingNavigation';
import Me from './MatcherApp/Me';
import SpecificUser from './MatcherApp/SpecificUser';
import SpecificChat from './MatcherApp/Chat';
import ChatRooms from './MatcherApp/ChatRooms';
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div>
          <Routes>
            <Route path="/me" element={<MatcherNavigation><Me /></MatcherNavigation>} />
            <Route path="/matches" element={<MatcherNavigation><Matches /></MatcherNavigation>} />
            <Route path="/discover" element={<MatcherNavigation><Discover /></MatcherNavigation>} />
            <Route path="/profiles/:id" element={<MatcherNavigation><SpecificProfile /></MatcherNavigation>} />
            <Route path="/profiles/create" element={<MatcherNavigation><CreateProfile /></MatcherNavigation>} />
            <Route path="/users/:id" element={<MatcherNavigation><SpecificUser /></MatcherNavigation>} />
            <Route path="/chat/:userId/:profileId" element={<MatcherNavigation><SpecificChat /></MatcherNavigation>} />
            <Route path="/chats" element={<MatcherNavigation><ChatRooms /></MatcherNavigation>} />

            <Route path="/" element={<LandingNavigation><Landing /></LandingNavigation>} />
            <Route path="/signup" element={<LandingNavigation><Signup /></LandingNavigation>} />
            <Route path="/login" element={<LandingNavigation><Login /></LandingNavigation>} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

