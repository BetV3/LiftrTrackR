import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'some_random_secret';

interface JWTPayload {
    id: string;
    email: string;
}

export const generateToken = (user: { id: string, email: string }): string => {
    const payload: JWTPayload = {
        id: user.id,
        email: user.email,
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h'});
}

export const verifyToken = ( token: string) => {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
}