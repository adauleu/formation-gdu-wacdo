"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateTotalPrice = void 0;
function calculateTotalPrice(items) {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
exports.calculateTotalPrice = calculateTotalPrice;
