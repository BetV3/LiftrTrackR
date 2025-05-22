import express from 'express';
import { createGym, getGyms, getGymById, updateGym, deleteGym, getGymLeaderboard } from '../controllers/gym.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Gym CRUD routes
router.post('/', authenticate, createGym);
router.get('/', authenticate, getGyms);
router.get('/:id', authenticate, getGymById);
router.put('/:id', authenticate, updateGym);
router.delete('/:id', authenticate, deleteGym);

// Gym leaderboard route
router.get('/:gym_id/leaderboard', authenticate, getGymLeaderboard);

export default router; 