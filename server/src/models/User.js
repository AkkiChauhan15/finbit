import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

import { env } from '../config/env.js';

const financialProfileSchema = new mongoose.Schema(
  {
    currency: {
      type: String,
      default: 'USD',
      trim: true,
      uppercase: true,
      minlength: 3,
      maxlength: 3,
    },
    monthlyIncomeGoal: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
    deactivatedAt: {
      type: Date,
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
    financialProfile: {
      type: financialProfileSchema,
      default: () => ({}),
    },
    refreshTokenHash: {
      type: String,
      select: false,
    },
  },
  { timestamps: true },
);

userSchema.index({ isActive: 1, lastActiveAt: -1 });
userSchema.index({ deletedAt: 1, isActive: 1, role: 1, createdAt: -1 });

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) {
    return;
  }

  this.password = await bcrypt.hash(this.password, env.bcryptRounds);
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const removeSensitiveFields = (_document, returnedObject) => {
  delete returnedObject.password;
  delete returnedObject.refreshTokenHash;
  delete returnedObject.__v;
  return returnedObject;
};

userSchema.set('toJSON', { transform: removeSensitiveFields });
userSchema.set('toObject', { transform: removeSensitiveFields });

const User = mongoose.model('User', userSchema);

export default User;
