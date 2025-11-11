import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    sku: { type: String, trim: true, default: "" }, // để đối chiếu nhanh
    name: { type: String, required: true },
    image: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 }, // snapshot tại thời điểm add
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      default: null,
    },
    cartToken: { type: String, index: true, default: null }, // cho khách
    items: [cartItemSchema],
    coupon: {
      code: String,
      discountType: {
        type: String,
        enum: ["percent", "amount"],
        default: null,
      },
    computedDiscount: { type: Number, default: 0 },   // số tiền đã tính từ coupon hiện tại
    couponId: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon', default: null }, // optional
    discountValue: { type: Number, default: 0 },
    },
    currency: { type: String, default: "VND" },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

cartSchema.virtual("subtotal").get(function () {
  return this.items.reduce((s, it) => s + it.price * it.quantity, 0);
});

cartSchema.virtual("discount").get(function () {
  if (!this.coupon || !this.coupon.discountType) return 0;
  return this.coupon.discountType === "percent"
    ? Math.round(this.subtotal * (this.coupon.discountValue / 100))
    : Math.min(this.coupon.discountValue, this.subtotal);
});

cartSchema.virtual("total").get(function () {
  return Math.max(this.subtotal - this.discount, 0);
});

export const Cart = mongoose.model("Cart", cartSchema);
