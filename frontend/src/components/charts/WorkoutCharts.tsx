import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import axios from 'axios';

interface ChartData {
  date: string;
  weight: number;
}

interface VolumeData {
  week: string;
  volume: number;
}

const WorkoutCharts: React.FC<{ lift: string, gym_id?: string }> = ({ lift, gym_id }) => {
  const [progressData, setProgressData] = useState<ChartData[]>([]);
  const [volumeData, setVolumeData] = useState<VolumeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProgressData();
    fetchVolumeData();
  }, [lift, gym_id]);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // This endpoint is conceptual and would need to be implemented in the backend
      // It would return the max weight per date for a specific lift
      const response = await axios.get('/api/analytics/progress', {
        headers: { Authorization: `Bearer ${token}` },
        params: { 
          lift,
          gym_id: gym_id || undefined
        }
      });
      
      setProgressData(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch progress data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVolumeData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // This endpoint is conceptual and would need to be implemented in the backend
      // It would return weekly volume (sets * reps * weight) for a specific lift
      const response = await axios.get('/api/analytics/volume', {
        headers: { Authorization: `Bearer ${token}` },
        params: { 
          lift,
          gym_id: gym_id || undefined
        }
      });
      
      setVolumeData(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch volume data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading charts...</div>;
  if (error) return <div className="error">{error}</div>;

  // Create sample data for demonstration purposes
  // Remove this in actual implementation
  const sampleProgressData = [
    { date: '2023-01-01', weight: 60 },
    { date: '2023-01-15', weight: 65 },
    { date: '2023-02-01', weight: 70 },
    { date: '2023-02-15', weight: 72.5 },
    { date: '2023-03-01', weight: 75 },
    { date: '2023-03-15', weight: 77.5 },
    { date: '2023-04-01', weight: 80 },
  ];

  const sampleVolumeData = [
    { week: 'Week 1', volume: 3200 },
    { week: 'Week 2', volume: 3600 },
    { week: 'Week 3', volume: 4000 },
    { week: 'Week 4', volume: 3800 },
    { week: 'Week 5', volume: 4200 },
    { week: 'Week 6', volume: 4400 },
    { week: 'Week 7', volume: 4600 },
  ];

  // Use real data if available, sample data otherwise
  const displayProgressData = progressData.length > 0 ? progressData : sampleProgressData;
  const displayVolumeData = volumeData.length > 0 ? volumeData : sampleVolumeData;

  return (
    <div className="workout-charts">
      <div className="chart-container">
        <h3>1RM Progress Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={displayProgressData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="weight" 
              stroke="#8884d8" 
              activeDot={{ r: 8 }} 
              name="Max Weight (kg)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-container">
        <h3>Weekly Volume</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={displayVolumeData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar 
              dataKey="volume" 
              fill="#82ca9d" 
              name="Volume (kg)"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WorkoutCharts; 