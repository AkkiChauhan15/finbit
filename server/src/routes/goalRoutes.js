import { Router } from 'express';

import {
  contributeToGoal,
  createGoal,
  deleteGoal,
  getGoal,
  getGoalProgress,
  getGoals,
  updateGoal,
} from '../controllers/goalController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  contributeValidators,
  createGoalValidators,
  goalIdValidator,
  updateGoalValidators,
} from '../validators/goalValidators.js';
import { emptyBodyValidators } from '../validators/commonValidators.js';

const router = Router();

router
  .route('/')
  .post(createGoalValidators, validateRequest, asyncHandler(createGoal))
  .get(asyncHandler(getGoals));

router.post(
  '/:id/contribute',
  contributeValidators,
  validateRequest,
  asyncHandler(contributeToGoal),
);
router.get('/:id/progress', goalIdValidator, validateRequest, asyncHandler(getGoalProgress));

router
  .route('/:id')
  .get(goalIdValidator, validateRequest, asyncHandler(getGoal))
  .put(goalIdValidator, updateGoalValidators, validateRequest, asyncHandler(updateGoal))
  .delete(goalIdValidator, emptyBodyValidators, validateRequest, asyncHandler(deleteGoal));

export default router;
