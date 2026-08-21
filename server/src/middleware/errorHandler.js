import { env } from '../config/env.js';

export const serializeError = (error, { isProduction = env.nodeEnv === 'production' } = {}) => {
  let statusCode = error.statusCode ?? error.status ?? 500;
  let message = error.message ?? 'Internal server error';

  if (error.code === 11000) {
    statusCode = 409;
    message = 'A record with that value already exists';
  }

  if (error.name === 'ValidationError') {
    statusCode = 422;
    message = 'The submitted data is invalid';
  }

  if (!Number.isInteger(statusCode) || statusCode < 400 || statusCode > 599) {
    statusCode = 500;
  }

  if (isProduction && statusCode >= 500) {
    message = 'Internal server error';
  }

  return {
    statusCode,
    payload: {
      status: 'error',
      message,
      ...(statusCode < 500 && error.details && { errors: error.details }),
    },
  };
};

export const errorHandler = (error, request, response, _next) => {
  const { statusCode, payload } = serializeError(error);

  if (statusCode >= 500 && env.nodeEnv !== 'test') {
    console.error('Unhandled request error', {
      method: request.method,
      path: request.originalUrl,
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
  }

  response.status(statusCode).json(payload);
};
