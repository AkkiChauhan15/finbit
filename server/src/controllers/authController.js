import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import {
  clearRefreshCookieOptions,
  hashToken,
  refreshCookieName,
  refreshCookieOptions,
  signAccessToken,
  signRefreshToken,
  tokensMatch,
  verifyRefreshToken,
} from '../utils/tokens.js';

const createSession = async (user, response) => {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  user.refreshTokenHash = hashToken(refreshToken);
  user.lastActiveAt = new Date();
  await user.save();

  response.cookie(refreshCookieName, refreshToken, refreshCookieOptions);

  return accessToken;
};

export const register = async (request, response) => {
  const { name, email, password } = request.body;
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new AppError('An account with this email already exists', 409);
  }

  const user = await User.create({ name, email, password });
  const accessToken = await createSession(user, response);

  response.status(201).json({ user, accessToken });
};

export const login = async (request, response) => {
  const { email, password } = request.body;
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Email or password is incorrect', 401);
  }

  if (user.isActive === false || user.deletedAt) {
    throw new AppError('This account is inactive', 403);
  }

  const accessToken = await createSession(user, response);

  response.status(200).json({ user, accessToken });
};

export const refresh = async (request, response) => {
  const refreshToken = request.cookies[refreshCookieName];

  if (!refreshToken) {
    throw new AppError('Refresh token is missing', 401);
  }

  let payload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    response.clearCookie(refreshCookieName, clearRefreshCookieOptions);
    throw new AppError('Refresh token is invalid or expired', 401);
  }

  const user = await User.findById(payload.sub).select('+refreshTokenHash');

  if (
    !user ||
    user.isActive === false ||
    user.deletedAt ||
    !tokensMatch(refreshToken, user.refreshTokenHash)
  ) {
    response.clearCookie(refreshCookieName, clearRefreshCookieOptions);
    throw new AppError('Refresh token is invalid or expired', 401);
  }

  const accessToken = await createSession(user, response);
  response.status(200).json({ user, accessToken });
};

export const logout = async (request, response) => {
  const refreshToken = request.cookies[refreshCookieName];
  response.clearCookie(refreshCookieName, clearRefreshCookieOptions);

  if (refreshToken) {
    let payload;

    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      // An invalid or expired cookie is already cleared, so logout remains idempotent.
    }

    if (payload) {
      const user = await User.findById(payload.sub).select('+refreshTokenHash');

      if (user && tokensMatch(refreshToken, user.refreshTokenHash)) {
        user.refreshTokenHash = undefined;
        await user.save();
      }
    }
  }

  response.status(204).send();
};

export const getMe = async (request, response) => {
  response.status(200).json({ user: request.user });
};
