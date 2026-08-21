import mongoose from 'mongoose';

export const habitTypes = ['saving', 'spending', 'investing', 'budgeting', 'learning', 'other'];
export const habitFrequencies = ['daily', 'weekly', 'monthly'];

const habitSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    type: {
      type: String,
      required: true,
      enum: habitTypes,
    },
    frequency: {
      type: String,
      required: true,
      enum: habitFrequencies,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

habitSchema.index({ user: 1, active: 1, createdAt: -1 });

const Habit = mongoose.model('Habit', habitSchema);

export default Habit;
