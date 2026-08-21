import { body, param, query } from 'express-validator';

import { habitFrequencies, habitTypes } from '../models/Habit.js';
import { onlyBodyFields } from './commonValidators.js';

export const habitIdValidator = [param('id').isMongoId().withMessage('Habit id is invalid.')];

const nameValidator = (optional = false) => {
  const validator = body('name');
  const chain = optional
    ? validator.optional()
    : validator.notEmpty().withMessage('Name is required.');

  return chain
    .bail()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters.');
};

const typeValidator = (optional = false) => {
  const validator = body('type');
  const chain = optional
    ? validator.optional()
    : validator.notEmpty().withMessage('Type is required.');
  return chain.bail().isIn(habitTypes).withMessage('Habit type is invalid.');
};

const frequencyValidator = (optional = false) => {
  const validator = body('frequency');
  const chain = optional
    ? validator.optional()
    : validator.notEmpty().withMessage('Frequency is required.');
  return chain.bail().isIn(habitFrequencies).withMessage('Habit frequency is invalid.');
};

export const createHabitValidators = [
  onlyBodyFields('name', 'type', 'frequency', 'active'),
  nameValidator(),
  typeValidator(),
  frequencyValidator(),
  body('active').optional().isBoolean().withMessage('Active must be true or false.').toBoolean(),
];

export const updateHabitValidators = [
  onlyBodyFields('name', 'type', 'frequency', 'active'),
  body().custom((value) => {
    if (!['name', 'type', 'frequency', 'active'].some((field) => value[field] !== undefined)) {
      throw new Error('Provide at least one field to update.');
    }

    return true;
  }),
  nameValidator(true),
  typeValidator(true),
  frequencyValidator(true),
  body('active').optional().isBoolean().withMessage('Active must be true or false.').toBoolean(),
];

export const listHabitValidators = [
  query('active').optional().isBoolean().withMessage('Active must be true or false.').toBoolean(),
];

export const completeHabitValidators = [
  onlyBodyFields('date'),
  ...habitIdValidator,
  body('date')
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Date must use the YYYY-MM-DD format.')
    .bail()
    .isISO8601({ strict: true })
    .withMessage('Date is invalid.')
    .bail()
    .custom((value) => {
      const today = new Date().toISOString().slice(0, 10);

      if (value > today) {
        throw new Error('A habit cannot be completed for a future date.');
      }

      return true;
    }),
];
