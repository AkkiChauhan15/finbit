import mongoose from 'mongoose';

import { connectDatabase, disconnectDatabase } from '../config/db.js';
import { env } from '../config/env.js';
import Asset from '../models/Asset.js';
import Expense from '../models/Expense.js';
import Feedback from '../models/Feedback.js';
import Habit from '../models/Habit.js';
import HabitCompletion from '../models/HabitCompletion.js';
import Income from '../models/Income.js';
import NetWorthSnapshot from '../models/NetWorthSnapshot.js';
import SavingsGoal from '../models/SavingsGoal.js';
import User from '../models/User.js';
import { getHabitPeriod, normalizeUtcDay } from '../utils/habitPeriods.js';

const seededModels = [
  Feedback,
  HabitCompletion,
  NetWorthSnapshot,
  Income,
  Expense,
  Habit,
  SavingsGoal,
  Asset,
  User,
];

const shiftUtcDays = (amount) => {
  const date = normalizeUtcDay();
  date.setUTCDate(date.getUTCDate() + amount);
  return date;
};

const shiftUtcMonths = (amount, day = 12) => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + amount, day));
};

const buildCompletion = (userId, habitId, frequency, date) => {
  const period = getHabitPeriod(date, frequency);
  return {
    user: userId,
    habit: habitId,
    completedOn: period.completedOn,
    periodStart: period.periodStart,
    periodEnd: period.periodEnd,
    periodKey: period.periodKey,
  };
};

const assertSafeResetTarget = () => {
  const databaseName = mongoose.connection.name;

  if (!/(^|[_-])(qa|test|demo)([_-]|$)/i.test(databaseName)) {
    throw new Error(
      `Refusing SEED_RESET for database “${databaseName}”. Use a database name containing qa, test, or demo.`,
    );
  }
};

const resetSeedCollections = async () => {
  assertSafeResetTarget();
  await Promise.all(seededModels.map((Model) => Model.deleteMany({})));
};

