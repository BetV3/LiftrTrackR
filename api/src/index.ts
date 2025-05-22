import express from 'express';
import "reflect-metadata"
import authRoutes from './routes/auth.routes';
import workoutRoutes from './routes/workout.routes';
import gymRoutes from './routes/gym.routes';
import mapsRoutes from './routes/maps.routes';
import connectDB from './config/database.config';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/gyms', gymRoutes);
app.use('/api/maps', mapsRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;