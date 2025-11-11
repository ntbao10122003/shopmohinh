import express from 'express';
import * as galleryController from '../../controllers/galleryController.js';
import upload from '../../utils/multer.js';
import { authMiddleware } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', galleryController.getAllGallery);
router.get('/:id', galleryController.getGalleryImage);

// Protected routes (require authentication)
router.use(authMiddleware);

// Admin-only routes

router.post(
  '/',
  upload.single('image'),
  galleryController.createGalleryImage
);

router.patch(
  '/:id',
  upload.single('image'),
  galleryController.updateGalleryImage
);

router.delete('/:id', galleryController.deleteGalleryImage);
router.patch('/:id/toggle-status', galleryController.toggleGalleryStatus);

export default router;
