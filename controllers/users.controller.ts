import type { Request, Response } from 'express';
import { User } from '../models/User.ts';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import PasswordValidator from 'password-validator';
import type { AuthRequest } from '../middleware/auth.ts';

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
        res.status(500).json({ message: 'Error registering user', error });
    }
}

export async function loginUser(req: AuthRequest, res: Response) {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
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
        console.log(user);
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(200).json({ token, user });
    } catch (error) {
        console.error('Error logging in user', error);
        res.status(500).json({ message: 'Error logging in user', error });
    }
}

export async function getUsers(req: Request, res: Response) {
    try {
        const users = await User.find({}, 'username role').sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving users', error });
    }
}