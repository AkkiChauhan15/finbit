import { afterAll, beforeAll, beforeEach, describe, expect, jest, test } from '@jest/globals';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';

import app from '../src/app.js';
import Expense from '../src/models/Expense.js';
import User from '../src/models/User.js';
import { signAccessToken } from '../src/utils/tokens.js';

let mongoServer;
const originalFetch = global.fetch;

const createUser = async (suffix) => {
  const user = await User.create({
    name: `Test User ${suffix}`,
    email: `${suffix}@example.com`,
    password: 'SecurePass123!',
  });

  return { user, token: signAccessToken(user) };
};

const authorized = (token) => ({ Authorization: `Bearer ${token}` });

const daysFromNow = (days) => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

const dateFromNow = (days) => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
};

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  await Promise.all(Object.values(mongoose.models).map((model) => model.syncIndexes()));
});

beforeEach(async () => {
  await Promise.all(Object.values(mongoose.models).map((model) => model.deleteMany({})));
  global.fetch = jest.fn().mockRejectedValue(new Error('service offline'));
});

afterAll(async () => {
  global.fetch = originalFetch;
  await mongoose.disconnect();
  await mongoServer?.stop();
});

describe('subscriptions', () => {
  test('creates, lists, updates, and deletes a subscription', async () => {
    const { token } = await createUser('subs');
    const payload = {
      name: 'Netflix',
      amount: 15.99,
      category: 'entertainment',
      frequency: 'monthly',
      nextDueDate: daysFromNow(5),
    };

    const created = await request(app)
      .post('/api/subscriptions')
      .set(authorized(token))
      .send(payload);
    expect(created.status).toBe(201);
    expect(created.body.subscription.name).toBe('Netflix');
    expect(created.body.subscription.frequency).toBe('monthly');

    const listed = await request(app).get('/api/subscriptions').set(authorized(token));
    expect(listed.status).toBe(200);
    expect(listed.body.count).toBe(1);

    const updated = await request(app)
      .put(`/api/subscriptions/${created.body.subscription._id}`)
      .set(authorized(token))
      .send({ amount: 19.99 });
    expect(updated.status).toBe(200);
    expect(updated.body.subscription.amount).toBe(19.99);

    const deleted = await request(app)
      .delete(`/api/subscriptions/${created.body.subscription._id}`)
      .set(authorized(token));
    expect(deleted.status).toBe(204);
  });

  test('rejects cross-user access to a subscription', async () => {
    const first = await createUser('owner');
    const second = await createUser('attacker');

    const created = await request(app)
      .post('/api/subscriptions')
      .set(authorized(first.token))
      .send({
        name: 'Spotify',
        amount: 9.99,
        category: 'entertainment',
        frequency: 'monthly',
        nextDueDate: daysFromNow(5),
      });
    const id = created.body.subscription._id;

    expect(
      (await request(app).get(`/api/subscriptions/${id}`).set(authorized(second.token))).status,
    ).toBe(404);
    expect(
      (
        await request(app)
          .put(`/api/subscriptions/${id}`)
          .set(authorized(second.token))
          .send({ amount: 1 })
      ).status,
    ).toBe(404);
    expect(
      (await request(app).delete(`/api/subscriptions/${id}`).set(authorized(second.token))).status,
    ).toBe(404);
  });

  test('upcoming lists overdue and due-soon subscriptions but excludes far-future ones', async () => {
    const { token } = await createUser('upcoming');
    const make = (name, days) =>
      request(app)
        .post('/api/subscriptions')
        .set(authorized(token))
        .send({
          name,
          amount: 10,
          category: 'other',
          frequency: 'monthly',
          nextDueDate: daysFromNow(days),
        });

    await make('Overdue bill', -2);
    await make('Due soon', 3);
    await make('Far future', 60);

    const upcoming = await request(app)
      .get('/api/subscriptions/upcoming?days=7')
      .set(authorized(token));
    expect(upcoming.status).toBe(200);
    expect(upcoming.body.count).toBe(2);
    const names = upcoming.body.subscriptions.map((subscription) => subscription.name);
    expect(names).toContain('Overdue bill');
    expect(names).toContain('Due soon');
    expect(
      upcoming.body.subscriptions.find((subscription) => subscription.name === 'Overdue bill')
        .daysUntil,
    ).toBeLessThan(0);
  });

  test('paid rolls the next due date forward into the future', async () => {
    const { token } = await createUser('paid');

    const created = await request(app)
      .post('/api/subscriptions')
      .set(authorized(token))
      .send({
        name: 'Gym',
        amount: 30,
        category: 'other',
        frequency: 'monthly',
        nextDueDate: daysFromNow(-40),
      });

    const paid = await request(app)
      .post(`/api/subscriptions/${created.body.subscription._id}/paid`)
      .set(authorized(token));
    expect(paid.status).toBe(200);
    expect(paid.body.subscription.daysUntil).toBeGreaterThan(0);
  });

  test('detect suggests a recurring monthly expense and ignores one-off spending', async () => {
    const { user, token } = await createUser('detect');

    await Expense.create([
      {
        user: user.id,
        category: 'entertainment',
        amount: 100,
        date: dateFromNow(-90),
        notes: 'Netflix',
      },
      {
        user: user.id,
        category: 'entertainment',
        amount: 102,
        date: dateFromNow(-60),
        notes: 'Netflix',
      },
      {
        user: user.id,
        category: 'entertainment',
        amount: 99,
        date: dateFromNow(-30),
        notes: 'Netflix',
      },
      { user: user.id, category: 'food', amount: 12, date: dateFromNow(-5), notes: 'Lunch' },
    ]);

    const detected = await request(app).get('/api/subscriptions/detect').set(authorized(token));
    expect(detected.status).toBe(200);
    expect(detected.body.count).toBe(1);
    expect(detected.body.suggestions[0].name).toBe('Netflix');
    expect(detected.body.suggestions[0].frequency).toBe('monthly');
  });

  test('create validation rejects an invalid frequency', async () => {
    const { token } = await createUser('invalid');

    const response = await request(app)
      .post('/api/subscriptions')
      .set(authorized(token))
      .send({
        name: 'Bad frequency',
        amount: 10,
        category: 'other',
        frequency: 'hourly',
        nextDueDate: daysFromNow(5),
      });

    expect(response.status).toBe(422);
  });
});

