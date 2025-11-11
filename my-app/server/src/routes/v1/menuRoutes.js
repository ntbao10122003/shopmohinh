import { Router } from 'express'
import {
  getMenus,
  getMenuBySlug,
  createMenu,
  updateMenu,
  patchMenu,
  deleteMenu
} from '../../controllers/menuController.js'

const router = Router()

// Lấy tất cả menu
router.get('/', getMenus)

// Lấy menu theo slug
router.get('/:slug', getMenuBySlug)

// Tạo menu mới
router.post('/', createMenu)

// Cập nhật toàn bộ menu
router.put('/:slug', updateMenu)

// Cập nhật 1 phần menu
router.patch('/:slug', patchMenu)

// Xoá menu
router.delete('/:slug', deleteMenu)

export default router
