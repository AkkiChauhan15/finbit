import { afterAll, beforeAll, beforeEach, describe, expect, test } from '@jest/globals';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';

import app from '../src/app.js';
import Asset from '../src/models/Asset.js';
import Expense from '../src/models/Expense.js';
import Habit from '../src/models/Habit.js';
import HabitCompletion from '../src/models/HabitCompletion.js';
import Income from '../src/models/Income.js';
import SavingsGoal from '../src/models/SavingsGoal.js';
import User from '../src/models/User.js';
import { signAccessToken } from '../src/utils/tokens.js';

let mongoServer;

const today = () => new Date().toISOString().slice(0, 10);
const futureDate = () => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 90);
  return date.toISOString().slice(0, 10);
};

const createUser = async (suffix) => {
  const user = await User.create({
    name: `Test User ${suffix}`,
    email: `${suffix}@example.com`,
    password: 'SecurePass123!',
  });

  return { user, token: signAccessToken(user) };
};

const authorized = (token) => ({ Authorization: `Bearer ${token}` });

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  await Promise.all(Object.values(mongoose.models).map((model) => model.syncIndexes()));
});

beforeEach(async () => {
  await Promise.all(Object.values(mongoose.models).map((model) => model.deleteMany({})));
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer?.stop();
});

describe('authentication', () => {
  test('registers, identifies, refreshes, logs out, and never exposes credentials', async () => {
    const agent = request.agent(app);
    const registration = await agent.post('/api/auth/register').send({
      name: 'New Investor',
      email: 'investor@example.com',
      password: 'SecurePass123!',
    });

    expect(registration.status).toBe(201);
    expect(registration.body.accessToken).toEqual(expect.any(String));
    expect(registration.body.user).not.toHaveProperty('password');
    expect(registration.body.user).not.toHaveProperty('refreshTokenHash');
    expect(registration.headers['set-cookie'][0]).toMatch(/refreshToken=.*HttpOnly/);

    const me = await request(app)
      .get('/api/auth/me')
      .set(authorized(registration.body.accessToken));
    expect(me.status).toBe(200);
    expect(me.body.user.email).toBe('investor@example.com');

    const refreshed = await agent.post('/api/auth/refresh').send({});
    expect(refreshed.status).toBe(200);
    expect(refreshed.body.accessToken).toEqual(expect.any(String));

    expect((await agent.post('/api/auth/logout').send({})).status).toBe(204);
    expect((await agent.post('/api/auth/refresh').send({})).status).toBe(401);

    const login = await agent.post('/api/auth/login').send({
      email: 'investor@example.com',
      password: 'SecurePass123!',
    });
    expect(login.status).toBe(200);
    expect(login.body.accessToken).toEqual(expect.any(String));
  });

  test('rejects invalid registration input and incorrect login credentials', async () => {
    const invalid = await request(app).post('/api/auth/register').send({
      name: 'A',
      email: 'not-an-email',
      password: 'short',
    });
    expect(invalid.status).toBe(422);
    expect(invalid.body.errors.length).toBeGreaterThan(0);

    await User.create({
      name: 'Existing User',
      email: 'existing@example.com',
      password: 'SecurePass123!',
    });
    const login = await request(app).post('/api/auth/login').send({
      email: 'existing@example.com',
      password: 'DefinitelyWrong123!',
    });
    expect(login.status).toBe(401);
  });
});

describe('production-facing HTTP boundaries', () => {
  test('CORS accepts only the configured browser origin', async () => {
    const accepted = await request(app)
      .options('/api/health')
      .set('Origin', 'http://localhost:5173')
      .set('Access-Control-Request-Method', 'GET');
    expect(accepted.status).toBe(204);
    expect(accepted.headers['access-control-allow-origin']).toBe('http://localhost:5173');

    const rejected = await request(app)
      .options('/api/health')
      .set('Origin', 'https://untrusted.example')
      .set('Access-Control-Request-Method', 'GET');
    expect(rejected.status).toBe(403);
    expect(rejected.headers['access-control-allow-origin']).toBeUndefined();
  });
});

