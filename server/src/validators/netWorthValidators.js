import { query } from 'express-validator';

export const netWorthHistoryValidators = [
  query('range')
    .optional()
    .isIn(['3mo', '6mo', '1yr', 'all'])
    .withMessage('Range must be 3mo, 6mo, 1yr, or all.'),
];
