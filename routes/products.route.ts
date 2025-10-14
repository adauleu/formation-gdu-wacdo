import express from 'express';
import { getProducts, createProduct, getProductById } from '../controllers/products.controller.ts';
import { authMiddleware } from '../middleware/auth.ts';
import { hasRole } from '../middleware/role.ts';

const router: express.Router = express.Router();

router.use(authMiddleware)
router.use(hasRole('admin'))
router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', createProduct);
export default router;