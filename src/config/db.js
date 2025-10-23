"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
async function connectDB() {
    if (mongoose_1.default.connection.readyState === 1) {
        return;
    }
    try {
        await mongoose_1.default.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.34p6sfe.mongodb.net/wacdo?retryWrites=true&w=majority&appName=Cluster0`);
        console.log('Connected to the database');
    }
    catch (error) {
        console.error('Error connecting to the database', error);
    }
}
exports.connectDB = connectDB;
