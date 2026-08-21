import { Router } from 'express';

import {
  createExpense,
  deleteExpense,
  getExpenses,
  getExpenseSummary,
  updateExpense,
} from '../controllers/expenseController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createExpenseValidators,
  expenseSummaryValidators,
  listExpenseValidators,
  transactionIdValidator,
  updateExpenseValidators,
} from '../validators/transactionValidators.js';
import { emptyBodyValidators } from '../validators/commonValidators.js';

const router = Router();

router.get('/summary', expenseSummaryValidators, validateRequest, asyncHandler(getExpenseSummary));

router
  .route('/')
  .post(createExpenseValidators, validateRequest, asyncHandler(createExpense))
  .get(listExpenseValidators, validateRequest, asyncHandler(getExpenses));

router
  .route('/:id')
  .put(
    transactionIdValidator,
    updateExpenseValidators,
    validateRequest,
    asyncHandler(updateExpense),
  )
  .delete(
    transactionIdValidator,
    emptyBodyValidators,
    validateRequest,
    asyncHandler(deleteExpense),
  );

export default router;
