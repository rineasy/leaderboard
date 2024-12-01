import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: { username: string };
}

export const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            throw new Error();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as { username: string };
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Authentication required' });
    }
};
