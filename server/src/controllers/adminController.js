import Feedback from '../models/Feedback.js';
import User from '../models/User.js';
import {
  buildPlatformAnalytics,
  getHabitCompletionStatsByUser,
  getTrackedNetWorthByUser,
} from '../services/adminAnalyticsService.js';
import { AppError } from '../utils/AppError.js';

const serializeAdminUser = (user, habitStats, netWorth) => {
  const completion = habitStats.get(user.id) ?? { completed: 0, total: 0 };

  return {
    _id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    currency: user.financialProfile?.currency ?? 'USD',
    isActive: user.isActive !== false,
    status: user.deletedAt ? 'deleted' : user.isActive === false ? 'inactive' : 'active',
    joinedAt: user.createdAt,
    lastActiveAt: user.lastActiveAt,
    deactivatedAt: user.deactivatedAt,
    deletedAt: user.deletedAt,
    stats: {
      habitCompletionRate: completion.total
        ? Math.round((completion.completed / completion.total) * 1000) / 10
        : 0,
      totalTrackedNetWorth: netWorth.get(user.id) ?? 0,
    },
  };
};

export const getAdminUsers = async (request, response) => {
  const query = {};

  if (request.query.status === 'active') {
    query.isActive = { $ne: false };
    query.deletedAt = null;
  } else if (request.query.status === 'inactive') {
    query.isActive = false;
    query.deletedAt = null;
  } else if (request.query.status === 'deleted') {
    query.deletedAt = { $ne: null };
  }

  if (request.query.role && request.query.role !== 'all') {
    query.role = request.query.role;
  }

  if (request.query.search) {
    const escaped = request.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.$or = [
      { name: { $regex: escaped, $options: 'i' } },
      { email: { $regex: escaped, $options: 'i' } },
    ];
  }

  const users = await User.find(query).sort({ createdAt: -1 });
  const userIds = users.map((user) => user._id);
  const [habitStats, netWorth] = await Promise.all([
    getHabitCompletionStatsByUser(userIds),
    getTrackedNetWorthByUser(userIds),
  ]);

  response.status(200).json({
    users: users.map((user) => serializeAdminUser(user, habitStats, netWorth)),
    count: users.length,
  });
};

const ensureDifferentUser = (request) => {
  if (request.user.id === request.params.id) {
    throw new AppError('Administrators cannot change or remove their own account here', 409);
  }
};

export const updateAdminUser = async (request, response) => {
  ensureDifferentUser(request);
  const user = await User.findById(request.params.id).select('+refreshTokenHash');

  if (!user) throw new AppError('User not found', 404);

  if (request.body.role !== undefined) {
    user.role = request.body.role;
  }

  if (request.body.isActive !== undefined) {
    user.isActive = request.body.isActive;
    user.deactivatedAt = request.body.isActive ? null : new Date();

    if (request.body.isActive) {
      user.deletedAt = null;
    } else {
      user.refreshTokenHash = undefined;
    }
  }

  await user.save();
  const [habitStats, netWorth] = await Promise.all([
    getHabitCompletionStatsByUser([user._id]),
    getTrackedNetWorthByUser([user._id]),
  ]);

  response.status(200).json({ user: serializeAdminUser(user, habitStats, netWorth) });
};

export const deleteAdminUser = async (request, response) => {
  ensureDifferentUser(request);
  const now = new Date();
  const user = await User.findByIdAndUpdate(
    request.params.id,
    {
      $set: { isActive: false, deactivatedAt: now, deletedAt: now },
      $unset: { refreshTokenHash: 1 },
    },
    { new: true, runValidators: true },
  );

  if (!user) throw new AppError('User not found', 404);

  response.status(200).json({
    message: 'User was soft-deleted and their financial records were retained.',
    userId: user.id,
  });
};

export const getAdminAnalytics = async (_request, response) => {
  response.status(200).json({ analytics: await buildPlatformAnalytics() });
};

export const getAdminFeedback = async (request, response) => {
  const query = {};

  if (request.query.status) query.status = request.query.status;
  if (request.query.category) query.category = request.query.category;

  const feedback = await Feedback.find(query)
    .sort({ status: 1, createdAt: -1 })
    .populate('user', 'name email isActive')
    .populate('resolvedBy', 'name');

  response.status(200).json({ feedback, count: feedback.length });
};

export const updateAdminFeedback = async (request, response) => {
  const closed = ['resolved', 'dismissed'].includes(request.body.status);
  const updates = {
    status: request.body.status,
    resolvedAt: closed ? new Date() : null,
    resolvedBy: closed ? request.user._id : null,
  };

  if (request.body.adminNote !== undefined) {
    updates.adminNote = request.body.adminNote;
  }

  const feedback = await Feedback.findByIdAndUpdate(
    request.params.id,
    { $set: updates },
    { new: true, runValidators: true },
  )
    .populate('user', 'name email isActive')
    .populate('resolvedBy', 'name');

  if (!feedback) throw new AppError('Feedback not found', 404);

  response.status(200).json({ feedback });
};
