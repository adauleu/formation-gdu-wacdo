"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrder = exports.updateOrderStatus = exports.createOrder = exports.getOrderById = exports.getOrdersToPrepare = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Order_1 = require("../models/Order");
const Menu_1 = require("../models/Menu");
const Product_1 = require("../models/Product");
const price_1 = require("../utils/price");
async function getOrdersToPrepare(req, res) {
    try {
        const orders = await Order_1.Order.find({ status: 'pending' }, 'items status createdBy, totalPrice')
            .sort({ createdAt: 1 });
        res.status(200).json(orders);
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving orders', error });
    }
}
exports.getOrdersToPrepare = getOrdersToPrepare;
async function getOrderById(req, res) {
    const { id } = req.params;
    if (!id || !mongoose_1.default.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid order ID' });
    }
    try {
        const order = await Order_1.Order.findById(id).select('items status createdBy totalPrice');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json(order);
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving order', error });
    }
}
exports.getOrderById = getOrderById;
async function createOrder(req, res) {
    try {
        const { items, status } = req.body;
        const hasItems = items && Array.isArray(items) && items.length > 0;
        if (!hasItems) {
            return res.status(400).json({ message: 'Order is empty' });
        }
        const menuIds = items.filter(i => i.menuId).map(i => i.menuId);
        const productIds = items.filter(i => i.productId).map(i => i.productId);
        const [menus, products] = await Promise.all([
            Menu_1.Menu.find({ _id: { $in: menuIds } }),
            Product_1.Product.find({ _id: { $in: productIds } })
        ]);
        const orderItems = [];
        for (const item of items) {
            if (item.menuId) {
                const menu = menus.find(m => m._id.equals(item.menuId));
                if (!menu) {
                    return res.status(400).json({ message: `Unable to find menu: ${item.menuId}` });
                }
                orderItems.push({
                    type: "menu",
                    refId: menu._id,
                    price: menu.price,
                    quantity: item.quantity
                });
                continue;
            }
            if (item.productId) {
                const product = products.find(p => p._id.equals(item.productId));
                if (!product) {
                    return res.status(400).json({ message: `Unable to find product: ${item.productId}` });
                }
                if (!product.isAvailable) {
                    return res.status(400).json({ message: `Product not available: ${product.name}` });
                }
                orderItems.push({
                    type: "product",
                    refId: product._id,
                    price: product.price,
                    quantity: item.quantity
                });
                continue;
            }
            return res.status(400).json({ message: "Each item must include a productId or a menuId." });
        }
        const newOrder = new Order_1.Order({
            items,
            status,
            totalPrice: (0, price_1.calculateTotalPrice)(orderItems),
            createdBy: req.user?.id,
        });
        const savedOrder = await newOrder.save();
        res.status(201).json(savedOrder);
    }
    catch (error) {
        console.error('Error creating order', error);
        res.status(500).json({ message: 'Error creating order', error: error.message });
    }
}
exports.createOrder = createOrder;
async function updateOrderStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;
    const role = req.user?.role;
    if (!id || !mongoose_1.default.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid order ID' });
    }
    if (!status) {
        return res.status(400).json({ message: 'Status is required' });
    }
    if (!Order_1.statuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
    }
    const validatedStatus = status;
    if (role === 'accueil' && validatedStatus === 'ready') {
        return res.status(403).json({ message: 'You are not allowed to change the status to this value' });
    }
    if (role === 'préparateur' && validatedStatus !== 'ready') {
        return res.status(403).json({ message: 'You are not allowed to change the status to this value' });
    }
    try {
        const order = await Order_1.Order.findById(id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        if (role === 'accueil' && order.status === 'pending') {
            return res.status(400).json({ message: 'Order must be ready before being delivered' });
        }
        if (status) {
            order.status = status;
        }
        const updatedOrder = await order.save();
        res.status(200).json(updatedOrder);
    }
    catch (error) {
        console.error('Error updating order', error);
        res.status(500).json({ message: 'Error updating order', error });
    }
}
exports.updateOrderStatus = updateOrderStatus;
async function deleteOrder(req, res) {
    const { id } = req.params;
    if (!id || !mongoose_1.default.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid order ID' });
    }
    try {
        const order = await Order_1.Order.findByIdAndDelete(id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        if (!order.createdBy.equals(req.user?.id)) {
            return res.status(403).json({ message: 'You are not allowed to delete this order' });
        }
        res.status(200).json({ message: 'Order deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting order', error });
    }
}
exports.deleteOrder = deleteOrder;
