import mongoose from 'mongoose';

const netWorthSnapshotSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
    },
    totalSavings: {
      type: Number,
      required: true,
      min: 0,
    },
    totalAssets: {
      type: Number,
      required: true,
      min: 0,
    },
    netWorth: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true },
);

netWorthSnapshotSchema.index({ user: 1, date: 1 }, { unique: true });

const NetWorthSnapshot = mongoose.model('NetWorthSnapshot', netWorthSnapshotSchema);

export default NetWorthSnapshot;
