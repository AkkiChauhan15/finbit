import { Router } from 'express';

import { getProfile, updateProfile } from '../controllers/userController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { updateProfileValidators } from '../validators/userValidators.js';

const router = Router();

router.get('/profile', asyncHandler(getProfile));
router.put('/profile', updateProfileValidators, validateRequest, asyncHandler(updateProfile));

export default router;
