const millisecondsPerDay = 24 * 60 * 60 * 1000;

const roundCurrency = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;
const normalizeUtcDay = (value) => {
  const date = new Date(value);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
};

export const calculateGoalProgress = (goal, now = new Date()) => {
  const targetAmount = Number(goal.targetAmount);
  const currentAmount = Number(goal.currentAmount);
  const amountRemaining = roundCurrency(Math.max(targetAmount - currentAmount, 0));
  const percentageComplete =
    Math.round((targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0) * 10) / 10;
  const today = normalizeUtcDay(now);
  const recentWindowStart = new Date(today.getTime() - 89 * millisecondsPerDay);
  const createdAt = goal.createdAt ? normalizeUtcDay(goal.createdAt) : recentWindowStart;
  const observationStart = new Date(Math.max(recentWindowStart.getTime(), createdAt.getTime()));
  const observationDays = Math.min(
    90,
    Math.max(
      1,
      Math.floor((today.getTime() - observationStart.getTime()) / millisecondsPerDay) + 1,
    ),
  );
  const recentContributionTotal = roundCurrency(
    (goal.contributions ?? [])
      .filter((contribution) => {
        const date = normalizeUtcDay(contribution.date);
        return date >= observationStart && date <= today;
      })
      .reduce((total, contribution) => total + Number(contribution.amount), 0),
  );
  const averageDailyContribution =
    Math.round((recentContributionTotal / observationDays + Number.EPSILON) * 10000) / 10000;

  let projectedCompletionDate = null;
  let status = 'no-data';

  if (amountRemaining === 0) {
    projectedCompletionDate = today.toISOString();
    status = 'completed';
  } else if (averageDailyContribution > 0) {
    const daysRemaining = Math.ceil(amountRemaining / averageDailyContribution);
    const projectedDate = new Date(today.getTime() + daysRemaining * millisecondsPerDay);
    const targetDate = normalizeUtcDay(goal.targetDate);

    projectedCompletionDate = projectedDate.toISOString();
    status = projectedDate <= targetDate ? 'on-track' : 'behind';
  }

  return {
    percentageComplete,
    amountRemaining,
    projectedCompletionDate,
    status,
    averageDailyContribution,
    recentContributionTotal,
    observationDays,
  };
};
