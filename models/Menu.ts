import mongoose from "mongoose";

export interface IMenu {
    name: string;
    products: mongoose.Types.ObjectId[];
    price: number;
    createdAt?: Date;
    updatedAt?: Date;
}

const menuSchema = new mongoose.Schema({
    name: { type: String, required: true },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }],
    price: { type: Number, required: true },
}, { timestamps: true });

export const Menu = mongoose.model<IMenu>('Menu', menuSchema);
