import type { Response } from 'express';
import mongoose from 'mongoose';
import { type IOrder, Order, statuses, type IOrderItem } from '../models/Order';
import type { AuthRequest } from '../middleware/auth';
import type { JWTUser } from '../types';
import { Menu } from '../models/Menu';
import { Product } from '../models/Product';
import { calculateTotalPrice } from '../utils/price';

export async function getOrdersToPrepare(req: AuthRequest, res: Response) {
    try {
        const orders = await Order.find({ status: 'pending' }, 'items status createdBy, totalPrice')
            .sort({ createdAt: 1 });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving orders', error });
    }
}

export async function getOrderById(req: AuthRequest, res: Response) {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid order ID' });
    }

    try {
        const order = await Order.findById(id).select('items status createdBy totalPrice');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving order', error });
    }
}

export async function createOrder(req: AuthRequest, res: Response) {
    try {
        const { items, status } = req.body;
        const hasItems = items && Array.isArray(items) && items.length > 0;
        if (!hasItems) {
            return res.status(400).json({ message: 'Order is empty' });
        }

        const menuIds = items.filter(i => i.menuId).map(i => i.menuId);
        const productIds = items.filter(i => i.productId).map(i => i.productId);

        const [menus, products] = await Promise.all([
            Menu.find({ _id: { $in: menuIds } }),
            Product.find({ _id: { $in: productIds } })
        ]);

        const orderItems: IOrderItem[] = [];

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

        const newOrder = new Order<IOrder>({
            items,
            status,
            totalPrice: calculateTotalPrice(orderItems),
            createdBy: req.user?.id as JWTUser['id'],
        });

        const savedOrder = await newOrder.save();
        res.status(201).json(savedOrder);
    } catch (error: any) {
        console.error('Error creating order', error);
        res.status(500).json({ message: 'Error creating order', error: error.message });
    }
}

export async function updateOrderStatus(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { status } = req.body;
    const role = req.user?.role as JWTUser['role'];
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid order ID' });
    }
    if (!status) {
        return res.status(400).json({ message: 'Status is required' });
    }
    if (!statuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
    }
    const validatedStatus = status as typeof statuses[number];

    if (role === 'accueil' && validatedStatus === 'ready') {
        return res.status(403).json({ message: 'You are not allowed to change the status to this value' });
    }
    if (role === 'préparateur' && validatedStatus !== 'ready') {
        return res.status(403).json({ message: 'You are not allowed to change the status to this value' });
    }

    try {
        const order = await Order.findById(id);
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
    } catch (error) {
        console.error('Error updating order', error);
        res.status(500).json({ message: 'Error updating order', error });
    }
}

export async function deleteOrder(req: AuthRequest, res: Response) {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid order ID' });
    }

    try {
        const order = await Order.findByIdAndDelete(id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        if (!order.createdBy.equals(req.user?.id)) {
            return res.status(403).json({ message: 'You are not allowed to delete this order' });
        }
        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting order', error });
    }
}