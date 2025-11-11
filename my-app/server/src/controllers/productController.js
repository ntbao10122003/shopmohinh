import { Product } from '../models/Product.js'
import {
  ok,
  created,
  notFound,
  badRequest,
  serverError
} from '../utils/apiResponse.js'

/**
 * Format price string to number
 * @param {string|number} price - The price to format
 * @returns {number} Formatted price as number
 */
function formatPrice(price) {
  if (price === undefined || price === null) return 0;
  if (typeof price === 'number') return price;
  
  // Remove all non-numeric characters except decimal point
  const numericString = String(price)
    .replace(/[^\d,.]/g, '')  // Remove all non-numeric except , and .
    .replace(/\./g, '')       // Remove thousand separators (.)
    .replace(',', '.');        // Convert decimal comma to dot
    
  const result = parseFloat(numericString);
  return isNaN(result) ? 0 : result;
}

/**
 * GET /api/products
 * Lấy tất cả sản phẩm (có thể thêm filter/pagination trong tương lai)
 */
export async function getProducts(req, res) {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).lean()
    return ok(res, products.map(normalizeLean))
  } catch (err) {
    return serverError(res, err)
  }
}

/**
 * GET /api/products/category/:category
 * Get products by category
 */
export async function getProductsByCategory(req, res) {
  try {
    const { category } = req.params;
    
    if (!category) {
      return badRequest(res, 'Category is required');
    }

    const products = await Product.find({ category }).sort({ createdAt: -1 }).lean();
    return ok(res, products.map(normalizeLean));
  } catch (err) {
    return serverError(res, err);
  }
}

/**
 * GET /api/products/:id
 */
export async function getProductById(req, res) {
  try {
    const product = await Product.findById(req.params.id).lean()
    if (!product) {
      return notFound(res, 'Product not found')
    }
    return ok(res, normalizeLean(product))
  } catch (err) {
    return badRequest(res, 'Invalid product id')
  }
}

/**
 * POST /api/products
 * Body: { name, images, price, priceOld, description, quantity, sku }
 */
export async function createProduct(req, res) {
  try {
    const {
      name,
      images = [],
      price,
      priceOld,
      description = '',
      quantity,
      category,
      sku
    } = req.body;

    // Format prices
    const formattedPrice = formatPrice(price);
    const formattedPriceOld = priceOld ? formatPrice(priceOld) : 0;

    // check input cơ bản (mini validation)
    if (!name || price == null || quantity == null || !sku || !category) {
      return badRequest(res, 'Missing required fields')
    }

    const newProduct = await Product.create({
      name,
      images,
      price: formattedPrice,
      priceOld: formattedPriceOld,
      description,
      quantity,
      category,
      sku
    })

    return created(res, newProduct.toJSON(), 'Product created')
  } catch (err) {
    // ví dụ lỗi trùng SKU hoặc validate fail từ mongoose
    return badRequest(res, err.message)
  }
}

/**
 * PUT /api/products/:id
 * Cập nhật full (bắt buộc gửi đủ field)
 */
export async function updateProduct(req, res) {
  try {
    const {
      name,
      images = [],
      price,
      priceOld,
      description = '',
      quantity,
      category,
      sku
    } = req.body;

    // Format prices
    const formattedPrice = formatPrice(price);
    const formattedPriceOld = priceOld ? formatPrice(priceOld) : 0;

    if (!name || price == null || quantity == null || !sku || !category) {
      return badRequest(res, 'Missing required fields')
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { 
        name, 
        images, 
        price: formattedPrice, 
        priceOld: formattedPriceOld, 
        description, 
        quantity, 
        category, 
        sku 
      },
      { new: true, runValidators: true }
    ).lean()

    if (!updated) {
      return notFound(res, 'Product not found')
    }

    return ok(res, normalizeLean(updated), 'Product updated')
  } catch (err) {
    return badRequest(res, err.message)
  }
}

/**
 * PATCH /api/products/:id
 * Cập nhật 1 phần (chỉ gửi field muốn đổi)
 */
export async function patchProduct(req, res) {
  try {
    const patchData = { ...req.body };
    
    // Format prices if they exist in the patch data
    if (patchData.price !== undefined) {
      patchData.price = formatPrice(patchData.price);
    }
    if (patchData.priceOld !== undefined) {
      patchData.priceOld = patchData.priceOld ? formatPrice(patchData.priceOld) : 0;
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      patchData,
      { new: true, runValidators: true }
    ).lean()

    if (!updated) {
      return notFound(res, 'Product not found')
    }

    return ok(res, normalizeLean(updated), 'Product patched')
  } catch (err) {
    return badRequest(res, err.message)
  }
}

/**
 * DELETE /api/products/:id
 */
export async function deleteProduct(req, res) {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id).lean()
    if (!deleted) {
      return notFound(res, 'Product not found')
    }
    return ok(res, { id: req.params.id }, 'Product deleted')
  } catch (err) {
    return badRequest(res, 'Invalid product id')
  }
}

/**
 * Format number with commas as thousand separators
 * @param {number} num - The number to format
 * @returns {string} Formatted number with commas
 */
function formatNumberWithCommas(num) {
  if (num === undefined || num === null) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/* helper: vì .lean() trả object thường, không có toJSON(), nên mình map thủ công giống schema.toJSON */
function normalizeLean(doc) {
  if (!doc) return doc;
  
  // Format prices with commas for display
  const formattedPrice = formatNumberWithCommas(doc.price);
  const formattedPriceOld = doc.priceOld ? formatNumberWithCommas(doc.priceOld) : '0';
  
  return {
    id: String(doc._id),
    name: doc.name,
    images: doc.images,
    price: doc.price,          // Keep original number for calculations
    priceDisplay: formattedPrice, // Add formatted price for display
    priceOld: doc.priceOld,    // Keep original number for calculations
    priceOldDisplay: doc.priceOld ? formattedPriceOld : null, // Add formatted priceOld for display
    description: doc.description,
    quantity: doc.quantity,
    sku: doc.sku,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    category: doc.category
  };
}
