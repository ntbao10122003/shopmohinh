import express from 'express';
import productRoutes from './v1/productRoutes.js';
import menuRoutes from './v1/menuRoutes.js';
import authRoutes from './v1/authRoutes.js';
import postRoutes from './v1/postRoutes.js';
import galleryRoutes from './v1/galleryRoutes.js';
import cartRoutes from './v1/cartRoutes.js';
import adminCouponRoutes from './v1/adminCouponRoutes.js';
import orderRoutes from './v1/orderRoutes.js';

const router = express.Router();

router.use('/v1/products', productRoutes);
router.use('/v1/menus', menuRoutes);
router.use('/v1/auth', authRoutes);
router.use('/v1/posts', postRoutes);
router.use('/v1/gallery', galleryRoutes);
router.use('/v1/cart', cartRoutes);
router.use('/v1/admin/coupons', adminCouponRoutes);
router.use('/v1/orders', orderRoutes);

export default router;
