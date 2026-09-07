const User = require('../models/User');
const sendAuthSuccess = require('../utils/sendAuthSuccess');
const sendVerificationEmail = require('../utils/sendVerificationEmail'); // built in Module 7
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// @desc    Register via email/password
// @route   POST /api/auth/register
exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password, phone, role, roleDetails } = req.body;

  if (role === 'admin' || !['student', 'owner'].includes(role)) {
    return next(
      new AppError('Invalid role. Public registration is only permitted for students and mess owners.', 400)
    );
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('This email is already registered', 400));
  }

  const user = await User.create({
    name, email, password, phone, role,
    roleDetails: roleDetails || {},
  });

  // Generate a raw verification token (Module 3's schema method), email it (Module 7),
  // and store only the token's document, not the raw value
  const rawToken = user.generateEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  await sendVerificationEmail(user.email, user.name, rawToken);

  res.status(201).json({
    success: true,
    message: 'Registration successful. Please check your email to verify your account before logging in.',
    data: { email: user.email },
    // Deliberately NOT calling sendAuthSuccess here — no session is issued yet.
    // See the explanation below for why.
  });
});

// @desc    Login via email/password
// @route   POST /api/auth/login
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');

  // Deliberately identical, generic response whether the email doesn't exist at all,
  // or exists but the password is wrong — no information leakage either way
  if (!user) {
    return next(new AppError('Invalid email or password', 401));
  }

  // ---- Lockout check happens BEFORE password comparison ----
  if (user.isLocked()) {
    const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
    return next(
      new AppError(`Account temporarily locked due to too many failed attempts. Try again in ${minutesLeft} minute(s).`, 423)
    );
  }

  // ---- Google-only account attempting local login ----
  if (!user.password) {
    return next(
      new AppError('This account uses Google Sign-In. Please continue with Google instead.', 400)
    );
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    await user.incrementLoginAttempts();

    const attemptsLeft = require('../config/env').security.maxLoginAttempts - user.loginAttempts;
    const warning = attemptsLeft > 0 && attemptsLeft <= 2
      ? ` ${attemptsLeft} attempt(s) remaining before temporary lockout.`
      : '';

    return next(new AppError(`Invalid email or password.${warning}`, 401));
  }

  if (!user.isEmailVerified) {
    return next(new AppError('Please verify your email before logging in. Check your inbox.', 403));
  }

  if (!user.isActive || user.status === 'suspended' || user.status === 'inactive') {
    return next(
      new AppError(
        user.status === 'suspended'
          ? 'Your account has been suspended by an administrator. Please contact support.'
          : 'This account has been deactivated.',
        403
      )
    );
  }

  // ---- Success: reset the failed-attempt counter and issue a real session ----
  await user.resetLoginAttempts();
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  await sendAuthSuccess(user, res, 200);
});

// @desc    Authenticate via Google OAuth
// @route   POST /api/auth/google
exports.googleAuth = catchAsync(async (req, res, next) => {
  const { idToken, role, roleDetails } = req.body;

  if (!idToken) {
    return next(new AppError('Google ID token is required', 400));
  }

  const verifyGoogleToken = require('../utils/googleVerify');
  const googleProfile = await verifyGoogleToken(idToken);

  const { googleId, email, name, avatarUrl } = googleProfile;

  // 1. Try to find user by googleId
  let user = await User.findOne({ googleId }).select('+refreshTokens');

  if (user) {
    if (!user.isActive || user.status === 'suspended' || user.status === 'inactive') {
      return next(
        new AppError(
          user.status === 'suspended'
            ? 'Your account has been suspended by an administrator. Please contact support.'
            : 'This account has been deactivated',
          403
        )
      );
    }
    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });
    return sendAuthSuccess(user, res, 200);
  }

  // 2. Try to find user by email (linked account)
  user = await User.findOne({ email }).select('+refreshTokens');

  if (user) {
    if (!user.isActive || user.status === 'suspended' || user.status === 'inactive') {
      return next(
        new AppError(
          user.status === 'suspended'
            ? 'Your account has been suspended by an administrator. Please contact support.'
            : 'This account has been deactivated',
          403
        )
      );
    }
    user.googleId = googleId;
    if (!user.avatarUrl) {
      user.avatarUrl = avatarUrl;
    }
    user.isEmailVerified = true;
    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });
    return sendAuthSuccess(user, res, 200);
  }

  // 3. User does not exist, role selection is required
  if (!role) {
    return res.status(200).json({
      success: true,
      requiresRoleSelection: true,
      data: {
        googleProfile: {
          name,
          email,
          avatarUrl,
        },
      },
    });
  }

  if (!['student', 'owner'].includes(role)) {
    return next(new AppError('Invalid role selection', 400));
  }

  if (role === 'student') {
    if (!roleDetails?.college || !roleDetails?.city) {
      return next(new AppError('College and City are required for student signup', 400));
    }
  } else if (role === 'owner') {
    if (!roleDetails?.businessName || !roleDetails?.address) {
      return next(new AppError('Business Name and Address are required for owner signup', 400));
    }
  }

  user = await User.create({
    name,
    email,
    googleId,
    avatarUrl,
    role,
    roleDetails: roleDetails || {},
    isEmailVerified: true,
    lastLoginAt: new Date(),
  });

  return sendAuthSuccess(user, res, 201);
});


const jwt = require('jsonwebtoken');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateTokens');
const { accessTokenCookieOptions, refreshTokenCookieOptions } = require('../utils/cookieOptions');

