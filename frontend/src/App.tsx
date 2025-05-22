import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Import pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import WorkoutPage from './pages/WorkoutPage';
import GymPage from './pages/GymPage';
import GymFinderPage from './pages/GymFinderPage';
import LeaderboardPage from './pages/LeaderboardPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/workouts" element={<WorkoutPage />} />
        <Route path="/gyms" element={<GymPage />} />
        <Route path="/gym-finder" element={<GymFinderPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
      </Routes>
    </Router>
  );
}

export default App; 