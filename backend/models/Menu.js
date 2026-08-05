const mongoose = require('mongoose');

const dayMenuSchema = new mongoose.Schema(
  {
    lunch: { type: [String], default: [] },
    dinner: { type: [String], default: [] },
  },
  { _id: false }
);

const menuSchema = new mongoose.Schema(
  {
    messId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MessListing',
      required: true,
      unique: true,
    },
    breakfast: { type: [String], default: [] },
    weeklyMenu: {
      monday: { type: dayMenuSchema, default: () => ({}) },
      tuesday: { type: dayMenuSchema, default: () => ({}) },
      wednesday: { type: dayMenuSchema, default: () => ({}) },
      thursday: { type: dayMenuSchema, default: () => ({}) },
      friday: { type: dayMenuSchema, default: () => ({}) },
      saturday: { type: dayMenuSchema, default: () => ({}) },
      sunday: { type: dayMenuSchema, default: () => ({}) },
    },
    lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Menu', menuSchema);