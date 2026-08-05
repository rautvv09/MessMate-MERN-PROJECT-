const MessListing = require('../models/MessListing');
const cloudinary = require('../config/cloudinary');
const uploadToCloudinary = require('../utils/uploadToCloudinary');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const MAX_GALLERY_IMAGES = 10;

// @desc    Upload one or more images to a mess's gallery
// @route   POST /api/messes/:messId/gallery
exports.uploadGalleryImages = catchAsync(async (req, res, next) => {
  const mess = await MessListing.findOne({ _id: req.params.messId, ownerId: req.user._id });

  if (!mess) {
    return next(new AppError('Mess not found or you do not own this listing', 404));
  }

  if (!req.files || req.files.length === 0) {
    return next(new AppError('Please upload at least one image', 400));
  }

  if (mess.gallery.length + req.files.length > MAX_GALLERY_IMAGES) {
    return next(
      new AppError(
        `Gallery limit is ${MAX_GALLERY_IMAGES} images. This mess currently has ${mess.gallery.length}.`,
        400
      )
    );
  }

  // Upload all files concurrently, not one at a time
  const uploadResults = await Promise.all(
    req.files.map((file) => uploadToCloudinary(file.buffer, 'messmate/mess-gallery'))
  );

  const newImages = uploadResults.map((result) => ({
    url: result.secure_url,
    publicId: result.public_id,
  }));

  mess.gallery.push(...newImages);
  await mess.save();

  res.status(200).json({
    success: true,
    data: { gallery: mess.gallery },
  });
});

// @desc    Delete a specific image from a mess's gallery
// @route   DELETE /api/messes/:messId/gallery/:publicId
exports.deleteGalleryImage = catchAsync(async (req, res, next) => {
  const mess = await MessListing.findOne({ _id: req.params.messId, ownerId: req.user._id });

  if (!mess) {
    return next(new AppError('Mess not found or you do not own this listing', 404));
  }

  // Cloudinary public_ids contain slashes (e.g. messmate/mess-gallery/abc123),
  // which arrive URL-encoded in the route param — decode before using
  const publicId = decodeURIComponent(req.params.publicId);

  const imageExists = mess.gallery.some((img) => img.publicId === publicId);
  if (!imageExists) {
    return next(new AppError('Image not found in this mess\'s gallery', 404));
  }

  await cloudinary.uploader.destroy(publicId);

  mess.gallery = mess.gallery.filter((img) => img.publicId !== publicId);
  await mess.save();

  res.status(200).json({
    success: true,
    message: 'Image removed',
    data: { gallery: mess.gallery },
  });
});