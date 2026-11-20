import Expense from '../models/Expense.js';
import { requestAnomalies } from '../services/forecastClient.js';
import { userScope } from '../utils/ownership.js';

const millisecondsPerDay = 24 * 60 * 60 * 1000;

export const getAnomalies = async (request, response) => {
  const now = new Date();
  const startDate = new Date(now.getTime() - 90 * millisecondsPerDay);
  const expenses = await Expense.find(userScope(request.user.id, { date: { $gte: startDate } }))
    .select('category amount date')
    .sort({ date: -1 });

  const { anomalies } = await requestAnomalies(
    expenses.map((expense) => ({
      id: expense._id.toString(),
      date: expense.date.toISOString().slice(0, 10),
      category: expense.category,
      amount: expense.amount,
    })),
  );

  response.status(200).json({ anomalies, count: anomalies.length });
};
