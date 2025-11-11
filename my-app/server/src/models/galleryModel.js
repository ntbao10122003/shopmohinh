import mongoose from 'mongoose';

const slugify = (text) => {
  if (!text) return '';
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

const gallerySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    altText: {
      type: String,
      default: 'gallery image',
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Auto-generate slug from title before saving
gallerySchema.pre('save', function(next) {
  if (!this.isModified('title')) return next();
  
  // Generate slug from title if not provided
  if (this.title && !this.slug) {
    this.slug = slugify(this.title);
  }
  
  next();
});

// Create index for search
gallerySchema.index({ title: 'text', altText: 'text', slug: 'text' });

export default mongoose.model('Gallery', gallerySchema);
