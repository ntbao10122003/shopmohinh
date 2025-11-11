// src/routes/v1/productRoutes.js
import { Router } from 'express'
import { authMiddleware } from '../../middleware/authMiddleware.js'
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  patchProduct,
  deleteProduct,
  getProductsByCategory
} from '../../controllers/productController.js'

const router = Router()

router.get('/', getProducts)
router.get('/category/:category', getProductsByCategory)
router.get('/:id', getProductById)
router.post('/', createProduct)
router.put('/:id', updateProduct)
router.patch('/:id', patchProduct)
router.delete('/:id', deleteProduct)
router.use(authMiddleware)

export default router
