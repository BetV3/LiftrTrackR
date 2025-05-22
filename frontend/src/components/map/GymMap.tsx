import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Wrapper } from '@googlemaps/react-wrapper';
import './GymMap.css';

// Set your Google Maps API key
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';

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

interface GymMapProps {
  onGymSelect?: (gym: Gym) => void;
  height?: string;
  width?: string;
  initialCenter?: { lat: number; lng: number };
  zoom?: number;
}

const GymMapWrapper: React.FC<GymMapProps> = (props) => {
  // Use the wrapper to load the Google Maps API
  return (
    <Wrapper apiKey={GOOGLE_MAPS_API_KEY}>
      <GymMap {...props} />
    </Wrapper>
  );
};

const GymMap: React.FC<GymMapProps> = ({
  onGymSelect,
  height = '500px',
  width = '100%',
  initialCenter,
  zoom = 14
}) => {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(
    initialCenter || null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<{ [key: string]: google.maps.Marker }>({});
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  
  // Initialize the map
  const initMap = useCallback(() => {
    if (!mapRef.current || !userLocation) return;
    
    googleMapRef.current = new google.maps.Map(mapRef.current, {
      center: userLocation,
      zoom,
      styles: [
        {
          featureType: "poi.business",
          stylers: [{ visibility: "on" }]
        }
      ]
    });
    
    // Create info window for markers
    infoWindowRef.current = new google.maps.InfoWindow();
    
    // Add click listener to map to close any open info windows
    googleMapRef.current.addListener('click', () => {
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }
    });
  }, [userLocation, zoom]);
  
  // Get user's current location
  const getUserLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
        },
        (error) => {
          console.error('Error getting user location:', error);
          setError('Unable to get your location. Please enable location services.');
          setLoading(false);
          
          // Default to a fallback location (e.g., New York City)
          setUserLocation({ lat: 40.7128, lng: -74.0060 });
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
      
      // Default to a fallback location
      setUserLocation({ lat: 40.7128, lng: -74.0060 });
    }
  }, []);
  
  // Fetch nearby gyms
  const fetchNearbyGyms = useCallback(async () => {
    if (!userLocation) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get('/api/maps/nearby', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          lat: userLocation.lat,
          lng: userLocation.lng,
          radius: 5000 // 5km radius
        }
      });
      
      setGyms(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching nearby gyms:', err);
      setError('Failed to fetch nearby gyms.');
    } finally {
      setLoading(false);
    }
  }, [userLocation]);
  
  // Add markers to the map
  const addMarkers = useCallback(() => {
    if (!googleMapRef.current || !gyms.length) return;
    
    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => marker.setMap(null));
    markersRef.current = {};
    
    // Add markers for each gym
    gyms.forEach(gym => {
      if (!googleMapRef.current) return;
      
      const marker = new google.maps.Marker({
        position: gym.geometry.location,
        map: googleMapRef.current,
        title: gym.name,
        icon: gym.isSaved 
          ? { url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png' } 
          : undefined
      });
      
      marker.addListener('click', () => {
        if (!infoWindowRef.current) return;
        
        // Set content for info window
        const content = `
          <div class="info-window">
            <h3>${gym.name}</h3>
            <p>${gym.vicinity}</p>
            ${gym.rating ? `<p>Rating: ${gym.rating} ⭐ (${gym.user_ratings_total} reviews)</p>` : ''}
            <button id="view-details-${gym.place_id}" class="info-window-button">View Details</button>
          </div>
        `;
        
        infoWindowRef.current.setContent(content);
        infoWindowRef.current.open(googleMapRef.current, marker);
        
        // Add a small delay to ensure the DOM is updated
        setTimeout(() => {
          const detailsButton = document.getElementById(`view-details-${gym.place_id}`);
          if (detailsButton) {
            detailsButton.addEventListener('click', () => {
              setSelectedGym(gym);
              if (onGymSelect) {
                onGymSelect(gym);
              }
            });
          }
        }, 100);
      });
      
      markersRef.current[gym.place_id] = marker;
    });
  }, [gyms, onGymSelect]);
  
  // Initialize everything on component mount
  useEffect(() => {
    if (!userLocation && !initialCenter) {
      getUserLocation();
    }
  }, [getUserLocation, initialCenter, userLocation]);
  
  // Initialize map when user location is available
  useEffect(() => {
    if (userLocation) {
      initMap();
    }
  }, [initMap, userLocation]);
  
  // Fetch gyms when map is initialized
  useEffect(() => {
    if (googleMapRef.current && userLocation) {
      fetchNearbyGyms();
    }
  }, [fetchNearbyGyms, userLocation]);
  
  // Add markers when gyms data is loaded
  useEffect(() => {
    if (googleMapRef.current && gyms.length > 0) {
      addMarkers();
    }
  }, [addMarkers, gyms]);
  
  return (
    <div className="gym-map-container">
      {error && <div className="error-message">{error}</div>}
      {loading && !googleMapRef.current && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Loading map...</p>
        </div>
      )}
      <div 
        ref={mapRef} 
        className="gym-map" 
        style={{ height, width, borderRadius: '8px' }}
      ></div>
      
      {selectedGym && (
        <div className="selected-gym-info">
          <h3>{selectedGym.name}</h3>
          <p>{selectedGym.vicinity}</p>
          {!selectedGym.isSaved && (
            <button onClick={() => {
              if (onGymSelect) {
                onGymSelect(selectedGym);
              }
            }}>
              Save to My Gyms
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default GymMapWrapper; 