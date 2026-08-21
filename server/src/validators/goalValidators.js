import { body, param } from 'express-validator';

import { goalCategories } from '../models/SavingsGoal.js';
import { onlyBodyFields } from './commonValidators.js';

export const goalIdValidator = [param('id').isMongoId().withMessage('Goal id is invalid.')];

const currencyAmount = (field, { optional = false, allowZero = false } = {}) => {
  const validator = body(field);
  const chain = optional
    ? validator.optional()
    : validator.notEmpty().withMessage(`${field} is required.`);

  return chain
    .bail()
    .isFloat({ [allowZero ? 'min' : 'gt']: 0, max: 999999999999 })
    .withMessage(`${field} must be ${allowZero ? 'zero or greater' : 'greater than zero'}.`)
    .customSanitizer((value) => Math.round(Number(value) * 100) / 100);
};

const targetDate = (optional = false) => {
  const validator = body('targetDate');
  const chain = optional
    ? validator.optional()
    : validator.notEmpty().withMessage('Target date is required.');

  return chain
    .bail()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Target date must use the YYYY-MM-DD format.')
    .bail()
    .isISO8601({ strict: true })
    .withMessage('Target date is invalid.')
    .toDate();
};

const amountRelationship = () =>
  body().custom((value) => {
    if (
      value.currentAmount !== undefined &&
      value.targetAmount !== undefined &&
      Number(value.currentAmount) > Number(value.targetAmount) &&
      value.allowExceedTarget !== true
    ) {
      throw new Error('Current amount cannot exceed target amount without explicit permission.');
    }

    return true;
  });

const allowExceedValidator = () =>
  body('allowExceedTarget')
    .optional()
    .isBoolean()
    .withMessage('allowExceedTarget must be true or false.')
    .toBoolean();

export const createGoalValidators = [
  onlyBodyFields(
    'name',
    'targetAmount',
    'currentAmount',
    'targetDate',
    'category',
    'allowExceedTarget',
  ),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required.')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters.'),
  currencyAmount('targetAmount'),
  currencyAmount('currentAmount', { optional: true, allowZero: true }),
  targetDate(),
  body('category').isIn(goalCategories).withMessage('Goal category is invalid.'),
  allowExceedValidator(),
  amountRelationship(),
];

export const updateGoalValidators = [
  onlyBodyFields(
    'name',
    'targetAmount',
    'currentAmount',
    'targetDate',
    'category',
    'allowExceedTarget',
  ),
  body().custom((value) => {
    if (
      !['name', 'targetAmount', 'currentAmount', 'targetDate', 'category'].some(
        (field) => value[field] !== undefined,
      )
    ) {
      throw new Error('Provide at least one field to update.');
    }

    return true;
  }),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters.'),
  currencyAmount('targetAmount', { optional: true }),
  currencyAmount('currentAmount', { optional: true, allowZero: true }),
  targetDate(true),
  body('category').optional().isIn(goalCategories).withMessage('Goal category is invalid.'),
  allowExceedValidator(),
  amountRelationship(),
];

export const contributeValidators = [
  ...goalIdValidator,
  onlyBodyFields('amount', 'date', 'allowExceedTarget'),
  currencyAmount('amount'),
  body('date')
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Date must use the YYYY-MM-DD format.')
    .bail()
    .isISO8601({ strict: true })
    .withMessage('Date is invalid.')
    .bail()
    .custom((value) => {
      if (value > new Date().toISOString().slice(0, 10)) {
        throw new Error('Contribution date cannot be in the future.');
      }

      return true;
    })
    .toDate(),
  allowExceedValidator(),
];
