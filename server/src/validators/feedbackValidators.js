import { body, param, query } from 'express-validator';

import { feedbackCategories, feedbackStatuses } from '../models/Feedback.js';
import { onlyBodyFields } from './commonValidators.js';

export const createFeedbackValidators = [
  onlyBodyFields('category', 'subject', 'message'),
  body('category')
    .notEmpty()
    .withMessage('Category is required.')
    .bail()
    .isIn(feedbackCategories)
    .withMessage('Category must be feedback or complaint.'),
  body('subject')
    .trim()
    .isLength({ min: 3, max: 120 })
    .withMessage('Subject must be between 3 and 120 characters.'),
  body('message')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters.'),
];

export const feedbackListValidators = [
  query('status')
    .optional()
    .isIn(feedbackStatuses)
    .withMessage('Status must be open, resolved, or dismissed.'),
  query('category')
    .optional()
    .isIn(feedbackCategories)
    .withMessage('Category must be feedback or complaint.'),
];

export const updateFeedbackValidators = [
  param('id').isMongoId().withMessage('Feedback id is invalid.'),
  onlyBodyFields('status', 'adminNote'),
  body('status')
    .notEmpty()
    .withMessage('Status is required.')
    .bail()
    .isIn(feedbackStatuses)
    .withMessage('Status must be open, resolved, or dismissed.'),
  body('adminNote')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Admin note cannot exceed 1000 characters.'),
];
