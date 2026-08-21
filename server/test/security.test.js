import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { validationResult } from 'express-validator';
import { test } from '@jest/globals';

import User from '../src/models/User.js';
import { validateEnvironment } from '../src/config/env.js';
import { serializeError } from '../src/middleware/errorHandler.js';
import { ownedChildFilter, ownedRecordFilter, userScope } from '../src/utils/ownership.js';
import { onlyBodyFields } from '../src/validators/commonValidators.js';

test('ownership helpers cannot be overridden by attacker-supplied conditions', () => {
  assert.deepEqual(userScope('owner-id', { user: 'attacker-id', category: 'food' }), {
    user: 'owner-id',
    category: 'food',
  });
  assert.deepEqual(ownedRecordFilter('owner-id', 'record-id'), {
    user: 'owner-id',
    _id: 'record-id',
  });
  assert.deepEqual(
    ownedChildFilter('owner-id', 'habit', 'habit-id', {
      user: 'attacker-id',
      periodKey: 'daily:2026-08-19',
    }),
    {
      user: 'owner-id',
      habit: 'habit-id',
      periodKey: 'daily:2026-08-19',
    },
  );
});

test('all user-owned ID controllers use centralized ownership filters', async () => {
  const expectedUsage = {
    incomeController: 2,
    expenseController: 2,
    habitController: 2,
    goalController: 4,
    assetController: 3,
  };

  for (const [controller, minimumOccurrences] of Object.entries(expectedUsage)) {
    const source = await readFile(new URL(`../src/controllers/${controller}.js`, import.meta.url), {
      encoding: 'utf8',
    });
    const occurrences = source.match(/ownedRecordFilter\(/g)?.length ?? 0;

    assert.ok(
      occurrences >= minimumOccurrences,
      `${controller} must scope every ID lookup or mutation to the authenticated owner`,
    );
  }
});

test('all user-owned collection controllers apply a user scope to list queries', async () => {
  for (const sourcePath of [
    '../src/controllers/incomeController.js',
    '../src/controllers/expenseController.js',
    '../src/controllers/habitController.js',
    '../src/controllers/goalController.js',
    '../src/controllers/assetController.js',
    '../src/controllers/netWorthController.js',
    '../src/controllers/reportController.js',
    '../src/controllers/dashboardController.js',
    '../src/services/habitSummaryService.js',
    '../src/services/netWorthService.js',
  ]) {
    const source = await readFile(new URL(sourcePath, import.meta.url), {
      encoding: 'utf8',
    });

    assert.match(source, /userScope\(/, `${sourcePath} must scope collection queries by user`);
  }
});

test('unknown body fields are rejected before controllers receive them', async () => {
  const request = { body: { name: 'Safe name', $set: { role: 'admin' } } };
  await onlyBodyFields('name').run(request);
  const result = validationResult(request);

  assert.equal(result.isEmpty(), false);
  assert.match(result.array()[0].msg, /Unsupported request field/);
});

test('User JSON and plain-object serialization always remove credential material', () => {
  const user = new User({
    name: 'Security Test',
    email: 'security@example.com',
    password: 'not-a-real-hash',
    refreshTokenHash: 'not-a-real-token-hash',
  });

  for (const serialized of [user.toJSON(), user.toObject()]) {
    assert.equal('password' in serialized, false);
    assert.equal('refreshTokenHash' in serialized, false);
  }
});

test('client environment template contains no server secrets', async () => {
  const clientEnvironment = await readFile(
    new URL('../../client/.env.example', import.meta.url),
    'utf8',
  );

  assert.doesNotMatch(clientEnvironment, /JWT_|MONGO_URI|BCRYPT|COOKIE_SECURE/);
  assert.match(clientEnvironment, /VITE_API_URL/);
});

test('production error responses hide internal messages and stack traces', () => {
  const error = new Error('MongoDB connection failed with private credentials');
  error.stack = 'private stack trace';
  const result = serializeError(error, { isProduction: true });

  assert.equal(result.statusCode, 500);
  assert.deepEqual(result.payload, {
    status: 'error',
    message: 'Internal server error',
  });
  assert.doesNotMatch(JSON.stringify(result.payload), /private|stack|MongoDB/);
});

test('production configuration fails fast for missing or unsafe settings', () => {
  assert.throws(
    () =>
      validateEnvironment({
        nodeEnv: 'production',
        mongoUri: '',
        jwtSecret: 'short',
        jwtRefreshSecret: 'short',
        clientUrl: 'http://localhost:5173',
        bcryptRounds: 4,
      }),
    /MONGO_URI.*JWT_SECRET.*JWT_REFRESH_SECRET.*CLIENT_URL.*BCRYPT_ROUNDS/,
  );

  assert.doesNotThrow(() =>
    validateEnvironment({
      nodeEnv: 'production',
      mongoUri: 'mongodb+srv://database.example/app',
      jwtSecret: 'a'.repeat(48),
      jwtRefreshSecret: 'b'.repeat(48),
      clientUrl: 'https://financial-habit-builder.vercel.app',
      bcryptRounds: 12,
    }),
  );
});
