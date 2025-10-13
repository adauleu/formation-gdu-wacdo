import type { Request, Response } from 'express';
import { Product } from '../models/Product.ts';
import mongoose from 'mongoose';

export async function getProducts(req: Request, res: Response) {
    try {
        const projects = await Product.find({}, 'name description').sort({ createdAt: -1 });
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving products', error });
    }
}

export async function getProductById(req: Request, res: Response) {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid product ID' });
    }

    try {
        const product = await Product.findById(id).select('name description price image isAvailable');
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving product', error });
    }
}


export async function createProduct(req: Request, res: Response) {
    try {
        const { name, description, price, available } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }
        if (!price) {
            return res.status(400).json({ message: 'Price is required' });
        }
        const existingProduct = await Product.findOne({ name });
        if (existingProduct) {
            return res.status(409).json({ message: 'This product already exists' });
        }
        const image = req.file ? req.file.path : undefined;

        const newProduct = new Product({
            name,
            description,
            price,
            image,
            available
        });

        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        res.status(500).json({ message: 'Error creating product', error });
    }
}