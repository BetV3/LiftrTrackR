import express from 'express';
import { getNearbyGyms, getPlaceDetails, saveGooglePlace } from '../controllers/maps.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Get nearby gyms based on user location
router.get('/nearby', authenticate, getNearbyGyms);

// Get details for a specific place
router.get('/place/:placeId', authenticate, getPlaceDetails);

// Save a Google Place as a gym in our database
router.post('/place/:placeId/save', authenticate, saveGooglePlace);

export default router; 