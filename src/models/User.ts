import mongoose from "mongoose";

export const roles = ['admin', 'préparateur', 'accueil'] as const;
export type Role = (typeof roles)[number];

export interface IUser {
    username: string;
    password: string;
    role: Role;
    createdAt?: Date;
    updatedAt?: Date;
}

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: roles, required: true },
}, { timestamps: true });

export const User = mongoose.model<IUser>('User', userSchema);