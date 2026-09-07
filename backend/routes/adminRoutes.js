const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const {
  getDashboardStats,
  getStudents,
  getStudentById,
  updateStudentStatus,
  deleteStudent,
  getOwners,
  getOwnerById,
  updateOwnerStatus,
  deleteOwner,
  getMesses,
  getMessById,
  updateMessStatus,
  deleteMess,
  getBookings,
  getBookingById,
  getReviews,
  deleteReview,
  getAuditLogs,
} = require('../controllers/adminController');

const router = express.Router();

// Enforce strict authentication & admin-only role for every route in this router
router.use(protect);
router.use(restrictTo('admin'));

// 1. Dashboard Stats
router.get('/dashboard/stats', getDashboardStats);

// 2. Students Management
router.get('/students', getStudents);
router.get('/students/:id', getStudentById);
router.patch('/students/:id/status', updateStudentStatus);
router.delete('/students/:id', deleteStudent);

// 3. Mess Owners Management
router.get('/owners', getOwners);
router.get('/owners/:id', getOwnerById);
router.patch('/owners/:id/status', updateOwnerStatus);
router.delete('/owners/:id', deleteOwner);

// 4. Mess Listings Management
router.get('/messes', getMesses);
router.get('/messes/:id', getMessById);
router.patch('/messes/:id/status', updateMessStatus);
router.delete('/messes/:id', deleteMess);

// 5. Bookings Monitor
router.get('/bookings', getBookings);
router.get('/bookings/:id', getBookingById);

// 6. Reviews Moderation
router.get('/reviews', getReviews);
router.delete('/reviews/:id', deleteReview);

// 7. Audit Trail
router.get('/audit-logs', getAuditLogs);

module.exports = router;
