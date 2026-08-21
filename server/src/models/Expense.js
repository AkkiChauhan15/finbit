import mongoose from 'mongoose';

export const expenseCategories = [
  'food',
  'transport',
  'rent',
  'utilities',
  'entertainment',
  'other',
];

const roundCurrency = (value) => Math.round(Number(value) * 100) / 100;

const expenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      enum: expenseCategories,
    },
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
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
  },
  { timestamps: true },
);

expenseSchema.index({ user: 1, date: -1 });
expenseSchema.index({ user: 1, category: 1, date: -1 });
expenseSchema.index({ user: 1, createdAt: -1 });

const Expense = mongoose.model('Expense', expenseSchema);

export default Expense;
