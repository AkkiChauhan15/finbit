import { afterAll, beforeAll, beforeEach, describe, expect, jest, test } from '@jest/globals';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';

const callLlmMock = jest.fn();
const isLlmConfiguredMock = jest.fn(() => false);

jest.unstable_mockModule('../src/services/llmClient.js', () => ({
  callLlm: callLlmMock,
  isLlmConfigured: isLlmConfiguredMock,
}));

const { default: app } = await import('../src/app.js');
const { default: User } = await import('../src/models/User.js');
const { default: Expense } = await import('../src/models/Expense.js');
const { signAccessToken } = await import('../src/utils/tokens.js');
const { buildAssistantSummary } = await import('../src/services/assistantSummary.js');

let mongoServer;
const originalFetch = global.fetch;

const createUser = async (suffix, { name, email } = {}) => {
  const user = await User.create({
    name: name ?? `Test User ${suffix}`,
    email: email ?? `${suffix}@example.com`,
    password: 'SecurePass123!',
  });

  return { user, token: signAccessToken(user) };
};

const authorized = (token) => ({ Authorization: `Bearer ${token}` });

const now = () => new Date().toISOString();

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  await Promise.all(Object.values(mongoose.models).map((model) => model.syncIndexes()));
});

beforeEach(async () => {
  await Promise.all(Object.values(mongoose.models).map((model) => model.deleteMany({})));
  global.fetch = jest.fn().mockRejectedValue(new Error('offline'));
  isLlmConfiguredMock.mockReset();
  callLlmMock.mockReset();
  isLlmConfiguredMock.mockReturnValue(false);
});

afterAll(async () => {
  global.fetch = originalFetch;
  await mongoose.disconnect();
  await mongoServer?.stop();
});

describe('AI assistant', () => {
  test('returns rule-based insights when the LLM is not configured', async () => {
    const { user, token } = await createUser('rules');
    await Expense.create({ user: user.id, category: 'food', amount: 100, date: now() });

    const response = await request(app)
      .post('/api/assistant/chat')
      .set(authorized(token))
      .send({ message: 'How am I doing?' });

    expect(response.status).toBe(200);
    expect(response.body.source).toBe('rules');
    expect(typeof response.body.reply).toBe('string');
  });

  test('returns an LLM reply when the LLM is configured', async () => {
    const { user, token } = await createUser('llm');
    await Expense.create({ user: user.id, category: 'food', amount: 100, date: now() });

    isLlmConfiguredMock.mockReturnValue(true);
    callLlmMock.mockResolvedValue('You are doing great');

    const response = await request(app)
      .post('/api/assistant/chat')
      .set(authorized(token))
      .send({ message: 'How am I doing?' });

    expect(response.status).toBe(200);
    expect(response.body.source).toBe('llm');
    expect(response.body.reply).toBe('You are doing great');
  });

  test('falls back to rules when the LLM call fails', async () => {
    const { user, token } = await createUser('llm-fail');
    await Expense.create({ user: user.id, category: 'food', amount: 100, date: now() });

    isLlmConfiguredMock.mockReturnValue(true);
    callLlmMock.mockRejectedValue(new Error('timeout'));

    const response = await request(app)
      .post('/api/assistant/chat')
      .set(authorized(token))
      .send({ message: 'How am I doing?' });

    expect(response.status).toBe(200);
    expect(response.body.source).toBe('rules');
  });

  test('never sends the user name or email to the LLM', async () => {
    const { user, token } = await createUser('anon', {
      name: 'Secret Person',
      email: 'secret.person@example.com',
    });
    await Expense.create({ user: user.id, category: 'food', amount: 100, date: now() });

    isLlmConfiguredMock.mockReturnValue(true);
    callLlmMock.mockResolvedValue('ok');

    await request(app)
      .post('/api/assistant/chat')
      .set(authorized(token))
      .send({ message: 'How am I doing?' });

    const [, userMessage] = callLlmMock.mock.calls[0];
    expect(userMessage).not.toContain('secret.person@example.com');
    expect(userMessage).not.toContain('Secret Person');
  });

  test('rejects an empty or blank message', async () => {
    const { token } = await createUser('empty');

    const response = await request(app)
      .post('/api/assistant/chat')
      .set(authorized(token))
      .send({ message: '   ' });

    expect(response.status).toBe(422);
  });

  test('buildAssistantSummary never exposes the name or email', async () => {
    const { user } = await createUser('summary', {
      name: 'Secret Person',
      email: 'secret.person@example.com',
    });
    await Expense.create({
      user: user.id,
      category: 'food',
      amount: 100,
      notes: 'groceries',
      date: now(),
    });

    const summary = await buildAssistantSummary(user.id);
    const serialized = JSON.stringify(summary);

    expect(serialized).not.toContain('secret.person@example.com');
    expect(serialized).not.toContain('Secret Person');
  });
});
