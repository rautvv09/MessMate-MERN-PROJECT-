const AuditLog = require('../models/AuditLog');

/**
 * Logs an administrative action to the AuditLog collection.
 * 
 * @param {Object} params
 * @param {string|mongoose.Types.ObjectId} params.adminId - The admin user ID performing the action
 * @param {string} params.action - Action identifier e.g. 'USER_SUSPENDED', 'REVIEW_DELETED'
 * @param {string} params.targetType - Target entity type: 'User', 'MessListing', 'Booking', 'Review'
 * @param {string|mongoose.Types.ObjectId} [params.targetId] - ID of the target resource
 * @param {string} [params.targetName] - Human-readable name of target (e.g. Student Name, Mess Name)
 * @param {Object} [params.details] - Detailed payload or reasons
 * @param {Object} [params.req] - Express request object to extract IP and user-agent
 */
const logAdminAction = async ({
  adminId,
  action,
  targetType,
  targetId = null,
  targetName = null,
  details = {},
  req = null,
}) => {
  try {
    const ipAddress = req
      ? req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || req.ip
      : null;
    const userAgent = req ? req.headers['user-agent'] : null;

    await AuditLog.create({
      adminId,
      action,
      targetType,
      targetId,
      targetName,
      details,
      ipAddress,
      userAgent,
    });
  } catch (error) {
    // Non-blocking error logging — audit logging failures should not crash user operations
    console.error('[AuditLogger Error]:', error.message);
  }
};

module.exports = { logAdminAction };
