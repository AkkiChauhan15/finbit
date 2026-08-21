import Asset from '../models/Asset.js';
import SavingsGoal from '../models/SavingsGoal.js';
import { roundTotal } from '../utils/dateRange.js';
import { userScope } from '../utils/ownership.js';

const sumField = async (Model, userId, field) => {
  const [result] = await Model.aggregate([
    { $match: userScope(userId) },
    { $group: { _id: null, total: { $sum: `$${field}` } } },
  ]);

  return roundTotal(result?.total ?? 0);
};

export const calculateCurrentNetWorth = async (userId) => {
  const [totalSavings, totalAssets] = await Promise.all([
    sumField(SavingsGoal, userId, 'currentAmount'),
    sumField(Asset, userId, 'currentValue'),
  ]);

  return {
    totalSavings,
    totalAssets,
    netWorth: roundTotal(totalSavings + totalAssets),
  };
};
