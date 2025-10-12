import type { Request, Response } from 'express';
import { Menu } from '../models/Menu.ts';
import mongoose from 'mongoose';
import { Order } from '../models/Order.ts';

export async function getOrders(req: Request, res: Response) {
    try {
        const menus = await Menu.find({}, 'name price').sort({ createdAt: -1 });
        res.status(200).json(menus);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving menus', error });
    }
}

export async function getOrderById(req: Request, res: Response) {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid order ID' });
    }

    try {
        const product = await Order.findById(id).select('products menus statuses').populate('products menus');
        if (!product) {
            return res.status(404).json({ message: 'Ordfer not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving order', error });
    }
}

export async function createOrder(req: Request, res: Response) {
    try {
        const { menus, products, status } = req.body;
        const hasMenus = menus && Array.isArray(menus) && menus.length > 0;
        const hasProducts = products && Array.isArray(products) && products.length > 0;
        if (!hasMenus && !hasProducts) {
            return res.status(400).json({ message: 'Order is empty' });
        }
        const newOrder = new Order({
            menus,
            products,
            status,
        });

        const savedOrder = await newOrder.save();
        res.status(201).json(savedOrder);
    } catch (error) {
        res.status(500).json({ message: 'Error creating order', error });
    }
}

export async function updateOrderStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { status } = req.body;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid project ID' });
    }
    if (!status) {
        return res.status(400).json({ message: 'Status is required' });
    }
    if (!['pending', 'ready', 'delivered'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
    }

    try {
        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
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