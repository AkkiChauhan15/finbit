import Habit from '../models/Habit.js';
import HabitCompletion from '../models/HabitCompletion.js';
import { buildActiveHabitSummaries } from '../services/habitSummaryService.js';
import { AppError } from '../utils/AppError.js';
import { calculateStreaks, getHabitPeriod } from '../utils/habitPeriods.js';
import { ownedChildFilter, ownedRecordFilter, userScope } from '../utils/ownership.js';

const getOwnedHabit = async (userId, habitId) => {
  const habit = await Habit.findOne(ownedRecordFilter(userId, habitId));

  if (!habit) {
    throw new AppError('Habit not found', 404);
  }

  return habit;
};

export const createHabit = async (request, response) => {
  const habit = await Habit.create({
    user: request.user.id,
    name: request.body.name,
    type: request.body.type,
    frequency: request.body.frequency,
    active: request.body.active ?? true,
  });

  response.status(201).json({ habit });
};

export const getHabits = async (request, response) => {
  const query = userScope(request.user.id);

  if (request.query.active !== undefined) {
    query.active = request.query.active;
  }

  const habits = await Habit.find(query).sort({ active: -1, createdAt: -1 });
  response.status(200).json({ habits, count: habits.length });
};

export const getHabit = async (request, response) => {
  const habit = await getOwnedHabit(request.user.id, request.params.id);
  response.status(200).json({ habit });
};

export const updateHabit = async (request, response) => {
  const habit = await getOwnedHabit(request.user.id, request.params.id);

  if (request.body.frequency && request.body.frequency !== habit.frequency) {
    const hasCompletions = await HabitCompletion.exists(
      ownedChildFilter(request.user.id, 'habit', habit.id),
    );

    if (hasCompletions) {
      throw new AppError(
        'Frequency cannot be changed after progress has been recorded. Create a new habit instead.',
        409,
      );
    }
  }

  for (const field of ['name', 'type', 'frequency', 'active']) {
    if (request.body[field] !== undefined) {
      habit[field] = request.body[field];
    }
  }

  await habit.save();
  response.status(200).json({ habit });
};

export const deleteHabit = async (request, response) => {
  const habit = await Habit.findOneAndDelete(ownedRecordFilter(request.user.id, request.params.id));

  if (!habit) {
    throw new AppError('Habit not found', 404);
  }

  await HabitCompletion.deleteMany(ownedChildFilter(request.user.id, 'habit', habit.id));
  response.status(204).send();
};

export const completeHabit = async (request, response) => {
  const habit = await getOwnedHabit(request.user.id, request.params.id);

  if (!habit.active) {
    throw new AppError('Reactivate this habit before recording progress', 409);
  }

  const period = getHabitPeriod(request.body.date ?? new Date(), habit.frequency);
  const completionFilter = ownedChildFilter(request.user.id, 'habit', habit.id, {
    periodKey: period.periodKey,
  });
  let wasCreated = false;

  try {
    const result = await HabitCompletion.updateOne(
      completionFilter,
      {
        $setOnInsert: {
          completedOn: period.completedOn,
          periodStart: period.periodStart,
          periodEnd: period.periodEnd,
        },
      },
      { upsert: true },
    );
    wasCreated = result.upsertedCount === 1;
  } catch (error) {
    if (error.code !== 11000) {
      throw error;
    }
    // A concurrent request won the unique-period insert; returning it remains idempotent.
  }

  const completion = await HabitCompletion.findOne(completionFilter);
  const alreadyCompleted = !wasCreated;

  response.status(alreadyCompleted ? 200 : 201).json({ completion, alreadyCompleted });
};

export const getHabitStreak = async (request, response) => {
  const habit = await getOwnedHabit(request.user.id, request.params.id);
  const completions = await HabitCompletion.find(
    ownedChildFilter(request.user.id, 'habit', habit.id),
  )
    .select('periodStart')
    .sort({ periodStart: 1 });
  const streaks = calculateStreaks(
    completions.map((completion) => completion.periodStart),
    habit.frequency,
  );

  response.status(200).json({ habitId: habit.id, frequency: habit.frequency, ...streaks });
};

export const getHabitSummary = async (request, response) => {
  const summary = await buildActiveHabitSummaries(request.user.id);

  return response.status(200).json({ habits: summary, count: summary.length });
};
