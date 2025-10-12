import mongoose from "mongoose";

export const statuses = ['pending', 'ready', 'delivered'] as const;

const orderSchema = new mongoose.Schema({
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    menus: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Menu' }],
    status: { type: String, enum: statuses, default: 'pending' },
}, { timestamps: true });

export const Order = mongoose.model('Order', orderSchema);
