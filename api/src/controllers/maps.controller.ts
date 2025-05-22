import { Request, Response } from 'express';
import { MapsService } from '../services/maps.service';
import { getRepository } from 'typeorm';
import { Gym } from '../models/gym.entity';

/**
 * Get nearby gyms based on user location
 */
export const getNearbyGyms = async (req: Request, res: Response) => {
  try {
    const { lat, lng, radius } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }
    
    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);
    const searchRadius = radius ? parseInt(radius as string) : 5000;
    
    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ message: 'Invalid latitude or longitude' });
    }
    
    const nearbyGyms = await MapsService.findNearbyGyms(latitude, longitude, searchRadius);
    
    // Fetch gyms from our database to mark already-saved ones
    const gymRepository = getRepository(Gym);
    const savedGyms = await gymRepository.find();
    const savedGymPlaceIds = new Set(savedGyms.filter(gym => gym.placeId).map(gym => gym.placeId));
    
    // Mark gyms that are already saved in our database
    const formattedGyms = nearbyGyms.map(gym => ({
      ...gym,
      isSaved: savedGymPlaceIds.has(gym.place_id)
    }));
    
    return res.json(formattedGyms);
  } catch (error) {
    console.error('Error fetching nearby gyms:', error);
    return res.status(500).json({ message: 'Error fetching nearby gyms' });
  }
};

/**
 * Get details for a specific place
 */
export const getPlaceDetails = async (req: Request, res: Response) => {
  try {
    const { placeId } = req.params;
    
    if (!placeId) {
      return res.status(400).json({ message: 'Place ID is required' });
    }
    
    const placeDetails = await MapsService.getPlaceDetails(placeId);
    
    if (!placeDetails) {
      return res.status(404).json({ message: 'Place not found' });
    }
    
    return res.json(placeDetails);
  } catch (error) {
    console.error('Error fetching place details:', error);
    return res.status(500).json({ message: 'Error fetching place details' });
  }
};

/**
 * Save a Google Place as a gym in our database
 */
export const saveGooglePlace = async (req: Request, res: Response) => {
  try {
    const { placeId } = req.params;
    const { name, address, latitude, longitude, photo_reference } = req.body;
    
    if (!placeId || !name || !address || !latitude || !longitude) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Check if gym with this placeId already exists
    const gymRepository = getRepository(Gym);
    const existingGym = await gymRepository.findOne({ where: { placeId } });
    
    if (existingGym) {
      return res.status(400).json({ message: 'Gym already exists in database' });
    }
    
    // Save the new gym
    const newGym = gymRepository.create({
      name,
      address,
      latitude,
      longitude,
      placeId,
      photoReference: photo_reference
    });
    
    await gymRepository.save(newGym);
    
    return res.status(201).json(newGym);
  } catch (error) {
    console.error('Error saving gym from Google Place:', error);
    return res.status(500).json({ message: 'Error saving gym' });
  }
}; 