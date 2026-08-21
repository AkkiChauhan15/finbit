import { body } from 'express-validator';

import { onlyBodyFields } from './commonValidators.js';

export const registerValidators = [
  onlyBodyFields('name', 'email', 'password'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required.')
    .isLength({ min: 2, max: 80 })
    .withMessage('Name must be between 2 and 80 characters.'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required.')
    .isEmail()
    .withMessage('Enter a valid email address.')
    .isLength({ max: 254 })
    .withMessage('Email cannot exceed 254 characters.')
    .normalizeEmail(),
  body('password')
    .isString()
    .withMessage('Password is required.')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters.'),
];

export const loginValidators = [
  onlyBodyFields('email', 'password'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required.')
    .isEmail()
    .withMessage('Enter a valid email address.')
    .isLength({ max: 254 })
    .withMessage('Email cannot exceed 254 characters.')
    .normalizeEmail(),
  body('password')
    .isString()
    .notEmpty()
    .withMessage('Password is required.')
    .isLength({ max: 128 })
    .withMessage('Password cannot exceed 128 characters.'),
];
