import { body, param, query } from 'express-validator';

import { expenseCategories } from '../models/Expense.js';
import { onlyBodyFields } from './commonValidators.js';

const dateMessage = 'Date must use the YYYY-MM-DD format.';

const requiredDate = (field) =>
  body(field)
    .notEmpty()
    .withMessage('Date is required.')
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

export const transactionIdValidator = [
  param('id').isMongoId().withMessage('Transaction id is invalid.'),
];

export const createIncomeValidators = [
  onlyBodyFields('source', 'amount', 'date'),
  body('source')
    .trim()
    .notEmpty()
    .withMessage('Income source is required.')
    .isLength({ min: 2, max: 80 })
    .withMessage('Income source must be between 2 and 80 characters.'),
  positiveAmount(),
  requiredDate('date'),
];

export const updateIncomeValidators = [
  onlyBodyFields('source', 'amount', 'date'),
  atLeastOneField(['source', 'amount', 'date']),
  body('source')
    .optional()
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage('Income source must be between 2 and 80 characters.'),
  positiveAmount(true),
  optionalDate('date'),
];

export const createExpenseValidators = [
  onlyBodyFields('category', 'amount', 'date', 'notes'),
  body('category')
    .notEmpty()
    .withMessage('Category is required.')
    .isIn(expenseCategories)
    .withMessage('Category is invalid.'),
  positiveAmount(),
  requiredDate('date'),
  body('notes')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters.'),
];

export const updateExpenseValidators = [
  onlyBodyFields('category', 'amount', 'date', 'notes'),
  atLeastOneField(['category', 'amount', 'date', 'notes']),
  body('category').optional().isIn(expenseCategories).withMessage('Category is invalid.'),
  positiveAmount(true),
  optionalDate('date'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters.'),
];

const queryDate = (field, required = false) => {
  let validator = query(field);

  validator = required
    ? validator.notEmpty().withMessage(`${field} is required.`)
    : validator.optional();

  return validator
    .bail()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage(`${field} must use the YYYY-MM-DD format.`)
    .bail()
    .isISO8601({ strict: true })
    .withMessage(`${field} is invalid.`);
};

const validDateOrder = () =>
  query('endDate').custom((endDate, { req }) => {
    if (req.query.startDate && endDate && req.query.startDate > endDate) {
      throw new Error('endDate must be on or after startDate.');
    }

    return true;
  });

export const listIncomeValidators = [
  queryDate('startDate'),
  queryDate('endDate'),
  validDateOrder(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 200 })
    .withMessage('Limit must be from 1 to 200.')
    .toInt(),
];

export const listExpenseValidators = [
  queryDate('startDate'),
  queryDate('endDate'),
  validDateOrder(),
  query('category').optional().isIn(expenseCategories).withMessage('Category is invalid.'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 200 })
    .withMessage('Limit must be from 1 to 200.')
    .toInt(),
];

export const expenseSummaryValidators = [
  queryDate('startDate', true),
  queryDate('endDate', true),
  validDateOrder(),
];

export const monthlyReportValidators = [
  query('months')
    .optional()
    .isInt({ min: 1, max: 24 })
    .withMessage('Months must be from 1 to 24.')
    .toInt(),
];
