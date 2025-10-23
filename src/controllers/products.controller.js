"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getProducts = void 0;
const Product_1 = require("../models/Product");
const mongoose_1 = __importDefault(require("mongoose"));
async function getProducts(req, res) {
    try {
        const products = await Product_1.Product.find({}, 'name description price isAvailable').sort({ createdAt: -1 });
        res.status(200).json(products);
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving products', error });
    }
}
exports.getProducts = getProducts;
async function getProductById(req, res) {
    const { id } = req.params;
    if (!id || !mongoose_1.default.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid product ID' });
    }
    try {
        const product = await Product_1.Product.findById(id).select('name description price image isAvailable');
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving product', error });
    }
}
exports.getProductById = getProductById;
async function createProduct(req, res) {
    try {
        const { name, description, price, isAvailable } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }
        if (!price) {
            return res.status(400).json({ message: 'Price is required' });
        }
        const existingProduct = await Product_1.Product.findOne({ name });
        if (existingProduct) {
            return res.status(409).json({ message: 'This product already exists' });
        }
        const image = req.file ? req.file.path : undefined;
        const newProduct = new Product_1.Product({
            name,
            description,
            price,
            image,
            isAvailable
        });
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating product', error });
    }
}
exports.createProduct = createProduct;
async function updateProduct(req, res) {
    const { id } = req.params;
    if (!id || !mongoose_1.default.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid product ID' });
    }
    try {
        const product = await Product_1.Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        const { name, description, price, isAvailable } = req.body;
        if (name)
            product.name = name;
        if (description)
            product.description = description;
        if (price)
            product.price = price;
        if (isAvailable !== undefined)
            product.isAvailable = isAvailable;
        if (req.file)
            product.image = req.file.path;
        const updatedProduct = await product.save();
        res.status(200).json(updatedProduct);
    }
    catch (error) {
        console.error('Error updating product', error);
        res.status(500).json({ message: 'Error updating product', error });
    }
}
exports.updateProduct = updateProduct;
async function deleteProduct(req, res) {
    const { id } = req.params;
    if (!id || !mongoose_1.default.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid product ID' });
    }
    try {
        const product = await Product_1.Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        await product.deleteOne();
        res.status(200).json({ message: 'Product deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting product', error);
        res.status(500).json({ message: 'Error deleting product', error });
    }
}
exports.deleteProduct = deleteProduct;
