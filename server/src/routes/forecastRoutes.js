import { Router } from 'express';

import { getForecast } from '../controllers/forecastController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { forecastValidators } from '../validators/forecastValidators.js';

const router = Router();

router.get('/', forecastValidators, validateRequest, asyncHandler(getForecast));

export default router;
