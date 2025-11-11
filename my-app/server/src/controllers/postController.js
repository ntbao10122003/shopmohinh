import Post from '../models/postModel.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

// @desc    Get all posts
// @route   GET /api/v1/posts
// @access  Public
export const getAllPosts = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Build query
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
  excludedFields.forEach(el => delete queryObj[el]);

  // Search functionality
  if (req.query.search) {
    queryObj.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { content: { $regex: req.query.search, $options: 'i' } },
      { categories: { $in: [new RegExp(req.query.search, 'i')] } }
    ];
  }

  // Execute query
  let query = Post.find(queryObj)
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  const posts = await query;
  const total = await Post.countDocuments(queryObj);

  res.status(200).json({
    status: 'success',
    results: posts.length,
    total,
    data: {
      data: posts,
    },
  });
});

// @desc    Get single post
// @route   GET /api/v1/posts/:id
// @access  Public
export const getPost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new AppError('Không tìm thấy bài viết với ID này', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: post,
    },
  });
});

// @desc    Create new post
// @route   POST /api/v1/posts
// @access  Private/Admin
export const createPost = catchAsync(async (req, res, next) => {
  const { title, content, categories, coverImage: coverImageFromBody = '' } = req.body;
  let coverImage = coverImageFromBody;

  // Upload cover image if exists in the file upload
  if (req.file) {
    const result = await uploadToCloudinary(req.file);
    coverImage = result.secure_url;
  }

  // Process categories
  const categoriesArray = Array.isArray(categories) 
    ? categories 
    : categories?.split(',').map((cat) => cat.trim()) || [];

  const newPost = await Post.create({
    title,
    content,
    categories: categoriesArray,
    coverImage,
    createdBy: req.user.id,
  });

  res.status(201).json({
    status: 'success',
    data: {
      data: newPost,
    },
  });
});

// @desc    Update post
// @route   PATCH /api/v1/posts/:id
// @access  Private/Admin
export const updatePost = catchAsync(async (req, res, next) => {
  const { title, content, categories } = req.body;
  const updateData = { title, content };

  // Upload new cover image if provided
  if (req.file) {
    const result = await uploadToCloudinary(req.file);
    updateData.coverImage = result.secure_url;
  }

  // Update categories if provided
  if (categories) {
    updateData.categories = Array.isArray(categories)
      ? categories
      : categories.split(',').map((cat) => cat.trim());
  }

  const updatedPost = await Post.findByIdAndUpdate(
    req.params.id,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedPost) {
    return next(new AppError('Không tìm thấy bài viết với ID này', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: updatedPost,
    },
  });
});

// @desc    Delete post
// @route   DELETE /api/v1/posts/:id
// @access  Private/Admin
export const deletePost = catchAsync(async (req, res, next) => {
  const post = await Post.findByIdAndDelete(req.params.id);

  if (!post) {
    return next(new AppError('Không tìm thấy bài viết với ID này', 404));
  }

  // TODO: Xóa ảnh từ Cloudinary nếu cần

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// @desc    Get posts by category
// @route   GET /api/v1/posts/category/:category
// @access  Public
export const getPostsByCategory = catchAsync(async (req, res, next) => {
  const { category } = req.params;
  const posts = await Post.find({ categories: category }).sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: posts.length,
    data: {
      data: posts,
    },
  });
});