const seed = async () => {
  if (!env.mongoUri) {
    throw new Error('MONGO_URI is required to seed demo data.');
  }

  await connectDatabase(env.mongoUri);

  if (process.env.SEED_RESET === 'true') {
    await resetSeedCollections();
  } else {
    const existingDemoUser = await User.exists({ email: 'demo@wealth.local' });

    if (existingDemoUser) {
      throw new Error('Demo data already exists. Use a fresh database or set SEED_RESET=true.');
    }
  }

  const [admin, demo, inactive] = await User.create([
    {
      name: 'Avery Admin',
      email: 'admin@wealth.local',
      password: 'AdminDemo123!',
      role: 'admin',
      financialProfile: { currency: 'USD', monthlyIncomeGoal: 7500 },
    },
    {
      name: 'Jordan Demo',
      email: 'demo@wealth.local',
      password: 'DemoUser123!',
      financialProfile: { currency: 'USD', monthlyIncomeGoal: 6500 },
    },
    {
      name: 'Inactive Example',
      email: 'inactive@wealth.local',
      password: 'InactiveDemo123!',
      isActive: false,
      deactivatedAt: new Date(),
      financialProfile: { currency: 'EUR', monthlyIncomeGoal: 4000 },
    },
  ]);

  const income = [];
  const expenses = [];

  for (let monthOffset = -5; monthOffset <= 0; monthOffset += 1) {
    income.push({
      user: demo._id,
      source: monthOffset === 0 ? 'Salary' : `Salary ${Math.abs(monthOffset)}mo ago`,
      amount: 6200 + (monthOffset + 5) * 100,
      date: shiftUtcMonths(monthOffset, 2),
    });
    expenses.push(
      {
        user: demo._id,
        category: 'rent',
        amount: 1800,
        date: shiftUtcMonths(monthOffset, 4),
        notes: 'Monthly rent',
      },
      {
        user: demo._id,
        category: monthOffset % 2 === 0 ? 'food' : 'transport',
        amount: 520 + (monthOffset + 5) * 15,
        date: shiftUtcMonths(monthOffset, 14),
        notes: monthOffset % 2 === 0 ? 'Groceries and dining' : 'Transit and fuel',
      },
      {
        user: demo._id,
        category: 'utilities',
        amount: 210,
        date: shiftUtcMonths(monthOffset, 18),
        notes: 'Utilities and internet',
      },
    );
  }

  await Promise.all([Income.insertMany(income), Expense.insertMany(expenses)]);

  const [dailyHabit, weeklyHabit, missedHabit] = await Habit.create([
    {
      user: demo._id,
      name: 'Review daily spending',
      type: 'budgeting',
      frequency: 'daily',
    },
    {
      user: demo._id,
      name: 'Weekly portfolio check-in',
      type: 'investing',
      frequency: 'weekly',
    },
    {
      user: demo._id,
      name: 'Missed-day streak example',
      type: 'saving',
      frequency: 'daily',
    },
  ]);

  const completions = [];

  for (let offset = -4; offset <= 0; offset += 1) {
    completions.push(buildCompletion(demo._id, dailyHabit._id, 'daily', shiftUtcDays(offset)));
  }

  completions.push(
    buildCompletion(demo._id, weeklyHabit._id, 'weekly', new Date()),
    buildCompletion(demo._id, missedHabit._id, 'daily', shiftUtcDays(-3)),
    buildCompletion(demo._id, missedHabit._id, 'daily', shiftUtcDays(-2)),
  );
  await HabitCompletion.insertMany(completions);

  const [emergencyGoal, vacationGoal, fundedGoal] = await SavingsGoal.create([
    {
      user: demo._id,
      name: 'Six-month emergency fund',
      targetAmount: 18000,
      currentAmount: 9200,
      targetDate: shiftUtcMonths(8, 28),
      category: 'emergency_fund',
      contributions: [
        { amount: 700, date: shiftUtcDays(-55) },
        { amount: 900, date: shiftUtcDays(-27) },
        { amount: 1000, date: shiftUtcDays(-3) },
      ],
    },
    {
      user: demo._id,
      name: 'Japan vacation',
      targetAmount: 6000,
      currentAmount: 3200,
      targetDate: shiftUtcMonths(6, 15),
      category: 'vacation',
      contributions: [
        { amount: 500, date: shiftUtcDays(-42) },
        { amount: 600, date: shiftUtcDays(-11) },
      ],
    },
    {
      user: demo._id,
      name: 'New laptop',
      targetAmount: 2400,
      currentAmount: 2400,
      targetDate: shiftUtcMonths(1, 25),
      category: 'other',
      contributions: [{ amount: 2400, date: shiftUtcDays(-8) }],
    },
  ]);

  await Asset.create([
    {
      user: demo._id,
      type: 'stocks',
      name: 'Broad market index funds',
      currentValue: 28400,
      dateUpdated: normalizeUtcDay(),
    },
    {
      user: demo._id,
      type: 'retirement',
      name: 'Retirement account',
      currentValue: 41750,
      dateUpdated: normalizeUtcDay(),
    },
    {
      user: demo._id,
      type: 'cash',
      name: 'Everyday cash reserve',
      currentValue: 6500,
      dateUpdated: normalizeUtcDay(),
    },
  ]);

  const snapshotRows = Array.from({ length: 6 }, (_, index) => {
    const monthOffset = index - 5;
    const totalSavings = 9200 + index * 480;
    const totalAssets = 66500 + index * 1750;

    return {
      user: demo._id,
      date: shiftUtcMonths(monthOffset, 1),
      totalSavings,
      totalAssets,
      netWorth: totalSavings + totalAssets,
    };
  });
  snapshotRows.push({
    user: demo._id,
    date: normalizeUtcDay(),
    totalSavings:
      emergencyGoal.currentAmount + vacationGoal.currentAmount + fundedGoal.currentAmount,
    totalAssets: 76650,
    netWorth:
      emergencyGoal.currentAmount + vacationGoal.currentAmount + fundedGoal.currentAmount + 76650,
  });
  await NetWorthSnapshot.insertMany(snapshotRows);

  await Feedback.create([
    {
      user: demo._id,
      category: 'feedback',
      subject: 'Monthly charts are useful',
      message: 'The monthly cash-flow comparison makes planning much easier to understand.',
    },
    {
      user: demo._id,
      category: 'complaint',
      subject: 'Would like CSV export',
      message: 'Please add a CSV export option for transaction history in a future release.',
    },
  ]);

  console.log('Demo seed completed.');
  console.log('User: demo@wealth.local / DemoUser123!');
  console.log('Admin: admin@wealth.local / AdminDemo123!');
  console.log(`Seeded database: ${mongoose.connection.name}`);
  console.log(
    `Records belong to demo user id: ${demo.id}; admin id: ${admin.id}; inactive id: ${inactive.id}`,
  );
};

try {
  await seed();
  await disconnectDatabase();
} catch (error) {
  console.error(`Seed failed: ${error.message}`);
  await disconnectDatabase();
  process.exitCode = 1;
}
