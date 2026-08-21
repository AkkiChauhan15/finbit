import { Router } from 'express';

import {
  createAsset,
  deleteAsset,
  getAsset,
  getAssets,
  updateAsset,
} from '../controllers/assetController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  assetIdValidator,
  createAssetValidators,
  updateAssetValidators,
} from '../validators/assetValidators.js';
import { emptyBodyValidators } from '../validators/commonValidators.js';

const router = Router();

router
  .route('/')
  .post(createAssetValidators, validateRequest, asyncHandler(createAsset))
  .get(asyncHandler(getAssets));

router
  .route('/:id')
  .get(assetIdValidator, validateRequest, asyncHandler(getAsset))
  .put(assetIdValidator, updateAssetValidators, validateRequest, asyncHandler(updateAsset))
  .delete(assetIdValidator, emptyBodyValidators, validateRequest, asyncHandler(deleteAsset));

export default router;