// @desc    Exchange a valid refresh token for a new access token (silent renewal)
// @route   POST /api/auth/refresh
exports.refresh = catchAsync(async (req, res, next) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    return next(new AppError('No refresh token provided', 401));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, require('../config/env').jwt.refreshSecret);
  } catch (error) {
    return next(new AppError('Refresh token invalid or expired. Please log in again.', 401));
  }

  const user = await User.findById(decoded.id).select('+refreshTokens');

  if (!user) {
    return next(new AppError('User no longer exists', 401));
  }

  // This is the critical check: the token must not just be cryptographically valid,
  // it must ALSO still be present in this user's own list of currently-issued tokens
  if (!user.refreshTokens.includes(token)) {
    // A cryptographically valid token that's NOT in the active list means it was
    // already used-and-rotated, or explicitly revoked via logout — treat this as
    // a potential theft/replay signal and revoke every session as a precaution
    user.refreshTokens = [];
    await user.save({ validateBeforeSave: false });
    return next(new AppError('Session invalid. Please log in again.', 401));
  }

  // ---- Refresh Token Rotation: issue a NEW refresh token, invalidate the old one ----
  const newAccessToken = generateAccessToken(user._id, user.role);
  const newRefreshToken = generateRefreshToken(user._id);

  user.refreshTokens = user.refreshTokens
    .filter((t) => t !== token) // remove the old, now-used token
    .concat(newRefreshToken);    // add the new one

  await user.save({ validateBeforeSave: false });

  res.cookie('accessToken', newAccessToken, accessTokenCookieOptions);
  res.cookie('refreshToken', newRefreshToken, refreshTokenCookieOptions);

  res.status(200).json({ success: true, message: 'Session refreshed' });
});


const crypto = require('crypto');

// @desc    Verify email via the token from the emailed link
// @route   POST /api/auth/verify-email
exports.verifyEmail = catchAsync(async (req, res, next) => {
  const { token } = req.body;

  if (!token) {
    return next(new AppError('Verification token is required', 400));
  }

  // Hash the raw token the same way it was hashed at generation time (Module 3),
  // then search for a document whose stored hash matches
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  }).select('+emailVerificationToken +emailVerificationExpires');

  if (!user) {
    return next(new AppError('Verification link is invalid or has expired', 400));
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = null;
  user.emailVerificationExpires = null;
  await user.save({ validateBeforeSave: false });

  // Verification success is a natural, safe moment to log the student straight in —
  // they've just proven ownership of both the email and the original registration
  await sendAuthSuccess(user, res, 200);
});

// @desc    Resend verification email if the original expired or was lost
// @route   POST /api/auth/resend-verification
exports.resendVerification = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  // Deliberately generic response regardless of whether the account exists —
  // same anti-enumeration reasoning as the login error message
  if (!user || user.isEmailVerified) {
    return res.status(200).json({
      success: true,
      message: 'If an unverified account exists with that email, a new verification link has been sent.',
    });
  }

  const rawToken = user.generateEmailVerificationToken();
  await user.save({ validateBeforeSave: false });
  await sendVerificationEmail(user.email, user.name, rawToken);

  res.status(200).json({
    success: true,
    message: 'If an unverified account exists with that email, a new verification link has been sent.',
  });
});


// @desc    Log out of the current device only
// @route   POST /api/auth/logout
exports.logout = catchAsync(async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (token) {
    // req.user is populated by `protect`, which must run before this controller
    await User.findByIdAndUpdate(req.user._id, { $pull: { refreshTokens: token } });
  }

  res.clearCookie('accessToken', { path: '/' });
  res.clearCookie('refreshToken', { path: '/api/auth/refresh' });

  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// @desc    Log out of every device/session at once
// @route   POST /api/auth/logout-all
exports.logoutAll = catchAsync(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { refreshTokens: [] });

  res.clearCookie('accessToken', { path: '/' });
  res.clearCookie('refreshToken', { path: '/api/auth/refresh' });

  res.status(200).json({ success: true, message: 'Logged out of all devices' });
});


const sendPasswordResetEmail = require('../utils/sendPasswordResetEmail');

// @desc    Request a password reset email
// @route   POST /api/auth/forgot-password
exports.forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  // Same anti-enumeration principle as resendVerification — identical response either way
  const genericResponse = {
    success: true,
    message: 'If an account exists with that email, a password reset link has been sent.',
  };

  if (!user) return res.status(200).json(genericResponse);

  // A Google-only account has no password to reset at all
  if (!user.password) {
    return res.status(200).json(genericResponse);
  }

  const rawToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    await sendPasswordResetEmail(user.email, user.name, rawToken);
  } catch (error) {
    // If the email genuinely fails to send, don't leave a live, unusable reset token
    // sitting on the account indefinitely
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save({ validateBeforeSave: false });
    throw error;
  }

  res.status(200).json(genericResponse);
});

// @desc    Reset password using the token from the emailed link
// @route   POST /api/auth/reset-password
exports.resetPassword = catchAsync(async (req, res, next) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return next(new AppError('Token and new password are required', 400));
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+passwordResetToken +passwordResetExpires');

  if (!user) {
    return next(new AppError('Password reset link is invalid or has expired', 400));
  }

  user.password = password; // pre('save') hook re-hashes this automatically
  user.passwordResetToken = null;
  user.passwordResetExpires = null;

  // A password reset is a strong signal to invalidate every existing session —
  // if the reset was triggered because credentials were compromised, old sessions
  // (including a potential attacker's) should not silently continue working
  user.refreshTokens = [];

  await user.save();

  await sendAuthSuccess(user, res, 200);
});

