import { Menu } from '../models/Menu.js'
import {
  ok,
  created,
  notFound,
  badRequest,
  serverError
} from '../utils/apiResponse.js'

/**
 * GET /api/v1/menus
 * Lấy toàn bộ menu
 */
export async function getMenus(req, res) {
  try {
    const menus = await Menu.find().sort({ createdAt: -1 }).lean()
    return ok(res, menus)
  } catch (err) {
    return serverError(res, err)
  }
}

/**
 * GET /api/v1/menus/:slug
 * Lấy menu theo slug
 */
export async function getMenuBySlug(req, res) {
  try {
    const { slug } = req.params
    const menu = await Menu.findOne({ slug }).lean()
    if (!menu) return notFound(res, `Menu "${slug}" not found`)
    return ok(res, menu)
  } catch (err) {
    return serverError(res, err)
  }
}

/**
 * POST /api/v1/menus
 * Tạo menu mới
 * Body: { slug, title?, items? }
 */
export async function createMenu(req, res) {
  try {
    const { slug, title = '', logo = '', items = [] } = req.body
    if (!slug) return badRequest(res, 'Slug is required')

    const exists = await Menu.findOne({ slug })
    if (exists) return badRequest(res, 'Menu slug already exists')

    const newMenu = await Menu.create({ slug, title, logo, items })
    return created(res, newMenu, 'Menu created')
  } catch (err) {
    return badRequest(res, err.message)
  }
}

/**
 * PUT /api/v1/menus/:slug
 * Cập nhật toàn bộ menu theo slug
 * Body: { title?, items? }
 */
export async function updateMenu(req, res) {
  try {
    const { slug } = req.params
    const { title, logo, items } = req.body

    const updated = await Menu.findOneAndUpdate(
      { slug },
      { title, logo, items },
      { new: true, runValidators: true }
    )

    if (!updated) return notFound(res, `Menu "${slug}" not found`)
    return ok(res, updated, 'Menu updated')
  } catch (err) {
    return badRequest(res, err.message)
  }
}

/**
 * PATCH /api/v1/menus/:slug
 * Cập nhật 1 phần menu
 */
export async function patchMenu(req, res) {
  try {
    const { slug } = req.params
    const patchData = req.body

    const updated = await Menu.findOneAndUpdate(
      { slug },
      patchData,
      { new: true, runValidators: true }
    )

    if (!updated) return notFound(res, `Menu "${slug}" not found`)
    return ok(res, updated, 'Menu patched')
  } catch (err) {
    return badRequest(res, err.message)
  }
}

/**
 * DELETE /api/v1/menus/:slug
 * Xoá menu theo slug
 */
export async function deleteMenu(req, res) {
  try {
    const { slug } = req.params
    const deleted = await Menu.findOneAndDelete({ slug })
    if (!deleted) return notFound(res, `Menu "${slug}" not found`)
    return ok(res, { slug }, 'Menu deleted')
  } catch (err) {
    return badRequest(res, err.message)
  }
}
