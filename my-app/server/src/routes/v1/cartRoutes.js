import { Router } from 'express';
import {
  getCart,
  addToCart,
  setItemQty,
  removeItem,
  clearCart,
  applyCoupon,
  mergeGuestCart,
  checkout
} from '../../controllers/cartController.js';

const router = Router();

router.get('/', getCart);
router.post('/add', addToCart);
router.patch('/item', setItemQty);
router.delete('/item', removeItem);
router.post('/clear', clearCart);
router.post('/apply-coupon', applyCoupon);
router.post('/merge', mergeGuestCart);
router.post('/checkout', checkout);

export default router;
