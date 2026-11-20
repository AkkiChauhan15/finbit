import { query } from 'express-validator';

export const forecastValidators = [
  query('months')
    .optional()
    .isInt({ min: 1, max: 6 })
    .withMessage('Months must be from 1 to 6.')
    .toInt(),
];
