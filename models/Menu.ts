import mongoose from "mongoose";

const menuSchema = new mongoose.Schema({
    name: { type: String, required: true },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }],
    price: { type: Number, required: true },
}, { timestamps: true });

export const Menu = mongoose.model('Menu', menuSchema);
