const mongoose = require('mongoose');
const User = require('../models/User');
const MessListing = require('../models/MessListing');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Menu = require('../models/Menu');
const Attendance = require('../models/Attendance');
const AuditLog = require('../models/AuditLog');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { logAdminAction } = require('../utils/auditLogger');

// =========================================================================
// 1. DASHBOARD & ANALYTICS
// =========================================================================

/**
 * @desc    Get complete real-time dashboard analytics
 * @route   GET /api/admin/dashboard/stats
 */
exports.getDashboardStats = catchAsync(async (req, res) => {
  // Concurrent DB aggregate counts
  const [
    totalStudents,
    totalOwners,
    totalAdmins,
    activeUsers,
    suspendedUsers,
    totalMesses,
    activeMesses,
    verifiedMesses,
    totalBookings,
    bookingsByStatus,
    totalReviews,
    ratingStats,
    recentBookings,
    recentUsers,
    recentLogs,
  ] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'owner' }),
    User.countDocuments({ role: 'admin' }),
    User.countDocuments({ status: 'active', isActive: true }),
    User.countDocuments({ status: 'suspended' }),

    MessListing.countDocuments({}),
    MessListing.countDocuments({ isActive: true }),
    MessListing.countDocuments({ isVerified: true }),

    Booking.countDocuments({}),
    Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$priceSnapshot.totalPayable' },
        },
      },
    ]),

    Review.countDocuments({}),
    Review.aggregate([
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ]),

    // Recent 5 Bookings
    Booking.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('studentId', 'name email phone avatarUrl')
      .populate('messId', 'name city'),

    // Recent 5 Users
    User.find({})
      .select('name email role status isEmailVerified createdAt avatarUrl')
      .sort({ createdAt: -1 })
      .limit(5),

    // Recent 5 Audit Logs
    AuditLog.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('adminId', 'name email avatarUrl'),
  ]);

  // Transform booking counts into dictionary
  const bookingSummary = {
    total: totalBookings,
    confirmed: 0,
    waitlisted: 0,
    cancelled: 0,
    completed: 0,
    totalVolume: 0,
  };

  bookingsByStatus.forEach((item) => {
    if (bookingSummary[item._id] !== undefined) {
      bookingSummary[item._id] = item.count;
    }
    bookingSummary.totalVolume += item.totalRevenue || 0;
  });

  // Calculate rating distribution (1 to 5 stars)
  const ratingDistribution = await Review.aggregate([
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratingDistribution.forEach((r) => {
    if (ratingCounts[r._id] !== undefined) {
      ratingCounts[r._id] = r.count;
    }
  });

  // 6-month historical trends
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [monthlyBookings, monthlyRegistrations] = await Promise.all([
    Booking.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
          revenue: { $sum: '$priceSnapshot.totalPayable' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
    User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            role: '$role',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
  ]);

  // Format monthly trend data
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const trendsMap = {};

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
    const label = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    trendsMap[key] = {
      name: label,
      bookings: 0,
      revenue: 0,
      students: 0,
      owners: 0,
    };
  }

  monthlyBookings.forEach((b) => {
    const key = `${b._id.year}-${b._id.month}`;
    if (trendsMap[key]) {
      trendsMap[key].bookings = b.count;
      trendsMap[key].revenue = b.revenue;
    }
  });

  monthlyRegistrations.forEach((u) => {
    const key = `${u._id.year}-${u._id.month}`;
    if (trendsMap[key]) {
      if (u._id.role === 'student') trendsMap[key].students += u.count;
      if (u._id.role === 'owner') trendsMap[key].owners += u.count;
    }
  });

  const trends = Object.values(trendsMap);

  res.status(200).json({
    success: true,
    data: {
      users: {
        totalStudents,
        totalOwners,
        totalAdmins,
        activeUsers,
        suspendedUsers,
        totalUsers: totalStudents + totalOwners + totalAdmins,
      },
      messes: {
        totalMesses,
        activeMesses,
        inactiveMesses: totalMesses - activeMesses,
        verifiedMesses,
      },
      bookings: bookingSummary,
      reviews: {
        totalReviews,
        avgRating: ratingStats.length > 0 ? Math.round(ratingStats[0].avgRating * 10) / 10 : 0,
        ratingCounts,
      },
      trends,
      recentBookings,
      recentUsers,
      recentLogs,
    },
  });
});

