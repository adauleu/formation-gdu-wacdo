import mongoose from "mongoose";
import { calculateTotalPrice } from "../utils/price.ts";

export const statuses = ['pending', 'ready', 'delivered'] as const;

export interface IOrder {
    products?: mongoose.Types.ObjectId[] | any[];
    menus?: mongoose.Types.ObjectId[] | any[];
    status?: (typeof statuses)[number];
    author?: mongoose.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

const orderSchema = new mongoose.Schema({
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    menus: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Menu' }],
    status: { type: String, enum: statuses, default: 'pending' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true, toObject: { virtuals: true }, toJSON: { virtuals: true } });

// auto-populate price for queries
function autoPopulatePrices(this: any, next: any) {
    this.populate('products', 'price')
        .populate('menus', 'price');
    next();
}
orderSchema.pre('find', autoPopulatePrices);
orderSchema.pre('findOne', autoPopulatePrices);
orderSchema.pre('findOneAndUpdate', autoPopulatePrices);

orderSchema.virtual('totalPrice').get(function (this: any) {
    // Grâce au middleware 'pre' au dessus, les prix sont garantis d'être renseignés.
    const products = this.products || [];
    const menus = this.menus || [];

    return calculateTotalPrice(products, menus);
});

export const Order = mongoose.model<IOrder>('Order', orderSchema);
