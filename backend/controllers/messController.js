const MessListing = require('../models/MessListing');
const Menu = require('../models/Menu');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// Helper to derive valid GeoJSON coordinates [longitude, latitude]
const getCoordinatesForAddress = (address, city, longitude, latitude) => {
  if (
    longitude !== undefined &&
    latitude !== undefined &&
    longitude !== '' &&
    latitude !== '' &&
    !isNaN(Number(longitude)) &&
    !isNaN(Number(latitude))
  ) {
    return [Number(longitude), Number(latitude)];
  }

  const cityCoordinatesMap = {
    ichalkaranji: [74.4595, 16.6976],
    kolhapur: [74.2433, 16.7050],
    pune: [73.8567, 18.5204],
    mumbai: [72.8777, 19.0760],
    sangli: [74.5752, 16.8524],
    satara: [73.9903, 17.6805],
    solapur: [75.9064, 17.6599],
    delhi: [77.1025, 28.7041],
    bangalore: [77.5946, 12.9716],
  };

  const normalizedCity = String(city || '').trim().toLowerCase();
  if (cityCoordinatesMap[normalizedCity]) {
    return cityCoordinatesMap[normalizedCity];
  }

  return [74.4595, 16.6976];
};

// @desc    Create a new mess listing
// @route   POST /api/messes
exports.createMess = catchAsync(async (req, res) => {
  const {
    name, description, foodType, address, city,
    longitude, latitude, baseFee, deposit, registrationFee,
    totalSeats, facilities, tags, nearbyColleges,
  } = req.body;

  const coordinates = getCoordinatesForAddress(address, city, longitude, latitude);

  const messData = {
    ownerId: req.user._id,
    name, description, foodType, address, city,
    location: {
      type: 'Point',
      coordinates,
    },
    pricing: { baseFee, deposit, registrationFee },
    totalSeats,
    facilities,
    tags,
    nearbyColleges,
  };

  const mess = await MessListing.create(messData);

  // Create an empty menu for this mess immediately — enforces the 1:1 relationship
  await Menu.create({ messId: mess._id, lastUpdatedBy: req.user._id });

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
  const sortBy = sortOptions[sort] || { 'rating.average': -1, createdAt: -1 };

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

  ['baseFee', 'deposit', 'registrationFee'].forEach((field) => {
    if (req.body[field] !== undefined) updates[`pricing.${field}`] = req.body[field];
  });

  if (req.body.longitude !== undefined || req.body.latitude !== undefined || req.body.address || req.body.city) {
    const coordinates = getCoordinatesForAddress(
      req.body.address,
      req.body.city,
      req.body.longitude,
      req.body.latitude
    );
    updates.location = { type: 'Point', coordinates };
  }

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