const MessListing = require('../models/MessListing');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// @desc    Create a new mess listing
// @route   POST /api/messes
exports.createMess = catchAsync(async (req, res) => {
  const {
    name, description, foodType, address, city,
    longitude, latitude, baseFee, deposit, registrationFee,
    totalSeats, facilities, tags, nearbyColleges,
  } = req.body;

  const messData = {
    ownerId: req.user._id,
    name, description, foodType, address, city,
    pricing: { baseFee, deposit, registrationFee },
    totalSeats,
    facilities,
    tags,
    nearbyColleges,
  };

  if (longitude !== undefined && latitude !== undefined) {
    messData.location = { type: 'Point', coordinates: [longitude, latitude] };
  }

  const mess = await MessListing.create(messData);

  res.status(201).json({ success: true, data: { mess } });
});

// @desc    Get single mess by ID
// @route   GET /api/messes/:id
exports.getMess = catchAsync(async (req, res, next) => {
  const mess = await MessListing.findOne({ _id: req.params.id, isActive: true })
    .populate('ownerId', 'name roleDetails.businessName roleDetails.isVerifiedOwner');

  if (!mess) {
    return next(new AppError('Mess not found', 404));
  }

  res.status(200).json({ success: true, data: { mess } });
});

// @desc    Get all messes — search, filter, sort, paginate
// @route   GET /api/messes
exports.getAllMesses = catchAsync(async (req, res) => {
  const {
    search, city, foodType, minPrice, maxPrice, minRating,
    facilities, sort, page = 1, limit = 12,
  } = req.query;

  const filter = { isActive: true };

  if (city) filter.city = new RegExp(`^${city}$`, 'i');
  if (foodType) filter.foodType = foodType;
  if (minRating) filter['rating.average'] = { $gte: Number(minRating) };
  if (facilities) {
    const facilityList = facilities.split(',');
    filter.facilities = { $all: facilityList };
  }
  if (minPrice || maxPrice) {
    filter['pricing.baseFee'] = {};
    if (minPrice) filter['pricing.baseFee'].$gte = Number(minPrice);
    if (maxPrice) filter['pricing.baseFee'].$lte = Number(maxPrice);
  }
  if (search) {
    filter.$text = { $search: search };
  }

  const sortOptions = {
    price_low: { 'pricing.baseFee': 1 },
    price_high: { 'pricing.baseFee': -1 },
    rating: { 'rating.average': -1 },
    newest: { createdAt: -1 },
  };
  const sortBy = sortOptions[sort] || { 'rating.average': -1, createdAt: -1 }; // default: recommended

  const skip = (Number(page) - 1) * Number(limit);

  const [messes, total] = await Promise.all([
    MessListing.find(filter).sort(sortBy).skip(skip).limit(Number(limit)),
    MessListing.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    results: messes.length,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    },
    data: { messes },
  });
});

// @desc    Get nearby messes (geospatial)
// @route   GET /api/messes/nearby
exports.getNearbyMesses = catchAsync(async (req, res, next) => {
  const { longitude, latitude, maxDistance = 5000 } = req.query;

  if (!longitude || !latitude) {
    return next(new AppError('Longitude and latitude are required', 400));
  }

  const messes = await MessListing.find({
    isActive: true,
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [Number(longitude), Number(latitude)] },
        $maxDistance: Number(maxDistance),
      },
    },
  });

  res.status(200).json({ success: true, results: messes.length, data: { messes } });
});

// @desc    Update a mess (owner only, own listing only)
// @route   PATCH /api/messes/:id
exports.updateMess = catchAsync(async (req, res, next) => {
  const allowedFields = [
    'name', 'description', 'foodType', 'address', 'city',
    'totalSeats', 'facilities', 'tags', 'nearbyColleges',
  ];
  const updates = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  // pricing sub-fields, updated individually — same dot-notation reasoning as User profile updates
  ['baseFee', 'deposit', 'registrationFee'].forEach((field) => {
    if (req.body[field] !== undefined) updates[`pricing.${field}`] = req.body[field];
  });

  const mess = await MessListing.findOneAndUpdate(
    { _id: req.params.id, ownerId: req.user._id },
    updates,
    { new: true, runValidators: true }
  );

  if (!mess) {
    return next(new AppError('Mess not found or you do not own this listing', 404));
  }

  res.status(200).json({ success: true, data: { mess } });
});

// @desc    Soft-delete a mess (owner only, own listing only)
// @route   DELETE /api/messes/:id
exports.deleteMess = catchAsync(async (req, res, next) => {
  const mess = await MessListing.findOneAndUpdate(
    { _id: req.params.id, ownerId: req.user._id },
    { isActive: false },
    { new: true }
  );

  if (!mess) {
    return next(new AppError('Mess not found or you do not own this listing', 404));
  }

  res.status(200).json({ success: true, message: 'Mess listing removed', data: null });
});


const Menu = require('../models/Menu'); // add this import at the top of the file

exports.createMess = catchAsync(async (req, res) => {
  const {
    name, description, foodType, address, city,
    longitude, latitude, baseFee, deposit, registrationFee,
    totalSeats, facilities, tags, nearbyColleges,
  } = req.body;

  const messData = {
    ownerId: req.user._id,
    name, description, foodType, address, city,
    pricing: { baseFee, deposit, registrationFee },
    totalSeats,
    facilities,
    tags,
    nearbyColleges,
  };

  if (longitude !== undefined && latitude !== undefined) {
    messData.location = { type: 'Point', coordinates: [longitude, latitude] };
  }

  const mess = await MessListing.create(messData);

  // Create an empty menu for this mess immediately — enforces the 1:1 relationship
  await Menu.create({ messId: mess._id, lastUpdatedBy: req.user._id });

  res.status(201).json({ success: true, data: { mess } });
});