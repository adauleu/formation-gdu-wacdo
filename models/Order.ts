import mongoose from "mongoose";
import { calculateTotalPrice } from "../utils/price.ts";

export const statuses = ['pending', 'ready', 'delivered'] as const;

export interface IOrderItem {
    type: 'menu' | 'product';
    refId: mongoose.Types.ObjectId;
    price: number;
    quantity: number;
}

export interface IOrder {
    items: mongoose.Types.ObjectId[];
    status: (typeof statuses)[number];
    createdBy: mongoose.Types.ObjectId;
    preparedBy?: mongoose.Types.ObjectId;
    totalPrice: number;
    createdAt?: Date;
    updatedAt?: Date;
}

const orderItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    menuId: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu' },
    quantity: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
    items: [orderItemSchema],
    status: { type: String, enum: statuses, default: 'pending' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    preparedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    totalPrice: { type: Number, required: true },
}, { timestamps: true, toObject: { virtuals: true }, toJSON: { virtuals: true } });

// auto-populate price for queries
function autoPopulateItems(this: any, next: any) {
    this.populate('items.productId', 'name price');
    this.populate('items.menuId', 'name price');
    next();
}
orderSchema.pre('find', autoPopulateItems);
orderSchema.pre('save', autoPopulateItems);
orderSchema.pre('findOne', autoPopulateItems);
orderSchema.pre('findOneAndUpdate', autoPopulateItems);

export const Order = mongoose.model<IOrder>('Order', orderSchema);
