// src/controllers/cartController.js
import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { validateAndPriceCoupon } from '../utils/coupon.js';

/** Tìm hoặc tạo cart theo user/cartToken */
async function findOrCreateCart({ userId, cartToken }) {
  let cart = null;
  if (userId) {
    cart = await Cart.findOne({ user: userId });
    if (cart) return cart;
  }
  if (cartToken) {
    cart = await Cart.findOne({ cartToken });
    if (cart) return cart;
  }
  return Cart.create({
    user: userId || null,
    cartToken: userId ? null : (cartToken || null),
    items: []
  });
}

/** Chuẩn hoá response cart + trả computedDiscount/totalPayable */
function cartResponsePlus(cart) {
  const json = cart.toJSON();
  const subtotal = cart.subtotal;
  const computedDiscount = Number(cart.computedDiscount || 0);
  const totalPayable = Math.max(subtotal - computedDiscount, 0);
  return {
    ...json,
    cartToken: cart.cartToken || null,
    subtotal,
    discount: cart.discount, // virtual cũ (nếu còn dùng), giữ nguyên để không phá FE cũ
    total: cart.total,       // virtual cũ
    computedDiscount,
    totalPayable
  };
}

/** Recalc coupon mỗi khi giỏ thay đổi */
async function recalcCoupon(cart, userId) {
  // Không có mã -> reset snapshot
  if (!cart.coupon?.code) {
    cart.computedDiscount = 0;
    cart.couponId = null;
    return;
  }

  const result = await validateAndPriceCoupon({
    code: cart.coupon.code,
    cart,
    userId
  });

  if (!result.valid) {
    cart.coupon = { code: null, discountType: null, discountValue: 0 };
    cart.couponId = null;
    cart.computedDiscount = 0;
  } else {
    cart.couponId = result.coupon._id;
    cart.computedDiscount = result.discount; // số tiền giảm thực tế theo điều kiện
  }
}

/** GET /api/v1/cart */
export const getCart = async (req, res) => {
  const cart = await findOrCreateCart({ userId: req.user?.id || null, cartToken: req.cartToken });

  // Luôn recalc để đảm bảo mã giảm giá còn hợp lệ (khi giá/tồn kho thay đổi)
  await recalcCoupon(cart, req.user?.id || null);
  await cart.save(); // optional, nhưng tốt để snapshot luôn

  return res.json({ success: true, data: cartResponsePlus(cart) });
};

/** POST /api/v1/cart/add  { productId, quantity } */
export const addToCart = async (req, res) => {
  const productId = String(req.body.productId || '').trim();
  const reqQty = Number.parseInt(req.body.quantity, 10);

  if (!productId || !Number.isInteger(reqQty) || reqQty <= 0) {
    return res.status(400).json({ success: false, message: 'productId/quantity không hợp lệ' });
  }

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });

  const stock = Number.isFinite(Number(product.quantity)) ? Number(product.quantity) : 0;
  if (stock <= 0) return res.status(400).json({ success: false, message: 'Sản phẩm tạm hết hàng' });

  const cart = await findOrCreateCart({ userId: req.user?.id || null, cartToken: req.cartToken });

  // Tìm item hiện có
  const idx = cart.items.findIndex(it => it.product.toString() === productId);
  const existingQty = idx > -1 ? Number(cart.items[idx].quantity) || 0 : 0;

  // Cộng dồn nhưng không vượt tồn kho
  const newQty = Math.min(existingQty + reqQty, Math.max(0, stock));

  if (idx > -1) {
    cart.items[idx].quantity = newQty;
  } else {
    cart.items.push({
      product: product._id,
      sku: product.sku || '',
      name: product.name,
      image: product.images?.[0] || '',
      price: Number(product.price) || 0,
      quantity: newQty
    });
  }

  // Recalc coupon sau khi items thay đổi
  await recalcCoupon(cart, req.user?.id || null);
  await cart.save();

  return res.json({ success: true, message: 'Đã thêm vào giỏ', data: cartResponsePlus(cart) });
};

