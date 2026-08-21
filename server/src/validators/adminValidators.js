import { body, param, query } from 'express-validator';

import { onlyBodyFields } from './commonValidators.js';

export const adminUserListValidators = [
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search cannot exceed 100 characters.'),
  query('status')
    .optional()
    .isIn(['active', 'inactive', 'deleted', 'all'])
    .withMessage('Status must be active, inactive, deleted, or all.'),
  query('role')
    .optional()
    .isIn(['user', 'admin', 'all'])
    .withMessage('Role must be user, admin, or all.'),
];

export const adminUserIdValidator = [param('id').isMongoId().withMessage('User id is invalid.')];

export const updateAdminUserValidators = [
  ...adminUserIdValidator,
  onlyBodyFields('role', 'isActive'),
  body().custom((value) => {
    if (value.role === undefined && value.isActive === undefined) {
      throw new Error('Provide a role or account status to update.');
    }

    return true;
  }),
  body('role').optional().isIn(['user', 'admin']).withMessage('Role must be user or admin.'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('Account status must be true or false.')
    .toBoolean(),
];