describe('forecast and anomalies integration', () => {
  test('forecast route returns a forecast when the service is healthy', async () => {
    const { user, token } = await createUser('forecast');
    await Expense.create({ user: user.id, category: 'food', amount: 100, date: dateFromNow(-30) });

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        method: 'linear_regression_blend',
        horizonMonths: 3,
        projectedExpenses: [],
        projectedIncome: [],
        projectedSavings: [],
        cashFlowShortageRisk: { risk: 'low', firstShortageMonth: null, reason: 'none' },
      }),
    });

    const response = await request(app).get('/api/forecast?months=3').set(authorized(token));
    expect(response.status).toBe(200);
    expect(response.body.forecast.cashFlowShortageRisk.risk).toBe('low');
  });

  test('forecast route returns 503 when the service is down', async () => {
    const { token } = await createUser('forecast-down');
    global.fetch = jest.fn().mockRejectedValue(new Error('connection refused'));

    const response = await request(app).get('/api/forecast?months=3').set(authorized(token));
    expect(response.status).toBe(503);
    expect(response.body.message).toBe('Forecast service unavailable');
  });

  test('forecast route rejects an out-of-range horizon', async () => {
    const { token } = await createUser('forecast-range');

    const response = await request(app).get('/api/forecast?months=9').set(authorized(token));
    expect(response.status).toBe(422);
  });

  test('anomalies route forwards the last 90 days of expenses', async () => {
    const { user, token } = await createUser('anomalies');

    for (let index = 0; index < 10; index += 1) {
      await Expense.create({
        user: user.id,
        category: 'food',
        amount: 10,
        date: dateFromNow(-index),
      });
    }

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ anomalies: [{ id: 'x', category: 'food', amount: 100 }] }),
    });

    const response = await request(app).get('/api/insights/anomalies').set(authorized(token));
    expect(response.status).toBe(200);
    expect(response.body.count).toBe(1);
  });
});
