import Asset from '../models/Asset.js';
import Expense from '../models/Expense.js';
import Habit from '../models/Habit.js';
import HabitCompletion from '../models/HabitCompletion.js';
import Income from '../models/Income.js';
import SavingsGoal from '../models/SavingsGoal.js';
import User from '../models/User.js';
import { calculateCompletionRate, normalizeUtcDay } from '../utils/habitPeriods.js';

const roundOneDecimal = (value) => Math.round(Number(value) * 10) / 10;
const roundCurrency = (value) => Math.round(Number(value) * 100) / 100;

const monthKey = (date) => date.toISOString().slice(0, 7);

const buildMonthRange = (months = 6, now = new Date()) => {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - months + 1, 1));
  const items = Array.from({ length: months }, (_, index) => {
    const date = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + index, 1));
    return {
      month: monthKey(date),
      activeUserIds: new Set(),
      incomeRecords: 0,
      expenseRecords: 0,
      records: 0,
    };
  });

  return { start, items, byMonth: new Map(items.map((item) => [item.month, item])) };
};

const mergeActivityUsers = (byMonth, rows) => {
  for (const row of rows) {
    const month = byMonth.get(row._id);

    if (!month) continue;

    for (const userId of row.users) {
      month.activeUserIds.add(userId.toString());
    }
  }
};

const groupUsersByMonth = (Model, dateField, start, userIds) =>
  Model.aggregate([
    { $match: { user: { $in: userIds }, [dateField]: { $gte: start } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: `$${dateField}` } },
        users: { $addToSet: '$user' },
      },
    },
  ]);

const groupCashFlowByMonth = (Model, start, userIds) =>
  Model.aggregate([
    { $match: { user: { $in: userIds }, date: { $gte: start } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
        count: { $sum: 1 },
      },
    },
  ]);

export const getHabitCompletionStatsByUser = async (userIds, now = new Date()) => {
  const stats = new Map(userIds.map((id) => [id.toString(), { completed: 0, total: 0 }]));

  if (userIds.length === 0) return stats;

  const habits = await Habit.find({ user: { $in: userIds }, active: true }).select(
    'user frequency',
  );

  if (habits.length === 0) return stats;

  const oldestRelevantPeriod = normalizeUtcDay(now);
  oldestRelevantPeriod.setUTCDate(oldestRelevantPeriod.getUTCDate() - 61);
  const completions = await HabitCompletion.find({
    habit: { $in: habits.map((habit) => habit._id) },
    periodStart: { $gte: oldestRelevantPeriod },
  }).select('habit periodKey');
  const keysByHabit = new Map();

  for (const completion of completions) {
    const habitId = completion.habit.toString();
    const keys = keysByHabit.get(habitId) ?? new Set();
    keys.add(completion.periodKey);
    keysByHabit.set(habitId, keys);
  }

  for (const habit of habits) {
    const completion = calculateCompletionRate(
      habit.frequency,
      keysByHabit.get(habit.id) ?? new Set(),
      30,
      now,
    );
    const userStats = stats.get(habit.user.toString());
    userStats.completed += completion.completedPeriods;
    userStats.total += completion.totalPeriods;
  }

  return stats;
};

export const getTrackedNetWorthByUser = async (userIds) => {
  const totals = new Map(userIds.map((id) => [id.toString(), 0]));

  if (userIds.length === 0) return totals;

  const [goalTotals, assetTotals] = await Promise.all([
    SavingsGoal.aggregate([
      { $match: { user: { $in: userIds } } },
      { $group: { _id: '$user', total: { $sum: '$currentAmount' } } },
    ]),
    Asset.aggregate([
      { $match: { user: { $in: userIds } } },
      { $group: { _id: '$user', total: { $sum: '$currentValue' } } },
    ]),
  ]);

  for (const row of [...goalTotals, ...assetTotals]) {
    const id = row._id.toString();
    totals.set(id, roundCurrency((totals.get(id) ?? 0) + row.total));
  }

  return totals;
};

export const buildPlatformAnalytics = async (now = new Date()) => {
  const activeUsers = await User.find({ isActive: { $ne: false }, deletedAt: null }).select('_id');
  const activeUserIds = activeUsers.map((user) => user._id);
  const { start, items, byMonth } = buildMonthRange(6, now);
  const [
    habitStats,
    goals,
    loginActivity,
    incomeActivity,
    expenseActivity,
    habitActivity,
    assetActivity,
    contributionActivity,
    incomeTotals,
    expenseTotals,
  ] = await Promise.all([
    getHabitCompletionStatsByUser(activeUserIds, now),
    SavingsGoal.find({ user: { $in: activeUserIds } }).select('targetAmount currentAmount'),
    User.aggregate([
      { $match: { _id: { $in: activeUserIds }, lastActiveAt: { $gte: start } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$lastActiveAt' } },
          users: { $addToSet: '$_id' },
        },
      },
    ]),
    groupUsersByMonth(Income, 'createdAt', start, activeUserIds),
    groupUsersByMonth(Expense, 'createdAt', start, activeUserIds),
    groupUsersByMonth(HabitCompletion, 'createdAt', start, activeUserIds),
    groupUsersByMonth(Asset, 'updatedAt', start, activeUserIds),
    SavingsGoal.aggregate([
      { $unwind: '$contributions' },
      {
        $match: {
          user: { $in: activeUserIds },
          'contributions.createdAt': { $gte: start },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$contributions.createdAt' } },
          users: { $addToSet: '$user' },
        },
      },
    ]),
    groupCashFlowByMonth(Income, start, activeUserIds),
    groupCashFlowByMonth(Expense, start, activeUserIds),
  ]);

  for (const rows of [
    loginActivity,
    incomeActivity,
    expenseActivity,
    habitActivity,
    assetActivity,
    contributionActivity,
  ]) {
    mergeActivityUsers(byMonth, rows);
  }

  for (const row of incomeTotals) {
    const month = byMonth.get(row._id);
    if (month) {
      month.incomeRecords = row.count;
      month.records += row.count;
    }
  }

  for (const row of expenseTotals) {
    const month = byMonth.get(row._id);
    if (month) {
      month.expenseRecords = row.count;
      month.records += row.count;
    }
  }

  const habitTotals = [...habitStats.values()].reduce(
    (totals, item) => ({
      completed: totals.completed + item.completed,
      total: totals.total + item.total,
    }),
    { completed: 0, total: 0 },
  );
  const goalCompletionTotal = goals.reduce(
    (total, goal) => total + Math.min((goal.currentAmount / goal.targetAmount) * 100, 100),
    0,
  );
  const currentMonthActiveUsers = items.at(-1).activeUserIds.size;

  return {
    totalActiveUsers: activeUsers.length,
    averageHabitCompletionRate: habitTotals.total
      ? roundOneDecimal((habitTotals.completed / habitTotals.total) * 100)
      : 0,
    averageSavingsGoalCompletionRate: goals.length
      ? roundOneDecimal(goalCompletionTotal / goals.length)
      : 0,
    userEngagementRate: activeUsers.length
      ? roundOneDecimal((currentMonthActiveUsers / activeUsers.length) * 100)
      : 0,
    monthlyActiveUsers: items.map((item) => ({
      month: item.month,
      activeUsers: item.activeUserIds.size,
    })),
    monthlyFinancialActivity: items.map((item) => ({
      month: item.month,
      incomeRecords: item.incomeRecords,
      expenseRecords: item.expenseRecords,
      records: item.records,
    })),
  };
};
