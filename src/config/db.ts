import mongoose from "mongoose";

export async function connectDB() {
    if (mongoose.connection.readyState === 1) {
        return;
    }

    try {
        await mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.34p6sfe.mongodb.net/wacdo?retryWrites=true&w=majority&appName=Cluster0`)
        console.log('Connected to the database');
    } catch (error) {
        console.error('Error connecting to the database', error);
    }
}