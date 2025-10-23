"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Menu = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const menuSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    products: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Product', required: true }],
    price: { type: Number, required: true },
}, { timestamps: true });
exports.Menu = mongoose_1.default.model('Menu', menuSchema);
