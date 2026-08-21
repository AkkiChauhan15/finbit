import mongoose from 'mongoose';

const roundCurrency = (value) => Math.round(Number(value) * 100) / 100;

const incomeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    source: {
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
    date: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

incomeSchema.index({ user: 1, date: -1 });
incomeSchema.index({ user: 1, createdAt: -1 });

const Income = mongoose.model('Income', incomeSchema);

export default Income;
