import express from 'express';
import { getProducts, createProduct, getProductById } from '../controllers/product.controller.ts';

const router: express.Router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', createProduct);
export default router;