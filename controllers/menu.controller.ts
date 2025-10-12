import type { Request, Response } from 'express';
import { Menu } from '../models/Menu.ts';
import mongoose from 'mongoose';
import { Product } from '../models/Product.ts';

export async function getMenus(req: Request, res: Response) {
    try {
        const menus = await Menu.find({}, 'name price').sort({ createdAt: -1 });
        res.status(200).json(menus);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving menus', error });
    }
}

export async function getMenuById(req: Request, res: Response) {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid menu ID' });
    }

    try {
        const product = await Product.findById(id).select('name products price').populate('products', 'name price');
        if (!product) {
            return res.status(404).json({ message: 'Menu not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving menu', error });
    }
}


export async function createMenu(req: Request, res: Response) {
    try {
        const { name, products, price } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }
        if (!products || !Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ message: 'Products list is required' });
        }
        if (!price) {
            return res.status(400).json({ message: 'Price is required' });
        }
        const image = req.file ? req.file.path : undefined;


        const newProduct = new Menu({
            name,
            products,
            price,
        });

        const savedMenu = await newProduct.save();
        res.status(201).json(savedMenu);
    } catch (error) {
        res.status(500).json({ message: 'Error creating menu', error });
    }
}