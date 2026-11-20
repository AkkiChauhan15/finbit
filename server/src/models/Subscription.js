import mongoose from 'mongoose';

import { expenseCategories } from './Expense.js';

export const subscriptionFrequencies = ['weekly', 'monthly', 'yearly'];

const roundCurrency = (value) => Math.round(Number(value) * 100) / 100;

const subscriptionSchema = new mongoose.Schema(
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
      maxlength: 80,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
      set: roundCurrency,
    },
    category: {
      type: String,
      required: true,
      enum: expenseCategories,
    },
    frequency: {
      type: String,
      required: true,
      enum: subscriptionFrequencies,
    },
    nextDueDate: {
      type: Date,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
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

subscriptionSchema.index({ user: 1, active: 1, nextDueDate: 1 });

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;
