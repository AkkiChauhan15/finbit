import { Router } from 'express';

import { createFeedback } from '../controllers/feedbackController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createFeedbackValidators } from '../validators/feedbackValidators.js';

const router = Router();

router.post('/', createFeedbackValidators, validateRequest, asyncHandler(createFeedback));

export default router;
