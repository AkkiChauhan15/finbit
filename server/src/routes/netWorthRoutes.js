import { Router } from 'express';

import { createNetWorthSnapshot, getNetWorthHistory } from '../controllers/netWorthController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { netWorthHistoryValidators } from '../validators/netWorthValidators.js';
import { emptyBodyValidators } from '../validators/commonValidators.js';

const router = Router();

router.post(
  '/snapshot',
  emptyBodyValidators,
  validateRequest,
  asyncHandler(createNetWorthSnapshot),
);
router.get(
  '/history',
  netWorthHistoryValidators,
  validateRequest,
  asyncHandler(getNetWorthHistory),
);

export default router;
