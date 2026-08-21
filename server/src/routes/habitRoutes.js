import { Router } from 'express';

import {
  completeHabit,
  createHabit,
  deleteHabit,
  getHabit,
  getHabitStreak,
  getHabits,
  getHabitSummary,
  updateHabit,
} from '../controllers/habitController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  completeHabitValidators,
  createHabitValidators,
  habitIdValidator,
  listHabitValidators,
  updateHabitValidators,
} from '../validators/habitValidators.js';
import { emptyBodyValidators } from '../validators/commonValidators.js';

const router = Router();

router.get('/summary', asyncHandler(getHabitSummary));

router
  .route('/')
  .post(createHabitValidators, validateRequest, asyncHandler(createHabit))
  .get(listHabitValidators, validateRequest, asyncHandler(getHabits));

router.post('/:id/complete', completeHabitValidators, validateRequest, asyncHandler(completeHabit));
router.get('/:id/streak', habitIdValidator, validateRequest, asyncHandler(getHabitStreak));

router
  .route('/:id')
  .get(habitIdValidator, validateRequest, asyncHandler(getHabit))
  .put(habitIdValidator, updateHabitValidators, validateRequest, asyncHandler(updateHabit))
  .delete(habitIdValidator, emptyBodyValidators, validateRequest, asyncHandler(deleteHabit));

export default router;
