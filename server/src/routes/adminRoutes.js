import { Router } from 'express';

import {
  deleteAdminUser,
  getAdminAnalytics,
  getAdminFeedback,
  getAdminUsers,
  updateAdminFeedback,
  updateAdminUser,
} from '../controllers/adminController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  adminUserIdValidator,
  adminUserListValidators,
  updateAdminUserValidators,
} from '../validators/adminValidators.js';
import {
  feedbackListValidators,
  updateFeedbackValidators,
} from '../validators/feedbackValidators.js';
import { emptyBodyValidators } from '../validators/commonValidators.js';

const router = Router();

router.get('/users', adminUserListValidators, validateRequest, asyncHandler(getAdminUsers));
router.put('/users/:id', updateAdminUserValidators, validateRequest, asyncHandler(updateAdminUser));
router.delete(
  '/users/:id',
  adminUserIdValidator,
  emptyBodyValidators,
  validateRequest,
  asyncHandler(deleteAdminUser),
);
router.get('/analytics', asyncHandler(getAdminAnalytics));
router.get('/feedback', feedbackListValidators, validateRequest, asyncHandler(getAdminFeedback));
router.put(
  '/feedback/:id',
  updateFeedbackValidators,
  validateRequest,
  asyncHandler(updateAdminFeedback),
);

export default router;
