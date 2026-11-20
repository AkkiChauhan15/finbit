import Expense from '../models/Expense.js';
import Income from '../models/Income.js';
import { requestForecast } from '../services/forecastClient.js';
import { calculateCurrentNetWorth } from '../services/netWorthService.js';
import { roundTotal } from '../utils/dateRange.js';
import { userScope } from '../utils/ownership.js';

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

export const getForecast = async (request, response) => {
  const horizon = request.query.months ?? 3;
  const now = new Date();
  const startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1));
  const endDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const [monthlyExpenses, monthlyIncome, netWorth] = await Promise.all([
    aggregateMonthlyTotals(Expense, request.user._id, startDate, endDate),
    aggregateMonthlyTotals(Income, request.user._id, startDate, endDate),
    calculateCurrentNetWorth(request.user._id),
  ]);

  const forecast = await requestForecast({
    monthlyExpenses,
    monthlyIncome,
    currentBalance: netWorth.netWorth,
    horizonMonths: horizon,
  });

  response.status(200).json({ forecast });
};
