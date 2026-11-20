import { body, param, query } from 'express-validator';

import { expenseCategories } from '../models/Expense.js';
import { subscriptionFrequencies } from '../models/Subscription.js';
import { onlyBodyFields } from './commonValidators.js';

const dateMessage = 'Date must use the YYYY-MM-DD format.';

const requiredDate = (field) =>
  body(field)
    .notEmpty()
    .withMessage('Next due date is required.')
    .bail()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage(dateMessage)
    .bail()
    .isISO8601({ strict: true })
    .withMessage(dateMessage)
    .toDate();

const optionalDate = (field) =>
  body(field)
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage(dateMessage)
    .bail()
    .isISO8601({ strict: true })
    .withMessage(dateMessage)
    .toDate();

const positiveAmount = (optional = false) => {
  const validator = body('amount');
  const chain = optional
    ? validator.optional()
    : validator.notEmpty().withMessage('Amount is required.');

  return chain
    .bail()
    .isFloat({ gt: 0, max: 999999999999 })
    .withMessage('Amount must be greater than zero.')
    .toFloat();
};

const atLeastOneField = (fields) =>
  body().custom((value) => {
    if (!fields.some((field) => value[field] !== undefined)) {
      throw new Error('Provide at least one field to update.');
    }

    return true;
  });

export const subscriptionIdValidator = [
  param('id').isMongoId().withMessage('Subscription id is invalid.'),
];

export const createSubscriptionValidators = [
  onlyBodyFields('name', 'amount', 'category', 'frequency', 'nextDueDate', 'notes'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required.')
    .isLength({ min: 2, max: 80 })
    .withMessage('Name must be between 2 and 80 characters.'),
  positiveAmount(),
  body('category')
    .notEmpty()
    .withMessage('Category is required.')
    .isIn(expenseCategories)
    .withMessage('Category is invalid.'),
  body('frequency')
    .notEmpty()
    .withMessage('Frequency is required.')
    .isIn(subscriptionFrequencies)
    .withMessage('Frequency is invalid.'),
  requiredDate('nextDueDate'),
  body('notes')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters.'),
];

export const updateSubscriptionValidators = [
  onlyBodyFields('name', 'amount', 'category', 'frequency', 'nextDueDate', 'active', 'notes'),
  atLeastOneField(['name', 'amount', 'category', 'frequency', 'nextDueDate', 'active', 'notes']),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage('Name must be between 2 and 80 characters.'),
  positiveAmount(true),
  body('category').optional().isIn(expenseCategories).withMessage('Category is invalid.'),
  body('frequency').optional().isIn(subscriptionFrequencies).withMessage('Frequency is invalid.'),
  optionalDate('nextDueDate'),
  body('active').optional().isBoolean().withMessage('Active must be true or false.').toBoolean(),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters.'),
];

export const listSubscriptionValidators = [
  query('active').optional().isBoolean().withMessage('Active must be true or false.').toBoolean(),
];

export const upcomingSubscriptionValidators = [
  query('days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Days must be from 1 to 365.')
    .toInt(),
];
