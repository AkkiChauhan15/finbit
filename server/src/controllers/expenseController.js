import Expense from '../models/Expense.js';
import { AppError } from '../utils/AppError.js';
import { buildDateRange, roundTotal } from '../utils/dateRange.js';
import { ownedRecordFilter, userScope } from '../utils/ownership.js';

export const createExpense = async (request, response) => {
  const expense = await Expense.create({
    user: request.user.id,
    category: request.body.category,
    amount: request.body.amount,
    date: request.body.date,
    notes: request.body.notes ?? '',
  });

  response.status(201).json({ expense });
};

export const getExpenses = async (request, response) => {
  const query = userScope(request.user.id);
  const dateRange = buildDateRange(request.query.startDate, request.query.endDate);

  if (dateRange) {
    query.date = dateRange;
  }

  if (request.query.category) {
    query.category = request.query.category;
  }

  const expenses = await Expense.find(query)
    .sort({ date: -1, createdAt: -1 })
    .limit(request.query.limit ?? 100);

  response.status(200).json({ expenses, count: expenses.length });
};

export const updateExpense = async (request, response) => {
  const updates = Object.fromEntries(
    ['category', 'amount', 'date', 'notes']
      .filter((field) => request.body[field] !== undefined)
      .map((field) => [field, request.body[field]]),
  );
  const expense = await Expense.findOneAndUpdate(
    ownedRecordFilter(request.user.id, request.params.id),
    updates,
    { new: true, runValidators: true },
  );

  if (!expense) {
    throw new AppError('Expense record not found', 404);
  }

  response.status(200).json({ expense });
};

export const deleteExpense = async (request, response) => {
  const expense = await Expense.findOneAndDelete(
    ownedRecordFilter(request.user.id, request.params.id),
  );

  if (!expense) {
    throw new AppError('Expense record not found', 404);
  }

  response.status(204).send();
};

export const getExpenseSummary = async (request, response) => {
  const dateRange = buildDateRange(request.query.startDate, request.query.endDate);
  const grouped = await Expense.aggregate([
    {
      $match: userScope(request.user._id, { date: dateRange }),
    },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
      },
    },
    { $sort: { total: -1 } },
  ]);
  const summary = grouped.map(({ _id, total }) => ({ category: _id, total: roundTotal(total) }));
  const total = roundTotal(summary.reduce((sum, item) => sum + item.total, 0));

  response.status(200).json({
    summary,
    total,
    startDate: request.query.startDate,
    endDate: request.query.endDate,
  });
};
