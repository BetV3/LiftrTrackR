import React, { useState } from 'react';
import GymMap from '../components/map/GymMap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './GymFinderPage.css';

interface Gym {
  place_id: string;
  name: string;
  vicinity: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    }
  };
  rating?: number;
  user_ratings_total?: number;
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  isSaved?: boolean;
}

const GymFinderPage: React.FC = () => {
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleGymSelect = (gym: Gym) => {
    setSelectedGym(gym);
    setError('');
    setSuccess('');
  };

  const handleSaveGym = async () => {
    if (!selectedGym) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const gymData = {
        name: selectedGym.name,
        address: selectedGym.vicinity,
        latitude: selectedGym.geometry.location.lat,
        longitude: selectedGym.geometry.location.lng,
        photo_reference: selectedGym.photos?.[0]?.photo_reference
      };

      await axios.post(`/api/maps/place/${selectedGym.place_id}/save`, gymData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess(`${selectedGym.name} has been added to your gyms!`);
      setSelectedGym(null);

      // Navigate to gyms page after a short delay
      setTimeout(() => {
        navigate('/gyms');
      }, 2000);
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to save gym. Please try again.');
      }
      console.error('Error saving gym:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gym-finder-page">
      <h1>Find Gyms Near You</h1>
      <p className="description">
        Use the map below to find gyms in your area. Click a gym marker to view details and add it to your list.
      </p>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="gym-finder-container">
        <div className="map-container">
          <GymMap 
            onGymSelect={handleGymSelect} 
            height="600px" 
          />
        </div>

        {selectedGym && (
          <div className="selected-gym-details">
            <h2>{selectedGym.name}</h2>
            <p className="address">{selectedGym.vicinity}</p>
            
            {selectedGym.rating && (
              <p className="rating">
                Rating: {selectedGym.rating} ⭐ ({selectedGym.user_ratings_total} reviews)
              </p>
            )}
            
            {selectedGym.photos && selectedGym.photos.length > 0 && (
              <div className="gym-photo">
                <img 
                  src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${selectedGym.photos[0].photo_reference}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`} 
                  alt={selectedGym.name} 
                />
              </div>
            )}
            
            <div className="actions">
              {!selectedGym.isSaved ? (
                <button 
                  className="save-button" 
                  onClick={handleSaveGym}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Add to My Gyms'}
                </button>
              ) : (
                <p className="already-saved">This gym is already in your list.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GymFinderPage; 