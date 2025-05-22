import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Gym {
  id: string;
  name: string;
}

interface Workout {
  id: string;
  date: string;
  lift: string;
  sets: number;
  reps: number;
  weight: number;
  gym?: {
    id: string;
    name: string;
  };
}

const liftOptions = [
  'BENCH_PRESS',
  'SQUAT',
  'DEADLIFT',
  'OVERHEAD_PRESS',
  'BARBELL_ROW'
];

const WorkoutPage: React.FC = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    lift: 'BENCH_PRESS',
    sets: 3,
    reps: 8,
    weight: 60,
    gym_id: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGyms();
    fetchWorkouts();
  }, [pagination.page]);

  const fetchGyms = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/gyms', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGyms(response.data);
    } catch (err) {
      console.error('Failed to fetch gyms:', err);
    }
  };

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/workouts', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: pagination.page,
          limit: pagination.limit
        }
      });
      
      setWorkouts(response.data.workouts);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination.total
      }));
      setError('');
    } catch (err) {
      setError('Failed to fetch workouts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      // Convert string values to numbers where needed
      const data = {
        ...formData,
        sets: Number(formData.sets),
        reps: Number(formData.reps),
        weight: Number(formData.weight),
        gym_id: formData.gym_id || null
      };
      
      await axios.post('/api/workouts', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Reset form and refresh workouts list
      setFormData({
        date: new Date().toISOString().split('T')[0],
        lift: 'BENCH_PRESS',
        sets: 3,
        reps: 8,
        weight: 60,
        gym_id: ''
      });
      
      fetchWorkouts();
    } catch (err) {
      setError('Failed to log workout');
      console.error(err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading && workouts.length === 0) return <div>Loading workouts...</div>;

  return (
    <div className="workout-page">
      <h1>Log Workout</h1>
      
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit} className="workout-form">
        <div className="form-group">
          <label htmlFor="date">Date:</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="lift">Lift:</label>
          <select
            id="lift"
            name="lift"
            value={formData.lift}
            onChange={handleInputChange}
            required
          >
            {liftOptions.map(lift => (
              <option key={lift} value={lift}>
                {lift.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="sets">Sets:</label>
            <input
              type="number"
              id="sets"
              name="sets"
              value={formData.sets}
              onChange={handleInputChange}
              min="1"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="reps">Reps:</label>
            <input
              type="number"
              id="reps"
              name="reps"
              value={formData.reps}
              onChange={handleInputChange}
              min="1"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="weight">Weight (kg):</label>
            <input
              type="number"
              id="weight"
              name="weight"
              value={formData.weight}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="gym_id">Gym (optional):</label>
          <select
            id="gym_id"
            name="gym_id"
            value={formData.gym_id}
            onChange={handleInputChange}
          >
            <option value="">-- No Gym Selected --</option>
            {gyms.map(gym => (
              <option key={gym.id} value={gym.id}>
                {gym.name}
              </option>
            ))}
          </select>
        </div>
        
        <button type="submit">Log Workout</button>
      </form>
      
      <h2>Recent Workouts</h2>
      {workouts.length === 0 ? (
        <p>No workouts found. Log your first workout above.</p>
      ) : (
        <>
          <div className="workouts-list">
            {workouts.map(workout => (
              <div key={workout.id} className="workout-card">
                <div className="workout-header">
                  <h3>{workout.lift.replace('_', ' ')}</h3>
                  <span className="date">{formatDate(workout.date)}</span>
                </div>
                <div className="workout-details">
                  <p>{workout.sets} sets × {workout.reps} reps × {workout.weight} kg</p>
                  {workout.gym && <p className="gym-name">at {workout.gym.name}</p>}
                </div>
              </div>
            ))}
          </div>
          
          <div className="pagination">
            <button
              disabled={pagination.page === 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              Previous
            </button>
            <span>Page {pagination.page}</span>
            <button
              disabled={pagination.page * pagination.limit >= pagination.total}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default WorkoutPage; 