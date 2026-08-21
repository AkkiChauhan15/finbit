import assert from 'node:assert/strict';

import { MongoMemoryServer } from 'mongodb-memory-server';

const checkStatus = (response, expected, label) => {
  assert.equal(
    response.status,
    expected,
    `${label}: expected ${expected}, received ${response.status} (${response.body?.message ?? 'no message'})`,
  );
  console.log(`PASS ${label}`);
  return response;
};

let mongoServer;

try {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri('wht_qa_smoke');
  process.env.SEED_RESET = 'true';
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'qa-access-secret-used-only-by-the-disposable-smoke-run';
  process.env.JWT_REFRESH_SECRET = 'qa-refresh-secret-used-only-by-the-disposable-smoke-run';
  process.env.BCRYPT_ROUNDS = '4';
  process.env.CLIENT_URL = 'http://localhost:5173';

  await import('./seed.js');

  const mongoose = (await import('mongoose')).default;
  const request = (await import('supertest')).default;
  const { default: app } = await import('../app.js');
  const { default: HabitCompletion } = await import('../models/HabitCompletion.js');

  await mongoose.connect(process.env.MONGO_URI);

  const auth = (token) => ({ Authorization: `Bearer ${token}` });
  const today = new Date().toISOString().slice(0, 10);
  const targetDate = new Date();
  targetDate.setUTCMonth(targetDate.getUTCMonth() + 3);
  const targetDateValue = targetDate.toISOString().slice(0, 10);

  const demoAgent = request.agent(app);
  const demoLogin = checkStatus(
    await demoAgent.post('/api/auth/login').send({
      email: 'demo@wealth.local',
      password: 'DemoUser123!',
    }),
    200,
    'demo login',
  );
  let demoToken = demoLogin.body.accessToken;

  const dashboard = checkStatus(
    await request(app).get('/api/dashboard/summary').set(auth(demoToken)),
    200,
    'seeded dashboard aggregate',
  );
  assert.ok(dashboard.body.netWorth.netWorth > 0);
  assert.ok(dashboard.body.netWorthHistory.length >= 6);

  const goals = checkStatus(
    await request(app).get('/api/goals').set(auth(demoToken)),
    200,
    'seeded goals',
  );
  const fundedGoal = goals.body.goals.find((goal) => goal.name === 'New laptop');
  assert.equal(fundedGoal.progress.percentageComplete, 100);
  assert.equal(fundedGoal.progress.amountRemaining, 0);
  assert.equal(fundedGoal.progress.status, 'completed');
  checkStatus(
    await request(app)
      .post(`/api/goals/${fundedGoal._id}/contribute`)
      .set(auth(demoToken))
      .send({ amount: 1, date: today }),
    422,
    'fully funded goal rejects extra contribution',
  );

  const habits = checkStatus(
    await request(app).get('/api/habits/summary').set(auth(demoToken)),
    200,
    'seeded habit summary',
  );
  const missedHabit = habits.body.habits.find(
    (habit) => habit.name === 'Missed-day streak example',
  );
  assert.equal(missedHabit.currentStreak, 0);
  assert.equal(missedHabit.longestStreak, 2);
  console.log('PASS missed-day streak reset');

  const newUserAgent = request.agent(app);
  const uniqueEmail = `qa-${Date.now()}@example.com`;
  const registration = checkStatus(
    await newUserAgent.post('/api/auth/register').send({
      name: 'QA Journey',
      email: uniqueEmail,
      password: 'JourneyPass123!',
    }),
    201,
    'new-user registration',
  );
  let newUserToken = registration.body.accessToken;
  const newUserId = registration.body.user._id;

  const emptyDashboard = checkStatus(
    await request(app).get('/api/dashboard/summary').set(auth(newUserToken)),
    200,
    'zero-data dashboard',
  );
  assert.deepEqual(emptyDashboard.body.cashFlow, {
    income: 0,
    expenses: 0,
    netSavings: 0,
    savingsRate: 0,
  });
  assert.equal(emptyDashboard.body.netWorth.netWorth, 0);

  const profile = checkStatus(
    await request(app)
      .put('/api/users/profile')
      .set(auth(newUserToken))
      .send({ name: 'QA Journey Updated', currency: 'INR', monthlyIncomeGoal: 8000 }),
    200,
    'profile update',
  );
  assert.equal(profile.body.user.financialProfile.currency, 'INR');

  const createdIncome = checkStatus(
    await request(app)
      .post('/api/income')
      .set(auth(newUserToken))
      .send({ source: 'QA salary', amount: 5000, date: today }),
    201,
    'income creation',
  );
  checkStatus(
    await request(app)
      .put(`/api/income/${createdIncome.body.income._id}`)
      .set(auth(newUserToken))
      .send({ amount: 5100 }),
    200,
    'income edit',
  );
  const createdExpense = checkStatus(
    await request(app)
      .post('/api/expenses')
      .set(auth(newUserToken))
      .send({ category: 'food', amount: 80, date: today, notes: 'QA groceries' }),
    201,
    'expense creation',
  );
  checkStatus(
    await request(app)
      .put(`/api/expenses/${createdExpense.body.expense._id}`)
      .set(auth(newUserToken))
      .send({ amount: 75 }),
    200,
    'expense edit',
  );

  const demoIncome = (await request(app).get('/api/income').set(auth(demoToken))).body.income[0];
  checkStatus(
    await request(app)
      .put(`/api/income/${demoIncome._id}`)
      .set(auth(newUserToken))
      .send({ amount: 1 }),
    404,
    'cross-user income mutation blocked',
  );

  const createdHabit = checkStatus(
    await request(app)
      .post('/api/habits')
      .set(auth(newUserToken))
      .send({ name: 'QA daily habit', type: 'saving', frequency: 'daily' }),
    201,
    'habit creation',
  );
  const habitId = createdHabit.body.habit._id;
  checkStatus(
    await request(app)
      .post(`/api/habits/${habitId}/complete`)
      .set(auth(newUserToken))
      .send({ date: today }),
    201,
    'habit completion',
  );
  const duplicateCompletion = checkStatus(
    await request(app)
      .post(`/api/habits/${habitId}/complete`)
      .set(auth(newUserToken))
      .send({ date: today }),
    200,
    'habit completion is idempotent',
  );
  assert.equal(duplicateCompletion.body.alreadyCompleted, true);
  assert.equal(await HabitCompletion.countDocuments({ habit: habitId }), 1);

  const createdGoal = checkStatus(
    await request(app).post('/api/goals').set(auth(newUserToken)).send({
      name: 'QA funded goal',
      targetAmount: 100,
      targetDate: targetDateValue,
      category: 'other',
    }),
    201,
    'goal creation',
  );
  checkStatus(
    await request(app)
      .post(`/api/goals/${createdGoal.body.goal._id}/contribute`)
      .set(auth(newUserToken))
      .send({ amount: 100, date: today }),
    201,
    'goal fully funded',
  );
  const goalProgress = checkStatus(
    await request(app)
      .get(`/api/goals/${createdGoal.body.goal._id}/progress`)
      .set(auth(newUserToken)),
    200,
    'fully funded goal progress',
  );
  assert.equal(goalProgress.body.status, 'completed');

  const createdAsset = checkStatus(
    await request(app)
      .post('/api/assets')
      .set(auth(newUserToken))
      .send({ type: 'stocks', name: 'QA index fund', currentValue: 1000, dateUpdated: today }),
    201,
    'asset creation',
  );
  checkStatus(
    await request(app)
      .put(`/api/assets/${createdAsset.body.asset._id}`)
      .set(auth(newUserToken))
      .send({ currentValue: 1100 }),
    200,
    'asset edit',
  );
  checkStatus(
    await request(app).post('/api/networth/snapshot').set(auth(newUserToken)),
    200,
    'net-worth snapshot recalculation',
  );

  const submittedFeedback = checkStatus(
    await request(app).post('/api/feedback').set(auth(newUserToken)).send({
      category: 'feedback',
      subject: 'QA journey feedback',
      message: 'The disposable QA smoke journey submitted this feedback record.',
    }),
    201,
    'feedback submission',
  );

  checkStatus(
    await request(app).get('/api/admin/analytics').set(auth(newUserToken)),
    403,
    'non-admin API access blocked',
  );

  const adminAgent = request.agent(app);
  const adminLogin = checkStatus(
    await adminAgent.post('/api/auth/login').send({
      email: 'admin@wealth.local',
      password: 'AdminDemo123!',
    }),
    200,
    'admin login',
  );
  const adminToken = adminLogin.body.accessToken;
  const users = checkStatus(
    await request(app).get('/api/admin/users?search=wealth.local').set(auth(adminToken)),
    200,
    'admin user search',
  );
  assert.ok(users.body.users.length >= 3);
  checkStatus(
    await request(app).get('/api/admin/analytics').set(auth(adminToken)),
    200,
    'admin platform analytics',
  );
  checkStatus(
    await request(app)
      .put(`/api/admin/feedback/${submittedFeedback.body.feedback._id}`)
      .set(auth(adminToken))
      .send({ status: 'resolved', adminNote: 'Verified during QA.' }),
    200,
    'admin feedback resolution',
  );
  checkStatus(
    await request(app)
      .put(`/api/admin/users/${demoLogin.body.user._id}`)
      .set(auth(adminToken))
      .send({ role: 'admin' }),
    200,
    'admin promotion',
  );
  checkStatus(
    await request(app)
      .put(`/api/admin/users/${demoLogin.body.user._id}`)
      .set(auth(adminToken))
      .send({ role: 'user', isActive: false }),
    200,
    'admin demotion and deactivation',
  );
  checkStatus(
    await request(app).get('/api/dashboard/summary').set(auth(demoToken)),
    401,
    'deactivated user session rejected',
  );
  checkStatus(
    await request(app)
      .put(`/api/admin/users/${demoLogin.body.user._id}`)
      .set(auth(adminToken))
      .send({ isActive: true }),
    200,
    'admin user reactivation',
  );
  const relogin = checkStatus(
    await demoAgent.post('/api/auth/login').send({
      email: 'demo@wealth.local',
      password: 'DemoUser123!',
    }),
    200,
    'reactivated user login',
  );
  demoToken = relogin.body.accessToken;
  assert.ok(demoToken);

  checkStatus(
    await request(app)
      .put(`/api/admin/users/${adminLogin.body.user._id}`)
      .set(auth(adminToken))
      .send({ role: 'user' }),
    409,
    'administrator self-change blocked',
  );

  checkStatus(
    await request(app).delete(`/api/assets/${createdAsset.body.asset._id}`).set(auth(newUserToken)),
    204,
    'asset deletion',
  );
  checkStatus(
    await request(app)
      .delete(`/api/expenses/${createdExpense.body.expense._id}`)
      .set(auth(newUserToken)),
    204,
    'expense deletion',
  );
  checkStatus(
    await request(app)
      .delete(`/api/income/${createdIncome.body.income._id}`)
      .set(auth(newUserToken)),
    204,
    'income deletion',
  );

  checkStatus(await newUserAgent.post('/api/auth/logout').send({}), 204, 'logout');
  checkStatus(
    await newUserAgent.post('/api/auth/refresh').send({}),
    401,
    'logged-out refresh rejected',
  );
  checkStatus(
    await request(app).delete(`/api/admin/users/${newUserId}`).set(auth(adminToken)),
    200,
    'admin soft deletion of throwaway user',
  );

  await mongoose.disconnect();
  console.log('Manual QA API journeys completed successfully.');
} catch (error) {
  console.error(`Manual QA smoke failed: ${error.stack ?? error.message}`);
  process.exitCode = 1;
} finally {
  if (mongoServer) await mongoServer.stop();
}
