import { Router } from 'express';

import {
  createIncome,
  deleteIncome,
  getIncome,
  updateIncome,
} from '../controllers/incomeController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createIncomeValidators,
  listIncomeValidators,
  transactionIdValidator,
  updateIncomeValidators,
} from '../validators/transactionValidators.js';
import { emptyBodyValidators } from '../validators/commonValidators.js';

const router = Router();

router
  .route('/')
  .post(createIncomeValidators, validateRequest, asyncHandler(createIncome))
  .get(listIncomeValidators, validateRequest, asyncHandler(getIncome));

router
  .route('/:id')
  .put(transactionIdValidator, updateIncomeValidators, validateRequest, asyncHandler(updateIncome))
  .delete(transactionIdValidator, emptyBodyValidators, validateRequest, asyncHandler(deleteIncome));

export default router;
