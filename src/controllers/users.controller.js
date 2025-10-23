"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = exports.loginUser = exports.registerUser = void 0;
const User_1 = require("../models/User");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const password_validator_1 = __importDefault(require("password-validator"));
async function registerUser(req, res) {
    const { username, password, role } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }
    try {
        const schema = new password_validator_1.default();
        schema
            .is().min(8) // Minimum length 8
            .is().max(100) // Maximum length 100
            .has().uppercase() // Must have uppercase letters
            .has().lowercase() // Must have lowercase letters
            .has().digits(1) // Must have at least 2 digits
            .has().not().spaces() // Should not have spaces
            .is().not().oneOf(['Passw0rd', 'Password123']); // Blacklist these values
        if (!schema.validate(password)) {
            return res.status(400).json({ message: 'Password does not meet complexity requirements' });
        }
        const existingUser = await User_1.User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({ message: 'Username already in use' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const newUser = new User_1.User({ username, password: hashedPassword, role });
        await newUser.save();
        res.status(201).json(newUser);
    }
    catch (error) {
        console.error('Error registering user', error);
        res.status(500).json({ message: 'Error registering user', error });
    }
}
exports.registerUser = registerUser;
async function loginUser(req, res) {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }
    try {
        const user = await User_1.User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(200).json({ token, user });
    }
    catch (error) {
        console.error('Error logging in user', error);
        res.status(500).json({ message: 'Error logging in user', error });
    }
}
exports.loginUser = loginUser;
async function getUsers(req, res) {
    try {
        const users = await User_1.User.find({}, 'username role').sort({ createdAt: -1 });
        res.status(200).json(users);
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving users', error });
    }
}
exports.getUsers = getUsers;
