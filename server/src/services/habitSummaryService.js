import Habit from '../models/Habit.js';
import HabitCompletion from '../models/HabitCompletion.js';
import {
  buildCompletionHistory,
  calculateCompletionRate,
  calculateStreaks,
  getHabitPeriod,
} from '../utils/habitPeriods.js';
import { userScope } from '../utils/ownership.js';

export const buildActiveHabitSummaries = async (userId, options = {}) => {
  const { historyDays = 30, includeHistory = true } = options;
  const habits = await Habit.find(userScope(userId, { active: true })).sort({ createdAt: -1 });

  if (habits.length === 0) {
    return [];
  }

  const completions = await HabitCompletion.find(
    userScope(userId, { habit: { $in: habits.map((habit) => habit._id) } }),
  ).select('habit periodKey periodStart');
  const completionsByHabit = new Map();

  for (const completion of completions) {
    const habitId = completion.habit.toString();
    const current = completionsByHabit.get(habitId) ?? [];
    current.push(completion);
    completionsByHabit.set(habitId, current);
  }

  const now = new Date();

  return habits.map((habit) => {
    const habitCompletions = completionsByHabit.get(habit.id) ?? [];
    const completedPeriodKeys = new Set(habitCompletions.map((completion) => completion.periodKey));
    const streaks = calculateStreaks(
      habitCompletions.map((completion) => completion.periodStart),
      habit.frequency,
      now,
    );
    const completionStats = calculateCompletionRate(
      habit.frequency,
      completedPeriodKeys,
      historyDays,
      now,
    );
    const currentPeriodKey = getHabitPeriod(now, habit.frequency).periodKey;

    return {
      ...habit.toJSON(),
      ...streaks,
      ...completionStats,
      isCurrentPeriodComplete: completedPeriodKeys.has(currentPeriodKey),
      ...(includeHistory && {
        history: buildCompletionHistory(habit.frequency, completedPeriodKeys, historyDays, now),
      }),
    };
  });
};