// =========================================================================
// 2. MANAGE STUDENTS
// =========================================================================

/**
 * @desc    Get all students with search, filters & pagination
 * @route   GET /api/admin/students
 */
exports.getStudents = catchAsync(async (req, res) => {
  const { search, status, isEmailVerified, page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;

  const query = { role: 'student' };

  if (status && ['active', 'suspended', 'inactive'].includes(status)) {
    query.status = status;
  }

  if (isEmailVerified !== undefined && isEmailVerified !== '') {
    query.isEmailVerified = isEmailVerified === 'true';
  }

  if (search) {
    const regex = new RegExp(search.trim(), 'i');
    query.$or = [
      { name: regex },
      { email: regex },
      { phone: regex },
      { 'roleDetails.college': regex },
      { 'roleDetails.city': regex },
    ];
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;
  const sort = { [sortBy]: order === 'asc' ? 1 : -1 };

  const [students, total] = await Promise.all([
    User.find(query)
      .select('-refreshTokens -passwordResetToken -emailVerificationToken')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    User.countDocuments(query),
  ]);

  // Attach booking count for each student
  const studentIds = students.map((s) => s._id);
  const bookingCounts = await Booking.aggregate([
    { $match: { studentId: { $in: studentIds } } },
    { $group: { _id: '$studentId', count: { $sum: 1 } } },
  ]);

  const bookingCountMap = {};
  bookingCounts.forEach((b) => {
    bookingCountMap[b._id.toString()] = b.count;
  });

  const formattedStudents = students.map((s) => ({
    ...s,
    totalBookings: bookingCountMap[s._id.toString()] || 0,
  }));

  res.status(200).json({
    success: true,
    data: {
      students: formattedStudents,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    },
  });
});

/**
 * @desc    Get single student details with booking & review history
 * @route   GET /api/admin/students/:id
 */
exports.getStudentById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid Student ID', 400));
  }

  const student = await User.findOne({ _id: id, role: 'student' }).select('-refreshTokens');

  if (!student) {
    return next(new AppError('Student not found', 404));
  }

  const [bookings, reviews, attendanceSummary] = await Promise.all([
    Booking.find({ studentId: id })
      .populate('messId', 'name city address pricing')
      .sort({ createdAt: -1 }),
    Review.find({ studentId: id })
      .populate('messId', 'name city')
      .sort({ createdAt: -1 }),
    Attendance.aggregate([
      { $match: { studentId: new mongoose.Types.ObjectId(id) } },
      {
        $group: {
          _id: null,
          totalDaysLogged: { $sum: 1 },
        },
      },
    ]),
  ]);

  res.status(200).json({
    success: true,
    data: {
      student: student.toSafeObject(),
      bookings,
      reviews,
      stats: {
        totalBookings: bookings.length,
        totalReviews: reviews.length,
        daysAttendanceLogged: attendanceSummary[0]?.totalDaysLogged || 0,
      },
    },
  });
});

/**
 * @desc    Update student status (active, suspended, inactive)
 * @route   PATCH /api/admin/students/:id/status
 */
