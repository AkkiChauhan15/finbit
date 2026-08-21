import mongoose from 'mongoose';

const habitCompletionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    habit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Habit',
      required: true,
      index: true,
    },
    completedOn: {
      type: Date,
      required: true,
    },
    periodKey: {
      type: String,
      required: true,
    },
    periodStart: {
      type: Date,
      required: true,
    },
    periodEnd: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

habitCompletionSchema.index({ user: 1, habit: 1, periodKey: 1 }, { unique: true });
habitCompletionSchema.index({ user: 1, habit: 1, periodStart: -1 });
habitCompletionSchema.index({ user: 1, createdAt: -1 });

const HabitCompletion = mongoose.model('HabitCompletion', habitCompletionSchema);

export default HabitCompletion;
