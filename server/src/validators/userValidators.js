import { body } from 'express-validator';

import { onlyBodyFields } from './commonValidators.js';

export const updateProfileValidators = [
  onlyBodyFields('name', 'currency', 'monthlyIncomeGoal'),
  body().custom((value) => {
    if (!['name', 'currency', 'monthlyIncomeGoal'].some((field) => value[field] !== undefined)) {
      throw new Error('Provide at least one profile field to update.');
    }

    return true;
  }),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage('Name must be between 2 and 80 characters.'),
  body('currency')
    .optional()
    .trim()
    .matches(/^[A-Za-z]{3}$/)
    .withMessage('Currency must be a three-letter ISO code.')
    .customSanitizer((value) => value.toUpperCase()),
  body('monthlyIncomeGoal')
    .optional()
    .isFloat({ min: 0, max: 999999999999 })
    .withMessage('Monthly income goal must be zero or greater.')
    .toFloat(),
];
