import Expense from '../models/Expense.js';
import Income from '../models/Income.js';
import SavingsGoal from '../models/SavingsGoal.js';
import Subscription from '../models/Subscription.js';
import { requestAnomalies, requestForecast } from './forecastClient.js';
import { calculateCurrentNetWorth } from './netWorthService.js';
import { roundTotal } from '../utils/dateRange.js';
import { calculateGoalProgress } from '../utils/goalProgress.js';
import { userScope } from '../utils/ownership.js';

const millisecondsPerDay = 24 * 60 * 60 * 1000;

const aggregateMonthTotal = async (Model, userId, startDate, endDate) => {
  const [result] = await Model.aggregate([
    { $match: userScope(userId, { date: { $gte: startDate, $lt: endDate } }) },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  return roundTotal(result?.total ?? 0);
};

const aggregateMonthlyTotals = async (Model, userId, startDate, endDate) => {
  const totals = await Model.aggregate([
    { $match: userScope(userId, { date: { $gte: startDate, $lt: endDate } }) },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$date', timezone: 'UTC' } },
        total: { $sum: '$amount' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return totals.map(({ _id, total }) => ({ month: _id, total: roundTotal(total) }));
};

export const buildAssistantSummary = async (userId) => {
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const lastMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const nextMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const upcomingWindowEnd = new Date(now.getTime() + 30 * millisecondsPerDay);

  const [
    thisMonthIncome,
    thisMonthExpenses,
    lastMonthIncome,
    lastMonthExpenses,
    goals,
    upcoming,
    recentExpenses,
  ] = await Promise.all([
    aggregateMonthTotal(Income, userId, monthStart, nextMonthStart),
    aggregateMonthTotal(Expense, userId, monthStart, nextMonthStart),
    aggregateMonthTotal(Income, userId, lastMonthStart, monthStart),
    aggregateMonthTotal(Expense, userId, lastMonthStart, monthStart),
    SavingsGoal.find(userScope(userId)).sort({ targetDate: 1 }),
    Subscription.find(userScope(userId, { active: true, nextDueDate: { $lte: upcomingWindowEnd } }))
      .sort({ nextDueDate: 1 })
      .limit(5),
    Expense.find(userScope(userId, { date: { $gte: monthStart, $lt: nextMonthStart } })).select(
      'category amount',
    ),
  ]);

  const savingsRate =
    thisMonthIncome > 0
      ? Math.round(((thisMonthIncome - thisMonthExpenses) / thisMonthIncome) * 1000) / 10
      : 0;

  const categoryTotals = new Map();

  for (const expense of recentExpenses) {
    categoryTotals.set(
      expense.category,
      (categoryTotals.get(expense.category) ?? 0) + expense.amount,
    );
  }

  const topCategories = [...categoryTotals.entries()]
    .map(([category, total]) => ({ category, total: roundTotal(total) }))
    .sort((first, second) => second.total - first.total)
    .slice(0, 3);

  const savingsGoals = goals.map((goal) => {
    const progress = calculateGoalProgress(goal, now);

    return {
      name: goal.name,
      status: progress.status,
      percentageComplete: progress.percentageComplete,
    };
  });

  const upcomingBills = upcoming.map((subscription) => ({
    name: subscription.name,
    amount: subscription.amount,
    daysUntil: Math.ceil((subscription.nextDueDate - now) / millisecondsPerDay),
  }));

  let forecastRisk = null;

  try {
    const startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1));
    const [monthlyExpenses, monthlyIncome, netWorth] = await Promise.all([
      aggregateMonthlyTotals(Expense, userId, startDate, nextMonthStart),
      aggregateMonthlyTotals(Income, userId, startDate, nextMonthStart),
      calculateCurrentNetWorth(userId),
    ]);
    const forecast = await requestForecast({
      monthlyExpenses,
      monthlyIncome,
      currentBalance: netWorth.netWorth,
      horizonMonths: 3,
    });
    forecastRisk = forecast.cashFlowShortageRisk?.risk ?? null;
  } catch {
    forecastRisk = null;
  }

  let anomalyCount = null;

  try {
    const ninetyDaysAgo = new Date(now.getTime() - 90 * millisecondsPerDay);
    const expenses = await Expense.find(
      userScope(userId, { date: { $gte: ninetyDaysAgo } }),
    ).select('category amount date');
    const { anomalies } = await requestAnomalies(
      expenses.map((expense) => ({
        id: expense._id.toString(),
        date: expense.date.toISOString().slice(0, 10),
        category: expense.category,
        amount: expense.amount,
      })),
    );
    anomalyCount = anomalies.length;
  } catch {
    anomalyCount = null;
  }

  return {
    thisMonth: { income: thisMonthIncome, expenses: thisMonthExpenses, savingsRate },
    lastMonth: { income: lastMonthIncome, expenses: lastMonthExpenses },
    topCategories,
    savingsGoals,
    upcomingBills,
    forecastRisk,
    anomalyCount,
  };
};
