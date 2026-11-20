export default {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/**/*.test.js'],
  setupFiles: ['<rootDir>/test/setupEnv.cjs'],
  transform: {},
  testTimeout: 60000,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.js', '!src/server.js', '!src/scripts/**'],
  coverageReporters: ['text', 'text-summary', 'lcov'],
};
