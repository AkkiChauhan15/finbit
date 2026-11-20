import { body } from 'express-validator';

import { onlyBodyFields } from './commonValidators.js';

export const chatValidators = [
  onlyBodyFields('message'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required.')
    .isLength({ max: 500 })
    .withMessage('Message cannot exceed 500 characters.'),
];