exports.updateStudentStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status, reason } = req.body;

  if (!['active', 'suspended', 'inactive'].includes(status)) {
    return next(new AppError('Invalid status. Allowed: active, suspended, inactive', 400));
  }

  const student = await User.findById(id);

  if (!student) {
    return next(new AppError('Student not found', 404));
  }

  if (student.role === 'admin') {
    return next(new AppError('Cannot modify admin accounts via student management', 403));
  }

  const prevStatus = student.status || (student.isActive ? 'active' : 'suspended');
  student.status = status;
  student.isActive = status === 'active';
  await student.save({ validateBeforeSave: false });

  await logAdminAction({
    adminId: req.user._id,
    action: `STUDENT_STATUS_${status.toUpperCase()}`,
    targetType: 'User',
    targetId: student._id,
    targetName: student.name,
    details: {
      previousStatus: prevStatus,
      newStatus: status,
      reason: reason || 'Admin updated account status',
    },
    req,
  });

  res.status(200).json({
    success: true,
    message: `Student account ${status === 'active' ? 'activated' : status === 'suspended' ? 'suspended' : 'deactivated'} successfully`,
    data: { student: student.toSafeObject() },
  });
});

/**
 * @desc    Delete student account
 * @route   DELETE /api/admin/students/:id
 */
exports.deleteStudent = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const student = await User.findById(id);

  if (!student) {
    return next(new AppError('Student not found', 404));
  }

  if (student.role === 'admin') {
    return next(new AppError('Cannot delete admin accounts', 403));
  }

  const studentName = student.name;
  await User.findByIdAndDelete(id);

  await logAdminAction({
    adminId: req.user._id,
    action: 'STUDENT_DELETED',
    targetType: 'User',
    targetId: id,
    targetName: studentName,
    details: { email: student.email, role: student.role },
    req,
  });

  res.status(200).json({
    success: true,
    message: 'Student account deleted successfully',
  });
});

// =========================================================================
// 3. MANAGE MESS OWNERS
// =========================================================================

/**
 * @desc    Get all mess owners with search, filters & pagination
 * @route   GET /api/admin/owners
 */
exports.getOwners = catchAsync(async (req, res) => {
  const { search, status, isVerifiedOwner, page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;

  const query = { role: 'owner' };

  if (status && ['active', 'suspended', 'inactive'].includes(status)) {
    query.status = status;
  }

  if (isVerifiedOwner !== undefined && isVerifiedOwner !== '') {
    query['roleDetails.isVerifiedOwner'] = isVerifiedOwner === 'true';
  }

  if (search) {
    const regex = new RegExp(search.trim(), 'i');
    query.$or = [
      { name: regex },
      { email: regex },
      { phone: regex },
      { 'roleDetails.businessName': regex },
      { 'roleDetails.address': regex },
    ];
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;
  const sort = { [sortBy]: order === 'asc' ? 1 : -1 };

  const [owners, total] = await Promise.all([
    User.find(query)
      .select('-refreshTokens -passwordResetToken -emailVerificationToken')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    User.countDocuments(query),
  ]);

  // Attach Mess Count and total seats for each owner
  const ownerIds = owners.map((o) => o._id);
  const messStats = await MessListing.aggregate([
    { $match: { ownerId: { $in: ownerIds } } },
    {
      $group: {
        _id: '$ownerId',
        messCount: { $sum: 1 },
        activeMessCount: { $sum: { $cond: ['$isActive', 1, 0] } },
        totalSeats: { $sum: '$totalSeats' },
      },
    },
  ]);

  const messStatMap = {};
  messStats.forEach((m) => {
    messStatMap[m._id.toString()] = m;
  });

  const formattedOwners = owners.map((o) => {
    const stats = messStatMap[o._id.toString()] || { messCount: 0, activeMessCount: 0, totalSeats: 0 };
    return {
      ...o,
      messCount: stats.messCount,
      activeMessCount: stats.activeMessCount,
      totalSeats: stats.totalSeats,
    };
  });

  res.status(200).json({
    success: true,
    data: {
      owners: formattedOwners,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    },
  });
});

/**
 * @desc    Get single owner details with mess listings & analytics
 * @route   GET /api/admin/owners/:id
 */
exports.getOwnerById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid Owner ID', 400));
  }

  const owner = await User.findOne({ _id: id, role: 'owner' }).select('-refreshTokens');

  if (!owner) {
    return next(new AppError('Owner not found', 404));
  }

  const messes = await MessListing.find({ ownerId: id });
  const messIds = messes.map((m) => m._id);

  const bookings = await Booking.find({ messId: { $in: messIds } })
    .populate('studentId', 'name email phone avatarUrl')
    .populate('messId', 'name')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: {
      owner: owner.toSafeObject(),
      messes,
      bookings,
      stats: {
        totalMesses: messes.length,
        activeMesses: messes.filter((m) => m.isActive).length,
        totalBookings: bookings.length,
        activeBookings: bookings.filter((b) => b.status === 'confirmed').length,
      },
    },
  });
});

