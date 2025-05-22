import express from 'express';
import { createWorkout, getWorkouts } from '../controllers/workout.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Workout routes
router.post('/', authenticate, createWorkout);
router.get('/', authenticate, getWorkouts);

export default router; 