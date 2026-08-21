import SavingsGoal from '../models/SavingsGoal.js';
import { AppError } from '../utils/AppError.js';
import { calculateGoalProgress } from '../utils/goalProgress.js';
import { ownedRecordFilter, userScope } from '../utils/ownership.js';

const getOwnedGoal = async (userId, goalId) => {
  const goal = await SavingsGoal.findOne(ownedRecordFilter(userId, goalId));

  if (!goal) {
    throw new AppError('Savings goal not found', 404);
  }

  return goal;
};

export const createGoal = async (request, response) => {
  const goal = await SavingsGoal.create({
    user: request.user.id,
    name: request.body.name,
    targetAmount: request.body.targetAmount,
    currentAmount: request.body.currentAmount ?? 0,
    targetDate: request.body.targetDate,
    category: request.body.category,
  });

  response.status(201).json({
    goal: { ...goal.toJSON(), progress: calculateGoalProgress(goal) },
  });
};

export const getGoals = async (request, response) => {
  const goals = await SavingsGoal.find(userScope(request.user.id)).sort({
    targetDate: 1,
    createdAt: -1,
  });
  response.status(200).json({
    goals: goals.map((goal) => ({
      ...goal.toJSON(),
      progress: calculateGoalProgress(goal),
    })),
    count: goals.length,
  });
};

export const getGoal = async (request, response) => {
  const goal = await getOwnedGoal(request.user.id, request.params.id);
  response.status(200).json({
    goal: { ...goal.toJSON(), progress: calculateGoalProgress(goal) },
  });
};

export const updateGoal = async (request, response) => {
  const goal = await getOwnedGoal(request.user.id, request.params.id);
  const nextTargetAmount = request.body.targetAmount ?? goal.targetAmount;
  const nextCurrentAmount = request.body.currentAmount ?? goal.currentAmount;

  if (
    Number(nextCurrentAmount) > Number(nextTargetAmount) &&
    request.body.allowExceedTarget !== true
  ) {
    throw new AppError(
      'Current amount cannot exceed target amount without explicit permission',
      422,
    );
  }

  for (const field of ['name', 'targetAmount', 'currentAmount', 'targetDate', 'category']) {
    if (request.body[field] !== undefined) {
      goal[field] = request.body[field];
    }
  }

  await goal.save();
  response.status(200).json({
    goal: { ...goal.toJSON(), progress: calculateGoalProgress(goal) },
  });
};

export const deleteGoal = async (request, response) => {
  const goal = await SavingsGoal.findOneAndDelete(
    ownedRecordFilter(request.user.id, request.params.id),
  );

  if (!goal) {
    throw new AppError('Savings goal not found', 404);
  }

  response.status(204).send();
};

export const contributeToGoal = async (request, response) => {
  const amount = request.body.amount;
  const contributionDate = request.body.date ?? new Date();
  const filter = ownedRecordFilter(request.user.id, request.params.id);

  if (request.body.allowExceedTarget !== true) {
    filter.$expr = {
      $lte: [{ $add: ['$currentAmount', amount] }, '$targetAmount'],
    };
  }

  const goal = await SavingsGoal.findOneAndUpdate(
    filter,
    {
      $inc: { currentAmount: amount },
      $push: { contributions: { amount, date: contributionDate } },
    },
    { new: true, runValidators: true },
  );

  if (!goal) {
    const exists = await SavingsGoal.exists(ownedRecordFilter(request.user.id, request.params.id));

    if (!exists) {
      throw new AppError('Savings goal not found', 404);
    }

    throw new AppError(
      'This contribution would exceed the target amount. Explicit permission is required.',
      422,
    );
  }

  response.status(201).json({
    goal,
    contribution: goal.contributions.at(-1),
    progress: calculateGoalProgress(goal),
  });
};

export const getGoalProgress = async (request, response) => {
  const goal = await getOwnedGoal(request.user.id, request.params.id);
  response.status(200).json({
    goalId: goal.id,
    ...calculateGoalProgress(goal),
  });
};
