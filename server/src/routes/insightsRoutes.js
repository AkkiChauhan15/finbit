import { Router } from 'express';

import { getAnomalies } from '../controllers/insightsController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/anomalies', asyncHandler(getAnomalies));

export default router;
