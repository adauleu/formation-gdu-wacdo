import express from 'express';
import { createOrder, getOrderById, getOrders, updateOrderStatus } from '../controllers/order.controller.ts';

const router: express.Router = express.Router();

router.get('/', getOrders);
router.get('/:id', getOrderById);
router.post('/', createOrder);
router.put('/', updateOrderStatus);
export default router;