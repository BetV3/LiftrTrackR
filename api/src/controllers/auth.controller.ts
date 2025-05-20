import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { User } from '../models/user.entity';
import { generateToken } from '../utils/jwt';
import bcrypt from 'bcrypt';

export class AuthController {
    // Login Method
    public login = async (req: Request, res: Response) => {
        try {
            const { email, password} = req.body;

            if (!email || !password) {
                res.status(400).json({
                    message: 'Email and Password required'
                });
                return;
            }

            const userRepository = getRepository(User);

            const user = await userRepository.findOne({
                where: { email: email.toLowerCase() }
            });

            if (!user) {
                res.status(401).json({
                    message: 'Invalid Credentials'
                });
                return;
            }

            const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
            if (!isPasswordValid) {
                res.status(401).json({
                    message: 'Invalid Credentials'
                });
                return;
            }

            const token = generateToken({
                id: user.id,
                email: user.email
            });

            res.status(200).json({
                token,
                user: {
                    id: user.id,
                    email: user.email
                }
            });
            return;
        } catch (error) {
            console.error('Login error: ', error);
            res.status(500).json({
                message: 'Internal server error'
            });
            return;
        }
    }

    public register = async (req: Request, res: Response) =>{
        try {
            const { email, password } = req.body;

            // Basic validation
            if (!email || !password) {
                res.status(400).json({
                    message: 'Email and Password required'
                });
                return;
            }

            // Email format validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                res.status(400).json({
                    message: 'Invalid email format'
                });
                return;
            }

            // Password strength validation (minimum 8 characters, at least one number)
            if (password.length < 8 || !/\d/.test(password)) {
                res.status(400).json({
                    message: 'Password must be at least 8 characters long and contain at least one number'
                });
                return;
            }

            const userRepository = getRepository(User);

            // Check if email already exists
            const existingUser = await userRepository.findOne({
                where: { email: email.toLowerCase() }
            });

            if (existingUser) {
                res.status(400).json({
                    message: 'Email already registered'
                });
                return;
            }

            // Your existing code for creating the user
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);

            const newUser = userRepository.create({
                email: email.toLowerCase(),
                passwordHash
            });

            const savedUser = await userRepository.save(newUser);

            const token = generateToken({
                id: savedUser.id,
                email: savedUser.email
            });

            res.status(201).json({
                token,
                user: {
                    id: savedUser.id,
                    email: savedUser.email
                }
            });
            return;
        } catch (error) {
            console.error('Registration error: ', error);
            res.status(500).json({
                message: 'Internal server error'
            });
            return;
        }
    }
}