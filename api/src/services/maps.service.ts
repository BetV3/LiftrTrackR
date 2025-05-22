import axios from 'axios';
import { env } from '../config/env.config';

const GOOGLE_MAPS_API_KEY = env.GOOGLE_MAPS_API_KEY;
const PLACES_API_URL = 'https://maps.googleapis.com/maps/api/place';

export class MapsService {
  /**
   * Search for gyms near a specific location
   * @param lat Latitude
   * @param lng Longitude
   * @param radius Search radius in meters (default: 5000)
   * @returns Array of nearby gyms
   */
  static async findNearbyGyms(lat: number, lng: number, radius: number = 5000) {
    try {
      const response = await axios.get(`${PLACES_API_URL}/nearbysearch/json`, {
        params: {
          location: `${lat},${lng}`,
          radius,
          type: 'gym',
          key: GOOGLE_MAPS_API_KEY
        }
      });

      return response.data.results || [];
    } catch (error) {
      console.error('Error fetching nearby gyms:', error);
      throw error;
    }
  }

  /**
   * Get detailed information about a specific place
   * @param placeId Google Place ID
   * @returns Place details
   */
  static async getPlaceDetails(placeId: string) {
    try {
      const response = await axios.get(`${PLACES_API_URL}/details/json`, {
        params: {
          place_id: placeId,
          fields: 'name,formatted_address,geometry,photos,opening_hours,rating,user_ratings_total',
          key: GOOGLE_MAPS_API_KEY
        }
      });

      return response.data.result || null;
    } catch (error) {
      console.error('Error fetching place details:', error);
      throw error;
    }
  }
} 