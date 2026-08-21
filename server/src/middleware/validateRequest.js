import { validationResult } from 'express-validator';

import { AppError } from '../utils/AppError.js';

export const validateRequest = (request, _response, next) => {
  const result = validationResult(request);

  if (!result.isEmpty()) {
    return next(
      new AppError(
        'Please correct the highlighted fields.',
        422,
        result
          .array({ onlyFirstError: true })
          .map(({ path, msg }) => ({ field: path, message: msg })),
      ),
    );
  }

  return next();
};
