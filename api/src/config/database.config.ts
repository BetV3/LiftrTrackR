import { createConnection, DataSource } from "typeorm";
import { User } from "../models/user.entity";
import { Workout } from "../models/workout.entity";
import { PR } from "../models/pr.entity";
import { Alert } from "../models/alert.entity";
import { Gym } from "../models/gym.entity";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "liftrtrackr",
    synchronize: process.env.NODE_ENV !== "production", // Only in dev environment
    logging: process.env.NODE_ENV !== "production",
    entities: [User, Workout, PR, Alert, Gym],
    migrations: ["src/migrations/*.ts"],
});

const connectDB = async () => {
    try {
        await AppDataSource.initialize();
        console.log("Database connection established");
    } catch (error) {
        console.error("Error connecting to the database:", error);
        process.exit(1);
    }
};

export default connectDB;