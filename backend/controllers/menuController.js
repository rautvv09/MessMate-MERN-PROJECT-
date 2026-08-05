const Menu = require('../models/Menu');
const MessListing = require('../models/MessListing');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const VALID_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

// @desc    Get full weekly menu for a mess
// @route   GET /api/messes/:messId/menu
exports.getMenu = catchAsync(async (req, res, next) => {
  const menu = await Menu.findOne({ messId: req.params.messId });

  if (!menu) {
    return next(new AppError('Menu not found for this mess', 404));
  }

  res.status(200).json({ success: true, data: { menu } });
});

// @desc    Get today's menu only (projected, not the full week)
// @route   GET /api/messes/:messId/menu/today
exports.getTodayMenu = catchAsync(async (req, res, next) => {
  const todayKey = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

  const menu = await Menu.findOne({ messId: req.params.messId })
    .select(`breakfast weeklyMenu.${todayKey}`);

  if (!menu) {
    return next(new AppError('Menu not found for this mess', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      day: todayKey,
      breakfast: menu.breakfast,
      lunch: menu.weeklyMenu[todayKey].lunch,
      dinner: menu.weeklyMenu[todayKey].dinner,
    },
  });
});

// @desc    Update one specific day's menu
// @route   PATCH /api/messes/:messId/menu/:day
exports.updateDayMenu = catchAsync(async (req, res, next) => {
  const { day } = req.params;
  const { lunch, dinner } = req.body;

  if (!VALID_DAYS.includes(day)) {
    return next(new AppError(`Invalid day. Must be one of: ${VALID_DAYS.join(', ')}`, 400));
  }

  // Two-hop ownership check: verify the mess belongs to this owner first
  const mess = await MessListing.findOne({ _id: req.params.messId, ownerId: req.user._id });
  if (!mess) {
    return next(new AppError('Mess not found or you do not own this listing', 404));
  }

  const update = { lastUpdatedBy: req.user._id };
  if (lunch !== undefined) update[`weeklyMenu.${day}.lunch`] = lunch;
  if (dinner !== undefined) update[`weeklyMenu.${day}.dinner`] = dinner;

  const menu = await Menu.findOneAndUpdate(
    { messId: req.params.messId },
    update,
    { new: true, runValidators: true }
  );

  if (!menu) {
    return next(new AppError('Menu not found for this mess', 404));
  }

  res.status(200).json({ success: true, data: { menu } });
});

// @desc    Update breakfast (same every day)
// @route   PATCH /api/messes/:messId/menu/breakfast
exports.updateBreakfast = catchAsync(async (req, res, next) => {
  const { breakfast } = req.body;

  if (!Array.isArray(breakfast)) {
    return next(new AppError('Breakfast must be an array of items', 400));
  }

  const mess = await MessListing.findOne({ _id: req.params.messId, ownerId: req.user._id });
  if (!mess) {
    return next(new AppError('Mess not found or you do not own this listing', 404));
  }

  const menu = await Menu.findOneAndUpdate(
    { messId: req.params.messId },
    { breakfast, lastUpdatedBy: req.user._id },
    { new: true, runValidators: true }
  );

  res.status(200).json({ success: true, data: { menu } });
});