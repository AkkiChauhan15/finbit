import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { AuthContext } from '../auth/AuthContext.js';
import Subscriptions from '../pages/Subscriptions.jsx';

const apiMocks = vi.hoisted(() => ({
  createSubscription: vi.fn(),
  deleteSubscription: vi.fn(),
  detectSubscriptions: vi.fn(),
  getSubscriptions: vi.fn(),
  markSubscriptionPaid: vi.fn(),
  updateSubscription: vi.fn(),
}));

vi.mock('../api/client.js', () => ({ api: apiMocks }));

const subscription = {
  _id: 'sub-1',
  name: 'Netflix',
  amount: 15.99,
  category: 'entertainment',
  frequency: 'monthly',
  nextDueDate: '2026-11-30T00:00:00.000Z',
  daysUntil: 3,
};

const renderPage = () =>
  render(
    <AuthContext.Provider value={{ user: { financialProfile: { currency: 'USD' } } }}>
      <Subscriptions />
    </AuthContext.Provider>,
  );

describe('Subscriptions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiMocks.getSubscriptions.mockResolvedValue({ subscriptions: [subscription] });
    apiMocks.createSubscription.mockResolvedValue({ subscription });
    apiMocks.detectSubscriptions.mockResolvedValue({ suggestions: [] });
  });

  test('lists a subscription and marks it as paid', async () => {
    apiMocks.markSubscriptionPaid.mockResolvedValue({
      subscription: { ...subscription, daysUntil: 33 },
    });
    const user = userEvent.setup();
    renderPage();

    expect(await screen.findByText('Netflix')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Mark paid' }));

    expect(apiMocks.markSubscriptionPaid).toHaveBeenCalledWith('sub-1');
  });

  test('adds a new subscription from the form', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText('Name'), 'Spotify');
    await user.type(screen.getByLabelText('Amount'), '9.99');
    await user.click(screen.getByRole('button', { name: 'Add subscription' }));

    expect(apiMocks.createSubscription).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Spotify', amount: 9.99 }),
    );
  });
});
