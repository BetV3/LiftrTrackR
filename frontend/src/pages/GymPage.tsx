import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './GymPage.css';

interface Gym {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

const GymPage: React.FC = () => {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: ''
  });
  const [editingGym, setEditingGym] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGyms();
  }, []);

  const fetchGyms = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/gyms', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGyms(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch gyms');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const data = {
        name: formData.name,
        address: formData.address,
        latitude: formData.latitude ? parseFloat(formData.latitude) : 0,
        longitude: formData.longitude ? parseFloat(formData.longitude) : 0
      };
      
      if (editingGym) {
        await axios.put(`/api/gyms/${editingGym}`, data, { headers });
      } else {
        await axios.post('/api/gyms', data, { headers });
      }
      
      // Reset form and refresh gym list
      setFormData({ name: '', address: '', latitude: '', longitude: '' });
      setEditingGym(null);
      fetchGyms();
    } catch (err) {
      setError('Failed to save gym');
      console.error(err);
    }
  };

  const handleEdit = (gym: Gym) => {
    setFormData({
      name: gym.name,
      address: gym.address,
      latitude: gym.latitude.toString(),
      longitude: gym.longitude.toString()
    });
    setEditingGym(gym.id);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this gym?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/gyms/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchGyms();
      } catch (err) {
        setError('Failed to delete gym');
        console.error(err);
      }
    }
  };

  if (loading) return <div>Loading gyms...</div>;

  return (
    <div className="gym-page">
      <h1>Gym Management</h1>
      
      {error && <div className="error">{error}</div>}
      
      <div className="actions-bar">
        <Link to="/gym-finder" className="find-gyms-button">
          Find Gyms Near Me
        </Link>
      </div>
      
      <form onSubmit={handleSubmit} className="gym-form">
        <h2>{editingGym ? 'Edit Gym' : 'Add New Gym'}</h2>
        
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="address">Address:</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="latitude">Latitude:</label>
          <input
            type="number"
            id="latitude"
            name="latitude"
            value={formData.latitude}
            onChange={handleInputChange}
            step="0.000001"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="longitude">Longitude:</label>
          <input
            type="number"
            id="longitude"
            name="longitude"
            value={formData.longitude}
            onChange={handleInputChange}
            step="0.000001"
          />
        </div>
        
        <div className="form-actions">
          <button type="submit">{editingGym ? 'Update Gym' : 'Add Gym'}</button>
          {editingGym && (
            <button 
              type="button" 
              onClick={() => {
                setEditingGym(null);
                setFormData({ name: '', address: '', latitude: '', longitude: '' });
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
      
      <h2>Gyms List</h2>
      {gyms.length === 0 ? (
        <p>No gyms found. Add your first gym above or use the "Find Gyms Near Me" feature.</p>
      ) : (
        <div className="gyms-list">
          {gyms.map(gym => (
            <div key={gym.id} className="gym-card">
              <h3>{gym.name}</h3>
              <p>{gym.address}</p>
              <p>
                <small>
                  Lat: {gym.latitude}, Long: {gym.longitude}
                </small>
              </p>
              <div className="gym-actions">
                <button onClick={() => handleEdit(gym)}>Edit</button>
                <button onClick={() => handleDelete(gym.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GymPage; 