describe('income CRUD and ownership', () => {
  test('creates, lists, updates, deletes, and rejects invalid or foreign records', async () => {
    const owner = await createUser('income-owner');
    const attacker = await createUser('income-attacker');

    const invalid = await request(app)
      .post('/api/income')
      .set(authorized(owner.token))
      .send({ source: 'Salary', amount: -1, date: today() });
    expect(invalid.status).toBe(422);

    const created = await request(app)
      .post('/api/income')
      .set(authorized(owner.token))
      .send({ source: 'Salary', amount: 4200.5, date: today() });
    expect(created.status).toBe(201);
    const incomeId = created.body.income._id;

    const list = await request(app).get('/api/income').set(authorized(owner.token));
    expect(list.status).toBe(200);
    expect(list.body.income.map((item) => item._id)).toContain(incomeId);

    const foreignUpdate = await request(app)
      .put(`/api/income/${incomeId}`)
      .set(authorized(attacker.token))
      .send({ amount: 9999 });
    expect(foreignUpdate.status).toBe(404);
    expect((await Income.findById(incomeId)).amount).toBe(4200.5);

    const updated = await request(app)
      .put(`/api/income/${incomeId}`)
      .set(authorized(owner.token))
      .send({ amount: 4300 });
    expect(updated.status).toBe(200);
    expect(updated.body.income.amount).toBe(4300);

    expect(
      (await request(app).delete(`/api/income/${incomeId}`).set(authorized(owner.token))).status,
    ).toBe(204);
    expect(await Income.findById(incomeId)).toBeNull();
  });
});

describe('expense CRUD and ownership', () => {
  test('creates, lists, updates, deletes, and rejects invalid or foreign records', async () => {
    const owner = await createUser('expense-owner');
    const attacker = await createUser('expense-attacker');

    const invalid = await request(app)
      .post('/api/expenses')
      .set(authorized(owner.token))
      .send({ category: 'luxury', amount: 10, date: today(), notes: '' });
    expect(invalid.status).toBe(422);

    const created = await request(app)
      .post('/api/expenses')
      .set(authorized(owner.token))
      .send({ category: 'food', amount: 45.25, date: today(), notes: 'Groceries' });
    expect(created.status).toBe(201);
    const expenseId = created.body.expense._id;

    const list = await request(app).get('/api/expenses').set(authorized(owner.token));
    expect(list.status).toBe(200);
    expect(list.body.expenses).toHaveLength(1);

    const foreignDelete = await request(app)
      .delete(`/api/expenses/${expenseId}`)
      .set(authorized(attacker.token));
    expect(foreignDelete.status).toBe(404);
    expect(await Expense.findById(expenseId)).not.toBeNull();

    const updated = await request(app)
      .put(`/api/expenses/${expenseId}`)
      .set(authorized(owner.token))
      .send({ amount: 50, notes: 'Weekly groceries' });
    expect(updated.status).toBe(200);
    expect(updated.body.expense.amount).toBe(50);

    expect(
      (await request(app).delete(`/api/expenses/${expenseId}`).set(authorized(owner.token))).status,
    ).toBe(204);
  });
});

describe('habit CRUD, completion, and ownership', () => {
  test('manages a habit idempotently and rejects invalid or foreign access', async () => {
    const owner = await createUser('habit-owner');
    const attacker = await createUser('habit-attacker');

    const invalid = await request(app)
      .post('/api/habits')
      .set(authorized(owner.token))
      .send({ name: 'Save', type: 'magic', frequency: 'hourly' });
    expect(invalid.status).toBe(422);

    const created = await request(app)
      .post('/api/habits')
      .set(authorized(owner.token))
      .send({ name: 'No-spend check', type: 'spending', frequency: 'daily' });
    expect(created.status).toBe(201);
    const habitId = created.body.habit._id;

    expect(
      (await request(app).get(`/api/habits/${habitId}`).set(authorized(attacker.token))).status,
    ).toBe(404);
    expect(
      (
        await request(app)
          .post(`/api/habits/${habitId}/complete`)
          .set(authorized(attacker.token))
          .send({ date: today() })
      ).status,
    ).toBe(404);

    const firstCompletion = await request(app)
      .post(`/api/habits/${habitId}/complete`)
      .set(authorized(owner.token))
      .send({ date: today() });
    expect(firstCompletion.status).toBe(201);
    const repeatedCompletion = await request(app)
      .post(`/api/habits/${habitId}/complete`)
      .set(authorized(owner.token))
      .send({ date: today() });
    expect(repeatedCompletion.status).toBe(200);
    expect(repeatedCompletion.body.alreadyCompleted).toBe(true);
    expect(await HabitCompletion.countDocuments({ habit: habitId })).toBe(1);

    const list = await request(app).get('/api/habits').set(authorized(owner.token));
    expect(list.body.habits).toHaveLength(1);
    const updated = await request(app)
      .put(`/api/habits/${habitId}`)
      .set(authorized(owner.token))
      .send({ active: false });
    expect(updated.status).toBe(200);
    expect(updated.body.habit.active).toBe(false);

    expect(
      (await request(app).delete(`/api/habits/${habitId}`).set(authorized(owner.token))).status,
    ).toBe(204);
    expect(await Habit.findById(habitId)).toBeNull();
    expect(await HabitCompletion.countDocuments({ habit: habitId })).toBe(0);
  });
});

