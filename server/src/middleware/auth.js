import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { verifyAccessToken } from '../utils/tokens.js';

export const verifyToken = asyncHandler(async (request, _response, next) => {
  const authorization = request.get('authorization');

  if (!authorization?.startsWith('Bearer ')) {
    throw new AppError('Authentication required', 401);
  }

  const token = authorization.slice('Bearer '.length).trim();

  try {
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub);

    if (!user) {
      throw new AppError('User account no longer exists', 401);
    }

    if (user.isActive === false || user.deletedAt) {
      throw new AppError('User account is inactive', 401);
    }

    const now = new Date();
    const activityWriteInterval = 5 * 60 * 1000;

    if (!user.lastActiveAt || now - user.lastActiveAt >= activityWriteInterval) {
      user.lastActiveAt = now;
      await User.updateOne({ _id: user._id }, { $set: { lastActiveAt: now } });
    }

    request.user = user;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError('Access token is invalid or expired', 401);
  }
});

export const isAdmin = (request, _response, next) => {
  if (request.user?.role !== 'admin') {
    return next(new AppError('Administrator access required', 403));
  }

  return next();
};
