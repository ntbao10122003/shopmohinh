// src/routes/v1/adminCouponRoutes.js
import { Router } from 'express';
import {
  createCoupon,
  updateCoupon,
  listCoupons,
  deleteCoupon
} from '../../controllers/couponController.js';

const router = Router();

router.post('/', createCoupon);
router.patch('/:id', updateCoupon);
router.get('/', listCoupons);
router.delete('/:id', deleteCoupon);

export default router;
