import type { NextFunction, Response } from "express";
import type { AuthRequest } from "./auth.ts";
import type { JWTUser } from "../types.ts";
import type { Role } from "../models/User.ts";

export function hasOneOfRole(roles: Role[]) {
    return function (req: AuthRequest, res: Response, next: NextFunction) {
        const { role: userRole } = req.user as JWTUser;
        if (!roles.includes(userRole)) res.status(403).json({ message: 'You dont have the right to access this resource' });
        else next();
    }
}

export function hasRole(role: Role) {
    return function (req: AuthRequest, res: Response, next: NextFunction) {
        const { role: userRole } = req.user as JWTUser;
        if (userRole !== 'admin' && role !== userRole) res.status(403).json({ message: 'You dont have the right to access this resource' });
        else next();
    }
}
