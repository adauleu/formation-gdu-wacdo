"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMenu = exports.updateMenu = exports.createMenu = exports.getMenuById = exports.getMenus = void 0;
const Menu_1 = require("../models/Menu");
const mongoose_1 = __importDefault(require("mongoose"));
async function getMenus(req, res) {
    try {
        const menus = await Menu_1.Menu.find({}, 'name price').populate('products', 'name').sort({ createdAt: -1 });
        res.status(200).json(menus);
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving menus', error });
    }
}
exports.getMenus = getMenus;
async function getMenuById(req, res) {
    const { id } = req.params;
    if (!id || !mongoose_1.default.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid menu ID' });
    }
    try {
        const menu = await Menu_1.Menu.findById(id).select('name products price').populate('products', 'name');
        if (!menu) {
            return res.status(404).json({ message: 'Menu not found' });
        }
        res.status(200).json(menu);
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving menu', error });
    }
}
exports.getMenuById = getMenuById;
async function createMenu(req, res) {
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
        const newProduct = new Menu_1.Menu({
            name,
            products,
            price,
        });
        const savedMenu = await newProduct.save();
        res.status(201).json(savedMenu);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating menu', error: error.message });
    }
}
exports.createMenu = createMenu;
function updateMenu(req, res) {
    const { id } = req.params;
    if (!id || !mongoose_1.default.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid menu ID' });
    }
    const { name, products, price } = req.body;
    Menu_1.Menu.findByIdAndUpdate(id, { name, products, price }, { new: true }).then(updatedMenu => {
        if (!updatedMenu) {
            return res.status(404).json({ message: 'Menu not found' });
        }
        res.status(200).json(updatedMenu);
    }).catch(error => {
        res.status(500).json({ message: 'Error updating menu', error });
    });
}
exports.updateMenu = updateMenu;
async function deleteMenu(req, res) {
    const { id } = req.params;
    if (!id || !mongoose_1.default.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid menu ID' });
    }
    try {
        const deletedMenu = await Menu_1.Menu.findByIdAndDelete(id);
        if (!deletedMenu) {
            return res.status(404).json({ message: 'Menu not found' });
        }
        res.status(200).json({ message: 'Menu deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting menu', error });
    }
}
exports.deleteMenu = deleteMenu;
