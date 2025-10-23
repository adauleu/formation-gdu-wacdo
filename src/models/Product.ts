import mongoose from "mongoose";

export interface IProduct {
    name: string;
    description?: string;
    price: number;
    image?: string;
    isAvailable?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    image: { type: String },
    isAvailable: { type: Boolean, default: true },
}, { timestamps: true });


export const Product = mongoose.model<IProduct>('Product', productSchema);
