import crypto from 'node:crypto';

import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';
import { AppError } from './AppError.js';

const durationMultipliers = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

const durationToMilliseconds = (duration, fallback) => {
  const match = /^(\d+)([smhd])$/.exec(duration);

  if (!match) {
    return fallback;
  }

  return Number(match[1]) * durationMultipliers[match[2]];
};

const requireSecret = (secret, name) => {
  if (!secret) {
    throw new AppError(`${name} is not configured`, 500);
  }

  return secret;
};

export const signAccessToken = (user) =>
  jwt.sign({ role: user.role, type: 'access' }, requireSecret(env.jwtSecret, 'JWT_SECRET'), {
    subject: user.id,
    expiresIn: env.jwtAccessExpiresIn,
  });

export const signRefreshToken = (user) =>
  jwt.sign({ type: 'refresh' }, requireSecret(env.jwtRefreshSecret, 'JWT_REFRESH_SECRET'), {
    subject: user.id,
    expiresIn: env.jwtRefreshExpiresIn,
  });

export const verifyAccessToken = (token) => {
  const payload = jwt.verify(token, requireSecret(env.jwtSecret, 'JWT_SECRET'));

  if (payload.type !== 'access') {
    throw new AppError('Invalid access token', 401);
  }

  return payload;
};

export const verifyRefreshToken = (token) => {
  const payload = jwt.verify(token, requireSecret(env.jwtRefreshSecret, 'JWT_REFRESH_SECRET'));

  if (payload.type !== 'refresh') {
    throw new AppError('Invalid refresh token', 401);
  }

  return payload;
};

export const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

export const tokensMatch = (token, tokenHash) => {
  if (!token || !tokenHash) {
    return false;
  }

  const suppliedHash = Buffer.from(hashToken(token), 'hex');
  const storedHash = Buffer.from(tokenHash, 'hex');

  return (
    suppliedHash.length === storedHash.length && crypto.timingSafeEqual(suppliedHash, storedHash)
  );
};

export const refreshCookieName = 'refreshToken';

export const refreshCookieOptions = {
  httpOnly: true,
  secure: env.cookieSecure || env.nodeEnv === 'production',
  sameSite: env.nodeEnv === 'production' ? 'none' : 'lax',
  path: '/api/auth',
  maxAge: durationToMilliseconds(env.jwtRefreshExpiresIn, 7 * 24 * 60 * 60 * 1000),
};

export const clearRefreshCookieOptions = {
  httpOnly: refreshCookieOptions.httpOnly,
  secure: refreshCookieOptions.secure,
  sameSite: refreshCookieOptions.sameSite,
  path: refreshCookieOptions.path,
};
