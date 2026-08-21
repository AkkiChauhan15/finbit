process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-access-secret-that-is-not-used-outside-the-test-suite';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-that-is-not-used-outside-the-test-suite';
process.env.JWT_ACCESS_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.BCRYPT_ROUNDS = '4';
process.env.CLIENT_URL = 'http://localhost:5173';
process.env.COOKIE_SECURE = 'false';
