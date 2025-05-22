import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Workout } from '../models/workout.entity';
import { User } from '../models/user.entity';
import { Gym } from '../models/gym.entity';

// Create a new workout
export const createWorkout = async (req: Request, res: Response) => {
    try {
        const { date, lift, sets, reps, weight, gym_id } = req.body;
        const userId = (req as any).user.id;
        
        if (!date || !lift || !sets || !reps || !weight) {
            return res.status(400).json({ message: 'Date, lift, sets, reps, and weight are required' });
        }
        
        const userRepository = getRepository(User);
        const workoutRepository = getRepository(Workout);
        const gymRepository = getRepository(Gym);
        
        const user = await userRepository.findOne({ where: { id: userId } });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const workoutData: any = {
            date,
            lift,
            sets,
            reps,
            weight,
            user
        };
        
        // Add gym reference if provided
        if (gym_id) {
            const gym = await gymRepository.findOne({ where: { id: gym_id } });
            if (gym) {
                workoutData.gym = gym;
            }
        }
        
        const newWorkout = workoutRepository.create(workoutData);
        await workoutRepository.save(newWorkout);
        
        // TODO: Emit workout-create event to a message queue for PlateauBreaker
        
        return res.status(201).json(newWorkout);
    } catch (error) {
        console.error('Error creating workout:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Get workouts with pagination and filtering
export const getWorkouts = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { page = 1, limit = 10, gym_id } = req.query;
        
        const skip = (Number(page) - 1) * Number(limit);
        
        const workoutRepository = getRepository(Workout);
        
        // Build query with user filter
        const query = workoutRepository
            .createQueryBuilder('workout')
            .leftJoinAndSelect('workout.gym', 'gym')
            .where('workout.user_id = :userId', { userId });
        
        // Add gym filter if provided
        if (gym_id) {
            query.andWhere('workout.gym_id = :gymId', { gymId: gym_id });
        }
        
        // Add pagination
        query.skip(skip).take(Number(limit));
        query.orderBy('workout.date', 'DESC');
        
        const [workouts, total] = await query.getManyAndCount();
        
        return res.json({
            workouts,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total
            }
        });
    } catch (error) {
        console.error('Error fetching workouts:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}; 