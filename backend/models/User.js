const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },

    password: {
      type: String,
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
      required: function () {
        // Only required if this account has no Google identity attached at all
        return !this.googleId;
      },
    },

    phone: {
      type: String,
      match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian phone number'],
      required: function () {
        // Only required for accounts created via local (email/password) signup
        return !this.googleId;
      },
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
      default: null,
    },

    avatarUrl: {
      type: String,
      default: null,
    },
    avatarPublicId: {
      type: String,
      default: null,
    },

    role: {
      type: String,
      enum: {
        values: ['student', 'owner'],
        message: 'Role must be either student or owner',
      },
      required: true,
      immutable: true,
    },

    roleDetails: {
      college: {
        type: String,
        trim: true,
        required: function () {
          return this.role === 'student';
        },
      },
      city: {
        type: String,
        trim: true,
        required: function () {
          return this.role === 'student';
        },
      },
      businessName: {
        type: String,
        trim: true,
        required: function () {
          return this.role === 'owner';
        },
      },
      address: {
        type: String,
        trim: true,
        required: function () {
          return this.role === 'owner';
        },
      },
      isVerifiedOwner: { type: Boolean, default: false },
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
      default: null,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
      default: null,
    },

    passwordResetToken: {
      type: String,
      select: false,
      default: null,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
      default: null,
    },

    refreshTokens: {
      type: [String],
      select: false,
      default: [],
    },

    loginAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    lockUntil: {
      type: Date,
      default: null,
      select: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// ==================== INDEXES ====================
userSchema.index({ role: 1 });

// ==================== PASSWORD HASHING & PRE-SAVE ====================
userSchema.pre('save', async function () {
  // Ensure googleId is strictly undefined if null or empty, to avoid sparse index collisions
  if (this.googleId === null || this.googleId === '') {
    this.googleId = undefined;
  }

  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// ==================== INSTANCE METHODS ====================

userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false; // Google-only account has no password to compare against
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshTokens;
  delete obj.emailVerificationToken;
  delete obj.emailVerificationExpires;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  delete obj.loginAttempts;
  delete obj.lockUntil;
  return obj;
};

// ---- Account lockout: is this account currently locked? ----
userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// ---- Called on every failed password attempt ----
userSchema.methods.incrementLoginAttempts = async function () {
  const config = require('../config/env');

  // If a previous lock has already expired, start a fresh attempt count instead of
  // continuing to pile onto the old, expired lock window
  if (this.lockUntil && this.lockUntil < Date.now()) {
    this.loginAttempts = 1;
    this.lockUntil = null;
  } else {
    this.loginAttempts += 1;
  }

  if (this.loginAttempts >= config.security.maxLoginAttempts && !this.isLocked()) {
    this.lockUntil = Date.now() + config.security.lockTimeMinutes * 60 * 1000;
  }

  await this.save({ validateBeforeSave: false });
};

// ---- Called on every successful login: reset the counter ----
userSchema.methods.resetLoginAttempts = async function () {
  this.loginAttempts = 0;
  this.lockUntil = null;
  await this.save({ validateBeforeSave: false });
};

// ---- Generate a raw email-verification token, store only its hash ----
userSchema.methods.generateEmailVerificationToken = function () {
  const config = require('../config/env');
  const rawToken = crypto.randomBytes(32).toString('hex');

  this.emailVerificationToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  const [value, unit] = [parseInt(config.tokenExpiry.emailVerification), config.tokenExpiry.emailVerification.slice(-1)];
  const hours = unit === 'h' ? value : 24;
  this.emailVerificationExpires = Date.now() + hours * 60 * 60 * 1000;

  return rawToken; // the RAW token is what gets emailed — never store this raw value
};

// ---- Generate a raw password-reset token, store only its hash ----
userSchema.methods.generatePasswordResetToken = function () {
  const config = require('../config/env');
  const rawToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  const [value, unit] = [parseInt(config.tokenExpiry.passwordReset), config.tokenExpiry.passwordReset.slice(-1)];
  const hours = unit === 'h' ? value : 1;
  this.passwordResetExpires = Date.now() + hours * 60 * 60 * 1000;

  return rawToken;
};

module.exports = mongoose.model('User', userSchema);