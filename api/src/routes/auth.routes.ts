import { Router, Request, Response } from 'express';
import { User } from '../models/user.entity';
import { getRepository } from 'typeorm';
import { authenticate } from 'src/middleware/auth.middleware';
import { AuthController } from '../controllers/auth.controller';

const router = Router();
const authController = new AuthController();

router.post('/register', authController.register);
router.post('/login', authController.login);

export default router;