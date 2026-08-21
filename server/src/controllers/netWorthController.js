import NetWorthSnapshot from '../models/NetWorthSnapshot.js';
import { calculateCurrentNetWorth } from '../services/netWorthService.js';
import { userScope } from '../utils/ownership.js';

const rangeStartDate = (range, now = new Date()) => {
  if (!range || range === 'all') {
    return null;
  }

  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  if (range === '1yr') {
    date.setUTCFullYear(date.getUTCFullYear() - 1);
  } else {
    date.setUTCMonth(date.getUTCMonth() - Number.parseInt(range, 10));
  }

  return date;
};

export const createNetWorthSnapshot = async (request, response) => {
  const totals = await calculateCurrentNetWorth(request.user._id);
  const now = new Date();
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const snapshot = await NetWorthSnapshot.findOneAndUpdate(
    userScope(request.user.id, { date }),
    { $set: totals },
    { upsert: true, new: true, runValidators: true },
  );

  response.status(200).json({ snapshot });
};

export const getNetWorthHistory = async (request, response) => {
  const query = userScope(request.user.id);
  const startDate = rangeStartDate(request.query.range);

  if (startDate) {
    query.date = { $gte: startDate };
  }

  const snapshots = await NetWorthSnapshot.find(query).sort({ date: 1 });
  response.status(200).json({
    snapshots,
    count: snapshots.length,
    range: request.query.range ?? 'all',
  });
};
