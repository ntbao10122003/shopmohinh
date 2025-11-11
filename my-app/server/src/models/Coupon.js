import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },

  // kiểu giảm giá
  discountType: { type: String, enum: ['percent', 'amount'], required: true },
  discountValue: { type: Number, required: true, min: 0 },

  // trần giảm tối đa (chỉ áp dụng khi percent)
  maxDiscount: { type: Number, default: null, min: 0 },

  // điều kiện tổng đơn/tối thiểu tối đa
  minSubtotal: { type: Number, default: 0, min: 0 },
  maxSubtotal: { type: Number, default: null, min: 0 },

  // thời gian hiệu lực
  startsAt: { type: Date, default: null },
  endsAt: { type: Date, default: null },

  // giới hạn lượt dùng
  usageLimit: { type: Number, default: null, min: 0 },        // tổng lượt toàn hệ thống
  usedCount: { type: Number, default: 0, min: 0 },
  perUserLimit: { type: Number, default: null, min: 0 },      // mỗi user được dùng tối đa X lần

  // điều kiện người dùng/đơn đầu tiên/đăng nhập
  onlyFirstOrder: { type: Boolean, default: false },
  requireLoggedIn: { type: Boolean, default: false },

  // áp dụng theo phạm vi
  includeSkus: [{ type: String, trim: true }],                // chỉ áp cho các sku này
  excludeSkus: [{ type: String, trim: true }],
  includeCategories: [{ type: String, trim: true }],          // khớp Product.category (String)
  excludeCategories: [{ type: String, trim: true }],

  // logic nâng cao
  stackable: { type: Boolean, default: false },               // có cho áp chồng nhiều coupon (nếu bạn hỗ trợ) 
  excludeOnSale: { type: Boolean, default: false },           // loại trừ sản phẩm đang giảm (nếu có logic priceOld>price)
  active: { type: Boolean, default: true },

  // ghi chú
  note: { type: String, default: '' }
}, { timestamps: true });

couponSchema.index({ code: 1 });
couponSchema.index({ active: 1, startsAt: 1, endsAt: 1 });

export const Coupon = mongoose.model('Coupon', couponSchema);
