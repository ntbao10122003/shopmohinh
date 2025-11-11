import express from 'express';
import * as postController from '../../controllers/postController.js';
import { authMiddleware } from '../../middleware/authMiddleware.js';
import  upload  from '../../utils/multer.js';

const router = express.Router();

// Public routes
router.get('/', postController.getAllPosts);
router.get('/category/:category', postController.getPostsByCategory);
router.get('/:id', postController.getPost);

// Protected routes (require authentication)
router.use(authMiddleware);

// Admin-only routes
// router.use(restrictTo('admin'));

router.post(
  '/',
  upload.single('coverImage'),
  postController.createPost
);

router
  .route('/:id')
  .patch(
    upload.single('coverImage'),
    postController.updatePost
  )
  .delete(postController.deletePost);

export default router;