/**
 * @desc    Update owner status / verification
 * @route   PATCH /api/admin/owners/:id/status
 */
exports.updateOwnerStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status, isVerifiedOwner, reason } = req.body;

  const owner = await User.findById(id);

  if (!owner) {
    return next(new AppError('Owner not found', 404));
  }

  if (owner.role === 'admin') {
    return next(new AppError('Cannot modify admin accounts via owner management', 403));
  }

  const changes = {};

  if (status && ['active', 'suspended', 'inactive'].includes(status)) {
    changes.prevStatus = owner.status;
    owner.status = status;
    owner.isActive = status === 'active';
    changes.newStatus = status;
  }

  if (isVerifiedOwner !== undefined) {
    owner.roleDetails = owner.roleDetails || {};
    owner.roleDetails.isVerifiedOwner = !!isVerifiedOwner;
    changes.isVerifiedOwner = !!isVerifiedOwner;
  }

  await owner.save({ validateBeforeSave: false });

  await logAdminAction({
    adminId: req.user._id,
    action: isVerifiedOwner !== undefined && !status ? 'OWNER_VERIFICATION_TOGGLED' : `OWNER_STATUS_UPDATED`,
    targetType: 'User',
    targetId: owner._id,
    targetName: owner.name,
    details: {
      ...changes,
      reason: reason || 'Admin updated owner details',
    },
    req,
  });

  res.status(200).json({
    success: true,
    message: 'Owner updated successfully',
    data: { owner: owner.toSafeObject() },
  });
});

/**
 * @desc    Delete owner account
 * @route   DELETE /api/admin/owners/:id
 */
exports.deleteOwner = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const owner = await User.findById(id);

  if (!owner) {
    return next(new AppError('Owner not found', 404));
  }

  if (owner.role === 'admin') {
    return next(new AppError('Cannot delete admin accounts', 403));
  }

  const ownerName = owner.name;
  await User.findByIdAndDelete(id);

  await logAdminAction({
    adminId: req.user._id,
    action: 'OWNER_DELETED',
    targetType: 'User',
    targetId: id,
    targetName: ownerName,
    details: { email: owner.email, role: owner.role },
    req,
  });

  res.status(200).json({
    success: true,
    message: 'Owner deleted successfully',
  });
});

// =========================================================================
// 4. MANAGE MESS LISTINGS
// =========================================================================

/**
 * @desc    Get all mess listings with search, filters & pagination
 * @route   GET /api/admin/messes
 */
