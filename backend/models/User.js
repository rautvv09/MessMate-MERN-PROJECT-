const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian phone number'],
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
      isVerifiedOwner: {
        type: Boolean,
        default: false,
      },
    },
    avatarUrl: { type: String, default: null },
    avatarPublicId: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    preferences: {
      darkMode: { type: Boolean, default: false },
    },
    refreshToken: { type: String, default: null, select: false },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
