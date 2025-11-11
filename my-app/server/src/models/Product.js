import mongoose from 'mongoose'

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [2, 'Name is too short']
    },
    
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },

    images: {
      // Mảng URL ảnh
      type: [String],
      default: []
    },

    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be >= 0']
    },

    priceOld: {
      // giá gạch ngang (giá cũ)
      type: Number,
      min: [0, 'Old price must be >= 0'],
      default: 0
    },

    description: {
      type: String,
      default: ''
    },

    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity must be >= 0'],
      default: 0
    },
    category: {
      type: String,
      ref: 'Category',
      required: [true, 'Category is required']
    },

    sku: {
      type: String,
      trim: true,
      unique: true,
      required: [true, 'SKU is required']
    }
  },
  {
    timestamps: true // createdAt, updatedAt
  }
)

// Chuẩn hoá output JSON trả ra client
ProductSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => {
    ret.id = ret._id
    delete ret._id
    delete ret.__v
    return ret
  }
})

// Auto-generate slug from name before saving
ProductSchema.pre('save', function(next) {
  if (!this.isModified('name')) return next();
  
  // Generate slug from name if not provided
  if (this.name && !this.slug) {
    this.slug = slugify(this.name);
  }
  
  next();
});

// Create text index for search
ProductSchema.index({ name: 'text', description: 'text', slug: 'text' });

export const Product = mongoose.model('Product', ProductSchema)
