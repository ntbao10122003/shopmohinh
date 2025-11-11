import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Vui lòng nhập tiêu đề bài viết'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Vui lòng nhập nội dung bài viết'],
    },
    coverImage: {
      type: String,
      default: '',
    },
    categories: [
      {
        type: String,
        trim: true,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Tạo chỉ mục cho tìm kiếm
postSchema.index({ title: 'text', content: 'text' });

// Tạo slug tự động từ tiêu đề
postSchema.pre('save', async function (next) {
  if (!this.isModified('title')) return next();
  
  // Nếu chưa có slug, tạo từ tiêu đề
  if (!this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Xóa ký tự đặc biệt
      .replace(/\s+/g, '-') // Thay dấu cách bằng dấu gạch ngang
      .replace(/--+/g, '-') // Xóa nhiều dấu gạch ngang liên tiếp
      .trim()
      .replace(/^-+|-+$/g, ''); // Xóa dấu gạch ngang ở đầu và cuối
  }
  
  // Đảm bảo slug là duy nhất
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
  const postsWithSlug = await this.constructor.find({ slug: slugRegEx });
  
  if (postsWithSlug.length) {
    this.slug = `${this.slug}-${postsWithSlug.length + 1}`;
  }
  
  next();
});

const Post = mongoose.model('Post', postSchema);

export default Post;
