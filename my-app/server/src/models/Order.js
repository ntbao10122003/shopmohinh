import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    sku: { type: String, trim: true, default: "" },
    name: { type: String, required: true },
    image: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderCode: { 
      type: String, 
      required: true, 
      unique: true,
      default: () => `DH${Math.floor(100000 + Math.random() * 900000)}`
    },
    customer: {
      fullName: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      province: { type: String, required: true, trim: true },
      district: { type: String, required: true, trim: true },
      address: { type: String, required: true, trim: true },
      note: { type: String, default: "", trim: true },
    },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true, min: 0 },
    coupon: {
      code: { type: String, default: null },
      discountType: { type: String, enum: ["percent", "amount"], default: null },
      discountValue: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipping", "completed", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: { type: String, default: "cod" }, // cod, bank_transfer, etc.
    currency: { type: String, default: "VND" },
    cartToken: { type: String, default: null }, // reference to guest cart if any
  },
  { timestamps: true }
);

// Generate order code
orderSchema.pre("save", async function (next) {
  if (!this.orderCode) {
    const count = await mongoose.model("Order").countDocuments();
    this.orderCode = `DH${String(count + 1).padStart(6, "0")}`;
  }
  next();
});

export const Order = mongoose.model("Order", orderSchema);
