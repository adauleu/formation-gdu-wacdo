import type mongoose from "mongoose";
import type { Role } from "./models/User.ts";

export type JWTUser = {
    id: mongoose.Types.ObjectId;
    role: Role;
    iat?: number; // Issued at
    exp?: number; // Expiration time
};