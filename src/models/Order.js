"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = exports.statuses = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.statuses = ['pending', 'ready', 'delivered'];
const orderItemSchema = new mongoose_1.default.Schema({
    productId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Product' },
    menuId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Menu' },
    quantity: { type: Number, required: true },
});
const orderSchema = new mongoose_1.default.Schema({
    items: [orderItemSchema],
    status: { type: String, enum: exports.statuses, default: 'pending' },
    createdBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    preparedBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
    totalPrice: { type: Number, required: true },
}, { timestamps: true, toObject: { virtuals: true }, toJSON: { virtuals: true } });
// auto-populate price for queries
function autoPopulateItems(next) {
    this.populate('items.productId', 'name price');
    this.populate('items.menuId', 'name price');
    next();
}
orderSchema.pre('find', autoPopulateItems);
orderSchema.pre('save', autoPopulateItems);
orderSchema.pre('findOne', autoPopulateItems);
orderSchema.pre('findOneAndUpdate', autoPopulateItems);
exports.Order = mongoose_1.default.model('Order', orderSchema);
