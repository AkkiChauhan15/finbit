import Expense from '../models/Expense.js';
import HabitCompletion from '../models/HabitCompletion.js';
import Income from '../models/Income.js';
import NetWorthSnapshot from '../models/NetWorthSnapshot.js';
import SavingsGoal from '../models/SavingsGoal.js';
import { buildActiveHabitSummaries } from '../services/habitSummaryService.js';
import { calculateCurrentNetWorth } from '../services/netWorthService.js';
import { roundTotal } from '../utils/dateRange.js';
import { calculateGoalProgress } from '../utils/goalProgress.js';
import { userScope } from '../utils/ownership.js';

const aggregateMonthTotal = async (Model, userId, startDate, endDate) => {
  const [result] = await Model.aggregate([
    { $match: userScope(userId, { date: { $gte: startDate, $lt: endDate } }) },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  return roundTotal(result?.total ?? 0);
};

export const getDashboardSummary = async (request, response) => {
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const nextMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const [
    incomeTotal,
    expenseTotal,
    netWorth,
    habitSummaries,
    goals,
    recentIncome,
    recentExpenses,
    recentHabitCompletions,
    snapshotsDescending,
  ] = await Promise.all([
    aggregateMonthTotal(Income, request.user._id, monthStart, nextMonthStart),
    aggregateMonthTotal(Expense, request.user._id, monthStart, nextMonthStart),
    calculateCurrentNetWorth(request.user._id),
    buildActiveHabitSummaries(request.user.id, { includeHistory: false }),
    SavingsGoal.find(userScope(request.user.id)).sort({ targetDate: 1 }),
    Income.find(userScope(request.user.id)).sort({ date: -1, createdAt: -1 }).limit(5),
    Expense.find(userScope(request.user.id)).sort({ date: -1, createdAt: -1 }).limit(5),
    HabitCompletion.find(userScope(request.user.id))
      .sort({ completedOn: -1, createdAt: -1 })
      .limit(5)
      .populate('habit', 'name'),
    NetWorthSnapshot.find(userScope(request.user.id)).sort({ date: -1 }).limit(12),
  ]);
  const netSavings = roundTotal(incomeTotal - expenseTotal);
  const savingsRate = incomeTotal > 0 ? Math.round((netSavings / incomeTotal) * 1000) / 10 : 0;
  const goalSummaries = goals.map((goal) => ({
    ...goal.toJSON(),
    progress: calculateGoalProgress(goal, now),
  }));
  const activeGoals = goalSummaries.filter((goal) => goal.progress.status !== 'completed');
  const onTrackGoals = activeGoals.filter((goal) => goal.progress.status === 'on-track');
  const topHabits = [...habitSummaries]
    .sort(
      (first, second) =>
        second.currentStreak - first.currentStreak || second.longestStreak - first.longestStreak,
    )
    .slice(0, 3);
  const goalActivities = goals.flatMap((goal) =>
    goal.contributions.map((contribution) => ({
      type: 'goal',
      title: goal.name,
      detail: 'Savings contribution',
      amount: contribution.amount,
      date: contribution.date,
    })),
  );
  const recentActivity = [
    ...recentIncome.map((income) => ({
      type: 'income',
      title: income.source,
      detail: 'Income recorded',
      amount: income.amount,
      date: income.date,
    })),
    ...recentExpenses.map((expense) => ({
      type: 'expense',
      title: expense.notes || expense.category,
      detail: expense.category,
      amount: expense.amount,
      date: expense.date,
    })),
    ...recentHabitCompletions.map((completion) => ({
      type: 'habit',
      title: completion.habit?.name ?? 'Deleted habit',
      detail: 'Habit completed',
      date: completion.completedOn,
    })),
    ...goalActivities,
  ]
    .sort((first, second) => new Date(second.date) - new Date(first.date))
    .slice(0, 8);
  const netWorthHistory = snapshotsDescending.reverse();
  const latestSnapshot = netWorthHistory.at(-1);
  const todayKey = now.toISOString().slice(0, 10);
  const latestSnapshotKey = latestSnapshot?.date.toISOString().slice(0, 10);
  const isSnapshotStale =
    !latestSnapshot ||
    latestSnapshotKey !== todayKey ||
    Number(latestSnapshot.netWorth) !== netWorth.netWorth;

  response.status(200).json({
    period: {
      month: monthStart.toISOString().slice(0, 7),
      startDate: monthStart.toISOString(),
      endDate: new Date(nextMonthStart.getTime() - 1).toISOString(),
    },
    cashFlow: {
      income: incomeTotal,
      expenses: expenseTotal,
      netSavings,
      savingsRate,
    },
    netWorth: {
      ...netWorth,
      latestSnapshotDate: latestSnapshot?.date ?? null,
      isSnapshotStale,
    },
    habits: {
      activeCount: habitSummaries.length,
      top: topHabits,
    },
    goals: {
      activeCount: activeGoals.length,
      onTrackCount: onTrackGoals.length,
      items: activeGoals.slice(0, 3),
    },
    netWorthHistory,
    recentActivity,
  });
};
