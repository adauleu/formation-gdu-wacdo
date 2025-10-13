import express from 'express';
import { createOrder, getOrderById, getOrders, updateOrderStatus } from '../controllers/orders.controller.ts';
import { authMiddleware } from '../middleware/auth.ts';

const router: express.Router = express.Router();

router.use(authMiddleware)
router.get('/', getOrders);
router.get('/:id', getOrderById);
router.post('/', createOrder);
router.put('/', updateOrderStatus);
export default router;