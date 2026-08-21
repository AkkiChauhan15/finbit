import Expense from '../models/Expense.js';
import Income from '../models/Income.js';
import { roundTotal } from '../utils/dateRange.js';
import { userScope } from '../utils/ownership.js';

const aggregateByMonth = (Model, userId, startDate, endDate) =>
  Model.aggregate([
    {
      $match: userScope(userId, { date: { $gte: startDate, $lt: endDate } }),
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$date', timezone: 'UTC' } },
        total: { $sum: '$amount' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

const monthKey = (date) =>
  `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;

export const getMonthlyReport = async (request, response) => {
  const numberOfMonths = request.query.months ?? 6;
  const now = new Date();
  const startDate = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - numberOfMonths + 1, 1),
  );
  const endDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const [incomeTotals, expenseTotals] = await Promise.all([
    aggregateByMonth(Income, request.user._id, startDate, endDate),
    aggregateByMonth(Expense, request.user._id, startDate, endDate),
  ]);
  const incomeByMonth = new Map(incomeTotals.map(({ _id, total }) => [_id, roundTotal(total)]));
  const expensesByMonth = new Map(expenseTotals.map(({ _id, total }) => [_id, roundTotal(total)]));
  const months = Array.from({ length: numberOfMonths }, (_, index) => {
    const date = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth() + index, 1));
    const month = monthKey(date);

    return {
      month,
      income: incomeByMonth.get(month) ?? 0,
      expenses: expensesByMonth.get(month) ?? 0,
    };
  });

  response.status(200).json({
    months,
    period: {
      months: numberOfMonths,
      startDate: startDate.toISOString(),
      endDate: new Date(endDate.getTime() - 1).toISOString(),
    },
  });
};
