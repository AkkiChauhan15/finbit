import { Router } from 'express';

import { chat } from '../controllers/assistantController.js';
import { assistantRateLimiter } from '../middleware/rateLimiters.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { chatValidators } from '../validators/assistantValidators.js';

const router = Router();

router.post('/chat', assistantRateLimiter, chatValidators, validateRequest, asyncHandler(chat));

export default router;
