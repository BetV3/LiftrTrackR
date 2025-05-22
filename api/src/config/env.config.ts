import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, "../../.env") });

// Validate required environment variables
export const env = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '3000', 10),
    DATABASE_URL: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/liftrtrackr',
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || '',
    JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret_key'
}