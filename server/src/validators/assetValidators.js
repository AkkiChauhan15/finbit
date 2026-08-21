import { body, param } from 'express-validator';

import { assetTypes } from '../models/Asset.js';
import { onlyBodyFields } from './commonValidators.js';

export const assetIdValidator = [param('id').isMongoId().withMessage('Asset id is invalid.')];

const assetName = (optional = false) => {
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

const assetType = (optional = false) => {
  const validator = body('type');
  const chain = optional
    ? validator.optional()
    : validator.notEmpty().withMessage('Type is required.');
  return chain.bail().isIn(assetTypes).withMessage('Asset type is invalid.');
};

const currentValue = (optional = false) => {
  const validator = body('currentValue');
  const chain = optional
    ? validator.optional()
    : validator.notEmpty().withMessage('Current value is required.');

  return chain
    .bail()
    .isFloat({ min: 0, max: 999999999999 })
    .withMessage('Current value must be zero or greater.')
    .customSanitizer((value) => Math.round(Number(value) * 100) / 100);
};

const updatedDate = (optional = false) => {
  const validator = body('dateUpdated');
  const chain = optional
    ? validator.optional()
    : validator.notEmpty().withMessage('Updated date is required.');

  return chain
    .bail()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Updated date must use the YYYY-MM-DD format.')
    .bail()
    .isISO8601({ strict: true })
    .withMessage('Updated date is invalid.')
    .bail()
    .custom((value) => {
      if (value > new Date().toISOString().slice(0, 10)) {
        throw new Error('Updated date cannot be in the future.');
      }

      return true;
    })
    .toDate();
};

export const createAssetValidators = [
  onlyBodyFields('type', 'name', 'currentValue', 'dateUpdated'),
  assetType(),
  assetName(),
  currentValue(),
  updatedDate(),
];

export const updateAssetValidators = [
  onlyBodyFields('type', 'name', 'currentValue', 'dateUpdated'),
  body().custom((value) => {
    if (
      !['type', 'name', 'currentValue', 'dateUpdated'].some((field) => value[field] !== undefined)
    ) {
      throw new Error('Provide at least one field to update.');
    }

    return true;
  }),
  assetType(true),
  assetName(true),
  currentValue(true),
  updatedDate(true),
];
