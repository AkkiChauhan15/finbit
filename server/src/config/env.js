import dotenv from 'dotenv';

dotenv.config();

const parsedPort = Number.parseInt(process.env.PORT ?? '5000', 10);
const parsedBcryptRounds = Number.parseInt(process.env.BCRYPT_ROUNDS ?? '12', 10);

export const env = Object.freeze({
  port: Number.isNaN(parsedPort) ? 5000 : parsedPort,
  mongoUri: process.env.MONGO_URI ?? '',
  jwtSecret: process.env.JWT_SECRET ?? '',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? '',
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  bcryptRounds: Number.isNaN(parsedBcryptRounds) ? 12 : parsedBcryptRounds,
  cookieSecure: process.env.COOKIE_SECURE === 'true',
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV ?? 'development',
});

const isHttpUrl = (value, { requireHttps = false } = {}) => {
  try {
    const url = new URL(value);
    return (
      ['http:', 'https:'].includes(url.protocol) &&
      (!requireHttps || url.protocol === 'https:') &&
      value === url.origin
    );
  } catch {
    return false;
  }
};

export const validateEnvironment = (configuration = env) => {
  if (configuration.nodeEnv !== 'production') return;

  const errors = [];

  if (!/^mongodb(?:\+srv)?:\/\//.test(configuration.mongoUri)) {
    errors.push('MONGO_URI must be a MongoDB connection string');
  }

  if (configuration.jwtSecret.length < 32) {
    errors.push('JWT_SECRET must contain at least 32 characters');
  }

  if (configuration.jwtRefreshSecret.length < 32) {
    errors.push('JWT_REFRESH_SECRET must contain at least 32 characters');
  }

  if (
    configuration.jwtSecret &&
    configuration.jwtRefreshSecret &&
    configuration.jwtSecret === configuration.jwtRefreshSecret
  ) {
    errors.push('JWT_SECRET and JWT_REFRESH_SECRET must be different');
  }

  if (!isHttpUrl(configuration.clientUrl, { requireHttps: true })) {
    errors.push('CLIENT_URL must be a valid HTTPS origin');
  }

  if (configuration.bcryptRounds < 10 || configuration.bcryptRounds > 15) {
    errors.push('BCRYPT_ROUNDS must be between 10 and 15');
  }

  if (errors.length > 0) {
    throw new Error(`Invalid production environment: ${errors.join('; ')}`);
  }
};
