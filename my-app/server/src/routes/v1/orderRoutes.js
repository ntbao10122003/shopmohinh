import express from 'express';
import { getOrders, getOrder, getMyOrders, updateOrder, deleteOrder } from '../../controllers/orderController.js';

const router = express.Router();

// Public routes
router.get('/', getOrders);
router.get('/:id', getOrder);
router.get('/my-orders', getMyOrders);

// Protected routes (add authentication middleware if needed)
router.patch('/:id', updateOrder);
router.delete('/:id', deleteOrder);

export default router;