/** PATCH /api/v1/cart/item  { productId, quantity } */
export const setItemQty = async (req, res) => {
  const productId = String(req.body.productId || '').trim();
  const qty = Number.parseInt(req.body.quantity, 10);

  if (!productId || !Number.isInteger(qty) || qty < 0) {
    return res.status(400).json({ success: false, message: 'payload không hợp lệ' });
  }

  const cart = await findOrCreateCart({ userId: req.user?.id || null, cartToken: req.cartToken });
  const idx = cart.items.findIndex(it => it.product.toString() === productId);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Không tìm thấy item trong giỏ' });

  if (qty === 0) {
    cart.items.splice(idx, 1);
  } else {
    const p = await Product.findById(productId);
    if (!p) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    const stock = Number.isFinite(Number(p.quantity)) ? Number(p.quantity) : 0;
    cart.items[idx].quantity = Math.min(qty, Math.max(0, stock));
  }

  await recalcCoupon(cart, req.user?.id || null);
  await cart.save();
  return res.json({ success: true, data: cartResponsePlus(cart) });
};

/** DELETE /api/v1/cart/item  { productId } */
export const removeItem = async (req, res) => {
  const productId = String(req.body.productId || '').trim();
  const cart = await findOrCreateCart({ userId: req.user?.id || null, cartToken: req.cartToken });

  cart.items = cart.items.filter(it => it.product.toString() !== productId);

  await recalcCoupon(cart, req.user?.id || null);
  await cart.save();

  return res.json({ success: true, message: 'Đã xoá item', data: cartResponsePlus(cart) });
};

/** POST /api/v1/cart/clear */
export const clearCart = async (_req, res) => {
  const cart = await findOrCreateCart({ userId: _req.user?.id || null, cartToken: _req.cartToken });
  cart.items = [];
  cart.coupon = { code: null, discountType: null, discountValue: 0 };
  cart.couponId = null;
  cart.computedDiscount = 0;

  await cart.save();
  return res.json({ success: true, message: 'Đã xoá toàn bộ giỏ', data: cartResponsePlus(cart) });
};

/** POST /api/v1/cart/apply-coupon { code } */
export const applyCoupon = async (req, res) => {
  const code = String(req.body.code || '').trim();
  if (!code) return res.status(400).json({ success: false, message: 'Thiếu mã giảm giá' });

  const cart = await findOrCreateCart({ userId: req.user?.id || null, cartToken: req.cartToken });

  // Đặt code thô (để utils tự validate + tính)
  cart.coupon = { code: code.toUpperCase() };

  await recalcCoupon(cart, req.user?.id || null);
  await cart.save();

  // Nếu sau recalc mã bị hủy -> báo lỗi
  if (!cart.coupon?.code) {
    return res.status(400).json({ success: false, message: 'Mã giảm giá không hợp lệ hoặc không áp dụng cho giỏ hiện tại' });
  }

  return res.json({ success: true, data: cartResponsePlus(cart) });
};

