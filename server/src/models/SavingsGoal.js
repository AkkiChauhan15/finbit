import mongoose from 'mongoose';

export const goalCategories = [
  'emergency_fund',
  'vacation',
  'home',
  'education',
  'retirement',
  'vehicle',
  'debt_payoff',
  'other',
];

const roundCurrency = (value) => Math.round(Number(value) * 100) / 100;

const contributionSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: 0.01,
      set: roundCurrency,
    },
    date: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

const savingsGoalSchema = new mongoose.Schema(
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
    targetAmount: {
      type: Number,
      required: true,
      min: 0.01,
      set: roundCurrency,
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: 0,
      set: roundCurrency,
    },
    targetDate: {
      type: Date,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: goalCategories,
    },
    contributions: {
      type: [contributionSchema],
      default: [],
    },
  },
  { timestamps: true },
);

savingsGoalSchema.index({ user: 1, targetDate: 1 });
savingsGoalSchema.index({ user: 1, category: 1 });
savingsGoalSchema.index({ user: 1, 'contributions.createdAt': -1 });

const SavingsGoal = mongoose.model('SavingsGoal', savingsGoalSchema);

export default SavingsGoal;
