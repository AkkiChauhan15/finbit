import { Router } from 'express';

import { getMonthlyReport } from '../controllers/reportController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { monthlyReportValidators } from '../validators/transactionValidators.js';

const router = Router();

router.get('/monthly', monthlyReportValidators, validateRequest, asyncHandler(getMonthlyReport));

export default router;
