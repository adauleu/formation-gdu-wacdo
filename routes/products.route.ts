import express from 'express';
import { getProducts, createProduct, getProductById, deleteProduct, updateProduct } from '../controllers/products.controller.ts';
import { authMiddleware } from '../middleware/auth.ts';
import { hasRole } from '../middleware/role.ts';
import { upload } from '../middleware/multer.ts';

const router: express.Router = express.Router();

router.use(authMiddleware)
router.use(hasRole('admin'))

router.get('/', getProducts);
router.get('/:id', getProductById);
router.put('/:id', upload.single('image'), updateProduct);
router.post('/', upload.single('image'), createProduct);
router.delete('/:id', deleteProduct);
export default router;