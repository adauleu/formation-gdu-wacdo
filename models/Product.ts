import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    image: { type: String },
    available: { type: Boolean, default: true },
}, { timestamps: true });

export const Product = mongoose.model('Product', productSchema);