describe('savings goal CRUD, contribution, and ownership', () => {
  test('manages a goal and rejects invalid, over-target, or foreign operations', async () => {
    const owner = await createUser('goal-owner');
    const attacker = await createUser('goal-attacker');

    const invalid = await request(app).post('/api/goals').set(authorized(owner.token)).send({
      name: 'Vacation',
      targetAmount: -1,
      targetDate: futureDate(),
      category: 'vacation',
    });
    expect(invalid.status).toBe(422);

    const created = await request(app).post('/api/goals').set(authorized(owner.token)).send({
      name: 'Emergency fund',
      targetAmount: 1000,
      currentAmount: 100,
      targetDate: futureDate(),
      category: 'emergency_fund',
    });
    expect(created.status).toBe(201);
    const goalId = created.body.goal._id;

    expect(
      (await request(app).get(`/api/goals/${goalId}`).set(authorized(attacker.token))).status,
    ).toBe(404);
    const overTarget = await request(app)
      .post(`/api/goals/${goalId}/contribute`)
      .set(authorized(owner.token))
      .send({ amount: 1000, date: today() });
    expect(overTarget.status).toBe(422);

    const contribution = await request(app)
      .post(`/api/goals/${goalId}/contribute`)
      .set(authorized(owner.token))
      .send({ amount: 200, date: today() });
    expect(contribution.status).toBe(201);
    expect(contribution.body.goal.currentAmount).toBe(300);

    const list = await request(app).get('/api/goals').set(authorized(owner.token));
    expect(list.body.goals).toHaveLength(1);
    const updated = await request(app)
      .put(`/api/goals/${goalId}`)
      .set(authorized(owner.token))
      .send({ name: 'Six-month emergency fund' });
    expect(updated.status).toBe(200);

    expect(
      (await request(app).delete(`/api/goals/${goalId}`).set(authorized(owner.token))).status,
    ).toBe(204);
    expect(await SavingsGoal.findById(goalId)).toBeNull();
  });
});

describe('asset CRUD and ownership', () => {
  test('creates, reads, updates, deletes, and rejects invalid or foreign records', async () => {
    const owner = await createUser('asset-owner');
    const attacker = await createUser('asset-attacker');

    const invalid = await request(app)
      .post('/api/assets')
      .set(authorized(owner.token))
      .send({ type: 'collectible', name: 'Watch', currentValue: -5, dateUpdated: today() });
    expect(invalid.status).toBe(422);

    const created = await request(app)
      .post('/api/assets')
      .set(authorized(owner.token))
      .send({ type: 'stocks', name: 'Index fund', currentValue: 5000, dateUpdated: today() });
    expect(created.status).toBe(201);
    const assetId = created.body.asset._id;

    expect(
      (await request(app).get(`/api/assets/${assetId}`).set(authorized(attacker.token))).status,
    ).toBe(404);
    const list = await request(app).get('/api/assets').set(authorized(owner.token));
    expect(list.status).toBe(200);
    expect(list.body.assets).toHaveLength(1);

    const updated = await request(app)
      .put(`/api/assets/${assetId}`)
      .set(authorized(owner.token))
      .send({ currentValue: 5250 });
    expect(updated.status).toBe(200);
    expect(updated.body.asset.currentValue).toBe(5250);

    expect(
      (await request(app).delete(`/api/assets/${assetId}`).set(authorized(owner.token))).status,
    ).toBe(204);
    expect(await Asset.findById(assetId)).toBeNull();
  });
});
