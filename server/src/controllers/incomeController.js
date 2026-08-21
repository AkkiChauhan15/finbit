import Income from '../models/Income.js';
import { AppError } from '../utils/AppError.js';
import { buildDateRange } from '../utils/dateRange.js';
import { ownedRecordFilter, userScope } from '../utils/ownership.js';

export const createIncome = async (request, response) => {
  const income = await Income.create({
    user: request.user.id,
    source: request.body.source,
    amount: request.body.amount,
    date: request.body.date,
  });

  response.status(201).json({ income });
};

export const getIncome = async (request, response) => {
  const query = userScope(request.user.id);
  const dateRange = buildDateRange(request.query.startDate, request.query.endDate);

  if (dateRange) {
    query.date = dateRange;
  }

  const income = await Income.find(query)
    .sort({ date: -1, createdAt: -1 })
    .limit(request.query.limit ?? 100);

  response.status(200).json({ income, count: income.length });
};

export const updateIncome = async (request, response) => {
  const updates = Object.fromEntries(
    ['source', 'amount', 'date']
      .filter((field) => request.body[field] !== undefined)
      .map((field) => [field, request.body[field]]),
  );
  const income = await Income.findOneAndUpdate(
    ownedRecordFilter(request.user.id, request.params.id),
    updates,
    { new: true, runValidators: true },
  );

  if (!income) {
    throw new AppError('Income record not found', 404);
  }

  response.status(200).json({ income });
};

export const deleteIncome = async (request, response) => {
  const income = await Income.findOneAndDelete(
    ownedRecordFilter(request.user.id, request.params.id),
  );

  if (!income) {
    throw new AppError('Income record not found', 404);
  }

  response.status(204).send();
};
