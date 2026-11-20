import { Router } from 'express';

import {
  createSubscription,
  deleteSubscription,
  detectRecurringSubscriptions,
  getSubscription,
  getSubscriptions,
  getUpcomingSubscriptions,
  markSubscriptionPaid,
  updateSubscription,
} from '../controllers/subscriptionController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { emptyBodyValidators } from '../validators/commonValidators.js';
import {
  createSubscriptionValidators,
  listSubscriptionValidators,
  subscriptionIdValidator,
  upcomingSubscriptionValidators,
  updateSubscriptionValidators,
} from '../validators/subscriptionValidators.js';

const router = Router();

router.get(
  '/upcoming',
  upcomingSubscriptionValidators,
  validateRequest,
  asyncHandler(getUpcomingSubscriptions),
);

router.get('/detect', asyncHandler(detectRecurringSubscriptions));

router
  .route('/')
  .post(createSubscriptionValidators, validateRequest, asyncHandler(createSubscription))
  .get(listSubscriptionValidators, validateRequest, asyncHandler(getSubscriptions));

router
  .route('/:id')
  .get(subscriptionIdValidator, validateRequest, asyncHandler(getSubscription))
  .put(
    subscriptionIdValidator,
    updateSubscriptionValidators,
    validateRequest,
    asyncHandler(updateSubscription),
  )
  .delete(
    subscriptionIdValidator,
    emptyBodyValidators,
    validateRequest,
    asyncHandler(deleteSubscription),
  );

router.post(
  '/:id/paid',
  subscriptionIdValidator,
  emptyBodyValidators,
  validateRequest,
  asyncHandler(markSubscriptionPaid),
);

export default router;
