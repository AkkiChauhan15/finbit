import Expense from '../models/Expense.js';
import Subscription from '../models/Subscription.js';
import { AppError } from '../utils/AppError.js';
import { roundTotal } from '../utils/dateRange.js';
import { ownedRecordFilter, userScope } from '../utils/ownership.js';

const millisecondsPerDay = 24 * 60 * 60 * 1000;

const getOwnedSubscription = async (userId, subscriptionId) => {
  const subscription = await Subscription.findOne(ownedRecordFilter(userId, subscriptionId));

  if (!subscription) {
    throw new AppError('Subscription not found', 404);
  }

  return subscription;
};

const advanceDate = (date, frequency) => {
  const next = new Date(date);

  if (frequency === 'weekly') {
    next.setUTCDate(next.getUTCDate() + 7);
  } else if (frequency === 'monthly') {
    next.setUTCMonth(next.getUTCMonth() + 1);
  } else {
    next.setUTCFullYear(next.getUTCFullYear() + 1);
  }

  return next;
};

const toView = (subscription, now = new Date()) => ({
  ...subscription.toJSON(),
  daysUntil: Math.ceil((subscription.nextDueDate - now) / millisecondsPerDay),
});

export const createSubscription = async (request, response) => {
  const subscription = await Subscription.create({
    user: request.user.id,
    name: request.body.name,
    amount: request.body.amount,
    category: request.body.category,
    frequency: request.body.frequency,
    nextDueDate: request.body.nextDueDate,
    notes: request.body.notes ?? '',
  });

  response.status(201).json({ subscription });
};

export const getSubscriptions = async (request, response) => {
  const query = userScope(request.user.id);

  if (request.query.active !== undefined) {
    query.active = request.query.active;
  }

  const subscriptions = await Subscription.find(query).sort({ nextDueDate: 1, createdAt: -1 });

  response.status(200).json({
    subscriptions: subscriptions.map((subscription) => toView(subscription)),
    count: subscriptions.length,
  });
};

export const getSubscription = async (request, response) => {
  const subscription = await getOwnedSubscription(request.user.id, request.params.id);
  response.status(200).json({ subscription: toView(subscription) });
};

export const updateSubscription = async (request, response) => {
  const updates = Object.fromEntries(
    ['name', 'amount', 'category', 'frequency', 'nextDueDate', 'active', 'notes']
      .filter((field) => request.body[field] !== undefined)
      .map((field) => [field, request.body[field]]),
  );
  const subscription = await Subscription.findOneAndUpdate(
    ownedRecordFilter(request.user.id, request.params.id),
    updates,
    { new: true, runValidators: true },
  );

  if (!subscription) {
    throw new AppError('Subscription not found', 404);
  }

  response.status(200).json({ subscription: toView(subscription) });
};

export const deleteSubscription = async (request, response) => {
  const subscription = await Subscription.findOneAndDelete(
    ownedRecordFilter(request.user.id, request.params.id),
  );

  if (!subscription) {
    throw new AppError('Subscription not found', 404);
  }

  response.status(204).send();
};

export const getUpcomingSubscriptions = async (request, response) => {
  const days = request.query.days ?? 7;
  const now = new Date();
  const windowEnd = new Date(now.getTime() + days * millisecondsPerDay);
  const subscriptions = await Subscription.find(
    userScope(request.user.id, { active: true, nextDueDate: { $lte: windowEnd } }),
  ).sort({ nextDueDate: 1 });

  response.status(200).json({
    subscriptions: subscriptions.map((subscription) => toView(subscription, now)),
    count: subscriptions.length,
  });
};

export const markSubscriptionPaid = async (request, response) => {
  const subscription = await getOwnedSubscription(request.user.id, request.params.id);
  const now = new Date();
  let nextDueDate = new Date(subscription.nextDueDate);

  for (let iteration = 0; nextDueDate <= now && iteration < 500; iteration += 1) {
    nextDueDate = advanceDate(nextDueDate, subscription.frequency);
  }

  subscription.nextDueDate = nextDueDate;
  await subscription.save();

  response.status(200).json({ subscription: toView(subscription, now) });
};

export const detectRecurringSubscriptions = async (request, response) => {
  const now = new Date();
  const startDate = new Date(now.getTime() - 180 * millisecondsPerDay);
  const expenses = await Expense.find(
    userScope(request.user.id, { date: { $gte: startDate }, notes: { $nin: ['', null] } }),
  ).sort({ date: 1 });

  const groups = new Map();

  for (const expense of expenses) {
    const name = expense.notes.trim();
    const key = `${expense.category}|${name.toLowerCase()}`;
    const records = groups.get(key) ?? [];
    records.push({ name, category: expense.category, amount: expense.amount, date: expense.date });
    groups.set(key, records);
  }

  const suggestions = [];

  for (const records of groups.values()) {
    if (records.length < 2) continue;

    const amounts = records.map((record) => record.amount).sort((first, second) => first - second);
    const median = amounts[Math.floor(amounts.length / 2)];
    const withinRange = records.every(
      (record) => Math.abs(record.amount - median) <= median * 0.1 + 0.01,
    );

    if (!withinRange) continue;

    const dates = records.map((record) => record.date).sort((first, second) => first - second);
    const isMonthly = dates.every((date, index) => {
      if (index === 0) return true;
      const gapDays = (date - dates[index - 1]) / millisecondsPerDay;
      return gapDays >= 20 && gapDays <= 45;
    });

    if (!isMonthly) continue;

    const lastDate = dates.at(-1);
    const nextDueDate = new Date(lastDate);
    nextDueDate.setUTCMonth(nextDueDate.getUTCMonth() + 1);

    suggestions.push({
      name: records[0].name,
      category: records[0].category,
      amount: roundTotal(median),
      frequency: 'monthly',
      occurrences: records.length,
      lastDate: lastDate.toISOString(),
      nextSuggestedDueDate: nextDueDate.toISOString(),
    });
  }

  response.status(200).json({ suggestions, count: suggestions.length });
};
