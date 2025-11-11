import { Coupon } from '../models/Coupon.js';

export async function validateAndPriceCoupon({ code, cart, userId }) {
  const now = new Date();
  const coupon = await Coupon.findOne({ code: String(code || '').trim().toUpperCase(), active: true });
  if (!coupon) return { valid: false, reason: 'Mã không tồn tại hoặc đã tắt', discount: 0, coupon: null };

  // Thời gian
  if (coupon.startsAt && now < coupon.startsAt) return { valid: false, reason: 'Chưa tới thời gian áp dụng', discount: 0, coupon: null };
  if (coupon.endsAt && now > coupon.endsAt) return { valid: false, reason: 'Đã hết hạn', discount: 0, coupon: null };

  // Giới hạn lượt
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit)
    return { valid: false, reason: 'Hết lượt sử dụng', discount: 0, coupon: null };

  // Yêu cầu đăng nhập/đơn đầu tiên (tuỳ bạn bật)
  if (coupon.requireLoggedIn && !userId) return { valid: false, reason: 'Mã yêu cầu đăng nhập', discount: 0, coupon: null };
  // if (coupon.onlyFirstOrder && userId) { ... }

  // *** QUAN TRỌNG: dùng tổng giỏ (subtotal) thay vì lọc theo SKU/Category ***
  const subTotalAll = Number(cart.subtotal) || 0;

  // minSubtotal: hiểu là 200.000₫ (nếu bạn nhập "200" thì đổi thành 200000 khi tạo coupon)
  if (coupon.minSubtotal != null && subTotalAll < coupon.minSubtotal) {
    return { valid: false, reason: `Chưa đạt tối thiểu ${coupon.minSubtotal}`, discount: 0, coupon: null };
  }
  if (coupon.maxSubtotal != null && subTotalAll > coupon.maxSubtotal) {
    return { valid: false, reason: `Vượt mức tối đa ${coupon.maxSubtotal}`, discount: 0, coupon: null };
  }

  // Tính discount
  let discount = 0;
  if (coupon.discountType === 'percent') {
    discount = Math.round(subTotalAll * (coupon.discountValue / 100));
    if (coupon.maxDiscount != null) discount = Math.min(discount, coupon.maxDiscount);
  } else {
    discount = Math.min(coupon.discountValue, subTotalAll);
  }
  if (discount <= 0) return { valid: false, reason: 'Mã giảm giá không tạo ra khuyến mãi', discount: 0, coupon: null };

  return { valid: true, reason: null, discount, coupon };
}
