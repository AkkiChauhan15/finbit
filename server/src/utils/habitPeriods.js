const millisecondsPerDay = 24 * 60 * 60 * 1000;

export const normalizeUtcDay = (value = new Date()) => {
  const date = new Date(value);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
};

const formatDateKey = (date) =>
  `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(
    date.getUTCDate(),
  ).padStart(2, '0')}`;

export const addPeriods = (periodStart, frequency, amount) => {
  const date = normalizeUtcDay(periodStart);

  if (frequency === 'daily') {
    date.setUTCDate(date.getUTCDate() + amount);
  } else if (frequency === 'weekly') {
    date.setUTCDate(date.getUTCDate() + amount * 7);
  } else {
    date.setUTCMonth(date.getUTCMonth() + amount, 1);
  }

  return date;
};

export const getHabitPeriod = (value, frequency) => {
  const completedOn = normalizeUtcDay(value);
  const periodStart = new Date(completedOn);

  if (frequency === 'weekly') {
    const dayOfWeek = periodStart.getUTCDay();
    periodStart.setUTCDate(periodStart.getUTCDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  } else if (frequency === 'monthly') {
    periodStart.setUTCDate(1);
  }

  const nextPeriodStart = addPeriods(periodStart, frequency, 1);
  const periodEnd = new Date(nextPeriodStart.getTime() - 1);

  return {
    completedOn,
    periodStart,
    periodEnd,
    periodKey: `${frequency}:${formatDateKey(periodStart)}`,
  };
};

export const calculateStreaks = (periodStarts, frequency, now = new Date()) => {
  const uniqueStarts = [
    ...new Set(periodStarts.map((date) => normalizeUtcDay(date).getTime())),
  ].sort((first, second) => first - second);
  const completionSet = new Set(uniqueStarts);
  const currentPeriodStart = getHabitPeriod(now, frequency).periodStart;
  let cursor = completionSet.has(currentPeriodStart.getTime())
    ? currentPeriodStart
    : addPeriods(currentPeriodStart, frequency, -1);
  let currentStreak = 0;

  while (completionSet.has(cursor.getTime())) {
    currentStreak += 1;
    cursor = addPeriods(cursor, frequency, -1);
  }

  let longestStreak = 0;
  let runningStreak = 0;
  let previousStart;

  for (const timestamp of uniqueStarts) {
    const periodStart = new Date(timestamp);
    const followsPrevious =
      previousStart && addPeriods(previousStart, frequency, 1).getTime() === timestamp;

    runningStreak = followsPrevious ? runningStreak + 1 : 1;
    longestStreak = Math.max(longestStreak, runningStreak);
    previousStart = periodStart;
  }

  return { currentStreak, longestStreak };
};

export const getRecentPeriods = (frequency, days = 30, now = new Date()) => {
  const today = normalizeUtcDay(now);
  const windowStart = new Date(today.getTime() - (days - 1) * millisecondsPerDay);
  const currentPeriodStart = getHabitPeriod(today, frequency).periodStart;
  const periods = [];
  let cursor = getHabitPeriod(windowStart, frequency).periodStart;

  while (cursor.getTime() <= currentPeriodStart.getTime()) {
    periods.push(getHabitPeriod(cursor, frequency));
    cursor = addPeriods(cursor, frequency, 1);
  }

  return periods;
};

export const buildCompletionHistory = (
  frequency,
  completedPeriodKeys,
  days = 30,
  now = new Date(),
) => {
  const today = normalizeUtcDay(now);
  const windowStart = new Date(today.getTime() - (days - 1) * millisecondsPerDay);
  const currentPeriodKey = getHabitPeriod(today, frequency).periodKey;

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(windowStart.getTime() + index * millisecondsPerDay);
    const period = getHabitPeriod(date, frequency);
    const completed = completedPeriodKeys.has(period.periodKey);

    return {
      date: formatDateKey(date),
      periodKey: period.periodKey,
      completed,
      status: completed
        ? 'completed'
        : period.periodKey === currentPeriodKey
          ? 'pending'
          : 'missed',
    };
  });
};

export const calculateCompletionRate = (
  frequency,
  completedPeriodKeys,
  days = 30,
  now = new Date(),
) => {
  const periods = getRecentPeriods(frequency, days, now);
  const completedPeriods = periods.filter((period) =>
    completedPeriodKeys.has(period.periodKey),
  ).length;

  return {
    completedPeriods,
    totalPeriods: periods.length,
    completionRate: periods.length
      ? Math.round((completedPeriods / periods.length) * 1000) / 10
      : 0,
  };
};
