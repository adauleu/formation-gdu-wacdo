import express from 'express';
import { createOrder, getOrderById, getOrders, updateOrderStatus } from '../controllers/orders.controller.ts';
import { authMiddleware } from '../middleware/auth.ts';
import { hasOneOfRole, hasRole } from '../middleware/role.ts';

const router: express.Router = express.Router();

router.use(authMiddleware)
router.get('/', hasRole('préparateur'), getOrders);
router.get('/:id', hasRole('préparateur'), getOrderById);
router.post('/', hasRole('accueil'), createOrder);
router.patch('/:id', hasOneOfRole(['accueil', 'préparateur']), updateOrderStatus);
export default router;