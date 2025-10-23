import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import type { JWTUser } from '../types';

export type AuthRequest = Request & { user?: JWTUser };

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Please login' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTUser;
        (req as AuthRequest).user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Please login' });
    }
}