exports.getMesses = catchAsync(async (req, res) => {
  const { search, city, foodType, isActive, isVerified, page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;

  const query = {};

  if (city) {
    query.city = new RegExp(`^${city.trim()}$`, 'i');
  }

  if (foodType && ['veg', 'non-veg', 'both'].includes(foodType)) {
    query.foodType = foodType;
  }

  if (isActive !== undefined && isActive !== '') {
    query.isActive = isActive === 'true';
  }

  if (isVerified !== undefined && isVerified !== '') {
    query.isVerified = isVerified === 'true';
  }

  if (search) {
    const regex = new RegExp(search.trim(), 'i');
    query.$or = [{ name: regex }, { description: regex }, { address: regex }, { city: regex }];
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;
  const sort = { [sortBy]: order === 'asc' ? 1 : -1 };

  const [messes, total] = await Promise.all([
    MessListing.find(query)
      .populate('ownerId', 'name email phone avatarUrl roleDetails.businessName')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    MessListing.countDocuments(query),
  ]);

  // Attach active bookings count
  const messIds = messes.map((m) => m._id);
  const activeBookingCounts = await Booking.aggregate([
    { $match: { messId: { $in: messIds }, status: 'confirmed' } },
    { $group: { _id: '$messId', count: { $sum: 1 } } },
  ]);

  const bookingMap = {};
  activeBookingCounts.forEach((b) => {
    bookingMap[b._id.toString()] = b.count;
  });

  const formattedMesses = messes.map((m) => ({
    ...m,
    activeSubscribers: bookingMap[m._id.toString()] || 0,
  }));

  res.status(200).json({
    success: true,
    data: {
      messes: formattedMesses,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    },
  });
});

/**
 * @desc    Get single mess listing details
 * @route   GET /api/admin/messes/:id
 */
exports.getMessById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid Mess ID', 400));
  }

  const [mess, menu, reviews, bookings] = await Promise.all([
    MessListing.findById(id).populate('ownerId', 'name email phone roleDetails avatarUrl status'),
    Menu.findOne({ messId: id }),
    Review.find({ messId: id }).populate('studentId', 'name avatarUrl email').sort({ createdAt: -1 }),
    Booking.find({ messId: id }).populate('studentId', 'name email phone avatarUrl').sort({ createdAt: -1 }),
  ]);

  if (!mess) {
    return next(new AppError('Mess listing not found', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      mess,
      menu,
      reviews,
      bookings,
      stats: {
        totalBookings: bookings.length,
        activeBookings: bookings.filter((b) => b.status === 'confirmed').length,
        totalReviews: reviews.length,
        averageRating: mess.rating?.average || 0,
      },
    },
  });
});

/**
 * @desc    Update mess status (active/inactive) or verification
 * @route   PATCH /api/admin/messes/:id/status
 */
exports.updateMessStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { isActive, isVerified } = req.body;

  const mess = await MessListing.findById(id);

  if (!mess) {
    return next(new AppError('Mess listing not found', 404));
  }

  const updates = {};
  if (isActive !== undefined) {
    mess.isActive = !!isActive;
    updates.isActive = !!isActive;
  }
  if (isVerified !== undefined) {
    mess.isVerified = !!isVerified;
    updates.isVerified = !!isVerified;
  }

  await mess.save();

  await logAdminAction({
    adminId: req.user._id,
    action: 'MESS_STATUS_UPDATED',
    targetType: 'MessListing',
    targetId: mess._id,
    targetName: mess.name,
    details: updates,
    req,
  });

  res.status(200).json({
    success: true,
    message: 'Mess listing updated successfully',
    data: { mess },
  });
});

/**
 * @desc    Delete mess listing
 * @route   DELETE /api/admin/messes/:id
 */
exports.deleteMess = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const mess = await MessListing.findById(id);

  if (!mess) {
    return next(new AppError('Mess listing not found', 404));
  }

  const messName = mess.name;
  await MessListing.findByIdAndDelete(id);

  await logAdminAction({
    adminId: req.user._id,
    action: 'MESS_DELETED',
    targetType: 'MessListing',
    targetId: id,
    targetName: messName,
    details: { city: mess.city, ownerId: mess.ownerId },
    req,
  });

  res.status(200).json({
    success: true,
    message: 'Mess listing deleted successfully',
  });
});

// =========================================================================
// 5. MONITOR BOOKINGS
// =========================================================================

/**
 * @desc    Get all bookings across the platform with filters & pagination
 * @route   GET /api/admin/bookings
 */
