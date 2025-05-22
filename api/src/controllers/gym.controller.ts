import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Gym } from '../models/gym.entity';
import { Workout } from '../models/workout.entity';
import { User } from '../models/user.entity';

// Create a new gym
export const createGym = async (req: Request, res: Response) => {
    try {
        const { name, address, latitude, longitude } = req.body;
        
        if (!name || !address) {
            return res.status(400).json({ message: 'Name and address are required' });
        }
        
        const gymRepository = getRepository(Gym);
        const newGym = gymRepository.create({
            name,
            address,
            latitude: latitude || 0,
            longitude: longitude || 0
        });
        
        await gymRepository.save(newGym);
        
        return res.status(201).json(newGym);
    } catch (error) {
        console.error('Error creating gym:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Get all gyms
export const getGyms = async (req: Request, res: Response) => {
    try {
        const gymRepository = getRepository(Gym);
        const gyms = await gymRepository.find();
        
        return res.json(gyms);
    } catch (error) {
        console.error('Error fetching gyms:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Get a gym by ID
export const getGymById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const gymRepository = getRepository(Gym);
        
        const gym = await gymRepository.findOne({ where: { id } });
        
        if (!gym) {
            return res.status(404).json({ message: 'Gym not found' });
        }
        
        return res.json(gym);
    } catch (error) {
        console.error('Error fetching gym:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Update a gym
export const updateGym = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, address, latitude, longitude } = req.body;
        
        const gymRepository = getRepository(Gym);
        const gym = await gymRepository.findOne({ where: { id } });
        
        if (!gym) {
            return res.status(404).json({ message: 'Gym not found' });
        }
        
        gym.name = name || gym.name;
        gym.address = address || gym.address;
        gym.latitude = latitude !== undefined ? latitude : gym.latitude;
        gym.longitude = longitude !== undefined ? longitude : gym.longitude;
        
        await gymRepository.save(gym);
        
        return res.json(gym);
    } catch (error) {
        console.error('Error updating gym:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete a gym
export const deleteGym = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const gymRepository = getRepository(Gym);
        
        const gym = await gymRepository.findOne({ where: { id } });
        
        if (!gym) {
            return res.status(404).json({ message: 'Gym not found' });
        }
        
        await gymRepository.remove(gym);
        
        return res.json({ message: 'Gym deleted successfully' });
    } catch (error) {
        console.error('Error deleting gym:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Get gym leaderboard
export const getGymLeaderboard = async (req: Request, res: Response) => {
    try {
        const { gym_id } = req.params;
        const { lift = 'BENCH_PRESS', limit = 10 } = req.query;
        
        const workoutRepository = getRepository(Workout);
        const userRepository = getRepository(User);
        
        // Query to get the max weight per user for a specific lift at this gym
        const leaderboardData = await workoutRepository
            .createQueryBuilder('workout')
            .select('workout.user_id', 'userId')
            .addSelect('MAX(workout.weight)', 'maxWeight')
            .where('workout.gym_id = :gymId', { gymId: gym_id })
            .andWhere('workout.lift = :lift', { lift })
            .groupBy('workout.user_id')
            .orderBy('maxWeight', 'DESC')
            .limit(Number(limit))
            .getRawMany();
            
        // Fetch user details for each result
        const results = await Promise.all(leaderboardData.map(async (entry) => {
            const user = await userRepository.findOne({ where: { id: entry.userId } });
            return {
                user: {
                    id: user?.id,
                    email: user?.email
                },
                maxWeight: entry.maxWeight
            };
        }));
        
        return res.json(results);
    } catch (error) {
        console.error('Error fetching gym leaderboard:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}; 