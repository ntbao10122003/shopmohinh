import mongoose from 'mongoose'

const menuItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  url: { type: String, default: '' },
  slug: { type: String, default: '' }, // New slug field
  order: { type: Number, default: 0 },
  children: { type: Array, default: [] }
}, { _id: false });

const MenuSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, default: '' },
    logo: { type: String, default: '' },
    items: { type: [menuItemSchema], default: [] }
  },
  { timestamps: true }
)

export const Menu = mongoose.model('Menu', MenuSchema)
