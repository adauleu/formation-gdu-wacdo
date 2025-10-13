import mongoose, { Document } from "mongoose";

export const roles = ['admin', 'préparateur', 'accueil'] as const;
export type Role = (typeof roles)[number];
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: roles, required: true },
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);

export type IUser = Document<mongoose.InferSchemaType<typeof userSchema>>;