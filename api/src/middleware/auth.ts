import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { User } from '../models/user.entity';
import { getRepository } from 'typeorm';

// This extends the Express Request type to include our user
// This allows TypeScript to know that req.user exists after our middleware runs
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if Authorization header exists and starts with 'Bearer '
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Extract the token (removes 'Bearer ' from the start)
    const token = authHeader.split(' ')[1];
    
    // Verify the token and get the decoded payload
    const decoded = verifyToken(token) as { id: string, email: string };
    
    // Find the user in the database using the id from the token
    const userRepository = getRepository(User);
    const user = await userRepository.findOne({ where: { id: decoded.id } });
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Attach the user to the request object for use in later middleware/routes
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}; 