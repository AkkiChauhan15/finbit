import { Router } from 'express';

import { getMe, login, logout, refresh, register } from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';
import { authRateLimiter } from '../middleware/rateLimiters.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { loginValidators, registerValidators } from '../validators/authValidators.js';
import { emptyBodyValidators } from '../validators/commonValidators.js';

const router = Router();

router.post(
  '/register',
  authRateLimiter,
  registerValidators,
  validateRequest,
  asyncHandler(register),
);
router.post('/login', authRateLimiter, loginValidators, validateRequest, asyncHandler(login));
router.post(
  '/refresh',
  authRateLimiter,
  emptyBodyValidators,
  validateRequest,
  asyncHandler(refresh),
);
router.post('/logout', emptyBodyValidators, validateRequest, asyncHandler(logout));
router.get('/me', verifyToken, asyncHandler(getMe));

export default router;
