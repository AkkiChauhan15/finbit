import mongoose from 'mongoose';

export const assetTypes = [
  'cash',
  'stocks',
  'bonds',
  'mutual_funds',
  'retirement',
  'real_estate',
  'crypto',
  'other',
];

const roundCurrency = (value) => Math.round(Number(value) * 100) / 100;

const assetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: assetTypes,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    currentValue: {
      type: Number,
      required: true,
      min: 0,
      set: roundCurrency,
    },
    dateUpdated: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { timestamps: true },
);

assetSchema.index({ user: 1, type: 1 });
assetSchema.index({ user: 1, dateUpdated: -1 });
assetSchema.index({ user: 1, currentValue: -1, dateUpdated: -1 });
assetSchema.index({ user: 1, updatedAt: -1 });

const Asset = mongoose.model('Asset', assetSchema);

export default Asset;
