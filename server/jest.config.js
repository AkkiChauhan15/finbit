export default {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/**/*.test.js'],
  setupFiles: ['<rootDir>/test/setupEnv.cjs'],
  transform: {},
  testTimeout: 60000,
};