/** POST /api/v1/cart/merge { fromCartToken } (khi user login) */
/** POST /api/v1/cart/checkout - Checkout with customer info */
export const checkout = async (req, res) => {
  try {
    const { cartToken } = req.body;
    
    // Validate required fields
    const requiredFields = [
      'fullName', 'phone', 'province', 
      'district', 'address', 'cartToken'
    ];
    
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({
          success: false,
          message: `Vui lòng nhập ${field === 'fullName' ? 'họ tên' : field === 'phone' ? 'số điện thoại' : field === 'province' ? 'tỉnh/thành phố' : field === 'district' ? 'quận/huyện' : 'địa chỉ cụ thể'}`
        });
      }
    }

    // Find the cart
    const cart = await Cart.findOne({ cartToken }).populate('items.product');
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giỏ hàng',
      });
    }

    if (cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Giỏ hàng đang trống',
      });
    }

    // Calculate totals
    const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = cart.computedDiscount || 0;
    const total = Math.max(subtotal - discount, 0);

    // Create order
    const order = new Order({
      customer: {
        fullName: req.body.fullName,
        phone: req.body.phone,
        province: req.body.province,
        district: req.body.district,
        address: req.body.address,
        note: req.body.note || '',
      },
      items: cart.items.map(item => ({
        product: item.product._id,
        sku: item.sku,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
      })),
      subtotal,
      discount,
      total,
      cartToken: cart.cartToken,
      paymentMethod: req.body.paymentMethod || 'cod',
    });

    // Add coupon info if exists
    if (cart.coupon?.code) {
      order.coupon = {
        code: cart.coupon.code,
        discountType: cart.coupon.discountType,
        discountValue: cart.discountValue || 0,
      };
    }

    // Save the order first
    await order.save();

    try {
      // Lấy lại đơn hàng với thông tin đầy đủ
      const savedOrder = await Order.findById(order._id).lean();
      
      if (!savedOrder) {
        throw new Error('Không tìm thấy đơn hàng sau khi tạo');
      }

      // Trừ số lượng sản phẩm trong kho
      const bulkOps = cart.items.map(item => ({
        updateOne: {
          filter: { _id: item.product },
          update: { 
            $inc: { 
              quantity: -item.quantity,
              sold: item.quantity
            } 
          }
        }
      }));
      
      if (bulkOps.length > 0) {
        await Product.bulkWrite(bulkOps);
      }

      // Xóa giỏ hàng sau khi đặt hàng thành công
      await Cart.findByIdAndDelete(cart._id);

      // Tạo response với đầy đủ thông tin
      const responseOrder = {
        ...savedOrder,
        orderCode: savedOrder.orderCode,
        total: savedOrder.total,
        subtotal: savedOrder.subtotal,
        discount: savedOrder.discount || 0,
        totalPayable: savedOrder.totalPayable || savedOrder.total,
        status: savedOrder.status || 'pending',
        paymentMethod: savedOrder.paymentMethod || 'cod',
        customer: savedOrder.customer || {},
        items: (savedOrder.items || []).map(item => ({
          ...item,
          name: item.name || '',
          price: item.price || 0,
          image: item.image || '',
          qty: item.quantity || 1
        })),
        createdAt: savedOrder.createdAt,
        updatedAt: savedOrder.updatedAt
      };

      return res.status(200).json({
        success: true,
        message: 'Đặt hàng thành công!',
        order: responseOrder
      });
    } catch (error) {
      console.error('Error in checkout final steps:', error);
      throw error; // Let the outer catch handle it
    }
  } catch (error) {
    console.error('Checkout error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      keyPattern: error.keyPattern,
      keyValue: error.keyValue,
      errors: error.errors
    });
    
    // More specific error messages for common issues
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        error: Object.values(error.errors).map(e => e.message).join(', ')
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng đã tồn tại',
        error: error.message
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại sau.',
      // Only show detailed error in development
      ...(process.env.NODE_ENV === 'development' && {
        error: error.message,
        stack: error.stack
      })
    });
  }
};

/** POST /api/v1/cart/merge { fromCartToken } (khi user login) */
export const mergeGuestCart = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ success: false, message: 'Yêu cầu đăng nhập' });

  const fromCartToken = String(req.body.fromCartToken || '').trim();
  if (!fromCartToken) return res.status(400).json({ success: false, message: 'Thiếu fromCartToken' });

  const userCart = await findOrCreateCart({ userId, cartToken: null });
  const guestCart = await Cart.findOne({ cartToken: fromCartToken });

  if (guestCart) {
    // Gộp items (cộng dồn theo product)
    const map = new Map();
    for (const it of [...userCart.items, ...guestCart.items]) {
      const key = String(it.product);
      const prev = map.get(key);
      if (prev) {
        prev.quantity += Number(it.quantity) || 0;
        map.set(key, prev);
      } else {
        map.set(key, { ...it.toObject?.() ?? it });
      }
    }
    userCart.items = Array.from(map.values());

    // Clamp theo tồn kho hiện tại
    for (const it of userCart.items) {
      const p = await Product.findById(it.product);
      if (p) {
        const stock = Number.isFinite(Number(p.quantity)) ? Number(p.quantity) : 0;
        it.quantity = Math.min(Number(it.quantity) || 1, Math.max(0, stock));
      }
    }

    await guestCart.deleteOne();
  }

  await recalcCoupon(userCart, userId);
  await userCart.save();

  return res.json({ success: true, message: 'Đã merge giỏ khách vào giỏ user', data: cartResponsePlus(userCart) });
};
