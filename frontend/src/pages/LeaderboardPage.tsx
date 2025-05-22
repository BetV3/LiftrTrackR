import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Gym {
  id: string;
  name: string;
}

interface LeaderboardEntry {
  user: {
    id: string;
    email: string;
  };
  maxWeight: number;
}

const liftOptions = [
  'BENCH_PRESS',
  'SQUAT',
  'DEADLIFT',
  'OVERHEAD_PRESS',
  'BARBELL_ROW'
];

const LeaderboardPage: React.FC = () => {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [selectedGym, setSelectedGym] = useState<string>('');
  const [selectedLift, setSelectedLift] = useState<string>('BENCH_PRESS');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGyms();
  }, []);

  useEffect(() => {
    if (selectedGym) {
      fetchLeaderboard();
    }
  }, [selectedGym, selectedLift]);

  const fetchGyms = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/gyms', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGyms(response.data);
      
      // Automatically select the first gym if available
      if (response.data.length > 0 && !selectedGym) {
        setSelectedGym(response.data[0].id);
      }
    } catch (err) {
      setError('Failed to fetch gyms');
      console.error(err);
    }
  };

  const fetchLeaderboard = async () => {
    if (!selectedGym || !selectedLift) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/gyms/${selectedGym}/leaderboard`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { lift: selectedLift, limit: 10 }
      });
      setLeaderboard(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch leaderboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGymChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGym(e.target.value);
  };

  const handleLiftChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLift(e.target.value);
  };

  return (
    <div className="leaderboard-page">
      <h1>Gym Leaderboard</h1>
      
      {error && <div className="error">{error}</div>}
      
      <div className="filters">
        <div className="form-group">
          <label htmlFor="gym">Select Gym:</label>
          <select
            id="gym"
            value={selectedGym}
            onChange={handleGymChange}
          >
            <option value="">-- Select a Gym --</option>
            {gyms.map(gym => (
              <option key={gym.id} value={gym.id}>
                {gym.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="lift">Select Lift:</label>
          <select
            id="lift"
            value={selectedLift}
            onChange={handleLiftChange}
          >
            {liftOptions.map(lift => (
              <option key={lift} value={lift}>
                {lift.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {loading ? (
        <div>Loading leaderboard...</div>
      ) : selectedGym ? (
        <div className="leaderboard">
          <h2>
            {selectedLift.replace('_', ' ')} Leaderboard
            {gyms.find(g => g.id === selectedGym)?.name && 
              ` at ${gyms.find(g => g.id === selectedGym)?.name}`}
          </h2>
          
          {leaderboard.length === 0 ? (
            <p>No records found for this lift at this gym.</p>
          ) : (
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>User</th>
                  <th>Max Weight (kg)</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, index) => (
                  <tr key={entry.user.id}>
                    <td>{index + 1}</td>
                    <td>{entry.user.email}</td>
                    <td>{entry.maxWeight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <p>Please select a gym to view the leaderboard.</p>
      )}
    </div>
  );
};

export default LeaderboardPage; 