exports.getBookings = catchAsync(async (req, res) => {
  const { search, status, planType, messId, page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;

  const query = {};

  if (status && status !== 'all') {
    query.status = status;
  }

  if (planType && planType !== 'all') {
    query.planType = planType;
  }

  if (messId && mongoose.Types.ObjectId.isValid(messId)) {
    query.messId = messId;
  }

  if (search) {
    const regex = new RegExp(search.trim(), 'i');
    query.$or = [{ bookingId: regex }];
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;
  const sort = { [sortBy]: order === 'asc' ? 1 : -1 };

  const [bookings, total] = await Promise.all([
    Booking.find(query)
      .populate('studentId', 'name email phone avatarUrl')
      .populate({
        path: 'messId',
        select: 'name city address ownerId',
        populate: { path: 'ownerId', select: 'name email phone roleDetails.businessName' },
      })
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Booking.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: {
      bookings,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    },
  });
});

/**
 * @desc    Get single booking details
 * @route   GET /api/admin/bookings/:id
 */
exports.getBookingById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  let query = {};
  if (mongoose.Types.ObjectId.isValid(id)) {
    query = { $or: [{ _id: id }, { bookingId: id }] };
  } else {
    query = { bookingId: id };
  }

  const booking = await Booking.findOne(query)
    .populate('studentId', 'name email phone avatarUrl roleDetails status')
    .populate({
      path: 'messId',
      select: 'name city address pricing mealPricing ownerId rating',
      populate: { path: 'ownerId', select: 'name email phone roleDetails status' },
    });

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  res.status(200).json({
    success: true,
    data: { booking },
  });
});

// =========================================================================
// 6. MONITOR REVIEWS
// =========================================================================

/**
 * @desc    Get all reviews with filters & pagination
 * @route   GET /api/admin/reviews
 */
exports.getReviews = catchAsync(async (req, res) => {
  const { search, rating, messId, studentId, page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;

  const query = {};

  if (rating && !isNaN(Number(rating))) {
    query.rating = Number(rating);
  }

  if (messId && mongoose.Types.ObjectId.isValid(messId)) {
    query.messId = messId;
  }

  if (studentId && mongoose.Types.ObjectId.isValid(studentId)) {
    query.studentId = studentId;
  }

  if (search) {
    query.comment = new RegExp(search.trim(), 'i');
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;
  const sort = { [sortBy]: order === 'asc' ? 1 : -1 };

  const [reviews, total] = await Promise.all([
    Review.find(query)
      .populate('studentId', 'name email avatarUrl')
      .populate('messId', 'name city')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Review.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: {
      reviews,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    },
  });
});

/**
 * @desc    Delete inappropriate/abusive review
 * @route   DELETE /api/admin/reviews/:id
 */
exports.deleteReview = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Use findOneAndDelete so Review schema post-hooks recalculate mess rating automatically
  const review = await Review.findOneAndDelete({ _id: id });

  if (!review) {
    return next(new AppError('Review not found', 404));
  }

  await logAdminAction({
    adminId: req.user._id,
    action: 'REVIEW_DELETED',
    targetType: 'Review',
    targetId: id,
    targetName: `Rating ${review.rating} for Mess ${review.messId}`,
    details: {
      comment: review.comment,
      studentId: review.studentId,
      messId: review.messId,
    },
    req,
  });

  res.status(200).json({
    success: true,
    message: 'Review removed successfully and mess rating updated',
  });
});

// =========================================================================
// 7. AUDIT LOGS
// =========================================================================

/**
 * @desc    Get system audit logs
 * @route   GET /api/admin/audit-logs
 */
exports.getAuditLogs = catchAsync(async (req, res) => {
  const { targetType, action, page = 1, limit = 15 } = req.query;

  const query = {};

  if (targetType) query.targetType = targetType;
  if (action) query.action = new RegExp(action.trim(), 'i');

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const [logs, total] = await Promise.all([
    AuditLog.find(query)
      .populate('adminId', 'name email avatarUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    AuditLog.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: {
      logs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    },
  });
});
