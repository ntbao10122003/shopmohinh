// src/controllers/couponController.js
import { Coupon }  from '../models/Coupon.js';

// Tạo coupon
export const createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.json({ success: true, data: coupon });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Sửa coupon
export const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy coupon' });
    }

    res.json({ success: true, data: coupon });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Danh sách coupon
export const listCoupons = async (req, res) => {
  try {
    const { q, active } = req.query;
    const filter = {};

    if (q) filter.code = new RegExp(String(q).trim(), 'i');
    if (active != null) filter.active = active === 'true';

    const list = await Coupon.find(filter)
      .sort({ createdAt: -1 })
      .limit(200);

    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Xoá coupon
export const deleteCoupon = async (req, res) => {
  try {
    const ok = await Coupon.findByIdAndDelete(req.params.id);
    if (!ok) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy coupon' });
    }

    res.json({ success: true, message: 'Đã xoá' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
