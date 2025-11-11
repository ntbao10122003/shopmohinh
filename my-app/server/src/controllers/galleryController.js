import Gallery from '../models/galleryModel.js';
import catchAsync from '../utils/catchAsync.js';
import { createOne, deleteOne, getAll, getOne, updateOne } from './handlerFactory.js';

// @desc    Get all gallery images
// @route   GET /api/v1/gallery
// @access  Public
export const getAllGallery = getAll(Gallery);

// @desc    Get single gallery image
// @route   GET /api/v1/gallery/:id
// @access  Public
export const getGalleryImage = getOne(Gallery);

// @desc    Create new gallery image
// @route   POST /api/v1/gallery
// @access  Private/Admin
export const createGalleryImage = createOne(Gallery);

// @desc    Update gallery image
// @route   PATCH /api/v1/gallery/:id
// @access  Private/Admin
export const updateGalleryImage = updateOne(Gallery);

// @desc    Delete gallery image
// @route   DELETE /api/v1/gallery/:id
// @access  Private/Admin
export const deleteGalleryImage = deleteOne(Gallery);

// @desc    Toggle gallery image status (active/inactive)
// @route   PATCH /api/v1/gallery/:id/toggle-status
// @access  Private/Admin
export const toggleGalleryStatus = catchAsync(async (req, res, next) => {
  const doc = await Gallery.findByIdAndUpdate(
    req.params.id,
    { $set: { isActive: !req.body.isActive } },
    { new: true, runValidators: true }
  );

  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: doc,
    },
  });
});
