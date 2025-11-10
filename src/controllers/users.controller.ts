import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import PasswordValidator from 'password-validator';
import type { AuthRequest } from '../middleware/auth';

export async function registerUser(req: AuthRequest, res: Response) {
    const { username, password, role } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        const schema = new PasswordValidator();
        schema
            .is().min(8)                                    // Minimum length 8
            .is().max(100)                                  // Maximum length 100
            .has().uppercase()                              // Must have uppercase letters
            .has().lowercase()                              // Must have lowercase letters
            .has().digits(1)                                // Must have at least 2 digits
            .has().not().spaces()                           // Should not have spaces
            .is().not().oneOf(['Passw0rd', 'Password123']); // Blacklist these values

        if (!schema.validate(password)) {
            return res.status(400).json({ message: 'Password does not meet complexity requirements' });
        }
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({ message: 'Username already in use' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword, role });
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        console.error('Error registering user', error);
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
}

export async function loginUser(req: AuthRequest, res: Response) {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(200).json({ token, user });
    } catch (error) {
        console.error('Error logging in user', error);
        res.status(500).json({ message: 'Error logging in user', error: error.message });
    }
}

export async function getUsers(req: Request, res: Response) {
    try {
        const users = await User.find({}, 'username role').sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving users', error: error.message });
    }
}

export async function updateUser(req: AuthRequest, res: Response) {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid user ID' });
    }

    try {
        const { username, password, role } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (username && username !== user.username) {
            const existing = await User.findOne({ username });
            if (existing && !existing._id.equals(user._id)) {
                return res.status(409).json({ message: 'Username already in use' });
            }
            user.username = username;
        }

        if (password) {
            // Reuse password rules from registerUser
            const schema = new (PasswordValidator as any)();
            schema
                .is().min(8)
                .is().max(100)
                .has().uppercase()
                .has().lowercase()
                .has().digits(1)
                .has().not().spaces()
                .is().not().oneOf(['Passw0rd', 'Password123']);

            if (!schema.validate(password)) {
                return res.status(400).json({ message: 'Password does not meet complexity requirements' });
            }
            const hashed = await bcrypt.hash(password, 10);
            user.password = hashed;
        }

        if (role) user.role = role;

        const updated = await user.save();
        res.status(200).json(updated);
    } catch (error) {
        console.error('Error updating user', error);
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
}

export async function deleteUser(req: AuthRequest, res: Response) {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid user ID' });
    }

    try {
        const deleted = await User.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user', error);
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
}